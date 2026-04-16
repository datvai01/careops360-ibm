/**
 * IBM × Horizon BCBS — AMS Executive Summary
 * Boardroom-ready  |  C-Suite grade  |  IBM Consulting
 *
 * Formatting principles applied:
 *  1. Executive readability — 30–60 s per section
 *  2. 3-level section hierarchy (L1 / L2 / L3)
 *  3. Structured blocks — bullets, numbered lists, tables
 *  4. Premium table formatting
 *  5. Clean KPI presentation
 *  6. Bullet discipline — max 5, action verbs
 *  7. Executive quote styling
 *  8. Consistent spacing system
 *  9. Header → Context → Content → Metrics flow
 * 10. Tight, confident language
 * 11. Consistency across all 10 pages
 */
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle, WidthType,
  ShadingType, TableLayoutType, Header, Footer, PageNumber,
  convertInchesToTwip, ColumnBreak, SectionType,
} from "docx";
import { writeFileSync } from "fs";

// ── Brand palette ─────────────────────────────────────────────────────────────
const C = {
  blue:   "0F62FE",
  navy:   "001141",
  teal:   "007D79",
  purple: "6929C4",
  azure:  "0043CE",
  green:  "198038",
  red:    "DA1E28",
  white:  "FFFFFF",
  g10:    "F4F4F4",
  g20:    "E0E0E0",
  g50:    "8D8D8D",
  g70:    "525252",
  g100:   "161616",
  lb1:    "EBF2FF",
  lb2:    "D0E2FF",
};

const FONT  = "Calibri";
const hp    = pt => Math.round(pt * 2);
const sp    = pt => Math.round(pt * 20);
const inch  = i  => convertInchesToTwip(i);

// Column widths
const W1 = 9360;
const W2 = Math.round((W1 - 720) / 2);   // 4320
const W3 = Math.round((W1 - 720) / 3);   // 2880

// ── Shading — always CLEAR ────────────────────────────────────────────────────
const sh = fill => ({ type: ShadingType.CLEAR, fill });

// ── Borders ───────────────────────────────────────────────────────────────────
const BNone = { style: BorderStyle.NONE,   size: 0,  color: "auto" };
const BThin = { style: BorderStyle.SINGLE, size: 4,  color: C.g20  };
const BBlue = { style: BorderStyle.SINGLE, size: 12, color: C.blue };
const NO_B  = { top: BNone, bottom: BNone, left: BNone, right: BNone, insideH: BNone, insideV: BNone };
const CELL_B = { top: BThin, bottom: BThin, left: BThin, right: BThin };

// ── Spacing constants (sp) ────────────────────────────────────────────────────
// Section → Section : 16 pt   (before L1 heading)
// Header  → Content : 6 pt    (after L1/L2 heading)
// L2 before: 10 pt
// Bullet  → Bullet  : 2 pt
// Body paragraph after: 4 pt

// ── Text run helper ───────────────────────────────────────────────────────────
const R = (text, opts = {}) => new TextRun({
  text,
  font:    FONT,
  size:    hp(opts.sz    ?? 10.5),
  bold:    opts.bold     ?? false,
  italics: opts.it       ?? false,
  color:   opts.color    ?? C.g100,
});

// ── Paragraph helper ──────────────────────────────────────────────────────────
const P = (runs, opts = {}) => new Paragraph({
  children:  Array.isArray(runs) ? runs : [runs],
  spacing:   { before: sp(opts.before ?? 0), after: sp(opts.after ?? 4) },
  indent:    (opts.lft || opts.rgt) ? { left: sp(opts.lft ?? 0), right: sp(opts.rgt ?? 0) } : undefined,
  alignment: opts.align,
  border:    opts.border,
  shading:   opts.bg ? sh(opts.bg) : undefined,
});

const spc = (pt = 4) => new Paragraph({ children: [new TextRun({ text: "", font: FONT, size: hp(9) })], spacing: { before: 0, after: sp(pt) } });

// ── Body paragraph — 2–3 lines max ───────────────────────────────────────────
const body = (text, opts = {}) =>
  P([R(text, { color: C.g70, sz: opts.sz ?? 10.5, it: opts.it })],
    { after: opts.after ?? 4, before: opts.before ?? 0, align: opts.align });

// ── Bullet — action-verb discipline, max 5 per section ───────────────────────
const bull = (text, opts = {}) => new Paragraph({
  children: [R(text, { color: opts.color ?? C.g70, sz: opts.sz ?? 10.5 })],
  bullet:   { level: 0 },
  spacing:  { before: sp(1), after: sp(2) },
  indent:   { left: sp(opts.lft ?? 0) },
});

// ── Column break ──────────────────────────────────────────────────────────────
const colBreak = () => new Paragraph({ children: [new ColumnBreak()], spacing: { before: 0, after: 0 } });

// ═══════════════════════════════════════════════════════════════════════════════
// L1 SECTION HEADING — "01  EXECUTIVE SUMMARY"
// Generous spacing before (section→section gap), medium after
// ═══════════════════════════════════════════════════════════════════════════════
const L1 = (num, title, sub = "") => [
  new Paragraph({
    children: [],
    border: { top: { style: BorderStyle.SINGLE, size: 18, color: C.blue, space: 10 } },
    spacing: { before: sp(14), after: sp(3) },
  }),
  new Paragraph({
    children: [
      R(num + "  ", { sz: 9, bold: true, color: C.blue }),
      R(title.toUpperCase(), { sz: 15, bold: true, color: C.navy }),
    ],
    spacing: { before: 0, after: sub ? sp(3) : sp(8) },
  }),
  ...(sub ? [body(sub, { it: true, sz: 10, after: 8, color: C.g50 })] : []),
];

// L2 Subsection header — medium spacing
const L2 = (text, color = C.navy, before = 10, after = 4) =>
  P([R(text, { sz: 12, bold: true, color })], { before, after });

// L3 content label — tight spacing
const L3 = (text, color = C.blue, before = 6, after = 2) =>
  P([R(text, { sz: 10.5, bold: true, color })], { before, after });

// ═══════════════════════════════════════════════════════════════════════════════
// PULL QUOTE — executive voice, italicised, separated
// ═══════════════════════════════════════════════════════════════════════════════
const quote = (text, attr = "") => [
  spc(4),
  new Paragraph({
    children: [R("\u201C" + text + "\u201D", { sz: 11, it: true, color: C.navy })],
    alignment: AlignmentType.LEFT,
    spacing: { before: sp(3), after: sp(2) },
    indent: { left: inch(0.35), right: inch(0.25) },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: C.blue, space: 10 } },
  }),
  ...(attr ? [P([R("\u2014 " + attr, { sz: 9, bold: true, color: C.blue })],
    { align: AlignmentType.RIGHT, rgt: 6, after: 6, before: 0 })] : [spc(5)]),
];

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE CELLS
// ═══════════════════════════════════════════════════════════════════════════════

// Header cell — IBM Blue top rule, lb2 fill, navy bold
const HC = (text, w, opts = {}) => new TableCell({
  children: [new Paragraph({
    children: [R(text, { sz: opts.sz ?? 10, bold: true, color: opts.color ?? C.navy })],
    spacing: { before: sp(4), after: sp(4) },
    alignment: opts.align ?? AlignmentType.LEFT,
  })],
  shading:  sh(opts.fill ?? C.lb2),
  margins:  { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
  width:    w ? { size: Math.round(w), type: WidthType.DXA } : undefined,
  borders:  { top: BBlue, bottom: BThin, left: BThin, right: BThin },
  verticalAlign: "center",
});

// Data cell
const DC = (text, w, opts = {}) => new TableCell({
  children: [new Paragraph({
    children: [R(text, { sz: opts.sz ?? 10, bold: opts.bold ?? false, color: opts.color ?? C.g100, it: opts.it })],
    spacing: { before: sp(3), after: sp(3) },
    alignment: opts.align ?? AlignmentType.LEFT,
  })],
  shading:  sh(opts.fill ?? C.white),
  margins:  { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
  width:    w ? { size: Math.round(w), type: WidthType.DXA } : undefined,
  borders:  CELL_B,
  verticalAlign: "center",
});

// Value cell — IBM Blue bold text, light blue fill
const VC = (text, w, opts = {}) =>
  DC(text, w, { bold: true, color: C.blue, fill: C.lb1, ...opts });

const alt = i => (i % 2 === 1 ? C.g10 : C.white);

// Table wrapper
const T = (rows, w) => new Table({
  width: { size: Math.round(w), type: WidthType.DXA },
  layout: TableLayoutType.FIXED,
  borders: NO_B,
  rows,
});

// ── KPI card strip ────────────────────────────────────────────────────────────
const KPI = (value, label, w, col = C.blue) => new TableCell({
  children: [
    new Paragraph({ children: [R(value, { sz: 26, bold: true, color: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(8), after: sp(3) } }),
    new Paragraph({ children: [R(label, { sz: 9.5, bold: true, color: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(8) } }),
  ],
  shading: sh(C.lb1),
  width: { size: Math.round(w), type: WidthType.DXA },
  borders: { top: { style: BorderStyle.SINGLE, size: 12, color: col }, bottom: BThin, left: BThin, right: BThin },
  margins: { top: sp(3), bottom: sp(3), left: sp(6), right: sp(6) },
  verticalAlign: "center",
});

// ── Callout bar ───────────────────────────────────────────────────────────────
const callout = (text, fill = C.lb1, color = C.navy) => P(
  [R(text, { sz: 10, bold: true, color })],
  { after: 5, before: 5, lft: 10, rgt: 10, bg: fill },
);

// ── Horizontal bar chart row ──────────────────────────────────────────────────
const BAR = (label, pct, val, { lw, bw, vw, col = C.blue } = {}) => {
  const f = Math.round(bw * Math.min(pct, 100) / 100);
  const r = bw - f;
  return new TableRow({ children: [
    new TableCell({ children: [P([R(label, { sz: 9, color: C.g70 })], { after: 0 })], width: { size: lw, type: WidthType.DXA }, shading: sh(C.white), borders: NO_B, margins: { top: sp(3), bottom: sp(3), right: sp(4) }, verticalAlign: "center" }),
    new TableCell({ children: [spc(0)], width: { size: f, type: WidthType.DXA }, shading: sh(col), borders: NO_B }),
    new TableCell({ children: [spc(0)], width: { size: r, type: WidthType.DXA }, shading: sh(C.g20), borders: NO_B }),
    new TableCell({ children: [P([R(val, { sz: 9, bold: true, color: col })], { after: 0, align: AlignmentType.RIGHT })], width: { size: vw, type: WidthType.DXA }, shading: sh(C.white), borders: NO_B, margins: { top: sp(3), bottom: sp(3), left: sp(4) }, verticalAlign: "center" }),
  ]});
};
const B1 = (l, p, v, c) => BAR(l, p, v, { lw: 1900, bw: 2000, vw: 420, col: c ?? C.blue });
const B3 = (l, p, v, c) => BAR(l, p, v, { lw: 1100, bw: 1530, vw: 250, col: c ?? C.blue });

// ── Pipeline step cell ────────────────────────────────────────────────────────
const PIPE = (n, title, lines, col = C.blue) => new TableCell({
  children: [
    new Paragraph({ children: [R(n, { sz: 7.5, bold: true, color: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(6), after: sp(1) } }),
    new Paragraph({ children: [R(title, { sz: 10, bold: true, color: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(3) } }),
    ...lines.map(l => new Paragraph({ children: [R(l, { sz: 9, color: C.g70 })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(2) } })),
    spc(5),
  ],
  shading: sh(C.white),
  width: { size: Math.round(W1 / 5), type: WidthType.DXA },
  margins: { top: sp(3), bottom: sp(3), left: sp(5), right: sp(5) },
  borders: { top: { style: BorderStyle.SINGLE, size: 16, color: col }, bottom: BThin, left: BThin, right: BThin },
});

// ── Header / Footer ───────────────────────────────────────────────────────────
const pgMargin = { top: inch(0.85), bottom: inch(0.75), left: inch(1.0), right: inch(1.0) };

const HDR = () => new Header({ children: [
  new Paragraph({
    children: [
      R("IBM \u00D7 HORIZON BCBS  —  APPLICATION DELIVERY, QUALITY & OPERATIONS TRANSFORMATION", { sz: 7.5, bold: true, color: C.g50 }),
      R("     CONFIDENTIAL", { sz: 7.5, bold: true, color: C.blue }),
    ],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.blue, space: 6 } },
    spacing: { after: 0 },
  }),
]});

const FTR = () => new Footer({ children: [
  new Paragraph({
    children: [
      R("CareOps360  \u00B7  IBM AIOps  \u00B7  IBM Consulting Advantage  \u00B7  April 2026", { sz: 7.5, bold: true, color: C.blue }),
      R("   —  Page ", { sz: 7.5, color: C.g50 }),
      new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: hp(7.5), color: C.g50 }),
    ],
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.g20, space: 4 } },
    spacing: { before: sp(3), after: 0 },
  }),
]});

const hf = () => ({ headers: { default: HDR() }, footers: { default: FTR() } });

// ════════════════════════════════════════════════════════════════════════════════
//  DOCUMENT
// ════════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  creator:     "IBM Consulting — Healthcare & Payer Delivery",
  title:       "IBM × Horizon BCBS — AMS Executive Summary",
  description: "Boardroom-ready Executive Summary — April 2026",
  sections: [

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 1  COVER PAGE
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: [
        // Top navy bar
        new Paragraph({
          children: [R("IBM CONSULTING   |   HEALTHCARE & PAYER DELIVERY   |   AMS PRACTICE", { sz: 8.5, bold: true, color: C.white })],
          shading: sh(C.navy), alignment: AlignmentType.CENTER,
          spacing: { before: sp(13), after: sp(13) },
        }),
        new Paragraph({ children: [], shading: sh(C.blue), spacing: { before: 0, after: sp(2) } }),

        // White space
        spc(26),

        // Metadata line
        new Paragraph({
          children: [R("CONFIDENTIAL   |   APRIL 2026   |   REF: IBM-HZN-AMS-RFP-2026", { sz: 8.5, bold: true, color: C.blue })],
          alignment: AlignmentType.RIGHT, spacing: { before: 0, after: sp(10) },
          indent: { right: inch(1.1) },
        }),

        // Eyebrow
        new Paragraph({
          children: [R("IBM  ×  HORIZON BLUE CROSS BLUE SHIELD OF NEW JERSEY", { sz: 11, bold: true, color: C.blue })],
          spacing: { before: 0, after: sp(6) }, indent: { left: inch(1.1) },
        }),

        // Title block
        new Paragraph({ children: [R("Application Delivery,",     { sz: 38, bold: true, color: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("Quality Engineering &",     { sz: 38, bold: true, color: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("Operations Transformation", { sz: 38, bold: true, color: C.blue })], spacing: { before: 0, after: sp(6) }, indent: { left: inch(1.1) } }),

        // Tagline
        new Paragraph({
          children: [R("AI-First   \u00B7   Outcome-Based   \u00B7   Zero-Touch Operations   \u00B7   Member-Centred", { sz: 12, it: true, color: C.g50 })],
          spacing: { before: 0, after: sp(20) }, indent: { left: inch(1.1) },
        }),

        // KPI strip
        T([new TableRow({ children: [
          KPI("40–50%",  "Cost Takeout vs. Run-Rate",          W1/4, C.blue),
          KPI("25–40%",  "Faster Time to Market",              W1/4, C.azure),
          KPI(">74%",    "Incidents Auto-Resolved",            W1/4, C.teal),
          KPI("80%+",    "Test Automation Coverage",           W1/4, C.purple),
        ]})], W1),

        // Cover quote
        spc(16),
        new Paragraph({
          children: [R("\u201CA member who cannot access their benefits, a provider waiting days for an authorisation, a payer carrying the cost of an avoidable error — these are the problems IBM is here to solve.\u201D", { sz: 11, it: true, color: C.navy })],
          alignment: AlignmentType.CENTER, spacing: { before: sp(4), after: sp(3) },
          indent: { left: inch(1.1), right: inch(1.1) },
        }),
        new Paragraph({
          children: [R("\u2014  IBM Consulting, Healthcare & Payer Delivery", { sz: 9, bold: true, color: C.blue })],
          alignment: AlignmentType.RIGHT, spacing: { before: 0, after: sp(16) },
          indent: { right: inch(1.1) },
        }),

        // Footer strip
        new Paragraph({
          children: [],
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.g20 } },
          spacing: { before: sp(5), after: 0 }, indent: { left: inch(1.1), right: inch(1.1) },
        }),
        new Paragraph({
          children: [
            R("Prepared for: ", { sz: 8.5, bold: true, color: C.navy }),
            R("Horizon Healthcare Services, Inc.     ", { sz: 8.5, color: C.g70 }),
            R("Submitted by: ", { sz: 8.5, bold: true, color: C.navy }),
            R("IBM Consulting — Healthcare & Payer     ", { sz: 8.5, color: C.g70 }),
            R("April 2026", { sz: 8.5, color: C.g70 }),
          ],
          spacing: { before: sp(5), after: sp(5) }, indent: { left: inch(1.1) },
        }),
        new Paragraph({
          children: [R("\u00A9 2026 IBM Corporation. All rights reserved.  Powered by CareOps360  \u00B7  IBM AIOps  \u00B7  IBM Consulting Advantage  \u00B7  HIPAA Compliant", { sz: 7.5, color: C.white })],
          shading: sh(C.navy), alignment: AlignmentType.CENTER,
          spacing: { before: sp(5), after: sp(5) },
        }),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 2  EXECUTIVE SUMMARY  — 1 column, simple, C-suite facing
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // L1 heading
        ...L1("01", "Executive Summary"),

        // Opening statement — 2 lines, bold, direct
        new Paragraph({
          children: [R("IBM proposes a transformation partnership — not a technology project. The goal is an AI-first operating model that makes Horizon BCBS faster, smarter, and more resilient than today.", { sz: 12, bold: true, color: C.navy })],
          spacing: { before: 0, after: sp(8) },
          border: { left: { style: BorderStyle.SINGLE, size: 20, color: C.blue, space: 12 } },
          indent: { left: sp(14) },
        }),

        // ── The Challenge ──────────────────────────────────────────────────────
        L2("The Challenge"),
        bull("Reactive, siloed delivery cannot absorb the pace of change Horizon requires."),
        bull("Test automation sits at approximately 25%, leaving most releases exposure to costly production defects."),
        bull("Operations teams spend the majority of their capacity firefighting incidents instead of building capability."),
        bull("Member and provider experience is directly degraded by every system delay, failed integration, and manual workaround."),
        spc(4),

        // ── IBM's Response ─────────────────────────────────────────────────────
        L2("IBM's Response"),
        bull("Replace reactive support with a predictive, self-healing, AI-first operating model."),
        bull("Embed quality at every commit — not as a final checkpoint, but as a continuous signal throughout the delivery lifecycle."),
        bull("Automate the majority of P3/P4 incident resolution so providers and members never experience the impact."),
        bull("Deliver real-time business outcome visibility through CareOps360 from Day 1."),
        spc(4),

        // ── Five Strategic Commitments ─────────────────────────────────────────
        L2("Five Strategic Commitments"),
        ...[ ["1.  AI-First Operating Model",     "AI embedded across every layer of application delivery and operations."],
             ["2.  Technology-Driven Cost Takeout","Savings through automation — not headcount reductions."],
             ["3.  Outcome-Based Accountability",  "SLAs tied to measurable business outcomes. IBM's performance is Horizon's performance."],
             ["4.  Zero-Disruption Transition",    "Phased, risk-controlled migration with no impact to live operations."],
             ["5.  Continuous Innovation Engine",  "An IBM–Horizon Innovation Council driving value beyond steady state, every quarter."],
        ].flatMap(([label, detail]) => [
          new Paragraph({
            children: [
              R(label + "   ", { sz: 10.5, bold: true, color: C.blue }),
              R(detail, { sz: 10.5, color: C.g70 }),
            ],
            spacing: { before: sp(3), after: sp(3) },
          }),
        ]),

        spc(8),

        // ── KPI summary strip ──────────────────────────────────────────────────
        L2("Key Performance Commitments"),
        T([new TableRow({ children: [
          KPI("40–50%",   "Cost Takeout\nvs. Current Run-Rate",          W1/4, C.blue),
          KPI("25–40%",   "Faster Time to\nMarket",                     W1/4, C.azure),
          KPI(">74%",     "P3/P4 Incidents\nAuto-Resolved",             W1/4, C.teal),
          KPI("80%+",     "Test Automation\nCoverage in 12 Months",     W1/4, C.purple),
        ]})], W1),

        spc(8),

        // ── IBM at Scale ───────────────────────────────────────────────────────
        L2("IBM's Scale Behind This Proposal"),
        T([
          new TableRow({ children: [
            HC("Credential",                    W1*0.40),
            HC("IBM's Depth",                   W1*0.30),
            HC("Relevance to Horizon",          W1*0.30),
          ]}),
          ...[ ["AI & Data Practitioners",       "20,000+ globally",        "Full AI team embedded from Day 1"],
               ["Cloud & Architecture Experts",  "81,000+ IBM Consulting",  "Hybrid payer architecture support"],
               ["AI/Analytics Engagements",      "40,000+ delivered",       "Proven patterns applied immediately"],
               ["Top US Health Payers Served",   "9 of 10",                 "Healthcare payer DNA built in"],
          ].map(([a,b,c],i) => new TableRow({ children: [
            DC(a, W1*0.40, { bold: true, fill: alt(i) }),
            DC(b, W1*0.30, { color: C.blue, fill: alt(i) }),
            DC(c, W1*0.30, { color: C.g70,  fill: alt(i) }),
          ]})),
        ], W1),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 3  CASE FOR CHANGE   (2 columns)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, column: { space: 720, count: 2 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // LEFT
        ...L1("02", "Case for Change", "Why the status quo is unsustainable"),
        L2("Where Horizon Stands Today", C.navy, 0, 4),
        body("The current model is reactive, siloed, and labour-dependent. Every inefficiency in the technology estate is felt by a member, a provider, or a payer."),
        spc(3),
        bull("Claims adjudication is constrained by manual review and late-stage defects."),
        bull("Prior auth turnaround takes days because integrations are batch-based."),
        bull("Enrolment errors surface after submission — rework is costly and avoidable."),
        bull("Test automation at ~25% leaves most releases exposed to production failures."),
        bull("Operations teams spend the majority of capacity on recurring firefighting."),
        spc(5),
        L2("Current State Snapshot"),
        T([
          new TableRow({ children: [HC("Metric", W2*0.55), HC("Current", W2*0.24), HC("Status", W2*0.21)] }),
          ...[ ["Test Automation Coverage",    "~25%",       "Critical gap"],
               ["Mean Time to Resolve",        ">4 hours",   "Above target"],
               ["P3/P4 Auto-Resolution",       "<10%",       "Near zero"],
               ["Defect Escape to Production", "High",       "Untracked"],
               ["System Availability",         "~99.7%",     "Below target"],
          ].map(([a,b,c],i) => new TableRow({ children: [
            DC(a, W2*0.55, { bold: true, fill: alt(i) }),
            DC(b, W2*0.24, { color: C.red, fill: alt(i), align: AlignmentType.CENTER }),
            DC(c, W2*0.21, { color: C.red, fill: alt(i), sz: 9 }),
          ]})),
        ], W2),

        colBreak(),

        // RIGHT
        L2("The IBM Response", C.navy, 0, 4),
        body("IBM unifies delivery into one AI-first model spanning development, quality, and operations — accountability is end-to-end, not divided across towers."),
        spc(3),
        bull("Shifts from reactive firefighting to predictive, self-healing operations."),
        bull("Embeds quality at every commit — not as a gate at the end of the cycle."),
        bull("Accelerates delivery by 25–40% through AI-assisted engineering, not headcount."),
        bull("Provides real-time business outcome visibility from Day 1 via CareOps360."),
        bull("Commits to contractual outcome SLAs — IBM carries the performance risk."),
        spc(5),
        L2("IBM 12-Month Targets"),
        T([
          new TableRow({ children: [HC("Metric", W2*0.55), HC("Today", W2*0.20), HC("Target", W2*0.25)] }),
          ...[ ["Test Automation Coverage",    "~25%",       "80%+"],
               ["Mean Time to Resolve",        ">4 hours",   "<1.8 hrs"],
               ["P3/P4 Auto-Resolution",       "<10%",       ">74%"],
               ["Defect Escape",               "High",       "−65%"],
               ["System Availability",         "~99.7%",     "99.9%+"],
          ].map(([a,b,c],i) => new TableRow({ children: [
            DC(a, W2*0.55, { bold: true, fill: alt(i) }),
            DC(b, W2*0.20, { color: C.red,  fill: alt(i), align: AlignmentType.CENTER }),
            VC(c, W2*0.25, { align: AlignmentType.CENTER }),
          ]})),
        ], W2),
        spc(6),
        callout("All baselines are formally locked during Phase 0. IBM's targets are contractually committed at programme commencement."),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 4  IBM OPERATING MODEL   (1 column)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        ...L1("03", "The IBM Operating Model", "One unified team. Three integrated disciplines. One accountable partner."),
        body("IBM collapses siloed towers into product-aligned squads that own a business domain end-to-end — from code to production to improvement. AI runs the operating layer beneath every squad."),
        spc(6),

        // Architecture diagram
        T([
          new TableRow({ children: [new TableCell({
            children: [new Paragraph({ children: [R("BUSINESS OUTCOMES  —  Claims   \u00B7   Enrollment   \u00B7   Member Services   \u00B7   Provider Operations   \u00B7   Data Products", { sz: 10, bold: true, color: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: sp(4), after: sp(4) } })],
            shading: sh(C.lb2), columnSpan: 5, borders: { top: BBlue, bottom: BThin, left: BThin, right: BThin }, margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
          })] }),
          new TableRow({ children: [
            ["App\nDevelopment", C.blue   ],
            ["Quality\nEngineering", C.teal   ],
            ["App\nManagement", C.azure  ],
            ["Platform &\nIntegration", C.purple ],
            ["Data &\nAnalytics",  "005D5D"],
          ].map(([label, col]) => new TableCell({
            children: [new Paragraph({ children: [R(label, { sz: 10, bold: true, color: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(8), after: sp(8) } })],
            shading: sh(C.white), width: { size: Math.round(W1/5), type: WidthType.DXA },
            margins: { top: sp(3), bottom: sp(3), left: sp(4), right: sp(4) },
            borders: { top: { style: BorderStyle.SINGLE, size: 14, color: col }, bottom: BThin, left: BThin, right: BThin },
          })) }),
          new TableRow({ children: [new TableCell({
            children: [new Paragraph({ children: [R("IBM AI ENGINE  —  AIOps   \u00B7   Agentic Intelligence   \u00B7   GenAI Quality   \u00B7   IBM Consulting Advantage   \u00B7   CareOps360", { sz: 10, bold: true, color: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: sp(3), after: sp(3) } })],
            shading: sh(C.lb1), columnSpan: 5, borders: { top: BThin, bottom: BThin, left: BThin, right: BThin }, margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
          })] }),
          new TableRow({ children: [new TableCell({
            children: [new Paragraph({ children: [R("PLATFORM FOUNDATION  —  Hybrid Cloud   \u00B7   Integration Hub   \u00B7   Mainframe   \u00B7   Data Platforms   \u00B7   Security & Compliance", { sz: 9.5, color: C.g70 })], alignment: AlignmentType.CENTER, spacing: { before: sp(3), after: sp(3) } })],
            shading: sh(C.g10), columnSpan: 5, borders: { top: BThin, bottom: BThin, left: BThin, right: BThin }, margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
          })] }),
        ], W1),

        spc(8),

        // Discipline summaries + Today vs. IBM
        L2("Three Disciplines — What Each Delivers"),
        T([
          new TableRow({ children: [HC("Discipline", W1*0.22), HC("What IBM Does", W1*0.40), HC("12-Month Business Outcome", W1*0.38)] }),
          ...[ ["Application Development",  "AI-assisted engineering, risk-scored pipelines, domain-aligned squads",     "25–40% faster time to market. Deployment frequency doubled."],
               ["Quality Engineering",      "Shift-left gates, GenAI test generation, defect-prediction AI",            "Automation coverage 80%+. Defect escape −65%."],
               ["Application Management",   "Agentic triage, self-healing, runbook automation, knowledge capture",      ">74% P3/P4 auto-resolved. MTTR under 1.8 hours."],
          ].map(([a,b,c],i) => new TableRow({ children: [
            DC(a, W1*0.22, { bold: true, fill: alt(i) }),
            DC(b, W1*0.40, { color: C.g70, fill: alt(i) }),
            VC(c, W1*0.38),
          ]})),
        ], W1),

        spc(6),
        L2("Today vs. With IBM"),
        T([
          new TableRow({ children: [HC("Today", W1*0.50), HC("With IBM", W1*0.50)] }),
          ...[ ["Siloed delivery towers",         "Unified product pods by business domain"],
               ["Reactive incident firefighting",  "Predictive self-healing, agentic resolution"],
               ["End-stage testing",              "Shift-left quality gates at every commit"],
               ["Activity-based metrics",          "Real-time business outcome dashboards"],
               ["Labour arbitrage cost savings",   "Technology-driven cost takeout 40–50%"],
          ].map(([a,b],i) => new TableRow({ children: [
            DC(a, W1*0.50, { color: C.g70, fill: alt(i) }),
            VC(b, W1*0.50),
          ]})),
        ], W1),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 5  AI-FIRST APPLICATION DEVELOPMENT   (2 columns)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, column: { space: 720, count: 2 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // LEFT
        ...L1("04", "AI-First Application Development", "Build faster. Ship safer. Modernise continuously."),
        ...quote(
          "When a member's enrolment takes two weeks because a downstream system is slow, that is a trust problem. IBM engineers the fix — not as an ambition, but as a delivery commitment.",
          "IBM — Member Experience Engineering"
        ),
        L2("How IBM Builds Faster", C.navy, 0, 4),
        L3("AI-Assisted Development"),
        body("AI coding assistants generate code, flag risk patterns, and suggest optimisations in real time. Developer throughput increases 25–35% without adding headcount."),
        L3("Automated Release Gates"),
        body("Every change passes AI-scored gates: security, performance, coverage, and risk profile. Low-risk changes deploy without waiting for a human approval cycle."),
        L3("Domain-Aligned Squads"),
        body("Teams align to Horizon's business domains — Claims, Enrolment, Member, Provider. Context stays with the squad; handoff overhead disappears."),
        spc(4),
        T([
          new TableRow({ children: [HC("Metric", W2*0.62), HC("12-Month Target", W2*0.38)] }),
          ...[ ["Time to market",          "25–40% faster"],
               ["Deployment frequency",    "2× current rate"],
               ["Change failure rate",     "−60%"],
               ["Recovery time (MTTR)",   "<15 minutes"],
          ].map(([a,b],i) => new TableRow({ children: [DC(a, W2*0.62, { bold: true, fill: alt(i) }), VC(b, W2*0.38, { align: AlignmentType.CENTER })] })),
        ], W2),

        colBreak(),

        // RIGHT
        L2("Efficiency Gains by Capability", C.navy, 0, 4),
        P([R("Improvement vs. traditional delivery model:", { sz: 9, it: true, color: C.g50 })], { after: 4 }),
        T([
          B1("AI-assisted coding",          80, "+30% capacity",    C.blue),
          B1("Automated QE generation",     75, "+25% QE speed",   C.teal),
          B1("Risk-scored deployments",     70, "−60% failures",   C.azure),
          B1("Domain squad alignment",      65, "−40% handoffs",   C.purple),
          B1("Modernisation-in-stride",     60, "Debt −30%/yr",    "005D5D"),
        ], W2),
        spc(6),

        L2("Modernisation Approach", C.navy, 4, 4),
        body("Modernisation is embedded into every sprint — a refactor, an API wrap, a library upgrade — so the estate improves continuously without a disruptive parallel programme."),
        spc(3),
        T([
          new TableRow({ children: [HC("Action", W2*0.33), HC("Method", W2*0.43), HC("Wave", W2*0.24)] }),
          ...[ ["API-wrap legacy",     "Expose as managed service",    "Wave 1"],
               ["Cloud migration",     "Lift, validate, optimise",     "Wave 2"],
               ["Selective refactor",  "Rebuild highest-risk apps",    "Wave 3"],
               ["Retire & replace",    "SaaS substitution",            "Ongoing"],
          ].map(([a,b,c],i) => new TableRow({ children: [DC(a, W2*0.33, { bold: true, fill: alt(i) }), DC(b, W2*0.43, { color: C.g70, fill: alt(i) }), VC(c, W2*0.24, { align: AlignmentType.CENTER })] })),
        ], W2),
        spc(5),
        callout("AI-assisted development amplifies engineers — every Horizon developer delivers twice the business value with the same headcount."),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 6  QUALITY ENGINEERING   (3 columns)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, column: { space: 360, count: 3 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // COLUMN 1
        ...L1("05", "Quality Engineering"),
        body("Quality is a continuous signal — not a final checkpoint. IBM builds it into the rhythm of every sprint."),
        spc(4),
        L3("Commit-Level AI Review"),
        body("AI reviews every push — flagging security risk, test gaps, and anti-patterns before a human sees the pull request. Zero delay at the first gate.", { sz: 9.5, after: 4 }),
        L3("GenAI Test Generation"),
        body("AI synthesises regression, integration, and edge-case tests from the code change itself — at commit speed. Coverage grows automatically.", { sz: 9.5, after: 4 }),
        spc(3),
        ...quote(
          "Every defect that reaches production is a promise broken — a member's benefit delayed, a provider's claim wrong. IBM's quality engine ensures they never leave the building.",
          "IBM Quality Engineering"
        ),

        colBreak(),

        // COLUMN 2
        L3("Defect Prediction AI"),
        body("Models trained on Horizon's own incident history identify high-risk code paths before UAT. Fewer defects in staging; far fewer in production.", { sz: 9.5, after: 4 }),
        L3("Production Feedback Loop"),
        body("Every production defect teaches the quality engine. Each release cycle the test suite tightens automatically — an ever-improving safety net.", { sz: 9.5, after: 4 }),
        spc(4),
        L2("Automation Coverage Journey", C.navy, 4, 4),
        P([R("Monthly target milestones:", { sz: 8.5, it: true, color: C.g50 })], { after: 4 }),
        T([
          B3("Baseline (M0)",    25, "~25%",  C.g50),
          B3("Ignite   (M3)",    45, "45%",   "0072C3"),
          B3("Scale    (M6)",    62, "62%",   C.azure),
          B3("Optimise (M9)",    75, "75%",   C.blue),
          B3("Target   (M12)",   82, "82%+",  C.navy),
        ], W3),

        colBreak(),

        // COLUMN 3
        L2("QE Metrics — Today vs. Target", C.navy, 0, 4),
        T([
          new TableRow({ children: [HC("Metric", W3*0.44), HC("Now", W3*0.18), HC("Target", W3*0.38)] }),
          ...[ ["Automation",     "~25%",      "80%+"],
               ["Defect escape",  "High",      "−65%"],
               ["Regression",     "Multi-day", "−70%"],
               ["Mean detect",    ">2 hrs",    "<15 min"],
          ].map(([a,b,c],i) => new TableRow({ children: [
            DC(a, W3*0.44, { bold: true, fill: alt(i), sz: 9 }),
            DC(b, W3*0.18, { color: C.red, fill: alt(i), sz: 9, align: AlignmentType.CENTER }),
            VC(c, W3*0.38, { sz: 9, align: AlignmentType.CENTER }),
          ]})),
        ], W3),
        spc(5),
        L2("Release Gate Model", C.navy, 4, 4),
        T([
          new TableRow({ children: [HC("Gate", W3*0.28), HC("What Happens", W3*0.72)] }),
          ...[ ["Commit",   "AI review + coverage check. No human."],
               ["Build",    "Unit pass rate >98%. No human."],
               ["Staging",  "Integration + performance. No human."],
               ["Release",  "AI risk score. Tier 1 sign-off only."],
          ].map(([a,b],i) => new TableRow({ children: [
            DC(a, W3*0.28, { bold: true, fill: alt(i), sz: 9 }),
            DC(b, W3*0.72, { color: C.g70, fill: alt(i), sz: 9 }),
          ]})),
        ], W3),
        spc(5),
        callout("Most P3/P4 incidents are resolved before\na human is notified.", C.lb1, C.navy),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 7  AIOPS & AGENTIC OPERATIONS   (1 column)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        ...L1("06", "AIOps & Agentic Operations", "From reactive incident management to autonomous, self-healing operations"),
        ...quote(
          "A provider should never call a helpdesk because a claims system is slow. IBM's AI operations model ensures those moments stop happening — automatically.",
          "IBM AIOps — Zero-Touch Operations"
        ),

        L2("Zero-Touch Operations Pipeline"),
        body("Five AI agents work in sequence. The result: most incidents resolved before any human is notified."),
        spc(4),
        T([new TableRow({ children: [
          PIPE("STEP 1", "Detect",   ["Correlate 140+ signal sources", "Reduce alert noise >60%"],      C.blue),
          PIPE("STEP 2", "Triage",   ["AI-based routing", "Impact scoring", "Auto-prioritise"],          "0072C3"),
          PIPE("STEP 3", "Diagnose", ["Root cause in minutes", "Runbook guidance"],                      C.azure),
          PIPE("STEP 4", "Resolve",  ["Self-heal P3/P4", "Auto-remediate", "Zero human touch"],          C.teal),
          PIPE("STEP 5", "Learn",    ["Capture knowledge", "Update runbooks", "Prevent recurrence"],     "005D5D"),
        ]})], W1),

        spc(8),

        L2("AI Agents — Function & Value"),
        T([
          new TableRow({ children: [HC("AI Agent", W1*0.25), HC("Function", W1*0.44), HC("Est. Annual Value", W1*0.31)] }),
          ...[ ["Detection & Correlation", "Alert noise reduction — >60% of noise eliminated at source",     "$2.5M – $3.5M"],
               ["Triage Agent",            "Instant impact-based routing, no human dispatch delay",          "$1.3M – $1.5M"],
               ["Root Cause Agent",        "Diagnosis in minutes using pattern matching + runbooks",          "$2.0M – $3.0M"],
               ["Auto-Remediation",        "Resolves P3/P4 without requiring human action",                  "$1.5M – $2.0M"],
               ["Knowledge Agent",         "Captures learning from every incident, improves every cycle",    "$1.0M – $1.3M"],
               ["Deployment AI",           "Scores risk of every release, blocks high-risk deployments",     "$0.8M – $1.2M"],
          ].map(([a,b,c],i) => new TableRow({ children: [
            DC(a, W1*0.25, { bold: true, fill: alt(i) }),
            DC(b, W1*0.44, { color: C.g70, fill: alt(i) }),
            VC(c, W1*0.31, { align: AlignmentType.CENTER }),
          ]})),
        ], W1),

        spc(6),
        L2("Before vs. After — Operations KPIs"),
        T([
          new TableRow({ children: [HC("Metric", W1*0.35), HC("Today", W1*0.25), HC("With IBM AIOps", W1*0.40)] }),
          ...[ ["Mean Time to Resolve",    ">4 hours",    "< 1.8 hours"],
               ["P3/P4 Auto-Resolution",  "< 10%",       "> 74%"],
               ["Alert Noise",            "Unfiltered",  "> 60% reduced"],
               ["System Availability",    "~99.7%",      "99.9%+"],
               ["Recurring Incidents",    "Unmanaged",   "−50% demand"],
          ].map(([a,b,c],i) => new TableRow({ children: [
            DC(a, W1*0.35, { bold: true, fill: alt(i) }),
            DC(b, W1*0.25, { color: C.red, fill: alt(i), align: AlignmentType.CENTER }),
            VC(c, W1*0.40, { align: AlignmentType.CENTER }),
          ]})),
        ], W1),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 8  BUSINESS OUTCOMES & ROI   (2 columns)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, column: { space: 720, count: 2 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // LEFT
        ...L1("07", "Business Outcomes & Value", "Every initiative connects to a measurable business result"),
        L2("Domain KPIs", C.navy, 0, 4),
        T([
          new TableRow({ children: [HC("Business Domain", W2*0.37), HC("Key Metric", W2*0.40), HC("Target", W2*0.23)] }),
          ...[ ["Claims",          "Adjudication cycle time",   "−30%"],
               ["Enrollment",      "Time-to-activation",        "−40%"],
               ["Member Services", "First-contact resolution",  "+25%"],
               ["Provider Ops",    "Prior auth turnaround",     "−35%"],
               ["Data & Reporting","Report delivery latency",   "−50%"],
               ["IT Operations",   "P3/P4 auto-resolution",    ">74%"],
          ].map(([a,b,c],i) => new TableRow({ children: [
            DC(a, W2*0.37, { bold: true, fill: alt(i) }),
            DC(b, W2*0.40, { color: C.g70, fill: alt(i) }),
            VC(c, W2*0.23, { align: AlignmentType.CENTER }),
          ]})),
        ], W2),
        spc(5),
        L2("Cumulative Cost Takeout", C.navy, 4, 4),
        P([R("Directional — baselines locked in Phase 0:", { sz: 9, it: true, color: C.g50 })], { after: 4 }),
        T([
          B1("Month 3   — Ignite",     12,  "$1–$2M",    "0072C3"),
          B1("Month 6   — Scale",      30,  "$3–$5M",    C.azure),
          B1("Month 12 — Optimise",   60,  "$6–$10M",   C.blue),
          B1("Month 24 — Transform",  100, "$12–$18M+",  C.navy),
        ], W2),

        colBreak(),

        // RIGHT
        L2("Annual Value by Initiative", C.navy, 0, 4),
        P([R("Estimated run-rate contribution at steady state:", { sz: 9, it: true, color: C.g50 })], { after: 4 }),
        T([
          B1("AIOps & Self-Healing Ops",     85, "$3.5–$6.5M",  C.blue),
          B1("GenAI Quality Engine",         72, "$2.5–$4.0M",  C.teal),
          B1("Zero-Touch Delivery Pipeline", 60, "$2.0–$3.0M",  C.azure),
          B1("Platform Modernisation",       48, "$1.5–$2.5M",  C.purple),
          B1("Demand & Ticket Reduction",    55, "$1.0–$2.0M",  "005D5D"),
        ], W2),
        spc(6),

        L2("Governance Cadence", C.navy, 4, 4),
        T([
          new TableRow({ children: [HC("Forum", W2*0.30), HC("Focus", W2*0.48), HC("Cadence", W2*0.22)] }),
          ...[ ["Operational",  "SLA, MTTR, pipeline velocity — live in CareOps360",   "Weekly"],
               ["Executive",   "Cost takeout, coverage, domain KPI movement",           "Monthly"],
               ["Board / ELT", "Total value realised, innovation roadmap",              "Quarterly"],
          ].map(([a,b,c],i) => new TableRow({ children: [
            DC(a, W2*0.30, { bold: true, fill: alt(i) }),
            DC(b, W2*0.48, { color: C.g70, fill: alt(i), sz: 9.5 }),
            VC(c, W2*0.22, { align: AlignmentType.CENTER }),
          ]})),
        ], W2),
        spc(5),
        callout("CareOps360 makes every metric above visible in real time from Day 1 — no manual reporting, no quarterly decks."),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 9  PHASED TRANSFORMATION ROADMAP   (1 column)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        ...L1("08", "Phased Transformation Roadmap", "Risk-controlled   \u00B7   Compounding value   \u00B7   Contractual SLAs   \u00B7   Zero operational disruption"),
        ...quote(
          "Every day a claim processes faster or an outage resolves before it is noticed — that is the difference IBM makes. It starts in Week 1.",
          "IBM Delivery Governance"
        ),

        L2("Phase-by-Phase Delivery"),
        T([
          new TableRow({ children: [HC("Phase", W1*0.14), HC("Timeframe", W1*0.10), HC("Deliverables", W1*0.46), HC("Value Signal", W1*0.30)] }),
          ...[ ["Phase 0\nFoundation",  "0–8 wks",
                "Telemetry onboarding   \u00B7   Baseline lock   \u00B7   AI environment setup   \u00B7   Innovation council constituted",
                "CareOps360 live   \u00B7   Baselines agreed   \u00B7   Zero BAU disruption"],
               ["Phase 1\nIgnite",      "Mo 1–3",
                "AIOps live   \u00B7   P3/P4 self-heal pilots   \u00B7   GenAI QE framework   \u00B7   Quick-win automations",
                "MTTR −20%   \u00B7   First automation ROI   \u00B7   QE coverage 45%"],
               ["Phase 2\nScale",       "Mo 3–6",
                "Agentic triage at scale   \u00B7   Integration Hub Wave 1   \u00B7   QE 60%   \u00B7   AI dev across all domain pods",
                "Auto-resolve >50%   \u00B7   Defect escape −40%   \u00B7   $3–5M cumulative"],
               ["Phase 3\nOptimise",    "Mo 6–12",
                "Autonomous ops   \u00B7   QE 80%+   \u00B7   Modernisation sprints   \u00B7   Full outcome governance live",
                "Cost takeout $6–10M   \u00B7   MTTR <1.8 hrs   \u00B7   99.9%+ availability"],
               ["Phase 4\nTransform",   "Yr 1–2",
                "Full autonomous estate   \u00B7   Mainframe rehost/refactor   \u00B7   Enterprise observability   \u00B7   Co-invest innovation pipeline",
                "Cost takeout 40–50%   \u00B7   Total value $12–18M+"],
          ].map(([ph,ti,de,va],i) => new TableRow({ children: [
            DC(ph, W1*0.14, { bold: true, color: C.navy, fill: alt(i) }),
            DC(ti, W1*0.10, { color: C.g70,              fill: alt(i), sz: 9, align: AlignmentType.CENTER }),
            DC(de, W1*0.46, {                             fill: alt(i), sz: 9.5 }),
            VC(va, W1*0.30, { sz: 9 }),
          ]})),
        ], W1),

        spc(8),
        L2("KPI Framework — Continuous Governance"),
        T([
          new TableRow({ children: [HC("Value Area", W1*0.20), HC("KPIs Tracked in CareOps360", W1*0.42), HC("Source", W1*0.22), HC("Cadence", W1*0.16)] }),
          ...[ ["Operational",    "MTTR, availability, auto-resolution %, incident volume",         "ITSM + AIOps",   "Weekly"],
               ["Cost",          "Automation ROI, demand reduction, delivery velocity",             "Finance + ITSM", "Monthly"],
               ["Quality",       "Coverage, defect escape, regression time, MTTD",                 "QE + CI/CD",     "Per Sprint"],
               ["Modernisation", "n−1 compliance, debt index, upgrade velocity, CVE status",       "CMDB + Security","Monthly"],
               ["Business",      "Claims cycle, enrolment time, first-call resolution, provider ASA","Domain data",  "Monthly"],
          ].map(([a,b,c,d],i) => new TableRow({ children: [
            DC(a, W1*0.20, { bold: true, fill: alt(i) }),
            DC(b, W1*0.42, { color: C.g70, fill: alt(i), sz: 9.5 }),
            DC(c, W1*0.22, { color: C.g70, fill: alt(i), sz: 9.5 }),
            VC(d, W1*0.16, { align: AlignmentType.CENTER }),
          ]})),
        ], W1),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 10  WHY IBM — CALL TO ACTION   (2 columns)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, column: { space: 720, count: 2 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // LEFT
        ...L1("09", "Why IBM — and Why Now", "The depth, the assets, and the accountability to deliver"),
        L2("What Makes IBM Different", C.navy, 0, 4),
        L3("Production-Grade Assets, Day 1"),
        body("IBM AIOps, CareOps360, and the GenAI Quality Engine are live at comparable payers today — not on a future roadmap.", { sz: 9.5, after: 4 }),
        L3("Deep Healthcare Payer DNA"),
        body("Claims, enrolment, prior auth, member services — IBM has modernised these for the nation's largest payers. The patterns are proven and portable.", { sz: 9.5, after: 4 }),
        L3("Shared Risk, Not Shared Credit"),
        body("IBM commits to outcome-based SLAs. Missed targets trigger IBM remediation plans — not rate renegotiations.", { sz: 9.5, after: 4 }),
        L3("Innovation Included"),
        body("Innovation sprints and AI accelerators are part of the base model. Transformation is not a separate future invoice.", { sz: 9.5, after: 5 }),
        spc(3),
        T([
          new TableRow({ children: [HC("IBM Credential", W2*0.62), HC("Scale", W2*0.38)] }),
          ...[ ["AI & Data Practitioners",      "20,000+ globally"],
               ["Cloud & Architecture Experts", "81,000+ IBM Consulting"],
               ["AI/Analytics Engagements",     "40,000+ delivered"],
               ["Top US Health Payers Served",  "9 of 10"],
               ["IBM Internal AI Savings",      "~$3.4B USD (Client-0)"],
          ].map(([a,b],i) => new TableRow({ children: [
            DC(a, W2*0.62, { bold: true, fill: alt(i) }),
            VC(b, W2*0.38, { align: AlignmentType.CENTER }),
          ]})),
        ], W2),

        colBreak(),

        // RIGHT
        L2("IBM vs. The Alternative", C.navy, 0, 4),
        T([
          new TableRow({ children: [HC("Area", W2*0.28), HC("Status Quo", W2*0.36), HC("IBM Partnership", W2*0.36)] }),
          ...[ ["Operating Model",  "Siloed, reactive",               "Unified, AI-first"],
               ["Development",      "Manual pipeline",                "AI-assisted, +25–40%"],
               ["Quality",          "End-stage gate",                 "Shift-left, GenAI, 80%+"],
               ["Operations",       "Firefighting",                   "Agentic self-healing"],
               ["Cost Structure",   "Labour arbitrage",               "Tech takeout 40–50%"],
               ["Reporting",        "Activity metrics",               "Real-time outcomes"],
               ["Risk",             "Vendor bears none",             "Shared SLA accountability"],
          ].map(([a,b,c],i) => new TableRow({ children: [
            DC(a, W2*0.28, { bold: true, fill: alt(i), sz: 9.5 }),
            DC(b, W2*0.36, { color: C.red, fill: alt(i), sz: 9.5 }),
            VC(c, W2*0.36, { sz: 9.5 }),
          ]})),
        ], W2),
        spc(5),

        L2("The Next Three Steps", C.navy, 5, 4),
        ...[ ["Weeks 1–2", "Executive alignment session. Horizon leadership and IBM account team agree scope, objectives, and governance model."],
             ["Weeks 2–4", "Phase 0 SOW agreed. Telemetry onboarding begins. IBM–Horizon Innovation Council constituted."],
             ["Week 4",    "Phase 0 live. IBM and Horizon operating as one team from this date forward."],
        ].flatMap(([t, d]) => [new Paragraph({
          children: [R(t + "   ", { sz: 10.5, bold: true, color: C.blue }), R(d, { sz: 9.5, color: C.g70 })],
          spacing: { before: sp(4), after: sp(3) },
        })]),

        spc(6),
        new Paragraph({
          children: [],
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: C.blue } },
          spacing: { before: sp(5), after: sp(5) },
        }),
        new Paragraph({
          children: [
            R("\u201CIBM's measure of success is not tickets closed or alerts silenced. It is the member who gets their answer faster, the provider who spends less time on administration, and the ", { sz: 10.5, it: true, color: C.g70 }),
            R("payer that directs every saved dollar back toward the care that matters.", { sz: 10.5, bold: true, it: true, color: C.navy }),
            R("\u201D", { sz: 10.5, it: true, color: C.g70 }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { before: sp(4), after: sp(4) },
        }),
        P([R("\u2014 IBM Consulting, Healthcare & Payer Delivery  |  April 2026", { sz: 9, bold: true, color: C.blue })], { align: AlignmentType.RIGHT, after: 6 }),
        new Paragraph({
          children: [],
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.g20 } },
          spacing: { before: sp(4), after: sp(3) },
        }),
        P([R("\u00A9 2026 IBM Corporation. All rights reserved.  Confidential — prepared exclusively for Horizon Healthcare Services, Inc.  Ref: IBM-HZN-AMS-RFP-2026", { sz: 7.5, color: C.g50 })], { align: AlignmentType.CENTER }),
      ],
    },
  ],
});

const buf = await Packer.toBuffer(doc);
writeFileSync("attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx", buf);
console.log("Done — " + buf.length.toLocaleString() + " bytes");
