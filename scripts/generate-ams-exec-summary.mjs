/**
 * IBM × Horizon BCBS — Application Development, Maintenance & Quality Engineering
 * Executive Summary — C-Suite — 10 Pages — Consulting Grade
 *
 * Layout: Single-column + two-column ghost tables for dense content
 * Style:  Elegant, crisp, white-paper grade
 */

import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle, WidthType,
  ShadingType, TableLayoutType, Header, Footer, PageNumber,
  convertInchesToTwip,
} from "docx";
import { writeFileSync } from "fs";

const C = {
  blue: "0F62FE", navy: "001141", teal: "007D79", azure: "0043CE",
  purp: "6929C4", green: "198038", red: "DA1E28", white: "FFFFFF",
  g10: "F4F4F4", g20: "E0E0E0", g50: "8D8D8D", g70: "525252",
  g100: "161616", lb1: "EBF2FF", lb2: "D0E2FF",
};

const FN  = "Calibri";
const hp  = pt => Math.round(pt * 2);
const sp  = pt => Math.round(pt * 20);
const inc = n  => convertInchesToTwip(n);
const W   = 9360;
const sh  = fill => ({ type: ShadingType.CLEAR, fill });

const BN = { style: BorderStyle.NONE, size: 0, color: "auto" };
const BT = { style: BorderStyle.SINGLE, size: 4, color: C.g20 };
const BM = { style: BorderStyle.SINGLE, size: 6, color: C.g20 };
const BB = { style: BorderStyle.SINGLE, size: 14, color: C.blue };
const NB = { top: BN, bottom: BN, left: BN, right: BN, insideH: BN, insideV: BN };
const CB = { top: BT, bottom: BT, left: BT, right: BT };

const R = (t, o = {}) => new TextRun({ text: t, font: FN, size: hp(o.sz ?? 10), bold: o.b ?? false, italics: o.i ?? false, color: o.c ?? C.g100 });
const P = (runs, o = {}) => new Paragraph({ children: Array.isArray(runs) ? runs : [runs], spacing: { before: sp(o.bef ?? 0), after: sp(o.aft ?? 0) }, alignment: o.al, indent: (o.l || o.r) ? { left: sp(o.l ?? 0), right: sp(o.r ?? 0) } : undefined, border: o.bd, shading: o.bg ? sh(o.bg) : undefined, pageBreakBefore: o.pb ?? false });
const GAP = (pt = 4) => new Paragraph({ children: [new TextRun({ text: "", font: FN, size: hp(4) })], spacing: { before: 0, after: sp(pt) } });

const BODY = (t, o = {}) => P([R(t, { sz: o.sz ?? 10, c: o.c ?? C.g70, i: o.i })], { aft: o.aft ?? 4, bef: o.bef ?? 0, al: o.al });
const BULL = (t, o = {}) => new Paragraph({ children: [R(t, { sz: o.sz ?? 9.5, c: o.c ?? C.g70 })], bullet: { level: 0 }, spacing: { before: sp(0.5), after: sp(2.5) } });

const SEC = (num, title, sub = "", pb = true) => [
  new Paragraph({ children: [], border: { top: { style: BorderStyle.SINGLE, size: 18, color: C.blue, space: 8 } }, spacing: { before: sp(pb ? 0 : 10), after: sp(3) }, pageBreakBefore: pb }),
  new Paragraph({ children: [R(num + "  ", { sz: 9, b: true, c: C.blue }), R(title, { sz: 16, b: true, c: C.navy })], spacing: { before: 0, after: sub ? sp(2) : sp(6) } }),
  ...(sub ? [BODY(sub, { i: true, sz: 9.5, aft: 6, c: C.g50 })] : []),
];
const H2 = (t, o = {}) => P([R(t, { sz: 11, b: true, c: o.c ?? C.navy })], { bef: o.bef ?? 8, aft: o.aft ?? 3 });
const H3 = (t, o = {}) => P([R(t, { sz: 10, b: true, c: o.c ?? C.blue })], { bef: o.bef ?? 5, aft: o.aft ?? 2 });

const Q = (text, attr = "") => [
  GAP(3),
  new Paragraph({ children: [R("\u201C" + text + "\u201D", { sz: 10.5, i: true, c: C.navy })], spacing: { before: sp(2), after: sp(attr ? 1 : 4) }, indent: { left: inc(0.35) }, border: { left: { style: BorderStyle.SINGLE, size: 18, color: C.blue, space: 10 } } }),
  ...(attr ? [P([R("\u2014 " + attr, { sz: 8.5, b: true, c: C.blue })], { bef: 0, aft: 5, al: AlignmentType.RIGHT })] : []),
];

const CALL = (t, fill = C.lb1, c = C.navy) => new Paragraph({ children: [R(t, { sz: 10, b: true, c })], shading: sh(fill), spacing: { before: sp(5), after: sp(5) }, indent: { left: inc(0.2), right: inc(0.2) } });

// Table helpers
const gc = (items, w) => new TableCell({ children: Array.isArray(items) ? items : [items], shading: sh(C.white), width: w ? { size: Math.round(w), type: WidthType.DXA } : undefined, borders: NB, margins: { top: 0, bottom: 0, left: sp(2), right: sp(2) }, verticalAlign: "top" });
const HC = (t, w, o = {}) => new TableCell({ children: [new Paragraph({ children: [R(t, { sz: 9, b: true, c: o.c ?? C.navy })], spacing: { before: sp(2.5), after: sp(2.5) }, alignment: o.al })], shading: sh(o.f ?? C.lb2), width: w ? { size: Math.round(w), type: WidthType.DXA } : undefined, borders: { top: BB, bottom: BM, left: BT, right: BT }, margins: { top: sp(2), bottom: sp(2), left: sp(6), right: sp(6) }, verticalAlign: "center" });
const DC = (t, w, o = {}) => new TableCell({ children: [new Paragraph({ children: [R(t, { sz: o.sz ?? 9, b: o.b ?? false, c: o.c ?? C.g100, i: o.i })], spacing: { before: sp(1.5), after: sp(1.5) }, alignment: o.al })], shading: sh(o.f ?? C.white), width: w ? { size: Math.round(w), type: WidthType.DXA } : undefined, borders: CB, margins: { top: sp(2), bottom: sp(2), left: sp(6), right: sp(6) }, verticalAlign: "center" });
const VC = (t, w, o = {}) => DC(t, w, { b: true, c: C.blue, f: C.lb1, ...o });
const TBL = (rows, w = W) => new Table({ width: { size: Math.round(w), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NB, rows });
const alt = i => (i % 2 === 0 ? C.white : C.g10);

// Two-column ghost layout
const TWO = (left, right, sl = 0.47) => TBL([new TableRow({ children: [
  gc(left,    W * sl),
  gc([GAP(0)], W * 0.06),
  gc(right,   W * (1 - sl - 0.06)),
]})], W);

// Stat boxes
const STAT = items => TBL([new TableRow({ children: items.map(([val, lab, col = C.blue]) => new TableCell({
  children: [
    new Paragraph({ children: [R(val, { sz: 24, b: true, c: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(6), after: sp(2) } }),
    new Paragraph({ children: [R(lab, { sz: 8.5, b: true, c: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(6) } }),
  ],
  shading: sh(C.lb1), width: { size: Math.round(W / items.length), type: WidthType.DXA },
  borders: { top: { style: BorderStyle.SINGLE, size: 10, color: col }, bottom: BT, left: BT, right: BT },
  margins: { top: sp(3), bottom: sp(3), left: sp(4), right: sp(4) }, verticalAlign: "center",
})) })], W);

// Pipeline step
const STEP = (n, title, lines, col = C.blue) => new TableCell({
  children: [
    new Paragraph({ children: [R("STEP " + n, { sz: 7, b: true, c: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(4), after: sp(1) } }),
    new Paragraph({ children: [R(title, { sz: 9.5, b: true, c: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(3) } }),
    ...lines.map(l => new Paragraph({ children: [R(l, { sz: 8.5, c: C.g70 })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(1.5) } })),
    GAP(3),
  ],
  shading: sh(C.white), width: { size: Math.round(W / 5), type: WidthType.DXA },
  margins: { top: sp(3), bottom: sp(3), left: sp(4), right: sp(4) },
  borders: { top: { style: BorderStyle.SINGLE, size: 16, color: col }, bottom: BT, left: BT, right: BT },
});

// Bar chart
const BAR = (label, pct, val, col = C.blue) => {
  const lw = 2800, vw = 1160, bw = W - lw - vw;
  const f = Math.round(bw * Math.min(pct, 100) / 100);
  return new TableRow({ children: [
    new TableCell({ children: [BODY(label, { sz: 9, aft: 0 })], width: { size: lw, type: WidthType.DXA }, shading: sh(C.white), borders: NB, margins: { top: sp(2), bottom: sp(2), right: sp(4) }, verticalAlign: "center" }),
    new TableCell({ children: [GAP(0)], width: { size: f, type: WidthType.DXA }, shading: sh(col), borders: NB }),
    new TableCell({ children: [GAP(0)], width: { size: bw - f, type: WidthType.DXA }, shading: sh(C.g20), borders: NB }),
    new TableCell({ children: [P([R(val, { sz: 9, b: true, c: col })], { aft: 0, al: AlignmentType.RIGHT })], width: { size: vw, type: WidthType.DXA }, shading: sh(C.white), borders: NB, margins: { top: sp(2), bottom: sp(2), left: sp(4) }, verticalAlign: "center" }),
  ]});
};

const MG = { top: inc(0.80), bottom: inc(0.65), left: inc(0.9), right: inc(0.9) };
const HDR = () => new Header({ children: [new Paragraph({ children: [R("IBM \u00D7 HORIZON BCBS  |  APP DEV, MAINTENANCE & QUALITY ENGINEERING  |  CONFIDENTIAL", { sz: 7, b: true, c: C.g50 })], alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: C.blue, space: 5 } }, spacing: { after: 0 } })] });
const FTR = () => new Footer({ children: [new Paragraph({ children: [R("CareOps360  \u00B7  IBM AIOps  \u00B7  IBM Consulting Advantage  \u00B7  April 2026  |  ", { sz: 7, c: C.blue }), new TextRun({ children: [PageNumber.CURRENT], font: FN, size: hp(7), color: C.g50 })], border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.g20, space: 3 } }, spacing: { before: sp(2), after: 0 } })] });
const hf = () => ({ headers: { default: HDR() }, footers: { default: FTR() } });

// ════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  creator: "IBM Consulting",
  title: "IBM \u00D7 Horizon BCBS \u2014 App Dev, Maintenance & Quality Engineering",
  sections: [

    // ═══════════════════════════════════════════════════════════════════════
    //  PAGE 1 — COVER
    // ═══════════════════════════════════════════════════════════════════════
    { properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } }, children: [
      new Paragraph({ children: [R("  IBM CONSULTING   |   HEALTHCARE & PAYER DELIVERY   |   AMS PRACTICE", { sz: 8.5, b: true, c: C.white })], shading: sh(C.navy), spacing: { before: sp(12), after: sp(12) } }),
      new Paragraph({ children: [], shading: sh(C.blue), spacing: { before: 0, after: sp(2) } }),

      GAP(40),

      P([R("AI-FIRST  \u00B7  AGENTIC BY CORE", { sz: 22, b: true, c: C.blue })], { aft: 6, l: 55 }),
      new Paragraph({ children: [R("Application Development,", { sz: 36, b: true, c: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inc(1.1) } }),
      new Paragraph({ children: [R("Maintenance &", { sz: 36, b: true, c: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inc(1.1) } }),
      new Paragraph({ children: [R("Quality Engineering", { sz: 36, b: true, c: C.blue })], spacing: { before: 0, after: sp(10) }, indent: { left: inc(1.1) } }),

      P([R("An Executive Summary for Horizon BCBS Leadership", { sz: 13, i: true, c: C.g50 })], { aft: 4, l: 55 }),
      P([R("Where Every Line of Code, Every Test, and Every Resolved Incident\nIs Measured by the Member It Serves", { sz: 11, i: true, c: C.g70 })], { aft: 30, l: 55 }),

      TBL([new TableRow({ children: [
        gc([P([R("Submitted by:", { sz: 9.5, b: true, c: C.navy })], { aft: 1 }), BODY("IBM Consulting \u2014 Healthcare & Payer Delivery", { aft: 0, sz: 9.5 })], W * 0.44),
        gc([P([R("Submitted to:", { sz: 9.5, b: true, c: C.navy })], { aft: 1 }), BODY("Horizon BCBS \u2014 Executive Leadership & Technology Office", { aft: 0, sz: 9.5 })], W * 0.56),
      ]})], W),

      GAP(4),
      TBL([new TableRow({ children: [gc([
        P([R("Confidential  |  April 2026  |  Ref: IBM-HZN-AMS-RFP-2026-CAS", { sz: 9, c: C.g50 })], { aft: 0 }),
      ], W)]})], W),

      GAP(42),

      new Paragraph({ children: [R("  Powered by CareOps360  \u00B7  IBM AIOps  \u00B7  IBM Consulting Advantage  \u00B7  HIPAA Compliant  \u00B7  \u00A9 2026 IBM Corporation", { sz: 8, c: C.white })], shading: sh(C.navy), spacing: { before: sp(4), after: sp(4) } }),
    ]},

    // ═══════════════════════════════════════════════════════════════════════
    //  CONTENT
    // ═══════════════════════════════════════════════════════════════════════
    { properties: { page: { margin: MG } }, ...hf(), children: [

      // ─── PAGE 2: EXECUTIVE SUMMARY ─────────────────────────────────────
      ...SEC("01", "Executive Summary", "AI-First, Member-Centred Transformation of Application Management Services"),

      ...Q(
        "A mother enrolling her newborn should not wait five days because two systems failed to sync. A provider submitting a prior auth should not chase a fax. IBM is here to make those moments disappear.",
        "IBM Consulting, Healthcare & Payer Delivery"
      ),

      TWO(
        [
          H2("The Moment", { bef: 2 }),
          BODY("Horizon BCBS manages ~1,000 applications spanning enrollment, claims, member services, provider operations, and data platforms. The incumbent model \u2014 reactive, labor-intensive, fragmented \u2014 cannot meet Horizon\u2019s growth objectives or the expectations of its 3.7 million members."),
          BODY("Horizon needs a fundamentally different operating model \u2014 one where AI is the engine, quality is continuous, delivery is zero-touch, and every metric connects to a member, a provider, or a patient."),

          H2("What IBM Proposes", { bef: 4 }),
          BODY("A structured transition from reactive support to a predictive, self-healing, AI-first operating model \u2014 delivered through IBM\u2019s Assets, Assistants & Accelerators framework and governed through outcome-based accountability that ties IBM\u2019s performance directly to Horizon\u2019s business results."),
        ],
        [
          H2("Five Strategic Commitments", { bef: 2 }),
          BULL("AI-First Operating Model \u2014 AI across every layer of dev, quality, and operations. Built in, not bolted on."),
          BULL("Tech Arbitrage over Labor Arbitrage \u2014 Cost compression through automation, not headcount."),
          BULL("Outcome-Based Delivery \u2014 SLAs tied to business outcomes. IBM carries the delivery risk."),
          BULL("Zero-Disruption Transition \u2014 No production disruption. No member impact. No learning curve."),
          BULL("Agentic by Core \u2014 AI agents that detect, triage, diagnose, resolve, and learn autonomously."),

          H2("IBM\u2019s Scale", { bef: 4 }),
          BULL("20,000+ AI practitioners  \u00B7  81,000+ cloud experts"),
          BULL("40,000+ AI engagements  \u00B7  9 of top 10 US health payers"),
          BULL("Client-0 AI programme saved IBM ~$3.4B USD"),
        ],
      ),

      GAP(8),
      STAT([
        ["~1,000",    "Applications in Scope",      C.blue  ],
        ["Day 1",     "Efficiencies & Cost Takeout", C.azure ],
        ["24\u00D77", "Global AIOps Coverage",       C.teal  ],
        ["AI-First",  "Agentic by Core",             C.purp  ],
      ]),


      // ─── PAGE 3: THE DELIVERY IMPERATIVE ───────────────────────────────
      ...SEC("02", "The Delivery Imperative", "Why Horizon Needs a New Operating Model \u2014 and Why Now"),

      ...Q(
        "The question is not whether Horizon can afford to transform. It is whether Horizon can afford not to \u2014 when every delayed claim is a member who loses trust, and every manual process is a cost that compounds.",
        "IBM Consulting \u2014 Payer Strategy"
      ),

      TWO(
        [
          H2("What Horizon Needs", { bef: 2 }),
          BODY("A strategic partner to transform Application Development, Maintenance, Data, and Testing \u2014 with AI solutions native to the Horizon environment."),
          H2("Transformation Goals", { bef: 4 }),
          BULL("AI-driven operational efficiencies across all AMS towers"),
          BULL("Product-oriented model aligned to business domains"),
          BULL("Automation in testing and QE to measurably reduce cost"),
          BULL("Agile modernization across the ~1,000-app portfolio"),
          BULL("Deep healthcare payer consulting expertise"),
        ],
        [
          H2("IBM\u2019s Design Rationale", { bef: 2 }),
          H3("End-to-End Delivery"),
          BODY("Unified model across Maintenance, Dev, Testing, Data. No silos. One team, one backlog, one set of outcomes.", { sz: 9.5 }),
          H3("AI at the Core"),
          BODY("AI embedded in triage, RCA, resolution, test automation, and validation from Day 1.", { sz: 9.5 }),
          H3("Zero-Disruption Transition"),
          BODY("Phased approach preserving operational continuity. Zero member impact.", { sz: 9.5 }),
          H3("Open Architecture"),
          BODY("Deployed on Horizon\u2019s AWS stack. No vendor lock-in.", { sz: 9.5 }),
        ],
      ),

      GAP(6),
      H2("Current State vs. IBM 12-Month Targets"),
      BODY("Estimates are directional; formally baselined during SOW. Committed targets agreed at programme commencement.", { sz: 8.5, c: C.g50, i: true, aft: 4 }),
      TBL([
        new TableRow({ children: [HC("Metric", W*0.34), HC("Current", W*0.18), HC("IBM Target", W*0.22), HC("Direction", W*0.26)] }),
        ...[ ["Test Automation Coverage",       "~25%",            "80%+",                 "\u2191 +3\u00D7"],
             ["MTTR (Mean Time to Resolve)",    "> 4 hours",       "< 1.8 hours",          "\u2193 55%"],
             ["Defect Escape to Production",    "Untracked",       "65% Reduction",        "\u2193 Best-in-class"],
             ["P3/P4 Auto-Resolution",          "< 10%",           "> 74%",                "\u2191 7\u00D7"],
             ["Regression Cycle Time",          "Multi-day",       "70% Faster",           "\u2193 Automated"],
             ["Alert Noise per Shift",          "Unfiltered",      "> 60% Reduced",        "\u2193 AI-filtered"],
             ["System Availability",            "~99.7%",          "99.9%+",               "\u2191 AI-ops"],
        ].map(([a,b,c,d], i) => new TableRow({ children: [
          DC(a, W*0.34, { b: true, f: alt(i) }),
          DC(b, W*0.18, { c: C.red, f: alt(i), al: AlignmentType.CENTER }),
          VC(c, W*0.22, { al: AlignmentType.CENTER }),
          DC(d, W*0.26, { c: C.blue, b: true, f: alt(i), al: AlignmentType.CENTER }),
        ]})),
      ], W),


      // ─── PAGE 4: AI-FIRST APPLICATION DEVELOPMENT ──────────────────────
      ...SEC("03", "AI-First Application Development", "Agentic Engineering  \u00B7  Risk-Scored Pipelines  \u00B7  Domain-Aligned Squads"),

      ...Q(
        "When a member\u2019s enrollment takes two weeks because a downstream app is slow, that is not a technology problem \u2014 that is a trust problem. Every sprint is measured by whether the member\u2019s experience got better.",
        "IBM \u2014 Member Experience Engineering"
      ),

      TWO(
        [
          H2("How IBM Builds Faster", { bef: 2 }),
          H3("AI-Assisted Development"),
          BODY("GenAI accelerates code generation, review, and documentation. Developer throughput +25\u201335% without adding headcount. IBM Consulting Advantage: 6,500+ production-tested assets.", { sz: 9.5 }),
          H3("DevSecOps Integration"),
          BODY("Security embedded left into CI/CD. Automated vulnerability scanning at every stage. HIPAA, CMS, PCI compliance automated.", { sz: 9.5 }),
          H3("Domain-Aligned Squads"),
          BODY("Teams aligned to Claims, Enrollment, Member, Provider, Data. Context stays with the squad. Accountability is end-to-end.", { sz: 9.5 }),
        ],
        [
          GAP(18),
          H3("Risk-Scored Releases"),
          BODY("AI-scored gates: security, coverage, performance, historical risk. Low-risk deploys without human approval. Faster delivery, fewer incidents.", { sz: 9.5 }),
          H3("Modernization in Stride"),
          BODY("Embedded in every sprint \u2014 refactor, API wrap, library upgrade. The estate improves continuously without a separate capital programme.", { sz: 9.5 }),

          GAP(4),
          CALL("25\u201340% faster time to market within 12 months"),
        ],
      ),

      GAP(6),
      H2("Development Efficiency Gains"),
      TBL([
        BAR("AI-assisted code generation",       80, "+30% capacity",     C.blue),
        BAR("Automated QE test synthesis",       75, "+25% QE speed",    C.teal),
        BAR("Risk-scored deployment pipeline",   70, "\u221260% failures", C.azure),
        BAR("Domain squad alignment",            65, "\u221240% handoffs", C.purp),
        BAR("Modernization-in-stride",           60, "Debt \u221230%/yr", "005D5D"),
      ], W),

      GAP(6),
      STAT([
        ["25\u201340%", "Faster Time to Market", C.blue  ],
        ["2\u00D7",     "Deploy Frequency",      C.azure ],
        ["\u221260%",   "Change Failure Rate",   C.teal  ],
        ["80%+",        "Test Automation",        C.purp  ],
      ]),


      // ─── PAGE 5: ZERO-TOUCH OPERATIONS & AIOPS ─────────────────────────
      ...SEC("04", "Zero-Touch Application Maintenance", "Agentic AI Operations \u2014 From Reactive Firefighting to Self-Healing"),

      ...Q(
        "When a claims system fails at 2 AM, the first responder should be an AI agent \u2014 not a sleep-deprived engineer. The provider should never know. The member should never feel it. That is zero-touch.",
        "IBM AIOps"
      ),

      BODY("IBM\u2019s AIOps framework uses a multi-agent architecture \u2014 specialized AI agents across the incident lifecycle from detection through resolution and continuous learning. Built on Horizon\u2019s AWS stack: AgentCore & Bedrock, ElasticSearch, PostgreSQL, ServiceNow, CloudWatch, Splunk."),

      TWO(
        [
          H2("Agent Roles", { bef: 4 }),
          H3("Help Desk Agent"),
          BODY("Context-aware guidance; auto-resolves issues before ticket creation.", { sz: 9.5 }),
          H3("Triage Agent"),
          BODY("Impact-based prioritization; eliminates manual queue management.", { sz: 9.5 }),
          H3("Root Cause Analysis"),
          BODY("Correlates 140+ sources; identifies root cause in minutes, not hours.", { sz: 9.5 }),
        ],
        [
          GAP(24),
          H3("Resolution Agent"),
          BODY("Executes remediation from runbooks. >74% of P3/P4 incidents resolved without human action.", { sz: 9.5 }),
          H3("Runbook Generation"),
          BODY("Auto-generates runbooks from resolved incidents. Knowledge compounds; no institutional memory loss.", { sz: 9.5 }),
          H3("Continuous Learning"),
          BODY("Production telemetry feeds all agents. Month 12 is fundamentally smarter than Month 1.", { sz: 9.5 }),
        ],
      ),

      GAP(4),
      H2("Zero-Touch Pipeline"),
      TBL([new TableRow({ children: [
        STEP("1", "Detect",   ["140+ sources", "Noise >60% cut"],    C.blue),
        STEP("2", "Triage",   ["Impact scoring", "Route instantly"], "0072C3"),
        STEP("3", "Diagnose", ["Root cause", "in minutes"],          C.azure),
        STEP("4", "Resolve",  ["Self-heal P3/P4", "Zero touch"],     C.teal),
        STEP("5", "Learn",    ["Update runbooks", "Prevent repeat"], "005D5D"),
      ]})], W),

      GAP(6),
      STAT([
        [">74%",     "P3/P4 Auto-Resolved",  C.blue  ],
        [">60%",     "Alert Noise Reduced",    C.teal  ],
        ["99.9%+",   "Availability Target",    C.azure ],
        ["<1.8 hrs", "Mean Time to Resolve",   C.purp  ],
      ]),


      // ─── PAGE 6: QUALITY ENGINEERING ───────────────────────────────────
      ...SEC("05", "Quality Engineering", "Measurable Quality at Every Milestone \u2014 Improved with Every Release"),

      ...Q(
        "Every undetected defect in a claims system is a patient who doesn\u2019t get care on time. Every missed test is a provider who submits correctly and gets denied. Quality is not a phase. Quality is the promise.",
        "IBM Quality Engineering"
      ),

      TWO(
        [
          H2("Self-Improving Framework", { bef: 2 }),
          BODY("Closed-loop feedback within CI/CD. Production insights, defect analytics, and automation metrics continuously refine testing \u2014 sustaining defect reduction with every release across ~1,000 applications."),

          H2("AI-Powered Capabilities", { bef: 4 }),
          H3("GenAI Test Generation"),
          BODY("AI synthesises tests from code changes at commit speed. Coverage grows without manual test plans.", { sz: 9.5 }),
          H3("Defect Prediction"),
          BODY("Models trained on Horizon\u2019s incident history identify high-risk paths before UAT.", { sz: 9.5 }),
          H3("Production Feedback Loop"),
          BODY("Every production defect teaches the engine. The net tightens automatically every release.", { sz: 9.5 }),
        ],
        [
          H2("Quality Controls", { bef: 2 }),
          BULL("End-to-end traceability and release readiness"),
          BULL("Defect leakage, density, stability metrics (MTTR)"),
          BULL("Automation coverage with KPI governance"),
          BULL("AI-driven defect insights and regression optimisation"),
          BULL("Production telemetry feeding back into test strategy"),

          GAP(2),
          CALL("Target: 80%+ test automation in 12 months"),

          GAP(2),
          H2("Coverage Journey", { bef: 2 }),
          TBL([
            BAR("Month 0",  25, "~25%",  C.g50),
            BAR("Month 3",  45, "45%",   "0072C3"),
            BAR("Month 6",  55, "55%",   C.azure),
            BAR("Month 9",  72, "72%",   C.blue),
            BAR("Month 12", 82, "80%+",  C.navy),
          ], W * 0.47),
        ],
      ),

      GAP(4),
      H2("Quality Metrics \u2014 Before & After"),
      TBL([
        new TableRow({ children: [HC("Metric", W*0.26), HC("Current", W*0.16), HC("6-Mo", W*0.14), HC("12-Mo", W*0.14), HC("Method", W*0.30)] }),
        ...[ ["Test Automation",   "~25%",         "55%",          "80%+",          "GenAI self-generating tests"],
             ["Defect Escape",     "High",         "\u221240%",    "\u221265%",     "AI defect prediction"],
             ["Regression Cycle",  "Multi-day",    "50% faster",   "70% faster",    "Intelligent test selection"],
             ["Time to Detect",    "> 2 hrs",      "< 30 min",     "< 15 min",      "AIOps + telemetry"],
             ["AI Test Cases",     "< 5%",         "40%+",         "> 70%",         "IBM Consulting Advantage"],
             ["Defect Leakage",    "Quarterly",    "Monthly SLA",  "Zero-leakage",  "End-to-end traceability"],
        ].map(([a,b,c,d,e], i) => new TableRow({ children: [
          DC(a, W*0.26, { b: true, f: alt(i) }),
          DC(b, W*0.16, { c: C.red, f: alt(i), al: AlignmentType.CENTER }),
          DC(c, W*0.14, { c: C.azure, f: alt(i), al: AlignmentType.CENTER }),
          VC(d, W*0.14, { al: AlignmentType.CENTER }),
          DC(e, W*0.30, { c: C.g70, f: alt(i), sz: 8.5 }),
        ]})),
      ], W),


      // ─── PAGE 7: MEMBER & PROVIDER EXPERIENCE ─────────────────────────
      ...SEC("06", "Member & Provider Experience", "Every Operational Improvement Measured by the Human It Serves"),

      ...Q(
        "The best technology is invisible to the member. The claim processes correctly. The prior auth comes back in hours, not days. The enrollment is seamless. That is the measure. Everything else is infrastructure.",
        "IBM \u2014 Healthcare Payer Design"
      ),

      TWO(
        [
          H2("Claims Operations", { bef: 2 }),
          BODY("Real-time visibility from receipt through adjudication, settlement, and denial management via CareOps360."),
          BULL("AI auto-adjudication rules engine"),
          BULL("Denial pattern analytics by procedure, eligibility, COB"),
          BULL("Real-time dashboard: volume, TAT, denial drivers"),
          BULL("SLA-bound adjudication commitments"),

          GAP(4),
          H2("Enrollment Intelligence", { bef: 2 }),
          BODY("Transform reactive batch enrollment into proactive, real-time, AI-augmented operations."),
          BULL("Canonical 834 transformation at intake"),
          BULL("Real-time validation \u2014 errors in minutes, not hours"),
          BULL("Shift-left member mastering \u2014 COB resolved earlier"),
          BULL("Agentic remediation with confidence scoring"),
        ],
        [
          H2("Prior Authorization", { bef: 2 }),
          BODY("AI-assisted review: triage, auto-approve low-risk, flag complex cases for expedited human review."),
          TBL([
            new TableRow({ children: [HC("Metric", W*0.23), HC("Target", W*0.24)] }),
            ...[ ["Review Hours",     "\u221230%+"],
                 ["Urgent SLA",       "100% within 72 hrs"],
                 ["Backlog",          "Monthly reduction"],
                 ["Auto-Approval",    ">40% by Month 12"],
            ].map(([a,b], i) => new TableRow({ children: [DC(a, W*0.23, { b: true, f: alt(i), sz: 8.5 }), VC(b, W*0.24, { sz: 8.5 })] })),
          ], W * 0.47),

          GAP(4),
          H2("Business Domain KPIs", { bef: 2 }),
          TBL([
            new TableRow({ children: [HC("Domain", W*0.17), HC("Metric", W*0.20), HC("Target", W*0.10)] }),
            ...[ ["Claims",     "Cycle time",         "\u221230%"],
                 ["Enrollment", "Time-to-good",       "\u221240%"],
                 ["Member",     "First-contact res.",  "+25%"],
                 ["Provider",   "Auth auto-approve",  ">40%"],
                 ["IT Ops",     "Auto-resolution",    ">74%"],
            ].map(([a,b,c], i) => new TableRow({ children: [DC(a, W*0.17, { b: true, f: alt(i), sz: 8.5 }), DC(b, W*0.20, { c: C.g70, f: alt(i), sz: 8.5 }), VC(c, W*0.10, { sz: 8.5, al: AlignmentType.CENTER })] })),
          ], W * 0.47),
        ],
      ),


      // ─── PAGE 8: CAREOPS360 + GOVERNANCE ───────────────────────────────
      ...SEC("07", "CareOps360 & Governance", "Real-Time Executive Visibility  \u00B7  No Manual Reporting  \u00B7  Live Data, Always"),

      ...Q(
        "Horizon\u2019s leadership should never ask \u2018how are we doing?\u2019 and wait for a deck. The answer should be live, accurate, and one click away \u2014 every hour of every day.",
        "IBM \u2014 Executive Visibility"
      ),

      TWO(
        [
          H2("What Is CareOps360?", { bef: 2 }),
          BODY("IBM\u2019s production-grade executive operations platform \u2014 real-time intelligence across all AMS towers through a single command center. Deployed in production-equivalent environment; architecture-ready for live data."),

          H2("Dashboards", { bef: 4 }),
          BULL("Executive Overview \u2014 8 real-time KPI tiles"),
          BULL("Application Health \u2014 ~1,000 app inventory"),
          BULL("Claims Operations \u2014 Volume, queue, denials"),
          BULL("Prior Auth \u2014 Backlog, SLA, approval rates"),
          BULL("Enrollment Intelligence \u2014 Pipeline, surge detection"),
          BULL("Member Services \u2014 ASA, FCR, chatbot containment"),
          BULL("AIOps Value \u2014 Savings, shift-left, self-heal"),
          BULL("Transformation Roadmap \u2014 60 initiatives tracked"),
          BULL("Capability Uplift \u2014 Certifications, AI readiness"),
        ],
        [
          H2("Metrics Tracked", { bef: 2 }),
          TBL([
            new TableRow({ children: [HC("Domain", W*0.17), HC("What\u2019s Tracked", W*0.30)] }),
            ...[ ["App Ops",       "Availability, MTTR, incidents"],
                 ["Claims",        "Volume, TAT, denial drivers"],
                 ["Prior Auth",    "Backlog, SLA, auto-approval"],
                 ["Enrollment",    "Time-to-good, queue health"],
                 ["Member Svc",    "ASA, FCR, digital adoption"],
                 ["AIOps",         "Savings, self-heal events"],
                 ["Transform",     "Phase progress, risk, velocity"],
            ].map(([a,b], i) => new TableRow({ children: [DC(a, W*0.17, { b: true, c: C.blue, f: alt(i), sz: 8.5 }), DC(b, W*0.30, { c: C.g70, f: alt(i), sz: 8.5 })] })),
          ], W * 0.47),

          GAP(4),
          H2("Governance Cadence", { bef: 2 }),
          TBL([
            new TableRow({ children: [HC("Forum", W*0.14), HC("Cadence", W*0.10), HC("Focus", W*0.23)] }),
            ...[ ["Ops Review",     "Weekly",     "SLA, MTTR, pipeline velocity"],
                 ["Exec Briefing",  "Monthly",    "Cost takeout, automation, KPIs"],
                 ["Board / ELT",    "Quarterly",  "Total value, innovation roadmap"],
            ].map(([a,b,c], i) => new TableRow({ children: [DC(a, W*0.14, { b: true, f: alt(i), sz: 8.5 }), VC(b, W*0.10, { sz: 8.5, al: AlignmentType.CENTER }), DC(c, W*0.23, { c: C.g70, f: alt(i), sz: 8.5 })] })),
          ], W * 0.47),

          GAP(2),
          H2("Access & Security", { bef: 2 }),
          BULL("Role-based access \u00B7 Token-authenticated sessions"),
          BULL("HIPAA-compliant \u00B7 No PHI in command center"),
        ],
      ),


      // ─── PAGE 9: PHASED ROADMAP ────────────────────────────────────────
      ...SEC("08", "Phased Delivery Roadmap", "Risk-Controlled  \u00B7  Compounding Value  \u00B7  Zero Disruption"),

      ...Q(
        "Every day a claim processes faster, a prior auth returns sooner, or an outage resolves before a provider notices \u2014 that is a day Horizon\u2019s members experience the IBM difference. That starts in Week 1, not Year 2.",
        "IBM Delivery Governance"
      ),

      TBL([
        new TableRow({ children: [HC("Phase", W*0.13), HC("Time", W*0.09), HC("Key Deliverables", W*0.48), HC("Value Signal", W*0.30)] }),
        ...[ ["Phase 0\nFoundation",   "0\u20138 Wk",
              "CareOps360 live  \u00B7  AIOps baseline  \u00B7  Transition plan  \u00B7  AI dev + QA rollout  \u00B7  Innovation Council",
              "Dashboards live  \u00B7  Baselines agreed  \u00B7  Zero BAU disruption"],
             ["Phase 1\nIgnite",       "Mo 1\u20133",
              "AIOps on production  \u00B7  Test automation framework  \u00B7  GenAI dev lifecycle  \u00B7  Integration simplification",
              "MTTR \u221220%  \u00B7  First automation ROI  \u00B7  QE 45%"],
             ["Phase 2\nScale",        "Mo 3\u20136",
              "Agentic triage live  \u00B7  COBOL\u2192Java pilot  \u00B7  Mainframe modernization  \u00B7  Digital Front Door blueprint",
              "Auto-resolve >50%  \u00B7  Defect escape \u221240%  \u00B7  $3\u20135M"],
             ["Phase 3\nOptimize",     "Mo 6\u201312",
              "Full incident autonomy  \u00B7  Claims adjudication parallel run  \u00B7  Predictive capacity  \u00B7  QE 80%+",
              "$6\u201310M takeout  \u00B7  MTTR <1.8 hrs  \u00B7  99.9%+"],
             ["Phase 4\nTransform",    "Yr 1\u20132",
              "Full autonomous P3/P4  \u00B7  Enterprise observability  \u00B7  Mainframe migration  \u00B7  Member front door live",
              "40\u201350% cost takeout  \u00B7  $12\u201318M+ total"],
        ].map(([ph,ti,de,va], i) => new TableRow({ children: [
          DC(ph, W*0.13, { b: true, c: C.navy, f: alt(i) }),
          DC(ti, W*0.09, { c: C.g50, f: alt(i), al: AlignmentType.CENTER }),
          DC(de, W*0.48, { c: C.g70, f: alt(i) }),
          VC(va, W*0.30),
        ]})),
      ], W),

      GAP(6),
      TWO(
        [
          H2("Transformation Portfolio", { bef: 2 }),
          BULL("60 initiatives across 3 delivery years"),
          BULL("25 Year 1 \u2014 Technical Debt, Digital, Payer"),
          BULL("15 Active / In-Flight at launch"),
          BULL("All tracked live in CareOps360"),

          GAP(4),
          H2("Modernization Roadmap", { bef: 2 }),
          TBL([
            new TableRow({ children: [HC("Workstream", W*0.17), HC("Timeline", W*0.12)] }),
            ...[ ["Eligibility",  "Q2\u2013Q4 2026"],
                 ["COBOL\u2192Java","Q3 2026"],
                 ["Payments",     "Q3 2026"],
                 ["Claims Engine","Q1\u2013Q2 2027"],
                 ["Member Data",  "Q4 2026+"],
            ].map(([a,b], i) => new TableRow({ children: [DC(a, W*0.17, { b: true, f: alt(i), sz: 8.5 }), VC(b, W*0.12, { sz: 8.5, al: AlignmentType.CENTER })] })),
          ], W * 0.47 - W*0.18),
        ],
        [
          H2("Technical Debt Governance", { bef: 2 }),
          BULL("All stacks maintained at n\u22121 (one behind LTS)"),
          BULL("Quarterly version review: IBM + Horizon ARB"),
          BULL("Monthly n\u22121 compliance report to CTO"),
          BULL("P1 CVEs: emergency patch within 72 hours"),
          BULL("Year 1: 25 platform upgrades (Angular 17, .NET 8, ODM 9.2)"),

          GAP(4),
          H2("Cumulative Value Trajectory", { bef: 2 }),
          TBL([
            BAR("Month 3",     12, "$1\u20132M",      "0072C3"),
            BAR("Month 6",     30, "$3\u20135M",      C.azure),
            BAR("Month 12",    60, "$6\u201310M",     C.blue),
            BAR("Month 24",   100, "$12\u201318M+",   C.navy),
          ], W * 0.47),
        ],
      ),

      GAP(6),
      STAT([
        ["~1,000",        "Applications Assessed",   C.blue  ],
        ["COBOL\u2192Java","AI-Assisted Conversion",  C.azure ],
        ["n\u22121/2",     "Stack Governance",         C.teal  ],
        ["Zero",          "Disruption Commitment",    C.purp  ],
      ]),


      // ─── PAGE 10: WHY IBM + CALL TO ACTION ─────────────────────────────
      ...SEC("09", "Why IBM \u2014 and Why Now", "Scale, Depth, Skin in the Game & Next Steps"),

      ...Q(
        "IBM\u2019s ultimate accountability is not to a contract \u2014 it is to the 3.7 million members who rely on Horizon\u2019s systems every day. The patient waiting for a prior auth. The provider navigating a claims dispute. The family enrolling for the first time.",
        "IBM Consulting, Healthcare & Payer Delivery"
      ),

      TWO(
        [
          H2("What Differentiates IBM", { bef: 2 }),
          H3("Skin in the Game"),
          BODY("Outcome-based SLAs. Targets missed trigger IBM remediation \u2014 not renegotiations. IBM carries the delivery risk.", { sz: 9.5 }),
          H3("AI at Depth"),
          BODY("Agentic AI, GenAI, AIOps production-proven at comparable payers. Live today, not future roadmap.", { sz: 9.5 }),
          H3("Consulting Advantage"),
          BODY("6,500+ production-tested assets. IBM Build on Bedrock (BOB). Accelerated value from Day 1.", { sz: 9.5 }),
          H3("Transformation Office"),
          BODY("Structured quarterly innovation. Governed, prioritized, business-case-backed. Not a slide \u2014 a programme.", { sz: 9.5 }),
          H3("Innovation Included"),
          BODY("AI tooling, sprints, accelerators built into base delivery. Not a future line item.", { sz: 9.5 }),
        ],
        [
          H2("Healthcare Payer Pedigree", { bef: 2 }),
          BULL("9 of top 10 US health payers served"),
          BULL("AWS Partner of the Year 2025"),
          BULL("Leader in Enterprise Software Quality & Testing"),
          BULL("Gartner Leader: 7 Data & AI Magic Quadrants"),
          BULL("CMS & HIPAA compliance expertise"),

          GAP(4),
          H2("Next Steps", { bef: 2 }),
          H3("Weeks 1\u20132"),
          BODY("Executive alignment: IBM VP + Horizon CIO/COO confirm scope and governance.", { sz: 9.5 }),
          H3("Weeks 2\u20134"),
          BODY("Phase 0 SOW agreed. CareOps360 walkthrough. Innovation Council constituted.", { sz: 9.5 }),
          H3("Week 4"),
          BODY("Phase 0 live. IBM and Horizon operate as one integrated team.", { sz: 9.5 }),

          GAP(2),
          CALL("IBM is ready. Phase 0 mobilizes within 5 business days."),
        ],
      ),

      GAP(6),
      STAT([
        ["20K+",  "AI Practitioners",    C.blue  ],
        ["81K+",  "Cloud Experts",        C.azure ],
        ["40K+",  "AI Engagements",       C.teal  ],
        ["$3.4B", "IBM Client-0 Savings", C.purp  ],
      ]),

      GAP(10),
      new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.blue } }, spacing: { before: sp(4), after: sp(6) } }),
      new Paragraph({ children: [
        R("\u201CThe measure of a great payer isn\u2019t uptime. It is the member who never has to think about their insurance because ", { sz: 11, i: true, c: C.g70 }),
        R("everything just works.", { sz: 11, b: true, i: true, c: C.navy }),
        R("\u201D", { sz: 11, i: true, c: C.g70 }),
      ], spacing: { before: sp(3), after: sp(6) } }),
      P([R("A Strategic Partnership for Enterprise Transformation", { sz: 11, b: true, c: C.navy })], { bef: 4, aft: 2, al: AlignmentType.CENTER }),
      P([R("IBM is committed to Horizon\u2019s success \u2014 not as a vendor, but as a transformation partner with shared stakes in every outcome.", { sz: 9.5, i: true, c: C.g70 })], { aft: 6, al: AlignmentType.CENTER }),
      new Paragraph({ children: [], border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.g20 } }, spacing: { before: sp(4), after: sp(3) } }),
      P([R("\u00A9 2026 IBM Corporation  \u00B7  IBM-HZN-AMS-RFP-2026-CAS  \u00B7  Confidential  \u00B7  All figures based on IBM programme data and industry benchmarks.", { sz: 7.5, c: C.g50 })], { al: AlignmentType.CENTER }),

    ]},
  ],
});

const buf = await Packer.toBuffer(doc);
writeFileSync("attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx", buf);
console.log("Done \u2014 " + buf.length.toLocaleString() + " bytes");
