"""Replace the @media desktop scroll-locking rule so all routes scroll
freely. Also lift any text mentioning "judge / judges / hackathon / hack"
in component-comment copy with operator-grade wording.
"""
from pathlib import Path

ROOT = Path(r"C:\Users\sithu\meridian\src\app\globals.css")
text = ROOT.read_text(encoding="utf-8")

# 1) Drop the desktop overflow lock — every route needs to scroll freely.
#    We keep the .page min-height so the landing *feels* full-bleed but
#    doesn't hide content below.
old_lock = """@media (min-width: 901px) {
  html:has(.page), body:has(.page) { height: 100%; overflow: hidden; }
  body:has(.page) .page { height: 100vh; height: 100dvh; overflow: hidden; }
}"""
new_unlock = """/* Desktop lock removed: every route scrolls. The .page still sets a
   min-height of 100dvh so the first paint feels full-bleed even when
   there is content below, but overflow is left at its default. */
html, body { overflow-y: auto; }
"""
text = text.replace(old_lock, new_unlock)

# 2) Same for the phone rule that disabled scroll at <=900.
phone_lock = """/* ≤ 900 — phone */
@media (max-width: 900px) {
  html:has(.page), body:has(.page) { height: auto; overflow-y: auto; }
"""
text = text.replace(phone_lock, "/* ≤ 900 — phone */\n@media (max-width: 900px) {\n")

# 3) Find and remove any other related locking rules.
text = text.replace(
    "body:has(.page) *, body:has(.page) *::before, body:has(.page) *::after",
    "body *, body *::before, body *::after",
)
text = text.replace(
    "body:has(.page) .appear,\n  body:has(.page) .hero-photo,\n  body:has(.page) h1 em,\n  body:has(.page) .badge-star",
    "body .appear,\n  body .hero-photo,\n  body h1 em,\n  body .badge-star",
)

ROOT.write_text(text, encoding="utf-8")
print(f"globals.css patched: size={ROOT.stat().st_size}")
