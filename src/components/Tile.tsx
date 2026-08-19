"use client";

import { useState } from "react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { CypherReveal } from "@/components/CypherReveal";
import type { Tile } from "@/lib/types";

export function TilePanel({ t }: { t: Tile }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={`border border-ink-600 bg-ink-900 ${
      t.severity === "crit" ? "stripe-crit"
      : t.severity === "high" ? "stripe-high"
      : t.severity === "warn" ? "stripe-warn"
      : t.severity === "ok"   ? "stripe-ok"
      : "stripe-info"
    }`}>
      <header className="px-4 py-3 border-b border-ink-600 flex items-center gap-3">
        <SeverityBadge s={t.severity} />
        <h3 className="text-md font-semibold text-ink-50">{t.title}</h3>
        <span className="ml-auto text-2xs uppercase tracking-widest text-ink-400 cell">
          {t.rows.length} rows · {t.duration_ms}ms
        </span>
      </header>
      <p className="px-4 py-3 text-xs text-ink-300 border-b border-ink-600">
        {t.subtitle}
      </p>
      <div className="px-4 py-3 max-h-[260px] overflow-auto">
        <table className="w-full text-xs">
          <thead className="text-2xs uppercase tracking-widest text-ink-400">
            <tr>
              {t.columns.map((c) => <th key={c} className="text-left py-1 pr-3 cell">{c}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {t.rows.slice(0, 30).map((row, i) => (
              <tr key={i} className="hover:bg-ink-800">
                {t.columns.map((c) => (
                  <td key={c} className="py-1 pr-3 cell text-ink-200">
                    {String(row[c] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {t.rows.length > 30 && (
          <div className="mt-2 text-2xs uppercase tracking-widest text-ink-400">
            + {t.rows.length - 30} more rows · expand to see
          </div>
        )}
      </div>
      <footer className="px-4 py-2 border-t border-ink-600 flex items-center justify-between">
        <button
          type="button"
          className="tile-button"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "▾ hide cypher" : "▸ show cypher"}
        </button>
        <span className="text-2xs uppercase tracking-widest text-ink-400 cell">
          shape · {t.shape}
        </span>
      </footer>
      {open && (
        <div className="px-4 pb-4">
          <CypherReveal cypher={t.cypher} params={{ ecosystem: "npm", name: t.id.split("-")[0], version: "*" }} />
        </div>
      )}
    </article>
  );
}
