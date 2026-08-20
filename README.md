<p align="center">
  <img src="public/meridian-logo.png" alt="Meridian" width="80" style="border-radius: 12px;" />
</p>

<h1 align="center">Meridian</h1>

<p align="center">
  <strong>Plain-English blast-radius engine for npm & PyPI</strong><br/>
  Six deterministic Cypher queries against <a href="https://github.com/hydra-db/hydradb">HydraDB</a>.<br/>
  No LLM. No vector search. Reproducible to the byte.
</p>

<p align="center">
  <a href="https://meridian.sithunyein.com">Live Demo</a> ·
  <a href="https://github.com/thesithunyein/meridian">GitHub</a> ·
  <a href="https://x.com/meridian_scm">X / Twitter</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Hackathon-Hack_Hydra-FF6B35" alt="Hack Hydra" />
  <img src="https://img.shields.io/badge/Track-A_Supply_Chain-22D3EE" alt="Track A" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-green" alt="License" />
  <img src="https://img.shields.io/badge/Status-Live-00e676" alt="Status" />
</p>

---

## The Problem

Software supply chain attacks are automated, worm-driven, and fast.

> In the TanStack compromise this May, **84 malicious package artifacts** were published
> across **42 packages** within **6 minutes** of the CI pipeline being breached. The worm
> hit Mistral AI, UiPath, and **160+ npm/PyPI packages**, self-propagating and persisting
> in `.claude/` and `.vscode/` directories.

When a package gets compromised, you need to answer six questions **fast**:

1. Which internal services are transitively exposed?
2. Which version introduced the vulnerability?
3. Which applications resolved the bad version while it was live?
4. Which other packages share a maintainer or infrastructure?
5. Are there likely typosquat packages nearby?
6. What is the complete blast radius?

**These are graph traversal questions.** A vector index cannot answer them. A dependency graph database can.

---

## How HydraDB Powers Meridian

Meridian stores the full npm and PyPI dependency graph in **HydraDB** and runs six deterministic Cypher queries against it. Each query answers one security question.

### What HydraDB Does

| Component | Role |
|-----------|------|
| **Graph storage** | Stores Package, Version, Advisory, Lockfile, and Maintainer nodes with DEPENDS_ON, MAINTAINED_BY, TYPOSQUAT_OF, AFFECTS, and RESOLVES edges |
| **Cypher engine** | Executes six deterministic queries — no LLM, no similarity search, just graph traversal |
| **Bolt + HTTPS transport** | Client connects via both protocols for flexibility |
| **Aggregate stats** | Powers the live package/edge counts on the landing page |
| **Benchmarks** | The `/bench` page outputs HydraDB-shaped CSV matching the upstream `query_bench.rs` format |

### The Six Cypher Queries

Each query lives in `src/lib/cypher.ts` and takes named parameters — no string interpolation of user input.

| # | Tile | Cypher Pattern | Question |
|---|------|---------------|----------|
| 1 | `exposed-services` | `MATCH (pkg)<-[:DEPENDS_ON*1..6]-(svc)` | Which services transitively depend on this version? |
| 2 | `intro-version` | `MATCH (Advisory)-[:AFFECTS]->(Version)` | Which version introduced the vulnerability? |
| 3 | `lockfile-consumers` | `MATCH (Lockfile)-[:RESOLVES]->(Version)` | Which lockfiles resolved the bad version? |
| 4 | `sibling-packages` | `MATCH (pkg)<-[:MAINTAINED_BY]-(m)-[:MAINTAINED_BY]->(sib)` | Which packages share a maintainer? |
| 5 | `typosquats` | `MATCH (p)<-[:TYPOSQUAT_OF]-(t)` | Are there edit-distance neighbours nearby? |
| 6 | `blast-radius` | `count(svc) from Package fan-in` | What is the complete blast radius? |

### Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  npm / PyPI  │────▶│  HydraDB     │────▶│  Cypher     │────▶│  Frontend    │
│  Registries  │     │  Graph Store │     │  6 Queries  │     │  6 Tiles     │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
                           │                     │                    │
                           ▼                     ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
                    │  OSV + GHSA  │     │  Verdict    │     │  Worm Trace  │
                    │  Advisories  │     │  + Fix Cmd  │     │  Animation   │
                    └──────────────┘     └─────────────┘     └──────────────┘
```

### Why Not Vector Search?

| Approach | Transitive Exposure | Reproducible | Real-time |
|----------|-------------------|-------------|-----------|
| Vector search | ❌ finds similar packages | ❌ probabilistic | ✅ |
| SQL joins | ⚠️ limited hop depth | ✅ | ⚠️ |
| **HydraDB Cypher** | **✅ 6-hop traversal** | **✅ deterministic** | **✅ ~250ms cold** |

---

## Architecture

```
meridian/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, fonts, metadata
│   │   ├── globals.css             # Design system tokens
│   │   ├── page.tsx                # Landing page
│   │   ├── scan/[pkg]/page.tsx     # Scan results page
│   │   ├── replay/page.tsx         # Worm trace replay
│   │   ├── bench/page.tsx          # HydraDB-shaped benchmarks
│   │   ├── how/page.tsx            # Methodology docs
│   │   └── api/
│   │       ├── scan/[pkg]/route.ts # JSON scan endpoint
│   │       ├── bench/route.ts      # CSV benchmark export
│   │       ├── health/route.ts     # Health check
│   │       └── stats/route.ts      # Live graph statistics
│   ├── components/
│   │   ├── Nav.tsx                 # Navigation shell
│   │   ├── Footer.tsx              # Footer with social links
│   │   ├── VerdictCard.tsx         # Verdict + fix command
│   │   ├── Tile.tsx                # Individual query result tile
│   │   ├── CypherReveal.tsx        # Colorized Cypher display
│   │   ├── WormTrace.tsx           # Animated timeline
│   │   └── CommandSearch.tsx       # Terminal-style search input
│   ├── lib/
│   │   ├── cypher.ts               # The six Cypher queries
│   │   ├── hydra.ts                # HydraDB HTTP client
│   │   ├── types.ts                # Domain types
│   │   └── cn.ts                   # Classname utility
│   └── server/
│       └── replay-data.ts          # Deterministic 5K-node fixture
├── corpus/                         # Seed data + manifest
├── scripts/                        # Brand + bench generation
├── public/                         # Static assets
├── docker-compose.yml              # HydraDB + loader
└── package.json
```

---

## Security

Meridian is designed with security-first principles:

- **Parameterized queries** — All six Cypher queries use `{id: $PKG_ID}` node matching. No string interpolation of user input.
- **No LLM in answer path** — The verdict is derived from graph data, not generated by a model. Reproducible to the byte.
- **Fixture fallback** — When HydraDB is unreachable, the app falls back to a deterministic 5K-node fixture. This is honest and documented.
- **Zero telemetry** — No package names sent, no analytics, no cookies. The engine is Apache-2.0 — you can read the source.
- **Local-first** — Run it on your laptop behind your firewall. No seat counts, no cloud dependency.

---

## Run Locally

### Prerequisites
- Node.js ≥ 20
- Docker (for HydraDB)
- Python 3 (for seed script)

### Quick Start (with fixture — no Docker needed)

```bash
# 1. Install dependencies
pnpm i          # or: npm i

# 2. Run the app (uses deterministic fixture data)
pnpm dev        # http://localhost:3000
```

Every route works without Docker — the fixture provides curated results for known compromises.

### Full Setup (with HydraDB)

```bash
# 1. Install dependencies
pnpm i

# 2. Seed the corpus (~30s, idempotent)
pnpm seed

# 3. Start HydraDB + load data
docker compose up -d hydradb
docker compose run --rm meridian-load

# 4. Raise scan-edge budget for 4-hop traversal
pnpm budget --max-scan-edges 120000

# 5. Run the app
pnpm dev        # http://localhost:3000
```

Set `HYDRADB_URL` in `.env.local` to connect to your HydraDB instance.

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page — search box, exploits table, trust signals |
| `/scan/<pkg@ver>` | Scan results — verdict, six tiles, worm trace |
| `/replay` | Pre-rendered WormTrace for the TanStack scenario |
| `/bench` | HydraDB-shaped CSV benchmarks |
| `/how` | Methodology — steps, tiles, queries explained |
| `/api/scan/<pkg@ver>` | JSON — same data as scan page |
| `/api/bench` | CSV — same columns as `query_bench.rs` |
| `/api/health` | `{"ok":true,"source":"fixture\|hydradb:..."}` |
| `/api/stats` | Live graph node/edge counts from HydraDB |

---

## Benchmarks

Measured on the included 5K-node / 18K-edge fixture:

| Metric | Cold | Hot (1k reuse) |
|--------|------|----------------|
| Total (6 queries) | ~250ms | ~80ms |
| `exposed-services` (tile 1) | ~110ms | ~22ms |
| p95 hot-query latency | — | <60µs |

The bench page outputs HydraDB-shaped CSV matching the upstream `examples/query_bench.rs` format, so the same tooling reads Meridian numbers alongside HydraDB's own benchmarks.

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| App | Next.js 14 (App Router) | Standalone build, runs anywhere Node runs |
| Style | Tailwind 3.4 | Tokens in `globals.css`. Hand-written components |
| Graph | HydraDB 0.7.2 | Bolt + HTTPS transports, OpenCypher |
| Data | OSV + GHSA + npm + PyPI | Public feeds, refreshed on `pnpm seed` |
| License | Apache-2.0 | Copyright 2026 Sithu Nyein |

---

## What Would Meridian Lose Without HydraDB?

Without HydraDB, Meridian would need:
- A custom graph engine to store and traverse the dependency tree
- A query language for 6-hop reverse traversals
- A benchmarking framework that outputs standardized CSV
- Aggregate statistics across node and edge labels

HydraDB provides all of this out of the box with OpenCypher, making the six queries readable by any graph engineer and the bench output comparable to HydraDB's own benchmarks.

---

## Maintainer

**Sithu Nyein** — [sithunyein.mailto@gmail.com](mailto:sithunyein.mailto@gmail.com)

- 🐦 [@meridian_scm](https://x.com/meridian_scm)
- 💻 [GitHub](https://github.com/thesithunyein/meridian)
- 🌐 [meridian.sithunyein.com](https://meridian.sithunyein.com)

---

## Acknowledgments

Built for [Hack Hydra](https://hackhydra.hydradb.com) — Track A: Supply Chain Blast Radius.
Powered by [HydraDB](https://github.com/hydra-db/hydradb).
