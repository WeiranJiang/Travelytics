import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  gapCount: number;
  lastRefreshedDays?: number;
}

/**
 * Shows "3 details may be out of date" when the AI has flagged gaps.
 * When everything is fresh, shows a positive confirmation.
 */
export function FreshnessIndicator({ gapCount, lastRefreshedDays = 18 }: Props) {
  if (gapCount === 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-positive/10 text-positive px-3 py-1.5 text-xs font-medium">
        <CheckCircle2 size={14} />
        Info verified in the last {lastRefreshedDays} days
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-brand-yellow/30 text-navy-ink px-3 py-1.5 text-xs font-medium border border-brand-yellow">
      <AlertCircle size={14} />
      <span>
        {gapCount} detail{gapCount > 1 ? 's' : ''} may need refreshing
      </span>
      <span className="inline-flex items-center gap-1 text-ink-muted">
        <RefreshCw size={10} />
        Last update {lastRefreshedDays}d ago
      </span>
    </div>
  );
}
