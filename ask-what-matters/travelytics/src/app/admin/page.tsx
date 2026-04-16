import Link from "next/link";
import { getAdminProperties } from "@/lib/data";
import { SyncButton } from "./SyncButton";

// ── Display names for the 5 Expedia-style rating dimensions ──────────────────
const RATING_DIMENSIONS: { key: string; label: string }[] = [
  { key: "roomcleanliness",   label: "Cleanliness" },
  { key: "service",           label: "Staff & service" },
  { key: "roomamenitiesscore",label: "Amenities" },
  { key: "hotelcondition",    label: "Property conditions & facilities" },
  { key: "ecofriendliness",   label: "Eco-friendliness" },
];

// ── Gap type badge colours ────────────────────────────────────────────────────
const GAP_TYPE_COLORS: Record<string, string> = {
  rating_dim:  "bg-orange-50 text-orange-700 ring-orange-200",
  schema_gap:  "bg-purple-50 text-purple-700 ring-purple-200",
  topic:       "bg-red-50    text-red-700    ring-red-200",
  amenity:     "bg-green-50  text-green-700  ring-green-200",
  drift:       "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseAmenities(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {}
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function gapColor(score: number) {
  if (score > 0.55) return { bar: "bg-red-500",    text: "text-red-600" };
  if (score > 0.35) return { bar: "bg-amber-400",  text: "text-amber-600" };
  return               { bar: "bg-emerald-400", text: "text-emerald-600" };
}

function formatDate(d: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default async function AdminPage() {
  const properties = await getAdminProperties();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      {/* ── Header ── */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gap Intelligence Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {properties.length} properties · gap scores are 0–1 (higher = bigger gap to close)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SyncButton />
          <Link href="/" className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
            Consumer Site →
          </Link>
        </div>
      </div>

      {properties.length === 0 && (
        <div className="rounded-2xl border border-dashed p-16 text-center text-gray-400">
          <p className="text-lg font-medium">No data yet.</p>
          <p className="mt-1 text-sm">Click <strong>Run Sync</strong> to populate the gap matrix.</p>
        </div>
      )}

      <div className="space-y-10">
        {properties.map((p) => {
          const amenities = parseAmenities(p.popularAmenitiesList);
          const gapByKey = Object.fromEntries(
            p.gapScores.map((g) => [`${g.gapType}::${g.label}`, g])
          );
          const amenityGaps = new Set(
            p.gapScores.filter((g) => g.gapType === "amenity").map((g) => g.label)
          );
          const topGaps = p.gapScores.slice(0, 5);
          const ratingGaps = RATING_DIMENSIONS.map((dim) => ({
            ...dim,
            gap: gapByKey[`rating_dim::${dim.key}`],
          }));

          return (
            <div key={p.egPropertyId} className="overflow-hidden rounded-2xl border bg-white shadow-sm">

              {/* ── Property header (Expedia-style) ── */}
              <div className="border-b bg-gray-50 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      {p.city && <span>📍 {p.city}{p.country ? `, ${p.country}` : ""}</span>}
                      {p.cluster && <span>· Cluster {p.cluster.clusterId}</span>}
                    </div>
                    <h2 className="text-lg font-bold leading-snug">
                      <Link href={`/hotels/${p.egPropertyId}`} className="hover:underline">
                        {p.propertyDescription?.slice(0, 80) || p.egPropertyId}
                      </Link>
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-400 font-mono">{p.egPropertyId}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {p.guestRatingAvgExpedia && (
                      <div className="inline-flex flex-col items-center rounded-xl bg-blue-900 px-4 py-2 text-white">
                        <span className="text-2xl font-bold">{p.guestRatingAvgExpedia.toFixed(1)}</span>
                        <span className="text-xs opacity-80">Guest rating</span>
                      </div>
                    )}
                    {p.starRating && (
                      <p className="mt-1 text-xs text-gray-400">{"★".repeat(p.starRating)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 divide-y lg:grid-cols-[1fr_1fr] lg:divide-x lg:divide-y-0">

                {/* ── Left column ── */}
                <div className="divide-y">

                  {/* Popular amenities */}
                  {amenities.length > 0 && (
                    <div className="px-6 py-5">
                      <h3 className="mb-3 text-sm font-semibold">Popular amenities</h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                        {amenities.map((a) => {
                          const hasGap = amenityGaps.has(a.toLowerCase().replace(/\s+/g, "_"));
                          return (
                            <div key={a} className="flex items-center gap-2 text-sm">
                              <span className={hasGap ? "text-red-500" : "text-emerald-500"}>
                                {hasGap ? "⚠" : "✓"}
                              </span>
                              <span className={hasGap ? "text-red-700 font-medium" : "text-gray-700"}>
                                {a}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Guest rating breakdown (gap-score bars) */}
                  <div className="px-6 py-5">
                    <h3 className="mb-3 text-sm font-semibold">
                      Guest rating breakdown
                      <span className="ml-2 text-xs font-normal text-gray-400">(gap score, 0–1)</span>
                    </h3>
                    <div className="space-y-3">
                      {ratingGaps.map(({ key, label, gap }) => {
                        const score = gap?.temporalScore ?? null;
                        const { bar, text } = score != null ? gapColor(score) : { bar: "bg-gray-200", text: "text-gray-400" };
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-700">{label}</span>
                              <span className={`text-xs font-semibold tabular-nums ${text}`}>
                                {score != null ? score.toFixed(2) : "no data"}
                              </span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${bar} transition-all`}
                                style={{ width: score != null ? `${(score * 100).toFixed(0)}%` : "0%" }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Bar = staleness + coverage gap · Red &gt; 0.55 · Amber 0.35–0.55 · Green &lt; 0.35
                    </p>
                  </div>
                </div>

                {/* ── Right column ── */}
                <div className="divide-y">

                  {/* Top gap signals */}
                  <div className="px-6 py-5">
                    <h3 className="mb-3 text-sm font-semibold">Top gap signals</h3>
                    {topGaps.length === 0 ? (
                      <p className="text-xs text-gray-400">No gaps detected yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {topGaps.map((g) => {
                          const { text } = gapColor(g.finalScore);
                          const tagCls = GAP_TYPE_COLORS[g.gapType] ?? "bg-gray-50 text-gray-600 ring-gray-200";
                          const signals = [
                            g.temporalScore > 0    && `temporal ${g.temporalScore.toFixed(2)}`,
                            g.freeTextScore > 0    && `free-text ${g.freeTextScore.toFixed(2)}`,
                            g.clusterScore > 0     && `cluster ${g.clusterScore.toFixed(2)}`,
                            g.controversyScore > 0 && `controversy ${g.controversyScore.toFixed(2)}`,
                            g.listingScore > 0     && `listing ${g.listingScore.toFixed(2)}`,
                            g.driftScore > 0       && `drift ${g.driftScore.toFixed(2)}`,
                          ].filter(Boolean) as string[];
                          return (
                            <div key={g.id} className="flex items-start gap-3 rounded-lg border p-3">
                              <div className="shrink-0">
                                <span className={`text-lg font-bold tabular-nums ${text}`}>
                                  {g.finalScore.toFixed(2)}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tagCls}`}>
                                    {g.gapType}
                                  </span>
                                  <span className="text-sm font-medium truncate">{g.label}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {signals.map((s) => (
                                    <span key={s} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Recent guest reviews */}
                  {p.reviews.length > 0 && (
                    <div className="px-6 py-5">
                      <h3 className="mb-3 text-sm font-semibold">Recent guest reviews</h3>
                      <div className="space-y-4">
                        {p.reviews.map((r) => {
                          const initials = `Guest ${String.fromCharCode(65 + Math.abs(r.id.charCodeAt(0) % 26))}`;
                          return (
                            <div key={r.id} className="flex gap-3">
                              <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                                {initials[6]}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-sm font-medium">{initials}.</span>
                                  <span className="text-xs text-gray-400">{formatDate(r.acquisitionDate)}</span>
                                </div>
                                {r.reviewTitle && (
                                  <p className="text-sm font-medium text-gray-800 mt-0.5">{r.reviewTitle}</p>
                                )}
                                <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">
                                  {r.reviewText || "—"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}