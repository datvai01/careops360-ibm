/**
 * IBM × Horizon BCBS — AI-First Transformation
 * Executive Summary — C-Suite — 10 Pages
 * Squeezed from the full Transformation Plan
 * Word-native columns, human-centric punchlines, no appendix
 */

import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle, WidthType,
  ShadingType, TableLayoutType, Header, Footer, PageNumber,
  convertInchesToTwip, SectionType, ColumnBreak,
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
const Wh  = 4500;
const sh  = fill => ({ type: ShadingType.CLEAR, fill });

const BN = { style: BorderStyle.NONE, size: 0, color: "auto" };
const BT = { style: BorderStyle.SINGLE, size: 4, color: C.g20 };
const BM = { style: BorderStyle.SINGLE, size: 6, color: C.g20 };
const BB = { style: BorderStyle.SINGLE, size: 14, color: C.blue };
const NB = { top: BN, bottom: BN, left: BN, right: BN, insideH: BN, insideV: BN };
const CB = { top: BT, bottom: BT, left: BT, right: BT };

const R = (t, o = {}) => new TextRun({ text: t, font: FN, size: hp(o.sz ?? 10), bold: o.b ?? false, italics: o.i ?? false, color: o.c ?? C.g100, break: o.brk });
const P = (runs, o = {}) => new Paragraph({ children: Array.isArray(runs) ? runs : [runs], spacing: { before: sp(o.bef ?? 0), after: sp(o.aft ?? 0) }, alignment: o.al, indent: (o.l || o.r) ? { left: sp(o.l ?? 0), right: sp(o.r ?? 0) } : undefined, border: o.bd, shading: o.bg ? sh(o.bg) : undefined, pageBreakBefore: o.pb ?? false });
const GAP = (pt = 4) => new Paragraph({ children: [new TextRun({ text: "", font: FN, size: hp(4) })], spacing: { before: 0, after: sp(pt) } });

const BODY = (t, o = {}) => P([R(t, { sz: o.sz ?? 10, c: o.c ?? C.g70, i: o.i })], { aft: o.aft ?? 4, bef: o.bef ?? 0, al: o.al });
const BULL = (t, o = {}) => new Paragraph({ children: [R(t, { sz: o.sz ?? 9.5, c: o.c ?? C.g70 })], bullet: { level: 0 }, spacing: { before: sp(0.5), after: sp(2) } });

const SEC_HEAD = (num, title, sub = "") => [
  new Paragraph({ children: [], border: { top: { style: BorderStyle.SINGLE, size: 18, color: C.blue, space: 8 } }, spacing: { before: sp(0), after: sp(2) } }),
  new Paragraph({ children: [R(num + "  ", { sz: 9, b: true, c: C.blue }), R(title, { sz: 15, b: true, c: C.navy })], spacing: { before: 0, after: sub ? sp(1) : sp(4) } }),
  ...(sub ? [BODY(sub, { i: true, sz: 9, aft: 4, c: C.g50 })] : []),
];
const H2 = (t, o = {}) => P([R(t, { sz: 11, b: true, c: o.c ?? C.navy })], { bef: o.bef ?? 6, aft: o.aft ?? 2 });
const H3 = (t, o = {}) => P([R(t, { sz: 10, b: true, c: o.c ?? C.blue })], { bef: o.bef ?? 4, aft: o.aft ?? 1 });

const Q = (text, attr = "") => [
  new Paragraph({ children: [R("\u201C" + text + "\u201D", { sz: 10, i: true, c: C.navy })], spacing: { before: sp(3), after: sp(attr ? 1 : 4) }, indent: { left: inc(0.3) }, border: { left: { style: BorderStyle.SINGLE, size: 16, color: C.blue, space: 8 } } }),
  ...(attr ? [P([R("\u2014 " + attr, { sz: 8, b: true, c: C.blue })], { bef: 0, aft: 4, al: AlignmentType.RIGHT })] : []),
];

const CALL = (t, fill = C.lb1, c = C.navy) => new Paragraph({ children: [R(t, { sz: 9.5, b: true, c })], shading: sh(fill), spacing: { before: sp(4), after: sp(4) }, indent: { left: inc(0.15), right: inc(0.15) } });

const COLBRK = () => new Paragraph({ children: [new TextRun({ children: [new ColumnBreak()], font: FN, size: hp(2) })] });

const HC = (t, w, o = {}) => new TableCell({ children: [new Paragraph({ children: [R(t, { sz: 8.5, b: true, c: o.c ?? C.navy })], spacing: { before: sp(2), after: sp(2) }, alignment: o.al })], shading: sh(o.f ?? C.lb2), width: w ? { size: Math.round(w), type: WidthType.DXA } : undefined, borders: { top: BB, bottom: BM, left: BT, right: BT }, margins: { top: sp(1.5), bottom: sp(1.5), left: sp(5), right: sp(5) }, verticalAlign: "center" });
const DC = (t, w, o = {}) => new TableCell({ children: [new Paragraph({ children: [R(t, { sz: o.sz ?? 8.5, b: o.b ?? false, c: o.c ?? C.g100, i: o.i })], spacing: { before: sp(1), after: sp(1) }, alignment: o.al })], shading: sh(o.f ?? C.white), width: w ? { size: Math.round(w), type: WidthType.DXA } : undefined, borders: CB, margins: { top: sp(1.5), bottom: sp(1.5), left: sp(5), right: sp(5) }, verticalAlign: "center" });
const VC = (t, w, o = {}) => DC(t, w, { b: true, c: C.blue, f: C.lb1, ...o });
const TBL = (rows, w = W) => new Table({ width: { size: Math.round(w), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NB, rows });
const alt = i => (i % 2 === 0 ? C.white : C.g10);

const STAT = (items, w = W) => TBL([new TableRow({ children: items.map(([val, lab, col = C.blue]) => new TableCell({
  children: [
    new Paragraph({ children: [R(val, { sz: 22, b: true, c: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(5), after: sp(1) } }),
    new Paragraph({ children: [R(lab, { sz: 8, b: true, c: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(5) } }),
  ],
  shading: sh(C.lb1), width: { size: Math.round(w / items.length), type: WidthType.DXA },
  borders: { top: { style: BorderStyle.SINGLE, size: 10, color: col }, bottom: BT, left: BT, right: BT },
  margins: { top: sp(2), bottom: sp(2), left: sp(3), right: sp(3) }, verticalAlign: "center",
})) })], w);

const STEP = (n, title, lines, col = C.blue) => new TableCell({
  children: [
    new Paragraph({ children: [R("STEP " + n, { sz: 7, b: true, c: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(3), after: sp(1) } }),
    new Paragraph({ children: [R(title, { sz: 9, b: true, c: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(2) } }),
    ...lines.map(l => new Paragraph({ children: [R(l, { sz: 8, c: C.g70 })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(1) } })),
    GAP(2),
  ],
  shading: sh(C.white), width: { size: Math.round(W / 5), type: WidthType.DXA },
  margins: { top: sp(2), bottom: sp(2), left: sp(3), right: sp(3) },
  borders: { top: { style: BorderStyle.SINGLE, size: 14, color: col }, bottom: BT, left: BT, right: BT },
});

const BAR = (label, pct, val, col = C.blue, w = W) => {
  const lw = Math.round(w * 0.30), vw = Math.round(w * 0.13), bw = w - lw - vw;
  const f = Math.round(bw * Math.min(pct, 100) / 100);
  return new TableRow({ children: [
    new TableCell({ children: [BODY(label, { sz: 8.5, aft: 0 })], width: { size: lw, type: WidthType.DXA }, shading: sh(C.white), borders: NB, margins: { top: sp(1.5), bottom: sp(1.5), right: sp(3) }, verticalAlign: "center" }),
    new TableCell({ children: [GAP(0)], width: { size: f, type: WidthType.DXA }, shading: sh(col), borders: NB }),
    new TableCell({ children: [GAP(0)], width: { size: bw - f, type: WidthType.DXA }, shading: sh(C.g20), borders: NB }),
    new TableCell({ children: [P([R(val, { sz: 8.5, b: true, c: col })], { aft: 0, al: AlignmentType.RIGHT })], width: { size: vw, type: WidthType.DXA }, shading: sh(C.white), borders: NB, margins: { top: sp(1.5), bottom: sp(1.5), left: sp(3) }, verticalAlign: "center" }),
  ]});
};

const MG = { top: inc(0.75), bottom: inc(0.60), left: inc(0.85), right: inc(0.85) };
const HDR = () => new Header({ children: [new Paragraph({ children: [R("IBM \u00D7 HORIZON BCBS  |  AI-FIRST TRANSFORMATION  |  EXECUTIVE SUMMARY  |  CONFIDENTIAL", { sz: 7, b: true, c: C.g50 })], alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: C.blue, space: 4 } }, spacing: { after: 0 } })] });
const FTR = () => new Footer({ children: [new Paragraph({ children: [R("CareOps360  \u00B7  IBM AIOps  \u00B7  IBM Consulting Advantage  \u00B7  April 2026  |  ", { sz: 7, c: C.blue }), new TextRun({ children: [PageNumber.CURRENT], font: FN, size: hp(7), color: C.g50 })], border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.g20, space: 3 } }, spacing: { before: sp(2), after: 0 } })] });
const hf = () => ({ headers: { default: HDR() }, footers: { default: FTR() } });

const oneCol = (children, type = SectionType.CONTINUOUS) => ({
  properties: { page: { margin: MG }, type, column: { count: 1 } }, ...hf(), children,
});
const twoCol = (children) => ({
  properties: { page: { margin: MG }, type: SectionType.CONTINUOUS, column: { count: 2, space: inc(0.3), separate: false } }, ...hf(), children,
});
const newPage1Col = (children) => ({
  properties: { page: { margin: MG }, type: SectionType.NEXT_PAGE, column: { count: 1 } }, ...hf(), children,
});

// ════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  creator: "IBM Consulting",
  title: "IBM \u00D7 Horizon BCBS \u2014 AI-First Transformation \u2014 Executive Summary",
  sections: [

    // ═══════════════════════════════════════════════════════════════════════
    //  PAGE 1 — COVER + EXECUTIVE OVERVIEW (combined, no wasted space)
    // ═══════════════════════════════════════════════════════════════════════
    { properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } }, children: [
      new Paragraph({ children: [R("  IBM CONSULTING   |   HEALTHCARE & PAYER DELIVERY   |   AMS PRACTICE", { sz: 8, b: true, c: C.white })], shading: sh(C.navy), spacing: { before: sp(10), after: sp(10) } }),
      new Paragraph({ children: [], shading: sh(C.blue), spacing: { before: 0, after: sp(1) } }),

      GAP(16),

      P([R("AI-FIRST  \u00B7  AGENTIC BY CORE  \u00B7  ZERO-TOUCH DELIVERY", { sz: 18, b: true, c: C.blue })], { aft: 4, l: 55 }),
      new Paragraph({ children: [R("Transforming Horizon BCBS Into a", { sz: 30, b: true, c: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inc(1.1) } }),
      new Paragraph({ children: [R("Predictive, Self-Healing, AI-Driven Enterprise", { sz: 30, b: true, c: C.blue })], spacing: { before: 0, after: sp(8) }, indent: { left: inc(1.1) } }),

      P([R("An Executive Summary for Horizon BCBS Leadership", { sz: 12, i: true, c: C.g50 })], { aft: 8, l: 55 }),

      new Paragraph({ children: [
        R("\u201CIBM is not proposing a technology project \u2014 IBM is proposing a transformation partnership that embeds AI-driven intelligence into the operating model of Horizon BCBS, enabling a future-ready enterprise that is faster, smarter, and more resilient than today.\u201D", { sz: 10, i: true, c: C.navy }),
      ], spacing: { before: sp(2), after: sp(6) }, indent: { left: inc(1.1), right: inc(0.8) }, border: { left: { style: BorderStyle.SINGLE, size: 14, color: C.blue, space: 8 } } }),

      GAP(4),

      new Paragraph({ children: [
        R("Five Strategic Commitments:  ", { sz: 9.5, b: true, c: C.navy }),
        R("AI-First Operating Model  \u00B7  Tech Arbitrage over Labor Arbitrage  \u00B7  Outcome-Based Delivery  \u00B7  Zero-Disruption Transition  \u00B7  Continuous Innovation Engine", { sz: 9.5, c: C.g70 }),
      ], spacing: { before: sp(2), after: sp(6) }, indent: { left: inc(1.1), right: inc(0.5) } }),

      new Paragraph({ children: [
        R("IBM\u2019s Scale:  ", { sz: 9.5, b: true, c: C.navy }),
        R("20,000+ AI practitioners  \u00B7  81,000+ cloud experts  \u00B7  40,000+ AI engagements  \u00B7  15,000+ across 40 global delivery centers  \u00B7  Client-0 AI saved IBM ~$3.4B USD", { sz: 9.5, c: C.g70 }),
      ], spacing: { before: 0, after: sp(6) }, indent: { left: inc(1.1), right: inc(0.5) } }),

      new Paragraph({ children: [
        R("Submitted by: ", { sz: 9, b: true, c: C.navy }),
        R("IBM Consulting \u2014 Healthcare & Payer Delivery          ", { sz: 9, c: C.g70 }),
        R("Submitted to: ", { sz: 9, b: true, c: C.navy }),
        R("Horizon BCBS \u2014 Executive Leadership & Technology Office", { sz: 9, c: C.g70 }),
      ], spacing: { before: sp(2), after: sp(3) }, indent: { left: inc(1.1) } }),

      P([R("Confidential  |  April 2026  |  Ref: IBM-HZN-AMS-RFP-2026-CAS", { sz: 8.5, c: C.g50 })], { aft: 0, l: 55 }),

      GAP(8),

      new Paragraph({ children: [R("  Powered by CareOps360  \u00B7  IBM AIOps  \u00B7  IBM Consulting Advantage  \u00B7  HIPAA Compliant  \u00B7  \u00A9 2026 IBM Corporation", { sz: 7.5, c: C.white })], shading: sh(C.navy), spacing: { before: sp(3), after: sp(3) } }),
    ]},


    // ═══════════════════════════════════════════════════════════════════════
    //  PAGE 2 — THE TRANSFORMATION IMPERATIVE
    // ═══════════════════════════════════════════════════════════════════════
    newPage1Col([
      ...SEC_HEAD("01", "The Transformation Imperative", "Horizon\u2019s Strategic Objectives & IBM\u2019s Solution Design Rationale"),
      ...Q(
        "A mother enrolling her newborn should not wait five days because two systems failed to sync. A provider submitting a prior auth should not chase a fax. Every metric IBM tracks connects to a member, a provider, or a patient.",
        "IBM Consulting, Healthcare & Payer Delivery"
      ),
    ]),
    twoCol([
      H2("What Horizon Needs", { bef: 2 }),
      BODY("Horizon BCBS manages ~1,000 applications spanning enrollment, claims, member services, provider operations, and data platforms. The incumbent model \u2014 reactive, labor-intensive, fragmented \u2014 cannot meet growth objectives or the expectations of 3.7 million members.", { sz: 9.5 }),

      H2("Service Transformation Goals", { bef: 3 }),
      BULL("AI and automation to drive operational efficiencies across all AMS towers"),
      BULL("Product-oriented model aligned to business domains"),
      BULL("Focused automation in testing and quality engineering"),
      BULL("AI tools to drive Agile modernization across ~1,000 apps"),
      BULL("Deep healthcare payer consulting expertise"),

      H2("Cost Structure Expectations", { bef: 3 }),
      BODY("Horizon expects structural cost reduction \u2014 not just efficiency gains. Year-over-year productivity improvements and cost takeout driven by automation and AI, not rate arbitrage.", { sz: 9.5 }),

      COLBRK(),

      H2("Factors That Shaped IBM\u2019s Solution", { bef: 2 }),
      H3("End-to-End Integrated Delivery"),
      BODY("Unified model across Maintenance, Dev, Testing, Data. No silos. One team, one backlog, one set of outcomes.", { sz: 9.5 }),
      H3("AI at the Core"),
      BODY("Embedded in triage, RCA, resolution, test automation, and continuous validation from Day 1.", { sz: 9.5 }),
      H3("Transition Without Disruption"),
      BODY("Phased approach maintaining seamless service continuity while progressively modernizing the operating model.", { sz: 9.5 }),
      H3("Open, Elastic Architecture"),
      BODY("Deployed on Horizon\u2019s existing AWS stack. No vendor lock-in. Plug-and-play flexibility.", { sz: 9.5 }),

      GAP(2),
      CALL("IBM shifts Horizon from reactive incident management to predictive, autonomous operations"),
    ]),
    oneCol([
      GAP(3),
      H2("Current State vs. IBM 12-Month Targets", { bef: 2 }),
      BODY("All current-state estimates are directional; formally baselined during SOW. Committed targets contractually agreed at program commencement.", { sz: 8, c: C.g50, i: true, aft: 3 }),
      TBL([
        new TableRow({ children: [HC("Operational Metric", W*0.30), HC("Current State", W*0.18), HC("IBM 12-Mo Target", W*0.22), HC("Direction", W*0.16), HC("Impact", W*0.14)] }),
        ...[ ["Test Automation Coverage",       "~25%",            "80%+",             "\u2191 +3\u00D7",       "Quality"],
             ["MTTR (Mean Time to Resolve)",    "> 4 hours",       "< 1.8 hours",      "\u2193 55%",            "Members"],
             ["Defect Escape to Prod",          "High / Untracked","65% Reduction",    "\u2193 Best-in-class",  "Patients"],
             ["P3/P4 Auto-Resolution",          "< 10%",           "> 74%",            "\u2191 7\u00D7",        "Ops Cost"],
             ["Regression Cycle Time",          "Multi-day",       "70% Faster",       "\u2193 Automated",      "Velocity"],
             ["Alert Noise per Shift",          "Unfiltered",      "> 60% Reduced",    "\u2193 AI-filtered",    "Ops Team"],
             ["Enrollment Error Tickets",       "High / Reactive", "~110/mo saved",    "\u2193 Zero-touch",     "Members"],
             ["System Availability",            "~99.7%",          "99.9%+",           "\u2191 AI-ops",         "Everyone"],
        ].map(([a,b,c,d,e], i) => new TableRow({ children: [
          DC(a, W*0.30, { b: true, f: alt(i) }),
          DC(b, W*0.18, { c: C.red, f: alt(i), al: AlignmentType.CENTER }),
          VC(c, W*0.22, { al: AlignmentType.CENTER }),
          DC(d, W*0.16, { c: C.blue, b: true, f: alt(i), al: AlignmentType.CENTER }),
          DC(e, W*0.14, { c: C.navy, i: true, f: alt(i), al: AlignmentType.CENTER }),
        ]})),
      ], W),
    ]),


    // ═══════════════════════════════════════════════════════════════════════
    //  PAGE 3 — CAREOPS360 COMMAND CENTER
    // ═══════════════════════════════════════════════════════════════════════
    newPage1Col([
      ...SEC_HEAD("02", "CareOps360 Command Center", "IBM\u2019s Executive Operations Platform for Real-Time AMS Visibility at Horizon"),
      ...Q(
        "Horizon\u2019s leadership should never ask \u2018how are we doing?\u2019 and wait for a deck. A child\u2019s enrollment status, a provider\u2019s claim, a member\u2019s prior auth \u2014 the answer should be live, accurate, and one click away.",
        "IBM \u2014 Executive Visibility"
      ),
    ]),
    twoCol([
      H2("What Is CareOps360?", { bef: 2 }),
      BODY("Production-grade executive operations platform purpose-built for Horizon. Real-time intelligence across all AMS towers through a single command center. Architecture-ready for live production data; deployed in production-equivalent environment.", { sz: 9.5 }),

      H2("Dashboards Delivered", { bef: 3 }),
      BULL("Executive Overview \u2014 8 real-time KPI tiles"),
      BULL("Application Health \u2014 ~1,000 app inventory, incidents, availability"),
      BULL("Claims Operations \u2014 Volume, adjudication queue, denial analytics"),
      BULL("Prior Authorization \u2014 Backlog, review SLA, approval rates"),
      BULL("Enrollment Intelligence \u2014 AI-assisted intake, surge detection"),
      BULL("Member Services \u2014 Contact center, chatbot, digital adoption"),
      BULL("IBM AIOps Value \u2014 Automation savings, shift-left, self-heal"),
      BULL("Transformation Roadmap \u2014 60-initiative portfolio tracked"),
      BULL("Capability Uplift \u2014 Certifications, automation, AI readiness"),

      COLBRK(),

      H2("Metrics Monitored", { bef: 2 }),
      TBL([
        new TableRow({ children: [HC("Domain", Wh*0.32), HC("What Will Be Tracked", Wh*0.68)] }),
        ...[ ["Application Ops",  "Availability, MTTR, incident volume by severity"],
             ["Claims",           "Volume, adjudication rate, TAT, denial drivers"],
             ["Prior Auth",       "Backlog, review SLA, auto-approval rate"],
             ["Enrollment",       "Time-to-good, auto-match rate, queue health"],
             ["Member Services",  "ASA, FCR, chatbot containment, digital adoption"],
             ["AIOps Value",      "Savings YTD, shift-left rate, self-heal events"],
             ["Transformation",   "Phase progress, milestone risk, initiative velocity"],
        ].map(([a,b], i) => new TableRow({ children: [DC(a, Wh*0.32, { b: true, c: C.blue, f: alt(i) }), DC(b, Wh*0.68, { c: C.g70, f: alt(i) })] })),
      ], Wh),

      GAP(3),
      H2("Access & Security", { bef: 2 }),
      BULL("Role-based access: IBM and Horizon executives"),
      BULL("Token-authenticated sessions with inactivity timeout"),
      BULL("HIPAA-compliant \u2014 no PHI data in the command center"),
      BULL("Architecture-ready for production data integration"),

      GAP(2),
      H3("Portal Credentials (Demo Environment)"),
      BODY("URL: careops360-ibm.replit.app", { sz: 9 }),
      BODY("Login: exec@horizon.com / Horizon&IBM2026", { sz: 9 }),
      BODY("Demo mode only \u2014 no live PHI or production data.", { sz: 8.5, i: true, c: C.g50 }),
    ]),


    // ═══════════════════════════════════════════════════════════════════════
    //  PAGE 4 — AIOPS & AGENTIC AI OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════
    newPage1Col([
      ...SEC_HEAD("03", "AIOps & Agentic AI Operations", "From Reactive Incident Management to Autonomous, Self-Healing Operations"),
      ...Q(
        "When a claims system fails at 2 AM, the first responder should be an AI agent \u2014 not a sleep-deprived engineer. The provider should never know. The member should never feel it. That is zero-touch. That is the standard.",
        "IBM AIOps"
      ),
      BODY("IBM\u2019s AIOps framework is built on a multi-agent architecture where specialized AI agents handle distinct responsibilities across the incident lifecycle \u2014 from detection through resolution and continuous learning. Built for Horizon\u2019s AWS stack: AgentCore & Bedrock, ElasticSearch, PostgreSQL, ServiceNow, CloudWatch, Splunk."),
    ]),
    twoCol([
      H2("Agent Roles", { bef: 2 }),
      H3("Help Desk Agent"),
      BODY("Context-aware guidance and automated actions to help users auto-resolve issues before ticket creation.", { sz: 9.5 }),
      H3("Triage Agent"),
      BODY("Prioritizes tickets based on impact, urgency, and historical patterns \u2014 eliminating manual queue management.", { sz: 9.5 }),
      H3("Root Cause Analysis Agent"),
      BODY("Correlates signals across 140+ monitoring sources to identify root cause within minutes.", { sz: 9.5 }),

      COLBRK(),

      H3("Resolution Agent"),
      BODY("Suggests or executes remediation steps based on runbooks and past resolutions. >74% of P3/P4 auto-resolved.", { sz: 9.5 }),
      H3("Runbook Generation Agent"),
      BODY("Auto-generates and updates runbooks from resolved incidents \u2014 compounding operational knowledge over time.", { sz: 9.5 }),
      H3("Continuous Learning Agent"),
      BODY("Feeds production telemetry back into all agents. Month 12 is fundamentally smarter than Month 1.", { sz: 9.5 }),

      GAP(2),
      BODY("\u2713 Horizon\u2019s ARB Approval  \u00B7  \u2713 Horizon\u2019s GenAI Board Approved", { sz: 9, b: true, c: C.green }),
    ]),
    oneCol([
      GAP(3),
      H2("Zero-Touch Pipeline", { bef: 2 }),
      TBL([new TableRow({ children: [
        STEP("1", "Detect",   ["140+ sources", "Noise >60% cut"],    C.blue),
        STEP("2", "Triage",   ["Impact scoring", "Route instantly"], "0072C3"),
        STEP("3", "Diagnose", ["Root cause", "in minutes"],          C.azure),
        STEP("4", "Resolve",  ["Self-heal P3/P4", "Zero touch"],     C.teal),
        STEP("5", "Learn",    ["Update runbooks", "Prevent repeat"], "005D5D"),
      ]})], W),

      GAP(3),
      H2("Value Realization", { bef: 2 }),
      TBL([
        new TableRow({ children: [HC("Metric", W*0.36), HC("With AIOps", W*0.28), HC("Who Benefits", W*0.36)] }),
        ...[ ["MTTR",                    "< 1.8 hrs",        "Every member waiting on a resolution"],
             ["Alert Noise per Shift",   "> 60% Reduced",    "Ops teams freed for value work"],
             ["P3/P4 Auto-Resolution",   "> 74%",            "Providers who never see the outage"],
             ["Change Failure Rate",     "40% Reduction",    "Members protected from regressions"],
             ["System Availability",     "99.95%",           "3.7M members relying on uptime"],
             ["Manual Triage Hours",     "~30% Reduction",   "Engineers focused on innovation"],
        ].map(([a,b,c], i) => new TableRow({ children: [
          DC(a, W*0.36, { b: true, f: alt(i) }),
          VC(b, W*0.28, { al: AlignmentType.CENTER }),
          DC(c, W*0.36, { c: C.navy, i: true, f: alt(i) }),
        ]})),
      ], W),
    ]),


    // ═══════════════════════════════════════════════════════════════════════
    //  PAGE 5 — PLATFORM MODERNIZATION
    // ═══════════════════════════════════════════════════════════════════════
    newPage1Col([
      ...SEC_HEAD("04", "Platform Modernization", "Integration Modernization, Mainframe Migration & Application Rationalization"),
      ...Q(
        "A provider should never wait because a batch integration only runs overnight. A member should never be denied because an eligibility rule is trapped in a mainframe subroutine from 1997. Modernization is not a technology program \u2014 it is a member experience program.",
        "IBM Platform Modernization"
      ),
    ]),
    twoCol([
      H2("Integration Modernization", { bef: 2 }),
      BODY("From point-to-point batch processes to cloud-native, event-driven, real-time integration architecture.", { sz: 9.5 }),
      BULL("MOM API-First Hub (HLGN-1053) \u2014 Real-time, event-driven partner data exchange"),
      BULL("Event Streaming \u2014 Kafka on AWS MSK replacing batch ETL"),
      BULL("API Gateway Consolidation \u2014 AWS API Gateway + IBM API Connect replacing 70+ point-to-point integrations"),
      BULL("ODM Cloud-Native (HLGN-1054) \u2014 Real-time business rule evaluation"),

      H2("Application Rationalization", { bef: 3 }),
      BODY("Structured assessment of ~1,000 applications using Texture and IBM accelerators (ICCA) \u2014 decommission, consolidation, cloud migration, or AI-augmented modernization.", { sz: 9.5 }),

      COLBRK(),

      H2("Mainframe Modernization", { bef: 2 }),
      BODY("Phased, parallel-run migration \u2014 API-wrap before rehost, parallel environments until transaction equivalence validated.", { sz: 9.5 }),
      TBL([
        new TableRow({ children: [HC("Workstream", Wh*0.42), HC("Approach", Wh*0.58)] }),
        ...[ ["Eligibility Processing",  "API-wrap \u2192 Cloud rehost (Q2\u2013Q4 2026)"],
             ["COBOL \u2192 Java Pilot",   "AI-assisted code conversion (Q3 2026)"],
             ["Unified Payments",          "AWS modernization (Q3 2026)"],
             ["Claims Engine",             "Parallel-run cutover (Q1\u2013Q2 2027)"],
             ["Member Data Services",      "Event-driven migration (Q4 2026+)"],
        ].map(([a,b], i) => new TableRow({ children: [DC(a, Wh*0.42, { b: true, f: alt(i) }), DC(b, Wh*0.58, { c: C.g70, f: alt(i) })] })),
      ], Wh),

      GAP(2),
      H2("Tech Debt Governance", { bef: 2 }),
      BULL("All stacks at n\u22121 (one behind LTS)"),
      BULL("Quarterly version review: IBM + Horizon ARB"),
      BULL("P1 CVEs: emergency patch within 72 hours"),
      BULL("Year 1: 25 platform upgrades in flight"),
    ]),
    oneCol([
      GAP(3),
      STAT([
        ["~1,000",        "Applications Assessed",   C.blue  ],
        ["COBOL\u2192Java","AI-Assisted Conversion",  C.azure ],
        ["n\u22121/2",     "Stack Version Governance", C.teal  ],
        ["Zero",          "Disruption Commitment",    C.purp  ],
      ]),
    ]),


    // ═══════════════════════════════════════════════════════════════════════
    //  PAGE 6 — QUALITY ENGINEERING & AI-AUGMENTED DEVELOPMENT
    // ═══════════════════════════════════════════════════════════════════════
    newPage1Col([
      ...SEC_HEAD("05", "Quality Engineering & AI-Augmented Development", "Measurable Quality at Every Milestone \u2014 Improved with Every Release"),
      ...Q(
        "Every undetected defect in a claims system is a patient who doesn\u2019t get care on time. Every missed test is a provider who submits correctly and gets denied anyway. Quality is not a phase \u2014 quality is the promise we make to every member.",
        "IBM Quality Engineering"
      ),
    ]),
    twoCol([
      H2("Self-Improving Quality Framework", { bef: 2 }),
      BODY("Closed-loop feedback within CI/CD. Production insights, defect analytics, and automation metrics continuously refine testing across ~1,000 applications.", { sz: 9.5 }),

      H2("Quality Controls", { bef: 3 }),
      BULL("End-to-end traceability and release readiness"),
      BULL("Defect leakage, density, stability metrics (MTTR)"),
      BULL("Automation coverage with KPI-driven governance"),
      BULL("AI-driven defect insights and regression optimization"),
      BULL("Production telemetry feeding back into test strategy"),

      H2("AI-Augmented Development", { bef: 3 }),
      H3("AI-Assisted Development"),
      BODY("GenAI accelerates code generation, review, documentation. IBM Consulting Advantage accelerators compress time-to-value.", { sz: 9.5 }),
      H3("DevSecOps Integration"),
      BODY("Security embedded left into CI/CD. Automated vulnerability scanning. Compliance gates from commit to production.", { sz: 9.5 }),

      COLBRK(),

      H2("Intelligent Test Automation", { bef: 2 }),
      BODY("GenAI enables self-generating test cases, automated test maintenance, and continuous validation \u2014 dramatically reducing regression testing cost and time.", { sz: 9.5 }),

      GAP(2),
      CALL("Target: 80% test automation coverage within 12 months"),

      GAP(2),
      H2("Coverage Journey", { bef: 2 }),
      TBL([
        BAR("Month 0",  25, "~25%",  C.g50, Wh),
        BAR("Month 3",  45, "45%",   "0072C3", Wh),
        BAR("Month 6",  55, "55%",   C.azure, Wh),
        BAR("Month 9",  72, "72%",   C.blue, Wh),
        BAR("Month 12", 82, "80%+",  C.navy, Wh),
      ], Wh),
    ]),
    oneCol([
      GAP(3),
      H2("Quality Metrics \u2014 Before & After", { bef: 2 }),
      TBL([
        new TableRow({ children: [HC("Quality Metric", W*0.24), HC("Current", W*0.14), HC("6-Mo", W*0.12), HC("12-Mo", W*0.12), HC("Method", W*0.24), HC("Who Benefits", W*0.14)] }),
        ...[ ["Test Automation",   "~25%",         "55%",        "80%+",        "GenAI self-generating",  "Velocity"],
             ["Defect Escape",     "High",         "\u221240%",  "\u221265%",   "AI defect prediction",   "Patients"],
             ["Regression Cycle",  "Multi-day",    "50% faster", "70% faster",  "Intelligent selection",   "Providers"],
             ["Time to Detect",    "> 2 hrs",      "< 30 min",   "< 15 min",    "AIOps + telemetry",      "Members"],
             ["AI Test Cases",     "< 5%",         "40%+",       "> 70%",       "Consulting Advantage",   "Quality"],
             ["Production Incident","Baseline",    "\u221220%",  "\u221240%",   "Shift-left quality",     "Everyone"],
             ["Critical Leakage",  "Quarterly",    "Monthly",    "Zero-leakage","E2E traceability",       "Trust"],
        ].map(([a,b,c,d,e,f], i) => new TableRow({ children: [
          DC(a, W*0.24, { b: true, f: alt(i) }),
          DC(b, W*0.14, { c: C.red, f: alt(i), al: AlignmentType.CENTER }),
          DC(c, W*0.12, { c: C.azure, f: alt(i), al: AlignmentType.CENTER }),
          VC(d, W*0.12, { al: AlignmentType.CENTER }),
          DC(e, W*0.24, { c: C.g70, f: alt(i) }),
          DC(f, W*0.14, { c: C.navy, i: true, f: alt(i), al: AlignmentType.CENTER }),
        ]})),
      ], W),
    ]),


    // ═══════════════════════════════════════════════════════════════════════
    //  PAGE 7 — CLAIMS & PRIOR AUTHORIZATION
    // ═══════════════════════════════════════════════════════════════════════
    newPage1Col([
      ...SEC_HEAD("06", "Claims & Prior Authorization", "AI-Augmented Adjudication, Backlog Management, and Denial Reduction at Scale"),
      ...Q(
        "The best technology is invisible to the member. The claim processes correctly. The prior auth comes back in hours, not days. The provider gets paid on time. The family never has to call twice. That is the measure.",
        "IBM Healthcare Payer Design"
      ),
    ]),
    twoCol([
      H2("Claims Operations Intelligence", { bef: 2 }),
      BODY("CareOps360 surfaces real-time visibility from receipt through adjudication, settlement, and denial management. No waiting for next-day reporting.", { sz: 9.5 }),
      BULL("AI-enhanced auto-adjudication rules engine"),
      BULL("Denial pattern analytics \u2014 root causes by procedure, eligibility, COB"),
      BULL("Real-time dashboard: volume by LOB, TAT trending, denial drivers"),
      BULL("SLA-bound adjudication commitments"),

      H2("Claims Metrics Tracked", { bef: 3 }),
      BULL("Claims received daily \u2014 volume trend and YoY comparison"),
      BULL("Claims in adjudication \u2014 queue depth and aging by payer class"),
      BULL("Auto-adjudication rate \u2014 improvement trajectory over program life"),
      BULL("Denial rate by denial code \u2014 top-5 reasons tracked monthly"),
      BULL("Average turnaround days \u2014 actuals vs. SLA commitment"),

      COLBRK(),

      H2("Prior Authorization: AI-Assisted Review", { bef: 2 }),
      BODY("AI-assisted review tooling to triage and prioritize requests, identify auto-approvable cases, and flag clinically complex cases for expedited human review. When a grandmother waits three weeks for a knee replacement approval, that is a system failure \u2014 not a process delay.", { sz: 9.5 }),

      GAP(2),
      TBL([
        new TableRow({ children: [HC("Prior Auth Metric", Wh*0.50), HC("Target Direction", Wh*0.50)] }),
        ...[ ["Requests Received Daily",    "Trend monitored weekly"],
             ["Average Review Hours",       "Reduction target (baseline to agreed)"],
             ["Urgent Request SLA",         "100% within 72-hr regulatory SLA"],
             ["Backlog Size",               "Reduction tracked monthly"],
             ["Auto-Approval Rate (low-risk)",">40% by Month 12"],
             ["Top Procedure Approval Rates","Category-level variance monitoring"],
        ].map(([a,b], i) => new TableRow({ children: [DC(a, Wh*0.50, { b: true, f: alt(i) }), VC(b, Wh*0.50)] })),
      ], Wh),

      GAP(2),
      CALL("100% of urgent prior auth resolved within regulatory SLA. AI triage to reduce average review time by 30%+ within 12 months."),
    ]),


    // ═══════════════════════════════════════════════════════════════════════
    //  PAGE 8 — ENROLLMENT INTELLIGENCE + STAFF ENABLEMENT
    // ═══════════════════════════════════════════════════════════════════════
    newPage1Col([
      ...SEC_HEAD("07", "Enrollment Intelligence & Staff Enablement", "AI-Assisted Intake, Surge Management & Workforce Readiness"),
      ...Q(
        "A newborn added to a family plan should not become a three-week administrative odyssey. A seasonal enrollment surge should not overwhelm the pipeline. IBM makes enrollment invisible to the member \u2014 and manageable for the team.",
        "IBM Enrollment Operations"
      ),
    ]),
    twoCol([
      H2("HHEE \u2014 Enrollment Intelligence", { bef: 2 }),
      BODY("Horizon Health Enrollment Exchange transforms reactive batch enrollment into proactive, real-time, AI-augmented operations across all channels and segments.", { sz: 9.5 }),

      H3("Core Capabilities"),
      BULL("Canonical 834 Transformation \u2014 All channels to Horizon 834 at intake"),
      BULL("Real-Time Validation \u2014 Errors caught in minutes, not hours"),
      BULL("Shift-Left Member Mastering \u2014 COB resolved and HUMI assigned earlier"),
      BULL("Agentic Remediation \u2014 Auto-resolved with confidence scoring and RCA"),

      H3("Enrollment Metrics Tracked"),
      BULL("Time-to-good (intake to validated record)"),
      BULL("Auto-match rate: AI eligibility matching accuracy"),
      BULL("Manual intervention rate: % requiring human review"),
      BULL("Records in queue: Real-time depth with aging"),

      H3("Surge Protection"),
      BODY("Surge detection alerts leadership ahead of demand spikes. Capacity modelling with workforce planning and SLA forecasting.", { sz: 9.5 }),

      COLBRK(),

      H2("Staff Enablement & AI Readiness", { bef: 2 }),
      BODY("IBM\u2019s people strategy: certify deep expertise in AI, healthcare, and IBM platforms; automate the repeatable so people focus on the complex; redeploy freed capacity toward strategic programs.", { sz: 9.5 }),

      GAP(2),
      TBL([
        new TableRow({ children: [HC("Capability", Wh*0.40), HC("Metric", Wh*0.30), HC("Target", Wh*0.30)] }),
        ...[ ["AI/ML Certifications",  "Certified professionals",  "Growth to plan"],
             ["Workforce AI-Enabled",  "% using AI daily",         "78% by Month 12"],
             ["Automation Coverage",   "% processes automated",    "91% by Month 12"],
             ["FTE Productivity",      "Manual effort eliminated", "Target agreed"],
             ["Auto-Remediation",      "Self-heal milestone",      "Achieved Month 6"],
        ].map(([a,b,c], i) => new TableRow({ children: [DC(a, Wh*0.40, { b: true, f: alt(i) }), DC(b, Wh*0.30, { c: C.g70, f: alt(i) }), VC(c, Wh*0.30)] })),
      ], Wh),

      GAP(2),
      H3("IBM Certification Domains at Horizon"),
      BULL("AI/ML \u2014 model deployment, AIOps, LLM operations"),
      BULL("Healthcare & Payer \u2014 BCBS models, CMS, HIPAA"),
      BULL("IBM Platform \u2014 Consulting Advantage, hybrid cloud"),
      BULL("Cloud Engineering \u2014 AWS, OpenShift, DevSecOps, SRE"),

      GAP(2),
      BODY("382 certified professionals across AI/ML (307), Healthcare (342), IBM Products (338), and Cloud (250) domains as of April 2026.", { sz: 9, i: true, c: C.g50 }),
    ]),


    // ═══════════════════════════════════════════════════════════════════════
    //  PAGE 9 — PHASED TRANSFORMATION ROADMAP
    // ═══════════════════════════════════════════════════════════════════════
    newPage1Col([
      ...SEC_HEAD("08", "Phased Transformation Roadmap", "A Structured, Compounding Journey from Stabilization to Autonomous Operations"),
      ...Q(
        "Every day a claim processes faster, a prior auth returns sooner, or an outage resolves before a provider notices \u2014 that is a day Horizon\u2019s members experience the difference. That starts in Week 1, not Year 2.",
        "IBM Delivery Governance"
      ),
      BODY("Each phase builds on the last, compounding value across the portfolio. Quick wins in the immediate term while building the foundation for long-term enterprise transformation."),
    ]),
    twoCol([
      H2("Phase 0 \u2014 Foundation", { bef: 2 }),
      BODY("0\u20138 Weeks", { sz: 9, b: true, c: C.blue }),
      BULL("Command Center blueprint and operationalization"),
      BULL("ICOE architecture definition"),
      BULL("Quote to Card KPI alignment roadmap"),
      BULL("AIOps baseline measurement"),
      BULL("Risk-free transition planning"),
      BULL("AI-assisted Dev + Intelligent QA rollout"),

      H2("Phase 1 \u2014 Ignite", { bef: 3 }),
      BODY("Months 1\u20133", { sz: 9, b: true, c: C.blue }),
      BULL("Integration Simplification & ICOE Modernization Roadmap"),
      BULL("Document Generation modernization (HLGS)"),
      BULL("Initial AIOps and monitoring on production"),
      BULL("Test automation framework initiation"),
      BULL("Innovation Council formation"),
      BULL("GenAI development lifecycle integrated"),

      COLBRK(),

      H2("Phase 2 \u2014 Scale", { bef: 2 }),
      BODY("Months 3\u20136", { sz: 9, b: true, c: C.blue }),
      BULL("Unified Payments & Mainframe modernization initiated"),
      BULL("COBOL \u2192 Java modernization pilot"),
      BULL("Digital Front Door blueprint"),
      BULL("Agentic AI incident triage live"),

      H2("Phase 3 \u2014 Optimize", { bef: 3 }),
      BODY("Months 6\u201312", { sz: 9, b: true, c: C.blue }),
      BULL("Agentic AI for full incident autonomy"),
      BULL("Claims adjudication parallel run initiated"),
      BULL("Predictive capacity management live"),

      H2("Phase 4 \u2014 Transform", { bef: 3 }),
      BODY("Months 12\u201324*", { sz: 9, b: true, c: C.blue }),
      BULL("Full autonomous operations for P3/P4 incidents"),
      BULL("Mainframe eligibility processing decommissioned"),
      BULL("Member Enrollment front door operationalized"),
      BULL("COBOL \u2192 Java migration complete for most workstreams"),
      BULL("Enterprise-wide observability platform fully deployed"),
      BODY("*Requires Horizon\u2019s involvement and investment", { sz: 8, i: true, c: C.g50, aft: 2 }),
    ]),
    oneCol([
      GAP(3),
      H2("Governance at Every Phase", { bef: 2 }),
      TBL([
        new TableRow({ children: [HC("Forum", W*0.24), HC("Cadence", W*0.14), HC("Focus", W*0.38), HC("Human Impact", W*0.24)] }),
        ...[ ["Executive Steering",   "Quarterly",  "IBM VP + Horizon CIO/COO strategic review",  "Direction for 3.7M members"],
             ["Program Management",   "Monthly",    "Health reporting, risk register",              "No surprises for leadership"],
             ["Delivery Ops Review",  "Bi-weekly",  "SLA and incident trends",                     "Teams doing the work"],
             ["Financial Governance",  "Monthly",    "Actuals vs. committed model",                "Cost takeout to the dollar"],
             ["Innovation Council",    "Quarterly",  "Idea pipeline and prioritization",            "Business-case-backed change"],
        ].map(([a,b,c,d], i) => new TableRow({ children: [
          DC(a, W*0.24, { b: true, f: alt(i) }),
          VC(b, W*0.14, { al: AlignmentType.CENTER }),
          DC(c, W*0.38, { c: C.g70, f: alt(i) }),
          DC(d, W*0.24, { c: C.navy, i: true, f: alt(i) }),
        ]})),
      ], W),

      GAP(2),
      BODY("Portfolio: 60 initiatives across 3 delivery years  \u00B7  25 Year 1  \u00B7  15 Active at launch  \u00B7  9 Completed in foundation  \u00B7  All tracked live in CareOps360", { sz: 9, b: true, c: C.navy }),
    ]),


    // ═══════════════════════════════════════════════════════════════════════
    //  PAGE 10 — TRANSFORMATION OPPORTUNITIES + WHY IBM + NEXT STEPS
    // ═══════════════════════════════════════════════════════════════════════
    newPage1Col([
      ...SEC_HEAD("09", "Why IBM \u2014 Transformation Opportunities & Next Steps", "Digital Front Door, Mainframe Modernization, ICOE Partnership & Call to Action"),
      ...Q(
        "IBM\u2019s ultimate accountability is not to a contract \u2014 it is to the 3.7 million members who rely on Horizon\u2019s systems every day. The patient waiting for a prior auth. The provider navigating a claims dispute. The family enrolling for the first time. Those are IBM\u2019s stakeholders.",
        "IBM Consulting, Healthcare & Payer Delivery"
      ),
    ]),
    twoCol([
      H2("Transformation Opportunities", { bef: 2 }),
      H3("Digital Front Door"),
      BODY("IBM will co-design, co-build, and co-operate the unified digital engagement layer. Healthcare digital accelerators + BCBS transformation playbook.", { sz: 9.5 }),
      H3("Quote to Card"),
      BODY("Fully digital plan comparison, selection, and payment. Compress sales cycle from 4+ months to weeks. Expected return: $38\u201350M annually.", { sz: 9.5 }),
      H3("Mainframe Modernization"),
      BODY("Phased parallel-run migration. AI-assisted COBOL-to-Java conversion compresses timeline 40\u201360% vs. manual approaches.", { sz: 9.5 }),
      H3("ICOE Modernization"),
      BODY("Databricks-centric, event-driven architecture replacing Informatica. Standardized data contracts. Real-time data flow.", { sz: 9.5 }),

      H2("What Differentiates IBM", { bef: 3 }),
      BULL("Skin in the game \u2014 Outcome-based SLAs. IBM carries the delivery risk."),
      BULL("AI at depth \u2014 Production-proven at comparable payers. Live today."),
      BULL("6,500+ production-tested assets \u2014 IBM Consulting Advantage."),
      BULL("Gartner Leader: 7 Data & AI Magic Quadrants (2025\u20132026)"),

      COLBRK(),

      H2("Healthcare Payer Pedigree", { bef: 2 }),
      BULL("AWS Partner of the Year 2025"),
      BULL("Leader in Enterprise Software Quality & Testing"),
      BULL("Proven BCBS engagement track record"),
      BULL("CMS & HIPAA compliance expertise"),

      H2("Recommended Next Steps", { bef: 3 }),
      H3("Immediate Actions (2\u20134 Weeks)"),
      BULL("Executive Alignment \u2014 IBM VP + Horizon CIO/COO confirm scope"),
      BULL("Command Center Walkthrough \u2014 Live CareOps360, AIOps, ICA, BOB demo"),
      BULL("Contract Finalization \u2014 Outcome-based SLA schedule confirmed"),
      BULL("Phase 0 Foundation Assessment \u2014 Portfolio and AIOps baseline"),

      H3("Phase 0 Commitments (Weeks 1\u201312)"),
      BULL("Wk 1\u20132: Transition team mobilized; AIOps instrumentation begins"),
      BULL("Wk 3\u20134: ICOE architecture workshop; Quote to Card KPI roadmap"),
      BULL("Wk 5\u20136: Phase 1 Ignite plan to Steering Committee"),
      BULL("Wk 7\u20138: Transformation Office inaugural session"),
      BULL("Wk 8\u201312: AIOps platform live on production"),

      GAP(2),
      CALL("IBM is ready. Phase 0 mobilizes within 5 business days."),
    ]),
    oneCol([
      GAP(4),
      STAT([
        ["20K+",  "AI Practitioners",    C.blue  ],
        ["81K+",  "Cloud Experts",        C.azure ],
        ["40K+",  "AI Engagements",       C.teal  ],
        ["$3.4B", "IBM Client-0 Savings", C.purp  ],
      ]),

      GAP(6),
      new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.blue } }, spacing: { before: sp(2), after: sp(4) } }),
      new Paragraph({ children: [
        R("\u201CThe measure of a great payer isn\u2019t uptime. It is the member who never has to think about their insurance because ", { sz: 10.5, i: true, c: C.g70 }),
        R("everything just works.", { sz: 10.5, b: true, i: true, c: C.navy }),
        R("\u201D", { sz: 10.5, i: true, c: C.g70 }),
      ], spacing: { before: sp(2), after: sp(4) } }),
      P([R("A Strategic Partnership for Enterprise Transformation", { sz: 10.5, b: true, c: C.navy })], { bef: 2, aft: 1, al: AlignmentType.CENTER }),
      P([R("IBM is committed to Horizon\u2019s success \u2014 not as a vendor, but as a transformation partner with shared stakes in every outcome.", { sz: 9.5, i: true, c: C.g70 })], { aft: 4, al: AlignmentType.CENTER }),
      new Paragraph({ children: [], border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.g20 } }, spacing: { before: sp(3), after: sp(2) } }),
      P([R("\u00A9 2026 IBM Corporation  \u00B7  IBM-HZN-AMS-RFP-2026-CAS  \u00B7  Confidential  \u00B7  All figures based on IBM program data and industry benchmarks.", { sz: 7.5, c: C.g50 })], { al: AlignmentType.CENTER }),
    ]),

  ],
});

const buf = await Packer.toBuffer(doc);
writeFileSync("attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx", buf);
console.log("Done \u2014 " + buf.length.toLocaleString() + " bytes");
