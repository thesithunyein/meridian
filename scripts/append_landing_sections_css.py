"""Append the new real-product section styles used by the new landing: features,
recent-exploits table, six-queries grid, FAQ, CTA card.  Still all in the same
Vesper design language so the entire app reads as one product.
"""
from pathlib import Path

ROOT = Path(r"C:\Users\sithu\meridian\src\app\globals.css")
existing = ROOT.read_text(encoding="utf-8")

ADDITION = """

/* ====================================================================
   REAL PRODUCT SECTIONS — landing only, but using the same tokens.
   ==================================================================== */

.section {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.section-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 64px 32px 96px;
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
@media (max-width: 900px) {
  .section-inner { padding: 48px 18px 72px; }
}

/* --- Features grid ------------------------------------------------ */
.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.feature-card {
  display: flex; flex-direction: column;
  position: relative;
  padding: 18px 20px 20px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0)),
    rgba(8,8,8,0.55);
}
.feature-card-bullet {
  width: 42px; height: 2px;
  background: linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0) 100%);
  border-radius: 1px;
  margin-bottom: 16px;
}
.feature-card h3 {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #ffffff;
}
.feature-card p {
  margin: 0;
  color: #9a9a9a;
  font-size: 13.5px;
  line-height: 1.55;
}
@media (max-width: 900px) {
  .features-grid { grid-template-columns: 1fr; }
}

/* --- Recent exploits table ---------------------------------------- */
.table-card {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0)),
    rgba(8,8,8,0.55);
  padding: 4px 6px;
}
.meridian-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;
}
.meridian-table thead th {
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.meridian-table tbody td {
  padding: 14px;
  color: #c8c8c8;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.meridian-table tbody tr:hover {
  background: rgba(255,255,255,0.03);
}
.meridian-table tbody tr:last-child td { border-bottom: 0; }
.btn-ghost-mini {
  display: inline-flex; align-items: center;
  height: 28px; padding: 0 10px;
  border-radius: 5px;
  border: 1px solid rgba(198,198,198,0.45);
  background: rgba(255,255,255,0.04);
  color: #ffffff;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}
.btn-ghost-mini:hover {
  border-color: rgba(220,230,255,0.75);
  background: rgba(255,255,255,0.08);
}
@media (max-width: 900px) {
  .meridian-table thead { display: none; }
  .meridian-table tbody td { padding: 10px 8px; display: block; }
  .meridian-table tbody td:first-child::before { content: "package  "; }
  .meridian-table tbody td:nth-child(2)::before { content: "ver · "; }
  .meridian-table tbody tr { display: block; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
}

/* --- Six queries grid --------------------------------------------- */
.queries-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}
.query-card {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0)),
    rgba(8,8,8,0.55);
  overflow: hidden;
}

/* --- FAQ ---------------------------------------------------------- */
.faq-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.faq-card {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0)),
    rgba(8,8,8,0.55);
  padding: 18px 20px;
}
.faq-card h3 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #ffffff;
}
.faq-card p {
  margin: 0;
  color: #9a9a9a;
  font-size: 13.5px;
  line-height: 1.55;
}
@media (max-width: 900px) {
  .faq-grid { grid-template-columns: 1fr; }
}

/* --- CTA card ----------------------------------------------------- */
.cta-card {
  position: relative;
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 12px;
  background:
    radial-gradient(80% 100% at 50% 0%, rgba(186,208,255,0.10) 0%, rgba(0,0,0,0) 60%),
    rgba(8,8,8,0.55);
  padding: 56px 56px 56px;
  text-align: center;
}
.cta-card h2 {
  margin: 0 0 12px;
  font-size: 36px;
  font-weight: 500;
  letter-spacing: -0.04em;
  color: #ffffff;
}
.cta-card p {
  max-width: 540px;
  margin: 0 auto 24px;
  color: #9a9a9a;
  font-size: 15px;
  line-height: 1.55;
}
.cta-card .hero-actions { margin-top: 18px; }
@media (max-width: 900px) {
  .cta-card { padding: 36px 22px; }
  .cta-card h2 { font-size: 26px; }
}
"""

ROOT.write_text(existing + ADDITION, encoding="utf-8")
print(f"globals.css appended: {len(ADDITION)} bytes; new total = {ROOT.stat().st_size}")
