import { FINAL_WEIGHTS, DIMENSIONS, HALF_LIFE_DAYS, DIMENSION_WEIGHTS, TOPIC_TAXONOMY, AMENITY_CHECK, AMENITY_THRESHOLDS } from "./config";
import { crudeSentimentScore, normalizeText, tokenize, containsAnyKeyword, extractTopicSentences } from "./text";
import { clusterGapScore } from "./clustering";
import type { ImportedReviewForScoring, PropertyForScoring } from "@/lib/types";
import { validateSchemaGaps, type RawSchemaGapCandidate } from "./schema-validation";

export type FinalGapRow = {
    propertyId: string;
    gapType: string;
    label: string;
    temporalScore: number;
    freeTextScore: number;
    clusterScore: number;
    controversyScore: number;
    listingScore: number;
    driftScore: number;
    finalScore: number;
    metadata: Record<string, unknown>;
};

function normalizeLabel(label: string): string {
    const map: Record<string, string> = {
        roomcleanliness: "cleanliness",
        roomcomfort: "comfort",
        roomamenitiesscore: "amenities",
        valueformoney: "value for money",
        ecofriendliness: "eco-friendliness",
        neighborhoodsatisfaction: "neighborhood",
        pet_friendly: "pet friendly",
        onlinelisting: "listing accuracy",
    };
    return map[label] || label.replace(/_/g, " ");
}

export function parseRatingJson(ratingValue: string | null): Record<string, number> {
    if (!ratingValue?.trim()) return {};
    try {
        const parsed = JSON.parse(ratingValue);
        if (!parsed || typeof parsed !== "object") return {};
        return Object.fromEntries(
            Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [
                k,
                Number.isFinite(Number(v)) ? Number(v) : 0,
            ])
        );
    } catch {
        return {};
    }
}

export function decayWeight(lastReviewDate: Date, halfLifeDays: number): number {
    const ageMs = Date.now() - lastReviewDate.getTime();
    const ageDays = Math.max(0, ageMs / (1000 * 60 * 60 * 24));
    const freshness = Math.exp((-Math.log(2) * ageDays) / halfLifeDays);
    return 1 - freshness;
}

export function temporalGapScore(
    propertyId: string,
    dimension: string,
    reviews: ImportedReviewForScoring[]
): number {
    const propReviews = reviews.filter((r) => r.egPropertyId === propertyId);
    if (propReviews.length === 0) return 1;

    const rated = propReviews
        .map((r) => {
            const ratingDict = parseRatingJson(r.rating);
            const val = Number(ratingDict[dimension] ?? 0);
            if (!r.acquisitionDate || !Number.isFinite(val) || val === 0) return null;
            return { date: r.acquisitionDate, value: val };
        })
        .filter(Boolean) as { date: Date; value: number }[];

    if (rated.length === 0) return 1;

    // Fix 1: window coverage to last 6 months to avoid dilution by all-time review volume
    const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
    const coverageCutoff = new Date(Date.now() - SIX_MONTHS_MS);
    const recentReviews = propReviews.filter((r) => r.acquisitionDate && r.acquisitionDate >= coverageCutoff);
    const recentRated = rated.filter((r) => r.date >= coverageCutoff);
    const coverageBase = recentReviews.length > 0 ? recentReviews.length : propReviews.length;
    const coverageRate = recentRated.length / coverageBase;
    const coverageGap = 1 - coverageRate;
    const lastDate = rated.reduce((max, cur) => (cur.date > max ? cur.date : max), rated[0].date);

    const halfLife = HALF_LIFE_DAYS[dimension] ?? 180;
    const staleness = decayWeight(lastDate, halfLife);
    const weights = DIMENSION_WEIGHTS[dimension] ?? { coverage: 0.6, staleness: 0.4 };

    return coverageGap * weights.coverage + staleness * weights.staleness;
}

export function extractRawSchemaGapCandidates(
    propertyId: string,
    reviews: ImportedReviewForScoring[]
): RawSchemaGapCandidate[] {
    const propReviews = reviews.filter((r) => r.egPropertyId === propertyId);
    const total = propReviews.length;
    if (total === 0) return [];

    const known = new Set([...TOPIC_TAXONOMY, ...DIMENSIONS]);
    const freq: Record<string, { count: number; snippets: Set<string> }> = {};

    for (const r of propReviews) {
        const tTitle = r.translatedReviewTitle ?? r.reviewTitle ?? "";
        const tText = r.translatedReviewText ?? r.reviewText ?? "";
        const rawFullText = `${tTitle} ${tText}`.trim();
        const sentences = rawFullText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
        
        const words = tokenize(rawFullText);
        const unique = new Set(words);
        for (const word of unique) {
            if (known.has(word)) continue;
            
            if (!freq[word]) {
                freq[word] = { count: 0, snippets: new Set<string>() };
            }
            freq[word].count += 1;
            
            if (freq[word].snippets.size < 5) {
                const snippet = sentences.find(s => normalizeText(s).includes(word)) || rawFullText;
                freq[word].snippets.add(snippet.substring(0, 200).trim());
            }
        }
    }

    return Object.entries(freq)
        .filter(([, info]) => info.count >= 3)
        .map(([topic, info]) => ({
            rawLabel: topic,
            count: info.count,
            rate: Math.min(1, info.count / total),
            snippets: Array.from(info.snippets),
        }));
}

export function controversyScores(
    propertyId: string,
    reviews: ImportedReviewForScoring[]
): Record<string, { controversyScore: number; positive: number; negative: number }> {
    const propReviews = reviews.filter((r) => r.egPropertyId === propertyId);
    const out: Record<string, { controversyScore: number; positive: number; negative: number }> = {};

    for (const topic of TOPIC_TAXONOMY) {
        let positive = 0;
        let negative = 0;
        for (const r of propReviews) {
            // Fix 3: score only the topic-relevant sentences, not the full review
            const tTitle = r.translatedReviewTitle ?? r.reviewTitle ?? "";
            const tText = r.translatedReviewText ?? r.reviewText ?? "";
            const fullText = normalizeText(`${tTitle} ${tText}`);
            if (!fullText.includes(topic.replace("_", " "))) continue;
            const topicText = extractTopicSentences(fullText, topic);
            const s = crudeSentimentScore(topicText || fullText);
            if (s > 0) positive += 1;
            if (s < 0) negative += 1;
        }

        const total = positive + negative;
        if (total < 5) continue;

        const p = positive / total;
        const n = negative / total;
        const controversyScore = 1 - Math.abs(p - n);

        if (controversyScore > 0.25) {
            out[topic] = { controversyScore, positive, negative };
        }
    }

    return out;
}

export function listingVsRealityGaps(
    propertyId: string,
    property: PropertyForScoring,
    reviews: ImportedReviewForScoring[]
): Array<{ amenity: string; mentionRate: number; mentionCount: number; totalReviews: number; gapScore: number }> {
    const propReviews = reviews.filter((r) => r.egPropertyId === propertyId);
    const total = propReviews.length;
    // Fix 5: removed broad JSON.stringify fallback — only check specific amenity/listing fields

    const gaps: Array<{ amenity: string; mentionRate: number; mentionCount: number; totalReviews: number; gapScore: number }> = [];

    for (const [amenity, cfg] of Object.entries(AMENITY_CHECK)) {
        // Checks both the specific amenity field and popularAmenitiesList (both in cfg.descFields)
        const listed = cfg.descFields.some((field) => {
            const key = field as keyof PropertyForScoring;
            return containsAnyKeyword(normalizeText(String(property[key] ?? "")), cfg.reviewKeywords);
        });

        if (!listed) continue;
        if (total < 10) continue;

        const mentions = propReviews.reduce((count, r) => {
            const tTitle = r.translatedReviewTitle ?? r.reviewTitle ?? "";
            const tText = r.translatedReviewText ?? r.reviewText ?? "";
            const text = normalizeText(`${tTitle} ${tText}`);
            return count + (containsAnyKeyword(text, cfg.reviewKeywords) ? 1 : 0);
        }, 0);

        const mentionRate = total > 0 ? mentions / total : 0;
        const threshold = AMENITY_THRESHOLDS[amenity] ?? 0.05;

        if (mentionRate < threshold) {
            const gapScore = Math.max(0, 1 - mentionRate / threshold);
            gaps.push({
                amenity,
                mentionRate,
                mentionCount: mentions,
                totalReviews: total,
                gapScore,
            });
        }
    }

    return gaps.sort((a, b) => b.gapScore - a.gapScore);
}

export function sentimentDriftScore(
    propertyId: string,
    topic: string,
    reviews: ImportedReviewForScoring[]
): { direction: "stable" | "up" | "down"; gapScore: number } {
    const propReviews = reviews
        .filter((r) => r.egPropertyId === propertyId && r.acquisitionDate)
        .sort((a, b) => (a.acquisitionDate!.getTime() - b.acquisitionDate!.getTime()));

    // Fix 4: split by a fixed 12-month time boundary, not review count
    // (count-based midpoint misidentifies "recent" for uneven review histories)
    const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
    const driftCutoff = new Date(Date.now() - ONE_YEAR_MS);
    const older = propReviews.filter((r) => r.acquisitionDate! < driftCutoff);
    const recent = propReviews.filter((r) => r.acquisitionDate! >= driftCutoff);
    if (older.length < 5 || recent.length < 3) return { direction: "stable", gapScore: 0 };

    const avgSentiment = (rows: ImportedReviewForScoring[]) => {
        const relevant = rows.filter((r) => {
            const tTitle = r.translatedReviewTitle ?? r.reviewTitle ?? "";
            const tText = r.translatedReviewText ?? r.reviewText ?? "";
            return normalizeText(`${tTitle} ${tText}`).includes(topic.replace("_", " "));
        });
        if (relevant.length === 0) return 0;
        return relevant.reduce((sum, r) => {
            const tTitle = r.translatedReviewTitle ?? r.reviewTitle ?? "";
            const tText = r.translatedReviewText ?? r.reviewText ?? "";
            return sum + crudeSentimentScore(`${tTitle} ${tText}`);
        }, 0) / relevant.length;
    };

    const olderAvg = avgSentiment(older);
    const recentAvg = avgSentiment(recent);
    const delta = recentAvg - olderAvg;

    if (Math.abs(delta) < 0.75) return { direction: "stable", gapScore: 0 };
    return {
        direction: delta > 0 ? "up" : "down",
        gapScore: Math.min(1, Math.abs(delta) / 3),
    };
}

export async function computeFinalGapMatrix(
    propertyId: string,
    reviews: ImportedReviewForScoring[],
    property: PropertyForScoring,
    clusterMap: Record<string, number>,
    temporalMatrix: Record<string, number>
): Promise<FinalGapRow[]> {
    const allGaps = new Map<string, Omit<FinalGapRow, "propertyId" | "finalScore">>();

    const getOrCreateGap = (rawLabel: string, type: string) => {
        const label = normalizeLabel(rawLabel);
        if (!allGaps.has(label)) {
            allGaps.set(label, {
                gapType: type,
                label: label,
                temporalScore: 0,
                freeTextScore: 0,
                clusterScore: 0,
                controversyScore: 0,
                listingScore: 0,
                driftScore: 0,
                metadata: {},
            });
        }
        const gap = allGaps.get(label)!;
        // Priority for gapType: rating_dim > amenity > schema_gap > topic > drift
        const typePriority: Record<string, number> = { rating_dim: 1, amenity: 2, schema_gap: 3, topic: 4, drift: 5 };
        if (typePriority[type] < typePriority[gap.gapType]) {
            gap.gapType = type;
        }
        return gap;
    };

    for (const dim of DIMENSIONS) {
        const score = temporalGapScore(propertyId, dim, reviews);
        if (score <= 0) continue;
        const gap = getOrCreateGap(dim, "rating_dim");
        gap.temporalScore = score;
    }

    const rawCandidates = extractRawSchemaGapCandidates(propertyId, reviews);
    const validated = await validateSchemaGaps(propertyId, rawCandidates);

    for (const topic of validated.filter((t) => t.keep)) {
        const gap = getOrCreateGap(topic.canonicalLabel, "schema_gap");
        
        const mergedRate = rawCandidates
            .filter(c => topic.rawLabels.includes(c.rawLabel))
            .reduce((sum, c) => sum + c.rate, 0);
            
        const score = Math.min(1, mergedRate * 10) * topic.confidence;
        gap.freeTextScore = Math.max(gap.freeTextScore, score);
        gap.metadata = { 
            ...gap.metadata,
            rawLabels: [...(gap.metadata.rawLabels as string[] ?? []), ...topic.rawLabels],
            confidence: topic.confidence,
            mergedRate: (gap.metadata.mergedRate as number ?? 0) + mergedRate
        };
    }

    const controversy = controversyScores(propertyId, reviews);
    for (const [topic, info] of Object.entries(controversy)) {
        const gap = getOrCreateGap(topic, "topic");
        gap.controversyScore = info.controversyScore;
        gap.metadata = { ...gap.metadata, positive: info.positive, negative: info.negative };
    }

    const listing = listingVsRealityGaps(propertyId, property, reviews);
    for (const info of listing) {
        const gap = getOrCreateGap(info.amenity, "amenity");
        gap.listingScore = info.gapScore;
        gap.metadata = { ...gap.metadata, mentionRate: info.mentionRate, mentionCount: info.mentionCount };
    }

    for (const topic of TOPIC_TAXONOMY) {
        const drift = sentimentDriftScore(propertyId, topic, reviews);
        if (drift.direction === "stable") continue;
        const gap = getOrCreateGap(topic, "drift");
        gap.driftScore = drift.gapScore;
        gap.metadata = { ...gap.metadata, direction: drift.direction };
    }

    for (const row of allGaps.values()) {
        const baseForCluster = Math.max(
            row.temporalScore,
            row.listingScore,
            row.controversyScore,
            row.freeTextScore,
            row.driftScore
        );
        temporalMatrix[`${propertyId}::${row.label}`] = Math.max(temporalMatrix[`${propertyId}::${row.label}`] ?? 0, baseForCluster);
    }

    const rows: FinalGapRow[] = [];
    for (const row of allGaps.values()) {
        const clusterScore = clusterGapScore(propertyId, row.label, clusterMap, temporalMatrix);
        const finalScore =
            row.temporalScore * FINAL_WEIGHTS.temporal +
            row.freeTextScore * FINAL_WEIGHTS.freetext +
            clusterScore * FINAL_WEIGHTS.cluster +
            row.controversyScore * FINAL_WEIGHTS.controversy +
            row.listingScore * FINAL_WEIGHTS.listing +
            row.driftScore * FINAL_WEIGHTS.drift;

        rows.push({
            propertyId,
            ...row,
            clusterScore,
            finalScore: Number(finalScore.toFixed(4)),
        });
    }

    return rows.sort((a, b) => b.finalScore - a.finalScore);
}