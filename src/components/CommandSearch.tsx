"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const EXAMPLES = [
  { label: "tanstack/react-virtual@3.10.8", tone: "crit" as const },
  { label: "evil-pkg@1.0.0", tone: "high" as const },
  { label: "ua-parser-js@0.7.30", tone: "warn" as const },
  { label: "lodash", tone: "ok" as const },
];

const GHOST_VERDICT =
  "17 services exposed · pnpm update evil-pkg@^1.2.4  ▸  breach window 4h 12m";

export function CommandSearch({
  initial = "",
  large = false,
}: {
  initial?: string;
  large?: boolean;
}) {
  const router = useRouter();
  const [val, setVal] = useState(initial);
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = val.trim();
    if (!v) return;
    router.push(`/scan/${encodeURIComponent(v)}`);
  }

  return (
    <form onSubmit={submit} className="relative">
      <div className={cn("relative", large && "max-w-3xl")}>
        <span
          aria-hidden
          className={cn(
            "absolute left-0 top-0 select-none text-accent font-semibold",
            large ? "text-2xl py-[22px]" : "text-base py-[14px]",
          )}
        >
          &gt;
        </span>
        <input
          ref={ref}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-label="package or lockfile"
          className={cn(
            "cmd-input",
            large && "text-2xl py-[22px] pl-9",
          )}
          placeholder="meridian scan  pkg@ver  |  paste a package-lock.json"
        />
        <div
          className={cn(
            "absolute right-0 top-0 text-ink-400 select-none",
            large ? "text-sm py-[24px]" : "text-xs py-[16px]",
          )}
        >
          enter ⏎
        </div>
      </div>

      {!val && (
        <p
          className="mt-3 font-mono text-ink-400 select-none"
          aria-hidden
          style={{ fontSize: large ? 14 : 12 }}
        >
          {GHOST_VERDICT}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-300">
        <span className="text-ink-400 uppercase tracking-widest mr-1">try</span>
        {EXAMPLES.map((ex) => (
          <button
            type="button"
            key={ex.label}
            onClick={() => router.push(`/scan/${encodeURIComponent(ex.label)}`)}
            className={cn(
              "tile-button group flex items-center gap-2",
            )}
          >
            <span
              className={cn(
                "bullet",
                ex.tone === "high" && "high",
                ex.tone === "warn" && "warn",
                ex.tone === "crit" && "crit",
                ex.tone === "ok" && "ok",
              )}
            >
              {ex.tone}
            </span>
            <span className="cell">{ex.label}</span>
          </button>
        ))}
      </div>
    </form>
  );
}
