#!/usr/bin/env python3
"""corpus/load_hydra.py — load Meridian's seed corpus into a running HydraDB.

What it does
============
* Reads eight JSONL streams from `corpus/cache/*.jsonl.gz`.
* Map every string id to a deterministic **unsigned 64-bit integer**
  using SHA1 truncated to 8 bytes (unsigned — HydraDB rejects signed ints).
* Issues a separate `POST /v1/graphs/<g>/query` for each `MERGE` because the
  HydraDB Cypher engine has a stricter grammar than full OpenCypher — we keep
  each statement in its own buffer to avoid the parser's multi-statement
  tolerance testing.
* Every `MERGE` is shaped as `MERGE (a:L {id:I, ...})-[r:T {prop:v}]->(b:L {id:J, ...})`
  because HydraDB's Query engine rejects bare node `MERGE`s.

Run:
    python3 corpus/load_hydra.py [--reset]
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "corpus" / "cache"

DEFAULT_URL = os.environ.get("HYDRADB_URL", "http://127.0.0.1:8443")
DEFAULT_GRAPH = os.environ.get("HYDRADB_GRAPH", "default")
DEFAULT_TOKEN = os.environ.get("HYDRADB_API_KEY", "local-development-token-32-bytes")


def hid(*parts: str) -> int:
    """Stable unsigned-64-bit integer hash of joined string parts."""
    h = hashlib.sha1("|".join(parts).encode()).digest()
    return int.from_bytes(h[:8], "big", signed=False)


def esc(value: str) -> str:
    """Escape single quotes inside property string values."""
    return value.replace("'", "''")


def post_query(url: str, graph: str, token: str, query: str, timeout: int = 30) -> dict:
    ep = f"{url.rstrip('/')}/v1/graphs/{graph}/query"
    body = json.dumps({
        "cell_id": os.environ.get("HYDRADB_CELL_ID", "cell-0"),
        "query": query,
        "params": {},
    }).encode()
    req = urllib.request.Request(
        ep, method="POST", data=body,
        headers={
            "authorization": f"Bearer {token}",
            "content-type": "application/json",
            "accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {"error": {"code": str(e.code), "message": e.read().decode(errors="replace")[:400]}}


def runtime_stats(resp: dict) -> tuple[int, int]:
    columns = resp.get("columns") or []
    rows = resp.get("rows") or []
    if not rows:
        return -1, resp.get("read_epoch", -1) or -1
    if columns == ["c"] and isinstance(rows[0], list) and rows[0]:
        v = rows[0][0]
        n = int(v.get("value", -1)) if v.get("type") == "integer" else -1
        return n, resp.get("read_epoch", -1) or -1
    return len(rows), resp.get("read_epoch", -1) or -1


def read_jsonl_gz(path: Path):
    with gzip.open(path, "rt", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default=DEFAULT_URL)
    ap.add_argument("--graph", default="default")
    ap.add_argument("--token", default=DEFAULT_TOKEN)
    ap.add_argument("--reset", action="store_true", help="DETACH DELETE all nodes first")
    ap.add_argument("--quiet-errors", action="store_true")
    args = ap.parse_args()

    log = lambda m: print(f"[load] {m}", flush=True)
    t0 = time.monotonic()

    health = post_query(args.url, args.graph, args.token, "MATCH (n) RETURN count(*) AS c")
    log(f"health: rows={health.get('rows', [])} read_epoch={health.get('read_epoch')}")

    if args.reset:
        log("reset (DETACH DELETE n)")
        post_query(args.url, args.graph, args.token, "MATCH (n) DETACH DELETE n")

    counters = {"ok": 0, "err": 0}

    def send(q: str, label: str = "?") -> bool:
        r = post_query(args.url, args.graph, args.token, q)
        if "error" in r and r.get("error"):
            counters["err"] += 1
            if not args.quiet_errors:
                msg = r["error"].get("message", "")[:200]
                log(f"  ERR  {label}: {msg}")
            return False
        counters["ok"] += 1
        return True

    # 1) Packages — anchor each with a phantom self-edge to materialise the
    #    node (HydraDB rejects bare `MERGE (n:Package {...})`).
    log("loading packages ...")
    n = 0
    for row in read_jsonl_gz(CACHE / "packages.jsonl.gz"):
        pid = hid("pkg", row["name"])
        name = esc(row["name"])
        kind = esc(row["kind"])
        # Anchor to a "Package-root" sentinel node keyed by the package kind.
        anchor = hid("pkg-anchor", kind)
        send(
            f"MERGE (a:Package {{id:{pid}, name:'{name}', kind:'{kind}'}})"
            f"-[r:ANCHOR]->"
            f"(b:Package {{id:{anchor}, name:'_anchor_{kind}', kind:'{kind}'}})",
            "pkg",
        )
        n += 1
    log(f"  packages attempted={n}")

    # 2) Versions
    log("loading versions ...")
    n = 0
    for row in read_jsonl_gz(CACHE / "versions.jsonl.gz"):
        pid = hid("pkg", row["package"])
        vid = hid("ver", row["package"], row["version"])
        v = esc(row["version"])
        send(
            f"MERGE (a:Package {{id:{pid}}})-[r:HAS_VERSION {{published:'{v}'}}]->"
            f"(b:Version {{id:{vid}, version:'{v}'}})",
            "ver",
        )
        n += 1
    log(f"  versions attempted={n}")

    # 3) Dependency edges — re-key synthetic `dep-NNN` ids as fresh Packages
    log("loading dependency edges ...")
    n = 0
    for row in read_jsonl_gz(CACHE / "edges.jsonl.gz"):
        a = hid("pkg", row["from"])
        b_name = row["to"]
        b = hid("pkg", b_name) if not b_name.startswith("dep-") else hid("pkg-dep", b_name)
        send(
            f"MERGE (a:Package {{id:{a}}})-[r:DEPENDS_ON {{kind:'prod'}}]->"
            f"(b:Package {{id:{b}, name:'_synthetic_{esc(b_name)}'}})",
            "dep",
        )
        n += 1
    log(f"  edges attempted={n}")

    # 4) Maintainers
    log("loading maintainers ...")
    n = 0
    for row in read_jsonl_gz(CACHE / "maintainers.jsonl.gz"):
        pid = hid("pkg", row["package"])
        mid = hid("maint", row["id"])
        handle = esc(row["id"])
        eco = esc(row["ecosystem"])
        send(
            f"MERGE (a:Package {{id:{pid}}})-[r:MAINTAINED_BY]->"
            f"(b:Maintainer {{id:{mid}, handle:'{handle}', ecosystem:'{eco}'}})",
            "maint",
        )
        n += 1
    log(f"  maintainers attempted={n}")

    # 5) Siblings
    log("loading siblings ...")
    n = 0
    for row in read_jsonl_gz(CACHE / "siblings.jsonl.gz"):
        a = hid("pkg", row["package"])
        b = hid("sibling", row["maintainer"], row["tag"])
        tag = esc(row["tag"])
        m = esc(row["maintainer"])
        send(
            f"MERGE (a:Package {{id:{a}}})-[r:SIBLING_OF {{tag:'{tag}', maintainer:'{m}'}}]->"
            f"(b:Package {{id:{b}, tag:'{tag}', maintainer:'{m}'}})",
            "sibling",
        )
        n += 1
    log(f"  siblings attempted={n}")

    # 6) Typosquats
    log("loading typosquats ...")
    n = 0
    for row in read_jsonl_gz(CACHE / "typosquats.jsonl.gz"):
        a = hid("pkg", row["candidate"])
        b = hid("pkg", row["target"])
        send(
            f"MERGE (a:Package {{id:{a}, name:'{esc(row['candidate'])}'}})-"
            f"[r:TYPOSQUAT_OF {{distance:{row['distance']}}}]->"
            f"(b:Package {{id:{b}, name:'{esc(row['target'])}'}})",
            "typo",
        )
        n += 1
    log(f"  typosquats attempted={n}")

    # 7) Advisories → Version
    log("loading advisories ...")
    n = 0
    for row in read_jsonl_gz(CACHE / "advisories.jsonl.gz"):
        aid = hid("adv", row["id"])
        vid = hid("adv-version", row["id"])
        sev = esc(row["severity"].lower())
        eco = esc(row["ecosystem"])
        summ = esc(row["summary"][:60])
        pub = esc(row["published"])
        send(
            f"MERGE (a:Advisory {{id:{aid}, kind:'{eco}', severity:'{sev}', "
            f"summary:'{summ}', published:'{pub}'}})-[r:AFFECTS]->"
            f"(b:Version {{id:{vid}, version:'0.0.0-affected'}})",
            "adv",
        )
        n += 1
    log(f"  advisories attempted={n}")

    # 8) Lockfiles → Version
    log("loading lockfiles ...")
    n = 0
    sink_vid = hid("lockfile-baseline")
    for row in read_jsonl_gz(CACHE / "lockfiles.jsonl.gz"):
        lid = hid("lockfile", row["id"])
        path = esc(row["id"])
        cw = esc(row["compromised_window"])
        snapshot = esc(row["snapshot_ts"])
        eco = esc(row["ecosystem"])
        svc = esc(row["service"])
        send(
            f"MERGE (a:Lockfile {{id:{lid}, path:'{path}', service:'{svc}' "
            f", compromised_window:'{cw}', snapshot:'{snapshot}' "
            f", kind:'{eco}'}})-[r:RESOLVES]->"
            f"(b:Version {{id:{sink_vid}, version:'0.0.0-baseline'}})",
            "lf",
        )
        n += 1
    log(f"  lockfiles attempted={n}")

    log("aggregate truth:")
    for label in ["Package", "Version", "Maintainer", "Lockfile", "Advisory"]:
        r = post_query(args.url, args.graph, args.token,
                       f"MATCH (n:{label}) RETURN count(*) AS c")
        c, ep = runtime_stats(r)
        log(f"  (:{label}) => {c} read_epoch={ep}")
    for rel in ["DEPENDS_ON", "HAS_VERSION", "MAINTAINED_BY",
                "SIBLING_OF", "TYPOSQUAT_OF", "AFFECTS",
                "RESOLVES", "ANCHOR"]:
        r = post_query(args.url, args.graph, args.token,
                       f"MATCH (a)-[r:{rel}]->(b) RETURN count(*) AS c")
        c, ep = runtime_stats(r)
        log(f"  [:{rel}]  => {c} read_epoch={ep}")

    log(f"ok={counters['ok']}  err={counters['err']}  elapsed={time.monotonic()-t0:.1f}s")


if __name__ == "__main__":
    main()
