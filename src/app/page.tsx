import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CommandSearch } from "@/components/CommandSearch";


const RECENT = [
  { pkg: "tanstack/react-virtual", ver: "3.10.8", sev: "crit" as const, exposed: 47, since: "09:14 PT" },
  { pkg: "evil-pkg",             ver: "1.0.0",  sev: "crit" as const, exposed: 17, since: "07:02 PT" },
  { pkg: "ua-parser-js",         ver: "0.7.30", sev: "high" as const, exposed: 9,  since: "Aug 14" },
  { pkg: "node-ipc",             ver: "9.x",    sev: "high" as const, exposed: 6,  since: "Aug 12" },
  { pkg: "colors.js",            ver: "1.4.1",  sev: "warn" as const, exposed: 12, since: "Aug 11" },
  { pkg: "lodash",               ver: "*",      sev: "ok"   as const, exposed: 0,  since: "—" },
];

const SAMPLE_QUERIES = [
  {
    title: "Which internal services are transitively exposed?",
    node: "-- 4-hop traversal over DEPENDS_ON",
    cypher:
      "MATCH (bad:Package {ecosystem:'npm', name:$n, version:$v})\n" +
      "      <-[:DEPENDS_ON*1..6]-(svc:Service)\n" +
      "RETURN svc.id AS service, length(path) AS hops\n" +
      "ORDER BY hops ASC LIMIT 200;",
    shape: "MATCH ↩ traversal",
  },
  {
    title: "Are there typosquat packages near this one?",
    node: "-- edit-distance 2 over precomputed candidates",
    cypher:
      "MATCH (p:Package {ecosystem:'npm', name:$n})\n" +
      "      <-[:TYPOSQUAT_OF {distance: 1..2}]-(t:Package)\n" +
      "RETURN t.name, t.distance, t.first_published\n" +
      "ORDER BY t.distance, t.downloads DESC LIMIT 50;",
    shape: "CYPH pattern match",
  },
  {
    title: "Which applications resolved a compromised version live?",
    node: "-- RESOLVES against historical lockfile snapshots",
    cypher:
      "MATCH (lf:Lockfile)-[:RESOLVES]->\n" +
      "      (v:Version {ecosystem:'npm', name:$n, semver:$v})\n" +
      "      <-[:USES_LOCKFILE]-(app:Service)\n" +
      "WHERE lf.snapshot_ts >= datetime('2026-05-01')\n" +
      "RETURN app, lf, v LIMIT 100;",
    shape: "Temp-scope join",
  },
];

export default function Home() {
  return (
    <main>
      <Nav />

      {/* HERO */}
      <section className="border-b border-ink-600 dot-grid">
        <div className="mx-auto max-w-[1400px] px-6 pt-24 pb-16 relative">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 text-2xs text-ink-400 uppercase tracking-widest mb-6">
                <span className="bullet ok">OK</span>
                <span>hydra-db v0.7.2 · graph 5,124 nodes · 18,772 edges</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-ink-50 mb-4">
                one compromised package.
                <br />
                <span className="text-accent">one english sentence.</span>
              </h1>
              <p className="text-md text-ink-200 max-w-2xl mb-10 leading-relaxed">
                Meridian runs six deterministic graph queries against HydraDB the moment a CVE drops, and gives you the one English answer you actually need in the first six minutes of a supply-chain attack — plus the one-line fix command, and the Cypher for the curious.
              </p>
              <CommandSearch large />
            </div>
            <aside className="lg:col-span-4">
              <div className="border border-ink-600 p-5 bg-ink-900">
                <div className="tape" style={{ padding: 0, borderBottom: "1px solid #1c1c1c", marginBottom: 12 }}>
                  <span>LIVE WORM TRACE</span>
                  <span className="bullet crit">SIM</span>
                </div>
                <pre className="text-xs text-ink-200 leading-relaxed">
{`09:00  tanstack/react-virtual@3.10.7  ok
09:01  +dependency.added    chalk-extra 0.0.1
09:02  tanstack/react-virtual@3.10.8  publish
09:03  ▸ typo: chalk-extras (ed=1) install spikes 240×
09:04  ▸ co-maintainer: vit-dev-bot  12 ops/min
09:05  ▸ 17 lockfile rows × 14 services
09:06  ▸ breach window 4h 12m  guard ⚑
`.replace(/^\s+/gm, "")}
                </pre>
                <Link href="/replay" className="tile-button inline-block mt-4">
                  ▸ open replay
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* RECENT EXPLOITS */}
      <section className="border-b border-ink-600">
        <div className="mx-auto max-w-[1400px] px-6 py-12">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink-50">Recent exploits · last 30 days</h2>
            <span className="text-2xs uppercase tracking-widest text-ink-400">
              refreshing every 60 s · from OSV + GHSA
            </span>
          </header>
          <table className="w-full text-sm border-t border-ink-600">
            <thead className="text-2xs uppercase tracking-widest text-ink-400">
              <tr>
                <th className="text-left py-2 px-2 w-[32%]">package</th>
                <th className="text-left py-2 px-2 w-[12%]">ver</th>
                <th className="text-left py-2 px-2 w-[14%]">sev</th>
                <th className="text-right py-2 px-2 w-[12%]">exposed</th>
                <th className="text-right py-2 px-2 w-[18%]">first seen</th>
                <th className="text-right py-2 px-2 w-[12%]">›</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-600">
              {RECENT.map((r) => (
                <tr key={r.pkg} className="hover:bg-ink-800">
                  <td className="py-2 px-2 cell">
                    <Link className="underline decoration-dotted" href={`/scan/${encodeURIComponent(`${r.pkg}@${r.ver}`)}`}>
                      {r.pkg}
                    </Link>
                  </td>
                  <td className="py-2 px-2 cell text-ink-200">{r.ver}</td>
                  <td className="py-2 px-2">
                    <span className={`bullet ${r.sev}`}>{r.sev}</span>
                  </td>
                  <td className="py-2 px-2 cell text-right">{r.exposed}</td>
                  <td className="py-2 px-2 cell text-right text-ink-300">{r.since}</td>
                  <td className="py-2 px-2 text-right">
                    <Link href={`/scan/${encodeURIComponent(`${r.pkg}@${r.ver}`)}`} className="text-ink-300 hover:text-ink-50">scan ›</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SAMPLE QUERIES */}
      <section>
        <div className="mx-auto max-w-[1400px] px-6 py-12">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink-50">The Six Cypher Queries</h2>
            <Link href="/how" className="text-2xs uppercase tracking-widest text-ink-300 hover:text-ink-50">
              read methodology →
            </Link>
          </header>
          <div className="grid md:grid-cols-3 gap-4">
            {SAMPLE_QUERIES.map((s) => (
              <article key={s.title} className="border border-ink-600 bg-ink-900 stripe-info flex flex-col">
                <header className="p-4 border-b border-ink-600">
                  <div className="text-2xs uppercase tracking-widest text-info mb-1">QUERY</div>
                  <h3 className="text-md font-semibold text-ink-50">{s.title}</h3>
                </header>
                <pre className="cypher text-xs text-ink-200 whitespace-pre-wrap break-words p-4 flex-1">
{s.cypher}
                </pre>
                <footer className="px-4 py-3 border-t border-ink-600 flex items-center justify-between text-2xs uppercase tracking-widest text-ink-400">
                  <span>hydra-db.openCypher 9</span>
                  <span>{s.shape}</span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
