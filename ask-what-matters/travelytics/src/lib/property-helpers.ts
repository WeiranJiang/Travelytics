/**
 * Shared property helpers — display name, amenity formatting, rating labels.
 * Used by both listing and detail pages.
 */

/** Generate an Expedia-style display name from raw property fields. */
export function getDisplayName(p: {
  propertyDescription: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  starRating: number | null;
}): string {
  const loc = [p.city, p.country].filter(Boolean).join(", ");
  const desc = (p.propertyDescription ?? "").toLowerCase();

  if (!loc) return p.propertyDescription?.slice(0, 60) ?? "Hotel";

  if (desc.includes("boutique"))   return `Boutique Hotel in ${loc}`;
  if (desc.includes("resort"))     return `Resort in ${loc}`;
  if (desc.includes("villa"))      return `Villa in ${loc}`;
  if (desc.includes("hostel"))     return `Hostel in ${loc}`;
  if (desc.includes("apartment"))  return `Apartment in ${loc}`;
  if (desc.includes("inn"))        return `Inn in ${loc}`;
  if (desc.includes("lodge"))      return `Lodge in ${loc}`;
  if (p.starRating && p.starRating >= 4) return `${p.starRating}-star Hotel in ${loc}`;
  if (p.starRating && p.starRating >= 3) return `${p.starRating}-star Hotel in ${loc}`;
  return `Hotel in ${loc}`;
}

/** Convert snake_case or plain amenity string to title-case label. */
export function formatAmenity(raw: string): string {
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function parseAmenities(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p)) return p.map(String).filter(Boolean);
  } catch {}
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

/** Formats a JSON string array natively into a natural string bulleted list */
export function formatListString(raw: string | null): string {
  if (!raw) return "";
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.filter(Boolean).join(". ");
  } catch {}
  return raw;
}

/** Rating label matching Expedia's wording. */
export function ratingLabel(v: number): string {
  if (v >= 9.5) return "Exceptional";
  if (v >= 9)   return "Wonderful";
  if (v >= 8)   return "Very Good";
  if (v >= 7)   return "Good";
  if (v >= 6)   return "Fair";
  return "Okay";
}

/** Compute average ratings per dimension from review JSON blobs. */
const RATING_KEYS = [
  "roomcleanliness",
  "service",
  "roomamenitiesscore",
  "hotelcondition",
  "ecofriendliness",
] as const;

export type RatingKey = (typeof RATING_KEYS)[number];

export function computeDimRatings(
  reviews: Array<{ rating: string | null }>
): Record<RatingKey, number | null> {
  const acc: Record<string, { sum: number; count: number }> = {};
  for (const r of reviews) {
    if (!r.rating) continue;
    try {
      const parsed = JSON.parse(r.rating) as Record<string, unknown>;
      for (const key of RATING_KEYS) {
        const val = Number(parsed[key] ?? 0);
        if (val > 0) {
          acc[key] ??= { sum: 0, count: 0 };
          acc[key].sum   += val;
          acc[key].count += 1;
        }
      }
    } catch {}
  }
  return Object.fromEntries(
    RATING_KEYS.map((k) => [k, acc[k] ? acc[k].sum / acc[k].count : null])
  ) as Record<RatingKey, number | null>;
}

/** Extract overall 1-5 star rating by averaging the valid non-zero rating sections. */
export function overallStars(ratingJson: string | null): number {
  try {
    const p = JSON.parse(ratingJson ?? "{}") as Record<string, unknown>;
    let sum = 0;
    let count = 0;
    
    for (const key in p) {
      // Skip the raw 'overall' field to ensure we only average the specific sections
      if (key === "overall") continue;
      
      const val = Number(p[key]);
      if (!isNaN(val) && val > 0) {
        sum += val;
        count++;
      }
    }
    
    // If no valid sections were rated, cautiously fallback to the old 'overall'
    if (count === 0) {
      const fallback = Number(p.overall ?? 0);
      return Math.max(0, Math.min(5, Math.round(fallback)));
    }
    
    return Math.max(0, Math.min(5, Math.round(sum / count)));
  } catch {
    return 0;
  }
}



export function formatReviewDate(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
