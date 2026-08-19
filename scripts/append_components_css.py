"""Append Vesper-styled component classes used across /scan /replay /bench
/how. Glass cards, severity stripes, buttons, table rows, the brand mark,
the consistency with the landing page's design language.
"""
from pathlib import Path

ROOT = Path(r"C:\Users\sithu\meridian\src\app\globals.css")
existing = ROOT.read_text(encoding="utf-8")

ADDITION = """

/* ====================================================================
   VESPER COMPONENT CLASSES — shared across /scan, /replay, /bench, /how.
   ==================================================================== */

/* Page-level layout under <main> in non-landing routes.  Lifted as a
   sibling of the landing .page so the .header lives at the top. */
main, .app-main {
  display: block;
  position: relative;
  z-index: 1;
  padding: 28px 0 96px;
}

/* Section block used by every long-form route. */
.section {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(255,255,255,0.10);
}
.section-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 64px 40px;
}
.section-inner h2 {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.04em;
  color: #ffffff;
  margin: 0 0 8px;
}
.section-inner p.lede {
  max-width: 620px;
  color: #9a9a9a;
  font-size: 15px;
  line-height: 1.55;
  margin-bottom: 32px;
}

/* Page header (above .section). */
.app-header-bar {
  position: relative;
  z-index: 1;
  padding: 56px 40px 8px;
  max-width: 1180px;
  margin: 0 auto;
}
.app-header-bar .crumbs {
  font-size: 11px;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
}
.app-header-bar .crumbs a {
  color: rgba(255,255,255,0.55);
  text-decoration: none;
  border-bottom: 1px dotted rgba(255,255,255,0.25);
  padding-bottom: 1px;
}
.app-header-bar .crumbs a:hover { color: #ffffff; }
.app-header-bar h1 {
  margin: 12px 0 0;
  font-size: 44px;
  font-weight: 500;
  letter-spacing: -0.04em;
  color: #ffffff;
  line-height: 1.06;
}
.app-header-bar h1 em {
  font-family: "Instrument Serif", "Times New Roman", Times, serif;
  font-style: italic; font-weight: 400;
  font-size: 1.06em; letter-spacing: -0.03em;
  color: #9a9a9a;
  margin: 0 0.04em;
}
.app-header-bar .subtitle {
  margin: 12px 0 0;
  color: #9a9a9a;
  font-size: 15px;
  line-height: 1.55;
  max-width: 720px;
}
@media (max-width: 900px) {
  .app-header-bar { padding: 24px 18px 0; }
  .app-header-bar h1 { font-size: 32px; }
}

/* --- Glass card  ----------------------------------------------------
   The shared card surface used by verdictcard, tile, etc.  Each card has
   a hairline border, a slight inner glow, and an optional stripe-bar
   pinned to the left edge to indicate severity. */
.glass-card {
  position: relative;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0)),
    rgba(8,8,8,0.55);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 8px;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.04),
    0 24px 60px rgba(0,0,0,0.30);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.glass-card--inset {
  background: rgba(8,8,8,0.40);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 6px;
}
.glass-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.glass-card-subtitle {
  margin: 0;
  padding: 14px 18px;
  font-size: 12.5px;
  color: #9a9a9a;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  line-height: 1.55;
  letter-spacing: -0.01em;
}
.glass-card-table {
  padding: 14px 18px;
  max-height: 360px;
  overflow: auto;
}
.glass-card-body {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  padding: 22px 18px 26px;
}
.glass-card-body .verdict-side {
  display: flex; flex-direction: column; gap: 12px;
}
.glass-card-body .glass-card-inner { padding: 12px 14px; }
.glass-card-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 18px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.verdict-text {
  margin: 0;
  color: #ffffff;
  font-family: ui-monospace, "JetBrains Mono", Consolas, monospace;
  font-size: 13px;
  line-height: 1.55;
  letter-spacing: -0.005em;
}

@media (max-width: 900px) {
  .glass-card-body { grid-template-columns: 1fr; }
}

/* --- Severity stripe variants --------------------------------------- */
.severity-bar { padding-left: 6px; }
.severity-bar--crit { box-shadow: inset 3px 0 0 0 #ff3b30; }
.severity-bar--high { box-shadow: inset 3px 0 0 0 #ff8a00; }
.severity-bar--warn { box-shadow: inset 3px 0 0 0 #ffd60a; }
.severity-bar--ok   { box-shadow: inset 3px 0 0 0 #00e676; }

.stripe-border-strip { padding-left: 4px; }
.stripe-border-strip--crit { box-shadow: inset 2px 0 0 0 #ff3b30, 0 0 0 1px rgba(255,59,48,0.18); }
.stripe-border-strip--high { box-shadow: inset 2px 0 0 0 #ff8a00, 0 0 0 1px rgba(255,138,0,0.15); }
.stripe-border-strip--warn { box-shadow: inset 2px 0 0 0 #ffd60a, 0 0 0 1px rgba(255,214,10,0.14); }
.stripe-border-strip--ok { box-shadow: inset 2px 0 0 0 #00e676, 0 0 0 1px rgba(0,230,118,0.18); }
.stripe-border-strip--info { box-shadow: inset 2px 0 0 0 #5ac8fa, 0 0 0 1px rgba(90,200,250,0.16); }

/* Bullet short tag for severity inside glass cards. */
.bullet-bordered {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 10.5px;
  letter-spacing: 0.06em;
  border: 1px solid rgba(255,255,255,0.20);
  color: #c8c8c8;
  font-family: inherit;
}
.bullet-bordered--crit { color: #ff3b30; border-color: rgba(255,59,48,0.55); background: rgba(255,59,48,0.05); }
.bullet-bordered--high { color: #ff8a00; border-color: rgba(255,138,0,0.55); background: rgba(255,138,0,0.05); }
.bullet-bordered--warn { color: #ffd60a; border-color: rgba(255,214,10,0.55); background: rgba(255,214,10,0.05); }
.bullet-bordered--ok { color: #00e676; border-color: rgba(0,230,118,0.55); background: rgba(0,230,118,0.05); }
.bullet-bordered--info { color: #5ac8fa; border-color: rgba(90,200,250,0.55); background: rgba(90,200,250,0.05); }

/* --- Buttons (mirror of .btn) --------------------------------------- */
.btn.btn-ghost--mini {
  height: 30px;
  padding: 0 12px;
  font-size: 11px;
  border-radius: 5px;
  letter-spacing: 0.06em;
  border: 1px solid rgba(198,198,198,0.45);
  background: rgba(255,255,255,0.04);
  color: #ffffff;
  display: inline-flex; align-items: center;
  text-transform: uppercase;
  cursor: pointer;
}
.btn.btn-ghost--mini:hover {
  border-color: rgba(220,230,255,0.75);
  background: rgba(255,255,255,0.08);
}

/* --- Table row separator (used by tile + bench) --------------------- */
.table-row-line { border-top: 1px solid rgba(255,255,255,0.05); }

/* --- Cell-mono: monospaced tabular numerals ------------------------- */
.cell-mono {
  font-family: ui-monospace, "JetBrains Mono", Consolas, monospace;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* --- Verdict headlining --------------------------------------------- */
.text-accent { color: var(--accent, #a3ff3a); }

/* --- Stats footer --------------------------------------------------- */
.app-footer {
  position: relative;
  z-index: 1;
  background: rgba(0,0,0,0.40);
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 64px 40px 24px;
  margin-top: 64px;
}
.app-footer .logo-mark { width: 22px; height: 22px; color: #ffffff; flex: 0 0 22px; }
.app-footer-grid {
  display: grid;
  grid-template-columns: 1.6fr 2fr 1.4fr;
  gap: 28px;
  max-width: 1180px;
  margin: 0 auto;
  align-items: start;
}
.app-footer-brand {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.app-footer-brand > div {
  font-family: "Inter", sans-serif;
}
.app-footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
}
.app-footer-contact { font-family: inherit; }
.app-footer-tape {
  border-top: 1px solid rgba(255,255,255,0.05);
  margin-top: 36px;
  padding-top: 18px;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
}
@media (max-width: 900px) {
  .app-footer { padding: 32px 18px 96px; }
  .app-footer-grid { grid-template-columns: 1fr; }
  .app-footer-links { justify-content: flex-start; }
  .app-footer-tape { flex-direction: column; gap: 6px; }
}

/* --- WormTrace timeline (mirrors landing stats card style) ---------- */
.wt-track {
  position: relative;
  padding: 10px 0 4px;
}
.wt-event {
  position: relative;
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 16px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.wt-event:last-child { border-bottom: none; }
.wt-event::before {
  content: "";
  position: absolute;
  left: 22px; top: 0; bottom: 0;
  width: 1px;
  background: rgba(255,255,255,0.06);
}
.wt-event-dot {
  position: relative;
  z-index: 1;
  width: 10px; height: 10px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.30);
  margin: 14px 0 0 6px;
  border-radius: 50%;
}
.wt-event-dot--guard   { background: #00e676; border-color: #00e676; }
.wt-event-dot--alert   { background: #ff3b30; border-color: #ff3b30; }
.wt-event-dot--publish { background: #ff8a00; border-color: #ff8a00; }
.wt-event-dot--install,
.wt-event-dot--lockfile{ background: #5ac8fa; border-color: #5ac8fa; }
.wt-event-dot--yank    { background: #ffd60a; border-color: #ffd60a; }
.wt-event-time {
  font-family: ui-monospace, "JetBrains Mono", monospace;
  font-size: 11px;
  color: rgba(255,255,255,0.50);
}
.wt-event-head {
  display: flex; gap: 10px; align-items: center;
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  color: #c8c8c8;
  margin-bottom: 4px;
}
.wt-event-label { color: #ffffff; font-size: 13px; line-height: 1.5; }

/* --- Bench table layout (alt-rows, no terminal-stripe) ------------- */
.metrics-table {
  width: 100%;
  border-collapse: collapse;
  font-family: ui-monospace, "JetBrains Mono", monospace;
  font-size: 12px;
}
.metrics-table th, .metrics-table td {
  padding: 12px 16px;
  text-align: left;
}
.metrics-table th {
  font-size: 10.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.50);
  font-weight: 500;
  border-bottom: 1px solid rgba(255,255,255,0.10);
}
.metrics-table tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.metrics-table tbody tr:hover {
  background: rgba(255,255,255,0.03);
}

/* --- How page sections --------------------------------------------- */
.how-step {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 8px;
  padding: 20px 24px;
  background: rgba(8,8,8,0.40);
}
.how-step h3 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.02em;
}
.how-step p {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #9a9a9a;
}

/* --- Replay tile variant ------------------------------------------- */
.replay-side {
  display: flex; flex-direction: column; gap: 12px;
}
.replay-side .glass-card--inset { padding: 14px 16px; }

/* --- Ensure ScrollLock works on touch ------------------------------ */
@media (max-width: 900px) {
  html, body { overflow-y: auto !important; }
}
"""

ROOT.write_text(existing + ADDITION, encoding="utf-8")
print(f"globals.css appended: {len(ADDITION)} bytes added; new total = {ROOT.stat().st_size}")
