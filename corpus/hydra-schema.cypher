// Meridian graph schema — what we load into HydraDB and what the six tiles query.
//
// Endpoint:  POST {HYDRADB_URL}/v1/graphs/{graph}/query
// Auth:      Authorization: Bearer {HYDRADB_API_KEY}   (HYDRADB_API_KEY == contents of GRAPH_AUTH_TOKEN_FILE)
// Body:      { "cell_id": "cell-0", "query_id": "...", "query": "...", "page_size": 1000 }
//
// All node matches are keyed on `id`. HydraDB does not require CREATE CONSTRAINT
// statements for correctness, but unique-id enforcement still speeds up the
// planner; we codify it below as a comment for the reviewer.
//
// =============================================================================
// NODE TYPES
// =============================================================================
//
// Each node carries a stable string `id` and the labels shown below.
//
// (:Package)             — an ecosystem + name pair
//   id = "pkg:{ecosystem}:{name}"           e.g.  pkg:npm:express
//   props: ecosystem (npm|pypi), name, downloads_30d, last_published
//
// (:Version)             — one released version of a Package
//   id = "ver:{ecosystem}:{name}@{version}" e.g.  ver:npm:express@4.18.2
//   props: ecosystem, name, version, first_published, deprecated
//
// (:Service)             — internal application / registry that depends on a Package
//   id = "svc:{org}:{service}"              e.g.  svc:acme:checkout-api
//   props: org, name, runtime, deployed_at
//
// (:Lockfile)            — package-lock.json / poetry.lock / Pipfile.lock snapshot
//   id = "lock:{ecosystem}:{service}@{date}" e.g. lock:npm:checkout-api@2026-05-12
//   props: ecosystem, service, snapshot_date, resolved_count
//
// (:Repo)                — the source repo a Version was published from
//   id = "repo:{ecosystem}:{name}"          e.g.  repo:npm:express
//   props: ecosystem, name, stars, has_ci
//
// (:Maintainer)          — npm/PyPI author identity
//   id = "maint:{ecosystem}:{name}"         e.g.  maint:npm:dougwilson
//   props: ecosystem, name, packages_count, email
//
// (:Advisory)            — OSV / GHSA advisory on a Package
//   id = "adv:{ecosystem}:{cve_or_ghsa}"    e.g.  adv:npm:GHSA-xxxx-yyyy-zzzz
//   props: ecosystem, id_alias, severity, summary, published_at
//
// (:Typosquat)           — a candidate name sitting close to a popular Package
//   id = "typo:{target}->{candidate}"       e.g.  typo:npm:express->expresss
//   props: target, candidate, distance, registered_at
//
// =============================================================================
// RELATIONSHIP TYPES
// =============================================================================
//
// (:Package)-[:HAS_VERSION]->(:Version)
// (:Version)-[:DEPENDS_ON]->(:Package)                // direct dependency
// (:Package)-[:PUBLISHED_TO]->(:Repo)
// (:Repo)-[:MAINTAINED_BY]->(:Maintainer)
// (:Service)-[:DEPENDS_ON]->(:Package)               // service → package via dep graph
// (:Lockfile)-[:RESOLVES]->(:Version)
// (:Advisory)-[:AFFECTS]->(:Package)
// (:Maintainer)-[:MAINTAINS]->(:Package)             // sibling-package lookup
// (:Package)-[:TYPOSQUAT_OF]->(:Package)             // candidate edge
//
// =============================================================================
// CONSTRAINT EQUIVALENTS (commentary — HydraDB matches on id, so MERGE-by-id
// already enforces uniqueness):
// =============================================================================
//
//   CREATE CONSTRAINT package_uniq   IF NOT EXISTS FOR (n:Package)  REQUIRE n.id IS UNIQUE
//   CREATE CONSTRAINT version_uniq   IF NOT EXISTS FOR (n:Version)  REQUIRE n.id IS UNIQUE
//   CREATE CONSTRAINT service_uniq   IF NOT EXISTS FOR (n:Service)  REQUIRE n.id IS UNIQUE
//   CREATE CONSTRAINT lockfile_uniq  IF NOT EXISTS FOR (n:Lockfile) REQUIRE n.id IS UNIQUE
//   CREATE CONSTRAINT repo_uniq      IF NOT EXISTS FOR (n:Repo)     REQUIRE n.id IS UNIQUE
//   CREATE CONSTRAINT maintainer_uniq IF NOT EXISTS FOR (n:Maintainer) REQUIRE n.id IS UNIQUE
//   CREATE CONSTRAINT advisory_uniq  IF NOT EXISTS FOR (n:Advisory) REQUIRE n.id IS UNIQUE
//   CREATE CONSTRAINT typosquat_uniq IF NOT EXISTS FOR (n:Typosquat) REQUIRE n.id IS UNIQUE
//
// =============================================================================
// THE SIX MERIDIAN TILE QUERIES (excerpts from src/lib/cypher.ts)
// =============================================================================
//
//   Tile 1 — exposed-services (4-hop reverse-dep closure)
//   ┌────────────────────────────────────────────────────────────────────────┐
//   │ MATCH (bad:Version {ecosystem:$eco, name:$name, version:$version})    │
//   │       <-[:DEPENDS_ON*1..6]-(svc:Service)                              │
//   │ RETURN svc.id              AS service,                                │
//   │        svc.runtime         AS runtime,                                │
//   │        svc.org             AS org,                                    │
//   │        length(path)        AS hops                                    │
//   │ ORDER BY hops, service                                                          │
//   └────────────────────────────────────────────────────────────────────────┘
//
//   Tile 2 — intro-version (which version introduced the vulnerability)
//   ┌────────────────────────────────────────────────────────────────────────┐
//   │ MATCH (a:Advisory)-[:AFFECTS]->(v:Version {ecosystem:$eco, name:$name})│
//   │   WHERE v.version >= $version                                         │
//   │ OPTIONAL MATCH (v)-[:PUBLISHED_TO]->(r:Repo)                          │
//   │ RETURN v.version        AS version,                                   │
//   │        v.first_published AS published,                                │
//   │        r.id              AS repo,                                     │
//   │        a.severity        AS severity                                  │
//   │ ORDER BY published                                                      │
//   └────────────────────────────────────────────────────────────────────────┘
//
//   Tile 3 — lockfile-consumers (which apps locked the bad version)
//   ┌────────────────────────────────────────────────────────────────────────┐
//   │ MATCH (v:Version {ecosystem:$eco, name:$name, version:$version})      │
//   │       <-[:RESOLVES]-(lf:Lockfile)                                     │
//   │ RETURN lf.id              AS lockfile,                                │
//   │        lf.org             AS org,                                     │
//   │        lf.service         AS service,                                 │
//   │        lf.snapshot_date   AS snapshot                                 │
//   │ ORDER BY snapshot DESC                                                     │
//   └────────────────────────────────────────────────────────────────────────┘
//
//   Tile 4 — sibling-packages (which packages share a maintainer)
//   ┌────────────────────────────────────────────────────────────────────────┐
//   │ MATCH (bad:Package {ecosystem:$eco, name:$name})                      │
//   │       <-[:MAINTAINS]-(m:Maintainer)-[:MAINTAINS]->(sib:Package)        │
//   │ WHERE sib <> bad                                                      │
//   │ RETURN sib.name           AS package,                                  │
//   │        sib.ecosystem      AS ecosystem,                                │
//   │        m.name             AS maintainer,                               │
//   │        count(*) AS shared_edges                                       │
//   │ ORDER BY shared_edges DESC, package                                    │
//   └────────────────────────────────────────────────────────────────────────┘
//
//   Tile 5 — typosquats (edit-distance-2 candidates)
//   ┌────────────────────────────────────────────────────────────────────────┐
//   │ MATCH (bad:Package {ecosystem:$eco, name:$name})<-[:TYPOSQUAT_OF]-(c) │
//   │ RETURN c.id                                                   AS node, │
//   │        c.candidate                                          AS candidate, │
//   │        c.distance                                            AS distance  │
//   │ ORDER BY distance, candidate                                                      │
//   └────────────────────────────────────────────────────────────────────────┘
//
//   Tile 6 — blast-radius (the head-line aggregate)
//   ┌────────────────────────────────────────────────────────────────────────┐
//   │ MATCH (bad:Version {ecosystem:$eco, name:$name, version:$version})    │
//   │ OPTIONAL MATCH (bad)<-[:DEPENDS_ON*1..6]-(svc:Service)                │
//   │ WITH bad, collect(DISTINCT svc.id) AS services                         │
//   │ OPTIONAL MATCH (bad)<-[:RESOLVES]-(lf:Lockfile)                        │
//   │ WITH bad, services, collect(DISTINCT lf.id) AS lockfiles               │
//   │ OPTIONAL MATCH (bad:Package)<-[:TYPOSQUAT_OF]-(c)                      │
//   │ WITH bad, services, lockfiles, collect(DISTINCT c.candidate) AS typos  │
//   │ RETURN size(services) AS services,                                      │
//   │        size(lockfiles) AS lockfiles,                                    │
//   │        size(typos) AS typosquats                                       │
//   └────────────────────────────────────────────────────────────────────────┘
//
// =============================================================================
// LOAD ORDER (see corpus/load.mjs)
// =============================================================================
//
//  1. Packages            (MERGE (n:Package {id: $id}))
//  2. Versions            (MERGE (n:Version {id: $id}))
//  3. Repos               (MERGE (n:Repo    {id: $id}))
//  4. Maintainers         (MERGE (n:Maintainer {id: $id}))
//  5. Advisories          (MERGE (n:Advisory {id: $id}))
//  6. Services            (MERGE (n:Service {id: $id}))
//  7. Lockfiles           (MERGE (n:Lockfile {id: $id}))
//  8. Typosquats          (MERGE (n:Typosquat {id: $id}))
//  9. Edges (Package→Version HAS_VERSION, Version → Package DEPENDS_ON,
//            Service → Package DEPENDS_ON,    Repo → Maintainer MAINTAINED_BY,
//            Maintainer → Package MAINTAINS, Lockfile → Version RESOLVES,
//            Advisory → Package AFFECTS,      Typosquat → Package TYPOSQUAT_OF)
//
// Each step parameters every value, so no string interpolation. Load steps run
// in batches of 200 rows per HTTP request so the planner's per-cell limit does
// not starve out other queries on the same cell.
//
// File manifest:
//   corpus/packages.jsonl.gz      — line: {kind: 'npm'|'pypi', name: string}
//   corpus/edges.jsonl.gz         — line: {from: 'pkg:...', to: 'pkg:...', kind: 'DEPENDS_ON'}
//   corpus/versions.jsonl.gz      — line: {package: 'pkg:...', version: string}
//   corpus/maintainers.jsonl.gz   — line: {id: 'maint:...', package: 'pkg:...', ecosystem}
//   corpus/siblings.jsonl.gz      — line: {maintainer: 'maint:...', package: 'pkg:...', tag}
//   corpus/typosquats.jsonl.gz    — line: {target: 'pkg:...', candidate: 'pkg:...', distance}
//   corpus/advisories.jsonl.gz    — line: full OSV-shape JSON
//   corpus/lockfiles.jsonl.gz     — line: synthetic lockfile snapshot
