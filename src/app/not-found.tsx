import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CommandSearch } from "@/components/CommandSearch";

export default function NotFound() {
  return (
    <Nav>
      <main className="app-main">
        <div className="app-header-bar">
          <div className="crumbs">
            <Link href="/">home</Link>
            <span>›</span>
            <span className="text-ink-300">404</span>
          </div>
          <h1>
            Package not found in <em>graph</em>.
          </h1>
          <p className="subtitle">
            <code>MATCH (p:Package &#123;name:$name&#125;)</code> returned zero rows.
            Try the canonical TanStack worm (<code>tanstack/react-virtual@3.10.8</code>) or paste a real
            lockfile, and Meridian will answer in seconds.
          </p>
        </div>

        <section className="section">
          <div className="section-inner">
            <CommandSearch large />
          </div>
        </section>
      </main>
      <Footer />
    </Nav>
  );
}
