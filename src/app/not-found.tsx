import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CommandSearch } from "@/components/CommandSearch";

export default function NotFound() {
  return (
    <main>
      <Nav />
      <section className="border-b border-ink-600">
        <div className="mx-auto max-w-[1400px] px-6 py-20 dot-grid">
          <div className="text-2xs uppercase tracking-widest text-ink-400 mb-3">
            <Link href="/" className="hover:text-ink-50">home</Link>
            <span className="px-2">›</span>
            <span>404</span>
          </div>
          <h1 className="text-2xl font-semibold text-ink-50 mb-3">package not found in graph</h1>
          <p className="text-md text-ink-300 max-w-xl mb-8">
            <code>MATCH (p:Package &#123;name:$name&#125;)</code> returned zero rows.
            Try the canonical TanStack worm (<code>tanstack/react-virtual@3.10.8</code>) or paste a real lockfile.
          </p>
          <CommandSearch large />
        </div>
      </section>
      <Footer />
    </main>
  );
}
