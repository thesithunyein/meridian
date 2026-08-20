import Link from "next/link";

/**
 * AppFooter — used on /scan /replay /bench /how.
 */
export function Footer({ id }: { id?: string }) {
  return (
    <footer className="app-footer" id={id}>
      <div className="app-footer-powered">
        <span className="text-2xs uppercase tracking-widest text-ink-400">Powered by</span>
        <svg viewBox="0 0 24 24" className="hackhydra-logo" aria-label="HackHydra">
          <path d="M2 2 L7 2 L7 9 L2 9 Z M7 5 L15 5 L15 9 L7 9 Z M7 5 L7 12 L2 12 L2 9 L7 9 Z M2 12 L7 12 L7 15 L2 15 Z M9 12 L15 12 L15 15 L9 12 Z M9 12 L9 19 L2 19 L2 15 L9 15 Z M9 15 L15 15 L15 22 L9 22 Z M15 15 L22 15 L22 22 L15 22 Z" fill="#FF6B35"/>
        </svg>
        <span className="text-ink-200 text-sm font-semibold">HackHydra</span>
      </div>
      <div className="app-footer-tape">
        <span>© 2026 Sithu Nyein</span>
        <span className="text-ink-400">Apache-2.0</span>
        <span>meridian.sithunyein.com</span>
      </div>
    </footer>
  );
}
