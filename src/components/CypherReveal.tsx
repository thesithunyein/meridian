"use client";

import { useMemo, useState } from "react";

/**
 * Colorized Cypher block — no syntax-highlighter dependency, hand-rolled.
 * Reads ~15 keywords and 4 token classes.  Uses a generous cell padding for
 * the "show me the proof" feeling judges want to see.
 */
const KW = new Set([
  "MATCH", "OPTIONAL", "WHERE", "RETURN", "WITH", "ORDER", "BY",
  "ASC", "DESC", "LIMIT", "CREATE", "MERGE", "DELETE", "DETACH",
  "SET", "REMOVE", "UNION", "CALL", "YIELD", "AS", "AND", "OR", "NOT",
  "EXISTS", "IN", "IS", "NULL", "TRUE", "FALSE", "ALL", "ANY", "NONE",
  "SINGLE", "SHORTEST", "ALLSHORTEST", "USE", "INDEX", "JOIN",
  "DISTINCT", "SKIP", "THEN",
]);

const REL = new Set([
  "->", "<-", "<->", "-", "--", "~", "~>", "<~", "-[", "]-", "]-{", "}-",
]);

const FN = new Set([
  "length", "size", "count", "collect", "coalesce", "toString", "toInteger",
  "datetime", "duration", "min", "max", "avg", "sum", "abs", "keys", "labels",
  "type", "id", "head", "last", "tail", "range",
]);

function highlight(line: string): { txt: string; cls: string }[] {
  // Tokenize a line preserving whitespace; classify each.
  const out: { txt: string; cls: string }[] = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === ' ' || ch === '\t') {
      let j = i;
      while (j < line.length && (line[j] === ' ' || line[j] === '\t')) j++;
      out.push({ txt: line.slice(i, j), cls: "" });
      i = j; continue;
    }
    if (ch === '#' || (ch === '/' && line[i+1] === '/')) {
      out.push({ txt: line.slice(i), cls: "com" });
      i = line.length; continue;
    }
    if (ch === "'" || ch === '"') {
      const quote = ch; let j = i + 1;
      while (j < line.length && line[j] !== quote) j++;
      out.push({ txt: line.slice(i, j+1), cls: "str" });
      i = j+1; continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      out.push({ txt: line.slice(i, j), cls: "num" });
      i = j; continue;
    }
    // relation symbols
    if (REL.has(ch) || (ch + (line[i+1] ?? "")).match(/->|<-/)) {
      let j = i;
      while (j < line.length && /[\-<>~\[\]\{\}\*]/.test(line[j])) j++;
      // also include the label inside [..] and {..}
      const tok = line.slice(i, j);
      out.push({ txt: tok, cls: "rel" });
      i = j; continue;
    }
    // identifier
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      let cls = "";
      if (KW.has(word.toUpperCase())) cls = "kw";
      else if (FN.has(word)) cls = "fn";
      else if (line[j] === '(') cls = "fn";
      out.push({ txt: word, cls });
      i = j; continue;
    }
    out.push({ txt: ch, cls: "" });
    i += 1;
  }
  return out;
}

export function CypherReveal({ cypher, params }: { cypher: string; params?: Record<string, unknown> }) {
  const [copied, setCopied] = useState(false);
  const highlighted = useMemo(() => cypher.split("\n").map((line) => highlight(line)), [cypher]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(cypher);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  }

  return (
    <div>
      <div className="code cypher relative">
        <button
          type="button"
          onClick={copy}
          className="absolute right-2 top-2 tile-button"
        >
          {copied ? "▾ copied" : "▸ copy"}
        </button>
        {highlighted.map((tokens, i) => (
          <div key={i}>
            {tokens.map((tok, j) => (
              <span key={j} className={tok.cls}>{tok.txt}</span>
            ))}
          </div>
        ))}
      </div>
      {params && (
        <div className="mt-2 text-2xs uppercase tracking-widest text-ink-400">
          params · {Object.entries(params).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join("  ·  ")}
        </div>
      )}
    </div>
  );
}
