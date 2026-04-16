import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle, WidthType,
  ShadingType, TableLayoutType, Header, Footer, PageNumber,
  convertInchesToTwip, PageBreak
} from "docx";
import { writeFileSync } from "fs";

// ── Colors ────────────────────────────────────────────────────────────────────
const IBM_BLUE  = "0F62FE";
const IBM_NAVY  = "001141";
const IBM_NAVY2 = "001D6C";
const GRAY_60   = "6F6F6F";
const GRAY_100  = "161616";
const WHITE     = "FFFFFF";
const LIGHT_BLU = "EBF2FF";
const LIGHT_BG  = "F2F4F8";
const GREEN     = "198038";

const FONT = "Calibri";

// ── Unit helpers ──────────────────────────────────────────────────────────────
// docx `size` uses half-points: 11pt → 22
const hp  = (pt) => Math.round(pt * 2);
// docx spacing/margin uses twips: 1pt → 20 twips
const sp  = (pt) => Math.round(pt * 20);
// convenience: inches to twips
const inch = (i) => convertInchesToTwip(i);

// ── Run factory ───────────────────────────────────────────────────────────────
const R = (text, { size = 11, bold = false, italics = false, color = GRAY_100, allCaps = false } = {}) =>
  new TextRun({ text, font: FONT, size: hp(size), bold, italics, color, allCaps });

// ── Paragraph factories ───────────────────────────────────────────────────────
const P = (children, { before = 0, after = 0, left = 0, right = 0, align } = {}) =>
  new Paragraph({
    children: Array.isArray(children) ? children : [children],
    spacing: { before: sp(before), after: sp(after) },
    indent: left || right ? { left: sp(left), right: sp(right) } : undefined,
    alignment: align,
  });

const spacer = (pt = 4) =>
  new Paragraph({ children: [new TextRun("")], spacing: { before: 0, after: sp(pt) } });

const blueHR = () =>
  new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: IBM_BLUE, space: 4 } },
    spacing: { before: sp(6), after: sp(6) },
  });

const thinHR = () =>
  new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
    spacing: { before: sp(4), after: sp(4) },
  });

// Section heading: blue top rule + number + TITLE
const sHead = (num, title) => [
  new Paragraph({
    children: [],
    border: { top: { style: BorderStyle.SINGLE, size: 16, color: IBM_BLUE, space: 6 } },
    spacing: { before: sp(14), after: 0 },
  }),
  new Paragraph({
    children: [
      R(num + "  ", { size: 8.5, bold: true, color: IBM_BLUE }),
      R(title.toUpperCase(), { size: 13, bold: true, color: IBM_NAVY }),
    ],
    spacing: { before: sp(2), after: sp(3) },
  }),
];

const subHead = (text) =>
  new Paragraph({
    children: [R(text, { size: 11, bold: true, color: IBM_BLUE })],
    spacing: { before: sp(8), after: sp(2) },
  });

const body = (text) =>
  new Paragraph({
    children: [R(text, { size: 10.5 })],
    spacing: { before: sp(2), after: sp(3) },
  });

const bull = (text, prefix = "") =>
  new Paragraph({
    children: [
      prefix ? R(prefix + "  ", { size: 10.5, bold: true, color: IBM_NAVY }) : new TextRun(""),
      R(text, { size: 10.5 }),
    ],
    bullet: { level: 0 },
    spacing: { before: sp(1), after: sp(1) },
  });

// ── Table helpers ─────────────────────────────────────────────────────────────
const W = 9360; // content width in DXA (6.5 inches)

const cellBorders = (color = "DDDDDD", size = 2) => ({
  top:    { style: BorderStyle.SINGLE, size, color },
  bottom: { style: BorderStyle.SINGLE, size, color },
  left:   { style: BorderStyle.SINGLE, size, color },
  right:  { style: BorderStyle.SINGLE, size, color },
});

const hc = (text, w) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [R(text, { size: 9.5, bold: true, color: WHITE })],
        spacing: { before: sp(2.5), after: sp(2.5) },
      }),
    ],
    margins: { top: sp(2), bottom: sp(2), left: sp(5), right: sp(5) },
    shading: { type: ShadingType.SOLID, fill: IBM_NAVY },
    width: { size: w, type: WidthType.DXA },
    borders: cellBorders(IBM_BLUE, 4),
  });

const dc = (text, w, { bold = false, color = GRAY_100, shade } = {}) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [R(text, { size: 9.5, bold, color })],
        spacing: { before: sp(2.5), after: sp(2.5) },
      }),
    ],
    margins: { top: sp(2), bottom: sp(2), left: sp(5), right: sp(5) },
    shading: shade ? { type: ShadingType.SOLID, fill: shade } : undefined,
    width: { size: w, type: WidthType.DXA },
    borders: cellBorders(),
  });

const statC = (number, label, w) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [R(number, { size: 18, bold: true, color: IBM_BLUE })],
        alignment: AlignmentType.CENTER,
        spacing: { before: sp(6), after: sp(2) },
      }),
      new Paragraph({
        children: [R(label, { size: 8.5, bold: true, color: IBM_NAVY })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: sp(6) },
      }),
    ],
    shading: { type: ShadingType.SOLID, fill: LIGHT_BLU },
    margins: { top: sp(3), bottom: sp(3), left: sp(5), right: sp(5) },
    width: { size: w, type: WidthType.DXA },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 8, color: IBM_BLUE },
      bottom: { style: BorderStyle.NONE },
      left:   { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
      right:  { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
    },
  });

const noteC = (text, w, shade) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [R(text, { size: 8.5, color: GRAY_60, italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { before: sp(2), after: sp(2) },
      }),
    ],
    shading: { type: ShadingType.SOLID, fill: shade },
    margins: { top: sp(2), bottom: sp(2), left: sp(5), right: sp(5) },
    width: { size: w, type: WidthType.DXA },
    borders: {
      top:    { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
      left:   { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
      right:  { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
    },
  });

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════════

const doc = new Document({
  creator: "IBM Consulting",
  title: "IBM × Horizon BCBS — AMS Transformation Executive Summary",
  description: "Confidential — April 2026",

  sections: [

    // =========================================================================
    // COVER PAGE
    // =========================================================================
    {
      properties: {
        page: {
          margin: { top: inch(1.5), bottom: inch(1.0), left: inch(1.1), right: inch(1.1) },
        },
      },
      children: [

        // Confidential top-right
        P(R("CONFIDENTIAL  |  APRIL 2026", { size: 8, bold: true, color: IBM_BLUE, allCaps: true }),
          { align: AlignmentType.RIGHT, after: 6 }),

        // Blue top rule
        new Paragraph({
          children: [],
          border: { bottom: { style: BorderStyle.SINGLE, size: 28, color: IBM_BLUE } },
          spacing: { before: 0, after: sp(20) },
        }),

        // Eyebrow
        P(R("IBM × Horizon Blue Cross Blue Shield of New Jersey", { size: 13, bold: true, color: IBM_BLUE }),
          { after: 4 }),

        // Main title
        P(R("AMS Transformation", { size: 30, bold: true, color: IBM_NAVY }),
          { after: 2 }),

        // Subtitle
        P(R("Executive Summary", { size: 18, color: GRAY_60 }),
          { after: 16 }),

        blueHR(),

        // Quote
        new Paragraph({
          children: [
            R(
              "\u201CIBM is not proposing a technology project \u2014 IBM is proposing a transformation " +
              "partnership that embeds AI-driven intelligence into the operating model of Horizon, enabling " +
              "a future-ready enterprise that is faster, smarter, and more resilient than today.\u201D",
              { size: 10.5, italics: true, color: IBM_NAVY2 }
            ),
          ],
          spacing: { before: sp(4), after: sp(6) },
          indent: { left: inch(0.3), right: inch(0.3) },
        }),

        P(R("\u2014 IBM Consulting, Healthcare & Payer Delivery", { size: 9.5, bold: true, color: IBM_BLUE }),
          { align: AlignmentType.RIGHT, after: 16 }),

        blueHR(),
        spacer(6),

        // Meta table
        ...[
          ["Prepared for:", "Horizon Healthcare Services"],
          ["Submitted by:", "IBM Consulting — Healthcare & Payer Delivery"],
          ["Date:", "April 2026"],
          ["Reference:", "IBM-HZN-AMS-RFP-2026-CAS"],
        ].flatMap(([label, value]) => [
          P(R(label, { size: 9, bold: true, color: IBM_NAVY }), { after: 0 }),
          P(R(value, { size: 10.5, color: GRAY_100 }), { before: 1, after: 4 }),
        ]),

        spacer(20),

        // Platform line
        P([
          R("Powered by  ", { size: 8.5, color: GRAY_60 }),
          R("CareOps360  ·  IBM AIOps  ·  IBM Consulting Advantage  ·  ICA", { size: 8.5, bold: true, color: IBM_BLUE }),
        ], { after: 3 }),

        P(R(
          "\u00A9 2026 IBM Corporation. All rights reserved. This document is confidential and intended solely for Horizon Healthcare Services.",
          { size: 8, color: GRAY_60 }
        )),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),
      ],
    },

    // =========================================================================
    // MAIN CONTENT
    // =========================================================================
    {
      properties: {
        page: {
          margin: { top: inch(1.0), bottom: inch(0.9), left: inch(1.1), right: inch(1.1) },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                R("IBM \u00D7 Horizon BCBS \u2014 AMS Transformation Executive Summary", { size: 8, color: GRAY_60 }),
                R("   |   CONFIDENTIAL", { size: 8, bold: true, color: IBM_BLUE }),
              ],
              alignment: AlignmentType.RIGHT,
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: IBM_BLUE, space: 4 } },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                R("\u00A9 2026 IBM Corporation   Page ", { size: 8, color: GRAY_60 }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: hp(8), color: GRAY_60 }),
              ],
              alignment: AlignmentType.RIGHT,
              border: { top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 4 } },
            }),
          ],
        }),
      },
      children: [

        // ── 1.0 EXECUTIVE SUMMARY ─────────────────────────────────────────────
        ...sHead("1.0", "Executive Summary"),
        body("IBM proposes an AI-first operating model that shifts Horizon from reactive support to predictive, self-healing operations—delivering structural cost takeout, faster delivery, and measurable quality across all 500+ applications in scope."),

        spacer(2),
        subHead("1.1  The Moment"),
        body("Horizon operates approximately 500 applications spanning enrollment, claims adjudication, member services, provider operations, and data platforms. Rising operational load, fragmented tower delivery, and manual processes increase cost and slow modernization. An AI-first, product-oriented operating model is required to deliver structural cost takeout while improving member and provider experience."),

        spacer(2),
        subHead("1.2  What IBM Proposes"),
        bull("Transition from reactive support to predictive, self-healing operations using IBM AIOps and Intelligent Cloud Automation (ICA)."),
        bull("Integrate AMS, Quality Engineering, and Data Services into product-aligned pods with end-to-end ownership."),
        bull("Embed continuous innovation within steady-state delivery—through a governed value pipeline, not separate projects."),

        spacer(4),
        subHead("1.3  Executive Snapshot"),
        spacer(2),

        // 4-col KPI snapshot
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [statC("40–50%", "Structural Cost Takeout", W/4), statC("25–40%", "Speed to Value", W/4), statC("30%", "Incident Reduction", W/4), statC("30–50%", "MTTR Reduction", W/4)] }),
            new TableRow({ children: [noteC("operational cost reduction", W/4, LIGHT_BG), noteC("time-to-market acceleration", W/4, LIGHT_BG), noteC("improved availability", W/4, LIGHT_BG), noteC("target <1.8 hr resolution", W/4, LIGHT_BG)] }),
          ],
        }),
        P(R("All targets are directional. Baselines established in Phase 0 and tracked through executive dashboards.", { size: 8.5, italics: true, color: GRAY_60 }),
          { before: 3, after: 4 }),

        // ── 2.0 TRANSFORMATION OVERVIEW ──────────────────────────────────────
        ...sHead("2.0", "Transformation Overview"),
        body("Transformation is embedded into steady-state delivery through an outcome-based governance model—compounding value across operations, engineering, and data. Product-aligned pods own outcomes end-to-end; automation removes repetitive work; and executive visibility ensures progress is measured transparently."),

        spacer(2),
        subHead("2.1  Six Core Tenets"),
        spacer(2),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hc("Tenet", W*0.32), hc("Description", W*0.68)] }),
            new TableRow({ children: [dc("AI-First Operating Model",     W*0.32, { bold:true, shade:LIGHT_BG }), dc("Embed AI in triage, diagnosis, resolution, test generation, and analytics to shift from reactive to predictive.", W*0.68, { shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("Integrated Delivery",          W*0.32, { bold:true }), dc("Unified build + run pods across AMS, QE, and Data to reduce handoffs and accelerate change safely.", W*0.68)] }),
            new TableRow({ children: [dc("Automation & Self-Healing",    W*0.32, { bold:true, shade:LIGHT_BG }), dc("Noise reduction, auto-triage, auto-remediation, and runbook automation to eliminate recurring demand.", W*0.68, { shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("Outcome-Driven Transformation",W*0.32, { bold:true }), dc("Apply ticket economics to remove demand; track business impact rather than activity metrics.", W*0.68)] }),
            new TableRow({ children: [dc("Continuous Innovation",        W*0.32, { bold:true, shade:LIGHT_BG }), dc("Modernization sprints and a governed value pipeline to deliver incremental improvements continuously.", W*0.68, { shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("Zero-Disruption Transition",   W*0.32, { bold:true }), dc("Risk-controlled onboarding leveraging existing Horizon knowledge to maintain operational continuity.", W*0.68)] }),
          ],
        }),

        spacer(4),
        subHead("2.2  Current State vs. 12-Month Targets"),
        spacer(2),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hc("Metric", W*0.36), hc("Current", W*0.2), hc("12-Month Target", W*0.27), hc("Trend", W*0.17)] }),
            new TableRow({ children: [dc("Test Automation Coverage",    W*0.36, { bold:true, shade:LIGHT_BG }), dc("~25%",             W*0.2, { shade:LIGHT_BG }),  dc("80%+",          W*0.27, { bold:true, color:IBM_BLUE, shade:LIGHT_BG }), dc("↑ 3×",    W*0.17, { bold:true, color:GREEN, shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("Mean Time to Resolve (MTTR)", W*0.36, { bold:true }),              dc(">4 hours",          W*0.2),                         dc("<1.8 hours",    W*0.27, { bold:true, color:IBM_BLUE }),                dc("↓ ~55%",  W*0.17, { bold:true, color:GREEN })] }),
            new TableRow({ children: [dc("Defect Escape to Production", W*0.36, { bold:true, shade:LIGHT_BG }), dc("High / untracked",W*0.2, { shade:LIGHT_BG }),  dc("65% reduction", W*0.27, { bold:true, color:IBM_BLUE, shade:LIGHT_BG }), dc("↓",       W*0.17, { bold:true, color:GREEN, shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("P3/P4 Auto-Resolution",       W*0.36, { bold:true }),              dc("<10%",             W*0.2),                         dc(">74%",          W*0.27, { bold:true, color:IBM_BLUE }),                dc("↑ ~7×",   W*0.17, { bold:true, color:GREEN })] }),
            new TableRow({ children: [dc("Alert Noise per Shift",       W*0.36, { bold:true, shade:LIGHT_BG }), dc("Unfiltered",    W*0.2, { shade:LIGHT_BG }),   dc(">60% reduced",  W*0.27, { bold:true, color:IBM_BLUE, shade:LIGHT_BG }), dc("↓",       W*0.17, { bold:true, color:GREEN, shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("System Availability",         W*0.36, { bold:true }),              dc("~99.7%",           W*0.2),                         dc("99.9%+",        W*0.27, { bold:true, color:IBM_BLUE }),                dc("↑",       W*0.17, { bold:true, color:GREEN })] }),
          ],
        }),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 3.0 AIOPS ─────────────────────────────────────────────────────────
        ...sHead("3.0", "AIOps & Agentic AI Operations"),
        body("IBM's AIOps platform uses correlated telemetry (logs, metrics, traces, events) and operational history (tickets, changes, knowledge) to reduce alert noise, speed triage, and automate common resolutions. Learnings from production continuously feed automation runbooks and quality gates to prevent recurrence."),

        spacer(2),
        subHead("3.1  Purpose-Built AI Agents"),
        spacer(2),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hc("Agent Type", W*0.32), hc("Function", W*0.42), hc("Value Impact (directional)", W*0.26)] }),
            new TableRow({ children: [dc("Monitoring & Detection",      W*0.32, { bold:true, shade:LIGHT_BG }), dc("Correlation, grouping, anomaly detection",          W*0.42, { shade:LIGHT_BG }), dc("$2.5M – $3.5M", W*0.26, { bold:true, color:IBM_BLUE, shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("Triage Agent",                W*0.32, { bold:true }),              dc("Impact-aware routing and prioritization",              W*0.42),                    dc("$1.3M – $1.5M", W*0.26, { bold:true, color:IBM_BLUE })] }),
            new TableRow({ children: [dc("Root Cause & Resolution",     W*0.32, { bold:true, shade:LIGHT_BG }), dc("Diagnosis, runbook guidance, auto-remediation",     W*0.42, { shade:LIGHT_BG }), dc("$2.0M – $3.0M", W*0.26, { bold:true, color:IBM_BLUE, shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("Knowledge & Feedback",        W*0.32, { bold:true }),              dc("Knowledge extraction, continuous learning",            W*0.42),                    dc("$1.0M – $1.3M", W*0.26, { bold:true, color:IBM_BLUE })] }),
            new TableRow({ children: [dc("Impact Assessment & Testing", W*0.32, { bold:true, shade:LIGHT_BG }), dc("QE automation and validation",                     W*0.42, { shade:LIGHT_BG }), dc("$1.2M – $2.0M", W*0.26, { bold:true, color:IBM_BLUE, shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("Deployment Agents",           W*0.32, { bold:true }),              dc("Release automation and risk scoring",                  W*0.42),                    dc("$0.8M – $1.2M", W*0.26, { bold:true, color:IBM_BLUE })] }),
          ],
        }),

        spacer(4),
        subHead("3.2  Expected Operational Impact"),
        bull(">60% alert noise reduction through correlation and de-duplication, improving engineer focus on real issues."),
        bull("<1.8 hours MTTR target through intelligent routing, guided diagnostics, and auto-remediation workflows."),
        bull(">74% auto-resolution for P3/P4 incidents via self-heal runbooks and workflow automation."),
        bull("Closed-loop learning across Incident \u2192 Problem \u2192 Change to prevent recurrence and reduce demand over time."),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 4.0 PLATFORM & DATA ───────────────────────────────────────────────
        ...sHead("4.0", "Platform & Data Modernization"),
        body("This workstream modernizes how Horizon integrates, upgrades, and governs platforms—reducing technical debt, improving security posture, and enabling faster change with lower risk. Delivered as a value chain: standardize integration patterns, instrument for observability, automate operations, and report outcomes through governance."),

        bull("Integration modernization: Evolve from point-to-point and batch-heavy patterns to API-first and event-driven integration."),
        bull("Mainframe modernization (phased): API-wrap \u2192 rehost \u2192 refactor approach with parallel-run validation and risk gates."),
        bull("Technical debt governance (n-1 standard): Maintain stacks at n-1 versions with monthly compliance reporting and emergency patching for critical CVEs."),

        spacer(4),
        subHead("4.1  Workstream Timeline"),
        spacer(2),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hc("Workstream", W*0.30), hc("Approach", W*0.44), hc("Timeline", W*0.26)] }),
            new TableRow({ children: [dc("Integration Hub",                  W*0.30, { bold:true, shade:LIGHT_BG }), dc("API-first hub; event streaming architecture",                           W*0.44, { shade:LIGHT_BG }), dc("Year 1",       W*0.26, { bold:true, color:IBM_BLUE, shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("Mainframe Workloads",              W*0.30, { bold:true }),              dc("API-wrap \u2192 rehost \u2192 refactor with parallel-run validation", W*0.44),                    dc("Year 1–2",    W*0.26, { bold:true, color:IBM_BLUE })] }),
            new TableRow({ children: [dc("Application Portfolio (~500 apps)",W*0.30, { bold:true, shade:LIGHT_BG }), dc("Assess, rationalize and modernize through ongoing delivery sprints",  W*0.44, { shade:LIGHT_BG }), dc("Ongoing",      W*0.26, { bold:true, color:IBM_BLUE, shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("DataOps",                          W*0.30, { bold:true }),              dc("Pipeline intelligence and quality engine",                               W*0.44),                    dc("Months 3–12", W*0.26, { bold:true, color:IBM_BLUE })] }),
          ],
        }),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 5.0 QUALITY ENGINEERING ───────────────────────────────────────────
        ...sHead("5.0", "Quality Engineering"),
        body("Quality is treated as an always-on control system. GenAI-assisted test generation and maintenance increases automation coverage; shift-left quality gates catch defects earlier; and release readiness is measured continuously to reduce production escapes and incident volumes. Production insights feed back into the test suite so coverage improves with every release."),

        spacer(4),
        subHead("5.1  Quality Progression Targets"),
        spacer(2),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hc("Quality Metric", W*0.32), hc("Current", W*0.17), hc("6-Month Target", W*0.25), hc("12-Month Target", W*0.26)] }),
            new TableRow({ children: [dc("Automation Coverage",          W*0.32, { bold:true, shade:LIGHT_BG }), dc("~25%",       W*0.17, { shade:LIGHT_BG }), dc("55%",          W*0.25, { bold:true, shade:LIGHT_BG }), dc("80%+",           W*0.26, { bold:true, color:IBM_BLUE, shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("Defect Escape to Production",  W*0.32, { bold:true }),              dc("High",        W*0.17),                     dc("40% reduction",W*0.25, { bold:true }),              dc("65% reduction",  W*0.26, { bold:true, color:IBM_BLUE })] }),
            new TableRow({ children: [dc("Regression Cycle Time",        W*0.32, { bold:true, shade:LIGHT_BG }), dc("Multi-day", W*0.17, { shade:LIGHT_BG }), dc("50% faster",   W*0.25, { bold:true, shade:LIGHT_BG }), dc("70% faster",     W*0.26, { bold:true, color:IBM_BLUE, shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("Mean Time to Detect (MTTD)",   W*0.32, { bold:true }),              dc(">2 hours",    W*0.17),                     dc("<30 minutes",  W*0.25, { bold:true }),              dc("<15 minutes",    W*0.26, { bold:true, color:IBM_BLUE })] }),
          ],
        }),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 6.0 PHASED ROADMAP ────────────────────────────────────────────────
        ...sHead("6.0", "Phased Roadmap & Governance"),
        body("The transformation follows a structured, risk-controlled journey from stabilization to autonomous operations. Each phase builds on the last—compounding value with every release while protecting operational continuity throughout."),

        spacer(2),
        subHead("6.1  Phased Delivery Roadmap"),
        spacer(2),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hc("Phase", W*0.22), hc("Timeframe", W*0.17), hc("Key Deliverables", W*0.61)] }),
            new TableRow({ children: [dc("Phase 0 — Foundation", W*0.22, { bold:true, shade:LIGHT_BG }), dc("0–8 weeks",    W*0.17, { shade:LIGHT_BG }), dc("Baselines and discovery; transition plan; telemetry onboarding; AI enablement",                                                          W*0.61, { shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("Phase 1 — Ignite",    W*0.22, { bold:true }),              dc("1–3 months",  W*0.17),                    dc("Initial AIOps deployment; QE automation framework; innovation council; quick-win automations",                                         W*0.61)] }),
            new TableRow({ children: [dc("Phase 2 — Scale",     W*0.22, { bold:true, shade:LIGHT_BG }), dc("3–6 months",  W*0.17, { shade:LIGHT_BG }), dc("Expand self-heal; agentic triage live; integration modernization pilots; DataOps monitoring expanded",                            W*0.61, { shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("Phase 3 — Optimize",  W*0.22, { bold:true }),              dc("6–12 months", W*0.17),                    dc("Autonomous ops for common incidents; advanced QE gates; continuous modernization sprints; outcome reporting",                          W*0.61)] }),
            new TableRow({ children: [dc("Phase 4 — Transform", W*0.22, { bold:true, shade:LIGHT_BG }), dc("12–24 months",W*0.17, { shade:LIGHT_BG }), dc("Broader autonomy; platform modernization milestones; enterprise observability; co-invest opportunities",                          W*0.61, { shade:LIGHT_BG })] }),
          ],
        }),

        spacer(6),
        subHead("6.2  KPI Framework"),
        spacer(2),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hc("Value Area", W*0.28), hc("Primary KPIs", W*0.4), hc("Measurement Source", W*0.32)] }),
            new TableRow({ children: [dc("Operational Excellence",   W*0.28, { bold:true, shade:LIGHT_BG }), dc("MTTR, incident volume, system availability",                          W*0.4, { shade:LIGHT_BG }), dc("ITSM + monitoring + AIOps telemetry", W*0.32, { shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("Automation & Self-Heal",   W*0.28, { bold:true }),              dc("Auto-resolution %, self-heal count, noise reduction",                  W*0.4),                    dc("ICA / AIOps telemetry",                W*0.32)] }),
            new TableRow({ children: [dc("Quality Engineering",      W*0.28, { bold:true, shade:LIGHT_BG }), dc("Automation coverage, defect leakage, regression time",               W*0.4, { shade:LIGHT_BG }), dc("QE toolchain + CI/CD",                W*0.32, { shade:LIGHT_BG })] }),
            new TableRow({ children: [dc("Modernization",            W*0.28, { bold:true }),              dc("Upgrade velocity, n-1 compliance %, tech debt burndown",               W*0.4),                    dc("Roadmap + CMDB + security scans",      W*0.32)] }),
            new TableRow({ children: [dc("Business Outcomes",        W*0.28, { bold:true, shade:LIGHT_BG }), dc("Claims cycle time, enrollment time-to-good, ASA/FCR",                W*0.4, { shade:LIGHT_BG }), dc("Ops domain dashboards",               W*0.32, { shade:LIGHT_BG })] }),
          ],
        }),

        body("Reporting is transparent: operational dashboards reviewed monthly; executive outcomes reviewed quarterly. A continuous improvement loop ensures production insights feed both QE and automation backlogs."),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 7.0 WHY IBM ───────────────────────────────────────────────────────
        ...sHead("7.0", "Why IBM"),
        body("IBM brings deep institutional knowledge, healthcare payer expertise, and proven delivery at scale. Our platform assets are production-grade — not proofs-of-concept — and our governance model aligns teams to measurable business outcomes."),

        spacer(2),
        subHead("7.1  IBM Differentiators"),
        bull("Deep Horizon institutional knowledge and proven delivery execution across the full application estate."),
        bull("Production-grade assets — AIOps, ICA, CareOps360, IBM Consulting Advantage — aligned to enterprise governance from Day 1."),
        bull("Healthcare payer domain expertise with compliance-first delivery covering claims, enrollment, and member services."),
        bull("Outcome-based accountability with committed SLAs tied to measurable business outcomes and transparent monthly reporting."),
        bull("Global delivery network with 24\u00D77 coverage, local leadership engagement, and dedicated Horizon squads."),

        spacer(6),
        subHead("7.2  IBM at Scale — Behind This Proposal"),
        spacer(2),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({
              children: [
                statC("20,000+", "AI & Data Practitioners",             W/4),
                statC("81,000+", "Cloud & Architecture Experts",          W/4),
                statC("40,000+", "AI/Analytics Engagements Delivered",    W/4),
                statC("15,000+", "Delivery Resources across 40 Centres",  W/4),
              ],
            }),
          ],
        }),

        spacer(10),
        blueHR(),
        spacer(4),

        // Closing statement
        new Paragraph({
          children: [
            R("\u201CIBM\u2019s commitment to Horizon is not measured in tickets resolved or servers managed \u2014 it is measured in ", { size: 10.5, italics: true }),
            R("business outcomes delivered", { size: 10.5, bold: true, italics: true, color: IBM_NAVY }),
            R(". Every initiative in this proposal is connected to a measurable result \u2014 and every result is owned.\u201D", { size: 10.5, italics: true }),
          ],
          spacing: { before: sp(4), after: sp(4) },
          indent: { left: inch(0.3), right: inch(0.3) },
        }),
        P(R("\u2014 IBM Consulting, Healthcare & Payer Delivery", { size: 9.5, bold: true, color: IBM_BLUE }),
          { align: AlignmentType.RIGHT, after: 12 }),

        thinHR(),
        P(R(
          "\u00A9 2026 IBM Corporation. All rights reserved. Confidential \u2014 prepared exclusively for Horizon Healthcare Services.  Ref: IBM-HZN-AMS-RFP-2026-CAS",
          { size: 8, color: GRAY_60 }
        ), { align: AlignmentType.CENTER, before: 3 }),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx", buffer);
console.log("Done \u2014 " + buffer.length + " bytes");
