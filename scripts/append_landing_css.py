"""Append the Meridian landing-page (Vesper design-system) CSS to globals.css.

This script is run after install so the new globals.css contains both the
legacy terminal styles (scan / replay / bench / how) and the new single-viewport
landing styles.  The new section is appended verbatim so users can review the
diff in two pieces.
"""
from pathlib import Path

ROOT = Path(r"C:\Users\sithu\meridian\src\app\globals.css")
existing = ROOT.read_text(encoding="utf-8")

ADDITION = """

/* ====================================================================
   MERIDIAN LANDING (Vesper design system) — single-viewport hero.
   Loaded on / only. The terminal UI for /scan /replay /bench /how keeps
   its own styles above.
   ==================================================================== */

@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: local("Inter"), local("InterVariable");
}
@font-face {
  font-family: "Instrument Serif";
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: local("Instrument Serif Italic"), local("InstrumentSerif-Italic");
}

/* Force-black-first emergency rules */
html, body { background: #000000 !important; color: #ffffff; }
html, body { background: #000000; background: var(--bg, #000000);
             color: #ffffff; color: var(--text, #ffffff); }

/* Landing-only base. Scoped to body:has(.page) so other routes are untouched. */
.landing, body:has(.page) {
  --bg: #000000;
  --text: #ffffff;
  --muted: #9a9a9a;
  --stat: #d8d8d8;
  --border: rgba(255, 255, 255, 0.16);
  --border-soft: rgba(255, 255, 255, 0.12);
  --logo: 15.5px;
  --logo-mark: 22px;
  --nav: 14px;
  --nav-h: 40px;
  --btn: 13.5px;
  --btn-h: 40px;
  --hero-btn-h: 42px;
  --h1: 48px;
  --lede: 15.5px;
  --badge: 12.5px;
  --stat-size: 13.5px;
  --header-y: 22px;
  --header-x: 40px;
  --stats-x: 72px;
  --stats-y: 36px;
  --hero-gap: 85px;
  --copy-max: 860px;
  --lede-max: 470px;
  background: #000000;
  color: #ffffff;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: var(--lede);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
  position: relative;
}
html:has(.page) body { background: #000000 !important; color: #ffffff !important; }

/* --- Layer stack ------------------------------------------------------- */
.grain {
  position: fixed; inset: 0; z-index: 100; pointer-events: none;
  background-image:
    radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 3px 3px, 7px 7px;
  background-position: 0 0, 1px 1px;
  mix-blend-mode: screen;
  opacity: 0.55;
}
.hero-photo {
  position: fixed; inset: 0; z-index: 0; background: #000000;
  pointer-events: none; isolation: isolate;
}
.hero-photo::after {
  content: ""; position: absolute; inset: 0; z-index: 1;
  background:
    radial-gradient(120% 80% at 50% 110%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 60%),
    linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.85) 70%);
}
.hero-photo-inner {
  position: absolute; inset: 0;
  background:
    radial-gradient(60% 60% at 50% 60%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 60%),
    radial-gradient(28% 28% at 50% 38%, rgba(186,208,255,0.07) 0%, rgba(0,0,0,0) 65%);
  filter: blur(12px);
  animation: ambient 24s ease-in-out infinite alternate;
}
@keyframes ambient {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  100% { transform: translate3d(-2%, -1%, 0) scale(1.04); }
}

/* --- Page shell -------------------------------------------------------- */
.page {
  position: relative; z-index: 1;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh; min-height: 100dvh;
}

/* --- Header ------------------------------------------------------------ */
.header {
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  padding: var(--header-y) var(--header-x) 10px;
  z-index: 50; position: relative;
}
.logo {
  display: inline-flex; align-items: center; gap: 9px;
  justify-self: start;
  font-size: var(--logo); font-weight: 600; letter-spacing: -0.03em;
  color: #ffffff; text-decoration: none;
}
.logo-mark { width: var(--logo-mark); height: var(--logo-mark); flex: 0 0 var(--logo-mark); }
.logo-word { font-feature-settings: "ss01"; }
.logo-suffix { font-weight: 400; color: var(--muted); }
.nav { display: flex; align-items: center; gap: 8px; justify-self: center; }
.nav-pill, .menu-link {
  height: var(--nav-h); padding: 0 18px;
  border: 1px solid rgba(198,198,198,0.55);
  border-radius: 7px;
  background: linear-gradient(105deg, #050505 0%, #2a2a2a 48%, #4a4a4a 100%);
  color: #f3f3f3;
  font-size: var(--nav); font-weight: 400; letter-spacing: -0.01em;
  white-space: nowrap; overflow: hidden; position: relative;
  display: inline-flex; align-items: center;
  text-decoration: none;
  transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
}
.nav-pill::before, .menu-link::before {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.16) 50%, transparent 70%);
  transform: translateX(-120%); transition: transform 0.6s ease;
  pointer-events: none;
}
.nav-pill:hover, .menu-link:hover {
  border-color: rgba(235,235,235,0.9);
  background: linear-gradient(105deg, #111111 0%, #3a3a3a 45%, #6a6a6a 100%);
  box-shadow: 0 0 18px rgba(200,210,230,0.18);
}
.nav-pill:hover::before, .menu-link:hover::before { transform: translateX(120%); }

/* --- Header buttons ---------------------------------------------------- */
.btn {
  position: relative; isolation: isolate;
  display: inline-flex; align-items: center; justify-content: center;
  height: var(--btn-h); padding: 0 16px;
  border-radius: 6px;
  font-size: var(--btn); font-weight: 500; letter-spacing: -0.02em;
  line-height: 1; white-space: nowrap; cursor: pointer;
  font-family: inherit; color: inherit; text-decoration: none;
  border: 1px solid transparent;
  transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, color 0.35s ease, filter 0.35s ease;
}
.btn::after {
  content: ""; position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.45) 48%, transparent 76%);
  transform: translateX(-130%);
  transition: transform 0.65s ease;
  pointer-events: none;
}
.btn:hover::after { transform: translateX(130%); }
.btn-solid {
  background: linear-gradient(180deg, #ffffff 0%, #e7e7e7 48%, #cfcfcf 100%);
  color: #111111; border: 1px solid #ffffff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.95);
}
.btn-solid:hover {
  background: linear-gradient(180deg, #ffffff 0%, #f3f6ff 42%, #d5def2 100%);
  border-color: #f2f6ff;
  box-shadow:
    inset 0 1px 0 #ffffff,
    0 0 22px rgba(186,208,255,0.35),
    0 8px 18px rgba(255,255,255,0.12);
}
.btn-hero { height: var(--hero-btn-h); padding: 0 18px; }
.btn-hero.btn-solid:hover {
  box-shadow:
    inset 0 1px 0 #ffffff,
    0 0 26px rgba(186,208,255,0.4),
    0 8px 18px rgba(255,255,255,0.14);
}
.btn-ghost {
  background: linear-gradient(135deg, rgba(255,255,255,0.10), rgba(0,0,0,0.45) 50%, rgba(160,175,200,0.08));
  color: #ffffff; border: 1px solid rgba(198,198,198,0.45);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
}
.btn-ghost:hover {
  background: linear-gradient(135deg, rgba(210,225,255,0.18), rgba(0,0,0,0.35) 48%, rgba(180,195,220,0.16));
  border-color: rgba(220,230,255,0.75);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    0 0 20px rgba(170,200,255,0.22);
}
.btn-hero.btn-ghost {
  background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(0,0,0,0.5) 46%, rgba(150,170,200,0.10));
  border: 1px solid rgba(198,198,198,0.55);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
}
.btn-hero.btn-ghost:hover {
  border-color: rgba(220,230,255,0.80);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    0 0 24px rgba(170,200,255,0.28);
}
.header-cta { justify-self: end; }

/* --- Burger (≤ 900) --------------------------------------------------- */
.burger {
  display: none;
  width: 42px; height: 42px;
  border: 1px solid var(--border); border-radius: 6px;
  background: rgba(8,8,8,0.55); z-index: 60;
  align-items: center; justify-content: center;
  flex-direction: column; gap: 5px;
  cursor: pointer;
  transition: border-color 0.25s ease, background 0.25s ease;
}
.burger:hover { border-color: rgba(255,255,255,0.32); background: rgba(255,255,255,0.05); }
.burger > span {
  width: 16px; height: 1.5px; background: #ffffff; border-radius: 1px;
  transform-origin: center;
  transition: transform 0.25s ease, opacity 0.20s ease;
}
body.menu-open .burger > span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
body.menu-open .burger > span:nth-child(2) { opacity: 0; }
body.menu-open .burger > span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

/* --- Menu backdrop ----------------------------------------------------- */
.menu-backdrop {
  display: block; position: fixed; inset: 0;
  z-index: 40;
  background: rgba(8,8,8,0.42);
  opacity: 0; visibility: hidden;
  transition: opacity 0.28s ease, backdrop-filter 0.28s ease, -webkit-backdrop-filter 0.28s ease, visibility 0s 0.28s;
}
body.menu-open .menu-backdrop {
  opacity: 1; visibility: visible;
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  transition: opacity 0.28s ease, backdrop-filter 0.28s ease, visibility 0s;
}
body.menu-open { overflow: hidden; }

/* --- Hero -------------------------------------------------------------- */
.hero {
  display: flex; align-items: flex-end; justify-content: center;
  padding: 8px 24px var(--hero-gap);
  min-height: 0;
}
.hero-copy {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  width: 100%; max-width: var(--copy-max);
}
.badge {
  display: inline-flex; gap: 8px; align-items: center;
  margin-bottom: 22px;
  padding: 9px 15px; border: 0; border-radius: 5px;
  background: linear-gradient(90deg, #7d7d7d 0%, #2a2a2a 52%, #0a0a0a 100%);
  color: #f2f2f2;
  font-size: var(--badge); font-weight: 400; letter-spacing: -0.01em;
  font-family: inherit;
}
.badge-star {
  width: 18px; height: 20px; color: #ffffff;
  filter: drop-shadow(0 0 3px rgba(255,255,255,0.45));
  animation: in-star 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.28s both;
  transform-origin: center;
}

.headline {
  font-size: var(--h1); font-weight: 500; letter-spacing: -0.045em;
  line-height: 1.12; color: #ffffff;
  margin: 0;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.headline-line { display: block; overflow: hidden; padding: 0.06em 0.15em 0.14em; }
.headline em {
  font-family: "Instrument Serif", "Times New Roman", Times, serif;
  font-style: italic; font-weight: 400;
  font-size: 1.08em; letter-spacing: -0.03em;
  color: #9a9a9a;
  margin: 0 0.04em;
  animation: in-em 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.72s both;
  display: inline-block;
}

.lede {
  max-width: var(--lede-max);
  margin-top: 18px; margin-bottom: 0;
  color: #9a9a9a;
  font-size: var(--lede); font-weight: 400;
  line-height: 1.55; letter-spacing: -0.015em;
  animation-duration: 1.25s;
}
.hero-actions {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;
  margin-top: 26px;
}

/* --- Stats ------------------------------------------------------------- */
.stats {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 0 var(--stats-x) var(--stats-y);
  padding-bottom: max(var(--stats-y), env(safe-area-inset-bottom));
  color: var(--stat);
}
.stat {
  display: inline-flex; align-items: center; gap: 14px;
  font-size: var(--stat-size); letter-spacing: -0.015em;
  white-space: nowrap; color: var(--stat);
}
.stat-icon { width: 20px; height: 20px; flex: 0 0 20px; color: #e8e8e8; }
.stat-icon-wide { width: 38px; height: 21px; flex: 0 0 38px; }

/* --- Entrance motion --------------------------------------------------- */
.appear {
  opacity: 1;
  animation-duration: 1.05s;
  animation-fill-mode: both;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-delay: var(--d, 0.08s);
}
.is-in { animation: none !important; opacity: 1 !important; transform: none !important; clip-path: none !important; filter: none !important; }
.hero-photo.is-in { animation: none; }

.hero-photo { animation: photoIn 1.2s ease-out 0s both; }
@keyframes photoIn { 0% { opacity: 0; } 100% { opacity: 1; } }

.appear--scale { animation-name: in-scale; }
.appear--soft  { animation-name: in-soft; }
.appear--mask  { animation-name: in-mask; }
.appear--pop   { animation-name: in-pop; }
.appear--btn   { animation-name: in-btn; }
.appear--side  { animation-name: in-side; }
.appear--stat  { animation-name: in-stat; }

@keyframes in-scale { 0% { opacity: 0; transform: scale(0.84); } 100% { opacity: 1; transform: scale(1); } }
@keyframes in-soft  { 0% { opacity: 0; transform: translateY(14px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes in-mask  { 0% { opacity: 0; transform: translateY(40%); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes in-pop {
  0%   { opacity: 0; transform: scale(0.9); }
  70%  { transform: scale(1.03); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes in-btn  { 0% { opacity: 0; transform: translateY(18px) scale(0.94); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes in-side { 0% { opacity: 0; transform: translateX(22px); } 100% { opacity: 1; transform: translateX(0); } }
@keyframes in-stat { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }

@keyframes in-star {
  0%   { opacity: 0; transform: scale(0.2) rotate(-50deg); }
  65%  { opacity: 1; transform: scale(1.2) rotate(8deg); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
}
@keyframes in-em {
  0%   { opacity: 0.35; filter: blur(4px); }
  100% { opacity: 1;    filter: blur(0); }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  body:has(.page) *, body:has(.page) *::before, body:has(.page) *::after {
    transition: none !important; animation: none !important;
  }
  body:has(.page) .appear,
  body:has(.page) .hero-photo,
  body:has(.page) h1 em,
  body:has(.page) .badge-star {
    opacity: 1; transform: none; clip-path: none; filter: none;
  }
}

/* --- Responsive -------------------------------------------------------- */
@media (min-width: 1600px) {
  body:has(.page) {
    --logo: 17px; --logo-mark: 24px; --nav: 15px; --nav-h: 44px;
    --btn: 15px; --btn-h: 44px; --hero-btn-h: 48px;
    --h1: 64px; --lede: 18px; --badge: 13.5px; --stat-size: 15px;
    --header-y: 28px; --header-x: 64px; --stats-x: 96px; --stats-y: 44px;
    --copy-max: 980px; --lede-max: 540px;
  }
  .nav-pill, .menu-link { padding: 0 20px; }
  .badge { margin-bottom: 26px; }
  .lede { margin-top: 22px; }
  .hero-actions { gap: 12px; margin-top: 30px; }
  .stat-icon { width: 22px; height: 22px; flex-basis: 22px; }
  .stat-icon-wide { width: 45px; height: 24px; flex-basis: 45px; }
}
@media (min-width: 1920px) {
  body:has(.page) {
    --logo: 18px; --logo-mark: 26px; --nav: 16px; --nav-h: 48px;
    --btn: 16px; --btn-h: 48px; --hero-btn-h: 52px;
    --h1: 76px; --lede: 20px; --badge: 14.5px; --stat-size: 16px;
    --header-y: 32px; --header-x: 80px; --stats-x: 120px; --stats-y: 52px;
    --copy-max: 1120px; --lede-max: 620px;
  }
  .nav { gap: 10px; }
  .nav-pill, .menu-link { padding: 0 22px; }
  .btn { padding: 0 22px; }
  .badge { padding: 10px 15px; }
  .stat-icon-wide { width: 48px; height: 26px; flex-basis: 48px; }
}
@media (min-width: 2560px) {
  body:has(.page) {
    --h1: 88px; --lede: 22px;
    --header-x: 120px; --stats-x: 160px;
    --copy-max: 1280px; --lede-max: 680px;
  }
}
@media (max-width: 1599px) and (min-width: 1280px) {
  body:has(.page) { --h1: 54px; --lede: 16px; --header-x: 48px; --stats-x: 80px; --copy-max: 900px; }
}
@media (max-width: 1279px) and (min-width: 901px) {
  body:has(.page) {
    --logo: 15px; --nav: 13px; --nav-h: 36px;
    --btn: 13px; --btn-h: 38px; --hero-btn-h: 40px;
    --h1: 42px; --lede: 15px; --badge: 12px; --stat-size: 12.5px;
    --header-y: 16px; --header-x: 28px; --stats-x: 36px; --stats-y: 28px;
    --hero-gap: 64px; --copy-max: 760px; --lede-max: 440px;
  }
  .nav-pill, .menu-link { padding: 0 14px; }
  .badge { margin-bottom: 16px; }
  .lede { margin-top: 14px; }
  .hero-actions { margin-top: 20px; }
}
@media (min-width: 901px) and (max-height: 850px) {
  body:has(.page) {
    --header-y: 14px; --stats-y: 24px; --hero-gap: 48px; --h1: 40px;
  }
  .badge { margin-bottom: 12px; }
  .lede { margin-top: 12px; }
  .hero-actions { margin-top: 16px; }
}
@media (min-width: 901px) and (max-height: 720px) {
  body:has(.page) {
    --h1: 34px; --lede: 14px; --hero-gap: 32px; --stats-y: 18px;
    --nav-h: 30px; --btn-h: 34px; --hero-btn-h: 36px;
  }
  .badge { margin-bottom: 8px; }
}
@media (min-width: 901px) {
  html:has(.page), body:has(.page) { height: 100%; overflow: hidden; }
  body:has(.page) .page { height: 100vh; height: 100dvh; overflow: hidden; }
}

/* ≤ 900 — phone */
@media (max-width: 900px) {
  html:has(.page), body:has(.page) { height: auto; overflow-y: auto; }
  body:has(.page) {
    --logo: 16px; --btn: 15px; --btn-h: 46px; --hero-btn-h: 48px;
    --h1: 36px; --lede: 16.5px; --badge: 13.5px; --stat-size: 15px;
    --header-y: 16px; --header-x: 18px; --stats-x: 20px; --stats-y: 28px;
    --hero-gap: 36px;
  }
  .header {
    grid-template-columns: 1fr auto auto;
    gap: 8px;
    padding-top: max(var(--header-y), env(safe-area-inset-top));
  }
  .logo, .header-cta, .burger { z-index: 80; }
  .header-cta { display: none; }
  .nav { display: none; }
  .burger { display: flex; }
  body.menu-open .nav {
    display: flex; position: fixed; inset: 0;
    z-index: 45; background: transparent; backdrop-filter: none;
    flex-direction: column; align-items: stretch; justify-content: center;
    gap: 12px;
    padding:
      max(96px, calc(env(safe-area-inset-top) + 88px))
      22px 32px;
  }
  body.menu-open .nav-pill, body.menu-open .menu-link {
    width: 100%; height: 56px; font-size: 19px; border-radius: 10px;
    justify-content: center;
  }
  .hero { padding: 20px 20px 64px; }
  .hero-copy { max-width: 100%; }
  .lede { max-width: 100%; }
  .stats {
    flex-direction: column; align-items: center; gap: 16px;
    padding: 0 var(--stats-x) var(--stats-y);
    text-align: center;
  }
  .stat { white-space: normal; }
}
@media (max-width: 560px) {
  body:has(.page) { --h1: 34px; --lede: 16px; --header-x: 16px; }
  .hero-actions { flex-direction: column; align-items: stretch; }
  .hero-actions .btn { width: 100%; }
}
"""

ROOT.write_text(existing + ADDITION, encoding="utf-8")
print(f"globals.css updated: {len(ADDITION)} bytes appended; total = {(ROOT.stat().st_size)}")
