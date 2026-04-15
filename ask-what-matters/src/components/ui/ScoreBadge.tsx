/** The large /10 rating pill Expedia uses on property cards. */
export function ScoreBadge({ value, reviews }: { value: number; reviews?: number }) {
  const label =
    value >= 9 ? 'Wonderful' : value >= 8 ? 'Very Good' : value >= 7 ? 'Good' : 'Fair';
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center bg-navy text-white font-bold text-lg rounded-md px-2.5 py-1 min-w-[48px]">
        {value.toFixed(1)}
      </div>
      <div>
        <div className="font-semibold text-navy">{label}</div>
        {reviews !== undefined && (
          <div className="text-sm text-ink-muted">{reviews.toLocaleString()} reviews</div>
        )}
      </div>
    </div>
  );
}
