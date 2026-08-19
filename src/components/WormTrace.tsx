"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export interface TraceEvent {
  t: number;                 // ms into the timeline
  kind: "publish" | "install" | "alert" | "yank" | "lockfile" | "guard";
  label: string;
  pkg?: string;
}

/**
 * Animated timeline that walks through `events` in 6 minutes (the TanStack
 * worm "speed run"). We render a left-aligned vertical track with dots, and
 * a sibling line of pinned labels. The cursor is a horizontal caret that
 * moves with time. When time passes the `guard` event, we display the
 * final one-sentence verdict in the accent color.
 *
 * Pure CSS / Motion — no graph lib required.
 */
export function WormTrace({
  events,
  durationMs = 360_000,                 // 6 minutes — matches the worm
  autoplay = true,
}: {
  events: TraceEvent[];
  durationMs?: number;
  autoplay?: boolean;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!autoplay) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setElapsed((v) => Math.min(durationMs, v + dt * 8));   // 8× speed
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, durationMs]);

  const pct = (elapsed / durationMs) * 100;

  return (
    <div className="border border-ink-600 bg-ink-900">
      <header className="px-4 py-3 border-b border-ink-600 flex items-center gap-3 text-2xs uppercase tracking-widest text-ink-300">
        <span className="bullet crit">LIVE</span>
        <span>MERIDIAN · LIVE WORM TRACE</span>
        <span className="ml-auto cell">t = {fmtMs(elapsed)} / {fmtMs(durationMs)}</span>
      </header>

      <div className="relative px-4 pt-6 pb-4">
        {/* vertical track */}
        <div className="absolute left-[34px] top-6 bottom-4 w-px bg-ink-500" />
        {/* moving caret (a coloured dot that travels the track) */}
        <motion.div
          aria-hidden
          className="absolute left-[28px] w-3.5 h-3.5 -translate-y-1/2 rounded-full bg-accent border-2 border-ink-950"
          style={{ top: `${6 + pct * 0.92}%` }}
          transition={{ ease: "linear", duration: 0 }}
        />
        {events.map((e, idx) => {
          const at = (e.t / durationMs) * 100;
          const passed = elapsed >= e.t;
          return (
            <article
              key={idx}
              className={clsx(
                "relative pl-12 mb-4 grid grid-cols-12 gap-3",
                passed ? "text-ink-50" : "text-ink-300",
              )}
            >
              <span
                aria-hidden
                className={clsx(
                  "absolute left-[26px] top-2 w-5 h-5 rounded-full border-2",
                  passed
                    ? e.kind === "guard" ? "bg-ok border-ok"
                    : e.kind === "alert" ? "bg-crit border-crit"
                    : e.kind === "publish" ? "bg-high border-high"
                    : "bg-info border-info"
                    : "bg-ink-900 border-ink-500",
                )}
              />
              <div className="col-span-2 cell text-xs text-ink-400">{fmtMs(e.t)}</div>
              <div className="col-span-10">
                <div className="text-xs uppercase tracking-widest text-ink-400 mb-1 cell">
                  <span className={`bullet ${pillFor(e.kind)}`}>{e.kind.toUpperCase()}</span>
                  {e.pkg && (
                    <span className="ml-2 text-info cell">{e.pkg}</span>
                  )}
                </div>
                <p className="text-md text-ink-50 leading-snug">{e.label}</p>
              </div>
            </article>
          );
        })}
      </div>

      <footer className="border-t border-ink-600 px-4 py-3 flex items-center justify-between text-2xs uppercase tracking-widest text-ink-300">
        <span>source · npm registry + osv.dev + ghsa cache</span>
        <span>{pct >= 100 ? "STOP BREACH" : `streaming… ${(pct).toFixed(1)}%`}</span>
      </footer>
    </div>
  );
}

function pillFor(k: TraceEvent["kind"]) {
  switch (k) {
    case "guard":    return "ok";
    case "alert":    return "crit";
    case "publish":  return "high";
    case "install":  return "info";
    case "lockfile": return "info";
    case "yank":     return "warn";
  }
}

function fmtMs(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
