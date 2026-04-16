import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle, WidthType,
  ShadingType, TableLayoutType, Header, Footer, PageNumber,
  convertInchesToTwip, PageBreak,
} from "docx";
import { writeFileSync } from "fs";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  blue:  "0F62FE", navy:  "001141",
  teal:  "007D79", green: "198038",
  red:   "DA1E28", amber: "F1C21B",
  g10:   "F4F4F4", g20:   "E0E0E0", g30:   "C6C6C6",
  g50:   "8D8D8D", g70:   "525252", g100:  "161616",
  white: "FFFFFF",
  lb1:   "EBF2FF",   // very light blue — main light fill
  lb2:   "D0E2FF",   // slightly stronger — table header fill
  lb3:   "A6C8FF",   // medium accent (borders)
};
const FONT = "Calibri";
const hp   = (pt) => Math.round(pt * 2);    // → half-points (font size)
const sp   = (pt) => Math.round(pt * 20);   // → twips       (spacing / margin)
const inch = (i)  => convertInchesToTwip(i);
const W    = 9360;                            // content width DXA (6.5 in)

// ── Text run ──────────────────────────────────────────────────────────────────
const R = (text, { sz = 10.5, bold = false, it = false, color = C.g100 } = {}) =>
  new TextRun({ text, font: FONT, size: hp(sz), bold, italics: it, color });

// ── Paragraph ─────────────────────────────────────────────────────────────────
const P = (children, { before = 0, after = 3, left = 0, right = 0, align } = {}) =>
  new Paragraph({
    children: Array.isArray(children) ? children : [children],
    spacing: { before: sp(before), after: sp(after) },
    indent: (left || right) ? { left: sp(left), right: sp(right) } : undefined,
    alignment: align,
  });

const body = (text) => P([R(text, { sz: 10.5 })], { after: 3 });

const bull = (text, { color = C.g100, sz = 10.5 } = {}) =>
  new Paragraph({
    children: [R(text, { sz, color })],
    bullet: { level: 0 },
    spacing: { before: sp(1), after: sp(2) },
  });

const spc = (pt = 4) => new Paragraph({ children: [R("")], spacing: { before: 0, after: sp(pt) } });

// Section heading: thin IBM-blue top rule + number + title
const sHead = (num, title, tag = "") => [
  new Paragraph({
    children: [],
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: C.blue, space: 6 } },
    spacing: { before: sp(12), after: sp(1) },
  }),
  new Paragraph({
    children: [
      R(num + "  ", { sz: 8, bold: true, color: C.blue }),
      R(title.toUpperCase(), { sz: 13, bold: true, color: C.navy }),
      ...(tag ? [R("   " + tag, { sz: 9.5, it: true, color: C.g50 })] : []),
    ],
    spacing: { before: sp(1), after: sp(tag ? 1 : 4) },
  }),
];

const subH = (text, { before = 6, after = 2, color = C.navy, sz = 10.5 } = {}) =>
  P([R(text, { sz, bold: true, color })], { before, after });

// ── Empathy quote ─────────────────────────────────────────────────────────────
// Centered, italic, large — no dark box, just a left border on light blue
const empQuote = (quote, attr = "") => [
  spc(4),
  new Paragraph({
    children: [R("\u201C" + quote + "\u201D", { sz: 11.5, it: true, color: C.navy })],
    alignment: AlignmentType.CENTER,
    spacing: { before: sp(4), after: sp(2) },
    indent: { left: inch(0.5), right: inch(0.5) },
  }),
  ...(attr ? [new Paragraph({
    children: [R("\u2014 " + attr, { sz: 9, bold: true, color: C.blue })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: sp(5) },
  })] : [spc(4)]),
  new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.lb3, space: 0 } },
    spacing: { before: 0, after: sp(5) },
    indent: { left: inch(1.5), right: inch(1.5) },
  }),
];

// ── Table helpers — LIGHT ONLY ────────────────────────────────────────────────
// All table headers use lb2 background + navy text. No dark backgrounds.
const nb = { style: BorderStyle.NONE };
const noBorders = { top: nb, bottom: nb, left: nb, right: nb, insideH: nb, insideV: nb };
const brd = (col = C.g20, sz = 2) => ({ style: BorderStyle.SINGLE, size: sz, color: col });

// Light header cell
const hc = (text, w, { sz = 9.5 } = {}) =>
  new TableCell({
    children: [P([R(text, { sz, bold: true, color: C.navy })], { before: 3, after: 3 })],
    margins: { top: sp(2), bottom: sp(2), left: sp(6), right: sp(6) },
    shading: { type: ShadingType.SOLID, fill: C.lb2 },
    width: w ? { size: w, type: WidthType.DXA } : undefined,
    borders: {
      top: brd(C.blue, 6), bottom: brd(C.blue, 3),
      left: brd(C.g20),    right: brd(C.g20),
    },
  });

// Regular data cell — alternating white / g10
const dc = (text, w, { bold = false, color = C.g100, shade, sz = 9.5, align } = {}) =>
  new TableCell({
    children: [new Paragraph({ children: [R(text, { sz, bold, color })], spacing: { before: sp(2), after: sp(2) }, alignment: align })],
    margins: { top: sp(2), bottom: sp(2), left: sp(6), right: sp(6) },
    shading: shade ? { type: ShadingType.SOLID, fill: shade } : undefined,
    width: w ? { size: w, type: WidthType.DXA } : undefined,
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd() },
  });

// Value cell — light blue bg, blue bold text
const vc = (text, w, { sz = 9.5 } = {}) =>
  dc(text, w, { bold: true, color: C.blue, shade: C.lb1, sz });

// Two-column invisible layout
const twoCol = (left, right, { lw = 0.48, gap = 0.04 } = {}) => {
  const lW = Math.round(W * lw);
  const gW = Math.round(W * gap);
  const rW = W - lW - gW;
  return new Table({
    width: { size: W, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders: noBorders,
    rows: [new TableRow({ children: [
      new TableCell({ children: left,     width: { size: lW, type: WidthType.DXA }, borders: noBorders, margins: { right: sp(8) } }),
      new TableCell({ children: [spc(0)], width: { size: gW, type: WidthType.DXA }, borders: noBorders }),
      new TableCell({ children: right,    width: { size: rW, type: WidthType.DXA }, borders: noBorders, margins: { left: sp(8) } }),
    ]})],
  });
};

// Horizontal bar chart row
const barRow = (label, pct, valText, { lw = 2400, bw = 5000, vw = 1960, col = C.blue } = {}) => {
  const fill = Math.round(bw * pct / 100);
  const rest = bw - fill;
  return new TableRow({ children: [
    new TableCell({ children: [P([R(label, { sz: 9, color: C.g70 })], { after: 0 })], width: { size: lw, type: WidthType.DXA }, borders: noBorders, margins: { top: sp(2), bottom: sp(2), right: sp(4) }, verticalAlign: "center" }),
    new TableCell({ children: [spc(0)], width: { size: fill, type: WidthType.DXA }, shading: { type: ShadingType.SOLID, fill: col }, borders: noBorders }),
    new TableCell({ children: [spc(0)], width: { size: rest, type: WidthType.DXA }, shading: { type: ShadingType.SOLID, fill: C.g20 }, borders: noBorders }),
    new TableCell({ children: [P([R(valText, { sz: 9, bold: true, color: col })], { after: 0, align: AlignmentType.RIGHT })], width: { size: vw, type: WidthType.DXA }, borders: noBorders, margins: { top: sp(2), bottom: sp(2), left: sp(4) }, verticalAlign: "center" }),
  ]});
};

// Pipeline stage card — clean white card, blue top border, no dark fill
const pipeCard = (step, title, lines, { col = C.blue } = {}) =>
  new TableCell({
    children: [
      new Paragraph({ children: [R(step, { sz: 7.5, bold: true, color: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(5), after: sp(1) } }),
      new Paragraph({ children: [R(title, { sz: 9.5, bold: true, color: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(2) } }),
      ...lines.map(l => new Paragraph({ children: [R(l, { sz: 8.5, color: C.g70 })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(1) } })),
      spc(4),
    ],
    shading: { type: ShadingType.SOLID, fill: C.white },
    width: { size: W / 5, type: WidthType.DXA },
    margins: { top: sp(2), bottom: sp(2), left: sp(4), right: sp(4) },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 12, color: col },
      bottom: brd(C.g20), left: brd(C.g20), right: brd(C.g20),
    },
  });

// Full-width light info bar
const infoBar = (text, { bg = C.lb1, color = C.navy } = {}) =>
  new Paragraph({
    children: [R(text, { sz: 9.5, bold: true, color })],
    shading: { type: ShadingType.SOLID, fill: bg },
    spacing: { before: sp(5), after: sp(5) },
    indent: { left: sp(10), right: sp(10) },
  });

// Cover KPI card
const kpiCard = (value, label, sub, w) =>
  new TableCell({
    children: [
      new Paragraph({ children: [R(value, { sz: 22, bold: true, color: C.blue })], alignment: AlignmentType.CENTER, spacing: { before: sp(8), after: sp(2) } }),
      new Paragraph({ children: [R(label, { sz: 9, bold: true, color: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(2) } }),
      new Paragraph({ children: [R(sub,   { sz: 8,  it: true,  color: C.g70  })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(8) } }),
    ],
    shading: { type: ShadingType.SOLID, fill: C.lb1 },
    margins: { top: sp(4), bottom: sp(4), left: sp(6), right: sp(6) },
    width: { size: w, type: WidthType.DXA },
    borders: { top: brd(C.blue, 8), bottom: brd(C.g20), left: brd(C.g20), right: brd(C.g20) },
  });

const blueHR = () => new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.blue, space: 3 } }, spacing: { before: sp(5), after: sp(5) } });
const thinHR = () => new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: C.g20,  space: 3 } }, spacing: { before: sp(4), after: sp(4) } });
const pageBreak = () => new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } });

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  creator: "IBM Consulting",
  title: "IBM × Horizon BCBS — Application Delivery, Quality & Operations Transformation",
  description: "Confidential — April 2026",
  sections: [

    // =========================================================================
    // PAGE 1 — COVER
    // =========================================================================
    {
      properties: { page: { margin: { top: inch(0), bottom: inch(0), left: inch(0), right: inch(0) } } },
      children: [
        // Navy top band
        new Paragraph({ children: [R("IBM CONSULTING   |   HEALTHCARE & PAYER DELIVERY", { sz: 8.5, bold: true, color: C.white })], shading: { type: ShadingType.SOLID, fill: C.navy }, alignment: AlignmentType.CENTER, spacing: { before: sp(14), after: sp(14) } }),
        // IBM Blue thin rule
        new Paragraph({ children: [], shading: { type: ShadingType.SOLID, fill: C.blue }, spacing: { before: 0, after: sp(2) } }),

        spc(30),

        new Paragraph({ children: [R("CONFIDENTIAL  |  APRIL 2026", { sz: 8, bold: true, color: C.blue })], alignment: AlignmentType.RIGHT, spacing: { before: 0, after: sp(6) }, indent: { right: inch(1.1) } }),
        new Paragraph({ children: [R("IBM × HORIZON BLUE CROSS BLUE SHIELD OF NEW JERSEY", { sz: 10, bold: true, color: C.blue })], spacing: { before: 0, after: sp(4) }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("Application Delivery,", { sz: 32, bold: true, color: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("Quality Engineering &", { sz: 32, bold: true, color: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("Operations Transformation", { sz: 32, bold: true, color: C.blue })], spacing: { before: 0, after: sp(4) }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("AI-First  ·  Business-Led  ·  Zero-Touch Delivery  ·  Member-Centred", { sz: 12, it: true, color: C.g70 })], spacing: { before: 0, after: sp(18) }, indent: { left: inch(1.1) } }),

        // 4 KPI cards — light blue, no dark fill
        new Table({
          width: { size: W + sp(8), type: WidthType.DXA }, layout: TableLayoutType.FIXED,
          rows: [new TableRow({ children: [
            kpiCard("40–50%", "Cost Takeout",            "vs. current operational run-rate", Math.round((W + sp(8)) / 4)),
            kpiCard("25–40%", "Faster Time to Market",   "across development & change",      Math.round((W + sp(8)) / 4)),
            kpiCard(">74%",   "Incidents Auto-Resolved", "P3/P4 zero-touch target",          Math.round((W + sp(8)) / 4)),
            kpiCard("80%+",   "Test Automation",         "from ~25% today",                  Math.round((W + sp(8)) / 4)),
          ]})],
        }),

        spc(12),

        // Cover quote — centred, empathetic
        new Paragraph({
          children: [R("\u201CA member who can\u2019t access their benefits, a provider waiting days for authorisation, a payer carrying the cost of an avoidable error — these are the problems IBM is here to solve. Technology is the means. Human outcomes are the only measure.\u201D", { sz: 10.5, it: true, color: C.navy })],
          alignment: AlignmentType.CENTER,
          spacing: { before: sp(6), after: sp(4) },
          indent: { left: inch(1.1), right: inch(1.1) },
        }),
        new Paragraph({ children: [R("\u2014 IBM Consulting, Healthcare & Payer Delivery", { sz: 9, bold: true, color: C.blue })], alignment: AlignmentType.RIGHT, spacing: { before: 0, after: sp(14) }, indent: { right: inch(1.1) } }),

        new Paragraph({ children: [], border: { top: brd(C.g20, 4) }, spacing: { before: sp(6), after: 0 }, indent: { left: inch(1.1), right: inch(1.1) } }),
        new Paragraph({
          children: [
            R("Prepared for: ", { sz: 8.5, bold: true, color: C.navy }), R("Horizon Healthcare Services     ", { sz: 8.5, color: C.g70 }),
            R("Submitted by: ", { sz: 8.5, bold: true, color: C.navy }), R("IBM Consulting — Healthcare & Payer     ", { sz: 8.5, color: C.g70 }),
            R("April 2026", { sz: 8.5, color: C.g70 }),
          ],
          spacing: { before: sp(5), after: sp(5) }, indent: { left: inch(1.1) },
        }),
        // Navy bottom footer band only
        new Paragraph({ children: [R("\u00A9 2026 IBM Corporation. All rights reserved.  Powered by CareOps360 \u00B7 IBM AIOps \u00B7 IBM Consulting Advantage", { sz: 7.5, color: C.white })], shading: { type: ShadingType.SOLID, fill: C.navy }, alignment: AlignmentType.CENTER, spacing: { before: sp(5), after: sp(5) } }),

        pageBreak(),
      ],
    },

    // =========================================================================
    // PAGES 2–10 — MAIN CONTENT
    // =========================================================================
    {
      properties: { page: { margin: { top: inch(0.85), bottom: inch(0.75), left: inch(1.0), right: inch(1.0) } } },
      headers: {
        default: new Header({ children: [
          new Paragraph({
            children: [
              R("IBM \u00D7 HORIZON BCBS  |  APPLICATION DELIVERY, QUALITY & OPERATIONS TRANSFORMATION", { sz: 7.5, bold: true, color: C.g50 }),
              R("  \u2014  CONFIDENTIAL", { sz: 7.5, bold: true, color: C.blue }),
            ],
            alignment: AlignmentType.RIGHT,
            border: { bottom: brd(C.blue, 4) },
          }),
        ]}),
      },
      footers: {
        default: new Footer({ children: [
          new Paragraph({
            children: [
              R("CareOps360  \u00B7  IBM AIOps  \u00B7  IBM Consulting Advantage  \u00B7  ICA", { sz: 7.5, bold: true, color: C.blue }),
              R("   |   \u00A9 2026 IBM Corporation   |   Page ", { sz: 7.5, color: C.g50 }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: hp(7.5), color: C.g50 }),
            ],
            border: { top: brd(C.g20, 2) },
            spacing: { before: sp(3) },
          }),
        ]}),
      },
      children: [

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 2 — THE STRATEGIC OPPORTUNITY
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("1.0", "The Strategic Opportunity", "Why this moment demands bold action"),

        ...empQuote(
          "A member delayed. A provider burdened. A payer absorbing the cost of inefficiency. These are not technology problems — they are human problems that technology must solve. That is the commitment IBM brings to Horizon.",
          "IBM Consulting — Healthcare & Payer Delivery"
        ),

        twoCol(
          [
            subH("Where Horizon Stands Today", { before: 0, after: 3 }),
            body("Horizon's 500+ applications are managed across siloed delivery teams. Speed, quality, and member experience all pay the price:"),
            spc(2),
            bull("Claims cycle times are constrained by manual processes and late-stage defects that reach production."),
            bull("Provider authorisations are delayed because integrations are batch-based rather than real-time."),
            bull("Member enrolment errors surface days after submission — long after trust is already damaged."),
            bull("Test automation at ~25% means the majority of quality assurance is slow, manual, and costly."),
            bull("Operations teams firefight recurring incidents instead of building the capability Horizon needs to grow."),
            spc(4),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Business Challenge", Math.round(W * 0.30)), hc("Impact on Stakeholders", Math.round(W * 0.18))] }),
              ...[ ["Slow claims processing",       "Members wait; trust erodes"], ["Manual prior auth",           "Providers lose time with patients"], ["Low test automation",         "Defects reach production"], ["Reactive operations",         "Unpredictable availability"], ["Technology debt growth",      "Rising cost & compliance risk"] ]
                .map(([a, b], i) => new TableRow({ children: [dc(a, Math.round(W * 0.30), { shade: i % 2 ? C.g10 : C.white }), dc(b, Math.round(W * 0.18), { color: C.red, sz: 9, shade: i % 2 ? C.g10 : C.white })] })),
            ]}),
          ],
          [
            subH("The IBM Response", { before: 0, after: 3 }),
            body("IBM proposes a unified partnership spanning Application Development, Quality Engineering, and Operations — with AI doing the heavy lifting so Horizon\u2019s teams can focus on outcomes, not overhead."),
            spc(2),
            bull("Faster development cycles through AI-assisted engineering and automated, risk-scored release pipelines."),
            bull("Quality built into every stage — from commit to production — so defects are caught before members ever feel them."),
            bull("Operations that self-heal: most incidents resolved automatically, before a provider or member notices anything."),
            bull("Modernisation embedded in every sprint — no separate project, no disruption to BAU."),
            bull("Executive transparency: real-time outcomes across cost, quality, speed, and member impact."),
            spc(4),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("IBM Capability", Math.round(W * 0.28)), hc("Business Outcome", Math.round(W * 0.20))] }),
              ...[ ["AI-First Development",   "25–40% faster delivery"], ["GenAI Quality Engine",  "80%+ test automation"], ["Agentic Operations",    ">74% auto-resolution"], ["Zero-Touch Delivery",  "\u221255% MTTR"], ["Outcome Governance",   "Real-time ROI visibility"] ]
                .map(([a, b], i) => new TableRow({ children: [dc(a, Math.round(W * 0.28), { bold: true, shade: i % 2 ? C.g10 : C.white }), vc(b, Math.round(W * 0.20))] })),
            ]}),
          ]
        ),

        pageBreak(),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 3 — THE OPERATING MODEL
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("2.0", "The IBM Operating Model", "One team. Three disciplines. One owner of outcomes."),

        body("IBM collapses siloed delivery towers into product-aligned teams that own Application Development, Quality Engineering, and Operations end-to-end. AI runs the engine beneath — routing, healing, testing, and deploying — while Horizon\u2019s teams own the outcomes."),
        spc(4),

        // Framework — light colours only, bordered cells
        new Table({ width: { size: W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
          // Business outcomes bar — light blue
          new TableRow({ children: [new TableCell({
            children: [
              P([R("BUSINESS OUTCOMES", { sz: 8.5, bold: true, color: C.navy })], { align: AlignmentType.CENTER, before: 2, after: 1 }),
              P([R("Claims  \u00B7  Enrollment  \u00B7  Member Services  \u00B7  Provider Operations  \u00B7  Data Products", { sz: 9, color: C.blue })], { align: AlignmentType.CENTER, before: 0, after: 2 }),
            ],
            shading: { type: ShadingType.SOLID, fill: C.lb2 },
            columnSpan: 5, margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
            borders: { top: brd(C.blue, 8), bottom: brd(C.blue, 3), left: brd(C.g20), right: brd(C.g20) },
          })] }),
          // 5 delivery pods — white cells with coloured top borders
          new TableRow({ children: [
            ["Application\nDevelopment", C.blue],
            ["Quality\nEngineering",     C.teal],
            ["Application\nManagement",  "0043CE"],
            ["Platform &\nIntegration",  "6929C4"],
            ["Data &\nAnalytics",        "005D5D"],
          ].map(([label, col]) => new TableCell({
            children: [P([R(label, { sz: 9, bold: true, color: col })], { align: AlignmentType.CENTER, before: 6, after: 6 })],
            shading: { type: ShadingType.SOLID, fill: C.white },
            width: { size: W / 5, type: WidthType.DXA },
            margins: { top: sp(4), bottom: sp(4), left: sp(4), right: sp(4) },
            borders: { top: { style: BorderStyle.SINGLE, size: 10, color: col }, bottom: brd(C.g20), left: brd(C.g20), right: brd(C.g20) },
          })) }),
          // AI engine — very light blue, no dark fill
          new TableRow({ children: [new TableCell({
            children: [P([R("IBM AI ENGINE  \u2014  AIOps  \u00B7  Agentic Intelligence  \u00B7  GenAI Quality  \u00B7  ICA  \u00B7  CareOps360", { sz: 9, bold: true, color: C.navy })], { align: AlignmentType.CENTER, before: 2, after: 2 })],
            shading: { type: ShadingType.SOLID, fill: C.lb1 },
            columnSpan: 5, margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
            borders: { top: brd(C.blue, 4), bottom: brd(C.blue, 4), left: brd(C.g20), right: brd(C.g20) },
          })] }),
          // Platform foundation — very light gray, no dark fill
          new TableRow({ children: [new TableCell({
            children: [P([R("PLATFORM FOUNDATION  \u2014  Hybrid Cloud  \u00B7  Integration Hub  \u00B7  Mainframe  \u00B7  Data Platforms  \u00B7  Security & Compliance", { sz: 8.5, color: C.g70 })], { align: AlignmentType.CENTER, before: 2, after: 2 })],
            shading: { type: ShadingType.SOLID, fill: C.g10 },
            columnSpan: 5, margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
            borders: { top: brd(C.g30), bottom: brd(C.g30), left: brd(C.g20), right: brd(C.g20) },
          })] }),
        ]}),

        spc(6),
        twoCol(
          [
            subH("Three Integrated Disciplines", { before: 0, after: 3 }),
            ...[ ["Application Development", "AI-assisted engineering, automated pipelines, and risk-scored releases — teams build faster because the machine handles the routine."],
                ["Quality Engineering",      "Testing is a continuous signal at every commit, sprint, and deployment. GenAI generates tests. AI predicts defects. Coverage reaches 80%+ within 12 months."],
                ["Application Management",   "Operations shift from reactive firefighting to predictive self-healing. Most incidents are resolved automatically — providers and members never notice."],
            ].flatMap(([t, d]) => [
              P([R(t, { sz: 10.5, bold: true, color: C.blue })], { before: 5, after: 2 }),
              P([R(d, { sz: 9.5, color: C.g70 })], { before: 0, after: 1 }),
            ]),
          ],
          [
            subH("What Changes for Horizon", { before: 0, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Today", Math.round(W * 0.24)), hc("With IBM", Math.round(W * 0.24))] }),
              ...[ ["Siloed delivery towers",      "Unified product pods"], ["Reactive firefighting",      "Predictive self-healing"], ["Late-stage testing",         "Shift-left quality gates"], ["Manual deployments",         "AI risk-scored pipelines"], ["Activity-metric reports",    "Business outcome dashboards"], ["Innovation as a project",    "Innovation every sprint"] ]
                .map(([a, b], i) => new TableRow({ children: [dc(a, Math.round(W * 0.24), { color: C.g70, sz: 9, shade: i % 2 ? C.g10 : C.white }), vc(b, Math.round(W * 0.24), { sz: 9 })] })),
            ]}),
          ]
        ),

        pageBreak(),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 4 — AI-FIRST DEVELOPMENT
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("3.0", "AI-First Application Development", "Build faster. Ship safer. Modernise continuously."),

        ...empQuote(
          "When a member\u2019s enrollment takes two weeks because a downstream application is slow to update, that is not an acceptable user experience. IBM engineers the systems so that timeline shrinks to hours — not as an ambition, but as a commitment.",
          "IBM Consulting — Member Experience Engineering"
        ),

        twoCol(
          [
            subH("How IBM Builds Faster", { before: 0, after: 3 }),
            ...[ ["AI-Assisted Development",  "AI coding assistants generate boilerplate, flag risk patterns, and suggest optimisations in real time — cutting delivery effort by 25–35% and freeing engineers for design and architecture."],
                ["Automated Release Gates",  "Every change passes through AI-scored gates: security, performance, coverage, and risk. Low-risk changes deploy without human approval — only exceptions require sign-off."],
                ["Modernisation in Every Sprint", "No separate modernisation programme. Every sprint includes a modernisation action: an API-wrap, a library upgrade, a refactor. Progress compounds continuously without disrupting BAU."],
                ["Domain-Aligned Pods",      "Development squads align to Horizon\u2019s business domains — Claims, Enrollment, Member, Provider. Context stays with the team; nothing is lost in handoffs."],
            ].flatMap(([t, d]) => [
              P([R(t, { sz: 10.5, bold: true, color: C.blue })], { before: 5, after: 2 }),
              P([R(d, { sz: 9.5, color: C.g70 })], { before: 0, after: 1 }),
            ]),
          ],
          [
            subH("Development Speed Gains", { before: 0, after: 3 }),
            P([R("Efficiency improvement vs. traditional delivery:", { sz: 9, it: true, color: C.g50 })], { after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: noBorders, rows: [
              barRow("AI-assisted coding",       80, "+30% capacity",  { lw: 2200, bw: 4200, vw: 1560, col: C.blue }),
              barRow("Automated QE generation",  75, "+25% QE speed",  { lw: 2200, bw: 4200, vw: 1560, col: C.teal }),
              barRow("Risk-scored deployments",  70, "\u221260% failures", { lw: 2200, bw: 4200, vw: 1560, col: "0043CE" }),
              barRow("Modernisation-in-stride",  60, "Debt \u221230%/yr",  { lw: 2200, bw: 4200, vw: 1560, col: "6929C4" }),
              barRow("Domain pod alignment",     65, "\u221240% handoffs", { lw: 2200, bw: 4200, vw: 1560, col: "005D5D" }),
            ]}),
            spc(5),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Delivery Metric", Math.round(W * 0.28)), hc("12-Month Target", Math.round(W * 0.20))] }),
              ...[ ["Time-to-market",       "25–40% faster"], ["Deployment frequency",  "2\u00D7 current pace"], ["Change failure rate",   "\u221260%"], ["Rollback / recovery",  "<15 minutes"] ]
                .map(([a, b], i) => new TableRow({ children: [dc(a, Math.round(W * 0.28), { bold: true, shade: i % 2 ? C.g10 : C.white }), vc(b, Math.round(W * 0.20))] })),
            ]}),
          ]
        ),

        pageBreak(),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 5 — QUALITY ENGINEERING
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("4.0", "Quality Engineering", "Quality is a continuous signal — not a final checkpoint."),

        ...empQuote(
          "Every defect that reaches production is a promise broken to someone: a provider whose claim was processed incorrectly, a member whose benefits were delayed, a payer whose SLA was missed. IBM\u2019s quality engine is designed so that defect never leaves the building.",
          "IBM Quality Engineering — Shift-Left Framework"
        ),

        twoCol(
          [
            subH("The Four Quality Layers", { before: 0, after: 3 }),
            ...[ ["Commit-Level AI Review",   "The instant a developer pushes code, AI reviews it — flagging security risk, test gaps, and quality anti-patterns before any human sees the PR."],
                ["GenAI Test Generation",    "AI synthesises regression, integration, and edge-case tests from code changes at commit speed. Coverage grows automatically — no manual test authoring."],
                ["Defect Prediction",        "AI models trained on Horizon\u2019s own incident history identify high-risk code paths before they reach UAT. Fewer defects reach staging; far fewer reach production."],
                ["Production Feedback Loop", "Every production defect teaches the quality engine. The test suite improves with every release — a tightening net that never stays static."],
            ].flatMap(([t, d]) => [
              P([R(t, { sz: 10.5, bold: true, color: C.blue })], { before: 5, after: 2 }),
              P([R(d, { sz: 9.5, color: C.g70 })], { before: 0, after: 1 }),
            ]),
            spc(4),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("QE Metric", Math.round(W * 0.24)), hc("Today", Math.round(W * 0.10)), hc("12-Month Target", Math.round(W * 0.14))] }),
              ...[ ["Test automation coverage",     "~25%",     "80%+"], ["Defect escape to production",  "High",      "\u221265%"], ["Regression cycle time",        "Multi-day", "\u221270%"], ["Mean time to detect (MTTD)",   ">2 hours",  "<15 min"] ]
                .map(([a, b, c], i) => new TableRow({ children: [dc(a, Math.round(W * 0.24), { bold: true, shade: i % 2 ? C.g10 : C.white }), dc(b, Math.round(W * 0.10), { color: C.red, shade: i % 2 ? C.g10 : C.white }), vc(c, Math.round(W * 0.14))] })),
            ]}),
          ],
          [
            subH("Test Automation Coverage Journey", { before: 0, after: 3 }),
            P([R("Month-by-month progression to 80%+ coverage:", { sz: 9, it: true, color: C.g50 })], { after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: noBorders, rows: [
              barRow("Month 0  — Baseline",   25, "~25%",  { lw: 2000, bw: 4400, vw: 1560, col: C.g50  }),
              barRow("Month 3  — Ignite",     45, "45%",   { lw: 2000, bw: 4400, vw: 1560, col: "0072C3" }),
              barRow("Month 6  — Scale",      62, "62%",   { lw: 2000, bw: 4400, vw: 1560, col: "0043CE" }),
              barRow("Month 9  — Optimise",   75, "75%",   { lw: 2000, bw: 4400, vw: 1560, col: C.blue }),
              barRow("Month 12 — Target",     82, "82%+",  { lw: 2000, bw: 4400, vw: 1560, col: C.navy }),
            ]}),
            spc(5),
            subH("Quality Release Gates", { before: 4, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Gate", Math.round(W * 0.20)), hc("Criteria", Math.round(W * 0.20)), hc("Human Touch", Math.round(W * 0.08))] }),
              ...[ ["Commit",   "AI review + coverage delta check",           "None"], ["Build",    "Unit test pass rate >98%",                  "None"], ["Staging",  "Integration + performance benchmarks",     "None"], ["Release",  "AI risk score + readiness signal",          "Tier 1 only"] ]
                .map(([a, b, c], i) => new TableRow({ children: [dc(a, Math.round(W * 0.20), { bold: true, shade: i % 2 ? C.g10 : C.white }), dc(b, Math.round(W * 0.20), { color: C.g70, sz: 9, shade: i % 2 ? C.g10 : C.white }), dc(c, Math.round(W * 0.08), { bold: c === "None", color: c === "None" ? C.green : C.g70, shade: i % 2 ? C.g10 : C.white, sz: 9 })] })),
            ]}),
          ]
        ),

        pageBreak(),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 6 — AIOPS & AGENTIC OPERATIONS
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("5.0", "AIOps & Agentic Operations", "From reactive firefighting to self-healing intelligence"),

        ...empQuote(
          "A provider should never have to call a helpdesk because a claims system is slow. A member should never see an error because two systems failed to sync overnight. IBM\u2019s AI operations model is designed so those moments simply stop happening.",
          "IBM AIOps — Zero-Touch Operations Framework"
        ),

        // Pipeline — clean white cards, no dark fill, coloured top borders only
        subH("The Zero-Touch Operations Pipeline", { before: 0, after: 3 }),
        new Table({ width: { size: W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
          new TableRow({ children: [
            pipeCard("STEP 1", "Detect",    ["Correlate signals", "Anomaly detection", ">60% noise cut"],     { col: C.blue }),
            pipeCard("STEP 2", "Triage",    ["AI routing", "Impact scoring", "Auto-prioritise"],              { col: "0072C3" }),
            pipeCard("STEP 3", "Diagnose",  ["Root cause AI", "Runbook guidance", "Pattern matching"],        { col: "0043CE" }),
            pipeCard("STEP 4", "Resolve",   ["Self-heal P3/P4", "Auto-remediate", "Zero-touch"],              { col: C.teal }),
            pipeCard("STEP 5", "Learn",     ["Post-incident AI", "Knowledge capture", "Prevent recurrence"],  { col: "005D5D" }),
          ]}),
        ]}),

        spc(5),
        twoCol(
          [
            subH("AI Agents & Value", { before: 0, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Agent", Math.round(W * 0.20)), hc("What It Does", Math.round(W * 0.18)), hc("Value", Math.round(W * 0.10))] }),
              ...[ ["Detection & Correlation", "Cuts alert noise >60%",              "$2.5–3.5M"], ["Triage AI",              "Routes issues instantly",            "$1.3–1.5M"], ["Root Cause Agent",       "Diagnoses in seconds",               "$2.0–3.0M"], ["Auto-Remediation",       "Resolves P3/P4 without human touch", "$1.5–2.0M"], ["Knowledge Agent",        "Learns from every incident",         "$1.0–1.3M"], ["Deployment AI",          "Risk-scores every release",          "$0.8–1.2M"] ]
                .map(([a, b, c], i) => new TableRow({ children: [dc(a, Math.round(W * 0.20), { bold: true, shade: i % 2 ? C.g10 : C.white }), dc(b, Math.round(W * 0.18), { color: C.g70, sz: 9, shade: i % 2 ? C.g10 : C.white }), vc(c, Math.round(W * 0.10), { sz: 9 })] })),
            ]}),
          ],
          [
            subH("Before vs. After — Key Metrics", { before: 0, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Metric", Math.round(W * 0.22)), hc("Today", Math.round(W * 0.12)), hc("With IBM AIOps", Math.round(W * 0.14))] }),
              ...[ ["Mean Time to Resolve",   ">4 hours",   "<1.8 hours"], ["P3/P4 Auto-Resolution", "<10%",        ">74%"], ["Alert Noise",          "Unfiltered",  ">60% cut"], ["System Availability",  "~99.7%",      "99.9%+"], ["Recurring Incidents",  "Unmanaged",   "\u221250% demand"] ]
                .map(([a, b, c], i) => new TableRow({ children: [dc(a, Math.round(W * 0.22), { bold: true, shade: i % 2 ? C.g10 : C.white }), dc(b, Math.round(W * 0.12), { color: C.red, shade: i % 2 ? C.g10 : C.white }), vc(c, Math.round(W * 0.14))] })),
            ]}),
            spc(4),
            infoBar("Target: most P3/P4 incidents are resolved before a human is notified. That is zero-touch operations."),
          ]
        ),

        pageBreak(),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 7 — BUSINESS OUTCOMES & ROI
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("6.0", "Business Outcomes & Value Realization", "Every initiative connects to a measurable result"),

        ...empQuote(
          "A payer that processes a claim faster spends less on administration and earns more member trust. A payer whose systems self-heal spends less on incidents and more on care. IBM is building the infrastructure of that future for Horizon.",
          "IBM Outcome Governance Framework"
        ),

        twoCol(
          [
            subH("Business Domain Outcomes", { before: 0, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Domain", Math.round(W * 0.18)), hc("Business KPI", Math.round(W * 0.18)), hc("Target", Math.round(W * 0.12))] }),
              ...[ ["Claims",           "Adjudication cycle time",   "\u221230%"], ["Enrollment",      "Time-to-activation",        "\u221240%"], ["Member Services", "First-call resolution",     "+25%"], ["Provider Ops",    "Auth processing time",      "\u221235%"], ["Data & Reporting","Report delivery latency",   "\u221250%"], ["IT Operations",   "Auto-resolution rate",      ">74%"] ]
                .map(([a, b, c], i) => new TableRow({ children: [dc(a, Math.round(W * 0.18), { bold: true, shade: i % 2 ? C.g10 : C.white }), dc(b, Math.round(W * 0.18), { color: C.g70, sz: 9, shade: i % 2 ? C.g10 : C.white }), vc(c, Math.round(W * 0.12))] })),
            ]}),
            spc(5),
            subH("Cumulative Cost Takeout", { before: 4, after: 3 }),
            P([R("Directional — baselines locked in Phase 0:", { sz: 9, it: true, color: C.g50 })], { after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: noBorders, rows: [
              barRow("Month 3  — Ignite",     12, "$1–2M",    { lw: 2200, bw: 4300, vw: 1460, col: "0072C3" }),
              barRow("Month 6  — Scale",      30, "$3–5M",    { lw: 2200, bw: 4300, vw: 1460, col: "0043CE" }),
              barRow("Month 12 — Optimize",   60, "$6–10M",   { lw: 2200, bw: 4300, vw: 1460, col: C.blue }),
              barRow("Month 24 — Transform", 100, "$12–18M+", { lw: 2200, bw: 4300, vw: 1460, col: C.navy }),
            ]}),
          ],
          [
            subH("Annual Value by Initiative", { before: 0, after: 3 }),
            P([R("Directional annual contribution:", { sz: 9, it: true, color: C.g50 })], { after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: noBorders, rows: [
              barRow("AIOps & Self-Healing",     85, "$3.5–6.5M", { lw: 2400, bw: 3800, vw: 1760, col: C.blue }),
              barRow("GenAI Quality Engine",     72, "$2.5–4.0M", { lw: 2400, bw: 3800, vw: 1760, col: C.teal }),
              barRow("Zero-Touch Delivery",      60, "$2.0–3.0M", { lw: 2400, bw: 3800, vw: 1760, col: "0043CE" }),
              barRow("Platform Modernisation",   48, "$1.5–2.5M", { lw: 2400, bw: 3800, vw: 1760, col: "6929C4" }),
              barRow("Demand & Ticket Reduction",55, "$1.0–2.0M", { lw: 2400, bw: 3800, vw: 1760, col: "005D5D" }),
            ]}),
            spc(5),
            subH("Three-Tier Governance", { before: 4, after: 3 }),
            ...[ ["Operational (Weekly)", "SLA adherence, MTTR, pipeline velocity — live in CareOps360."],
                ["Executive (Monthly)",  "Cost takeout actuals, coverage progress, business KPI movement."],
                ["Board (Quarterly)",    "Strategic outcomes: total value realised, innovation delivered."],
            ].flatMap(([t, d]) => [
              P([R(t, { sz: 10, bold: true, color: C.blue })], { before: 4, after: 1 }),
              P([R(d, { sz: 9.5, color: C.g70 })], { before: 0, after: 1 }),
            ]),
          ]
        ),

        pageBreak(),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 8 — PLATFORM & DATA MODERNISATION
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("7.0", "Platform & Data Modernisation", "Eliminating the debt that slows everything down"),

        body("IBM embeds modernisation into steady-state delivery — no separate programme, no disruption to BAU. Every sprint may include a modernisation action. Technical debt is tracked by business impact and burned down systematically, continuously."),
        spc(3),

        twoCol(
          [
            subH("Modernisation Waves", { before: 0, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Workstream", Math.round(W * 0.20)), hc("Approach", Math.round(W * 0.18)), hc("Wave", Math.round(W * 0.10))] }),
              ...[ ["Integration Hub",        "API-first + event streaming", "Wave 1"], ["Mainframe APIs",        "API-wrap strategy",          "Wave 1"], ["DataOps Pipelines",     "AI-driven quality engine",   "Wave 1"], ["App Portfolio (~500)",  "Assess \u2192 rationalise",  "Wave 2"], ["Mainframe Rehost",      "Lift-and-validate",          "Wave 2"], ["Cloud Optimisation",    "Cost + performance tuning",  "Wave 2"], ["Mainframe Refactor",    "Selective modernise",        "Wave 3"], ["Security & Compliance", "n-1 standard + auto-patch",  "Ongoing"] ]
                .map(([a, b, c], i) => new TableRow({ children: [dc(a, Math.round(W * 0.20), { bold: true, shade: i % 2 ? C.g10 : C.white }), dc(b, Math.round(W * 0.18), { color: C.g70, sz: 9, shade: i % 2 ? C.g10 : C.white }), vc(c, Math.round(W * 0.10), { sz: 9 })] })),
            ]}),
          ],
          [
            subH("Technical Debt Reduction", { before: 0, after: 3 }),
            P([R("Debt index (100 = today) — quarterly trajectory:", { sz: 9, it: true, color: C.g50 })], { after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: noBorders, rows: [
              barRow("Q1  Baseline",    100, "100", { lw: 1900, bw: 4600, vw: 1460, col: C.red }),
              barRow("Q2  Wave 1",       78, "78",  { lw: 1900, bw: 4600, vw: 1460, col: "FF8389" }),
              barRow("Q3  Scale",        62, "62",  { lw: 1900, bw: 4600, vw: 1460, col: "0072C3" }),
              barRow("Q4  Optimise",     48, "48",  { lw: 1900, bw: 4600, vw: 1460, col: C.blue }),
              barRow("Year 2 Target",    28, "<30", { lw: 1900, bw: 4600, vw: 1460, col: C.navy }),
            ]}),
            spc(5),
            subH("Integration Architecture Shift", { before: 4, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Current State", Math.round(W * 0.24)), hc("IBM Target State", Math.round(W * 0.24))] }),
              ...[ ["Point-to-point coupling",   "API-first Integration Hub"], ["Batch-heavy processing",   "Event-driven streaming"], ["Manual data pipelines",    "AI-quality DataOps"], ["Siloed observability",     "Unified estate monitoring"], ["Manual patching cycles",   "Auto-patch + n-1 standard"] ]
                .map(([a, b], i) => new TableRow({ children: [dc(a, Math.round(W * 0.24), { color: C.red, sz: 9, shade: i % 2 ? C.g10 : C.white }), vc(b, Math.round(W * 0.24), { sz: 9 })] })),
            ]}),
          ]
        ),

        pageBreak(),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 9 — PHASED ROADMAP
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("8.0", "Phased Roadmap & Value Milestones", "Risk-controlled \u00B7 Compounding value \u00B7 Transparent governance"),

        ...empQuote(
          "Every day a claim processes faster, a prior auth returns sooner, or an outage is resolved before it is noticed — that is a day Horizon\u2019s members and providers experience the difference. IBM\u2019s roadmap is structured so those days start in Week 1, not Year 2.",
          "IBM Delivery Governance"
        ),

        subH("Phase-by-Phase Delivery Plan", { before: 0, after: 3 }),
        new Table({ width: { size: W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
          new TableRow({ children: [hc("Phase", W * 0.15), hc("Timeframe", W * 0.11), hc("Focus & Key Deliverables", W * 0.44), hc("Value Signal", W * 0.30)] }),
          ...[
            ["Phase 0\nFoundation",  "0–8 weeks",  "Telemetry onboarding  \u00B7  Baseline measurement  \u00B7  Transition plan  \u00B7  AI environment setup  \u00B7  Innovation council launch", "Live dashboards; baselines locked; zero BAU disruption"],
            ["Phase 1\nIgnite",      "Month 1–3",  "AIOps live  \u00B7  P3/P4 self-heal pilots  \u00B7  GenAI QE framework  \u00B7  AI-assisted dev sprints start  \u00B7  Quick-win automations", "MTTR \u221220%  \u00B7  First automation ROI  \u00B7  QE coverage 45%"],
            ["Phase 2\nScale",       "Month 3–6",  "Agentic triage at scale  \u00B7  Integration Hub Wave 1  \u00B7  QE 60%  \u00B7  DataOps monitoring  \u00B7  AI dev across all domain pods", "Auto-resolve >50%  \u00B7  Defect escape \u221240%  \u00B7  $3–5M cumulative"],
            ["Phase 3\nOptimise",    "Month 6–12", "Autonomous ops for common patterns  \u00B7  QE 80%+  \u00B7  Continuous modernisation sprints  \u00B7  Full outcome governance live", "Cost takeout $6–10M  \u00B7  MTTR <1.8 hrs  \u00B7  Availability 99.9%+"],
            ["Phase 4\nTransform",   "Year 1–2",   "Full autonomy across estate  \u00B7  Mainframe rehost/refactor  \u00B7  Enterprise observability  \u00B7  Co-invest pipeline", "Structural cost takeout 40–50%  \u00B7  Total value $12–18M+"],
          ].map(([phase, time, dels, val], i) => new TableRow({ children: [
            dc(phase, W * 0.15, { bold: true, sz: 9, color: C.navy, shade: i % 2 ? C.g10 : C.white }),
            dc(time,  W * 0.11, { sz: 9, color: C.g70, shade: i % 2 ? C.g10 : C.white }),
            dc(dels,  W * 0.44, { sz: 9, shade: i % 2 ? C.g10 : C.white }),
            vc(val,   W * 0.30, { sz: 9 }),
          ]})),
        ]}),

        spc(6),
        subH("KPI Framework", { before: 0, after: 3 }),
        new Table({ width: { size: W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
          new TableRow({ children: [hc("Value Area", W * 0.20), hc("KPIs Tracked", W * 0.36), hc("Data Source", W * 0.24), hc("Cadence", W * 0.20)] }),
          ...[ ["Operational Excellence", "MTTR, availability, incident volume, auto-resolution %", "ITSM + AIOps telemetry", "Weekly"],
              ["Cost & Productivity",    "Automation ROI, demand reduction, delivery velocity",    "Finance + ITSM",          "Monthly"],
              ["Quality Engineering",    "Coverage, defect escape, regression time, MTTD",         "QE toolchain + CI/CD",    "Per sprint"],
              ["Platform",               "n-1 compliance, debt index, upgrade velocity",            "CMDB + security scans",   "Monthly"],
              ["Business Outcomes",      "Claims cycle, enrollment time, FCR, provider ASA",        "Domain dashboards",       "Monthly"],
          ].map(([a, b, c, d], i) => new TableRow({ children: [dc(a, W * 0.20, { bold: true, shade: i % 2 ? C.g10 : C.white }), dc(b, W * 0.36, { color: C.g70, sz: 9, shade: i % 2 ? C.g10 : C.white }), dc(c, W * 0.24, { color: C.g70, sz: 9, shade: i % 2 ? C.g10 : C.white }), vc(d, W * 0.20)] })),
        ]}),

        pageBreak(),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 10 — WHY IBM & CALL TO ACTION
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("9.0", "Why IBM — and Why Now", "The depth, the assets, and the accountability to deliver"),

        spc(2),

        // 4-KPI row — light blue, no dark background
        new Table({ width: { size: W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
          new TableRow({ children: [
            kpiCard("20,000+", "AI & Data Practitioners",    "globally dedicated",              W / 4),
            kpiCard("81,000+", "Cloud & Architecture Experts","across IBM Consulting",           W / 4),
            kpiCard("40,000+", "AI/Analytics Engagements",   "delivered for clients worldwide", W / 4),
            kpiCard("9 of 10", "Top US Health Payers",       "served by IBM Consulting",        W / 4),
          ]})
        ]}),

        spc(6),

        ...empQuote(
          "IBM\u2019s ultimate accountability is not to a contract. It is to the 3.7 million members who rely on Horizon\u2019s systems every day — the patient waiting for a prior auth, the provider navigating a claims dispute, the family enrolling in coverage for the first time. That is who we are building for.",
          "IBM Consulting — Healthcare & Payer Delivery"
        ),

        twoCol(
          [
            subH("What Makes IBM Different", { before: 0, after: 3 }),
            ...[ ["Production-Grade Assets, Day 1",  "IBM AIOps, ICA, CareOps360, GenAI Quality Engine, and IBM Consulting Advantage are live in production at comparable payers today — not promised in a roadmap."],
                ["Deep Horizon Knowledge",           "IBM brings institutional knowledge of Horizon\u2019s application estate and change history — reducing transition risk to near-zero and accelerating Phase 0."],
                ["Healthcare Payer DNA",             "Claims, enrollment, prior authorisation, member services — IBM has modernised these for the nation\u2019s largest payers. The patterns are proven."],
                ["Shared Risk Model",                "IBM commits to outcome-based SLAs. Targets missed trigger IBM remediation — not renegotiation. Accountability, not aspiration."],
                ["Innovation at No Extra Cost",      "Innovation sprints, AI tooling, and accelerators are built into the base model. Horizon does not pay separately for transformation."],
            ].flatMap(([t, d]) => [
              P([R(t, { sz: 10.5, bold: true, color: C.blue })], { before: 5, after: 2 }),
              P([R(d, { sz: 9.5, color: C.g70 })], { before: 0, after: 1 }),
            ]),
          ],
          [
            subH("The Next Three Steps", { before: 0, after: 3 }),
            ...[ ["Week 1–2",  "Executive alignment session — Horizon leadership + IBM account team. Agree objectives, scope, and governance."],
                ["Week 2–4",  "Phase 0 SOW agreed. Telemetry onboarding begins. Baseline discovery kicks off. Innovation council constituted."],
                ["Week 4",    "Contractual milestone: Phase 0 live. IBM and Horizon operating as one team from Day 1."],
            ].flatMap(([t, d]) => [
              P([R(t + ":  ", { sz: 10, bold: true, color: C.blue }), R(d, { sz: 9.5 })], { before: 5, after: 2 }),
            ]),
            spc(5),
            subH("IBM vs. The Alternative", { before: 4, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Dimension", Math.round(W * 0.16)), hc("Status Quo", Math.round(W * 0.16)), hc("IBM", Math.round(W * 0.16))] }),
              ...[ ["Model",       "Towers, reactive",       "Unified pods, AI-first"], ["Dev",        "Manual pipelines",       "AI-assisted, +30%"], ["Quality",    "End-stage testing",      "Shift-left, GenAI"], ["Ops",        "Firefighting",           "Self-healing, 0-touch"], ["Reporting",  "Activity metrics",       "Business outcomes"], ["Risk",       "Vendor bears none",      "Shared, outcome SLAs"] ]
                .map(([a, b, c], i) => new TableRow({ children: [dc(a, Math.round(W * 0.16), { bold: true, sz: 9, shade: i % 2 ? C.g10 : C.white }), dc(b, Math.round(W * 0.16), { color: C.red, sz: 9, shade: i % 2 ? C.g10 : C.white }), vc(c, Math.round(W * 0.16), { sz: 9 })] })),
            ]}),
          ]
        ),

        spc(6),
        blueHR(),
        spc(4),

        new Paragraph({
          children: [
            R("\u201CIBM\u2019s measure of success is not tickets closed, alerts silenced, or tests generated. It is the member who gets their answer faster, the provider who spends less time on administration, and the ", { sz: 11, it: true }),
            R("payer that can finally direct every saved dollar back toward the care that matters.", { sz: 11, bold: true, it: true, color: C.navy }),
            R(" That is why we are here.\u201D", { sz: 11, it: true }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: sp(4), after: sp(4) },
          indent: { left: inch(0.4), right: inch(0.4) },
        }),
        P([R("\u2014 IBM Consulting, Healthcare & Payer Delivery  |  April 2026", { sz: 9.5, bold: true, color: C.blue })], { align: AlignmentType.RIGHT, after: 10 }),

        thinHR(),
        P([R("\u00A9 2026 IBM Corporation. All rights reserved.  Confidential \u2014 prepared exclusively for Horizon Healthcare Services.  Ref: IBM-HZN-AMS-RFP-2026-CAS", { sz: 7.5, color: C.g50 })], { align: AlignmentType.CENTER, before: 3 }),
      ],
    },
  ],
});

const buf = await Packer.toBuffer(doc);
writeFileSync("attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx", buf);
console.log("Done \u2014 " + buf.length.toLocaleString() + " bytes");
