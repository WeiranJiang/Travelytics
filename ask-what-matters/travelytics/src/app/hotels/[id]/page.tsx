import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyById } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { heroImageUrl, GALLERY_IMAGES } from "@/lib/images";
import {
  getDisplayName,
  parseAmenities,
  formatAmenity,
  ratingLabel,
  computeDimRatings,
  overallStars,
  formatReviewDate,
  formatListString,
} from "@/lib/property-helpers";
import { PropertyActions } from "./PropertyActions";

const RATING_DIMS: { key: string; label: string }[] = [
  { key: "roomcleanliness",    label: "Cleanliness" },
  { key: "service",            label: "Staff & service" },
  { key: "roomamenitiesscore", label: "Amenities" },
  { key: "hotelcondition",     label: "Property conditions & facilities" },
  { key: "ecofriendliness",    label: "Eco-friendliness" },
];

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: pid } = await params;
  const property = await getPropertyById(pid);
  if (!property) notFound();

  const displayName = getDisplayName(property);
  const amenities   = parseAmenities(property.popularAmenitiesList);
  const ratings     = computeDimRatings(property.reviews);
  const guestScore  = property.guestRatingAvgExpedia;
  const reviewCount = property.reviews.length;

  // Only show 20 reviews in the UI
  const displayReviews = property.reviews.slice(0, 20);

  // Gap count for FreshnessIndicator
  const topGaps = await prisma.propertyFinalGap.findMany({
    where: { propertyId: pid, finalScore: { gt: 0.4 } },
    take: 10,
  });
  const gapCount = topGaps.length;

  const heroImg = heroImageUrl(pid);

  return (
    <div className="min-h-screen bg-white">

      {/* Breadcrumb */}
      <div className="border-b border-divider px-6 py-3 flex items-center gap-1.5 text-sm text-ink-muted">
        <Link href="/" className="hover:text-action hover:underline">Home</Link>
        {property.country && <><span>›</span><span>{property.country}</span></>}
        {property.city    && <><span>›</span><span>{property.city}</span></>}
        <span>›</span>
        <span className="text-navy truncate">{displayName}</span>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-10">

        {/* ── Photo grid: 1 large left + 2×2 right ── */}
        <section>
          <div className="flex gap-1 h-80 overflow-hidden rounded-xl">
            {/* Hero (left half) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImg}
              alt={displayName}
              className="w-1/2 h-full object-cover flex-shrink-0"
            />
            {/* 2×2 grid (right half) */}
            <div className="w-1/2 grid grid-cols-2 gap-1">
              {GALLERY_IMAGES.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" className="w-full h-full object-cover" />
              ))}
            </div>
          </div>

          {/* "One Key member price" + Share / Save */}
          <div className="mt-5 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-full bg-brand-yellow px-2.5 py-0.5 text-xs font-bold text-navy">
                  One Key member price
                </span>
              </div>
              {/* Hotel name — display_name style */}
              <h1 className="text-3xl font-bold text-navy">{displayName}</h1>
              {/* Location */}
              <div className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{[property.city, property.province, property.country].filter(Boolean).join(", ")}</span>
              </div>
            </div>
            {/* Share + Save */}
            <PropertyActions propertyId={pid} />
          </div>

          {/* ScoreBadge + FreshnessIndicator */}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            {guestScore && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center bg-[#191E3B] text-white font-bold text-xl rounded-md w-14 h-12 tabular-nums">
                  {guestScore.toFixed(1)}
                </div>
                <div>
                  <div className="font-semibold text-navy">{ratingLabel(guestScore)}</div>
                  <div className="text-sm text-ink-muted">{reviewCount.toLocaleString()} reviews</div>
                </div>
              </div>
            )}
            {/* FreshnessIndicator */}
            {gapCount === 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-positive/10 text-positive px-3 py-1 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Info verified recently
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-yellow bg-brand-yellow/30 text-navy px-3 py-1 text-xs font-medium">
                <svg className="w-3.5 h-3.5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {gapCount} detail{gapCount > 1 ? "s" : ""} may need refreshing
              </span>
            )}
          </div>
        </section>

        {/* ── About this property + Policy sidebar ── */}
        <section className="grid md:grid-cols-[2fr_1fr] gap-8">
          <div>
            <h2 className="text-2xl font-bold text-navy">About this property</h2>
            <p className="mt-3 text-navy leading-relaxed">
              {property.propertyDescription || "No description available."}
            </p>
          </div>
          <div className="rounded-lg border border-divider p-5 text-sm space-y-4 h-fit">
            {property.checkInStartTime && (
              <div>
                <div className="font-bold text-navy">Check-in</div>
                <div className="text-ink-muted mt-0.5">
                  {property.checkInStartTime}
                  {property.checkInEndTime ? ` – ${property.checkInEndTime}` : ""}
                </div>
              </div>
            )}
            {property.checkOutTime && (
              <div>
                <div className="font-bold text-navy">Check-out</div>
                <div className="text-ink-muted mt-0.5">{property.checkOutTime}</div>
              </div>
            )}
            {property.petPolicy && (
              <div>
                <div className="font-bold text-navy">Pets</div>
                <div className="text-ink-muted mt-0.5 line-clamp-4 leading-snug">{formatListString(property.petPolicy)}</div>
              </div>
            )}
          </div>
        </section>

        {/* ── Popular amenities — exactly matching photo 1 ── */}
        {amenities.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-navy">Popular amenities</h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2">
              {amenities.map((a) => (
                <li key={a} className="flex items-center gap-2 text-navy">
                  <svg className="w-4 h-4 text-positive shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{formatAmenity(a)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Guest rating breakdown — navy bars, matching photo 1 ── */}
        <section>
          <h2 className="text-2xl font-bold text-[#191E3B]">Guest rating breakdown</h2>
          <div className="mt-4 space-y-3">
            {RATING_DIMS.map(({ key, label }) => {
              const val = ratings[key as keyof typeof ratings];
              const pct = val != null ? Math.min((val / 10) * 100, 100) : 0;
              return (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-60 text-sm font-medium text-[#191E3B] shrink-0">{label}</div>
                  <div className="flex-1 h-2 bg-[#EFF3F7] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#191E3B] rounded-full"
                      style={{ width: `${pct.toFixed(0)}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-sm font-bold text-[#191E3B] tabular-nums">
                    {val != null ? val.toFixed(1) : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Guest reviews — actual CSV content, matching photo 1 ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-navy">Guest reviews</h2>
            <Link
              href={`/hotels/${pid}/review`}
              className="inline-flex items-center justify-center font-medium rounded-full bg-action text-white hover:bg-action-hover px-5 py-2.5 text-sm transition-colors"
            >
              Leave a review
            </Link>
          </div>

          {displayReviews.length === 0 ? (
            <p className="text-ink-muted text-sm italic">No reviews yet — be the first.</p>
          ) : (
            <div className="space-y-0">
          {displayReviews.filter(r => {
            const raw = r.reviewText?.trim() ?? "";
            return raw && raw !== "—" && raw !== "–" && raw !== "-";
          }).map((r, i) => {
            const initial = String.fromCharCode(65 + (i % 26));
            const stars   = overallStars(r.rating);
            // Use translated fallback, or original if none exists
            const text    = r.translatedReviewText ?? r.reviewText ?? "";
            const title   = r.translatedReviewTitle ?? r.reviewTitle ?? "";
            
            return (
              <article key={r.id} className="border-b border-divider py-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  {/* Avatar — circle with letter */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-contrast text-sm font-bold text-navy">
                    {initial}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-navy">Guest {initial}.</div>
                        <div className="text-xs text-ink-muted">{formatReviewDate(r.acquisitionDate)}</div>
                      </div>
                      {/* Gold stars */}
                      {stars > 0 && (
                        <div className="text-base shrink-0" aria-label={`${stars} out of 5 stars`}>
                          <span className="text-[#FFB800]">{"★".repeat(stars)}</span>
                          <span className="text-[#DFE0E4]">{"☆".repeat(5 - stars)}</span>
                        </div>
                      )}
                    </div>
                    {/* Actual review text from CSV */}
                    {title && (
                      <h3 className="mt-2 font-semibold text-navy">{title}</h3>
                    )}
                    <p className="mt-1 text-navy leading-relaxed">{text}</p>
                    
                    {/* Show original language marker if translated */}
                    {r.translationStatus === "translated" && r.detectedLanguage && r.detectedLanguage !== "eng" && (
                      <p className="mt-3 text-xs italic text-ink-muted text-right">
                        Translated from original review
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}