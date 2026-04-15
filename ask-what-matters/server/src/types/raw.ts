export interface RawDescriptionRow {
  eg_property_id: string;
  city: string;
  province: string;
  country: string;
  star_rating: string;
  guestrating_avg_expedia: string;
  area_description: string;
  property_description: string;
  popular_amenities_list: string;
  check_in_start_time?: string;
  check_in_end_time?: string;
  check_out_time?: string;
  check_out_policy?: string;
  pet_policy?: string;
  children_and_extra_bed_policy?: string;
  check_in_instructions?: string;
  know_before_you_go?: string;
  [key: string]: string | undefined;
}

export interface RawReviewRow {
  eg_property_id: string;
  acquisition_date: string;
  lob: string;
  rating: string;
  review_title: string;
  review_text: string;
  [key: string]: string;
}
