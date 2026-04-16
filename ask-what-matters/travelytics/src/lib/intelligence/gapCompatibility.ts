export type GapLabel = string;

export type CompatibilityLevel =
    | "strong"   // very safe to combine into one question
    | "medium"   // can combine if needed
    | "weak"     // usually better separate
    | "none";    // should not combine

export type CompatibilityScore = 0 | 0.25 | 0.5 | 1;

export type GapGroup =
    | "cleanliness_condition"
    | "comfort_sleep"
    | "service_frontdesk"
    | "staff_communication"
    | "food_beverage"
    | "wellness_recreation"
    | "connectivity_work"
    | "transport_access"
    | "location_area"
    | "value_pricing"
    | "family_pet"
    | "safety_trust"
    | "listing_expectation"
    | "overall_summary"
    | "misc";

export type GapQuestionMode =
    | "single_only"      // should almost never be merged
    | "combine_friendly" // safe to combine if compatible
    | "meta_only";       // summary / aggregate signal, not a topical question

export type CompatibilityResult = {
    labelA: GapLabel;
    labelB: GapLabel;
    groupA: GapGroup;
    groupB: GapGroup;
    modeA: GapQuestionMode;
    modeB: GapQuestionMode;
    level: CompatibilityLevel;
    score: CompatibilityScore;
    reason: string;
};

export type GapMetadata = {
    group: GapGroup;
    mode: GapQuestionMode;
};

/**
 * Canonical metadata for known gap labels.
 * Expand this as your taxonomy grows.
 */
export const GAP_METADATA: Record<string, GapMetadata> = {
    // cleanliness / upkeep
    roomcleanliness: { group: "cleanliness_condition", mode: "combine_friendly" },
    cleanliness: { group: "cleanliness_condition", mode: "combine_friendly" },
    hotelcondition: { group: "cleanliness_condition", mode: "combine_friendly" },
    roomquality: { group: "cleanliness_condition", mode: "combine_friendly" },

    // comfort / sleep / rest
    roomcomfort: { group: "comfort_sleep", mode: "combine_friendly" },
    comfort: { group: "comfort_sleep", mode: "combine_friendly" },
    noise: { group: "comfort_sleep", mode: "single_only" },

    // front desk / arrival
    checkin: { group: "service_frontdesk", mode: "combine_friendly" },
    service: { group: "service_frontdesk", mode: "combine_friendly" },

    // staff communication
    communication: { group: "staff_communication", mode: "combine_friendly" },

    // food & beverage
    breakfast: { group: "food_beverage", mode: "combine_friendly" },
    restaurant: { group: "food_beverage", mode: "combine_friendly" },
    bar: { group: "food_beverage", mode: "combine_friendly" },

    // recreation / leisure / wellness
    spa: { group: "wellness_recreation", mode: "combine_friendly" },
    pool: { group: "wellness_recreation", mode: "combine_friendly" },
    gym: { group: "wellness_recreation", mode: "combine_friendly" },

    // productivity / digital experience
    wifi: { group: "connectivity_work", mode: "combine_friendly" },
    roomamenitiesscore: { group: "connectivity_work", mode: "combine_friendly" },

    // access / logistics
    parking: { group: "transport_access", mode: "combine_friendly" },

    // neighborhood / convenience
    location: { group: "location_area", mode: "combine_friendly" },
    convenienceoflocation: { group: "location_area", mode: "combine_friendly" },
    neighborhoodsatisfaction: { group: "location_area", mode: "combine_friendly" },

    // value / pricing
    value: { group: "value_pricing", mode: "combine_friendly" },
    valueformoney: { group: "value_pricing", mode: "combine_friendly" },

    // segment-specific needs
    family: { group: "family_pet", mode: "single_only" },
    pet_friendly: { group: "family_pet", mode: "single_only" },

    // trust / security / ethics
    safety: { group: "safety_trust", mode: "single_only" },
    ecofriendliness: { group: "safety_trust", mode: "single_only" },

    // expectation-setting signal
    onlinelisting: { group: "listing_expectation", mode: "single_only" },

    // aggregate summary signal
    overall: { group: "overall_summary", mode: "meta_only" },
};

/**
 * Strong curated pairings that produce natural combined questions.
 */
const STRONG_PAIRS = new Set<string>([
    pairKey("service", "checkin"),
    pairKey("service", "communication"),
    pairKey("checkin", "communication"),

    pairKey("cleanliness", "roomcleanliness"),
    pairKey("roomcleanliness", "hotelcondition"),
    pairKey("hotelcondition", "roomquality"),

    pairKey("roomcomfort", "comfort"),
    pairKey("roomcomfort", "noise"),

    pairKey("breakfast", "restaurant"),
    pairKey("restaurant", "bar"),

    pairKey("spa", "pool"),
    pairKey("pool", "gym"),

    pairKey("wifi", "roomamenitiesscore"),

    pairKey("location", "convenienceoflocation"),
    pairKey("location", "neighborhoodsatisfaction"),
    pairKey("convenienceoflocation", "neighborhoodsatisfaction"),

    pairKey("value", "valueformoney"),
]);

/**
 * Hard blocks for combinations that are awkward or cognitively unrelated.
 */
const BLOCKED_PAIRS = new Set<string>([
    pairKey("wifi", "safety"),
    pairKey("wifi", "pet_friendly"),
    pairKey("wifi", "family"),

    pairKey("parking", "family"),
    pairKey("parking", "pet_friendly"),

    pairKey("noise", "pet_friendly"),
    pairKey("noise", "family"),

    pairKey("breakfast", "safety"),
    pairKey("bar", "safety"),

    pairKey("location", "wifi"),
    pairKey("location", "spa"),

    pairKey("spa", "checkin"),
    pairKey("pool", "communication"),
    pairKey("gym", "checkin"),

    pairKey("ecofriendliness", "checkin"),
    pairKey("ecofriendliness", "wifi"),
    pairKey("onlinelisting", "noise"),
]);

/**
 * Soft cross-group combinations that can work, but are usually less ideal
 * than same-group combinations.
 */
const SOFT_GROUP_PAIRS = new Set<string>([
    groupPairKey("cleanliness_condition", "comfort_sleep"),
    groupPairKey("service_frontdesk", "staff_communication"),
    groupPairKey("service_frontdesk", "value_pricing"),
    groupPairKey("food_beverage", "value_pricing"),
    groupPairKey("connectivity_work", "value_pricing"),
    groupPairKey("location_area", "value_pricing"),
]);

export function normalizeGap(label: string): string {
    return label.trim().toLowerCase().replace(/\s+/g, "_");
}

function pairKey(a: string, b: string): string {
    return [normalizeGap(a), normalizeGap(b)].sort().join("::");
}

function groupPairKey(a: GapGroup, b: GapGroup): string {
    return [a, b].sort().join("::");
}

export function getGapMetadata(label: string): GapMetadata {
    const normalized = normalizeGap(label);
    return GAP_METADATA[normalized] ?? { group: "misc", mode: "single_only" };
}

export function getGapGroup(label: string): GapGroup {
    return getGapMetadata(label).group;
}

export function getGapQuestionMode(label: string): GapQuestionMode {
    return getGapMetadata(label).mode;
}

/**
 * Main compatibility logic.
 */
export function getGapCompatibility(
    labelA: GapLabel,
    labelB: GapLabel
): CompatibilityResult {
    const a = normalizeGap(labelA);
    const b = normalizeGap(labelB);

    const metaA = getGapMetadata(a);
    const metaB = getGapMetadata(b);

    if (a === b) {
        return {
            labelA: a,
            labelB: b,
            groupA: metaA.group,
            groupB: metaB.group,
            modeA: metaA.mode,
            modeB: metaB.mode,
            level: "strong",
            score: 1,
            reason: "Same gap label.",
        };
    }

    // overall-like meta signals should not be merged into topical questions
    if (metaA.mode === "meta_only" || metaB.mode === "meta_only") {
        return {
            labelA: a,
            labelB: b,
            groupA: metaA.group,
            groupB: metaB.group,
            modeA: metaA.mode,
            modeB: metaB.mode,
            level: "none",
            score: 0,
            reason: "Meta summary gaps should not be combined with topical questions.",
        };
    }

    const key = pairKey(a, b);

    if (BLOCKED_PAIRS.has(key)) {
        return {
            labelA: a,
            labelB: b,
            groupA: metaA.group,
            groupB: metaB.group,
            modeA: metaA.mode,
            modeB: metaB.mode,
            level: "none",
            score: 0,
            reason: "These two gaps are too unrelated or awkward to combine in one question.",
        };
    }

    if (STRONG_PAIRS.has(key)) {
        return {
            labelA: a,
            labelB: b,
            groupA: metaA.group,
            groupB: metaB.group,
            modeA: metaA.mode,
            modeB: metaB.mode,
            level: "strong",
            score: 1,
            reason: "This is a curated strong pairing that usually forms a natural combined question.",
        };
    }

    // If both are single-only, do not combine
    if (metaA.mode === "single_only" && metaB.mode === "single_only") {
        return {
            labelA: a,
            labelB: b,
            groupA: metaA.group,
            groupB: metaB.group,
            modeA: metaA.mode,
            modeB: metaB.mode,
            level: "none",
            score: 0,
            reason: "Both gaps are marked as single-topic questions.",
        };
    }

    // Same fine-grained group
    if (metaA.group === metaB.group && metaA.group !== "misc") {
        // If either one is single-only, still allow only weak compatibility
        if (metaA.mode === "single_only" || metaB.mode === "single_only") {
            return {
                labelA: a,
                labelB: b,
                groupA: metaA.group,
                groupB: metaB.group,
                modeA: metaA.mode,
                modeB: metaB.mode,
                level: "weak",
                score: 0.25,
                reason: "These gaps are related, but one is better asked as a stand-alone question.",
            };
        }

        return {
            labelA: a,
            labelB: b,
            groupA: metaA.group,
            groupB: metaB.group,
            modeA: metaA.mode,
            modeB: metaB.mode,
            level: "medium",
            score: 0.5,
            reason: \`Both gaps belong to the same experience group: \${metaA.group}.\`,
        };
    }

    // Soft cross-group logic
    const softKey = groupPairKey(metaA.group, metaB.group);
    if (SOFT_GROUP_PAIRS.has(softKey)) {
        return {
            labelA: a,
            labelB: b,
            groupA: metaA.group,
            groupB: metaB.group,
            modeA: metaA.mode,
            modeB: metaB.mode,
            level: "weak",
            score: 0.25,
            reason: "These gaps are somewhat related, but separate questions are usually clearer.",
        };
    }

    // Default: no combination
    return {
        labelA: a,
        labelB: b,
        groupA: metaA.group,
        groupB: metaB.group,
        modeA: metaA.mode,
        modeB: metaB.mode,
        level: "none",
        score: 0,
        reason: "No meaningful relationship for a combined question.",
    };
}

/**
 * Build full pairwise compatibility matrix.
 */
export function buildCompatibilityMatrix(
    gapLabels: string[]
): Record<string, Record<string, CompatibilityResult>> {
    const normalized = [...new Set(gapLabels.map(normalizeGap))];
    const matrix: Record<string, Record<string, CompatibilityResult>> = {};

    for (const a of normalized) {
        matrix[a] = {};
        for (const b of normalized) {
            matrix[a][b] = getGapCompatibility(a, b);
        }
    }

    return matrix;
}

/**
 * Return all composable pairs above a threshold.
 */
export function getComposablePairs(
    gapLabels: string[],
    minScore: CompatibilityScore = 0.5
): CompatibilityResult[] {
    const normalized = [...new Set(gapLabels.map(normalizeGap))];
    const results: CompatibilityResult[] = [];

    for (let i = 0; i < normalized.length; i++) {
        for (let j = i + 1; j < normalized.length; j++) {
            const result = getGapCompatibility(normalized[i], normalized[j]);
            if (result.score >= minScore) {
                results.push(result);
            }
        }
    }

    return results.sort((a, b) => b.score - a.score);
}

/**
 * Find the single best pair to combine from a list.
 */
export function findBestGapPair(
    gapLabels: string[],
    minScore: CompatibilityScore = 0.25
): CompatibilityResult | null {
    const candidates = getComposablePairs(gapLabels, minScore);
    return candidates.length > 0 ? candidates[0] : null;
}

/**
 * Utility: build a simple numeric matrix for debugging / analytics.
 */
export function buildCompatibilityScoreTable(
    gapLabels: string[]
): Record<string, Record<string, CompatibilityScore>> {
    const normalized = [...new Set(gapLabels.map(normalizeGap))];
    const table: Record<string, Record<string, CompatibilityScore>> = {};

    for (const a of normalized) {
        table[a] = {};
        for (const b of normalized) {
            table[a][b] = getGapCompatibility(a, b).score;
        }
    }

    return table;
}

/**
 * Utility: decide whether two gaps should be merged in a survey flow.
 */
export function shouldCombineGaps(
    labelA: string,
    labelB: string,
    minScore: CompatibilityScore = 0.5
): boolean {
    return getGapCompatibility(labelA, labelB).score >= minScore;
}
