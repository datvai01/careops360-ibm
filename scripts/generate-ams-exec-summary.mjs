/**
 * IBM × Horizon BCBS
 * Application Delivery, Quality Engineering & Operations Transformation
 * Executive Summary — Boardroom-Ready — C-Suite
 *
 * Style: mirrors IBM_Corporation_Attachment_18-A_Transformation_Plan reference document
 *  - Single column throughout (no Word column layouts)
 *  - pageBreakBefore on each section
 *  - Clean stat-boxes, simple tables, executive bullet lists
 *  - IBM Blue (#0F62FE) · Navy (#001141) · brand palette
 */

import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle, WidthType,
  ShadingType, TableLayoutType, Header, Footer, PageNumber,
  convertInchesToTwip, SectionType,
} from "docx";
import { writeFileSync } from "fs";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  blue:   "0F62FE",
  navy:   "001141",
  teal:   "007D79",
  azure:  "0043CE",
  purple: "6929C4",
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

const FONT = "Calibri";
const hp   = pt => Math.round(pt * 2);        // → half-points (font size)
const sp   = pt => Math.round(pt * 20);       // → twips (spacing)
const inch = n  => convertInchesToTwip(n);

// Full content width at 1" margins → 6.5" = 9360 DXA
const W = 9360;

// ── Shading — ALWAYS CLEAR ────────────────────────────────────────────────────
const sh = fill => ({ type: ShadingType.CLEAR, fill });

// ── Borders ───────────────────────────────────────────────────────────────────
const BNone   = { style: BorderStyle.NONE,   size: 0, color: "auto" };
const BThin   = { style: BorderStyle.SINGLE, size: 4, color: C.g20  };
const BThick  = { style: BorderStyle.SINGLE, size: 6, color: C.g20  };
const BBlue   = { style: BorderStyle.SINGLE, size: 14, color: C.blue };
const NO_B    = { top: BNone, bottom: BNone, left: BNone, right: BNone, insideH: BNone, insideV: BNone };
const CELL_B  = { top: BThin, bottom: BThin, left: BThin, right: BThin };

// ── Blank spacer paragraph ────────────────────────────────────────────────────
const SPC = (pt = 6) => new Paragraph({
  children: [new TextRun({ text: "", font: FONT, size: hp(6) })],
  spacing: { before: 0, after: sp(pt) },
});

// ── Text run factory ──────────────────────────────────────────────────────────
const R = (text, o = {}) => new TextRun({
  text,
  font:    FONT,
  size:    hp(o.sz     ?? 10.5),
  bold:    o.bold      ?? false,
  italics: o.it        ?? false,
  color:   o.color     ?? C.g100,
});

// ── Paragraph factory ─────────────────────────────────────────────────────────
const P = (runs, o = {}) => new Paragraph({
  children:         Array.isArray(runs) ? runs : [runs],
  spacing:          { before: sp(o.before ?? 0), after: sp(o.after ?? 0) },
  alignment:        o.align,
  indent:           (o.left || o.right) ? { left: sp(o.left ?? 0), right: sp(o.right ?? 0) } : undefined,
  border:           o.border,
  shading:          o.bg ? sh(o.bg) : undefined,
  pageBreakBefore:  o.pageBreak ?? false,
});

// ── Body paragraph ────────────────────────────────────────────────────────────
const BODY = (text, o = {}) => P(
  [R(text, { sz: o.sz ?? 10.5, color: o.color ?? C.g70, it: o.it })],
  { after: o.after ?? 5, before: o.before ?? 0, align: o.align },
);

// ── Bullet ────────────────────────────────────────────────────────────────────
const BULL = (text, o = {}) => new Paragraph({
  children: [R(text, { sz: o.sz ?? 10.5, color: o.color ?? C.g70 })],
  bullet:   { level: 0 },
  spacing:  { before: sp(1), after: sp(3) },
});

// ── Horizontal rule ───────────────────────────────────────────────────────────
const RULE = (color = C.g20, size = 4, before = 5, after = 5) => new Paragraph({
  children: [],
  border: { bottom: { style: BorderStyle.SINGLE, size, color } },
  spacing: { before: sp(before), after: sp(after) },
});

// ── Section heading  (mirrors reference document style) ───────────────────────
//    Blue top-rule → number + title → italic subtitle
const SEC = (num, title, sub = "", pageBreak = true) => [
  new Paragraph({
    children: [],
    border: { top: { style: BorderStyle.SINGLE, size: 20, color: C.blue, space: 10 } },
    spacing: { before: sp(pageBreak ? 0 : 12), after: sp(4) },
    pageBreakBefore: pageBreak,
  }),
  new Paragraph({
    children: [
      R(num + "  ", { sz: 9.5, bold: true, color: C.blue }),
      R(title,       { sz: 18,  bold: true, color: C.navy }),
    ],
    spacing: { before: 0, after: sub ? sp(3) : sp(8) },
  }),
  ...(sub ? [BODY(sub, { it: true, sz: 10, after: 8, color: C.g50 })] : []),
];

// ── Sub-heading ───────────────────────────────────────────────────────────────
const H2 = (text, o = {}) => P(
  [R(text, { sz: 12, bold: true, color: o.color ?? C.navy })],
  { before: o.before ?? 10, after: o.after ?? 4 },
);
const H3 = (text, o = {}) => P(
  [R(text, { sz: 10.5, bold: true, color: o.color ?? C.blue })],
  { before: o.before ?? 6, after: o.after ?? 2 },
);

// ── Pull quote  (blue left-border, italic navy, matching reference) ───────────
const QUOTE = (text, attr = "") => [
  SPC(4),
  new Paragraph({
    children: [R("\u201C" + text + "\u201D", { sz: 11.5, it: true, color: C.navy })],
    spacing: { before: sp(3), after: sp(2) },
    indent: { left: inch(0.4) },
    border: { left: { style: BorderStyle.SINGLE, size: 20, color: C.blue, space: 12 } },
  }),
  ...(attr
    ? [P([R("\u2014 " + attr, { sz: 9, bold: true, color: C.blue })], { before: 0, after: 6, align: AlignmentType.RIGHT })]
    : [SPC(5)]),
];

// ── Callout bar ───────────────────────────────────────────────────────────────
const CALLOUT = (text, fill = C.lb1, color = C.navy) => new Paragraph({
  children: [R(text, { sz: 10.5, bold: true, color })],
  shading: sh(fill),
  spacing: { before: sp(6), after: sp(6) },
  indent: { left: inch(0.25), right: inch(0.25) },
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TABLE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const cell = (children, w, o = {}) => new TableCell({
  children: Array.isArray(children) ? children : [children],
  shading:  sh(o.fill ?? C.white),
  width:    w ? { size: Math.round(w), type: WidthType.DXA } : undefined,
  borders:  o.borders ?? CELL_B,
  margins:  o.margins ?? { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
  verticalAlign: o.va ?? "center",
  columnSpan: o.span,
});

// Header cell
const HC = (text, w, o = {}) => cell(
  new Paragraph({ children: [R(text, { sz: 10, bold: true, color: o.color ?? C.navy })], spacing: { before: sp(3), after: sp(3) }, alignment: o.align }),
  w, { fill: o.fill ?? C.lb2, borders: { top: BBlue, bottom: BThick, left: BThin, right: BThin }, span: o.span },
);

// Data cell
const DC = (text, w, o = {}) => cell(
  new Paragraph({ children: [R(text, { sz: o.sz ?? 10, bold: o.bold ?? false, color: o.color ?? C.g100, it: o.it })], spacing: { before: sp(2), after: sp(2) }, alignment: o.align }),
  w, { fill: o.fill ?? C.white },
);

// Value cell (IBM Blue bold)
const VC = (text, w, o = {}) => DC(text, w, { bold: true, color: C.blue, fill: C.lb1, ...o });

// Ghost (borderless) cell — for invisible layout tables
const GC = (items, w) => cell(items, w, { fill: C.white, borders: NO_B, margins: { top: 0, bottom: 0, left: 0, right: 0 } });

const alt  = i => (i % 2 === 0 ? C.white : C.g10);

// Table wrapper
const TBL = (rows, w = W) => new Table({
  width: { size: Math.round(w), type: WidthType.DXA },
  layout: TableLayoutType.FIXED,
  borders: NO_B,
  rows,
});

// ── Stat box row  (e.g., "~1000 / Applications in Scope") ────────────────────
//    Rendered as a borderless table with 4 equal cells, col accent top rule
const STATS = (items) => TBL([
  new TableRow({ children: items.map(([val, label, col = C.blue]) => new TableCell({
    children: [
      new Paragraph({ children: [R(val,   { sz: 28, bold: true, color: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(8), after: sp(3) } }),
      new Paragraph({ children: [R(label, { sz: 9.5, bold: true, color: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(8) } }),
    ],
    shading: sh(C.lb1),
    width: { size: Math.round(W / items.length), type: WidthType.DXA },
    borders: { top: { style: BorderStyle.SINGLE, size: 12, color: col }, bottom: BThin, left: BThin, right: BThin },
    margins: { top: sp(4), bottom: sp(4), left: sp(6), right: sp(6) },
    verticalAlign: "center",
  })) }),
], W);

// ── Pipeline step ─────────────────────────────────────────────────────────────
const STEP = (n, title, lines, col = C.blue) => new TableCell({
  children: [
    new Paragraph({ children: [R("STEP " + n, { sz: 7.5, bold: true, color: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(6), after: sp(2) } }),
    new Paragraph({ children: [R(title, { sz: 10.5, bold: true, color: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(4) } }),
    ...lines.map(l => new Paragraph({ children: [R(l, { sz: 9.5, color: C.g70 })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(2) } })),
    SPC(4),
  ],
  shading: sh(C.white),
  width: { size: Math.round(W / 5), type: WidthType.DXA },
  margins: { top: sp(4), bottom: sp(4), left: sp(6), right: sp(6) },
  borders: { top: { style: BorderStyle.SINGLE, size: 18, color: col }, bottom: BThin, left: BThin, right: BThin },
});

// ── Bar chart row ─────────────────────────────────────────────────────────────
const BAR = (label, pct, val, col = C.blue) => {
  const bw = 4200, lw = 2400, vw = 760;
  const f = Math.round(bw * Math.min(pct, 100) / 100);
  return new TableRow({ children: [
    new TableCell({ children: [BODY(label, { sz: 9.5, after: 0 })], width: { size: lw, type: WidthType.DXA }, shading: sh(C.white), borders: NO_B, margins: { top: sp(3), bottom: sp(3), right: sp(5) }, verticalAlign: "center" }),
    new TableCell({ children: [SPC(0)], width: { size: f, type: WidthType.DXA }, shading: sh(col), borders: NO_B }),
    new TableCell({ children: [SPC(0)], width: { size: bw - f, type: WidthType.DXA }, shading: sh(C.g20), borders: NO_B }),
    new TableCell({ children: [P([R(val, { sz: 9.5, bold: true, color: col })], { after: 0, align: AlignmentType.RIGHT })], width: { size: vw, type: WidthType.DXA }, shading: sh(C.white), borders: NO_B, margins: { top: sp(3), bottom: sp(3), left: sp(5) }, verticalAlign: "center" }),
  ]});
};

// ── Page margin ───────────────────────────────────────────────────────────────
const MARGIN = { top: inch(0.85), bottom: inch(0.75), left: inch(1.0), right: inch(1.0) };

// ── Header / Footer ───────────────────────────────────────────────────────────
const HDR = () => new Header({ children: [
  new Paragraph({
    children: [
      R("IBM \u00D7 HORIZON BCBS  —  APPLICATION DELIVERY, QUALITY & OPERATIONS TRANSFORMATION  |  CONFIDENTIAL", { sz: 7.5, bold: true, color: C.g50 }),
    ],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.blue, space: 6 } },
    spacing: { after: 0 },
  }),
]});
const FTR = () => new Footer({ children: [
  new Paragraph({
    children: [
      R("CareOps360  \u00B7  IBM AIOps  \u00B7  IBM Consulting Advantage  \u00B7  April 2026  —  ", { sz: 7.5, color: C.blue }),
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
  title:       "IBM \u00D7 Horizon BCBS — Application Delivery, Quality & Operations Transformation",
  description: "Executive Summary — April 2026",
  sections: [

    // ══════════════════════════════════════════════════════════════════════════
    //  COVER PAGE  (zero-margin, no header/footer)
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: [

        // IBM Blue top accent bar
        new Paragraph({
          children: [R("  IBM CONSULTING   |   HEALTHCARE & PAYER DELIVERY   |   AMS PRACTICE", { sz: 9, bold: true, color: C.white })],
          shading: sh(C.navy),
          spacing: { before: sp(14), after: sp(14) },
        }),
        new Paragraph({ children: [], shading: sh(C.blue), spacing: { before: 0, after: sp(3) } }),

        SPC(30),

        // Reference line
        new Paragraph({
          children: [R("CONFIDENTIAL   |   APRIL 2026   |   REF: IBM-HZN-AMS-RFP-2026-CAS", { sz: 8.5, bold: true, color: C.blue })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 0, after: sp(10) },
          indent: { right: inch(1.1) },
        }),

        // Eyebrow
        new Paragraph({
          children: [R("IBM  \u00D7  HORIZON BLUE CROSS BLUE SHIELD OF NEW JERSEY", { sz: 11, bold: true, color: C.blue })],
          spacing: { before: 0, after: sp(6) },
          indent: { left: inch(1.1) },
        }),

        // Main title — 3 lines, large navy bold
        new Paragraph({ children: [R("Application Delivery,",      { sz: 40, bold: true, color: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("Quality Engineering &",      { sz: 40, bold: true, color: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("Operations Transformation",  { sz: 40, bold: true, color: C.blue })], spacing: { before: 0, after: sp(5) }, indent: { left: inch(1.1) } }),

        new Paragraph({
          children: [R("AI-First   \u00B7   Outcome-Based   \u00B7   Zero-Touch Operations   \u00B7   Member-Centred", { sz: 12, it: true, color: C.g50 })],
          spacing: { before: 0, after: sp(20) },
          indent: { left: inch(1.1) },
        }),

        // Submitted-by/to block — simple ghost table for alignment
        TBL([
          new TableRow({ children: [
            GC([new Paragraph({ children: [R("Submitted by:", { sz: 10, bold: true, color: C.navy })], spacing: { before: 0, after: sp(2) } }),
                new Paragraph({ children: [R("IBM Consulting", { sz: 10, color: C.g70 })], spacing: { before: 0, after: sp(1) } }),
                new Paragraph({ children: [R("Healthcare & Payer Delivery — AMS Practice", { sz: 10, color: C.g70 })], spacing: { before: 0, after: 0 } })],
              Math.round(W * 0.44)),
            GC([new Paragraph({ children: [R("Submitted to:", { sz: 10, bold: true, color: C.navy })], spacing: { before: 0, after: sp(2) } }),
                new Paragraph({ children: [R("Horizon Blue Cross Blue Shield of New Jersey", { sz: 10, color: C.g70 })], spacing: { before: 0, after: sp(1) } }),
                new Paragraph({ children: [R("Executive Leadership & Technology Office", { sz: 10, color: C.g70 })], spacing: { before: 0, after: 0 } })],
              Math.round(W * 0.56)),
          ]}),
        ], W),

        SPC(6),

        TBL([
          new TableRow({ children: [
            GC([new Paragraph({ children: [R("Document Classification:", { sz: 10, bold: true, color: C.navy }), R("   CONFIDENTIAL", { sz: 10, color: C.g70 })], spacing: { before: 0, after: sp(2) } }),
                new Paragraph({ children: [R("Date:", { sz: 10, bold: true, color: C.navy }), R("   April 2026", { sz: 10, color: C.g70 })], spacing: { before: 0, after: sp(2) } }),
                new Paragraph({ children: [R("Reference:", { sz: 10, bold: true, color: C.navy }), R("   IBM-HZN-AMS-RFP-2026-CAS", { sz: 10, color: C.g70 })], spacing: { before: 0, after: 0 } })],
              W),
          ]}),
        ], W),

        SPC(30),

        // Footer bar
        new Paragraph({
          children: [R("Powered by CareOps360  \u00B7  IBM AIOps  \u00B7  IBM Consulting Advantage  \u00B7  HIPAA Compliant  \u00B7  \u00A9 2026 IBM Corporation", { sz: 8.5, color: C.white })],
          shading: sh(C.navy),
          alignment: AlignmentType.CENTER,
          spacing: { before: sp(5), after: sp(5) },
        }),
      ],
    },

    // ══════════════════════════════════════════════════════════════════════════
    //  ALL CONTENT — single section, single column, pageBreakBefore per section
    // ══════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: MARGIN } },
      ...hf(),
      children: [

        // ──────────────────────────────────────────────────────────────────────
        //  TABLE OF CONTENTS
        // ──────────────────────────────────────────────────────────────────────
        new Paragraph({
          children: [R("IBM \u00D7 Horizon BCBS — Application Delivery, Quality & Operations Transformation", { sz: 9, bold: true, color: C.blue })],
          spacing: { before: 0, after: sp(2) },
        }),
        new Paragraph({
          children: [R("Executive Summary  |  April 2026  |  Confidential", { sz: 9, color: C.g50, it: true })],
          spacing: { before: 0, after: sp(8) },
        }),
        RULE(C.blue, 8, 0, 10),

        TBL([
          ...[ ["01", "Executive Summary",                           "A Boardroom Overview of the IBM Transformation Proposal"],
               ["02", "The Delivery Imperative",                    "Current State, Strategic Objectives & IBM Solution Design"],
               ["03", "AI-First Application Development",           "How IBM Builds Faster, Safer and at Scale"],
               ["04", "Quality Engineering",                        "Measurable Quality at Every Milestone"],
               ["05", "AIOps & Agentic Operations",                 "From Reactive to Autonomous, Self-Healing Operations"],
               ["06", "Business Outcomes & Value Realization",       "Domain KPIs, ROI Framework & Governance Cadence"],
               ["07", "Phased Transformation Roadmap",              "Risk-Controlled Delivery from Stabilization to Autonomous Ops"],
               ["08", "Why IBM",                                    "Scale, Depth, Skin in the Game & Next Steps"],
          ].map(([num, title, sub], i) => new TableRow({ children: [
            DC(num,   W * 0.06, { bold: true, color: C.blue, fill: alt(i), align: AlignmentType.CENTER }),
            DC(title, W * 0.38, { bold: true, fill: alt(i) }),
            DC(sub,   W * 0.56, { color: C.g70, fill: alt(i), sz: 9.5, it: true }),
          ]})),
        ], W),

        // ──────────────────────────────────────────────────────────────────────
        //  01  EXECUTIVE SUMMARY
        // ──────────────────────────────────────────────────────────────────────
        ...SEC("01", "Executive Summary", "A Strategic Proposal for AI-Led Transformation of Application Management Services"),

        ...QUOTE(
          "IBM is not proposing a technology project — IBM is proposing a transformation partnership that embeds AI-driven intelligence into the operating model of Horizon BCBS, enabling a future-ready enterprise that is faster, smarter, and more resilient than today.",
          "IBM Consulting, Healthcare & Payer Delivery"
        ),

        H2("The Moment"),
        BODY("Horizon BCBS manages approximately 500+ applications spanning enrollment, claims adjudication, member services, and data platforms. The organization faces mounting pressure to modernize operations, reduce administrative burden, and deliver measurably better member and provider experiences."),
        BODY("The incumbent delivery model — reactive, labor-intensive, and fragmented across towers — is no longer sufficient to meet Horizon's growth objectives or competitive imperatives."),

        H2("What IBM Proposes"),
        BODY("IBM proposes a structured transition from reactive application support to a predictive, self-healing, and continuously improving AI-first operating model — delivered through IBM's proven Assets, Assistants, and Accelerators framework, and governed through an outcome-based accountability model that ties IBM's performance to Horizon's business results."),

        H2("Five Strategic Commitments"),
        ...[ "AI-First Operating Model — AI embedded across every layer of AMS and QA lifecycle.",
             "Tech Arbitrage over Labor Arbitrage — Compressing cost through automation, not headcount.",
             "Outcome-Based Delivery — Committed SLAs tied to measurable business outcomes.",
             "Zero-Disruption Transition — Risk-free phased migration protecting operational continuity.",
             "Continuous Innovation Engine — IBM–Horizon Transformation Office driving sustained value beyond steady state.",
        ].map(BULL),

        SPC(6),
        H2("IBM's Scale Behind This Proposal"),
        ...[ "20,000+ AI & data practitioners globally.",
             "81,000+ cloud & architecture experts across IBM Consulting.",
             "40,000+ AI & analytics engagements delivered for global clients.",
             "9 of 10 top US health payers served by IBM Consulting.",
             "IBM's Client-0 AI programme saved IBM approximately $3.4B USD — we apply the same model here.",
        ].map(BULL),

        SPC(8),
        STATS([
          ["500+",     "Applications in Scope",              C.blue  ],
          ["Day 1",    "Efficiencies & Cost Reduction",      C.azure ],
          ["24\u00D77","Global AIOps Coverage",              C.teal  ],
          ["AI-First", "Operating Model Commitment",         C.purple],
        ]),

        // ──────────────────────────────────────────────────────────────────────
        //  02  THE DELIVERY IMPERATIVE
        // ──────────────────────────────────────────────────────────────────────
        ...SEC("02", "The Delivery Imperative", "Understanding Horizon\u2019s Strategic Objectives and IBM\u2019s Solution Design Rationale"),

        H2("What Horizon Needs"),
        BODY("Horizon BCBS requires the right strategic partner to enhance and support Application Development, Maintenance, Data, and Testing Services — with a clear focus on AI solutions native to the Horizon environment."),

        H2("Service Transformation Goals"),
        ...[ "High-quality services through AI and automation to achieve operational efficiencies.",
             "Realization of a product-oriented operating model aligned to business domains.",
             "Focused automation — especially in testing and quality engineering — to measurably reduce cost.",
             "AI tools to drive Agile application modernization across the portfolio.",
             "Consultative support applying deep healthcare payer best practices.",
        ].map(BULL),

        H2("Factors That Shaped IBM's Solution"),
        H3("End-to-End Integrated Delivery"),
        BODY("A unified operating model across Application Maintenance, Development, Testing, and Data — reducing fragmentation and improving accountability across the full lifecycle."),
        H3("AI at the Core — Not Bolted On"),
        BODY("AI is embedded in triage, root cause analysis, resolution, test automation, and continuous validation from the first day of delivery — not added later as an accelerator."),
        H3("Transition Without Disruption"),
        BODY("IBM's phased transition approach maintains seamless service continuity while progressively modernizing the underlying operating model."),
        H3("Open, Elastic Architecture"),
        BODY("Plug-and-play architecture deploys on Horizon's existing AWS stack — avoiding lock-in and enabling flexibility across cloud ecosystems."),

        SPC(6),
        ...QUOTE("IBM's solution shifts Horizon from reactive incident management to predictive, autonomous operations.", ""),

        H2("Current State vs. IBM 12-Month Targets"),
        BODY("All current-state estimates are directional and will be formally baselined during Phase 0. IBM's committed targets are contractually agreed at programme commencement.", { sz: 9.5, color: C.g50, it: true, after: 6 }),
        TBL([
          new TableRow({ children: [HC("Operational Metric", W*0.38), HC("Estimated Current State", W*0.22), HC("IBM 12-Month Target", W*0.22), HC("Direction", W*0.18)] }),
          ...[ ["Test Automation Coverage",       "~25%",          "80%+",               "\u2191 +3\u00D7"],
               ["MTTR (Mean Time to Resolve)",    "> 4 hours",     "< 1.8 hours",        "\u2193 55%"],
               ["Defect Escape to Production",    "High / Untracked","65% Reduction",    "\u2193 Best-in-class"],
               ["Incident P3/P4 Auto-Resolution", "< 10%",         "> 74%",              "\u2191 7\u00D7"],
               ["Regression Cycle Time",          "Multi-day manual","70% Faster",       "\u2193 Automated"],
               ["Alert Noise per Shift",          "Unfiltered",    "> 60% Reduced",      "\u2193 AI-filtered"],
               ["System Availability",            "~99.7%",        "99.9%+",             "\u2191 AI-ops"],
          ].map(([a,b,c,d], i) => new TableRow({ children: [
            DC(a, W*0.38, { bold: true, fill: alt(i) }),
            DC(b, W*0.22, { color: C.red, fill: alt(i), align: AlignmentType.CENTER }),
            VC(c, W*0.22, { align: AlignmentType.CENTER }),
            DC(d, W*0.18, { color: C.blue, bold: true, fill: alt(i), align: AlignmentType.CENTER }),
          ]})),
        ], W),

        // ──────────────────────────────────────────────────────────────────────
        //  03  AI-FIRST APPLICATION DEVELOPMENT
        // ──────────────────────────────────────────────────────────────────────
        ...SEC("03", "AI-First Application Development", "Build Faster. Ship Safer. Modernise Continuously."),

        ...QUOTE(
          "When a member's enrollment takes two weeks because a downstream application is slow, that is a trust problem. IBM engineers the fix — not as an ambition, but as a committed delivery outcome.",
          "IBM Consulting — Member Experience Engineering"
        ),

        H2("How IBM Builds Faster"),
        H3("AI-Assisted Development"),
        BODY("AI coding assistants generate code, flag risk patterns, and suggest optimisations in real time. Developer throughput increases 25–35% without adding headcount. Every engineer delivers more value per sprint."),
        H3("Risk-Scored Automated Release Gates"),
        BODY("Every change passes AI-scored gates across security, performance, coverage, and risk profile. Low-risk changes deploy without waiting for a human approval cycle — accelerating delivery while reducing incidents."),
        H3("Domain-Aligned Product Squads"),
        BODY("Development teams align to Horizon's business domains — Claims, Enrollment, Member, Provider. Context stays with the squad; handoff overhead is eliminated and accountability is end-to-end."),
        H3("Modernisation in Stride"),
        BODY("Modernisation is embedded into every sprint — a refactor, an API wrap, a library upgrade — so the application estate improves continuously without a disruptive parallel programme or separate capital budget."),

        SPC(6),
        H2("Delivery Performance Targets"),
        TBL([
          new TableRow({ children: [HC("Delivery Metric", W*0.50), HC("Today", W*0.20), HC("IBM 12-Month Target", W*0.30)] }),
          ...[ ["Time to market",         "Baseline",    "25–40% faster"],
               ["Deployment frequency",   "Current",     "2\u00D7 current rate"],
               ["Change failure rate",    "Untracked",   "\u221260%"],
               ["Mean recovery time",     "> 4 hours",   "< 15 minutes"],
               ["Technical debt index",   "Unmanaged",   "\u221230% per year"],
          ].map(([a,b,c], i) => new TableRow({ children: [
            DC(a, W*0.50, { bold: true, fill: alt(i) }),
            DC(b, W*0.20, { color: C.g50, fill: alt(i), align: AlignmentType.CENTER }),
            VC(c, W*0.30, { align: AlignmentType.CENTER }),
          ]})),
        ], W),

        SPC(6),
        H2("Efficiency Gains by Capability"),
        BODY("Measured improvement vs. traditional delivery model at comparable payer engagements:", { sz: 9.5, color: C.g50, it: true, after: 6 }),
        TBL([
          BAR("AI-assisted coding",           80, "+30% capacity",    C.blue),
          BAR("Automated QE test generation", 75, "+25% QE speed",   C.teal),
          BAR("Risk-scored deployments",      70, "\u221260% failures", C.azure),
          BAR("Domain squad alignment",       65, "\u221240% handoffs", C.purple),
          BAR("Modernisation-in-stride",      60, "Debt \u221230%/yr", "005D5D"),
        ], W),

        SPC(8),
        STATS([
          ["25–40%", "Faster Time to Market",      C.blue ],
          ["2\u00D7", "Deployment Frequency",       C.azure],
          ["\u221260%","Change Failure Rate",        C.teal ],
          ["80%+",   "Test Automation in 12 Months", C.purple],
        ]),

        // ──────────────────────────────────────────────────────────────────────
        //  04  QUALITY ENGINEERING
        // ──────────────────────────────────────────────────────────────────────
        ...SEC("04", "Quality Engineering", "Measurable Quality at Every Milestone — Improved with Every Release"),

        H2("Self-Improving Quality Framework"),
        BODY("IBM's Quality Engineering model embeds measurable validation at every stage of development and production — creating a closed-loop feedback system within the CI/CD pipeline. Production insights, defect analytics, and automation metrics continuously refine testing strategies, enabling sustained defect reduction, faster recovery, and progressive quality improvement over time."),

        H2("The Four Quality Gates"),
        TBL([
          new TableRow({ children: [HC("Gate", W*0.18), HC("Trigger", W*0.22), HC("What Runs", W*0.40), HC("Human Touch", W*0.20)] }),
          ...[ ["Commit",   "Every push",           "AI code review, coverage delta, security scan",    "None"],
               ["Build",    "CI pipeline",          "Unit tests, static analysis, lint checks",         "None"],
               ["Staging",  "Pre-release",          "Integration, performance, regression, E2E",        "None"],
               ["Release",  "Deploy approval",      "AI risk score, compliance check, rollback gate",   "Tier 1 only"],
          ].map(([a,b,c,d], i) => new TableRow({ children: [
            DC(a, W*0.18, { bold: true, color: C.blue, fill: alt(i) }),
            DC(b, W*0.22, { color: C.g70, fill: alt(i) }),
            DC(c, W*0.40, { color: C.g70, fill: alt(i) }),
            VC(d, W*0.20, { align: AlignmentType.CENTER }),
          ]})),
        ], W),

        H2("AI-Powered Quality Capabilities"),
        H3("GenAI Test Generation"),
        BODY("AI synthesises regression, integration, and edge-case tests directly from the code change — at commit speed. Coverage grows automatically without manual test-plan authoring."),
        H3("Defect Prediction AI"),
        BODY("Models trained on Horizon's own incident history identify high-risk code paths before they reach UAT — catching defects where they are cheapest to fix."),
        H3("Production Feedback Loop"),
        BODY("Every production defect teaches the quality engine. Each release cycle the test suite tightens automatically — an ever-improving net that strengthens without manual intervention."),

        SPC(6),
        H2("Test Automation Coverage Journey"),
        BODY("Month-by-month progression from current state to IBM's 12-month target:", { sz: 9.5, it: true, color: C.g50, after: 6 }),
        TBL([
          BAR("Baseline  — Month 0",    25, "~25%",   C.g50),
          BAR("Ignite    — Month 3",    45, "45%",    "0072C3"),
          BAR("Scale     — Month 6",    62, "62%",    C.azure),
          BAR("Optimise  — Month 9",    75, "75%",    C.blue),
          BAR("Target    — Month 12",   82, "82%+",   C.navy),
        ], W),

        SPC(6),
        H2("Quality Metrics — Before & After"),
        TBL([
          new TableRow({ children: [HC("Metric", W*0.40), HC("Current State", W*0.28), HC("IBM Target", W*0.32)] }),
          ...[ ["Test Automation Coverage",    "~25%",          "80%+"],
               ["Defect Escape to Production", "High",          "\u221265%"],
               ["Regression Cycle Time",       "Multi-day",     "\u221270%"],
               ["Mean Time to Detect",         "> 2 hours",     "< 15 minutes"],
          ].map(([a,b,c], i) => new TableRow({ children: [
            DC(a, W*0.40, { bold: true, fill: alt(i) }),
            DC(b, W*0.28, { color: C.red, fill: alt(i), align: AlignmentType.CENTER }),
            VC(c, W*0.32, { align: AlignmentType.CENTER }),
          ]})),
        ], W),

        SPC(8),
        CALLOUT("Every defect that reaches production is a promise broken — a member's benefit delayed, a provider's claim processed incorrectly. IBM's quality engine is designed so those defects never leave the building."),

        // ──────────────────────────────────────────────────────────────────────
        //  05  AIOPS & AGENTIC OPERATIONS
        // ──────────────────────────────────────────────────────────────────────
        ...SEC("05", "AIOps & Agentic Operations", "From Reactive Incident Management to Autonomous, Self-Healing Operations"),

        ...QUOTE(
          "A provider should never have to call a helpdesk because a claims system is slow. A member should never see an error because two systems failed to sync overnight. IBM's AI operations model is designed so those moments simply stop happening.",
          "IBM AIOps — Zero-Touch Operations"
        ),

        H2("The Agentic AI Architecture"),
        BODY("IBM's AIOps framework is built on a multi-agent architecture where specialized AI agents handle distinct responsibilities across the incident lifecycle — from detection through resolution and continuous learning."),

        H2("Agent Roles"),
        H3("Detection & Correlation Agent"),
        BODY("Correlates signals across 140+ monitoring sources. Reduces alert noise by more than 60% — operations teams see only what matters."),
        H3("Triage Agent"),
        BODY("Prioritises tickets based on impact, urgency, and historical patterns — eliminating manual queue management and ensuring the right team responds immediately."),
        H3("Root Cause Analysis Agent"),
        BODY("Identifies root cause within minutes by correlating telemetry, logs, and change records across the full technology estate."),
        H3("Resolution Agent"),
        BODY("Suggests or executes remediation steps based on runbooks and past resolutions. Resolves more than 74% of P3/P4 incidents without human action."),
        H3("Runbook Generation Agent"),
        BODY("Auto-generates and updates runbooks from resolved incidents — compounding operational knowledge over time and eliminating reliance on institutional memory."),

        SPC(6),
        H2("Zero-Touch Operations Pipeline"),
        TBL([new TableRow({ children: [
          STEP("1", "Detect",   ["Correlate 140+\nsources", "Cut noise >60%"],       C.blue),
          STEP("2", "Triage",   ["Impact scoring", "Auto-prioritise", "Route instantly"], "0072C3"),
          STEP("3", "Diagnose", ["Root cause\nin minutes", "Pattern matching"],        C.azure),
          STEP("4", "Resolve",  ["Self-heal P3/P4", "Zero human touch"],               C.teal),
          STEP("5", "Learn",    ["Update runbooks", "Prevent recurrence"],             "005D5D"),
        ]})], W),

        SPC(8),
        H2("Value Realization — AIOps"),
        TBL([
          new TableRow({ children: [HC("Metric", W*0.45), HC("With IBM AIOps", W*0.28), HC("Est. Annual Value", W*0.27)] }),
          ...[ ["MTTR (Mean Time to Resolve)",    "< 1.8 hours",    "$2.0M – $3.0M"],
               ["Alert Noise per Shift",          "> 60% Reduced",  "$2.5M – $3.5M"],
               ["P3/P4 Auto-Resolution",          "> 74%",          "$1.5M – $2.0M"],
               ["Change Failure Rate",            "40% Reduction",  "$0.8M – $1.2M"],
               ["System Availability",            "99.9%+",         "$1.0M – $1.3M"],
               ["Ops Manual Triage Hours",        "~30% Reduction", "$1.3M – $1.5M"],
          ].map(([a,b,c], i) => new TableRow({ children: [
            DC(a, W*0.45, { bold: true, fill: alt(i) }),
            VC(b, W*0.28, { align: AlignmentType.CENTER }),
            VC(c, W*0.27, { align: AlignmentType.CENTER }),
          ]})),
        ], W),

        SPC(8),
        STATS([
          [">74%",    "P3/P4 Auto-Resolved",      C.blue  ],
          [">60%",    "Alert Noise Reduced",        C.teal  ],
          ["99.9%+",  "System Availability Target", C.azure ],
          ["<1.8 hrs","Mean Time to Resolve",       C.purple],
        ]),

        // ──────────────────────────────────────────────────────────────────────
        //  06  BUSINESS OUTCOMES & VALUE REALIZATION
        // ──────────────────────────────────────────────────────────────────────
        ...SEC("06", "Business Outcomes & Value Realization", "Every Initiative Connects to a Measurable Business Result"),

        ...QUOTE(
          "A payer that processes a claim faster spends less on administration and earns more member trust. A payer whose systems self-heal spends less on incidents and more on care.",
          "IBM Outcome Governance Framework"
        ),

        H2("Business Domain KPIs"),
        TBL([
          new TableRow({ children: [HC("Business Domain", W*0.28), HC("Key Business Metric", W*0.44), HC("12-Month Target", W*0.28)] }),
          ...[ ["Claims Operations",   "Adjudication cycle time",              "\u221230%"],
               ["Enrollment",          "Time-to-activation",                   "\u221240%"],
               ["Member Services",     "First-contact resolution rate",        "+25%"],
               ["Provider Operations", "Prior authorization turnaround",       "\u221235%"],
               ["Data & Reporting",    "Report delivery latency",              "\u221250%"],
               ["IT Operations",       "P3/P4 auto-resolution rate",           ">74%"],
          ].map(([a,b,c], i) => new TableRow({ children: [
            DC(a, W*0.28, { bold: true, fill: alt(i) }),
            DC(b, W*0.44, { color: C.g70, fill: alt(i) }),
            VC(c, W*0.28, { align: AlignmentType.CENTER }),
          ]})),
        ], W),

        SPC(6),
        H2("Cumulative Cost Takeout — Directional"),
        BODY("Baselines locked during Phase 0. Targets contractually committed at programme commencement.", { sz: 9.5, it: true, color: C.g50, after: 6 }),
        TBL([
          BAR("Month 3    — Ignite Phase",     12,  "$1M – $2M",    "0072C3"),
          BAR("Month 6    — Scale Phase",      30,  "$3M – $5M",    C.azure),
          BAR("Month 12   — Optimise Phase",   60,  "$6M – $10M",   C.blue),
          BAR("Month 24   — Transform Phase", 100,  "$12M – $18M+", C.navy),
        ], W),

        SPC(6),
        H2("Annual Value by Initiative — Steady State"),
        BODY("Estimated annual run-rate contribution once each capability reaches steady state:", { sz: 9.5, it: true, color: C.g50, after: 6 }),
        TBL([
          BAR("AIOps & Self-Healing Operations",    85, "$3.5M – $6.5M",  C.blue),
          BAR("GenAI Quality Engine",               72, "$2.5M – $4.0M",  C.teal),
          BAR("Zero-Touch Delivery Pipeline",       60, "$2.0M – $3.0M",  C.azure),
          BAR("Platform Modernisation",             48, "$1.5M – $2.5M",  C.purple),
          BAR("Demand & Ticket Reduction",          55, "$1.0M – $2.0M",  "005D5D"),
        ], W),

        SPC(6),
        H2("Governance Cadence"),
        TBL([
          new TableRow({ children: [HC("Forum", W*0.22), HC("Focus", W*0.56), HC("Cadence", W*0.22)] }),
          ...[ ["Operational Review",  "SLA, MTTR, pipeline velocity — live in CareOps360 with no manual reporting",   "Weekly"],
               ["Executive Briefing",  "Cost takeout, automation coverage, domain KPI progress",                       "Monthly"],
               ["Board / ELT Session", "Total value realised, innovation roadmap, year priorities",                    "Quarterly"],
          ].map(([a,b,c], i) => new TableRow({ children: [
            DC(a, W*0.22, { bold: true, fill: alt(i) }),
            DC(b, W*0.56, { color: C.g70, fill: alt(i) }),
            VC(c, W*0.22, { align: AlignmentType.CENTER }),
          ]})),
        ], W),
        SPC(6),
        CALLOUT("CareOps360 — IBM's executive operations platform — makes every metric above visible in real time from Day 1. No manual reporting. No quarterly decks. Live data, always."),

        // ──────────────────────────────────────────────────────────────────────
        //  07  PHASED TRANSFORMATION ROADMAP
        // ──────────────────────────────────────────────────────────────────────
        ...SEC("07", "Phased Transformation Roadmap", "Risk-Controlled  \u00B7  Compounding Value  \u00B7  Contractual SLAs  \u00B7  Zero Operational Disruption"),

        ...QUOTE(
          "Every day a claim processes faster, a prior auth returns sooner, or an outage resolves before it is noticed — that is a day Horizon's members and providers experience the IBM difference. That starts in Week 1, not Year 2.",
          "IBM Delivery Governance"
        ),

        H2("Phase-by-Phase Delivery"),
        TBL([
          new TableRow({ children: [HC("Phase", W*0.14), HC("Timeframe", W*0.10), HC("Key Deliverables", W*0.46), HC("Value Signal", W*0.30)] }),
          ...[ ["Phase 0\nFoundation",   "0–8 Wks",
                "Telemetry onboarding  \u00B7  Baseline lock  \u00B7  AI environment setup  \u00B7  CareOps360 live  \u00B7  Innovation Council constituted",
                "Live dashboards  \u00B7  Baselines agreed  \u00B7  Zero BAU disruption"],
               ["Phase 1\nIgnite",       "Mo 1–3",
                "AIOps live  \u00B7  P3/P4 self-heal pilots  \u00B7  GenAI QE framework  \u00B7  AI development sprints  \u00B7  First quick-win automations",
                "MTTR \u221220%  \u00B7  First automation ROI  \u00B7  QE coverage 45%"],
               ["Phase 2\nScale",        "Mo 3–6",
                "Agentic triage at scale  \u00B7  Integration Hub Wave 1  \u00B7  QE 60%  \u00B7  AI dev across all domain pods",
                "Auto-resolve >50%  \u00B7  Defect escape \u221240%  \u00B7  $3–5M cumulative"],
               ["Phase 3\nOptimise",     "Mo 6–12",
                "Autonomous ops  \u00B7  QE 80%+  \u00B7  Modernisation sprints  \u00B7  Full outcome governance",
                "Cost takeout $6–10M  \u00B7  MTTR <1.8 hrs  \u00B7  99.9%+ availability"],
               ["Phase 4\nTransform",    "Yr 1–2",
                "Full autonomous estate  \u00B7  Mainframe rehost/refactor  \u00B7  Enterprise observability  \u00B7  Co-invest innovation pipeline",
                "Cost takeout 40–50%  \u00B7  Total value $12–18M+"],
          ].map(([ph,ti,de,va], i) => new TableRow({ children: [
            DC(ph, W*0.14, { bold: true, color: C.navy, fill: alt(i) }),
            DC(ti, W*0.10, { color: C.g50, fill: alt(i), align: AlignmentType.CENTER }),
            DC(de, W*0.46, { color: C.g70, fill: alt(i) }),
            VC(va, W*0.30),
          ]})),
        ], W),

        SPC(8),
        H2("Continuous KPI Governance via CareOps360"),
        TBL([
          new TableRow({ children: [HC("Value Area", W*0.20), HC("KPIs Tracked in CareOps360", W*0.45), HC("Data Source", W*0.22), HC("Cadence", W*0.13)] }),
          ...[ ["Operational",    "MTTR, availability, auto-resolution %, incident volume",               "ITSM + AIOps",      "Weekly"],
               ["Cost",           "Automation ROI, demand reduction, delivery velocity",                  "Finance + ITSM",    "Monthly"],
               ["Quality",        "Coverage %, defect escape, regression time, MTTD",                    "QE + CI/CD",        "Per Sprint"],
               ["Platform",       "n\u22121 compliance, debt index, CVE status, upgrade velocity",        "CMDB + Security",   "Monthly"],
               ["Business",       "Claims cycle, enrolment time, first-call resolution, provider ASA",   "Domain dashboards", "Monthly"],
          ].map(([a,b,c,d], i) => new TableRow({ children: [
            DC(a, W*0.20, { bold: true, fill: alt(i) }),
            DC(b, W*0.45, { color: C.g70, fill: alt(i) }),
            DC(c, W*0.22, { color: C.g70, fill: alt(i) }),
            VC(d, W*0.13, { align: AlignmentType.CENTER }),
          ]})),
        ], W),

        // ──────────────────────────────────────────────────────────────────────
        //  08  WHY IBM — CALL TO ACTION
        // ──────────────────────────────────────────────────────────────────────
        ...SEC("08", "Why IBM — and Why Now", "Scale, Depth, Skin in the Game & Next Steps"),

        ...QUOTE(
          "IBM's ultimate accountability is not to a contract — it is to the 3.7 million members who rely on Horizon's systems every day. The patient waiting for a prior auth. The provider navigating a claims dispute. The family enrolling for the first time.",
          "IBM Consulting, Healthcare & Payer Delivery"
        ),

        H2("What Makes IBM Different"),
        H3("Production-Grade Assets, Available Day 1"),
        BODY("IBM AIOps, CareOps360, IBM Consulting Advantage, and the GenAI Quality Engine are live at comparable payers today — not promised in a future roadmap. Horizon benefits from day one."),
        H3("Deep Healthcare Payer DNA"),
        BODY("Claims, enrollment, prior auth, member services — IBM has modernised these for the nation's largest payers. The patterns are proven, documented, and portable into the Horizon environment."),
        H3("Shared Risk Model — Not Shared Credit"),
        BODY("IBM commits to outcome-based SLAs. Targets missed trigger IBM remediation plans — not contract renegotiations or rate discussions. IBM carries the delivery risk."),
        H3("Continuous Innovation Included"),
        BODY("Innovation sprints, AI tooling, and accelerators are built into the base delivery model. Transformation is not a separate future line item."),

        SPC(4),
        H2("IBM vs. The Alternative"),
        TBL([
          new TableRow({ children: [HC("Dimension", W*0.22), HC("Status Quo / Incumbent", W*0.38), HC("IBM Partnership", W*0.40)] }),
          ...[ ["Operating Model",  "Siloed towers, reactive firefighting",      "Unified domain pods, AI-first, accountable"],
               ["Development",      "Manual pipelines, slow delivery",           "AI-assisted, 25–40% faster, risk-scored"],
               ["Quality",          "End-stage gate testing at ~25% automation", "Shift-left GenAI quality engine at 80%+"],
               ["Operations",       "Human-driven incident management",          "Agentic self-healing, >74% auto-resolved"],
               ["Cost Structure",   "Labour arbitrage, headcount-dependent",     "Technology-driven takeout, 40–50%"],
               ["Reporting",        "Activity-based, quarterly manual decks",    "Real-time business outcome dashboards"],
               ["Risk Model",       "Vendor bears none — client absorbs all",   "Shared outcome SLAs — IBM accountable"],
          ].map(([a,b,c], i) => new TableRow({ children: [
            DC(a, W*0.22, { bold: true, fill: alt(i) }),
            DC(b, W*0.38, { color: C.red, fill: alt(i) }),
            VC(c, W*0.40),
          ]})),
        ], W),

        SPC(8),
        H2("The Next Three Steps"),
        ...[ ["Weeks 1–2", "Executive alignment session. Horizon leadership and IBM account team agree scope, objectives, and governance model."],
             ["Weeks 2–4", "Phase 0 Statement of Work agreed. Telemetry onboarding begins. IBM–Horizon Innovation Council constituted. Baselines established."],
             ["Week 4",    "Phase 0 is live. IBM and Horizon operate as one integrated team from this date forward."],
        ].flatMap(([t,d]) => [new Paragraph({
          children: [R(t + "   ", { sz: 11, bold: true, color: C.blue }), R(d, { sz: 10.5, color: C.g70 })],
          spacing: { before: sp(5), after: sp(3) },
        })]),

        SPC(8),
        RULE(C.blue, 8, 0, 6),

        new Paragraph({
          children: [
            R("\u201CIBM's measure of success is not tickets closed or alerts silenced. It is the member who gets their answer faster, the provider who spends less time on administration, and the ", { sz: 11, it: true, color: C.g70 }),
            R("payer that directs every saved dollar back toward the care that matters.", { sz: 11, bold: true, it: true, color: C.navy }),
            R("\u201D", { sz: 11, it: true, color: C.g70 }),
          ],
          spacing: { before: sp(4), after: sp(4) },
        }),

        new Paragraph({
          children: [R("\u2014  IBM Consulting, Healthcare & Payer Delivery  |  April 2026", { sz: 9.5, bold: true, color: C.blue })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 0, after: sp(8) },
        }),

        RULE(C.g20, 2, 0, 6),

        P([R("\u00A9 2026 IBM Corporation. All rights reserved.  Confidential — prepared exclusively for Horizon Healthcare Services, Inc.  Ref: IBM-HZN-AMS-RFP-2026-CAS", { sz: 8, color: C.g50 })],
          { align: AlignmentType.CENTER }),

        SPC(4),
        STATS([
          ["500+",     "Applications in Scope",         C.blue  ],
          ["40–50%",   "Structural Cost Takeout",        C.azure ],
          ["80%+",     "Test Automation in 12 Months",   C.teal  ],
          [">74%",     "Incidents Auto-Resolved",         C.purple],
        ]),
      ],
    },
  ],
});

const buf = await Packer.toBuffer(doc);
writeFileSync("attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx", buf);
console.log("Done — " + buf.length.toLocaleString() + " bytes");
