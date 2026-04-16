import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/properties/[id]/smart-questions
 *
 * Returns the top 1-2 gap-driven questions for this property.
 * Questions are derived from the real gap scores in PropertyFinalGap.
 * High-gap dimensions become targeted smart questions.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const gaps = await prisma.propertyFinalGap.findMany({
    where: { propertyId: id },
    orderBy: { finalScore: "desc" },
    take: 5,
  });

  const questions = gaps.slice(0, 2).map((g, i) => ({
    id: `gap_${g.id}`,
    text: questionTextFor(g.label, g.gapType),
    reason: reasonFor(g),
    target_gap: g.label,
    category: g.gapType,
    confidence: Number(g.finalScore.toFixed(2)),
    signals: {
      staleness_ratio: g.temporalScore > 0 ? Number((g.temporalScore * 2).toFixed(2)) : undefined,
      contradiction_score: g.controversyScore > 0.1 ? Number(g.controversyScore.toFixed(2)) : undefined,
      coverage_count: g.freeTextScore > 0.3 ? Math.round((1 - g.freeTextScore) * 30) : undefined,
    },
  }));

  return NextResponse.json(questions);
}

function questionTextFor(label: string, gapType: string): string {
  const clean = label.replace(/_/g, " ");
  const templates: Record<string, string> = {
    roomcleanliness:    "How would you rate the cleanliness of your room on your recent visit?",
    service:            "How was the staff's service during your stay?",
    roomamenitiesscore: "Did the room amenities meet your expectations?",
    hotelcondition:     "How would you rate the overall condition and facilities of the property?",
    ecofriendliness:    "Did you notice any eco-friendly or sustainability practices during your stay?",
    wifi:               "How was the WiFi quality and reliability during your stay?",
    pool:               "Was the pool area well-maintained and enjoyable?",
    breakfast:          "How would you rate the quality and variety of the breakfast offering?",
    parking:            "Was parking easy to find and reasonably priced?",
  };
  if (gapType === "topic" || gapType === "schema_gap") {
    return `We noticed guests frequently mention "${clean}" — could you share your experience with this?`;
  }
  return templates[label] ?? `How would you rate the ${clean} during your stay?`;
}

function reasonFor(g: { label: string; gapType: string; temporalScore: number; controversyScore: number; freeTextScore: number }): string {
  const parts: string[] = [];
  if (g.temporalScore > 0.5) parts.push("this info hasn't been refreshed recently");
  if (g.controversyScore > 0.2) parts.push("guests have been split on this topic");
  if (g.freeTextScore > 0.3) parts.push("guests frequently mention this but it's not in our structured data");
  return parts.length
    ? `We're asking because ${parts.join(" and ")}.`
    : "Your answer will help future travelers make a more informed decision.";
}
