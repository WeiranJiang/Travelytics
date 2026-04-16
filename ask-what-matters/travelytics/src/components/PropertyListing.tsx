"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Property } from "@prisma/client";
import { heroImageUrl } from "@/lib/images";
import {
  getDisplayName,
  formatAmenity,
  parseAmenities,
  ratingLabel,
} from "@/lib/property-helpers";
import { useFavorites } from "@/lib/useFavorites";

// ── Helpers ──────────────────────────────────────────────────────────────────
const priceOf = (p: Property) =>
  Math.round(120 + (p.guestRatingAvgExpedia ?? 5) * 30);

type SortKey = "recommended" | "rating" | "price_low" | "price_high";

// ── Property Card — vertical, 3-per-row ─────────────────────────────────────
function PropertyCard({ property }: { property: Property }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const displayName = getDisplayName(property);
  const rating      = property.guestRatingAvgExpedia;
  const amenities   = parseAmenities(property.popularAmenitiesList);
  const price       = priceOf(property);
  const active      = isFavorite(property.egPropertyId);

  return (
    <Link
      href={`/hotels/${property.egPropertyId}`}
      className="group bg-white rounded-xl border border-divider overflow-hidden hover:shadow-float transition-shadow flex flex-col focus:outline-none focus:ring-2 focus:ring-action"
    >
      {/* Photo */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImageUrl(property.egPropertyId)}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Heart */}
        <button
          aria-label="Save"
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow"
          onClick={(e) => toggleFavorite(property.egPropertyId, e)}
        >
          <svg className={`w-4 h-4 ${active ? 'text-red-500 fill-red-500' : 'text-navy'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        {/* Star rating badge */}
        {property.starRating && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded px-2 py-0.5 text-xs font-medium text-brand-gold">
            {"★".repeat(property.starRating)}
            <span className="text-divider">{"★".repeat(5 - property.starRating)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Title */}
        <h3 className="font-bold text-navy text-sm leading-snug group-hover:text-action">
          {displayName}
        </h3>
        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-ink-muted">
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="truncate">{[property.city, property.province, property.country].filter(Boolean).join(", ")}</span>
        </div>

        {/* Top 5 amenity chips */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {amenities.slice(0, 5).map((a) => (
              <span
                key={a}
                className="text-[11px] rounded bg-surface-contrast text-navy px-1.5 py-0.5"
              >
                {formatAmenity(a)}
              </span>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Score badge + price */}
        <div className="flex items-center justify-between pt-2 border-t border-divider">
          {rating ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center bg-navy text-white font-bold text-sm rounded px-2 py-1 tabular-nums">
                {rating.toFixed(1)}
              </div>
              <div>
                <div className="text-xs font-semibold text-navy">{ratingLabel(rating)}</div>
                <div className="text-[11px] text-ink-muted">
                  {((property as any)._count?.reviews)
                    ? `${((property as any)._count?.reviews).toLocaleString()} reviews`
                    : "— reviews"}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-ink-muted">No rating yet</div>
          )}
          <div className="text-right">
            <div className="text-[11px] text-ink-muted">per night</div>
            <div className="font-bold text-navy text-sm">${price}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main listing component ────────────────────────────────────────────────────
export function PropertyListing({ properties }: { properties: Property[] }) {
  const [query,   setQuery]   = useState("");
  const [country, setCountry] = useState("All");
  const [sort,    setSort]    = useState<SortKey>("recommended");

  const countries = useMemo(
    () => ["All", ...Array.from(new Set(properties.map((p) => p.country).filter(Boolean) as string[]))],
    [properties]
  );

  const filtered = useMemo(() => {
    let out = properties;
    if (query) {
      const q = query.toLowerCase();
      out = out.filter(
        (p) =>
          getDisplayName(p).toLowerCase().includes(q) ||
          (p.city ?? "").toLowerCase().includes(q) ||
          (p.country ?? "").toLowerCase().includes(q)
      );
    }
    if (country !== "All") out = out.filter((p) => p.country === country);
    const sorted = [...out];
    if (sort === "rating")     sorted.sort((a, b) => (b.guestRatingAvgExpedia ?? 0) - (a.guestRatingAvgExpedia ?? 0));
    if (sort === "price_low")  sorted.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "price_high") sorted.sort((a, b) => priceOf(b) - priceOf(a));
    return sorted;
  }, [properties, query, country, sort]);

  return (
    <div>
      {/* ── Hero search bar ── */}
      <div className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-bold">Stays worldwide</h1>
          <p className="mt-1 text-white/70 text-sm">
            {properties.length} hotels across {countries.length - 1} countries
          </p>

          <div className="mt-6 bg-white rounded-lg p-2 flex flex-col sm:flex-row items-stretch gap-2 shadow-float max-w-3xl">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md border border-divider">
              <svg className="w-4 h-4 text-ink-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city, country, or hotel type"
                className="flex-1 bg-transparent text-navy placeholder:text-ink-muted text-sm focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-divider sm:w-48">
              <svg className="w-4 h-4 text-ink-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="flex-1 bg-transparent text-navy text-sm focus:outline-none"
              >
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="bg-action hover:bg-action-hover text-white font-medium rounded-full px-6 py-2 text-sm transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-semibold text-navy">
            {filtered.length} {filtered.length === 1 ? "property" : "properties"}
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <span>Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-white border border-divider rounded-md px-2 py-1.5 text-navy text-sm focus:outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Highest rated</option>
              <option value="price_low">Price: low → high</option>
              <option value="price_high">Price: high → low</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-lg font-semibold text-navy">No properties match.</div>
            <div className="mt-1 text-sm text-ink-muted">Try broadening your search.</div>
          </div>
        ) : (
          /* 3-per-row grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => <PropertyCard key={p.egPropertyId} property={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
