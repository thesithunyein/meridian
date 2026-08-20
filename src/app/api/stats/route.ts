import { NextResponse } from "next/server";
import { readConfig, graphStats } from "@/lib/hydra";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/stats — live graph statistics from HydraDB.
 * Returns node/edge counts. Used by the landing page banner and the /how page.
 */
export async function GET() {
  const cfg = readConfig();
  try {
    const stats = await graphStats(cfg);
    return NextResponse.json(
      {
        ok: true,
        source: cfg.url ? `hydradb:${cfg.url}` : "fixture",
        ...stats,
        timestamp: new Date().toISOString(),
      },
      { headers: { "cache-control": "public, max-age=30" } },
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e) },
      { status: 500 },
    );
  }
}
