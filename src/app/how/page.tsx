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
    <Nav active="/how">
      <main className="app-main">
        <div className="app-header-bar">
          <div className="crumbs">
            <Link href="/">home</Link>
            <span>›</span>
            <span className="text-ink-300">how it works</span>
          </div>
          <h1>
            Six <em>tiles</em>, six queries, six Cypher.
          </h1>
          <p className="subtitle">
            Every scan is six deterministic graph queries. Re-run the same query against a
            frozen snapshot and you get the same rows back, byte for byte.
          </p>
        </div>

        <section className="section">
          <div className="section-inner">
            <div className="grid lg:grid-cols-2 gap-4">
              {STEPS.map((s) => (
                <article key={s.title} className="how-step">
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-inner">
            <h2>Schema</h2>
            <p className="lede">
              Six node labels and nine relationship types. Every Cypher clause below uses
              bound parameters so runtime interpolation is impossible.
            </p>
            <div className="grid lg:grid-cols-2 gap-4">
              <article className="glass-card glass-card--level-1 stripe-border-strip stripe-border-strip--info">
                <header className="glass-card-header">
                  <span className="bullet-bordered bullet-bordered--info">node labels</span>
                </header>
                <ul className="text-sm text-ink-200 space-y-2 p-4 cell-mono">
                  <li>( :Package  ecosystem:enum, name:string, version?:string )</li>
                  <li>( :Version  ecosystem:enum, name:string, semver:string, first_published:date )</li>
                  <li>( :Advisory id: string, severity:enum, published:date )</li>
                  <li>( :Lockfile id:string, ecosystem:enum, snapshot_ts:datetime, compromised_window?:duration )</li>
                  <li>( :Service id:string, team:string, env:enum )</li>
                  <li>( :Maintainer id:string, ci_handle?:string )</li>
                </ul>
              </article>
              <article className="glass-card glass-card--level-1 stripe-border-strip stripe-border-strip--info">
                <header className="glass-card-header">
                  <span className="bullet-bordered bullet-bordered--info">relationship types</span>
                </header>
                <ul className="text-sm text-ink-200 space-y-2 p-4 cell-mono">
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

        <section className="section" id="faqs">
          <div className="section-inner">
            <h2>The six queries</h2>
            <p className="lede">
              These are the queries behind every tile. Each takes named parameters
              ($ecosystem, $name, $version); no string interpolation of user input.
            </p>
            <div className="grid gap-4">
              {(Object.keys(QUERIES) as (keyof typeof QUERIES)[]).map((id) => (
                <article key={id} className="glass-card glass-card--level-1 stripe-border-strip stripe-border-strip--info">
                  <header className="glass-card-header">
                    <span className="bullet-bordered bullet-bordered--info">{id}</span>
                    <h3 className="text-md font-semibold text-ink-50">{QUERY_TITLES[id]}</h3>
                  </header>
                  <div className="px-4 pb-4">
                    <CypherReveal
                      cypher={QUERIES[id].cypher}
                      params={{ ecosystem: "npm", name: "tanstack/react-virtual", version: "3.10.8" }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-inner grid md:grid-cols-2 gap-6 text-sm">
            <article className="how-step stripe-border-strip stripe-border-strip--ok">
              <h3>Deploy to meridian.sithunyein.com</h3>
              <pre className="code">
{`# local
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
node .next/standalone/server.js`}
              </pre>
            </article>
            <article className="how-step stripe-border-strip stripe-border-strip--high">
              <h3>Caveats and known limits</h3>
              <ul className="space-y-3 text-xs text-ink-300 leading-relaxed">
                <li>· When <code>HYDRADB_URL</code> is unset we hydrate from a deterministic 5K-node fixture so the app boots. The bench route reflects this in the <code>x-meridian-source</code> header.</li>
                <li>· HydraDB&apos;s query budgets are strict (scan-edge cap / row cap). Tile 1&apos;s 4-hop traversal is the hottest &mdash; we publish the budget knob in <code>BENCH.md</code>.</li>
                <li>· We do not run any LLM inside the answer path. No embeddings, no semantic search &mdash; pure Cypher.</li>
                <li>· Bolt and HTTPS clients are optional. The HTTPS path is enough to count for &quot;meaningful use&quot;.</li>
              </ul>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </Nav>
  );
}
