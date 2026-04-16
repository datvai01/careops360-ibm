import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle, WidthType,
  ShadingType, TableLayoutType, Header, Footer, PageNumber,
  convertInchesToTwip, ColumnBreak, SectionType,
} from "docx";
import { writeFileSync } from "fs";

// ── Palette ───────────────────────────────────────────────────────────────────
const BLUE  = "0F62FE"; const NAVY  = "001141";
const G10   = "F4F4F4"; const G20   = "E0E0E0"; const G50   = "8D8D8D";
const G70   = "525252"; const G100  = "161616"; const WHITE = "FFFFFF";
const LB1   = "EBF2FF"; const LB2   = "D0E2FF"; const RED   = "DA1E28";

const FONT = "Calibri";
const hp = pt => Math.round(pt * 2);
const sp = pt => Math.round(pt * 20);
const inch = i => convertInchesToTwip(i);

// Column widths (DXA) — 1" margins each side, 6.5" content
const W1 = 9360;                      // 1-column full width
const W2 = Math.floor((W1-720)/2);   // 2-column each = 4320
const W3 = Math.floor((W1-720)/3);   // 3-column each = 2880

// ── CRITICAL: always use ShadingType.CLEAR — SOLID uses pattern color (black) ─
const shade = fill => ({ type: ShadingType.CLEAR, fill });

// ── Borders ───────────────────────────────────────────────────────────────────
const THIN     = { style: BorderStyle.SINGLE, size: 4,  color: G20  };
const BLUE_TOP = { style: BorderStyle.SINGLE, size: 10, color: BLUE };
const NONE_B   = { style: BorderStyle.NONE,   size: 0,  color: "auto" };
const NO_BORD  = { top: NONE_B, bottom: NONE_B, left: NONE_B, right: NONE_B, insideH: NONE_B, insideV: NONE_B };
const CELL_B   = { top: THIN, bottom: THIN, left: THIN, right: THIN };

// ── Text run ──────────────────────────────────────────────────────────────────
const R = (text, { sz = 10.5, bold = false, it = false, color = G100 } = {}) =>
  new TextRun({ text, font: FONT, size: hp(sz), bold, italics: it, color });

// ── Paragraph ─────────────────────────────────────────────────────────────────
const P = (children, { before = 0, after = 3, lft = 0, rgt = 0, align } = {}) =>
  new Paragraph({
    children: Array.isArray(children) ? children : [children],
    spacing: { before: sp(before), after: sp(after) },
    indent: (lft || rgt) ? { left: sp(lft), right: sp(rgt) } : undefined,
    alignment: align,
  });

const body = text => P([R(text, { color: G70 })], { after: 4 });

const bull = text => new Paragraph({
  children: [R(text, { color: G70 })],
  bullet: { level: 0 },
  spacing: { before: sp(1), after: sp(2) },
});

const spc = (pt = 4) =>
  new Paragraph({ children: [new TextRun({ text: "" })], spacing: { before: 0, after: sp(pt) } });

// ── Section heading ───────────────────────────────────────────────────────────
const sHead = (num, title, tag = "") => [
  new Paragraph({
    children: [],
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 6 } },
    spacing: { before: sp(6), after: sp(1) },
  }),
  new Paragraph({
    children: [
      R(num + "  ", { sz: 8, bold: true, color: BLUE }),
      R(title.toUpperCase(), { sz: 13, bold: true, color: NAVY }),
      ...(tag ? [R("   " + tag, { sz: 9.5, it: true, color: G50 })] : []),
    ],
    spacing: { before: sp(1), after: sp(4) },
  }),
];

const subH = (text, { before = 5, after = 2, color = NAVY } = {}) =>
  P([R(text, { sz: 10.5, bold: true, color })], { before, after });

// ── Empathy quote (centred) ───────────────────────────────────────────────────
const empQuote = (quote, attr = "") => [
  P([R("\u201C" + quote + "\u201D", { sz: 10.5, it: true, color: NAVY })], {
    align: AlignmentType.CENTER, lft: 10, rgt: 10, before: 2, after: 2,
  }),
  P([R("\u2014 " + attr, { sz: 9, bold: true, color: BLUE })], { align: AlignmentType.CENTER, after: 4 }),
  new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LB2 } },
    spacing: { before: 0, after: sp(5) },
    indent: { left: inch(0.5), right: inch(0.5) },
  }),
];

// ── Column break (for multi-column Word sections) ─────────────────────────────
const colBreak = () => new Paragraph({
  children: [new ColumnBreak()],
  spacing: { before: 0, after: 0 },
});

// ── TABLE CELL HELPERS ────────────────────────────────────────────────────────

// Header: LB2 fill, navy bold text
const hc = (text, w) => new TableCell({
  children: [new Paragraph({ children: [R(text, { sz: 9.5, bold: true, color: NAVY })], spacing: { before: sp(3), after: sp(3) } })],
  shading: shade(LB2),
  margins: { top: sp(2), bottom: sp(2), left: sp(6), right: sp(6) },
  width: w ? { size: Math.round(w), type: WidthType.DXA } : undefined,
  borders: { top: BLUE_TOP, bottom: THIN, left: THIN, right: THIN },
});

// Data: explicit white (or alt shade) fill
const dc = (text, w, { bold = false, color = G100, fill = WHITE, sz = 9.5 } = {}) => new TableCell({
  children: [new Paragraph({ children: [R(text, { sz, bold, color })], spacing: { before: sp(2), after: sp(2) } })],
  shading: shade(fill),
  margins: { top: sp(2), bottom: sp(2), left: sp(6), right: sp(6) },
  width: w ? { size: Math.round(w), type: WidthType.DXA } : undefined,
  borders: CELL_B,
});

// Value: LB1 fill, IBM blue bold
const vc = (text, w, sz = 9.5) => dc(text, w, { bold: true, color: BLUE, fill: LB1, sz });

// Alternating row fill
const alt = i => i % 2 === 1 ? G10 : WHITE;

// ── Horizontal bar chart row ──────────────────────────────────────────────────
const barRow = (label, pct, valText, { lw, bw, vw, col = BLUE }) => {
  const f = Math.round(bw * Math.min(pct, 100) / 100);
  const r = bw - f;
  return new TableRow({ children: [
    new TableCell({ children: [P([R(label, { sz: 9, color: G70 })], { after: 0 })], width: { size: lw, type: WidthType.DXA }, shading: shade(WHITE), borders: NO_BORD, margins: { top: sp(2), bottom: sp(2), right: sp(3) }, verticalAlign: "center" }),
    new TableCell({ children: [spc(0)], width: { size: f, type: WidthType.DXA }, shading: shade(col), borders: NO_BORD }),
    new TableCell({ children: [spc(0)], width: { size: r, type: WidthType.DXA }, shading: shade(G20), borders: NO_BORD }),
    new TableCell({ children: [P([R(valText, { sz: 9, bold: true, color: col })], { after: 0, align: AlignmentType.RIGHT })], width: { size: vw, type: WidthType.DXA }, shading: shade(WHITE), borders: NO_BORD, margins: { top: sp(2), bottom: sp(2), left: sp(3) }, verticalAlign: "center" }),
  ]});
};

// bar chart for 2-col pages (W2 = 4320): lw+bw+vw = 4320
const bar2 = (lbl, pct, val, col = BLUE) => barRow(lbl, pct, val, { lw: 1600, bw: 2080, vw: 640, col });
// bar chart for 1-col twoCol sub-tables (~4320): same widths
const bar1 = (lbl, pct, val, col = BLUE) => barRow(lbl, pct, val, { lw: 1600, bw: 2080, vw: 640, col });
// bar chart for 3-col pages (W3 = 2880): lw+bw+vw = 2880
const bar3 = (lbl, pct, val, col = BLUE) => barRow(lbl, pct, val, { lw: 1080, bw: 1480, vw: 320, col });

// ── Pipeline stage card ───────────────────────────────────────────────────────
const pipeCard = (step, title, lines, col = BLUE) => new TableCell({
  children: [
    new Paragraph({ children: [R(step, { sz: 7.5, bold: true, color: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(4), after: sp(1) } }),
    new Paragraph({ children: [R(title, { sz: 9.5, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(2) } }),
    ...lines.map(l => new Paragraph({ children: [R(l, { sz: 8.5, color: G70 })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(1) } })),
    spc(3),
  ],
  shading: shade(WHITE),
  width: { size: W1 / 5, type: WidthType.DXA },
  margins: { top: sp(3), bottom: sp(3), left: sp(4), right: sp(4) },
  borders: { top: { style: BorderStyle.SINGLE, size: 12, color: col }, bottom: THIN, left: THIN, right: THIN },
});

// ── KPI card (cover) ──────────────────────────────────────────────────────────
const kpiCard = (value, label, sub, w) => new TableCell({
  children: [
    new Paragraph({ children: [R(value, { sz: 22, bold: true, color: BLUE })], alignment: AlignmentType.CENTER, spacing: { before: sp(7), after: sp(2) } }),
    new Paragraph({ children: [R(label, { sz: 9, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(2) } }),
    new Paragraph({ children: [R(sub, { sz: 8, it: true, color: G50 })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(7) } }),
  ],
  shading: shade(LB1),
  margins: { top: sp(3), bottom: sp(3), left: sp(4), right: sp(4) },
  width: { size: Math.round(w), type: WidthType.DXA },
  borders: { top: BLUE_TOP, bottom: THIN, left: THIN, right: THIN },
});

// ── Two-column invisible table (for use INSIDE 1-col Word sections only) ──────
const twoCol = (left, right) => {
  const lW = Math.round(W1 * 0.48);
  const gW = Math.round(W1 * 0.04);
  const rW = W1 - lW - gW;
  const ghost = (items, w, m = {}) => new TableCell({ children: items, shading: shade(WHITE), width: { size: w, type: WidthType.DXA }, borders: NO_BORD, margins: m });
  return new Table({
    width: { size: W1, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD,
    rows: [new TableRow({ children: [ghost(left, lW, { right: sp(8) }), ghost([spc(0)], gW), ghost(right, rW, { left: sp(8) })] })],
  });
};

const infoBar = text => new Paragraph({
  children: [R(text, { sz: 9.5, bold: true, color: NAVY })],
  shading: shade(LB1),
  spacing: { before: sp(5), after: sp(5) },
  indent: { left: sp(8), right: sp(8) },
});

const blueHR = () => new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 3 } }, spacing: { before: sp(5), after: sp(5) } });
const thinHR = () => new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: G20, space: 3 } }, spacing: { before: sp(4), after: sp(4) } });

// ── Header / Footer factories ─────────────────────────────────────────────────
const pg = { top: inch(0.85), bottom: inch(0.75), left: inch(1.0), right: inch(1.0) };

const makeHdr = () => new Header({ children: [
  new Paragraph({
    children: [
      R("IBM \u00D7 HORIZON BCBS  |  APPLICATION DELIVERY, QUALITY & OPERATIONS TRANSFORMATION", { sz: 7.5, bold: true, color: G50 }),
      R("  \u2014  CONFIDENTIAL", { sz: 7.5, bold: true, color: BLUE }),
    ],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 4 } },
  }),
]});

const makeFtr = () => new Footer({ children: [
  new Paragraph({
    children: [
      R("CareOps360  \u00B7  IBM AIOps  \u00B7  IBM Consulting Advantage", { sz: 7.5, bold: true, color: BLUE }),
      R("   |   \u00A9 2026 IBM Corporation   |   Page ", { sz: 7.5, color: G50 }),
      new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: hp(7.5), color: G50 }),
    ],
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: G20, space: 3 } },
    spacing: { before: sp(3) },
  }),
]});

const hf = () => ({ headers: { default: makeHdr() }, footers: { default: makeFtr() } });

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENT
// ════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  creator: "IBM Consulting",
  title: "IBM \u00D7 Horizon BCBS \u2014 Application Delivery, Quality & Operations Transformation",
  sections: [

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 1 — COVER  (1 col, full-bleed margins)
    // ════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: { top: inch(0), bottom: inch(0), left: inch(0), right: inch(0) } } },
      children: [
        new Paragraph({ children: [R("IBM CONSULTING   |   HEALTHCARE & PAYER DELIVERY", { sz: 8.5, bold: true, color: WHITE })], shading: shade(NAVY), alignment: AlignmentType.CENTER, spacing: { before: sp(14), after: sp(14) } }),
        new Paragraph({ children: [], shading: shade(BLUE), spacing: { before: 0, after: sp(2) } }),
        spc(26),
        new Paragraph({ children: [R("CONFIDENTIAL  |  APRIL 2026", { sz: 8, bold: true, color: BLUE })], alignment: AlignmentType.RIGHT, spacing: { before: 0, after: sp(6) }, indent: { right: inch(1.1) } }),
        new Paragraph({ children: [R("IBM \u00D7 HORIZON BLUE CROSS BLUE SHIELD OF NEW JERSEY", { sz: 10, bold: true, color: BLUE })], spacing: { before: 0, after: sp(4) }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("Application Delivery,",       { sz: 32, bold: true, color: NAVY })], spacing: { before: 0, after: 0 }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("Quality Engineering &",       { sz: 32, bold: true, color: NAVY })], spacing: { before: 0, after: 0 }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("Operations Transformation",    { sz: 32, bold: true, color: BLUE })], spacing: { before: 0, after: sp(4) }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("AI-First  \u00B7  Business-Led  \u00B7  Zero-Touch  \u00B7  Member-Centred", { sz: 12, it: true, color: G50 })], spacing: { before: 0, after: sp(18) }, indent: { left: inch(1.1) } }),
        new Table({
          width: { size: W1, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD,
          rows: [new TableRow({ children: [
            kpiCard("40\u201350%", "Cost Takeout",            "vs. current operational run-rate", W1/4),
            kpiCard("25\u201340%", "Faster Time to Market",   "across development & change",      W1/4),
            kpiCard(">74%",        "Incidents Auto-Resolved", "P3/P4 zero-touch target",          W1/4),
            kpiCard("80%+",        "Test Automation",         "from ~25% today",                  W1/4),
          ]})],
        }),
        spc(10),
        new Paragraph({
          children: [R("\u201CA member who can\u2019t access their benefits, a provider waiting days for authorisation, a payer carrying the cost of an avoidable error \u2014 these are the problems IBM is here to solve. Technology is the means. Human outcomes are the only measure.\u201D", { sz: 10.5, it: true, color: NAVY })],
          alignment: AlignmentType.CENTER, spacing: { before: sp(4), after: sp(3) }, indent: { left: inch(1.1), right: inch(1.1) },
        }),
        new Paragraph({ children: [R("\u2014 IBM Consulting, Healthcare & Payer Delivery", { sz: 9, bold: true, color: BLUE })], alignment: AlignmentType.RIGHT, spacing: { before: 0, after: sp(14) }, indent: { right: inch(1.1) } }),
        new Paragraph({ children: [], border: { top: { style: BorderStyle.SINGLE, size: 4, color: G20 } }, spacing: { before: sp(4), after: 0 }, indent: { left: inch(1.1), right: inch(1.1) } }),
        new Paragraph({
          children: [
            R("Prepared for: ", { sz: 8.5, bold: true, color: NAVY }), R("Horizon Healthcare Services     ", { sz: 8.5, color: G70 }),
            R("Submitted by: ", { sz: 8.5, bold: true, color: NAVY }), R("IBM Consulting \u2014 Healthcare & Payer     ", { sz: 8.5, color: G70 }),
            R("April 2026", { sz: 8.5, color: G70 }),
          ],
          spacing: { before: sp(5), after: sp(5) }, indent: { left: inch(1.1) },
        }),
        new Paragraph({ children: [R("\u00A9 2026 IBM Corporation. All rights reserved.  Powered by CareOps360 \u00B7 IBM AIOps \u00B7 IBM Consulting Advantage", { sz: 7.5, color: WHITE })], shading: shade(NAVY), alignment: AlignmentType.CENTER, spacing: { before: sp(5), after: sp(5) } }),
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 2 — STRATEGIC OPPORTUNITY  (TWO Word columns)
    // ════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pg }, column: { space: 720, count: 2 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // ── LEFT COLUMN ──────────────────────────────────────────────────────
        ...sHead("1.0", "The Strategic Opportunity", "Why bold action is needed"),
        ...empQuote(
          "A member delayed. A provider burdened. A payer absorbing preventable cost. IBM is here to solve these as one integrated partnership \u2014 not as a technology project.",
          "IBM Consulting \u2014 Healthcare & Payer Delivery"
        ),
        subH("Where Horizon Stands Today", { before: 0, after: 2 }),
        body("Horizon\u2019s 500+ applications are managed across siloed delivery teams. Speed, quality, and member experience all pay the price."),
        bull("Claims cycle times constrained by manual processes and late-stage defects reaching production."),
        bull("Provider authorisations delayed because integrations are batch-based, not real-time."),
        bull("Member enrolment errors surface days after submission \u2014 long after trust is damaged."),
        bull("Test automation at ~25% means most quality assurance is slow, manual, and costly."),
        bull("Operations teams firefight recurring incidents instead of building capability."),
        spc(4),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("Business Challenge", W2*0.63), hc("Impact on Stakeholders", W2*0.37)] }),
          ...[ ["Slow claims processing",  "Members wait; trust erodes"],
               ["Manual prior auth",       "Providers lose care time"],
               ["Low test automation",     "Defects reach production"],
               ["Reactive operations",     "Unpredictable availability"],
               ["Growing technology debt", "Rising cost & compliance risk"] ]
            .map(([a,b],i) => new TableRow({ children: [dc(a,W2*0.63,{fill:alt(i)}), dc(b,W2*0.37,{color:RED,fill:alt(i)})] })),
        ]}),

        // ── COLUMN BREAK ─────────────────────────────────────────────────────
        colBreak(),

        // ── RIGHT COLUMN ─────────────────────────────────────────────────────
        subH("The IBM Response", { before: 0, after: 2 }),
        body("IBM proposes a unified partnership spanning Application Development, Quality Engineering, and Operations \u2014 with AI as the operating engine so Horizon\u2019s teams focus on outcomes, not overhead."),
        bull("AI-assisted engineering and risk-scored release pipelines accelerate delivery by 25\u201340%."),
        bull("Quality built into every stage \u2014 from commit to production \u2014 so defects are caught before members feel them."),
        bull("Operations that self-heal: most incidents resolved automatically, before anyone notices."),
        bull("Modernisation embedded in every sprint \u2014 no separate project, no disruption to BAU."),
        bull("Executive visibility into cost, quality, speed, and member impact in real time."),
        spc(4),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("IBM Capability", W2*0.58), hc("Business Outcome", W2*0.42)] }),
          ...[ ["AI-First Development",  "25\u201340% faster delivery"],
               ["GenAI Quality Engine",  "80%+ test automation"],
               ["Agentic Operations",    ">74% auto-resolution"],
               ["Zero-Touch Delivery",  "\u221255% MTTR"],
               ["Outcome Governance",   "Real-time ROI visibility"] ]
            .map(([a,b],i) => new TableRow({ children: [dc(a,W2*0.58,{bold:true,fill:alt(i)}), vc(b,W2*0.42)] })),
        ]}),
        spc(5),
        subH("Current State vs. IBM 12-Month Targets", { before: 4, after: 2 }),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("Metric", W2*0.46), hc("Today", W2*0.22), hc("IBM Target", W2*0.32)] }),
          ...[ ["Test Automation Coverage", "~25%",      "80%+"],
               ["MTTR (Mean Time to Resolve)", ">4 hours", "<1.8 hours"],
               ["P3/P4 Auto-Resolution",   "<10%",     ">74%"],
               ["Defect Escape to Prod",   "High",      "\u221265%"],
               ["System Availability",     "~99.7%",    "99.9%+"] ]
            .map(([a,b,c],i) => new TableRow({ children: [dc(a,W2*0.46,{bold:true,fill:alt(i)}), dc(b,W2*0.22,{color:RED,fill:alt(i)}), vc(c,W2*0.32)] })),
        ]}),
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 3 — OPERATING MODEL  (ONE column — framework table needs full width)
    // ════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pg }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        ...sHead("2.0", "The IBM Operating Model", "One team. Three disciplines. One outcome owner."),
        body("IBM unifies Application Development, Quality Engineering, and Operations into product-aligned teams that own a business domain end-to-end. AI runs the engine beneath \u2014 routing, healing, testing, deploying \u2014 while teams focus on outcomes."),
        spc(3),
        // Full-width framework diagram
        new Table({ width: { size: W1, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [new TableCell({
            children: [
              new Paragraph({ children: [R("BUSINESS OUTCOMES", { sz: 8.5, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { before: sp(2), after: sp(1) } }),
              new Paragraph({ children: [R("Claims  \u00B7  Enrollment  \u00B7  Member Services  \u00B7  Provider Operations  \u00B7  Data Products", { sz: 9, color: BLUE })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(2) } }),
            ],
            shading: shade(LB2), columnSpan: 5,
            margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
            borders: { top: BLUE_TOP, bottom: THIN, left: THIN, right: THIN },
          })] }),
          new TableRow({ children: [
            ["Application\nDevelopment", BLUE],
            ["Quality\nEngineering",     "007D79"],
            ["Application\nManagement",  "0043CE"],
            ["Platform &\nIntegration",  "6929C4"],
            ["Data &\nAnalytics",        "005D5D"],
          ].map(([label, col]) => new TableCell({
            children: [new Paragraph({ children: [R(label, { sz: 9, bold: true, color: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(5), after: sp(5) } })],
            shading: shade(WHITE),
            width: { size: W1/5, type: WidthType.DXA },
            margins: { top: sp(3), bottom: sp(3), left: sp(3), right: sp(3) },
            borders: { top: { style: BorderStyle.SINGLE, size: 10, color: col }, bottom: THIN, left: THIN, right: THIN },
          })) }),
          new TableRow({ children: [new TableCell({
            children: [new Paragraph({ children: [R("IBM AI ENGINE  \u2014  AIOps  \u00B7  Agentic Intelligence  \u00B7  GenAI Quality  \u00B7  ICA  \u00B7  CareOps360", { sz: 9, bold: true, color: NAVY })], alignment: AlignmentType.CENTER, spacing: { before: sp(2), after: sp(2) } })],
            shading: shade(LB1), columnSpan: 5,
            margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
            borders: { top: THIN, bottom: THIN, left: THIN, right: THIN },
          })] }),
          new TableRow({ children: [new TableCell({
            children: [new Paragraph({ children: [R("PLATFORM FOUNDATION  \u2014  Hybrid Cloud  \u00B7  Integration Hub  \u00B7  Mainframe  \u00B7  Data Platforms  \u00B7  Security & Compliance", { sz: 8.5, color: G70 })], alignment: AlignmentType.CENTER, spacing: { before: sp(2), after: sp(2) } })],
            shading: shade(G10), columnSpan: 5,
            margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
            borders: { top: THIN, bottom: THIN, left: THIN, right: THIN },
          })] }),
        ]}),
        spc(6),
        // Two-column sub-layout (invisible table within 1-col Word section)
        twoCol([
          subH("Three Integrated Disciplines", { before: 0, after: 3 }),
          ...[ ["Application Development", "AI-assisted engineering, automated pipelines, and risk-scored releases. Developers build faster because the machine handles the routine."],
               ["Quality Engineering",     "Testing is a continuous signal at every commit, sprint, and deployment. GenAI generates tests. Coverage reaches 80%+ within 12 months."],
               ["Application Management", "Operations shift from reactive firefighting to predictive self-healing. Most incidents are resolved automatically \u2014 providers and members never notice."],
          ].flatMap(([t,d]) => [
            P([R(t, { sz: 10.5, bold: true, color: BLUE })], { before: 5, after: 2 }),
            P([R(d, { sz: 9.5, color: G70 })], { before: 0, after: 1 }),
          ]),
        ], [
          subH("Today vs. With IBM", { before: 0, after: 3 }),
          new Table({ width: { size: Math.round(W1*0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
            new TableRow({ children: [hc("Today", Math.round(W1*0.24)), hc("With IBM", Math.round(W1*0.24))] }),
            ...[ ["Siloed delivery towers",   "Unified product pods"],
                 ["Reactive firefighting",    "Predictive self-healing"],
                 ["Late-stage testing",       "Shift-left quality gates"],
                 ["Manual deployments",       "AI risk-scored pipelines"],
                 ["Activity-metric reports",  "Business outcome dashboards"],
                 ["Innovation as a project",  "Innovation in every sprint"] ]
              .map(([a,b],i) => new TableRow({ children: [dc(a,Math.round(W1*0.24),{color:G70,fill:alt(i)}), vc(b,Math.round(W1*0.24))] })),
          ]}),
        ]),
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 4 — AI-FIRST DEVELOPMENT  (TWO Word columns)
    // ════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pg }, column: { space: 720, count: 2 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // ── LEFT COLUMN ──────────────────────────────────────────────────────
        ...sHead("3.0", "AI-First Application Development", "Build faster. Ship safer."),
        ...empQuote(
          "When a member\u2019s enrollment takes two weeks because a downstream application is slow, that is a trust problem. IBM engineers the systems so that wait shrinks to hours.",
          "IBM Consulting \u2014 Member Experience Engineering"
        ),
        subH("How IBM Builds Faster", { before: 0, after: 2 }),
        bull("AI coding assistants generate code, flag risk patterns, and suggest optimisations \u2014 cutting delivery effort by 25\u201335%."),
        bull("Every change passes AI-scored gates: security, performance, coverage, and risk. Low-risk changes deploy without human approval."),
        bull("No separate modernisation programme. Every sprint includes an API-wrap, a library upgrade, or a refactor."),
        bull("Development squads aligned to Horizon\u2019s business domains \u2014 Claims, Enrollment, Member, Provider \u2014 so context stays with the team."),
        spc(4),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("Delivery Metric", W2*0.60), hc("12-Month Target", W2*0.40)] }),
          ...[ ["Time-to-market",       "25\u201340% faster"],
               ["Deployment frequency",  "2\u00D7 current pace"],
               ["Change failure rate",   "\u221260%"],
               ["Rollback / recovery",  "<15 minutes"] ]
            .map(([a,b],i) => new TableRow({ children: [dc(a,W2*0.60,{bold:true,fill:alt(i)}), vc(b,W2*0.40)] })),
        ]}),
        spc(5),
        subH("Modernisation Approach", { before: 4, after: 2 }),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("Action", W2*0.38), hc("Approach", W2*0.40), hc("Wave", W2*0.22)] }),
          ...[ ["API-wrap legacy",   "Expose as service",  "Wave 1"],
               ["Rehost workloads",  "Lift & validate",    "Wave 2"],
               ["Refactor priority", "Selective rebuild",  "Wave 3"],
               ["Retire & replace",  "SaaS substitution",  "Ongoing"] ]
            .map(([a,b,c],i) => new TableRow({ children: [dc(a,W2*0.38,{bold:true,fill:alt(i)}), dc(b,W2*0.40,{color:G70,fill:alt(i)}), vc(c,W2*0.22)] })),
        ]}),

        colBreak(),

        // ── RIGHT COLUMN ─────────────────────────────────────────────────────
        subH("Speed Gains by Capability", { before: 0, after: 2 }),
        P([R("Efficiency gain vs. traditional delivery:", { sz: 9, it: true, color: G50 })], { after: 3 }),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          bar2("AI-assisted coding",       80, "+30% capacity",       BLUE),
          bar2("Automated QE generation",  75, "+25% QE speed",       "007D79"),
          bar2("Risk-scored deployments",  70, "\u221260% failures",  "0043CE"),
          bar2("Modernisation-in-stride",  60, "Debt \u221230%/yr",   "6929C4"),
          bar2("Domain pod alignment",     65, "\u221240% handoffs",  "005D5D"),
        ]}),
        spc(6),
        subH("Why This Matters for Members & Providers", { before: 4, after: 2 }),
        P([R("Every improvement in delivery speed directly translates into faster feature releases for member-facing applications, quicker resolution of provider integration issues, and more timely processing of claims and authorisations.", { sz: 9.5, color: G70 })], { after: 4 }),
        P([R("When Horizon ships a change faster and with fewer defects, members get answers sooner, providers receive payments more quickly, and payers avoid the cost of rework and incident escalation.", { sz: 9.5, color: G70 })], { after: 4 }),
        spc(4),
        infoBar("AI-assisted development is not about replacing engineers. It is about amplifying them — so every Horizon engineer delivers twice the business value."),
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 5 — QUALITY ENGINEERING  (THREE Word columns)
    // ════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pg }, column: { space: 360, count: 3 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // ── COLUMN 1 ──────────────────────────────────────────────────────────
        ...sHead("4.0", "Quality Engineering"),
        P([R("Quality is a continuous signal \u2014 not a final checkpoint.", { sz: 10, it: true, color: NAVY })], { after: 5 }),
        subH("The Four Quality Layers", { before: 0, after: 3 }),

        P([R("Commit-Level AI Review", { sz: 10, bold: true, color: BLUE })], { before: 3, after: 1 }),
        P([R("The instant a developer pushes code, AI reviews it \u2014 flagging security risk, test gaps, and quality anti-patterns before any human sees the PR.", { sz: 9.5, color: G70 })], { after: 3 }),

        P([R("GenAI Test Generation", { sz: 10, bold: true, color: BLUE })], { before: 3, after: 1 }),
        P([R("AI synthesises regression, integration, and edge-case tests from code changes at commit speed. Coverage grows automatically \u2014 no manual test authoring required.", { sz: 9.5, color: G70 })], { after: 3 }),

        spc(5),
        P([R("Every defect that reaches production is a promise broken \u2014 a provider\u2019s claim processed incorrectly, a member\u2019s benefits delayed. IBM\u2019s quality engine is designed so that defect never leaves the building.", { sz: 9.5, it: true, color: NAVY })], { after: 3, align: AlignmentType.CENTER }),

        colBreak(),

        // ── COLUMN 2 ──────────────────────────────────────────────────────────
        P([R("Defect Prediction", { sz: 10, bold: true, color: BLUE })], { before: 0, after: 1 }),
        P([R("AI models trained on Horizon\u2019s own incident history identify high-risk code paths before they reach UAT. Fewer defects reach staging; far fewer reach production.", { sz: 9.5, color: G70 })], { after: 3 }),

        P([R("Production Feedback Loop", { sz: 10, bold: true, color: BLUE })], { before: 3, after: 1 }),
        P([R("Every production defect teaches the quality engine. The test suite tightens with every release cycle \u2014 an ever-improving quality net.", { sz: 9.5, color: G70 })], { after: 3 }),

        subH("Automation Coverage Journey", { before: 8, after: 2 }),
        P([R("Month-by-month progression:", { sz: 8.5, it: true, color: G50 })], { after: 3 }),
        new Table({ width: { size: W3, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          bar3("Month 0  \u2014 Baseline",  25, "~25%",  G50),
          bar3("Month 3  \u2014 Ignite",    45, "45%",   "0072C3"),
          bar3("Month 6  \u2014 Scale",     62, "62%",   "0043CE"),
          bar3("Month 9  \u2014 Optimise",  75, "75%",   BLUE),
          bar3("Month 12 \u2014 Target",    82, "82%+",  NAVY),
        ]}),

        colBreak(),

        // ── COLUMN 3 ──────────────────────────────────────────────────────────
        subH("QE Metrics", { before: 0, after: 2 }),
        new Table({ width: { size: W3, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("Metric", W3*0.48), hc("Now", W3*0.18), hc("Target", W3*0.34)] }),
          ...[ ["Test automation",     "~25%",     "80%+"],
               ["Defect escape",       "High",      "\u221265%"],
               ["Regression time",     "Multi-day", "\u221270%"],
               ["MTTD",               ">2 hours",  "<15 min"] ]
            .map(([a,b,c],i) => new TableRow({ children: [dc(a,W3*0.48,{bold:true,fill:alt(i)}), dc(b,W3*0.18,{color:RED,fill:alt(i)}), vc(c,W3*0.34)] })),
        ]}),
        spc(5),
        subH("Release Gate Checklist", { before: 4, after: 2 }),
        new Table({ width: { size: W3, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("Gate", W3*0.30), hc("Criteria & Touch", W3*0.70)] }),
          ...[ ["Commit",  "AI review + coverage \u2014 no human"],
               ["Build",   "Unit pass rate >98% \u2014 no human"],
               ["Staging", "Integration + perf \u2014 no human"],
               ["Release", "AI risk score + Tier 1 sign-off"] ]
            .map(([a,b],i) => new TableRow({ children: [dc(a,W3*0.30,{bold:true,fill:alt(i)}), dc(b,W3*0.70,{color:G70,sz:9,fill:alt(i)})] })),
        ]}),
        spc(4),
        infoBar("Quality is owned by the full team \u2014 not a separate QA function."),
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 6 — AIOPS & AGENTIC OPERATIONS  (ONE column — pipeline needs full width)
    // ════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pg }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        ...sHead("5.0", "AIOps & Agentic Operations", "From reactive firefighting to self-healing intelligence"),
        ...empQuote(
          "A provider should never have to call a helpdesk because a claims system is slow. A member should never see an error because two systems failed to sync overnight. IBM\u2019s AI operations model is designed so those moments simply stop happening.",
          "IBM AIOps \u2014 Zero-Touch Operations Framework"
        ),
        subH("The Zero-Touch Operations Pipeline", { before: 0, after: 3 }),
        new Table({ width: { size: W1, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [
            pipeCard("STEP 1", "Detect",   ["Correlate signals", "Anomaly detection", ">60% noise cut"],    BLUE),
            pipeCard("STEP 2", "Triage",   ["AI routing", "Impact scoring", "Auto-prioritise"],             "0072C3"),
            pipeCard("STEP 3", "Diagnose", ["Root cause AI", "Runbook guidance", "Pattern matching"],       "0043CE"),
            pipeCard("STEP 4", "Resolve",  ["Self-heal P3/P4", "Auto-remediate", "Zero-touch"],             "007D79"),
            pipeCard("STEP 5", "Learn",    ["Post-incident AI", "Knowledge capture", "Prevent recurrence"], "005D5D"),
          ]}),
        ]}),
        spc(5),
        twoCol([
          subH("AI Agents & Annual Value", { before: 0, after: 2 }),
          new Table({ width: { size: Math.round(W1*0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
            new TableRow({ children: [hc("Agent", Math.round(W1*0.22)), hc("What It Does", Math.round(W1*0.17)), hc("Value", Math.round(W1*0.09))] }),
            ...[ ["Detection & Correlation", "Cuts alert noise by >60%",             "$2.5\u20133.5M"],
                 ["Triage AI",              "Routes issues instantly",              "$1.3\u20131.5M"],
                 ["Root Cause Agent",       "Diagnoses in seconds",                 "$2.0\u20133.0M"],
                 ["Auto-Remediation",       "Resolves P3/P4 without human touch",  "$1.5\u20132.0M"],
                 ["Knowledge Agent",        "Learns from every incident",           "$1.0\u20131.3M"],
                 ["Deployment AI",          "Risk-scores every release",            "$0.8\u20131.2M"] ]
              .map(([a,b,c],i) => new TableRow({ children: [dc(a,Math.round(W1*0.22),{bold:true,fill:alt(i)}), dc(b,Math.round(W1*0.17),{color:G70,sz:9,fill:alt(i)}), vc(c,Math.round(W1*0.09),9)] })),
          ]}),
        ], [
          subH("Before vs. After — Key Metrics", { before: 0, after: 2 }),
          new Table({ width: { size: Math.round(W1*0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
            new TableRow({ children: [hc("Metric", Math.round(W1*0.22)), hc("Today", Math.round(W1*0.12)), hc("With IBM AIOps", Math.round(W1*0.14))] }),
            ...[ ["Mean Time to Resolve",   ">4 hours",  "<1.8 hours"],
                 ["P3/P4 Auto-Resolution", "<10%",       ">74%"],
                 ["Alert Noise",           "Unfiltered",  ">60% cut"],
                 ["System Availability",   "~99.7%",     "99.9%+"],
                 ["Recurring Incidents",   "Unmanaged",  "\u221250% demand"] ]
              .map(([a,b,c],i) => new TableRow({ children: [dc(a,Math.round(W1*0.22),{bold:true,fill:alt(i)}), dc(b,Math.round(W1*0.12),{color:RED,fill:alt(i)}), vc(c,Math.round(W1*0.14))] })),
          ]}),
          spc(4),
          infoBar("Target: most P3/P4 incidents resolved before a human is notified. Zero-touch operations."),
        ]),
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 7 — BUSINESS OUTCOMES & ROI  (TWO Word columns)
    // ════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pg }, column: { space: 720, count: 2 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // ── LEFT COLUMN ──────────────────────────────────────────────────────
        ...sHead("6.0", "Business Outcomes & Value", "Every initiative connects to a measurable result"),
        ...empQuote(
          "A payer that processes a claim faster spends less on administration and earns more member trust. IBM is building that future for Horizon \u2014 one sprint at a time.",
          "IBM Outcome Governance Framework"
        ),
        subH("Business Domain KPIs", { before: 0, after: 2 }),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("Domain", W2*0.36), hc("KPI", W2*0.40), hc("Target", W2*0.24)] }),
          ...[ ["Claims",           "Adjudication cycle time",   "\u221230%"],
               ["Enrollment",       "Time-to-activation",        "\u221240%"],
               ["Member Services",  "First-call resolution",     "+25%"],
               ["Provider Ops",     "Auth processing time",      "\u221235%"],
               ["Data & Reporting", "Report delivery latency",   "\u221250%"],
               ["IT Operations",    "Auto-resolution rate",      ">74%"] ]
            .map(([a,b,c],i) => new TableRow({ children: [dc(a,W2*0.36,{bold:true,fill:alt(i)}), dc(b,W2*0.40,{color:G70,fill:alt(i)}), vc(c,W2*0.24)] })),
        ]}),
        spc(5),
        subH("Cumulative Cost Takeout", { before: 4, after: 2 }),
        P([R("Directional \u2014 baselines locked in Phase 0:", { sz: 9, it: true, color: G50 })], { after: 3 }),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          bar2("Month 3  \u2014 Ignite",    12,  "$1\u20132M",     "0072C3"),
          bar2("Month 6  \u2014 Scale",     30,  "$3\u20135M",     "0043CE"),
          bar2("Month 12 \u2014 Optimize",  60,  "$6\u201310M",    BLUE),
          bar2("Month 24 \u2014 Transform", 100, "$12\u201318M+",  NAVY),
        ]}),

        colBreak(),

        // ── RIGHT COLUMN ─────────────────────────────────────────────────────
        subH("Annual Value by Initiative", { before: 0, after: 2 }),
        P([R("Directional annual contribution:", { sz: 9, it: true, color: G50 })], { after: 3 }),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          bar2("AIOps & Self-Healing",      85, "$3.5\u20136.5M",  BLUE),
          bar2("GenAI Quality Engine",      72, "$2.5\u20134.0M",  "007D79"),
          bar2("Zero-Touch Delivery",       60, "$2.0\u20133.0M",  "0043CE"),
          bar2("Platform Modernisation",    48, "$1.5\u20132.5M",  "6929C4"),
          bar2("Demand & Ticket Reduction", 55, "$1.0\u20132.0M",  "005D5D"),
        ]}),
        spc(5),
        subH("Three-Tier Governance", { before: 4, after: 2 }),
        ...[ ["Operational (Weekly)",  "SLA adherence, MTTR, pipeline velocity \u2014 live in CareOps360."],
             ["Executive (Monthly)",  "Cost takeout actuals, coverage progress, business KPI movement."],
             ["Board (Quarterly)",    "Total value realised, innovation delivered, year-ahead priorities."],
        ].flatMap(([t,d]) => [
          P([R(t, { sz: 10, bold: true, color: BLUE })], { before: 5, after: 1 }),
          P([R(d, { sz: 9.5, color: G70 })],            { before: 0, after: 1 }),
        ]),
        spc(5),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("Value Area", W2*0.40), hc("Cadence", W2*0.30), hc("Tracked In", W2*0.30)] }),
          ...[ ["Operational Excellence", "Weekly",     "ITSM + AIOps"],
               ["Cost & Productivity",   "Monthly",    "Finance + ITSM"],
               ["Quality Engineering",   "Per sprint",  "QE + CI/CD"],
               ["Platform & Mod.",       "Monthly",    "CMDB + Sec scans"],
               ["Business Outcomes",     "Monthly",    "Domain dashboards"] ]
            .map(([a,b,c],i) => new TableRow({ children: [dc(a,W2*0.40,{bold:true,fill:alt(i)}), dc(b,W2*0.30,{color:G70,fill:alt(i)}), vc(c,W2*0.30)] })),
        ]}),
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 8 — PLATFORM & DATA MODERNISATION  (TWO Word columns)
    // ════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pg }, column: { space: 720, count: 2 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // ── LEFT COLUMN ──────────────────────────────────────────────────────
        ...sHead("7.0", "Platform & Data Modernisation", "Eliminating the debt that slows Horizon down"),
        body("IBM embeds modernisation into steady-state delivery \u2014 no separate programme, no disruption to BAU. Every sprint includes a modernisation action. Technical debt is tracked by business impact and reduced systematically."),
        spc(3),
        subH("Modernisation Waves", { before: 0, after: 2 }),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("Workstream", W2*0.42), hc("Approach", W2*0.37), hc("Wave", W2*0.21)] }),
          ...[ ["Integration Hub",       "API-first + event streaming",  "Wave 1"],
               ["Mainframe APIs",        "API-wrap strategy",             "Wave 1"],
               ["DataOps Pipelines",     "AI-driven quality engine",      "Wave 1"],
               ["App Portfolio (~500)",  "Assess \u2192 rationalise",     "Wave 2"],
               ["Mainframe Rehost",      "Lift-and-validate",             "Wave 2"],
               ["Cloud Optimisation",    "Cost + performance tuning",     "Wave 2"],
               ["Mainframe Refactor",    "Selective modernise",           "Wave 3"],
               ["Security & Compliance","n-1 + auto-patch",               "Ongoing"] ]
            .map(([a,b,c],i) => new TableRow({ children: [dc(a,W2*0.42,{bold:true,fill:alt(i)}), dc(b,W2*0.37,{color:G70,sz:9,fill:alt(i)}), vc(c,W2*0.21,9)] })),
        ]}),

        colBreak(),

        // ── RIGHT COLUMN ─────────────────────────────────────────────────────
        subH("Technical Debt Reduction", { before: 0, after: 2 }),
        P([R("Debt index (100 = today) \u2014 quarterly trajectory:", { sz: 9, it: true, color: G50 })], { after: 3 }),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          bar2("Q1  Baseline",    100, "100",  RED),
          bar2("Q2  Wave 1",       78, "78",   "E57373"),
          bar2("Q3  Scale",        62, "62",   "0072C3"),
          bar2("Q4  Optimise",     48, "48",   BLUE),
          bar2("Year 2 Target",    28, "<30",  NAVY),
        ]}),
        spc(5),
        subH("Integration Architecture Shift", { before: 4, after: 2 }),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("Current State", W2*0.50), hc("IBM Target State", W2*0.50)] }),
          ...[ ["Point-to-point coupling",  "API-first Integration Hub"],
               ["Batch-heavy processing",   "Event-driven streaming"],
               ["Manual data pipelines",    "AI-quality DataOps"],
               ["Siloed observability",     "Unified estate monitoring"],
               ["Manual patching cycles",   "Auto-patch + n-1 standard"] ]
            .map(([a,b],i) => new TableRow({ children: [dc(a,W2*0.50,{color:RED,fill:alt(i)}), vc(b,W2*0.50)] })),
        ]}),
        spc(5),
        infoBar("Modernisation is not a programme. It is a habit \u2014 built into every sprint, compounding every month."),
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 9 — PHASED ROADMAP  (ONE column — wide tables need full width)
    // ════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pg }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        ...sHead("8.0", "Phased Roadmap & Value Milestones", "Risk-controlled \u00B7 Compounding value \u00B7 Transparent governance"),
        ...empQuote(
          "Every day a claim processes faster, a prior auth returns sooner, or an outage is resolved before it is noticed \u2014 that is a day Horizon\u2019s members and providers experience the difference. IBM\u2019s roadmap is structured so those days start in Week 1, not Year 2.",
          "IBM Delivery Governance"
        ),
        subH("Phase-by-Phase Delivery Plan", { before: 0, after: 3 }),
        new Table({ width: { size: W1, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("Phase", W1*0.15), hc("Timeframe", W1*0.11), hc("Focus & Key Deliverables", W1*0.44), hc("Value Signal", W1*0.30)] }),
          ...[ ["Phase 0\nFoundation",  "0\u20138 weeks",  "Telemetry onboarding  \u00B7  Baseline measurement  \u00B7  Transition plan  \u00B7  AI environment setup  \u00B7  Innovation council",    "Live dashboards; baselines locked; zero BAU disruption"],
               ["Phase 1\nIgnite",     "Month 1\u20133",  "AIOps live  \u00B7  P3/P4 self-heal pilots  \u00B7  GenAI QE framework  \u00B7  AI dev sprints  \u00B7  Quick-win automations",          "MTTR \u221220%  \u00B7  Automation ROI begins  \u00B7  QE 45%"],
               ["Phase 2\nScale",      "Month 3\u20136",  "Agentic triage at scale  \u00B7  Integration Hub Wave 1  \u00B7  QE 60%  \u00B7  DataOps monitoring  \u00B7  AI dev across all pods",      "Auto-resolve >50%  \u00B7  Defect escape \u221240%  \u00B7  $3\u20135M cumulative"],
               ["Phase 3\nOptimise",   "Month 6\u201312", "Autonomous ops for common patterns  \u00B7  QE 80%+  \u00B7  Modernisation sprints  \u00B7  Outcome governance live",                    "Cost takeout $6\u201310M  \u00B7  MTTR <1.8 hrs  \u00B7  99.9%+ availability"],
               ["Phase 4\nTransform",  "Year 1\u20132",   "Full autonomy  \u00B7  Mainframe rehost/refactor  \u00B7  Enterprise observability  \u00B7  Co-invest pipeline",                         "Structural cost takeout 40\u201350%  \u00B7  Total value $12\u201318M+"] ]
            .map(([ph,ti,de,va],i) => new TableRow({ children: [
              dc(ph,W1*0.15,{bold:true,color:NAVY,fill:alt(i)}),
              dc(ti,W1*0.11,{color:G70,fill:alt(i)}),
              dc(de,W1*0.44,{fill:alt(i)}),
              vc(va,W1*0.30),
            ]})),
        ]}),
        spc(6),
        subH("KPI Framework", { before: 0, after: 3 }),
        new Table({ width: { size: W1, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("Value Area", W1*0.20), hc("KPIs Tracked", W1*0.36), hc("Data Source", W1*0.24), hc("Cadence", W1*0.20)] }),
          ...[ ["Operational Excellence",    "MTTR, availability, incident volume, auto-resolution %",              "ITSM + AIOps telemetry",  "Weekly"],
               ["Cost & Productivity",      "Automation ROI, demand reduction, delivery velocity",                 "Finance + ITSM",           "Monthly"],
               ["Quality Engineering",      "Coverage, defect escape rate, regression time, MTTD",                "QE toolchain + CI/CD",     "Per sprint"],
               ["Platform & Modernisation", "n-1 compliance, debt index, upgrade velocity, CVE status",           "CMDB + security scans",    "Monthly"],
               ["Business Outcomes",        "Claims cycle, enrollment time, first-call resolution, provider ASA", "Domain dashboards",        "Monthly"] ]
            .map(([a,b,c,d],i) => new TableRow({ children: [dc(a,W1*0.20,{bold:true,fill:alt(i)}), dc(b,W1*0.36,{color:G70,fill:alt(i)}), dc(c,W1*0.24,{color:G70,fill:alt(i)}), vc(d,W1*0.20)] })),
        ]}),
      ],
    },

    // ════════════════════════════════════════════════════════════════════════
    // PAGE 10 — WHY IBM  (TWO Word columns)
    // ════════════════════════════════════════════════════════════════════════
    {
      properties: { page: { margin: pg }, column: { space: 720, count: 2 }, type: SectionType.NEXT_PAGE },
      ...hf(),
      children: [
        // ── LEFT COLUMN ──────────────────────────────────────────────────────
        ...sHead("9.0", "Why IBM \u2014 and Why Now", "The depth, assets, and accountability to deliver"),
        P([R("IBM\u2019s ultimate accountability is not to a contract. It is to the 3.7 million members who rely on Horizon\u2019s systems every day \u2014 the patient waiting for a prior auth, the provider navigating a claims dispute, the family enrolling in coverage for the first time.", { sz: 10, it: true, color: NAVY })], { after: 5 }),
        subH("What Makes IBM Different", { before: 0, after: 2 }),
        ...[ ["Production-Grade Assets, Day 1",  "IBM AIOps, ICA, CareOps360, and GenAI Quality Engine are live at comparable payers today \u2014 not promised in a roadmap."],
             ["Deep Horizon Knowledge",          "IBM brings institutional knowledge of Horizon\u2019s estate and change history, reducing transition risk to near-zero."],
             ["Healthcare Payer DNA",            "Claims, enrollment, prior auth, member services \u2014 IBM has modernised these for the nation\u2019s largest payers."],
             ["Shared Risk Model",               "IBM commits to outcome-based SLAs. Targets missed trigger IBM remediation plans \u2014 not contract renegotiations."],
             ["Innovation at No Extra Cost",     "Innovation sprints, AI tooling, and accelerators are built into the base model. Transformation is not a separate invoice."],
        ].flatMap(([t,d]) => [
          P([R(t, { sz: 10.5, bold: true, color: BLUE })], { before: 5, after: 2 }),
          P([R(d, { sz: 9.5, color: G70 })],              { before: 0, after: 1 }),
        ]),
        spc(5),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("IBM Scale", W2*0.50), hc("Fact", W2*0.50)] }),
          ...[ ["AI & Data Practitioners",    "20,000+ globally"],
               ["Cloud & Architecture Exp.",  "81,000+ IBM Consulting"],
               ["AI/Analytics Engagements",   "40,000+ delivered"],
               ["Top US Health Payers",       "9 of 10 served by IBM"] ]
            .map(([a,b],i) => new TableRow({ children: [dc(a,W2*0.50,{bold:true,fill:alt(i)}), vc(b,W2*0.50)] })),
        ]}),

        colBreak(),

        // ── RIGHT COLUMN ─────────────────────────────────────────────────────
        subH("The Next Three Steps", { before: 0, after: 2 }),
        ...[ ["Week 1\u20132", "Executive alignment session \u2014 Horizon leadership + IBM account team. Agree objectives, scope, and governance."],
             ["Week 2\u20134", "Phase 0 SOW agreed. Telemetry onboarding begins. Baseline discovery kicks off. Innovation council constituted."],
             ["Week 4",        "Contractual milestone: Phase 0 live. IBM and Horizon operating as one team from Day 1."],
        ].flatMap(([t,d]) => [
          P([R(t + ":  ", { sz: 10, bold: true, color: BLUE }), R(d, { sz: 9.5, color: G70 })], { before: 5, after: 2 }),
        ]),
        spc(5),
        subH("IBM vs. The Alternative", { before: 4, after: 2 }),
        new Table({ width: { size: W2, type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NO_BORD, rows: [
          new TableRow({ children: [hc("Dimension", W2*0.33), hc("Status Quo", W2*0.33), hc("IBM", W2*0.34)] }),
          ...[ ["Model",      "Towers, reactive",   "Unified pods, AI-first"],
               ["Dev",        "Manual pipelines",   "AI-assisted, +30%"],
               ["Quality",    "End-stage testing",  "Shift-left, GenAI"],
               ["Operations", "Firefighting",        "Self-healing, 0-touch"],
               ["Reporting",  "Activity metrics",   "Business outcomes"],
               ["Risk",       "Vendor bears none",  "Shared, outcome SLAs"] ]
            .map(([a,b,c],i) => new TableRow({ children: [dc(a,W2*0.33,{bold:true,fill:alt(i)}), dc(b,W2*0.33,{color:RED,fill:alt(i)}), vc(c,W2*0.34)] })),
        ]}),
        spc(6),
        blueHR(),
        spc(4),
        new Paragraph({
          children: [
            R("\u201CIBM\u2019s measure of success is not tickets closed or alerts silenced. It is the member who gets their answer faster, the provider who spends less time on administration, and the ", { sz: 11, it: true }),
            R("payer that directs every saved dollar back toward the care that matters.", { sz: 11, bold: true, it: true, color: NAVY }),
            R(" That is why we are here.\u201D", { sz: 11, it: true }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: sp(4), after: sp(4) },
          indent: { left: inch(0.2), right: inch(0.2) },
        }),
        P([R("\u2014 IBM Consulting, Healthcare & Payer Delivery  |  April 2026", { sz: 9.5, bold: true, color: BLUE })], { align: AlignmentType.RIGHT, after: 10 }),
        thinHR(),
        P([R("\u00A9 2026 IBM Corporation. All rights reserved.  Confidential \u2014 prepared exclusively for Horizon Healthcare Services.  Ref: IBM-HZN-AMS-RFP-2026-CAS", { sz: 7.5, color: G50 })], { align: AlignmentType.CENTER, before: 3 }),
      ],
    },
  ],
});

const buf = await Packer.toBuffer(doc);
writeFileSync("attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx", buf);
console.log("Done \u2014 " + buf.length.toLocaleString() + " bytes");
