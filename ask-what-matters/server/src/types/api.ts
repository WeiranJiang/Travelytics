export interface Property {
  eg_property_id: string;
  display_name: string;
  city: string;
  province: string;
  country: string;
  star_rating?: number;
  guestrating_avg_expedia: number;
  total_reviews: number;
  area_description: string;
  property_description: string;
  popular_amenities: string[];
  amenities_by_category: Partial<Record<AmenityCategory, string[]>>;
  check_in_start_time: string;
  check_in_end_time: string;
  check_out_time: string;
  check_out_policy: string;
  pet_policy: string;
  children_and_extra_bed_policy: string;
  check_in_instructions: string;
  know_before_you_go: string;
  hero_image_url: string;
  gallery_image_urls: string[];
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

export interface CategoryBreakdownScores {
  cleanliness: number;
  staff_and_service: number;
  amenities: number;
  property_conditions: number;
  eco_friendliness: number;
}

export interface CategoryInputRatings {
  cleanliness: number;
  staff_and_service: number;
  amenities: number;
  property_conditions: number;
  eco_friendliness: number;
}

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

export interface Review {
  id: string;
  eg_property_id: string;
  acquisition_date: string;
  lob: string;
  rating: number;
  rating_detail?: RatingDetail;
  review_title: string;
  review_text: string;
  author_initial?: string;
}

export interface SmartQuestion {
  id: string;
  text: string;
  reason: string;
  target_gap: string;
  category: string;
  impact_preview_template?: string;
  confidence?: number;
  signals?: QuestionSignals;
}

export interface QuestionSignals {
  freshness_days?: number;
  coverage_count?: number;
  contradiction_score?: number;
  staleness_ratio?: number;
  qualified_user_count?: number;
}

export interface ReviewSubmission {
  property_id: string;
  overall_rating: number;
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

export interface SignInResponse {
  user: User;
  token: string;
}
