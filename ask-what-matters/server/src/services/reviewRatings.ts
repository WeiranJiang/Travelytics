import type { CategoryBreakdownScores, RatingDetail } from '../types/api';

type RawRatingValue = number | string | null | undefined;
export type RawRatingDetail = Record<string, RawRatingValue>;

function numberOrZero(value: RawRatingValue): number {
  const normalized = typeof value === 'string' ? Number(value) : value ?? 0;
  return Number.isFinite(normalized) ? Number(normalized) : 0;
}

export function parseRatingDetail(raw?: string): RawRatingDetail {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as RawRatingDetail;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function normalizeRatingDetail(detail: RawRatingDetail): RatingDetail {
  return {
    overall: numberOrZero(detail.overall),
    roomcleanliness: numberOrZero(detail.roomcleanliness),
    service: numberOrZero(detail.service),
    roomcomfort: numberOrZero(detail.roomcomfort),
    hotelcondition: numberOrZero(detail.hotelcondition),
    roomquality: numberOrZero(detail.roomquality),
    convenienceoflocation: numberOrZero(detail.convenienceoflocation),
    neighborhoodsatisfaction: numberOrZero(detail.neighborhoodsatisfaction),
    valueformoney: numberOrZero(detail.valueformoney),
    roomamenitiesscore: numberOrZero(detail.roomamenitiesscore),
    communication: numberOrZero(detail.communication),
    ecofriendliness: numberOrZero(detail.ecofriendliness),
    checkin: numberOrZero(detail.checkin),
    onlinelisting: numberOrZero(detail.onlinelisting),
    location: numberOrZero(detail.location),
  };
}

function meanIgnoreZeros(values: number[]): number | undefined {
  const filtered = values.filter((value) => value > 0);
  if (filtered.length === 0) return undefined;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

export function mapReviewToUiCategories(detail: RawRatingDetail): Partial<CategoryBreakdownScores> {
  const rating = normalizeRatingDetail(detail);
  const cleanliness = rating.roomcleanliness;
  const staffAndService = meanIgnoreZeros([
    rating.service,
    rating.communication,
    rating.checkin,
  ]);
  const amenities = rating.roomamenitiesscore;
  const propertyConditions = meanIgnoreZeros([
    rating.hotelcondition,
    rating.roomcomfort,
    rating.roomquality,
  ]);
  const ecoFriendliness = rating.ecofriendliness;

  return {
    cleanliness: cleanliness > 0 ? cleanliness * 2 : undefined,
    staff_and_service: staffAndService ? staffAndService * 2 : undefined,
    amenities: amenities > 0 ? amenities * 2 : undefined,
    property_conditions: propertyConditions ? propertyConditions * 2 : undefined,
    eco_friendliness: ecoFriendliness > 0 ? ecoFriendliness * 2 : undefined,
  };
}

export function emptyCategoryRatings(): CategoryBreakdownScores {
  return {
    cleanliness: 0,
    staff_and_service: 0,
    amenities: 0,
    property_conditions: 0,
    eco_friendliness: 0,
  };
}

export function aggregateCategoryRatings(
  details: RawRatingDetail[],
): Partial<CategoryBreakdownScores> {
  const sums: Partial<Record<keyof CategoryBreakdownScores, number>> = {};
  const counts: Partial<Record<keyof CategoryBreakdownScores, number>> = {};

  for (const detail of details) {
    const mapped = mapReviewToUiCategories(detail);
    for (const [key, value] of Object.entries(mapped) as [
      keyof CategoryBreakdownScores,
      number | undefined,
    ][]) {
      if (value != null) {
        sums[key] = (sums[key] ?? 0) + value;
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }
  }

  const result: Partial<CategoryBreakdownScores> = {};
  for (const key of Object.keys(sums) as (keyof CategoryBreakdownScores)[]) {
    const sum = sums[key];
    const count = counts[key];
    if (sum != null && count) {
      result[key] = Number((sum / count).toFixed(1));
    }
  }

  return result;
}
