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

  const tiles = result.tiles;

  return (
    <main>
      <Nav active={`/scan/${encodeURIComponent(pkg)}`} />

      <section className="border-b border-ink-600">
        <div className="mx-auto max-w-[1400px] px-6 py-10">
          <div className="flex items-center gap-3 text-2xs uppercase tracking-widest text-ink-400 mb-4">
            <Link href="/" className="hover:text-ink-50">home</Link>
            <span>›</span>
            <span>scan</span>
            <span>›</span>
            <span className="cell">{pkg}</span>
          </div>
          <VerdictCard result={result as any} />
          <div className="mt-6">
            <CommandSearch initial={pkg} />
          </div>
        </div>
      </section>

      <section className="border-b border-ink-600">
        <div className="mx-auto max-w-[1400px] px-6 py-10">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink-50">The Six Tiles</h2>
            <span className="text-2xs uppercase tracking-widest text-ink-400">
              {result.totalMs}ms · {result.source}
            </span>
          </header>
          <div className="grid md:grid-cols-2 gap-4">
            {tiles.map((t) => (
              <TilePanel key={t.id} t={t} />
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1400px] px-6 py-10 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {result.timeline && (
              <WormTrace
                events={result.timeline as any}
                durationMs={360_000}
                autoplay
              />
            )}
          </div>
          <aside className="space-y-4">
            <div className="border border-ink-600 bg-ink-900 p-4">
              <div className="text-2xs uppercase tracking-widest text-ink-400 mb-1">other recent exploits</div>
              <ul className="text-xs space-y-1.5">
                {SAMPLE_PACKAGES.filter((s) => s.pkg !== pkg).map((s) => (
                  <li key={s.pkg}>
                    <Link href={`/scan/${encodeURIComponent(s.pkg)}`} className="cell underline decoration-dotted">
                      {s.pkg}
                    </Link>
                    <span className="text-ink-400 ml-2">{s.note}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-ink-600 bg-ink-900 p-4">
              <div className="text-2xs uppercase tracking-widest text-ink-400 mb-2">share</div>
              <div className="cell text-xs text-ink-200 break-all">
                {`https://meridian.sithunyein.com/scan/${encodeURIComponent(pkg)}`}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
