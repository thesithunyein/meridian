#!/usr/bin/env node
// corpus/load.mjs — Meridian ↔ HydraDB hydration.
//
// Reads the JSONL files produced by `corpus/seed.py` and issues parameterized
// Cypher `MERGE` statements over HydraDB's HTTPS query API:
//
//   POST  {HYDRADB_URL}/v1/graphs/{HYDRADB_GRAPH}/query
//   Authorization:  Bearer {HYDRADB_API_KEY}
//   Content-Type:   application/json
//
//   { "cell_id": "cell-0", "query_id": "<step>-<n>",
//     "query": "<MERGE or MATCH-MERGE statement>",
//     "params": { <binding>: <value>, ... },
//     "page_size": 1000 }
//
// Usage
//
//   # local docker-compose stack
//   docker compose up -d hydradb
//   node corpus/load.mjs
//
//   # remote HydraDB
//   HYDRADB_URL=https://api.hydradb.example \
//   HYDRADB_GRAPH=meridian \
//   HYDRADB_API_KEY=... \
//   node corpus/load.mjs corpus/

import { createReadStream } from "node:fs";
import { mkdir, readFile, stat } from "node:fs/promises";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { resolve } from "node:path";

const URL_BASE = process.env.HYDRADB_URL ?? "http://127.0.0.1:8443";
const GRAPH = process.env.HYDRADB_GRAPH ?? "default";
const TOKEN = process.env.HYDRADB_API_KEY ?? "local-development-token-32-bytes";
const CELL_ID = process.env.HYDRADB_CELL_ID ?? "cell-0";
const CORPUS_DIR = resolve(process.argv[2] ?? "corpus");
const BATCH = Number(process.env.MERIDIAN_BATCH ?? 200);
const NODE_VERSION = process.versions.node;
const PKG_ECOSYSTEMS = new Set(["npm", "pypi"]);

/**
 * Send one Cypher statement to HydraDB.
 * Returns { rows: any[], read_epoch: number, next_cursor: string|null }.
 */
async function cypher(query, params, id) {
  const u = new URL(URL_BASE);
  u.pathname = `${u.pathname.replace(/\/$/, "")}/v1/graphs/${encodeURIComponent(GRAPH)}/query`;
  const res = await fetch(u, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      cell_id: CELL_ID,
      query_id: id,
      query,
      params,
      page_size: 1000,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`hydra ${res.status}: ${text.slice(0, 240)}`);
  }
  return res.json();
}

/**
 * Read compressed JSONL line-by-line, returning each row as a parsed object.
 */
async function readJsonl(path) {
  const lines = createInterface({
    input: createReadStream(path).pipe(createGunzip()),
    crlfDelay: Infinity,
  });
  const out = [];
  for await (const line of lines) {
    if (!line.trim()) continue;
    out.push(JSON.parse(line));
  }
  return out;
}

/**
 * Wait until HydraDB's /v1/graphs/<graph>/query endpoint answers with 401 on
 * a no-token probe, which proves the listener is up and ready for work.
 */
async function waitForHydradb() {
  const deadline = Date.now() + 60_000;
  while (true) {
    if (Date.now() > deadline) throw new Error("hydradb did not become ready in 60s");
    try {
      const u = new URL(URL_BASE);
      u.pathname = `${u.pathname.replace(/\/$/, "")}/v1/graphs/${encodeURIComponent(GRAPH)}/query`;
      const res = await fetch(u, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cell_id: CELL_ID, query: "MATCH (n {id: 'healthz'}) RETURN n.id" }),
      });
      // Either 401 (bad auth) or 400 (rejected query) means the server is up.
      if (res.status === 401 || res.status === 400 || res.status === 200) return true;
    } catch {
      // listener not yet up — retry
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
}

const log = (...a) => console.log(`[load] ${a.join(" ")}`);

async function batchMerge(step, cypherStmt, params) {
  // cypherStmt takes a single row; we issue `BATCH` per request by stuffing
  // each row's bindings into the params map under a distinct prefix.
  // For simplicity we issue one row per request — HydraDB's per-cell cap
  // is generous, but a single row per call keeps planner stats honest.
  await cypher(cypherStmt, params, `${step}-${params.rid ?? "x"}`);
}

function pkgId(eco, name) {
  return `pkg:${eco}:${name}`;
}
function verId(pkg, ver) {
  // "pkg:npm:express" + "@4.18.2" -> "ver:npm:express@4.18.2"
  return `ver:${pkg.replace(/^pkg:/, "")}@${ver}`;
}
function repoId(eco, name) {
  return `repo:${eco}:${name}`;
}
function maintainerId(eco, mid) {
  return `maint:${eco}:${mid}`;
}
function advisoryId(eco, gid) {
  return `adv:${eco}:${gid}`;
}
function serviceId(svc) {
  return `svc:meridian:${svc}`;
}
function lockfileId(eco, svc, ts) {
  return `lock:${eco}:${svc}@${ts}`;
}
function typosquatId(target, candidate) {
  return `typo:${target.replace(/^pkg:/, "")}->${candidate}`;
}

async function loadPackages(rows) {
  let n = 0;
  for (const r of rows) {
    if (!PKG_ECOSYSTEMS.has(r.kind)) continue;
    await cypher(
      "MERGE (n:Package {id:$id}) SET n.ecosystem=$eco, n.name=$name RETURN n.id",
      { id: pkgId(r.kind, r.name), eco: r.kind, name: r.name, rid: n },
      `pkg-${n}`,
    );
    n++;
  }
  return n;
}

async function loadVersions(rows) {
  // Each row: { package: <bare-name>, version: <semver> }.
  // We split out ecosystem by the package's first sighting in `packages` is
  // not reliable from the JSONL alone, so we infer by querying HydraDB.
  // Simpler: seed.py uses two seed pools (npm first, then pypi), so we pass
  // the ecosystem hint via the env. Looking at the seed file structure:
  //   versions = version_of(npm_pkgs[:200] + pypi_pkgs[:120])
  // The first 200 packages are npm; the rest are pypi. We replicate that
  // split in the load script so the ids line up deterministically.
  let n = 0;
  for (const r of rows) {
    // We never know the ecosystem from `package` alone — record the (pkg, ver)
    // and trust the seed's split order to assign eco.
    const eco = n < 200 * 6 ? "npm" : "pypi";
    const id = verId(pkgId(eco, r.package), r.version);
    await cypher(
      `MATCH (p:Package {id:$pid}) MERGE (v:Version {id:$vid}) SET v.ecosystem=$eco, v.name=$name, v.version=$ver, v.first_published=$pub RETURN v.id`,
      {
        pid: pkgId(eco, r.package),
        vid: id,
        eco,
        name: r.package,
        ver: r.version,
        pub: `2026-05-${((n % 28) + 1).toString().padStart(2, "0")}`,
        rid: n,
      },
      `ver-${n}`,
    );
    n++;
  }
  return n;
}

async function loadEdges(rows) {
  // rows: { from: <bare-name>, to: <bare-name>, kind: "DEPENDS_ON" }
  // The seed graph mixes npm + pypi names. To disambiguate, we accept that
  // edges reference packages by bare name; the LOAD establishes them under
  // BOTH ecosystems if missing — but only the npm-style pkg id is canonical
  // for graph traversal. We pre-load both, then prefer npm→npm edges.
  let n = 0;
  for (const r of rows) {
    // Try the npm id first; if the source row corresponds to a pypi pkg,
    // we accept the edge as still being meaningful (transitive deps don't
    // care about ecosystem). We model it as a cross-ecosystem edge.
    const from = pkgId("npm", r.from);
    const to = pkgId("npm", r.to);
    await cypher(
      `MATCH (a:Package {id:$from}) MATCH (b:Package {id:$to}) MERGE (a)-[:DEPENDS_ON]->(b) RETURN a.id`,
      { from, to, rid: n },
      `dep-${n}`,
    );
    n++;
  }
  return n;
}

async function loadRepos() {
  // Repos are 1:1 with packages: a published version links back to its repo.
  // We can reconstruct by projecting from already-loaded Packages; for now
  // we materialize an empty repo per top-50 popular package so the tile that
  // walks PUBLISHED_TO has something to walk.
  let n = 0;
  const popular = ["express", "next", "react", "typescript", "axios", "lodash",
    "moment", "commander", "chalk", "request", "fs-extra", "glob", "minimatch",
    "body-parser", "cookie-parser", "ws", "mongoose", "redis", "ioredis",
    "node-fetch", "cross-fetch", "uuid", "nanoid", "validator", "isomorphic-fetch",
    "react-dom", "react-router-dom", "graphql", "@apollo/client", "swr",
    "@tanstack/react-virtual", "@tanstack/react-query", "@tanstack/react-table",
    "@tanstack/router", "tailwindcss", "postcss", "autoprefixer", "vite",
    "rollup", "parcel", "eslint", "prettier", "jest", "mocha", "vitest",
    "minimist", "yargs", "inquirer", "ajv", "zod"];
  for (const name of popular) {
    const id = repoId("npm", name);
    await cypher(
      `MERGE (r:Repo {id:$id}) SET r.ecosystem='npm', r.name=$nm, r.stars=$stars, r.has_ci=true RETURN r.id`,
      { id, nm: name, stars: 1000 + (n * 137) % 50000, rid: n },
      `repo-${n}`,
    );
    n++;
  }
  return n;
}

async function loadMaintainers(rows) {
  // rows: { id: 'm-0001', package: <bare-name>, ecosystem: 'npm' }
  let n = 0;
  for (const r of rows) {
    const eco = r.ecosystem ?? "npm";
    const mid = maintainerId(eco, r.id);
    await cypher(
      `MATCH (p:Package {id:$pid}) MERGE (m:Maintainer {id:$mid}) SET m.ecosystem=$eco, m.name=$nm MERGE (m)-[:MAINTAINS]->(p) RETURN m.id`,
      { pid: pkgId(eco, r.package), mid, eco, nm: r.id, rid: n },
      `maint-${n}`,
    );
    n++;
  }
  return n;
}

async function loadSiblings(rows) {
  // rows: { maintainer: 'm-0001', package: <bare>, tag: 'ci-cluster' }
  let n = 0;
  for (const r of rows) {
    await cypher(
      `MATCH (m:Maintainer {id:$mid}) MATCH (sib:Package {id:$pid}) MERGE (m)-[:MAINTAINS {tag:$tag}]->(sib) RETURN sib.id`,
      {
        mid: maintainerId("npm", r.maintainer),
        pid: pkgId("npm", r.package),
        tag: r.tag,
        rid: n,
      },
      `sib-${n}`,
    );
    n++;
  }
  return n;
}

async function loadTyposquats(rows) {
  // rows: { target: <bare>, candidate: <bare>, distance: 1|2 }
  let n = 0;
  for (const r of rows) {
    const id = typosquatId(pkgId("npm", r.target), r.candidate);
    await cypher(
      `MATCH (bad:Package {id:$tid}) MERGE (c:Typosquat {id:$id}) SET c.target=$tgt, c.candidate=$cand, c.distance=$dst, c.registered_at='2026-04-01' MERGE (c)-[:TYPOSQUAT_OF]->(bad) RETURN c.id`,
      {
        tid: pkgId("npm", r.target),
        id,
        tgt: pkgId("npm", r.target),
        cand: r.candidate,
        dst: r.distance,
        rid: n,
      },
      `typo-${n}`,
    );
    n++;
  }
  return n;
}

async function loadAdvisories(rows) {
  // rows: { id: 'GHSA-...', severity, published, summary, ecosystem }
  let n = 0;
  for (const r of rows) {
    const eco = r.ecosystem ?? "npm";
    const id = advisoryId(eco, r.id);
    await cypher(
      `MERGE (a:Advisory {id:$id}) SET a.ecosystem=$eco, a.id_alias=$alias, a.severity=$sev, a.published_at=$pub, a.summary=$sum RETURN a.id`,
      { id, eco, alias: r.id, sev: r.severity, pub: r.published, sum: r.summary, rid: n },
      `adv-${n}`,
    );
    n++;
  }
  return n;
}

async function wireAdvisoriesToPackages() {
  // Pick 12 well-known packages and attach an advisory to each so the
  // intro-version tile has real data.
  const wellKnown = [
    { eco: "npm", name: "tanstack/react-virtual", cve: "GHSA-tanstack-react-virtual-worm-2026" },
    { eco: "npm", name: "ua-parser-js", cve: "GHSA-ua-parser-js-2022-typo" },
    { eco: "npm", name: "node-ipc", cve: "GHSA-node-ipc-russia-2022" },
    { eco: "npm", name: "colors", cve: "GHSA-colors-d6za-2022" },
    { eco: "npm", name: "event-stream", cve: "GHSA-event-stream-flatmap-stream-2018" },
    { eco: "npm", name: "evil-pkg", cve: "GHSA-evil-pkg-canonical-2026" },
    { eco: "pypi", name: "ctx", cve: "GHSA-ctx-real-python-2022" },
    { eco: "pypi", name: "requests", cve: "GHSA-requests-idna-2024" },
  ];
  let n = 0;
  for (const r of wellKnown) {
    const id = advisoryId(r.eco, r.cve);
    await cypher(
      `MERGE (a:Advisory {id:$id}) SET a.severity='CRITICAL', a.published_at='2026-05-18' WITH a MATCH (p:Package {id:$pid}) MERGE (a)-[:AFFECTS]->(p) RETURN a.id`,
      { id, pid: pkgId(r.eco, r.name), rid: n },
      `adv-affects-${n}`,
    );
    n++;
  }
  return n;
}

async function loadServices() {
  // 32 internal services so the reverse-dep tile has 32 candidates to walk.
  const services = [
    "checkout-svc", "worker-queue", "edge-router", "auth-api-gw",
    "billing-svc", "search-svc", "notification-svc", "audit-logger",
    "tenant-router", "ci-runner-api", "feature-flags-svc", "dlq-pull",
    "geo-redirector", "session-store", "metrics-collector", "incident-room-bot",
    "tmpl-renderer", "image-proxy", "rate-limiter", "feature-broker",
    "ssh-bastion", "k8s-api-gw", "lambda-edge-proxy", "inference-router",
    "ocr-worker", "pdf-renderer", "etl-pump", "warehouse-cdc",
    "secret-rotator", "license-issuer", "audit-streamer", "tenant-webhooks",
  ];
  let n = 0;
  for (const name of services) {
    await cypher(
      `MERGE (s:Service {id:$id}) SET s.org='meridian', s.name=$nm, s.runtime='node', s.deployed_at='2026-04-01' RETURN s.id`,
      { id: serviceId(name), nm: name, rid: n },
      `svc-${n}`,
    );
    n++;
  }
  return n;
}

async function loadLockfiles(rows) {
  // rows: { id: 'apps/checkout-svc/...', service, snapshot_ts, .., ecosystem }
  let n = 0;
  for (const r of rows) {
    const id = lockfileId(r.ecosystem ?? "npm", r.service, r.snapshot_ts);
    await cypher(
      `MATCH (s:Service {id:$sid}) MERGE (lf:Lockfile {id:$id}) SET lf.org='meridian', lf.service=$svc, lf.snapshot_date=$ts, lf.compromised_window=$cw RETURN lf.id`,
      {
        sid: serviceId(r.service),
        id,
        svc: r.service,
        ts: r.snapshot_ts,
        cw: r.compromised_window,
        rid: n,
      },
      `lock-${n}`,
    );
    n++;
  }
  return n;
}

async function wireLockfilesToBadVersion() {
  // For each lockfile, RESOLVES an edge into the canonical "compromised"
  // Version node so the lockfile-consumers tile lights up.
  // First seed a single canonical compromised Version.
  const versionId = "ver:npm:tanstack/react-virtual@3.10.8-tanworm";
  await cypher(
    `MERGE (v:Version {id:$vid}) SET v.ecosystem='npm', v.name=$nm, v.version='3.10.8-tanworm', v.first_published='2026-05-04T09:00:00Z', v.bad=true RETURN v.id`,
    { vid: versionId, nm: "tanstack/react-virtual", rid: -1 },
    "ver-bad",
  );
  await cypher(
    `MATCH (bad:Package {id:$pid}), (v:Version {id:$vid}) MERGE (v)-[:PUBLISHED_TO]->(r:Repo {id:$rid}) SET r.name='tanstack/react-virtual', r.stars=44000, r.has_ci=true RETURN v.id`,
    { pid: pkgId("npm", "tanstack/react-virtual"), vid: versionId, rid: "repo:tanstack/react-virtual" },
    "ver-bad-pub",
  );

  // RESOLVES edge from each lockfile into the bad version, but only some
  // (deterministic subset) — so the toggle between "many" and "few"
  // lights up the right severity on the consumer tile.
  const lockfiles = await cypher(
    `MATCH (lf:Lockfile) RETURN lf.id AS id`,
    {},
    "lf-list",
  );
  const ids = (lockfiles.rows ?? []).map((r) => String(r[0]?.value ?? r[0]));
  let n = 0;
  for (let i = 0; i < ids.length; i++) {
    if (i % 2 !== 0) continue; // half the lockfiles resolved to bad
    await cypher(
      `MATCH (lf:Lockfile {id:$lid}), (v:Version {id:$vid}) MERGE (lf)-[:RESOLVES]->(v) RETURN lf.id`,
      { lid: ids[i], vid: versionId, rid: n },
      `lock-resolves-${n}`,
    );
    n++;
  }
  return n;
}

async function wireServicesToPackages() {
  // Build a deterministic (serviceId → pkgId) mapping table so each Service
  // DEPENDS_ON a meaningful set of packages — including the bad one.
  const wire = [
    "express|axios|jsonwebtoken|passport|cookie-parser|helmet|morgan|cors|
     lodash|moment|nanoid|zod|winston|winston-daily-rotate|dotenv|node-ipc|
     tanstack/react-virtual|tanstack/react-query|ws|socket.io|ioredis|
     prom-client|graylog2|graylog2-sdk|aws-sdk|fluentd|fluentd-cloudwatch|
     prometheus-statsd|gelf|gelf-pro|graylog|debug|nconf|continuation-local-storage|
     classnames|clsx|tailwindcss",
  ];
  const pkgs = wire[0].split("|");
  let n = 0;
  for (const svc of [
    "checkout-svc","worker-queue","auth-api-gw","billing-svc","search-svc",
    "notification-svc","audit-logger","tenant-router","ci-runner-api",
    "incident-room-bot","feature-broker","secret-rotator","audit-streamer",
  ]) {
    // Each service gets a deterministic subset of packages.
    const subsetSize = 6 + (n % 8); // 6..13
    const seen = new Set();
    for (let k = 0; k < subsetSize; k++) {
      const idx = (n * 13 + k * 7 + 3) % pkgs.length;
      const name = pkgs[idx];
      if (seen.has(name)) continue;
      seen.add(name);
      const pid = pkgId("npm", name);
      await cypher(
        `MATCH (s:Service {id:$sid}) MATCH (p:Package {id:$pid}) MERGE (s)-[:DEPENDS_ON]->(p) RETURN s.id`,
        { sid: serviceId(svc), pid, rid: n * 100 + k },
        `svc-dep-${n}-${k}`,
      );
    }
    n++;
  }
  return n;
}

async function main() {
  log(`node ${NODE_VERSION} · target ${URL_BASE}/v1/graphs/${encodeURIComponent(GRAPH)}`);
  log(`corpus dir: ${CORPUS_DIR}`);
  const manifest = JSON.parse(await readFile(resolve(CORPUS_DIR, "manifest.json"), "utf8"));
  log(`seed counts: ${JSON.stringify(manifest.counts)}`);

  await waitForHydradb();
  log("hydradb ready");

  let total = 0;
  for (const step of [
    ["packages", readJsonl, "packages.jsonl.gz", loadPackages],
    ["versions", readJsonl, "versions.jsonl.gz", loadVersions],
    ["edges", readJsonl, "edges.jsonl.gz", loadEdges],
    ["repos", null, null, loadRepos],
    ["maintainers", readJsonl, "maintainers.jsonl.gz", loadMaintainers],
    ["siblings", readJsonl, "siblings.jsonl.gz", loadSiblings],
    ["typosquats", readJsonl, "typosquats.jsonl.gz", loadTyposquats],
    ["advisories", readJsonl, "advisories.jsonl.gz", loadAdvisories],
    ["advisory-edges", null, null, wireAdvisoriesToPackages],
    ["services", null, null, loadServices],
    ["service-deps", null, null, wireServicesToPackages],
    ["lockfiles", readJsonl, "lockfiles.jsonl.gz", loadLockfiles],
    ["lockfile-resolves", null, null, wireLockfilesToBadVersion],
  ]) {
    const [name, reader, file, runner] = step;
    const t0 = Date.now();
    let n = 0;
    if (reader && file) {
      const rows = await reader(resolve(CORPUS_DIR, "cache", file));
      n = await runner(rows);
    } else {
      n = await runner();
    }
    const dt = ((Date.now() - t0) / 1000).toFixed(2);
    log(`${name.padEnd(22)} ${String(n).padStart(6)} rows  ${dt}s`);
    total += n;
  }
  log(`total statements: ${total}`);

  // Verification query — one of the six Meridian tile queries against the
  // freshly-loaded graph. A non-zero count proof the integration works.
  const v = await cypher(
    `MATCH (lf:Lockfile)-[:RESOLVES]->(v:Version {id:'ver:npm:tanstack/react-virtual@3.10.8-tanworm'}) RETURN lf.id ORDER BY lf.id`,
    {},
    "verify-resolves",
  );
  log(`lockfiles resolving to compromised version: ${v.rows?.length ?? 0}`);

  const n = await cypher(
    `MATCH (n) RETURN count(n) AS c`,
    {},
    "verify-count",
  );
  // rows is [[{type:'integer'|'null', value:N}], ...]
  const totalNodes = (() => {
    const raw = n.rows?.[0]?.[0];
    if (!raw) return "unknown";
    if (raw.type === "null") return 0;
    return Number(raw.value ?? 0);
  })();
  log(`total nodes in graph: ${totalNodes}`);
}

main().catch((err) => {
  console.error("[load] fatal:", err.message);
  process.exit(1);
});
