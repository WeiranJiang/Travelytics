import { SMART_QUESTIONS } from '../../../src/api/data-smart-questions';
import type { SmartQuestion } from '../types/api';
import { getPropertyById } from './propertyService';

const GENERIC_QUESTION = (propertyId: string): SmartQuestion => ({
  id: `${propertyId}-breakfast`,
  text: 'How was the breakfast during your stay?',
  reason:
    'Breakfast appears in the listing, but recent reviews mention it infrequently, so updated guest feedback would improve confidence.',
  target_gap: 'breakfast_quality_current',
  category: 'Food & drink',
  confidence: 0.82,
  signals: {
    coverage_count: 1,
    freshness_days: 240,
    staleness_ratio: 1.3,
  },
});

export function getSmartQuestions(propertyId: string): SmartQuestion[] {
  const existing = SMART_QUESTIONS[propertyId];
  if (existing && existing.length > 0) return existing;

  const property = getPropertyById(propertyId);
  if (!property) return [];

  if (property.popular_amenities.some((amenity) => amenity.toLowerCase().includes('breakfast'))) {
    return [GENERIC_QUESTION(propertyId)];
  }

  return [
    {
      id: `${propertyId}-amenities`,
      text: 'Was there anything about the amenities that felt noticeably different from the listing?',
      reason:
        'This property has limited recent context about how its current amenities feel in practice, so a short fresh update would help future travelers.',
      target_gap: 'amenities_current_state',
      category: 'Amenities',
      confidence: 0.76,
      signals: {
        coverage_count: 1,
        freshness_days: 210,
        staleness_ratio: 1.1,
      },
    },
  ];
}
