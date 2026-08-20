import Link from "next/link";

const SCAN = `/scan/${encodeURIComponent("tanstack/react-virtual@3.10.8")}`;

/**
 * AppFooter — used on /scan /replay /bench /how. Clean tape-style footer.
 */
export function Footer({ id }: { id?: string }) {
  return (
    <footer className="app-footer" id={id}>
      <div className="app-footer-tape">
        <span>© 2026 Sithu Nyein</span>
        <span className="text-ink-400">Apache-2.0</span>
        <span>meridian.sithunyein.com</span>
      </div>
    </footer>
  );
}
