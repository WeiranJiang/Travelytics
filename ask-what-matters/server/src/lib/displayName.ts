export function buildDisplayName(args: {
  city?: string;
  country?: string;
  starRating?: number;
  propertyDescription?: string;
}): string {
  const { city, country, starRating } = args;
  const location = [city, country].filter(Boolean).join(', ');
  if (starRating && location) return `${starRating}-star hotel in ${location}`;
  if (location) return `Hotel in ${location}`;
  return 'Hotel';
}
