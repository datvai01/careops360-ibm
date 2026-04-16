import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle, WidthType,
  ShadingType, TableLayoutType, Header, Footer, PageNumber,
  convertInchesToTwip, PageBreak, ColumnBreak
} from "docx";
import { writeFileSync } from "fs";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const C = {
  blue:    "0F62FE", navy:   "001141", navy2: "001D6C",
  teal:    "009D9A", green:  "198038", amber: "F1C21B",
  g10:     "F4F4F4", g20:    "E0E0E0", g50:   "8D8D8D",
  g70:     "525252", g100:   "161616",
  white:   "FFFFFF", lBlue:  "D0E2FF", lGreen:"DEFBE6",
  barRest: "DFE3E6",
};
const FONT = "Calibri";

// ── Unit helpers ──────────────────────────────────────────────────────────────
const hp   = (pt) => Math.round(pt * 2);      // points → half-points (font size)
const sp   = (pt) => Math.round(pt * 20);      // points → twips (spacing/margins)
const inch = (i)  => convertInchesToTwip(i);
const W    = 9360; // usable content width in DXA (6.5 in)

// ── Core text run ─────────────────────────────────────────────────────────────
const R = (text, {
  size = 10.5, bold = false, italics = false,
  color = C.g100, allCaps = false, underline = false
} = {}) =>
  new TextRun({
    text, font: FONT, size: hp(size), bold, italics, color, allCaps,
    underline: underline ? { type: "single" } : undefined,
  });

// ── Paragraph builders ────────────────────────────────────────────────────────
const para = (children, { before = 0, after = 2, left = 0, right = 0, align, keepNext } = {}) =>
  new Paragraph({
    children: Array.isArray(children) ? children : [children],
    spacing: { before: sp(before), after: sp(after) },
    indent:  (left || right) ? { left: sp(left), right: sp(right) } : undefined,
    alignment: align,
    keepNext,
  });

const body = (text, opts = {}) =>
  para([R(text, { size: 10.5 })], { after: 3, ...opts });

const bull = (text, { size = 10.5, color = C.g100, before = 0, after = 1 } = {}) =>
  new Paragraph({
    children: [R(text, { size, color })],
    bullet: { level: 0 },
    spacing: { before: sp(before), after: sp(after) },
  });

const spacer = (pt = 4) =>
  new Paragraph({ children: [R("")], spacing: { before: 0, after: sp(pt) } });

// Section heading with blue top rule
const sHead = (num, title, sub = "") => [
  new Paragraph({
    children: [],
    border: { top: { style: BorderStyle.SINGLE, size: 16, color: C.blue, space: 6 } },
    spacing: { before: sp(12), after: 0 },
  }),
  new Paragraph({
    children: [
      R(num + "  ", { size: 8, bold: true, color: C.blue }),
      R(title.toUpperCase(), { size: 13.5, bold: true, color: C.navy }),
      ...(sub ? [R("   " + sub, { size: 10, italics: true, color: C.g50 })] : []),
    ],
    spacing: { before: sp(2), after: sp(sub ? 1 : 4) },
  }),
];

const subHead = (text, { before = 6, after = 2, color = C.blue, size = 10.5 } = {}) =>
  para([R(text, { size, bold: true, color })], { before, after });

// Executive punch line box (full-width shaded callout)
const punchLine = (quote, attr = "") => [
  new Paragraph({
    children: [],
    border: { left: { style: BorderStyle.SINGLE, size: 20, color: C.blue, space: 8 } },
    shading: { type: ShadingType.SOLID, fill: "EBF2FF" },
    spacing: { before: sp(6), after: 0 },
    indent: { left: sp(12), right: sp(8) },
  }),
  new Paragraph({
    children: [R("\u201C" + quote + "\u201D", { size: 11, italics: true, color: C.navy2 })],
    shading: { type: ShadingType.SOLID, fill: "EBF2FF" },
    spacing: { before: sp(3), after: 0 },
    indent: { left: sp(12), right: sp(8) },
    border: { left: { style: BorderStyle.SINGLE, size: 20, color: C.blue, space: 8 } },
  }),
  ...(attr ? [new Paragraph({
    children: [R("\u2014 " + attr, { size: 9, bold: true, color: C.blue })],
    shading: { type: ShadingType.SOLID, fill: "EBF2FF" },
    alignment: AlignmentType.RIGHT,
    spacing: { before: sp(2), after: sp(6) },
    indent: { left: sp(12), right: sp(8) },
    border: { left: { style: BorderStyle.SINGLE, size: 20, color: C.blue, space: 8 } },
  })] : [new Paragraph({
    children: [R("")],
    shading: { type: ShadingType.SOLID, fill: "EBF2FF" },
    spacing: { before: sp(3), after: sp(6) },
    border: { left: { style: BorderStyle.SINGLE, size: 20, color: C.blue, space: 8 } },
  })]),
];

// Callout box — dark navy
const callout = (label, value, desc = "") =>
  new TableCell({
    children: [
      new Paragraph({
        children: [R(value, { size: 22, bold: true, color: C.blue })],
        alignment: AlignmentType.CENTER,
        spacing: { before: sp(6), after: sp(1) },
      }),
      new Paragraph({
        children: [R(label, { size: 8.5, bold: true, color: C.navy })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: sp(desc ? 1 : 6) },
      }),
      ...(desc ? [new Paragraph({
        children: [R(desc, { size: 7.5, italics: true, color: C.g70 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: sp(6) },
      })] : []),
    ],
    shading: { type: ShadingType.SOLID, fill: C.lBlue },
    margins: { top: sp(4), bottom: sp(4), left: sp(6), right: sp(6) },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 10, color: C.blue },
      bottom: { style: BorderStyle.NONE },
      left:   { style: BorderStyle.SINGLE, size: 2, color: C.g20 },
      right:  { style: BorderStyle.SINGLE, size: 2, color: C.g20 },
    },
  });

// ── Table primitives ──────────────────────────────────────────────────────────
const nb = { style: BorderStyle.NONE }; // no-border shorthand
const noBorders = { top: nb, bottom: nb, left: nb, right: nb, insideH: nb, insideV: nb };
const thinBord  = (col = C.g20) => ({ style: BorderStyle.SINGLE, size: 2, color: col });

const hc = (text, w, { color = C.white, bg = C.navy, size = 9.5 } = {}) =>
  new TableCell({
    children: [para([R(text, { size, bold: true, color })], { before: 2, after: 2 })],
    margins: { top: sp(2), bottom: sp(2), left: sp(5), right: sp(5) },
    shading: { type: ShadingType.SOLID, fill: bg },
    width: { size: w, type: WidthType.DXA },
    borders: { top: thinBord(C.blue), bottom: thinBord(C.blue), left: thinBord(C.blue), right: thinBord(C.blue) },
  });

const dc = (text, w, { bold = false, color = C.g100, shade, size = 9.5, align } = {}) =>
  new TableCell({
    children: [new Paragraph({ children: [R(text, { size, bold, color })], spacing: { before: sp(2), after: sp(2) }, alignment: align })],
    margins: { top: sp(2), bottom: sp(2), left: sp(5), right: sp(5) },
    shading: shade ? { type: ShadingType.SOLID, fill: shade } : undefined,
    width: { size: w, type: WidthType.DXA },
    borders: { top: thinBord(), bottom: thinBord(), left: thinBord(), right: thinBord() },
  });

// Two-column layout helper (invisible table)
const twoCol = (leftItems, rightItems, { leftW = 0.48, gap = 0.04 } = {}) => {
  const lw = Math.round(W * leftW);
  const gw = Math.round(W * gap);
  const rw = W - lw - gw;
  return new Table({
    width: { size: W, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders: noBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: leftItems,
            width: { size: lw, type: WidthType.DXA },
            borders: noBorders,
            margins: { top: 0, bottom: 0, left: 0, right: sp(6) },
          }),
          new TableCell({
            children: [spacer(0)],
            width: { size: gw, type: WidthType.DXA },
            borders: noBorders,
          }),
          new TableCell({
            children: rightItems,
            width: { size: rw, type: WidthType.DXA },
            borders: noBorders,
            margins: { top: 0, bottom: 0, left: sp(6), right: 0 },
          }),
        ],
      }),
    ],
  });
};

// Horizontal bar chart cell (pct = 0–100)
const barRow = (label, pct, valueText, { shade = C.g100, labelW = 2600, barTotalW = 5200, valW = 1560 } = {}) => {
  const filled = Math.round(barTotalW * pct / 100);
  const empty  = barTotalW - filled;
  return new TableRow({
    children: [
      new TableCell({
        children: [para([R(label, { size: 9, color: C.g100 })], { after: 0, before: 0 })],
        width: { size: labelW, type: WidthType.DXA },
        borders: noBorders,
        margins: { top: sp(2), bottom: sp(2), left: 0, right: sp(4) },
        verticalAlign: "center",
      }),
      new TableCell({
        children: [spacer(0)],
        width: { size: filled, type: WidthType.DXA },
        shading: { type: ShadingType.SOLID, fill: shade },
        borders: noBorders,
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      }),
      new TableCell({
        children: [spacer(0)],
        width: { size: empty, type: WidthType.DXA },
        shading: { type: ShadingType.SOLID, fill: C.barRest },
        borders: noBorders,
      }),
      new TableCell({
        children: [para([R(valueText, { size: 9, bold: true, color: shade })], { after: 0, align: AlignmentType.RIGHT })],
        width: { size: valW, type: WidthType.DXA },
        borders: noBorders,
        margins: { top: sp(2), bottom: sp(2), left: sp(4), right: 0 },
        verticalAlign: "center",
      }),
    ],
  });
};

// Dual bar chart row (before/after)
const dualBarRow = (label, beforePct, afterPct, { labelW = 2600, barW = 2600, valW = 780, gap = 380 } = {}) => {
  const bFill = Math.round(barW * beforePct / 100);
  const bRest = barW - bFill;
  const aFill = Math.round(barW * afterPct / 100);
  const aRest = barW - aFill;
  return new TableRow({
    children: [
      new TableCell({ children: [para([R(label, { size: 8.5 })], { after: 0 })], width: { size: labelW, type: WidthType.DXA }, borders: noBorders, margins: { top: sp(2), bottom: sp(2), right: sp(4) }, verticalAlign: "center" }),
      new TableCell({ children: [spacer(0)], width: { size: bFill, type: WidthType.DXA }, shading: { type: ShadingType.SOLID, fill: "8D8D8D" }, borders: noBorders }),
      new TableCell({ children: [spacer(0)], width: { size: bRest, type: WidthType.DXA }, shading: { type: ShadingType.SOLID, fill: C.barRest }, borders: noBorders }),
      new TableCell({ children: [spacer(0)], width: { size: gap,   type: WidthType.DXA }, borders: noBorders }),
      new TableCell({ children: [spacer(0)], width: { size: aFill, type: WidthType.DXA }, shading: { type: ShadingType.SOLID, fill: C.blue }, borders: noBorders }),
      new TableCell({ children: [spacer(0)], width: { size: aRest, type: WidthType.DXA }, shading: { type: ShadingType.SOLID, fill: C.barRest }, borders: noBorders }),
    ],
  });
};

// Navy accent callout bar (full-width, short text)
const accentBar = (text, { bg = C.navy, color = C.white, size = 10 } = {}) =>
  new Paragraph({
    children: [R(text, { size, bold: true, color })],
    shading: { type: ShadingType.SOLID, fill: bg },
    spacing: { before: sp(6), after: sp(6) },
    indent: { left: sp(10), right: sp(10) },
  });

// Dark bold divider line with text
const blueHR = () =>
  new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: C.blue, space: 3 } },
    spacing: { before: sp(5), after: sp(5) },
  });

const thinHR = () =>
  new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: C.g20, space: 3 } },
    spacing: { before: sp(4), after: sp(4) },
  });

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  creator: "IBM Consulting",
  title: "IBM × Horizon BCBS — AMS Transformation Executive Summary",
  description: "Confidential — April 2026",

  sections: [

    // =========================================================================
    // PAGE 1 — COVER
    // =========================================================================
    {
      properties: {
        page: { margin: { top: inch(0), bottom: inch(0), left: inch(0), right: inch(0) } },
      },
      children: [
        // Full-width navy header band
        new Paragraph({
          children: [
            R("IBM CONSULTING   |   HEALTHCARE & PAYER DELIVERY", { size: 8.5, bold: true, color: C.white, allCaps: true }),
          ],
          shading: { type: ShadingType.SOLID, fill: C.navy },
          alignment: AlignmentType.CENTER,
          spacing: { before: sp(14), after: sp(14) },
        }),

        // Blue accent band
        new Paragraph({
          children: [],
          shading: { type: ShadingType.SOLID, fill: C.blue },
          spacing: { before: 0, after: sp(3) },
        }),

        // White body area
        new Paragraph({
          children: [R("  ")],
          spacing: { before: sp(28), after: 0 },
        }),

        // CONFIDENTIAL stamp
        new Paragraph({
          children: [R("CONFIDENTIAL  |  APRIL 2026", { size: 8, bold: true, color: C.blue, allCaps: true })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 0, after: sp(6) },
          indent: { right: inch(1.1) },
        }),

        // Eyebrow
        new Paragraph({
          children: [R("IBM × HORIZON BLUE CROSS BLUE SHIELD OF NEW JERSEY", { size: 10, bold: true, color: C.blue, allCaps: true })],
          spacing: { before: 0, after: sp(4) },
          indent: { left: inch(1.1) },
        }),

        // Main title
        new Paragraph({
          children: [R("Application Management", { size: 34, bold: true, color: C.navy })],
          spacing: { before: 0, after: 0 },
          indent: { left: inch(1.1) },
        }),
        new Paragraph({
          children: [R("Services Transformation", { size: 34, bold: true, color: C.navy })],
          spacing: { before: 0, after: sp(3) },
          indent: { left: inch(1.1) },
        }),

        // Subtitle
        new Paragraph({
          children: [R("Executive Summary  ·  AI-First  ·  Business-Led  ·  Zero-Touch", { size: 13, color: C.g70, italics: true })],
          spacing: { before: 0, after: sp(20) },
          indent: { left: inch(1.1) },
        }),

        // 4-stat KPI row
        new Table({
          width: { size: W + sp(24), type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({
              children: [
                callout("Structural Cost Takeout",    "40–50%", "vs. current run-rate"),
                callout("Speed to Market",            "25–40%", "faster change delivery"),
                callout("Incident Auto-Resolution",   ">74%",   "P3/P4 zero-touch"),
                callout("Automation Coverage Target", "80%+",   "from ~25% today"),
              ].map((c, i) => {
                // Override width
                c.options = c.options || {};
                return c;
              }),
            }),
          ],
        }),

        spacer(14),

        // Cover quote
        new Paragraph({
          children: [R("\u201CThis is not an outsourcing contract. This is a transformation covenant — where IBM's success is defined by Horizon's outcomes.\u201D", { size: 11, italics: true, color: C.navy2 })],
          spacing: { before: sp(4), after: sp(4) },
          indent: { left: inch(1.1), right: inch(1.1) },
        }),
        new Paragraph({
          children: [R("\u2014 IBM Consulting, Healthcare & Payer Delivery", { size: 9, bold: true, color: C.blue })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 0, after: sp(20) },
          indent: { right: inch(1.1) },
        }),

        // Bottom meta band
        new Paragraph({
          children: [],
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: C.blue, space: 0 } },
          spacing: { before: sp(10), after: 0 },
          indent: { left: inch(1.1) },
        }),
        new Paragraph({
          children: [
            R("Prepared for:  ", { size: 8.5, bold: true, color: C.navy }),
            R("Horizon Healthcare Services    ", { size: 8.5, color: C.g70 }),
            R("Reference:  ", { size: 8.5, bold: true, color: C.navy }),
            R("IBM-HZN-AMS-RFP-2026-CAS    ", { size: 8.5, color: C.g70 }),
            R("Date:  ", { size: 8.5, bold: true, color: C.navy }),
            R("April 2026", { size: 8.5, color: C.g70 }),
          ],
          spacing: { before: sp(5), after: sp(5) },
          indent: { left: inch(1.1) },
        }),

        // Navy bottom band
        new Paragraph({
          children: [R("\u00A9 2026 IBM Corporation. All rights reserved.  Powered by CareOps360 · IBM AIOps · IBM Consulting Advantage · ICA", { size: 7.5, color: C.white })],
          shading: { type: ShadingType.SOLID, fill: C.navy },
          alignment: AlignmentType.CENTER,
          spacing: { before: sp(5), after: sp(5) },
        }),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),
      ],
    },

    // =========================================================================
    // PAGES 2–10 — MAIN CONTENT
    // =========================================================================
    {
      properties: {
        page: { margin: { top: inch(0.85), bottom: inch(0.75), left: inch(1.0), right: inch(1.0) } },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                R("IBM \u00D7 HORIZON BCBS  |  AMS TRANSFORMATION EXECUTIVE SUMMARY", { size: 7.5, bold: true, color: C.g50, allCaps: true }),
                R("   \u2014   CONFIDENTIAL", { size: 7.5, bold: true, color: C.blue }),
              ],
              alignment: AlignmentType.RIGHT,
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.blue, space: 4 } },
              spacing: { after: 0 },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                R("CareOps360 · IBM AIOps · IBM Consulting Advantage · ICA", { size: 7.5, bold: true, color: C.blue }),
                R("   |   \u00A9 2026 IBM Corporation   |   Page ", { size: 7.5, color: C.g50 }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: hp(7.5), color: C.g50 }),
              ],
              border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.g20, space: 3 } },
              spacing: { before: sp(3) },
            }),
          ],
        }),
      },
      children: [

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 2 — THE STRATEGIC IMPERATIVE
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("1.0", "The Strategic Imperative", "Why the status quo is not an option"),

        ...punchLine(
          "Every day Horizon runs on fragmented, reactive operations is a day competitors move faster, costs compound, and member expectations go unmet. The window to act is now.",
          "IBM Consulting — AMS Transformation Brief"
        ),

        spacer(2),
        twoCol(
          [
            subHead("The Challenge", { before: 0, after: 2, color: C.navy }),
            bull("~500 applications across enrollment, claims, member services, provider ops, and data — managed in siloed delivery towers with no unified ownership.", { size: 10 }),
            bull("Manual triage, batch-heavy integration, and reactive incident response drive hidden costs and slow the change pipeline by weeks.", { size: 10 }),
            bull("Automation coverage at ~25% leaves engineers buried in repetitive work that adds no business value.", { size: 10 }),
            bull("Quality is tested late — defects escape to production, driving downstream rework and member dissatisfaction.", { size: 10 }),
            bull("Technical debt is accumulating faster than teams can remediate it, increasing security and compliance exposure.", { size: 10 }),
            spacer(4),
            // Pain-point heat table
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                new TableRow({ children: [hc("Pain Area", Math.round(W*0.28), { bg: C.navy }), hc("Impact", Math.round(W*0.20), { bg: C.navy })] }),
                ...[
                  ["Reactive ops model",      "High cost"],
                  ["Manual incident triage",  "Slow MTTR"],
                  ["25% test automation",     "Defect leakage"],
                  ["Siloed delivery towers",  "Missed SLAs"],
                  ["Tech debt accumulation",  "Security risk"],
                ].map(([a, b]) => new TableRow({ children: [
                  dc(a, Math.round(W*0.28), { size: 9 }),
                  dc(b, Math.round(W*0.20), { size: 9, bold: true, color: "DA1E28", shade: "FFF1F1" }),
                ]})),
              ],
            }),
          ],
          [
            subHead("The IBM Response", { before: 0, after: 2, color: C.navy }),
            bull("An AI-first, business-led operating model — where AIOps, agentic intelligence, and automation form the engine of Horizon's application estate.", { size: 10 }),
            bull("Zero-touch delivery: automated triage, self-healing systems, and GenAI-assisted quality that eliminates repetitive human intervention.", { size: 10 }),
            bull("Integrated product pods own the full change lifecycle — build, test, release, monitor, heal — with no handoff gaps.", { size: 10 }),
            bull("A governed value pipeline: modernization, innovation, and improvement embedded into steady-state — not managed as separate projects.", { size: 10 }),
            bull("Executive transparency: real-time outcome dashboards replacing activity metrics with business impact measurement.", { size: 10 }),
            spacer(4),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                new TableRow({ children: [hc("IBM Solution", Math.round(W*0.28), { bg: C.blue }), hc("Outcome", Math.round(W*0.20), { bg: C.blue })] }),
                ...[
                  ["AIOps + Agentic AI",    ">74% auto-resolve"],
                  ["Zero-Touch Pipeline",   "-55% MTTR"],
                  ["GenAI Quality Engine",  "80%+ coverage"],
                  ["Unified Product Pods",  "No handoff loss"],
                  ["Outcome Governance",    "Measurable ROI"],
                ].map(([a, b]) => new TableRow({ children: [
                  dc(a, Math.round(W*0.28), { size: 9 }),
                  dc(b, Math.round(W*0.20), { size: 9, bold: true, color: C.blue, shade: C.lBlue }),
                ]})),
              ],
            }),
          ]
        ),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 3 — THE IBM OPERATING MODEL
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("2.0", "The IBM Operating Model", "Business-Led · AI-Powered · Zero-Touch"),

        body("IBM's operating model collapses four traditional delivery towers into a single, product-aligned system where AI does the routing, testing, triage, and self-healing — freeing human expertise for high-value engineering and innovation."),
        spacer(3),

        // Architecture diagram (3-layer table)
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            // Layer header
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    para([R("BUSINESS OUTCOMES LAYER", { size: 8, bold: true, color: C.white, allCaps: true })], { align: AlignmentType.CENTER, before: 4, after: 4 }),
                    para([R("Claims \u00B7 Enrollment \u00B7 Member Experience \u00B7 Provider Operations \u00B7 Data Products", { size: 8.5, color: C.lBlue })], { align: AlignmentType.CENTER, before: 0, after: 4 }),
                  ],
                  shading: { type: ShadingType.SOLID, fill: C.navy },
                  margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
                  columnSpan: 5,
                  borders: { top: thinBord(C.blue), bottom: thinBord(C.blue), left: thinBord(C.blue), right: thinBord(C.blue) },
                }),
              ],
            }),
            // 5 pods
            new TableRow({
              children: [
                ["AMS\nPod", C.blue],
                ["QE\nPod",  "0072C3"],
                ["DataOps\nPod", "005D5D"],
                ["Integration\nPod", "6929C4"],
                ["Innovation\nPod", "0043CE"],
              ].map(([label, col]) =>
                new TableCell({
                  children: [
                    para([R(label.replace("\\n", "\n"), { size: 9, bold: true, color: C.white })], { align: AlignmentType.CENTER, before: 6, after: 6 }),
                  ],
                  shading: { type: ShadingType.SOLID, fill: col },
                  margins: { top: sp(4), bottom: sp(4), left: sp(4), right: sp(4) },
                  width: { size: W / 5, type: WidthType.DXA },
                  borders: { top: thinBord(C.white), bottom: thinBord(C.white), left: thinBord(C.white), right: thinBord(C.white) },
                })
              ),
            }),
            // AI engine bar
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    para([R("AI ENGINE  \u2014  IBM AIOps \u00B7 Agentic Intelligence \u00B7 ICA \u00B7 GenAI Quality \u00B7 CareOps360", { size: 9, bold: true, color: C.navy })], { align: AlignmentType.CENTER, before: 5, after: 5 }),
                  ],
                  shading: { type: ShadingType.SOLID, fill: C.lBlue },
                  margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
                  columnSpan: 5,
                  borders: { top: thinBord(C.blue), bottom: thinBord(C.blue), left: thinBord(C.blue), right: thinBord(C.blue) },
                }),
              ],
            }),
            // Platform layer
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    para([R("PLATFORM FOUNDATION  \u2014  Hybrid Cloud \u00B7 Integration Hub \u00B7 Mainframe Modernization \u00B7 DataOps \u00B7 Security & Compliance", { size: 8.5, bold: true, color: C.white })], { align: AlignmentType.CENTER, before: 4, after: 4 }),
                  ],
                  shading: { type: ShadingType.SOLID, fill: "21272A" },
                  margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
                  columnSpan: 5,
                  borders: { top: thinBord(C.blue), bottom: thinBord(C.blue), left: thinBord(C.blue), right: thinBord(C.blue) },
                }),
              ],
            }),
          ],
        }),

        spacer(6),
        subHead("Six Core Tenets", { before: 0, after: 2, color: C.navy }),
        spacer(2),

        twoCol(
          [
            ...[
              ["01  AI-First by Design",       "AI embedded in every operational touchpoint — triage, diagnosis, quality, deployment. Not a bolt-on; a structural shift."],
              ["02  Business-Led Operations",  "Business outcome ownership drives every technology decision. Pods are aligned to business domains, not technology towers."],
              ["03  Zero-Touch Delivery",      "P3/P4 incidents resolve without human intervention. Change pipelines run automatically. Releases are quality-gated and risk-scored."],
            ].flatMap(([t, d]) => [
              para([R(t, { size: 10, bold: true, color: C.blue })], { before: 4, after: 1 }),
              para([R(d, { size: 9.5, color: C.g70 })], { before: 0, after: 1 }),
            ]),
          ],
          [
            ...[
              ["04  Integrated Delivery",      "AMS, QE, and Data operate as one team, one backlog, one pipeline. Handoffs disappear; accountability is end-to-end."],
              ["05  Continuous Innovation",    "A governed innovation pipeline runs alongside steady-state. Every sprint can include a modernization sprint at no additional cost."],
              ["06  Executive Transparency",   "Outcomes are tracked in real-time. KPIs move from ticket counts to business impact: cycle time, defect leakage, cost takeout."],
            ].flatMap(([t, d]) => [
              para([R(t, { size: 10, bold: true, color: C.blue })], { before: 4, after: 1 }),
              para([R(d, { size: 9.5, color: C.g70 })], { before: 0, after: 1 }),
            ]),
          ]
        ),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 4 — AIOPS & AGENTIC INTELLIGENCE
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("3.0", "AIOps & Agentic Intelligence", "From reactive support to autonomous operations"),

        ...punchLine(
          "When AI can detect, route, diagnose, and resolve — humans stop being firefighters and start being engineers. That shift compounds into $8–12M in annual value for Horizon.",
          "IBM AIOps Value Case — Horizon Estate"
        ),

        spacer(2),

        twoCol(
          [
            subHead("How the AI Engine Works", { before: 0, after: 2, color: C.navy }),
            para([R("Six purpose-built AI agents work as a coordinated system — ingesting telemetry, correlating signals, routing issues, and resolving them — often before an engineer is notified.", { size: 9.5 })], { after: 4 }),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                new TableRow({ children: [hc("Agent", Math.round(W*0.23), { bg: C.navy }), hc("Role", Math.round(W*0.15), { bg: C.navy }), hc("Value", Math.round(W*0.10), { bg: C.navy })] }),
                ...[
                  ["Detection & Correlation", ">60% noise cut",   "$2.5–3.5M"],
                  ["Triage Agent",            "Instant routing",   "$1.3–1.5M"],
                  ["Root Cause AI",           "Guided diagnosis",  "$2.0–3.0M"],
                  ["Auto-Remediation",        "Self-heal P3/P4",   "$1.5–2.0M"],
                  ["Knowledge Agent",         "Closes loops",      "$1.0–1.3M"],
                  ["Deployment AI",           "Risk-scored CI/CD", "$0.8–1.2M"],
                ].map(([a, b, c]) => new TableRow({ children: [
                  dc(a, Math.round(W*0.23), { size: 8.5, bold: true }),
                  dc(b, Math.round(W*0.15), { size: 8.5, color: C.g70 }),
                  dc(c, Math.round(W*0.10), { size: 8.5, bold: true, color: C.blue }),
                ]})),
              ],
            }),
          ],
          [
            subHead("Before vs. After — Key Metrics", { before: 0, after: 2, color: C.navy }),
            para([R("BEFORE (grey)  vs.  AFTER IBM AIOps (blue)", { size: 8, bold: true, color: C.g70 })], { after: 3 }),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                dualBarRow("Alert noise resolved",     20, 85,  { labelW: Math.round(W*0.17), barW: Math.round(W*0.13), valW: 0, gap: 200 }),
                dualBarRow("Incidents auto-resolved",  10, 74,  { labelW: Math.round(W*0.17), barW: Math.round(W*0.13), valW: 0, gap: 200 }),
                dualBarRow("Automation coverage",      25, 80,  { labelW: Math.round(W*0.17), barW: Math.round(W*0.13), valW: 0, gap: 200 }),
                dualBarRow("System availability",      97, 99.9,{ labelW: Math.round(W*0.17), barW: Math.round(W*0.13), valW: 0, gap: 200 }),
              ],
            }),
            spacer(4),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                new TableRow({ children: [hc("Metric", Math.round(W*0.22), { bg: C.navy }), hc("Today", Math.round(W*0.12), { bg: C.navy }), hc("Target", Math.round(W*0.14), { bg: C.blue })] }),
                ...[ ["MTTR", ">4 hours", "<1.8 hrs"], ["P3/P4 Auto-Resolve", "<10%", ">74%"], ["Alert Noise", "Unfiltered", ">60% cut"], ["Availability", "~99.7%", "99.9%+"] ]
                  .map(([m, b, a]) => new TableRow({ children: [
                    dc(m, Math.round(W*0.22), { size: 8.5, bold: true }),
                    dc(b, Math.round(W*0.12), { size: 8.5, color: "DA1E28" }),
                    dc(a, Math.round(W*0.14), { size: 8.5, bold: true, color: C.blue, shade: C.lBlue }),
                  ]})),
              ],
            }),
          ]
        ),

        spacer(4),
        accentBar("IBM AIOps is not monitoring. It is a closed-loop autonomous operations engine — detect, correlate, triage, resolve, learn, prevent."),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 5 — ZERO-TOUCH DELIVERY
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("4.0", "Zero-Touch Delivery", "Automating the full change & operations lifecycle"),

        ...punchLine(
          "Zero-Touch means: the system heals itself before the phone rings, the pipeline validates before the engineer commits, and the release deploys safely while the team sleeps.",
          "IBM Zero-Touch Delivery Framework"
        ),

        body("Zero-Touch Delivery is not a goal — it is an engineering discipline. Every manual intervention is a failure mode to be automated away. IBM's delivery model targets zero human touch for all recurring operational patterns, eliminating toil and compounding engineer capacity toward innovation."),
        spacer(3),

        // Zero-touch pipeline visualization
        subHead("The Zero-Touch Operations Pipeline", { before: 0, after: 3, color: C.navy }),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({
              children: [
                ["DETECT\nTelemetry ingestion\nAnomaly detection\nCorrelation engine", C.navy],
                ["CORRELATE\nSignal grouping\nNoise reduction\n>60% alert cut", "005D5D"],
                ["TRIAGE\nAI routing\nImpact scoring\nAuto-assign", "0043CE"],
                ["RESOLVE\nSelf-heal runbooks\nP3/P4 zero-touch\nAuto-remediate", C.blue],
                ["LEARN\nPost-incident\nKnowledge capture\nPrevent recurrence", "6929C4"],
              ].map(([t, bg]) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [R(t, { size: 8.5, bold: false, color: C.white })],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: sp(8), after: sp(8) },
                    }),
                  ],
                  shading: { type: ShadingType.SOLID, fill: bg },
                  margins: { top: sp(4), bottom: sp(4), left: sp(6), right: sp(6) },
                  width: { size: W / 5, type: WidthType.DXA },
                  borders: { top: thinBord(C.white), bottom: thinBord(C.white), left: thinBord(C.white), right: thinBord(C.white) },
                })
              ),
            }),
          ],
        }),

        spacer(6),
        twoCol(
          [
            subHead("Automation Maturity Ladder", { before: 0, after: 3, color: C.navy }),
            para([R("Progress from Level 1 to Level 5 — each level compounds value from the one before.", { size: 9.5, color: C.g70 })], { after: 3 }),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                barRow("Level 5: Predictive & Preventive",    90, "Target Y2",   { shade: C.blue,  labelW: 2400, barTotalW: 4200, valW: 1400 }),
                barRow("Level 4: Self-Healing Ops",           75, "Year 2",       { shade: "0072C3", labelW: 2400, barTotalW: 4200, valW: 1400 }),
                barRow("Level 3: Agentic Triage & Resolve",   60, "Month 6+",    { shade: "0043CE", labelW: 2400, barTotalW: 4200, valW: 1400 }),
                barRow("Level 2: Automated Monitoring",       40, "Month 3",     { shade: "005D5D", labelW: 2400, barTotalW: 4200, valW: 1400 }),
                barRow("Level 1: Reactive Manual Ops",        20, "Today",       { shade: C.g50,   labelW: 2400, barTotalW: 4200, valW: 1400 }),
              ],
            }),
          ],
          [
            subHead("Change Pipeline: CI/CD + AI Risk Gating", { before: 0, after: 3, color: C.navy }),
            para([R("Every release passes through AI-scored risk gates — no human approval required for low-risk changes.", { size: 9.5, color: C.g70 })], { after: 3 }),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                new TableRow({ children: [hc("Stage", Math.round(W*0.22), { bg: C.navy }), hc("Automation", Math.round(W*0.14), { bg: C.navy }), hc("Human Touch", Math.round(W*0.12), { bg: C.navy })] }),
                ...[ ["Code commit",      "GenAI review",      "Exception only"], ["Unit & integration","AI-gen tests",      "None"], ["Performance gate","AI benchmarking",   "None"], ["Security scan",    "Auto-remediate",    "Critical CVEs"], ["Release",          "AI risk score",     "Tier 1 only"] ]
                  .map(([a, b, c]) => new TableRow({ children: [
                    dc(a, Math.round(W*0.22), { size: 8.5 }),
                    dc(b, Math.round(W*0.14), { size: 8.5, color: C.blue }),
                    dc(c, Math.round(W*0.12), { size: 8.5, color: c === "None" ? C.green : C.g70, bold: c === "None" }),
                  ]})),
              ],
            }),
          ]
        ),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 6 — BUSINESS-LED OPERATIONS & ROI
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("5.0", "Business-Led Operations", "Technology in service of outcomes — not the reverse"),

        ...punchLine(
          "The fundamental shift: technology teams stop managing systems and start owning business outcomes. Every KPI traces to member experience, claims velocity, or operational cost.",
          "IBM Outcome Ownership Framework"
        ),

        spacer(2),
        twoCol(
          [
            subHead("Business Domain Outcomes", { before: 0, after: 3, color: C.navy }),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                new TableRow({ children: [hc("Domain", Math.round(W*0.19), { bg: C.navy }), hc("KPI", Math.round(W*0.16), { bg: C.navy }), hc("Target", Math.round(W*0.13), { bg: C.blue })] }),
                ...[ ["Claims Adjudication", "Processing cycle time", "-30%"], ["Enrollment", "Time-to-activation", "-40%"], ["Member Services", "First-call resolution", "+25%"], ["Provider Ops", "Auth processing time", "-35%"], ["Data Products", "Report delivery latency", "-50%"], ["IT Operations", "MTTR / auto-resolve", ">74% auto"] ]
                  .map(([a, b, c]) => new TableRow({ children: [
                    dc(a, Math.round(W*0.19), { size: 8.5, bold: true }),
                    dc(b, Math.round(W*0.16), { size: 8.5 }),
                    dc(c, Math.round(W*0.13), { size: 8.5, bold: true, color: C.blue, shade: C.lBlue }),
                  ]})),
              ],
            }),
            spacer(4),
            subHead("Operational Cost Takeout Model", { before: 4, after: 3, color: C.navy }),
            para([R("Directional value — baselines confirmed in Phase 0", { size: 8, italics: true, color: C.g50 })], { after: 2 }),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                barRow("AIOps & Auto-Remediation",  85, "$3.5–6.5M", { shade: C.blue, labelW: 2300, barTotalW: 4200, valW: 1500 }),
                barRow("GenAI QE Automation",       70, "$2.5–4.0M", { shade: "0072C3", labelW: 2300, barTotalW: 4200, valW: 1500 }),
                barRow("Zero-Touch Pipeline",       60, "$2.0–3.0M", { shade: "0043CE", labelW: 2300, barTotalW: 4200, valW: 1500 }),
                barRow("Platform Modernization",    45, "$1.5–2.5M", { shade: "005D5D", labelW: 2300, barTotalW: 4200, valW: 1500 }),
                barRow("Demand Reduction / Ticket\nEconomics", 55, "$1.0–2.0M", { shade: "6929C4", labelW: 2300, barTotalW: 4200, valW: 1500 }),
              ],
            }),
          ],
          [
            subHead("The Outcome Governance Model", { before: 0, after: 3, color: C.navy }),
            para([R("IBM replaces activity-metric reporting with three tiers of outcome accountability:", { size: 9.5 })], { after: 3 }),
            ...[ ["Operational Cadence  (Weekly)", "SLA adherence, MTTR, incident volume, pipeline velocity — tracked in CareOps360 in real-time."],
                ["Executive Cadence  (Monthly)",  "Cost takeout actuals, automation coverage progress, modernization milestones, business KPI movement."],
                ["Board Cadence  (Quarterly)",    "Strategic outcome review: innovation delivered, total value realized, year-ahead investment priorities."],
            ].flatMap(([t, d]) => [
              para([R(t, { size: 10, bold: true, color: C.blue })], { before: 5, after: 1 }),
              para([R(d, { size: 9.5, color: C.g70 })], { before: 0, after: 1 }),
            ]),

            spacer(6),
            subHead("CareOps360 — Real-Time Executive Dashboard", { before: 4, after: 2, color: C.navy }),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                new TableRow({ children: [hc("Dashboard View", Math.round(W*0.24), { bg: C.navy }), hc("Audience", Math.round(W*0.24), { bg: C.navy })] }),
                ...[ ["Operations Command Center", "IT Leadership / CTO"], ["Cost Takeout Tracker", "CFO / Operations"], ["Modernization Heatmap", "Enterprise Architects"], ["Quality Intelligence", "QE Leads / CIO"], ["AI Agent Performance", "AIOps / SRE Teams"] ]
                  .map(([a, b]) => new TableRow({ children: [
                    dc(a, Math.round(W*0.24), { size: 8.5, bold: true }),
                    dc(b, Math.round(W*0.24), { size: 8.5, color: C.g70 }),
                  ]})),
              ],
            }),
          ]
        ),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 7 — QUALITY ENGINEERING
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("6.0", "Quality Engineering", "Shift-left · GenAI-assisted · Always-on"),

        ...punchLine(
          "Quality is not a phase at the end of a sprint. It is a continuous signal — from commit to production — powered by GenAI test generation, AI defect prediction, and closed-loop learning.",
          "IBM Quality Engineering — AI-First Framework"
        ),

        spacer(2),
        twoCol(
          [
            subHead("Quality Coverage Progression", { before: 0, after: 3, color: C.navy }),
            para([R("From ~25% today to 80%+ by month 12 — driven by GenAI-assisted test generation:", { size: 9.5 })], { after: 3 }),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                barRow("Month 0  (Baseline)",  25, "~25%", { shade: C.g50,   labelW: 2100, barTotalW: 4500, valW: 1360 }),
                barRow("Month 3  (Ignite)",    45, "45%",  { shade: "0072C3", labelW: 2100, barTotalW: 4500, valW: 1360 }),
                barRow("Month 6  (Scale)",     62, "62%",  { shade: "0043CE", labelW: 2100, barTotalW: 4500, valW: 1360 }),
                barRow("Month 9  (Optimize)",  75, "75%",  { shade: C.blue,   labelW: 2100, barTotalW: 4500, valW: 1360 }),
                barRow("Month 12 (Target)",    82, "82%",  { shade: C.navy,   labelW: 2100, barTotalW: 4500, valW: 1360 }),
              ],
            }),
            spacer(4),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                new TableRow({ children: [hc("QE Metric", Math.round(W*0.22), { bg: C.navy }), hc("Current", Math.round(W*0.12), { bg: C.navy }), hc("Target", Math.round(W*0.14), { bg: C.blue })] }),
                ...[ ["Defect Escape",       "High",      "−65%"], ["Regression Time",   "Multi-day", "−70%"], ["MTTD",              ">2 hrs",    "<15 min"], ["False Positives",    "High",      "<5%"] ]
                  .map(([m, b, a]) => new TableRow({ children: [
                    dc(m, Math.round(W*0.22), { size: 8.5, bold: true }),
                    dc(b, Math.round(W*0.12), { size: 8.5, color: "DA1E28" }),
                    dc(a, Math.round(W*0.14), { size: 8.5, bold: true, color: C.blue, shade: C.lBlue }),
                  ]})),
              ],
            }),
          ],
          [
            subHead("The GenAI Quality Engine", { before: 0, after: 3, color: C.navy }),
            ...[ ["Test Generation at Scale",    "GenAI synthesizes regression, integration, and edge-case tests from code changes — at commit speed. No human authoring required for standard coverage."],
                ["Defect Prediction",           "AI models trained on Horizon's incident history flag high-risk code paths before they reach UAT. Shift-left at the commit level."],
                ["Release Readiness Scoring",   "Each release receives an AI-computed readiness score — combining test coverage delta, risk profile, and historical defect patterns."],
                ["Production Feedback Loop",    "Every production defect teaches the QE engine. Coverage evolves automatically; test suites improve with each release cycle."],
            ].flatMap(([t, d]) => [
              para([R(t, { size: 10, bold: true, color: C.blue })], { before: 5, after: 1 }),
              para([R(d, { size: 9.5, color: C.g70 })], { before: 0, after: 2 }),
            ]),
            spacer(4),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                new TableRow({ children: [hc("Capability", Math.round(W*0.30), { bg: C.navy }), hc("Tool / Method", Math.round(W*0.18), { bg: C.navy })] }),
                ...[ ["AI Test Generation", "IBM Consulting Advantage"], ["Shift-Left Gates", "GenAI code review"], ["Performance Testing", "AI benchmarking"], ["Security QA", "SAST/DAST + AI"], ["Test Maintenance", "Auto-heal scripts"] ]
                  .map(([a, b]) => new TableRow({ children: [dc(a, Math.round(W*0.30), { size: 8.5, bold: true }), dc(b, Math.round(W*0.18), { size: 8.5, color: C.blue })] })),
              ],
            }),
          ]
        ),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 8 — PLATFORM & DATA MODERNIZATION
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("7.0", "Platform & Data Modernization", "Eliminating the debt that slows Horizon down"),

        body("IBM treats platform modernization as a continuous discipline embedded in steady-state delivery — not a separate programme. Every sprint may include a modernization sprint. Technical debt is tracked, prioritized by business impact, and burned down systematically through a governed value pipeline."),
        spacer(3),

        twoCol(
          [
            subHead("Modernization Waves", { before: 0, after: 3, color: C.navy }),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                new TableRow({ children: [hc("Workstream", Math.round(W*0.22), { bg: C.navy }), hc("Wave", Math.round(W*0.10), { bg: C.navy }), hc("Approach", Math.round(W*0.16), { bg: C.navy })] }),
                ...[ ["Integration Hub",       "Wave 1", "API-first + event streaming"],
                    ["Mainframe APIs",         "Wave 1", "API-wrap strategy"],
                    ["App Portfolio (~500)",   "Wave 2", "Assess → rationalize"],
                    ["Mainframe Rehost",       "Wave 2", "Lift-and-shift + validate"],
                    ["DataOps Pipeline",       "Wave 1", "AI-driven quality engine"],
                    ["Mainframe Refactor",     "Wave 3", "Selective modernize"],
                    ["Cloud Optimization",     "Wave 2", "Cost + performance tuning"],
                    ["Security Hardening",     "Ongoing","n-1 standard + CVE auto-patch"],
                ].map(([a, b, c]) => new TableRow({ children: [
                  dc(a, Math.round(W*0.22), { size: 8.5, bold: true }),
                  dc(b, Math.round(W*0.10), { size: 8.5, bold: true, color: C.blue }),
                  dc(c, Math.round(W*0.16), { size: 8.5, color: C.g70 }),
                ]})),
              ],
            }),
          ],
          [
            subHead("Technical Debt Burndown Trajectory", { before: 0, after: 3, color: C.navy }),
            para([R("Debt index by quarter — driven by n-1 standard enforcement, sprint embedding, and CVE auto-remediation:", { size: 9.5, color: C.g70 })], { after: 3 }),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                barRow("Q1 (Baseline)",     100, "100 (index)", { shade: "DA1E28", labelW: 1900, barTotalW: 4500, valW: 1600 }),
                barRow("Q2 (Post Wave 1)",   78, "78",          { shade: C.amber,  labelW: 1900, barTotalW: 4500, valW: 1600 }),
                barRow("Q3 (Scale)",         62, "62",          { shade: "F1C21B", labelW: 1900, barTotalW: 4500, valW: 1600 }),
                barRow("Q4 (Optimize)",      48, "48",          { shade: "0072C3", labelW: 1900, barTotalW: 4500, valW: 1600 }),
                barRow("Year 2 Target",      30, "<30",         { shade: C.blue,   labelW: 1900, barTotalW: 4500, valW: 1600 }),
              ],
            }),
            spacer(4),
            subHead("Integration Architecture Shift", { before: 4, after: 2, color: C.navy }),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                new TableRow({ children: [hc("Current State", Math.round(W*0.24), { bg: "525252" }), hc("IBM Target State", Math.round(W*0.24), { bg: C.blue })] }),
                ...[ ["Point-to-point (P2P)", "API-first Integration Hub"], ["Batch-heavy processing", "Event-driven streaming"], ["Manual data pipelines", "AI-quality DataOps"], ["Siloed CMDB", "Unified observability"], ["Manual patching", "Auto-patch + n-1 gov."] ]
                  .map(([a, b]) => new TableRow({ children: [
                    dc(a, Math.round(W*0.24), { size: 8.5, color: "DA1E28" }),
                    dc(b, Math.round(W*0.24), { size: 8.5, bold: true, color: C.blue, shade: C.lBlue }),
                  ]})),
              ],
            }),
          ]
        ),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 9 — PHASED ROADMAP & GOVERNANCE
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("8.0", "Phased Roadmap & Value Realization", "Risk-controlled · Milestone-governed · Value-compounding"),

        ...punchLine(
          "Value is not delivered at the end. It compounds from Day 1 — every automation added, every self-heal triggered, every test generated is a dollar saved and a risk avoided.",
          "IBM Delivery Governance Framework"
        ),

        spacer(2),
        subHead("Roadmap: Phases 0 to 4", { before: 0, after: 3, color: C.navy }),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hc("Phase", W*0.16, { bg: C.navy }), hc("Timeframe", W*0.12, { bg: C.navy }), hc("Key Deliverables", W*0.44, { bg: C.navy }), hc("Value Signal", W*0.28, { bg: C.blue })] }),
            ...[
              ["Phase 0\nFoundation",  "0–8 wks",  "Telemetry onboarding · Baseline establishment · Transition plan · AI environment setup · Innovation council launch", "Dashboards live; baselines locked"],
              ["Phase 1\nIgnite",      "Mth 1–3",  "AIOps live · P3/P4 self-heal pilots · GenAI QE framework · Quick-win automations · Integration Hub design", "First cost takeout signals; MTTR −20%"],
              ["Phase 2\nScale",       "Mth 3–6",  "Agentic triage at scale · Integration Hub Wave 1 · QE coverage 50%+ · DataOps monitoring · Mainframe API-wrap", "Auto-resolve >50%; coverage milestone"],
              ["Phase 3\nOptimize",    "Mth 6–12", "Autonomous ops for common patterns · QE 75%+ · Continuous modernization sprints · Outcome governance reporting", "Cost takeout $4–7M; availability 99.9%"],
              ["Phase 4\nTransform",   "Yr 1–2",   "Full autonomy estate · Mainframe rehost/refactor · Enterprise observability · DataOps maturity · Co-invest pipeline", "Structural cost takeout 40–50%"],
            ].map(([phase, time, dels, val]) => new TableRow({ children: [
              dc(phase, W*0.16, { bold: true, size: 9, color: C.navy }),
              dc(time,  W*0.12, { size: 9, color: C.g70 }),
              dc(dels,  W*0.44, { size: 9 }),
              dc(val,   W*0.28, { size: 9, bold: true, color: C.blue, shade: C.lBlue }),
            ]})),
          ],
        }),

        spacer(6),
        subHead("Value Realization — Cumulative Cost Takeout", { before: 0, after: 3, color: C.navy }),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            barRow("Month 3   (Ignite complete)",   12, "$1.2–2.0M",  { shade: "0072C3", labelW: 2600, barTotalW: 4800, valW: 1960 }),
            barRow("Month 6   (Scale complete)",    30, "$3.0–5.0M",  { shade: "0043CE", labelW: 2600, barTotalW: 4800, valW: 1960 }),
            barRow("Month 12  (Optimize complete)", 60, "$6.0–10.0M", { shade: C.blue,   labelW: 2600, barTotalW: 4800, valW: 1960 }),
            barRow("Month 24  (Transform complete)",100, "$12–18M+",   { shade: C.navy,   labelW: 2600, barTotalW: 4800, valW: 1960 }),
          ],
        }),
        para([R("All values are directional. Baselines confirmed in Phase 0. Monthly reporting tracks actuals vs. targets.", { size: 8, italics: true, color: C.g50 })], { before: 3, after: 4 }),

        spacer(4),
        subHead("KPI Framework", { before: 0, after: 3, color: C.navy }),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hc("Value Area", W*0.22, { bg: C.navy }), hc("KPIs Tracked", W*0.38, { bg: C.navy }), hc("Source", W*0.24, { bg: C.navy }), hc("Cadence", W*0.16, { bg: C.blue })] }),
            ...[ ["Operational Excellence", "MTTR, availability, incident volume, auto-resolution %", "ITSM + AIOps telemetry", "Weekly"],
                ["Cost Takeout",           "Automation ROI, demand reduction, ticket economics", "Finance + ITSM", "Monthly"],
                ["Quality Engineering",    "Coverage, defect escape, regression time, MTTD", "QE toolchain + CI/CD", "Sprint"],
                ["Modernization",          "n-1 compliance, debt index, upgrade velocity", "CMDB + sec scans", "Monthly"],
                ["Business Outcomes",      "Claims cycle, enrollment time, FCR, ASA", "Domain dashboards", "Monthly"],
            ].map(([a, b, c, d]) => new TableRow({ children: [
              dc(a, W*0.22, { bold: true, size: 8.5 }),
              dc(b, W*0.38, { size: 8.5 }),
              dc(c, W*0.24, { size: 8.5, color: C.g70 }),
              dc(d, W*0.16, { size: 8.5, bold: true, color: C.blue, shade: C.lBlue }),
            ]})),
          ],
        }),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 10 — WHY IBM & CALL TO ACTION
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("9.0", "Why IBM — and Why Now", "The only partner with the assets, depth, and accountability to deliver"),

        spacer(2),

        // 4-stat row
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({
              children: [
                callout("AI & Data Practitioners",            "20,000+", "dedicated globally"),
                callout("Cloud & Architecture Experts",       "81,000+", "across IBM Consulting"),
                callout("AI/Analytics Engagements Delivered", "40,000+", "client deployments"),
                callout("Healthcare Clients Served",          "9 of 10",  "top US payers"),
              ],
            }),
          ],
        }),

        spacer(6),
        twoCol(
          [
            subHead("IBM Differentiators — No Other Vendor Offers This", { before: 0, after: 3, color: C.navy }),
            ...[ ["Production-Grade Assets, Day 1", "AIOps, ICA, CareOps360, IBM Consulting Advantage, and GenAI quality tools are live in production — not promised in a roadmap."],
                ["Deep Horizon Knowledge",        "IBM brings institutional knowledge of Horizon's application estate, processes, and change history — reducing transition risk to near-zero."],
                ["Healthcare Payer DNA",          "Claims adjudication, enrollment, prior auth, member services — IBM has modernized these domains for the nation's largest payers."],
                ["Outcome-Based Accountability",  "IBM commits to SLAs tied to business outcomes. If targets are missed, IBM remediation plans are triggered — not negotiated."],
                ["Co-Investment Commitment",      "IBM shares transformation risk. Innovation sprints, tooling, and accelerators are embedded at no incremental cost."],
            ].flatMap(([t, d]) => [
              para([R(t, { size: 10, bold: true, color: C.blue })], { before: 5, after: 1 }),
              para([R(d, { size: 9.5, color: C.g70 })], { before: 0, after: 2 }),
            ]),
          ],
          [
            subHead("IBM vs. The Alternative", { before: 0, after: 3, color: C.navy }),
            new Table({
              width: { size: Math.round(W * 0.48), type: WidthType.DXA },
              layout: TableLayoutType.FIXED,
              rows: [
                new TableRow({ children: [hc("Dimension", Math.round(W*0.16), { bg: C.navy }), hc("Status Quo / Others", Math.round(W*0.16), { bg: "525252" }), hc("IBM", Math.round(W*0.16), { bg: C.blue })] }),
                ...[ ["Operating model",  "Tower-based, reactive",   "Product pods, AI-first"], ["Automation",     "Bolt-on tools",         "Embedded, AI-driven"], ["Quality",        "End-of-sprint testing",  "Shift-left, GenAI"], ["Innovation",     "Separate programme",    "Built into steady-state"], ["Reporting",      "Activity metrics",       "Business outcomes"], ["Risk model",     "IBM bears none",        "Shared; outcome SLAs"] ]
                  .map(([a, b, c]) => new TableRow({ children: [
                    dc(a, Math.round(W*0.16), { size: 8.5, bold: true }),
                    dc(b, Math.round(W*0.16), { size: 8.5, color: "DA1E28" }),
                    dc(c, Math.round(W*0.16), { size: 8.5, bold: true, color: C.blue, shade: C.lBlue }),
                  ]})),
              ],
            }),
            spacer(6),
            subHead("The Next Step", { before: 4, after: 3, color: C.navy }),
            ...[ ["Week 1–2",  "Executive alignment session — Horizon leadership + IBM account team."],
                ["Week 2–4",  "Phase 0 scoping: baseline discovery, telemetry onboarding, and innovation council launch."],
                ["Week 4",    "Contractual milestone: Phase 0 SOW execution and onboarding begins."],
            ].flatMap(([t, d]) => [
              para([R(t + ":  ", { size: 9.5, bold: true, color: C.blue }), R(d, { size: 9.5 })], { before: 3, after: 1 }),
            ]),
          ]
        ),

        spacer(6),
        blueHR(),
        spacer(4),

        // Final closing statement
        new Paragraph({
          children: [
            R("\u201CIBM\u2019s measure of success is not tickets closed, incidents resolved, or tests run — it is ", { size: 11, italics: true }),
            R("business outcomes delivered and sustained", { size: 11, bold: true, italics: true, color: C.navy }),
            R(". Horizon\u2019s members, providers, and leadership will feel the difference. That is the only outcome that matters.\u201D", { size: 11, italics: true }),
          ],
          spacing: { before: sp(4), after: sp(4) },
          indent: { left: inch(0.3), right: inch(0.3) },
        }),
        para([R("\u2014 IBM Consulting, Healthcare & Payer Delivery  |  April 2026", { size: 9.5, bold: true, color: C.blue })],
          { align: AlignmentType.RIGHT, after: 10 }),

        thinHR(),
        para([R("\u00A9 2026 IBM Corporation. All rights reserved.  Confidential \u2014 prepared exclusively for Horizon Healthcare Services.  Ref: IBM-HZN-AMS-RFP-2026-CAS", { size: 7.5, color: C.g50 })],
          { align: AlignmentType.CENTER, before: 3 }),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx", buffer);
console.log("Done \u2014 " + buffer.length + " bytes");
