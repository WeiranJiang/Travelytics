"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SmartQuestion {
  id: string;
  text: string;
  reason: string;
  target_gap: string;
  confidence?: number;
}

const CATEGORIES = [
  { key: "cleanliness",   label: "Cleanliness" },
  { key: "service",       label: "Staff & service" },
  { key: "amenities",     label: "Amenities" },
  { key: "conditions",    label: "Property conditions" },
  { key: "eco",           label: "Eco-friendliness" },
];

const STEPS = ["overall", "categories", "details", "smart", "submitting"] as const;
type Step = typeof STEPS[number];

interface Props {
  propertyId: string;
  propertyName: string;
}

export function ReviewFlow({ propertyId, propertyName }: Props) {
  const router = useRouter();

  const [step,       setStep]       = useState<Step>("overall");
  const [overall,    setOverall]     = useState(0);
  const [categories, setCategories] = useState<Record<string, number>>({});
  const [title,      setTitle]       = useState("");
  const [text,       setText]        = useState("");
  const [questions,  setQuestions]   = useState<SmartQuestion[]>([]);
  const [answers,    setAnswers]     = useState<Record<string, string>>({});
  const [error,      setError]       = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/properties/${propertyId}/smart-questions`)
      .then((r) => r.json())
      .then(setQuestions)
      .catch(() => {/* silently skip if no questions */});
  }, [propertyId]);

  const stepIndex = STEPS.indexOf(step) + 1;
  const totalSteps = questions.length ? 4 : 3;

  function canAdvance(): boolean {
    if (step === "overall")    return overall > 0;
    if (step === "categories") return CATEGORIES.every((c) => (categories[c.key] ?? 0) > 0);
    if (step === "details")    return title.trim().length > 0 && text.trim().length >= 20;
    return true;
  }

  function next() {
    if (step === "overall")    { setStep("categories"); return; }
    if (step === "categories") { setStep("details");    return; }
    if (step === "details")    { setStep(questions.length ? "smart" : "submitting"); return; }
    if (step === "smart")      { setStep("submitting"); return; }
  }

  // Persist review locally (matching App 1's localStorage pattern)
  useEffect(() => {
    if (step !== "submitting") return;

    const firstAnswer = Object.values(answers)[0] ?? "";
    const reviewId = `rev_${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);

    // Read session cookie for author initial
    let initial = "G";
    try {
      const match = document.cookie.match(/awm_session=([^;]+)/);
      if (match) initial = JSON.parse(decodeURIComponent(match[1])).initial ?? "G";
    } catch {}

    const newReview = {
      id: reviewId,
      eg_property_id: propertyId,
      acquisition_date: today,
      lob: "HOTEL",
      rating: overall,
      review_title: title,
      review_text: text + (firstAnswer ? `\n\nUpdate from this guest: ${firstAnswer}` : ""),
      author_initial: initial,
    };

    try {
      const raw = localStorage.getItem("awm:submitted_reviews");
      const store: Record<string, unknown[]> = raw ? JSON.parse(raw) : {};
      store[propertyId] = [newReview, ...(store[propertyId] ?? [])];
      localStorage.setItem("awm:submitted_reviews", JSON.stringify(store));
    } catch {}

    const insightPreview = firstAnswer
      ? `Guests report: "${firstAnswer.slice(0, 180)}${firstAnswer.length > 180 ? "…" : ""}"`
      : "Your review has been submitted.";

    router.push(
      `/hotels/${propertyId}/thankyou?insight=${encodeURIComponent(insightPreview)}&title=${encodeURIComponent(title)}`
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#001b37] mb-6"
      >
        ← Back to {propertyName}
      </button>

      {/* Progress */}
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Step {Math.min(stepIndex, totalSteps)} of {totalSteps}
        </div>
        <h1 className="mt-1 text-3xl font-bold text-[#001b37]">Review your stay</h1>
        <p className="text-sm text-gray-500 mt-0.5">{propertyName}</p>
        <div className="mt-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${(Math.min(stepIndex, totalSteps) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Step: overall ── */}
      {step === "overall" && (
        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <h2 className="text-xl font-semibold text-[#001b37]">Overall, how was your stay?</h2>
          <p className="text-sm text-gray-500">Tap a star to rate.</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setOverall(n)} className="text-4xl transition-transform hover:scale-110">
                <span className={n <= overall ? "text-yellow-400" : "text-gray-300"}>★</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step: categories ── */}
      {step === "categories" && (
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold text-[#001b37] mb-5">Rate each category</h2>
          <div className="space-y-5">
            {CATEGORIES.map((c) => (
              <div key={c.key}>
                <div className="text-sm font-medium text-[#001b37] mb-2">{c.label}</div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCategories((prev) => ({ ...prev, [c.key]: n }))}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      <span className={n <= (categories[c.key] ?? 0) ? "text-yellow-400" : "text-gray-300"}>★</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step: details ── */}
      {step === "details" && (
        <div className="bg-white rounded-2xl border p-6 space-y-4">
          <h2 className="text-xl font-semibold text-[#001b37]">Tell other travelers</h2>
          <div>
            <label className="block text-sm font-semibold text-[#001b37] mb-1">Review title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your stay in a few words"
              className="w-full rounded-lg border px-3 py-2.5 text-sm text-[#001b37] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#001b37] mb-1">Your review</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Share the highlights — what did you love? What could be better?"
              className="w-full rounded-lg border px-3 py-2.5 text-sm text-[#001b37] placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              {text.length < 20 ? `${20 - text.length} more characters needed` : "✓ Looking good"}
            </p>
          </div>
        </div>
      )}

      {/* ── Step: smart question ── */}
      {step === "smart" && questions.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-[#001b37]">One quick question before you go</h2>
            <p className="text-sm text-gray-500 mt-1">
              This helps future travelers get an up-to-date picture of {propertyName}.
            </p>
          </div>
          {questions.map((q) => (
            <div key={q.id} className="bg-white rounded-2xl border p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="rounded-full bg-amber-100 p-1.5 shrink-0">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[#001b37] text-sm">{q.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{q.reason}</p>
                </div>
              </div>
              <textarea
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                rows={3}
                placeholder="Share your honest experience (optional but very helpful)"
                className="w-full rounded-lg border px-3 py-2.5 text-sm text-[#001b37] placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      {step === "submitting" && (
        <div className="bg-white rounded-2xl border p-6 text-center text-gray-400">
          Submitting your review…
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Navigation */}
      {step !== "submitting" && (
        <div className="mt-6 flex justify-between">
          {(step === "smart") && (
            <button
              onClick={() => setStep("submitting")}
              className="text-sm text-gray-500 hover:text-[#001b37] border border-gray-200 rounded-full px-4 py-2"
            >
              Skip
            </button>
          )}
          <div className="ml-auto">
            <button
              onClick={next}
              disabled={!canAdvance()}
              className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === "smart" || (step === "details" && !questions.length)
                ? "Submit review"
                : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
