import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set.");
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export type RawSchemaGapCandidate = {
  rawLabel: string;
  count: number;
  rate: number;
  snippets: string[];
};

export type ValidatedSchemaGap = {
  canonicalLabel: string;
  rawLabels: string[];
  keep: boolean;
  confidence: number;
  reason: string;
  sampleEvidence: string[];
};

const JUNK_WORDS = new Set([
  "would", "could", "should", "really", "also", "there", "their",
  "about", "because", "been", "being", "into", "than", "them",
  "then", "when", "where"
]);

// Simple in-memory cache to prevent redundant LLM calls during sync passes
const validationCache = new Map<string, ValidatedSchemaGap[]>();

export async function validateSchemaGaps(
  propertyId: string,
  candidates: RawSchemaGapCandidate[]
): Promise<ValidatedSchemaGap[]> {
  if (candidates.length === 0) return [];

  // Local pre-filter to drop obvious junk early
  const filteredCandidates = candidates.filter(
    (c) => !JUNK_WORDS.has(c.rawLabel.toLowerCase())
  );

  if (filteredCandidates.length === 0) return [];

  const trimmedCandidates = filteredCandidates
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)
    .map((c) => ({
      rawLabel: c.rawLabel,
      count: c.count,
      rate: Number(c.rate.toFixed(4)),
      snippets: c.snippets.slice(0, 4),
    }));

  const systemPrompt = `You are validating candidate hotel review topics extracted from guest free-text reviews.

Your task:
Given a list of candidate recurring terms from hotel reviews, decide which ones represent real, meaningful guest-experience topics and which ones are just noise, filler words, or low-information language.

Rules:
1. Keep only candidates that represent a meaningful hotel-related topic, issue, amenity, or experience area.
2. Discard candidates that are filler words, modal verbs, generic language, grammar artifacts, or vague words with no standalone meaning.
3. Merge candidates that refer to the same underlying issue into one canonical topic label.
4. Canonical topic labels should be short, human-readable, and suitable for downstream scoring and survey question generation.
5. Use the snippets as evidence for meaning. Do not rely on the raw token alone.
6. Prefer labels like:
   - room odor
   - construction noise
   - check-in wait time
   - elevator reliability
   - air conditioning
7. Do not keep labels like:
   - would
   - really
   - also
   - there
   - good
   - nice
8. Only keep topics that are specific enough to be actionable.

Important:
- confidence must be between 0 and 1
- if a candidate should be discarded, set keep=false
- discarded items should still appear in the output
- merge synonymous candidates into one kept topic when appropriate
- do not invent evidence not present in the snippets`;

  const cacheKey = `${propertyId}-${JSON.stringify(trimmedCandidates)}`;
  if (validationCache.has(cacheKey)) {
    return validationCache.get(cacheKey)!;
  }

  const inputPayload = {
    propertyId,
    candidates: trimmedCandidates,
  };

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(inputPayload) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "schema_gaps",
          strict: true,
          schema: {
            type: "object",
            properties: {
              topics: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    canonicalLabel: { type: "string" },
                    rawLabels: { type: "array", items: { type: "string" } },
                    keep: { type: "boolean" },
                    confidence: { type: "number" },
                    reason: { type: "string" },
                    sampleEvidence: { type: "array", items: { type: "string" } }
                  },
                  required: ["canonicalLabel", "rawLabels", "keep", "confidence", "reason", "sampleEvidence"],
                  additionalProperties: false
                }
              }
            },
            required: ["topics"],
            additionalProperties: false
          }
        }
      },
      temperature: 0,
    });

    const outStr = response.choices[0]?.message?.content;
    if (!outStr) throw new Error("Empty response from OpenAI");

    const parsed = JSON.parse(outStr) as { topics: ValidatedSchemaGap[] };
    validationCache.set(cacheKey, parsed.topics);
    return parsed.topics;

  } catch (error) {
    console.error("LLM schema gap validation failed:", error);
    // Failure fallback: return local candidates that passed the basic junk filter
    return trimmedCandidates.map(c => ({
      canonicalLabel: c.rawLabel,
      rawLabels: [c.rawLabel],
      keep: true,
      confidence: 0.5, // Low confidence for fallback
      reason: "Fallback local validation",
      sampleEvidence: c.snippets,
    }));
  }
}
