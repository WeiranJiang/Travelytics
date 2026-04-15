import { MapPin, Heart } from 'lucide-react';
import type { Property } from '@/api/types';
import { ScoreBadge } from '@/components/ui/ScoreBadge';

export function PropertyCard({
  property,
  onSelect,
}: {
  property: Property;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="group text-left bg-white border border-divider rounded-lg overflow-hidden hover:shadow-float transition-shadow w-full flex flex-col md:flex-row focus:outline-none focus:ring-2 focus:ring-action"
    >
      <div className="relative md:w-[280px] flex-shrink-0 aspect-[4/3] md:aspect-auto">
        <img
          src={property.hero_image_url}
          alt={property.display_name}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute top-3 right-3 bg-white rounded-full p-2 hover:scale-110 transition-transform shadow-float"
          role="button"
          aria-label="Save"
        >
          <Heart size={16} className="text-navy" />
        </div>
      </div>
      <div className="flex-1 p-5 flex flex-col justify-between gap-4">
        <div>
          {property.star_rating !== undefined && (
            <div className="text-sm text-brand-gold mb-1">
              {'★'.repeat(property.star_rating)}
              <span className="text-divider">{'★'.repeat(5 - property.star_rating)}</span>
            </div>
          )}
          <h3 className="text-lg font-bold text-navy group-hover:text-action">
            {property.display_name}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
            <MapPin size={12} />
            <span>
              {[property.city, property.province, property.country].filter(Boolean).join(', ')}
            </span>
          </div>
          <p className="mt-2 text-sm text-ink-muted line-clamp-2">
            {property.area_description}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {property.popular_amenities.slice(0, 4).map((a) => (
              <span
                key={a}
                className="text-xs rounded-sm bg-surface-contrast text-navy px-2 py-0.5"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <ScoreBadge
            value={property.guestrating_avg_expedia}
            reviews={property.total_reviews}
          />
          <div className="text-right">
            <div className="text-xs text-ink-muted">per night</div>
            <div className="text-xl font-bold text-navy">
              ${Math.round(120 + property.guestrating_avg_expedia * 30)}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
