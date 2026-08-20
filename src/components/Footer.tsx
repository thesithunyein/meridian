import Link from "next/link";

/**
 * AppFooter — used on /scan /replay /bench /how.
 */
export function Footer({ id }: { id?: string }) {
  return (
    <footer className="app-footer" id={id}>
      <div className="app-footer-powered">
        <span className="text-2xs uppercase tracking-widest text-ink-400">Powered by</span>
        <img src="/hackhydra-logo.png" alt="HackHydra" className="hackhydra-logo" width={36} height={36} />
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
