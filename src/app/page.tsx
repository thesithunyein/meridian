/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// =====================================================================
//   MERIDIAN LANDING Ã¢ÂÂ clean, product-first, Stripe/Linear style.
//   One hero with search, 3 benefits, how-it-works, trust signals.
// =====================================================================

const NAV: Array<{ label: string; href: string }> = [
  { label: "How it works", href: "/how" },
  { label: "Docs",        href: "/how" },
  { label: "Bench",       href: "/bench" },
];

const BENEFITS = [
  {
    icon: "zap",
    title: "One sentence. One fix.",
    body: "Paste a package name, get a plain-English verdict and a copy-paste fix command. No log diving, no CVE databases, no graph theory.",
  },
  {
    icon: "shield",
    title: "Graph-powered, not guessing.",
    body: "Six deterministic queries walk your actual dependency tree Ã¢ÂÂ transitive exposure, lockfile snapshots, typosquat neighbours. Answers in seconds.",
  },
  {
    icon: "lock",
    title: "Free forever. No telemetry.",
    body: "Apache-2.0 source on GitHub. Run it on your laptop behind your firewall. No seat counts, no cloud dependency, no tracking.",
  },
];

const STEPS = [
  { num: "1", title: "Paste a package", body: "Type any npm or PyPI package name. e.g. tanstack/react-virtual or ua-parser-js." },
  { num: "2", title: "See the blast radius", body: "Six tiles light up: exposed services, compromised lockfiles, typosquat neighbours, and more." },
  { num: "3", title: "Copy the fix", body: "One shell command at the top of the page. Paste it into your terminal. Done." },
];

const FAQ: Array<{ q: string; body: string }> = [
  {
    q: "What packages can I scan?",
    body: "Any npm or PyPI package. The engine walks the full transitive dependency tree Ã¢ÂÂ not just direct imports.",
  },
  {
    q: "Do I need to install anything?",
    body: "No. The hosted version at meridian.sithunyein.com works in your browser. For air-gapped environments, run it locally with Docker.",
  },
  {
    q: "Is my data sent anywhere?",
    body: "No telemetry, no analytics, no package names logged. The engine is Apache-2.0 Ã¢ÂÂ you can read the source.",
  },
  {
    q: "How is this different from npm audit?",
    body: "npm audit checks direct advisories. Meridian walks the full transitive graph Ã¢ÂÂ 6 hops deep Ã¢ÂÂ to find services that are exposed but don't appear in any audit output.",
  },
];

interface LiveStats {
  packages: number;
  edges: number;
  advisories: number;
}

export default function Home() {
  const router = useRouter();
  const root = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<LiveStats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setStats({ packages: j.packages, edges: j.edges, advisories: j.advisories });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl) return;
    const appearEls = Array.from(rootEl.querySelectorAll<HTMLElement>(".appear"));
    const settled = new WeakSet<HTMLElement>();
    const settle = (el: HTMLElement) => { if (!el || settled.has(el)) return; settled.add(el); el.classList.add("is-in"); };
    const handleAnimEnd = (ev: AnimationEvent) => {
      const target = ev.target as HTMLElement | null;
      if (target && target.classList?.contains("appear")) settle(target);
    };
    document.addEventListener("animationend", handleAnimEnd);
    const timer = setTimeout(() => { for (const el of appearEls) settle(el); }, 600);
    return () => { document.removeEventListener("animationend", handleAnimEnd); clearTimeout(timer); };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = search.trim();
    if (!pkg) return;
    router.push(`/scan/${encodeURIComponent(pkg)}`);
  };

  return (
    <div ref={root}>
      <div className="grain" aria-hidden />
      <div className="hero-photo" aria-hidden>
        <video
          className="hero-photo-video"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260723_145606_ab143199-b593-4941-bb1b-9afca215416b.mp4"
          autoPlay muted loop playsInline preload="auto"
        />
      </div>

      <div className="page">
        <div className="menu-backdrop" aria-hidden />

        {/* ---- HEADER ---- */}
        <header className="header">
          <Link href="/" className="logo" aria-label="Meridian">
            <svg viewBox="0 0 24 24" className="logo-mark" aria-hidden="true">
              <path d="M2 2 L7 2 L7 16 L12 10 L12 2 L18 2 L18 22 L12 22 L12 14 L7 18 L7 22 L2 22 Z" fill="currentColor" />
            </svg>
          </Link>

          <nav id="site-nav" aria-label="Primary" className="nav">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="nav-pill appear appear--soft">{item.label}</Link>
            ))}
          </nav>

          <Link href="/how" className="btn btn-solid header-cta">Get started</Link>

          <button type="button" className="burger" aria-controls="site-nav" aria-label="Open menu">
            <span /><span /><span />
          </button>
        </header>

        {/* ---- HERO ---- */}
        <main id="top" className="hero">
          <div className="hero-copy">
            <div className="badge appear appear--pop">
              <span>Supply chain security for npm &amp; PyPI</span>
            </div>

            <h1 className="headline">
              <span className="headline-line appear appear--mask">Know your <em>blast radius</em></span>
              <span className="headline-line appear appear--mask">before the attacker does.</span>
            </h1>

            <p className="lede appear appear--soft">
              Paste a package name. Meridian walks your dependency graph six hops deep
              and tells you exactly which services are exposed Ã¢ÂÂ in plain English, in seconds.
            </p>

            {/* Interactive search */}
            <form onSubmit={handleSearch} className="hero-search appear appear--btn">
              <div className="search-box">
                <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Paste a package name, e.g. tanstack/react-virtual"
                  className="search-input"
                  aria-label="Package name"
                />
                <button type="submit" className="btn btn-solid search-btn">Scan</button>
              </div>
              <p className="search-hint">Try: evil-pkg ÃÂ· ua-parser-js ÃÂ· node-ipc ÃÂ· event-stream</p>
            </form>
          </div>
        </main>
      </div>

      {/* ---- STATS BAR ---- */}
      <footer className="stats" id="stats">
        <span className="stat appear appear--stat">
          <svg viewBox="0 0 24 24" className="stat-icon" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity=".5"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity=".7"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity=".7"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity=".5"/></svg>
          <span>{stats ? `${stats.packages.toLocaleString()} packages indexed` : "Loading graphÃ¢ÂÂ¦"}</span>
        </span>
        <span className="stat appear appear--stat">
          <svg viewBox="0 0 24 24" className="stat-icon" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <span>6 queries ÃÂ· &lt;300ms</span>
        </span>
        <span className="stat appear appear--stat">
          <svg viewBox="0 0 24 24" className="stat-icon" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity=".5"/><path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/><path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
          <span>Apache-2.0 ÃÂ· Free forever</span>
        </span>
      </footer>

      {/* ---- 3 BENEFITS ---- */}
      <section className="section">
        <div className="section-inner">
          <h2 className="appear appear--soft">What Meridian does</h2>
          <div className="benefits-grid">
            {BENEFITS.map((b) => (
              <article key={b.title} className="benefit-card appear appear--scale">
                <div className="benefit-icon">
                  {b.icon === "zap" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
                  {b.icon === "shield" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                  {b.icon === "lock" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                </div>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---- HOW IT WORKS (3 steps) ---- */}
      <section className="section">
        <div className="section-inner">
          <h2 className="appear appear--soft">How it works</h2>
          <div className="steps-grid">
            {STEPS.map((s) => (
              <div key={s.num} className="step-card appear appear--scale">
                <div className="step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/how" className="btn btn-ghost">Read the full docs Ã¢ÂÂ</Link>
          </div>
        </div>
      </section>

      {/* ---- TRUST SIGNALS ---- */}
      <section className="section">
        <div className="section-inner">
          <div className="trust-grid">
            <div className="trust-card appear appear--soft">
              <div className="trust-label">Powered by</div>
              <div className="trust-value">HydraDB</div>
              <p>Graph-native dependency traversal. Not vector search Ã¢ÂÂ real Cypher over your actual dependency tree.</p>
            </div>
            <div className="trust-card appear appear--soft">
              <div className="trust-label">Open source</div>
              <div className="trust-value">Apache-2.0</div>
              <p>Read every query in src/lib/cypher.ts. Fork it, self-host it, audit it. No black boxes.</p>
            </div>
            <div className="trust-card appear appear--soft">
              <div className="trust-label">Zero telemetry</div>
              <div className="trust-value">No tracking</div>
              <p>No package names sent, no analytics, no cookies. Your dependency graph stays on your machine.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section className="section" id="faqs">
        <div className="section-inner">
          <h2 className="appear appear--soft">Frequently asked</h2>
          <div className="faq-grid">
            {FAQ.map((f, i) => (
              <article key={i} className="faq-card appear appear--scale">
                <h3>{f.q}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="section">
        <div className="section-inner">
          <div className="cta-card">
            <h2>Start scanning in seconds.</h2>
            <p>Paste a package name above, or try a pre-built scan of a known compromise.</p>
            <div className="hero-actions">
              <Link href={`/scan/${encodeURIComponent("tanstack/react-virtual@3.10.8")}`} className="btn btn-solid btn-hero">
                Scan TanStack/react-virtual
              </Link>
              <Link href={`/scan/${encodeURIComponent("evil-pkg@1.0.0")}`} className="btn btn-ghost btn-hero">
                Scan evil-pkg
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="app-footer">
        <div className="app-footer-powered">
          <span className="text-2xs uppercase tracking-widest text-ink-400">Powered by</span>
          <svg viewBox="0 0 24 24" className="hackhydra-logo" aria-label="HackHydra">
            <path d="M2 2 L7 2 L7 8 L2 8 Z M12 2 L17 2 L17 8 L12 8 Z M5 5 L14 5 L14 11 L5 11 Z M2 12 L7 12 L7 22 L2 22 Z M12 12 L17 12 L17 22 L12 22 Z M5 16 L14 16 L14 22 L5 22 Z" fill="#FF6B35"/>
          </svg>
          <span className="text-ink-200 text-sm font-semibold">HackHydra</span>
        </div>
        <div className="app-footer-tape">
          <span>Â© 2026 Sithu Nyein</span>
          <span className="text-ink-400">Apache-2.0</span>
          <span>meridian.sithunyein.com</span>
        </div>
      </footer>
    </div>
  );
}
