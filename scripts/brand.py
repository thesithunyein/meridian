"""Generate Meridian brand kit assets from the source logo PNG.

Outputs into C:/Users/sithu/meridian/public/:
  glyph-light-256.png, glyph-light-512.png, glyph-light-1024.png
  glyph-dark-256.png,  glyph-dark-512.png,  glyph-dark-1024.png
  favicon-16.png, favicon-32.png, favicon-64.png, apple-touch.png
  og-banner.png (1200x630, the social card)
  glyph.svg (vector wrapper embedding the 1024 PNG for sharp scaling)
  scanline-bg.png (subtle horizontal scanline texture, 1600x160)
"""
import os, base64, math
from PIL import Image, ImageDraw, ImageFont

ROOT = r"C:\Users\sithu\meridian"
SRC  = os.path.join(ROOT, "source-logo.png")
OUT  = os.path.join(ROOT, "public")
os.makedirs(OUT, exist_ok=True)

src = Image.open(SRC).convert("RGBA")
W, H = src.size  # 1168 x 784

def crop_to_glyph(im, pad_ratio=0.04):
    """Find the white-glyph bbox and crop with a small pad, preserving aspect."""
    px = im.load()
    sx, sy = im.size
    left, right, top, bottom = sx, 0, sy, 0
    for y in range(0, sy, 2):
        for x in range(0, sx, 2):
            r, g, b, a = px[x, y]
            if r > 220 and g > 220 and b > 220:
                if x < left: left = x
                if x > right: right = x
                if y < top: top = y
                if y > bottom: bottom = y
    pad_x = int((right - left) * pad_ratio)
    pad_y = int((bottom - top) * pad_ratio)
    left = max(0, left - pad_x); right = min(sx, right + pad_x)
    top = max(0, top - pad_y); bottom = min(sy, bottom + pad_y)
    return im.crop((left, top, right, bottom))

glyph = crop_to_glyph(src, 0.06)
gw, gh = glyph.size  # roughly square (the M is wider than tall)
print("glyph cropped:", gw, gh)

def square_canvas(im, size, fg=(255,255,255,255)):
    """Center the glyph on a transparent square of `size`×`size`."""
    canvas = Image.new("RGBA", (size, size), (0,0,0,0))
    sw, sh = im.size
    s = min(size, size) * 0.86  # 86% fill
    scale = s / max(sw, sh)
    new = im.resize((max(1, int(sw*scale)), max(1, int(sh*scale))), Image.LANCZOS)
    nw, nh = new.size
    canvas.paste(new, ((size-nw)//2, (size-nh)//2), new)
    return canvas

def make_light(im, size):
    """White-on-transparent (for dark backgrounds)."""
    rgba = im.convert("RGBA")
    px = rgba.load()
    sw, sh = rgba.size
    out = Image.new("RGBA", (sw, sh), (0,0,0,0))
    op = out.load()
    for y in range(sh):
        for x in range(sw):
            r, g, b, a = px[x, y]
            if r > 220 and g > 220 and b > 220:
                op[x, y] = (255, 255, 255, 255)
    return square_canvas(out, size)

def make_dark(im, size):
    """Black-on-transparent (for light backgrounds)."""
    rgba = im.convert("RGBA")
    px = rgba.load()
    sw, sh = rgba.size
    out = Image.new("RGBA", (sw, sh), (0,0,0,0))
    op = out.load()
    for y in range(sh):
        for x in range(sw):
            r, g, b, a = px[x, y]
            if r > 220 and g > 220 and b > 220:
                op[x, y] = (0, 0, 0, 255)
    return square_canvas(out, size)

# Glyph PNGs (square canvases, transparent)
for size in (256, 512, 1024):
    make_light(glyph, size).save(os.path.join(OUT, f"glyph-light-{size}.png"), optimize=True)
    make_dark(glyph, size).save(os.path.join(OUT, f"glyph-dark-{size}.png"), optimize=True)

# Fractions for navbar / favicon
for size in (16, 32, 64, 180):
    name = "apple-touch" if size == 180 else f"favicon-{size}"
    make_light(glyph, size).save(os.path.join(OUT, f"{name}.png"), optimize=True)

# OG banner 1200x630 (social card)
def og_banner():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), (5, 5, 5))  # near-black
    d = ImageDraw.Draw(img)
    g = square_canvas(make_light(glyph, 1024), 320)
    img.paste(g, (90, 90), g)  # glyph top-left
    # tagline - use whatever default font; size chosen for terminal feel
    try:
        fnt_lg = ImageFont.truetype("consola.ttf", 56)
        fnt_md = ImageFont.truetype("consola.ttf", 30)
        fnt_sm = ImageFont.truetype("consola.ttf", 22)
    except Exception:
        fnt_lg = ImageFont.load_default()
        fnt_md = ImageFont.load_default()
        fnt_sm = ImageFont.load_default()
    d.text((90, 430), "MERIDIAN", fill=(255,255,255), font=fnt_lg)
    d.text((90, 502), "blast-radius engine for npm + pypi", fill=(180, 180, 180), font=fnt_md)
    d.text((90, 553), "17 services exposed.   fix: pnpm update evil-pkg@^1.2.4   >", fill=(140, 140, 140), font=fnt_sm)
    # right-side rule: a faint vertical column of monospace ticks
    for i in range(0, H, 22):
        d.line((1100, i, 1100, i+11), fill=(40, 40, 40))
    d.line((1100, 0, 1100, H), fill=(40, 40, 40))
    return img

og_banner().save(os.path.join(OUT, "og-banner.png"), optimize=True)

# Subtle scanline bg used behind hero text
def scanline_bg():
    W, H = 1600, 160
    img = Image.new("RGBA", (W, H), (10, 10, 10, 255))
    px = img.load()
    for y in range(H):
        if y % 4 == 0:
            for x in range(W):
                px[x, y] = (20, 20, 20, 255)
        elif y % 8 == 0:
            for x in range(W):
                px[x, y] = (15, 15, 15, 255)
    return img

scanline_bg().save(os.path.join(OUT, "scanline-bg.png"), optimize=True)

# SVG that embeds the 1024 PNG as base64 (for sharp scaling everywhere)
big = Image.open(os.path.join(OUT, "glyph-light-1024.png")).convert("RGBA")
with open(os.path.join(OUT, "glyph-light-1024.png"), "rb") as f:
    b64 = base64.b64encode(f.read()).decode("ascii")
svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" role="img" aria-label="Meridian">
  <title>Meridian</title>
  <image href="data:image/png;base64,{b64}" x="0" y="0" width="1024" height="1024"/>
</svg>
"""
with open(os.path.join(OUT, "glyph.svg"), "w", encoding="utf-8") as f:
    f.write(svg)

# A monospaced CSS-only "M" badge variant that uses just CSS (no image) for places
# we want a tiny inkchip
css_chip = """
/* on dark backgrounds */
.meridian-mark {
  display: inline-block;
  font: 700 1em/1 ui-monospace, "Cascadia Code", "JetBrains Mono", Consolas, monospace;
  color: #fff;
  background: transparent;
  letter-spacing: 0;
}
"""
with open(os.path.join(ROOT, "scripts", "meridian-mark.css"), "w") as f:
    f.write(css_chip)

print("brand kit done.  outputs:")
for f in sorted(os.listdir(OUT)):
    p = os.path.join(OUT, f)
    print(f"  {f}  {os.path.getsize(p):>9} bytes")
