"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

type Item = { label: string; href: string; external?: boolean };

const ITEMS: Item[] = [
  { label: "How it works", href: "/how" },
  { label: "Bench",       href: "/bench" },
  { label: "GitHub",      href: "https://github.com/thesithunyein/meridian", external: true },
];

/**
 * Nav — clean shell reused across all inner routes.
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
                d="M2 2 L8 2 L8 16 L14 10 L14 2 L20 2 L20 22 L14 22 L14 14 L8 20 L8 22 L2 22 Z"
                fill="currentColor"
              />
            </svg>
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
                  {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {it.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/"
            className="btn btn-solid header-cta"
            id="start"
          >
            Scan a package
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
