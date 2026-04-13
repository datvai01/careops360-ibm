/**
 * IBM × Horizon BCBS — AI-First Transformation White Paper
 * Generated from user-approved baseline document (April 2026)
 */

import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, WidthType, BorderStyle,
  ShadingType, TableLayoutType, VerticalAlign, PageBreak,
  Header, Footer, ImageRun, PageNumber,
} from 'docx';
import { writeFileSync, readFileSync } from 'fs';

// ─── Brand Palette ────────────────────────────────────────────────────────────
const C = {
  blue:   '0F62FE',
  navy:   '001141',
  slate:  '21272A',
  teal:   '009D9A',
  green:  '198038',
  orange: 'FF832B',
  red:    'DA1E28',
  mid:    '6F6F6F',
  rule:   'C6C6C6',
  white:  'FFFFFF',
  lblue:  'D0E2FF',
  lteal:  'D9FBFB',
  lgreen: 'DEFBE6',
  lgray:  'F4F4F4',
  fblue:  'EEF4FF',
};

// ─── Page geometry (twips, 1 inch = 1440 twips) ──────────────────────────────
const PW    = 9072;   // printable width  (6.3 in)
const HALF  = 4320;   // half column      (3.0 in)
const THIRD = 2880;   // one-third        (2.0 in)
const QTR   = 2160;   // quarter          (1.5 in)

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const R   = (text, o = {}) => new TextRun({ text, font: 'Calibri', ...o });
const Rb  = (text, o = {}) => R(text, { bold: true, ...o });
const Rc  = (text, color, o = {}) => R(text, { color, ...o });
const Rbc = (text, color, o = {}) => Rb(text, { color, ...o });

function sp(n = 1) {
  return Array.from({ length: n }, () =>
    new Paragraph({ children: [R('')], spacing: { after: 40 } }));
}

function pgBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function noBorder() {
  const s = { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' };
  return { top: s, bottom: s, left: s, right: s, insideH: s, insideV: s };
}

function thinBottom(color = C.rule) {
  return { bottom: { style: BorderStyle.SINGLE, size: 4, color, space: 4 } };
}

// ─── Body paragraph ───────────────────────────────────────────────────────────
function body(runs, opts = {}) {
  const children = Array.isArray(runs)
    ? runs
    : [R(runs, { size: 20, color: C.slate })];
  return new Paragraph({
    children,
    spacing: { after: 100 },
    alignment: AlignmentType.JUSTIFIED,
    ...opts,
  });
}

function bodyS(text, opts = {}) {
  return new Paragraph({
    children: [R(text, { size: 18, color: C.mid, italics: true })],
    spacing: { after: 80 },
    alignment: AlignmentType.JUSTIFIED,
    ...opts,
  });
}

// ─── Bullet ───────────────────────────────────────────────────────────────────
function blt(runs, level = 0) {
  const children = Array.isArray(runs)
    ? runs
    : [R(runs, { size: 20, color: C.slate })];
  return new Paragraph({
    children,
    bullet: { level },
    spacing: { after: 80 },
    indent: { left: 360 + level * 280 },
  });
}

// ─── Column heading (level 2) ─────────────────────────────────────────────────
function ch2(text, color = C.blue) {
  return new Paragraph({
    children: [Rb(text, { size: 22, color })],
    spacing: { before: 180, after: 80 },
    border: { left: { style: BorderStyle.SINGLE, size: 20, color, space: 8 } },
    indent: { left: 120 },
  });
}

// ─── Section title ────────────────────────────────────────────────────────────
function secTitle(title, sub = '') {
  return [
    new Paragraph({
      children: [Rb(title, { size: 44, color: C.navy })],
      spacing: { before: 240, after: sub ? 80 : 160 },
      border: thinBottom(C.blue),
    }),
    ...(sub ? [new Paragraph({
      children: [R(sub, { size: 22, color: C.mid, italics: true })],
      spacing: { after: 200 },
    })] : [new Paragraph({ children: [R('')], spacing: { after: 160 } })]),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Two-column table (borderless) ───────────────────────────────────────────
function twoCol(left, right, opts = {}) {
  const { lw = HALF, rw = HALF } = opts;
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: PW, type: WidthType.DXA },
    borders: noBorder(),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: lw, type: WidthType.DXA },
            children: left,
            margins: { right: 220 },
            borders: noBorder(),
          }),
          new TableCell({
            width: { size: rw, type: WidthType.DXA },
            children: right,
            margins: { left: 220 },
            borders: noBorder(),
          }),
        ],
      }),
    ],
  });
}

// ─── Callout / pull-quote ────────────────────────────────────────────────────
function callout(runs, opts = {}) {
  const { bg = C.lblue, accent = C.blue, size = 22, center = true } = opts;
  const children = Array.isArray(runs)
    ? runs
    : [Rb(runs, { size, color: C.navy })];
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: PW, type: WidthType.DXA },
    borders: noBorder(),
    rows: [new TableRow({ children: [new TableCell({
      children: [new Paragraph({
        children,
        spacing: { before: 80, after: 80 },
        alignment: center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
      })],
      shading: { fill: bg, type: ShadingType.CLEAR },
      margins: { top: 160, bottom: 160, left: 280, right: 280 },
      borders: {
        left:   { style: BorderStyle.SINGLE, size: 28, color: accent },
        top:    { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
        right:  { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
        bottom: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
      },
    })]})],
  });
}

// ─── Info box (rounded feel via thick left border + bg) ──────────────────────
function infoBox(title, items, opts = {}) {
  const { bg = C.fblue, accent = C.blue } = opts;
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: PW, type: WidthType.DXA },
    borders: noBorder(),
    rows: [new TableRow({ children: [new TableCell({
      children: [
        new Paragraph({
          children: [Rb(title, { size: 20, color: C.navy })],
          spacing: { after: 80 },
        }),
        ...items.map(t => new Paragraph({
          children: [R('• ' + t, { size: 19, color: C.slate })],
          spacing: { after: 60 },
        })),
      ],
      shading: { fill: bg, type: ShadingType.CLEAR },
      margins: { top: 140, bottom: 140, left: 200, right: 200 },
      borders: {
        left:   { style: BorderStyle.SINGLE, size: 28, color: accent },
        top:    { style: BorderStyle.SINGLE, size: 4, color: accent },
        right:  { style: BorderStyle.SINGLE, size: 4, color: accent },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: accent },
      },
    })]})],
  });
}

// ─── Approval badge strip ────────────────────────────────────────────────────
function approvalStrip(badges) {
  const w = Math.floor(PW / badges.length);
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: PW, type: WidthType.DXA },
    borders: noBorder(),
    rows: [new TableRow({
      children: badges.map(({ icon, label, sub, color = C.green }) =>
        new TableCell({
          children: [
            new Paragraph({ children: [Rb(icon + '  ' + label, { size: 22, color })], alignment: AlignmentType.CENTER }),
            new Paragraph({ children: [R(sub, { size: 18, color: C.mid })], alignment: AlignmentType.CENTER }),
          ],
          shading: { fill: C.lgreen, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 80, right: 80 },
          width: { size: w, type: WidthType.DXA },
          borders: {
            right:  { style: BorderStyle.SINGLE, size: 8, color: C.white },
            top:    { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
            bottom: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
            left:   { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
          },
        })
      ),
    })],
  });
}

// ─── KPI strip ────────────────────────────────────────────────────────────────
function kpiStrip(items) {
  const w = Math.floor(PW / items.length);
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: PW, type: WidthType.DXA },
    borders: noBorder(),
    rows: [new TableRow({
      children: items.map(({ value, label, color = C.blue }) =>
        new TableCell({
          children: [
            new Paragraph({ children: [Rb(value, { size: 48, color })], alignment: AlignmentType.CENTER }),
            new Paragraph({ children: [R(label, { size: 17, color: C.slate })], alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
          ],
          shading: { fill: C.lgray, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 80, right: 80 },
          width: { size: w, type: WidthType.DXA },
          borders: {
            right:  { style: BorderStyle.SINGLE, size: 6, color: C.rule },
            top:    { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
            bottom: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
            left:   { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
          },
        })
      ),
    })],
  });
}

// ─── Data table ───────────────────────────────────────────────────────────────
function dataTable(headers, rows, colW, opts = {}) {
  const { greenValues = [] } = opts;
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: PW, type: WidthType.DXA },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
          children: [new Paragraph({
            children: [Rb(h, { size: 19, color: C.white })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
          })],
          shading: { fill: C.navy, type: ShadingType.CLEAR },
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
          width: colW ? { size: colW[i], type: WidthType.DXA } : undefined,
        })),
      }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((val, ci) => new TableCell({
          children: [new Paragraph({
            children: [ci === 0
              ? Rb(String(val), { size: 19, color: C.slate })
              : R(String(val), { size: 19, color: greenValues.includes(String(val)) ? C.green : C.slate })],
            spacing: { before: 50, after: 50 },
          })],
          shading: { fill: ri % 2 === 0 ? C.white : C.fblue, type: ShadingType.CLEAR },
          margins: { top: 50, bottom: 50, left: 80, right: 80 },
          verticalAlign: VerticalAlign.CENTER,
          width: colW ? { size: colW[ci], type: WidthType.DXA } : undefined,
        })),
      })),
    ],
  });
}

// ─── Phase roadmap ────────────────────────────────────────────────────────────
function roadmap(phases) {
  const w = Math.floor(PW / phases.length);
  const BG = ['0F62FE', '0050E6', '003CBF', '00288A'];
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: PW, type: WidthType.DXA },
    borders: noBorder(),
    rows: [
      // Header
      new TableRow({
        children: phases.map(({ phase, time }, i) => new TableCell({
          children: [
            new Paragraph({ children: [Rb(phase, { size: 20, color: C.white })], alignment: AlignmentType.CENTER }),
            new Paragraph({ children: [R(time, { size: 17, color: C.lblue })], alignment: AlignmentType.CENTER }),
          ],
          shading: { fill: BG[i % BG.length], type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 80, right: 80 },
          width: { size: w, type: WidthType.DXA },
          borders: {
            right:  { style: BorderStyle.SINGLE, size: 8, color: C.white },
            top:    { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
            bottom: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
            left:   { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
          },
        })),
      }),
      // Items
      new TableRow({
        children: phases.map(({ items }, i) => new TableCell({
          children: items.map(t => new Paragraph({
            children: [R('› ' + t, { size: 18, color: C.slate })],
            spacing: { after: 60 },
          })),
          shading: { fill: i % 2 === 0 ? C.lgray : 'EAEAEA', type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 100, right: 100 },
          width: { size: w, type: WidthType.DXA },
          borders: {
            right:  { style: BorderStyle.SINGLE, size: 4, color: C.rule },
            top:    { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
            bottom: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
            left:   { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' },
          },
        })),
      }),
    ],
  });
}

// ─── Horizontal bar chart ─────────────────────────────────────────────────────
function barChart(title, items, unit = '', caption = '') {
  const max = Math.max(...items.map(x => x.value));
  const BAR = 5200;
  return [
    new Paragraph({ children: [Rb(title, { size: 21, color: C.navy })], spacing: { before: 120, after: 80 } }),
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: PW, type: WidthType.DXA },
      borders: noBorder(),
      rows: items.map(({ label, value, color = C.blue }) => {
        const filled = Math.round((value / max) * BAR);
        const empty  = BAR - filled;
        return new TableRow({ children: [
          new TableCell({
            children: [new Paragraph({ children: [R(label, { size: 18, color: C.slate })], spacing: { after: 0 } })],
            width: { size: 2600, type: WidthType.DXA },
            margins: { right: 80 },
            verticalAlign: VerticalAlign.CENTER,
            borders: noBorder(),
          }),
          new TableCell({
            children: [new Paragraph({ children: [], spacing: { after: 0 } })],
            width: { size: filled, type: WidthType.DXA },
            shading: { fill: color, type: ShadingType.CLEAR },
            borders: noBorder(),
          }),
          ...(empty > 0 ? [new TableCell({
            children: [new Paragraph({ children: [], spacing: { after: 0 } })],
            width: { size: empty, type: WidthType.DXA },
            shading: { fill: 'E8E8E8', type: ShadingType.CLEAR },
            borders: noBorder(),
          })] : []),
          new TableCell({
            children: [new Paragraph({ children: [Rb(value + unit, { size: 18, color })], spacing: { after: 0 }, alignment: AlignmentType.RIGHT })],
            width: { size: 1200, type: WidthType.DXA },
            margins: { left: 80 },
            verticalAlign: VerticalAlign.CENTER,
            borders: noBorder(),
          }),
        ]});
      }),
    }),
    ...(caption ? [new Paragraph({
      children: [R(caption, { size: 16, color: C.mid, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 160 },
    })] : [...sp(1)]),
  ];
}

// ─── Image block ─────────────────────────────────────────────────────────────
function imgBlock(path, caption, pxW = 680, pxH = 425) {
  const data = readFileSync(path);
  return [
    new Paragraph({
      children: [new ImageRun({ data, transformation: { width: pxW, height: pxH }, type: 'jpg' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
    }),
    new Paragraph({
      children: [R(caption, { size: 17, color: C.mid, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  ];
}

// ─── Accent divider ───────────────────────────────────────────────────────────
function divider(color = C.blue) {
  return new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color, space: 4 } },
    spacing: { before: 100, after: 100 },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Table of Contents ────────────────────────────────────────────────────────
function toc() {
  const sections = [
    { num: '01', title: 'Executive Summary',                    sub: 'AI-Led Transformation of AMS' },
    { num: '02', title: 'The Transformation Imperative',        sub: 'Horizon\'s Strategic Objectives & IBM\'s Design Rationale' },
    { num: '03', title: 'CareOps360 Command Center',            sub: 'IBM\'s Executive Operations Platform for Real-Time Visibility' },
    { num: '04', title: 'AIOps & Agentic AI Operations',        sub: 'From Reactive to Autonomous, Self-Healing Operations' },
    { num: '05', title: 'Platform Modernization',               sub: 'Integration Modernization, Mainframe Migration & App Rationalization' },
    { num: '06', title: 'Quality Engineering',                  sub: 'Measurable Quality at Every Milestone' },
    { num: '07', title: 'Phased Transformation Roadmap',        sub: 'Stabilization to Autonomous Operations' },
    { num: '08', title: 'Claims & Prior Authorization',         sub: 'AI-Augmented Adjudication at Scale' },
    { num: '09', title: 'Enrollment Intelligence',              sub: 'AI-Assisted Intake and Surge Management' },
    { num: '10', title: 'Member Services & Contact Center',     sub: 'Omnichannel Engagement and Digital Deflection' },
    { num: '11', title: 'Capability Uplift & AI Readiness',     sub: 'Workforce Enablement and Automation Maturity' },
    { num: '12', title: 'Why IBM as Your Transformation Partner', sub: 'Scale, Depth, and Skin in the Game' },
    { num: '13', title: 'IBM\'s Modernization Investment with Horizon', sub: 'Digital Front Door, Mainframe & ICOE Partnership' },
    { num: '14', title: 'Next Steps & Call to Action',          sub: 'Mobilizing the Partnership' },
    { num: 'A',  title: 'Appendix A — Programme Initiative Register', sub: '60 Initiatives: Upgrade, Ticket Reduction & Transformation' },
  ];
  return [
    ...sp(2),
    new Paragraph({ children: [Rb('Table of Contents', { size: 52, color: C.navy })], spacing: { before: 240, after: 80 }, border: thinBottom(C.blue) }),
    new Paragraph({ children: [R('IBM × Horizon BCBS — AI-First Transformation Proposal, April 2026', { size: 20, color: C.mid, italics: true })], spacing: { after: 280 } }),
    ...sections.map(({ num, title, sub }) =>
      new Table({
        layout: TableLayoutType.FIXED,
        width: { size: PW, type: WidthType.DXA },
        borders: noBorder(),
        rows: [new TableRow({ children: [
          new TableCell({
            children: [new Paragraph({ children: [Rb(num, { size: 26, color: C.blue })], alignment: AlignmentType.CENTER })],
            width: { size: 600, type: WidthType.DXA },
            shading: { fill: C.fblue, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            borders: { right: { style: BorderStyle.SINGLE, size: 8, color: C.white }, top: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' } },
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [
              new Paragraph({ children: [Rb(title, { size: 22, color: C.navy })], spacing: { after: 20 } }),
              new Paragraph({ children: [R(sub, { size: 18, color: C.mid, italics: true })], spacing: { after: 0 } }),
            ],
            width: { size: 8472, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 160, right: 0 },
            borders: { bottom: { style: BorderStyle.SINGLE, size: 2, color: C.rule, space: 4 }, top: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' } },
          }),
        ]})],
      })
    ),
    pgBreak(),
  ];
}

// ─── Cover ────────────────────────────────────────────────────────────────────
function cover() {
  return [
    ...sp(2),
    // Top accent bar
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: PW, type: WidthType.DXA },
      borders: noBorder(),
      rows: [new TableRow({ children: [new TableCell({
        children: [new Paragraph({ children: [R('')], spacing: { after: 0 } })],
        shading: { fill: C.blue, type: ShadingType.CLEAR },
        width: { size: PW, type: WidthType.DXA },
        borders: noBorder(),
      })]})],
    }),
    ...sp(1),
    new Paragraph({ children: [R('AI-FIRST APPLICATION MANAGEMENT SERVICES', { size: 22, color: C.blue, bold: true, characterSpacing: 180 })], alignment: AlignmentType.LEFT, spacing: { after: 80 } }),
    new Paragraph({ children: [new TextRun({ text: 'Transforming Horizon BCBS', font: 'Calibri', bold: true, size: 72, color: C.navy })], alignment: AlignmentType.LEFT, spacing: { after: 60 } }),
    new Paragraph({ children: [new TextRun({ text: 'Into a Predictive, Self-Healing, AI-Driven Enterprise', font: 'Calibri', size: 38, color: C.mid })], alignment: AlignmentType.LEFT, spacing: { after: 360 } }),
    divider(C.blue),
    ...sp(1),
    twoCol(
      [
        new Paragraph({ children: [Rb('Submitted by:', { size: 22, color: C.mid })], spacing: { after: 80 } }),
        new Paragraph({ children: [Rb('IBM Consulting', { size: 32, color: C.navy })], spacing: { after: 40 } }),
        new Paragraph({ children: [R('Healthcare & Payer Delivery — AMS Practice', { size: 22, color: C.slate })], spacing: { after: 200 } }),
        new Paragraph({ children: [Rb('Submitted to:', { size: 22, color: C.mid })], spacing: { after: 80 } }),
        new Paragraph({ children: [Rb('Horizon Blue Cross Blue Shield of New Jersey', { size: 24, color: C.navy })], spacing: { after: 40 } }),
        new Paragraph({ children: [R('Executive Leadership & Technology Office', { size: 22, color: C.slate })], spacing: { after: 0 } }),
      ],
      [
        new Paragraph({ children: [Rb('Document Classification:', { size: 22, color: C.mid })], spacing: { after: 80 } }),
        new Paragraph({ children: [Rb('CONFIDENTIAL', { size: 26, color: C.red })], spacing: { after: 120 } }),
        new Paragraph({ children: [Rb('Date:', { size: 22, color: C.mid })], spacing: { after: 80 } }),
        new Paragraph({ children: [R('April 2026', { size: 22, color: C.slate })], spacing: { after: 120 } }),
        new Paragraph({ children: [Rb('Reference:', { size: 22, color: C.mid })], spacing: { after: 80 } }),
        new Paragraph({ children: [R('IBM-HZN-AMS-RFP-2026-CAS', { size: 22, color: C.slate })], spacing: { after: 0 } }),
      ]
    ),
    ...sp(4),
    new Paragraph({
      children: [R('Powered by IBM AIOps  ·  IBM Consulting Advantage  ·  HIPAA Compliant  ·  © 2026 IBM Corporation', { size: 17, color: C.mid, italics: true })],
      alignment: AlignmentType.CENTER,
    }),
    pgBreak(),
  ];
}

// ─── Page 1: Executive Summary ────────────────────────────────────────────────
function p1() {
  const dashImg = readFileSync('screenshots/exec-overview.jpg');
  return [
    ...secTitle('Executive Summary', 'A Strategic Proposal for AI-Led Transformation of Application Management Services'),

    callout([
      R('"IBM is not proposing a technology project — IBM is proposing a ', { size: 23, color: C.navy }),
      Rb('transformation partnership', { size: 23, color: C.blue }),
      R(' that embeds AI-driven intelligence into the operating model of Horizon BCBS, enabling a future-ready enterprise that is ', { size: 23, color: C.navy }),
      Rb('faster, smarter, and more resilient', { size: 23, color: C.blue }),
      R(' than today."', { size: 23, color: C.navy }),
    ], { bg: C.lblue, accent: C.blue }),
    ...sp(1),

    twoCol(
      [
        new Paragraph({ children: [Rb('The Moment', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('Horizon BCBS stands at a pivotal inflection point. With approximately 500 applications spanning enrollment, claims adjudication, member services, and data platforms, the organisation faces mounting pressure to modernise operations, reduce administrative burden, and deliver measurably better member and provider experiences.'),
        body('The incumbent delivery model — reactive, labour-intensive, and fragmented across towers — is no longer sufficient to meet Horizon\'s growth objectives or competitive imperatives.'),
        ch2('What IBM Proposes'),
        body('IBM proposes a structured transition from reactive application support to a predictive, self-healing, and continuously improving AI-first operating model — delivered through IBM\'s proven Assets, Assistants, and Accelerators framework, and governed through an outcome-based accountability model.'),
        ch2('Value Realization — What Will Be Monitored'),
        body('Once live, CareOps360 will surface real-time operational intelligence across all AMS towers through a single executive command centre. The following metrics will be tracked and reported continuously to Horizon leadership:'),
        blt('Active members under management and enrollment velocity'),
        blt('Claims settled volume and adjudication cycle times'),
        blt('Application availability and SLA attainment across 500+ applications'),
        blt('Automation savings — YTD and cumulative cost avoidance'),
        blt('Call Centre Average Speed of Answer and first-contact resolution'),
        blt('Incident MTTR trends and AIOps-driven deflection rates'),
        blt('Projected and realised annual AIOps savings versus committed baseline'),
        body('All metrics will be baselined at contract commencement and tracked against IBM\'s committed outcome targets on a monthly governance cadence.'),
      ],
      [
        new Paragraph({
          children: [new ImageRun({ data: dashImg, transformation: { width: 295, height: 184 }, type: 'jpg' })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 40 },
        }),
        new Paragraph({
          children: [R('Figure 1: CareOps360 Executive Dashboard — platform overview (illustrative data shown; live metrics populated upon go-live)', { size: 15, color: C.mid, italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({ children: [Rb('Five Strategic Commitments', { size: 24, color: C.navy })], spacing: { before: 80, after: 80 } }),
        blt('AI-First Operating Model — AI embedded across every layer of AMS and QA lifecycle.'),
        blt('Tech Arbitrage over Labour Arbitrage — Compressing cost through automation, not headcount.'),
        blt('Outcome-Based Delivery — Committed SLAs tied to measurable business outcomes.'),
        blt('Zero-Disruption Delivery — Risk-free phased transition protecting operational continuity.'),
        blt('Continuous Innovation Engine — Horizon Transformation Office driving sustained value beyond steady state.'),
        ...sp(1),
        infoBox('IBM\'s Scale Behind This Proposal', [
          '20,000+ AI & data practitioners globally',
          '81,000+ cloud & architecture experts',
          '40,000+ AI & analytics engagements',
          '15,000+ people across 40 global delivery centres',
          'Leader in Enterprise Software Quality & Testing',
          'Enterprise partnerships with AWS, Salesforce and IBM Technology',
          'IBM\'s client-0 success story which saved IBM ~3.4B USD',
        ], { bg: C.lblue, accent: C.blue }),
      ]
    ),
    ...sp(1),
    kpiStrip([
      { value: '~500',      label: 'Applications in Scope',         color: C.blue  },
      { value: 'Phase 0→4', label: 'Structured Delivery Roadmap',   color: C.teal  },
      { value: '24×7',      label: 'Global AIOps Coverage',         color: C.green },
      { value: 'AI-First',  label: 'Operating Model Commitment',    color: C.navy  },
    ]),
    pgBreak(),
  ];
}

// ─── Page 2: Transformation Imperative ───────────────────────────────────────
function p2() {
  return [
    ...secTitle('The Transformation Imperative', 'Understanding Horizon\'s Strategic Objectives and IBM\'s Solution Design Rationale'),

    twoCol(
      [
        new Paragraph({ children: [Rb('What Horizon Needs', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('Horizon BCBS is seeking the right strategic partner to enhance and support its Application Development, Maintenance, Data, and Testing Services — with a clear focus on AI solutions and expertise native to the Horizon environment.'),
        ch2('Service Transformation Goals'),
        blt('High-quality services delivered through AI and automation to obtain operational efficiencies.'),
        blt('Realization of a product-oriented operating model.'),
        blt('Focused automation — especially in testing and quality engineering.'),
        blt('AI tools to drive Agile application modernization across the portfolio.'),
        blt('Consultative support applying deep healthcare payer best practices.'),
        ...sp(1),
        ch2('Cost Structure Expectations'),
        body('Horizon expects structural cost reduction — not just efficiency gains. The fixed baseline model signals a clear expectation: year-over-year productivity improvements and cost takeout driven by automation and AI, not rate arbitrage.'),
      ],
      [
        new Paragraph({ children: [Rb('Factors That Shaped IBM\'s Solution', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        blt([Rb('End-to-End Integrated Delivery: ', { size: 20, color: C.blue }), R('A unified operating model across Application Maintenance, Development, Testing, and Data — reducing fragmentation and improving accountability across the full lifecycle.', { size: 20, color: C.slate })]),
        blt([Rb('AI at the Core: ', { size: 20, color: C.blue }), R('Not bolted on. AI is embedded in triage, root cause analysis, resolution, test automation, and continuous validation — from the first day of delivery.', { size: 20, color: C.slate })]),
        blt([Rb('Transition Without Disruption: ', { size: 20, color: C.blue }), R('IBM\'s phased transition approach maintains seamless service continuity while progressively modernising the underlying operating model.', { size: 20, color: C.slate })]),
        blt([Rb('Open, Elastic Architecture: ', { size: 20, color: C.blue }), R('Plug-and-play architecture allows IBM to deploy on Horizon\'s existing AWS stack or any cloud ecosystem — avoiding lock-in and enabling flexibility.', { size: 20, color: C.slate })]),
        ...sp(1),
        callout(
          [R('IBM\'s solution shifts Horizon from ', { size: 20, color: C.slate }), Rb('reactive incident management', { size: 20, color: C.blue }), R(' to ', { size: 20, color: C.slate }), Rb('predictive, autonomous operations', { size: 20, color: C.navy })],
          { bg: C.lteal, accent: C.teal, center: false }
        ),
      ]
    ),
    ...sp(1),

    ...barChart(
      'Figure 2: Estimated Baseline Automation Coverage — Current State by AMS Domain',
      [
        { label: 'Incident Triage',       value: 45, color: C.mid },
        { label: 'Test Execution',        value: 38, color: C.mid },
        { label: 'Root Cause Analysis',   value: 22, color: C.mid },
        { label: 'Change Risk Scoring',   value: 18, color: C.mid },
        { label: 'Deployment Validation', value: 15, color: C.mid },
      ],
      '%',
      'Estimated baseline automation coverage — current state. IBM\'s proposal targets 80%+ across all domains within 12 months.'
    ),
    ...sp(1),

    new Paragraph({ children: [Rb('Current State vs. IBM Target — Key Operational Metrics', { size: 22, color: C.navy })], spacing: { before: 120, after: 100 }, border: { left: { style: BorderStyle.SINGLE, size: 20, color: C.blue, space: 8 } }, indent: { left: 120 } }),
    dataTable(
      ['Operational Metric', 'Estimated Current State', 'IBM 12-Month Target', 'Direction'],
      [
        ['Test Automation Coverage',       '~25%',           '80%+',                  '↑ +3x'],
        ['MTTR (Mean Time to Resolve)',     '> 4 hours',      '< 1.8 hours',           '↓ 55%'],
        ['Defect Escape to Production',     'High / Untracked','65% Reduction',        '↓ Best-in-class'],
        ['Incident P3/P4 Auto-Resolution',  '< 10%',          '> 74%',                 '↑ 7x'],
        ['Regression Cycle Time',           'Multi-day manual','70% Faster',           '↓ Automated'],
        ['Alert Noise per Shift',           'Unfiltered high', '> 60% Reduced',        '↓ AI-filtered'],
        ['Enrollment Error Ticket Rate',    'High / Reactive', '~110 tickets/mo saved','↓ Zero-touch'],
        ['Prior Auth Avg Review Hours',     '>72 hours',       'Target: <24 hours',    '↓ AI-assisted'],
        ['System Availability (AMS)',       '~99.7%',          '99.95%',               '↑ AI-ops'],
      ],
      [2700, 2000, 2100, 2272],
      { greenValues: ['↑ +3x', '↓ 55%', '↓ Best-in-class', '↑ 7x', '↓ Automated', '↓ AI-filtered', '↓ Zero-touch', '↓ AI-assisted', '↑ AI-ops'] }
    ),
    ...sp(1),
    new Paragraph({
      children: [R('All current-state estimates are directional and will be formally baselined during Phase 0 discovery. IBM\'s committed targets will be contractually agreed at programme commencement. See Appendix A for the complete 60-initiative programme portfolio.', { size: 17, color: C.mid, italics: true })],
      spacing: { after: 100 },
    }),
    pgBreak(),
  ];
}

// ─── Page 3: CareOps360 Command Center ───────────────────────────────────────
function p3() {
  return [
    ...secTitle('CareOps360 Command Center', 'IBM\'s Executive Operations Platform for Real-Time AMS Visibility at Horizon'),

    twoCol(
      [
        new Paragraph({ children: [Rb('What Is CareOps360?', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('CareOps360 is IBM\'s production-grade executive operations platform purpose-built for the Horizon BCBS engagement. It delivers real-time operational intelligence across all AMS towers — enrollment, claims, applications, infrastructure, and quality — through a single, unified command centre accessible to Horizon\'s executive and operational leadership. The platform is architecture-ready for live production data and is currently deployed in a production-equivalent environment.'),
        body('Built on IBM\'s AIOps observability framework, CareOps360 surfaces predictive insights, SLA performance, enrollment intelligence, digital front door metrics, and transformation roadmap progress — eliminating the need for manual reporting aggregation.'),
        ch2('Dashboards Delivered'),
        blt('Executive Overview — Cross-tower operational pulse with 8 real-time KPI tiles.'),
        blt('Application Health — 500+ app inventory, incident register, availability trends.'),
        blt('Claims Operations — Daily volume, adjudication queue, denial analytics.'),
        blt('Prior Authorization — Backlog, review SLA, procedure-level approval rates.'),
        blt('Enrollment Intelligence — AI-assisted intake, pipeline health, surge detection.'),
        blt('Member Services — Contact centre, chatbot containment, digital adoption.'),
        blt('IBM AIOps Value — Automation savings, shift-left rate, self-heal event tracking.'),
        blt('Transformation Roadmap — 60-initiative portfolio with phase and risk status.'),
        blt('Capability Uplift — Workforce certification, automation coverage, AI readiness.'),
      ],
      [
        new Paragraph({ children: [Rb('Metrics Monitored via CareOps360', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        dataTable(
          ['Metric Domain', 'What Will Be Tracked'],
          [
            ['Application Ops',      'Availability, MTTR, incident volume by severity'],
            ['Claims',               'Volume, adjudication rate, TAT, denial drivers'],
            ['Prior Auth',           'Backlog, review SLA, auto-approval rate'],
            ['Enrollment',           'Time-to-good, auto-match rate, queue health'],
            ['Member Services',      'ASA, FCR, chatbot containment, digital adoption'],
            ['AIOps Value',          'Savings YTD, shift-left rate, self-heal events'],
            ['Transformation',       'Phase progress, milestone risk, initiative velocity'],
          ],
          [2400, 4560]
        ),
        ...sp(1),
        infoBox('Access & Security', [
          'Role-based access: IBM and Horizon executives',
          'Token-authenticated sessions with inactivity timeout',
          'HIPAA-compliant — no PHI data in the command center',
          'Architecture-ready for production data integration',
        ], { bg: C.lgray, accent: C.navy }),
        ...sp(1),
        infoBox('Portal Credentials (Demo Environment)', [
          'URL: See Replit preview — /dashboard',
          'Horizon Executive: exec@horizon.com',
          'IBM Executive: ibm@horizon.com',
          'Password: Horizon&IBM2026',
          'Note: Demo mode only — no live PHI or production data',
        ], { bg: C.fblue, accent: C.blue }),
      ]
    ),
    ...sp(1),

    ...imgBlock(
      'screenshots/exec-overview.jpg',
      'Figure 2: CareOps360 Executive Overview — eight operational KPIs spanning members, claims, prior auth, infrastructure, SLA, and automation savings. Platform shown in production-equivalent environment; metrics are illustrative.',
      680, 425
    ),
    pgBreak(),
  ];
}

// ─── Page 4 (Second-to-Last): Modernization Investment Partnership ─────────────
function p4() {
  return [
    ...secTitle('IBM\'s Modernization Investment with Horizon', 'Co-Investing in Digital Front Door, Quote to Cart, Mainframe Modernization, and ICOE — As a True Partnership'),

    callout([
      R('"IBM will ', { size: 23, color: C.navy }),
      Rb('invest alongside Horizon', { size: 23, color: C.blue }),
      R(' in the modernization programs that define the next decade of Horizon\'s competitiveness. These are not service-delivery engagements — they are ', { size: 23, color: C.navy }),
      Rb('strategic co-investments', { size: 23, color: C.blue }),
      R(' where IBM brings capital, capability, and commitment to shared outcomes."', { size: 23, color: C.navy }),
    ], { bg: C.lblue, accent: C.blue }),
    ...sp(1),

    twoCol(
      [
        new Paragraph({ children: [Rb('Digital Front Door — IBM as Co-Builder', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('The Digital Front Door is Horizon\'s most visible member-facing transformation programme. IBM will not merely provide delivery resources — IBM will co-design, co-build, and co-operate the unified digital engagement layer that gives Horizon members a seamless, AI-enhanced experience from plan discovery through care navigation.'),
        body('This is a programme where IBM brings its healthcare digital accelerators, member experience design patterns, and proven BCBS digital transformation playbook — reducing time to market, compressing risk, and ensuring Horizon is not starting from a blank page.'),
        ch2('Quote to Cart — Compressing the Purchase Cycle'),
        body('Quote to Cart is Horizon\'s highest near-term ROI digital initiative. IBM will co-invest in the design and delivery of a fully digital plan comparison, selection, and payment flow that enables prospective and renewing members to transact entirely within a digital channel — compressing the sales cycle from days to minutes and directly reducing broker dependency for straightforward purchases.'),
        ch2('DFD Programme Roadmap'),
        dataTable(
          ['Phase', 'Focus Area', 'Status'],
          [
            ['Phase 1', 'Digital Identity & Member Portal',   'Complete'],
            ['Phase 2', 'Online Enrollment & Self-Service',   'In Progress'],
            ['Phase 3', 'Quote to Cart & Payment Rails',      'In Progress'],
            ['Phase 4', 'AI Personalisation Engine',          'Q3 2026'],
            ['Phase 5', 'Autonomous Member CX',               '2027'],
          ],
          [1100, 3400, 1800],
          { greenValues: ['Complete'] }
        ),
      ],
      [
        new Paragraph({ children: [Rb('Mainframe Modernization — IBM as a Partner with AWS', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('Horizon\'s mainframe infrastructure is mission-critical — hosting eligibility processing, claims engine logic, financial settlement, and benefit adjudication. IBM understands that modernizing this estate is not merely a technical programme — it is a strategic risk management exercise that must be executed with surgical precision.'),
        body('IBM proposes a phased, parallel-run migration approach — wrapping mainframe workloads with modern APIs before cloud rehosting, running parallel environments until transaction equivalence is validated, and only cutting over when all stakeholders have confidence. IBM brings AI-assisted COBOL-to-Java conversion tooling that compresses the code conversion timeline by 40–60% compared to manual approaches.'),
        ch2('ICOE Modernization — IBM as Architecture Partner'),
        body('The Integration Centre of Excellence Modernization is IBM\'s commitment to restructure the delivery organisation to match Horizon\'s evolving platform landscape. This means product-centric engineering squads, DevSecOps pipelines, API management simplification, and observability-first SRE practices — all delivered as a sustained organisational evolution, not a one-time project.'),
        ...sp(1),
        callout(
          [Rb('IBM\'s commitment: ', { size: 21, color: C.navy }), R('Every modernization investment IBM makes at Horizon compounds Horizon\'s long-term competitive capability — not IBM\'s dependency. The goal is a Horizon that operates better, faster, and smarter with every programme completed.', { size: 21, color: C.slate })],
          { bg: C.lgreen, accent: C.green, center: false }
        ),
      ]
    ),
    ...sp(1),
    kpiStrip([
      { value: 'ICA + AIOps', label: 'AI-Infused Delivery',       color: C.blue  },
      { value: '60+',         label: 'Modernization Initiatives',  color: C.navy  },
      { value: 'Zero',        label: 'Disruption Commitment',      color: C.green },
    ]),
    pgBreak(),
  ];
}

// ─── Page 5: AIOps & Agentic AI ──────────────────────────────────────────────
function p5() {
  return [
    ...secTitle('AIOps & Agentic AI Operations', 'From Reactive Incident Management to Autonomous, Self-Healing Operations'),

    callout(
      [R('IBM\'s Agentic AI framework shifts Horizon from ', { size: 22, color: C.slate }), Rb('reactive incident handling', { size: 22, color: C.blue }), R(' to ', { size: 22, color: C.slate }), Rb('proactive, AI-driven real-time diagnosis and autonomous resolution', { size: 22, color: C.navy })],
      { bg: C.lblue, accent: C.blue, center: false }
    ),
    ...sp(1),

    twoCol(
      [
        new Paragraph({ children: [Rb('The Agentic AI Architecture', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('IBM\'s AIOps framework is built on a multi-agent architecture where specialised AI agents handle distinct responsibilities across the incident lifecycle — from detection through resolution and continuous learning.'),
        ch2('Agent Roles'),
        blt([Rb('Help Desk Agent: ', { size: 20, color: C.blue }), R('Delivers context-aware guidance and automated actions to help users auto-resolve issues before ticket creation.', { size: 20, color: C.slate })]),
        blt([Rb('Triage Agent: ', { size: 20, color: C.blue }), R('Prioritises tickets based on impact, urgency, and historical patterns — eliminating manual queue management.', { size: 20, color: C.slate })]),
        blt([Rb('Root Cause Analysis Agent: ', { size: 20, color: C.blue }), R('Correlates signals across 140+ monitoring sources to identify root cause within minutes.', { size: 20, color: C.slate })]),
        blt([Rb('Resolution Agent: ', { size: 20, color: C.blue }), R('Suggests or executes remediation steps based on runbooks and past resolutions.', { size: 20, color: C.slate })]),
        blt([Rb('Runbook Generation Agent: ', { size: 20, color: C.blue }), R('Auto-generates and updates runbooks from resolved incidents — compounding operational knowledge over time.', { size: 20, color: C.slate })]),
        blt([Rb('Continuous Learning Agent: ', { size: 20, color: C.blue }), R('Feeds production telemetry back into all agents, ensuring progressive improvement with every incident cycle.', { size: 20, color: C.slate })]),
      ],
      [
        new Paragraph({ children: [Rb('Value Realization', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        dataTable(
          ['Metric', 'With AIOps'],
          [
            ['MTTR (Mean Time to Resolve)', '< 1.8 hrs'],
            ['Alert Noise per Shift',       '> 60% Reduced'],
            ['P3/P4 Auto-Resolution',       '> 74%'],
            ['Change Failure Rate',         '40% Reduction'],
            ['System Availability',         '99.95%'],
            ['Ops Manual Triage Hours',     '~30% Reduction'],
          ],
          [4000, 2960]
        ),
        ...sp(1),
        ch2('Built for Horizon\'s AWS Stack', C.navy),
        blt('Agent Layer: AWS AgentCore & Bedrock'),
        blt('Model Layer: AWS Bedrock with native Guardrails'),
        blt('Vector Store: AWS OpenSearch + PostgreSQL'),
        blt('Integrations: ServiceNow · Dynatrace · CloudWatch · OpenShift'),
        blt('IBM ContextForge for institutional knowledge management'),
        ...sp(1),
        approvalStrip([
          { icon: '✓', label: 'Horizon\'s ARB Approval Secured', sub: 'Architecture Review Board', color: C.green },
          { icon: '✓', label: 'Horizon\'s GenAI Board Approved', sub: 'Horizon GenAI Governance',  color: C.green },
        ]),
      ]
    ),
    ...sp(1),

    ...imgBlock(
      'screenshots/ibm-ams.jpg',
      'Figure 4: IBM AIOps Value Dashboard — automation savings, shift-left rate, self-heal events, and monthly cost reduction trend by driver. Metrics are illustrative; live values tracked upon go-live.',
      680, 425
    ),
    pgBreak(),
  ];
}

// ─── Page 6: Platform Modernisation ──────────────────────────────────────────
function p6() {
  return [
    ...secTitle('Platform Modernization', 'Integration Modernization, Mainframe Migration & Application Rationalization'),

    twoCol(
      [
        new Paragraph({ children: [Rb('Integration Modernization — Real-Time, Cloud-Native', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('IBM\'s Integration Modernization program transforms Horizon\'s data exchange backbone from point-to-point batch processes to a cloud-native, event-driven, real-time integration architecture — enabling claims, eligibility, provider, and member data to flow continuously across systems without overnight lag.'),
        ch2('From Batch to Real-Time Streaming'),
        blt([Rb('MOM API-First Hub (HLGN-1053): ', { size: 20, color: C.blue }), R('Transform Horizon\'s Messaging-Oriented Middleware from point-to-point topology to an API-first enterprise integration hub — enabling real-time, event-driven partner data exchange across claims, eligibility, and provider domains.', { size: 20, color: C.slate })]),
        blt([Rb('Event Streaming Architecture: ', { size: 20, color: C.blue }), R('Replace batch ETL with Apache Kafka-based event streaming on AWS MSK — delivering sub-second data freshness across enrollment, claims, and provider systems.', { size: 20, color: C.slate })]),
        blt([Rb('API Gateway Consolidation: ', { size: 20, color: C.blue }), R('Unified API gateway via AWS API Gateway + IBM API Connect — replacing 70+ point-to-point integrations with governed, observable, versioned APIs.', { size: 20, color: C.slate })]),
        blt([Rb('ODM Cloud-Native (HLGN-1054): ', { size: 20, color: C.blue }), R('Migrate IBM ODM Decision Center from on-premise to containerized cloud environment, enabling real-time business rule evaluation and business-user-configurable workflows.', { size: 20, color: C.slate })]),
        ...sp(1),
        ch2('Application Rationalisation'),
        body('IBM will conduct a structured assessment of Horizon\'s ~500 application portfolio using Texture and other IBM assets and accelerators like ICCA — identifying candidates for decommission, consolidation, cloud migration, or AI-augmented modernization.'),
      ],
      [
        new Paragraph({ children: [Rb('Mainframe Modernization Roadmap', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('Horizon\'s mainframe hosts critical batch processing, eligibility logic, and financial settlement. IBM\'s strategy executes phased migration preserving continuity:'),
        dataTable(
          ['Workstream', 'Approach', 'Timeline'],
          [
            ['Eligibility Processing', 'API-wrap → Cloud rehost',     'Q2–Q4 2026'],
            ['COBOL → Java Pilot',     'AI-assisted code conversion', 'Q3 2026'],
            ['Unified Payments',       'AWS modernisation',           'Q3 2026'],
            ['Claims Engine',          'Parallel-run cutover',        'Q1–Q2 2027'],
            ['Member Data Services',   'Event-driven migration',      'Q4 2026+'],
          ],
          [2200, 2600, 2200]
        ),
        ...sp(1),
        infoBox('Technical Debt Governance — n-1 Version Standard', [
          'IBM commits to maintaining all Horizon stacks at n-1 (one version behind latest LTS) — balancing security currency with stability',
          'Quarterly version review cadence: IBM + Horizon ARB jointly assess all frameworks, runtimes, and vendor platforms',
          'Upgrade backlog surfaced in CareOps360 Transformation Roadmap — every pending upgrade tracked with risk, owner, and deadline',
          'n-1 compliance report delivered monthly to Horizon CTO: highlights stacks at EOL risk, CVE exposure, and upgrade progress',
          'Priority-1 CVEs receive emergency patch within 72 hours regardless of n-1 cadence',
          'Rollback gates at every upgrade phase — no production cutover without parallel validation',
          '2026 Year 1: 25 platform upgrades in flight (Angular 17, .NET 8, ODM 9.2, SAP BO 4.3)',
        ], { bg: C.lgray, accent: C.navy }),
      ]
    ),
    ...sp(1),
    kpiStrip([
      { value: '~500',       label: 'Applications Assessed',     color: C.blue  },
      { value: 'COBOL→Java', label: 'AI-Assisted Conversion',    color: C.teal  },
      { value: 'n-1',        label: 'Stack Version Governance',  color: C.navy  },
      { value: 'Zero',       label: 'Disruption Commitment',     color: C.green },
    ]),
    pgBreak(),
  ];
}

// ─── Page 7: Quality Engineering ─────────────────────────────────────────────
function p7() {
  return [
    ...secTitle('Quality Engineering & AI-Augmented Development', 'Measurable Quality at Every Milestone — Improved with Every Release'),

    twoCol(
      [
        new Paragraph({ children: [Rb('Self-Improving Quality Framework', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('IBM\'s Quality Engineering model embeds measurable validation checkpoints across every stage of development and production — creating a closed-loop feedback system within the CI/CD pipeline. Production insights, defect analytics, and automation metrics continuously refine testing strategies, enabling sustained defect reduction, faster recovery, and progressive quality improvement over time.'),
        ch2('Quality Controls'),
        blt('End-to-end traceability and release readiness visibility.'),
        blt('Defect leakage, density, and stability metrics (MTTR).'),
        blt('Automation coverage with KPI-driven governance.'),
        blt('AI-driven defect insights and regression optimisation.'),
        blt('Production telemetry feeding back into test strategy.'),
        ch2('Intelligent Test Automation'),
        body('IBM\'s Generative AI capabilities enable self-generating test cases, automated test maintenance, and continuous validation integration — dramatically reducing the cost and time associated with regression testing across Horizon\'s complex, multi-system portfolio.'),
      ],
      [
        new Paragraph({ children: [Rb('AI-Augmented Development Model', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('IBM transforms Horizon\'s engineering model from a traditional project-centric approach to a modern, product-centric engineering organisation — powered by IBM Consulting Advantage accelerators and the BUILD ONCE, BENEFIT (BOB) framework of reusable enterprise assets.'),
        ch2('AI-Assisted Development'),
        blt('Generative AI tools accelerate code generation, review, documentation, and optimisation.'),
        blt('Reduces developer toil and elevates focus to high-value engineering.'),
        blt('IBM Consulting Advantage accelerators compress time-to-value.'),
        ch2('DevSecOps Integration'),
        blt('Security embedded "left" into CI/CD pipelines.'),
        blt('Automated vulnerability scanning at every stage.'),
        blt('Compliance gates and policy enforcement from commit to production.'),
        ...sp(1),
        callout(
          [Rb('Target: ', { size: 21, color: C.navy }), R('80% test automation coverage across Horizon\'s application portfolio within 12 months of full deployment.', { size: 21, color: C.slate })],
          { bg: C.lgreen, accent: C.green, center: false }
        ),
      ]
    ),
    ...sp(1),

    new Paragraph({ children: [Rb('Figure 5: Quality Engineering — Before & After IBM Transformation', { size: 21, color: C.navy })], spacing: { before: 120, after: 80 } }),
    dataTable(
      ['Quality Metric', 'Current State', '6-Month Target', '12-Month Target', 'Method'],
      [
        ['Test Automation Coverage',    '~25%',           '55%',            '80%+',           'GenAI self-generating tests'],
        ['Defect Escape to Production', 'High / tracked manually', '40% reduction', '65% reduction', 'AI defect prediction'],
        ['Regression Cycle Time',       'Multi-day manual', '50% faster',   '70% faster',     'Intelligent test selection'],
        ['Mean Time to Detect (MTTD)',  '> 2 hours',       '< 30 min',      '< 15 min',       'AIOps + telemetry feedback'],
        ['AI-Generated Test Cases',     '< 5%',            '40%+',          '> 70%',          'IBM Consulting Advantage'],
        ['Test Maintenance Effort',     'High manual rework','30% reduction','55% reduction',  'Self-healing test scripts'],
        ['Production Incident Rate',    'Baseline',        '20% reduction', '40% reduction',  'Shift-left quality gates'],
        ['Critical Defect Leakage',     'Measured quarterly','Monthly SLA',  'Zero-leakage SLA','End-to-end traceability'],
        ['Release Confidence Score',    'Not measured',    'Tracked',       '> 90% green',    'CareOps360 quality tile'],
      ],
      [2400, 1600, 1600, 1700, 1772],
      { greenValues: ['80%+', '65% reduction', '70% faster', '< 15 min', '> 70%', '55% reduction', '40% reduction', 'Zero-leakage SLA', '> 90% green'] }
    ),
    new Paragraph({
      children: [R('Figure 5: IBM Quality Engineering targets across Horizon\'s AMS portfolio — current state vs. 6- and 12-month programme milestones. All targets will be formally baselined and committed at contract commencement.', { size: 16, color: C.mid, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 200 },
    }),
    pgBreak(),
  ];
}

// ─── Page 8: Transformation Roadmap ──────────────────────────────────────────
function p8() {
  return [
    ...secTitle('Phased Transformation Roadmap', 'A Structured, Compounding Journey from Stabilization to Autonomous Operations'),

    body('IBM\'s proposed transformation follows a structured, phased approach — delivering quick wins in the immediate term while building the foundation for long-term enterprise transformation. Each phase builds on the last, compounding value across the portfolio.'),
    ...sp(1),

    roadmap([
      { phase: 'Phase 0 — Foundation', time: '0–8 Weeks',   items: ['Command Center assessment & blueprint', 'ICOE architecture definition', 'Quote to Cart KPI alignment roadmap', 'AIOps baseline measurement', 'Risk-free transition planning'] },
      { phase: 'Phase 1 — Ignite',     time: '1–3 Months',  items: ['Integration Simplification & ICOE Modernization Roadmap', 'Document Generation modernization (HLGS)', 'Initial AIOps and monitoring deployment', 'Test automation framework initiation', 'Innovation Council formation'] },
      { phase: 'Phase 2 — Scale',      time: '3–6 Months',  items: ['Unified Payments & Mainframe modernization', 'COBOL → Java modernization pilot', 'AI-assisted Dev + Intelligent QA rollout', 'Digital Front Door Phase 2–3 delivery', 'Agentic AI incident triage live'] },
      { phase: 'Phase 3 — Optimise',   time: '6–12 Months', items: ['Agentic AI for full incident autonomy', 'Quote to Cart full production launch', 'Claims adjudication parallel-run initiated', 'GenAI development lifecycle integrated', 'Predictive capacity management live'] },
    ]),
    ...sp(1),

    twoCol(
      [
        ch2('Phase 4 — Transform (12–24 Months)', C.navy),
        blt('Full autonomous operations for P3/P4 incidents.'),
        blt('Mainframe eligibility processing on AWS — production.'),
        blt('AI personalization engine live (DFD Phase 4).'),
        blt('COBOL → Java migration complete for pilot workstream.'),
        blt('Enterprise-wide observability platform fully deployed.'),
        blt('Claims adjudication cutover initiated.'),
        ...sp(1),
        ch2('Roadmap Metrics Tracked in CareOps360', C.navy),
        blt('Total initiatives in portfolio: 60 across 4 domains (Payer, Clinical, Digital, Enterprise).'),
        blt('Active / In-Flight initiatives tracked against quarterly milestones.'),
        blt('At-risk initiatives flagged for executive escalation within 48 hours.'),
        blt('Dependency maps surfaced to prevent cascade delays.'),
      ],
      [
        ch2('Governance at Every Phase', C.navy),
        blt('Executive Steering Committee: Quarterly IBM VP + Horizon CIO/COO review.'),
        blt('Programme Management Office: Monthly health reporting and risk register.'),
        blt('Delivery Operations Reviews: Bi-weekly SLA and incident trends.'),
        blt('Financial Governance: Monthly actuals vs. committed model.'),
        blt('Innovation Council: Quarterly idea pipeline and prioritisation.'),
        ...sp(1),
        infoBox('Transformation Portfolio at a Glance', [
          '60 total initiatives across 3 delivery years',
          '25 Year 1 initiatives — Technical Debt, Digital, Payer',
          '15 Active / In-Flight as of programme launch',
          '9 Completed milestones in foundation phase',
          '2 At-Risk initiatives under executive monitoring',
        ], { bg: C.lblue, accent: C.blue }),
      ]
    ),
    ...sp(1),
    ...imgBlock(
      'screenshots/transformation-roadmap.jpg',
      'Figure 5: CareOps360 Transformation Roadmap — 60-initiative portfolio tracked by type, domain, phase, and risk status. Live milestone and dependency tracking available on go-live.',
      680, 425
    ),
    pgBreak(),
  ];
}

// ─── Page 9a: Claims & Prior Authorization ────────────────────────────────────
function pClaims() {
  return [
    ...secTitle('Claims & Prior Authorization Operations', 'AI-Augmented Adjudication, Backlog Management, and Denial Reduction at Scale'),

    callout(
      [R('Claims and prior authorization are among Horizon\'s highest-volume, highest-risk operational domains. IBM embeds AI-driven intelligence to ', { size: 22, color: C.slate }), Rb('accelerate adjudication, reduce denials, and eliminate manual backlog management', { size: 22, color: C.navy }), R(' — at enterprise scale.', { size: 22, color: C.slate })],
      { bg: C.lblue, accent: C.blue, center: false }
    ),
    ...sp(1),

    twoCol(
      [
        new Paragraph({ children: [Rb('Claims Operations Intelligence', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('IBM\'s CareOps360 platform surfaces real-time visibility into the claims lifecycle — from receipt through adjudication, settlement, and denial management. Operational leads and executives can identify queue bottlenecks, denial spikes, and auto-adjudication performance degradation in real time, without waiting for next-day reporting.'),
        ch2('What IBM Will Deliver'),
        blt('AI-enhanced auto-adjudication rules engine — reducing manual adjudication rates from baseline.'),
        blt('Denial pattern analytics — identifying root causes across procedure, eligibility, and coordination of benefits failure modes.'),
        blt('Real-time claims dashboard: volume by line of business, TAT trending, denial driver breakdown.'),
        blt('SLA-bound adjudication commitments: average turnaround time reduction target to be agreed at contract.'),
        ch2('Claims Metrics That Will Be Tracked'),
        blt('Claims received daily — volume trend and year-over-year comparison.'),
        blt('Claims in adjudication — queue depth and aging by payer class.'),
        blt('Auto-adjudication rate — target improvement trajectory over programme life.'),
        blt('Denial rate by denial code — top-5 denial reasons tracked monthly.'),
        blt('Average turnaround days — actuals vs. SLA commitment.'),
      ],
      [
        new Paragraph({ children: [Rb('Prior Authorization: AI-Assisted Review', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('Prior authorization is a significant operational and member experience pressure point. Horizon\'s current backlog and review cycle times create friction for providers and members alike. IBM will deploy AI-assisted review tooling to triage and prioritise requests, identify auto-approvable cases, and flag clinically complex cases for expedited human review.'),
        ch2('Prior Auth Metrics That Will Be Tracked'),
        dataTable(
          ['Metric', 'Target Direction'],
          [
            ['Requests Received Daily',        'Trend monitored weekly'],
            ['Average Review Hours',           'Reduction target (baseline to agreed)'],
            ['Urgent Request SLA',             '100% within 72-hr regulatory SLA'],
            ['Backlog Size',                   'Reduction tracked monthly'],
            ['Auto-Approval Rate (low-risk)',   'Increase target: >40% by Month 12'],
            ['Top Procedure Approval Rates',   'Category-level variance monitoring'],
          ],
          [3000, 3960]
        ),
        ...sp(1),
        callout(
          [Rb('Target: ', { size: 21, color: C.navy }), R('100% of urgent prior auth requests resolved within regulatory SLA. AI-assisted triage to reduce average review time by 30%+ within 12 months.', { size: 21, color: C.slate })],
          { bg: C.lgreen, accent: C.green, center: false }
        ),
      ]
    ),
    ...sp(1),
    ...imgBlock(
      'screenshots/claims.jpg',
      'Figure 6: CareOps360 Claims Operations Dashboard — daily volume, adjudication queue, settlement metrics, auto-adjudication rate, and top denial reasons. Illustrative data shown; live metrics populated on go-live.',
      680, 425
    ),
    pgBreak(),
  ];
}

// ─── Page 9b: Enrollment Intelligence ─────────────────────────────────────────
function pEnrollment() {
  return [
    ...secTitle('Enrollment Intelligence & AI-Assisted Intake', 'From Manual Queue Management to Autonomous, Predictive Enrollment Operations'),

    twoCol(
      [
        new Paragraph({ children: [Rb('The Enrollment Challenge at Horizon', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('Horizon\'s enrollment pipeline processes tens of thousands of records across individual, group, and government segments — with high volumes during open enrollment periods creating significant operational risk. Manual validation, eligibility matching, and exception handling consume substantial operational capacity and introduce SLA risk when not actively monitored.'),
        body('IBM\'s Enrollment Intelligence solution transforms this from a reactive, queue-management function into a proactive, AI-augmented enrollment operations capability — with real-time visibility into pipeline health, SLA compliance, and AI remediation rates.'),
        ch2('What IBM Will Deliver'),
        blt('End-to-end enrollment pipeline monitoring: intake, validation, AI remediation, and syndication.'),
        blt('Auto-match rate improvement: AI-assisted eligibility matching reduces manual intervention volumes.'),
        blt('Surge detection and capacity modelling: predictive alerts for open enrollment demand spikes.'),
        blt('SLA breach alerting: real-time flag when queue health degrades beyond threshold.'),
        blt('Compliance & audit trail: full record-level traceability for regulatory examination.'),
        ch2('Enrollment Metrics That Will Be Tracked'),
        blt('Time-to-good (intake to validated record) — reduction target agreed at contract baseline.'),
        blt('Auto-match rate — AI eligibility matching accuracy, tracked monthly.'),
        blt('Manual intervention rate — percentage of records requiring human review.'),
        blt('Records in queue — real-time queue depth with aging breakdown.'),
        blt('SLA compliance rate — percentage of records processed within agreed SLA.'),
        blt('Failed records — hard failure volume and root cause trend.'),
      ],
      [
        new Paragraph({ children: [Rb('Enrollment Intelligence Hub', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('CareOps360\'s Enrollment Intelligence Hub provides a unified, multi-tab view of the enrollment lifecycle — from Operations Overview and Intake & Validation through to AI Remediation, Syndication, Reconciliation, and Compliance & Audit. The hub includes an embedded Operations Copilot for real-time queue health summaries and priority recommendations.'),
        dataTable(
          ['Hub Tab', 'Purpose'],
          [
            ['Overview',           'Pipeline health, KPI summary, SLA status'],
            ['Intake & Validation', 'Record-level validation status and error patterns'],
            ['AI Remediation',     'Auto-fix rate, remediation type breakdown'],
            ['Operations Command', 'Queue management and intervention workflow'],
            ['Syndication',        'Downstream system feed status and reconciliation'],
            ['Compliance & Audit', 'Regulatory traceability and exception log'],
          ],
          [2400, 4560]
        ),
        ...sp(1),
        infoBox('Surge Protection', [
          'Predictive surge detection alerts leadership ahead',
          'Capacity modelling integrated with workforce planning',
          'Auto-escalation on queue depth threshold breach',
          'Open enrollment operational command centre built in',
        ], { bg: C.lteal, accent: C.teal }),
      ]
    ),
    ...sp(1),
    ...imgBlock(
      'screenshots/enrollment.jpg',
      'Figure 7: CareOps360 Enrollment Intelligence Hub — pipeline health KPIs, auto-match rate, manual intervention tracking, queue depth, and AI Remediation overview. Illustrative data; live metrics upon go-live.',
      680, 425
    ),
    pgBreak(),
  ];
}

// ─── Page 9c: Member Services & Contact Center ────────────────────────────────
function pContact() {
  return [
    ...secTitle('Member Services & Contact Center Intelligence', 'Reducing Contact Volume, Elevating Digital Experience, and Measuring Every Interaction'),

    callout(
      [R('IBM\'s approach to member services transforms the contact centre from a cost centre to a ', { size: 22, color: C.slate }), Rb('digital engagement command post', { size: 22, color: C.navy }), R(' — where AI containment, self-service, and agent augmentation work together to reduce call volume, improve FCR, and increase member satisfaction.', { size: 22, color: C.slate })],
      { bg: C.lteal, accent: C.teal, center: false }
    ),
    ...sp(1),

    twoCol(
      [
        new Paragraph({ children: [Rb('The Member Experience Opportunity', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('Contact centre performance is a direct signal of operational quality across the enterprise. High call volumes, elevated abandonment rates, and low first-call resolution typically reflect process failures upstream — in enrollment, claims, prior auth, and provider services — that force members to call. IBM addresses this systemically, not just at the contact centre surface.'),
        ch2('What IBM Will Deliver'),
        blt('AI-powered chatbot and IVR containment: increasing self-service resolution to reduce agent handle time.'),
        blt('Agent Assist tooling: surfacing relevant member context, prior interactions, and suggested resolution paths in real time.'),
        blt('Digital adoption acceleration: driving members to portal and mobile for routine transactions.'),
        blt('Contact reason analytics: identifying and feeding back upstream root causes driving call volume.'),
        blt('FCR improvement programme: structured analysis of repeat contacts and intervention design.'),
        ch2('Member Services Metrics That Will Be Tracked'),
        blt('Calls received daily — volume trend and driver breakdown by call reason.'),
        blt('Average Speed of Answer (ASA) — target reduction from baseline.'),
        blt('Abandonment rate — threshold monitored in real time.'),
        blt('First Call Resolution (FCR) — target improvement trajectory.'),
        blt('Chatbot containment rate — self-service automation coverage.'),
        blt('Digital adoption rate — percentage of members using digital channels for routine transactions.'),
      ],
      [
        new Paragraph({ children: [Rb('Contact Center KPI Targets', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        dataTable(
          ['Metric', 'Target Direction'],
          [
            ['Avg Speed of Answer',       'Reduction from baseline (target at contract)'],
            ['First Call Resolution',     'Improvement target: +8–12 pts vs. baseline'],
            ['Abandonment Rate',          'Reduction target: <5% at steady state'],
            ['Chatbot Containment',       'Target: >60% by Month 18'],
            ['Digital Adoption',          'Target: >50% of routine transactions digital'],
            ['Member Complaints Volume',  'Monthly trend tracked; trigger threshold set'],
          ],
          [3000, 3960]
        ),
        ...sp(1),
        ch2('Digital Channel Strategy', C.navy),
        body('IBM\'s Digital Front Door investment directly reduces contact volume by enabling members to complete plan comparison, enrollment changes, claims status lookup, prior auth status, and ID card requests entirely within digital channels — reducing broker and call-centre dependency for Horizon\'s most frequent transaction types.'),
        ...sp(1),
        infoBox('Contact Reason Feedback Loop', [
          'Top call reasons surfaced daily in CareOps360',
          'Root cause analysis drives upstream process fixes',
          'Agent Assist reduces handle time per contact',
          'Monthly member satisfaction trend tracked',
        ], { bg: C.lgray, accent: C.navy }),
      ]
    ),
    ...sp(1),
    ...imgBlock(
      'screenshots/contact-center.jpg',
      'Figure 8: CareOps360 Member Services Dashboard — calls, ASA, abandonment rate, FCR, chatbot containment, digital adoption, and top call reasons by category. Illustrative data; live metrics upon go-live.',
      680, 425
    ),
    pgBreak(),
  ];
}

// ─── Page 9d: Capability Uplift & AI Readiness ───────────────────────────────
function pCapability() {
  return [
    ...secTitle('Capability Uplift & AI Readiness', 'How IBM\'s Delivery Capability Directly Enables Horizon\'s Transformation Outcomes'),

    twoCol(
      [
        new Paragraph({ children: [Rb('A Workforce Built for AI-First Delivery', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('IBM\'s transformation proposal is backed by a deeply credentialled, continuously upskilling delivery team that brings AI and automation expertise directly into Horizon\'s operating environment. Capability investment is not a separate training programme — it is embedded into every phase of delivery, with certifications, automation coverage, and AI-readiness metrics tracked in CareOps360.'),
        body('IBM is evolving the Horizon delivery model from traditional operations to AI-augmented and autonomous operations. Certified AI and ML resources are expanding significantly, automation coverage is scaling across all workflows, and delivery staff are being redeployed from manual tasks to higher-value advisory and engineering roles — directly enabling measurable transformation outcomes.'),
        ch2('The Strategic Capability Narrative'),
        body('IBM\'s people strategy for Horizon is threefold: certify deep expertise in AI, healthcare, and IBM platforms; automate the repeatable so people focus on the complex; and redeploy freed capacity toward the strategic programmes that matter most — Digital Front Door, Quote to Cart, ICOE Modernization, and Mainframe Modernization.'),
        ch2('Capability Metrics That Will Be Tracked'),
        blt('Total certified professionals on the Horizon engagement — headcount and credential breakdown.'),
        blt('AI/ML certifications: target growth trajectory month-over-month.'),
        blt('Automation coverage: percentage of delivery processes with automation applied.'),
        blt('Workforce AI-enabled percentage: share of team using AI tooling in daily delivery.'),
        blt('FTE productivity gain: reduction in manual effort per unit of delivery output.'),
        blt('Auto-remediation readiness: target capability milestone for self-healing operations.'),
      ],
      [
        new Paragraph({ children: [Rb('Capability Dashboard', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        dataTable(
          ['Capability Area', 'Metric Tracked', 'Target'],
          [
            ['AI / ML Certifications',    'Certified professionals',    'Growth to plan'],
            ['Planned Certifications',    'Next 6–12 month pipeline',   'Headcount target'],
            ['Workforce AI-Enabled',      '% using AI daily',           '78% by Month 12'],
            ['Automation Coverage',       '% processes automated',      '91% by Month 12'],
            ['FTE Productivity Gain',     'Manual effort eliminated',   'Target agreed'],
            ['Auto-Remediation Ready',    'Self-heal milestone',        'Achieved Month 6'],
          ],
          [2400, 2400, 2160]
        ),
        ...sp(1),
        infoBox('IBM Certification Domains at Horizon', [
          'AI / Machine Learning — model deployment, AIOps, LLM operations',
          'Healthcare & Payer — BCBS models, CMS compliance, HIPAA',
          'IBM Platform — consulting advantage, cloud architecture, hybrid cloud',
          'Cloud Engineering — AWS, OpenShift, DevSecOps, SRE',
        ], { bg: C.lblue, accent: C.blue }),
      ]
    ),
    ...sp(1),
    ...imgBlock(
      'screenshots/capability-uplift.jpg',
      'Figure 9: CareOps360 Capability Uplift Dashboard — certified resources, planned certifications, automation coverage, workforce AI-enablement, productivity gain, and auto-remediation readiness. Illustrative data; live metrics upon go-live.',
      680, 425
    ),
    pgBreak(),
  ];
}

// ─── Page 9: Why IBM ──────────────────────────────────────────────────────────
function p9() {
  return [
    ...secTitle('Why IBM as Your Transformation Partner', 'Scale, Depth, and Skin in the Game'),

    callout(
      [Rb('IBM is the only partner', { size: 23, color: C.navy }), R(' that brings together AI-first operating platform capability, Horizon\'s institutional knowledge, deep healthcare payer domain expertise, proven global delivery scale, and a willingness to ', { size: 23, color: C.slate }), Rb('share outcome risk', { size: 23, color: C.blue }), R(' through an outcome-based engagement model.', { size: 23, color: C.slate })],
      { bg: C.lblue, accent: C.blue, center: false }
    ),
    ...sp(1),

    twoCol(
      [
        new Paragraph({ children: [Rb('Enterprise Transformation, Not Just IT', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('IBM\'s proposal delivers unified transformation across Operations, Development, and Quality Engineering — not siloed initiatives that optimise one tower while creating drag in another.'),
        body('IBM\'s delivery philosophy — AI-Embedded Operations, Scalable Architecture, and Outcome-Based Engagement — ensures that every IBM investment compounds Horizon\'s capability, not IBM\'s margin.'),
        ch2('What Differentiates IBM'),
        blt([Rb('Skin in the game: ', { size: 20, color: C.blue }), R('Outcome-based engagement with IBM\'s full capability depth behind every phase — IBM\'s success is tied to Horizon\'s outcomes.', { size: 20, color: C.slate })]),
        blt([Rb('AI at depth, not at surface: ', { size: 20, color: C.blue }), R('IBM\'s Agentic AI, Generative AI, and AIOps capabilities are production-proven across healthcare and financial services — not proof-of-concept.', { size: 20, color: C.slate })]),
        blt([Rb('The BOB Framework: ', { size: 20, color: C.blue }), R('IBM\'s BUILD ONCE, BENEFIT reusable asset library compresses implementation time and reduces per-solution cost across the portfolio.', { size: 20, color: C.slate })]),
        blt([Rb('Innovation Council: ', { size: 20, color: C.blue }), R('IBM commits a structured quarterly innovation process — governed, prioritised, business-case-backed innovation at Horizon\'s direction.', { size: 20, color: C.slate })]),
      ],
      [
        new Paragraph({ children: [Rb('IBM\'s Global Delivery Strength', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        kpiStrip([
          { value: '20K+', label: 'AI Practitioners', color: C.blue },
          { value: '81K+', label: 'Cloud Experts',    color: C.teal },
        ]),
        ...sp(1),
        kpiStrip([
          { value: '40K+', label: 'AI Engagements',  color: C.navy  },
          { value: '15K+', label: 'Global Centres',  color: C.green },
        ]),
        ...sp(1),
        ch2('Healthcare Payer Pedigree'),
        body('IBM brings deep healthcare payer expertise — including BCBS operating models, CMS regulatory compliance, HIPAA data governance, enrollment lifecycle management, and claims adjudication platform knowledge — directly into Horizon\'s delivery team from Day 1.'),
        ...sp(1),
        infoBox('Key References', [
          'Partner of the Year 2023 — Enterprise AI delivery',
          'Leader in Enterprise Software Quality & Testing',
          'Proven BCBS engagement track record',
          'CMS & HIPAA compliance expertise',
        ], { bg: C.lblue, accent: C.blue }),
      ]
    ),
    pgBreak(),
  ];
}

// ─── Page 10: Next Steps ──────────────────────────────────────────────────────
function p10() {
  return [
    ...secTitle('Recommended Next Steps', 'From Proposal to Partnership — IBM\'s Proposed Engagement Path'),

    twoCol(
      [
        new Paragraph({ children: [Rb('Immediate Actions (2–4 Weeks)', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        blt('Schedule Executive Alignment Session — IBM VP + Horizon CIO/COO to confirm transformation vision and programme scope.'),
        blt('Conduct Command Center Walkthrough — Live demonstration of CareOps360 platform with Horizon\'s operational and technology leadership.'),
        blt('Initiate Contract Finalisation — Confirm outcome-based SLA schedule and investment model.'),
        blt('Begin Phase 0 Foundation Assessment — IBM AMS team on-site to conduct application portfolio and AIOps baseline assessment.'),
        ...sp(1),
        ch2('Phase 0 Commitments (Weeks 1–8)'),
        blt([Rb('Week 1–2: ', { size: 20, color: C.blue }), R('IBM transition team mobilised; AIOps instrumentation begins across priority applications.', { size: 20, color: C.slate })]),
        blt([Rb('Week 3–4: ', { size: 20, color: C.blue }), R('ICOE architecture definition workshop; Quote to Cart KPI alignment roadmap delivered.', { size: 20, color: C.slate })]),
        blt([Rb('Week 5–6: ', { size: 20, color: C.blue }), R('Phase 1 Ignite plan presented to Steering Committee.', { size: 20, color: C.slate })]),
        blt([Rb('Week 7–8: ', { size: 20, color: C.blue }), R('Innovation Council inaugural session — first idea pipeline scoped.', { size: 20, color: C.slate })]),
      ],
      [
        new Paragraph({ children: [Rb('What IBM Needs from Horizon', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        blt('Executive sponsorship confirmed with a named Horizon program owner.'),
        blt('Access to application inventory, current SLA performance data, and AMS tooling estate.'),
        blt('Introduction to Horizon\'s technology and operations leadership teams.'),
        blt('Agreement on data governance and security protocols for CareOps360 production integration.'),
        ...sp(1),
        callout(
          [Rb('IBM is ready to begin. ', { size: 21, color: C.navy }), R('With your confirmation, Phase 0 can mobilise within 5 business days.', { size: 21, color: C.slate })],
          { bg: C.lgreen, accent: C.green, center: false }
        ),
        ...sp(1),
        ch2('Appendix: Workforce Certification', C.mid),
        bodyS('As of April 2026, IBM\'s delivery team at Horizon carries 382 certified professionals across 4,599 certifications spanning AI/ML (307), Healthcare (342), IBM Products (338), and Cloud (250) domains. This credentialled workforce directly enables the AI-first delivery model described in this proposal.'),
      ]
    ),
    ...sp(2),

    // Closing banner
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: PW, type: WidthType.DXA },
      borders: noBorder(),
      rows: [new TableRow({ children: [new TableCell({
        children: [
          new Paragraph({ children: [Rb('A Strategic Partnership for Enterprise Transformation', { size: 28, color: C.white })], alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } }),
          new Paragraph({ children: [R('IBM is committed to Horizon\'s success — not as a vendor, but as a transformation partner with shared stakes in every outcome.', { size: 21, color: C.lblue })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
        ],
        shading: { fill: C.navy, type: ShadingType.CLEAR },
        margins: { top: 200, bottom: 200, left: 280, right: 280 },
        borders: noBorder(),
      })]})],
    }),
    ...sp(1),
    new Paragraph({
      children: [R('© 2026 IBM Corporation  ·  IBM-HZN-AMS-RFP-2026-CAS  ·  Confidential — Executive Use Only  ·  All figures based on IBM programme data and industry benchmarks.', { size: 16, color: C.mid, italics: true })],
      alignment: AlignmentType.CENTER,
    }),
  ];
}

// ─── Appendix: Programme Initiative Register ──────────────────────────────────
function appendix() {
  const AW = [900, 1100, 1700, 900, 4472]; // col widths summing to PW

  function appTable(rows) {
    return dataTable(
      ['Jira ID', 'Domain', 'Product / Application', 'Status', 'Expected Outcome'],
      rows,
      AW,
      { greenValues: ['Completed'] }
    );
  }

  function sectionHdr(label, count, color = C.blue) {
    return new Table({
      layout: TableLayoutType.FIXED,
      width: { size: PW, type: WidthType.DXA },
      borders: noBorder(),
      rows: [new TableRow({ children: [new TableCell({
        children: [new Paragraph({ children: [Rb(`${label}  (${count})`, { size: 22, color: C.white })], spacing: { before: 60, after: 60 } })],
        shading: { fill: color, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 160, right: 160 },
        borders: noBorder(),
      })]})],
    });
  }

  const upgrades = [
    ['HLGN-1001', 'Enterprise Platforms', 'IBM ODM',                    'Active',    '40% improvement in rules processing speed; AI-assisted decision support'],
    ['HLGN-1002', 'Digital',              'WAM SSO',                    'Active',    'Enhanced security posture, modern UI for 3,200+ internal users'],
    ['HLGN-1003', 'Enterprise Platforms', 'Internal Cloud Apps (×8)',   'Completed', 'Standardized Angular 17 baseline; eliminated CVE-2022-25869 vulnerability class'],
    ['HLGN-1004', 'Payer',               'Fee Schedule Repository',    'Planned',   'LTS compliance; 25% fee processing performance gain'],
    ['HLGN-1005', 'Payer',               'GroupFee Application',       'Planned',   'Shared codebase benefits; 20% lower group fee maintenance cost'],
    ['HLGN-1006', 'Enterprise Platforms', 'NAR Windows Platform',       'Completed', 'EOL server risk eliminated; security posture hardened'],
    ['HLGN-1007', 'Clinical',            'CareRadius Angular Frontend', 'Active',    'Modern UI components, improved page load, enhanced maintainability'],
    ['HLGN-1008', 'Clinical',            'CareRadius VB6 Legacy',      'Planned',   'VB6 runtime eliminated; 60% reduction in legacy-related incident tickets'],
    ['HLGN-1009', 'Clinical',            'CareRadius SAP BO',          'Active',    'Improved report performance, new visualizations, renewed vendor support'],
    ['HLGN-1010', 'Digital',             'Communication Services',     'Active',    'Enhanced member notifications, improved mobile responsiveness'],
    ['HLGN-1011', 'Enterprise Platforms', 'Doc Portal',                 'Planned',   'Modern document management; 30% improved search/retrieval performance'],
    ['HLGN-1012', 'Enterprise Platforms', 'Horizon ECM',                'Planned',   'Improved content workflow; modern security standards compliance'],
    ['HLGN-1013', 'Data & Analytics',    'Cognos BI',                  'Completed', 'AI-assisted insights, improved cloud connectivity and dashboard performance'],
    ['HLGN-1014', 'Data & Analytics',    'Tableau Analytics',          'Completed', 'Pulse AI analytics integration, improved extract performance'],
    ['HLGN-1015', 'Payer',               'Membership System',          'Active',    '50% processing time reduction; real-time eligibility verification'],
    ['HLGN-1016', 'Data & Analytics',    'MPD Mainframe Extracts',     'Planned',   'Near real-time data; batch windows reduced from 6hrs to 45min'],
    ['HLGN-1017', 'Payer',               'Route Code Eligibility',     'Planned',   'Real-time eligibility routing; reduced manual intervention'],
    ['HLGN-1018', 'Payer',               'EDI Eligibility Data Store', 'Planned',   'Expanded trading partner support; eligibility disputes reduced 25%'],
    ['HLGN-1019', 'Digital',             'Consumer Data Management',   'Planned',   'Improved self-service capabilities; modern accessibility standards (WCAG)'],
    ['HLGN-1020', 'Payer',               'Personal Representative Mgmt','Planned',  'Platform support through 2029; improved performance; security compliance'],
    ['HLGN-1021', 'Payer',               'NASCO',                      'Planned',   'Enhanced NASCO feature set; improved SLA compliance; HIPAA 2024 readiness'],
    ['HLGN-1022', 'Payer',               'Legacy Finance Platform',    'Planned',   'Unsupported .NET 3.5 eliminated; 35% improvement in financial processing'],
    ['HLGN-1023', 'Payer',               'Universal Payment System',   'Active',    'PCI DSS 4.0 compliance; improved payment reliability and audit trail'],
    ['HLGN-1024', 'Enterprise Platforms', 'Image Plus',                 'Active',    'Improved document processing speed; enhanced OCR accuracy; vendor renewal'],
    ['HLGN-1025', 'Payer',               'Financial Reporting Suite',  'Planned',   'Unified technology stack; 20% lower maintenance cost'],
  ];

  const ticketReductions = [
    ['HLGN-1026', 'Payer',              'IDR System',               'Completed',  '~120 monthly tickets eliminated; 100% automation of SSN randomization updates'],
    ['HLGN-1027', 'Payer',              'HMU',                      'Active',     '~85 monthly data discrepancy tickets eliminated via timestamp fix'],
    ['HLGN-1028', 'Payer',              'Billing Portal',           'Active',     '~200 monthly tickets reduced; 2-day SLA improvement for billing resolution'],
    ['HLGN-1029', 'Data & Analytics',   'Data Load Pipeline',       'Completed',  '60% reduction in data load anomaly tickets across 12 reporting systems'],
    ['HLGN-1030', 'Payer',              'Claims Audit Engine',      'Active',     '~150 monthly audit exception tickets eliminated via automated reconciliation'],
    ['HLGN-1031', 'Enterprise Platforms','API Management',          'Active',     '~75 monthly API support tickets reduced; improved developer self-service'],
    ['HLGN-1032', 'Enterprise Platforms','File Processing Service', 'Completed',  '~60 monthly operations tickets eliminated; 4-hour batch window reduction'],
    ['HLGN-1033', 'Digital',            'Broker Sales Portal',      'Planned',    '~90 monthly portal tickets reduced for complex subgroup configurations'],
    ['HLGN-1034', 'Payer',              'Member Enrollment System', 'Planned',    '~110 monthly enrollment error tickets reduced; 15% clean submission improvement'],
    ['HLGN-1035', 'Enterprise Platforms','ChatOps Platform',        'Planned',    '~130 monthly incident tickets consolidated; MTTR reduced by 40%'],
    ['HLGN-1036', 'Clinical',           'Authorization Integration','Active',     '~95 monthly authorization error tickets prevented via partner validation'],
    ['HLGN-1037', 'Payer',              'Member Data Hub',          'At Risk',    '~180 monthly member discrepancy tickets — MDM governance (recovery plan active)'],
    ['HLGN-1038', 'Payer',              'MPV Processing',           'Completed',  '~70 monthly reprocessing tickets eliminated; 78% reduction sustained in production'],
    ['HLGN-1039', 'Digital',            'Survey Platform',          'Planned',    '~45 monthly survey tickets proactively resolved via ELK monitoring alerts'],
    ['HLGN-1040', 'Payer',              'Membership Workflow Engine','Planned',   '~65 monthly DB update delay tickets eliminated via queue management improvements'],
    ['HLGN-1041', 'Digital',            'IVR Platform',             'Planned',    '~55 monthly IVR configuration tickets eliminated; real-time plan data in IVR'],
    ['HLGN-1042', 'Payer',              'Premium Rating Engine',    'At Risk',    '~80 monthly rating mismatch tickets — vendor data quality (recovery plan active)'],
    ['HLGN-1043', 'Payer',              'Claims Adjudication',      'Completed',  '~100 monthly escalation tickets reduced; 20% improvement in first-contact resolution'],
    ['HLGN-1044', 'Digital',            'Broker Management Portal', 'Planned',    '~90 monthly manual broker update tickets via broker self-service portal launch'],
  ];

  const transformations = [
    ['HLGN-1045', 'Payer',              'SHBS-UPS',                 'Planned',    'MS Access dependency eliminated; multi-user access; full audit trail compliance'],
    ['HLGN-1046', 'Enterprise Platforms','CareOps360',              'Active',     '90% reduction in executive reporting cycle time; real-time operational decision support'],
    ['HLGN-1047', 'Enterprise Platforms','IBM BAW',                 'Active',     '80% reduction in manual workflow handling time; full audit trail for regulated processes'],
    ['HLGN-1048', 'Payer',              'IKA',                      'Planned',    'Straight-through processing for 95% of eligibility; manual intervention near zero'],
    ['HLGN-1049', 'Payer',              'HVCPS',                    'Planned',    '99.9% payment calculation accuracy; auto-reconciliation eliminating manual review'],
    ['HLGN-1050', 'Data & Analytics',   'OnDemand',                 'Planned',    'Report delivery from 48hrs to real-time self-service; 80% IT reporting ticket reduction'],
    ['HLGN-1051', 'Digital',            'HLGS Document Generation', 'Planned',    '40% letter generation cost reduction; multi-channel delivery; real-time composition'],
    ['HLGN-1052', 'Provider',           'IPA',                      'Planned',    'Provider audit cycle 30→10 days; 60% manual effort reduction; provider satisfaction up'],
    ['HLGN-1053', 'Enterprise Platforms','MOM Integration Hub',     'Planned',    'API-first hub replacing batch; real-time event streaming; 50% integration cost reduction'],
    ['HLGN-1054', 'Enterprise Platforms','IBM ODM Cloud-Native',    'Planned',    'Business-user-configurable rules; IT rule-change tickets → zero; sub-second evaluation'],
    ['HLGN-1055', 'Payer',              'SBC Compliance Automation','Planned',    '100% ERISA/ACA SBC compliance; automated generation and distribution across all plans'],
    ['HLGN-1056', 'Digital',            'Smartcomm Cloud Platform', 'Planned',    '50% document production cost reduction; omni-channel delivery; centralized brand control'],
    ['HLGN-1057', 'Data & Analytics',   'Enterprise BI (Power BI)', 'Planned',    '40% analytics licensing cost reduction; single platform for 1,200+ business users'],
    ['HLGN-1058', 'Provider',           'CAGUI Pharmacy Crosswalk', 'Planned',    '70% manual crosswalk effort reduced; automated alignment across 15,000+ provider contracts'],
    ['HLGN-1059', 'Clinical',           'Prior Auth AI Engine',     'Planned',    '85% auto-approval rate; auth cycle 3 days→4 hours; $4.2M annual cost avoidance'],
    ['HLGN-1060', 'Digital',            'GenAI Member Engagement',  'Planned',    '25% engagement improvement; 18% care gap closure; 30% contact center deflection'],
  ];

  return [
    ...secTitle('Appendix A — Programme Initiative Register', '60 Initiatives Across Upgrade, Ticket Reduction & Transformation — April 2026 Baseline'),

    callout(
      [R('This register is sourced from the Horizon programme roadmap (April 2026). All initiatives are tracked live in CareOps360\'s Transformation Roadmap dashboard — with phase, status, owner, and risk updated in real time. See Appendix reference in Section 02.', { size: 20, color: C.slate })],
      { bg: C.fblue, accent: C.blue, center: false }
    ),
    ...sp(1),

    kpiStrip([
      { value: '25', label: 'Platform Upgrades',       color: C.blue  },
      { value: '19', label: 'Ticket Reductions',       color: C.teal  },
      { value: '16', label: 'Transformation Programmes', color: C.navy },
      { value: '60', label: 'Total Initiatives',       color: C.green },
    ]),
    ...sp(1),

    sectionHdr('Section 1 — Platform & Framework Upgrades (n-1 Compliance)', 25, C.navy),
    appTable(upgrades),
    ...sp(1),

    sectionHdr('Section 2 — Ticket Reduction Initiatives (Automation & Quality Improvement)', 19, C.teal),
    appTable(ticketReductions),
    ...sp(1),

    sectionHdr('Section 3 — Strategic Transformation Programmes', 16, C.blue),
    appTable(transformations),
    ...sp(1),

    new Paragraph({
      children: [R('Source: Horizon BCBS Programme Roadmap — horizon-roadmap-all-2026-04-10. All status, timelines, and outcomes are per April 2026 baseline. IBM committed delivery targets are formally agreed at contract commencement. At-Risk initiatives have active recovery plans in place.', { size: 16, color: C.mid, italics: true })],
      spacing: { after: 100 },
      alignment: AlignmentType.JUSTIFIED,
    }),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════════

const doc = new Document({
  title: 'IBM AI-First Transformation Proposal — Horizon BCBS',
  creator: 'IBM Consulting — Healthcare & Payer Delivery',
  sections: [{
    properties: {
      page: { margin: { top: 864, bottom: 864, left: 864, right: 864 } },
    },
    headers: {
      default: new Header({ children: [
        new Paragraph({
          children: [
            Rb('IBM × HORIZON BCBS  ', { size: 16, color: C.blue }),
            R('|  AI-FIRST TRANSFORMATION PROPOSAL  |  CONFIDENTIAL  |  APRIL 2026', { size: 16, color: C.mid }),
          ],
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.blue, space: 4 } },
          alignment: AlignmentType.RIGHT,
        }),
      ]}),
    },
    footers: {
      default: new Footer({ children: [
        new Table({
          layout: TableLayoutType.FIXED,
          width: { size: PW, type: WidthType.DXA },
          borders: noBorder(),
          rows: [new TableRow({ children: [
            new TableCell({
              children: [new Paragraph({ children: [R('© 2026 IBM Corporation  ·  Confidential  ·  IBM-HZN-AMS-RFP-2026-CAS', { size: 15, color: C.mid, italics: true })], alignment: AlignmentType.LEFT })],
              width: { size: 7200, type: WidthType.DXA },
              borders: { top: { style: BorderStyle.SINGLE, size: 4, color: C.blue, space: 4 }, bottom: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' } },
              margins: { top: 80 },
            }),
            new TableCell({
              children: [new Paragraph({
                children: [
                  R('Page ', { size: 15, color: C.mid }),
                  new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 15, color: C.navy, bold: true }),
                ],
                alignment: AlignmentType.RIGHT,
              })],
              width: { size: 1872, type: WidthType.DXA },
              borders: { top: { style: BorderStyle.SINGLE, size: 4, color: C.blue, space: 4 }, bottom: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.SINGLE, size: 0, color: 'FFFFFF' } },
              margins: { top: 80 },
            }),
          ]})],
        }),
      ]}),
    },
    children: [
      ...cover(),
      ...toc(),
      ...p1(),
      ...p2(),
      ...p3(),
      ...p5(),
      ...p6(),
      ...p7(),
      ...p8(),
      ...pClaims(),
      ...pEnrollment(),
      ...pContact(),
      ...pCapability(),
      ...p9(),
      ...p4(),
      ...p10(),
      ...appendix(),
    ],
  }],
});

const buf = await Packer.toBuffer(doc);
writeFileSync('IBM_Horizon_AI_Transformation_Proposal_Apr2026.docx', buf);
console.log('Done — white paper written.');
