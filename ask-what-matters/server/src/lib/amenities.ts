import { humanizeSnakeCase } from './format';

export function parseAmenityArray(raw?: string): string[] {
  if (!raw || raw.trim() === '') return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).map(humanizeSnakeCase);
  } catch {
    return [];
  }
}

export function extractAmenitiesByCategory(row: Record<string, string>) {
  const result: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(row)) {
    if (key.startsWith('property_amenity_')) {
      const category = key.replace('property_amenity_', '');
      result[category] = parseAmenityArray(value);
    }
  }

  return result;
}
