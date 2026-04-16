/**
 * IBM × Horizon BCBS
 * Application Development, Maintenance & Quality Engineering
 * Executive Summary — C-Suite White Paper
 *
 * Themes:  AI-First · Member Experience · Business-Focused Ops
 *          Zero-Touch Delivery · Agentic by Core
 *
 * Format:  Mirrors IBM_Corporation_Attachment_18-A_Transformation_Plan
 *          Single-column · Consulting grade · White paper style
 */

import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle, WidthType,
  ShadingType, TableLayoutType, Header, Footer, PageNumber,
  convertInchesToTwip, SectionType,
} from "docx";
import { writeFileSync } from "fs";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  blue:  "0F62FE", navy:  "001141", teal:  "007D79", azure: "0043CE",
  purp:  "6929C4", green: "198038", red:   "DA1E28", white: "FFFFFF",
  g10:   "F4F4F4", g20:   "E0E0E0", g50:   "8D8D8D", g70:   "525252",
  g100:  "161616", lb1:   "EBF2FF", lb2:   "D0E2FF",
};

const F   = "Calibri";
const hp  = pt => Math.round(pt * 2);
const sp  = pt => Math.round(pt * 20);
const inc = n  => convertInchesToTwip(n);
const W   = 9360;
const sh  = fill => ({ type: ShadingType.CLEAR, fill });

const BN  = { style: BorderStyle.NONE,   size: 0,  color: "auto" };
const BT  = { style: BorderStyle.SINGLE, size: 4,  color: C.g20  };
const BM  = { style: BorderStyle.SINGLE, size: 6,  color: C.g20  };
const BB  = { style: BorderStyle.SINGLE, size: 14, color: C.blue };
const NB  = { top: BN, bottom: BN, left: BN, right: BN, insideH: BN, insideV: BN };
const CB  = { top: BT, bottom: BT, left: BT, right: BT };

// ── Primitives ─────────────────────────────────────────────────────────────
const R = (t, o = {}) => new TextRun({ text: t, font: F, size: hp(o.sz ?? 10.5), bold: o.b ?? false, italics: o.i ?? false, color: o.c ?? C.g100 });
const P = (runs, o = {}) => new Paragraph({ children: Array.isArray(runs) ? runs : [runs], spacing: { before: sp(o.bef ?? 0), after: sp(o.aft ?? 0) }, alignment: o.al, indent: (o.l || o.r) ? { left: sp(o.l ?? 0), right: sp(o.r ?? 0) } : undefined, border: o.bd, shading: o.bg ? sh(o.bg) : undefined, pageBreakBefore: o.pb ?? false });
const GAP = (pt = 6) => new Paragraph({ children: [new TextRun({ text: "", font: F, size: hp(6) })], spacing: { before: 0, after: sp(pt) } });

const BODY = (t, o = {}) => P([R(t, { sz: o.sz ?? 10.5, c: o.c ?? C.g70, i: o.i })], { aft: o.aft ?? 5, bef: o.bef ?? 0, al: o.al });
const BULL = (t, o = {}) => new Paragraph({ children: [R(t, { sz: o.sz ?? 10.5, c: o.c ?? C.g70 })], bullet: { level: 0 }, spacing: { before: sp(1), after: sp(3) } });

// ── Section Heading — matches reference ────────────────────────────────────
const SEC = (num, title, sub = "", pb = true) => [
  new Paragraph({ children: [], border: { top: { style: BorderStyle.SINGLE, size: 20, color: C.blue, space: 10 } }, spacing: { before: sp(pb ? 0 : 12), after: sp(4) }, pageBreakBefore: pb }),
  new Paragraph({ children: [R(num + "  ", { sz: 9.5, b: true, c: C.blue }), R(title, { sz: 18, b: true, c: C.navy })], spacing: { before: 0, after: sub ? sp(3) : sp(8) } }),
  ...(sub ? [BODY(sub, { i: true, sz: 10, aft: 8, c: C.g50 })] : []),
];
const H2 = (t, o = {}) => P([R(t, { sz: 12, b: true, c: o.c ?? C.navy })], { bef: o.bef ?? 10, aft: o.aft ?? 4 });
const H3 = (t, o = {}) => P([R(t, { sz: 10.5, b: true, c: o.c ?? C.blue })], { bef: o.bef ?? 6, aft: o.aft ?? 2 });

// ── Quote — member/provider/patient focused punchlines ─────────────────────
const Q = (text, attr = "") => [
  GAP(4),
  new Paragraph({
    children: [R("\u201C" + text + "\u201D", { sz: 11.5, i: true, c: C.navy })],
    spacing: { before: sp(3), after: sp(2) },
    indent: { left: inc(0.4) },
    border: { left: { style: BorderStyle.SINGLE, size: 20, color: C.blue, space: 12 } },
  }),
  ...(attr ? [P([R("\u2014 " + attr, { sz: 9, b: true, c: C.blue })], { bef: 0, aft: 6, al: AlignmentType.RIGHT })] : [GAP(5)]),
];

// ── Callout ────────────────────────────────────────────────────────────────
const CALL = (t, fill = C.lb1, c = C.navy) => new Paragraph({ children: [R(t, { sz: 10.5, b: true, c })], shading: sh(fill), spacing: { before: sp(6), after: sp(6) }, indent: { left: inc(0.25), right: inc(0.25) } });

// ── Table helpers ──────────────────────────────────────────────────────────
const gc = (items, w, b = NB) => new TableCell({ children: Array.isArray(items) ? items : [items], shading: sh(C.white), width: w ? { size: Math.round(w), type: WidthType.DXA } : undefined, borders: b, margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) }, verticalAlign: "center" });
const HC = (t, w, o = {}) => new TableCell({ children: [new Paragraph({ children: [R(t, { sz: 10, b: true, c: o.c ?? C.navy })], spacing: { before: sp(3), after: sp(3) }, alignment: o.al })], shading: sh(o.f ?? C.lb2), width: w ? { size: Math.round(w), type: WidthType.DXA } : undefined, borders: { top: BB, bottom: BM, left: BT, right: BT }, margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) }, verticalAlign: "center", columnSpan: o.sp });
const DC = (t, w, o = {}) => new TableCell({ children: [new Paragraph({ children: [R(t, { sz: o.sz ?? 10, b: o.b ?? false, c: o.c ?? C.g100, i: o.i })], spacing: { before: sp(2), after: sp(2) }, alignment: o.al })], shading: sh(o.f ?? C.white), width: w ? { size: Math.round(w), type: WidthType.DXA } : undefined, borders: CB, margins: { top: sp(3), bottom: sp(3), left: sp(8), right: sp(8) }, verticalAlign: "center" });
const VC = (t, w, o = {}) => DC(t, w, { b: true, c: C.blue, f: C.lb1, ...o });
const TBL = (rows, w = W) => new Table({ width: { size: Math.round(w), type: WidthType.DXA }, layout: TableLayoutType.FIXED, borders: NB, rows });
const alt = i => (i % 2 === 0 ? C.white : C.g10);

// ── Stat boxes (matching reference — large bold + label) ──────────────────
const STAT = items => TBL([new TableRow({ children: items.map(([val, lab, col = C.blue]) => new TableCell({
  children: [
    new Paragraph({ children: [R(val, { sz: 28, b: true, c: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(8), after: sp(3) } }),
    new Paragraph({ children: [R(lab, { sz: 9.5, b: true, c: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(8) } }),
  ],
  shading: sh(C.lb1), width: { size: Math.round(W / items.length), type: WidthType.DXA },
  borders: { top: { style: BorderStyle.SINGLE, size: 12, color: col }, bottom: BT, left: BT, right: BT },
  margins: { top: sp(4), bottom: sp(4), left: sp(6), right: sp(6) }, verticalAlign: "center",
})) })], W);

// ── Pipeline step (matching reference) ────────────────────────────────────
const STEP = (n, title, lines, col = C.blue) => new TableCell({
  children: [
    new Paragraph({ children: [R("STEP " + n, { sz: 7.5, b: true, c: col })], alignment: AlignmentType.CENTER, spacing: { before: sp(6), after: sp(2) } }),
    new Paragraph({ children: [R(title, { sz: 10.5, b: true, c: C.navy })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(4) } }),
    ...lines.map(l => new Paragraph({ children: [R(l, { sz: 9.5, c: C.g70 })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: sp(2) } })),
    GAP(4),
  ],
  shading: sh(C.white), width: { size: Math.round(W / 5), type: WidthType.DXA },
  margins: { top: sp(4), bottom: sp(4), left: sp(6), right: sp(6) },
  borders: { top: { style: BorderStyle.SINGLE, size: 18, color: col }, bottom: BT, left: BT, right: BT },
});

// ── Bar chart row ─────────────────────────────────────────────────────────
const BAR = (label, pct, val, col = C.blue) => {
  const lw = 2800, vw = 1160, bw = W - lw - vw;
  const f = Math.round(bw * Math.min(pct, 100) / 100);
  return new TableRow({ children: [
    new TableCell({ children: [BODY(label, { sz: 9.5, aft: 0 })], width: { size: lw, type: WidthType.DXA }, shading: sh(C.white), borders: NB, margins: { top: sp(3), bottom: sp(3), right: sp(5) }, verticalAlign: "center" }),
    new TableCell({ children: [GAP(0)], width: { size: f, type: WidthType.DXA }, shading: sh(col), borders: NB }),
    new TableCell({ children: [GAP(0)], width: { size: bw - f, type: WidthType.DXA }, shading: sh(C.g20), borders: NB }),
    new TableCell({ children: [P([R(val, { sz: 9.5, b: true, c: col })], { aft: 0, al: AlignmentType.RIGHT })], width: { size: vw, type: WidthType.DXA }, shading: sh(C.white), borders: NB, margins: { top: sp(3), bottom: sp(3), left: sp(5) }, verticalAlign: "center" }),
  ]});
};

// ── Header / Footer ───────────────────────────────────────────────────────
const MG = { top: inc(0.85), bottom: inc(0.75), left: inc(1.0), right: inc(1.0) };
const HDR = () => new Header({ children: [new Paragraph({ children: [R("IBM \u00D7 HORIZON BCBS  \u2014  APPLICATION DEVELOPMENT, MAINTENANCE & QUALITY ENGINEERING  |  CONFIDENTIAL", { sz: 7.5, b: true, c: C.g50 })], alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.blue, space: 6 } }, spacing: { after: 0 } })] });
const FTR = () => new Footer({ children: [new Paragraph({ children: [R("CareOps360  \u00B7  IBM AIOps  \u00B7  IBM Consulting Advantage  \u00B7  April 2026  \u2014  ", { sz: 7.5, c: C.blue }), new TextRun({ children: [PageNumber.CURRENT], font: F, size: hp(7.5), color: C.g50 })], border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.g20, space: 4 } }, spacing: { before: sp(3), after: 0 } })] });
const hf = () => ({ headers: { default: HDR() }, footers: { default: FTR() } });

// ════════════════════════════════════════════════════════════════════════════
//  DOCUMENT
// ════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  creator: "IBM Consulting \u2014 Healthcare & Payer Delivery",
  title: "IBM \u00D7 Horizon BCBS \u2014 Application Development, Maintenance & Quality Engineering",
  sections: [

    // ====================================================================
    //  COVER PAGE
    // ====================================================================
    { properties: { page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } } }, children: [

      // Navy top bar
      new Paragraph({ children: [R("IBM CONSULTING   |   HEALTHCARE & PAYER DELIVERY   |   AMS PRACTICE", { sz: 9, b: true, c: C.white })], shading: sh(C.navy), spacing: { before: sp(14), after: sp(14) } }),
      new Paragraph({ children: [], shading: sh(C.blue), spacing: { before: 0, after: sp(3) } }),

      GAP(20),

      // Large branding text
      new Paragraph({ children: [R("AI-FIRST  \u00B7  AGENTIC BY CORE", { sz: 24, b: true, c: C.blue })], spacing: { before: 0, after: sp(8) }, indent: { left: inc(1.1) } }),

      // Title block
      new Paragraph({ children: [R("Application Development,",        { sz: 38, b: true, c: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inc(1.1) } }),
      new Paragraph({ children: [R("Maintenance &",                   { sz: 38, b: true, c: C.navy })], spacing: { before: 0, after: 0 }, indent: { left: inc(1.1) } }),
      new Paragraph({ children: [R("Quality Engineering",             { sz: 38, b: true, c: C.blue })], spacing: { before: 0, after: sp(8) }, indent: { left: inc(1.1) } }),

      // Subtitle
      new Paragraph({ children: [R("Where Every Line of Code, Every Test, and Every Resolved Incident\nIs Measured by the Member It Serves", { sz: 13, i: true, c: C.g50 })], spacing: { before: 0, after: sp(25) }, indent: { left: inc(1.1) } }),

      // Submitted by/to
      TBL([new TableRow({ children: [
        gc([
          P([R("Submitted by:", { sz: 10, b: true, c: C.navy })], { aft: 2 }),
          BODY("IBM Consulting", { aft: 1 }),
          BODY("Healthcare & Payer Delivery \u2014 AMS Practice", { aft: 0 }),
        ], W * 0.44),
        gc([
          P([R("Submitted to:", { sz: 10, b: true, c: C.navy })], { aft: 2 }),
          BODY("Horizon Blue Cross Blue Shield of New Jersey", { aft: 1 }),
          BODY("Executive Leadership & Technology Office", { aft: 0 }),
        ], W * 0.56),
      ] })], W),

      GAP(6),

      TBL([new TableRow({ children: [gc([
        P([R("Document Classification:", { sz: 10, b: true, c: C.navy }), R("   CONFIDENTIAL", { sz: 10, c: C.g70 })], { aft: 2 }),
        P([R("Date:", { sz: 10, b: true, c: C.navy }), R("   April 2026", { sz: 10, c: C.g70 })], { aft: 2 }),
        P([R("Reference:", { sz: 10, b: true, c: C.navy }), R("   IBM-HZN-AMS-RFP-2026-CAS", { sz: 10, c: C.g70 })], { aft: 0 }),
      ], W)] })], W),

      GAP(30),

      // Powered-by footer
      new Paragraph({ children: [R("Powered by CareOps360  \u00B7  IBM AIOps  \u00B7  IBM Consulting Advantage  \u00B7  HIPAA Compliant  \u00B7  \u00A9 2026 IBM Corporation", { sz: 8.5, c: C.white })], shading: sh(C.navy), alignment: AlignmentType.CENTER, spacing: { before: sp(5), after: sp(5) } }),
    ]},

    // ====================================================================
    //  CONTENT — single section, single column, pageBreakBefore per section
    // ====================================================================
    { properties: { page: { margin: MG } }, ...hf(), children: [

      // ── TABLE OF CONTENTS ────────────────────────────────────────────
      P([R("IBM \u00D7 Horizon BCBS \u2014 Application Development, Maintenance & Quality Engineering", { sz: 9, b: true, c: C.blue })], { aft: 2 }),
      P([R("Executive Summary  |  April 2026  |  Confidential", { sz: 9, c: C.g50, i: true })], { aft: 8 }),
      new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.blue } }, spacing: { before: sp(0), after: sp(10) } }),

      TBL([
        ...[ ["01", "Executive Summary",                  "AI-First, Member-Centred Transformation of AMS Delivery"],
             ["02", "The Delivery Imperative",            "Why Horizon Needs a New Operating Model \u2014 and Why Now"],
             ["03", "AI-First Application Development",   "Agentic Engineering, Risk-Scored Pipelines & Domain Squads"],
             ["04", "Zero-Touch Application Maintenance", "From Reactive Firefighting to Self-Healing Agentic Operations"],
             ["05", "Quality Engineering",                "Measurable Quality at Every Milestone \u2014 Improved with Every Release"],
             ["06", "Member & Provider Experience",       "Every Operational Improvement Measured by the Human It Serves"],
             ["07", "CareOps360 Command Center",          "IBM\u2019s Executive Operations Platform for Real-Time Visibility"],
             ["08", "Phased Delivery Roadmap",            "Stabilization to Autonomous Operations"],
             ["09", "Transformation Opportunities",       "Platform Modernization, Mainframe Migration & Technical Debt"],
             ["10", "Why IBM \u2014 Call to Action",       "Scale, Depth, Skin in the Game & Next Steps"],
        ].map(([n, t, s], i) => new TableRow({ children: [
          DC(n, W*0.06, { b: true, c: C.blue, f: alt(i), al: AlignmentType.CENTER }),
          DC(t, W*0.38, { b: true, f: alt(i) }),
          DC(s, W*0.56, { c: C.g70, f: alt(i), sz: 9.5, i: true }),
        ]})),
      ], W),


      // ================================================================
      //  01  EXECUTIVE SUMMARY
      // ================================================================
      ...SEC("01", "Executive Summary", "AI-First, Member-Centred Transformation of Application Management Services"),

      ...Q(
        "A mother enrolling her newborn should not wait five days because two systems failed to sync. A provider submitting a prior auth should not chase a fax. A patient whose claim was wrongly denied should not navigate a phone tree to fix a system error. IBM is here to make those moments disappear.",
        "IBM Consulting, Healthcare & Payer Delivery"
      ),

      H2("The Moment"),
      BODY("Horizon BCBS manages approximately 1,000 applications spanning enrollment, claims adjudication, member services, provider operations, and data platforms. The organization faces mounting pressure to modernize operations, reduce administrative burden, and deliver measurably better member and provider experiences \u2014 while managing the complexity of an enterprise-scale portfolio that touches every aspect of the payer value chain."),
      BODY("The incumbent delivery model \u2014 reactive, labor-intensive, and fragmented across towers \u2014 is no longer sufficient to meet Horizon\u2019s growth objectives, competitive imperatives, or the expectations of its 3.7 million members. Horizon is not looking for a faster version of today. Horizon is looking for a fundamentally different operating model \u2014 one where AI is the engine, quality is continuous, delivery is zero-touch, and every operational metric connects to a member, a provider, or a patient."),

      H2("What IBM Proposes"),
      BODY("IBM proposes a structured transition from reactive application support to a predictive, self-healing, continuously improving AI-first operating model \u2014 delivered through IBM\u2019s proven Assets, Assistants, and Accelerators framework, and governed through an outcome-based accountability model that ties IBM\u2019s performance directly to Horizon\u2019s business results."),
      BODY("This is not a staffing proposal. IBM is proposing a transformation partnership that embeds AI-driven intelligence into the operating model of Horizon BCBS \u2014 enabling a future-ready enterprise that is faster, smarter, and more resilient than today. IBM\u2019s delivery model is built to compound value over time: every sprint, every resolved incident, and every automated test strengthens the foundation for what comes next."),

      H2("Five Strategic Commitments"),
      BULL("AI-First Operating Model \u2014 AI embedded across every layer of development, quality, and operations. Not bolted on. Built in. Every engineer, every tester, every operator works with AI as a partner."),
      BULL("Tech Arbitrage over Labor Arbitrage \u2014 Compressing cost through automation and intelligence, not headcount. The savings are structural and permanent."),
      BULL("Outcome-Based Delivery \u2014 Committed SLAs tied to measurable business outcomes. IBM\u2019s success is Horizon\u2019s success. Targets missed trigger IBM remediation \u2014 not rate renegotiations."),
      BULL("Zero-Disruption Transition \u2014 Risk-free phased delivery protecting operational continuity from Day 1. No production disruption. No member impact. No learning curve at Horizon\u2019s expense."),
      BULL("Agentic by Core \u2014 AI agents that detect, triage, diagnose, resolve, and learn \u2014 compounding intelligence with every incident. The system gets smarter every day without manual intervention."),

      GAP(6),
      H2("IBM\u2019s Scale Behind This Proposal"),
      BULL("20,000+ AI & data practitioners globally."),
      BULL("81,000+ cloud & architecture experts across IBM Consulting."),
      BULL("40,000+ AI & analytics engagements delivered for global clients."),
      BULL("15,000+ delivery professionals across 40 global delivery centers."),
      BULL("9 of the top 10 US health payers served by IBM Consulting."),
      BULL("Leader in Enterprise Software Quality & Testing."),
      BULL("Enterprise partnerships with AWS, Salesforce, and IBM Technology."),
      BULL("IBM\u2019s Client-0 AI programme saved IBM approximately $3.4B USD \u2014 the same model applied here."),

      GAP(10),
      STAT([
        ["~1,000",    "Applications in Scope",    C.blue  ],
        ["Day 1",     "Efficiencies & Cost Takeout", C.azure ],
        ["24\u00D77", "Global AIOps Coverage",    C.teal  ],
        ["AI-First",  "Agentic by Core",          C.purp  ],
      ]),


      // ================================================================
      //  02  THE DELIVERY IMPERATIVE
      // ================================================================
      ...SEC("02", "The Delivery Imperative", "Why Horizon Needs a New Operating Model \u2014 and Why Now"),

      ...Q(
        "The question is not whether Horizon can afford to transform. The question is whether Horizon can afford not to \u2014 when every delayed claim is a member who loses trust, and every manual process is a cost that compounds.",
        "IBM Consulting \u2014 Payer Strategy"
      ),

      H2("What Horizon Needs"),
      BODY("Horizon BCBS is seeking the right strategic partner to enhance and support its Application Development, Maintenance, Data, and Testing Services \u2014 with a clear focus on AI solutions and expertise native to the Horizon environment. This is not a lift-and-shift of existing operations. This is a mandate to fundamentally improve how Horizon\u2019s ~1,000 applications are built, tested, maintained, and operated."),

      H2("Service Transformation Goals"),
      BULL("High-quality services delivered through AI and automation to achieve operational efficiencies across all AMS towers."),
      BULL("Realization of a product-oriented operating model aligned to Horizon\u2019s business domains \u2014 Claims, Enrollment, Member, Provider, Data."),
      BULL("Focused automation \u2014 especially in testing and quality engineering \u2014 to measurably reduce cost and accelerate delivery cadence."),
      BULL("AI tools to drive Agile application modernization across the ~1,000-application portfolio."),
      BULL("Consultative support applying deep healthcare payer best practices \u2014 not generic IT outsourcing patterns."),

      H2("Cost Structure Expectations"),
      BODY("Horizon expects structural cost reduction \u2014 not just efficiency gains. The fixed baseline model signals a clear expectation: year-over-year productivity improvements and cost takeout driven by automation and AI, not rate arbitrage. IBM\u2019s response is designed around technology-driven compression: every dollar saved through automation is a permanent reduction, not a temporary deferral."),

      H2("Factors That Shaped IBM\u2019s Solution"),
      H3("End-to-End Integrated Delivery"),
      BODY("A unified operating model across Application Maintenance, Development, Testing, and Data \u2014 reducing fragmentation and improving accountability across the full lifecycle. No tower silos. No handoff gaps. One team, one backlog, one set of outcomes."),
      H3("AI at the Core \u2014 Not Bolted On"),
      BODY("AI is embedded in triage, root cause analysis, resolution, test automation, and continuous validation \u2014 from the first day of delivery. IBM does not propose adding AI tools to an existing operating model. IBM proposes a new operating model where AI is the foundation."),
      H3("Transition Without Disruption"),
      BODY("IBM\u2019s phased transition approach maintains seamless service continuity while progressively modernizing the underlying operating model. Zero production disruption. Zero member impact. Zero learning curve at Horizon\u2019s expense."),
      H3("Open, Elastic Architecture"),
      BODY("Plug-and-play architecture deploys on Horizon\u2019s existing AWS stack \u2014 avoiding lock-in and enabling flexibility across cloud ecosystems. Built for Horizon\u2019s technology choices, not IBM\u2019s."),

      GAP(6),
      ...Q("IBM\u2019s solution shifts Horizon from reactive incident management to predictive, autonomous operations \u2014 where the member never feels the friction and the provider never waits."),

      H2("Current State vs. IBM Target \u2014 Key Operational Metrics"),
      BODY("All current-state estimates are directional and will be formally baselined during SOW phase. IBM\u2019s committed targets will be contractually agreed at programme commencement. See Appendix for the complete initiative portfolio.", { sz: 9.5, c: C.g50, i: true, aft: 6 }),
      TBL([
        new TableRow({ children: [HC("Operational Metric", W*0.36), HC("Current State", W*0.20), HC("IBM 12-Month Target", W*0.24), HC("Direction", W*0.20)] }),
        ...[ ["Test Automation Coverage",       "~25%",            "80%+",              "\u2191 +3\u00D7"],
             ["MTTR (Mean Time to Resolve)",    "> 4 hours",       "< 1.8 hours",       "\u2193 55%"],
             ["Defect Escape to Production",    "High / Untracked","65% Reduction",     "\u2193 Best-in-class"],
             ["Incident P3/P4 Auto-Resolution", "< 10%",           "> 74%",             "\u2191 7\u00D7"],
             ["Regression Cycle Time",          "Multi-day manual","70% Faster",        "\u2193 Automated"],
             ["Alert Noise per Shift",          "Unfiltered",      "> 60% Reduced",     "\u2193 AI-filtered"],
             ["Enrollment Error Ticket Rate",   "High / Reactive", "~110 tickets/mo saved","\u2193 Zero-touch"],
             ["System Availability (AMS)",      "~99.7%",          "99.9%+",            "\u2191 AI-ops"],
        ].map(([a,b,c,d], i) => new TableRow({ children: [
          DC(a, W*0.36, { b: true, f: alt(i) }),
          DC(b, W*0.20, { c: C.red, f: alt(i), al: AlignmentType.CENTER }),
          VC(c, W*0.24, { al: AlignmentType.CENTER }),
          DC(d, W*0.20, { c: C.blue, b: true, f: alt(i), al: AlignmentType.CENTER }),
        ]})),
      ], W),


      // ================================================================
      //  03  AI-FIRST APPLICATION DEVELOPMENT
      // ================================================================
      ...SEC("03", "AI-First Application Development", "Agentic Engineering, Risk-Scored Pipelines & Domain-Aligned Product Squads"),

      ...Q(
        "When a member\u2019s enrollment takes two weeks because a downstream application is slow, that is not a technology problem \u2014 that is a trust problem. Every sprint IBM delivers is measured by whether that member\u2019s experience got better.",
        "IBM Consulting \u2014 Member Experience Engineering"
      ),

      H2("AI-Augmented Development Model"),
      BODY("IBM transforms Horizon\u2019s engineering model from a traditional project-centric approach to a modern, product-centric engineering organization \u2014 powered by IBM Consulting Advantage accelerators and reusable enterprise assets. AI is not an add-on to the development process. AI is the development process."),
      BODY("Across Horizon\u2019s ~1,000-application estate, IBM\u2019s development model delivers measurable improvement in speed, quality, and cost \u2014 without adding headcount. The model is designed to compound: every sprint produces not just features, but better tooling, better patterns, and better institutional knowledge."),

      H3("AI-Assisted Development"),
      BODY("Generative AI tools accelerate code generation, review, documentation, and optimization. Developer throughput increases 25\u201335% without adding headcount. Every engineer spends more time on high-value problem-solving and less on repetitive scaffolding. IBM Consulting Advantage accelerators \u2014 a portfolio of 6,500+ production-tested assets \u2014 compress time-to-value for common patterns."),
      H3("DevSecOps Integration"),
      BODY("Security is embedded left into CI/CD pipelines. Automated vulnerability scanning runs at every stage. Compliance gates and policy enforcement operate from commit to production \u2014 no manual security review bottlenecks. HIPAA, CMS, and PCI compliance checks are automated, not manual."),
      H3("Domain-Aligned Product Squads"),
      BODY("Teams align to Horizon\u2019s business domains \u2014 Claims, Enrollment, Member Services, Provider Operations, Data & Analytics. Context stays with the squad. Handoff overhead disappears. Accountability is end-to-end. A claims developer understands claims \u2014 not just code."),
      H3("Risk-Scored Automated Releases"),
      BODY("Every deployment passes through AI-scored gates: security posture, test coverage, performance regression, and historical failure patterns. Low-risk changes deploy without human approval cycles. High-risk changes trigger additional validation \u2014 automatically. The result: faster delivery with fewer production incidents."),
      H3("Modernization in Stride"),
      BODY("Modernization is not a separate capital programme. It is embedded into every sprint \u2014 a refactor, an API wrap, a library upgrade, a legacy dependency removed. The application estate improves continuously without a disruptive parallel programme or separate budget request."),

      GAP(6),
      CALL("Target: 25\u201340% faster time to market across Horizon\u2019s application development portfolio within 12 months of full deployment."),

      GAP(8),
      H2("Development Efficiency Gains"),
      BODY("Measured improvement vs. traditional delivery model at comparable payer engagements:", { sz: 9.5, c: C.g50, i: true, aft: 6 }),
      TBL([
        BAR("AI-assisted code generation",       80, "+30% capacity",      C.blue),
        BAR("Automated QE test synthesis",       75, "+25% QE speed",     C.teal),
        BAR("Risk-scored deployment pipeline",   70, "\u221260% failures", C.azure),
        BAR("Domain squad alignment",            65, "\u221240% handoffs", C.purp),
        BAR("Modernization-in-stride",           60, "Debt \u221230%/yr",  "005D5D"),
      ], W),

      GAP(8),
      STAT([
        ["25\u201340%", "Faster Time to Market",    C.blue  ],
        ["2\u00D7",     "Deployment Frequency",     C.azure ],
        ["\u221260%",   "Change Failure Rate",      C.teal  ],
        ["AI-First",    "Every Sprint, Every Squad", C.purp ],
      ]),


      // ================================================================
      //  04  ZERO-TOUCH APPLICATION MAINTENANCE
      // ================================================================
      ...SEC("04", "Zero-Touch Application Maintenance", "From Reactive Firefighting to Self-Healing, Agentic Operations"),

      ...Q(
        "When a claims system fails at 2 AM, the first responder should be an AI agent \u2014 not a sleep-deprived engineer. The provider should never know it happened. The member should never feel the impact. That is what zero-touch means.",
        "IBM AIOps \u2014 Zero-Touch Operations Framework"
      ),

      H2("The Agentic AI Architecture"),
      BODY("IBM\u2019s AIOps framework is built on a multi-agent architecture where specialized AI agents handle distinct responsibilities across the incident lifecycle \u2014 from detection through resolution and continuous learning. Each agent compounds knowledge with every resolved incident. Across Horizon\u2019s ~1,000 applications, this architecture replaces reactive human triage with proactive, autonomous intelligence."),
      BODY("The architecture is built on Horizon\u2019s existing AWS stack \u2014 AWS AgentCore & Bedrock at the agent layer, AWS Bedrock with native Guardrails at the model layer, ElasticSearch and PostgreSQL for vector storage, and integrations with ServiceNow, CloudWatch, OpenShift, Splunk, and Horizon\u2019s Anomaly Framework."),

      H2("Agent Roles"),
      H3("Help Desk Agent"),
      BODY("Delivers context-aware guidance and automated actions to help users auto-resolve issues before ticket creation. The member gets their answer without waiting for a human. The provider\u2019s portal issue is resolved before it becomes a support call."),
      H3("Triage Agent"),
      BODY("Prioritizes tickets based on impact, urgency, and historical patterns \u2014 eliminating manual queue management. The right team responds immediately, every time. A P1 claims outage is routed to the claims pod in seconds, not minutes."),
      H3("Root Cause Analysis Agent"),
      BODY("Correlates signals across 140+ monitoring sources to identify root cause within minutes \u2014 not hours. Diagnosis that used to take a senior engineer now takes an AI agent seconds. Cross-system dependencies are mapped and traced automatically."),
      H3("Resolution Agent"),
      BODY("Suggests or executes remediation steps based on runbooks and past resolutions. More than 74% of P3/P4 incidents are resolved without human action. The provider never knows the system hiccupped. The member never feels the impact."),
      H3("Runbook Generation Agent"),
      BODY("Auto-generates and updates runbooks from resolved incidents \u2014 compounding operational knowledge over time and eliminating reliance on institutional memory. When a senior engineer leaves, the knowledge stays."),
      H3("Continuous Learning Agent"),
      BODY("Feeds production telemetry back into all agents, ensuring progressive improvement with every incident cycle. The system gets smarter every day. Month 12 operations are fundamentally more capable than Month 1."),

      GAP(6),
      H2("Zero-Touch Operations Pipeline"),
      TBL([new TableRow({ children: [
        STEP("1", "Detect",   ["Correlate 140+\nsources", "Cut noise >60%"],        C.blue),
        STEP("2", "Triage",   ["Impact scoring", "Auto-prioritise", "Route instantly"], "0072C3"),
        STEP("3", "Diagnose", ["Root cause\nin minutes", "Pattern matching"],          C.azure),
        STEP("4", "Resolve",  ["Self-heal P3/P4", "Zero human touch"],                C.teal),
        STEP("5", "Learn",    ["Update runbooks", "Prevent recurrence"],               "005D5D"),
      ]})], W),

      GAP(6),
      H2("Value Realization \u2014 AIOps"),
      TBL([
        new TableRow({ children: [HC("Metric", W*0.42), HC("With IBM AIOps", W*0.28), HC("Est. Annual Value", W*0.30)] }),
        ...[ ["MTTR (Mean Time to Resolve)",    "< 1.8 hours",    "$2.0M \u2013 $3.0M"],
             ["Alert Noise per Shift",          "> 60% Reduced",  "$2.5M \u2013 $3.5M"],
             ["P3/P4 Auto-Resolution",          "> 74%",          "$1.5M \u2013 $2.0M"],
             ["Change Failure Rate",            "40% Reduction",  "$0.8M \u2013 $1.2M"],
             ["System Availability",            "99.9%+",         "$1.0M \u2013 $1.3M"],
             ["Ops Manual Triage Hours",        "~30% Reduction", "$1.3M \u2013 $1.5M"],
        ].map(([a,b,c], i) => new TableRow({ children: [
          DC(a, W*0.42, { b: true, f: alt(i) }),
          VC(b, W*0.28, { al: AlignmentType.CENTER }),
          VC(c, W*0.30, { al: AlignmentType.CENTER }),
        ]})),
      ], W),

      GAP(8),
      STAT([
        [">74%",    "P3/P4 Auto-Resolved",       C.blue  ],
        [">60%",    "Alert Noise Reduced",         C.teal  ],
        ["99.9%+",  "System Availability",         C.azure ],
        ["<1.8 hrs","Mean Time to Resolve",        C.purp  ],
      ]),


      // ================================================================
      //  05  QUALITY ENGINEERING
      // ================================================================
      ...SEC("05", "Quality Engineering", "Measurable Quality at Every Milestone \u2014 Improved with Every Release"),

      ...Q(
        "Every undetected defect in a claims system is a patient who doesn\u2019t get the care they need on time. Every missed test case is a provider who submits correctly and gets denied anyway. Quality is not a phase of delivery. Quality is the promise.",
        "IBM Quality Engineering"
      ),

      H2("Self-Improving Quality Framework"),
      BODY("IBM\u2019s Quality Engineering model embeds measurable validation checkpoints across every stage of development and production \u2014 creating a closed-loop feedback system within the CI/CD pipeline. Production insights, defect analytics, and automation metrics continuously refine testing strategies, enabling sustained defect reduction, faster recovery, and progressive quality improvement over time."),
      BODY("This is not a testing team. This is a quality engine. It learns from every defect, tightens the net with every release, and ensures that the quality of Horizon\u2019s ~1,000 applications improves continuously \u2014 without manual test plan authoring or regression suite maintenance."),

      H2("Quality Controls"),
      BULL("End-to-end traceability from requirement to deployed feature \u2014 full release readiness visibility at every gate."),
      BULL("Defect leakage, density, and stability metrics (MTTR) tracked per domain and per application."),
      BULL("Automation coverage with KPI-driven governance \u2014 every sprint measured against coverage targets."),
      BULL("AI-driven defect insights and regression optimization \u2014 models trained on Horizon\u2019s own incident history."),
      BULL("Production telemetry feeding back into test strategy \u2014 every production incident teaches the quality engine."),

      H2("Intelligent Test Automation"),
      BODY("IBM\u2019s Generative AI capabilities enable self-generating test cases, automated test maintenance, and continuous validation integration \u2014 dramatically reducing the cost and time associated with regression testing across Horizon\u2019s complex, multi-system portfolio. AI synthesises regression, integration, and edge-case tests directly from the code change \u2014 at commit speed."),

      H2("AI-Powered Quality Capabilities"),
      H3("GenAI Test Generation"),
      BODY("AI generates test cases from code changes automatically. Coverage grows without manual test-plan authoring. New features ship with tests from Day 1."),
      H3("Defect Prediction AI"),
      BODY("Models trained on Horizon\u2019s own incident history identify high-risk code paths before they reach UAT \u2014 catching defects where they are cheapest to fix."),
      H3("Production Feedback Loop"),
      BODY("Every production defect teaches the quality engine. Each release cycle the test suite tightens automatically \u2014 an ever-improving net that strengthens without manual intervention."),

      GAP(4),
      CALL("Target: 80% test automation coverage across Horizon\u2019s ~1,000-application portfolio within 12 months of full deployment."),

      GAP(6),
      H2("Quality Metrics \u2014 Before & After"),
      BODY("IBM Quality Engineering targets across Horizon\u2019s AMS portfolio \u2014 current state vs. 6- and 12-month programme milestones:", { sz: 9.5, c: C.g50, i: true, aft: 6 }),
      TBL([
        new TableRow({ children: [HC("Quality Metric", W*0.28), HC("Current State", W*0.18), HC("6-Month Target", W*0.16), HC("12-Month Target", W*0.16), HC("Method", W*0.22)] }),
        ...[ ["Test Automation Coverage",  "~25%",               "55%",          "80%+",         "GenAI self-generating tests"],
             ["Defect Escape",             "High / tracked manually","40% reduction","65% reduction","AI defect prediction"],
             ["Regression Cycle Time",     "Multi-day manual",   "50% faster",   "70% faster",   "Intelligent test selection"],
             ["Mean Time to Detect",       "> 2 hours",          "< 30 min",     "< 15 min",     "AIOps + telemetry feedback"],
             ["AI-Generated Test Cases",   "< 5%",               "40%+",         "> 70%",        "IBM Consulting Advantage"],
             ["Production Incident Rate",  "Baseline",           "20% reduction","40% reduction","Shift-left quality gates"],
             ["Critical Defect Leakage",   "Measured quarterly", "Monthly SLA",  "Zero-leakage SLA","End-to-end traceability"],
        ].map(([a,b,c,d,e], i) => new TableRow({ children: [
          DC(a, W*0.28, { b: true, f: alt(i) }),
          DC(b, W*0.18, { c: C.red, f: alt(i), sz: 9.5, al: AlignmentType.CENTER }),
          DC(c, W*0.16, { c: C.azure, f: alt(i), sz: 9.5, al: AlignmentType.CENTER }),
          VC(d, W*0.16, { sz: 9.5, al: AlignmentType.CENTER }),
          DC(e, W*0.22, { c: C.g70, f: alt(i), sz: 9 }),
        ]})),
      ], W),

      GAP(6),
      H2("Test Automation Coverage Journey"),
      TBL([
        BAR("Baseline  \u2014 Month 0",     25, "~25%",  C.g50),
        BAR("Ignite    \u2014 Month 3",     45, "45%",   "0072C3"),
        BAR("Scale     \u2014 Month 6",     55, "55%",   C.azure),
        BAR("Optimise  \u2014 Month 9",     72, "72%",   C.blue),
        BAR("Target    \u2014 Month 12",    82, "80%+",  C.navy),
      ], W),


      // ================================================================
      //  06  MEMBER & PROVIDER EXPERIENCE
      // ================================================================
      ...SEC("06", "Member & Provider Experience", "Every Operational Improvement Is Measured by the Human It Serves"),

      ...Q(
        "The best technology is invisible to the member. The claim processes correctly. The prior auth comes back in hours, not days. The enrollment is seamless. The call center answers on the first ring. That is the measure. Everything else is infrastructure.",
        "IBM Consulting \u2014 Healthcare Payer Design"
      ),

      H2("Claims Operations Intelligence"),
      BODY("Claims and prior authorization are among Horizon\u2019s highest-volume, highest-risk operational domains. IBM embeds AI-driven intelligence to accelerate adjudication, reduce denials, and eliminate manual backlog management \u2014 at enterprise scale across the ~1,000-application estate."),
      BODY("IBM\u2019s CareOps360 platform surfaces real-time visibility into the claims lifecycle \u2014 from receipt through adjudication, settlement, and denial management. Operational leads and executives identify queue bottlenecks, denial spikes, and auto-adjudication performance degradation in real time, without waiting for next-day reporting."),
      BULL("AI-enhanced auto-adjudication rules engine \u2014 reducing manual adjudication rates from baseline."),
      BULL("Denial pattern analytics \u2014 identifying root causes across procedure, eligibility, and coordination of benefits failures."),
      BULL("Real-time claims dashboard: volume by line of business, TAT trending, denial driver breakdown."),
      BULL("SLA-bound adjudication commitments: turnaround time reduction target agreed at contract."),

      H2("Prior Authorization \u2014 AI-Assisted Review"),
      BODY("Prior authorization is a significant operational and member experience pressure point. Horizon\u2019s current backlog and review cycle times create friction for providers and members alike. IBM deploys AI-assisted review tooling to triage and prioritise requests, identify auto-approvable cases, and flag clinically complex cases for expedited human review."),
      TBL([
        new TableRow({ children: [HC("Prior Auth Metric", W*0.42), HC("Target Direction", W*0.58)] }),
        ...[ ["Requests Received Daily",    "Trend monitored weekly"],
             ["Average Review Hours",       "Reduction target (baseline to agreed)"],
             ["Urgent Request SLA",         "100% within 72-hr regulatory SLA"],
             ["Backlog Size",               "Reduction tracked monthly"],
             ["Auto-Approval Rate (low-risk)","Increase target: >40% by Month 12"],
        ].map(([a,b], i) => new TableRow({ children: [DC(a, W*0.42, { b: true, f: alt(i) }), DC(b, W*0.58, { c: C.g70, f: alt(i) })] })),
      ], W),

      GAP(4),
      CALL("Target: 100% of urgent prior auth requests resolved within regulatory SLA. AI-assisted triage to reduce average review time by 30%+ within 12 months."),

      H2("Enrollment Intelligence"),
      BODY("Horizon\u2019s enrollment pipeline processes tens of thousands of records across individual, group, commercial, and government segments. IBM transforms this from a reactive batch function into a proactive, real-time, AI-augmented enrollment operations capability."),
      BULL("Canonical 834 Transformation \u2014 all channels converted to Horizon canonical format at intake."),
      BULL("Real-Time Validation \u2014 errors caught in minutes, not hours, with companion guide ingestion built in."),
      BULL("Shift-Left Member Mastering \u2014 COB resolved and HUMI assigned earlier, improving auto-match rate."),
      BULL("Agentic Remediation \u2014 majority of exceptions auto-resolved with confidence scoring and RCA generation."),

      H2("Business Domain KPIs"),
      TBL([
        new TableRow({ children: [HC("Business Domain", W*0.26), HC("Key Member/Provider Metric", W*0.46), HC("12-Month Target", W*0.28)] }),
        ...[ ["Claims Operations",   "Adjudication cycle time",             "\u221230%"],
             ["Prior Authorization",  "Average review turnaround",           "\u221230%+"],
             ["Enrollment",           "Time-to-good (intake to validated)",  "\u221240%"],
             ["Member Services",      "First-contact resolution rate",       "+25%"],
             ["Provider Operations",  "Prior auth auto-approval rate",       ">40%"],
             ["IT Operations",        "P3/P4 auto-resolution rate",          ">74%"],
        ].map(([a,b,c], i) => new TableRow({ children: [
          DC(a, W*0.26, { b: true, f: alt(i) }),
          DC(b, W*0.46, { c: C.g70, f: alt(i) }),
          VC(c, W*0.28, { al: AlignmentType.CENTER }),
        ]})),
      ], W),


      // ================================================================
      //  07  CAREOPS360 COMMAND CENTER
      // ================================================================
      ...SEC("07", "CareOps360 Command Center", "IBM\u2019s Executive Operations Platform for Real-Time AMS Visibility at Horizon"),

      ...Q(
        "Horizon\u2019s leadership should never have to ask \u2018how are we doing?\u2019 and wait for a deck. The answer should be live, accurate, and one click away \u2014 every hour of every day. That is what CareOps360 delivers.",
        "IBM Consulting \u2014 Executive Visibility"
      ),

      H2("What Is CareOps360?"),
      BODY("CareOps360 is IBM\u2019s production-grade executive operations platform purpose-built for the Horizon BCBS engagement. It delivers real-time operational intelligence across all AMS towers \u2014 enrollment, claims, applications, infrastructure, and quality \u2014 through a single, unified command center accessible to Horizon\u2019s executive and operational leadership. The platform is architecture-ready for live production data and is currently deployed in a production-equivalent environment."),
      BODY("Built on IBM\u2019s AIOps observability framework, CareOps360 surfaces predictive insights, SLA performance, enrollment intelligence, digital front door metrics, and transformation roadmap progress \u2014 eliminating the need for manual reporting aggregation. No more quarterly decks. No more manual data pulls. Live data, always."),

      H2("Dashboards Delivered"),
      BULL("Executive Overview \u2014 Cross-tower operational pulse with 8 real-time KPI tiles."),
      BULL("Application Health \u2014 ~1,000 app inventory, incident register, availability trends."),
      BULL("Claims Operations \u2014 Daily volume, adjudication queue, denial analytics."),
      BULL("Prior Authorization \u2014 Backlog, review SLA, procedure-level approval rates."),
      BULL("Enrollment Intelligence \u2014 AI-assisted intake, pipeline health, surge detection."),
      BULL("Member Services \u2014 Contact center, chatbot containment, digital adoption."),
      BULL("IBM AIOps Value \u2014 Automation savings, shift-left rate, self-heal event tracking."),
      BULL("Transformation Roadmap \u2014 Initiative portfolio with phase and risk status."),
      BULL("Capability Uplift \u2014 Workforce certification, automation coverage, AI readiness."),

      H2("Metrics Monitored via CareOps360"),
      TBL([
        new TableRow({ children: [HC("Metric Domain", W*0.26), HC("What Will Be Tracked", W*0.74)] }),
        ...[ ["Application Ops",     "Availability, MTTR, incident volume by severity"],
             ["Claims",              "Volume, adjudication rate, TAT, denial drivers"],
             ["Prior Auth",          "Backlog, review SLA, auto-approval rate"],
             ["Enrollment",          "Time-to-good, auto-match rate, queue health"],
             ["Member Services",     "ASA, FCR, chatbot containment, digital adoption"],
             ["AIOps Value",         "Savings YTD, shift-left rate, self-heal events"],
             ["Transformation",      "Phase progress, milestone risk, initiative velocity"],
        ].map(([a,b], i) => new TableRow({ children: [
          DC(a, W*0.26, { b: true, c: C.blue, f: alt(i) }),
          DC(b, W*0.74, { c: C.g70, f: alt(i) }),
        ]})),
      ], W),

      GAP(4),
      H2("Access & Security"),
      BULL("Role-based access: IBM and Horizon executives."),
      BULL("Token-authenticated sessions with inactivity timeout."),
      BULL("HIPAA-compliant \u2014 no PHI data in the command center."),
      BULL("Architecture-ready for production data integration."),


      // ================================================================
      //  08  PHASED DELIVERY ROADMAP
      // ================================================================
      ...SEC("08", "Phased Delivery Roadmap", "A Structured, Compounding Journey from Stabilization to Autonomous Operations"),

      ...Q(
        "Every day a claim processes faster, a prior auth returns sooner, or an outage resolves before a provider notices \u2014 that is a day Horizon\u2019s members experience the IBM difference. That starts in Week 1, not Year 2.",
        "IBM Delivery Governance"
      ),

      BODY("IBM\u2019s proposed transformation follows a structured, phased approach \u2014 delivering quick wins in the immediate term while building the foundation for long-term enterprise transformation. Each phase builds on the last, compounding value across the portfolio."),

      GAP(4),
      TBL([
        new TableRow({ children: [HC("Phase", W*0.14), HC("Timeframe", W*0.10), HC("Key Deliverables", W*0.46), HC("Value Signal", W*0.30)] }),
        ...[ ["Phase 0\nFoundation",   "0\u20138 Wks",
              "CareOps360 blueprint  \u00B7  AIOps baseline  \u00B7  Transition planning  \u00B7  AI-assisted dev + intelligent QA rollout",
              "Live dashboards  \u00B7  Baselines agreed  \u00B7  Zero BAU disruption"],
             ["Phase 1\nIgnite",       "Mo 1\u20133",
              "Integration simplification  \u00B7  AIOps on production  \u00B7  Test automation framework  \u00B7  Innovation Council  \u00B7  GenAI dev lifecycle",
              "MTTR \u221220%  \u00B7  First automation ROI  \u00B7  QE coverage 45%"],
             ["Phase 2\nScale",        "Mo 3\u20136",
              "Agentic AI incident triage live  \u00B7  Digital Front Door blueprint  \u00B7  COBOL \u2192 Java pilot  \u00B7  Mainframe modernization initiated",
              "Auto-resolve >50%  \u00B7  Defect escape \u221240%  \u00B7  $3\u20135M cumulative"],
             ["Phase 3\nOptimize",     "Mo 6\u201312",
              "Full incident autonomy  \u00B7  Claims adjudication parallel run  \u00B7  Predictive capacity management  \u00B7  QE 80%+",
              "Cost takeout $6\u201310M  \u00B7  MTTR <1.8 hrs  \u00B7  99.9%+ availability"],
             ["Phase 4\nTransform",    "Yr 1\u20132",
              "Full autonomous P3/P4 operations  \u00B7  Enterprise-wide observability  \u00B7  Mainframe migration complete  \u00B7  Member front door operationalized",
              "Cost takeout 40\u201350%  \u00B7  Total value $12\u201318M+"],
        ].map(([ph,ti,de,va], i) => new TableRow({ children: [
          DC(ph, W*0.14, { b: true, c: C.navy, f: alt(i) }),
          DC(ti, W*0.10, { c: C.g50, f: alt(i), al: AlignmentType.CENTER }),
          DC(de, W*0.46, { c: C.g70, f: alt(i) }),
          VC(va, W*0.30),
        ]})),
      ], W),

      GAP(6),
      H2("Governance at Every Phase"),
      BODY("IBM\u2019s governance model ensures continuous accountability from the operational team to the boardroom. Every metric is live in CareOps360 \u2014 no manual reporting, no quarterly surprises."),
      BULL("Executive Steering Committee: Quarterly IBM VP + Horizon CIO/COO review \u2014 strategic direction, value realization, and programme health."),
      BULL("Program Management Office: Monthly health reporting and risk register \u2014 every initiative tracked against milestones."),
      BULL("Delivery Operations Reviews: Bi-weekly SLA and incident trends \u2014 operational cadence with the teams doing the work."),
      BULL("Financial Governance: Monthly actuals vs. committed model \u2014 cost takeout tracked to the dollar."),
      BULL("Innovation Council: Quarterly idea pipeline and prioritization \u2014 business-case-backed innovation at Horizon\u2019s direction."),

      GAP(6),
      H2("Transformation Portfolio at a Glance"),
      BULL("60 total initiatives across 3 delivery years \u2014 across Payer, Clinical, Digital, and Enterprise domains."),
      BULL("25 Year 1 initiatives \u2014 Technical Debt, Digital, Payer \u2014 delivering immediate, measurable value."),
      BULL("15 Active / In-Flight as of programme launch \u2014 no ramp-up delay."),
      BULL("9 milestones completed in foundation phase \u2014 demonstrating immediate traction."),
      BULL("All initiatives tracked live in CareOps360\u2019s Transformation Roadmap dashboard with phase, status, owner, and risk updated in real time."),

      GAP(4),
      CALL("CareOps360 makes every metric above visible in real time from Day 1. No manual reporting. No quarterly decks. Live data, always."),


      // ================================================================
      //  09  TRANSFORMATION OPPORTUNITIES
      // ================================================================
      ...SEC("09", "Transformation Opportunities", "Platform Modernization, Mainframe Migration & Technical Debt Governance"),

      ...Q(
        "A provider should never have to wait because a batch integration only runs overnight. A member should never be denied because an eligibility rule is trapped in a mainframe subroutine from 1997. Modernization is not a technology programme \u2014 it is a member experience programme.",
        "IBM Platform Modernization"
      ),

      H2("Integration Modernization \u2014 Real-Time, Cloud-Native"),
      BODY("IBM\u2019s Integration Modernization programme transforms Horizon\u2019s data exchange backbone from point-to-point batch processes to a cloud-native, event-driven, real-time integration architecture \u2014 enabling claims, eligibility, provider, and member data to flow continuously across systems without overnight lag. When a member\u2019s eligibility changes at 3 PM, every downstream system reflects it at 3:01 PM \u2014 not 6 AM the next day."),
      BULL("MOM API-First Hub (HLGN-1053) \u2014 Transform Horizon\u2019s Messaging-Oriented Middleware from point-to-point topology to an API-first enterprise integration hub \u2014 enabling real-time, event-driven partner data exchange across claims, eligibility, and provider domains."),
      BULL("Event Streaming Architecture \u2014 Replace batch ETL with Apache Kafka-based event streaming on AWS MSK \u2014 delivering sub-second data freshness across enrollment, claims, and provider systems."),
      BULL("API Gateway Consolidation \u2014 Unified API gateway via AWS API Gateway + IBM API Connect \u2014 replacing 70+ point-to-point integrations with governed, observable, versioned APIs."),
      BULL("ODM Cloud-Native (HLGN-1054) \u2014 Migrate IBM ODM Decision Center from on-premises to containerized cloud environment, enabling real-time business rule evaluation and business-user-configurable workflows."),

      H2("Application Rationalization"),
      BODY("IBM will conduct a structured assessment of Horizon\u2019s ~1,000 application portfolio using Texture and IBM accelerators like ICCA \u2014 identifying candidates for decommission, consolidation, cloud migration, or AI-augmented modernization. Every application is catalogued, scored for business criticality, and assigned a modernization path. Redundant applications are consolidated. End-of-life platforms are replaced. The portfolio becomes leaner, faster, and cheaper to operate."),

      H2("Mainframe Modernization Roadmap"),
      BODY("Horizon\u2019s mainframe hosts critical batch processing, eligibility logic, and financial settlement. IBM understands that modernizing this estate is not merely a technical programme \u2014 it is a strategic risk management exercise that must be executed with surgical precision. IBM proposes a phased, parallel-run migration approach:"),
      TBL([
        new TableRow({ children: [HC("Workstream", W*0.28), HC("Approach", W*0.44), HC("Timeline", W*0.28)] }),
        ...[ ["Eligibility Processing", "API-wrap \u2192 Cloud rehost",     "Q2\u2013Q4 2026"],
             ["COBOL \u2192 Java Pilot", "AI-assisted code conversion",     "Q3 2026"],
             ["Unified Payments",       "AWS modernization",               "Q3 2026"],
             ["Claims Engine",          "Parallel-run cutover",            "Q1\u2013Q2 2027"],
             ["Member Data Services",   "Event-driven migration",          "Q4 2026+"],
        ].map(([a,b,c], i) => new TableRow({ children: [
          DC(a, W*0.28, { b: true, f: alt(i) }),
          DC(b, W*0.44, { c: C.g70, f: alt(i) }),
          VC(c, W*0.28, { al: AlignmentType.CENTER }),
        ]})),
      ], W),

      H2("Technical Debt Governance \u2014 n\u22121/n\u22122 Version Standard"),
      BULL("IBM commits to maintaining all Horizon stacks at n\u22121 (one version behind latest LTS) \u2014 balancing security currency with stability."),
      BULL("Quarterly version review cadence: IBM + Horizon ARB jointly assess all frameworks, runtimes, and vendor platforms."),
      BULL("n\u22121 compliance report delivered monthly to Horizon CTO: stacks at EOL risk, CVE exposure, and upgrade progress."),
      BULL("Priority-1 CVEs receive emergency patch within 72 hours regardless of n\u22121 cadence."),
      BULL("2026 Year 1: 25 platform upgrades in flight (Angular 17, .NET 8, ODM 9.2, SAP BO 4.3)."),

      GAP(8),
      STAT([
        ["~1,000",        "Applications Assessed", C.blue  ],
        ["COBOL\u2192Java","AI-Assisted Conversion", C.azure ],
        ["n\u22121/2",     "Stack Version Governance", C.teal ],
        ["Zero",          "Disruption Commitment",   C.purp  ],
      ]),


      // ================================================================
      //  10  WHY IBM — CALL TO ACTION
      // ================================================================
      ...SEC("10", "Why IBM \u2014 and Why Now", "Scale, Depth, Skin in the Game & Next Steps"),

      ...Q(
        "IBM\u2019s ultimate accountability is not to a contract \u2014 it is to the 3.7 million members who rely on Horizon\u2019s systems every day. The patient waiting for a prior auth. The provider navigating a claims dispute. The family enrolling for the first time. Those are IBM\u2019s stakeholders.",
        "IBM Consulting, Healthcare & Payer Delivery"
      ),

      H2("Enterprise Transformation, Not Just IT"),
      BODY("IBM\u2019s proposal delivers unified transformation across Operations, Development, and Quality Engineering \u2014 not siloed initiatives that optimize one tower while creating drag in another. IBM\u2019s delivery philosophy \u2014 AI-Embedded Operations, Scalable Architecture, and Outcome-Based Engagement \u2014 ensures that every IBM investment compounds Horizon\u2019s capability, not IBM\u2019s margin."),

      H2("What Differentiates IBM"),
      H3("Skin in the Game"),
      BODY("Outcome-based engagement with IBM\u2019s full capability depth behind every phase \u2014 IBM\u2019s success is tied directly to Horizon\u2019s outcomes. Targets missed trigger IBM remediation plans \u2014 not contract renegotiations or rate discussions. IBM carries the delivery risk."),
      H3("AI at Depth, Not at Surface"),
      BODY("IBM\u2019s Agentic AI, Generative AI, and AIOps capabilities are production-proven across healthcare and financial services \u2014 not proof-of-concept. Live at comparable payers today. Horizon benefits from Day 1, not after a 12-month buildout."),
      H3("IBM Consulting Advantage"),
      BODY("Horizon realises accelerated value through IBM Consulting\u2019s portfolio of 6,500+ assets and accelerators, strategic initiatives including IBM Build on Bedrock (BOB). These are production-tested assets, not templates."),
      H3("Transformation Office"),
      BODY("IBM commits a structured quarterly innovation process \u2014 governed, prioritized, business-case-backed innovation at Horizon\u2019s direction. Not a roadmap slide. A working programme with dedicated leadership and budget."),
      H3("Continuous Innovation Included"),
      BODY("Innovation sprints, AI tooling, and accelerators are built into the base delivery model. Transformation is not a separate future line item \u2014 it is embedded in every phase of the partnership."),

      GAP(6),
      STAT([
        ["20K+",  "AI Practitioners",   C.blue  ],
        ["81K+",  "Cloud Experts",       C.azure ],
        ["40K+",  "AI Engagements",      C.teal  ],
        ["15K+",  "Global Delivery Centers", C.purp ],
      ]),

      GAP(8),
      H2("Healthcare Payer Pedigree"),
      BODY("IBM brings deep healthcare payer expertise \u2014 including BCBS operating models, CMS regulatory compliance, HIPAA data governance, enrollment lifecycle management, and claims adjudication platform knowledge \u2014 directly into Horizon\u2019s delivery team from Day 1."),
      BULL("AWS Partner of the Year 2025 \u2014 Enterprise AI delivery."),
      BULL("Leader in Enterprise Software Quality & Testing."),
      BULL("Proven BCBS engagement track record \u2014 9 of the top 10 US health payers served."),
      BULL("Gartner Leader across 7 Data and AI Magic Quadrants (2025\u20132026)."),
      BULL("CMS & HIPAA compliance expertise \u2014 regulatory readiness from Day 1."),

      GAP(6),
      H2("Recommended Next Steps"),
      BODY("From Proposal to Partnership \u2014 IBM\u2019s Proposed Engagement Path:", { sz: 10.5, b: true, c: C.navy, aft: 6 }),

      H3("Immediate Actions (2\u20134 Weeks)"),
      BULL("Schedule Executive Alignment Session \u2014 IBM VP + Horizon CIO/COO to confirm transformation vision and scope."),
      BULL("Conduct CareOps360 Command Center Walkthrough \u2014 live demo with Horizon\u2019s operational and technology leadership."),
      BULL("Initiate Contract Finalization \u2014 confirm outcome-based SLA schedule and investment model."),
      BULL("Begin Phase 0 Foundation Assessment \u2014 IBM AMS team on-site for application portfolio and AIOps baseline."),

      H3("Phase 0 Commitments (Weeks 1\u201312)"),
      BULL("Weeks 1\u20132: IBM transition team mobilized; AIOps instrumentation begins across priority applications."),
      BULL("Weeks 3\u20134: Architecture definition workshop; KPI alignment roadmap delivered."),
      BULL("Weeks 5\u20136: Phase 1 Ignite plan presented to Steering Committee."),
      BULL("Weeks 7\u20138: Transformation Office inaugural session \u2014 first idea pipeline scoped."),
      BULL("Weeks 8\u201312: AIOps platform live on production."),

      GAP(4),
      CALL("IBM is ready to begin. With Horizon\u2019s confirmation, Phase 0 can mobilize within 5 business days."),

      GAP(10),

      // Closing
      new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.blue } }, spacing: { before: sp(5), after: sp(8) } }),

      new Paragraph({
        children: [
          R("\u201CThe measure of a great payer isn\u2019t uptime percentages or ticket counts. It is the member who never has to think about their insurance because ", { sz: 11.5, i: true, c: C.g70 }),
          R("everything just works.", { sz: 11.5, b: true, i: true, c: C.navy }),
          R(" That is what IBM is here to build.\u201D", { sz: 11.5, i: true, c: C.g70 }),
        ],
        spacing: { before: sp(4), after: sp(4) },
      }),
      P([R("A Strategic Partnership for Enterprise Transformation", { sz: 12, b: true, c: C.navy })], { bef: 6, aft: 4, al: AlignmentType.CENTER }),
      P([R("IBM is committed to Horizon\u2019s success \u2014 not as a vendor, but as a transformation partner with shared stakes in every outcome.", { sz: 10.5, i: true, c: C.g70 })], { aft: 8, al: AlignmentType.CENTER }),

      new Paragraph({ children: [], border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.g20 } }, spacing: { before: sp(5), after: sp(4) } }),
      P([R("\u00A9 2026 IBM Corporation  \u00B7  IBM-HZN-AMS-RFP-2026-CAS  \u00B7  Confidential \u2014 Executive Use Only  \u00B7  All figures based on IBM programme data and industry benchmarks.", { sz: 8, c: C.g50 })], { al: AlignmentType.CENTER }),
    ]},
  ],
});

const buf = await Packer.toBuffer(doc);
writeFileSync("attached_assets/IBM_Horizon_AMS_Executive_Summary_April2026.docx", buf);
console.log("Done \u2014 " + buf.length.toLocaleString() + " bytes");
