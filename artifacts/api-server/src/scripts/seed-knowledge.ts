import { db, knowledgeArticlesTable, knowledgeSourcesTable } from "@workspace/db";

type Seed = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  domain: string;
  tags: string;
  sourceType: string;
  author: string;
  viewCount: number;
};

const ARTICLES: Seed[] = [
  {
    slug: "edi-835-remittance-delay-runbook",
    title: "EDI 835 Remittance Delay — Triage Runbook",
    summary: "Step-by-step triage for outbound 835 remittance delays, including queue drain and provider communication thresholds.",
    body: `### When to use\nOutbound EDI 835 files delayed more than 30 minutes or queue depth above 100 files.\n\n### Triage steps\n- Check the EDI Hub queue monitor for the 835 outbound channel; note queue depth and oldest file age.\n- Verify the payment cycle batch (FIN-220) completed — 80% of 835 delays trace to an upstream payment batch overrun.\n- If FIN-220 is complete, restart the 835 translator service; drain rate should exceed 40 files/min.\n- At 60+ minutes of delay, notify Provider Relations — providers begin calling about missing remittances at ~90 minutes.\n\n### Escalation\nPage the IBM AMS integration on-call if drain rate stays below 10 files/min after restart. Reference SLA: 4-hour restoration window for P2.`,
    domain: "IT Ops / AIOps",
    tags: "edi,835,remittance,runbook,integration",
    sourceType: "uploaded",
    author: "Maria Chen (Integration Ops)",
    viewCount: 214,
  },
  {
    slug: "prior-auth-biologics-review-guide",
    title: "Prior Auth: Specialty Biologics Review Guide",
    summary: "Clinical review criteria and turnaround targets for specialty biologic prior authorization requests.",
    body: `### Scope\nSpecialty biologics (Humira, Stelara, Skyrizi families) — highest-cost PA category, 4x average review time.\n\n### Review criteria\n- Step therapy documentation: must show trial of at least one preferred agent unless contraindication is documented.\n- Diagnosis-to-NDC match validated automatically; mismatches route to clinical pharmacist queue.\n- Standard turnaround target: 72 hours; expedited: 24 hours (regulatory).\n\n### Common pitfalls\n- Missing chart notes are the #1 cause of pend-backs (38% of biologic PAs pend at least once).\n- Renewals with stable disease qualify for the fast-path protocol — do not re-run full step-therapy review.\n\n### Who to ask\nDr. Patel's clinical pharmacy team owns the biologics criteria set; updates publish quarterly.`,
    domain: "Prior Auth",
    tags: "prior-auth,biologics,clinical-review,step-therapy",
    sourceType: "uploaded",
    author: "James Okafor (UM Operations)",
    viewCount: 187,
  },
  {
    slug: "claims-auto-adjudication-tuning",
    title: "Claims Auto-Adjudication Rate: Tuning Levers",
    summary: "The five configuration levers that move the auto-adjudication rate and their historical impact at Horizon.",
    body: `### Current state\nAuto-adjudication runs at ~86% for professional claims, ~78% for institutional.\n\n### Levers (ranked by impact)\n1. **Duplicate-logic window** — widening from 27 to 45 days removed 1.2% of false pends (2025 change).\n2. **Provider match confidence threshold** — each 1-point loosening adds ~0.4% auto-adjudication but raises mispay risk; keep at 92 unless Finance signs off.\n3. **COB flag refresh cadence** — stale COB data causes ~9,000 unnecessary pends/month; daily refresh implemented March 2026.\n4. **Modifier 59 edit pack version** — always regression-test against the 5,000-claim golden set before promoting.\n5. **Authorization match tolerance** — date-span tolerance of ±3 days cleared 60% of auth-mismatch pends.\n\n### History\nInstitutional rate dropped 4 points in Jan 2026 after the ICD-11 pilot edit pack; rollback procedure is documented in the release runbook.`,
    domain: "Claims",
    tags: "claims,auto-adjudication,configuration,edits",
    sourceType: "uploaded",
    author: "Sandra Liu (Claims Engineering)",
    viewCount: 243,
  },
  {
    slug: "provider-credentialing-fast-track",
    title: "Provider Credentialing Fast-Track Criteria",
    summary: "Which provider applications qualify for the 10-day fast-track credentialing path and how to route them.",
    body: `### Fast-track qualification\n- Provider joining an existing contracted group (delegated roster add).\n- Clean CAQH profile updated within 90 days, no malpractice flags.\n- Specialty not on the high-scrutiny list (pain management, DME, home health).\n\n### Routing\nFlag the application "FT" in the credentialing queue — the committee reviews fast-track files in the Tuesday consent agenda instead of full committee.\n\n### Why it matters\nNetwork adequacy gaps in Bergen and Essex counties make primary-care adds time-sensitive; fast-track cuts onboarding from 45 to 10 days. About 30% of applications qualify but only ~18% are flagged — training gap identified in Q1 2026 audit.`,
    domain: "Providers",
    tags: "credentialing,provider-network,fast-track,onboarding",
    sourceType: "uploaded",
    author: "Denise Wright (Network Ops)",
    viewCount: 121,
  },
  {
    slug: "834-enrollment-file-validation-failures",
    title: "834 Enrollment File Validation Failures — Playbook",
    summary: "Root causes and fixes for inbound 834 enrollment file failures from CMS and employer groups.",
    body: `### Top root causes (2025-2026)\n1. Schema-version mismatch after CMS companion-guide updates (~40% of failures) — check the effective date in the file header first.\n2. Employer group files with duplicated member IDs across subsidiaries.\n3. Character-encoding issues in name fields from two specific TPA senders.\n\n### Recovery procedure\n- Failed files land in /edi/inbound/errors with a validation report; never hand-edit production files.\n- Re-request from sender for schema issues; use the reprocessing tool with mapping override for encoding fixes.\n- Members affected by a failed daily file must be reconciled before the 5 PM eligibility snapshot, or downstream PBM feeds carry stale eligibility.\n\n### Institutional knowledge\nThe January CMS companion-guide update lands every year the second week of January — pre-validate with the test harness in December.`,
    domain: "Enrollment",
    tags: "834,enrollment,edi,validation,eligibility",
    sourceType: "uploaded",
    author: "Rafael Gomez (Enrollment Systems)",
    viewCount: 165,
  },
  {
    slug: "contact-center-ivr-deflection-design",
    title: "IVR Deflection: What Works at Horizon",
    summary: "Design principles behind the 34% IVR deflection rate and the call types that should never be deflected.",
    body: `### Current performance\nIVR containment at 34%, up from 22% in 2024. Claims-status and ID-card requests drive most deflection.\n\n### Design principles\n- Authenticate early: post-authentication menus deflect 2.5x better because the IVR can personalize.\n- Speak balances and statuses proactively — "Your claim from March 3 was paid on March 18" resolves before menu navigation.\n- Cap menu depth at 2 levels; deflection collapses at level 3.\n\n### Never deflect\n- Grievance and appeals calls (regulatory handling requirements).\n- Members flagged in the vulnerable-populations cohort.\n- Third consecutive call on the same claim — route straight to a Tier 2 agent with screen-pop context.\n\n### Measurement\nTrue deflection = contained AND no repeat call within 7 days. The raw containment number overstates success by ~6 points.`,
    domain: "Contact Center",
    tags: "ivr,deflection,contact-center,member-services",
    sourceType: "uploaded",
    author: "Alicia Ford (Member Services)",
    viewCount: 98,
  },
  {
    slug: "aiops-self-heal-catalog",
    title: "AIOps Self-Heal Catalog: What Auto-Remediates Today",
    summary: "The 24 self-heal scenarios in production, their trigger conditions, and guardrails.",
    body: `### High-volume scenarios\n- **JVM heap recycle** — triggers at 92% heap for 5+ minutes on claims adjudication nodes; ~9 executions/day.\n- **Stuck batch job restart** — no heartbeat for 2x expected runtime; requires idempotency flag on the job definition.\n- **Certificate auto-renewal** — 21 days before expiry; eliminated the #2 cause of 2024 P1s.\n- **Queue drain acceleration** — spins up 2 extra consumers when MQ depth exceeds 10k messages.\n\n### Guardrails\n- Max 3 auto-remediations per service per hour — beyond that, page a human (flapping indicates a deeper fault).\n- Self-heal is disabled during change freeze windows and the first 24h after a major release.\n- Every execution writes to the AIOps evidence log for the monthly value report ($300K prevented-incident value YTD).\n\n### Adding a scenario\nPropose via the AMS automation board; needs 30 days of alert history and a documented manual runbook first.`,
    domain: "IT Ops / AIOps",
    tags: "aiops,self-heal,automation,runbooks",
    sourceType: "uploaded",
    author: "IBM AMS Automation Guild",
    viewCount: 176,
  },
  {
    slug: "quarterly-cost-savings-attribution",
    title: "How Cost Savings Are Attributed in the AMS Value Model",
    summary: "The finance-approved methodology for attributing realized savings vs. cost avoidance in the IBM AMS value dashboard.",
    body: `### Two buckets\n- **Realized savings**: hard-dollar reductions (headcount-equivalent hours, license retirements, ticket-volume reductions priced at $42/ticket blended rate).\n- **Cost avoidance**: incidents prevented or resolved pre-impact, priced with the outage-cost model ($18K/hour for Tier 1 apps, $4K/hour Tier 2).\n\n### Rules Finance insists on\n- Automation savings count only after 60 days of sustained volume reduction (no one-week spikes).\n- Shift-left deflection uses the delta against the trailing-12-month baseline, re-based each January.\n- No double counting: a ticket both automated and deflected counts once, in the automation bucket.\n\n### Why $42/ticket\nBlended L1/L2 fully-loaded rate agreed in the 2025 contract true-up; revisit at the 2027 renewal.`,
    domain: "Finance",
    tags: "cost-savings,attribution,finance,value-model",
    sourceType: "uploaded",
    author: "Finance Value Office",
    viewCount: 154,
  },
  {
    slug: "appeals-grievances-regulatory-clocks",
    title: "Appeals & Grievances: Regulatory Clocks Cheat Sheet",
    summary: "Deadline matrix for member appeals and grievances across lines of business, with the triggers that start each clock.",
    body: `### Deadline matrix\n- **Commercial (NJ DOBI)**: standard appeal 30 days; expedited 72 hours; external review request window 4 months.\n- **Medicare Advantage**: standard pre-service 30 days, payment 60 days; expedited 72 hours — auto-forward to IRE on miss.\n- **Medicaid (NJ FamilyCare)**: resolution 30 days; state fair hearing rights notice required in every resolution letter.\n\n### Clock triggers\nThe clock starts at receipt anywhere in the enterprise — including a fax to a provider office or a comment in the member portal — not when the case is logged in the A&G system. Intake lag is the #1 audit finding risk.\n\n### Practical guidance\nExpedited criteria are member-claimed by default: if a member says urgent, treat as expedited until a clinician documents otherwise.`,
    domain: "Compliance",
    tags: "appeals,grievances,regulatory,deadlines,compliance",
    sourceType: "uploaded",
    author: "Compliance & Regulatory Affairs",
    viewCount: 132,
  },
  {
    slug: "claims-high-dollar-review-thresholds",
    title: "High-Dollar Claim Review Thresholds & Routing",
    summary: "Dollar thresholds that trigger manual review layers and how to avoid unnecessary senior-reviewer escalations.",
    body: `### Thresholds (2026)\n- $25K+: standard high-dollar queue, any certified examiner.\n- $100K+: senior examiner plus itemized bill request for inpatient.\n- $250K+: medical director review; transplant and NICU cases pre-route here regardless of billed amount.\n- $1M+: CFO notification within 48 hours of adjudication (contractual reinsurance requirement).\n\n### Routing tips\n- Dialysis and specialty-pharmacy claims inflate to high-dollar routinely — the carve-out flag routes them to the standard queue when contract rates apply.\n- Reinsurance recovery: claims above $500K must have the reinsurance flag set at adjudication, not retroactively; missed flags cost ~$2M in unclaimed recoveries in 2024.`,
    domain: "Claims",
    tags: "claims,high-dollar,review,reinsurance",
    sourceType: "uploaded",
    author: "Claims Quality Team",
    viewCount: 109,
  },
  {
    slug: "shift-left-knowledge-article-standards",
    title: "Shift-Left: Writing Knowledge Articles L1 Can Actually Use",
    summary: "Standards for authoring support knowledge articles that enable L1 resolution instead of escalation.",
    body: `### The bar\nAn article ships only if an L1 agent with no product context can resolve the ticket using the article alone. Test this literally — hand it to a new hire.\n\n### Structure (mandatory)\n1. Symptom as the user reports it (their words, not system codes).\n2. 3-step verification to confirm the match.\n3. Resolution steps with screenshots; every branch ends in "resolved" or "escalate with this exact data attached".\n\n### Anti-patterns\n- "Contact the app team" is not a resolution step.\n- Articles older than 6 months without review auto-flag stale; 22% of escalations trace to stale articles.\n\n### Impact\nEach 100 tickets shifted from L2 to L1 saves ~$2,800/month; knowledge-article-enabled resolutions hit 1,247 uses today.`,
    domain: "IT Ops / AIOps",
    tags: "shift-left,knowledge-management,support,standards",
    sourceType: "uploaded",
    author: "IBM AMS Knowledge Guild",
    viewCount: 201,
  },
  {
    slug: "enrollment-oep-surge-playbook",
    title: "Open Enrollment Surge Playbook",
    summary: "Capacity, staffing, and system preparations for the November-January open enrollment surge.",
    body: `### Timeline\n- **September**: capacity test at 3x normal 834 volume; last year's peak day processed 412K transactions.\n- **October**: freeze non-critical changes to enrollment systems through January 15.\n- **November-December**: daily eligibility reconciliation (normally weekly); contact center surge staffing +40%.\n\n### Known failure modes\n- ID-card fulfillment vendor backlogs at 250K cards/week — stagger effective-date batches to stay under.\n- The premium-billing first-invoice run in January is the single highest-risk batch of the year; run the rehearsal in December with production-scale data.\n\n### Institutional knowledge\nJanuary 2025's invoice defect (duplicate invoices to 18K members) originated from a rate-table load done during the October freeze via emergency change — hold the freeze line.`,
    domain: "Enrollment",
    tags: "open-enrollment,surge,capacity,playbook",
    sourceType: "uploaded",
    author: "Enrollment Operations",
    viewCount: 88,
  },
];

async function main() {
  console.log("Seeding knowledge articles...");
  for (const a of ARTICLES) {
    await db
      .insert(knowledgeArticlesTable)
      .values(a)
      .onConflictDoUpdate({
        target: knowledgeArticlesTable.slug,
        set: { title: a.title, summary: a.summary, body: a.body, domain: a.domain, tags: a.tags, updatedAt: new Date() },
      });
  }
  const sources = [
    { sourceType: "confluence", displayName: "Confluence" },
    { sourceType: "sharepoint", displayName: "SharePoint Online" },
    { sourceType: "onedrive", displayName: "OneDrive" },
    { sourceType: "gdrive", displayName: "Google Drive" },
  ];
  for (const s of sources) {
    await db.insert(knowledgeSourcesTable).values(s).onConflictDoNothing();
  }
  console.log(`Seeded ${ARTICLES.length} articles and ${sources.length} sources.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
