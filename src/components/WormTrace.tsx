"use client";

import { useEffect, useRef, useState } from "react";

export interface TraceEvent {
  t: number;
  kind: "publish" | "install" | "alert" | "yank" | "lockfile" | "guard";
  label: string;
  pkg?: string;
}

/**
 * Animated worm-trace timeline.  Visually identical to the landing stats
 * line's vertical rhythm — a glass card with a glass track, dots tinted
 * to the event kind, and a moving caret travelling left to right as the
 * timeline elapses.
 */
export function WormTrace({
  events,
  durationMs = 360_000,
  autoplay = true,
}: {
  events: TraceEvent[];
  durationMs?: number;
  autoplay?: boolean;
}) {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!autoplay) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setElapsed((v) => Math.min(durationMs, v + dt * 8));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, durationMs]);

  return (
    <div ref={ref} className="wt-track">
      {events.map((e, idx) => {
        const passed = elapsed >= e.t;
        return (
          <article
            key={idx}
            className="wt-event"
            aria-current={passed ? "step" : undefined}
          >
            <span className={`wt-event-dot wt-event-dot--${e.kind}`} />
            <div>
              <div className="wt-event-head">
                <span className="cell-mono">
                  {(e.t / 1000).toFixed(0).padStart(2, "0")}:00
                </span>
                <span className={`bullet-bordered bullet-bordered--${pillSeverity(e.kind)}`}>
                  {e.kind.toUpperCase()}
                </span>
                {e.pkg && (
                  <span className="cell-mono text-info">{e.pkg}</span>
                )}
              </div>
              <p className="wt-event-label">{e.label}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function pillSeverity(k: TraceEvent["kind"]) {
  switch (k) {
    case "guard":    return "ok";
    case "alert":    return "crit";
    case "publish":  return "high";
    case "install":  return "info";
    case "lockfile": return "info";
    case "yank":     return "warn";
  }
}
