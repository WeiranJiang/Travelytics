import { useState } from 'react';
import { Sparkles, Info, ChevronDown, ChevronUp } from 'lucide-react';
import type { SmartQuestion as SmartQ } from '@/api/types';
import { VoiceInput } from './VoiceInput';

interface Props {
  question: SmartQ;
  value: string;
  onChange: (v: string) => void;
}

export function SmartQuestionCard({ question, value, onChange }: Props) {
  const [showFullReason, setShowFullReason] = useState(false);
  // Short preview of the reason (first sentence) shown by default.
  const firstSentence =
    question.reason.split(/(?<=[.!?])\s/)[0] ?? question.reason.slice(0, 120);

  return (
    <div className="rounded-lg border border-action/30 bg-action-subtle/50 p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-action p-1.5 text-white shrink-0">
          <Sparkles size={14} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wide text-action">
              Smart question
            </span>
            <span className="text-xs text-ink-muted">· {question.category}</span>
            <span className="text-xs rounded-full bg-action text-white px-2 py-0.5 font-medium">
              Chosen for you
            </span>
          </div>

          {/* Always-visible reason teaser */}
          <div className="mt-2 flex items-start gap-2 text-xs text-navy bg-white/70 rounded-md border border-action/20 px-3 py-2">
            <Info size={12} className="mt-0.5 text-action shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Why you? </span>
              <span>{showFullReason ? question.reason : firstSentence}</span>
              {question.reason !== firstSentence && (
                <button
                  type="button"
                  onClick={() => setShowFullReason((s) => !s)}
                  className="ml-1 text-action font-medium inline-flex items-center gap-0.5 hover:underline"
                >
                  {showFullReason ? (
                    <>
                      Less <ChevronUp size={12} />
                    </>
                  ) : (
                    <>
                      More <ChevronDown size={12} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <p className="mt-3 font-semibold text-navy text-lg leading-snug">
            {question.text}
          </p>

          <div className="mt-4 space-y-2">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={3}
              placeholder="Type your answer or tap the mic to speak…"
              className="w-full rounded-md border border-divider bg-white px-3 py-2 text-sm text-navy placeholder:text-ink-muted focus:outline-none focus:border-action focus:ring-1 focus:ring-action"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-muted">
                Takes ~10 seconds. You can skip this if you prefer.
              </span>
              <VoiceInput onTranscript={(t) => onChange(value ? `${value} ${t}` : t)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
