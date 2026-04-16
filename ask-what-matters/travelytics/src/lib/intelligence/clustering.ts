import { kmeans } from "ml-kmeans";
import type { PropertyForScoring } from "@/lib/types";

export function buildPropertyFeatureVector(p: PropertyForScoring): number[] {
    const popular = (p.popularAmenitiesList ?? "").toLowerCase();
    const outdoor = (p.propertyAmenityOutdoor ?? "").toLowerCase();
    const things = (p.propertyAmenityThingsToDo ?? "").toLowerCase();
    const food = (p.propertyAmenityFoodAndDrink ?? "").toLowerCase();
    const pet = (p.petPolicy ?? "").toLowerCase();

    return [
        Number(p.starRating ?? 3),
        Number(p.guestRatingAvgExpedia ?? 3),
        Number(popular.includes("pool") || outdoor.includes("swimming")),
        Number(Boolean(p.propertyAmenitySpa)),
        Number(popular.includes("fitness") || things.includes("gym")),
        Number(popular.includes("breakfast")),
        Number(food.includes("restaurant")),
        Number(food.includes("bar")),
        Number(Boolean(p.propertyAmenityParking)),
        Number(Boolean(p.propertyAmenityBusinessServices)),
        Number(pet.includes("pets allowed") || pet.includes("pet")),
    ];
}

function zscore(matrix: number[][]): number[][] {
    const cols = matrix[0]?.length ?? 0;
    const means = Array(cols).fill(0);
    const stds = Array(cols).fill(0);

    for (let c = 0; c < cols; c++) {
        means[c] = matrix.reduce((sum, row) => sum + row[c], 0) / matrix.length;
        stds[c] = Math.sqrt(
            matrix.reduce((sum, row) => sum + (row[c] - means[c]) ** 2, 0) / Math.max(1, matrix.length)
        ) || 1;
    }

    return matrix.map((row) => row.map((v, c) => (v - means[c]) / stds[c]));
}

export function clusterProperties(
    properties: PropertyForScoring[],
    nClusters = 4
): Record<string, number> {
    if (properties.length === 0) return {};
    if (properties.length <= nClusters) {
        return Object.fromEntries(properties.map((p, i) => [p.egPropertyId, i]));
    }

    const ids = properties.map((p) => p.egPropertyId);
    const vectors = properties.map(buildPropertyFeatureVector);
    const scaled = zscore(vectors);
    const result = kmeans(scaled, nClusters, { initialization: "kmeans++", seed: 42 });

    return Object.fromEntries(ids.map((id, i) => [id, result.clusters[i] ?? 0]));
}

export function clusterGapScore(
    propertyId: string,
    label: string,
    clusterMap: Record<string, number>,
    gapMatrix: Record<string, number>
): number {
    const myCluster = clusterMap[propertyId];
    const peers = Object.entries(clusterMap)
        .filter(([pid, cid]) => pid !== propertyId && cid === myCluster)
        .map(([pid]) => pid);

    if (peers.length === 0) return 0;

    const peerScores = peers.map((pid) => gapMatrix[`${pid}::${label}`] ?? 0);
    const peerAvg = peerScores.reduce((a, b) => a + b, 0) / peerScores.length;
    const mine = gapMatrix[`${propertyId}::${label}`] ?? 0;

    return Math.max(0, mine - peerAvg);
}