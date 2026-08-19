/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

// The Meridian homepage is a single-viewport landing built to the spec from
// the Vesper.ai rebuild brief — same design tokens, same entrance motion
// timeline, same three-stats footer. The copy + glyph are swapped so it
// carries Meridian's brand.
//
// Navigation routes aim at the real product surface:
//   #start       → /scan/[pkg]     (the six Cypher tiles)
//   #benefits    → /bench          (the canonical HydraDB-shaped CSV)
//   #how-it-works → /how           (methodology + schema + six queries)
//   #demo        → /replay         (Live WormTrace)
//   #pricing     → /how            (free, Apache-2.0)
//   #faqs        → /how            (same methodology page)

// Each link is a real route — even though the spec anchors them in-page, our
// landing is single-viewport and the underlying product lives elsewhere.
const NAV: Array<{ label: string; href: string; appear: string; delay: string }> = [
  { label: "Benefits",        href: "/scan/tanstack/react-virtual@3.10.8", appear: "appear--scale", delay: "0.16s" },
  { label: "How It Works",    href: "/how",         appear: "appear--soft",  delay: "0.28s" },
  { label: "FAQs",            href: "/how#faqs",    appear: "appear--scale", delay: "0.40s" },
  { label: "Pricing",         href: "/bench",       appear: "appear--soft",  delay: "0.52s" },
];

const STATS: Array<{
  label: string;
  appear: string;
  delay: string;
  icon: "workflow" | "download" | "avatars";
}> = [
  { label: "5,124 nodes · 18,772 edges indexed",     appear: "appear--stat", delay: "1.12s", icon: "workflow" },
  { label: "<350 ms p95 across full hexa-traversal", appear: "appear--stat", delay: "1.28s", icon: "download" },
  { label: "Apache-2.0 · free for hackers",          appear: "appear--stat", delay: "1.44s", icon: "avatars"  },
];

export default function Home() {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isr2 = () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );

    // 1) Per-element animationend → add .is-in.
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

    // 2) Two rAFs later: if animations didn't run, force .is-in everywhere.
    void isr2().then(() => {
      const anyRunning = appearEls.some((el) =>
        el.getAnimations().some((a) => a.playState !== "finished"),
      );
      if (!anyRunning) {
        for (const el of appearEls) settle(el);
        if (heroPhoto) settle(heroPhoto);
      }
    });

    // 3) Burger menu toggle.
    const body = document.body;
    const burger = rootEl.querySelector<HTMLButtonElement>("[data-burger]");
    const menuLinks = rootEl.querySelectorAll<HTMLAnchorElement>(".menu-link");
    const onBurger = () => {
      const open = body.classList.toggle("menu-open");
      if (burger) {
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      }
    };
    const onLinkClick = () => {
      if (body.classList.contains("menu-open")) onBurger();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && body.classList.contains("menu-open")) onBurger();
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 901px)").matches && body.classList.contains("menu-open")) {
        onBurger();
      }
    };
    burger?.addEventListener("click", onBurger);
    menuLinks.forEach((a) => a.addEventListener("click", onLinkClick));
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("animationend", handleAnimEnd);
      burger?.removeEventListener("click", onBurger);
      menuLinks.forEach((a) => a.removeEventListener("click", onLinkClick));
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Set CSS vars for per-element delay so the layer + entrance motion is exact.
  const setVar = (el: React.CSSProperties | undefined, delay: string) =>
    ({ ...(el ?? {}), ["--d" as string]: delay, animationDelay: delay } as React.CSSProperties);

  return (
    <div ref={root}>
      {/* grain layer (top) */}
      <div className="grain" aria-hidden />

      {/* hero photo substitute — pure-CSS atmosphere so we don't ship the
          CloudFront video. Animated faint vertical column so the eye reads
          "something happening" without flashing white. */}
      <div className="hero-photo" aria-hidden>
        <div className="hero-photo-inner" />
      </div>

      <div className="page">
        <div className="menu-backdrop" aria-hidden />

        <header className="header">
          <Link href="#top" className="logo appear appear--scale" aria-label="Meridian">
            <svg viewBox="0 0 24 24" className="logo-mark" aria-hidden="true">
              {/* Angular M with rounded feet — Meridian's mark */}
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
              <Link
                key={item.href}
                href={item.href}
                className={`nav-pill appear ${item.appear}`}
                style={setVar(undefined, item.delay)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/scan/sample/evil-pkg@1.0.0"
            className="btn btn-solid header-cta appear appear--scale"
            style={setVar(undefined, "0.34s")}
            id="start"
          >
            Start for Free
          </Link>

          <button
            type="button"
            className="burger appear appear--scale"
            style={setVar(undefined, "0.34s")}
            aria-controls="site-nav"
            aria-expanded="false"
            aria-label="Open menu"
            data-burger
          >
            <span /><span /><span />
          </button>
        </header>

        <main id="top" className="hero">
          <div className="hero-copy">
            <div
              className="badge appear appear--pop"
              style={setVar(undefined, "0.22s")}
            >
              <svg className="badge-star" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z"
                  fill="currentColor"
                />
              </svg>
              <span>Supply-chain blast radius</span>
            </div>

            <h1 className="headline">
              <span className="headline-line appear appear--mask" style={setVar(undefined, "0.42s")}>
                Know your <em>blast radius</em>
              </span>
              <span className="headline-line appear appear--mask" style={setVar(undefined, "0.62s")}>
                in seconds, not audits.
              </span>
            </h1>

            <p
              className="lede appear appear--soft"
              style={setVar({ animationDuration: "1.25s" }, "0.82s")}
            >
              Meridian runs six deterministic Cypher queries against HydraDB the moment a
              CVE drops. Paste one compromised package name, get one English sentence and a
              fix command — no model involved.
            </p>

            <div className="hero-actions">
              <Link
                href="/scan/tanstack/react-virtual@3.10.8"
                className="btn btn-solid btn-hero appear appear--btn"
                style={setVar(undefined, "0.96s")}
              >
                Start for Free
              </Link>
              <Link
                href="/replay"
                className="btn btn-ghost btn-hero appear appear--side"
                style={setVar(undefined, "1.10s")}
              >
                See it in action
              </Link>
            </div>
          </div>
        </main>

        <footer className="stats" id="pricing">
          {STATS.map((s, i) => (
            <span
              key={s.label}
              className={`stat appear ${s.appear}`}
              style={setVar(undefined, s.delay)}
            >
              {s.icon === "workflow" && (
                <svg viewBox="0 0 24 24" className="stat-icon" aria-hidden="true">
                  <defs>
                    <linearGradient id={`wf-l-${i}`} x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
                      <stop offset="1" stopColor="#3a3a3a" stopOpacity="0.62" />
                    </linearGradient>
                    <linearGradient id={`wf-r-${i}`} x1="14" y1="2" x2="25" y2="22" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#3a3a3a" stopOpacity="0.38" />
                      <stop offset="1" stopColor="#ffffff" stopOpacity="0.62" />
                    </linearGradient>
                  </defs>
                  <rect x="3.4"  y="2.6" width="7.2" height="18.8" rx="3.6" fill={`url(#wf-l-${i})`} />
                  <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill={`url(#wf-r-${i})`} />
                  <rect x="9.2"  y="10.9" width="5.6" height="2.2" rx="1.1" fill="#4a4a4a" />
                </svg>
              )}
              {s.icon === "download" && (
                <svg viewBox="0 0 24 24" className="stat-icon" aria-hidden="true">
                  <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff" />
                  <path
                    d="M12 7.1v7.4M8.15 12.35L12 16.2l3.85-3.85"
                    stroke="#111111"
                    strokeWidth="1.85"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              )}
              {s.icon === "avatars" && (
                <svg viewBox="0 0 40 22" className="stat-icon-wide" aria-hidden="true">
                  {/* dark-head: tan disk + pale face + ear triangles + dot eyes */}
                  <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" />
                  <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4" />
                  <path d="M7.0 9.1L8.4 11.4L5.7 11.4Z" fill="#2b2b2b" />
                  <path d="M13.4 9.1L12.0 11.4L14.7 11.4Z" fill="#2b2b2b" />
                  <circle cx="8.7"  cy="11.0" r="0.7" fill="#1a1a1a" />
                  <circle cx="11.7" cy="11.0" r="0.7" fill="#1a1a1a" />
                  {/* white-head: ring + eyes + nose + smile */}
                  <circle cx="20.2" cy="11" r="9.2" fill="#ffffff" />
                  <circle cx="18.3" cy="11.0" r="1.7" fill="#1a1a1a" />
                  <circle cx="22.3" cy="11.0" r="1.7" fill="#1a1a1a" />
                  <ellipse cx="20.2" cy="13.6" rx="1.05" ry="0.9" fill="#1a1a1a" />
                  <path
                    d="M16.4 16.1c1.5 2.6 6.0 2.6 7.6 0"
                    stroke="#111111"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* orange-head: "e" centered in orange disk */}
                  <circle cx="30.2" cy="11" r="9.2" fill="#f26b1d" />
                  <text
                    x="30.2"
                    y="15.1"
                    fill="#ffffff"
                    fontFamily="Inter, system-ui, sans-serif"
                    fontWeight="700"
                    fontSize="12.5"
                    textAnchor="middle"
                  >
                    m
                  </text>
                </svg>
              )}
              <span className="stat-label">{s.label}</span>
            </span>
          ))}
        </footer>
      </div>

      {/* Hidden bottom rails — the rest of the app lives at /scan, /replay,
          /bench, /how. They retain the legacy terminal UI because that
          surface has a different visual contract. */}
    </div>
  );
}
