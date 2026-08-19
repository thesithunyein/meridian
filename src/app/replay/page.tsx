import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WormTrace } from "@/components/WormTrace";
import { CypherReveal } from "@/components/CypherReveal";
import { TANSTACK_REPLAY } from "@/server/replay-data";
import { QUERIES } from "@/lib/cypher";

export default function ReplayPage() {
  return (
    <Nav active="/replay">
      <main className="app-main">
        <div className="app-header-bar">
          <div className="crumbs">
            <Link href="/">home</Link>
            <span>›</span>
            <span className="text-ink-300">replay</span>
          </div>
          <h1>
            Trace a real <em>worm</em>.
          </h1>
          <p className="subtitle">
            The canonical TanStack-worm 6-minute hijack — replayed as a deterministic timeline.
            Every event is keyed to one of the six Cypress queries in our query layer.
          </p>
        </div>

        <section className="section">
          <div className="section-inner grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="glass-card stripe-border-strip stripe-border-strip--crit">
                <header className="glass-card-header">
                  <span className="bullet-bordered bullet-bordered--crit">
                    LIVE
                  </span>
                  <span className="text-2xs uppercase tracking-widest text-ink-300">
                    WormTrace
                  </span>
                  <span className="ml-auto cell-mono text-2xs text-ink-400">
                    autoplay · 360s · TanStack-worm v1
                  </span>
                </header>
                <div className="px-2 pb-4">
                  <WormTrace events={TANSTACK_REPLAY.events as any} durationMs={360_000} autoplay />
                </div>
              </div>
            </div>
            <aside className="replay-side">
              <div className="glass-card glass-card--inset stripe-border-strip stripe-border-strip--crit">
                <div className="text-2xs uppercase tracking-widest text-crit mb-1">verdict</div>
                <p className="text-md text-ink-50 leading-snug mb-2">
                  17 services exposed · 6 lockfiles resolved the bad version · 6 typosquats nearby.
                </p>
                <code className="cell-mono text-accent text-xs">pnpm update tanstack/react-virtual@^3.10.9</code>
              </div>
              <div className="glass-card glass-card--inset stripe-border-strip stripe-border-strip--info">
                <div className="text-2xs uppercase tracking-widest text-info mb-2">canned query</div>
                <CypherReveal
                  cypher={QUERIES["exposed-services"].cypher}
                  params={{
                    ecosystem: "npm",
                    name: TANSTACK_REPLAY.name,
                    version: TANSTACK_REPLAY.version,
                  }}
                />
              </div>
            </aside>
          </div>
        </section>

        <section className="section">
          <div className="section-inner grid lg:grid-cols-3 gap-4">
            <div className="glass-card glass-card--level-1 stripe-border-strip stripe-border-strip--info">
              <div className="glass-card-header">
                <span className="bullet-bordered bullet-bordered--info">step 1</span>
                <span className="text-2xs uppercase tracking-widest text-ink-300">09:00</span>
              </div>
              <h3 className="text-md font-semibold text-ink-50 px-4 py-3">
                {TANSTACK_REPLAY.name}@{TANSTACK_REPLAY.version} published clean
              </h3>
              <p className="glass-card-subtitle mb-4">
                CVE stream shows zero advisories. The PR diff is small. The version bumps from 3.10.7.
              </p>
            </div>
            <div className="glass-card glass-card--level-1 stripe-border-strip stripe-border-strip--high">
              <div className="glass-card-header">
                <span className="bullet-bordered bullet-bordered--high">step 2</span>
                <span className="text-2xs uppercase tracking-widest text-ink-300">09:02</span>
              </div>
              <h3 className="text-md font-semibold text-ink-50 px-4 py-3">
                3.10.8 republished with payload
              </h3>
              <p className="glass-card-subtitle mb-4">
                A benign dependency is added; the new build embeds a token-stealer that runs in <code>.claude/</code>.
                The npm audit stream does not flag it.
              </p>
            </div>
            <div className="glass-card glass-card--level-1 stripe-border-strip stripe-border-strip--crit">
              <div className="glass-card-header">
                <span className="bullet-bordered bullet-bordered--crit">step 3</span>
                <span className="text-2xs uppercase tracking-widest text-ink-300">09:04</span>
              </div>
              <h3 className="text-md font-semibold text-ink-50 px-4 py-3">
                17 services in your stack route through it
              </h3>
              <p className="glass-card-subtitle mb-4">
                One Cypher &mdash; <code>MATCH (bad)&lt;-[:DEPENDS_ON*1..6]-(svc:Service)</code> &mdash; answers the page's headline question.
                Meridian renders the six tiles in &lt;350 ms.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Nav>
  );
}
