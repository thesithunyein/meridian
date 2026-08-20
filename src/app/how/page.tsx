import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const STEPS = [
  {
    num: "1",
    title: "Paste a package name",
    body: "Enter any npm or PyPI package. Meridian identifies the ecosystem automatically and fetches the dependency graph from HydraDB.",
  },
  {
    num: "2",
    title: "Six tiles light up",
    body: "Each tile answers one security question in parallel: exposed services, compromised lockfiles, typosquat neighbours, maintainer clusters, and more.",
  },
  {
    num: "3",
    title: "Copy the fix",
    body: "The verdict at the top of the page is one English sentence and one shell command. Read it, paste it, done.",
  },
];

const TILES = [
  { name: "Exposed services", desc: "Which internal services transitively depend on this version?" },
  { name: "Version intro", desc: "Which version of the dependency introduced the vulnerability?" },
  { name: "Lockfile consumers", desc: "Which applications resolved the bad version while it was live?" },
  { name: "Sibling packages", desc: "Which other packages share a maintainer or infrastructure?" },
  { name: "Typosquats", desc: "Are there edit-distance neighbours registered nearby?" },
  { name: "Blast radius", desc: "What is the complete blast radius across services + lockfiles?" },
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
            Three steps to <em>know</em>.
          </h1>
          <p className="subtitle">
            No installation, no configuration, no graph theory required.
            Paste a package name and get your answer in seconds.
          </p>
        </div>

        {/* ---- 3 STEPS ---- */}
        <section className="section">
          <div className="section-inner">
            <div className="steps-grid">
              {STEPS.map((s) => (
                <div key={s.num} className="step-card">
                  <div className="step-num">{s.num}</div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- THE SIX TILES ---- */}
        <section className="section">
          <div className="section-inner">
            <h2>The six tiles</h2>
            <p className="lede">
              Each tile answers one security question. All six run in parallel when you scan a package.
            </p>
            <div className="tiles-grid">
              {TILES.map((t) => (
                <div key={t.name} className="tile-card">
                  <div className="tile-header">
                    <span className="tile-name">{t.name}</span>
                  </div>
                  <p className="tile-desc">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- UNDER THE HOOD ---- */}
        <section className="section">
          <div className="section-inner">
            <h2>Under the hood</h2>
            <p className="lede">
              For developers: Meridian runs six deterministic Cypher queries against HydraDB.
              The queries are in <code className="cell-mono text-ink-50">src/lib/cypher.ts</code>.
            </p>
            <div className="how-step">
              <h3>Why a graph database?</h3>
              <p>
                Supply chain exposure is a transitive dependency problem. Vector search finds
                similar packages; graph traversal finds every service that transitively resolves
                a specific version. The headline query is a 6-hop reverse traversal.
              </p>
            </div>
            <div className="how-step">
              <h3>Why no LLM?</h3>
              <p>
                The six queries are reproducible. Same input, same output, byte for byte. There
                is no model in the answer path.
              </p>
            </div>
            <div className="how-step">
              <h3>Run it locally</h3>
              <p>
                Clone the repo, run <code className="cell-mono text-ink-50">pnpm i &amp;&amp; pnpm dev</code> to boot
                against a 5K-node fixture. Add a real graph with{" "}
                <code className="cell-mono text-ink-50">docker compose up -d hydradb</code>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Nav>
  );
}
