/**
 * IBM × Horizon BCBS — AMS Executive Summary
 * Fresh professional redesign — IBM Consulting grade
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
  blue:  "0F62FE",   // IBM Blue
  navy:  "001141",   // IBM Navy
  teal:  "007D79",
  purple:"6929C4",
  azure: "0043CE",
  green: "198038",
  red:   "DA1E28",
  white: "FFFFFF",
  g10:   "F4F4F4",   // near-white alt row
  g20:   "E0E0E0",   // border
  g40:   "C6C6C6",
  g50:   "8D8D8D",   // muted
  g70:   "525252",   // body secondary
  g100:  "161616",   // body primary
  lb1:   "EBF2FF",   // lightest blue — value cells
  lb2:   "D0E2FF",   // light blue — header cells
  lb3:   "A6C8FF",   // medium blue accent
};

const FONT = "Calibri";
const hp   = pt => Math.round(pt * 2);    // points → half-points (font size)
const sp   = pt => Math.round(pt * 20);   // points → twips (spacing)
const inch = i  => convertInchesToTwip(i);

// Column widths  (6.5" content = 9360 DXA)
const W1 = 9360;                          // 1-col
const W2 = Math.round((W1 - 720) / 2);   // 2-col = 4320
const W3 = Math.round((W1 - 720) / 3);   // 3-col = 2880

// ── SHADING — always CLEAR (SOLID uses pattern color = black) ─────────────────
const sh = fill => ({ type: ShadingType.CLEAR, fill });

// ── Border tokens ─────────────────────────────────────────────────────────────
const BNone  = { style: BorderStyle.NONE,   size: 0,  color: "auto" };
const BThin  = { style: BorderStyle.SINGLE, size: 4,  color: C.g20  };
const BMed   = { style: BorderStyle.SINGLE, size: 6,  color: C.g40  };
const BBlue  = { style: BorderStyle.SINGLE, size: 12, color: C.blue };
const BNavy  = { style: BorderStyle.SINGLE, size: 12, color: C.navy };
const NO_B   = { top: BNone, bottom: BNone, left: BNone, right: BNone, insideH: BNone, insideV: BNone };
const CELL_B = { top: BThin, bottom: BThin, left: BThin, right: BThin };

// ── Core helpers ──────────────────────────────────────────────────────────────
const R = (text, opts = {}) => new TextRun({
  text,
  font:    FONT,
  size:    hp(opts.sz    ?? 10.5),
  bold:    opts.bold     ?? false,
  italics: opts.it       ?? false,
  color:   opts.color    ?? C.g100,
});

const P = (runs, opts = {}) => new Paragraph({
  children:  Array.isArray(runs) ? runs : [runs],
  spacing:   { before: sp(opts.before ?? 0), after: sp(opts.after ?? 3) },
  indent:    (opts.lft || opts.rgt) ? { left: sp(opts.lft ?? 0), right: sp(opts.rgt ?? 0) } : undefined,
  alignment: opts.align,
  border:    opts.border,
  shading:   opts.bg ? sh(opts.bg) : undefined,
});

const body = (text, opts = {}) =>
  P([R(text, { color: C.g70, sz: opts.sz ?? 10.5 })], { after: opts.after ?? 4, ...opts });

const bull = (text, color = C.g70) => new Paragraph({
  children: [R(text, { color, sz: 10 })],
  bullet: { level: 0 },
  spacing: { before: sp(1), after: sp(2) },
});

const spc = (pt = 4) => new Paragraph({ children: [new TextRun("")], spacing: { before: 0, after: sp(pt) } });

const colBreak = () => new Paragraph({ children: [new ColumnBreak()], spacing: { before: 0, after: 0 } });

// ── Section heading — IBM consulting style ────────────────────────────────────
const sHead = (num, title, sub = "") => [
  new Paragraph({
    children: [],
    border: { top: { style: BorderStyle.SINGLE, size: 16, color: C.blue, space: 8 } },
    spacing: { before: sp(10), after: sp(2) },
  }),
  new Paragraph({
    children: [
      R(num, { sz: 8.5, bold: true, color: C.blue }),
      R("  " + title.toUpperCase(), { sz: 14, bold: true, color: C.navy }),
    ],
    spacing: { before: 0, after: sub ? sp(2) : sp(5) },
  }),
  ...(sub ? [P([R(sub, { sz: 10, it: true, color: C.g50 })], { after: 5 })] : []),
];

// ── Sub-heading ───────────────────────────────────────────────────────────────
const H2 = (text, color = C.navy, before = 6, after = 3) =>
  P([R(text, { sz: 11, bold: true, color })], { before, after });

const H3 = (text, color = C.blue, before = 4, after = 2) =>
  P([R(text, { sz: 10.5, bold: true, color })], { before, after });

// ── Pull quote ────────────────────────────────────────────────────────────────
const pullQuote = (quote, attr = "") => [
  new Paragraph({
    children: [R("\u201C" + quote + "\u201D", { sz: 11, it: true, color: C.navy })],
    alignment: AlignmentType.CENTER,
    spacing: { before: sp(3), after: sp(2) },
    indent: { left: inch(0.3), right: inch(0.3) },
    border: {
      left: { style: BorderStyle.SINGLE, size: 16, color: C.blue, space: 8 },
    },
  }),
  ...(attr ? [P([R("\u2014 " + attr, { sz: 9, bold: true, color: C.blue })], { align: AlignmentType.RIGHT, rgt: 6, after: 5 })] : [spc(5)]),
];

// ── TABLE CELLS ───────────────────────────────────────────────────────────────

// Header cell
const HC = (text, w, opts = {}) => new TableCell({
  children: [new Paragraph({
    children: [R(text, { sz: opts.sz ?? 9.5, bold: true, color: opts.color ?? C.navy })],
    spacing: { before: sp(3), after: sp(3) },
    alignment: opts.align,
  })],
  shading:  sh(opts.fill ?? C.lb2),
  margins:  { top: sp(2), bottom: sp(2), left: sp(7), right: sp(7) },
  width:    w ? { size: Math.round(w), type: WidthType.DXA } : undefined,
  borders:  { top: BBlue, bottom: BThin, left: BThin, right: BThin },
  verticalAlign: "center",
});

// Data cell
const DC = (text, w, opts = {}) => new TableCell({
  children: [new Paragraph({
    children: [R(text, { sz: opts.sz ?? 9.5, bold: opts.bold ?? false, color: opts.color ?? C.g100, it: opts.it })],
    spacing: { before: sp(2), after: sp(2) },
    alignment: opts.align,
  })],
  shading:  sh(opts.fill ?? C.white),
  margins:  { top: sp(2), bottom: sp(2), left: sp(7), right: sp(7) },
  width:    w ? { size: Math.round(w), type: WidthType.DXA } : undefined,
  borders:  CELL_B,
  verticalAlign: "center",
  rowSpan:  opts.rowSpan,
  columnSpan: opts.colSpan,
});

// Value/outcome cell: IBM blue text, light fill
const VC = (text, w, opts = {}) =>
  DC(text, w, { bold: true, color: C.blue, fill: C.lb1, ...opts });

// Span cell (for multi-column header rows)
const SC = (text, w, span, fill = C.lb2, textColor = C.navy) => new TableCell({
  children: [new Paragraph({
    children: [R(text, { sz: 9.5, bold: true, color: textColor })],
    spacing: { before: sp(2), after: sp(2) },
    alignment: AlignmentType.CENTER,
  })],
  shading: sh(fill),
  margins: { top: sp(2), bottom: sp(2), left: sp(7), right: sp(7) },
  width: { size: Math.round(w), type: WidthType.DXA },
  borders: { top: BBlue, bottom: BThin, left: BThin, right: BThin },
  columnSpan: span,
  verticalAlign: "center",
});

const alt = i => (i % 2 === 1) ? C.g10 : C.white;

// Table wrapper
const T = (rows, w) => new Table({
  width: { size: Math.round(w), type: WidthType.DXA },
  layout: TableLayoutType.FIXED,
  borders: NO_B,
  rows,
});

// ── Horizontal bar chart ──────────────────────────────────────────────────────
const BAR = (label, pct, val, { lw, bw, vw, col = C.blue } = {}) => {
  const f = Math.round(bw * Math.min(pct, 100) / 100);
  const r = bw - f;
  return new TableRow({ children: [
    new TableCell({ children: [P([R(label, { sz: 9, color: C.g70 })], { after: 0 })], width: { size: lw, type: WidthType.DXA }, shading: sh(C.white), borders: NO_B, margins: { top: sp(2), bottom: sp(2), right: sp(3) }, verticalAlign: "center" }),
    new TableCell({ children: [spc(0)], width: { size: f, type: WidthType.DXA }, shading: sh(col), borders: NO_B }),
    new TableCell({ children: [spc(0)], width: { size: r, type: WidthType.DXA }, shading: sh(C.g20), borders: NO_B }),
    new TableCell({ children: [P([R(val, { sz: 9, bold: true, color: col })], { after: 0, align: AlignmentType.RIGHT })], width: { size: vw, type: WidthType.DXA }, shading: sh(C.white), borders: NO_B, margins: { top: sp(2), bottom: sp(2), left: sp(3) }, verticalAlign: "center" }),
  ]});
};
// Bar presets per column width
const B1 = (lbl, pct, val, col) => BAR(lbl, pct, val, { lw: 1700, bw: 2200, vw: 420, col: col ?? C.blue }); // for ~4320 DXA wide context
const B3 = (lbl, pct, val, col) => BAR(lbl, pct, val, { lw: 1050, bw: 1540, vw: 290, col: col ?? C.blue }); // for 2880 DXA

// ── Invisible two-column ghost table (for 1-col Word sections) ────────────────
const ghost = (items, w, m = {}) => new TableCell({
  children: items, shading: sh(C.white),
  width: { size: Math.round(w), type: WidthType.DXA }, borders: NO_B, margins: m,
});
const twoCol = (L, R, splitPct = 0.49) => {
  const lW = Math.round(W1 * splitPct);
  const gW = Math.round(W1 * 0.03);
  const rW = W1 - lW - gW;
  return T([new TableRow({ children: [ghost(L, lW, { right: sp(10) }), ghost([spc(0)], gW), ghost(R, rW, { left: sp(10) })] })], W1);
};

// ── Pipeline card ─────────────────────────────────────────────────────────────
const PIPE = (step, title, lines, col = C.blue) => new TableCell({
  children: [
    new Paragraph({ children: [R(step, { sz: 7.5, bold: true, color: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(5), after: sp(1) } }),
    new Paragraph({ children: [R(title, { sz: 10, bold: true, color: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(2) } }),
    ...lines.map(l => new Paragraph({ children: [R(l, { sz: 9, color: C.g70 })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(1) } })),
    spc(4),
  ],
  shading: sh(C.white),
  width: { size: Math.round(W1 / 5), type: WidthType.DXA },
  margins: { top: sp(3), bottom: sp(3), left: sp(5), right: sp(5) },
  borders: { top: { style: BorderStyle.SINGLE, size: 16, color: col }, bottom: BThin, left: BThin, right: BThin },
});

// ── KPI card ──────────────────────────────────────────────────────────────────
const KPI = (value, label, sub, w, col = C.blue) => new TableCell({
  children: [
    new Paragraph({ children: [R(value, { sz: 24, bold: true, color: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(7), after: sp(2) } }),
    new Paragraph({ children: [R(label, { sz: 9.5, bold: true, color: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(2) } }),
    new Paragraph({ children: [R(sub,   { sz: 8.5, it:   true, color: C.g50  })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(7) } }),
  ],
  shading: sh(C.lb1),
  margins: { top: sp(4), bottom: sp(4), left: sp(6), right: sp(6) },
  width: { size: Math.round(w), type: WidthType.DXA },
  borders: { top: { style: BorderStyle.SINGLE, size: 10, color: col }, bottom: BThin, left: BThin, right: BThin },
});

// ── Info callout bar ──────────────────────────────────────────────────────────
const callout = (text, fill = C.lb1, textColor = C.navy) => P(
  [R(text, { sz: 10, bold: true, color: textColor })],
  { after: 5, before: 5, lft: 10, rgt: 10, bg: fill }
);

// ── HR lines ─────────────────────────────────────────────────────────────────
const blueRule = () => new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.blue } }, spacing: { before: sp(5), after: sp(5) } });
const greyRule = () => new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: C.g20  } }, spacing: { before: sp(3), after: sp(3) } });

// ── Header / Footer factories ─────────────────────────────────────────────────
const pgMargin = { top: inch(0.85), bottom: inch(0.75), left: inch(1.0), right: inch(1.0) };

const HDR = () => new Header({ children: [
  new Paragraph({
    children: [
      R("IBM \u00D7 HORIZON BCBS  \u2014  APPLICATION DELIVERY, QUALITY & OPERATIONS TRANSFORMATION", { sz: 7.5, bold: true, color: C.g50 }),
      R("   CONFIDENTIAL", { sz: 7.5, bold: true, color: C.blue }),
    ],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.blue, space: 5 } },
    spacing: { after: 0 },
  }),
]});

const FTR = () => new Footer({ children: [
  new Paragraph({
    children: [
      R("CareOps360  \u00B7  IBM AIOps  \u00B7  IBM Consulting Advantage  \u00B7  April 2026", { sz: 7.5, bold: true, color: C.blue }),
      R("   \u2014  Page ", { sz: 7.5, color: C.g50 }),
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
  creator: "IBM Consulting — Healthcare & Payer Delivery",
  title:   "IBM \u00D7 Horizon BCBS — Application Delivery, Quality & Operations Transformation",
  description: "Executive Summary — April 2026",
  sections: [

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 1  COVER   (full-bleed, zero margins)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: [
        // ── Top navy band ─────────────────────────────────────────────────────
        new Paragraph({
          children: [R("IBM CONSULTING   |   HEALTHCARE & PAYER DELIVERY   |   AMS PRACTICE", { sz: 8.5, bold: true, color: C.white })],
          shading: sh(C.navy), alignment: AlignmentType.CENTER,
          spacing: { before: sp(13), after: sp(13) },
        }),
        // IBM blue rule
        new Paragraph({ children: [], shading: sh(C.blue), spacing: { before: 0, after: sp(1.5) } }),

        // ── White area — title ────────────────────────────────────────────────
        spc(22),
        new Paragraph({ children: [R("CONFIDENTIAL  |  APRIL 2026  |  REF: IBM-HZN-AMS-RFP-2026", { sz: 8.5, bold: true, color: C.blue })], alignment: AlignmentType.RIGHT, spacing: { before: 0, after: sp(8) }, indent: { right: inch(1.1) } }),

        // Eyebrow
        new Paragraph({ children: [R("IBM  \u00D7  HORIZON BLUE CROSS BLUE SHIELD OF NEW JERSEY", { sz: 10.5, bold: true, color: C.blue })], spacing: { before: 0, after: sp(5) }, indent: { left: inch(1.1) } }),

        // Main title
        new Paragraph({ children: [R("Application Delivery,",     { sz: 36, bold: true, color: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("Quality Engineering &",     { sz: 36, bold: true, color: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("Operations Transformation", { sz: 36, bold: true, color: C.blue })], spacing: { before: 0, after: sp(5) }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("AI-First   \u00B7   Business-Led   \u00B7   Zero-Touch   \u00B7   Member-Centred", { sz: 12, it: true, color: C.g50 })], spacing: { before: 0, after: sp(18) }, indent: { left: inch(1.1) } }),

        // ── KPI strip ─────────────────────────────────────────────────────────
        T([new TableRow({ children: [
          KPI("40\u201350%", "Cost Takeout",             "vs. current run-rate",         W1/4),
          KPI("25\u201340%", "Faster Time to Market",    "across development & change",  W1/4),
          KPI(">74%",        "Incidents Auto-Resolved",  "P3/P4 zero-touch target",      W1/4),
          KPI("80%+",        "Test Automation Coverage", "from ~25% today",              W1/4),
        ]})], W1),

        // ── Cover quote ───────────────────────────────────────────────────────
        spc(14),
        new Paragraph({
          children: [R("\u201CA member who can\u2019t access their benefits, a provider waiting days for authorisation, a payer carrying the cost of an avoidable error \u2014 these are the problems IBM is here to solve. Technology is the means. Human outcomes are the only measure.\u201D", { sz: 11, it: true, color: C.navy })],
          alignment: AlignmentType.CENTER, spacing: { before: sp(4), after: sp(3) },
          indent: { left: inch(1.1), right: inch(1.1) },
        }),
        new Paragraph({ children: [R("\u2014 IBM Consulting, Healthcare & Payer Delivery", { sz: 9, bold: true, color: C.blue })], alignment: AlignmentType.RIGHT, spacing: { before: 0, after: sp(14) }, indent: { right: inch(1.1) } }),

        // ── Footer bar ────────────────────────────────────────────────────────
        new Paragraph({ children: [], border: { top: { style: BorderStyle.SINGLE, size: 3, color: C.g20 } }, spacing: { before: sp(5), after: 0 }, indent: { left: inch(1.1), right: inch(1.1) } }),
        new Paragraph({
          children: [
            R("Prepared for: ", { sz: 8.5, bold: true, color: C.navy }), R("Horizon Healthcare Services, Inc.     ", { sz: 8.5, color: C.g70 }),
            R("Submitted by: ", { sz: 8.5, bold: true, color: C.navy }), R("IBM Consulting \u2014 Healthcare & Payer     ", { sz: 8.5, color: C.g70 }),
            R("April 2026", { sz: 8.5, color: C.g70 }),
          ],
          spacing: { before: sp(5), after: sp(5) }, indent: { left: inch(1.1) },
        }),
        new Paragraph({
          children: [R("\u00A9 2026 IBM Corporation \u00B7 All rights reserved \u00B7 Powered by CareOps360 \u00B7 IBM AIOps \u00B7 IBM Consulting Advantage \u00B7 HIPAA Compliant", { sz: 7.5, color: C.white })],
          shading: sh(C.navy), alignment: AlignmentType.CENTER, spacing: { before: sp(5), after: sp(5) },
        }),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 2  EXECUTIVE SUMMARY   (1 column)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        ...sHead("01", "Executive Summary", "A strategic proposal for AI-led transformation of Application Management Services"),
        spc(2),

        // Opening statement callout
        new Paragraph({
          children: [R("IBM is not proposing a technology project. IBM is proposing a transformation partnership that embeds AI-driven intelligence into the operating model of Horizon BCBS \u2014 enabling an enterprise that is faster, smarter, and more resilient than today.", { sz: 11, bold: true, color: C.navy })],
          spacing: { before: sp(2), after: sp(6) },
          border: { left: { style: BorderStyle.SINGLE, size: 18, color: C.blue, space: 10 } },
          indent: { left: sp(12) },
        }),

        twoCol([
          H2("The Situation"),
          body("Horizon BCBS manages approximately 500+ applications spanning enrollment, claims adjudication, member services, and data platforms. The incumbent delivery model \u2014 reactive, labour-intensive, and fragmented across towers \u2014 is no longer sufficient to meet Horizon\u2019s growth objectives or competitive imperatives."),
          body("Structural cost pressure, rising member expectations, and the pace of AI adoption across the payer market demand a fundamentally different operating model. Not a faster version of today \u2014 a smarter one."),
          spc(3),
          H2("What IBM Proposes"),
          body("IBM proposes a structured transition from reactive application support to a predictive, self-healing, continuously improving AI-first operating model \u2014 delivered through IBM\u2019s proven Assets, Assistants, and Accelerators framework, and governed through an outcome-based accountability model that ties IBM\u2019s performance to Horizon\u2019s business results."),
        ], [
          H2("Five Strategic Commitments"),
          T([
            new TableRow({ children: [HC("No.", W2*0.48*0.12), HC("Commitment", W2*0.48*0.88)] }),
            ...[ ["1.", "AI-First Operating Model \u2014 AI embedded across every layer of AMS and QA lifecycle."],
                 ["2.", "Tech Arbitrage over Labour Arbitrage \u2014 compressing cost through automation, not headcount."],
                 ["3.", "Outcome-Based Delivery \u2014 committed SLAs tied to measurable business outcomes."],
                 ["4.", "Zero-Disruption Transition \u2014 risk-free phased transition protecting operational continuity."],
                 ["5.", "Continuous Innovation Engine \u2014 Horizon Transformation Office driving sustained value beyond steady state."] ]
              .map(([n, c], i) => new TableRow({ children: [
                DC(n, W2*0.48*0.12, { bold: true, color: C.blue, fill: alt(i) }),
                DC(c, W2*0.48*0.88, { sz: 9.5,                   fill: alt(i) }),
              ]})),
          ], Math.round(W1*0.48)),
        ]),

        spc(6),
        H2("IBM\u2019s Scale Behind This Proposal", C.navy, 0, 4),
        T([new TableRow({ children: [
          KPI("20,000+", "AI & Data Practitioners",    "globally dedicated",              W1/4, C.blue),
          KPI("81,000+", "Cloud & Architecture Experts","IBM Consulting worldwide",        W1/4, C.azure),
          KPI("40,000+", "AI/Analytics Engagements",   "delivered for global clients",    W1/4, C.teal),
          KPI("9 of 10", "Top US Health Payers",       "served by IBM Consulting",        W1/4, C.purple),
        ]})], W1),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 3  THE CASE FOR CHANGE   (2 columns)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, column: { space: 720, count: 2 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // ── LEFT COLUMN ───────────────────────────────────────────────────────
        ...sHead("02", "The Case for Change", "Where Horizon stands \u2014 and why the status quo is unsustainable"),
        H2("Where Horizon Stands Today", C.navy, 0, 3),
        body("Horizon\u2019s current model \u2014 reactive, siloed, and labour-dependent \u2014 cannot absorb the pace of change required. Every inefficiency in the technology estate is felt by a member, a provider, or a payer."),
        bull("Claims adjudication is constrained by manual review and late-stage defects. Members wait longer than necessary for decisions that should be automated."),
        bull("Provider authorisations are delayed because integrations are batch-based. Prior auth that could be instant takes days."),
        bull("Member enrolment errors surface after submission \u2014 long after trust is already damaged. Rework is costly and avoidable."),
        bull("Test automation at approximately 25% means most quality assurance is slow, expensive, and ineffective at preventing production incidents."),
        bull("Operations teams spend the majority of their capacity firefighting recurring incidents rather than building capability or reducing risk."),
        spc(4),
        H2("Current State at a Glance"),
        T([
          new TableRow({ children: [HC("Operational Metric", W2*0.52), HC("Current Estimate", W2*0.25), HC("Direction", W2*0.23)] }),
          ...[ ["Test Automation Coverage",    "~25%",      "Critical gap"],
               ["Mean Time to Resolve",        ">4 hours",  "Too high"],
               ["P3/P4 Auto-Resolution",       "<10%",      "Near zero"],
               ["Defect Escape to Production", "High",      "Untracked"],
               ["Alert Noise per Shift",       "Unfiltered","Overwhelming"],
               ["System Availability",         "~99.7%",    "Below target"] ]
            .map(([a,b,c],i) => new TableRow({ children: [
              DC(a, W2*0.52, { bold: true, fill: alt(i) }),
              DC(b, W2*0.25, { color: C.red, fill: alt(i) }),
              DC(c, W2*0.23, { color: C.red, fill: alt(i), sz: 9 }),
            ]})),
        ], W2),

        colBreak(),

        // ── RIGHT COLUMN ──────────────────────────────────────────────────────
        H2("The IBM Response", C.navy, 0, 3),
        body("IBM proposes a unified delivery partnership spanning Application Development, Quality Engineering, and Application Management \u2014 with AI as the operating engine so that Horizon\u2019s people focus on outcomes, not overhead."),
        bull("AI-assisted engineering with risk-scored release pipelines accelerates delivery by 25\u201340% without adding headcount."),
        bull("Quality gates are embedded at every commit, sprint, and deployment. GenAI synthesises test cases automatically. Coverage reaches 80%+ within 12 months."),
        bull("Operations self-heal: AI agents detect, triage, diagnose, and resolve the majority of incidents before any human is notified."),
        bull("Platform modernisation is embedded in every sprint \u2014 no separate programme, no disruption to BAU."),
        bull("CareOps360 gives Horizon\u2019s leadership real-time visibility into cost, quality, speed, and member impact from Day 1."),
        spc(4),
        H2("IBM 12-Month Targets"),
        T([
          new TableRow({ children: [HC("Operational Metric", W2*0.52), HC("Today", W2*0.20), HC("IBM Target", W2*0.28)] }),
          ...[ ["Test Automation Coverage",    "~25%",      "80%+"],
               ["Mean Time to Resolve",        ">4 hours",  "<1.8 hours"],
               ["P3/P4 Auto-Resolution",       "<10%",      ">74%"],
               ["Defect Escape to Production", "High",      "\u221265%"],
               ["Regression Cycle Time",       "Multi-day", "\u221270%"],
               ["System Availability",         "~99.7%",    "99.9%+"] ]
            .map(([a,b,c],i) => new TableRow({ children: [
              DC(a, W2*0.52, { bold: true, fill: alt(i) }),
              DC(b, W2*0.20, { color: C.red,  fill: alt(i) }),
              VC(c, W2*0.28),
            ]})),
        ], W2),
        spc(5),
        callout("All current-state estimates are directional and will be formally baselined during Phase 0. IBM\u2019s committed targets are contractually agreed at programme commencement."),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 4  IBM OPERATING MODEL   (1 column)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        ...sHead("03", "The IBM Operating Model", "One unified team. Three integrated disciplines. One accountable partner."),
        body("IBM collapses siloed delivery towers into product-aligned squads that own a business domain end-to-end \u2014 from code to production to continuous improvement. AI runs the operating layer beneath every squad: routing incidents, generating tests, scoring releases, and capturing knowledge."),
        spc(4),

        // ── Full-width architecture diagram ───────────────────────────────────
        T([
          // Business outcomes row
          new TableRow({ children: [new TableCell({
            children: [
              new Paragraph({ children: [R("BUSINESS OUTCOMES", { sz: 9, bold: true, color: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: sp(3), after: sp(1) } }),
              new Paragraph({ children: [R("Claims  \u00B7  Enrollment  \u00B7  Member Services  \u00B7  Provider Operations  \u00B7  Data Products", { sz: 9.5, color: C.blue })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(3) } }),
            ],
            shading: sh(C.lb2), columnSpan: 5,
            margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
            borders: { top: BBlue, bottom: BThin, left: BThin, right: BThin },
          })] }),
          // Delivery disciplines
          new TableRow({ children: [
            ["Application\nDevelopment",  C.blue  ],
            ["Quality\nEngineering",      C.teal  ],
            ["Application\nManagement",   C.azure ],
            ["Platform &\nIntegration",   C.purple],
            ["Data &\nAnalytics",         "005D5D"],
          ].map(([label, col]) => new TableCell({
            children: [
              new Paragraph({ children: [R(label, { sz: 9.5, bold: true, color: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(6), after: sp(6) } }),
            ],
            shading: sh(C.white),
            width: { size: Math.round(W1/5), type: WidthType.DXA },
            margins: { top: sp(3), bottom: sp(3), left: sp(4), right: sp(4) },
            borders: { top: { style: BorderStyle.SINGLE, size: 14, color: col }, bottom: BThin, left: BThin, right: BThin },
          })) }),
          // AI engine
          new TableRow({ children: [new TableCell({
            children: [new Paragraph({ children: [R("IBM AI ENGINE  \u2014  AIOps  \u00B7  Agentic Intelligence  \u00B7  GenAI Quality  \u00B7  IBM Consulting Advantage  \u00B7  CareOps360", { sz: 9.5, bold: true, color: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: sp(2), after: sp(2) } })],
            shading: sh(C.lb1), columnSpan: 5,
            margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
            borders: { top: BThin, bottom: BThin, left: BThin, right: BThin },
          })] }),
          // Platform
          new TableRow({ children: [new TableCell({
            children: [new Paragraph({ children: [R("PLATFORM FOUNDATION  \u2014  Hybrid Cloud  \u00B7  Integration Hub  \u00B7  Mainframe  \u00B7  Data Platforms  \u00B7  Security & Compliance", { sz: 9, color: C.g70 })], alignment: AlignmentType.CENTER, spacing: { before: sp(2), after: sp(2) } })],
            shading: sh(C.g10), columnSpan: 5,
            margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
            borders: { top: BThin, bottom: BThin, left: BThin, right: BThin },
          })] }),
        ], W1),

        spc(7),

        // ── Two sub-sections side-by-side ─────────────────────────────────────
        twoCol([
          H2("Three Integrated Disciplines", C.navy, 0, 3),
          H3("Application Development"),
          body("AI-assisted engineering, automated pipelines, and risk-scored releases. Every developer builds faster because the machine handles the routine \u2014 code review, test generation, deployment risk scoring."),
          H3("Quality Engineering"),
          body("Testing is a continuous signal at every commit, sprint, and deployment. GenAI generates tests. AI predicts defects. Coverage reaches 80%+ within 12 months without a single manual test-plan document."),
          H3("Application Management"),
          body("Operations shift from reactive firefighting to predictive self-healing. The majority of P3/P4 incidents are resolved automatically \u2014 providers and members never experience the impact."),
        ], [
          H2("Today vs. With IBM", C.navy, 0, 3),
          T([
            new TableRow({ children: [HC("Today", Math.round(W1*0.49*0.50)), HC("With IBM", Math.round(W1*0.49*0.50))] }),
            ...[ ["Siloed delivery towers",    "Unified domain product pods"],
                 ["Reactive firefighting",     "Predictive self-healing"],
                 ["End-stage testing",         "Shift-left quality gates"],
                 ["Manual deployments",        "AI risk-scored pipelines"],
                 ["Labour arbitrage savings",  "Technology-driven takeout"],
                 ["Activity-metric reporting", "Business outcome dashboards"],
                 ["Innovation as a project",   "Innovation in every sprint"] ]
              .map(([a,b],i) => new TableRow({ children: [
                DC(a, Math.round(W1*0.49*0.50), { color: C.g70, fill: alt(i), sz: 9.5 }),
                VC(b, Math.round(W1*0.49*0.50), { sz: 9.5 }),
              ]})),
          ], Math.round(W1*0.49)),
        ]),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 5  AI-FIRST APPLICATION DEVELOPMENT   (2 columns)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, column: { space: 720, count: 2 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // ── LEFT ──────────────────────────────────────────────────────────────
        ...sHead("04", "AI-First Application Development", "Build faster. Ship safer. Modernise continuously."),
        ...pullQuote(
          "When a member\u2019s enrollment takes two weeks because a downstream application is slow, that is a trust problem. IBM engineers the systems so that wait shrinks to hours \u2014 not as an ambition, but as a delivery commitment.",
          "IBM Consulting \u2014 Member Experience Engineering"
        ),
        H2("How IBM Builds Faster", C.navy, 0, 3),
        H3("AI-Assisted Development"),
        body("AI coding assistants generate code, flag risk patterns, and suggest optimisations in real time. Developer throughput increases by 25\u201335% without adding headcount."),
        H3("Automated Release Gates"),
        body("Every change passes AI-scored gates: security, performance, coverage, and risk profile. Low-risk changes deploy without waiting for a human approval cycle."),
        H3("Domain-Aligned Squads"),
        body("Development teams align to Horizon\u2019s business domains \u2014 Claims, Enrollment, Member, Provider. Context stays with the squad; handoff overhead disappears."),
        spc(4),
        T([
          new TableRow({ children: [HC("Delivery Metric", W2*0.60), HC("12-Month Target", W2*0.40)] }),
          ...[ ["Time to market",         "25\u201340% faster"],
               ["Deployment frequency",   "2\u00D7 current rate"],
               ["Change failure rate",    "\u221260%"],
               ["Recovery time (MTTR)",  "<15 minutes"] ]
            .map(([a,b],i) => new TableRow({ children: [DC(a,W2*0.60,{bold:true,fill:alt(i)}), VC(b,W2*0.40)] })),
        ], W2),

        colBreak(),

        // ── RIGHT ─────────────────────────────────────────────────────────────
        H2("Efficiency Gains by Capability", C.navy, 0, 3),
        P([R("Improvement vs. traditional delivery:", { sz: 9, it: true, color: C.g50 })], { after: 4 }),
        T([
          B1("AI-assisted coding",        80, "+30% capacity",       C.blue),
          B1("Automated QE generation",   75, "+25% QE speed",       C.teal),
          B1("Risk-scored deployments",   70, "\u221260% failures",  C.azure),
          B1("Modernisation-in-stride",   60, "Debt \u221230%/yr",   C.purple),
          B1("Domain squad alignment",    65, "\u221240% handoffs",  "005D5D"),
        ], W2),

        spc(6),
        H2("Modernisation Approach", C.navy, 4, 3),
        body("No big-bang programme. Modernisation is embedded into every sprint as a standing action \u2014 a refactor, an API wrap, a library upgrade \u2014 so the estate improves continuously without a disruptive transformation project running in parallel."),
        spc(2),
        T([
          new TableRow({ children: [HC("Action", W2*0.35), HC("Method", W2*0.40), HC("When", W2*0.25)] }),
          ...[ ["API-wrap legacy",    "Expose as managed service",  "Wave 1"],
               ["Cloud migration",    "Lift, validate, optimise",   "Wave 2"],
               ["Selective refactor", "Rebuild highest-risk apps",  "Wave 3"],
               ["Retire & replace",   "SaaS substitution",          "Ongoing"] ]
            .map(([a,b,c],i) => new TableRow({ children: [DC(a,W2*0.35,{bold:true,fill:alt(i)}), DC(b,W2*0.40,{color:C.g70,fill:alt(i)}), VC(c,W2*0.25)] })),
        ], W2),
        spc(5),
        callout("AI-assisted development is not about replacing engineers. It is about amplifying them \u2014 so every Horizon engineer delivers twice the business value."),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 6  QUALITY ENGINEERING   (3 columns)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, column: { space: 360, count: 3 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // ── COLUMN 1 ──────────────────────────────────────────────────────────
        ...sHead("05", "Quality Engineering"),
        P([R("Quality is a continuous signal \u2014 not a final checkpoint.", { sz: 10.5, it: true, color: C.navy })], { after: 5 }),
        H3("Commit-Level AI Review"),
        body("The instant a developer pushes code, AI reviews it \u2014 flagging security risk, test gaps, and quality anti-patterns before any human sees the pull request. Zero human delay at the first gate.", { sz: 9.5, after: 4 }),
        H3("GenAI Test Generation"),
        body("AI synthesises regression, integration, and edge-case tests from the code change itself, at commit speed. Coverage grows automatically \u2014 no manual test plan authoring required.", { sz: 9.5, after: 4 }),
        spc(4),
        P([R("Every defect that reaches production is a promise broken \u2014 a member\u2019s benefit delayed, a provider\u2019s claim processed incorrectly. IBM\u2019s quality engine is designed so those defects never leave the building.", { sz: 9.5, it: true, color: C.navy })], { after: 3 }),

        colBreak(),

        // ── COLUMN 2 ──────────────────────────────────────────────────────────
        H3("Defect Prediction AI"),
        body("Models trained on Horizon\u2019s own incident history identify high-risk code paths before they reach UAT. Fewer defects in staging; far fewer in production.", { sz: 9.5, after: 4 }),
        H3("Production Feedback Loop"),
        body("Every production defect teaches the quality engine. With each release cycle the test suite tightens automatically \u2014 an ever-improving quality net that improves without manual intervention.", { sz: 9.5, after: 4 }),

        H3("Automation Coverage Journey"),
        P([R("Month-by-month target:", { sz: 8.5, it: true, color: C.g50 })], { after: 3 }),
        T([
          B3("Baseline (Month 0)",   25, "~25%",  C.g50),
          B3("Ignite  (Month 3)",    45, "45%",   "0072C3"),
          B3("Scale   (Month 6)",    62, "62%",   C.azure),
          B3("Optimise(Month 9)",    75, "75%",   C.blue),
          B3("Target  (Month 12)",   82, "82%+",  C.navy),
        ], W3),

        colBreak(),

        // ── COLUMN 3 ──────────────────────────────────────────────────────────
        H3("QE Metrics — Today vs. Target"),
        T([
          new TableRow({ children: [HC("Metric", W3*0.46), HC("Now", W3*0.18), HC("Target", W3*0.36)] }),
          ...[ ["Test automation",    "~25%",       "80%+"],
               ["Defect escape",      "High",       "\u221265%"],
               ["Regression time",    "Multi-day",  "\u221270%"],
               ["Mean time detect",   ">2 hrs",     "<15 min"] ]
            .map(([a,b,c],i) => new TableRow({ children: [
              DC(a,W3*0.46,{bold:true,fill:alt(i),sz:9}),
              DC(b,W3*0.18,{color:C.red,fill:alt(i),sz:9}),
              VC(c,W3*0.36,{sz:9}),
            ]})),
        ], W3),

        spc(5),
        H3("Release Gate Checklist"),
        T([
          new TableRow({ children: [HC("Gate", W3*0.28), HC("Check & Touch", W3*0.72)] }),
          ...[ ["Commit",   "AI review + coverage delta. No human."],
               ["Build",    "Unit pass rate >98%. No human."],
               ["Staging",  "Integration + performance. No human."],
               ["Release",  "AI risk score. Tier 1 sign-off only."] ]
            .map(([a,b],i) => new TableRow({ children: [
              DC(a,W3*0.28,{bold:true,fill:alt(i),sz:9}),
              DC(b,W3*0.72,{color:C.g70,fill:alt(i),sz:9}),
            ]})),
        ], W3),
        spc(5),
        callout("Quality is owned by the full team \u2014 not a separate function. IBM builds it into the rhythm of delivery.", C.lb1, C.navy),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 7  AIOPS & AGENTIC OPERATIONS   (1 column)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        ...sHead("06", "AIOps & Agentic Operations", "From reactive incident management to autonomous, self-healing operations"),
        ...pullQuote(
          "A provider should never have to call a helpdesk because a claims system is slow. A member should never see an error because two systems failed to sync overnight. IBM\u2019s AI operations model is designed so those moments simply stop happening.",
          "IBM AIOps \u2014 Zero-Touch Operations Framework"
        ),
        H2("The Zero-Touch Operations Pipeline"),
        T([new TableRow({ children: [
          PIPE("STEP 1", "Detect",   ["Correlate signals across\n140+ sources", "Cut alert noise >60%"], C.blue),
          PIPE("STEP 2", "Triage",   ["AI-based routing",    "Impact scoring",        "Auto-prioritise"], "0072C3"),
          PIPE("STEP 3", "Diagnose", ["Root cause in minutes","Runbook guidance",     "Pattern matching"], C.azure),
          PIPE("STEP 4", "Resolve",  ["Self-heal P3/P4",     "Auto-remediate",        "Zero human touch"], C.teal),
          PIPE("STEP 5", "Learn",    ["Capture knowledge",   "Update runbooks",       "Prevent recurrence"], "005D5D"),
        ]})], W1),

        spc(6),

        twoCol([
          H2("AI Agents & Annual Value Contribution", C.navy, 0, 3),
          T([
            new TableRow({ children: [HC("AI Agent", Math.round(W1*0.49*0.40)), HC("Function", Math.round(W1*0.49*0.38)), HC("Est. Value", Math.round(W1*0.49*0.22))] }),
            ...[ ["Detection & Correlation", "Alert noise reduction >60%",            "$2.5\u20133.5M"],
                 ["Triage Agent",            "Instant impact-based routing",           "$1.3\u20131.5M"],
                 ["Root Cause Agent",        "Diagnosis in minutes, not hours",        "$2.0\u20133.0M"],
                 ["Auto-Remediation",        "Resolves P3/P4 without human touch",    "$1.5\u20132.0M"],
                 ["Knowledge Agent",         "Captures learning from every incident",  "$1.0\u20131.3M"],
                 ["Deployment AI",           "Scores risk of every release",          "$0.8\u20131.2M"] ]
              .map(([a,b,c],i) => new TableRow({ children: [
                DC(a, Math.round(W1*0.49*0.40), { bold: true, fill: alt(i), sz: 9.5 }),
                DC(b, Math.round(W1*0.49*0.38), { color: C.g70, fill: alt(i), sz: 9 }),
                VC(c, Math.round(W1*0.49*0.22), { sz: 9 }),
              ]})),
          ], Math.round(W1*0.49)),
        ], [
          H2("Before vs. After", C.navy, 0, 3),
          T([
            new TableRow({ children: [HC("Metric", Math.round(W1*0.49*0.42)), HC("Today", Math.round(W1*0.49*0.24)), HC("With IBM AIOps", Math.round(W1*0.49*0.34))] }),
            ...[ ["Mean Time to Resolve",     ">4 hours",   "<1.8 hours"],
                 ["P3/P4 Auto-Resolution",   "<10%",        ">74%"],
                 ["Alert Noise",             "Unfiltered",  ">60% reduced"],
                 ["System Availability",     "~99.7%",      "99.9%+"],
                 ["Recurring Incidents",     "Unmanaged",   "\u221250% demand"] ]
              .map(([a,b,c],i) => new TableRow({ children: [
                DC(a, Math.round(W1*0.49*0.42), { bold: true, fill: alt(i) }),
                DC(b, Math.round(W1*0.49*0.24), { color: C.red, fill: alt(i) }),
                VC(c, Math.round(W1*0.49*0.34)),
              ]})),
          ], Math.round(W1*0.49)),
          spc(4),
          callout("Target: most P3/P4 incidents resolved before a human is notified. That is what zero-touch operations means in practice."),
        ]),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 8  BUSINESS OUTCOMES & ROI   (2 columns)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, column: { space: 720, count: 2 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // ── LEFT ──────────────────────────────────────────────────────────────
        ...sHead("07", "Business Outcomes & Value", "Every initiative connects to a measurable business result"),
        ...pullQuote(
          "A payer that processes a claim faster spends less on administration and earns more member trust. A payer whose systems self-heal spends less on incidents and more on care.",
          "IBM Outcome Governance Framework"
        ),
        H2("Business Domain KPIs", C.navy, 0, 3),
        T([
          new TableRow({ children: [HC("Domain", W2*0.33), HC("Key Business Metric", W2*0.43), HC("12-Month Target", W2*0.24)] }),
          ...[ ["Claims",           "Adjudication cycle time",    "\u221230%"],
               ["Enrollment",       "Time-to-activation",         "\u221240%"],
               ["Member Services",  "First-contact resolution",   "+25%"],
               ["Provider Ops",     "Prior auth turnaround",      "\u221235%"],
               ["Data & Reporting", "Report delivery latency",    "\u221250%"],
               ["IT Operations",    "P3/P4 auto-resolution rate", ">74%"] ]
            .map(([a,b,c],i) => new TableRow({ children: [
              DC(a,W2*0.33,{bold:true,fill:alt(i)}),
              DC(b,W2*0.43,{color:C.g70,fill:alt(i)}),
              VC(c,W2*0.24),
            ]})),
        ], W2),
        spc(5),
        H2("Cumulative Cost Takeout (Directional)", C.navy, 4, 3),
        P([R("Baselines locked in Phase 0; targets contractually committed:", { sz: 9, it: true, color: C.g50 })], { after: 3 }),
        T([
          B1("Month 3  \u2014 Ignite",    12,  "$1\u20132M",     "0072C3"),
          B1("Month 6  \u2014 Scale",     30,  "$3\u20135M",     C.azure),
          B1("Month 12 \u2014 Optimise",  60,  "$6\u201310M",    C.blue),
          B1("Month 24 \u2014 Transform", 100, "$12\u201318M+",  C.navy),
        ], W2),

        colBreak(),

        // ── RIGHT ─────────────────────────────────────────────────────────────
        H2("Annual Value by Initiative (Directional)", C.navy, 0, 3),
        P([R("Estimated annual run-rate contribution at steady state:", { sz: 9, it: true, color: C.g50 })], { after: 3 }),
        T([
          B1("AIOps & Self-Healing Ops",     85, "$3.5\u20136.5M",  C.blue),
          B1("GenAI Quality Engine",         72, "$2.5\u20134.0M",  C.teal),
          B1("Zero-Touch Delivery Pipeline", 60, "$2.0\u20133.0M",  C.azure),
          B1("Platform Modernisation",       48, "$1.5\u20132.5M",  C.purple),
          B1("Demand & Ticket Reduction",    55, "$1.0\u20132.0M",  "005D5D"),
        ], W2),

        spc(6),
        H2("Governance Cadence", C.navy, 4, 3),
        T([
          new TableRow({ children: [HC("Forum", W2*0.36), HC("Focus", W2*0.44), HC("Cadence", W2*0.20)] }),
          ...[ ["Operational",  "SLA, MTTR, pipeline velocity \u2014 live in CareOps360",    "Weekly"],
               ["Executive",   "Cost takeout, coverage progress, domain KPI movement",       "Monthly"],
               ["Board / ELT", "Total value realised, innovation delivered, year priorities", "Quarterly"] ]
            .map(([a,b,c],i) => new TableRow({ children: [
              DC(a,W2*0.36,{bold:true,fill:alt(i)}),
              DC(b,W2*0.44,{color:C.g70,fill:alt(i),sz:9.5}),
              VC(c,W2*0.20),
            ]})),
        ], W2),
        spc(5),
        callout("CareOps360 \u2014 IBM\u2019s executive operations platform \u2014 makes every metric above visible in real time from Day 1. No manual reporting. No quarterly decks. Live data, always.", C.lb1, C.navy),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    // PAGE 9  PHASED TRANSFORMATION ROADMAP   (1 column)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pgMargin }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        ...sHead("08", "Phased Transformation Roadmap", "Risk-controlled \u00B7 Compounding value \u00B7 Transparent governance \u00B7 Outcome SLAs"),
        ...pullQuote(
          "Every day a claim processes faster, a prior auth returns sooner, or an outage resolves before it is noticed \u2014 that is a day Horizon\u2019s members and providers experience the difference IBM makes. That starts in Week 1, not Year 2.",
          "IBM Delivery Governance"
        ),
        H2("Phase-by-Phase Delivery Plan"),
        T([
          new TableRow({ children: [HC("Phase", W1*0.14), HC("Timeframe", W1*0.10), HC("Focus & Key Deliverables", W1*0.46), HC("Value Signal", W1*0.30)] }),
          ...[ ["Phase 0\nFoundation",  "0\u20138 wks",
                "Telemetry onboarding  \u00B7  Baseline measurement  \u00B7  Transition plan  \u00B7  AI environment setup  \u00B7  Innovation council constituted",
                "Live CareOps360 dashboards \u00B7 Baselines locked \u00B7 Zero BAU disruption"],
               ["Phase 1\nIgnite",     "Mo 1\u20133",
                "AIOps live  \u00B7  P3/P4 self-heal pilots  \u00B7  GenAI QE framework  \u00B7  AI development sprints start  \u00B7  Quick-win automations",
                "MTTR \u221220% \u00B7 First automation ROI \u00B7 QE coverage 45%"],
               ["Phase 2\nScale",      "Mo 3\u20136",
                "Agentic triage at scale  \u00B7  Integration Hub Wave 1  \u00B7  QE 60%  \u00B7  DataOps monitoring  \u00B7  AI dev across all pods",
                "Auto-resolve >50% \u00B7 Defect escape \u221240% \u00B7 $3\u20135M cumulative"],
               ["Phase 3\nOptimise",   "Mo 6\u201312",
                "Autonomous ops for common patterns  \u00B7  QE 80%+  \u00B7  Modernisation sprints  \u00B7  Full outcome governance live",
                "Cost takeout $6\u201310M \u00B7 MTTR <1.8 hrs \u00B7 99.9%+ availability"],
               ["Phase 4\nTransform",  "Yr 1\u20132",
                "Full autonomous estate  \u00B7  Mainframe rehost/refactor  \u00B7  Enterprise observability  \u00B7  Co-invest innovation pipeline",
                "Structural takeout 40\u201350% \u00B7 Total value $12\u201318M+"] ]
            .map(([ph,ti,de,va],i) => new TableRow({ children: [
              DC(ph, W1*0.14, { bold: true, color: C.navy, fill: alt(i) }),
              DC(ti, W1*0.10, { color: C.g70,              fill: alt(i), sz: 9 }),
              DC(de, W1*0.46, {                             fill: alt(i), sz: 9.5 }),
              VC(va, W1*0.30, { sz: 9 }),
            ]})),
        ], W1),

        spc(7),
        H2("KPI Framework — Continuous Governance"),
        T([
          new TableRow({ children: [HC("Value Area", W1*0.20), HC("KPIs Tracked in CareOps360", W1*0.36), HC("Data Source", W1*0.24), HC("Cadence", W1*0.20)] }),
          ...[ ["Operational Excellence",    "MTTR, availability, incident volume, auto-resolution %",              "ITSM + AIOps telemetry",  "Weekly"],
               ["Cost & Productivity",      "Automation ROI, demand reduction, delivery velocity",                 "Finance + ITSM",           "Monthly"],
               ["Quality Engineering",      "Coverage, defect escape, regression time, MTTD",                     "QE toolchain + CI/CD",     "Per Sprint"],
               ["Platform & Modernisation", "n-1 compliance, debt index, upgrade velocity, CVE status",           "CMDB + security scans",    "Monthly"],
               ["Business Outcomes",        "Claims cycle, enrollment time, first-call resolution, provider ASA", "Domain dashboards",        "Monthly"] ]
            .map(([a,b,c,d],i) => new TableRow({ children: [
              DC(a,W1*0.20,{bold:true,fill:alt(i)}),
              DC(b,W1*0.36,{color:C.g70,fill:alt(i),sz:9.5}),
              DC(c,W1*0.24,{color:C.g70,fill:alt(i),sz:9.5}),
              VC(d,W1*0.20),
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
        // ── LEFT ──────────────────────────────────────────────────────────────
        ...sHead("09", "Why IBM \u2014 and Why Now", "The depth, the assets, and the accountability to deliver"),
        ...pullQuote(
          "IBM\u2019s ultimate accountability is not to a contract. It is to the 3.7 million members who rely on Horizon\u2019s systems every day \u2014 the patient waiting for a prior auth, the provider navigating a claims dispute, the family enrolling for the first time.",
          "IBM Consulting \u2014 Healthcare & Payer Delivery"
        ),
        H2("What Makes IBM Different", C.navy, 0, 3),
        H3("Production-Grade Assets, Day 1"),
        body("IBM AIOps, IBM Consulting Advantage, CareOps360, and the GenAI Quality Engine are live at comparable payers today \u2014 not promised in a future roadmap.", { sz: 9.5, after: 3 }),
        H3("Deep Horizon Knowledge"),
        body("IBM brings institutional knowledge of Horizon\u2019s estate, change history, and technical debt profile, reducing transition risk to near-zero.", { sz: 9.5, after: 3 }),
        H3("Healthcare Payer DNA"),
        body("Claims, enrollment, prior auth, member services \u2014 IBM has modernised these for the nation\u2019s largest payers. The patterns are proven and portable.", { sz: 9.5, after: 3 }),
        H3("Shared Risk Model"),
        body("IBM commits to outcome-based SLAs. Targets missed trigger IBM remediation plans \u2014 not contract renegotiations or rate discussions.", { sz: 9.5, after: 3 }),
        H3("Innovation at No Extra Cost"),
        body("Innovation sprints, AI tooling, and accelerators are built into the base model. Transformation is not a separate line item on a future invoice.", { sz: 9.5, after: 5 }),
        T([
          new TableRow({ children: [HC("IBM Credential", W2*0.60), HC("Fact", W2*0.40)] }),
          ...[ ["AI & Data Practitioners",     "20,000+ globally"],
               ["Cloud & Arch. Experts",       "81,000+ IBM Consulting"],
               ["AI/Analytics Engagements",    "40,000+ delivered"],
               ["Top US Health Payers Served", "9 of 10"],
               ["Client-0 AI Savings (IBM)",   "~$3.4B USD"] ]
            .map(([a,b],i) => new TableRow({ children: [DC(a,W2*0.60,{bold:true,fill:alt(i)}), VC(b,W2*0.40)] })),
        ], W2),

        colBreak(),

        // ── RIGHT ─────────────────────────────────────────────────────────────
        H2("IBM vs. The Alternative", C.navy, 0, 3),
        T([
          new TableRow({ children: [HC("Dimension", W2*0.30), HC("Status Quo", W2*0.34), HC("IBM Partnership", W2*0.36)] }),
          ...[ ["Operating Model",  "Siloed towers, reactive",         "Unified pods, AI-first"],
               ["Development",     "Manual pipeline, slow",           "AI-assisted, +25\u201340%"],
               ["Quality",         "End-stage gate testing",          "Shift-left, GenAI, 80%+"],
               ["Operations",      "Firefighting incidents",           "Agentic self-healing"],
               ["Cost Structure",  "Labour arbitrage",                "Technology takeout 40\u201350%"],
               ["Reporting",       "Activity-based metrics",           "Real-time business outcomes"],
               ["Risk",            "Vendor bears none",               "Shared SLA accountability"] ]
            .map(([a,b,c],i) => new TableRow({ children: [
              DC(a,W2*0.30,{bold:true,fill:alt(i),sz:9.5}),
              DC(b,W2*0.34,{color:C.red,fill:alt(i),sz:9.5}),
              VC(c,W2*0.36,{sz:9.5}),
            ]})),
        ], W2),

        spc(5),
        H2("The Next Three Steps", C.navy, 5, 3),
        ...[ ["Week 1\u20132", "Executive alignment session \u2014 Horizon leadership and IBM account team agree objectives, scope, and governance."],
             ["Week 2\u20134", "Phase 0 SOW agreed. Telemetry onboarding begins. Baseline discovery kicks off. Innovation council constituted."],
             ["Week 4",        "Contractual milestone: Phase 0 live. IBM and Horizon operating as one team from Day 1."],
        ].flatMap(([t,d]) => [
          new Paragraph({
            children: [R(t, { sz: 10, bold: true, color: C.blue }), R("   " + d, { sz: 9.5, color: C.g70 })],
            spacing: { before: sp(5), after: sp(2) },
          }),
        ]),

        spc(6),
        blueRule(),
        spc(4),
        new Paragraph({
          children: [
            R("\u201CIBM\u2019s measure of success is not tickets closed or alerts silenced. It is the member who gets their answer faster, the provider who spends less time on administration, and the ", { sz: 11, it: true }),
            R("payer that directs every saved dollar back toward the care that matters.", { sz: 11, bold: true, it: true, color: C.navy }),
            R(" That is why we are here.\u201D", { sz: 11, it: true }),
          ],
          alignment: AlignmentType.CENTER, spacing: { before: sp(4), after: sp(4) }, indent: { left: inch(0.2), right: inch(0.2) },
        }),
        P([R("\u2014 IBM Consulting, Healthcare & Payer Delivery  |  April 2026", { sz: 9.5, bold: true, color: C.blue })], { align: AlignmentType.RIGHT, after: 8 }),
        greyRule(),
        P([R("\u00A9 2026 IBM Corporation. All rights reserved.  Confidential \u2014 prepared exclusively for Horizon Healthcare Services, Inc.  Ref: IBM-HZN-AMS-RFP-2026-CAS", { sz: 7.5, color: C.g50 })], { align: AlignmentType.CENTER, before: 3 }),
      ],
    },
  ],
});

const buf = await Packer.toBuffer(doc);
writeFileSync("attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx", buf);
console.log("Done \u2014 " + buf.length.toLocaleString() + " bytes  (" + doc.sections?.length ?? 10 + " sections)");
