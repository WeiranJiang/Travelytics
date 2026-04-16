import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOpenAI } from "@/lib/openai";

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

  // 1. Fetch Property Details for context
  const property = await prisma.property.findUnique({
    where: { egPropertyId: id },
    select: {
      egPropertyId: true,
      propertyDescription: true,
      starRating: true,
      city: true,
    }
  });

  // 2. Fetch Gaps
  const gaps = await prisma.propertyFinalGap.findMany({
    where: { propertyId: id },
    orderBy: { finalScore: "desc" },
    take: 5,
  });

  if (gaps.length === 0) {
    return NextResponse.json([]);
  }

  // 3. Attempt to generate "Smart" text via OpenAI
  let generatedQuestions: { id: string, text: string }[] = [];
  try {
    const openai = getOpenAI();
    const model = "gpt-4o-mini";

    const prompt = `
      You are an expert hospitality data analyst. We identified data gaps for a hotel (Property ID: ${id}).
      Location: ${property?.city ?? "Unknown"}
      Rating: ${property?.starRating ?? "N/A"} stars
      Description Snippet: ${property?.propertyDescription?.slice(0, 300) ?? "N/A"}

      Gaps identified:
      ${gaps.map(g => `- ${g.label} (${g.gapType}): Score ${g.finalScore.toFixed(2)}. Signals: Temporal=${g.temporalScore}, Controversy=${g.controversyScore}, FreeText=${g.freeTextScore}`).join("\n")}

      Task: Generate exactly 2 high-priority, friendly, and natural questions to ask a guest to fill these gaps.
      The questions should be concise and sound like they are coming from a helpful travel assistant.
      Return ONLY valid JSON in this format:
      {
        "questions": [
          { "target_label": "label_of_gap", "text": "The question text" }
        ]
      }
    `.trim();

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content) as { questions: { target_label: string, text: string }[] };
      generatedQuestions = parsed.questions.map((q, i) => ({
        id: `ai_${i}`,
        text: q.text,
        target_label: q.target_label
      }));
    }
  } catch (error) {
    console.error("OpenAI Question Generation failed:", error);
  }

  // 4. Map to final format, using OpenAI text if available, otherwise fallback
  const questions = gaps.slice(0, 2).map((g, i) => {
    const aiMatch = generatedQuestions.find(q => q.target_label === g.label);
    
    return {
      id: `gap_${g.id}`,
      text: aiMatch?.text || questionTextFor(g.label, g.gapType),
      reason: reasonFor(g),
      target_gap: g.label,
      category: g.gapType,
      confidence: Number(g.finalScore.toFixed(2)),
      signals: {
        staleness_ratio: g.temporalScore > 0 ? Number((g.temporalScore * 2).toFixed(2)) : undefined,
        contradiction_score: g.controversyScore > 0.1 ? Number(g.controversyScore.toFixed(2)) : undefined,
        coverage_count: g.freeTextScore > 0.3 ? Math.round((1 - g.freeTextScore) * 30) : undefined,
      },
    };
  });

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
