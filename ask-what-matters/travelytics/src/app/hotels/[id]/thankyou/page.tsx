"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ThankYouContent() {
  const params      = useSearchParams();
  const insight     = params.get("insight") ?? "Your review has been submitted.";
  const title       = params.get("title") ?? "";
  const propertyId  = typeof window !== "undefined"
    ? window.location.pathname.split("/")[2]
    : "";

  const [seconds, setSeconds] = useState(8);
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string }[]>([]);

  useEffect(() => {
    // Simple confetti
    setConfetti(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"][i % 5],
      }))
    );
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) clearInterval(timer);
        return Math.max(0, s - 1);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Confetti */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute w-2 h-3 rounded-sm animate-bounce opacity-80"
          style={{ left: `${c.x}%`, top: `-${Math.random() * 20}px`, backgroundColor: c.color, animationDelay: `${Math.random() * 1}s`, animationDuration: `${1.5 + Math.random()}s` }}
        />
      ))}

      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-[#001b37] mb-2">Thank you!</h1>
        <p className="text-gray-500 mb-8">Your review has been submitted successfully.</p>

        {/* Impact preview */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 text-left mb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-3">
            Your impact on future travelers
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">Before your review</div>
              <div className="rounded-lg bg-gray-50 border px-4 py-3 text-sm text-gray-500 italic">
                Information last updated over a year ago.
              </div>
            </div>
            <div className="flex justify-center text-gray-300">↓</div>
            <div>
              <div className="text-xs text-blue-600 mb-1">After your review</div>
              <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-[#001b37]">
                {insight}
              </div>
            </div>
          </div>
          {title && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-xs text-gray-400 mb-1">Your review title</div>
              <div className="font-medium text-[#001b37]">&ldquo;{title}&rdquo;</div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {seconds > 0 ? `Returning to property in ${seconds}s…` : ""}
          </p>
          <Link
            href={propertyId ? `/hotels/${propertyId}` : "/"}
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to property
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function ThankYouPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading…</div>}>
      <ThankYouContent />
    </Suspense>
  );
}
