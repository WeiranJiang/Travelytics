import { useEffect, useState } from 'react';
import type { Property, SubmitReviewResult } from '@/api/types';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { ImpactPreview } from '@/components/review/ImpactPreview';

const AUTO_RETURN_SECONDS = 8;

export function ThankYou({
  property,
  result,
  onDone,
}: {
  property: Property;
  result: SubmitReviewResult;
  onDone: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RETURN_SECONDS);

  useEffect(() => {
    const int = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(int);
          onDone();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(int);
  }, [onDone]);

  const beforeText =
    property.know_before_you_go || 'Information last updated over a year ago.';

  return (
    <>
      <Confetti />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ImpactPreview
          propertyName={property.display_name}
          beforeText={beforeText}
          afterText={result.insight_preview}
          fieldsUpdated={result.fields_updated}
        />
        <div className="mt-8 flex items-center justify-between gap-3">
          <div className="text-xs text-ink-muted">
            Returning to {property.display_name} in {secondsLeft}s…
          </div>
          <Button onClick={onDone}>Back to property</Button>
        </div>
      </div>
    </>
  );
}
