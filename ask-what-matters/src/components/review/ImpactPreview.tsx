import { CheckCircle2, ArrowRight } from 'lucide-react';

/**
 * The "before / after" demo moment for judges.
 * Pass the insight string the backend returned from submitReview.
 */
export function ImpactPreview({
  propertyName,
  beforeText,
  afterText,
  fieldsUpdated,
}: {
  propertyName: string;
  beforeText: string;
  afterText: string;
  fieldsUpdated: string[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-positive">
        <CheckCircle2 size={20} />
        <span className="font-semibold">Thanks — your review is in.</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-navy">Here's how your answer updates {propertyName}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Future travelers searching this property will see fresher information because of you.
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] items-stretch gap-4">
        <div className="rounded-lg border border-divider bg-surface-contrast p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Before
          </div>
          <p className="mt-2 text-sm text-navy">{beforeText}</p>
        </div>
        <div className="hidden md:flex items-center justify-center text-action">
          <ArrowRight size={24} />
        </div>
        <div className="rounded-lg border-2 border-positive bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-positive">
            After your answer
          </div>
          <p className="mt-2 text-sm text-navy font-medium">{afterText}</p>
        </div>
      </div>

      {fieldsUpdated.length > 0 && (
        <div className="text-xs text-ink-muted">
          Fields refreshed:{' '}
          {fieldsUpdated.map((f, i) => (
            <span key={f}>
              <code className="rounded bg-surface-contrast px-1.5 py-0.5">{f}</code>
              {i < fieldsUpdated.length - 1 && ' · '}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
