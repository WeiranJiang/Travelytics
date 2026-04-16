"use client";

import { useMemo } from "react";
import { useFavorites } from "@/lib/useFavorites";
import Link from "next/link";
import { heroImageUrl } from "@/lib/images";
import { getDisplayName, parseAmenities, formatAmenity, ratingLabel } from "@/lib/property-helpers";

// Local version of PropertyCard so we don't have circular/deep dependencies
function FavoriteCard({ property, onRemove }: { property: any, onRemove: (id: string, e: any) => void }) {
  const displayName = getDisplayName(property);
  const rating      = property.guestRatingAvgExpedia;
  const amenities   = parseAmenities(property.popularAmenitiesList);
  const price       = Math.round(120 + (rating ?? 5) * 30);

  return (
    <Link
      href={`/hotels/${property.egPropertyId}`}
      className="group bg-white rounded-xl border border-divider overflow-hidden hover:shadow-float transition-shadow flex flex-col"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImageUrl(property.egPropertyId)}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow"
          onClick={(e) => onRemove(property.egPropertyId, e)}
        >
          <svg className="w-4 h-4 text-red-500 fill-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-bold text-navy text-sm leading-snug group-hover:text-action">{displayName}</h3>
        <div className="flex items-center gap-1 text-xs text-ink-muted">
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="truncate">{[property.city, property.province, property.country].filter(Boolean).join(", ")}</span>
        </div>
      </div>
    </Link>
  );
}

export function FavoritesClient({ properties }: { properties: any[] }) {
  const { favorites, toggleFavorite } = useFavorites();
  
  const savedProperties = useMemo(() => {
    return properties.filter(p => favorites.includes(p.egPropertyId));
  }, [properties, favorites]);

  if (savedProperties.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-lg font-semibold text-navy">No saved properties yet.</div>
        <div className="mt-1 text-sm text-ink-muted">Click the heart icon on any hotel to save it here.</div>
        <Link href="/" className="mt-6 inline-block bg-action hover:bg-action-hover text-white font-medium rounded-full px-6 py-2 text-sm transition-colors">
          Explore hotels
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {savedProperties.map((p) => (
        <FavoriteCard key={p.egPropertyId} property={p} onRemove={toggleFavorite} />
      ))}
    </div>
  );
}
