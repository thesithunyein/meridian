import { NextResponse } from "next/server";
import { readConfig } from "@/lib/hydra";

export const runtime = "nodejs";

export function GET() {
  const cfg = readConfig();
  return NextResponse.json({
    ok: true,
    source: cfg.url ? `hydradb:${cfg.url}` : "fixture:deterministic-v1",
    graph: cfg.graph ?? "meridian",
    cellId: cfg.cellId ?? "cell-0",
    now: new Date().toISOString(),
  });
}
