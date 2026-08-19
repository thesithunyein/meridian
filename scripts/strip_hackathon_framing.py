"""Strip every 'submission / hackathon / Hack Hydra / Track 02A / judges'
reference from the codebase and replace with product-grade language.
"""
from pathlib import Path

ROOT = Path(r"C:\Users\sithu\meridian")

# (from, to) replacements applied across all relevant text files.
REPLACEMENTS: list[tuple[str, str]] = [
    # README.md
    (
        "Meridian is a HydraDB-powered submit-to-the-hackathon project. The web app at\n[meridian.sithunyein.com](https://meridian.sithunyein.com) answers the six\nquestions a founder, a CISO, an engineering manager, or an auditor must answer\nin the **first six minutes** of a supply-chain attack — without reading a graph.",
        "Meridian is the plain-English blast-radius engine for npm and PyPI. The web app at\n[meridian.sithunyein.com](https://meridian.sithunyein.com) answers the six\nquestions a founder, a CISO, an engineering manager, or an auditor must answer\nin the **first six minutes** of a supply-chain attack — without reading a graph.",
    ),
    (
        "Built for Hack Hydra · Track 02A — Supply-chain blast radius.",
        "Made for supply-chain blast-radius work. Apache-2.0.",
    ),
    (
        "## What judges should look at first",
        "## Where to look first",
    ),
    (
        "traceable. The judge can hit `?` *Show Cypher* and copy the exact query that\nproduced their answer.",
        "traceable. You can hit *Show Cypher* on any tile and copy the exact query that\nproduced your answer.",
    ),
    # DEPLOY.md
    (
        "Best for showing the judges a working site right now.",
        "Best for a working demo URL with no DNS work.",
    ),
    (
        "## What the judges see",
        "## What you'll see",
    ),
    # /how/page.tsx
    (
        "<h3>Caveats judges should know</h3>",
        "<h3>Caveats and known limits</h3>",
    ),
    # /components/CypherReveal.tsx
    (
        "* the \"show me the proof\" feeling judges want to see.",
        "* the \"show me the proof\" feeling that operators get to see.",
    ),
    # scripts/bench.py and corpus/seed.py
    (
        "column for the row — judges read it first.",
        "column for the row — operators read it first.",
    ),
    (
        "Hard cap so the seed finishes inside the demo window.  Judges can blow\nthese up; the bench row counts scale linearly with these.",
        "Hard cap so the seed finishes inside a normal laptop window.  You can blow\nthese up; the bench row counts scale linearly with these.",
    ),
    # src/app/api/bench/route.ts
    (
        "// We expose the same columns so a judge can compare\n  // Meridian numbers against the upstream HydraDB numbers, byte-for-byte.",
        "// We expose the same columns so operators can compare\n  // Meridian numbers against the upstream HydraDB numbers, byte-for-byte.",
    ),
    # src/lib/types.ts
    (
        "shape: string;          // shape annotation for the judge",
        "shape: string;          // shape annotation for the planner",
    ),
]

# Files we'll touch — keep the regex small to avoid breaking code.
TEXT_FILES = [
    ROOT / "README.md",
    ROOT / "DEPLOY.md",
    ROOT / "src/app/how/page.tsx",
    ROOT / "src/components/CypherReveal.tsx",
    ROOT / "scripts/bench.py",
    ROOT / "corpus/seed.py",
    ROOT / "src/app/api/bench/route.ts",
    ROOT / "src/lib/types.ts",
]

touched = 0
for f in TEXT_FILES:
    if not f.exists():
        print(f"  skip {f}")
        continue
    txt = f.read_text(encoding="utf-8")
    changes_here = 0
    for old, new in REPLACEMENTS:
        if old in txt:
            txt = txt.replace(old, new)
            changes_here += 1
    if changes_here:
        f.write_text(txt, encoding="utf-8")
        touched += 1
        print(f"  patched {f}  ({changes_here} replacements)")

print(f"done. {touched} files updated.")


# Second pass: nuke every remaining mention of "Hack Hydra", "Track 02A",
# "judges", "judge", "submission", "prize", "deadline" from user-facing
# copy.  We keep 'window' because it's used in Cypher as a graph field name
# (compromised_window) and in legitimate code.
defensive = [
    ("Hack Hydra",  "HydraDB"),
    ("Track 02A",   "supply-chain blast radius"),
    ("judges",      "operators"),
    ("judge ",      "operator "),
    ("submission",  "share"),
    ("Hackathon",   "open source"),
    ("prize",       "build"),
    ("Grant Prize", "Open Source Build"),
]

touched = 0
for f in [
    ROOT / "README.md",
    ROOT / "DEPLOY.md",
    ROOT / "src/app/how/page.tsx",
    ROOT / "src/components/CypherReveal.tsx",
]:
    if not f.exists(): continue
    txt = f.read_text(encoding="utf-8")
    here = 0
    for old, new in defensive:
        if old in txt:
            txt = txt.replace(old, new)
            here += 1
    if here:
        f.write_text(txt, encoding="utf-8")
        touched += 1
        print(f"  defensive pass: {f}  ({here} replacements)")

print(f"defensive pass done. {touched} files.")
