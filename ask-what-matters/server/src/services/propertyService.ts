import type { CategoryBreakdownScores, Property } from '../types/api';
import type { RawDescriptionRow } from '../types/raw';
import { buildDisplayName } from '../lib/displayName';
import { extractAmenitiesByCategory, parseAmenityArray } from '../lib/amenities';
import {
  emptyToUndefined,
  normalizeText,
  parseNumber,
  removeMask,
  sentenceCase,
  stripHtml,
} from '../lib/format';
import { dataStore } from './dataStore';
import {
  aggregateCategoryRatings,
  emptyCategoryRatings,
  parseRatingDetail,
} from './reviewRatings';
import { getSubmittedReviewCount } from './reviewSubmissionService';

const IMAGE_SETS = [
  {
    hero:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop',
    ],
  },
  {
    hero:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop',
    ],
  },
  {
    hero:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop',
    ],
  },
];

function getImages(propertyId: string) {
  const seed = propertyId
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return IMAGE_SETS[seed % IMAGE_SETS.length];
}

function fillCategoryRatings(
  partial: Partial<CategoryBreakdownScores>,
): CategoryBreakdownScores {
  return {
    ...emptyCategoryRatings(),
    ...partial,
  };
}

function toProperty(row: RawDescriptionRow): Property {
  const reviews = dataStore.reviewsByPropertyId.get(row.eg_property_id) ?? [];
  const ratingDetails = reviews.map((review) => parseRatingDetail(review.rating));
  const propertyDescription = sentenceCase(stripHtml(removeMask(row.property_description))) ?? '';
  const areaDescription = sentenceCase(stripHtml(removeMask(row.area_description))) ?? '';
  const starRating = parseNumber(row.star_rating);
  const images = getImages(row.eg_property_id);

  return {
    eg_property_id: row.eg_property_id,
    display_name: buildDisplayName({
      city: emptyToUndefined(row.city),
      country: emptyToUndefined(row.country),
      starRating,
      propertyDescription,
    }),
    city: emptyToUndefined(row.city) ?? '',
    province: emptyToUndefined(row.province) ?? '',
    country: emptyToUndefined(row.country) ?? '',
    star_rating: starRating,
    guestrating_avg_expedia: parseNumber(row.guestrating_avg_expedia) ?? 0,
    total_reviews: reviews.length + getSubmittedReviewCount(row.eg_property_id),
    area_description: areaDescription,
    property_description: propertyDescription,
    popular_amenities: parseAmenityArray(row.popular_amenities_list),
    amenities_by_category: extractAmenitiesByCategory(row as Record<string, string>),
    check_in_start_time: normalizeText(row.check_in_start_time, 'Not specified'),
    check_in_end_time: normalizeText(row.check_in_end_time, 'Not specified'),
    check_out_time: normalizeText(row.check_out_time, 'Not specified'),
    check_out_policy: normalizeText(row.check_out_policy, 'Not specified'),
    pet_policy: normalizeText(row.pet_policy, 'Policy not specified'),
    children_and_extra_bed_policy: normalizeText(
      row.children_and_extra_bed_policy,
      'Policy not specified',
    ),
    check_in_instructions: normalizeText(row.check_in_instructions),
    know_before_you_go: normalizeText(row.know_before_you_go),
    hero_image_url: images.hero,
    gallery_image_urls: images.gallery,
    category_ratings: fillCategoryRatings(aggregateCategoryRatings(ratingDetails)),
  };
}

export function listProperties(): Property[] {
  if (!dataStore.hasCsvData) {
    return dataStore.fallbackProperties.map((property) => ({
      ...property,
      total_reviews: property.total_reviews + getSubmittedReviewCount(property.eg_property_id),
    }));
  }

  return dataStore.descriptionRows.map(toProperty);
}

export function getPropertyById(propertyId: string): Property | null {
  if (!dataStore.hasCsvData) {
    const property = dataStore.fallbackPropertiesById.get(propertyId);
    if (!property) return null;
    return {
      ...property,
      total_reviews: property.total_reviews + getSubmittedReviewCount(propertyId),
    };
  }

  const row = dataStore.propertiesById.get(propertyId);
  if (!row) return null;
  return toProperty(row);
}
