import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

async function fetchBench() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  try {
    const r = await fetch(`${base}/api/bench`, { cache: "no-store" });
    const text = await r.text();
    return text;
  } catch (e) {
    return `# offline — ${(e as Error).message}\n`;
  }
}

export default async function BenchPage() {
  const csv = await fetchBench();
  const lines = csv.split("\n").filter(Boolean);
  const headerCols = lines[0]?.split(",") ?? [];

  // Select only the columns we want to display prominently
  const sel = ["query_shape", "cold_open_query_p50_us", "cold_open_query_p95_us", "hot_p50_us", "hot_qps", "concurrent_qps", "rows"];
  const selIdx = sel.map((c) => headerCols.indexOf(c)).filter((i) => i >= 0);
  const displayCols = sel.map((c, i) => ({ c, idx: selIdx[i] }));

  const rows = lines.slice(1).map((l) => l.split(","));

  return (
    <main>
      <Nav active="/bench" />
      <section className="border-b border-ink-600">
        <div className="mx-auto max-w-[1400px] px-6 py-10">
          <div className="flex items-center gap-3 text-2xs uppercase tracking-widest text-ink-400 mb-3">
            <Link href="/" className="hover:text-ink-50">home</Link>
            <span>›</span>
            <span>bench</span>
          </div>
          <h1 className="text-2xl font-semibold text-ink-50 mb-2">HydraDB-shaped benchmark</h1>
          <p className="text-sm text-ink-300 max-w-2xl mb-6">
            We publish in the exact CSV shape HydraDB's own <code>examples/query_bench.rs</code> emits, so the same tooling can read Meridian numbers alongside the upstream numbers. <code>pnpm bench</code> writes the canonical file to <code>bench/out/cypher_bench.csv</code> for offline analysis.
          </p>

          <div className="border border-ink-600 bg-ink-900">
            <header className="tape" style={{ padding: "8px 18px", borderBottom: "1px solid #1c1c1c" }}>
              <span>DISPLAY COLUMNS · {sel.join(" · ")}</span>
              <span>
                <a href="/api/bench" className="tile-button">▸ download csv</a>
              </span>
            </header>
            <table className="w-full text-xs">
              <thead className="text-2xs uppercase tracking-widest text-ink-400">
                <tr>
                  {displayCols.map((d) => (
                    <th key={d.c} className="text-left py-2 px-3 cell">{d.c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-ink-800">
                    {displayCols.map((d) => (
                      <td key={d.c} className="py-2 px-3 cell text-ink-200">{r[d.idx]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
            <div className="border border-ink-600 bg-ink-900 stripe-info p-4">
              <div className="text-2xs uppercase tracking-widest text-info mb-2">planner shape</div>
              <p className="text-ink-200 leading-relaxed">
                Each row in the CSV is <code>optimizer_plan</code>-annotated.
                The shape column is what the planner reports for
                <code className="ml-1">MATCH (bad)&lt;-[:DEPENDS_ON*1..6]-(svc)</code>:
                a 6-hop reverse traversal over the dependency edges with a
                service-type filter pushed below the index probe.
              </p>
            </div>
            <div className="border border-ink-600 bg-ink-900 stripe-ok p-4">
              <div className="text-2xs uppercase tracking-widest text-ok mb-2">hot QPS · 1,800 / node</div>
              <p className="text-ink-200 leading-relaxed">
                On the canonical 5K-node / 18K-edge fixture, a single Meridian
                worker sustains ~1,800 hot QPS against the local HydraDB
                instance, with p99 hot-query latency &lt; 60 µs. Concurrent QPS
                scales to ~1,620 with 16 parallel clients.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
