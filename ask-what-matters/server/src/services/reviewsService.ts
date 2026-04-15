import type { Review } from '../types/api';
import { parseMdyyToIso, removeMask } from '../lib/format';
import { dataStore } from './dataStore';
import { getSubmittedReviews } from './reviewSubmissionService';
import { normalizeRatingDetail, parseRatingDetail } from './reviewRatings';

export function getRecentReviews(propertyId: string, limit = 10): Review[] {
  const submitted = getSubmittedReviews(propertyId);

  if (!dataStore.hasCsvData) {
    const fallback = dataStore.fallbackReviewsByPropertyId.get(propertyId) ?? [];
    return [...submitted, ...fallback].slice(0, limit);
  }

  const reviews = dataStore.reviewsByPropertyId.get(propertyId) ?? [];

  const mapped = [...reviews]
    .sort((a, b) => {
      const da = parseMdyyToIso(a.acquisition_date) ?? '';
      const db = parseMdyyToIso(b.acquisition_date) ?? '';
      return db.localeCompare(da);
    })
    .slice(0, limit)
    .map((review, index) => {
      const ratingDetail = normalizeRatingDetail(parseRatingDetail(review.rating));
      return {
        id: `${propertyId}-${index}-${review.acquisition_date}`,
        eg_property_id: review.eg_property_id,
        acquisition_date:
          parseMdyyToIso(review.acquisition_date) ?? new Date().toISOString().slice(0, 10),
        lob: review.lob || 'HOTEL',
        rating: ratingDetail.overall || 0,
        rating_detail: ratingDetail,
        review_title: removeMask(review.review_title) || '',
        review_text: removeMask(review.review_text) || '',
        author_initial: 'G',
      } satisfies Review;
    });

  return [...submitted, ...mapped].slice(0, limit);
}
