"use client";

import Link from "next/link";
import { BrandGlyph } from "@/components/BrandGlyph";
import { cn } from "@/lib/cn";

type Item = { label: string; href: string };

const ITEMS: Item[] = [
  { label: "Scan", href: "/scan/sample/evil-pkg@1.0.0" },
  { label: "Replay", href: "/replay" },
  { label: "Bench", href: "/bench" },
  { label: "How", href: "/how" },
];

export function Nav({ active }: { active?: string }) {
  return (
    <header className="border-b border-ink-600">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3 group">
          <BrandGlyph size={28} className="shrink-0" />
          <span className="text-md font-semibold tracking-tight text-ink-50">MERIDIAN</span>
          <span className="hidden md:inline text-xs text-ink-300">blast-radius.engine</span>
          <span className="md:hidden text-xs text-ink-300">v0.1</span>
        </Link>
        <nav className="flex items-center gap-1">
          {ITEMS.map((it) => {
            const isActive = active === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "tile-button",
                  isActive && "text-ink-50 border-ink-300",
                )}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="tape mx-auto max-w-[1400px]">
        <div className="flex items-center gap-3">
          <span className="bullet ok">OK</span>
          <span>node: hydra-db.local:17687</span>
          <span className="text-ink-500">·</span>
          <span>bolt + https</span>
          <span className="text-ink-500">·</span>
          <span>cypher: openCypher 9</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-ink-300">window</span>
          <span className="cell">Aug 12 — Aug 20, 23:59 PT</span>
          <span className="bullet crit lg:inline">2D 4H</span>
        </div>
      </div>
    </header>
  );
}
