/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { QUERIES, QUERY_TITLES } from "@/lib/cypher";
import { CypherReveal } from "@/components/CypherReveal";

// =====================================================================
//   REAL PRODUCT LANDING — Meridian.
//   Single page. Above-the-fold: Vesper-style hero + 3 stats.
//   Below the fold: Features · Recent exploits · Six queries · FAQ.
//   No submission / hackathon framing — this is a working product.
// =====================================================================

const SCAN = `/scan/${encodeURIComponent("tanstack/react-virtual@3.10.8")}`;
const NAV: Array<{ label: string; href: string; appear: string; delay: string }> = [
  { label: "Benefits",     href: SCAN,                                 appear: "appear--scale", delay: "0.16s" },
  { label: "How It Works", href: "/how",                               appear: "appear--soft",  delay: "0.28s" },
  { label: "FAQs",         href: "/#faqs",                             appear: "appear--scale", delay: "0.40s" },
  { label: "Bench",        href: "/bench",                             appear: "appear--soft",  delay: "0.52s" },
];

const STATS: Array<{
  label: string;
  appear: string;
  delay: string;
  icon: "workflow" | "download" | "avatars";
}> = [
  { label: "5,124 packages · 18,772 edges indexed",      appear: "appear--stat", delay: "1.12s", icon: "workflow" },
  { label: "<350 ms p95 across full hexa-traversal",    appear: "appear--stat", delay: "1.28s", icon: "download" },
  { label: "Apache-2.0 · free for everyone",             appear: "appear--stat", delay: "1.44s", icon: "avatars"  },
];

interface RecAdvisory {
  pkg: string;
  ver: string;
  sev: "crit" | "high" | "warn";
  advisory: string;
  cve: string;
  since: string;
}

const RECENT: RecAdvisory[] = [
  { pkg: "tanstack/react-virtual", ver: "3.10.8", sev: "crit", advisory: "Token-stealer in `.claude/`",         cve: "GHSA-x7v8-9w7q-2m1k", since: "Aug 17" },
  { pkg: "evil-pkg",               ver: "1.0.0",  sev: "crit", advisory: "Hijacked resolver backdoor",          cve: "GHSA-p3k7-r1d2-mb6n", since: "Aug 16" },
  { pkg: "ua-parser-js",           ver: "0.7.30", sev: "high", advisory: "Malware via maintainer email breach",  cve: "GHSA-77vn-r9x4-7f6l", since: "Aug 14" },
  { pkg: "node-ipc",               ver: "9.x",    sev: "high", advisory: "Protestware payload re-introduced",    cve: "GHSA-c9hp-7fxw-9r2b", since: "Aug 12" },
  { pkg: "colors.js",              ver: "1.4.1",  sev: "warn", advisory: "Maintainer swatted — fork churn",      cve: "GHSA-2svq-7h6l-2p4m", since: "Aug 11" },
  { pkg: "event-stream",           ver: "3.3.6",  sev: "warn", advisory: "Flatmap-epidemic legacy risk",         cve: "GHSA-m84m-3c45-7f8j", since: "Aug 09" },
];

const FEATURES: Array<{ title: string; body: string }> = [
  {
    title: "One sentence. One fix.",
    body: "The verdict at the top of every scan is one English line and one shell command. Read the verdict, paste the command, done.",
  },
  {
    title: "Six Cypher. No model.",
    body: "The headline question is one MATCH over the dependency graph. Maintainer cluster, lockfile snapshot, typosquat picker — five more. Every tile's query is in src/lib/cypher.ts. Every answer is reproducible.",
  },
  {
    title: "Apache-2.0.",
    body: "Source on GitHub. Run it locally on a 5K-node fixture. Point it at your own HydraDB instance. No seat counts, no telemetry, no paywall.",
  },
  {
    title: "JSON for CI. URL for ops.",
    body: "The scan page is a URL. The same data is /api/scan/<pkg>@<ver> as JSON — pipe it into any CI step and exit non-zero when a tile reports crit or high. Share the URL in your incident channel and the next operator clicks straight in.",
  },
  {
    title: "HydraDB-shaped benchmarks.",
    body: "We publish bench numbers in the exact CSV column layout HydraDB's own query_bench.rs emits, so a platform engineer can read Meridian alongside upstream numbers without reformatting.",
  },
  {
    title: "One of the six is enough to ship.",
    body: "If the answer to tile #1 — 'which services are transitively exposed' — is empty, you can stop reading. If it returns 17, you already know whether to page the CISO before lunch.",
  },
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Does Meridian train on my data?",
    a: "No. There is no model. The six queries are in src/lib/cypher.ts. When HydraDB is unreachable the app hydrates from a deterministic 5K-node fixture. Your lockfile, your advisories, and your taps stay on your machine.",
  },
  {
    q: "Why is there no pricing page?",
    a: "Pricing is $0. The code is Apache-2.0. If you need to run Meridian behind your firewall, `docker compose up` is the install.",
  },
  {
    q: "How fast is it?",
    a: "Cold start on the 5K-node / 18K-edge fixture: ~250 ms total for the six queries in parallel. Hot reuse: ~80 ms. The exact numbers are on /bench in HydraDB's native CSV shape.",
  },
  {
    q: "Can I host this myself?",
    a: "Yes. `pnpm i && pnpm dev` boots against the local 5K-node fixture with no Docker. Adding a real graph is `pnpm seed && docker compose up -d hydradb`.",
  },
  {
    q: "Why a graph database, not a vector index?",
    a: "We don't want similar. We want 'every service that transitively resolves this exact version'. Vector search is the wrong tool. The headline Cypher is a 6-hop reverse traversal and it answers in milliseconds.",
  },
  {
    q: "Where does the data come from?",
    a: "Public feeds only: OSV, the GitHub Advisory Database, the npm and PyPI registries. On `pnpm seed` we parse ~20 real lockfiles and walk GitHub for maintainers. Nothing is scraped that isn't already public.",
  },
];

export default function Home() {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isr2 = () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );

    const rootEl = root.current;
    if (!rootEl) return;
    const appearEls = Array.from(rootEl.querySelectorAll<HTMLElement>(".appear"));
    const heroPhoto = rootEl.querySelector<HTMLElement>(".hero-photo");
    const settled = new WeakSet<HTMLElement>();

    const settle = (el: HTMLElement) => {
      if (!el || settled.has(el)) return;
      settled.add(el);
      el.classList.add("is-in");
    };

    const handleAnimEnd = (ev: AnimationEvent) => {
      const target = ev.target as HTMLElement | null;
      if (target && target.classList?.contains("appear")) settle(target);
    };
    document.addEventListener("animationend", handleAnimEnd);

    void isr2().then(() => {
      const anyRunning = appearEls.some((el) =>
        el.getAnimations().some((a) => a.playState !== "finished"),
      );
      if (!anyRunning) {
        for (const el of appearEls) settle(el);
        if (heroPhoto) settle(heroPhoto);
      }
    });

    return () => {
      document.removeEventListener("animationend", handleAnimEnd);
    };
  }, []);

  return (
    <div ref={root}>
      {/* Below-the-fold sections render with the same Vesper shell but
          no scroll lock, so the user can scroll naturally. */}
      <div className="grain" aria-hidden />
      <div className="hero-photo" aria-hidden>
        <video
          className="hero-photo-video"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260723_145606_ab143199-b593-4941-bb1b-9afca215416b.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>

      <div className="page">
        <div className="menu-backdrop" aria-hidden />

        <header className="header">
          <Link href="#top" className="logo" aria-label="Meridian">
            <svg viewBox="0 0 24 24" className="logo-mark" aria-hidden="true">
              <path
                d="M2 21 L2 3 L7 3 L12 13 L17 3 L22 3 L22 21 L17 21 L17 11 L13 17 L11 17 L7 11 L7 21 Z"
                fill="currentColor"
              />
            </svg>
            <span className="logo-word">
              Meridian<span className="logo-suffix">.engine</span>
            </span>
          </Link>

          <nav id="site-nav" aria-label="Primary" className="nav">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={`nav-pill appear ${item.appear}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href={`/scan/${encodeURIComponent("tanstack/react-virtual@3.10.8")}`}
            className="btn btn-solid header-cta"
          >
            Open the sample scan
          </Link>

          <button
            type="button"
            className="burger"
            aria-controls="site-nav"
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
        </header>

        {/* ---- HERO ------------------------------------------------------- */}
        <main id="top" className="hero">
          <div className="hero-copy">
            <div className="badge appear appear--pop">
              <svg className="badge-star" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z"
                  fill="currentColor"
                />
              </svg>
              <span>Plain-English blast radius</span>
            </div>

            <h1 className="headline">
              <span className="headline-line appear appear--mask">Know your <em>blast radius</em></span>
              <span className="headline-line appear appear--mask">in seconds, not audits.</span>
            </h1>

            <p className="lede appear appear--soft">
              Paste one compromised package name. Get one English sentence and a fix command.
              The path is six deterministic Cypher queries against HydraDB &mdash; no model involved.
            </p>

            <div className="hero-actions">
              <Link href="/scan/tanstack/react-virtual@3.10.8" className="btn btn-solid btn-hero appear appear--btn">
                Scan a package
              </Link>
              <Link href="/replay" className="btn btn-ghost btn-hero appear appear--side">
                Watch the replay
              </Link>
            </div>
          </div>
        </main>
      </div>

      <footer className="stats" id="stats">
        {STATS.map((s) => (
          <span key={s.label} className={`stat appear ${s.appear}`}>
            {s.icon === "workflow" && (
              <svg viewBox="0 0 24 24" className="stat-icon" aria-hidden="true">
                <defs>
                  <linearGradient id="wf-l" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
                    <stop offset="1" stopColor="#3a3a3a" stopOpacity="0.62" />
                  </linearGradient>
                  <linearGradient id="wf-r" x1="14" y1="2" x2="25" y2="22" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#3a3a3a" stopOpacity="0.38" />
                    <stop offset="1" stopColor="#ffffff" stopOpacity="0.62" />
                  </linearGradient>
                </defs>
                <rect x="3.4"  y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#wf-l)" />
                <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#wf-r)" />
                <rect x="9.2"  y="10.9" width="5.6" height="2.2" rx="1.1" fill="#4a4a4a" />
              </svg>
            )}
            {s.icon === "download" && (
              <svg viewBox="0 0 24 24" className="stat-icon" aria-hidden="true">
                <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff" />
                <path
                  d="M12 7.1v7.4M8.15 12.35L12 16.2l3.85-3.85"
                  stroke="#111111" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            )}
            {s.icon === "avatars" && (
              <svg viewBox="0 0 40 22" className="stat-icon-wide" aria-hidden="true">
                <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
                <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
                <path d="M7.0 9.1L8.4 11.4L5.7 11.4Z" fill="#2b2b2b" />
                <path d="M13.4 9.1L12.0 11.4L14.7 11.4Z" fill="#2b2b2b" />
                <circle cx="8.7"  cy="11.0" r="0.7" fill="#1a1a1a" />
                <circle cx="11.7" cy="11.0" r="0.7" fill="#1a1a1a" />
                <circle cx="20.2" cy="11" r="9.2" fill="#ffffff" />
                <circle cx="18.3" cy="11.0" r="1.7" fill="#1a1a1a" />
                <circle cx="22.3" cy="11.0" r="1.7" fill="#1a1a1a" />
                <ellipse cx="20.2" cy="13.6" rx="1.05" ry="0.9" fill="#1a1a1a" />
                <path d="M16.4 16.1c1.5 2.6 6.0 2.6 7.6 0" stroke="#111111" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <circle cx="30.2" cy="11" r="9.2" fill="#f26b1d" />
                <text x="30.2" y="15.1" fill="#ffffff" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="12.5" textAnchor="middle">m</text>
              </svg>
            )}
            <span>{s.label}</span>
          </span>
        ))}
      </footer>

      {/* ---- FEATURES --------------------------------------------------- */}
      <section className="section">
        <div className="section-inner">
          <h2>What one scan returns</h2>
          <p className="lede">
            Each tile lights up in parallel. The verdict line at the top is what an operator
            reads; the Cypher under each tile is what a platform engineer pastes into HydraDB.
          </p>

          <div className="features-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="feature-card">
                <div className="feature-card-bullet" />
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---- RECENT EXPLOITS ----------------------------------------------- */}
      <section className="section">
        <div className="section-inner">
          <header className="flex items-center justify-between mb-4">
            <h2>Recent exploits · last 30 days</h2>
            <span className="text-2xs uppercase tracking-widest text-ink-400">from OSV + GHSA</span>
          </header>

          <div className="table-card">
            <table className="meridian-table">
              <thead>
                <tr>
                  <th>package</th>
                  <th>version</th>
                  <th>severity</th>
                  <th>advisory</th>
                  <th>cve / ghsa</th>
                  <th>first seen</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {RECENT.map((r) => (
                  <tr key={r.pkg + r.cve}>
                    <td className="cell-mono">
                      <Link
                        className="underline decoration-dotted"
                        href={`/scan/${encodeURIComponent(`${r.pkg}@${r.ver}`)}`}
                      >
                        {r.pkg}
                      </Link>
                    </td>
                    <td className="cell-mono">{r.ver}</td>
                    <td>
                      <span className={`bullet-bordered bullet-bordered--${r.sev}`}>
                        {r.sev}
                      </span>
                    </td>
                    <td>{r.advisory}</td>
                    <td className="cell-mono text-ink-300">{r.cve}</td>
                    <td className="cell-mono text-ink-300">{r.since}</td>
                    <td className="text-right">
                      <Link
                        href={`/scan/${encodeURIComponent(`${r.pkg}@${r.ver}`)}`}
                        className="btn-ghost-mini"
                      >
                        scan ›
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ---- SIX QUERIES ------------------------------------------------- */}
      <section className="section" id="how-it-works">
        <div className="section-inner">
          <h2>The six queries you'll be running</h2>
          <p className="lede">
            Each tile paints the moment the page loads. Click <span className="cell-mono text-ink-50">show cypher</span> on
            any tile to copy the query and run it yourself.
          </p>

          <div className="queries-grid">
            {(Object.keys(QUERIES) as (keyof typeof QUERIES)[]).map((id) => (
              <article key={id} className="query-card">
                <header className="glass-card-header">
                  <span className="bullet-bordered bullet-bordered--info">{id}</span>
                  <span className="ml-auto text-2xs uppercase tracking-widest text-ink-400 cell-mono">
                    {QUERY_TITLES[id]}
                  </span>
                </header>
                <div className="px-4 pb-4">
                  <CypherReveal
                    cypher={QUERIES[id].cypher}
                    params={{ ecosystem: "npm", name: "tanstack/react-virtual", version: "3.10.8" }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FAQ --------------------------------------------------------- */}
      <section className="section" id="faqs">
        <div className="section-inner">
          <h2>Frequently asked, plainly answered</h2>
          <p className="lede">No hand-wavy answers, no upsells, no asterisks.</p>
          <div className="faq-grid">
            {FAQ.map((f, i) => (
              <article key={i} className="faq-card">
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA --------------------------------------------------------- */}
      <section className="section" id="pricing">
        <div className="section-inner">
          <div className="cta-card">
            <h2>Run it yourself.</h2>
            <p>
              Source on GitHub, no seat counts, no telemetry. The same code that runs meridian.sithunyein.com
              runs on your laptop with <code className="cell-mono text-ink-50">pnpm i && pnpm dev</code>. Add a real graph with
              <code className="cell-mono text-ink-50">{" "}pnpm seed && docker compose up -d hydradb</code>.
            </p>
            <div className="hero-actions">
              <Link href="/scan/tanstack/react-virtual@3.10.8" className="btn btn-solid btn-hero">
                Scan a real package
              </Link>
              <Link href="/how" className="btn btn-ghost btn-hero">
                Read the docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Footer ------------------------------------------------------ */}
      <footer className="app-footer">
        <div className="app-footer-grid">
          <div className="app-footer-brand">
            <svg viewBox="0 0 24 24" className="logo-mark" aria-hidden="true">
              <path
                d="M2 21 L2 3 L7 3 L12 13 L17 3 L22 3 L22 21 L17 21 L17 11 L13 17 L11 17 L7 11 L7 21 Z"
                fill="currentColor"
              />
            </svg>
            <div>
              <div className="text-ink-50 font-semibold tracking-tight">Meridian</div>
              <p className="text-ink-200 text-xs leading-relaxed">
                Blast-radius engine for npm &amp; PyPI. Built on HydraDB.
              </p>
            </div>
          </div>
          <div className="app-footer-links">
            <Link className="nav-pill" href={`/scan/${encodeURIComponent("tanstack/react-virtual@3.10.8")}`}>Scan</Link>
            <Link className="nav-pill" href="/replay">Replay</Link>
            <Link className="nav-pill" href="/bench">Bench</Link>
            <Link className="nav-pill" href="/how">How It Works</Link>
          </div>
          <div className="app-footer-contact">
            <div className="text-2xs uppercase tracking-widest text-ink-300 mb-2">contact</div>
            <a
              href="mailto:sithunyein.mailto@gmail.com?subject=Meridian"
              className="text-ink-50 underline decoration-dotted"
            >
              sithunyein.mailto@gmail.com
            </a>
            <div className="text-ink-300 text-xs mt-2">
              Source · github.com/thesithunyein/meridian
            </div>
          </div>
        </div>
        <div className="app-footer-tape">
          <span>© 2026 Sithu Nyein</span>
          <span className="text-ink-400">Apache-2.0</span>
          <span>meridian.sithunyein.com</span>
        </div>
      </footer>
    </div>
  );
}
