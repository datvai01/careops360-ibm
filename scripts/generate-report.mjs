import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle,
  ShadingType, TableLayoutType, VerticalAlign, PageBreak,
  Header, Footer, ImageRun, UnderlineType,
} from 'docx';
import { writeFileSync, readFileSync } from 'fs';

// ─── Brand colours (as hex without #) ───────────────────────────────────────
const BLUE   = '0F62FE';
const NAVY   = '0A1931';
const SLATE  = '21272A';
const TEAL   = '009D9A';
const GREEN  = '198038';
const ORANGE = 'FF832B';
const GRAY   = 'F4F4F4';
const WHITE  = 'FFFFFF';
const MID    = '6F6F6F';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function run(text, opts = {}) {
  return new TextRun({ text, font: 'Calibri', ...opts });
}

function bold(text, opts = {}) {
  return run(text, { bold: true, ...opts });
}

function blueRun(text, opts = {}) {
  return run(text, { color: BLUE, bold: true, ...opts });
}

function para(children, opts = {}) {
  const arr = Array.isArray(children) ? children : [run(children)];
  return new Paragraph({ children: arr, spacing: { after: 120 }, ...opts });
}

function h1(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Calibri', bold: true, size: 52, color: NAVY })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } },
  });
}

function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Calibri', bold: true, size: 36, color: BLUE })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
  });
}

function h3(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Calibri', bold: true, size: 28, color: SLATE })],
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
  });
}

function body(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Calibri', size: 22, color: SLATE })],
    spacing: { after: 120 },
    alignment: AlignmentType.JUSTIFIED,
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Calibri', size: 22, color: SLATE })],
    bullet: { level },
    spacing: { after: 80 },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function divider() {
  return new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D0D0D0', space: 4 } },
    spacing: { before: 200, after: 200 },
  });
}

function spacer(n = 1) {
  return Array.from({ length: n }, () =>
    new Paragraph({ children: [run('')], spacing: { after: 40 } })
  );
}

function cell(text, opts = {}) {
  const {
    color = SLATE, bg = WHITE, bold: isBold = false,
    shade = false, width, align = AlignmentType.LEFT,
    size = 20,
  } = opts;
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, font: 'Calibri', bold: isBold, color, size })],
        alignment: align,
        spacing: { before: 60, after: 60 },
      }),
    ],
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    shading: shade ? { fill: bg, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    ...(width ? { width: { size: width, type: WidthType.DXA } } : {}),
  });
}

function headerRow(labels) {
  return new TableRow({
    children: labels.map(l =>
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: l, font: 'Calibri', bold: true, color: WHITE, size: 20 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 80 },
        })],
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        shading: { fill: NAVY, type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER,
      })
    ),
    tableHeader: true,
  });
}

function simpleTable(headers, rows, colWidths) {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 9072, type: WidthType.DXA },
    rows: [
      headerRow(headers),
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map((val, ci) => {
            const isNum = /^[\d,.$%+]+$/.test(String(val).trim());
            return new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: String(val), font: 'Calibri', size: 20,
                  color: ci === 0 ? SLATE : (String(val).startsWith('+') ? GREEN : SLATE),
                })],
                alignment: isNum ? AlignmentType.CENTER : AlignmentType.LEFT,
                spacing: { before: 60, after: 60 },
              })],
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              shading: { fill: ri % 2 === 0 ? WHITE : 'F0F4FF', type: ShadingType.CLEAR },
              verticalAlign: VerticalAlign.CENTER,
              ...(colWidths ? { width: { size: colWidths[ci], type: WidthType.DXA } } : {}),
            });
          }),
        })
      ),
    ],
  });
}

// ─── Cover Page ──────────────────────────────────────────────────────────────

function coverPage() {
  return [
    ...spacer(6),
    new Paragraph({
      children: [new TextRun({ text: 'IBM × HORIZON BCBS', font: 'Calibri', bold: true, size: 28, color: BLUE, characterSpacing: 200 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Transformation Program', font: 'Calibri', bold: true, size: 72, color: NAVY })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Executive Briefing Document', font: 'Calibri', bold: false, size: 36, color: MID })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [],
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 4 } },
      spacing: { after: 320 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Prepared for:', font: 'Calibri', size: 22, color: MID })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Horizon Blue Cross Blue Shield of New Jersey — Executive Leadership', font: 'Calibri', bold: true, size: 24, color: NAVY })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Prepared by:', font: 'Calibri', size: 22, color: MID })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'IBM Consulting — Healthcare & Payer Delivery', font: 'Calibri', bold: true, size: 24, color: NAVY })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'April 2026  |  CONFIDENTIAL', font: 'Calibri', size: 22, color: MID, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    pageBreak(),
  ];
}

// ─── Page 2: Executive Summary ───────────────────────────────────────────────

function executiveSummary() {
  return [
    h1('Executive Summary'),
    body(
      'IBM and Horizon Blue Cross Blue Shield of New Jersey (Horizon BCBS) have entered a multi-year strategic ' +
      'transformation partnership designed to modernise healthcare operations, accelerate digital adoption, and ' +
      'build a measurably stronger delivery organisation. This document summarises the scope, progress, and ' +
      'strategic trajectory of that programme as of April 2026.'
    ),
    body(
      'IBM\'s delivery model at Horizon is evolving from traditional operations to AI-augmented and autonomous ' +
      'operations. This shift is enabled by a rapidly growing certified AI/ML workforce, automation coverage ' +
      'scaling across all enrollment workflows, and the redeployment of delivery staff from manual tasks to ' +
      'higher-value advisory and engineering roles.'
    ),
    h2('Programme at a Glance'),
    simpleTable(
      ['Dimension', 'Status / Metric'],
      [
        ['Certified Workforce', '382 employees holding 4,599 total certifications'],
        ['AI / ML Certified Resources', '307 certified professionals across AI, ML & Data Science'],
        ['Automation Coverage', 'Scaling across all enrollment workflows'],
        ['Key Strategic Initiatives', 'Digital Front Door · Quote to Cart · ICOE Modernisation · Mainframe Modernisation'],
        ['Operational Model', 'Transitioning: Traditional → AI-Augmented → Autonomous'],
        ['Programme Classification', 'Confidential — Executive Leadership Only'],
      ],
      [3200, 5872]
    ),
    ...spacer(1),
    body(
      'The following pages provide a structured narrative covering workforce capability uplift, enrollment ' +
      'intelligence, digital channel transformation, operational excellence, financial performance, and the ' +
      'strategic roadmap forward.'
    ),
    pageBreak(),
  ];
}

// ─── Page 3: Transformation Vision ──────────────────────────────────────────

function transformationVision() {
  return [
    h1('Transformation Vision & Strategic Context'),
    body(
      'Horizon BCBS is one of the most significant healthcare payers in New Jersey, serving millions of members ' +
      'across commercial, Medicare, and Medicaid lines of business. As the healthcare landscape accelerates ' +
      'toward digital-first member engagement, regulatory complexity, and cost pressure, Horizon\'s partnership ' +
      'with IBM positions the organisation at the forefront of operational transformation.'
    ),
    h2('The Transformation Imperative'),
    body(
      'Three converging forces are driving the urgency and scope of this transformation:'
    ),
    bullet('Member Expectations: Digital-native members demand seamless, real-time self-service for enrollment, claims, and care navigation — channels that legacy operations cannot support at scale.'),
    bullet('Operational Efficiency: Manual-intensive processes across enrollment, eligibility, and billing create cost drag and error exposure that automation can systematically eliminate.'),
    bullet('Workforce Evolution: The talent required to operate and evolve AI-augmented systems is fundamentally different from traditional BPO delivery — requiring deliberate capability investment.'),
    ...spacer(1),
    h2('IBM\'s Operating Model Evolution'),
    simpleTable(
      ['Phase', 'Model', 'Characteristics', 'Timeline'],
      [
        ['Phase 1', 'Traditional Operations', 'Manual workflows · SLA-driven · Reactive', '2022–2023'],
        ['Phase 2', 'AI-Assisted', 'AI co-pilots · Partial automation · Data-informed', '2024–2025'],
        ['Phase 3', 'AI-Augmented', 'End-to-end automation · Predictive analytics · Adaptive', '2025–2026'],
        ['Phase 4', 'Autonomous Operations', 'Self-healing workflows · Continuous optimisation · AI-led', '2027+'],
      ],
      [1200, 2000, 3600, 1500]
    ),
    ...spacer(1),
    body(
      'IBM\'s delivery organisation at Horizon is currently transitioning between Phase 2 and Phase 3, with ' +
      'targeted pilots of autonomous workflow patterns already underway in enrollment processing and eligibility verification.'
    ),
    pageBreak(),
  ];
}

// ─── Page 4: Workforce Capability Uplift ─────────────────────────────────────

function workforceCapability() {
  return [
    h1('Workforce Capability Uplift & AI Readiness'),
    body(
      'A transformation of this magnitude requires not only technology investment, but a parallel and sustained ' +
      'investment in the skills of the people delivering it. IBM has made this a first-order priority: as of ' +
      'April 2026, 382 IBM delivery professionals assigned to Horizon carry a combined 4,599 certifications ' +
      'across AI, cloud, automation, healthcare-specific, and technical domains.'
    ),
    h2('Certification Landscape'),
    simpleTable(
      ['Capability Domain', 'Certified Employees', 'Strategic Relevance'],
      [
        ['Healthcare & Payer Domain', '342', 'Deep Horizon business context'],
        ['IBM Products & Technologies', '338', 'Platform depth & support continuity'],
        ['AI / ML & Data Science', '307', 'Autonomous operations enablement'],
        ['Cloud Platforms (AWS + Azure)', '250', 'Multi-cloud delivery capability'],
        ['IBM Consulting & Professional', '227', 'Advisory & architecture leadership'],
        ['Agile & Project Management', '176', 'Delivery discipline & governance'],
        ['Automation & RPA', '91', 'Workflow automation at scale'],
        ['Programming & Development', '79', 'Custom engineering capacity'],
        ['Big Data & Analytics', '53', 'Predictive & operational analytics'],
        ['DevOps & Infrastructure', '41', 'Reliability engineering & CI/CD'],
        ['Integration & APIs', '33', 'System interconnectivity'],
        ['Security & Compliance', '26', 'HIPAA & regulatory posture'],
        ['Database & Data Management', '18', 'Data governance foundation'],
        ['Red Hat Technologies', '5', 'Open-source & container platforms'],
      ],
      [3500, 2000, 3572]
    ),
    ...spacer(1),
    h2('Capability Maturity Progression'),
    body('IBM\'s workforce at Horizon is progressing through four structured maturity stages:'),
    bullet('Foundation (Complete): Core IBM platform certifications, healthcare regulatory grounding, baseline delivery readiness.'),
    bullet('Practitioner (Underway): AI/ML practitioner credentials, automation platform expertise, cloud delivery certification.'),
    bullet('Specialist (In Progress): Advanced AI engineering, cloud architecture, data science specialisation.'),
    bullet('Strategic AI Leader (Target): AI governance expertise, autonomous operations leadership, cross-domain innovation capacity.'),
    pageBreak(),
  ];
}

// ─── Page 5: Enrollment Intelligence ─────────────────────────────────────────

function enrollmentIntelligence() {
  return [
    h1('Enrollment Intelligence & Operational Performance'),
    body(
      'Enrollment is the operational heartbeat of any healthcare payer — the point where member relationships ' +
      'begin, revenue is activated, and downstream claims and care management flows are initialised. IBM\'s ' +
      'Enrollment Intelligence capability brings real-time visibility, predictive analytics, and automated ' +
      'exception handling to Horizon\'s enrollment operations.'
    ),
    h2('Enrollment Operations Dashboard Capabilities'),
    bullet('Real-time enrollment volume tracking across Commercial, Medicare, and Medicaid lines.'),
    bullet('Automated error detection and root-cause classification for enrollment exceptions.'),
    bullet('Predictive modelling for enrollment surge periods (open enrollment, ACA deadlines).'),
    bullet('End-to-end SLA tracking with escalation triggers at the workflow level.'),
    bullet('Member journey analytics connecting enrollment events to downstream activation rates.'),
    ...spacer(1),
    h2('Key Operational Metrics'),
    simpleTable(
      ['Metric', 'Current Performance', 'Target', 'Trend'],
      [
        ['Enrollment Processing Accuracy', '99.2%', '99.5%', '+0.3% YTD'],
        ['Average Processing Cycle Time', '< 24 hrs', '< 12 hrs', 'Improving'],
        ['Exception Rate (All Channels)', '< 2.1%', '< 1.5%', 'Declining'],
        ['Auto-Resolution Rate', '74%', '85%', '+11% YTD'],
        ['Member Activation Lag (Days)', '1.8 days avg', '< 1 day', 'Improving'],
        ['Eligibility Verification Accuracy', '99.6%', '99.8%', 'Stable'],
      ],
      [3000, 2200, 1800, 2072]
    ),
    ...spacer(1),
    h2('Automation Impact on Enrollment'),
    body(
      'IBM\'s automation programme has introduced intelligent routing, automated eligibility checks, and ' +
      'exception-triage bots across the enrollment workflow stack. These capabilities directly reduce manual ' +
      'touchpoints, compress cycle times, and improve accuracy at scale — freeing skilled staff for exception ' +
      'handling and member escalations that require human judgment.'
    ),
    pageBreak(),
  ];
}

// ─── Page 6: Digital Front Door ───────────────────────────────────────────────

function digitalFrontDoor() {
  return [
    h1('Digital Front Door — Channel Transformation Programme'),
    body(
      'The Digital Front Door (DFD) programme is IBM\'s flagship initiative to transform how Horizon BCBS ' +
      'members engage with their health plan. The programme replaces fragmented, channel-siloed experiences ' +
      'with a unified, AI-enhanced digital platform that serves members across web, mobile, and telephony ' +
      'touchpoints.'
    ),
    h2('Programme Objectives'),
    bullet('Deliver a seamless, omni-channel enrollment and member self-service experience.'),
    bullet('Reduce inbound call centre volume by automating common member enquiries.'),
    bullet('Accelerate time-to-coverage for new member activations.'),
    bullet('Provide real-time plan comparison, Quote to Cart capability, and digital ID card issuance.'),
    bullet('Establish a single digital identity for each member across all Horizon products.'),
    ...spacer(1),
    h2('Programme Roadmap Phases'),
    simpleTable(
      ['Phase', 'Scope', 'Status', 'Outcome'],
      [
        ['Phase 1 — Foundation', 'Digital identity, SSO, member portal v1', 'Complete', 'Unified login & profile management'],
        ['Phase 2 — Self-Service', 'Online enrollment, plan tools, COBRA digital', 'In Progress', 'Reduced call deflection rate'],
        ['Phase 3 — Quote to Cart', 'Real-time quoting, shopping, payment rails', 'In Progress', 'Frictionless plan selection & payment'],
        ['Phase 4 — AI Personalisation', 'Predictive recommendations, proactive nudges', 'Planned Q3 2026', 'Member lifetime value optimisation'],
        ['Phase 5 — Autonomous CX', 'AI-resolved enquiries, self-healing journeys', 'Planned 2027', 'Near-zero agent-assisted transactions'],
      ],
      [1500, 2500, 1800, 3272]
    ),
    ...spacer(1),
    h2('Quote to Cart Initiative'),
    body(
      'Quote to Cart is a high-priority workstream within DFD that enables prospective and renewing members ' +
      'to receive a personalised plan quote, compare options, select coverage, and complete payment — entirely ' +
      'within a digital channel. This capability directly reduces broker dependency for straightforward ' +
      'individual and small-group purchases and compresses the sales cycle from days to minutes.'
    ),
    pageBreak(),
  ];
}

// ─── Page 7: ICOE & Mainframe Modernisation ───────────────────────────────────

function platformModernisation() {
  return [
    h1('Platform Modernisation — ICOE & Mainframe'),
    body(
      'Horizon\'s core administrative systems carry decades of business logic essential to accurate claims ' +
      'adjudication, benefits configuration, and regulatory compliance. IBM\'s Platform Modernisation ' +
      'programme is systematically migrating these systems to modern, cloud-native architectures — without ' +
      'disrupting operational continuity.'
    ),
    h2('ICOE Modernisation Programme'),
    body(
      'The IBM Centre of Excellence (ICOE) Modernisation initiative is restructuring IBM\'s delivery ' +
      'organisation to align with Horizon\'s evolving platform landscape. Key dimensions include:'
    ),
    bullet('Establishing dedicated engineering squads aligned to Horizon\'s product and platform domains.'),
    bullet('Introducing DevSecOps pipelines that replace manual release management processes.'),
    bullet('Deploying observability and SRE practices for proactive system health management.'),
    bullet('Building shared services for API management, identity, and data integration.'),
    ...spacer(1),
    h2('Mainframe Modernisation'),
    body(
      'Horizon\'s mainframe environment hosts critical batch processing, eligibility logic, and financial ' +
      'settlement workflows. IBM\'s Mainframe Modernisation programme is executing a phased migration strategy:'
    ),
    simpleTable(
      ['Workstream', 'Approach', 'Timeline', 'Risk Level'],
      [
        ['Eligibility Processing', 'API-wrap → Cloud rehost → Native rebuild', 'Q2 2026 – Q1 2027', 'Medium'],
        ['Claims Adjudication Engine', 'Parallel-run → Phased cutover', 'Q3 2026 – Q2 2027', 'High'],
        ['Member Data Services', 'Extract & modernise → Event-driven architecture', 'Q4 2026 – Q3 2027', 'Medium'],
        ['Financial Settlement Batch', 'Lift & shift → Containerised microservices', '2027', 'High'],
        ['Reporting & Analytics Layer', 'Data lakehouse migration (ongoing)', 'Q1–Q4 2026', 'Low'],
      ],
      [2200, 2600, 2200, 2072]
    ),
    ...spacer(1),
    body(
      'Each modernisation workstream is governed by a dedicated Architecture Review Board with joint IBM and ' +
      'Horizon representation, ensuring risk is managed and rollback plans are maintained throughout.'
    ),
    pageBreak(),
  ];
}

// ─── Page 8: IBM AIOps Value ──────────────────────────────────────────────────

function aIOpsValue() {
  return [
    h1('IBM AIOps Value — Measurable Outcomes'),
    body(
      'IBM AIOps brings machine learning-driven operational intelligence to Horizon\'s IT and business ' +
      'operations. The programme applies event correlation, predictive alerting, and automated remediation ' +
      'to reduce noise, accelerate incident resolution, and proactively prevent outages.'
    ),
    h2('AIOps Deployment Scope'),
    bullet('Event correlation across 140+ integrated monitoring sources.'),
    bullet('Intelligent alert grouping reducing alert noise by >60%.'),
    bullet('Predictive incident detection with average 35-minute early warning window.'),
    bullet('Automated runbook execution for P3/P4 incident classes.'),
    bullet('Change risk scoring integrated with Horizon\'s ITSM platform.'),
    ...spacer(1),
    h2('Value Realisation Summary'),
    simpleTable(
      ['Value Category', 'Metric', 'Realised Outcome'],
      [
        ['Incident Response', 'Mean Time to Resolve (MTTR)', 'Reduced from 4.2 hrs → 1.8 hrs avg'],
        ['Alert Management', 'Alert noise reduction', '>60% fewer actionable alerts per shift'],
        ['Availability', 'System uptime (critical services)', '99.95% — up from 99.7% baseline'],
        ['Change Management', 'Failed change rate', 'Reduced by 40% via AI risk scoring'],
        ['Capacity Planning', 'Over-provisioning incidents', 'Down 35% — resource optimisation AI'],
        ['Staff Efficiency', 'Ops team hours on manual triage', 'Reduced by ~30% per month'],
      ],
      [2200, 2800, 4072]
    ),
    ...spacer(1),
    h2('Automation Coverage Across Enrollment Workflows'),
    body(
      'IBM\'s automation programme has achieved substantial coverage across Horizon\'s enrollment workflow ' +
      'stack. RPA bots, intelligent document processing, and API-orchestrated integrations now handle ' +
      'routine transactions end-to-end — with human intervention reserved for complex exceptions, ' +
      'regulatory escalations, and relationship-sensitive member interactions.'
    ),
    pageBreak(),
  ];
}

// ─── Page 9: Financial & SLA Performance ─────────────────────────────────────

function financialSLA() {
  return [
    h1('Financial Performance & SLA Governance'),
    body(
      'Operational excellence and financial predictability are dual imperatives for IBM\'s delivery ' +
      'model at Horizon. This section summarises programme financials, contractual SLA adherence, and ' +
      'the governance mechanisms that ensure accountability at every level of service delivery.'
    ),
    h2('SLA Performance Summary'),
    simpleTable(
      ['SLA Category', 'Contracted Target', 'Current Performance', 'Status'],
      [
        ['Enrollment Processing Accuracy', '≥ 99.0%', '99.2%', 'Met'],
        ['System Availability (Core)', '≥ 99.9%', '99.95%', 'Exceeded'],
        ['Incident Resolution (P1)', '< 4 hours', '< 1.8 hours avg', 'Exceeded'],
        ['Incident Resolution (P2)', '< 8 hours', '< 4.1 hours avg', 'Exceeded'],
        ['Change Success Rate', '≥ 97%', '98.4%', 'Exceeded'],
        ['Member Data Quality Index', '≥ 98.5%', '99.1%', 'Exceeded'],
        ['Reporting & Analytics Delivery', '100% on-time', '98.7%', 'Near Target'],
      ],
      [2700, 2200, 2400, 1772]
    ),
    ...spacer(1),
    h2('Governance Framework'),
    bullet('Executive Steering Committee: Quarterly joint review — IBM VP + Horizon CIO/COO.'),
    bullet('Programme Management Office (PMO): Monthly programme health reporting and risk register review.'),
    bullet('Delivery Operations Reviews: Bi-weekly SLA performance and incident trend reviews.'),
    bullet('Financial Governance: Monthly actuals vs. committed delivery model reconciliation.'),
    bullet('Audit & Compliance: Annual HIPAA attestation and SOC 2 Type II reporting.'),
    ...spacer(1),
    h2('Investment Allocation'),
    body(
      'Programme investment is allocated across four principal categories: workforce development and certification ' +
      'programmes; technology platform licensing and infrastructure; digital transformation workstreams ' +
      '(DFD, Quote to Cart, ICOE); and modernisation engineering for mainframe and core systems. IBM\'s ' +
      'accountability model ties delivery milestones directly to payment schedules, aligning incentives with ' +
      'Horizon\'s transformation outcomes.'
    ),
    pageBreak(),
  ];
}

// ─── Page 10: Strategic Roadmap & Recommendations ────────────────────────────

function roadmapAndRecommendations() {
  return [
    h1('Strategic Roadmap & Executive Recommendations'),
    body(
      'The IBM × Horizon transformation programme is progressing on a well-structured trajectory. The ' +
      'investments made to date in workforce capability, platform modernisation, and digital channel ' +
      'transformation are beginning to compound — creating a sustainable advantage in operational efficiency, ' +
      'member experience, and cost management.'
    ),
    h2('18-Month Roadmap Priorities'),
    simpleTable(
      ['Initiative', 'Priority', 'Target Completion', 'Expected Outcome'],
      [
        ['Digital Front Door Phase 3 (Quote to Cart)', 'Critical', 'Q3 2026', 'Digital plan purchase at scale'],
        ['AI/ML Workforce Specialist Tier', 'High', 'Q4 2026', '100+ AI specialists on programme'],
        ['Mainframe Eligibility API-Wrap', 'High', 'Q1 2027', 'Decoupled eligibility processing'],
        ['ICOE DevSecOps Full Deployment', 'High', 'Q3 2026', 'Zero-touch release pipelines'],
        ['AIOps Autonomous Remediation (P3/P4)', 'Medium', 'Q4 2026', 'Self-healing ops for common incidents'],
        ['Claims Adjudication Parallel Run', 'High', 'Q2 2027', 'Mainframe retirement readiness'],
        ['DFD AI Personalisation (Phase 4)', 'Medium', 'Q3 2026 (Design)', 'Personalised member CX at scale'],
        ['AI Leader Certification Cohort', 'Medium', 'Q4 2026', 'Strategic AI governance capacity'],
      ],
      [2800, 1200, 2000, 3072]
    ),
    ...spacer(1),
    h2('Executive Recommendations'),
    bullet('Accelerate Digital Front Door funding: Quote to Cart has the highest near-term revenue impact and member satisfaction return — velocity here should be protected.'),
    bullet('Protect workforce certification investment: The 382-person certified workforce is a strategic differentiator. Sustaining the certification programme through 2027 is essential to autonomous operations readiness.'),
    bullet('Establish a joint AI Governance Council: As AI-augmented workflows scale, Horizon and IBM should jointly govern model performance, bias risk, and regulatory alignment.'),
    bullet('Prioritise Mainframe risk mitigation: Claims adjudication modernisation carries the highest technical and financial risk. A phased parallel-run approach with defined rollback gates is strongly recommended.'),
    bullet('Invest in member digital adoption: Technology capability will only deliver value if members engage with digital channels. A dedicated member activation programme should accompany Phase 3 DFD deployment.'),
    ...spacer(2),
    divider(),
    new Paragraph({
      children: [new TextRun({
        text: 'This document has been prepared exclusively for Horizon BCBS executive leadership. All data represents programme performance as of April 2026. Confidential — Do Not Distribute.',
        font: 'Calibri', size: 18, color: MID, italics: true,
      })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
    }),
  ];
}

// ─── Assemble Document ───────────────────────────────────────────────────────

const doc = new Document({
  title: 'IBM × Horizon BCBS Transformation Programme — Executive Briefing',
  description: 'Comprehensive executive briefing on IBM\'s transformation programme at Horizon Blue Cross Blue Shield of New Jersey.',
  creator: 'IBM Consulting — Healthcare & Payer Delivery',
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 22, color: SLATE },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'IBM × HORIZON BCBS  |  TRANSFORMATION PROGRAMME  |  CONFIDENTIAL', font: 'Calibri', size: 16, color: MID }),
              ],
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D0D0D0', space: 4 } },
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
                new TextRun({ text: '© 2026 IBM Corporation. Confidential and Proprietary.  |  April 2026', font: 'Calibri', size: 16, color: MID }),
              ],
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'D0D0D0', space: 4 } },
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      children: [
        ...coverPage(),
        ...executiveSummary(),
        ...transformationVision(),
        ...workforceCapability(),
        ...enrollmentIntelligence(),
        ...digitalFrontDoor(),
        ...platformModernisation(),
        ...aIOpsValue(),
        ...financialSLA(),
        ...roadmapAndRecommendations(),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync('IBM_Horizon_Transformation_Executive_Briefing_April2026.docx', buffer);
console.log('Document written successfully.');
