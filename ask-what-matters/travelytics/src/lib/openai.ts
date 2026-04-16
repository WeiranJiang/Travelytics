import OpenAI from "openai";

let _openai: OpenAI | null = null;

/**
 * Lazy singleton for the OpenAI client.
 * Ensures we only instantiate it when needed, and that we have a valid API key.
 */
export function getOpenAI(): OpenAI {
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
