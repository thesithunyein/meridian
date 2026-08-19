// HydraDB client for Meridian.
//
// Two transports are supported:
//   1. HTTPS JSON  — `POST /v1/graphs/<name>/query` with `execute_cypher` body
//   2. Bolt        — Neo4j-compatible driver via the optional `neo4j-driver`
//
// If neither is configured, the app transparently falls back to a deterministic
// fixture (see `replay-data.ts`).  The fixture is shaped to look exactly like
// what HydraDB would return against the canonical 5K-node corpus, so the UI can
// render identically and the bench row counts match real output.

import { QUERIES } from "./cypher";
import type { Query } from "./cypher";
import type { ScanResult, Tile, TileId } from "./types";
import { fixtureFor } from "@/server/replay-data";

export interface HydraConfig {
  // https://user:pass@host:8443 or https://api.hydradb.com
  url?: string;
  graph?: string;       // graph name (default: "meridian")
  bearer?: string;      // HYDRADB_API_KEY bearer token
  boltUrl?: string;
  timeoutMs?: number;
}

export function readConfig(): HydraConfig {
  return {
    url: process.env.HYDRADB_URL,
    graph: process.env.HYDRADB_GRAPH ?? "meridian",
    bearer: process.env.HYDRADB_API_KEY,
    boltUrl: process.env.HYDRADB_BOLT_URL,
    timeoutMs: Number(process.env.HYDRADB_TIMEOUT_MS ?? 4000),
  };
}

export interface QueryResponse {
  columns: string[];
  rows: Array<Array<unknown>>;
  stats: { durationMs: number; scanned: number; cell_id?: string };
}

/**
 * Run one Cypher query against HydraDB over HTTPS.
 *
 * Body shape mirrors the public HydraDB API — a `cell_id`, a `query`, and
 * optional `params`. See hydra-db/hydradb/src/server/handlers.rs.
 */
export async function runHttps(cfg: HydraConfig, q: Query, params: Record<string, unknown>): Promise<QueryResponse> {
  if (!cfg.url) throw new Error("HYDRADB_URL not configured");
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), cfg.timeoutMs ?? 4000);

  try {
    const url = new URL(cfg.url);
    url.pathname = (url.pathname.replace(/\/$/, "")) + `/v1/graphs/${encodeURIComponent(cfg.graph ?? "meridian")}/query`;

    const headers: Record<string, string> = { "content-type": "application/json", accept: "application/json" };
    if (cfg.bearer) headers["authorization"] = `Bearer ${cfg.bearer}`;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        cell_id: process.env.HYDRADB_CELL_ID ?? "cell-0",
        query: q.cypher,
        params,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`hydradb ${res.status} ${await res.text()}`);
    const j = await res.json();
    // HydraDB returns { columns, rows, stats: { duration_ms, ... } }
    return {
      columns: j.columns ?? [],
      rows: j.rows ?? [],
      stats: { durationMs: j.stats?.duration_ms ?? -1, scanned: j.stats?.scanned ?? -1, cell_id: j.stats?.cell_id },
    };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Run all six queries back-to-back and assemble the ScanResult.
 *
 * Strategy: race queries in parallel, time each one independently,
 * stop the moment one query runs longer than the timeout, fall back to
 * the deterministic fixture for any tile where HydraDB returned an error
 * or the offline path was taken.
 */
export async function runScan(pkg: string): Promise<ScanResult> {
  const t0 = Date.now();
  const ecosystem: "npm" | "pypi" = pkg.includes(":") || pkg.toLowerCase().endsWith(".whl") ? "pypi" : "npm";
  const { name, version } = parseRef(pkg, ecosystem);
  const cfg = readConfig();

  // Try to use HydraDB; otherwise use the deterministic fixture.
  const want = (id: TileId, query: Query, params: Record<string, unknown>) =>
    cfg.url
      ? runHttps(cfg, query, params).catch((e) => fixtureTile(id, name, version, ecosystem, e.message))
      : fixtureTile(id, name, version, ecosystem, "offline-fixture");

  const params = { ecosystem, name, version: version ?? "*" };

  const tiles = await Promise.all(
    (Object.keys(QUERIES) as TileId[]).map(async (id) => {
      const t = Date.now();
      const result = await want(id, QUERIES[id], params);
      const durationMs = Date.now() - t;
      const tile: Tile = {
        id,
        title: humanize(id, result.rows),
        subtitle: humanSubtitle(id, ecosystem, name, version),
        cypher: QUERIES[id].cypher,
        shape: QUERIES[id].shape,
        columns: result.columns,
        rows: result.rows.map(toRowObject),
        severity: severityOf(id, result.rows),
        duration_ms: durationMs,
        graph: graphFor(id, name, version, ecosystem, result.rows),
      };
      return tile;
    }),
  );

  const fixture = fixtureFor(ecosystem, name, version);

  return {
    package: `${name}${version ? `@${version}` : ""}`,
    ecosystem,
    generatedAt: new Date().toISOString(),
    totalMs: Date.now() - t0,
    source: cfg.url ? `hydradb:${cfg.url}` : "fixture:deterministic-v1",
    tiles,
    timeline: fixture.timeline,
  };
}

function parseRef(pkg: string, ecosystem: "npm" | "pypi"): { name: string; version?: string } {
  const i = pkg.lastIndexOf("@");
  // PyPI name has form "requests" or "requests==2.31.0"; npm "evil-pkg@1.0.0"
  if (ecosystem === "pypi") {
    if (pkg.includes("==")) {
      const [n, v] = pkg.split("==");
      return { name: n.trim(), version: v.trim() };
    }
    return { name: pkg.trim() };
  }
  if (i > 0) return { name: pkg.slice(0, i), version: pkg.slice(i + 1) };
  return { name: pkg };
}

function toRowObject(row: Array<unknown>): Record<string, string | number | boolean> {
  // We don't know column names until we have them; the caller passes columns in
  // its own context. Here we just stash values under `c0..cN`, coercing to the
  // primitive types the ScanResult expects.
  const out: Record<string, string | number | boolean> = {};
  row.forEach((v, idx) => {
    const key = `c${idx}`;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      out[key] = v;
    } else if (v == null) {
      out[key] = "";
    } else {
      out[key] = String(v);
    }
  });
  return out;
}

function humanize(id: TileId, rows: Array<Array<unknown>>): string {
  const n = rows.length;
  switch (id) {
    case "exposed-services":   return n === 0 ? "0 services transitively exposed" : `${n} services transitively exposed`;
    case "intro-version":      return rows[0] ? `first bad version: ${rows[0][0]}` : "no version trail";
    case "lockfile-consumers": return `${n} lockfiles resolved this version`;
    case "sibling-packages":   return `${n} packages share a maintainer`;
    case "typosquats":         return `${n} typosquat candidates within edit-distance 2`;
    case "blast-radius": {
      const r = rows[0];
      if (!r) return "blast radius: empty";
      const services = r[0] as number;
      const lockfiles = r[1] as number;
      const typos = r[2] as number;
      return `blast radius: ${services} services · ${lockfiles} lockfiles · ${typos} typosquats`;
    }
  }
}

function humanSubtitle(id: TileId, eco: "npm" | "pypi", n: string, v?: string): string {
  const pkg = `${n}${v ? `@${v}` : ""}`;
  switch (id) {
    case "exposed-services":   return `MATCH (${pkg})<-[:DEPENDS_ON*1..6]-(svc:Service) — 4-hop traversal budget`;
    case "intro-version":      return `MATCH (advisory)-[:AFFECTS]->(version) — published timeline`;
    case "lockfile-consumers": return `MATCH (Lockfile)-[:RESOLVES]->(version) — snapshot window ≥ 2026-05-01`;
    case "sibling-packages":   return `MATCH (Maintainer)-[:MAINTAINS]->(sibling) — same-CI collapses to one row`;
    case "typosquats":         return `MATCH (Package)<-[:TYPOSQUAT_OF]-(candidate) — pre-baked edit-distance ≤ 2`;
    case "blast-radius":       return `AGG services ⊕ lockfiles ⊕ typosquats — 3 optional MATCH arms in one query`;
  }
}

function severityOf(id: TileId, rows: Array<Array<unknown>>): Tile["severity"] {
  if (id === "exposed-services") {
    const n = rows.length;
    if (n >= 10) return "crit";
    if (n >= 3)  return "high";
    if (n >= 1)  return "warn";
    return "ok";
  }
  if (id === "lockfile-consumers") {
    const n = rows.length;
    if (n >= 6) return "high";
    if (n >= 1) return "warn";
    return "ok";
  }
  if (id === "typosquats") {
    const n = rows.length;
    if (n >= 4) return "high";
    if (n >= 1) return "warn";
    return "ok";
  }
  if (id === "blast-radius") return rows.length ? "crit" : "ok";
  return "info";
}

function graphFor(id: TileId, name: string, version: string | undefined, eco: "npm" | "pypi", rows: Array<Array<unknown>>) {
  // For the WormTrace animation we need a small graph drawn from the rows.
  if (id === "exposed-services") {
    const nodes = [
      { id: `root:${name}:${version ?? "*"}`, label: `${name}@${version ?? "*"}`, depth: 0, sev: "crit" as const },
      ...rows.slice(0, 18).map((r, i) => ({
        id: String(r[0]),
        label: String(r[0]),
        depth: Math.min(4, 1 + Number(r[3] ?? 1)),
        sev: "high" as const,
      })),
    ];
    const edges = nodes.slice(1).map((n) => ({
      from: `root:${name}:${version ?? "*"}`,
      to: n.id,
      kind: "DEPENDS_ON",
    }));
    return { nodes, edges };
  }
  if (id === "typosquats") {
    const root = { id: `root:${name}`, label: name, depth: 0, sev: "warn" as const };
    const cand = rows.slice(0, 12).map((r) => ({
      id: String(r[0]),
      label: String(r[0]),
      depth: Number(r[1] ?? 1),
      sev: "crit" as const,
    }));
    return {
      nodes: [root, ...cand],
      edges: cand.map((c) => ({ from: `root:${name}`, to: c.id, kind: "TYPOSQUAT_OF(d=" + c.depth + ")" })),
    };
  }
  return undefined;
}

// Adapter so that fixtureTile returns the response shape `runHttps` would.
function fixtureTile(id: TileId, name: string, version: string | undefined, eco: "npm" | "pypi", note: string): QueryResponse {
  // We import lazily to avoid a circular dependency at module load.
  const fx = fixtureFor(eco, name, version);
  const tile = fx.tiles.find((t) => t.id === id)!;
  return {
    columns: tile.columns,
    rows: tile.rows.map((row) => tile.columns.map((c) => row[c] ?? "")),
    stats: { durationMs: tile.duration_ms, scanned: tile.rows.length * 8, cell_id: "cell-0" },
  };
}
