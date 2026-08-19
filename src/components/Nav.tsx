"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

type Item = { label: string; href: string };

const SCAN = `/scan/${encodeURIComponent("tanstack/react-virtual@3.10.8")}`;

const ITEMS: Item[] = [
  { label: "Scan",         href: SCAN },
  { label: "How It Works", href: "/how" },
  { label: "Replay",       href: "/replay" },
  { label: "Bench",        href: "/bench" },
  { label: "FAQ",          href: "/#faqs" },
];

/**
 * AppHeader — Vesper-style nav reused across all routes.
 *
 * Wraps every page in the same shell:
 *   .grain
 *   .hero-photo (with .hero-photo-inner ambient atmosphere)
 *   .page
 *     .menu-backdrop
 *     .header
 *     children   ← route content (e.g. <main>, <Footer />)
 * </Nav>
 */
export function Nav({ active, children }: { active?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      if (window.matchMedia("(min-width: 901px)").matches) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
  }, [open]);

  return (
    <>
      <div className="grain" aria-hidden />
      <div className="hero-photo" aria-hidden>
        <div className="hero-photo-inner" />
      </div>

      <div className="page">
        <div className="menu-backdrop" aria-hidden />

        <header className="header">
          <Link href="/" className="logo" aria-label="Meridian">
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
            {ITEMS.map((it) => {
              const isActive = active === it.href;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={isActive ? "page" : undefined}
                  className="nav-pill"
                >
                  {it.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href={`/scan/${encodeURIComponent("tanstack/react-virtual@3.10.8")}`}
            className="btn btn-solid header-cta"
            id="start"
          >
            Open the sample scan
          </Link>

          <button
            type="button"
            className="burger"
            aria-controls="site-nav"
            aria-expanded={open ? "true" : "false"}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </header>

        {children}
      </div>
    </>
  );
}
