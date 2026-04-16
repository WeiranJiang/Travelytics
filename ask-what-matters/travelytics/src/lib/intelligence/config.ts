export const HALF_LIFE_DAYS: Record<string, number> = {
    roomcleanliness: 60,
    service: 90,
    checkin: 90,
    communication: 90,
    valueformoney: 120,
    hotelcondition: 180,
    roomcomfort: 180,
    roomamenitiesscore: 180,
    onlinelisting: 180,
    roomquality: 365,
    ecofriendliness: 365,
    location: 730,
    convenienceoflocation: 730,
    neighborhoodsatisfaction: 730,
    overall: 120,
};

export const DIMENSION_WEIGHTS: Record<
    string,
    { coverage: number; staleness: number }
> = {
    roomcleanliness: { coverage: 0.45, staleness: 0.55 },
    service: { coverage: 0.45, staleness: 0.55 },
    checkin: { coverage: 0.45, staleness: 0.55 },
    communication: { coverage: 0.45, staleness: 0.55 },
    valueformoney: { coverage: 0.5, staleness: 0.5 },
    hotelcondition: { coverage: 0.6, staleness: 0.4 },
    roomcomfort: { coverage: 0.55, staleness: 0.45 },
    roomamenitiesscore: { coverage: 0.55, staleness: 0.45 },
    onlinelisting: { coverage: 0.55, staleness: 0.45 },
    roomquality: { coverage: 0.6, staleness: 0.4 },
    ecofriendliness: { coverage: 0.65, staleness: 0.35 },
    location: { coverage: 0.75, staleness: 0.25 },
    convenienceoflocation: { coverage: 0.75, staleness: 0.25 },
    neighborhoodsatisfaction: { coverage: 0.75, staleness: 0.25 },
    overall: { coverage: 0.5, staleness: 0.5 },
};

export const DIMENSIONS = Object.keys(HALF_LIFE_DAYS);

export const TOPIC_TAXONOMY = [
    "cleanliness",
    "noise",
    "service",
    "checkin",
    "wifi",
    "parking",
    "breakfast",
    "pet_friendly",
    "family",
    "comfort",
    "location",
    "safety",
    "value",
];

export const FINAL_WEIGHTS = {
    temporal: 0.25,
    freetext: 0.2,
    cluster: 0.15,
    controversy: 0.2,
    listing: 0.1,
    drift: 0.1,
};

export const AMENITY_THRESHOLDS: Record<string, number> = {
    spa: 0.03,
    pool: 0.05,
    gym: 0.05,
    breakfast: 0.08,
    parking: 0.08,
    restaurant: 0.05,
    bar: 0.03,
    wifi: 0.08,
    pet_friendly: 0.03,
    accessibility: 0.02,
};

export const AMENITY_CHECK: Record<
    string,
    { reviewKeywords: string[]; descFields: string[] }
> = {
    spa: {
        reviewKeywords: ["spa", "massage", "sauna"],
        // Check dedicated spa field AND popularAmenitiesList (where spa typically appears)
        descFields: ["propertyAmenitySpa", "popularAmenitiesList"],
    },
    pool: {
        reviewKeywords: ["pool", "swimming"],
        descFields: ["propertyAmenityOutdoor", "popularAmenitiesList"],
    },
    gym: {
        reviewKeywords: ["gym", "fitness"],
        descFields: ["propertyAmenityThingsToDo", "popularAmenitiesList"],
    },
    breakfast: {
        reviewKeywords: ["breakfast", "buffet"],
        descFields: ["propertyAmenityFoodAndDrink", "popularAmenitiesList"],
    },
    parking: {
        reviewKeywords: ["parking", "valet"],
        // Check dedicated parking field AND popularAmenitiesList
        descFields: ["propertyAmenityParking", "popularAmenitiesList"],
    },
    restaurant: {
        reviewKeywords: ["restaurant", "dining"],
        // Check food & drink field AND popularAmenitiesList
        descFields: ["propertyAmenityFoodAndDrink", "popularAmenitiesList"],
    },
    bar: {
        reviewKeywords: ["bar", "cocktail"],
        // Check food & drink field AND popularAmenitiesList
        descFields: ["propertyAmenityFoodAndDrink", "popularAmenitiesList"],
    },
    wifi: {
        reviewKeywords: ["wifi", "wi-fi", "internet"],
        // Check internet amenity field AND popularAmenitiesList
        descFields: ["propertyAmenityInternet", "popularAmenitiesList"],
    },
    pet_friendly: {
        reviewKeywords: ["pet", "pets", "dog", "cat"],
        descFields: ["petPolicy"],
    },
    accessibility: {
        reviewKeywords: ["wheelchair", "accessible", "accessibility"],
        descFields: ["propertyAmenityAccessibility"],
    },
};