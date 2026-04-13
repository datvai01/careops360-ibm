/**
 * IBM × Horizon BCBS — AI-First Transformation White Paper
 * Generated from user-approved baseline document (April 2026)
 */

import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, WidthType, BorderStyle,
  ShadingType, TableLayoutType, VerticalAlign, PageBreak,
  Header, Footer, ImageRun,
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
        blt('Zero-Disruption Transition — Risk-free phased transition protecting operational continuity.'),
        blt('Continuous Innovation Engine — Horizon Innovation Council driving sustained value beyond steady state.'),
        ...sp(1),
        infoBox('IBM\'s Scale Behind This Proposal', [
          '20,000+ AI & data practitioners globally',
          '81,000+ cloud & architecture experts',
          '40,000+ AI & analytics engagements',
          '15,000+ people across 40 global delivery centres',
          'Leader in Enterprise Software Quality & Testing',
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
        blt('AI tools to drive application modernisation across the portfolio.'),
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
      'Figure 1: Current vs. Target — Automation Coverage by Domain',
      [
        { label: 'Incident Triage',       value: 45, color: C.mid },
        { label: 'Test Execution',        value: 38, color: C.mid },
        { label: 'Root Cause Analysis',   value: 22, color: C.mid },
        { label: 'Change Risk Scoring',   value: 18, color: C.mid },
        { label: 'Deployment Validation', value: 15, color: C.mid },
      ],
      '%',
      'Estimated baseline automation coverage across AMS domains (current state). IBM\'s proposal targets 80%+ automation across all domains within 12 months.'
    ),
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
        body('CareOps360 is IBM\'s production-grade executive operations platform purpose-built for the Horizon BCBS engagement. It delivers real-time operational intelligence across all AMS towers — enrollment, applications, infrastructure, and quality — through a single, unified command centre accessible to Horizon\'s executive and operational leadership.'),
        body('Built on IBM\'s AIOps observability framework, CareOps360 surfaces predictive insights, SLA performance, enrollment intelligence, digital front door metrics, and transformation roadmap progress in real time.'),
        ch2('Key Capabilities'),
        blt('Real-time application health monitoring across 500+ applications.'),
        blt('Enrollment Intelligence dashboard with predictive surge modelling.'),
        blt('Digital Front Door programme tracking — Quote to Cart, member activation, channel metrics.'),
        blt('IBM AIOps value realisation — MTTR trends, automation coverage, incident economics.'),
        blt('Transformation Roadmap — live phase progress and milestone tracking.'),
        blt('Auto-export, session logging, and HIPAA-compliant audit trail.'),
      ],
      [
        new Paragraph({ children: [Rb('Platform Architecture', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('CareOps360 is built on a modern, cloud-native stack with real-time data polling from IBM\'s AIOps and observability layers. It features:'),
        blt('PostgreSQL + Drizzle ORM for structured operational data.'),
        blt('Session-authenticated access with auto-logout on inactivity.'),
        blt('Dark/light mode, disclaimer banners, and structured export.'),
        blt('API-connected to IBM\'s AIOps event correlation and analytics engines.'),
        ...sp(1),
        infoBox('Access & Security', [
          'Role-based access: IBM and Horizon executives',
          'Token-authenticated sessions with inactivity timeout',
          'All data HIPAA-compliant — no PHI in demonstration mode',
          'Architecture-ready for production data integration',
        ], { bg: C.lgray, accent: C.navy }),
      ]
    ),
    ...sp(1),

    ...imgBlock(
      'screenshots/portal-login.jpg',
      'Figure 2: CareOps360 Command Center — IBM\'s executive operations portal for Horizon BCBS leadership. Secured access with IBM AIOps integration.',
      680, 395
    ),
    pgBreak(),
  ];
}

// ─── Page 4: Digital Front Door ───────────────────────────────────────────────
function p4() {
  return [
    ...secTitle('Digital Front Door & Quote to Cart Initiatives', 'Transforming Member Engagement from Reactive Service to Intelligent Self-Service'),

    twoCol(
      [
        new Paragraph({ children: [Rb('The Digital Front Door Vision', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('The Digital Front Door (DFD) program is the centrepiece of Horizon\'s member experience transformation. IBM\'s role is to design, build, and operate a unified digital engagement layer that replaces fragmented channel experiences with a seamless, AI-enhanced member journey — from plan discovery through to claims and care navigation.'),
        body('For Horizon\'s leadership, DFD is not merely a web or mobile initiative — it is a fundamental shift in how the health plan relationships with its members: from reactive, call-centre-dependent service to proactive, intelligent digital engagement.'),
        ch2('Quote to Cart — Horizon\'s Highest Near-Term ROI Initiative'),
        body('Quote to Cart enables prospective and renewing members to receive a personalised plan quote, compare options, select coverage, and complete payment — entirely within a digital channel. This compresses the sales cycle from days to minutes and directly reduces broker dependency for individual and small-group purchases.'),
      ],
      [
        new Paragraph({ children: [Rb('DFD Programme Roadmap', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        dataTable(
          ['Phase', 'Focus Area', 'Status'],
          [
            ['Phase 1', 'Digital Identity & Member Portal',   'Complete'],
            ['Phase 2', 'Online Enrollment & Self-Service',   'In Progress'],
            ['Phase 3', 'Quote to Cart & Payment Rails',      'In Progress'],
            ['Phase 4', 'AI Personalisation Engine',          'Q3 2026'],
            ['Phase 5', 'Autonomous Member CX',               '2027'],
          ],
          [1200, 3500, 1800],
          { greenValues: ['Complete'] }
        ),
        ...sp(1),
        callout(
          [Rb('Quote to Cart', { size: 21, color: C.navy }), R(' compresses the plan purchase cycle from ', { size: 21, color: C.slate }), Rb('days → minutes', { size: 21, color: C.blue }), R(' and eliminates broker intermediation for straightforward purchases.', { size: 21, color: C.slate })],
          { bg: C.lgreen, accent: C.green, center: false }
        ),
      ]
    ),
    ...sp(1),

    ...barChart(
      'Figure 3: Target Digital Self-Service Adoption Rates by Member Transaction Type',
      [
        { label: 'Online Enrollment',       value: 85, color: C.blue  },
        { label: 'Plan Comparison (QTC)',   value: 78, color: C.teal  },
        { label: 'Digital ID Card',         value: 95, color: C.green },
        { label: 'Claims Status',           value: 90, color: C.blue  },
        { label: 'Provider Search',         value: 82, color: C.teal  },
        { label: 'Benefits Inquiry',        value: 75, color: C.navy  },
      ],
      '%',
      'Target digital self-service adoption rates across key member transaction types following DFD programme completion.'
    ),
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
          ['Metric', 'Baseline', 'With AIOps'],
          [
            ['MTTR (Mean Time to Resolve)', '4.2 hrs',    '< 1.8 hrs'],
            ['Alert Noise per Shift',       'High',       '> 60% Reduced'],
            ['P3/P4 Auto-Resolution',       '< 10%',      '> 74%'],
            ['Change Failure Rate',         'Baseline',   '40% Reduction'],
            ['System Availability',         '99.7%',      '99.95%'],
            ['Ops Manual Triage Hours',     'Full load',  '~30% Reduction'],
          ],
          [2800, 1800, 2400]
        ),
        ...sp(1),
        ch2('Built on Horizon\'s AWS Stack', C.navy),
        blt('Agent Layer: AWS AgentCore & Bedrock'),
        blt('Model Layer: AWS Bedrock with native Guardrails'),
        blt('Vector Store: AWS OpenSearch + PostgreSQL'),
        blt('Integrations: ServiceNow · Dynatrace · CloudWatch · OpenShift'),
        blt('IBM ContextForge for institutional knowledge management'),
        ...sp(1),
        approvalStrip([
          { icon: '✓', label: 'ARB Approval Secured',    sub: 'Architecture Review Board', color: C.green },
          { icon: '✓', label: 'GenAI Board Approved',    sub: 'Horizon GenAI Governance',  color: C.green },
        ]),
      ]
    ),
    ...sp(1),

    ...barChart(
      'Figure 4: Incident Resolution Time Reduction by Severity Category (IBM AIOps vs. Baseline)',
      [
        { label: 'P1 — Critical',     value: 57, color: C.red    },
        { label: 'P2 — High',         value: 48, color: C.orange },
        { label: 'P3 — Medium',       value: 65, color: C.blue   },
        { label: 'P4 — Low',          value: 80, color: C.teal   },
        { label: 'Change-Induced',    value: 40, color: C.navy   },
      ],
      '% faster',
      'Projected incident resolution time improvements by severity following Agentic AI deployment. Percentages represent reduction vs. baseline MTTR.'
    ),
    pgBreak(),
  ];
}

// ─── Page 6: Platform Modernisation ──────────────────────────────────────────
function p6() {
  return [
    ...secTitle('Platform Modernization', 'ICOE Modernization, Mainframe Migration & Application Rationalization'),

    twoCol(
      [
        new Paragraph({ children: [Rb('ICOE Modernization', { size: 26, color: C.navy })], spacing: { before: 80, after: 100 } }),
        body('IBM\'s Integration Centre of Excellence (ICOE) Modernization program restructures IBM\'s delivery organization to align with Horizon\'s evolving platform landscape — introducing DevSecOps pipelines, product-centric engineering squads, and shared services for API management, identity, and data integration.'),
        ch2('ICOE Deliverables'),
        blt('Dedicated engineering squads aligned to Horizon product and platform domains.'),
        blt('DevSecOps pipelines replacing manual release management processes.'),
        blt('Integration Simplification roadmap — reducing point-to-point complexity.'),
        blt('Document Generation Modernization (HLGS upgrade roadmap).'),
        blt('Observability and SRE practices for proactive system health management.'),
        ...sp(1),
        ch2('Application Rationalisation'),
        body('IBM will conduct a structured assessment of Horizon\'s ~500 application portfolio using the BUILD ONCE, BENEFIT (BOB) framework — identifying candidates for decommission, consolidation, cloud migration, or AI-augmented modernization.'),
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
        infoBox('Technical Debt Governance', [
          'All stacks maintained to n-2 versions',
          'Architecture Review Board (IBM + Horizon)',
          'Rollback gates at every migration phase',
          'Zero-disruption contractual commitment',
        ], { bg: C.lgray, accent: C.navy }),
      ]
    ),
    ...sp(1),
    kpiStrip([
      { value: '~500',       label: 'Applications Assessed',     color: C.blue  },
      { value: 'COBOL→Java', label: 'AI-Assisted Conversion',    color: C.teal  },
      { value: 'n-2',        label: 'Stack Version Governance',  color: C.navy  },
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

    ...barChart(
      'Figure 5: Quality KPI Improvement Targets — 12-Month Programme',
      [
        { label: 'Test Automation Coverage',        value: 80, color: C.green  },
        { label: 'Defect Escape Rate Reduction',    value: 65, color: C.blue   },
        { label: 'Regression Cycle Time Cut',       value: 70, color: C.teal   },
        { label: 'Test Maintenance Effort Reduced', value: 55, color: C.navy   },
        { label: 'Production Incident Rate',        value: 40, color: C.orange },
      ],
      '%',
      'IBM\'s quality engineering targets for Horizon\'s AMS portfolio at 12-month programme maturity.'
    ),
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
      ],
      [
        ch2('Governance at Every Phase', C.navy),
        blt('Executive Steering Committee: Quarterly IBM VP + Horizon CIO/COO review.'),
        blt('Programme Management Office: Monthly health reporting and risk register.'),
        blt('Delivery Operations Reviews: Bi-weekly SLA and incident trends.'),
        blt('Financial Governance: Monthly actuals vs. committed model.'),
        blt('Innovation Council: Quarterly idea pipeline and prioritisation.'),
      ]
    ),
    pgBreak(),
  ];
}

// ─── Page 9: Why IBM ──────────────────────────────────────────────────────────
function p9() {
  return [
    ...secTitle('Why IBM as Your Transformation Partner', 'Scale, Depth, and Skin in the Game'),

    callout(
      [Rb('IBM is the only partner', { size: 23, color: C.navy }), R(' that brings together AI-first operating platform capability, deep healthcare payer domain expertise, proven global delivery scale, and a willingness to ', { size: 23, color: C.slate }), Rb('share outcome risk', { size: 23, color: C.blue }), R(' through an outcome-based engagement model.', { size: 23, color: C.slate })],
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
        new Paragraph({
          children: [R('© 2026 IBM Corporation. Confidential and Proprietary.  IBM-HZN-AMS-RFP-2026-CAS', { size: 16, color: C.mid, italics: true })],
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.blue, space: 4 } },
          alignment: AlignmentType.CENTER,
        }),
      ]}),
    },
    children: [
      ...cover(),
      ...p1(),
      ...p2(),
      ...p3(),
      ...p4(),
      ...p5(),
      ...p6(),
      ...p7(),
      ...p8(),
      ...p9(),
      ...p10(),
    ],
  }],
});

const buf = await Packer.toBuffer(doc);
writeFileSync('IBM_Horizon_AI_Transformation_Proposal_Apr2026.docx', buf);
console.log('Done — white paper written.');
