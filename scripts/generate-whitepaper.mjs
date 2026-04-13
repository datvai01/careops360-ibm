/**
 * IBM × Horizon BCBS — AI-First Transformation White Paper
 * Executive Proposal Document Generator
 */

import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle,
  ShadingType, TableLayoutType, VerticalAlign, PageBreak,
  Header, Footer, ImageRun, UnderlineType, convertInchesToTwip,
  ColumnBreak,
} from 'docx';
import { writeFileSync, readFileSync } from 'fs';

// ─── Colours ─────────────────────────────────────────────────────────────────
const IBM_BLUE   = '0F62FE';
const IBM_NAVY   = '001141';
const DARK_NAVY  = '0A1931';
const SLATE      = '21272A';
const TEAL       = '009D9A';
const GREEN      = '198038';
const ORANGE     = 'FF832B';
const LIGHT_BLUE = 'D0E2FF';
const LIGHT_GRAY = 'F4F4F4';
const RULE_GRAY  = 'C6C6C6';
const MID_GRAY   = '6F6F6F';
const WHITE      = 'FFFFFF';
const LIGHT_TEAL = 'D9FBFB';
const LIGHT_GRN  = 'DEFBE6';

// ─── Measurements ─────────────────────────────────────────────────────────────
const FULL_WIDTH = 9072;  // 6.3" in twips
const COL_W      = 4320;  // ~3" per column
const GAP        = 432;   // 0.3" gap

// ─── Text helpers ─────────────────────────────────────────────────────────────

const R = (text, opts = {}) =>
  new TextRun({ text, font: 'Calibri', ...opts });

const BOLD = (text, opts = {}) =>
  R(text, { bold: true, ...opts });

const BLUE = (text, opts = {}) =>
  R(text, { color: IBM_BLUE, bold: true, ...opts });

// ─── Paragraph helpers ────────────────────────────────────────────────────────

const body = (text, opts = {}) =>
  new Paragraph({
    children: Array.isArray(text) ? text : [R(text, { size: 20, color: SLATE })],
    spacing: { after: 100 },
    alignment: AlignmentType.JUSTIFIED,
    ...opts,
  });

const bodySmall = (text) =>
  new Paragraph({
    children: [R(text, { size: 18, color: MID_GRAY })],
    spacing: { after: 80 },
    alignment: AlignmentType.JUSTIFIED,
  });

const bullet = (text, level = 0) =>
  new Paragraph({
    children: [R(text, { size: 20, color: SLATE })],
    bullet: { level },
    spacing: { after: 80 },
    indent: { left: 360 + level * 280 },
  });

const bulletBold = (label, rest, color = SLATE) =>
  new Paragraph({
    children: [BOLD(label + ' ', { size: 20, color }), R(rest, { size: 20, color: SLATE })],
    bullet: { level: 0 },
    spacing: { after: 80 },
    indent: { left: 360 },
  });

const sp = (n = 1) =>
  Array.from({ length: n }, () =>
    new Paragraph({ children: [R('')], spacing: { after: 40 } })
  );

const pgBreak = () =>
  new Paragraph({ children: [new PageBreak()] });

const label = (text) =>
  new Paragraph({
    children: [R(text, { size: 16, color: IBM_BLUE, bold: true, characterSpacing: 80 })],
    spacing: { before: 200, after: 60 },
  });

// ─── Section heading helpers ──────────────────────────────────────────────────

const sectionTitle = (text, sub = '') =>
  [
    new Paragraph({
      children: [
        new TextRun({ text, font: 'Calibri', bold: true, size: 44, color: IBM_NAVY }),
      ],
      spacing: { before: 300, after: sub ? 80 : 160 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: IBM_BLUE, space: 6 } },
    }),
    ...(sub ? [new Paragraph({
      children: [new TextRun({ text: sub, font: 'Calibri', size: 22, color: MID_GRAY, italics: true })],
      spacing: { after: 200 },
    })] : []),
  ];

const colHead = (text) =>
  new Paragraph({
    children: [BOLD(text, { size: 24, color: IBM_NAVY })],
    spacing: { before: 120, after: 100 },
  });

const colHead2 = (text) =>
  new Paragraph({
    children: [BOLD(text, { size: 22, color: IBM_BLUE })],
    spacing: { before: 180, after: 80 },
    border: { left: { style: BorderStyle.SINGLE, size: 20, color: IBM_BLUE, space: 8 } },
    indent: { left: 120 },
  });

// ─── Two-column helper ────────────────────────────────────────────────────────

function twoCol(leftItems, rightItems) {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: FULL_WIDTH, type: WidthType.DXA },
    borders: {
      top:           { style: BorderStyle.NONE },
      bottom:        { style: BorderStyle.NONE },
      left:          { style: BorderStyle.NONE },
      right:         { style: BorderStyle.NONE },
      insideH:       { style: BorderStyle.NONE },
      insideV:       { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: COL_W, type: WidthType.DXA },
            children: leftItems,
            margins: { right: 200 },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            },
          }),
          new TableCell({
            width: { size: COL_W, type: WidthType.DXA },
            children: rightItems,
            margins: { left: 200 },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            },
          }),
        ],
      }),
    ],
  });
}

// ─── Callout / Pull-quote box ─────────────────────────────────────────────────

function callout(text, opts = {}) {
  const { bg = LIGHT_BLUE, border = IBM_BLUE, color = IBM_NAVY, size = 22 } = opts;
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: FULL_WIDTH, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: Array.isArray(text) ? text : [R(text, { size, color, bold: true })],
                spacing: { before: 80, after: 80 },
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: { fill: bg, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 280, right: 280 },
            borders: {
              left: { style: BorderStyle.SINGLE, size: 24, color: border, space: 4 },
              top: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
            },
          }),
        ],
      }),
    ],
  });
}

function sideBar(title, items, opts = {}) {
  const { bg = LIGHT_BLUE, border = IBM_BLUE } = opts;
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: FULL_WIDTH, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [BOLD(title, { size: 20, color: IBM_NAVY })],
                spacing: { after: 80 },
              }),
              ...items.map(t =>
                new Paragraph({
                  children: [R('• ' + t, { size: 19, color: SLATE })],
                  spacing: { after: 60 },
                })
              ),
            ],
            shading: { fill: bg, type: ShadingType.CLEAR },
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
            borders: {
              left: { style: BorderStyle.SINGLE, size: 24, color: border, space: 4 },
              top: { style: BorderStyle.SINGLE, size: 4, color: border, space: 0 },
              right: { style: BorderStyle.SINGLE, size: 4, color: border, space: 0 },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: border, space: 0 },
            },
          }),
        ],
      }),
    ],
  });
}

// ─── KPI strip ────────────────────────────────────────────────────────────────

function kpiStrip(items) {
  const cellW = Math.floor(FULL_WIDTH / items.length);
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: FULL_WIDTH, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: items.map(({ value, label: lbl, color = IBM_BLUE }) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [BOLD(value, { size: 48, color })],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [R(lbl, { size: 17, color: SLATE })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
              }),
            ],
            shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 80, right: 80 },
            width: { size: cellW, type: WidthType.DXA },
            borders: {
              right: { style: BorderStyle.SINGLE, size: 6, color: RULE_GRAY, space: 0 },
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
            },
          })
        ),
      }),
    ],
  });
}

// ─── Phase roadmap table ──────────────────────────────────────────────────────

function roadmapTable(phases) {
  const cellW = Math.floor(FULL_WIDTH / phases.length);
  const BGs = ['0F62FE', '0050E6', '003CBF', '00288A'];
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: FULL_WIDTH, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
    },
    rows: [
      // Header row
      new TableRow({
        children: phases.map(({ phase, timeframe }, i) =>
          new TableCell({
            children: [
              new Paragraph({ children: [BOLD(phase, { size: 20, color: WHITE })], alignment: AlignmentType.CENTER }),
              new Paragraph({ children: [R(timeframe, { size: 17, color: LIGHT_BLUE })], alignment: AlignmentType.CENTER }),
            ],
            shading: { fill: BGs[i % BGs.length], type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 80, right: 80 },
            width: { size: cellW, type: WidthType.DXA },
            borders: {
              right: { style: BorderStyle.SINGLE, size: 8, color: WHITE, space: 0 },
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE },
            },
          })
        ),
      }),
      // Bullet rows
      new TableRow({
        children: phases.map(({ items }, i) =>
          new TableCell({
            children: items.map(t =>
              new Paragraph({
                children: [R('› ' + t, { size: 19, color: SLATE })],
                spacing: { after: 60 },
              })
            ),
            shading: { fill: i % 2 === 0 ? LIGHT_GRAY : 'EAEAEA', type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 120, right: 120 },
            width: { size: cellW, type: WidthType.DXA },
            borders: {
              right: { style: BorderStyle.SINGLE, size: 4, color: RULE_GRAY, space: 0 },
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE },
            },
          })
        ),
      }),
    ],
  });
}

// ─── Data table ───────────────────────────────────────────────────────────────

function dataTable(headers, rows, colWidths, highlight = []) {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: FULL_WIDTH, type: WidthType.DXA },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) =>
          new TableCell({
            children: [new Paragraph({
              children: [BOLD(h, { size: 19, color: WHITE })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 60 },
            })],
            shading: { fill: IBM_NAVY, type: ShadingType.CLEAR },
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            ...(colWidths ? { width: { size: colWidths[i], type: WidthType.DXA } } : {}),
          })
        ),
      }),
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map((val, ci) =>
            new TableCell({
              children: [new Paragraph({
                children: [
                  ci === 0
                    ? BOLD(String(val), { size: 19, color: SLATE })
                    : R(String(val), {
                        size: 19,
                        color: highlight.includes(val) ? GREEN
                             : String(val).startsWith('✓') ? GREEN
                             : SLATE,
                      }),
                ],
                spacing: { before: 50, after: 50 },
              })],
              shading: { fill: ri % 2 === 0 ? WHITE : 'F0F4FF', type: ShadingType.CLEAR },
              margins: { top: 50, bottom: 50, left: 80, right: 80 },
              verticalAlign: VerticalAlign.CENTER,
              ...(colWidths ? { width: { size: colWidths[ci], type: WidthType.DXA } } : {}),
            })
          ),
        })
      ),
    ],
  });
}

// ─── Image helper ─────────────────────────────────────────────────────────────

function imageBlock(path, caption, opts = {}) {
  const { w = 8700000, h = 5400000 } = opts;  // EMUs: ~9.06" x 5.63"
  const data = readFileSync(path);
  return [
    new Paragraph({
      children: [
        new ImageRun({ data, transformation: { width: Math.round(w / 12700), height: Math.round(h / 12700) }, type: 'jpg' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
    }),
    new Paragraph({
      children: [R(caption, { size: 17, color: MID_GRAY, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  ];
}

// ─── Bar chart (table-based) ──────────────────────────────────────────────────

function barChart(title, items, unit = '') {
  const max = Math.max(...items.map(x => x.value));
  const BAR_W = 5400;
  return [
    new Paragraph({ children: [BOLD(title, { size: 21, color: IBM_NAVY })], spacing: { before: 120, after: 80 } }),
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: FULL_WIDTH, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
        insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
      },
      rows: items.map((item, i) => {
        const fill = Math.round((item.value / max) * BAR_W);
        const empty = BAR_W - fill;
        const color = item.color || IBM_BLUE;
        return new TableRow({
          children: [
            // Label
            new TableCell({
              children: [new Paragraph({ children: [R(item.label, { size: 18, color: SLATE })], spacing: { after: 0 } })],
              width: { size: 2400, type: WidthType.DXA },
              margins: { right: 80 },
              verticalAlign: VerticalAlign.CENTER,
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            }),
            // Bar filled
            new TableCell({
              children: [new Paragraph({ children: [], spacing: { after: 0 } })],
              width: { size: fill, type: WidthType.DXA },
              shading: { fill: color, type: ShadingType.CLEAR },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            }),
            // Bar empty
            ...(empty > 0 ? [new TableCell({
              children: [new Paragraph({ children: [], spacing: { after: 0 } })],
              width: { size: empty, type: WidthType.DXA },
              shading: { fill: 'E8E8E8', type: ShadingType.CLEAR },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            })] : []),
            // Value
            new TableCell({
              children: [new Paragraph({ children: [BOLD(item.value + unit, { size: 18, color })], spacing: { after: 0 }, alignment: AlignmentType.RIGHT })],
              width: { size: 1200, type: WidthType.DXA },
              margins: { left: 80 },
              verticalAlign: VerticalAlign.CENTER,
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            }),
          ],
        });
      }),
    }),
    ...sp(1),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE CONTENT
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Cover Page ───────────────────────────────────────────────────────────────

function cover() {
  return [
    ...sp(2),
    // IBM accent bar
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: FULL_WIDTH, type: WidthType.DXA },
      borders: { top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE},insideH:{style:BorderStyle.NONE},insideV:{style:BorderStyle.NONE} },
      rows: [new TableRow({ children: [
        new TableCell({
          children: [sp(1)[0]],
          shading: { fill: IBM_BLUE, type: ShadingType.CLEAR },
          width: { size: FULL_WIDTH, type: WidthType.DXA },
          borders: { top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE} },
        }),
      ]})],
    }),
    ...sp(1),
    new Paragraph({
      children: [R('AI-FIRST APPLICATION MANAGEMENT SERVICES', { size: 22, color: IBM_BLUE, bold: true, characterSpacing: 180 })],
      alignment: AlignmentType.LEFT,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Transforming Horizon BCBS', font: 'Calibri', bold: true, size: 72, color: IBM_NAVY })],
      alignment: AlignmentType.LEFT,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Into a Predictive, Self-Healing, AI-Driven Enterprise', font: 'Calibri', size: 40, color: MID_GRAY })],
      alignment: AlignmentType.LEFT,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [],
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: IBM_BLUE, space: 4 } },
      spacing: { after: 320 },
    }),
    twoCol(
      [
        new Paragraph({ children: [BOLD('Submitted by:', { size: 22, color: MID_GRAY })], spacing: { after: 80 } }),
        new Paragraph({ children: [BOLD('IBM Consulting', { size: 32, color: IBM_NAVY })], spacing: { after: 40 } }),
        new Paragraph({ children: [R('Healthcare & Payer Delivery — AMS Practice', { size: 22, color: SLATE })], spacing: { after: 160 } }),
        new Paragraph({ children: [BOLD('Submitted to:', { size: 22, color: MID_GRAY })], spacing: { after: 80 } }),
        new Paragraph({ children: [BOLD('Horizon Blue Cross Blue Shield of New Jersey', { size: 26, color: IBM_NAVY })], spacing: { after: 40 } }),
        new Paragraph({ children: [R('Executive Leadership & Technology Office', { size: 22, color: SLATE })], spacing: { after: 0 } }),
      ],
      [
        new Paragraph({ children: [BOLD('Document Classification:', { size: 22, color: MID_GRAY })], spacing: { after: 80 } }),
        new Paragraph({ children: [BOLD('CONFIDENTIAL', { size: 24, color: '#da1e28' })], spacing: { after: 120 } }),
        new Paragraph({ children: [BOLD('Date:', { size: 22, color: MID_GRAY })], spacing: { after: 80 } }),
        new Paragraph({ children: [R('April 2026', { size: 22, color: SLATE })], spacing: { after: 120 } }),
        new Paragraph({ children: [BOLD('Reference:', { size: 22, color: MID_GRAY })], spacing: { after: 80 } }),
        new Paragraph({ children: [R('IBM-HZN-AMS-RFP-2026-CAS', { size: 22, color: SLATE })], spacing: { after: 0 } }),
      ]
    ),
    ...sp(3),
    new Paragraph({
      children: [
        R('Powered by IBM AIOps  ·  IBM Consulting Advantage  ·  HIPAA Compliant  ·  © 2026 IBM Corporation', { size: 17, color: MID_GRAY, italics: true }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    pgBreak(),
  ];
}

// ─── Page 1: Executive Summary ────────────────────────────────────────────────

function p1_execSummary() {
  return [
    ...sectionTitle(
      'Executive Summary',
      'A Strategic Proposal for AI-Led Transformation of Application Management Services'
    ),

    callout(
      [
        R('"IBM is not proposing a technology project — IBM is proposing a ', { size: 23, color: IBM_NAVY }),
        BOLD('transformation partnership', { size: 23, color: IBM_BLUE }),
        R(' that embeds AI-driven intelligence into the operating model of Horizon BCBS, enabling a future-ready enterprise that is ', { size: 23, color: IBM_NAVY }),
        BOLD('faster, smarter, and more resilient', { size: 23, color: IBM_BLUE }),
        R(' than today."', { size: 23, color: IBM_NAVY }),
      ],
      { bg: LIGHT_BLUE, border: IBM_BLUE }
    ),
    ...sp(1),

    twoCol(
      [
        colHead('The Moment'),
        body('Horizon BCBS stands at a pivotal inflection point. With approximately 500 applications spanning enrollment, claims adjudication, member services, and data platforms, the organisation faces mounting pressure to modernise operations, reduce administrative burden, and deliver measurably better member and provider experiences.'),
        body('The incumbent delivery model — reactive, labour-intensive, and fragmented across towers — is no longer sufficient to meet Horizon\'s growth objectives or competitive imperatives.'),
        colHead2('What IBM Proposes'),
        body('IBM proposes a structured transition from reactive application support to a predictive, self-healing, and continuously improving AI-first operating model — delivered through IBM\'s proven Assets, Assistants, and Accelerators framework, and governed through an outcome-based accountability model.'),
      ],
      [
        colHead('Five Strategic Commitments'),
        ...['AI-First Operating Model — AI embedded across every layer of AMS and QA lifecycle.',
            'Tech Arbitrage over Labour Arbitrage — Compressing cost through automation, not headcount.',
            'Outcome-Based Delivery — Committed SLAs tied to measurable business outcomes.',
            'Zero-Disruption Transition — Risk-free phased transition protecting operational continuity.',
            'Continuous Innovation Engine — Horizon Innovation Council driving sustained value beyond steady state.',
          ].map(t => bullet(t)),
        ...sp(1),
        sideBar('IBM\'s Scale Behind This Proposal', [
          '20,000+ AI & data practitioners globally',
          '81,000+ cloud & architecture experts',
          '40,000+ AI & analytics engagements',
          '15,000+ people across 40 global delivery centres',
          'Leader in Enterprise Software Quality & Testing',
        ], { bg: LIGHT_BLUE, border: IBM_BLUE }),
      ]
    ),
    ...sp(1),

    kpiStrip([
      { value: '~500',  label: 'Applications in Scope',     color: IBM_BLUE  },
      { value: 'AI-First', label: 'Operating Model',        color: TEAL      },
      { value: 'Phase 0→4', label: 'Structured Roadmap',   color: IBM_NAVY  },
      { value: '24×7', label: 'Global Support Coverage',    color: GREEN     },
    ]),
    pgBreak(),
  ];
}

// ─── Page 2: The Transformation Imperative ────────────────────────────────────

function p2_imperative() {
  return [
    ...sectionTitle(
      'The Transformation Imperative',
      'Understanding Horizon\'s Strategic Objectives and IBM\'s Solution Design Rationale'
    ),

    twoCol(
      [
        colHead('What Horizon Needs'),
        body('Horizon BCBS is seeking the right strategic partner to enhance and support its Application Development, Maintenance, Data, and Testing Services — with a clear focus on AI solutions and expertise native to the Horizon environment.'),
        colHead2('Service Transformation Goals'),
        bullet('High-quality services delivered through AI and automation to obtain operational efficiencies.'),
        bullet('Realisation of a product-oriented operating model.'),
        bullet('Focused automation — especially in testing and quality engineering.'),
        bullet('AI tools to drive application modernisation across the portfolio.'),
        bullet('Consultative support applying deep healthcare payer best practices.'),
        ...sp(1),
        colHead2('Cost Structure Expectations'),
        body('Horizon expects structural cost reduction — not just efficiency gains. The fixed baseline model signals a clear expectation: year-over-year productivity improvements and cost takeout driven by automation and AI, not rate arbitrage.'),
      ],
      [
        colHead('Factors That Shaped IBM\'s Solution'),
        bulletBold('End-to-End Integrated Delivery:', 'A unified operating model across Application Maintenance, Development, Testing, and Data — reducing fragmentation and improving accountability across the full lifecycle.'),
        bulletBold('AI at the Core:', 'Not bolted on. AI is embedded in triage, root cause analysis, resolution, test automation, and continuous validation — from the first day of delivery.'),
        bulletBold('Transition Without Disruption:', 'IBM\'s phased transition approach maintains seamless service continuity while progressively modernising the underlying operating model.'),
        bulletBold('Open, Elastic Architecture:', 'Plug-and-play architecture allows IBM to deploy on Horizon\'s existing AWS stack or any cloud ecosystem — avoiding lock-in and enabling flexibility.'),
        ...sp(1),
        callout(
          [R('IBM\'s solution shifts Horizon from ', { size: 20, color: SLATE }), BOLD('reactive incident management', { size: 20, color: IBM_BLUE }), R(' to ', { size: 20, color: SLATE }), BOLD('predictive, autonomous operations', { size: 20, color: IBM_NAVY })],
          { bg: LIGHT_TEAL, border: TEAL }
        ),
      ]
    ),
    ...sp(1),

    ...barChart('Current vs. Target: Automation Coverage by Domain', [
      { label: 'Incident Triage',       value: 45, color: MID_GRAY },
      { label: 'Test Execution',        value: 38, color: MID_GRAY },
      { label: 'Root Cause Analysis',   value: 22, color: MID_GRAY },
      { label: 'Change Risk Scoring',   value: 18, color: MID_GRAY },
      { label: 'Deployment Validation', value: 15, color: MID_GRAY },
    ], '%'),

    new Paragraph({
      children: [R('Figure 1: Estimated baseline automation coverage across AMS domains (current state). IBM\'s proposal targets 80%+ automation across all domains within 12 months.', { size: 16, color: MID_GRAY, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),

    pgBreak(),
  ];
}

// ─── Page 3: CareOps360 Command Center + AIOps Architecture ──────────────────

function p3_commandCenter() {
  return [
    ...sectionTitle(
      'CareOps360 Command Center',
      'IBM\'s Executive Operations Platform for Real-Time AMS Visibility at Horizon'
    ),

    twoCol(
      [
        colHead('What Is CareOps360?'),
        body('CareOps360 is IBM\'s production-grade executive operations platform purpose-built for the Horizon BCBS engagement. It delivers real-time operational intelligence across all AMS towers — enrollment, applications, infrastructure, and quality — through a single, unified command centre accessible to Horizon\'s executive and operational leadership.'),
        body('Built on IBM\'s AIOps observability framework, CareOps360 surfaces predictive insights, SLA performance, enrollment intelligence, digital front door metrics, and transformation roadmap progress in real time.'),
        colHead2('Key Capabilities'),
        bullet('Real-time application health monitoring across 500+ applications.'),
        bullet('Enrollment Intelligence dashboard with predictive surge modelling.'),
        bullet('Digital Front Door programme tracking — Quote to Cart, member activation, channel metrics.'),
        bullet('IBM AIOps value realisation — MTTR trends, automation coverage, incident economics.'),
        bullet('Transformation Roadmap — live phase progress and milestone tracking.'),
        bullet('Auto-export, session logging, and HIPAA-compliant audit trail.'),
      ],
      [
        colHead('Platform Architecture'),
        body('CareOps360 is built on a modern, cloud-native stack with real-time data polling from IBM\'s AIOps and observability layers. It features:'),
        bullet('PostgreSQL + Drizzle ORM for structured operational data.'),
        bullet('Session-authenticated access with auto-logout on inactivity.'),
        bullet('Dark/light mode, disclaimer banners, and structured export.'),
        bullet('API-connected to IBM\'s AIOps event correlation and analytics engines.'),
        ...sp(1),
        sideBar('Access & Security', [
          'Role-based access: IBM and Horizon executives',
          'Token-authenticated sessions with inactivity timeout',
          'All data HIPAA-compliant — no PHI in demonstration mode',
          'Architecture-ready for production data integration',
        ], { bg: LIGHT_GRAY, border: IBM_NAVY }),
      ]
    ),
    ...sp(1),

    // Portal screenshot
    ...imageBlock('screenshots/portal-login.jpg',
      'Figure 2: CareOps360 Command Center — IBM\'s executive operations portal for Horizon BCBS leadership. Secured access with IBM AIOps integration.',
      { w: 9072 * 120, h: 5670 * 120 }
    ),

    pgBreak(),
  ];
}

// ─── Page 4: Digital Front Door & Quote to Cart ───────────────────────────────

function p4_dfd() {
  return [
    ...sectionTitle(
      'Digital Front Door & Quote to Cart',
      'Transforming Member Engagement from Reactive Service to Intelligent Self-Service'
    ),

    twoCol(
      [
        colHead('The Digital Front Door Vision'),
        body('The Digital Front Door (DFD) programme is the centrepiece of Horizon\'s member experience transformation. IBM\'s role is to design, build, and operate a unified digital engagement layer that replaces fragmented channel experiences with a seamless, AI-enhanced member journey — from plan discovery through to claims and care navigation.'),
        body('For Horizon\'s leadership, DFD is not merely a web or mobile initiative — it is a fundamental shift in how the health plan relationships with its members: from reactive, call-centre-dependent service to proactive, intelligent digital engagement.'),
        colHead2('Quote to Cart — Horizon\'s Highest Near-Term ROI Initiative'),
        body('Quote to Cart enables prospective and renewing members to receive a personalised plan quote, compare options, select coverage, and complete payment — entirely within a digital channel. This compresses the sales cycle from days to minutes and directly reduces broker dependency for individual and small-group purchases.'),
      ],
      [
        colHead('DFD Programme Roadmap'),
        dataTable(
          ['Phase', 'Focus', 'Status'],
          [
            ['Phase 1', 'Digital Identity & Member Portal', '✓ Complete'],
            ['Phase 2', 'Online Enrollment & Self-Service', 'In Progress'],
            ['Phase 3', 'Quote to Cart & Payments', 'In Progress'],
            ['Phase 4', 'AI Personalisation Engine', 'Q3 2026'],
            ['Phase 5', 'Autonomous Member CX', '2027'],
          ],
          [1200, 3200, 1800],
          ['✓ Complete']
        ),
        ...sp(1),
        callout(
          [BOLD('Quote to Cart', { size: 21, color: IBM_NAVY }), R(' reduces the plan purchase cycle from ', { size: 21, color: SLATE }), BOLD('days → minutes', { size: 21, color: IBM_BLUE }), R(' and eliminates broker intermediation for straightforward purchases.', { size: 21, color: SLATE })],
          { bg: LIGHT_GRN, border: GREEN }
        ),
      ]
    ),
    ...sp(1),

    ...barChart('Digital Channel Shift — Target State (% of Member Transactions)', [
      { label: 'Online Enrollment',       value: 85, color: IBM_BLUE  },
      { label: 'Plan Comparison (QTC)',   value: 78, color: TEAL      },
      { label: 'Digital ID Card',         value: 95, color: GREEN     },
      { label: 'Claims Status',           value: 90, color: IBM_BLUE  },
      { label: 'Provider Search',         value: 82, color: TEAL      },
      { label: 'Benefits Inquiry',        value: 75, color: IBM_NAVY  },
    ], '%'),

    new Paragraph({
      children: [R('Figure 3: Target digital self-service adoption rates across key member transaction types following DFD programme completion.', { size: 16, color: MID_GRAY, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),

    pgBreak(),
  ];
}

// ─── Page 5: AIOps & Agentic AI ──────────────────────────────────────────────

function p5_aiops() {
  return [
    ...sectionTitle(
      'AIOps & Agentic AI Operations',
      'From Reactive Incident Management to Autonomous, Self-Healing Operations'
    ),

    callout(
      [R('IBM\'s Agentic AI framework shifts Horizon from ', { size: 22, color: SLATE }), BOLD('reactive incident handling', { size: 22, color: IBM_BLUE }), R(' to ', { size: 22, color: SLATE }), BOLD('proactive, AI-driven real-time diagnosis and autonomous resolution', { size: 22, color: IBM_NAVY })],
      { bg: LIGHT_BLUE, border: IBM_BLUE }
    ),
    ...sp(1),

    twoCol(
      [
        colHead('The Agentic AI Architecture'),
        body('IBM\'s AIOps framework is built on a multi-agent architecture where specialised AI agents handle distinct responsibilities across the incident lifecycle — from detection through resolution and continuous learning.'),
        colHead2('Agent Roles'),
        bulletBold('Help Desk Agent:', 'Delivers context-aware guidance and automated actions to help users auto-resolve issues before ticket creation.'),
        bulletBold('Triage Agent:', 'Prioritises tickets based on impact, urgency, and historical patterns — eliminating manual queue management.'),
        bulletBold('Root Cause Analysis Agent:', 'Correlates signals across 140+ monitoring sources to identify root cause within minutes.'),
        bulletBold('Resolution Agent:', 'Suggests or executes remediation steps based on runbooks and past resolutions.'),
        bulletBold('Runbook Generation Agent:', 'Auto-generates and updates runbooks from resolved incidents — compounding operational knowledge over time.'),
        bulletBold('Continuous Learning Agent:', 'Feeds production telemetry back into all agents, ensuring progressive improvement with every incident cycle.'),
      ],
      [
        colHead('Value Realisation'),
        dataTable(
          ['Metric', 'Before', 'With IBM AIOps'],
          [
            ['MTTR (Mean Time to Resolve)', '4.2 hrs', '< 1.8 hrs'],
            ['Alert Noise per Shift', 'High', '> 60% Reduced'],
            ['P3/P4 Auto-Resolution', '< 10%', '> 74%'],
            ['Change Failure Rate', 'Baseline', '40% Reduction'],
            ['System Availability', '99.7%', '99.95%'],
            ['Ops Team Manual Triage', 'Full load', '~30% Reduction'],
          ],
          [2800, 1800, 2400]
        ),
        ...sp(1),
        colHead2('Built on Horizon\'s AWS Stack'),
        bullet('Agent Layer: AWS AgentCore & Bedrock'),
        bullet('Model Layer: AWS Bedrock with native Guardrails'),
        bullet('Vector Store: AWS OpenSearch + Postgres'),
        bullet('Integrations: ServiceNow · Dynatrace · CloudWatch · OpenShift'),
        bullet('IBM ContextForge for institutional knowledge management'),
      ]
    ),
    ...sp(1),

    ...barChart('Incident Resolution Time Reduction by Category (Target vs. Baseline)', [
      { label: 'P1 Critical',     value: 57, color: '#da1e28' },
      { label: 'P2 High',         value: 48, color: ORANGE     },
      { label: 'P3 Medium',       value: 65, color: IBM_BLUE   },
      { label: 'P4 Low',          value: 80, color: TEAL       },
      { label: 'Change-Induced',  value: 40, color: IBM_NAVY   },
    ], '% faster'),

    new Paragraph({
      children: [R('Figure 4: Projected incident resolution time improvements by severity category following Agentic AI deployment. Percentages represent reduction vs. baseline MTTR.', { size: 16, color: MID_GRAY, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),

    pgBreak(),
  ];
}

// ─── Page 6: ICOE & Mainframe Modernisation ──────────────────────────────────

function p6_modernisation() {
  return [
    ...sectionTitle(
      'Platform Modernisation',
      'ICOE Modernisation, Mainframe Migration & Application Rationalisation'
    ),

    twoCol(
      [
        colHead('ICOE Modernisation'),
        body('IBM\'s Integration Centre of Excellence (ICOE) Modernisation programme restructures IBM\'s delivery organisation to align with Horizon\'s evolving platform landscape — introducing DevSecOps pipelines, product-centric engineering squads, and shared services for API management, identity, and data integration.'),
        colHead2('ICOE Deliverables'),
        bullet('Dedicated engineering squads aligned to Horizon product and platform domains.'),
        bullet('DevSecOps pipelines replacing manual release management processes.'),
        bullet('Integration Simplification roadmap — reducing point-to-point complexity.'),
        bullet('Document Generation Modernisation (HLGS upgrade roadmap).'),
        bullet('Observability and SRE practices for proactive system health management.'),
        ...sp(1),
        colHead2('Application Rationalisation'),
        body('IBM will conduct a structured assessment of Horizon\'s ~500 application portfolio using the BUILD ONCE, BENEFIT (BOB) framework — identifying candidates for decommission, consolidation, cloud migration, or AI-augmented modernisation.'),
      ],
      [
        colHead('Mainframe Modernisation Roadmap'),
        body('Horizon\'s mainframe hosts critical batch processing, eligibility logic, and financial settlement. IBM\'s strategy executes phased migration preserving continuity:'),
        dataTable(
          ['Workstream', 'Approach', 'Timeline'],
          [
            ['Eligibility Processing', 'API-wrap → Cloud rehost', 'Q2–Q4 2026'],
            ['COBOL → Java Pilot', 'AI-assisted code conversion', 'Q3 2026'],
            ['Unified Payments', 'AWS modernisation', 'Q3 2026'],
            ['Claims Engine', 'Parallel-run cutover', 'Q1–Q2 2027'],
            ['Member Data Services', 'Event-driven migration', 'Q4 2026+'],
          ],
          [2200, 2600, 2300]
        ),
        ...sp(1),
        sideBar('Technical Debt Governance', [
          'All stacks maintained to n-2 versions',
          'Architecture Review Board (IBM + Horizon)',
          'Rollback gates at every migration phase',
          'Zero-disruption contractual commitment',
        ], { bg: LIGHT_GRAY, border: IBM_NAVY }),
      ]
    ),
    ...sp(1),

    kpiStrip([
      { value: '~500',    label: 'Applications Assessed',     color: IBM_BLUE  },
      { value: 'COBOL→Java', label: 'AI-Assisted Conversion', color: TEAL      },
      { value: 'n-2',    label: 'Stack Version Governance',   color: IBM_NAVY  },
      { value: '0',      label: 'Disruption Commitment',      color: GREEN     },
    ]),

    pgBreak(),
  ];
}

// ─── Page 7: Quality Engineering & AI Dev ────────────────────────────────────

function p7_qualityDev() {
  return [
    ...sectionTitle(
      'Quality Engineering & AI-Augmented Development',
      'Measurable Quality at Every Milestone — Improved with Every Release'
    ),

    twoCol(
      [
        colHead('Self-Improving Quality Framework'),
        body('IBM\'s Quality Engineering model embeds measurable validation checkpoints across every stage of development and production — creating a closed-loop feedback system within the CI/CD pipeline. Production insights, defect analytics, and automation metrics continuously refine testing strategies, enabling sustained defect reduction, faster recovery, and progressive quality improvement over time.'),
        colHead2('Quality Controls'),
        bullet('End-to-end traceability and release readiness visibility.'),
        bullet('Defect leakage, density, and stability metrics (MTTR).'),
        bullet('Automation coverage with KPI-driven governance.'),
        bullet('AI-driven defect insights and regression optimisation.'),
        bullet('Production telemetry feeding back into test strategy.'),
        colHead2('Intelligent Test Automation'),
        body('IBM\'s Generative AI capabilities enable self-generating test cases, automated test maintenance, and continuous validation integration — dramatically reducing the cost and time associated with regression testing across Horizon\'s complex, multi-system portfolio.'),
      ],
      [
        colHead('AI-Augmented Development Model'),
        body('IBM transforms Horizon\'s engineering model from a traditional project-centric approach to a modern, product-centric engineering organisation — powered by IBM Consulting Advantage accelerators and the BUILD ONCE, BENEFIT (BOB) framework of reusable enterprise assets.'),
        colHead2('AI-Assisted Development'),
        bullet('Generative AI tools accelerate code generation, review, documentation, and optimisation.'),
        bullet('Reduces developer toil and elevates focus to high-value engineering.'),
        bullet('IBM Consulting Advantage accelerators compress time-to-value.'),
        colHead2('DevSecOps Integration'),
        bullet('Security embedded "left" into CI/CD pipelines.'),
        bullet('Automated vulnerability scanning at every stage.'),
        bullet('Compliance gates and policy enforcement from commit to production.'),
        ...sp(1),
        callout(
          [BOLD('Target: ', { size: 21, color: IBM_NAVY }), R('80% test automation coverage across Horizon\'s application portfolio within 12 months of full deployment.', { size: 21, color: SLATE })],
          { bg: LIGHT_GRN, border: GREEN }
        ),
      ]
    ),
    ...sp(1),

    ...barChart('Quality KPI Improvement Targets (12-Month Programme)', [
      { label: 'Test Automation Coverage',    value: 80, color: GREEN      },
      { label: 'Defect Escape Rate Reduction', value: 65, color: IBM_BLUE  },
      { label: 'Regression Cycle Time Cut',   value: 70, color: TEAL       },
      { label: 'Test Maintenance Effort Reduced', value: 55, color: IBM_NAVY },
      { label: 'Production Incident Rate',    value: 40, color: ORANGE     },
    ], '%'),

    new Paragraph({
      children: [R('Figure 5: IBM\'s quality engineering targets for Horizon\'s AMS portfolio at 12-month programme maturity.', { size: 16, color: MID_GRAY, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),

    pgBreak(),
  ];
}

// ─── Page 8: Transformation Roadmap ──────────────────────────────────────────

function p8_roadmap() {
  return [
    ...sectionTitle(
      'Phased Transformation Roadmap',
      'A Structured, Compounding Journey from Stabilisation to Autonomous Operations'
    ),

    body('IBM\'s proposed transformation follows a structured, phased approach — delivering quick wins in the immediate term while building the foundation for long-term enterprise transformation. Each phase builds on the last, compounding value across the portfolio.'),
    ...sp(1),

    roadmapTable([
      {
        phase: 'Phase 0 — Foundation',
        timeframe: '0–8 Weeks',
        items: [
          'Command Center assessment & blueprint',
          'ICOE architecture definition',
          'Quote to Cart KPI alignment roadmap',
          'AIOps baseline measurement',
          'Risk-free transition planning',
        ],
      },
      {
        phase: 'Phase 1 — Ignite',
        timeframe: '1–3 Months',
        items: [
          'Integration Simplification & ICOE Modernisation Roadmap',
          'Document Generation modernisation (HLGS)',
          'Initial AIOps and monitoring deployment',
          'Test automation framework initiation',
          'Innovation Council formation',
        ],
      },
      {
        phase: 'Phase 2 — Scale',
        timeframe: '3–6 Months',
        items: [
          'Unified Payments & Mainframe modernisation',
          'COBOL → Java modernisation pilot',
          'AI-assisted Dev + Intelligent QA rollout',
          'Digital Front Door Phase 2–3 delivery',
          'Agentic AI incident triage live',
        ],
      },
      {
        phase: 'Phase 3 — Optimise',
        timeframe: '6–12 Months',
        items: [
          'Agentic AI for full incident autonomy',
          'Quote to Cart full production launch',
          'Claims adjudication parallel-run initiated',
          'GenAI development lifecycle integrated',
          'Predictive capacity management live',
        ],
      },
    ]),
    ...sp(1),

    twoCol(
      [
        colHead('Phase 4 — Transform (12–24 Months)'),
        bullet('Full autonomous operations for P3/P4 incidents.'),
        bullet('Mainframe eligibility processing on AWS — production.'),
        bullet('AI personalisation engine live (DFD Phase 4).'),
        bullet('COBOL → Java migration complete for pilot workstream.'),
        bullet('Enterprise-wide observability platform fully deployed.'),
        bullet('Claims adjudication cutover initiated.'),
      ],
      [
        colHead('Governance at Every Phase'),
        bullet('Executive Steering Committee: Quarterly IBM VP + Horizon CIO/COO review.'),
        bullet('Programme Management Office: Monthly health reporting and risk register.'),
        bullet('Delivery Operations Reviews: Bi-weekly SLA and incident trends.'),
        bullet('Financial Governance: Monthly actuals vs. committed model.'),
        bullet('Innovation Council: Quarterly idea pipeline and prioritisation.'),
      ]
    ),

    pgBreak(),
  ];
}

// ─── Page 9: Why IBM ──────────────────────────────────────────────────────────

function p9_whyIBM() {
  return [
    ...sectionTitle(
      'Why IBM as Your Transformation Partner',
      'Scale, Depth, and Skin in the Game'
    ),

    callout(
      [BOLD('IBM is the only partner', { size: 23, color: IBM_NAVY }), R(' that brings together AI-first operating platform capability, deep healthcare payer domain expertise, proven global delivery scale, and a willingness to ', { size: 23, color: SLATE }), BOLD('share outcome risk', { size: 23, color: IBM_BLUE }), R(' through an outcome-based engagement model.', { size: 23, color: SLATE })],
      { bg: LIGHT_BLUE, border: IBM_BLUE }
    ),
    ...sp(1),

    twoCol(
      [
        colHead('Enterprise Transformation, Not Just IT'),
        body('IBM\'s proposal delivers unified transformation across Operations, Development, and Quality Engineering — not siloed initiatives that optimise one tower while creating drag in another.'),
        body('IBM\'s delivery philosophy — AI-Embedded Operations, Scalable Architecture, and Outcome-Based Engagement — ensures that every IBM investment compounds Horizon\'s capability, not IBM\'s margin.'),
        colHead2('What Differentiates IBM'),
        bulletBold('Skin in the game:', 'Outcome-based engagement with IBM\'s full capability depth behind every phase — IBM\'s success is tied to Horizon\'s outcomes.'),
        bulletBold('AI at depth, not at surface:', 'IBM\'s Agentic AI, Generative AI, and AIOps capabilities are production-proven across healthcare and financial services — not proof-of-concept.'),
        bulletBold('The BOB Framework:', 'IBM\'s BUILD ONCE, BENEFIT reusable asset library compresses implementation time and reduces per-solution cost across the portfolio.'),
        bulletBold('Innovation Council:', 'IBM commits a structured quarterly innovation process — not ad hoc ideas, but governed, prioritised, business-case-backed innovation at Horizon\'s direction.'),
      ],
      [
        colHead('IBM\'s Global Delivery Strength'),
        kpiStrip([
          { value: '20K+', label: 'AI Practitioners', color: IBM_BLUE },
          { value: '81K+', label: 'Cloud Experts',    color: TEAL     },
        ]),
        kpiStrip([
          { value: '40K+', label: 'AI Engagements',   color: IBM_NAVY },
          { value: '15K+', label: 'Global Centres',   color: GREEN    },
        ]),
        ...sp(1),
        colHead2('Healthcare Payer Pedigree'),
        body('IBM brings deep healthcare payer expertise — including BCBS operating models, CMS regulatory compliance, HIPAA data governance, enrollment lifecycle management, and claims adjudication platform knowledge — directly into Horizon\'s delivery team from Day 1.'),
        ...sp(1),
        sideBar('Key References', [
          'Partner of the Year 2023 — Enterprise AI delivery',
          'Leader in Enterprise Software Quality & Testing',
          'Proven BCBS engagement track record',
          'CMS & HIPAA compliance expertise',
        ], { bg: LIGHT_BLUE, border: IBM_BLUE }),
      ]
    ),

    pgBreak(),
  ];
}

// ─── Page 10: Next Steps & Appendix ──────────────────────────────────────────

function p10_nextSteps() {
  return [
    ...sectionTitle(
      'Recommended Next Steps',
      'From Proposal to Partnership — IBM\'s Proposed Engagement Path'
    ),

    twoCol(
      [
        colHead('Immediate Actions (2–4 Weeks)'),
        bullet('Schedule Executive Alignment Session — IBM VP + Horizon CIO/COO to confirm transformation vision and programme scope.'),
        bullet('Conduct Command Center Walkthrough — Live demonstration of CareOps360 platform with Horizon\'s operational and technology leadership.'),
        bullet('Initiate Contract Finalisation — Confirm outcome-based SLA schedule and investment model.'),
        bullet('Begin Phase 0 Foundation Assessment — IBM AMS team on-site to conduct application portfolio and AIOps baseline assessment.'),
        ...sp(1),
        colHead('Phase 0 Commitments (Weeks 1–8)'),
        bulletBold('Week 1–2:', 'IBM transition team mobilised; AIOps instrumentation begins across priority applications.'),
        bulletBold('Week 3–4:', 'ICOE architecture definition workshop; Quote to Cart KPI alignment roadmap delivered.'),
        bulletBold('Week 5–6:', 'Phase 1 Ignite plan presented to Steering Committee.'),
        bulletBold('Week 7–8:', 'Innovation Council inaugural session — first idea pipeline scoped.'),
      ],
      [
        colHead('What IBM Needs from Horizon'),
        bullet('Executive sponsorship confirmed with a named Horizon programme owner.'),
        bullet('Access to application inventory, current SLA performance data, and AMS tooling estate.'),
        bullet('Introduction to Horizon\'s technology and operations leadership teams.'),
        bullet('Agreement on data governance and security protocols for CareOps360 production integration.'),
        ...sp(1),
        callout(
          [BOLD('IBM is ready to begin. ', { size: 21, color: IBM_NAVY }), R('With your confirmation, Phase 0 can mobilise within 5 business days.', { size: 21, color: SLATE })],
          { bg: LIGHT_GRN, border: GREEN }
        ),
        ...sp(1),
        colHead2('Appendix: Workforce Certification'),
        bodySmall('As of April 2026, IBM\'s delivery team at Horizon carries 382 certified professionals across 4,599 certifications spanning AI/ML (307), Healthcare (342), IBM Products (338), and Cloud (250) domains. This credentialled workforce directly enables the AI-first delivery model described in this proposal.'),
      ]
    ),
    ...sp(2),

    // Closing statement
    new Table({
      layout: TableLayoutType.FIXED,
      width: { size: FULL_WIDTH, type: WidthType.DXA },
      borders: { top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE},insideH:{style:BorderStyle.NONE},insideV:{style:BorderStyle.NONE} },
      rows: [new TableRow({ children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [BOLD('A Strategic Partnership for Enterprise Transformation', { size: 28, color: WHITE })],
              spacing: { before: 80, after: 80 },
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [R('IBM is committed to Horizon\'s success — not as a vendor, but as a transformation partner with shared stakes in every outcome.', { size: 21, color: LIGHT_BLUE })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
            }),
          ],
          shading: { fill: IBM_NAVY, type: ShadingType.CLEAR },
          margins: { top: 200, bottom: 200, left: 280, right: 280 },
          borders: { top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE} },
        }),
      ]})],
    }),

    ...sp(1),
    new Paragraph({
      children: [R('© 2026 IBM Corporation  ·  IBM-HZN-AMS-RFP-2026-CAS  ·  Confidential — Executive Use Only  ·  All figures are based on IBM programme data and industry benchmarks.', { size: 16, color: MID_GRAY, italics: true })],
      alignment: AlignmentType.CENTER,
    }),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Assemble & Write
// ═══════════════════════════════════════════════════════════════════════════════

const doc = new Document({
  title: 'IBM AI-First Transformation Proposal — Horizon BCBS',
  creator: 'IBM Consulting — Healthcare & Payer Delivery',
  description: 'Executive white paper: IBM\'s AI-first AMS transformation proposal for Horizon Blue Cross Blue Shield of New Jersey.',
  sections: [
    {
      properties: {
        page: { margin: { top: 864, bottom: 864, left: 864, right: 864 } },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                R('IBM × HORIZON BCBS  ', { size: 16, color: IBM_BLUE, bold: true }),
                R('|  AI-FIRST TRANSFORMATION PROPOSAL  |  CONFIDENTIAL  |  APRIL 2026', { size: 16, color: MID_GRAY }),
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
              children: [R('© 2026 IBM Corporation. Confidential and Proprietary.  IBM-HZN-AMS-RFP-2026-CAS', { size: 16, color: MID_GRAY, italics: true })],
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: IBM_BLUE, space: 4 } },
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      children: [
        ...cover(),
        ...p1_execSummary(),
        ...p2_imperative(),
        ...p3_commandCenter(),
        ...p4_dfd(),
        ...p5_aiops(),
        ...p6_modernisation(),
        ...p7_qualityDev(),
        ...p8_roadmap(),
        ...p9_whyIBM(),
        ...p10_nextSteps(),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync('IBM_Horizon_AI_Transformation_Proposal_Apr2026.docx', buffer);
console.log('White paper written successfully.');
