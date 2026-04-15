import type { Review } from '@/api/types';
import { Avatar } from '@/components/ui/Avatar';
import { StarRating } from '@/components/ui/StarRating';

export function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.acquisition_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
  const initial = review.author_initial ?? 'G';
  return (
    <article className="border-b border-divider pb-6 last:border-b-0">
      <div className="flex items-start gap-3">
        <Avatar initial={initial} />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-navy">Guest {initial}.</div>
              <div className="text-xs text-ink-muted">{date}</div>
            </div>
            <StarRating value={review.rating} readOnly size={16} />
          </div>
          {review.review_title && (
            <h3 className="mt-2 font-semibold text-navy">{review.review_title}</h3>
          )}
          <p className="mt-1 text-sm text-navy leading-relaxed whitespace-pre-line">
            {review.review_text}
          </p>
        </div>
      </div>
    </article>
  );
}
