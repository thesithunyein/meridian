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
          <path d="M2 2 L7 2 L7 8 L2 8 Z M12 2 L17 2 L17 8 L12 8 Z M5 5 L14 5 L14 11 L5 11 Z M2 12 L7 12 L7 22 L2 22 Z M12 12 L17 12 L17 22 L12 22 Z M5 16 L14 16 L14 22 L5 22 Z" fill="#FF6B35"/>
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
