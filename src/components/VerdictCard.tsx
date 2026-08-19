"use client";

import { useMemo } from "react";
import Link from "next/link";
import { SeverityBadge } from "@/components/SeverityBadge";
import type { ScanResult } from "@/lib/types";

export function VerdictCard({ result }: { result: ScanResult }) {
  const sev = useMemo<"crit" | "high" | "warn" | "ok">(() => {
    if (result.tiles.some((t) => t.severity === "crit")) return "crit";
    if (result.tiles.some((t) => t.severity === "high")) return "high";
    if (result.tiles.some((t) => t.severity === "warn")) return "warn";
    return "ok";
  }, [result]);

  const services = result.tiles.find((t) => t.id === "exposed-services")?.rows.length ?? 0;
  const lockfiles = result.tiles.find((t) => t.id === "lockfile-consumers")?.rows.length ?? 0;
  const typosquats = result.tiles.find((t) => t.id === "typosquats")?.rows.length ?? 0;

  const verdict =
    sev === "ok"
      ? `clean. 0 services transitively exposed. ship it.`
      : `${services} services exposed · ${lockfiles} lockfiles resolved the bad version · ${typosquats} typosquats nearby.\nfix:  pnpm update ${result.package.replace("@", "@^")}   ▸  breach window 4h 12m`;

  const fixCmd = `pnpm update ${result.package.replace("@", "@^")}`;

  return (
    <section className={`border border-ink-600 bg-ink-900 ${
      sev === "crit" ? "stripe-crit" : sev === "high" ? "stripe-high" : sev === "warn" ? "stripe-warn" : "stripe-ok"
    }`}>
      <header className="px-5 py-3 border-b border-ink-600 flex items-center gap-3 text-2xs uppercase tracking-widest text-ink-300">
        <SeverityBadge s={sev} />
        <span>verdict</span>
        <span className="text-ink-500">·</span>
        <span className="cell">{result.package}</span>
        <span className="ml-auto text-ink-400">generated {relative(new Date(result.generatedAt))}</span>
      </header>
      <div className="px-5 py-6 grid gap-6 lg:grid-cols-12">
        <pre className="lg:col-span-8 whitespace-pre-wrap text-md md:text-lg text-ink-50 leading-relaxed font-mono">
{verdict}
        </pre>
        <div className="lg:col-span-4 space-y-4">
          <div className="border border-ink-600 p-3">
            <div className="text-2xs uppercase tracking-widest text-ink-400 mb-1">fix command</div>
            <div className="cell text-md text-accent">$ {fixCmd}</div>
            <button
              className="tile-button mt-3"
              onClick={() => navigator.clipboard?.writeText(fixCmd)}
              type="button"
            >
              ▸ copy
            </button>
          </div>
          <div className="border border-ink-600 p-3">
            <div className="text-2xs uppercase tracking-widest text-ink-400 mb-2">share</div>
            <div className="cell text-xs text-ink-200 break-all">
              {`https://meridian.sithunyein.com/scan/${encodeURIComponent(result.package)}`}
            </div>
            <Link href="/replay" className="tile-button mt-3 inline-block">
              ▸ open replay
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function relative(d: Date) {
  const ms = Date.now() - d.getTime();
  if (ms < 60_000) return "just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)} min ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)} h ago`;
  return d.toISOString().slice(0, 16).replace("T", " ") + "Z";
}
