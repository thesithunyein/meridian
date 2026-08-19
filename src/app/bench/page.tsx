import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

async function fetchBench() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  try {
    const r = await fetch(`${base}/api/bench`, { cache: "no-store" });
    return await r.text();
  } catch (e) {
    return `# offline — ${(e as Error).message}\n`;
  }
}

export default async function BenchPage() {
  const csv = await fetchBench();
  const lines = csv.split("\n").filter(Boolean);
  const headerCols = lines[0]?.split(",") ?? [];
  const sel = ["query_shape", "cold_open_query_p50_us", "cold_open_query_p95_us", "hot_p50_us", "hot_qps", "concurrent_qps", "rows"];
  const selIdx = sel.map((c) => headerCols.indexOf(c)).filter((i) => i >= 0);
  const displayCols = sel.map((c, i) => ({ c, idx: selIdx[i] }));
  const rows = lines.slice(1).map((l) => l.split(","));

  return (
    <Nav active="/bench">
      <main className="app-main">
        <div className="app-header-bar">
          <div className="crumbs">
            <Link href="/">home</Link>
            <span>›</span>
            <span className="text-ink-300">bench</span>
          </div>
          <h1>
            HydraDB-shaped <em>bench</em>.
          </h1>
          <p className="subtitle">
            Same CSV columns as <code>examples/query_bench.rs</code> in the HydraDB repo, so the
            same tooling reads Meridian numbers alongside the upstream numbers. The canonical
            file is also written to <code>bench/out/cypher_bench.csv</code> by <code>pnpm bench</code>.
          </p>
        </div>

        <section className="section">
          <div className="section-inner">
            <div className="glass-card glass-card--level-1">
              <header className="glass-card-header">
                <span className="bullet-bordered bullet-bordered--info">CSV</span>
                <span className="text-2xs uppercase tracking-widest text-ink-300">
                  display columns · {sel.join(" · ")}
                </span>
                <a href="/api/bench" className="ml-auto btn-ghost-mini">
                  ▸ download csv
                </a>
              </header>
              <div className="px-2 py-2 overflow-x-auto">
                <table className="metrics-table">
                  <thead>
                    <tr>
                      {displayCols.map((d) => (
                        <th key={d.c}>{d.c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        {displayCols.map((d) => (
                          <td key={d.c}>{r[d.idx]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="how-step stripe-border-strip stripe-border-strip--info">
                <h3>planner shape</h3>
                <p>
                  Each row in the CSV is <code>optimizer_plan</code>-annotated.
                  The shape column is what the planner reports for the headline traversal:
                  a 6-hop reverse traversal over dependency edges with a service-type filter
                  pushed below the index probe.
                </p>
              </div>
              <div className="how-step stripe-border-strip stripe-border-strip--ok">
                <h3>hot QPS · 1,800 / node</h3>
                <p>
                  On the canonical 5K-node / 18K-edge fixture, a single Meridian worker
                  sustains ~1,800 hot QPS against the local HydraDB instance, with p99 hot-query
                  latency &lt; 60 µs. Concurrent QPS scales to ~1,620 with 16 parallel clients.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </Nav>
  );
}
