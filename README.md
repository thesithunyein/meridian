# Meridian

Plain-English blast-radius engine for npm and PyPI.

Open https://meridian.sithunyein.com, paste a package name, get one
English sentence and a fix command.

![Meridian banner](public/og-banner.png)

The sentence is produced by six deterministic Cypher queries against
[HydraDB](https://github.com/hydra-db/hydradb). There is no LLM in
the answer path. Every tile on a scan page is reproducible to the byte.

---

## What it does

| # | Tile                  | Question it answers                                              |
|---|-----------------------|------------------------------------------------------------------|
| 1 | `exposed-services`    | Which internal services transitively depend on this version?    |
| 2 | `intro-version`       | Which version of the dependency introduced the vulnerability?   |
| 3 | `lockfile-consumers`  | Which applications resolved the bad version while it was live?  |
| 4 | `sibling-packages`    | Which other packages share a maintainer or infrastructure?      |
| 5 | `typosquats`          | Are there edit-distance neighbours registered nearby?           |
| 6 | `blast-radius`        | What is the complete blast radius across services + lockfiles?  |

The six queries live in [`src/lib/cypher.ts`](src/lib/cypher.ts). Open the
file and read them. Each takes named parameters — there is no string
interpolation of user input.

---

## Run locally

```bash
# 1.  Install
pnpm i      # or: npm i

# 2.  Seed the corpus (~30 s, idempotent)
pnpm seed

# 3.  Bring up HydraDB
docker compose up -d hydradb
docker compose run --rm meridian-load

# 4.  Raise the scan-edge budget for the 4-hop traversal in tile 1
pnpm budget --max-scan-edges 120000

# 5.  Run the Next.js app
pnpm dev    # http://localhost:3000
```

If `HYDRADB_URL` is empty, the app hydrates from a deterministic 5K-node
fixture in `src/server/replay-data.ts`. You can `pnpm dev` without Docker
and every route still works.

---

## Routes

| Route                                          | What it is                                           |
|------------------------------------------------|------------------------------------------------------|
| `/`                                            | Landing. Search box, recent exploits, six queries.   |
| `/scan/<pkg@ver>`                              | Scan page. Verdict + six tiles + worm trace.         |
| `/replay`                                      | Pre-rendered WormTrace for the TanStack scenario.   |
| `/bench`                                       | HydraDB-shaped CSV, downloadable at `/api/bench`.   |
| `/how`                                         | Operating steps, schema cards, the six queries.      |
| `/api/scan/<pkg@ver>`                          | JSON. Same data as the scan page.                    |
| `/api/bench`                                   | CSV. Same column shape as `query_bench.rs`.          |
| `/api/health`                                  | `{"ok":true,"source":"fixture|hydradb:..."}`.        |

Wall-clock for the six queries, measured on the included 5K-node fixture:

| Metric        | Cold   | Hot (1k reuse) |
|---------------|--------|----------------|
| Total         | ~250ms | ~80ms          |
| `exposed-services` (tile 1) | ~110ms | ~22ms |
| p95 hot-query | —      | <60µs          |

---

## Stack

| Layer   | Choice                | Notes                                             |
|---------|-----------------------|---------------------------------------------------|
| App     | Next.js 14 (App Router) | Standalone build, runs anywhere Node runs.      |
| Style   | Tailwind 3.4          | Tokens in `globals.css`. Hand-written components.|
| Graph   | HydraDB 0.7.2         | Bolt + HTTPS transports, OpenCypher.             |
| Data    | OSV + GHSA + npm + PyPI registries | Public feeds, refreshed on `pnpm seed`. |
| License | Apache-2.0            | Copyright 2026 Sithu Nyein.                       |

---

## Repo layout

```
src/
  app/
    layout.tsx, globals.css, page.tsx               # landing
    scan/[pkg]/page.tsx                            # scan
    replay/page.tsx                                # worm trace full
    bench/page.tsx                                 # bench table
    how/page.tsx                                   # methodology
    api/{scan/[pkg],bench,health}/route.ts         # JSON / CSV
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

Deployment, environment variables, and the two URL paths (free
quick-tunnel vs. custom domain) live in [`DEPLOY.md`](DEPLOY.md).

---

## Maintainer

Sithu Nyein — [sithunyein.mailto@gmail.com](mailto:sithunyein.mailto@gmail.com)
