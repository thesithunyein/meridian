// Deterministic replay fixture.
//
// This module produces a ScanResult-shaped object for any (ecosystem, name,
// version) tuple we know about, so the app boots without HydraDB.  The data
// is hand-crafted to match the canonical TanStack-style worm scenario the
// demo video references: 17 services, 4 versions, 6-hour window, 92 lockfile
// rows.  Numbers in the table are reasonable proxies but never claim to be
// HydraDB benchmarks — that's what `pnpm bench` does.

import type { ScanResult, Tile, TileId, Severity } from "@/lib/types";

const NOW = "2026-08-19T22:00:00Z";

const TANSTACK_PROFILES: Record<string, { version: string; services: string[]; lockfiles: string[]; siblings: string[]; typos: string[] }> = {
  "tanstack/react-virtual": {
    version: "3.10.8",
    services: ["checkout-svc", "worker-queue", "edge-router", "auth-api-gw", "billing-svc", "search-svc", "notification-svc", "audit-logger", "tenant-router", "ci-runner-api", "feature-flags-svc", "dlq-pull", "geo-redirector", "session-store", "metrics-collector", "incident-room-bot", "tmpl-renderer"],
    lockfiles: ["apps/web/package-lock.json", "apps/mobile/package-lock.json", "services/checkout/package-lock.json", "services/worker/package-lock.json", "services/edge/package-lock.json", "packages/ui-tw/package-lock.json"],
    siblings: ["tanstack/react-query", "tanstack/react-table", "tanstack/react-router", "tanstack/query-core", "tanstack/virtual-core"],
    typos: ["tanstack/react-virtual1", "tanstack/reactvirt", "tanstack/react-virtualx", "react-virtual-tanstack", "tanstack/react-virtual-old", "@tanstack/react-virtual"],
  },
  "evil-pkg": {
    version: "1.0.0",
    services: ["checkout-svc", "worker-queue", "edge-router", "auth-api-gw", "billing-svc", "pricing-svc", "search-svc", "notification-svc", "audit-logger", "tenant-router", "ci-runner-api", "feature-flags-svc", "dlq-pull", "geo-redirector", "session-store", "metrics-collector", "incident-room-bot"],
    lockfiles: ["apps/web/package-lock.json", "services/checkout/package-lock.json", "services/worker/package-lock.json", "packages/ui-tw/package-lock.json", "packages/util/package-lock.json"],
    siblings: ["evil-pkg-util", "evil-pkg-cli", "evil-cli", "@evil/pkg"],
    typos: ["evil-pkgx", "evilpack", "evilpkg", "evil-pkg-old", "@evil-pkg", "evi1-pkg"],
  },
  "ua-parser-js": {
    version: "0.7.30",
    services: ["checkout-svc", "web-cdn-edge", "geo-redirector", "billing-svc"],
    lockfiles: ["apps/web/package-lock.json", "services/checkout/package-lock.json", "packages/ui-tw/package-lock.json"],
    siblings: ["ua-parser", "node-ua-parser", "useragent"],
    typos: ["ua-parser", "ua-parserjs", "uaparser-js", "ua_parser", "user-agent-parser"],
  },
};

const FALLBACK = {
  version: "1.0.0",
  services: ["checkout-svc", "worker-queue", "edge-router", "auth-api-gw", "billing-svc", "search-svc", "audit-logger", "metrics-collector"],
  lockfiles: ["apps/web/package-lock.json", "services/checkout/package-lock.json"],
  siblings: ["sibling-a", "sibling-b"],
  typos: ["typo-1", "typo-2"],
};

function profileFor(name: string) {
  return TANSTACK_PROFILES[name] ?? FALLBACK;
}

function tile(id: TileId, ecosystem: "npm" | "pypi", name: string, version: string | undefined, services: string[], lockfiles: string[], siblings: string[], typos: string[]): Tile {
  const v = version ?? "*";
  const dur = 35 + ((id.length * 7) + services.length + typos.length) % 25;

  switch (id) {
    case "exposed-services":
      return {
        id, title: `${services.length} services exposed`,
        subtitle: `MATCH (${ecosystem}:${name}@${v})<-[:DEPENDS_ON*1..6]-(svc:Service)`,
        cypher: "MATCH (bad:Package)<-[:DEPENDS_ON*1..6]-(svc:Service) RETURN svc.id, …",
        shape: "MATCH (bad)<-[:DEPENDS_ON*1..6]-(svc)",
        columns: ["service", "team", "env", "hops"],
        rows: services.map((s, i) => ({
          service: s,
          team: ["platform", "checkout", "growth", "billing", "edge"][i % 5],
          env: ["prod", "stage", "prod", "prod", "prod"][i % 5],
          hops: 1 + (i % 4),
        })),
        severity: services.length > 8 ? "crit" : services.length > 3 ? "high" : "warn",
        duration_ms: dur,
      };
    case "intro-version":
      return {
        id, title: `first bad version: 3.10.8`,
        subtitle: `MATCH (advisory)-[:AFFECTS]->(version) — published timeline`,
        cypher: "MATCH (a:Advisory)-[:AFFECTS]->(v:Version) RETURN v.version, …",
        shape: "MATCH (adv)-[:AFFECTS]->(v)",
        columns: ["version", "published", "repo", "live_during_compromise"],
        rows: [
          { version: "3.10.7", published: "2026-07-12", repo: "github.com/TanStack/virtual", live_during_compromise: false },
          { version: "3.10.8", published: "2026-08-14", repo: "github.com/TanStack/virtual", live_during_compromise: true },
          { version: "3.10.9", published: "2026-08-15", repo: "github.com/TanStack/virtual", live_during_compromise: false },
        ],
        severity: "high",
        duration_ms: dur,
      };
    case "lockfile-consumers":
      return {
        id, title: `${lockfiles.length} lockfiles resolved this version`,
        subtitle: `MATCH (Version)<-[:RESOLVES]-(Lockfile)<-[:USES_LOCKFILE]-(Service)`,
        cypher: "MATCH (v:Version)<-[:RESOLVES]-(lf:Lockfile)<-[:USES_LOCKFILE]-(app:Service) RETURN …",
        shape: "3-step join",
        columns: ["lockfile", "service", "team", "captured", "window"],
        rows: lockfiles.map((l, i) => ({
          lockfile: l,
          service: services[i % services.length],
          team: ["platform", "checkout", "growth", "billing", "edge"][i % 5],
          captured: `2026-08-1${(i % 8) + 1}T0${i % 9}:00Z`,
          window: "4h 12m",
        })),
        severity: lockfiles.length > 4 ? "high" : "warn",
        duration_ms: dur,
      };
    case "sibling-packages":
      return {
        id, title: `${siblings.length} packages share a maintainer`,
        subtitle: `MATCH (Maintainer)-[:MAINTAINS]->(sibling) — same-CI clusters collapse`,
        cypher: "MATCH (m)-[:MAINTAINS]->(sib:Package) WHERE sib<>p RETURN sib.name, …",
        shape: "MATCH (m)-[:MAINTAINS]->(sib)",
        columns: ["package", "ecosystem", "monthly_downloads", "same_ci"],
        rows: siblings.map((s, i) => ({
          package: s, ecosystem: i % 2 === 0 ? "npm" : "pypi",
          monthly_downloads: 240000 - i * 17000,
          same_ci: i === 0,
        })),
        severity: "info",
        duration_ms: dur,
      };
    case "typosquats":
      return {
        id, title: `${typos.length} typosquat candidates within edit-distance 2`,
        subtitle: `MATCH (Package)<-[:TYPOSQUAT_OF { distance: 1..2 }]-(candidate)`,
        cypher: "MATCH (p)<-[:TYPOSQUAT_OF {distance:1..2}]-(t) RETURN t.name, …",
        shape: "edit-distance join",
        columns: ["candidate", "edit_distance", "first_seen", "installs"],
        rows: typos.map((t, i) => ({
          candidate: t,
          edit_distance: 1 + (i % 2),
          first_seen: `2026-08-${10 + i}T0${i}:00Z`,
          installs: 1280 - i * 110,
        })),
        severity: typos.length > 4 ? "high" : "warn",
        duration_ms: dur,
      };
    case "blast-radius":
      return {
        id, title: `blast radius: ${services.length} services · ${lockfiles.length} lockfiles · ${typos.length} typosquats`,
        subtitle: `AGG services ⊕ lockfiles ⊕ typosquats — 3 optional MATCH arms in one query`,
        cypher: "MATCH (p) OPTIONAL MATCH … RETURN size(…) AS services_count, …",
        shape: "AGG over 3 arms",
        columns: ["services_count", "lockfiles_count", "typosquats_count"],
        rows: [{
          services_count: services.length,
          lockfiles_count: lockfiles.length,
          typosquats_count: typos.length,
        }],
        severity: services.length > 8 ? "crit" : "ok",
        duration_ms: dur,
      };
  }
}

export function fixtureFor(ecosystem: "npm" | "pypi", name: string, version: string | undefined): { tiles: Tile[]; timeline: NonNullable<ScanResult["timeline"]> } {
  const p = profileFor(name);
  const ids: TileId[] = ["exposed-services", "intro-version", "lockfile-consumers", "sibling-packages", "typosquats", "blast-radius"];
  const tiles: Tile[] = ids.map((id) => tile(id, ecosystem, name, version, p.services, p.lockfiles, p.siblings, p.typos));

  const timeline: NonNullable<ScanResult["timeline"]> = [
    { t: 0,    kind: "publish",   label: `${name}@${p.version} published clean`,  pkg: name },
    { t: 60_000,   kind: "install",   label: `+dependency.added  chalk-extra 0.0.1` },
    { t: 120_000,  kind: "publish",   label: `${name}@${p.version} rebuilt with payload`, pkg: name },
    { t: 180_000,  kind: "alert",     label: `typosquat install spike 240×  chalk-extras` },
    { t: 240_000,  kind: "install",   label: `co-maintainer vit-dev-bot  12 ops/min` },
    { t: 300_000,  kind: "lockfile",  label: `${p.lockfiles.length} lockfiles × ${p.services.length} services resolved the bad version` },
    { t: 360_000,  kind: "guard",     label: `breach window 4h 12m  push guard  ⚑` },
  ];

  return { tiles, timeline };
}

// The replay scenario that's used by /replay — a single-shot TanStack-worm
// walkthrough.  We keep it as a static story so the animation is deterministic.
export const TANSTACK_REPLAY = {
  ecosystem: "npm" as const,
  name: "tanstack/react-virtual",
  version: "3.10.8",
  // Number of dots on the timeline — read by /replay and the WormTrace panel.
  events: [
    { t: 0,    kind: "publish",  label: "tanstack/react-virtual@3.10.7  ok" },
    { t: 60,   kind: "install",  label: "+dependency.added    chalk-extra 0.0.1" },
    { t: 120,  kind: "publish",  label: "tanstack/react-virtual@3.10.8  publish" },
    { t: 180,  kind: "alert",    label: "▸ typo: chalk-extras (ed=1) install spikes 240×" },
    { t: 240,  kind: "install",  label: "▸ co-maintainer: vit-dev-bot  12 ops/min" },
    { t: 300,  kind: "lockfile", label: "▸ 17 lockfile rows × 14 services" },
    { t: 360,  kind: "guard",    label: "▸ breach window 4h 12m  guard ⚑" },
  ],
};

// Convenience: public list of bundled sample packages — surfaced in the
// homepage CTA and as /scan shortcodes.
export const SAMPLE_PACKAGES = [
  { pkg: "tanstack/react-virtual@3.10.8", note: "TanStack worm" },
  { pkg: "evil-pkg@1.0.0",                note: "CVE-2026-1337" },
  { pkg: "ua-parser-js@0.7.30",           note: "predetermined-bad" },
  { pkg: "lodash",                        note: "clean baseline" },
] as const;

export function severityCss(s: Severity) {
  return s;
}
