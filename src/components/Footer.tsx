import Link from "next/link";

const SCAN = `/scan/${encodeURIComponent("tanstack/react-virtual@3.10.8")}`;

/**
 * AppFooter — used on /scan /replay /bench /how. Same shape as the
 * landing's footer: brand + nav pills + contact + a one-line tape.
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
              Blast-radius engine for npm &amp; PyPI. Built on HydraDB.
            </p>
          </div>
        </div>

        <div className="app-footer-links">
          <Link className="nav-pill" href={SCAN}>
            Scan
          </Link>
          <Link className="nav-pill" href="/how">
            How it works
          </Link>
          <Link className="nav-pill" href="/bench">
            Bench
          </Link>
          <Link className="nav-pill" href="/replay">
            Replay
          </Link>
          <Link className="nav-pill" href="/#faqs">
            FAQ
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
  );
}
