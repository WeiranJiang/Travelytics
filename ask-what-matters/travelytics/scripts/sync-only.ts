import { syncAdminScores } from "../src/lib/intelligence/sync";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Starting pure database sync...");
  console.log("Running LLM validations and building final scoring matrices.");
  
  const start = Date.now();
  await syncAdminScores();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  
  console.log(`Sync complete in ${elapsed}s!`);
}

main()
  .catch((err) => {
    console.error("Error during sync:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
