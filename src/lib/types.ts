// Shared domain types for Meridian. Used everywhere — scan page, API routes,
// bench, replay, and the WormTrace animation.

export type Severity = "crit" | "high" | "warn" | "ok" | "info";

export interface Tile {
  id: TileId;
  title: string;          // human answer, e.g. "17 services exposed"
  subtitle: string;       // one-line context
  cypher: string;
  shape: string;          // shape annotation for the judge
  columns: string[];      // table columns
  rows: Array<Record<string, string | number | boolean>>;
  severity: Severity;
  duration_ms: number;    // observed query time
  // The trace data — used by the WormTrace animation and the bench.
  graph?: {
    nodes: Array<{ id: string; label: string; depth: number; sev?: Severity }>;
    edges: Array<{ from: string; to: string; kind: string }>;
  };
}

export type TileId =
  | "exposed-services"
  | "intro-version"
  | "lockfile-consumers"
  | "sibling-packages"
  | "typosquats"
  | "blast-radius";

export interface ScanResult {
  package: string;        // e.g. "tanstack/react-virtual@3.10.8"
  ecosystem: "npm" | "pypi";
  generatedAt: string;    // ISO timestamp
  totalMs: number;        // wall-clock for all six queries
  tiles: Tile[];
  // Provenance: which corpus, which hydrate (HYDRADB_URL or "fixture").
  source: string;
  // For replay/WormTrace: an aligned sequence of timestamps in milliseconds
  // that the UI can stream from t=0 to t=horizon.
  timeline?: Array<{ t: number; kind: "publish" | "install" | "alert" | "yank" | "lockfile" | "guard"; label: string; pkg?: string }>;
}

// The body of the POST /api/scan request.
export interface ScanRequest {
  package: string;        // e.g. "evil-pkg@1.0.0" or "tanstack/react-virtual"
  ecosystem?: "npm" | "pypi";
}
