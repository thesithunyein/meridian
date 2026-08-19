import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CypherReveal } from "@/components/CypherReveal";
import { QUERIES, QUERY_TITLES } from "@/lib/cypher";

const STEPS = [
  {
    title: "1.  Seed the corpus",
    body: "pnpm seed — pulls ~5K npm + PyPI packages, ~50 advisories from OSV, parses ~20 real lockfiles, walks GitHub for maintainers, and precomputes ~600 edit-distance typosquats against the top 10K packages. All idempotent. All in corpus/.",
  },
  {
    title: "2.  Bring up HydraDB",
    body: "docker compose up -d — pulls ghcr.io/hydra-db/hydradb:latest (free, OSS). On cold start the graph node binds 17687 (Bolt) / 18443 (HTTPS) / 19091 (metrics).  one worker is enough for our 5K-node fixture.",
  },
  {
    title: "3.  Ingest",
    body: "pnpm ingest — forks examples/falkor_import.rs into meridian_load, reads corpus/manifest.json + corpus/nodes.jsonl + corpus/edges.jsonl, and bulk-loads the graph into the meridian cell. Sub-2s typical, idempotent on restart.",
  },
  {
    title: "4.  Tweak the query budget",
    body: "pnpm budget --max-scan-edges 120000 — raises HydraDB's default cap so the 4–6-hop reverse traversal in tile 1 fits in budget. We ship a BENCH.md so the trade-off is reproducible.",
  },
  {
    title: "5.  Run dev",
    body: "pnpm dev — starts the Next.js app on http://localhost:3000 (loopback). On a CDN deploy, set HYDRADB_URL=https://api.hydradb.com and HYDRADB_API_KEY=… and Meridian uses the cloud path automatically.",
  },
  {
    title: "6.  Ship",
    body: "Deploy to meridian.sithunyein.com with next build && next start (Node standalone build) behind your reverse-proxy / Cloudflare / tunnel. Total infra cost: $0.",
  },
];

export default function HowPage() {
  return (
    <main>
      <Nav active="/how" />

      <section className="border-b border-ink-600">
        <div className="mx-auto max-w-[1400px] px-6 py-10">
          <div className="text-2xs uppercase tracking-widest text-ink-400 mb-3">
            <Link href="/" className="hover:text-ink-50">home</Link>
            <span className="px-2">›</span>
            <span>how</span>
          </div>
          <h1 className="text-2xl font-semibold text-ink-50 mb-2">How Meridian works</h1>
          <p className="text-md text-ink-300 max-w-3xl mb-8">
            A six-tile response is six deterministic graph queries — never a model.
            Every answer is reproducible: re-run the same query against a frozen
            snapshot and you get the same rows back, byte for byte. This page
            walks the schema, the queries, and the run loop.
          </p>
          <div className="grid lg:grid-cols-2 gap-4">
            {STEPS.map((s) => (
              <article key={s.title} className="border border-ink-600 bg-ink-900 p-4">
                <h3 className="text-md font-semibold text-ink-50 mb-2">{s.title}</h3>
                <p className="text-xs text-ink-300 leading-relaxed">{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink-600">
        <div className="mx-auto max-w-[1400px] px-6 py-10">
          <h2 className="text-lg font-semibold text-ink-50 mb-4">Schema</h2>
          <p className="text-xs text-ink-300 mb-6 max-w-3xl">
            Six node labels and seven relationship types. Every Cypher clause below
            uses bound parameters so runtime interpolation is impossible.
          </p>
          <div className="grid lg:grid-cols-2 gap-4">
            <article className="border border-ink-600 bg-ink-900 p-4">
              <h3 className="text-2xs uppercase tracking-widest text-info mb-3">node labels</h3>
              <ul className="text-sm text-ink-200 space-y-1 cell">
                <li>( :Package  ecosystem:enum, name:string, version?:string )</li>
                <li>( :Version  ecosystem:enum, name:string, semver:string, first_published:date )</li>
                <li>( :Advisory id: string, severity:enum, published:date )</li>
                <li>( :Lockfile id:string, ecosystem:enum, snapshot_ts:datetime, compromised_window?:duration )</li>
                <li>( :Service id:string, team:string, env:enum )</li>
                <li>( :Maintainer id:string, ci_handle?:string )</li>
              </ul>
            </article>
            <article className="border border-ink-600 bg-ink-900 p-4">
              <h3 className="text-2xs uppercase tracking-widest text-info mb-3">relationship types</h3>
              <ul className="text-sm text-ink-200 space-y-1 cell">
                <li>( Package )-[:DEPENDS_ON]-&gt;( Package )</li>
                <li>( Package )-[:VERSION_OF]-&gt;( Package )</li>
                <li>( Maintainer )-[:MAINTAINS]-&gt;( Package )</li>
                <li>( Package )-[:HOSTED_ON &#123; ci:string &#125;]-&gt;( :Repo )</li>
                <li>( Package )-[:PUBLISHED_TO]-&gt;( :Repo )</li>
                <li>( Advisory )-[:AFFECTS]-&gt;( Version )</li>
                <li>( Lockfile )-[:RESOLVES]-&gt;( Version )</li>
                <li>( Service )-[:USES_LOCKFILE]-&gt;( Lockfile )</li>
                <li>( Package )-[:TYPOSQUAT_OF &#123; distance:int &#125;]-&gt;( Package )</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b border-ink-600">
        <div className="mx-auto max-w-[1400px] px-6 py-10">
          <h2 className="text-lg font-semibold text-ink-50 mb-4">The six queries</h2>
          <div className="grid gap-4">
            {(Object.keys(QUERIES) as (keyof typeof QUERIES)[]).map((id) => (
              <article key={id} className="border border-ink-600 bg-ink-900 p-4">
                <header className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold text-ink-50">{QUERY_TITLES[id]}</h3>
                  <span className="text-2xs uppercase tracking-widest text-ink-400 cell">{id}</span>
                </header>
                <CypherReveal
                  cypher={QUERIES[id].cypher}
                  params={{ ecosystem: "npm", name: "tanstack/react-virtual", version: "3.10.8" }}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink-600">
        <div className="mx-auto max-w-[1400px] px-6 py-10 grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="text-lg font-semibold text-ink-50 mb-2">Deploy to meridian.sithunyein.com</h3>
            <pre className="code">{`# local
pnpm i
pnpm seed
docker compose up -d
pnpm dev
curl localhost:3000

# production (Node standalone build)
pnpm build
node .next/standalone/server.js
# bind 127.0.0.1:3000 → meridian.sithunyein.com behind nginx/caddy/cloudflare

# cloud hydradb (optional)
HYDRADB_URL=https://api.hydradb.com \\
HYDRADB_API_KEY=hk_live_… \\
node .next/standalone/server.js`}</pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink-50 mb-2">Caveats judges should know</h3>
            <ul className="space-y-2 text-xs text-ink-300 leading-relaxed">
              <li>· When <code>HYDRADB_URL</code> is unset we hydrate from a deterministic 5K-node fixture so the app boots. The bench route reflects this in the <code>x-meridian-source</code> header.</li>
              <li>· HydraDB's query budgets are strict (scan-edge cap / row cap). Tile 1's 4-hop traversal is the hottest — we publish the budget knob in <code>BENCH.md</code>.</li>
              <li>· We do not run any LLM inside the answer path. No embeddings, no semantic search — pure Cypher.</li>
              <li>· Protobuf and Bolt clients are optional deps. The HTTPS path is enough to count for "meaningful use".</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
