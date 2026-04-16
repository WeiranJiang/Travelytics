const STOPWORDS = new Set([
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "to", "of",
    "in", "on", "for", "with", "it", "this", "that", "we", "our", "they", "you",
    "hotel", "room", "stay", "stayed", "very", "really", "had", "have", "has",
    "good", "great", "nice", "bad", "ok", "okay", "just", "from", "at", "as",
    // Expanded stopwords for schema_gap filtering
    "would", "could", "should", "there", "their", "about", "after", "before", 
    "because", "been", "being", "into", "than", "them", "then", "when", "where",
    "think", "know", "went", "came", "made", "some", "what", "which", "who", "why",
    "will", "can", "did", "not", "too", "also", "much", "many", "more", "most",
    "like", "even", "only", "well", "how", "out", "get", "got", "your", "its", "all",
    "any", "couldn", "didn", "doesn", "hadn", "hasn", "haven", "isn", "might", "must",
    "aren", "weren", "wasn", "wouldn", "shouldn", "these", "those", "here", "there"
]);

export function normalizeText(input: string | null | undefined): string {
    return (input ?? "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

export function tokenize(input: string | null | undefined): string[] {
    const text = normalizeText(input);
    const tokens = text.split(" ").map((t) => t.trim()).filter((t) => t.length > 0);
    
    const validTokens: string[] = [];
    
    // Add valid single words
    tokens.forEach((t) => {
        if (t.length >= 4 && !STOPWORDS.has(t)) {
            validTokens.push(t);
        }
    });

    // Add 2-word phrase combinations (bi-grams) to catch 'construction noise'
    for (let i = 0; i < tokens.length - 1; i++) {
        const t1 = tokens[i];
        const t2 = tokens[i + 1];
        if (t1.length >= 3 && t2.length >= 3 && !STOPWORDS.has(t1) && !STOPWORDS.has(t2)) {
            validTokens.push(`${t1} ${t2}`);
        }
    }

    return validTokens;
}

export function containsAnyKeyword(text: string, keywords: string[]): boolean {
    return keywords.some((kw) => text.includes(kw.toLowerCase()));
}

export function countKeywordMentions(text: string, keywords: string[]): number {
    return keywords.reduce((count, kw) => count + (text.includes(kw.toLowerCase()) ? 1 : 0), 0);
}

export function crudeSentimentScore(text: string): number {
    const positive = ["clean", "friendly", "helpful", "quiet", "comfortable", "great", "excellent", "easy"];
    const negative = ["dirty", "rude", "noisy", "slow", "bad", "poor", "broken", "confusing", "expensive"];

    const normalized = normalizeText(text);
    let score = 0;
    for (const p of positive) if (normalized.includes(p)) score += 1;
    for (const n of negative) if (normalized.includes(n)) score -= 1;
    return score;
}

/**
 * Extracts only the sentences from `text` that mention the given topic.
 * Prevents full-review sentiment from polluting topic-specific controversy scores.
 * Returns the original text if no topic-specific sentences are found.
 */
export function extractTopicSentences(text: string, topic: string): string {
    const topicWord = topic.replace(/_/g, " ");
    const sentences = text.split(/[.!?]+/).filter((s) => s.includes(topicWord));
    return sentences.length > 0 ? sentences.join(". ") : "";
}