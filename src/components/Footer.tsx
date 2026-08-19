import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink-600 mt-20">
      <div className="mx-auto max-w-[1400px] px-6 py-10 grid gap-6 md:grid-cols-3 text-xs text-ink-300">
        <div>
          <div className="text-ink-50 font-semibold mb-1">MERIDIAN</div>
          <p className="text-ink-300 leading-relaxed">
            Deterministic blast-radius software for npm + PyPI.
            Built on the <Link href="https://hydradb.com" className="underline decoration-dotted">HydraDB</Link> graph database.
            Zero AI in the answer path. Every number traces back to one Cypher query.
          </p>
        </div>
        <div>
          <div className="text-ink-50 font-semibold mb-1">QUICK START</div>
          <ul className="space-y-1">
            <li className="cell">pnpm i next react</li>
            <li className="cell">pnpm dev</li>
            <li className="cell">pnpm bench</li>
            <li className="cell">pnpm seed</li>
          </ul>
        </div>
        <div>
          <div className="text-ink-50 font-semibold mb-1">CONTACT</div>
          <ul className="space-y-1">
            <li>github · sis/meridian</li>
            <li>discord · meridian-dev</li>
            <li>license · Apache-2.0</li>
            <li>
              <span className="bullet ok mr-2">OK</span>
              live · meridian.sithunyein.com
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-600">
        <div className="mx-auto max-w-[1400px] px-6 py-3 flex items-center justify-between text-2xs uppercase tracking-widest text-ink-400">
          <span>© 2026 sithu · meridian</span>
          <span>built for hack hydra · track 02a</span>
        </div>
      </div>
    </footer>
  );
}
