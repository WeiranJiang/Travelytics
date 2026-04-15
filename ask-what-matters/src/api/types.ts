/**
 * API CONTRACT — shared between frontend and Node.js backend.
 *
 * Shapes align with the hackathon-provided dataset:
 *   - Description_PROC.csv (13 properties, amenity subcategories)
 *   - Reviews_PROC.csv (~6000 reviews, JSON rating blob with 15 sub-categories)
 *
 * The real data has quirks (masked property names, HTML-in-descriptions,
 * M/D/YY dates, blank fields). The backend is expected to clean these
 * before handing data to the UI.
 */

/** Maps to Description_PROC.csv. */
export interface Property {
  eg_property_id: string;
  /** Synthetic display name — real names are masked as "|MASK|" in the CSV.
   *  Backend generates something friendly like "Boutique Hotel in Pompei, Italy". */
  display_name: string;
  city: string;
  province: string;
  country: string;
  /** 1–5. May be undefined (some rows in the CSV are blank). */
  star_rating?: number;
  /** Average Expedia guest rating, 0–10. */
  guestrating_avg_expedia: number;
  total_reviews: number;

  /** `area_description` column, HTML stripped. */
  area_description: string;
  /** `property_description` column, HTML stripped. */
  property_description: string;

  /** `popular_amenities_list` — normalized amenity keys. */
  popular_amenities: string[];
  /** Structured amenities by CSV subcategory column. Keys match the 14 `property_amenity_*` columns. */
  amenities_by_category: Partial<Record<AmenityCategory, string[]>>;

  check_in_start_time: string;
  check_in_end_time: string;
  check_out_time: string;
  check_out_policy: string;
  pet_policy: string;
  children_and_extra_bed_policy: string;
  check_in_instructions: string;
  know_before_you_go: string;

  /** Not in the CSV — backend supplies placeholders (Unsplash etc.) for the demo. */
  hero_image_url: string;
  gallery_image_urls: string[];

  /** Aggregated for the UI's 5-category breakdown (0–10 scale).
   *  Computed from the 15 sub-category fields in each review's rating JSON.
   *  See HANDOFF.md §"Rating aggregation". */
  category_ratings: CategoryBreakdownScores;
}

export type AmenityCategory =
  | 'accessibility'
  | 'activities_nearby'
  | 'business_services'
  | 'conveniences'
  | 'family_friendly'
  | 'food_and_drink'
  | 'guest_services'
  | 'internet'
  | 'langs_spoken'
  | 'more'
  | 'outdoor'
  | 'parking'
  | 'spa'
  | 'things_to_do';

/** The five category buckets shown in the UI (0–10 scale, to match Expedia display). */
export interface CategoryBreakdownScores {
  cleanliness: number;
  staff_and_service: number;
  amenities: number;
  property_conditions: number;
  eco_friendliness: number;
}

/** Reviewer's input ratings, 1–5 scale (matches Expedia's visible review form). */
export interface CategoryInputRatings {
  cleanliness: number;
  staff_and_service: number;
  amenities: number;
  property_conditions: number;
  eco_friendliness: number;
}

/** All 15 sub-category fields from the CSV rating JSON. 0 = not rated. */
export interface RatingDetail {
  overall: number;
  roomcleanliness: number;
  service: number;
  roomcomfort: number;
  hotelcondition: number;
  roomquality: number;
  convenienceoflocation: number;
  neighborhoodsatisfaction: number;
  valueformoney: number;
  roomamenitiesscore: number;
  communication: number;
  ecofriendliness: number;
  checkin: number;
  onlinelisting: number;
  location: number;
}

/** Maps to Reviews_PROC.csv. The CSV has no author/trip/verified fields;
 *  those are optional and the backend may fabricate or omit them. */
export interface Review {
  id: string;
  eg_property_id: string;
  /** ISO format. Backend parses the CSV's `M/D/YY` into ISO. */
  acquisition_date: string;
  lob: string; // "HOTEL" for all rows in this dataset
  /** Overall rating (1–5), extracted from the rating JSON's `overall` field. */
  rating: number;
  /** Full 15-key rating blob from the CSV. Useful for gap-detection calls. */
  rating_detail?: RatingDetail;
  review_title: string;
  review_text: string;
  /** Optional: backend may anonymize with an initial like "S." */
  author_initial?: string;
}

/**
 * AI-generated follow-up question for this specific property.
 * The `reason` field is load-bearing — it's the explainability story judges want.
 */
export interface SmartQuestion {
  id: string;
  text: string;
  reason: string;
  target_gap: string;
  category: string;
  impact_preview_template?: string;
  /** Backend's confidence this question is worth asking (0–1). */
  confidence?: number;
  /**
   * Numerical signals the gap-detection pipeline used to pick this question.
   * Surfacing them gives judges concrete evidence behind the "why this, why now" story.
   */
  signals?: QuestionSignals;
}

export interface QuestionSignals {
  /** Days since the most recent review substantively mentioned the target topic. */
  freshness_days?: number;
  /** How many reviews in the last 6 months mention this topic. */
  coverage_count?: number;
  /**
   * Sentiment contradiction score (0 = unanimous, 1 = fully split).
   * High values flag topics where recent reviewers disagree.
   */
  contradiction_score?: number;
  /**
   * Category-aware freshness ratio: days_since / half_life. >1 means stale.
   */
  staleness_ratio?: number;
  /** Count of travelers currently qualified to answer this question. */
  qualified_user_count?: number;
}

/** Reviewer's submission. */
export interface ReviewSubmission {
  property_id: string;
  overall_rating: number; // 1–5
  category_ratings: CategoryInputRatings;
  review_title: string;
  review_text: string;
  smart_question_answers: Record<string, string>;
}

export interface SubmitReviewResult {
  review_id: string;
  insight_preview: string;
  fields_updated: string[];
}

/** A signed-in user. Password is never exposed through the API. */
export interface User {
  username: string;
  full_name: string;
  initial: string;
  city: string;
  role?: 'user' | 'admin';
}

export interface SignInRequest {
  username: string;
  password: string;
}

/** Returned by POST /auth/sign-in. The token is attached to subsequent requests
 *  via the `Authorization: Bearer <token>` header. */
export interface SignInResponse {
  user: User;
  token: string;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };
