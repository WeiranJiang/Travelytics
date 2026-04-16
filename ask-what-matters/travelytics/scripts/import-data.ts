import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { prisma } from "../src/lib/prisma";
import { syncAdminScores } from "../src/lib/intelligence/sync";
import type { DescriptionRow, ReviewRow } from "../src/lib/types";

function readCsv<T>(filePath: string): T[] {
  const content = fs.readFileSync(filePath, "utf8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
  }) as T[];
}

function toFloat(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function main() {
  const dataDir = path.join(process.cwd(), "data");
  const descriptionPath = path.join(dataDir, "Description_PROC.csv");
  const reviewsPath = path.join(dataDir, "Reviews_PROC.csv");

  const descriptions = readCsv<DescriptionRow>(descriptionPath);
  const reviews = readCsv<ReviewRow>(reviewsPath);

  await prisma.importedReview.deleteMany();
  await prisma.propertyFinalGap.deleteMany();
  await prisma.propertyCluster.deleteMany();
  await prisma.property.deleteMany();

  for (const row of descriptions) {
    await prisma.property.create({
      data: {
        egPropertyId: String(row.eg_property_id),
        guestRatingAvgExpedia: toFloat(row.guestrating_avg_expedia),
        city: row.city ?? null,
        province: row.province ?? null,
        country: row.country ?? null,
        starRating: toFloat(row.star_rating),
        areaDescription: row.area_description ?? null,
        propertyDescription: row.property_description ?? null,
        popularAmenitiesList: row.popular_amenities_list ?? null,
        propertyAmenityAccessibility: row.property_amenity_accessibility ?? null,
        propertyAmenityActivitiesNearby: row.property_amenity_activities_nearby ?? null,
        propertyAmenityBusinessServices: row.property_amenity_business_services ?? null,
        propertyAmenityConveniences: row.property_amenity_conveniences ?? null,
        propertyAmenityFamilyFriendly: row.property_amenity_family_friendly ?? null,
        propertyAmenityFoodAndDrink: row.property_amenity_food_and_drink ?? null,
        propertyAmenityGuestServices: row.property_amenity_guest_services ?? null,
        propertyAmenityInternet: row.property_amenity_internet ?? null,
        propertyAmenityLangsSpoken: row.property_amenity_langs_spoken ?? null,
        propertyAmenityMore: row.property_amenity_more ?? null,
        propertyAmenityOutdoor: row.property_amenity_outdoor ?? null,
        propertyAmenityParking: row.property_amenity_parking ?? null,
        propertyAmenitySpa: row.property_amenity_spa ?? null,
        propertyAmenityThingsToDo: row.property_amenity_things_to_do ?? null,
        checkInStartTime: row.check_in_start_time ?? null,
        checkInEndTime: row.check_in_end_time ?? null,
        checkOutTime: row.check_out_time ?? null,
        checkOutPolicy: row.check_out_policy ?? null,
        petPolicy: row.pet_policy ?? null,
        childrenAndExtraBedPolicy: row.children_and_extra_bed_policy ?? null,
        checkInInstructions: row.check_in_instructions ?? null,
        knowBeforeYouGo: row.know_before_you_go ?? null,
      },
    });
  }

  const { detectLanguageLocally } = require("../src/lib/intelligence/translation");
  
  for (const row of reviews) {
    const combined = `${row.review_title ?? ""} ${row.review_text ?? ""}`.trim();
    let translationStatus = "pending";
    let detectedLanguage = "und";

    if (!combined) {
      translationStatus = "skipped_english";
      detectedLanguage = "empty";
    } else {
      const { lang, isLikelyEnglish } = detectLanguageLocally(combined);
      detectedLanguage = lang;
      if (isLikelyEnglish) {
        translationStatus = "skipped_english";
      }
    }

    await prisma.importedReview.create({
      data: {
        egPropertyId: String(row.eg_property_id),
        acquisitionDate: toDate(row.acquisition_date),
        lob: row.lob ?? null,
        rating: row.rating ?? null,
        reviewTitle: row.review_title ?? null,
        reviewText: row.review_text ?? null,
        translationStatus,
        detectedLanguage,
      },
    });
  }

  await syncAdminScores();
  console.log("Import complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });