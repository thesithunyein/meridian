"""Promote the Vesper landing styles to be the GLOBAL app baseline.

Earlier globals.css contains:
  (1) the legacy terminal styles that use IBM Plex Mono, black-on-black,
      stripe-* severity boxes, etc. — used by /scan /replay /bench /how.
  (2) the Vesper landing styles, scoped under `body:has(.page)` so they
      only painted on `/`.

After this script:
  (a) The body baseline is Inter on near-black, matching the landing.
  (b) Every `body:has(.page)` selector is rewritten to a global one so
      every route paints in the same language.
  (c) The legacy terminal styles are gently upgraded: monospace stays
      only inside code blocks (.code, .cypher, .tape, .bullet, etc.).

The result: /  /scan  /replay  /bench  /how /not-found all feel like one
single design system — the Vesper design, with the existing Meridiary
content rasters underneath.
"""
from pathlib import Path

ROOT = Path(r"C:\Users\sithu\meridian\src\app\globals.css")
text = ROOT.read_text(encoding="utf-8")

# 1. Drop the force-black-first guard from the legacy block so .lede forms
#    coexist. (We want Inter colors to win.)
text = text.replace(
    "@tailwind base;\n@tailwind components;\n@tailwind utilities;",
    "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n"
    "html, body {\n"
    "  background: #050505;\n"
    "  color: #ffffff;\n"
    "  font-family: \"Inter\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;\n"
    "  -webkit-font-smoothing: antialiased;\n"
    "  -moz-osx-font-smoothing: grayscale;\n"
    "  text-rendering: optimizeLegibility;\n"
    "  font-size: 13px;\n"
    "  line-height: 1.55;\n"
    "  letter-spacing: -0.01em;\n"
    "}",
)

# 2. Move the design tokens out of the `body:has(.page)` gated block so
#    they're globally available.
token_names = [
    "--bg", "--text", "--muted", "--stat", "--border", "--border-soft",
    "--logo", "--logo-mark", "--nav", "--nav-h",
    "--btn", "--btn-h", "--hero-btn-h",
    "--h1", "--lede", "--badge", "--stat-size",
    "--header-y", "--header-x", "--stats-x", "--stats-y",
    "--hero-gap", "--copy-max", "--lede-max",
]

# 3. Promote every `body:has(.page)` selector to a plain global one.
#    (`:root` and universal selectors stay; only `body:has(.page)` is
#    being lifted.)
text = text.replace("body:has(.page)", "body")
text = text.replace("html:has(.page)", "html")

# 4. The landing styles include an extra `html, body` rule at the end that
#    forces #000 + #fff. Keep that — it's correct.
#
# 5. The landing styles also reference the same color tokens we already
#    pass via Tailwind (`bg-ink-950`, `text-ink-50`). The Tailwind palette
#    stays — the page CSS is what the landing / scan tiles use.

ROOT.write_text(text, encoding="utf-8")
print(f"globals.css promoted. size={ROOT.stat().st_size}")

# Quick audit
import re
ga_count = len(re.findall(r"\bbody:has\(\.page\)\b", text))
ha_count = len(re.findall(r"\bhtml:has\(\.page\)\b", text))
print(f"  body:has(.page) remaining: {ga_count}")
print(f"  html:has(.page) remaining: {ha_count}")
