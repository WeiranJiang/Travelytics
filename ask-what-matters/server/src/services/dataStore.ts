import fs from 'fs';
import path from 'path';
import { fallbackData } from '../data/fallback';
import { loadCsv } from '../lib/csv';
import type { RawDescriptionRow, RawReviewRow } from '../types/raw';

function safeLoadCsv<T>(relativePath: string): T[] {
  const filePath = path.resolve(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) return [];

  try {
    return loadCsv<T>(relativePath);
  } catch (error) {
    console.warn(`[dataStore] Failed to load ${relativePath}:`, error);
    return [];
  }
}

const descriptionRows = safeLoadCsv<RawDescriptionRow>('server/data/Description_PROC.csv');
const reviewRows = safeLoadCsv<RawReviewRow>('server/data/Reviews_PROC.csv');

const propertiesById = new Map(descriptionRows.map((row) => [row.eg_property_id, row]));
const reviewsByPropertyId = new Map<string, RawReviewRow[]>();

for (const review of reviewRows) {
  const arr = reviewsByPropertyId.get(review.eg_property_id) ?? [];
  arr.push(review);
  reviewsByPropertyId.set(review.eg_property_id, arr);
}

const hasCsvData = descriptionRows.length > 0 && reviewRows.length > 0;

if (hasCsvData) {
  console.log(
    `[dataStore] Loaded ${descriptionRows.length} properties and ${reviewRows.length} reviews from server/data`,
  );
} else {
  console.warn(
    '[dataStore] Raw CSV files not found in server/data; falling back to existing frontend mock data.',
  );
}

export const dataStore = {
  descriptionRows,
  reviewRows,
  propertiesById,
  reviewsByPropertyId,
  hasCsvData,
  fallbackProperties: fallbackData.properties,
  fallbackPropertiesById: fallbackData.propertiesById,
  fallbackReviewsByPropertyId: fallbackData.reviewsByPropertyId,
  demoUsers: fallbackData.demoUsers,
};
