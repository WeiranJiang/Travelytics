import OpenAI from "openai";
import { franc } from "franc-min";
import { prisma } from "../prisma";

// Lazy singleton — only constructed when a translation call is actually made.
// This means importing this module (e.g. for detectLanguageLocally) does NOT
// require OPENAI_API_KEY to be present.
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is not set. Add it to your .env file:\n  OPENAI_API_KEY=sk-proj-..."
      );
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export interface TranslationResult {
  reviewId: string;
  detectedLanguage: string;
  translationStatus: "pending" | "skipped_english" | "translated" | "failed";
  translatedTitle: string | null;
  translatedText: string | null;
  translationModel: string | null;
}

export interface ReviewTranslationInput {
  id: string;
  reviewTitle: string | null;
  reviewText: string | null;
}

/**
 * Heuristic to test if we should process this via OpenAI.
 * franc returns 'eng' for english, or 'und' for undetermined.
 */
export function detectLanguageLocally(text: string): { lang: string; isLikelyEnglish: boolean } {
  if (!text || text.trim().length === 0) return { lang: "und", isLikelyEnglish: true }; // empty skips OS 
  
  // A quick pass using franc. Takes at least a few words to be accurate.
  const lang = franc(text, { minLength: 3 });
  
  // If it's explicitly 'eng', it's English. 
  // If it's 'und', franc is unsure (often true for short reviews like "Great hotel"), we default to safe translation check or skipping.
  // Actually, wait, short English reviews ("Good", "Nice stay") might be marked 'und'.
  // If it's 'und', we probably shouldn't blindly send it to OpenAI unless it contains obvious non-English characters.
  // Let's use franc. If 'eng', done. If NOT 'eng' AND NOT 'und', clearly foreign.
  // If 'und', we could try to send to openAI, or do a simple regex for Latin chars.
  const isLikelyEnglish = lang === "eng" || lang === "und";
  return { lang, isLikelyEnglish };
}

/**
 * Pure API call for translation using OpenAI.
 */
export async function translateReviewsBatch(reviews: ReviewTranslationInput[]): Promise<TranslationResult[]> {
  const results: TranslationResult[] = [];
  const toTranslate: ReviewTranslationInput[] = [];

  // Pass 1: Local detection
  for (const r of reviews) {
    const combined = `${r.reviewTitle ?? ""} ${r.reviewText ?? ""}`.trim();
    if (!combined) {
      results.push({
        reviewId: r.id,
        detectedLanguage: "empty",
        translationStatus: "skipped_english",
        translatedTitle: null,
        translatedText: null,
        translationModel: null,
      });
      continue;
    }

    const { lang, isLikelyEnglish } = detectLanguageLocally(combined);
    
    if (isLikelyEnglish) {
      results.push({
        reviewId: r.id,
        detectedLanguage: lang,
        translationStatus: "skipped_english",
        translatedTitle: null,
        translatedText: null,
        translationModel: null,
      });
    } else {
      toTranslate.push(r);
    }
  }

  if (toTranslate.length === 0) return results;

  // Pass 2: OpenAI API
  try {
    const model = "gpt-4o-mini"; // cost effective for mapping text
    const promptInstructions = `
You are an expert translation engine for hotel reviews.
Translate the provided reviews into English. Keep the tone natural, preserve the original meaning, and do not summarize.
Keep domain-specific hotel wording specific.
Return ONLY valid JSON matching this schema:
{
  "translations": [
    {
      "id": "original id",
      "detectedLanguage": "ISO 639-1 code (e.g., 'es', 'de', 'it', 'ja', 'nl', 'zh')",
      "translatedTitle": "English translation or null if no original title",
      "translatedText": "English translation or null if no original text"
    }
  ]
}
    `.trim();

    const response = await getOpenAI().chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: promptInstructions },
        { role: "user", content: JSON.stringify(toTranslate.map(r => ({ id: r.id, title: r.reviewTitle, text: r.reviewText }))) }
      ],
      temperature: 0,
    });

    const outStr = response.choices[0]?.message?.content;
    if (!outStr) throw new Error("Empty response from OpenAI");

    const parsed = JSON.parse(outStr) as { translations: any[] };

    for (const translatedDef of parsed.translations) {
      results.push({
        reviewId: translatedDef.id,
        detectedLanguage: translatedDef.detectedLanguage,
        translationStatus: "translated",
        translatedTitle: translatedDef.translatedTitle ?? null,
        translatedText: translatedDef.translatedText ?? null,
        translationModel: model,
      });
    }

    // Identify if any toTranslate were dropped from results
    const returnedIds = new Set(parsed.translations.map(t => t.id));
    for (const t of toTranslate) {
      if (!returnedIds.has(t.id)) {
        results.push({
          reviewId: t.id,
          detectedLanguage: "unknown",
          translationStatus: "failed",
          translatedTitle: null,
          translatedText: null,
          translationModel: null,
        });
      }
    }
  } catch (error) {
    console.error("Batch translation failed:", error);
    // Mark them as failed
    for (const t of toTranslate) {
      results.push({
        reviewId: t.id,
        detectedLanguage: "unknown",
        translationStatus: "failed",
        translatedTitle: null,
        translatedText: null,
        translationModel: null,
      });
    }
  }

  return results;
}

/**
 * Save translation states to db.
 */
export async function syncTranslationsToDB(results: TranslationResult[]) {
  // Use updateMany so that if OpenAI hallucinates an ID, Prisma doesn't crash the entire batch
  for (const r of results) {
    if (!r.reviewId) continue;
    await prisma.importedReview.updateMany({
      where: { id: r.reviewId },
      data: {
        detectedLanguage: r.detectedLanguage,
        translationStatus: r.translationStatus,
        translatedReviewTitle: r.translatedTitle,
        translatedReviewText: r.translatedText,
        translationModel: r.translationModel,
        translationUpdatedAt: new Date(),
      }
    });
  }
}
