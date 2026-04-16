export type DescriptionRow = {
  eg_property_id: string;
  guestrating_avg_expedia?: string | number | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  star_rating?: string | number | null;
  area_description?: string | null;
  property_description?: string | null;
  popular_amenities_list?: string | null;
  property_amenity_accessibility?: string | null;
  property_amenity_activities_nearby?: string | null;
  property_amenity_business_services?: string | null;
  property_amenity_conveniences?: string | null;
  property_amenity_family_friendly?: string | null;
  property_amenity_food_and_drink?: string | null;
  property_amenity_guest_services?: string | null;
  property_amenity_internet?: string | null;
  property_amenity_langs_spoken?: string | null;
  property_amenity_more?: string | null;
  property_amenity_outdoor?: string | null;
  property_amenity_parking?: string | null;
  property_amenity_spa?: string | null;
  property_amenity_things_to_do?: string | null;
  check_in_start_time?: string | null;
  check_in_end_time?: string | null;
  check_out_time?: string | null;
  check_out_policy?: string | null;
  pet_policy?: string | null;
  children_and_extra_bed_policy?: string | null;
  check_in_instructions?: string | null;
  know_before_you_go?: string | null;
};

export type ReviewRow = {
  eg_property_id: string;
  acquisition_date?: string | null;
  lob?: string | null;
  rating?: string | null;
  review_title?: string | null;
  review_text?: string | null;
};

export type ImportedReviewForScoring = {
  egPropertyId: string;
  acquisitionDate: Date | null;
  rating: string | null;
  reviewTitle: string | null;
  reviewText: string | null;
  translatedReviewTitle: string | null;
  translatedReviewText: string | null;
};

export type PropertyForScoring = {
  egPropertyId: string;
  guestRatingAvgExpedia: number | null;
  starRating: number | null;
  popularAmenitiesList: string | null;
  propertyAmenityAccessibility: string | null;
  propertyAmenityBusinessServices: string | null;
  propertyAmenityFoodAndDrink: string | null;
  propertyAmenityInternet: string | null;
  propertyAmenityOutdoor: string | null;
  propertyAmenityParking: string | null;
  propertyAmenitySpa: string | null;
  propertyAmenityThingsToDo: string | null;
  petPolicy: string | null;
  areaDescription: string | null;
  propertyDescription: string | null;
};