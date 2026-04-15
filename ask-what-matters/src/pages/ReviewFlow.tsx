import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type {
  CategoryInputRatings,
  Property,
  SmartQuestion,
  SubmitReviewResult,
} from '@/api/types';
import {
  getProperty,
  getSmartQuestions,
  submitReview,
  unwrap,
} from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/StarRating';
import { CategoryRatingsInput } from '@/components/review/CategoryRatingsInput';
import { SmartQuestionCard } from '@/components/review/SmartQuestion';
import { PhotoUpload } from '@/components/review/PhotoUpload';

interface LocalPhoto {
  id: string;
  url: string;
  name: string;
}

type Step = 'overall' | 'categories' | 'details' | 'photos' | 'smart' | 'submitting';

const emptyCategories: CategoryInputRatings = {
  cleanliness: 0,
  staff_and_service: 0,
  amenities: 0,
  property_conditions: 0,
  eco_friendliness: 0,
};

export function ReviewFlow({
  propertyId,
  onBack,
  onSubmitted,
}: {
  propertyId: string;
  onBack: () => void;
  onSubmitted: (result: SubmitReviewResult, property: Property) => void;
}) {
  const [property, setProperty] = useState<Property | null>(null);
  const [questions, setQuestions] = useState<SmartQuestion[]>([]);
  const [step, setStep] = useState<Step>('overall');

  const [overall, setOverall] = useState(0);
  const [categories, setCategories] = useState<CategoryInputRatings>(emptyCategories);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [p, q] = await Promise.all([
        unwrap(getProperty(propertyId)),
        unwrap(getSmartQuestions(propertyId)),
      ]);
      setProperty(p);
      setQuestions(q);
    })();
  }, [propertyId]);

  const canAdvance: Record<Step, boolean> = {
    overall: overall > 0,
    categories: Object.values(categories).every((v) => v > 0),
    details: title.trim().length > 0 && text.trim().length >= 20,
    photos: true, // photos are optional
    smart: true, // smart question is optional
    submitting: false,
  };

  const next = async () => {
    if (step === 'overall') setStep('categories');
    else if (step === 'categories') setStep('details');
    else if (step === 'details') setStep('photos');
    else if (step === 'photos') setStep(questions.length ? 'smart' : 'submitting');
    else if (step === 'smart') setStep('submitting');
  };

  useEffect(() => {
    if (step !== 'submitting' || !property) return;
    (async () => {
      const result = await submitReview({
        property_id: propertyId,
        overall_rating: overall,
        category_ratings: categories,
        review_title: title,
        review_text: text,
        smart_question_answers: answers,
      });
      if (result.ok) onSubmitted(result.data, property);
      else setSubmitError(result.error);
    })();
  }, [step, property, propertyId, overall, categories, title, text, answers, onSubmitted]);

  if (!property) return <div className="p-8 text-ink-muted">Loading…</div>;

  const totalSteps = questions.length ? 5 : 4;
  const stepIndex = {
    overall: 1,
    categories: 2,
    details: 3,
    photos: 4,
    smart: 5,
    submitting: 5,
  }[step];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-navy"
      >
        <ArrowLeft size={16} />
        Back to {property.display_name}
      </button>

      <div className="mt-4 mb-8">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Step {Math.min(stepIndex, totalSteps)} of {totalSteps}
        </div>
        <h1 className="mt-1 text-3xl font-bold text-navy">Review your stay</h1>
        <p className="text-sm text-ink-muted">{property.display_name}</p>
        <div className="mt-4 h-1 bg-surface-contrast rounded-full overflow-hidden">
          <div
            className="h-full bg-action transition-all"
            style={{ width: `${(Math.min(stepIndex, totalSteps) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {step === 'overall' && (
        <Card className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-navy">Overall, how was your stay?</h2>
            <p className="text-sm text-ink-muted">Tap a star to rate.</p>
          </div>
          <StarRating value={overall} onChange={setOverall} size={40} />
        </Card>
      )}

      {step === 'categories' && (
        <Card>
          <h2 className="text-xl font-semibold text-navy mb-4">
            Rate each category
          </h2>
          <CategoryRatingsInput value={categories} onChange={setCategories} />
        </Card>
      )}

      {step === 'details' && (
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold text-navy">Tell other travelers</h2>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">
              Review title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your stay in a few words"
              className="w-full rounded-md border border-divider px-3 py-2 text-navy placeholder:text-ink-muted focus:border-action focus:ring-1 focus:ring-action focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">
              Your review
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Share the highlights — what did you love? What could be better?"
              className="w-full rounded-md border border-divider px-3 py-2 text-navy placeholder:text-ink-muted focus:border-action focus:ring-1 focus:ring-action focus:outline-none"
            />
            <div className="mt-1 text-xs text-ink-muted">
              {text.length < 20 ? `${20 - text.length} more characters` : 'Looking good'}
            </div>
          </div>
        </Card>
      )}

      {step === 'photos' && (
        <Card>
          <PhotoUpload value={photos} onChange={setPhotos} />
        </Card>
      )}

      {step === 'smart' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-navy">
              One quick question before you go
            </h2>
            <p className="text-sm text-ink-muted">
              This helps future travelers get an up-to-date picture of {property.display_name}.
            </p>
          </div>
          {questions.map((q) => (
            <SmartQuestionCard
              key={q.id}
              question={q}
              value={answers[q.id] ?? ''}
              onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
            />
          ))}
        </div>
      )}

      {step === 'submitting' && !submitError && (
        <Card>
          <div className="text-ink-muted">Submitting your review…</div>
        </Card>
      )}
      {submitError && (
        <Card>
          <div className="text-negative">Error: {submitError}</div>
        </Card>
      )}

      {step !== 'submitting' && (
        <div className="mt-6 flex justify-end gap-3">
          {(step === 'smart' || step === 'photos') && (
            <Button
              variant="tertiary"
              onClick={() =>
                step === 'photos'
                  ? setStep(questions.length ? 'smart' : 'submitting')
                  : setStep('submitting')
              }
            >
              Skip
            </Button>
          )}
          <Button onClick={next} disabled={!canAdvance[step]}>
            {step === 'smart' || (step === 'photos' && questions.length === 0)
              ? 'Submit review'
              : 'Continue'}
          </Button>
        </div>
      )}
    </div>
  );
}
