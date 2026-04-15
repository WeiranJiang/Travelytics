import fs from 'fs';
import path from 'path';
import type { Property, Review, User } from '../types/api';

type PropertyRaw = Omit<
  Property,
  'pet_policy' | 'children_and_extra_bed_policy' | 'know_before_you_go'
> & {
  pet_policy: string | string[];
  children_and_extra_bed_policy: string | string[];
  know_before_you_go: string | string[];
};

export interface UserRecord extends User {
  password: string;
}

function readJsonFile<T>(relativePath: string, fallback: T): T {
  const filePath = path.resolve(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) return fallback;

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

const joinArr = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value.filter(Boolean).join(' · ') : value ?? '';

function normalizeProperty(property: PropertyRaw): Property {
  return {
    ...property,
    pet_policy: joinArr(property.pet_policy) || 'Policy not specified',
    children_and_extra_bed_policy:
      joinArr(property.children_and_extra_bed_policy) || 'Policy not specified',
    know_before_you_go: joinArr(property.know_before_you_go) || '',
  };
}

const propertiesRaw = readJsonFile<PropertyRaw[]>('src/api/data-properties.json', []);
const properties = propertiesRaw.map(normalizeProperty);
const reviewsRecord = readJsonFile<Record<string, Review[]>>('src/api/data-reviews.json', {});
const demoUsers = readJsonFile<UserRecord[]>('src/api/data-users.json', []);

export const fallbackData = {
  properties,
  propertiesById: new Map(properties.map((property) => [property.eg_property_id, property])),
  reviewsByPropertyId: new Map(
    Object.entries(reviewsRecord).map(([propertyId, reviews]) => [propertyId, reviews]),
  ),
  demoUsers,
};
