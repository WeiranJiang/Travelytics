import type { Review, ReviewSubmission, SubmitReviewResult } from '../types/api';

const submittedReviewsByPropertyId = new Map<string, Review[]>();

export function getSubmittedReviews(propertyId: string) {
  return submittedReviewsByPropertyId.get(propertyId) ?? [];
}

export function getSubmittedReviewCount(propertyId: string) {
  return getSubmittedReviews(propertyId).length;
}

export function submitReview(
  payload: ReviewSubmission,
  options?: { authorInitial?: string },
): SubmitReviewResult {
  const answeredKeys = Object.keys(payload.smart_question_answers ?? {});
  const firstAnswer = Object.values(payload.smart_question_answers ?? {})[0];

  const reviewId = `review-${Date.now()}`;
  const newReview: Review = {
    id: reviewId,
    eg_property_id: payload.property_id,
    acquisition_date: new Date().toISOString().slice(0, 10),
    lob: 'HOTEL',
    rating: payload.overall_rating,
    review_title: payload.review_title,
    review_text:
      payload.review_text +
      (firstAnswer ? `\n\nUpdate from this guest: ${firstAnswer}` : ''),
    author_initial: options?.authorInitial ?? 'G',
  };

  const existing = submittedReviewsByPropertyId.get(payload.property_id) ?? [];
  submittedReviewsByPropertyId.set(payload.property_id, [newReview, ...existing]);

  return {
    review_id: reviewId,
    insight_preview: firstAnswer
      ? `Guests recently noted: ${firstAnswer}`
      : 'Guests recently shared updated feedback about this property.',
    fields_updated: answeredKeys.length > 0 ? answeredKeys : ['recent_guest_insight'],
  };
}
