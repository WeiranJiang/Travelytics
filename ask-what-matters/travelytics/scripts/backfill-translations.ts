// Load .env from the project root before any other imports read process.env
import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([^#=\s]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (match) process.env[match[1]] = match[2];
  }
}

import { prisma } from "../src/lib/prisma";
import { translateReviewsBatch, syncTranslationsToDB } from "../src/lib/intelligence/translation";

// Simple argument parser
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const limitArg = args.find(a => a.startsWith("--limit="));
const offsetArg = args.find(a => a.startsWith("--offset="));
const languageArg = args.find(a => a.startsWith("--only-language=")); // Not strictly supported natively since we scan `translationStatus === 'pending'`

const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 1000;
const offset = offsetArg ? parseInt(offsetArg.split("=")[1], 10) : 0;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Starting backfill... Dry Run: ${isDryRun}, Limit: ${limit}, Offset: ${offset}`);
  
  // Find reviews that either aren't translated or failed previously
  const rows = await prisma.importedReview.findMany({
    where: {
      translationStatus: { in: ["pending", "failed"] }
    },
    select: {
      id: true,
      reviewTitle: true,
      reviewText: true,
    },
    take: limit,
    skip: offset,
    orderBy: { acquisitionDate: "desc" },
  });

  console.log(`Found ${rows.length} reviews pending translation/evaluation.`);

  const BATCH_SIZE = 20; // safe OpenAI token/batch size limit
  let processed = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${i / BATCH_SIZE + 1} (${batch.length} items)...`);
    
    // Attempt with basic exponential backoff
    let attempts = 0;
    while (attempts < 3) {
      try {
        const results = await translateReviewsBatch(batch);
        
        if (isDryRun) {
          console.log(`[DRY RUN] Would update ${results.length} rows.`);
          const translated = results.filter(r => r.translationStatus === "translated");
          if (translated.length > 0) {
            console.log(`[DRY RUN] Translated examples:`);
            console.log(translated.slice(0, 2));
          }
        } else {
          await syncTranslationsToDB(results);
          console.log(`Committed ${results.length} results to DB.`);
        }
        
        break; // success
      } catch (e) {
        attempts++;
        console.error(`Error processing batch, attempt ${attempts}:`, e);
        if (attempts >= 3) {
          console.error(`Batch failed permanently. Onto next batch.`);
        } else {
          await sleep(2000 * Math.pow(2, attempts)); // backoff
        }
      }
    }

    processed += batch.length;
    // Tiny delay between batches to stay under RPM limits
    await sleep(500); 
  }

  console.log(`Backfill complete. Processed ${processed} items.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
