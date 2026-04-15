/**
 * Hand-crafted smart questions per property, anchored in each property's
 * real amenities / location / age-of-reviews. When the Node backend is wired
 * up, it will replace this with live gap-detection output.
 *
 * Every question includes `signals` — the numerical evidence behind it.
 * These drive the "why now, why this property" explainability story and
 * power the admin dashboard's uncertain-question inspector.
 */

import type { SmartQuestion } from './types';

export const SMART_QUESTIONS: Record<string, SmartQuestion[]> = {
  'prop-01': [
    {
      id: 'prop-01-sq1',
      text: 'The listing mentions no elevator — did the stairs affect your stay with luggage?',
      reason:
        'Accessibility is flagged in the listing ("this property does not have elevators") but no review in the last 12 months has confirmed how it plays out in practice. Future travelers with mobility or luggage needs will want fresh context.',
      target_gap: 'accessibility_stairs',
      category: 'Accessibility',
      confidence: 0.84,
      signals: {
        freshness_days: 384,
        coverage_count: 0,
        staleness_ratio: 2.1,
        qualified_user_count: 6,
      },
    },
    {
      id: 'prop-01-sq2',
      text: 'Did you try the free buffet breakfast, and does it feel different from older reviews?',
      reason:
        'Breakfast is a popular amenity but the last detailed review mentioning it is over a year old. Italian breakfast offerings change seasonally.',
      target_gap: 'breakfast_current',
      category: 'Food & drink',
      confidence: 0.78,
      signals: {
        freshness_days: 412,
        coverage_count: 2,
        staleness_ratio: 1.1,
        qualified_user_count: 8,
      },
    },
  ],
  'prop-02': [
    {
      id: 'prop-02-sq1',
      text: 'The resort has a full-service spa — were any spa areas closed or under renovation during your visit?',
      reason:
        'Spa amenities have a short freshness half-life and with 1000+ reviews the signal gets buried. Recent travelers give us the clearest current picture.',
      target_gap: 'spa_status',
      category: 'Spa',
      confidence: 0.91,
      signals: {
        freshness_days: 47,
        coverage_count: 3,
        contradiction_score: 0.42,
        staleness_ratio: 0.52,
        qualified_user_count: 14,
      },
    },
    {
      id: 'prop-02-sq2',
      text: 'Did you use the 2 outdoor pools — were both open and in good condition?',
      reason:
        'Colorado climate means outdoor pool seasonality matters. No review in the last 3 months specifies which pools were operational.',
      target_gap: 'pool_availability',
      category: 'Pool',
      confidence: 0.82,
      signals: {
        freshness_days: 118,
        coverage_count: 1,
        contradiction_score: 0.31,
        staleness_ratio: 1.3,
        qualified_user_count: 22,
      },
    },
  ],
  'prop-03': [
    {
      id: 'prop-03-sq1',
      text: "Only 8 reviews exist for this hotel — anything you'd want a future traveler to know that isn't covered in the listing?",
      reason:
        'Low review volume means sparse coverage. An open-ended prompt efficiently captures high-value information.',
      target_gap: 'low_coverage_general',
      category: 'General',
      confidence: 0.66,
      signals: {
        freshness_days: 130,
        coverage_count: 8,
        staleness_ratio: 1.4,
        qualified_user_count: 2,
      },
    },
  ],
  'prop-04': [
    {
      id: 'prop-04-sq1',
      text: 'How was the Wi-Fi reliability during your stay — fast enough for video calls?',
      reason:
        "Wi-Fi quality in Costa Rica varies widely and isn't scored in the structured review fields. This is a high-decision-impact gap for remote workers.",
      target_gap: 'wifi_quality',
      category: 'Internet',
      confidence: 0.72,
      signals: {
        freshness_days: 245,
        coverage_count: 0,
        staleness_ratio: 0.67,
        qualified_user_count: 7,
      },
    },
  ],
  'prop-05': [
    {
      id: 'prop-05-sq1',
      text: 'Did you notice any recent refresh or renovation to the rooms or common areas?',
      reason:
        'Property conditions score (7.6) is the weakest category here and trending down slightly across the last year of reviews.',
      target_gap: 'property_conditions_trend',
      category: 'Property conditions',
      confidence: 0.75,
      signals: {
        freshness_days: 164,
        coverage_count: 4,
        contradiction_score: 0.28,
        staleness_ratio: 1.82,
        qualified_user_count: 9,
      },
    },
  ],
  'prop-06': [
    {
      id: 'prop-06-sq1',
      text: 'Bangkok traffic varies a lot — how long did it actually take to reach nearby attractions from the hotel?',
      reason:
        'Location convenience has 0-rated entries in most reviews, and no free-text review mentions actual travel times. Future travelers plan around this.',
      target_gap: 'transit_times',
      category: 'Location',
      confidence: 0.74,
      signals: {
        freshness_days: 86,
        coverage_count: 1,
        staleness_ratio: 0.96,
        qualified_user_count: 5,
      },
    },
  ],
  'prop-07': [
    {
      id: 'prop-07-sq1',
      text: 'Frisco winters can affect outdoor amenities — were any facilities closed or limited during your stay?',
      reason:
        'Seasonal amenity availability matters in Colorado mountain destinations. No review in the last 60 days mentions winter operations.',
      target_gap: 'winter_operations',
      category: 'Seasonality',
      confidence: 0.8,
      signals: {
        freshness_days: 70,
        coverage_count: 2,
        staleness_ratio: 0.78,
        qualified_user_count: 11,
      },
    },
  ],
  'prop-08': [
    {
      id: 'prop-08-sq1',
      text: 'Was the parking situation straightforward, or did you run into surprises?',
      reason:
        "Parking is listed but not well covered in recent reviews — and Monterey's parking context is tricky. High decision-impact for road-trippers.",
      target_gap: 'parking_experience',
      category: 'Parking',
      confidence: 0.7,
      signals: {
        freshness_days: 185,
        coverage_count: 3,
        staleness_ratio: 1.03,
        qualified_user_count: 13,
      },
    },
  ],
  'prop-09': [
    {
      id: 'prop-09-sq1',
      text: 'What did you think of the noise level — inside the rooms and at night?',
      reason:
        "Rome city-center hotels have highly variable noise profiles. No recent review scores or describes noise, but it's a top decision factor for travelers comparing central Rome options.",
      target_gap: 'noise_level',
      category: 'Comfort',
      confidence: 0.88,
      signals: {
        freshness_days: 62,
        coverage_count: 4,
        contradiction_score: 0.55,
        staleness_ratio: 0.69,
        qualified_user_count: 31,
      },
    },
  ],
  'prop-10': [
    {
      id: 'prop-10-sq1',
      text: "Only 10 reviews for this property — anything surprising, good or bad, that wasn't in the listing?",
      reason:
        'Very low review volume. An open prompt captures the highest-value observation without constraining the user.',
      target_gap: 'low_coverage_general',
      category: 'General',
      confidence: 0.64,
      signals: {
        freshness_days: 620,
        coverage_count: 10,
        staleness_ratio: 3.4,
        qualified_user_count: 1,
      },
    },
  ],
  'prop-11': [
    {
      id: 'prop-11-sq1',
      text: 'The listing mentions proximity to the racetrack — did you experience event-day crowds or noise?',
      reason:
        "Event-driven environment (Los Alamitos racetrack nearby) affects the stay experience in a way static descriptions can't capture. Recent reviewers during event days provide unique value.",
      target_gap: 'event_impact',
      category: 'Location',
      confidence: 0.69,
      signals: {
        freshness_days: 68,
        coverage_count: 0,
        staleness_ratio: 0.76,
        qualified_user_count: 9,
      },
    },
  ],
  'prop-12': [
    {
      id: 'prop-12-sq1',
      text: 'Property conditions scored lower than average here — was there anything specific that stood out (positive or negative)?',
      reason:
        "Property conditions score is 6.7 (vs. 8.5 city average). We need specific signals to know whether there's a renovation opportunity or a persistent issue.",
      target_gap: 'property_conditions_specifics',
      category: 'Property conditions',
      confidence: 0.81,
      signals: {
        freshness_days: 178,
        coverage_count: 5,
        contradiction_score: 0.47,
        staleness_ratio: 1.98,
        qualified_user_count: 6,
      },
    },
  ],
  'prop-13': [
    {
      id: 'prop-13-sq1',
      text: 'Guest reviews have trended lower recently — did anything about the property feel different from what the listing describes?',
      reason:
        'Average rating (6.6) is the lowest in the set and eco-friendliness/property conditions are both under 7. A single honest answer helps disambiguate whether the listing is outdated or the experience has declined.',
      target_gap: 'listing_accuracy',
      category: 'General',
      confidence: 0.76,
      signals: {
        freshness_days: 68,
        coverage_count: 9,
        contradiction_score: 0.38,
        staleness_ratio: 0.76,
        qualified_user_count: 18,
      },
    },
  ],
};
