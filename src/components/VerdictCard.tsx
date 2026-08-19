"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ScanResult } from "@/lib/types";

const SEVERITY_CLASS: Record<"crit" | "high" | "warn" | "ok", string> = {
  crit: "severity-bar severity-bar--crit",
  high: "severity-bar severity-bar--high",
  warn: "severity-bar severity-bar--warn",
  ok:   "severity-bar severity-bar--ok",
};

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
    <section className={`glass-card ${SEVERITY_CLASS[sev]}`}>
      <header className="glass-card-header">
        <span className={`bullet-bordered bullet-bordered--${sev}`}>{sev.toUpperCase()}</span>
        <span className="text-2xs uppercase tracking-widest text-ink-300">verdict</span>
        <span className="text-ink-500">·</span>
        <span className="cell-mono text-ink-200">{result.package}</span>
        <span className="ml-auto text-xs text-ink-400">{relative(new Date(result.generatedAt))}</span>
      </header>

      <div className="glass-card-body">
        <pre className="verdict-text whitespace-pre-wrap leading-snug">{verdict}</pre>

        <div className="verdict-side">
          <div className="glass-card-inner">
            <div className="text-2xs uppercase tracking-widest text-ink-400 mb-1">fix command</div>
            <div className="cell-mono text-md text-accent">$ {fixCmd}</div>
            <button
              type="button"
              className="btn btn-ghost btn-ghost--mini mt-3"
              onClick={() => navigator.clipboard?.writeText(fixCmd)}
            >
              ▸ copy
            </button>
          </div>
          <div className="glass-card-inner">
            <div className="text-2xs uppercase tracking-widest text-ink-400 mb-2">share</div>
            <div className="cell-mono text-xs text-ink-200 break-all">
              {`https://meridian.sithunyein.com/scan/${encodeURIComponent(result.package)}`}
            </div>
            <Link href="/replay" className="btn btn-ghost btn-ghost--mini mt-3">
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
