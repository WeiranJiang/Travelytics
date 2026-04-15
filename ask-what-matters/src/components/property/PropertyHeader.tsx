import { MapPin, Share2, Heart } from 'lucide-react';
import type { Property } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { Badge } from '@/components/ui/Badge';

export function PropertyHeader({ property }: { property: Property }) {
  return (
    <section>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-lg overflow-hidden">
        <img
          src={property.hero_image_url}
          alt={property.display_name}
          className="col-span-2 row-span-2 w-full h-full object-cover"
        />
        {property.gallery_image_urls.slice(0, 4).map((src, i) => (
          <img key={i} src={src} alt="" className="w-full h-full object-cover" />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge tone="brand">One Key member price</Badge>
            {property.star_rating !== undefined && (
              <span className="text-sm text-ink-muted">
                {'★'.repeat(property.star_rating)}
                <span className="text-divider">{'★'.repeat(5 - property.star_rating)}</span>
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-navy">{property.display_name}</h1>
          <div className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
            <MapPin size={16} />
            <span>
              {[property.city, property.province, property.country].filter(Boolean).join(', ')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" leadingIcon={<Share2 size={16} />}>
            Share
          </Button>
          <Button variant="secondary" size="sm" leadingIcon={<Heart size={16} />}>
            Save
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <ScoreBadge
          value={property.guestrating_avg_expedia}
          reviews={property.total_reviews}
        />
      </div>
    </section>
  );
}
