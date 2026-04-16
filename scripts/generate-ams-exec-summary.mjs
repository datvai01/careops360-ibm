import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle, WidthType,
  ShadingType, TableLayoutType, Header, Footer, PageNumber,
  convertInchesToTwip, PageBreak
} from "docx";
import { writeFileSync } from "fs";

// Colors
const IBM_BLUE   = "0F62FE";
const IBM_NAVY   = "001141";
const IBM_NAVY2  = "001D6C";
const GRAY_70    = "525252";
const GRAY_100   = "161616";
const WHITE      = "FFFFFF";
const LIGHT_BLUE = "EBF2FF";
const LIGHT_BG   = "F2F4F8";
const GREEN      = "1A7E3B";

// Font - use Calibri for maximum compatibility
const FONT = "Calibri";

// ── Utility functions ─────────────────────────────────────────────────────────

const twip = (pts) => pts * 20;

const makeRun = (text, opts = {}) =>
  new TextRun({ text, font: FONT, size: twip(opts.size || 10.5), ...opts });

const spacer = () =>
  new Paragraph({ children: [makeRun("")], spacing: { before: 0, after: 0 } });

const blueHR = () =>
  new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: IBM_BLUE, space: 4 } },
    spacing: { before: 80, after: 80 },
  });

const thinHR = () =>
  new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "D0D0D0", space: 4 } },
    spacing: { before: 60, after: 60 },
  });

const sectionHead = (num, title) => [
  new Paragraph({
    children: [],
    border: { top: { style: BorderStyle.SINGLE, size: 16, color: IBM_BLUE, space: 8 } },
    spacing: { before: twip(14), after: 0 },
  }),
  new Paragraph({
    children: [
      makeRun(num + "  ", { bold: true, color: IBM_BLUE, size: 9 }),
      makeRun(title.toUpperCase(), { bold: true, color: IBM_NAVY, size: 14 }),
    ],
    spacing: { before: 60, after: twip(4) },
  }),
];

const subHead = (text) =>
  new Paragraph({
    children: [makeRun(text, { bold: true, color: IBM_BLUE, size: 11 })],
    spacing: { before: twip(8), after: twip(3) },
  });

const bodyPara = (text) =>
  new Paragraph({
    children: [makeRun(text, { color: GRAY_100 })],
    spacing: { before: 60, after: 60 },
  });

const bulletPara = (label, text) =>
  new Paragraph({
    children: [
      makeRun(label ? label + "  " : "", { bold: true, color: IBM_NAVY }),
      makeRun(text, { color: GRAY_100 }),
    ],
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
  });

// Table helpers
const W = 9360; // content width in DXA (6.5in)

const hCell = (text, w) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [makeRun(text, { bold: true, color: WHITE, size: 9.5 })],
        spacing: { before: 60, after: 60 },
      }),
    ],
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    shading: { type: ShadingType.SOLID, fill: IBM_NAVY },
    width: w ? { size: w, type: WidthType.DXA } : undefined,
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 4, color: IBM_BLUE },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: IBM_BLUE },
      left:   { style: BorderStyle.SINGLE, size: 4, color: IBM_BLUE },
      right:  { style: BorderStyle.SINGLE, size: 4, color: IBM_BLUE },
    },
  });

const dCell = (text, w, opts = {}) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [makeRun(text, { bold: opts.bold, color: opts.color || GRAY_100, size: 9.5 })],
        spacing: { before: 60, after: 60 },
      }),
    ],
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    shading: opts.shade ? { type: ShadingType.SOLID, fill: opts.shade } : undefined,
    width: w ? { size: w, type: WidthType.DXA } : undefined,
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
      left:   { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
      right:  { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" },
    },
  });

const statCell = (number, label, w) =>
  new TableCell({
    children: [
      new Paragraph({ children: [makeRun(number, { bold: true, color: IBM_BLUE, size: 20 })], alignment: AlignmentType.CENTER, spacing: { before: 100, after: 40 } }),
      new Paragraph({ children: [makeRun(label, { bold: true, color: IBM_NAVY, size: 9 })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 100 } }),
    ],
    shading: { type: ShadingType.SOLID, fill: LIGHT_BLUE },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    width: { size: w, type: WidthType.DXA },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 10, color: IBM_BLUE },
      bottom: { style: BorderStyle.NONE },
      left:   { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
      right:  { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" },
    },
  });

// ── Build document ────────────────────────────────────────────────────────────

const doc = new Document({
  creator: "IBM Consulting",
  title: "IBM × Horizon BCBS — AMS Transformation Executive Summary",
  description: "Confidential — April 2026",
  sections: [

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 1 — COVER PAGE
    // ═══════════════════════════════════════════════════════════════════════
    {
      properties: {
        page: {
          margin: {
            top:    convertInchesToTwip(1.5),
            bottom: convertInchesToTwip(1.0),
            left:   convertInchesToTwip(1.1),
            right:  convertInchesToTwip(1.1),
          },
        },
      },
      children: [
        // Confidential line
        new Paragraph({
          children: [makeRun("CONFIDENTIAL  |  APRIL 2026", { bold: true, color: IBM_BLUE, size: 8, allCaps: true })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 0, after: twip(8) },
        }),

        // Blue top rule
        new Paragraph({
          children: [],
          border: { bottom: { style: BorderStyle.SINGLE, size: 28, color: IBM_BLUE } },
          spacing: { before: 0, after: twip(32) },
        }),

        // Eyebrow
        new Paragraph({
          children: [makeRun("IBM × Horizon Blue Cross Blue Shield of New Jersey", { bold: true, color: IBM_BLUE, size: 14 })],
          spacing: { before: 0, after: twip(8) },
        }),

        // Title
        new Paragraph({
          children: [makeRun("AMS Transformation", { bold: true, color: IBM_NAVY, size: 36 })],
          spacing: { before: 0, after: twip(4) },
        }),

        // Subtitle
        new Paragraph({
          children: [makeRun("Executive Summary", { color: GRAY_70, size: 20 })],
          spacing: { before: 0, after: twip(28) },
        }),

        blueHR(),

        // Quote
        new Paragraph({
          children: [makeRun(
            "\u201CIBM is not proposing a technology project \u2014 IBM is proposing a transformation " +
            "partnership that embeds AI-driven intelligence into the operating model of Horizon, enabling " +
            "a future-ready enterprise that is faster, smarter, and more resilient than today.\u201D",
            { italics: true, color: IBM_NAVY2, size: 11 }
          )],
          spacing: { before: twip(4), after: twip(10) },
          indent: { left: convertInchesToTwip(0.3), right: convertInchesToTwip(0.3) },
        }),
        new Paragraph({
          children: [makeRun("— IBM Consulting, Healthcare & Payer Delivery", { bold: true, color: IBM_BLUE, size: 9.5 })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 0, after: twip(28) },
        }),

        blueHR(),

        // Document meta
        spacer(),
        ...[
          ["Prepared for:", "Horizon Healthcare Services"],
          ["Submitted by:", "IBM Consulting — Healthcare & Payer Delivery"],
          ["Date:", "April 2026"],
          ["Reference:", "IBM-HZN-AMS-RFP-2026-CAS"],
        ].flatMap(([label, value]) => [
          new Paragraph({
            children: [makeRun(label, { bold: true, color: IBM_NAVY, size: 9.5 })],
            spacing: { before: twip(4), after: 0 },
          }),
          new Paragraph({
            children: [makeRun(value, { color: GRAY_100 })],
            spacing: { before: 0, after: twip(4) },
          }),
        ]),

        spacer(), spacer(), spacer(),

        // Footer note
        new Paragraph({
          children: [makeRun("Powered by CareOps360  ·  IBM AIOps  ·  IBM Consulting Advantage  ·  ICA", { bold: true, color: IBM_BLUE, size: 9 })],
          spacing: { before: twip(6), after: twip(4) },
        }),
        new Paragraph({
          children: [makeRun(
            "\u00A9 2026 IBM Corporation. All rights reserved. This document is confidential and intended solely for Horizon Healthcare Services.",
            { color: GRAY_70, size: 8 }
          )],
          spacing: { before: 0, after: 0 },
        }),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),
      ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 2 — MAIN CONTENT
    // ═══════════════════════════════════════════════════════════════════════
    {
      properties: {
        page: {
          margin: {
            top:    convertInchesToTwip(1.0),
            bottom: convertInchesToTwip(0.9),
            left:   convertInchesToTwip(1.1),
            right:  convertInchesToTwip(1.1),
          },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                makeRun("IBM \u00D7 Horizon BCBS \u2014 AMS Transformation Executive Summary", { color: GRAY_70, size: 8 }),
                makeRun("  |  CONFIDENTIAL", { bold: true, color: IBM_BLUE, size: 8 }),
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
                makeRun("\u00A9 2026 IBM Corporation   Page ", { color: GRAY_70, size: 8 }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: twip(8), color: GRAY_70 }),
              ],
              alignment: AlignmentType.RIGHT,
              border: { top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 4 } },
            }),
          ],
        }),
      },
      children: [

        // ── 1.0 Executive Summary ──────────────────────────────────────────
        ...sectionHead("1.0", "Executive Summary"),
        bodyPara("IBM proposes an AI-first operating model that shifts Horizon from reactive support to predictive, self-healing operations—delivering structural cost takeout, faster delivery, and measurable quality across all 500+ applications in scope."),

        spacer(),
        subHead("1.1  The Moment"),
        bodyPara("Horizon operates approximately 500 applications spanning enrollment, claims adjudication, member services, provider operations, and data platforms. Rising operational load, fragmented tower delivery, and manual processes increase cost and slow modernization. An AI-first, product-oriented operating model is required to deliver structural cost takeout while improving member and provider experience."),

        spacer(),
        subHead("1.2  What IBM Proposes"),
        bulletPara("", "Transition from reactive support to predictive, self-healing operations using IBM AIOps and Intelligent Cloud Automation (ICA)."),
        bulletPara("", "Integrate AMS, Quality Engineering, and Data Services into product-aligned pods with end-to-end ownership."),
        bulletPara("", "Embed continuous innovation and modernization within steady-state delivery—through a governed value pipeline, not separate projects."),

        spacer(),
        subHead("1.3  Executive Snapshot"),
        spacer(),

        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({
              children: [
                statCell("40–50%", "Structural Cost Takeout", W / 4),
                statCell("25–40%", "Speed to Value", W / 4),
                statCell("30%",    "Incident Reduction", W / 4),
                statCell("30–50%", "MTTR Reduction", W / 4),
              ],
            }),
            new TableRow({
              children: [
                dCell("operational cost reduction", W / 4, { shade: LIGHT_BG }),
                dCell("time-to-market acceleration", W / 4, { shade: LIGHT_BG }),
                dCell("improved availability", W / 4, { shade: LIGHT_BG }),
                dCell("target <1.8 hr resolution", W / 4, { shade: LIGHT_BG }),
              ],
            }),
          ],
        }),
        new Paragraph({
          children: [makeRun("All targets are directional. Baselines established in Phase 0 and tracked through executive dashboards.", { italics: true, color: GRAY_70, size: 8.5 })],
          spacing: { before: 60, after: 80 },
        }),

        // ── 2.0 Transformation Overview ───────────────────────────────────
        ...sectionHead("2.0", "Transformation Overview"),
        bodyPara("Transformation is embedded into steady-state delivery through an outcome-based governance model—compounding value across operations, engineering, and data. Product-aligned pods own outcomes end-to-end; automation removes repetitive work; and executive visibility ensures progress is measured transparently."),

        spacer(),
        subHead("2.1  Six Core Tenets"),
        spacer(),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hCell("Tenet", W * 0.32), hCell("Description", W * 0.68)] }),
            new TableRow({ children: [dCell("AI-First Operating Model", W * 0.32, { bold: true, shade: LIGHT_BG }), dCell("Embed AI in triage, diagnosis, resolution, test generation, and analytics to shift from reactive to predictive operations.", W * 0.68, { shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("Integrated Delivery", W * 0.32, { bold: true }), dCell("Unified build + run pods across AMS, QE, and Data to reduce handoffs and accelerate change safely.", W * 0.68)] }),
            new TableRow({ children: [dCell("Automation & Self-Healing", W * 0.32, { bold: true, shade: LIGHT_BG }), dCell("Noise reduction, auto-triage, auto-remediation, and runbook automation to eliminate recurring demand.", W * 0.68, { shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("Outcome-Driven Transformation", W * 0.32, { bold: true }), dCell("Apply ticket economics to remove demand; track business impact rather than activity metrics.", W * 0.68)] }),
            new TableRow({ children: [dCell("Continuous Innovation", W * 0.32, { bold: true, shade: LIGHT_BG }), dCell("Modernization sprints and a governed value pipeline to deliver incremental improvements continuously.", W * 0.68, { shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("Zero-Disruption Transition", W * 0.32, { bold: true }), dCell("Risk-controlled onboarding leveraging existing Horizon knowledge to maintain operational continuity.", W * 0.68)] }),
          ],
        }),

        spacer(),
        subHead("2.2  Current State vs. 12-Month Targets"),
        spacer(),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hCell("Metric", W * 0.36), hCell("Current", W * 0.2), hCell("12-Month Target", W * 0.27), hCell("Trend", W * 0.17)] }),
            new TableRow({ children: [dCell("Test Automation Coverage", W * 0.36, { bold: true, shade: LIGHT_BG }), dCell("~25%", W * 0.2, { shade: LIGHT_BG }), dCell("80%+", W * 0.27, { bold: true, color: IBM_BLUE, shade: LIGHT_BG }), dCell("↑ 3×", W * 0.17, { bold: true, color: GREEN, shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("Mean Time to Resolve (MTTR)", W * 0.36, { bold: true }), dCell(">4 hours", W * 0.2), dCell("<1.8 hours", W * 0.27, { bold: true, color: IBM_BLUE }), dCell("↓ ~55%", W * 0.17, { bold: true, color: GREEN })] }),
            new TableRow({ children: [dCell("Defect Escape to Production", W * 0.36, { bold: true, shade: LIGHT_BG }), dCell("High / untracked", W * 0.2, { shade: LIGHT_BG }), dCell("65% reduction", W * 0.27, { bold: true, color: IBM_BLUE, shade: LIGHT_BG }), dCell("↓", W * 0.17, { bold: true, color: GREEN, shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("P3/P4 Auto-Resolution", W * 0.36, { bold: true }), dCell("<10%", W * 0.2), dCell(">74%", W * 0.27, { bold: true, color: IBM_BLUE }), dCell("↑ ~7×", W * 0.17, { bold: true, color: GREEN })] }),
            new TableRow({ children: [dCell("Alert Noise per Shift", W * 0.36, { bold: true, shade: LIGHT_BG }), dCell("Unfiltered", W * 0.2, { shade: LIGHT_BG }), dCell(">60% reduced", W * 0.27, { bold: true, color: IBM_BLUE, shade: LIGHT_BG }), dCell("↓", W * 0.17, { bold: true, color: GREEN, shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("System Availability", W * 0.36, { bold: true }), dCell("~99.7%", W * 0.2), dCell("99.9%+", W * 0.27, { bold: true, color: IBM_BLUE }), dCell("↑", W * 0.17, { bold: true, color: GREEN })] }),
          ],
        }),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 3.0 AIOps ─────────────────────────────────────────────────────
        ...sectionHead("3.0", "AIOps & Agentic AI Operations"),
        bodyPara("IBM's AIOps platform uses correlated telemetry (logs, metrics, traces, events) and operational history (tickets, changes, knowledge) to reduce alert noise, speed triage, and automate common resolutions. Learnings from production continuously feed automation runbooks and quality gates to prevent recurrence."),

        spacer(),
        subHead("3.1  Purpose-Built AI Agents"),
        spacer(),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hCell("Agent Type", W * 0.32), hCell("Function", W * 0.42), hCell("Value Impact (dir.)", W * 0.26)] }),
            new TableRow({ children: [dCell("Monitoring & Detection", W * 0.32, { bold: true, shade: LIGHT_BG }), dCell("Correlation, grouping, anomaly detection", W * 0.42, { shade: LIGHT_BG }), dCell("$2.5M–$3.5M", W * 0.26, { bold: true, color: IBM_BLUE, shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("Triage Agent", W * 0.32, { bold: true }), dCell("Impact-aware routing and prioritization", W * 0.42), dCell("$1.3M–$1.5M", W * 0.26, { bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [dCell("Root Cause & Resolution", W * 0.32, { bold: true, shade: LIGHT_BG }), dCell("Diagnosis, runbook guidance, auto-remediation", W * 0.42, { shade: LIGHT_BG }), dCell("$2.0M–$3.0M", W * 0.26, { bold: true, color: IBM_BLUE, shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("Knowledge & Feedback", W * 0.32, { bold: true }), dCell("Knowledge extraction, continuous learning", W * 0.42), dCell("$1.0M–$1.3M", W * 0.26, { bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [dCell("Impact Assessment & Testing", W * 0.32, { bold: true, shade: LIGHT_BG }), dCell("QE automation and validation", W * 0.42, { shade: LIGHT_BG }), dCell("$1.2M–$2.0M", W * 0.26, { bold: true, color: IBM_BLUE, shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("Deployment Agents", W * 0.32, { bold: true }), dCell("Release automation and risk scoring", W * 0.42), dCell("$0.8M–$1.2M", W * 0.26, { bold: true, color: IBM_BLUE })] }),
          ],
        }),

        spacer(),
        subHead("3.2  Expected Operational Impact"),
        bulletPara("", ">60% alert noise reduction through correlation and de-duplication, improving engineer focus on real issues."),
        bulletPara("", "<1.8 hours MTTR target through intelligent routing, guided diagnostics, and auto-remediation workflows."),
        bulletPara("", ">74% auto-resolution for P3/P4 incidents via self-heal runbooks and workflow automation."),
        bulletPara("", "Closed-loop learning across Incident → Problem → Change to prevent recurrence and reduce demand over time."),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 4.0 Platform & Data ────────────────────────────────────────────
        ...sectionHead("4.0", "Platform & Data Modernization"),
        bodyPara("This workstream modernizes how Horizon integrates, upgrades, and governs platforms—reducing technical debt, improving security posture, and enabling faster change with lower risk. Delivered as a value chain: standardize integration patterns, instrument for observability, automate operations, and report outcomes through governance."),

        bulletPara("", "Integration modernization: Evolve from point-to-point and batch-heavy patterns to API-first and event-driven integration."),
        bulletPara("", "Mainframe modernization (phased): API-wrap → rehost → refactor approach with parallel-run validation and risk gates."),
        bulletPara("", "Technical debt governance (n-1 standard): Maintain stacks at n-1 versions with monthly compliance reporting and emergency patching for critical CVEs."),

        spacer(),
        subHead("4.1  Workstream Timeline"),
        spacer(),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hCell("Workstream", W * 0.3), hCell("Approach", W * 0.44), hCell("Timeline", W * 0.26)] }),
            new TableRow({ children: [dCell("Integration Hub", W * 0.3, { bold: true, shade: LIGHT_BG }), dCell("API-first hub; event streaming architecture", W * 0.44, { shade: LIGHT_BG }), dCell("Year 1", W * 0.26, { bold: true, color: IBM_BLUE, shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("Mainframe Workloads", W * 0.3, { bold: true }), dCell("API-wrap → rehost → refactor with parallel-run validation", W * 0.44), dCell("Year 1–2", W * 0.26, { bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [dCell("Application Portfolio (~500 apps)", W * 0.3, { bold: true, shade: LIGHT_BG }), dCell("Assess, rationalize and modernize through ongoing sprints", W * 0.44, { shade: LIGHT_BG }), dCell("Ongoing", W * 0.26, { bold: true, color: IBM_BLUE, shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("DataOps", W * 0.3, { bold: true }), dCell("Pipeline intelligence and quality engine", W * 0.44), dCell("Months 3–12", W * 0.26, { bold: true, color: IBM_BLUE })] }),
          ],
        }),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 5.0 Quality Engineering ────────────────────────────────────────
        ...sectionHead("5.0", "Quality Engineering"),
        bodyPara("Quality is treated as an always-on control system. GenAI-assisted test generation and maintenance increases automation coverage; shift-left quality gates catch defects earlier; and release readiness is measured continuously to reduce production escapes and incident volumes. Production insights feed back into the test suite so coverage improves with every release."),

        spacer(),
        subHead("5.1  Quality Progression Targets"),
        spacer(),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hCell("Quality Metric", W * 0.32), hCell("Current", W * 0.17), hCell("6-Month Target", W * 0.25), hCell("12-Month Target", W * 0.26)] }),
            new TableRow({ children: [dCell("Automation Coverage", W * 0.32, { bold: true, shade: LIGHT_BG }), dCell("~25%", W * 0.17, { shade: LIGHT_BG }), dCell("55%", W * 0.25, { bold: true, shade: LIGHT_BG }), dCell("80%+", W * 0.26, { bold: true, color: IBM_BLUE, shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("Defect Escape to Production", W * 0.32, { bold: true }), dCell("High", W * 0.17), dCell("40% reduction", W * 0.25, { bold: true }), dCell("65% reduction", W * 0.26, { bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [dCell("Regression Cycle Time", W * 0.32, { bold: true, shade: LIGHT_BG }), dCell("Multi-day", W * 0.17, { shade: LIGHT_BG }), dCell("50% faster", W * 0.25, { bold: true, shade: LIGHT_BG }), dCell("70% faster", W * 0.26, { bold: true, color: IBM_BLUE, shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("Mean Time to Detect (MTTD)", W * 0.32, { bold: true }), dCell(">2 hours", W * 0.17), dCell("<30 minutes", W * 0.25, { bold: true }), dCell("<15 minutes", W * 0.26, { bold: true, color: IBM_BLUE })] }),
          ],
        }),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 6.0 Phased Roadmap ─────────────────────────────────────────────
        ...sectionHead("6.0", "Phased Roadmap & Governance"),
        bodyPara("The transformation follows a structured, risk-controlled journey from stabilization to autonomous operations. Each phase builds on the last—compounding value with every release while protecting operational continuity throughout."),

        spacer(),
        subHead("6.1  Phased Delivery Roadmap"),
        spacer(),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hCell("Phase", W * 0.22), hCell("Timeframe", W * 0.17), hCell("Key Deliverables", W * 0.61)] }),
            new TableRow({ children: [dCell("Phase 0 — Foundation", W * 0.22, { bold: true, shade: LIGHT_BG }), dCell("0–8 weeks", W * 0.17, { shade: LIGHT_BG }), dCell("Baselines and discovery; transition plan; telemetry onboarding; AI enablement", W * 0.61, { shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("Phase 1 — Ignite", W * 0.22, { bold: true }), dCell("1–3 months", W * 0.17), dCell("Initial AIOps deployment; QE automation framework; innovation council; quick-win automations", W * 0.61)] }),
            new TableRow({ children: [dCell("Phase 2 — Scale", W * 0.22, { bold: true, shade: LIGHT_BG }), dCell("3–6 months", W * 0.17, { shade: LIGHT_BG }), dCell("Expand self-heal; agentic triage live; integration modernization pilots; DataOps monitoring expanded", W * 0.61, { shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("Phase 3 — Optimize", W * 0.22, { bold: true }), dCell("6–12 months", W * 0.17), dCell("Autonomous ops for common incidents; advanced QE gates; continuous modernization sprints; outcome reporting", W * 0.61)] }),
            new TableRow({ children: [dCell("Phase 4 — Transform", W * 0.22, { bold: true, shade: LIGHT_BG }), dCell("12–24 months", W * 0.17, { shade: LIGHT_BG }), dCell("Broader autonomy; platform modernization milestones; enterprise observability; co-invest opportunities", W * 0.61, { shade: LIGHT_BG })] }),
          ],
        }),

        spacer(),
        subHead("6.2  KPI Framework"),
        spacer(),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [hCell("Value Area", W * 0.28), hCell("Primary KPIs", W * 0.4), hCell("Measurement Source", W * 0.32)] }),
            new TableRow({ children: [dCell("Operational Excellence", W * 0.28, { bold: true, shade: LIGHT_BG }), dCell("MTTR, incident volume, availability", W * 0.4, { shade: LIGHT_BG }), dCell("ITSM + monitoring + AIOps telemetry", W * 0.32, { shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("Automation & Self-Heal", W * 0.28, { bold: true }), dCell("Auto-resolution %, self-heal count, noise reduction", W * 0.4), dCell("ICA / AIOps telemetry", W * 0.32)] }),
            new TableRow({ children: [dCell("Quality Engineering", W * 0.28, { bold: true, shade: LIGHT_BG }), dCell("Automation coverage, defect leakage, regression time", W * 0.4, { shade: LIGHT_BG }), dCell("QE toolchain + CI/CD", W * 0.32, { shade: LIGHT_BG })] }),
            new TableRow({ children: [dCell("Modernization", W * 0.28, { bold: true }), dCell("Upgrade velocity, n-1 compliance %, tech debt burndown", W * 0.4), dCell("Roadmap + CMDB + security scans", W * 0.32)] }),
            new TableRow({ children: [dCell("Business Outcomes", W * 0.28, { bold: true, shade: LIGHT_BG }), dCell("Claims cycle time, enrollment time-to-good, ASA/FCR", W * 0.4, { shade: LIGHT_BG }), dCell("Ops domain dashboards", W * 0.32, { shade: LIGHT_BG })] }),
          ],
        }),
        bodyPara("Reporting is transparent: operational dashboards reviewed monthly; executive outcomes reviewed quarterly. A continuous improvement loop ensures production insights feed both QE and automation backlogs."),

        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 7.0 Why IBM ────────────────────────────────────────────────────
        ...sectionHead("7.0", "Why IBM"),
        bodyPara("IBM brings deep institutional knowledge, healthcare payer expertise, and proven delivery at scale. Our platform assets are production-grade — not proofs-of-concept — and our governance model aligns teams to measurable outcomes."),

        spacer(),
        subHead("7.1  IBM Differentiators"),
        bulletPara("", "Deep Horizon institutional knowledge and proven delivery execution across the full application estate."),
        bulletPara("", "Production-grade assets — AIOps, ICA, CareOps360, IBM Consulting Advantage — aligned to enterprise governance from Day 1."),
        bulletPara("", "Healthcare payer domain expertise with compliance-first delivery covering claims, enrollment, and member services."),
        bulletPara("", "Outcome-based accountability with committed SLAs tied to measurable business outcomes and transparent monthly reporting."),
        bulletPara("", "Global delivery network with 24×7 coverage, local leadership engagement, and dedicated Horizon squads."),

        spacer(),
        subHead("7.2  IBM at Scale — Behind This Proposal"),
        spacer(),
        new Table({
          width: { size: W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({
              children: [
                statCell("20,000+",  "AI & Data Practitioners",              W / 4),
                statCell("81,000+",  "Cloud & Architecture Experts",          W / 4),
                statCell("40,000+",  "AI/Analytics Engagements Delivered",    W / 4),
                statCell("15,000+",  "Delivery Resources across 40 Centres",  W / 4),
              ],
            }),
          ],
        }),

        spacer(), spacer(),
        blueHR(),
        spacer(),

        // Closing statement
        new Paragraph({
          children: [
            makeRun(
              "\u201CIBM\u2019s commitment to Horizon is not measured in tickets resolved or servers managed \u2014 it is measured in ",
              { italics: true, color: GRAY_100 }
            ),
            makeRun("business outcomes delivered", { bold: true, italics: true, color: IBM_NAVY }),
            makeRun(". Every initiative in this proposal is connected to a measurable result \u2014 and every result is owned.\u201D", { italics: true, color: GRAY_100 }),
          ],
          spacing: { before: 80, after: 80 },
          indent: { left: convertInchesToTwip(0.3), right: convertInchesToTwip(0.3) },
        }),
        new Paragraph({
          children: [makeRun("— IBM Consulting, Healthcare & Payer Delivery", { bold: true, color: IBM_BLUE, size: 9.5 })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 0, after: twip(16) },
        }),

        thinHR(),
        new Paragraph({
          children: [makeRun(
            "\u00A9 2026 IBM Corporation. All rights reserved. Confidential \u2014 prepared exclusively for Horizon Healthcare Services.  Ref: IBM-HZN-AMS-RFP-2026-CAS",
            { color: GRAY_70, size: 8 }
          )],
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 0 },
        }),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx", buffer);
console.log("Done — attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx (" + buffer.length + " bytes)");
