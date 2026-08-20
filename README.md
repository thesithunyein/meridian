<p align="center">
  <img src="public/meridian-logo.png" alt="Meridian" width="80" style="border-radius: 12px;" />
</p>

<h1 align="center">Meridian</h1>

<p align="center">
  <strong>Supply chain blast-radius engine for npm & PyPI</strong><br/>
  Six deterministic Cypher queries against <a href="https://github.com/hydra-db/hydradb">HydraDB</a>.
</p>

<p align="center">
  <a href="https://meridian.sithunyein.com">Live</a> ·
  <a href="https://github.com/thesithunyein/meridian">Code</a> ·
  <a href="https://x.com/meridian_scm">X</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Hack_Hydra-Track_A-FF6B35" />
  <img src="https://img.shields.io/badge/HydraDB-0.7.2-22D3EE" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-green" />
</p>

---

## What It Does

Paste a package name. Meridian walks the dependency graph **six hops deep** and returns:

- **One English sentence** — the verdict
- **One shell command** — the fix
- **Six tiles** — each showing the raw Cypher query and its results

```
$ pnpm scan tanstack/react-virtual@3.10.8

┌─────────────────────────────────────────────────────┐
│  CRIT · tanstack/react-virtual@3.10.8               │
├─────────────────────────────────────────────────────┤
│  17 services exposed · 6 lockfiles resolved the     │
│  bad version · 6 typosquats nearby.                 │
│                                                     │
│  fix:  pnpm update tanstack/react-virtual@^3.10.9   │
└─────────────────────────────────────────────────────┘
```

---

## How HydraDB Is Used

Meridian stores the npm and PyPI dependency graph in HydraDB and runs six deterministic Cypher queries against it.

### The Six Queries

| # | Tile | Cypher | Answers |
|---|------|--------|---------|
| 1 | `exposed-services` | `MATCH (pkg)<-[:DEPENDS_ON*1..6]-(svc)` | Transitive service exposure |
| 2 | `intro-version` | `MATCH (Advisory)-[:AFFECTS]->(Version)` | Vulnerability introduction point |
| 3 | `lockfile-consumers` | `MATCH (Lockfile)-[:RESOLVES]->(Version)` | Affected lockfiles |
| 4 | `sibling-packages` | `MATCH (pkg)<-[:MAINTAINED_BY]-(m)-[:MAINTAINED_BY]->(sib)` | Shared maintainer clusters |
| 5 | `typosquats` | `MATCH (p)<-[:TYPOSQUAT_OF]-(t)` | Edit-distance neighbours |
| 6 | `blast-radius` | `count(svc) from Package fan-in` | Aggregate blast radius |

### Data Model

```
                    ┌───────────┐
                    │ Maintainer│
                    └─────┬─────┘
                          │ MAINTAINED_BY
                    ┌─────▼─────┐
┌──────────┐  DEPENDS_ON  ┌───────────┐  HAS_VERSION  ┌─────────┐
│ Service  │─────────────▶│  Package  │──────────────▶│ Version │
└──────────┘              └─────┬─────┘              └────┬────┘
                                │                         │
                         TYPOSQUAT_OF                  AFFECTS
                                │                         │
                         ┌──────▼──────┐           ┌─────▼──────┐
                         │  Candidate  │           │  Advisory  │
                         └─────────────┘           └─────┬──────┘
                                                         │
                                                    RESOLVES
                                                         │
                                                   ┌─────▼──────┐
                                                   │  Lockfile  │
                                                   └────────────┘
```

### What Meridian Would Lose Without HydraDB

Without HydraDB, Meridian would need a custom graph engine for:
- 6-hop reverse dependency traversals
- Deterministic Cypher query execution
- Aggregate statistics across node/edge labels
- Benchmarking in HydraDB's upstream CSV format

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         Frontend                               │
│  Next.js 14 · Tailwind 3.4 · TypeScript                      │
├──────────┬──────────┬──────────┬──────────┬───────────────────┤
│ Landing  │ Scan     │ Replay   │ Bench    │ How               │
│ /        │ /scan/*  │ /replay  │ /bench   │ /how              │
└────┬─────┴────┬─────┴──────────┴──────────┴───────────────────┘
     │          │
     ▼          ▼
┌────────────────────────────────────────────────────────────────┐
│                        API Layer                               │
│  /api/scan/[pkg]  ·  /api/bench  ·  /api/health  ·  /api/stats│
└────┬───────────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────────┐
│                     HydraDB Client                             │
│  src/lib/hydra.ts  ·  Bolt + HTTPS transports                 │
└────┬───────────────────────────────────────────────────────────┘
     │
     ▼
┌────────────────────────────────────────────────────────────────┐
│                       HydraDB 0.7.2                            │
│  Graph Store · Cypher Engine · OpenCypher                      │
│                                                                │
│  Nodes: Package · Version · Advisory · Lockfile · Maintainer   │
│  Edges: DEPENDS_ON · MAINTAINED_BY · TYPOSQUAT_OF · AFFECTS   │
└────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Without Docker (fixture mode)

```bash
pnpm i && pnpm dev    # http://localhost:3000
```

### With HydraDB (full mode)

```bash
pnpm i
pnpm seed                                          # seed corpus (~30s)
docker compose up -d hydradb                       # start HydraDB
docker compose run --rm meridian-load              # load graph data
HYDRADB_URL=http://localhost:8443 pnpm dev         # run app
```

---

## Environment

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HYDRADB_URL` | No | `""` (fixture mode) | HydraDB HTTP endpoint |
| `HYDRADB_GRAPH` | No | `meridian` | Graph namespace |
| `HYDRADB_API_KEY` | No | — | Bearer token |
| `HYDRADB_CELL_ID` | No | `cell-0` | Cell identifier |
| `HYDRADB_TIMEOUT_MS` | No | `4000` | Query timeout |

---

## Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Landing page |
| `/scan/<pkg@ver>` | Dynamic | Scan results with six tiles |
| `/replay` | Static | TanStack worm trace |
| `/bench` | Dynamic | HydraDB-shaped CSV benchmarks |
| `/how` | Static | Methodology documentation |
| `/api/scan/<pkg@ver>` | JSON | Scan data |
| `/api/bench` | CSV | Benchmark export |
| `/api/health` | JSON | Health check |
| `/api/stats` | JSON | Live graph statistics |

---

## Benchmarks

On the included 5K-node / 18K-edge fixture:

| Metric | Cold | Hot |
|--------|------|-----|
| Total (6 queries) | ~250ms | ~80ms |
| `exposed-services` | ~110ms | ~22ms |
| p95 hot-query | — | <60µs |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.6 |
| Styling | Tailwind CSS 3.4 |
| Graph DB | HydraDB 0.7.2 |
| Data Sources | OSV, GHSA, npm, PyPI |
| Runtime | Node.js ≥ 20 |
| License | Apache-2.0 |

---

## Attribution

| Dependency | License | Purpose |
|-----------|---------|---------|
| [Next.js](https://nextjs.org) | MIT | React framework |
| [Tailwind CSS](https://tailwindcss.com) | MIT | Utility-first CSS |
| [HydraDB](https://github.com/hydra-db/hydradb) | AGPL-3.0 | Graph database |
| [clsx](https://github.com/lukeed/clsx) | MIT | Classname utility |
| [Framer Motion](https://www.framer.com/motion/) | MIT | Animations |
| [OSV](https://osv.dev) | CC-BY-4.0 | Vulnerability data |
| [GitHub Advisory Database](https://github.com/advisories) | — | Security advisories |

---

## License

Apache-2.0 — Copyright 2026 Sithu Nyein

---

<p align="center">
  Built for <a href="https://hackhydra.hydradb.com">Hack Hydra</a> ·
  Powered by <a href="https://github.com/hydra-db/hydradb">HydraDB</a>
</p>
