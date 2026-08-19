import Link from "next/link";

/**
 * AppFooter — Vesper-style minimal footer reused across /scan /replay
 * /bench /how. Mirrors the landing page's tape language: brand on the
 * left, three product link-pills in the middle, contact on the right.
 */
export function Footer({ id }: { id?: string }) {
  return (
    <footer className="app-footer" id={id}>
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
              Plain-English blast-radius engine for npm &amp; PyPI.
              Built on HydraDB. Apache-2.0.
            </p>
          </div>
        </div>

        <div className="app-footer-links">
          <Link className="nav-pill" href="/scan/tanstack/react-virtual@3.10.8">
            Benefits
          </Link>
          <Link className="nav-pill" href="/how">
            How It Works
          </Link>
          <Link className="nav-pill" href="/bench">
            Bench
          </Link>
          <Link className="nav-pill" href="/replay">
            Replay
          </Link>
          <Link className="nav-pill" href="/how#faqs">
            FAQs
          </Link>
        </div>

        <div className="app-footer-contact">
          <div className="text-2xs uppercase tracking-widest text-ink-300 mb-2">contact</div>
          <a
            href="mailto:sithunyein.mailto@gmail.com?subject=Meridian"
            className="text-ink-50 underline decoration-dotted"
          >
            sithunyein.mailto@gmail.com
          </a>
          <div className="text-ink-300 text-xs mt-2">GitHub · thesithunyein/meridian</div>
          <div className="text-ink-300 text-xs">Discord · meridian-dev</div>
        </div>
      </div>

      <div className="app-footer-tape">
        <span>© 2026 Sithu Nyein</span>
        <span className="text-ink-400">Apache-2.0</span>
        <span>
          <span className="bullet ok mr-2">OK</span> live · meridian.sithunyein.com
        </span>
      </div>
    </footer>
  );
}
