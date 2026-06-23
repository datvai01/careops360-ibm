import { Router, type IRouter } from "express";
import { db, roadmapInitiativesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

function computeDaysOverdue(endDate: string): number | null {
  const today = new Date().toISOString().split("T")[0];
  if (endDate >= today) return null;
  return Math.floor((new Date(today).getTime() - new Date(endDate).getTime()) / 86400000);
}

function computeDaysUntilEnd(endDate: string): number | null {
  const today = new Date().toISOString().split("T")[0];
  if (endDate < today) return null;
  return Math.floor((new Date(endDate).getTime() - new Date(today).getTime()) / 86400000);
}

function enrichRow(r: typeof roadmapInitiativesTable.$inferSelect) {
  const overdue = (r.status === "Active" || r.status === "At Risk") ? computeDaysOverdue(r.endDate) : null;
  const daysUntilEnd = r.status === "Active" || r.status === "Planned" ? computeDaysUntilEnd(r.endDate) : null;
  return { ...r, daysOverdue: overdue, daysUntilEnd };
}

async function generateJiraId(): Promise<string> {
  const result = await db.execute(
    sql`SELECT jira_id FROM roadmap_initiatives WHERE jira_id ~ '^HLGN-[0-9]+$' ORDER BY CAST(SUBSTRING(jira_id FROM 6) AS INTEGER) DESC LIMIT 1`
  );
  const rows = result.rows as { jira_id: string }[];
  if (rows.length === 0) return "HLGN-1001";
  const last = parseInt(rows[0].jira_id.replace("HLGN-", ""), 10);
  return `HLGN-${last + 1}`;
}

router.get("/roadmap/initiatives", async (req, res): Promise<void> => {
  const { portfolio, initiativeType, status, priority, serviceCategory } = req.query as Record<string, string | undefined>;
  let rows = await db.select().from(roadmapInitiativesTable).orderBy(roadmapInitiativesTable.id);

  if (portfolio) rows = rows.filter(r => r.portfolio === portfolio);
  if (initiativeType) rows = rows.filter(r => r.initiativeType === initiativeType);
  if (status) rows = rows.filter(r => r.status === status);
  if (priority) rows = rows.filter(r => r.priority === priority);
  if (serviceCategory) rows = rows.filter(r => r.serviceCategory === serviceCategory);

  res.json(rows.map(enrichRow));
});

router.get("/roadmap/summary", async (_req, res): Promise<void> => {
  const rows = await db.select().from(roadmapInitiativesTable);
  const today = new Date().toISOString().split("T")[0];

  const overdueCount = rows.filter(r =>
    (r.status === "Active" || r.status === "At Risk") && r.endDate < today
  ).length;

  const endingSoonCount = rows.filter(r =>
    r.status === "Active" &&
    r.endDate >= today &&
    Math.floor((new Date(r.endDate).getTime() - new Date(today).getTime()) / 86400000) <= 30
  ).length;

  const startOverdueCount = rows.filter(r =>
    r.status === "Planned" && r.startDate < today
  ).length;

  res.json({
    total: rows.length,
    active: rows.filter(r => r.status === "Active").length,
    planned: rows.filter(r => r.status === "Planned").length,
    completed: rows.filter(r => r.status === "Completed").length,
    atRisk: rows.filter(r => r.status === "At Risk").length,
    highPriority: rows.filter(r => r.priority === "High").length,
    overdueCount,
    endingSoonCount,
    startOverdueCount,
  });
});

router.get("/roadmap/alerts", async (_req, res): Promise<void> => {
  const rows = await db.select().from(roadmapInitiativesTable);
  const today = new Date().toISOString().split("T")[0];
  const alerts: object[] = [];

  for (const r of rows) {
    const daysOverdue = computeDaysOverdue(r.endDate);
    const daysUntilEnd = computeDaysUntilEnd(r.endDate);

    if ((r.status === "Active" || r.status === "At Risk") && daysOverdue !== null && daysOverdue > 0) {
      alerts.push({
        id: r.id,
        severity: daysOverdue > 14 ? "critical" : "high",
        alertType: "overdue",
        title: `${r.jiraId} — Overdue by ${daysOverdue} day${daysOverdue !== 1 ? "s" : ""}`,
        message: `${r.application} (${r.portfolio}) passed its target end date of ${r.endDate}.`,
        jiraId: r.jiraId,
        portfolio: r.portfolio,
        daysOverdue,
      });
    } else if (r.status === "At Risk") {
      alerts.push({
        id: r.id,
        severity: "high",
        alertType: "atRisk",
        title: `${r.jiraId} — At Risk`,
        message: `${r.application} (${r.portfolio}) has been flagged at risk. Review notes for details.`,
        jiraId: r.jiraId,
        portfolio: r.portfolio,
        daysOverdue: null,
      });
    }

    if (r.status === "Active" && daysUntilEnd !== null && daysUntilEnd <= 30 && daysUntilEnd > 0) {
      alerts.push({
        id: r.id * 1000,
        severity: "medium",
        alertType: "endingSoon",
        title: `${r.jiraId} — Ending in ${daysUntilEnd} day${daysUntilEnd !== 1 ? "s" : ""}`,
        message: `${r.application} (${r.portfolio}) is scheduled to complete by ${r.endDate}.`,
        jiraId: r.jiraId,
        portfolio: r.portfolio,
        daysOverdue: null,
      });
    }

    if (r.status === "Planned" && r.startDate < today) {
      const daysLate = Math.floor((new Date(today).getTime() - new Date(r.startDate).getTime()) / 86400000);
      alerts.push({
        id: r.id * 10000,
        severity: "medium",
        alertType: "startOverdue",
        title: `${r.jiraId} — Start Overdue by ${daysLate} day${daysLate !== 1 ? "s" : ""}`,
        message: `${r.application} (${r.portfolio}) was planned to start on ${r.startDate} but remains in Planned status.`,
        jiraId: r.jiraId,
        portfolio: r.portfolio,
        daysOverdue: daysLate,
      });
    }
  }

  res.json(alerts);
});

router.post("/roadmap/initiatives", async (req, res): Promise<void> => {
  const body = req.body as {
    portfolio?: string;
    product?: string;
    application?: string;
    initiativeType?: string;
    description?: string;
    expectedOutcome?: string;
    technology?: string;
    currentVersion?: string;
    upgradeVersion?: string;
    serviceCategory?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    priority?: string;
    notes?: string;
    domain?: string;
    planYear?: number;
    planQuarter?: string;
    complexity?: string;
    businessImpact?: string;
    dependency?: string;
    tShirtSize?: string;
    tShirtRationale?: string;
    roiPlan?: string;
  };

  const required = ["portfolio", "product", "application", "initiativeType", "description",
    "expectedOutcome", "technology", "serviceCategory", "startDate", "endDate", "status", "priority"] as const;

  for (const field of required) {
    if (!body[field]) {
      res.status(400).json({ error: `Missing required field: ${field}` });
      return;
    }
  }

  const jiraId = await generateJiraId();

  const inserted = await db
    .insert(roadmapInitiativesTable)
    .values({
      portfolio: body.portfolio!,
      product: body.product!,
      application: body.application!,
      initiativeType: body.initiativeType!,
      description: body.description!,
      expectedOutcome: body.expectedOutcome!,
      technology: body.technology!,
      currentVersion: body.currentVersion ?? "",
      upgradeVersion: body.upgradeVersion ?? "",
      jiraId,
      serviceCategory: body.serviceCategory!,
      startDate: body.startDate!,
      endDate: body.endDate!,
      status: body.status!,
      priority: body.priority!,
      notes: body.notes ?? "",
      domain: body.domain ?? "",
      planYear: body.planYear ?? 1,
      planQuarter: body.planQuarter ?? "Q1",
      complexity: body.complexity ?? "Med",
      businessImpact: body.businessImpact ?? "",
      dependency: body.dependency ?? "",
      tShirtSize: body.tShirtSize ?? "",
      tShirtRationale: body.tShirtRationale ?? "",
      roiPlan: body.roiPlan ?? "",
    })
    .returning();

  res.status(201).json(enrichRow(inserted[0]));
});

router.put("/roadmap/initiatives/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const body = req.body as {
    portfolio?: string;
    product?: string;
    application?: string;
    initiativeType?: string;
    description?: string;
    expectedOutcome?: string;
    technology?: string;
    currentVersion?: string;
    upgradeVersion?: string;
    serviceCategory?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    priority?: string;
    notes?: string;
    domain?: string;
    planYear?: number;
    planQuarter?: string;
    complexity?: string;
    businessImpact?: string;
    dependency?: string;
    tShirtSize?: string;
    tShirtRationale?: string;
    roiPlan?: string;
  };

  const updateFields: Partial<typeof roadmapInitiativesTable.$inferInsert> = {};
  if (body.portfolio !== undefined) updateFields.portfolio = body.portfolio;
  if (body.product !== undefined) updateFields.product = body.product;
  if (body.application !== undefined) updateFields.application = body.application;
  if (body.initiativeType !== undefined) updateFields.initiativeType = body.initiativeType;
  if (body.description !== undefined) updateFields.description = body.description;
  if (body.expectedOutcome !== undefined) updateFields.expectedOutcome = body.expectedOutcome;
  if (body.technology !== undefined) updateFields.technology = body.technology;
  if (body.currentVersion !== undefined) updateFields.currentVersion = body.currentVersion;
  if (body.upgradeVersion !== undefined) updateFields.upgradeVersion = body.upgradeVersion;
  if (body.serviceCategory !== undefined) updateFields.serviceCategory = body.serviceCategory;
  if (body.startDate !== undefined) updateFields.startDate = body.startDate;
  if (body.endDate !== undefined) updateFields.endDate = body.endDate;
  if (body.status !== undefined) updateFields.status = body.status;
  if (body.priority !== undefined) updateFields.priority = body.priority;
  if (body.notes !== undefined) updateFields.notes = body.notes;
  if (body.domain !== undefined) updateFields.domain = body.domain;
  if (body.planYear !== undefined) updateFields.planYear = body.planYear;
  if (body.planQuarter !== undefined) updateFields.planQuarter = body.planQuarter;
  if (body.complexity !== undefined) updateFields.complexity = body.complexity;
  if (body.businessImpact !== undefined) updateFields.businessImpact = body.businessImpact;
  if (body.dependency !== undefined) updateFields.dependency = body.dependency;
  if (body.tShirtSize !== undefined) updateFields.tShirtSize = body.tShirtSize;
  if (body.tShirtRationale !== undefined) updateFields.tShirtRationale = body.tShirtRationale;
  if (body.roiPlan !== undefined) updateFields.roiPlan = body.roiPlan;

  if (Object.keys(updateFields).length === 0) {
    res.status(400).json({ error: "No fields provided to update" });
    return;
  }

  const updated = await db
    .update(roadmapInitiativesTable)
    .set(updateFields)
    .where(eq(roadmapInitiativesTable.id, id))
    .returning();

  if (updated.length === 0) {
    res.status(404).json({ error: "Initiative not found" });
    return;
  }

  res.json(enrichRow(updated[0]));
});

router.patch("/roadmap/initiatives/:id/status", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { status } = req.body as { status?: string };

  if (!status || !["Active", "Planned", "Completed", "At Risk"].includes(status)) {
    res.status(400).json({ error: "Invalid status. Use: Active, Planned, Completed, At Risk" });
    return;
  }

  const updated = await db
    .update(roadmapInitiativesTable)
    .set({ status })
    .where(eq(roadmapInitiativesTable.id, id))
    .returning();

  if (updated.length === 0) {
    res.status(404).json({ error: "Initiative not found" });
    return;
  }

  res.json(enrichRow(updated[0]));
});

// ─── Governance data (in-memory) ─────────────────────────────────────────────

const TIMELINE_DELIVERABLES = [
  { id: 1,  name: "CareOps360 Command Center — Phase 1 Go-Live",                phase: "Foundation", workstream: "Platform Modernization",  owner: "IBM",     ownerTeam: "IBM Platform Delivery",   dueDate: "2026-03-31", status: "Complete",    description: "Executive dashboard with real-time KPIs, claims, PA, and member ops views live for Horizon leadership." },
  { id: 2,  name: "AIOps Event Correlation Engine Deployed",                    phase: "Foundation", workstream: "AIOps & Observability",   owner: "IBM",     ownerTeam: "IBM AIOps Squad",          dueDate: "2026-04-30", status: "Complete",    description: "Unified telemetry pipeline with alert correlation reducing noise by 40%+." },
  { id: 3,  name: "POD Operating Model — Foundation Pods Stood Up",             phase: "Foundation", workstream: "Delivery Transformation", owner: "Joint",   ownerTeam: "IBM + Horizon Delivery",   dueDate: "2026-06-30", status: "Complete",    description: "4 pilot domain pods fully staffed, role assignments finalised, ways-of-working agreed." },
  { id: 4,  name: "Legacy Angular 12 → 17 Migration Wave 1 (30 apps)",          phase: "Foundation", workstream: "Technical Remediation",   owner: "IBM",     ownerTeam: "IBM Platform Engineering", dueDate: "2026-08-31", status: "On Track",   description: "First wave of 30 applications migrated to Angular 17; regression test packs validated." },
  { id: 5,  name: "Skills Bootcamp — Cloud & AI Cohort 1 Complete",             phase: "Foundation", workstream: "Capability Uplift",       owner: "IBM",     ownerTeam: "IBM Learning Services",    dueDate: "2026-09-30", status: "On Track",   description: "First cohort of 40 Horizon engineers complete IBM cloud-native and AI foundations certification." },
  { id: 6,  name: "Provider Credentialing Automation Live",                     phase: "Foundation", workstream: "Provider Operations",     owner: "Joint",   ownerTeam: "IBM + Provider Ops",       dueDate: "2026-09-30", status: "At Risk",    description: "Automated credentialing workflow reducing audit cycle from 30 → 10 days. Blocked on legacy data migration sign-off." },
  { id: 7,  name: "API-First Integration Hub — Phase 1",                        phase: "Scale",      workstream: "Platform Modernization",  owner: "IBM",     ownerTeam: "IBM Integration Lab",      dueDate: "2026-12-31", status: "On Track",   description: "Real-time partner exchange API hub deployed across 15 key integration points." },
  { id: 8,  name: "Prior Auth AI Engine — 70% Auto-Approval Target",            phase: "Scale",      workstream: "Clinical Automation",     owner: "IBM",     ownerTeam: "IBM AI & Automation",      dueDate: "2027-03-31", status: "Not Started", description: "ML-driven prior auth decision engine targeting 70% straight-through processing rate." },
  { id: 9,  name: "POD Model — Full Scale (All Domains)",                       phase: "Scale",      workstream: "Delivery Transformation", owner: "Joint",   ownerTeam: "IBM + Horizon Delivery",   dueDate: "2027-03-31", status: "Not Started", description: "All 8 domains operating in full POD model with self-service sprint cadences." },
  { id: 10, name: "Power BI Analytics Consolidation",                           phase: "Scale",      workstream: "Data & Analytics",        owner: "IBM",     ownerTeam: "IBM Data Engineering",     dueDate: "2027-06-30", status: "Not Started", description: "Single Power BI platform replacing 6 separate reporting tools; 200+ dashboards migrated." },
  { id: 11, name: "GenAI Member Engagement Platform — Beta",                    phase: "Scale",      workstream: "Digital Innovation",      owner: "IBM",     ownerTeam: "IBM watsonx Labs",         dueDate: "2027-09-30", status: "Not Started", description: "AI-powered member portal with natural language benefits navigation and claims inquiry." },
  { id: 12, name: "Skills Bootcamp — All Cohorts Complete (200+ resources)",    phase: "Scale",      workstream: "Capability Uplift",       owner: "IBM",     ownerTeam: "IBM Learning Services",    dueDate: "2027-09-30", status: "Not Started", description: "Full Horizon engineering population certified across IBM cloud-native, AI, and agile disciplines." },
  { id: 13, name: "Legacy Elimination — EOL Systems Decommissioned",            phase: "Scale",      workstream: "Technical Remediation",   owner: "Joint",   ownerTeam: "IBM + Horizon IT",         dueDate: "2027-12-31", status: "Not Started", description: "All end-of-life systems identified in the Year-1 inventory formally decommissioned." },
  { id: 14, name: "AI-Driven Prior Auth — 85% Auto-Approval",                   phase: "Operate",    workstream: "Clinical Automation",     owner: "IBM",     ownerTeam: "IBM AI & Automation",      dueDate: "2028-03-31", status: "Not Started", description: "Full production deployment achieving 85% straight-through rate, reducing clinical reviewer load by 60%." },
  { id: 15, name: "GenAI Member Engagement — Full Production (NPS +12)",        phase: "Operate",    workstream: "Digital Innovation",      owner: "IBM",     ownerTeam: "IBM watsonx Labs",         dueDate: "2028-06-30", status: "Not Started", description: "Full member-facing AI platform live; NPS improvement of +12 tracked over 3 months post-launch." },
  { id: 16, name: "Self-Healing Operations — AI-Driven Ticket Prevention",      phase: "Operate",    workstream: "AIOps & Observability",   owner: "IBM",     ownerTeam: "IBM AIOps Squad",          dueDate: "2028-09-30", status: "Not Started", description: "Predictive remediation engine achieving near-zero reactive ticket volume across all critical systems." },
  { id: 17, name: "Full Technology Stack Modernization Complete",               phase: "Operate",    workstream: "Technical Remediation",   owner: "Joint",   ownerTeam: "IBM + Horizon IT",         dueDate: "2028-12-31", status: "Not Started", description: "100% supported, maintained technology estate. Zero unsupported runtime dependencies." },
  { id: 18, name: "Horizon Digital Operating Model — Steady State",            phase: "Operate",    workstream: "Delivery Transformation", owner: "Horizon", ownerTeam: "Horizon IT Leadership",    dueDate: "2028-12-31", status: "Not Started", description: "Horizon operating fully in product-aligned POD model with IBM in advisory/augment role." },
];

const HORIZON_REQUIREMENTS = [
  { id: 1,  name: "Production DB Read Access — Claims & PA Systems",       category: "Data Access",    description: "IBM AIOps and analytics teams require read-only access to claims processing and prior auth databases to build correlation models and dashboards.",                                                           dueDate: "2026-04-15", status: "Met",         ibmWorkstream: "AIOps & Observability",   owner: "Horizon IT Security",          priority: "High" },
  { id: 2,  name: "Appointment of IBM Engagement Sponsor (VP-level)",     category: "Decision",       description: "A named VP-level sponsor is required from Horizon to act as decision authority for cross-domain trade-offs, budget variances, and escalation path.",                                                       dueDate: "2026-04-01", status: "Met",         ibmWorkstream: "Program Governance",       owner: "Horizon Executive Team",       priority: "High" },
  { id: 3,  name: "Network Firewall Rule Approvals — IBM Tool Endpoints", category: "Approval",       description: "Firewall rules required to allow IBM observability tooling (Instana, Turbonomic) to reach Horizon on-premise infrastructure without proxying through DMZ.",                                               dueDate: "2026-05-01", status: "Met",         ibmWorkstream: "AIOps & Observability",   owner: "Horizon Network Security",     priority: "High" },
  { id: 4,  name: "Legacy Application Inventory Sign-Off",                category: "Decision",       description: "Horizon technical leads must formally ratify the 136-application inventory and decommission priority list before Year-1 remediation waves can be sequenced.",                                             dueDate: "2026-05-30", status: "In Progress", ibmWorkstream: "Technical Remediation",   owner: "Horizon App Portfolio Team",   priority: "High" },
  { id: 5,  name: "Dedicated Horizon POD Co-Leads (8 domains)",           category: "Resource",       description: "Each of the 8 domain pods requires a named Horizon co-lead who holds backlog authority, attends sprint ceremonies, and escalates blockers within 24 hours.",                                             dueDate: "2026-06-01", status: "In Progress", ibmWorkstream: "Delivery Transformation", owner: "Horizon IT Leadership",        priority: "High" },
  { id: 6,  name: "Member Data Anonymization for AI Training",            category: "Approval",       description: "Legal and compliance sign-off required before IBM can use anonymized member interaction data to train the GenAI member engagement models.",                                                               dueDate: "2026-06-30", status: "In Progress", ibmWorkstream: "Digital Innovation",      owner: "Horizon Legal & Compliance",   priority: "High" },
  { id: 7,  name: "On-Prem Server Refresh — 12 EOL Hosts",               category: "Infrastructure", description: "12 end-of-life hosts running EOL OS versions need hardware refresh before IBM can deploy containerized workloads. Procurement lead time is approximately 10 weeks.",                                     dueDate: "2026-07-31", status: "In Progress", ibmWorkstream: "Platform Modernization",  owner: "Horizon Infrastructure",       priority: "Med" },
  { id: 8,  name: "Prior Auth Clinical Rules Access",                     category: "Data Access",    description: "IBM clinical automation team requires read/write access to the PA rules engine configuration layer to prototype the AI decision model alongside the existing workflow.",                                   dueDate: "2026-07-31", status: "Open",        ibmWorkstream: "Clinical Automation",     owner: "Horizon Clinical Informatics", priority: "High" },
  { id: 9,  name: "Change Approval Board (CAB) Expedited Lane",          category: "Decision",       description: "IBM requests a dedicated expedited CAB lane for platform changes tied to transformation milestones, with a 48-hour SLA vs the standard 5-day queue.",                                                    dueDate: "2026-06-15", status: "Met",         ibmWorkstream: "Program Governance",       owner: "Horizon IT Operations",        priority: "Med" },
  { id: 10, name: "Bootcamp Participant Nominations — Cohort 1 (40 FTE)", category: "Resource",       description: "Horizon must nominate 40 engineers for the first IBM certification bootcamp cohort by the enrollment deadline. Requires manager approval and backfill coverage.",                                       dueDate: "2026-07-01", status: "Met",         ibmWorkstream: "Capability Uplift",       owner: "Horizon HR & Workforce",       priority: "Med" },
  { id: 11, name: "Integration Hub — Source System API Credentials",      category: "Data Access",    description: "IBM integration engineers need system-level API keys and OAuth credentials for the 15 source systems included in Phase 1 of the API-First Integration Hub.",                                             dueDate: "2026-10-01", status: "Open",        ibmWorkstream: "Platform Modernization",  owner: "Horizon Integration Team",     priority: "High" },
  { id: 12, name: "Cloud Hosting Budget Approval (AWS/Azure Year 2)",     category: "Approval",       description: "Year-2 cloud hosting budget for migrated workloads requires Capital Committee approval. IBM financial model requires a decision by Q4 2026 to sequence infrastructure provisioning.",                   dueDate: "2026-10-31", status: "Open",        ibmWorkstream: "Technical Remediation",   owner: "Horizon Finance & IT",         priority: "High" },
  { id: 13, name: "Decommission Sign-Off — Wave 1 Legacy Apps (15)",     category: "Decision",       description: "Horizon business owners must formally sign off decommission of 15 applications after Wave-1 migration is validated in production, releasing license and hosting cost.",                                  dueDate: "2026-12-31", status: "Open",        ibmWorkstream: "Technical Remediation",   owner: "Horizon Business Owners",      priority: "Med" },
  { id: 14, name: "Bootcamp Participant Nominations — Cohort 2 (80 FTE)", category: "Resource",       description: "Second cohort bootcamp nominations required; doubles cohort size to cover remaining Scale-phase engineering population.",                                                                                 dueDate: "2027-01-15", status: "Open",        ibmWorkstream: "Capability Uplift",       owner: "Horizon HR & Workforce",       priority: "Med" },
  { id: 15, name: "Member PII Governance Framework Sign-Off",             category: "Approval",       description: "Full data governance framework for member PII usage in AI/ML models must be agreed with Horizon Legal, CISO, and Compliance before the GenAI member platform enters production.",                       dueDate: "2027-03-31", status: "Open",        ibmWorkstream: "Digital Innovation",      owner: "Horizon Legal, Privacy & CISO", priority: "High" },
  { id: 16, name: "Provider Directory Data Feed — Real-Time Access",     category: "Data Access",    description: "IBM provider operations team requires a real-time FHIR-compliant data feed from the Horizon provider directory to power the automated credentialing and audit workflow.",                                dueDate: "2026-09-30", status: "Overdue",     ibmWorkstream: "Provider Operations",     owner: "Horizon Provider Relations",   priority: "High" },
  { id: 17, name: "Executive Steering Committee Cadence Agreement",      category: "Decision",       description: "Monthly ESC meetings with Horizon C-suite and IBM delivery leadership must be formalized with a standing agenda, KPI pack, and escalation protocol.",                                                    dueDate: "2026-04-01", status: "Met",         ibmWorkstream: "Program Governance",       owner: "Horizon Executive Team",       priority: "High" },
  { id: 18, name: "Dedicated Test Environment Allocation",               category: "Infrastructure", description: "IBM QA requires a dedicated pre-production environment with production-equivalent data (anonymized) for regression testing migration waves without impacting live systems.",                              dueDate: "2026-05-31", status: "Met",         ibmWorkstream: "Technical Remediation",   owner: "Horizon IT Operations",        priority: "Med" },
];

const TRANSFORMATION_RISKS = [
  { id: 1,  title: "Legacy Inventory Sign-Off Delay",                     category: "Program",    likelihood: "High", impact: "High", rating: "High", owner: "Horizon App Portfolio Team",    mitigationAction: "Escalate to ESC; IBM to provide pre-populated inventory spreadsheet with draft decommission priorities for Horizon review.",                          status: "Mitigating", raisedDate: "2026-04-10", notes: "Decision needed by end of May to protect Wave-1 sequencing." },
  { id: 2,  title: "POD Co-Lead Vacancies (3 of 8 domains unfilled)",     category: "Resource",   likelihood: "High", impact: "High", rating: "High", owner: "Horizon IT Leadership",         mitigationAction: "Horizon HR to accelerate internal nominations; IBM to provide interim domain anchors while permanent co-leads are confirmed.",                        status: "Mitigating", raisedDate: "2026-05-01", notes: "Payer and Clinical domains are highest risk." },
  { id: 3,  title: "Provider Data Feed Not Delivered (Overdue)",          category: "Technical",  likelihood: "High", impact: "High", rating: "High", owner: "Horizon Provider Relations",    mitigationAction: "Raise to CISO and IT as P1; IBM team standing by. 2-week window before credentialing automation milestone slips.",                                   status: "Open",       raisedDate: "2026-06-01", notes: "Unblocking this is on the critical path for Q3 deliverable." },
  { id: 4,  title: "Member Data Anonymization Approval Stall",            category: "Compliance", likelihood: "Med",  impact: "High", rating: "High", owner: "Horizon Legal & Compliance",    mitigationAction: "IBM Legal to share precedent framework from two comparable payer clients; Horizon Legal team to fast-track review with shared template.",              status: "Mitigating", raisedDate: "2026-05-15", notes: "GenAI programme cannot progress to Scale phase without this." },
  { id: 5,  title: "Cloud Budget Approval Not Secured by Q4 2026",        category: "Program",    likelihood: "Med",  impact: "High", rating: "High", owner: "Horizon Finance & IT",          mitigationAction: "IBM to present detailed TCO model and 3-year cost avoidance case at September Capital Committee. Horizon CIO to sponsor the submission.",             status: "Open",       raisedDate: "2026-05-20", notes: "Without approval, Year-2 cloud migration waves cannot be sequenced." },
  { id: 6,  title: "Angular Migration Regression Failures (Wave 1)",      category: "Technical",  likelihood: "Med",  impact: "Med",  rating: "Med",  owner: "IBM Platform Engineering",      mitigationAction: "Expand automated regression suite to 95% code coverage before Wave-1 cutover; add 2-week buffer sprint for remediation.",                             status: "Mitigating", raisedDate: "2026-06-10", notes: "3 of 30 apps showing intermittent failures in non-prod." },
  { id: 7,  title: "Key IBM Delivery Lead Attrition Risk",                category: "Resource",   likelihood: "Med",  impact: "Med",  rating: "Med",  owner: "IBM Delivery Management",       mitigationAction: "Bench resourcing plans in place; IBM to maintain 2-deep bench for all critical lead roles; knowledge transfer documents maintained weekly.",           status: "Mitigating", raisedDate: "2026-04-20", notes: "Two senior architects identified as flight risks." },
  { id: 8,  title: "Integration Hub Credential Delays",                   category: "Technical",  likelihood: "Med",  impact: "Med",  rating: "Med",  owner: "Horizon Integration Team",      mitigationAction: "IBM to provide credential request template and 10-day SLA target; escalate to integration lead if 5 or more source systems unresolved by September.",  status: "Open",       raisedDate: "2026-06-15", notes: "15 credentials needed; only 4 confirmed." },
  { id: 9,  title: "Bootcamp Backfill Coverage Gap (Cohort 1)",           category: "Resource",   likelihood: "Med",  impact: "Low",  rating: "Low",  owner: "Horizon HR & Workforce",        mitigationAction: "Managers to identify backfill options before nominations finalised; IBM to offer flexible evening/hybrid delivery to reduce operational impact.",       status: "Mitigating", raisedDate: "2026-06-01", notes: "8 of 40 nominations pending manager approval." },
  { id: 10, title: "AIOps Tooling Latency in On-Prem Environment",        category: "Technical",  likelihood: "Low",  impact: "Med",  rating: "Low",  owner: "IBM AIOps Squad",               mitigationAction: "Conduct performance baseline assessment; right-size agent polling intervals and evaluate edge-caching for high-volume metrics.",                        status: "Mitigating", raisedDate: "2026-05-25", notes: "Latency spikes observed during peak batch window (2–4 AM)." },
  { id: 11, title: "PA Auto-Approval Model Regulatory Risk",              category: "Compliance", likelihood: "Low",  impact: "High", rating: "Med",  owner: "Horizon Clinical Informatics",  mitigationAction: "Engage Horizon compliance and URAC advisory panel early; IBM to document explainability artefacts for every decision node in the PA model.",          status: "Open",       raisedDate: "2026-06-20", notes: "CMS and state DOI filing may be required before live deployment." },
  { id: 12, title: "Third-Party Vendor SLA Dependency (Smartcomm)",       category: "Vendor",     likelihood: "Low",  impact: "Med",  rating: "Low",  owner: "IBM Delivery Management",       mitigationAction: "Include Smartcomm SLA obligations in contract review; add 4-week lead time buffer into document migration milestones.",                                status: "Mitigating", raisedDate: "2026-04-30", notes: "Cloud migration timeline depends on Smartcomm SaaS availability window." },
  { id: 13, title: "ESC Attendance and Decision Cadence Drift",           category: "Program",    likelihood: "Low",  impact: "Med",  rating: "Low",  owner: "Horizon Executive Team",        mitigationAction: "Formalise ESC charter with attendance commitment; IBM to publish KPI pack 3 business days in advance; delegate authority to deputies if sponsor absent.", status: "Closed",     raisedDate: "2026-03-15", notes: "Resolved — ESC charter signed April 2026." },
  { id: 14, title: "Skills Cohort Drop-Out / Completion Rate",            category: "Resource",   likelihood: "Low",  impact: "Low",  rating: "Low",  owner: "IBM Learning Services",         mitigationAction: "Track completion weekly; offer catch-up sessions; IBM Learning to assign cohort buddies for at-risk participants.",                                     status: "Mitigating", raisedDate: "2026-06-15", notes: "Target: 90%+ pass rate across all cohorts." },
  { id: 15, title: "Power BI License Volume Shortage",                    category: "Vendor",     likelihood: "Low",  impact: "Low",  rating: "Low",  owner: "Horizon IT Operations",         mitigationAction: "IBM to validate minimum required license count before procurement; stagger rollout to match actual active users vs. total staff headcount.",            status: "Closed",     raisedDate: "2026-05-10", notes: "License count confirmed adequate for Year-1 deployment." },
];

router.get("/roadmap/timeline-deliverables", (_req, res): void => {
  res.json(TIMELINE_DELIVERABLES);
});

router.get("/roadmap/requirements", (_req, res): void => {
  res.json(HORIZON_REQUIREMENTS);
});

router.get("/roadmap/risks", (_req, res): void => {
  res.json(TRANSFORMATION_RISKS);
});

export default router;
