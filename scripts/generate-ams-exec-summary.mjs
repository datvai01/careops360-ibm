import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, AlignmentType, BorderStyle, WidthType,
  ShadingType, TableLayoutType, Header, Footer, PageNumber,
  NumberFormat, convertInchesToTwip, UnderlineType,
  PageBreak, SectionType
} from "docx";
import { writeFileSync } from "fs";

const IBM_BLUE = "0F62FE";
const IBM_NAVY = "001141";
const IBM_NAVY2 = "001D6C";
const IBM_COOL_GRAY = "F2F4F8";
const IBM_GRAY_70 = "525252";
const IBM_GRAY_100 = "161616";
const WHITE = "FFFFFF";
const GREEN = "198038";

// ── Helpers ───────────────────────────────────────────────────────────────────

const pt = (n) => n * 20; // half-points to twips (1pt = 20 twip)

const run = (text, opts = {}) =>
  new TextRun({ text, font: "IBM Plex Sans", size: pt(10.5), ...opts });

const boldRun = (text, opts = {}) =>
  run(text, { bold: true, ...opts });

const blueRun = (text, opts = {}) =>
  boldRun(text, { color: IBM_BLUE, ...opts });

const spacer = (pts = 6) =>
  new Paragraph({
    children: [new TextRun({ text: "", size: pt(pts) })],
    spacing: { before: 0, after: 0 },
  });

const hrLine = () =>
  new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: IBM_BLUE, space: 4 } },
    spacing: { before: 60, after: 60 },
  });

const thinHr = () =>
  new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 2 } },
    spacing: { before: 40, after: 40 },
  });

/** Section heading: large IBM blue bold text with blue top border */
const sectionHeading = (number, title) => [
  new Paragraph({
    children: [],
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: IBM_BLUE, space: 6 } },
    spacing: { before: pt(16), after: 0 },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: number + "  ", font: "IBM Plex Sans", size: pt(9), color: IBM_BLUE, bold: true }),
      new TextRun({ text: title.toUpperCase(), font: "IBM Plex Sans", size: pt(13), bold: true, color: IBM_NAVY }),
    ],
    spacing: { before: 40, after: pt(5) },
  }),
];

/** Sub-heading within a section */
const subHeading = (text) =>
  new Paragraph({
    children: [new TextRun({ text, font: "IBM Plex Sans", size: pt(10.5), bold: true, color: IBM_BLUE })],
    spacing: { before: pt(8), after: pt(3) },
  });

/** Body paragraph */
const body = (text, opts = {}) =>
  new Paragraph({
    children: [run(text, { color: IBM_GRAY_100 })],
    spacing: { before: 60, after: 60 },
    ...opts,
  });

/** Bullet paragraph */
const bullet = (text, bold_prefix = "") =>
  new Paragraph({
    children: [
      bold_prefix ? boldRun(bold_prefix + " ", { color: IBM_NAVY }) : new TextRun(""),
      run(text, { color: IBM_GRAY_100 }),
    ],
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
  });

/** Metric highlight: bold blue number + description */
const metric = (number, label, description) =>
  new Paragraph({
    children: [
      new TextRun({ text: number + "  ", font: "IBM Plex Sans", size: pt(14), bold: true, color: IBM_BLUE }),
      new TextRun({ text: label, font: "IBM Plex Sans", size: pt(10.5), bold: true, color: IBM_NAVY }),
      new TextRun({ text: "  —  " + description, font: "IBM Plex Sans", size: pt(10.5), color: IBM_GRAY_70 }),
    ],
    spacing: { before: 60, after: 60 },
  });

/** Shaded row cell */
const cell = (text, opts = {}) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            font: "IBM Plex Sans",
            size: pt(9.5),
            color: opts.color || IBM_GRAY_100,
            bold: opts.bold || false,
          }),
        ],
        spacing: { before: 60, after: 60 },
        alignment: opts.align || AlignmentType.LEFT,
      }),
    ],
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    shading: opts.shade
      ? { type: ShadingType.SOLID, fill: opts.shade }
      : undefined,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: "E0E0E0" },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "E0E0E0" },
      left: { style: BorderStyle.SINGLE, size: 2, color: "E0E0E0" },
      right: { style: BorderStyle.SINGLE, size: 2, color: "E0E0E0" },
    },
  });

/** Navy header cell */
const headerCell = (text, widthDxa) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text, font: "IBM Plex Sans", size: pt(9.5), bold: true, color: WHITE }),
        ],
        spacing: { before: 60, after: 60 },
      }),
    ],
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    shading: { type: ShadingType.SOLID, fill: IBM_NAVY },
    width: widthDxa ? { size: widthDxa, type: WidthType.DXA } : undefined,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: IBM_BLUE },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: IBM_BLUE },
      left: { style: BorderStyle.SINGLE, size: 2, color: IBM_BLUE },
      right: { style: BorderStyle.SINGLE, size: 2, color: IBM_BLUE },
    },
  });

// ── Document body ─────────────────────────────────────────────────────────────

const PAGE_W_DXA = 12240; // Letter width in twips (8.5in)
const MARGIN_DXA = 1080;  // 0.75in margins
const CONTENT_W  = PAGE_W_DXA - MARGIN_DXA * 2; // usable width

const doc = new Document({
  creator: "IBM Consulting",
  title: "IBM × Horizon BCBS — AMS Transformation Executive Summary",
  description: "Confidential — April 2026",
  styles: {
    default: {
      document: {
        run: { font: "IBM Plex Sans", size: pt(10.5) },
      },
    },
  },
  sections: [
    // ── COVER PAGE ────────────────────────────────────────────────────────────
    {
      properties: {
        page: {
          margin: { top: convertInchesToTwip(1.5), bottom: convertInchesToTwip(1.2), left: convertInchesToTwip(1), right: convertInchesToTwip(1) },
        },
      },
      children: [
        // Confidential stamp top right
        new Paragraph({
          children: [new TextRun({ text: "CONFIDENTIAL", font: "IBM Plex Sans", size: pt(8), bold: true, color: IBM_BLUE, allCaps: true })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 0, after: pt(60) },
        }),

        spacer(40),

        // IBM accent bar
        new Paragraph({
          children: [],
          border: { top: { style: BorderStyle.SINGLE, size: 24, color: IBM_BLUE, space: 0 } },
          spacing: { before: 0, after: pt(20) },
        }),

        spacer(16),

        // Title block
        new Paragraph({
          children: [new TextRun({ text: "IBM × Horizon Blue Cross Blue Shield", font: "IBM Plex Sans", size: pt(14), color: IBM_BLUE, bold: true })],
          spacing: { before: 0, after: pt(6) },
        }),
        new Paragraph({
          children: [new TextRun({ text: "of New Jersey", font: "IBM Plex Sans", size: pt(14), color: IBM_BLUE, bold: true })],
          spacing: { before: 0, after: pt(24) },
        }),
        new Paragraph({
          children: [new TextRun({ text: "AMS Transformation", font: "IBM Plex Sans", size: pt(36), bold: true, color: IBM_NAVY })],
          spacing: { before: 0, after: pt(4) },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Executive Summary", font: "IBM Plex Sans", size: pt(20), bold: false, color: IBM_GRAY_70 })],
          spacing: { before: 0, after: pt(32) },
        }),

        spacer(20),
        hrLine(),
        spacer(20),

        // Key quote
        new Paragraph({
          children: [
            new TextRun({ text: '"IBM is not proposing a technology project — IBM is proposing a transformation partnership that embeds AI-driven intelligence into the operating model of Horizon, enabling a future-ready enterprise that is faster, smarter, and more resilient than today."', font: "IBM Plex Sans", size: pt(11), color: IBM_NAVY2, italics: true }),
          ],
          spacing: { before: 0, after: pt(24) },
          indent: { left: convertInchesToTwip(0.3), right: convertInchesToTwip(0.3) },
        }),
        new Paragraph({
          children: [new TextRun({ text: "— IBM Consulting, Healthcare & Payer Delivery", font: "IBM Plex Sans", size: pt(9.5), color: IBM_BLUE, bold: true })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 0, after: pt(48) },
        }),

        hrLine(),
        spacer(16),

        // Meta block
        new Paragraph({
          children: [new TextRun({ text: "Prepared for:", font: "IBM Plex Sans", size: pt(9.5), bold: true, color: IBM_NAVY })],
          spacing: { before: 0, after: 0 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Horizon Healthcare Services", font: "IBM Plex Sans", size: pt(10.5), color: IBM_GRAY_100 })],
          spacing: { before: 0, after: pt(8) },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Submitted by:", font: "IBM Plex Sans", size: pt(9.5), bold: true, color: IBM_NAVY })],
          spacing: { before: 0, after: 0 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "IBM Consulting — Healthcare & Payer Delivery", font: "IBM Plex Sans", size: pt(10.5), color: IBM_GRAY_100 })],
          spacing: { before: 0, after: pt(8) },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Date:", font: "IBM Plex Sans", size: pt(9.5), bold: true, color: IBM_NAVY })],
          spacing: { before: 0, after: 0 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "April 2026", font: "IBM Plex Sans", size: pt(10.5), color: IBM_GRAY_100 })],
          spacing: { before: 0, after: pt(8) },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Reference:", font: "IBM Plex Sans", size: pt(9.5), bold: true, color: IBM_NAVY })],
          spacing: { before: 0, after: 0 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "IBM-HZN-AMS-RFP-2026-CAS", font: "IBM Plex Sans", size: pt(10.5), color: IBM_GRAY_100 })],
          spacing: { before: 0, after: pt(48) },
        }),

        spacer(40),

        new Paragraph({
          children: [
            new TextRun({ text: "Powered by  ", font: "IBM Plex Sans", size: pt(9), color: IBM_GRAY_70 }),
            new TextRun({ text: "CareOps360  ·  IBM AIOps  ·  IBM Consulting Advantage  ·  ICA", font: "IBM Plex Sans", size: pt(9), bold: true, color: IBM_BLUE }),
          ],
          spacing: { before: 0, after: pt(8) },
        }),
        new Paragraph({
          children: [new TextRun({ text: "© 2026 IBM Corporation. All rights reserved. This document is confidential and intended solely for Horizon Healthcare Services.", font: "IBM Plex Sans", size: pt(8), color: IBM_GRAY_70 })],
          spacing: { before: 0, after: 0 },
        }),

        // Page break after cover
        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),
      ],
    },

    // ── MAIN CONTENT ──────────────────────────────────────────────────────────
    {
      properties: {
        page: {
          margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(0.9), left: convertInchesToTwip(1), right: convertInchesToTwip(1) },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "IBM × Horizon BCBS — AMS Transformation Executive Summary", font: "IBM Plex Sans", size: pt(8.5), color: IBM_GRAY_70 }),
                new TextRun({ text: "  |  CONFIDENTIAL", font: "IBM Plex Sans", size: pt(8.5), bold: true, color: IBM_BLUE }),
              ],
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: IBM_BLUE, space: 4 } },
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "© 2026 IBM Corporation   ", font: "IBM Plex Sans", size: pt(8), color: IBM_GRAY_70 }),
                new TextRun({ text: "Page ", font: "IBM Plex Sans", size: pt(8), color: IBM_GRAY_70 }),
                new TextRun({ children: [PageNumber.CURRENT], font: "IBM Plex Sans", size: pt(8), color: IBM_GRAY_70 }),
              ],
              alignment: AlignmentType.RIGHT,
              border: { top: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 4 } },
            }),
          ],
        }),
      },
      children: [

        // ── 1.0 EXECUTIVE SUMMARY ─────────────────────────────────────────────
        ...sectionHeading("1.0", "Executive Summary"),
        spacer(4),
        body("IBM proposes an AI-first operating model that shifts Horizon from reactive support to predictive, self-healing operations—delivering structural cost takeout, faster delivery, and measurable quality across all 500+ applications in scope."),

        spacer(6),
        subHeading("1.1  The Moment"),
        body("Horizon operates a complex portfolio of approximately 500 applications spanning enrollment, claims adjudication, member services, provider operations, and data platforms. Rising operational load, fragmented tower delivery, and manual processes increase cost and slow modernization. An AI-first, product-oriented operating model is required to deliver structural cost takeout while improving member and provider experience."),

        spacer(6),
        subHeading("1.2  What IBM Proposes"),
        bullet("Transition from reactive support to predictive, self-healing operations using IBM AIOps and Intelligent Cloud Automation (ICA)."),
        bullet("Integrate Application Management Services (AMS), Quality Engineering (QE), and Data Services into product-aligned pods with end-to-end ownership."),
        bullet("Embed continuous innovation and modernization within steady-state delivery—delivered through a governed value pipeline, not separate projects."),

        spacer(6),
        subHeading("1.3  Executive Snapshot"),

        spacer(4),
        // 4-column snapshot table
        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "40–50%", font: "IBM Plex Sans", size: pt(18), bold: true, color: IBM_BLUE })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "Structural Cost Takeout", font: "IBM Plex Sans", size: pt(9), bold: true, color: IBM_NAVY })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "operational cost reduction", font: "IBM Plex Sans", size: pt(8.5), color: IBM_GRAY_70 })], alignment: AlignmentType.CENTER }),
                  ],
                  shading: { type: ShadingType.SOLID, fill: "EBF2FF" },
                  margins: { top: 120, bottom: 120, left: 80, right: 80 },
                  width: { size: CONTENT_W / 4, type: WidthType.DXA },
                  borders: { top: { style: BorderStyle.SINGLE, size: 8, color: IBM_BLUE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" } },
                }),
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "25–40%", font: "IBM Plex Sans", size: pt(18), bold: true, color: IBM_BLUE })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "Speed to Value", font: "IBM Plex Sans", size: pt(9), bold: true, color: IBM_NAVY })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "time-to-market acceleration", font: "IBM Plex Sans", size: pt(8.5), color: IBM_GRAY_70 })], alignment: AlignmentType.CENTER }),
                  ],
                  shading: { type: ShadingType.SOLID, fill: "EBF2FF" },
                  margins: { top: 120, bottom: 120, left: 80, right: 80 },
                  width: { size: CONTENT_W / 4, type: WidthType.DXA },
                  borders: { top: { style: BorderStyle.SINGLE, size: 8, color: IBM_BLUE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" }, right: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" } },
                }),
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "30%", font: "IBM Plex Sans", size: pt(18), bold: true, color: IBM_BLUE })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "Incident Reduction", font: "IBM Plex Sans", size: pt(9), bold: true, color: IBM_NAVY })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "improved availability", font: "IBM Plex Sans", size: pt(8.5), color: IBM_GRAY_70 })], alignment: AlignmentType.CENTER }),
                  ],
                  shading: { type: ShadingType.SOLID, fill: "EBF2FF" },
                  margins: { top: 120, bottom: 120, left: 80, right: 80 },
                  width: { size: CONTENT_W / 4, type: WidthType.DXA },
                  borders: { top: { style: BorderStyle.SINGLE, size: 8, color: IBM_BLUE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" }, right: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" } },
                }),
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "30–50%", font: "IBM Plex Sans", size: pt(18), bold: true, color: IBM_BLUE })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "MTTR Reduction", font: "IBM Plex Sans", size: pt(9), bold: true, color: IBM_NAVY })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "target <1.8 hour resolution", font: "IBM Plex Sans", size: pt(8.5), color: IBM_GRAY_70 })], alignment: AlignmentType.CENTER }),
                  ],
                  shading: { type: ShadingType.SOLID, fill: "EBF2FF" },
                  margins: { top: 120, bottom: 120, left: 80, right: 80 },
                  width: { size: CONTENT_W / 4, type: WidthType.DXA },
                  borders: { top: { style: BorderStyle.SINGLE, size: 8, color: IBM_BLUE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" }, right: { style: BorderStyle.NONE } },
                }),
              ],
            }),
          ],
        }),
        spacer(4),
        new Paragraph({
          children: [new TextRun({ text: "All targets are directional. Baselines established in Phase 0 and tracked continuously through executive dashboards.", font: "IBM Plex Sans", size: pt(8.5), color: IBM_GRAY_70, italics: true })],
          spacing: { before: 40, after: 80 },
        }),

        // ── 2.0 TRANSFORMATION OVERVIEW ──────────────────────────────────────
        ...sectionHeading("2.0", "Transformation Overview"),
        spacer(4),
        body("Transformation is embedded into steady-state delivery through an outcome-based governance model—compounding value across operations, engineering, and data. The approach aligns people, process, and platform: product-aligned pods own outcomes end-to-end; automation removes repetitive work; and executive visibility ensures progress is measured transparently."),

        spacer(6),
        subHeading("2.1  Six Core Tenets"),
        spacer(4),

        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [headerCell("Tenet", CONTENT_W * 0.3), headerCell("Description", CONTENT_W * 0.7)] }),
            new TableRow({ children: [cell("AI-First Operating Model", { bold: true, shade: "F7FAFF" }), cell("Embed AI in triage, diagnosis, resolution, test generation, and analytics to shift from reactive to predictive operations.", { shade: "F7FAFF" })] }),
            new TableRow({ children: [cell("Integrated Delivery", { bold: true }), cell("Unified build + run pods across AMS, QE, and Data to reduce handoffs and accelerate change safely.")] }),
            new TableRow({ children: [cell("Automation & Self-Healing", { bold: true, shade: "F7FAFF" }), cell("Noise reduction, auto-triage, auto-remediation, and runbook automation to eliminate recurring demand.", { shade: "F7FAFF" })] }),
            new TableRow({ children: [cell("Outcome-Driven Transformation", { bold: true }), cell("Apply ticket economics to remove demand; track business impact rather than activity metrics.")] }),
            new TableRow({ children: [cell("Continuous Innovation", { bold: true, shade: "F7FAFF" }), cell("Modernization sprints and a governed value pipeline to deliver incremental improvements continuously.", { shade: "F7FAFF" })] }),
            new TableRow({ children: [cell("Zero-Disruption Transition", { bold: true }), cell("Risk-controlled onboarding and phased rollout leveraging existing Horizon knowledge to maintain continuity.")] }),
          ],
        }),

        spacer(8),
        subHeading("2.2  Current State vs. 12-Month Targets"),
        spacer(4),

        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [headerCell("Metric", CONTENT_W * 0.35), headerCell("Current (est.)", CONTENT_W * 0.2), headerCell("12-Month Target", CONTENT_W * 0.27), headerCell("Direction", CONTENT_W * 0.18)] }),
            new TableRow({ children: [cell("Test Automation Coverage", { bold: true, shade: "F7FAFF" }), cell("~25%", { shade: "F7FAFF" }), cell("80%+", { shade: "F7FAFF", bold: true, color: IBM_BLUE }), cell("↑ 3×", { shade: "F7FAFF", bold: true, color: GREEN })] }),
            new TableRow({ children: [cell("Mean Time to Resolve (MTTR)", { bold: true }), cell(">4 hours"), cell("<1.8 hours", { bold: true, color: IBM_BLUE }), cell("↓ ~55%", { bold: true, color: GREEN })] }),
            new TableRow({ children: [cell("Defect Escape to Production", { bold: true, shade: "F7FAFF" }), cell("High / untracked", { shade: "F7FAFF" }), cell("65% reduction", { shade: "F7FAFF", bold: true, color: IBM_BLUE }), cell("↓", { shade: "F7FAFF", bold: true, color: GREEN })] }),
            new TableRow({ children: [cell("P3/P4 Auto-Resolution", { bold: true }), cell("<10%"), cell(">74%", { bold: true, color: IBM_BLUE }), cell("↑ ~7×", { bold: true, color: GREEN })] }),
            new TableRow({ children: [cell("Alert Noise per Shift", { bold: true, shade: "F7FAFF" }), cell("Unfiltered high", { shade: "F7FAFF" }), cell(">60% reduced", { shade: "F7FAFF", bold: true, color: IBM_BLUE }), cell("↓", { shade: "F7FAFF", bold: true, color: GREEN })] }),
            new TableRow({ children: [cell("System Availability", { bold: true }), cell("~99.7%"), cell("99.9%+", { bold: true, color: IBM_BLUE }), cell("↑", { bold: true, color: GREEN })] }),
          ],
        }),

        spacer(4),
        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 3.0 AIOPS ────────────────────────────────────────────────────────
        ...sectionHeading("3.0", "AIOps & Agentic AI Operations"),
        spacer(4),
        body("IBM's AIOps approach uses correlated telemetry (logs, metrics, traces, events) and operational history (tickets, changes, knowledge) to reduce alert noise, speed triage, and automate common resolutions. Learnings from production continuously feed automation runbooks and quality gates to prevent recurrence."),

        spacer(6),
        subHeading("3.1  Purpose-Built AI Agents"),
        spacer(4),

        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [headerCell("Agent Type", CONTENT_W * 0.32), headerCell("Function", CONTENT_W * 0.42), headerCell("Value Impact (dir.)", CONTENT_W * 0.26)] }),
            new TableRow({ children: [cell("Monitoring & Detection", { bold: true, shade: "F7FAFF" }), cell("Correlation, grouping, anomaly detection", { shade: "F7FAFF" }), cell("$2.5M–$3.5M", { shade: "F7FAFF", bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [cell("Triage Agent", { bold: true }), cell("Impact-aware routing and prioritization"), cell("$1.3M–$1.5M", { bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [cell("Root Cause & Resolution", { bold: true, shade: "F7FAFF" }), cell("Diagnosis, runbook guidance, auto-remediation", { shade: "F7FAFF" }), cell("$2.0M–$3.0M", { shade: "F7FAFF", bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [cell("Knowledge & Feedback", { bold: true }), cell("Knowledge extraction, continuous learning"), cell("$1.0M–$1.3M", { bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [cell("Impact Assessment & Testing", { bold: true, shade: "F7FAFF" }), cell("QE automation and validation", { shade: "F7FAFF" }), cell("$1.2M–$2.0M", { shade: "F7FAFF", bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [cell("Deployment Agents", { bold: true }), cell("Release automation and risk scoring"), cell("$0.8M–$1.2M", { bold: true, color: IBM_BLUE })] }),
          ],
        }),

        spacer(8),
        subHeading("3.2  Expected Operational Impact"),
        bullet(">60% alert noise reduction through correlation and de-duplication, improving engineer focus."),
        bullet("<1.8 hours MTTR target through intelligent routing, guided diagnostics, and auto-remediation."),
        bullet(">74% auto-resolution for P3/P4 incidents via self-heal runbooks and workflow automation."),
        bullet("Closed-loop learning across Incident → Problem → Change to prevent recurrence and reduce demand over time."),

        spacer(4),
        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 4.0 PLATFORM & DATA ───────────────────────────────────────────────
        ...sectionHeading("4.0", "Platform & Data Modernization"),
        spacer(4),
        body("This workstream modernizes how Horizon integrates, upgrades, and governs platforms—reducing technical debt, improving security posture, and enabling faster change with lower risk. Modernization is delivered as a value chain: standardize integration patterns, instrument for observability, automate operations, and report outcomes through governance."),

        bullet("Integration modernization: Evolve from point-to-point and batch-heavy patterns to API-first and event-driven integration."),
        bullet("Mainframe modernization (phased): API-wrap → rehost → refactor approach with parallel-run validation and risk gates."),
        bullet("Technical debt governance (n-1 standard): Maintain stacks at n-1 versions with monthly compliance reporting and emergency patching for critical CVEs."),

        spacer(6),
        subHeading("4.1  Workstream Timeline"),
        spacer(4),

        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [headerCell("Workstream", CONTENT_W * 0.28), headerCell("Approach", CONTENT_W * 0.45), headerCell("Timeline", CONTENT_W * 0.27)] }),
            new TableRow({ children: [cell("Integration Hub", { bold: true, shade: "F7FAFF" }), cell("API-first hub; event streaming", { shade: "F7FAFF" }), cell("Year 1", { shade: "F7FAFF", bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [cell("Mainframe Workloads", { bold: true }), cell("API-wrap → rehost → refactor"), cell("Year 1–2", { bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [cell("Application Portfolio (~500 apps)", { bold: true, shade: "F7FAFF" }), cell("Assess, rationalize and modernize through ongoing sprints", { shade: "F7FAFF" }), cell("Ongoing", { shade: "F7FAFF", bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [cell("DataOps", { bold: true }), cell("Pipeline intelligence + quality engine"), cell("Months 3–12", { bold: true, color: IBM_BLUE })] }),
          ],
        }),

        spacer(4),
        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 5.0 QUALITY ENGINEERING ──────────────────────────────────────────
        ...sectionHeading("5.0", "Quality Engineering"),
        spacer(4),
        body("Quality is treated as an always-on control system. GenAI-assisted test generation and maintenance increases automation coverage; shift-left quality gates catch defects earlier; and release readiness is measured continuously to reduce production escapes and incident volumes. Production insights feed back into the test suite so coverage improves with every release."),

        spacer(6),
        subHeading("5.1  Quality Progression Targets"),
        spacer(4),

        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [headerCell("Quality Metric", CONTENT_W * 0.3), headerCell("Current", CONTENT_W * 0.18), headerCell("6-Month Target", CONTENT_W * 0.25), headerCell("12-Month Target", CONTENT_W * 0.27)] }),
            new TableRow({ children: [cell("Automation Coverage", { bold: true, shade: "F7FAFF" }), cell("~25%", { shade: "F7FAFF" }), cell("55%", { shade: "F7FAFF", bold: true }), cell("80%+", { shade: "F7FAFF", bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [cell("Defect Escape to Production", { bold: true }), cell("High"), cell("40% reduction", { bold: true }), cell("65% reduction", { bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [cell("Regression Cycle Time", { bold: true, shade: "F7FAFF" }), cell("Multi-day", { shade: "F7FAFF" }), cell("50% faster", { shade: "F7FAFF", bold: true }), cell("70% faster", { shade: "F7FAFF", bold: true, color: IBM_BLUE })] }),
            new TableRow({ children: [cell("Mean Time to Detect (MTTD)", { bold: true }), cell(">2 hours"), cell("<30 minutes", { bold: true }), cell("<15 minutes", { bold: true, color: IBM_BLUE })] }),
          ],
        }),

        spacer(4),
        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 6.0 PHASED ROADMAP ───────────────────────────────────────────────
        ...sectionHeading("6.0", "Phased Roadmap & Governance"),
        spacer(4),
        body("The transformation follows a structured, risk-controlled journey from stabilization to autonomous operations. Each phase builds on the last—compounding value with every release while protecting operational continuity."),

        spacer(6),
        subHeading("6.1  Phased Delivery Roadmap"),
        spacer(4),

        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [headerCell("Phase", CONTENT_W * 0.2), headerCell("Timeframe", CONTENT_W * 0.18), headerCell("Key Deliverables", CONTENT_W * 0.62)] }),
            new TableRow({ children: [cell("Phase 0 — Foundation", { bold: true, shade: "F7FAFF" }), cell("0–8 weeks", { shade: "F7FAFF" }), cell("Baselines and discovery; transition plan; initial telemetry onboarding and AI enablement", { shade: "F7FAFF" })] }),
            new TableRow({ children: [cell("Phase 1 — Ignite", { bold: true }), cell("1–3 months"), cell("Initial AIOps deployment; QE automation framework; innovation council; quick-win automations")] }),
            new TableRow({ children: [cell("Phase 2 — Scale", { bold: true, shade: "F7FAFF" }), cell("3–6 months", { shade: "F7FAFF" }), cell("Expand self-heal; agentic triage live; integration modernization pilots; DataOps monitoring expanded", { shade: "F7FAFF" })] }),
            new TableRow({ children: [cell("Phase 3 — Optimize", { bold: true }), cell("6–12 months"), cell("Autonomous ops for common incidents; advanced QE gates; continuous modernization sprints; outcome reporting")] }),
            new TableRow({ children: [cell("Phase 4 — Transform", { bold: true, shade: "F7FAFF" }), cell("12–24 months", { shade: "F7FAFF" }), cell("Broader autonomy; platform modernization milestones; enterprise observability; co-invest opportunities", { shade: "F7FAFF" })] }),
          ],
        }),

        spacer(8),
        subHeading("6.2  KPI Framework"),
        spacer(4),

        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({ children: [headerCell("Value Area", CONTENT_W * 0.28), headerCell("Primary KPIs", CONTENT_W * 0.38), headerCell("Measurement Source", CONTENT_W * 0.34)] }),
            new TableRow({ children: [cell("Operational Excellence", { bold: true, shade: "F7FAFF" }), cell("MTTR, incident volume, availability", { shade: "F7FAFF" }), cell("ITSM + monitoring + AIOps telemetry", { shade: "F7FAFF" })] }),
            new TableRow({ children: [cell("Automation & Self-Heal", { bold: true }), cell("Auto-resolution %, self-heal count, noise reduction"), cell("ICA/AIOps telemetry")] }),
            new TableRow({ children: [cell("Quality Engineering", { bold: true, shade: "F7FAFF" }), cell("Automation coverage, defect leakage, regression time", { shade: "F7FAFF" }), cell("QE toolchain + CI/CD", { shade: "F7FAFF" })] }),
            new TableRow({ children: [cell("Modernization", { bold: true }), cell("Upgrade velocity, n-1 compliance %, tech debt burndown"), cell("Roadmap + CMDB + security scans")] }),
            new TableRow({ children: [cell("Business Outcomes", { bold: true, shade: "F7FAFF" }), cell("Claims cycle time, enrollment time-to-good, ASA/FCR", { shade: "F7FAFF" }), cell("Ops domain dashboards", { shade: "F7FAFF" })] }),
          ],
        }),

        spacer(6),
        body("Reporting is transparent: operational dashboards are reviewed monthly, and executive outcomes are reviewed quarterly. A continuous improvement loop ensures production insights feed both QE and automation backlogs."),

        spacer(4),
        new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }),

        // ── 7.0 WHY IBM ──────────────────────────────────────────────────────
        ...sectionHeading("7.0", "Why IBM"),
        spacer(4),
        body("IBM brings deep institutional knowledge, healthcare payer expertise, and proven delivery at scale. Our platform assets are production-grade—not proofs-of-concept—and our governance model aligns teams to measurable outcomes."),

        spacer(6),
        subHeading("7.1  IBM Differentiators"),
        bullet("Deep Horizon institutional knowledge and proven delivery execution across the full application estate."),
        bullet("Production-grade assets — AIOps, ICA, CareOps360, IBM Consulting Advantage — aligned to enterprise governance from Day 1."),
        bullet("Healthcare payer domain expertise with compliance-first delivery covering claims, enrollment, and member services."),
        bullet("Outcome-based accountability with committed SLAs tied to measurable business outcomes and transparent monthly reporting."),
        bullet("Global delivery network with 24×7 coverage, local leadership engagement, and dedicated Horizon squads."),

        spacer(8),
        subHeading("7.2  IBM at Scale — Behind This Proposal"),
        spacer(4),

        new Table({
          width: { size: CONTENT_W, type: WidthType.DXA },
          layout: TableLayoutType.FIXED,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "20,000+", font: "IBM Plex Sans", size: pt(20), bold: true, color: IBM_BLUE })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "AI & Data Practitioners", font: "IBM Plex Sans", size: pt(9), bold: true, color: IBM_NAVY })], alignment: AlignmentType.CENTER }),
                  ],
                  shading: { type: ShadingType.SOLID, fill: "EBF2FF" },
                  margins: { top: 140, bottom: 140, left: 80, right: 80 },
                  width: { size: CONTENT_W / 4, type: WidthType.DXA },
                  borders: { top: { style: BorderStyle.SINGLE, size: 8, color: IBM_BLUE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" } },
                }),
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "81,000+", font: "IBM Plex Sans", size: pt(20), bold: true, color: IBM_BLUE })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "Cloud & Architecture Experts", font: "IBM Plex Sans", size: pt(9), bold: true, color: IBM_NAVY })], alignment: AlignmentType.CENTER }),
                  ],
                  shading: { type: ShadingType.SOLID, fill: "EBF2FF" },
                  margins: { top: 140, bottom: 140, left: 80, right: 80 },
                  width: { size: CONTENT_W / 4, type: WidthType.DXA },
                  borders: { top: { style: BorderStyle.SINGLE, size: 8, color: IBM_BLUE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" }, right: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" } },
                }),
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "40,000+", font: "IBM Plex Sans", size: pt(20), bold: true, color: IBM_BLUE })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "AI/Analytics Engagements", font: "IBM Plex Sans", size: pt(9), bold: true, color: IBM_NAVY })], alignment: AlignmentType.CENTER }),
                  ],
                  shading: { type: ShadingType.SOLID, fill: "EBF2FF" },
                  margins: { top: 140, bottom: 140, left: 80, right: 80 },
                  width: { size: CONTENT_W / 4, type: WidthType.DXA },
                  borders: { top: { style: BorderStyle.SINGLE, size: 8, color: IBM_BLUE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" }, right: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" } },
                }),
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "15,000+", font: "IBM Plex Sans", size: pt(20), bold: true, color: IBM_BLUE })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "Delivery Resources across 40 Global Centres", font: "IBM Plex Sans", size: pt(9), bold: true, color: IBM_NAVY })], alignment: AlignmentType.CENTER }),
                  ],
                  shading: { type: ShadingType.SOLID, fill: "EBF2FF" },
                  margins: { top: 140, bottom: 140, left: 80, right: 80 },
                  width: { size: CONTENT_W / 4, type: WidthType.DXA },
                  borders: { top: { style: BorderStyle.SINGLE, size: 8, color: IBM_BLUE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC" }, right: { style: BorderStyle.NONE } },
                }),
              ],
            }),
          ],
        }),

        spacer(10),
        hrLine(),
        spacer(6),

        // Closing statement
        new Paragraph({
          children: [
            new TextRun({ text: "IBM's commitment to Horizon is not measured in tickets resolved or servers managed — it is measured in ", font: "IBM Plex Sans", size: pt(10.5), color: IBM_GRAY_100, italics: true }),
            new TextRun({ text: "business outcomes delivered", font: "IBM Plex Sans", size: pt(10.5), bold: true, color: IBM_NAVY, italics: true }),
            new TextRun({ text: ". Every initiative in this proposal is connected to a measurable result — and every result is owned.", font: "IBM Plex Sans", size: pt(10.5), color: IBM_GRAY_100, italics: true }),
          ],
          spacing: { before: 80, after: 80 },
          indent: { left: convertInchesToTwip(0.3), right: convertInchesToTwip(0.3) },
        }),

        spacer(8),

        new Paragraph({
          children: [new TextRun({ text: "© 2026 IBM Corporation. All rights reserved. Confidential — prepared exclusively for Horizon Healthcare Services. Ref: IBM-HZN-AMS-RFP-2026-CAS", font: "IBM Plex Sans", size: pt(8), color: IBM_GRAY_70 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 0 },
        }),
      ],
    },
  ],
});

// ── Write to disk ─────────────────────────────────────────────────────────────

const buffer = await Packer.toBuffer(doc);
writeFileSync("attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx", buffer);
console.log("Done — attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx");
