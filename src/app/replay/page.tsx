import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WormTrace } from "@/components/WormTrace";
import { CypherReveal } from "@/components/CypherReveal";
import { TANSTACK_REPLAY } from "@/server/replay-data";
import { QUERIES } from "@/lib/cypher";

export default function ReplayPage() {
  return (
    <main>
      <Nav active="/replay" />
      <section className="border-b border-ink-600">
        <div className="mx-auto max-w-[1400px] px-6 py-10">
          <div className="flex items-center gap-3 text-2xs uppercase tracking-widest text-ink-400 mb-3">
            <Link href="/" className="hover:text-ink-50">home</Link>
            <span>›</span>
            <span>replay</span>
          </div>
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <WormTrace events={TANSTACK_REPLAY.events as any} durationMs={360_000} autoplay />
            </div>
            <aside className="lg:col-span-4 space-y-4">
              <div className="border border-ink-600 stripe-crit bg-ink-900 p-4">
                <div className="text-2xs uppercase tracking-widest text-crit mb-1">verdict</div>
                <p className="text-md text-ink-50 leading-snug mb-2">
                  17 services exposed · 6 lockfiles resolved the bad version · 6 typosquats nearby.
                </p>
                <code className="cell text-accent text-xs">pnpm update tanstack/react-virtual@^3.10.9</code>
              </div>
              <div className="border border-ink-600 bg-ink-900 p-4">
                <div className="text-2xs uppercase tracking-widest text-ink-400 mb-2">canned query</div>
                <CypherReveal
                  cypher={QUERIES["exposed-services"].cypher}
                  params={{ ecosystem: "npm", name: TANSTACK_REPLAY.name, version: TANSTACK_REPLAY.version }}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>
      <section className="border-b border-ink-600">
        <div className="mx-auto max-w-[1400px] px-6 py-10 grid lg:grid-cols-3 gap-6">
          <div className="border border-ink-600 bg-ink-900 stripe-info p-5">
            <div className="text-2xs uppercase tracking-widest text-info mb-1">step 1 — 09:00</div>
            <h3 className="text-md font-semibold text-ink-50 mb-2">{TANSTACK_REPLAY.name}@{TANSTACK_REPLAY.version} published clean</h3>
            <p className="text-xs text-ink-300">CVE stream shows zero advisories. The PR diff is small. The version bumps from 3.10.7.</p>
          </div>
          <div className="border border-ink-600 bg-ink-900 stripe-high p-5">
            <div className="text-2xs uppercase tracking-widest text-high mb-1">step 2 — 09:02</div>
            <h3 className="text-md font-semibold text-ink-50 mb-2">3.10.8 republished with payload</h3>
            <p className="text-xs text-ink-300">A benign dependency is added; the new build embeds a token-stealer that runs in <code>.claude/</code>. The npm audit stream does not flag it.</p>
          </div>
          <div className="border border-ink-600 bg-ink-900 stripe-crit p-5">
            <div className="text-2xs uppercase tracking-widest text-crit mb-1">step 3 — 09:04</div>
            <h3 className="text-md font-semibold text-ink-50 mb-2">17 services in your stack route through it</h3>
            <p className="text-xs text-ink-300">One Cypher — <code>MATCH (bad)&lt;-[:DEPENDS_ON*1..6]-(svc:Service)</code> — answers the page's headline question. Meridian renders the six tiles in &lt;350 ms.</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
