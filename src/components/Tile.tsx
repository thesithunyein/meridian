"use client";

import { useState } from "react";
import type { Tile } from "@/lib/types";
import { CypherReveal } from "@/components/CypherReveal";

const SEVERITY: Record<Tile["severity"], string> = {
  crit: "glass-card glass-card--level-1 stripe-border-strip stripe-border-strip--crit",
  high: "glass-card glass-card--level-1 stripe-border-strip stripe-border-strip--high",
  warn: "glass-card glass-card--level-1 stripe-border-strip stripe-border-strip--warn",
  ok:   "glass-card glass-card--level-1 stripe-border-strip stripe-border-strip--ok",
  info: "glass-card glass-card--level-1 stripe-border-strip stripe-border-strip--info",
};

export function TilePanel({ t }: { t: Tile }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={SEVERITY[t.severity]}>
      <header className="glass-card-header">
        <span className={`bullet-bordered bullet-bordered--${t.severity}`}>
          {t.severity.toUpperCase()}
        </span>
        <h3 className="text-md font-semibold text-ink-50">{t.title}</h3>
        <span className="ml-auto text-2xs uppercase tracking-widest text-ink-400 cell-mono">
          {t.rows.length} rows · {t.duration_ms}ms
        </span>
      </header>
      <p className="glass-card-subtitle">{t.subtitle}</p>
      <div className="glass-card-table">
        <table className="w-full text-xs">
          <thead className="text-2xs uppercase tracking-widest text-ink-400">
            <tr>
              {t.columns.map((c) => (
                <th key={c} className="text-left py-1 pr-3 cell-mono">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.rows.slice(0, 30).map((row, i) => (
              <tr key={i} className="table-row-line">
                {t.columns.map((c) => (
                  <td key={c} className="py-1 pr-3 cell-mono text-ink-200">
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
      <footer className="glass-card-footer">
        <button
          type="button"
          className="btn btn-ghost btn-ghost--mini"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "▾ hide cypher" : "▸ show cypher"}
        </button>
        <span className="text-2xs uppercase tracking-widest text-ink-400 cell-mono">
          shape · {t.shape}
        </span>
      </footer>
      {open && (
        <div className="px-4 pb-4">
          <CypherReveal
            cypher={t.cypher}
            params={{ ecosystem: "npm", name: t.id.split("-")[0], version: "*" }}
          />
        </div>
      )}
    </article>
  );
}
