import { prisma } from "@/lib/prisma";
import { clusterProperties } from "./clustering";
import { computeFinalGapMatrix, temporalGapScore } from "./scoring";
import { DIMENSIONS } from "./config";
import type { ImportedReviewForScoring, PropertyForScoring } from "@/lib/types";

export async function syncAdminScores() {
    const properties = await prisma.property.findMany({
        select: {
            egPropertyId: true,
            guestRatingAvgExpedia: true,
            starRating: true,
            popularAmenitiesList: true,
            propertyAmenityAccessibility: true,
            propertyAmenityBusinessServices: true,
            propertyAmenityFoodAndDrink: true,
            propertyAmenityInternet: true,
            propertyAmenityOutdoor: true,
            propertyAmenityParking: true,
            propertyAmenitySpa: true,
            propertyAmenityThingsToDo: true,
            petPolicy: true,
            areaDescription: true,
            propertyDescription: true,
        },
    });

    const reviews = await prisma.importedReview.findMany({
        select: {
            egPropertyId: true,
            acquisitionDate: true,
            rating: true,
            reviewTitle: true,
            reviewText: true,
            translatedReviewTitle: true,
            translatedReviewText: true,
        },
    });

    const typedProperties: PropertyForScoring[] = properties;
    const typedReviews: ImportedReviewForScoring[] = reviews;

    const clusterMap = clusterProperties(typedProperties, 4);

    for (const [propertyId, clusterId] of Object.entries(clusterMap)) {
        const featureJson = JSON.stringify(
            typedProperties.find((p) => p.egPropertyId === propertyId) ?? {}
        );

        await prisma.propertyCluster.upsert({
            where: { propertyId },
            update: { clusterId, featureJson },
            create: { propertyId, clusterId, featureJson },
        });
    }

    // Fix 6: Two-pass approach so every property's cluster score is computed against
    // a fully populated peer matrix (not just the properties processed before it).

    // Pass 1: Pre-populate temporalMatrix with dimension-level scores for all properties
    const temporalMatrix: Record<string, number> = {};
    for (const property of typedProperties) {
        for (const dim of DIMENSIONS) {
            temporalMatrix[`${property.egPropertyId}::${dim}`] = temporalGapScore(
                property.egPropertyId,
                dim,
                typedReviews
            );
        }
    }

    // Pass 2: Warm-up — run computeFinalGapMatrix for every property so it also
    // populates temporalMatrix with schema/amenity/drift/controversy gap entries.
    // Results are discarded; we only want the side-effect on temporalMatrix.
    for (const property of typedProperties) {
        await computeFinalGapMatrix(
            property.egPropertyId,
            typedReviews,
            property,
            clusterMap,
            temporalMatrix
        );
    }

    // Pass 3: Final run — now that temporalMatrix is fully populated with all peer
    // data, cluster scores are accurate. Persist results to DB.
    for (const property of typedProperties) {
        const rows = await computeFinalGapMatrix(
            property.egPropertyId,
            typedReviews,
            property,
            clusterMap,
            temporalMatrix
        );

        for (const row of rows) {
            await prisma.propertyFinalGap.upsert({
                where: {
                    propertyId_gapType_label: {
                        propertyId: row.propertyId,
                        gapType: row.gapType,
                        label: row.label,
                    },
                },
                update: {
                    temporalScore: row.temporalScore,
                    freeTextScore: row.freeTextScore,
                    clusterScore: row.clusterScore,
                    controversyScore: row.controversyScore,
                    listingScore: row.listingScore,
                    driftScore: row.driftScore,
                    finalScore: row.finalScore,
                    metadataJson: JSON.stringify(row.metadata),
                },
                create: {
                    propertyId: row.propertyId,
                    gapType: row.gapType,
                    label: row.label,
                    temporalScore: row.temporalScore,
                    freeTextScore: row.freeTextScore,
                    clusterScore: row.clusterScore,
                    controversyScore: row.controversyScore,
                    listingScore: row.listingScore,
                    driftScore: row.driftScore,
                    finalScore: row.finalScore,
                    metadataJson: JSON.stringify(row.metadata),
                },
            });
        }
    }
}