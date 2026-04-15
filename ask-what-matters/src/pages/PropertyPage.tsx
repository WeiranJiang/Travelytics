import { useEffect, useState } from 'react';
import type { Property, Review, SmartQuestion } from '@/api/types';
import {
  getProperty,
  getReviews,
  getSmartQuestions,
  unwrap,
} from '@/api/client';
import { PropertyHeader } from '@/components/property/PropertyHeader';
import { RatingBreakdown } from '@/components/property/RatingBreakdown';
import { AmenityList } from '@/components/property/AmenityList';
import { ReviewCard } from '@/components/property/ReviewCard';
import { FreshnessIndicator } from '@/components/property/FreshnessIndicator';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PropertySkeleton } from '@/components/ui/Skeleton';

export function PropertyPage({
  propertyId,
  onLeaveReview,
  onBack,
}: {
  propertyId: string;
  onLeaveReview: () => void;
  onBack?: () => void;
}) {
  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [smartQs, setSmartQs] = useState<SmartQuestion[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setProperty(null);
    setReviews([]);
    setSmartQs([]);
    (async () => {
      try {
        const [p, r, sq] = await Promise.all([
          unwrap(getProperty(propertyId)),
          unwrap(getReviews(propertyId)),
          unwrap(getSmartQuestions(propertyId)),
        ]);
        if (!active) return;
        setProperty(p);
        setReviews(r);
        setSmartQs(sq);
      } catch (e) {
        if (active) setErr((e as Error).message);
      }
    })();
    return () => {
      active = false;
    };
  }, [propertyId]);

  if (err) return <div className="p-8 text-negative">Error: {err}</div>;
  if (!property) return <PropertySkeleton />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
      {onBack && (
        <button
          onClick={onBack}
          className="text-sm text-ink-muted hover:text-navy inline-flex items-center gap-1"
        >
          ← Back to search results
        </button>
      )}
      <PropertyHeader property={property} />

      <div>
        <FreshnessIndicator gapCount={smartQs.length} />
      </div>

      <section className="grid md:grid-cols-[2fr_1fr] gap-8">
        <div>
          <h2 className="text-2xl font-bold text-navy">About this property</h2>
          <p className="mt-2 text-navy leading-relaxed">{property.property_description}</p>
          <p className="mt-2 text-sm text-ink-muted">{property.area_description}</p>
        </div>
        <Card>
          <div className="text-sm">
            <div className="font-semibold text-navy">Check-in</div>
            <div className="text-ink-muted">
              {property.check_in_start_time} – {property.check_in_end_time}
            </div>
            <div className="mt-3 font-semibold text-navy">Check-out</div>
            <div className="text-ink-muted">{property.check_out_time}</div>
            <div className="mt-3 font-semibold text-navy">Pets</div>
            <div className="text-ink-muted">{property.pet_policy}</div>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-navy">Popular amenities</h2>
        <div className="mt-4">
          <AmenityList amenities={property.popular_amenities} />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-navy">Guest rating breakdown</h2>
        <div className="mt-4">
          <RatingBreakdown ratings={property.category_ratings} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-navy">Guest reviews</h2>
          <Button onClick={onLeaveReview}>Leave a review</Button>
        </div>
        <div className="mt-6 space-y-6">
          {reviews.length === 0 ? (
            <div className="text-ink-muted text-sm italic">No reviews yet — be the first.</div>
          ) : (
            reviews.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </div>
      </section>
    </div>
  );
}
