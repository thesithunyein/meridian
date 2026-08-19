// The six Cypher queries that answer Meridian's six tiles.
// Each query takes named parameters ($ecosystem, $name, $version) — these are
// the ones the UI and the API bind via execute_cypher. The shape annotation is
// what we echo into the bench CSV `optimizer_plan` column.

import type { TileId } from "./types";

export interface Query {
  id: TileId;
  // "cypher" must be parameterized — never interpolate user input.
  cypher: string;
  // planner shape that the bench CSV embeds in `optimizer_plan`.
  shape: string;
  // cost estimate — number of edge scans we expect on a 5K-node corpus.
  cost_hops: number;
}

export const QUERIES: Record<TileId, Query> = {
  // 1. Which internal services are transitively exposed?
  "exposed-services": {
    id: "exposed-services",
    cypher: `
MATCH (bad:Package  { ecosystem:$ecosystem, name:$name, version:$version })
      <-[:DEPENDS_ON*1..6]-(svc:Service)
RETURN svc.id              AS service,
       svc.team            AS team,
       svc.env             AS env,
       length(path)        AS hops
ORDER BY hops ASC, service ASC
LIMIT 200`.trim(),
    shape: "MATCH (bad)<-[:DEPENDS_ON*1..6]-(svc)",
    cost_hops: 6,
  },

  // 2. Which version of a dependency introduced the vulnerability?
  "intro-version": {
    id: "intro-version",
    cypher: `
MATCH (a:Advisory)-[:AFFECTS]->(v:Version { ecosystem:$ecosystem, name:$name })
  WHERE v.version >= $version
OPTIONAL MATCH (v)-[:PUBLISHED_TO]->(r:Repo)
RETURN v.version                     AS version,
       v.first_published             AS published,
       coalesce(r.url, '—')          AS repo,
       exists((v)-[:INSTALLED_DURING_COMPROMISE]->()) AS live_during_compromise
ORDER BY v.version ASC
LIMIT 50`.trim(),
    shape: "MATCH (adv)-[:AFFECTS]->(v) OPTIONAL MATCH (v)-[:PUBLISHED_TO]->(r)",
    cost_hops: 2,
  },

  // 3. Which applications resolved the compromised version while it was live?
  "lockfile-consumers": {
    id: "lockfile-consumers",
    cypher: `
MATCH (v:Version { ecosystem:$ecosystem, name:$name, version:$version })
      <-[:RESOLVES]-(lf:Lockfile)
      <-[:USES_LOCKFILE]-(app:Service)
WHERE lf.snapshot_ts >= datetime('2026-05-01')
RETURN lf.id                AS lockfile,
       app.id               AS service,
       app.team             AS team,
       lf.snapshot_ts       AS captured,
       lf.compromised_window AS window
ORDER BY lf.snapshot_ts ASC
LIMIT 200`.trim(),
    shape: "3-step join (v)<-[:RESOLVES]-(lf)<-[:USES_LOCKFILE]-(app)",
    cost_hops: 3,
  },

  // 4. Which other packages share a maintainer or infrastructure?
  "sibling-packages": {
    id: "sibling-packages",
    cypher: `
MATCH (m:Maintainer)-[:MAINTAINS]->(p:Package { ecosystem:$ecosystem, name:$name })
      <-[:MAINTAINS]-(m)-[:MAINTAINS]->(sib:Package)
WHERE sib <> p
RETURN sib.name              AS package,
       sib.ecosystem         AS ecosystem,
       sib.downloads         AS monthly_downloads,
       exists((sib)-[:HOSTED_ON]->(:Repo { ci:m.ci_handle })) AS same_ci
ORDER BY monthly_downloads DESC
LIMIT 100`.trim(),
    shape: "MATCH (m)-[:MAINTAINS]->(sib) WHERE sib<>p",
    cost_hops: 4,
  },

  // 5. Are there typosquat packages nearby?
  "typosquats": {
    id: "typosquats",
    cypher: `
MATCH (p:Package { ecosystem:$ecosystem, name:$name })
      <-[:TYPOSQUAT_OF { distance: 1..2 }]-(t:Package)
RETURN t.name               AS candidate,
       t.distance           AS edit_distance,
       t.first_published    AS first_seen,
       t.installs_last_30d  AS installs
ORDER BY t.distance ASC, installs DESC
LIMIT 50`.trim(),
    shape: "MATCH (p)<-[:TYPOSQUAT_OF {distance:1..2}]-(t)",
    cost_hops: 2,
  },

  // 6. What is the complete blast radius?
  "blast-radius": {
    id: "blast-radius",
    cypher: `
MATCH (p:Package { ecosystem:$ecosystem, name:$name, version:$version })
OPTIONAL MATCH (p)<-[:DEPENDS_ON*1..4]-(svc:Service)
WITH p, collect(DISTINCT svc) AS services
OPTIONAL MATCH (p)<-[:RESOLVES]-(lf:Lockfile)
WITH p, services, collect(DISTINCT lf) AS lockfiles
OPTIONAL MATCH (p)<-[:TYPOSQUAT_OF]-(t:Package)
WITH p, services, lockfiles, collect(DISTINCT t) AS typosquats
RETURN size(services)        AS services_count,
       size(lockfiles)       AS lockfiles_count,
       size(typosquats)      AS typosquats_count,
       services              AS services,
       lockfiles             AS lockfiles
LIMIT 1`.trim(),
    shape: "Aggregate over 3 optional MATCH arms",
    cost_hops: 4,
  },
};

// Human-friendly Cypher title bar for the reveal panel.
export const QUERY_TITLES: Record<TileId, string> = {
  "exposed-services":   "MATCH  ↩  reverse traversal",
  "intro-version":      "MATCH  →  advisory timeline",
  "lockfile-consumers": "MATCH  ←  lockfile snapshot",
  "sibling-packages":   "MATCH  ⇆  maintainer cluster",
  "typosquats":         "MATCH  ❍  edit-distance candidates",
  "blast-radius":       "AGG    ⊕  service / lockfile / typosquat",
};
