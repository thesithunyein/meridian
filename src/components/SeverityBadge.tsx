import { cn } from "@/lib/cn";
import type { Severity } from "@/lib/types";

const STYLES: Record<Severity, string> = {
  crit: "text-crit border-crit",
  high: "text-high border-high",
  warn: "text-warn border-warn",
  ok:   "text-ok border-ok",
  info: "text-info border-info",
};

const LABEL: Record<Severity, string> = {
  crit: "CRI",
  high: "HI ",
  warn: "WRN",
  ok:   "OK ",
  info: "INF",
};

export function SeverityBadge({ s, className }: { s: Severity; className?: string }) {
  return <span className={cn("bullet", STYLES[s], className)}>{LABEL[s]}</span>;
}
