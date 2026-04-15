import { Star } from 'lucide-react';

interface Props {
  value: number; // 0–5, whole stars only
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
  label?: string;
}

export function StarRating({ value, onChange, size = 24, readOnly, label }: Props) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const interactive = !readOnly && onChange;
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            aria-checked={filled}
            role="radio"
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              width={size}
              height={size}
              className={filled ? 'fill-brand-gold text-brand-gold' : 'fill-none text-ink-muted'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
