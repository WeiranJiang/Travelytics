import type { CategoryBreakdownScores } from '@/api/types';

const LABELS: Record<keyof CategoryBreakdownScores, string> = {
  cleanliness: 'Cleanliness',
  staff_and_service: 'Staff & service',
  amenities: 'Amenities',
  property_conditions: 'Property conditions & facilities',
  eco_friendliness: 'Eco-friendliness',
};

export function RatingBreakdown({
  ratings,
  highlightStale,
}: {
  ratings: CategoryBreakdownScores;
  /** Optional: highlight categories flagged as stale by the AI. */
  highlightStale?: (keyof CategoryBreakdownScores)[];
}) {
  return (
    <div className="space-y-3">
      {(Object.keys(LABELS) as (keyof CategoryBreakdownScores)[]).map((k) => {
        const value = ratings[k];
        const stale = highlightStale?.includes(k);
        return (
          <div key={k} className="flex items-center gap-4">
            <div className="w-56 text-sm font-medium text-navy">
              {LABELS[k]}
              {stale && (
                <span className="ml-2 text-xs text-negative font-normal">· needs refresh</span>
              )}
            </div>
            <div className="flex-1 h-2 bg-surface-contrast rounded-full overflow-hidden">
              <div
                className={`h-full ${stale ? 'bg-negative' : 'bg-navy'}`}
                style={{ width: `${(value / 10) * 100}%` }}
              />
            </div>
            <div className="w-10 text-right text-sm font-semibold text-navy">
              {value.toFixed(1)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
