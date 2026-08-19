import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CommandSearch } from "@/components/CommandSearch";
import { VerdictCard } from "@/components/VerdictCard";
import { TilePanel } from "@/components/Tile";
import { WormTrace } from "@/components/WormTrace";
import { runScan } from "@/lib/hydra";
import { SAMPLE_PACKAGES, fixtureFor } from "@/server/replay-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { pkg: string } }) {
  const pkg = decodeURIComponent(params.pkg);
  return { title: `${pkg} · scan` };
}

export default async function ScanPage({ params }: { params: { pkg: string } }) {
  const pkg = decodeURIComponent(params.pkg);
  if (!pkg) notFound();

  let result;
  try {
    result = await runScan(pkg);
  } catch {
    const fallback = fixtureFor("npm", pkg.split("@")[0], pkg.split("@")[1]);
    result = {
      package: pkg,
      ecosystem: "npm",
      generatedAt: new Date().toISOString(),
      totalMs: 0,
      tiles: fallback.tiles,
      source: "fixture:deterministic-v1",
      timeline: fallback.timeline,
    };
  }

  return (
    <Nav active={`/scan/${encodeURIComponent(pkg)}`}>
      <main className="app-main">
        <div className="app-header-bar">
          <div className="crumbs">
            <Link href="/">home</Link>
            <span>›</span>
            <Link href="/how">scan</Link>
            <span>›</span>
            <span className="cell-mono text-ink-300">{pkg}</span>
          </div>
          <h1>
            <em>{result.package.split("@")[0]}</em> exposure.
          </h1>
          <p className="subtitle">
            Below is the verdict plus every row that produced it. Click{" "}
            <strong className="text-ink-50">show cypher</strong> on any tile to inspect the query.
          </p>
        </div>

        <section className="section">
          <div className="section-inner">
            <VerdictCard result={result as any} />
            <div className="mt-6">
              <CommandSearch initial={pkg} />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-inner">
            <header className="flex items-center justify-between mb-4">
              <h2>The six tiles</h2>
              <span className="text-2xs uppercase tracking-widest text-ink-400 cell-mono">
                {result.totalMs}ms · {result.source}
              </span>
            </header>
            <div className="grid md:grid-cols-2 gap-4">
              {result.tiles.map((t) => (
                <TilePanel key={t.id} t={t} />
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-inner grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {result.timeline && (
                <WormTrace
                  events={result.timeline as any}
                  durationMs={360_000}
                  autoplay
                />
              )}
            </div>
            <aside className="replay-side">
              <div className="glass-card glass-card--inset">
                <div className="text-2xs uppercase tracking-widest text-ink-400 mb-1">other recent exploits</div>
                <ul className="text-xs space-y-1.5">
                  {SAMPLE_PACKAGES.filter((s) => s.pkg !== pkg).map((s) => (
                    <li key={s.pkg}>
                      <Link
                        href={`/scan/${encodeURIComponent(s.pkg)}`}
                        className="cell-mono underline decoration-dotted text-ink-50"
                      >
                        {s.pkg}
                      </Link>
                      <span className="text-ink-400 ml-2">{s.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card glass-card--inset">
                <div className="text-2xs uppercase tracking-widest text-ink-400 mb-2">share</div>
                <div className="cell-mono text-xs text-ink-200 break-all">
                  {`https://meridian.sithunyein.com/scan/${encodeURIComponent(pkg)}`}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </Nav>
  );
}
