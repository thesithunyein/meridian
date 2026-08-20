# Meridian

> **Plain-English blast-radius engine for npm and PyPI.**
> Six deterministic Cypher queries against [HydraDB](https://github.com/hydra-db/hydradb).
> No LLM. No vector search. Reproducible to the byte.

**Live:** [meridian.sithunyein.com](https://meridian.sithunyein.com)
**Hackathon:** [Hack Hydra](https://hackhydra.hydradb.com) — Track A (Supply Chain Blast Radius)
**License:** Apache-2.0

![Meridian banner](public/og-banner.png)

---

## The Problem

When a package gets compromised, you need to answer six questions **fast**:

1. Which internal services are transitively exposed?
2. Which version introduced the vulnerability?
3. Which applications resolved the bad version while it was live?
4. Which other packages share a maintainer or infrastructure?
5. Are there likely typosquat packages nearby?
6. What is the complete blast radius?

These are **graph traversal questions** — not semantic similarity questions. A vector index
cannot answer them. A dependency graph database can.

---

## How Meridian Uses HydraDB

Meridian stores the full npm and PyPI dependency graph in HydraDB and runs six
deterministic Cypher queries against it. Each query answers one security question:

| # | Tile | Cypher Pattern | Question |
|---|------|---------------|----------|
| 1 | `exposed-services` | `MATCH (pkg)<-[:DEPENDS_ON*1..6]-(svc)` | Which services transitively depend on this version? |
| 2 | `intro-version` | `MATCH (Advisory)-[:AFFECTS]->(Version)` | Which version introduced the vulnerability? |
| 3 | `lockfile-consumers` | `MATCH (Lockfile)-[:RESOLVES]->(Version)` | Which lockfiles resolved the bad version? |
| 4 | `sibling-packages` | `MATCH (pkg)<-[:MAINTAINED_BY]-(m)-[:MAINTAINED_BY]->(sib)` | Which packages share a maintainer? |
| 5 | `typosquats` | `MATCH (p)<-[:TYPOSQUAT_OF]-(t)` | Are there edit-distance neighbours nearby? |
| 6 | `blast-radius` | `count(svc) from Package fan-in` | What is the complete blast radius? |

The queries live in [`src/lib/cypher.ts`](src/lib/cypher.ts). Open the file and read them.
Each takes named parameters — there is no string interpolation of user input.

### Why HydraDB?

- **Graph-native traversal** — 6-hop reverse dependency walk, not embedding similarity
- **OpenCypher** — standard query language, readable by any graph engineer
- **Real-time** — cold queries ~250ms, hot queries ~80ms on the 5K-node fixture
- **Deterministic** — same input, same output, byte for byte. No model in the answer path.

---

## What You See

Open [meridian.sithunyein.com](https://meridian.sithunyein.com), paste a package name, and get:

1. **One English sentence** — the verdict, derived from graph data
2. **One fix command** — copy-pasteable, version-specific
3. **Six tiles** — each showing the raw Cypher query and its results
4. **Worm trace** — animated timeline of the compromise spreading through your stack
5. **Bench** — HydraDB-shaped CSV, same columns as `examples/query_bench.rs`

---

## Run Locally

```bash
# 1. Install
pnpm i      # or: npm i

# 2. Seed the corpus (~30 s, idempotent)
pnpm seed

# 3. Bring up HydraDB
docker compose up -d hydradb
docker compose run --rm meridian-load

# 4. Raise the scan-edge budget for the 4-hop traversal in tile 1
pnpm budget --max-scan-edges 120000

# 5. Run the Next.js app
pnpm dev    # http://localhost:3000
```

If `HYDRADB_URL` is empty, the app hydrates from a deterministic 5K-node
fixture in `src/server/replay-data.ts`. You can `pnpm dev` without Docker
and every route still works.

---

## Routes

| Route | What it is |
|-------|-----------|
| `/` | Landing. Search box, recent exploits, six queries. |
| `/scan/<pkg@ver>` | Scan page. Verdict + six tiles + worm trace. |
| `/replay` | Pre-rendered WormTrace for the TanStack scenario. |
| `/bench` | HydraDB-shaped CSV, downloadable at `/api/bench`. |
| `/how` | Operating steps, schema cards, the six queries. |
| `/api/scan/<pkg@ver>` | JSON. Same data as the scan page. |
| `/api/bench` | CSV. Same column shape as `query_bench.rs`. |
| `/api/health` | `{"ok":true,"source":"fixture\|hydradb:..."}`. |
| `/api/stats` | Live graph node/edge counts from HydraDB. |

---

## Benchmarks

Wall-clock for the six queries, measured on the included 5K-node / 18K-edge fixture:

| Metric | Cold | Hot (1k reuse) |
|--------|------|----------------|
| Total | ~250ms | ~80ms |
| `exposed-services` (tile 1) | ~110ms | ~22ms |
| p95 hot-query | — | <60µs |

---

## Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| App | Next.js 14 (App Router) | Standalone build, runs anywhere Node runs. |
| Style | Tailwind 3.4 | Tokens in `globals.css`. Hand-written components. |
| Graph | HydraDB 0.7.2 | Bolt + HTTPS transports, OpenCypher. |
| Data | OSV + GHSA + npm + PyPI registries | Public feeds, refreshed on `pnpm seed`. |
| License | Apache-2.0 | Copyright 2026 Sithu Nyein. |

---

## Repo Layout

```
src/
  app/
    layout.tsx, globals.css, page.tsx               # landing
    scan/[pkg]/page.tsx                            # scan
    replay/page.tsx                                # worm trace full
    bench/page.tsx                                 # bench table
    how/page.tsx                                   # methodology
    api/{scan/[pkg],bench,health,stats}/route.ts   # JSON / CSV
  components/
    Nav.tsx, Footer.tsx, BrandGlyph.tsx
    CommandSearch.tsx
    VerdictCard.tsx, Tile.tsx, SixTiles.tsx
    CypherReveal.tsx
    WormTrace.tsx
  lib/
    cypher.ts                                      # the six queries
    hydra.ts                                       # Bolt + HTTPS client
    types.ts
    cn.ts
  server/
    replay-data.ts                                 # deterministic 5K-node fixture

corpus/             # seed.py + manifest.json + cache/*.jsonl.gz
scripts/brand.py    # rebuilds /public/{glyph,favicon,og-banner}.png
scripts/bench.py    # emits bench/out/cypher_bench.csv
public/             # brand kit + scanline bg
```

---

## Maintainer

Sithu Nyein — [sithunyein.mailto@gmail.com](mailto:sithunyein.mailto@gmail.com)
