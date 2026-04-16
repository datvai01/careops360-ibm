import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle, WidthType,
  ShadingType, TableLayoutType, Header, Footer, PageNumber,
  convertInchesToTwip, PageBreak,
} from "docx";
import { writeFileSync } from "fs";

// ── Brand palette ─────────────────────────────────────────────────────────────
const C = {
  blue:   "0F62FE",  navy:   "001141",
  teal:   "007D79",  green:  "198038",
  g10:    "F4F4F4",  g20:    "E0E0E0",
  g50:    "8D8D8D",  g70:    "525252",  g100: "161616",
  white:  "FFFFFF",
  lBlue:  "EBF2FF",  lBlue2: "D0E2FF",
  lGreen: "DEFBE6",  lTeal:  "D9FBFB",
  red:    "DA1E28",
};

const FONT  = "Calibri";
const hp    = (pt) => Math.round(pt * 2);           // pts → half-pts (font size)
const sp    = (pt) => Math.round(pt * 20);           // pts → twips  (spacing)
const inch  = (i)  => convertInchesToTwip(i);
const W     = 9360;                                   // content width DXA (6.5 in)

// ── Text run ──────────────────────────────────────────────────────────────────
const R = (text, { sz = 10.5, bold = false, it = false, color = C.g100, caps = false } = {}) =>
  new TextRun({ text, font: FONT, size: hp(sz), bold, italics: it, color, allCaps: caps });

// ── Paragraph ─────────────────────────────────────────────────────────────────
const P = (children, { before = 0, after = 3, left = 0, right = 0, align, keepNext } = {}) =>
  new Paragraph({
    children: Array.isArray(children) ? children : [children],
    spacing: { before: sp(before), after: sp(after) },
    indent: (left || right) ? { left: sp(left), right: sp(right) } : undefined,
    alignment: align,
    keepNext,
  });

const body = (text, { before = 0, after = 3 } = {}) =>
  P([R(text, { sz: 10.5, color: C.g100 })], { before, after });

const bull = (text, { sz = 10.5 } = {}) =>
  new Paragraph({
    children: [R(text, { sz, color: C.g100 })],
    bullet: { level: 0 },
    spacing: { before: sp(1), after: sp(2) },
  });

const spc = (pt = 4) =>
  new Paragraph({ children: [R("")], spacing: { before: 0, after: sp(pt) } });

// Section rule + title
const sHead = (num, title, tagline = "") => [
  new Paragraph({
    children: [],
    border: { top: { style: BorderStyle.SINGLE, size: 14, color: C.blue, space: 6 } },
    spacing: { before: sp(12), after: sp(1) },
  }),
  new Paragraph({
    children: [
      R(num + "  ", { sz: 8, bold: true, color: C.blue }),
      R(title.toUpperCase(), { sz: 13, bold: true, color: C.navy }),
      ...(tagline ? [R("   " + tagline, { sz: 9.5, it: true, color: C.g50 })] : []),
    ],
    spacing: { before: sp(1), after: sp(tagline ? 1 : 4) },
  }),
];

const subH = (text, { before = 6, after = 2, color = C.navy, sz = 10.5 } = {}) =>
  P([R(text, { sz, bold: true, color })], { before, after });

// Blue-border left quote callout
const callout = (quote, attr = "") => {
  const borderOpts = { left: { style: BorderStyle.SINGLE, size: 18, color: C.blue, space: 8 } };
  const shade      = { type: ShadingType.SOLID, fill: C.lBlue };
  return [
    new Paragraph({ children: [], border: borderOpts, shading: shade, spacing: { before: sp(5), after: 0 }, indent: { left: sp(10), right: sp(8) } }),
    new Paragraph({ children: [R("\u201C" + quote + "\u201D", { sz: 10.5, it: true, color: C.navy })], border: borderOpts, shading: shade, spacing: { before: sp(3), after: sp(2) }, indent: { left: sp(10), right: sp(8) } }),
    ...(attr ? [new Paragraph({ children: [R("\u2014 " + attr, { sz: 9, bold: true, color: C.blue })], border: borderOpts, shading: shade, alignment: AlignmentType.RIGHT, spacing: { before: 0, after: sp(5) }, indent: { left: sp(10), right: sp(8) } })] : []),
    new Paragraph({ children: [], border: borderOpts, shading: shade, spacing: { before: 0, after: sp(5) }, indent: { left: sp(10), right: sp(8) } }),
  ];
};

// ── Table helpers (LIGHT theme — no dark backgrounds) ─────────────────────────
const nb = { style: BorderStyle.NONE };
const noBorders = { top: nb, bottom: nb, left: nb, right: nb, insideH: nb, insideV: nb };
const lineBord  = (col = C.g20, sz = 2) => ({ style: BorderStyle.SINGLE, size: sz, color: col });

// Light header cell — IBM blue text on lBlue2 background
const hc = (text, w, { sz = 9.5 } = {}) =>
  new TableCell({
    children: [P([R(text, { sz, bold: true, color: C.navy })], { before: 3, after: 3 })],
    margins: { top: sp(2), bottom: sp(2), left: sp(6), right: sp(6) },
    shading: { type: ShadingType.SOLID, fill: C.lBlue2 },
    width: w ? { size: w, type: WidthType.DXA } : undefined,
    borders: { top: lineBord(C.blue, 6), bottom: lineBord(C.blue, 4), left: lineBord(C.g20), right: lineBord(C.g20) },
  });

// Regular data cell — white or very light gray alternating
const dc = (text, w, { bold = false, color = C.g100, shade, sz = 9.5, align } = {}) =>
  new TableCell({
    children: [new Paragraph({ children: [R(text, { sz, bold, color })], spacing: { before: sp(2), after: sp(2) }, alignment: align })],
    margins: { top: sp(2), bottom: sp(2), left: sp(6), right: sp(6) },
    shading: shade ? { type: ShadingType.SOLID, fill: shade } : undefined,
    width: w ? { size: w, type: WidthType.DXA } : undefined,
    borders: { top: lineBord(), bottom: lineBord(), left: lineBord(), right: lineBord() },
  });

// Highlight value cell — blue text on lBlue, used for target columns
const vc = (text, w, { color = C.blue, shade = C.lBlue, bold = true, sz = 9.5 } = {}) =>
  dc(text, w, { bold, color, shade, sz });

// Two-column layout using invisible table
const twoCol = (left, right, { lw = 0.48, gap = 0.04 } = {}) => {
  const lWidth = Math.round(W * lw);
  const gWidth = Math.round(W * gap);
  const rWidth = W - lWidth - gWidth;
  return new Table({
    width: { size: W, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders: noBorders,
    rows: [new TableRow({
      children: [
        new TableCell({ children: left,  width: { size: lWidth, type: WidthType.DXA }, borders: noBorders, margins: { right: sp(8) } }),
        new TableCell({ children: [spc(0)], width: { size: gWidth, type: WidthType.DXA }, borders: noBorders }),
        new TableCell({ children: right, width: { size: rWidth, type: WidthType.DXA }, borders: noBorders, margins: { left: sp(8) } }),
      ],
    })],
  });
};

// Horizontal bar chart row (pct 0–100)
const barRow = (label, pct, valueLabel, { lw = 2400, bw = 5000, vw = 1960, barCol = C.blue } = {}) => {
  const fill = Math.round(bw * pct / 100);
  const rest = bw - fill;
  return new TableRow({ children: [
    new TableCell({ children: [P([R(label, { sz: 9, color: C.g70 })], { after: 0 })], width: { size: lw, type: WidthType.DXA }, borders: noBorders, margins: { top: sp(2), bottom: sp(2), right: sp(4) }, verticalAlign: "center" }),
    new TableCell({ children: [spc(0)], width: { size: fill, type: WidthType.DXA }, shading: { type: ShadingType.SOLID, fill: barCol }, borders: noBorders }),
    new TableCell({ children: [spc(0)], width: { size: rest, type: WidthType.DXA }, shading: { type: ShadingType.SOLID, fill: "E0E0E0" }, borders: noBorders }),
    new TableCell({ children: [P([R(valueLabel, { sz: 9, bold: true, color: barCol })], { after: 0, align: AlignmentType.RIGHT })], width: { size: vw, type: WidthType.DXA }, borders: noBorders, margins: { top: sp(2), bottom: sp(2), left: sp(4) }, verticalAlign: "center" }),
  ]});
};

// Thin accent bar (full-width light callout text)
const accentBar = (text, { bg = C.lBlue, color = C.navy } = {}) =>
  new Paragraph({
    children: [R(text, { sz: 10, bold: true, color })],
    shading: { type: ShadingType.SOLID, fill: bg },
    spacing: { before: sp(6), after: sp(6) },
    indent: { left: sp(10), right: sp(10) },
  });

const blueHR = () =>
  new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.blue, space: 3 } }, spacing: { before: sp(5), after: sp(5) } });

const thinHR = () =>
  new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: C.g20, space: 3 } }, spacing: { before: sp(4), after: sp(4) } });

// KPI stat block for cover
const kpiCell = (value, label, sublabel, w) =>
  new TableCell({
    children: [
      new Paragraph({ children: [R(value, { sz: 24, bold: true, color: C.blue })], alignment: AlignmentType.CENTER, spacing: { before: sp(8), after: sp(2) } }),
      new Paragraph({ children: [R(label, { sz: 9, bold: true, color: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(2) } }),
      new Paragraph({ children: [R(sublabel, { sz: 8, it: true, color: C.g70 })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(8) } }),
    ],
    shading: { type: ShadingType.SOLID, fill: C.lBlue },
    margins: { top: sp(4), bottom: sp(4), left: sp(6), right: sp(6) },
    width: { size: w, type: WidthType.DXA },
    borders: { top: lineBord(C.blue, 8), bottom: lineBord(C.g20, 2), left: lineBord(C.g20, 2), right: lineBord(C.g20, 2) },
  });

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  creator: "IBM Consulting",
  title: "IBM × Horizon BCBS — Application Delivery & Operations Transformation",
  description: "Confidential — April 2026",
  sections: [

    // =========================================================================
    // PAGE 1 — COVER
    // =========================================================================
    {
      properties: { page: { margin: { top: inch(0), bottom: inch(0), left: inch(0), right: inch(0) } } },
      children: [

        // Navy top bar
        new Paragraph({
          children: [R("IBM CONSULTING   |   HEALTHCARE & PAYER DELIVERY", { sz: 8.5, bold: true, color: C.white, caps: true })],
          shading: { type: ShadingType.SOLID, fill: C.navy },
          alignment: AlignmentType.CENTER,
          spacing: { before: sp(14), after: sp(14) },
        }),
        // IBM Blue thin rule
        new Paragraph({ children: [], shading: { type: ShadingType.SOLID, fill: C.blue }, spacing: { before: 0, after: sp(2) } }),

        spc(32),

        // Confidential
        new Paragraph({ children: [R("CONFIDENTIAL  |  APRIL 2026", { sz: 8, bold: true, color: C.blue, caps: true })], alignment: AlignmentType.RIGHT, spacing: { before: 0, after: sp(6) }, indent: { right: inch(1.1) } }),

        // IBM eyebrow
        new Paragraph({ children: [R("IBM × HORIZON BLUE CROSS BLUE SHIELD OF NEW JERSEY", { sz: 10, bold: true, color: C.blue, caps: true })], spacing: { before: 0, after: sp(4) }, indent: { left: inch(1.1) } }),

        // Main title
        new Paragraph({ children: [R("Application Delivery,", { sz: 32, bold: true, color: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("Quality & Operations", { sz: 32, bold: true, color: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inch(1.1) } }),
        new Paragraph({ children: [R("Transformation", { sz: 32, bold: true, color: C.blue })], spacing: { before: 0, after: sp(4) }, indent: { left: inch(1.1) } }),

        new Paragraph({ children: [R("AI-First  ·  Business-Led  ·  Zero-Touch  ·  Outcome-Driven", { sz: 12, it: true, color: C.g70 })], spacing: { before: 0, after: sp(18) }, indent: { left: inch(1.1) } }),

        // 4-KPI row
        new Table({
          width: { size: Math.round(W + sp(8)), type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [new TableRow({ children: [
            kpiCell("40–50%", "Structural Cost Takeout",    "operational run-rate reduction",    Math.round((W + sp(8)) / 4)),
            kpiCell("25–40%", "Faster Time to Market",      "across development & change",       Math.round((W + sp(8)) / 4)),
            kpiCell(">74%",   "Incidents Auto-Resolved",    "P3/P4 zero-touch target",           Math.round((W + sp(8)) / 4)),
            kpiCell("80%+",   "Test Automation Coverage",   "from ~25% today",                   Math.round((W + sp(8)) / 4)),
          ]})],
        }),

        spc(12),

        new Paragraph({
          children: [R("\u201CThis is not an outsourcing contract. This is a transformation covenant — where IBM\u2019s success is defined entirely by Horizon\u2019s outcomes.\u201D", { sz: 11, it: true, color: C.navy })],
          spacing: { before: sp(4), after: sp(4) },
          indent: { left: inch(1.1), right: inch(1.1) },
        }),
        new Paragraph({ children: [R("\u2014 IBM Consulting, Healthcare & Payer Delivery", { sz: 9, bold: true, color: C.blue })], alignment: AlignmentType.RIGHT, spacing: { before: 0, after: sp(16) }, indent: { right: inch(1.1) } }),

        new Paragraph({ children: [], border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.g20, space: 0 } }, spacing: { before: sp(8), after: 0 }, indent: { left: inch(1.1), right: inch(1.1) } }),
        new Paragraph({
          children: [
            R("Prepared for: ", { sz: 8.5, bold: true, color: C.navy }), R("Horizon Healthcare Services     ", { sz: 8.5, color: C.g70 }),
            R("Submitted by: ", { sz: 8.5, bold: true, color: C.navy }), R("IBM Consulting — Healthcare & Payer     ", { sz: 8.5, color: C.g70 }),
            R("April 2026", { sz: 8.5, color: C.g70 }),
          ],
          spacing: { before: sp(5), after: sp(5) }, indent: { left: inch(1.1) },
        }),
        new Paragraph({ children: [R("\u00A9 2026 IBM Corporation. All rights reserved.  Powered by CareOps360 · IBM AIOps · IBM Consulting Advantage", { sz: 7.5, color: C.white })], shading: { type: ShadingType.SOLID, fill: C.navy }, alignment: AlignmentType.CENTER, spacing: { before: sp(5), after: sp(5) } }),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),
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
              R("IBM \u00D7 HORIZON BCBS  |  APPLICATION DELIVERY, QUALITY & OPERATIONS TRANSFORMATION", { sz: 7.5, bold: true, color: C.g50, caps: true }),
              R("   \u2014   CONFIDENTIAL", { sz: 7.5, bold: true, color: C.blue }),
            ],
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.blue, space: 4 } },
          }),
        ]}),
      },
      footers: {
        default: new Footer({ children: [
          new Paragraph({
            children: [
              R("CareOps360  ·  IBM AIOps  ·  IBM Consulting Advantage  ·  ICA", { sz: 7.5, bold: true, color: C.blue }),
              R("   |   \u00A9 2026 IBM Corporation   |   Page ", { sz: 7.5, color: C.g50 }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: hp(7.5), color: C.g50 }),
            ],
            border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.g20, space: 3 } },
            spacing: { before: sp(3) },
          }),
        ]}),
      },
      children: [

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 2 — THE STRATEGIC OPPORTUNITY
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("1.0", "The Strategic Opportunity", "Why this moment demands bold action"),

        ...callout(
          "Horizon carries 500+ applications, rising operational cost, and the growing expectations of 3.7 million members. The question is not whether to transform — it is who to trust with that transformation.",
          "IBM Consulting — AMS Transformation Brief, April 2026"
        ),

        spc(2),
        twoCol(
          [
            subH("Where Horizon Stands Today", { before: 0, after: 3 }),
            body("Horizon's application estate spans enrollment, claims, member services, provider operations, and data — managed across delivery teams that operate in silos. The result:"),
            spc(2),
            bull("Speed to market is constrained by manual processes, batch integration, and late-stage testing that catches defects only after they cost money."),
            bull("Operational teams spend more time firefighting incidents than building capability. Every recurring problem that reappears is compounding cost."),
            bull("Technology debt is accumulating — security exposure grows, compliance overhead rises, and modernization gets deferred."),
            bull("Quality is inconsistent. Test automation sits at ~25%, meaning 75% of testing is manual, slow, and expensive."),
            spc(4),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Business Challenge", Math.round(W*0.30)), hc("Cost of Inaction", Math.round(W*0.18))] }),
              ...[ ["Manual incident triage",       "Compounding MTTR costs"], ["Low test automation",         "Defects reach production"], ["Siloed delivery teams",       "Missed SLAs, slow change"], ["Deferred modernization",      "Growing security exposure"], ["Reactive operations model",   "Unpredictable availability"] ]
                .map(([a, b]) => new TableRow({ children: [dc(a, Math.round(W*0.30)), dc(b, Math.round(W*0.18), { color: C.red })] })),
            ]}),
          ],
          [
            subH("The IBM Transformation Offer", { before: 0, after: 3 }),
            body("IBM proposes a single, unified partnership that covers Application Development, Quality Engineering, and Operations — with AI as the operating engine, not a feature added later."),
            spc(2),
            bull("Faster development cycles through AI-assisted coding, automated testing, and risk-scored deployments."),
            bull("Quality embedded at every stage — from the moment a developer commits code to the moment it reaches a member."),
            bull("Operations that heal themselves — where most incidents are resolved before an engineer is notified."),
            bull("Platform modernization embedded in steady-state delivery — not a separate project with a separate budget."),
            bull("Real-time executive visibility into outcomes — cost, quality, speed, and availability — not activity reports."),
            spc(4),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("IBM Solution", Math.round(W*0.30)), hc("Business Outcome", Math.round(W*0.18))] }),
              ...[ ["AI-First Development",       "25–40% faster delivery"], ["GenAI Quality Engine",     "80%+ test automation"], ["Agentic Operations",       ">74% auto-resolution"], ["Zero-Touch Delivery",      "−55% MTTR"], ["Outcome Governance",       "Real-time ROI tracking"] ]
                .map(([a, b]) => new TableRow({ children: [dc(a, Math.round(W*0.30), { bold: true }), vc(b, Math.round(W*0.18))] })),
            ]}),
          ]
        ),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 3 — THE OPERATING MODEL
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("2.0", "The IBM Operating Model", "One team. Three disciplines. One outcome owner."),

        body("IBM's model unifies Application Development, Quality Engineering, and Operations into product-aligned teams — each owning a business domain end-to-end. AI drives the engine beneath them, eliminating handoffs and making automation the default, not the exception."),
        spc(4),

        // Architecture table
        new Table({ width: { size: W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
          new TableRow({ children: [new TableCell({
            children: [P([R("BUSINESS OUTCOMES", { sz: 8.5, bold: true, color: C.navy, caps: true })], { align: AlignmentType.CENTER, before: 2, after: 1 }), P([R("Claims  ·  Enrollment  ·  Member Services  ·  Provider Operations  ·  Data Products", { sz: 8.5, color: C.blue })], { align: AlignmentType.CENTER, before: 0, after: 2 })],
            shading: { type: ShadingType.SOLID, fill: C.lBlue2 }, columnSpan: 5, margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
            borders: { top: lineBord(C.blue, 8), bottom: lineBord(C.blue, 4), left: lineBord(C.g20), right: lineBord(C.g20) },
          })] }),
          new TableRow({ children: [
            ["Application\nDevelopment", C.blue],
            ["Quality\nEngineering", "007D79"],
            ["Application\nManagement", "0043CE"],
            ["Platform &\nIntegration", "6929C4"],
            ["Data &\nAnalytics", "005D5D"],
          ].map(([label, col]) => new TableCell({
            children: [P([R(label, { sz: 9, bold: true, color: C.white })], { align: AlignmentType.CENTER, before: 8, after: 8 })],
            shading: { type: ShadingType.SOLID, fill: col },
            width: { size: W / 5, type: WidthType.DXA },
            margins: { top: sp(4), bottom: sp(4), left: sp(4), right: sp(4) },
            borders: { top: lineBord(C.white), bottom: lineBord(C.white), left: lineBord(C.white), right: lineBord(C.white) },
          })) }),
          new TableRow({ children: [new TableCell({
            children: [P([R("IBM AI ENGINE  —  AIOps  ·  Agentic Intelligence  ·  GenAI Quality  ·  ICA  ·  CareOps360", { sz: 9, bold: true, color: C.navy })], { align: AlignmentType.CENTER, before: 2, after: 2 })],
            shading: { type: ShadingType.SOLID, fill: C.lBlue }, columnSpan: 5, margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
            borders: { top: lineBord(C.blue, 4), bottom: lineBord(C.blue, 4), left: lineBord(C.g20), right: lineBord(C.g20) },
          })] }),
          new TableRow({ children: [new TableCell({
            children: [P([R("PLATFORM FOUNDATION  —  Hybrid Cloud  ·  Integration Hub  ·  Mainframe Modernization  ·  Data Platforms  ·  Security & Compliance", { sz: 8.5, color: C.g70 })], { align: AlignmentType.CENTER, before: 2, after: 2 })],
            shading: { type: ShadingType.SOLID, fill: C.g10 }, columnSpan: 5, margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) },
            borders: { top: lineBord(C.g20), bottom: lineBord(C.g20), left: lineBord(C.g20), right: lineBord(C.g20) },
          })] }),
        ]}),

        spc(6),

        twoCol(
          [
            subH("Three Integrated Disciplines", { before: 0, after: 3 }),
            ...[ ["Application Development", "Feature delivery, cloud-native development, and modernization — driven by AI-assisted engineering, automated pipelines, and risk-scored releases. Developers build faster because the machine handles the routine."],
                ["Quality Engineering",      "Testing is not a phase. It is a continuous signal built into every commit, every sprint, every deployment. GenAI generates tests. AI predicts defects. Coverage reaches 80%+ within 12 months."],
                ["Application Management",   "Operations shift from reactive firefighting to predictive, self-healing management. AI agents handle most incidents without human intervention. SRE teams focus on resilience, not resolution."],
            ].flatMap(([t, d]) => [
              P([R(t, { sz: 10.5, bold: true, color: C.blue })], { before: 5, after: 2 }),
              P([R(d, { sz: 9.5, color: C.g70 })], { before: 0, after: 1 }),
            ]),
          ],
          [
            subH("What Changes for Horizon", { before: 0, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Today", Math.round(W*0.24)), hc("With IBM", Math.round(W*0.24))] }),
              ...[ ["Tower-based siloes",         "Unified product pods"], ["Reactive incident response",  "Predictive self-healing"], ["Late-stage testing",          "Shift-left quality gates"], ["Manual deployments",          "AI risk-scored pipelines"], ["Activity-metric reporting",   "Business outcome dashboards"], ["Innovation as a project",     "Innovation in every sprint"] ]
                .map(([a, b]) => new TableRow({ children: [dc(a, Math.round(W*0.24), { color: C.g70, sz: 9 }), vc(b, Math.round(W*0.24), { sz: 9 })] })),
            ]}),
          ]
        ),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 4 — AI-FIRST DEVELOPMENT
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("3.0", "AI-First Application Development", "Build faster. Ship safer. Modernize continuously."),

        ...callout(
          "Every developer on the IBM team is augmented by AI — from the first line of code to the final deployment gate. The result is a delivery team that operates at a pace no traditional model can match.",
          "IBM Consulting Advantage — Developer AI Platform"
        ),

        spc(2),
        twoCol(
          [
            subH("How IBM Builds Faster", { before: 0, after: 3 }),
            ...[ ["AI-Assisted Development",   "Developers work alongside AI coding assistants that generate boilerplate, suggest optimisations, and flag risk patterns in real time — cutting delivery effort by 25–35%."],
                ["Automated Release Gates",   "Every change passes through an AI-scored release readiness gate: security scan, performance benchmark, coverage check, and risk scoring — all automated."],
                ["Modernization-in-Stride",   "Modernization is not a separate programme. Every sprint includes a modernisation action: an API-wrap, a refactor, a library upgrade — compounding progress continuously."],
                ["Domain-Aligned Dev Pods",   "Development squads are aligned to Horizon's business domains — Claims, Enrollment, Member, Provider — so context is not lost in handoffs."],
            ].flatMap(([t, d]) => [
              P([R(t, { sz: 10.5, bold: true, color: C.blue })], { before: 5, after: 2 }),
              P([R(d, { sz: 9.5, color: C.g70 })], { before: 0, after: 1 }),
            ]),
            spc(4),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Development Metric", Math.round(W*0.28)), hc("Target", Math.round(W*0.20))] }),
              ...[ ["Time-to-market", "25–40% faster"], ["Deployment frequency", "2× current"], ["Change failure rate", "−60%"], ["Rollback time", "<15 minutes"] ]
                .map(([a, b]) => new TableRow({ children: [dc(a, Math.round(W*0.28), { bold: true }), vc(b, Math.round(W*0.20))] })),
            ]}),
          ],
          [
            subH("Delivery Speed Gains by Capability", { before: 0, after: 3 }),
            P([R("Efficiency contribution — AI-assisted vs. traditional delivery:", { sz: 9, it: true, color: C.g50 })], { after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: noBorders, rows: [
              barRow("AI-assisted coding",        80, "+30% capacity",  { lw: 2200, bw: 4200, vw: 1560, barCol: C.blue }),
              barRow("Automated test generation", 75, "+25% QE speed",  { lw: 2200, bw: 4200, vw: 1560, barCol: "007D79" }),
              barRow("Risk-scored deployments",   70, "−60% failures",  { lw: 2200, bw: 4200, vw: 1560, barCol: "0043CE" }),
              barRow("Modernisation-in-stride",   60, "Debt −30%/yr",   { lw: 2200, bw: 4200, vw: 1560, barCol: "6929C4" }),
              barRow("Domain pod alignment",      65, "−40% handoffs",  { lw: 2200, bw: 4200, vw: 1560, barCol: "005D5D" }),
            ]}),
            spc(6),
            subH("The Modernisation Continuum", { before: 4, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Action", Math.round(W*0.20)), hc("Approach", Math.round(W*0.16)), hc("When", Math.round(W*0.12))] }),
              ...[ ["API-wrap legacy",    "Expose as service", "Wave 1"], ["Rehost workloads",  "Lift & validate",  "Wave 2"], ["Refactor priority",  "Selective rebuild", "Wave 3"], ["Retire & replace",   "Replace with SaaS", "Ongoing"] ]
                .map(([a, b, c]) => new TableRow({ children: [dc(a, Math.round(W*0.20), { bold: true }), dc(b, Math.round(W*0.16), { color: C.g70 }), vc(c, Math.round(W*0.12))] })),
            ]}),
          ]
        ),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 5 — QUALITY ENGINEERING
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("4.0", "Quality Engineering", "Quality is not a checkpoint. It is a continuous signal."),

        ...callout(
          "When a defect reaches production, it has already cost Horizon 10× more to fix than if it had been caught at the commit stage. IBM\u2019s GenAI quality engine shifts the catch point left — dramatically.",
          "IBM Quality Engineering — Shift-Left Framework"
        ),

        spc(2),
        twoCol(
          [
            subH("The Four Layers of Quality", { before: 0, after: 3 }),
            ...[ ["Commit-Level AI Review",    "The moment a developer pushes code, AI reviews it — flagging security risk, test gaps, and performance anti-patterns before a human reviewer sees it."],
                ["GenAI Test Generation",     "AI synthesises regression, integration, and edge-case tests from code changes at commit speed. Coverage grows automatically — without manual test authoring."],
                ["Defect Prediction",         "AI models trained on Horizon's own incident history identify high-risk code paths before they reach UAT. Fewer defects reach staging; far fewer reach production."],
                ["Production Feedback Loop",  "Every production defect teaches the quality engine. The test suite improves with every release — an ever-tightening quality net that never stays static."],
            ].flatMap(([t, d]) => [
              P([R(t, { sz: 10.5, bold: true, color: C.blue })], { before: 5, after: 2 }),
              P([R(d, { sz: 9.5, color: C.g70 })], { before: 0, after: 1 }),
            ]),
            spc(4),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("QE Metric", Math.round(W*0.24)), hc("Today", Math.round(W*0.10)), hc("12-Month Target", Math.round(W*0.14))] }),
              ...[ ["Test automation coverage", "~25%",      "80%+"], ["Defect escape to production",  "High",       "−65%"], ["Regression cycle time",       "Multi-day",  "−70%"], ["Mean time to detect (MTTD)",   ">2 hours",   "<15 min"] ]
                .map(([a, b, c]) => new TableRow({ children: [dc(a, Math.round(W*0.24), { bold: true }), dc(b, Math.round(W*0.10), { color: C.red }), vc(c, Math.round(W*0.14))] })),
            ]}),
          ],
          [
            subH("Test Automation Coverage Journey", { before: 0, after: 3 }),
            P([R("From ~25% today to 80%+ by month 12:", { sz: 9, it: true, color: C.g50 })], { after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: noBorders, rows: [
              barRow("Month 0  — Baseline",    25, "~25%", { lw: 2000, bw: 4400, vw: 1560, barCol: C.g50 }),
              barRow("Month 3  — Ignite",      45, "45%",  { lw: 2000, bw: 4400, vw: 1560, barCol: "0072C3" }),
              barRow("Month 6  — Scale",       62, "62%",  { lw: 2000, bw: 4400, vw: 1560, barCol: "0043CE" }),
              barRow("Month 9  — Optimize",    75, "75%",  { lw: 2000, bw: 4400, vw: 1560, barCol: C.blue }),
              barRow("Month 12 — Target",      82, "82%+", { lw: 2000, bw: 4400, vw: 1560, barCol: C.navy }),
            ]}),
            spc(6),
            subH("Quality Governance", { before: 4, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Gate", Math.round(W*0.22)), hc("Criteria", Math.round(W*0.26))] }),
              ...[ ["Commit gate",     "AI review + coverage delta"], ["Build gate",      "Unit test pass rate >98%"], ["Staging gate",    "Integration + perf benchmarks"], ["Release gate",    "AI risk score + exec sign-off (Tier 1)"] ]
                .map(([a, b]) => new TableRow({ children: [dc(a, Math.round(W*0.22), { bold: true }), dc(b, Math.round(W*0.26), { color: C.g70 })] })),
            ]}),
          ]
        ),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 6 — AIOPS & AGENTIC OPERATIONS
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("5.0", "AIOps & Agentic Operations", "From firefighting to self-healing intelligence"),

        ...callout(
          "When AI detects, diagnoses, and resolves — engineers stop reacting to alerts and start building capability. That capacity shift is worth $8–12M in annual value for Horizon\u2019s estate.",
          "IBM AIOps Value Case — Horizon 500-App Estate"
        ),

        spc(2),

        // 5-stage ops pipeline
        subH("The Zero-Touch Operations Pipeline", { before: 0, after: 3 }),
        new Table({ width: { size: W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
          new TableRow({ children: [
            ["DETECT\nCorrelate signals\nAnomaly detection\n>60% noise cut",     C.blue],
            ["TRIAGE\nAI routing\nImpact scoring\nAuto-prioritise",               "0072C3"],
            ["DIAGNOSE\nRoot cause AI\nRunbook guidance\nPattern matching",        "0043CE"],
            ["RESOLVE\nSelf-heal P3/P4\nAuto-remediate\nZero-touch",              "005D5D"],
            ["LEARN\nPost-incident AI\nKnowledge capture\nPrevent recurrence",    "007D79"],
          ].map(([text, fill]) => new TableCell({
            children: [P([R(text, { sz: 8.5, color: C.white })], { align: AlignmentType.CENTER, before: 8, after: 8 })],
            shading: { type: ShadingType.SOLID, fill },
            width: { size: W / 5, type: WidthType.DXA }, margins: { top: sp(4), bottom: sp(4), left: sp(5), right: sp(5) },
            borders: { top: lineBord(C.white), bottom: lineBord(C.white), left: lineBord(C.white), right: lineBord(C.white) },
          })) }),
        ]}),

        spc(5),
        twoCol(
          [
            subH("AI Agents at Work", { before: 0, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Agent", Math.round(W*0.20)), hc("What It Does", Math.round(W*0.18)), hc("Value", Math.round(W*0.10))] }),
              ...[ ["Detection & Correlation", "Cuts alert noise by >60%",          "$2.5–3.5M"], ["Triage AI",              "Routes issues instantly",            "$1.3–1.5M"], ["Root Cause Agent",       "Diagnoses in seconds, not hours",    "$2.0–3.0M"], ["Auto-Remediation",       "Resolves P3/P4 without human touch", "$1.5–2.0M"], ["Knowledge Agent",        "Learns from every incident",         "$1.0–1.3M"], ["Deployment AI",          "Risk-scores every release",          "$0.8–1.2M"] ]
                .map(([a, b, c]) => new TableRow({ children: [dc(a, Math.round(W*0.20), { bold: true }), dc(b, Math.round(W*0.18), { color: C.g70, sz: 9 }), vc(c, Math.round(W*0.10), { sz: 9 })] })),
            ]}),
          ],
          [
            subH("Before vs. After — Operations", { before: 0, after: 3 }),
            P([R("Key metric shifts from IBM AIOps deployment:", { sz: 9, it: true, color: C.g50 })], { after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Metric", Math.round(W*0.22)), hc("Today", Math.round(W*0.12)), hc("With IBM AIOps", Math.round(W*0.14))] }),
              ...[ ["Mean Time to Resolve",   ">4 hours",    "<1.8 hours"], ["P3/P4 Auto-Resolution", "<10%",        ">74%"], ["Alert Noise",          "Unfiltered",  ">60% cut"], ["System Availability",  "~99.7%",      "99.9%+"], ["Recurring Incidents",  "Unmanaged",   "−50% demand"] ]
                .map(([a, b, c]) => new TableRow({ children: [dc(a, Math.round(W*0.22), { bold: true }), dc(b, Math.round(W*0.12), { color: C.red, sz: 9 }), vc(c, Math.round(W*0.14), { sz: 9 })] })),
            ]}),
            spc(4),
            accentBar("The target: most incidents are resolved before a human is notified. That is zero-touch operations.", { bg: C.lBlue, color: C.navy }),
          ]
        ),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 7 — BUSINESS OUTCOMES & ROI
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("6.0", "Business Outcomes & Value Realization", "Every initiative connects to a measurable business result"),

        ...callout(
          "IBM measures success in business currency — not ticket counts. Claims cycle time. Member satisfaction. Enrollment speed. Cost per application. These are the numbers that matter to Horizon\u2019s leadership.",
          "IBM Outcome Governance Framework"
        ),

        spc(2),
        twoCol(
          [
            subH("Business Domain Outcomes", { before: 0, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Business Domain", Math.round(W*0.19)), hc("KPI", Math.round(W*0.17)), hc("Target", Math.round(W*0.12))] }),
              ...[ ["Claims Adjudication", "Processing cycle time",    "−30%"], ["Enrollment",          "Time-to-activation",      "−40%"], ["Member Services",     "First-call resolution",   "+25%"], ["Provider Operations", "Auth processing time",    "−35%"], ["Data & Reporting",    "Report delivery latency", "−50%"], ["IT Operations",       "Auto-resolution rate",    ">74%"] ]
                .map(([a, b, c]) => new TableRow({ children: [dc(a, Math.round(W*0.19), { bold: true }), dc(b, Math.round(W*0.17), { color: C.g70, sz: 9 }), vc(c, Math.round(W*0.12))] })),
            ]}),
            spc(5),
            subH("Cumulative Cost Takeout", { before: 4, after: 3 }),
            P([R("Directional — baselines locked in Phase 0:", { sz: 9, it: true, color: C.g50 })], { after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: noBorders, rows: [
              barRow("Month 3  (Ignite complete)",    12, "$1–2M",    { lw: 2200, bw: 4300, vw: 1460, barCol: "0072C3" }),
              barRow("Month 6  (Scale complete)",     30, "$3–5M",    { lw: 2200, bw: 4300, vw: 1460, barCol: "0043CE" }),
              barRow("Month 12 (Optimize complete)",  60, "$6–10M",   { lw: 2200, bw: 4300, vw: 1460, barCol: C.blue }),
              barRow("Month 24 (Transform complete)", 100, "$12–18M+", { lw: 2200, bw: 4300, vw: 1460, barCol: C.navy }),
            ]}),
          ],
          [
            subH("Value by Initiative", { before: 0, after: 3 }),
            P([R("Annual directional value contribution:", { sz: 9, it: true, color: C.g50 })], { after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: noBorders, rows: [
              barRow("AIOps & Self-Healing Ops",    85, "$3.5–6.5M", { lw: 2400, bw: 3800, vw: 1760, barCol: C.blue }),
              barRow("GenAI Quality Engineering",   72, "$2.5–4.0M", { lw: 2400, bw: 3800, vw: 1760, barCol: "007D79" }),
              barRow("Zero-Touch Delivery Pipeline",60, "$2.0–3.0M", { lw: 2400, bw: 3800, vw: 1760, barCol: "0043CE" }),
              barRow("Platform Modernisation",      48, "$1.5–2.5M", { lw: 2400, bw: 3800, vw: 1760, barCol: "6929C4" }),
              barRow("Demand & Ticket Reduction",   55, "$1.0–2.0M", { lw: 2400, bw: 3800, vw: 1760, barCol: "005D5D" }),
            ]}),
            spc(5),
            subH("Three-Tier Governance Model", { before: 4, after: 3 }),
            ...[ ["Operational  (Weekly)",    "SLA adherence, MTTR, pipeline velocity — tracked live in CareOps360."],
                ["Executive  (Monthly)",     "Cost takeout actuals, coverage progress, modernisation milestones, business KPI movement."],
                ["Board  (Quarterly)",       "Strategic outcomes: total value realised, innovation delivered, year-ahead priorities."],
            ].flatMap(([t, d]) => [
              P([R(t, { sz: 10, bold: true, color: C.blue })], { before: 4, after: 1 }),
              P([R(d, { sz: 9.5, color: C.g70 })], { before: 0, after: 1 }),
            ]),
          ]
        ),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 8 — PLATFORM & DATA MODERNISATION
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("7.0", "Platform & Data Modernisation", "Eliminating the debt that slows Horizon down"),

        body("IBM embeds platform modernisation into steady-state delivery — no separate programme, no disruption to BAU. Every sprint may include a modernisation action. Technical debt is tracked by business impact and burned down systematically."),
        spc(3),

        twoCol(
          [
            subH("Modernisation Waves", { before: 0, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Workstream", Math.round(W*0.20)), hc("Approach", Math.round(W*0.18)), hc("Wave", Math.round(W*0.10))] }),
              ...[ ["Integration Hub",        "API-first + event streaming", "Wave 1"], ["Mainframe APIs",        "API-wrap strategy",          "Wave 1"], ["DataOps Pipelines",     "AI-driven quality engine",   "Wave 1"], ["App Portfolio (~500)",  "Assess → rationalise",       "Wave 2"], ["Mainframe Rehost",      "Lift-and-validate",          "Wave 2"], ["Cloud Optimisation",    "Cost + performance tuning",  "Wave 2"], ["Mainframe Refactor",    "Selective modernise",        "Wave 3"], ["Security & Compliance", "n-1 standard + auto-patch",  "Ongoing"] ]
                .map(([a, b, c]) => new TableRow({ children: [dc(a, Math.round(W*0.20), { bold: true }), dc(b, Math.round(W*0.18), { color: C.g70, sz: 9 }), vc(c, Math.round(W*0.10), { sz: 9 })] })),
            ]}),
          ],
          [
            subH("Technical Debt Reduction Trajectory", { before: 0, after: 3 }),
            P([R("Debt index (100 = today) — driven by n-1 enforcement and embedded modernisation:", { sz: 9, it: true, color: C.g50 })], { after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: noBorders, rows: [
              barRow("Q1  Baseline",      100, "100 (index)",  { lw: 1900, bw: 4600, vw: 1460, barCol: C.red }),
              barRow("Q2  Post Wave 1",    78, "78",           { lw: 1900, bw: 4600, vw: 1460, barCol: "FF8389" }),
              barRow("Q3  Scale",          62, "62",           { lw: 1900, bw: 4600, vw: 1460, barCol: "0072C3" }),
              barRow("Q4  Optimize",       48, "48",           { lw: 1900, bw: 4600, vw: 1460, barCol: C.blue }),
              barRow("Year 2 Target",      28, "<30",          { lw: 1900, bw: 4600, vw: 1460, barCol: C.navy }),
            ]}),
            spc(5),
            subH("Integration Architecture Shift", { before: 4, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Current State", Math.round(W*0.24)), hc("IBM Target State", Math.round(W*0.24))] }),
              ...[ ["Point-to-point coupling",   "API-first Integration Hub"], ["Batch-heavy processing",   "Event-driven streaming"], ["Manual data pipelines",    "AI-quality DataOps"], ["Siloed observability",     "Unified estate monitoring"], ["Manual patching cycles",   "Auto-patch + n-1 standard"] ]
                .map(([a, b]) => new TableRow({ children: [dc(a, Math.round(W*0.24), { color: C.red, sz: 9 }), vc(b, Math.round(W*0.24), { sz: 9 })] })),
            ]}),
          ]
        ),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 9 — PHASED ROADMAP
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("8.0", "Phased Roadmap & Value Milestones", "Risk-controlled · Compounding value · Transparent governance"),

        ...callout(
          "Value does not arrive at the end of a programme. It compounds from Day 1 — every automation added, every self-heal triggered, every defect caught early is a dollar returned to Horizon.",
          "IBM Delivery Governance, April 2026"
        ),

        spc(2),
        subH("Phase-by-Phase Delivery Plan", { before: 0, after: 3 }),
        new Table({ width: { size: W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
          new TableRow({ children: [hc("Phase", W*0.15), hc("Timeframe", W*0.11), hc("Focus & Key Deliverables", W*0.44), hc("Value Signal", W*0.30)] }),
          ...[
            ["Phase 0\nFoundation",  "0–8 weeks",    "Telemetry onboarding  ·  Baseline measurement  ·  Transition plan  ·  AI environment setup  ·  Innovation council", "Live dashboards; baselines locked; no disruption to BAU"],
            ["Phase 1\nIgnite",      "Month 1–3",    "AIOps live  ·  P3/P4 self-heal pilots  ·  GenAI QE framework  ·  First AI-assisted dev sprints  ·  Quick-win automations", "MTTR −20%  ·  First automation ROI  ·  QE coverage 45%"],
            ["Phase 2\nScale",       "Month 3–6",    "Agentic triage at scale  ·  Integration Hub Wave 1  ·  QE coverage 60%  ·  DataOps monitoring  ·  AI dev augmentation for all pods", "Auto-resolve >50%  ·  Defect escape −40%  ·  $3–5M cumulative value"],
            ["Phase 3\nOptimize",    "Month 6–12",   "Autonomous ops for common patterns  ·  QE 80%+  ·  Continuous modernisation sprints  ·  Outcome governance live  ·  Full domain pod alignment", "Cost takeout $6–10M  ·  MTTR <1.8 hrs  ·  Availability 99.9%+"],
            ["Phase 4\nTransform",   "Year 1–2",     "Full autonomy across estate  ·  Mainframe rehost/refactor  ·  Enterprise observability  ·  DataOps maturity  ·  Co-invest pipeline", "Structural cost takeout 40–50%  ·  Total value $12–18M+"],
          ].map(([phase, time, dels, val]) => new TableRow({ children: [
            dc(phase, W*0.15, { bold: true, sz: 9, color: C.navy }),
            dc(time,  W*0.11, { sz: 9, color: C.g70 }),
            dc(dels,  W*0.44, { sz: 9 }),
            vc(val,   W*0.30, { sz: 9, shade: C.lBlue }),
          ]})),
        ]}),

        spc(6),
        subH("Outcome KPI Framework", { before: 0, after: 3 }),
        new Table({ width: { size: W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
          new TableRow({ children: [hc("Value Area", W*0.20), hc("KPIs Tracked", W*0.36), hc("Data Source", W*0.24), hc("Reporting Cadence", W*0.20)] }),
          ...[ ["Operational Excellence",  "MTTR, availability, incident volume, auto-resolution %",         "ITSM + AIOps telemetry",    "Weekly"],
              ["Cost & Productivity",     "Automation ROI, demand reduction, delivery velocity",             "Finance + ITSM",             "Monthly"],
              ["Quality Engineering",     "Coverage, defect escape rate, regression time, MTTD",            "QE toolchain + CI/CD",       "Per sprint"],
              ["Platform & Modernisation","n-1 compliance, debt index, upgrade velocity, CVE remediation",  "CMDB + security scans",      "Monthly"],
              ["Business Outcomes",       "Claims cycle, enrollment time, first-call resolution, ASA",      "Domain dashboards",          "Monthly"],
          ].map(([a, b, c, d]) => new TableRow({ children: [dc(a, W*0.20, { bold: true }), dc(b, W*0.36, { color: C.g70, sz: 9 }), dc(c, W*0.24, { color: C.g70, sz: 9 }), vc(d, W*0.20)] })),
        ]}),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ═══════════════════════════════════════════════════════════════════
        // PAGE 10 — WHY IBM & CALL TO ACTION
        // ═══════════════════════════════════════════════════════════════════
        ...sHead("9.0", "Why IBM — and Why Now", "The depth, the assets, and the accountability to deliver"),

        spc(2),

        // 4-stat row — light blue background, IBM blue numbers
        new Table({ width: { size: W, type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
          new TableRow({ children: [
            kpiCell("20,000+", "AI & Data Practitioners",           "dedicated globally",              W/4),
            kpiCell("81,000+", "Cloud & Architecture Experts",       "across IBM Consulting",           W/4),
            kpiCell("40,000+", "AI/Analytics Engagements",          "delivered for clients worldwide",  W/4),
            kpiCell("9 of 10", "Top US Health Payers",              "served by IBM Consulting",        W/4),
          ]})
        ]}),

        spc(6),
        twoCol(
          [
            subH("What Makes IBM Different", { before: 0, after: 3 }),
            ...[ ["Production-Grade Assets, Day 1",  "IBM AIOps, ICA, CareOps360, GenAI Quality Engine, and IBM Consulting Advantage are live — not promised. They are running in production at comparable payers today."],
                ["Deep Horizon Knowledge",           "IBM brings institutional knowledge of Horizon's application estate, processes, and change history — reducing transition risk to near-zero and accelerating Phase 0."],
                ["Healthcare Payer DNA",             "Claims, enrollment, prior authorisation, member services — IBM has modernised these domains for the nation's largest payers. The patterns are proven; the risk is lower."],
                ["Shared Risk, Shared Reward",       "IBM commits to outcome-based SLAs. Targets missed trigger IBM remediation plans — not contract renegotiations. This is accountability, not aspiration."],
                ["Innovation Without Extra Cost",    "Innovation sprints, AI tooling, and accelerators are embedded in the base model. Horizon does not pay for transformation separately from delivery."],
            ].flatMap(([t, d]) => [
              P([R(t, { sz: 10.5, bold: true, color: C.blue })], { before: 5, after: 2 }),
              P([R(d, { sz: 9.5, color: C.g70 })], { before: 0, after: 1 }),
            ]),
          ],
          [
            subH("IBM vs. The Alternative", { before: 0, after: 3 }),
            new Table({ width: { size: Math.round(W * 0.48), type: WidthType.DXA }, layout: TableLayoutType.FIXED, rows: [
              new TableRow({ children: [hc("Dimension", Math.round(W*0.16)), hc("Status Quo", Math.round(W*0.16)), hc("IBM", Math.round(W*0.16))] }),
              ...[ ["Model",        "Tower-based, reactive",   "Unified pods, AI-first"], ["Dev Velocity",  "Manual pipelines",        "AI-assisted, 25–40% faster"], ["Quality",       "End-of-sprint testing",   "Shift-left, GenAI coverage"], ["Operations",    "Firefighting",            "Self-healing, zero-touch"], ["Reporting",     "Activity metrics",        "Business outcome KPIs"], ["Risk model",    "Vendor bears none",       "Shared; outcome-SLA driven"] ]
                .map(([a, b, c]) => new TableRow({ children: [dc(a, Math.round(W*0.16), { bold: true, sz: 9 }), dc(b, Math.round(W*0.16), { color: C.red, sz: 9 }), vc(c, Math.round(W*0.16), { sz: 9 })] })),
            ]}),

            spc(6),
            subH("The Next Three Steps", { before: 4, after: 3 }),
            ...[ ["Week 1–2",  "Executive alignment session — Horizon leadership + IBM account team. Agree objectives, scope, and governance structure."],
                ["Week 2–4",  "Phase 0 SOW agreed. Telemetry onboarding begins. Baseline discovery kicks off. Innovation council constituted."],
                ["Week 4",    "Contractual milestone: Phase 0 live. IBM and Horizon operating as one team from Day 1."],
            ].flatMap(([t, d]) => [
              P([R(t + ":  ", { sz: 9.5, bold: true, color: C.blue }), R(d, { sz: 9.5 })], { before: 4, after: 1 }),
            ]),
          ]
        ),

        spc(6),
        blueHR(),
        spc(4),

        new Paragraph({
          children: [
            R("\u201CIBM\u2019s measure of success is not tickets closed or servers managed. It is ", { sz: 11, it: true }),
            R("outcomes delivered and sustained", { sz: 11, bold: true, it: true, color: C.navy }),
            R(" \u2014 faster development, higher quality, resilient operations, and measurable cost takeout for Horizon. That is the only number that matters.\u201D", { sz: 11, it: true }),
          ],
          spacing: { before: sp(4), after: sp(4) },
          indent: { left: inch(0.3), right: inch(0.3) },
        }),
        P([R("\u2014 IBM Consulting, Healthcare & Payer Delivery  |  April 2026", { sz: 9.5, bold: true, color: C.blue })],
          { align: AlignmentType.RIGHT, after: 10 }),

        thinHR(),
        P([R("\u00A9 2026 IBM Corporation. All rights reserved.  Confidential \u2014 prepared exclusively for Horizon Healthcare Services.  Ref: IBM-HZN-AMS-RFP-2026-CAS", { sz: 7.5, color: C.g50 })],
          { align: AlignmentType.CENTER, before: 3 }),
      ],
    },
  ],
});

const buf = await Packer.toBuffer(doc);
writeFileSync("attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx", buf);
console.log("Done \u2014 " + buf.length.toLocaleString() + " bytes");
