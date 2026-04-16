import { NextResponse } from "next/server";
import { syncAdminScores } from "@/lib/intelligence/sync";

/**
 * POST /api/sync
 * Triggers the full gap-scoring pipeline (cluster → temporal → final matrix)
 * and persists results to the DB. Safe to call multiple times — all upserts.
 */
export async function POST() {
  try {
    const start = Date.now();
    await syncAdminScores();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    return NextResponse.json({ ok: true, message: `Sync complete in ${elapsed}s` });
  } catch (err) {
    console.error("[sync] error:", err);
    return NextResponse.json(
      { ok: false, message: String(err) },
      { status: 500 }
    );
  }
}
