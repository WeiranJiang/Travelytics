"use client";

import { useFavorites } from "@/lib/useFavorites";

export function PropertyActions({ propertyId }: { propertyId: string }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const active = isFavorite(propertyId);

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button className="inline-flex items-center gap-1.5 border border-divider rounded-full px-3 py-1.5 text-sm font-medium text-navy hover:bg-surface-contrast transition-colors" onClick={() => alert("Share link copied!")}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>
      <button 
        onClick={(e) => toggleFavorite(propertyId, e)}
        className="inline-flex items-center gap-1.5 border border-divider rounded-full px-3 py-1.5 text-sm font-medium text-navy hover:bg-surface-contrast transition-colors"
      >
        <svg className={`w-4 h-4 ${active ? 'text-red-500 fill-red-500' : 'text-navy'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {active ? 'Saved' : 'Save'}
      </button>
    </div>
  );
}
