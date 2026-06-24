import { Router, type IRouter } from "express";
import * as XLSX from "xlsx";
import { db, roadmapInitiativesTable, roadmapRequirementsTable, roadmapRisksTable } from "@workspace/db";
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

const CATEGORY_MAP: Record<string, string> = {
  "Transformation":   "Strategic",
  "Upgrade":          "Technical Remediation",
  "Ticket Reduction": "Tactical",
  "Foundational":     "Foundational",
};

const FOUNDATIONAL_ITEMS = [
  { id: 10001, jiraId: "GOV-001", domain: "Platform Modernization",  application: "CareOps360 Command Center — Phase 1 Go-Live",             description: "Executive dashboard with real-time KPIs, claims, PA, and member ops views live for Horizon leadership.", status: "Completed", startDate: "2026-01-01", endDate: "2026-03-31", priority: "High",   complexity: "High", businessImpact: "Enterprise-wide operational visibility." },
  { id: 10002, jiraId: "GOV-002", domain: "AIOps & Observability",   application: "AIOps Event Correlation Engine Deployed",                 description: "Unified telemetry pipeline with alert correlation reducing noise by 40%+.", status: "Completed", startDate: "2026-01-01", endDate: "2026-04-30", priority: "High",   complexity: "High", businessImpact: "Noise reduction and faster MTTR." },
  { id: 10003, jiraId: "GOV-003", domain: "Delivery Transformation", application: "POD Operating Model — Foundation Pods Stood Up",          description: "4 pilot domain pods fully staffed, role assignments finalised, ways-of-working agreed.", status: "Completed", startDate: "2026-01-01", endDate: "2026-06-30", priority: "High",   complexity: "Med",  businessImpact: "Enables product-aligned delivery." },
  { id: 10004, jiraId: "GOV-004", domain: "Technical Remediation",   application: "Legacy Angular 12 → 17 Migration Wave 1 (30 apps)",       description: "First wave of 30 applications migrated to Angular 17; regression test packs validated.", status: "Active", startDate: "2026-01-01", endDate: "2026-08-31", priority: "High",   complexity: "High", businessImpact: "Reduces security debt across 30 apps." },
  { id: 10005, jiraId: "GOV-005", domain: "Capability Uplift",       application: "Skills Bootcamp — Cloud & AI Cohort 1 Complete",          description: "First cohort of 40 Horizon engineers complete IBM cloud-native and AI foundations certification.", status: "Active", startDate: "2026-01-01", endDate: "2026-09-30", priority: "High",   complexity: "Med",  businessImpact: "40 certified engineers accelerating delivery." },
  { id: 10006, jiraId: "GOV-006", domain: "Provider Operations",     application: "Provider Credentialing Automation Live",                  description: "Automated credentialing workflow reducing audit cycle from 30 → 10 days. Blocked on provider FHIR feed.", status: "At Risk", startDate: "2026-01-01", endDate: "2026-09-30", priority: "High",   complexity: "High", businessImpact: "Credentialing cycle 30→10 days." },
  { id: 10007, jiraId: "GOV-007", domain: "Platform Modernization",  application: "API-First Integration Hub — Phase 1",                     description: "Real-time partner exchange API hub deployed across 15 key integration points.", status: "Active", startDate: "2026-07-01", endDate: "2026-12-31", priority: "High",   complexity: "High", businessImpact: "15 integration points modernised." },
  { id: 10008, jiraId: "GOV-008", domain: "Program Governance",      application: "IBM–Horizon Year 2 Contract Extension Signed",            description: "Multi-year extension covering Year 2–3 AMS scope, AI programme, and IBM watsonx licensing.", status: "Planned", startDate: "2026-07-01", endDate: "2026-10-31", priority: "Critical", complexity: "Low", businessImpact: "Enables Scale-phase mobilisation." },
  { id: 10009, jiraId: "GOV-009", domain: "Clinical Automation",     application: "Prior Auth AI Engine — 70% Auto-Approval Target",         description: "ML-driven prior auth decision engine targeting 70% straight-through processing rate.", status: "Planned", startDate: "2026-07-01", endDate: "2027-03-31", priority: "High",   complexity: "High", businessImpact: "70% straight-through PA rate." },
  { id: 10010, jiraId: "GOV-010", domain: "Delivery Transformation", application: "POD Model — Full Scale (All Domains)",                    description: "All 8 domains operating in full POD model with self-service sprint cadences.", status: "Planned", startDate: "2026-07-01", endDate: "2027-03-31", priority: "High",   complexity: "Med",  businessImpact: "All 8 domains product-aligned." },
  { id: 10011, jiraId: "GOV-011", domain: "Data & Analytics",        application: "Power BI Analytics Consolidation",                        description: "Single Power BI platform replacing 6 separate reporting tools; 200+ dashboards migrated.", status: "Planned", startDate: "2026-07-01", endDate: "2027-06-30", priority: "Med",    complexity: "Med",  businessImpact: "6 reporting tools consolidated." },
  { id: 10012, jiraId: "GOV-012", domain: "Digital Innovation",      application: "GenAI Member Engagement Platform — Beta",                 description: "AI-powered member portal with natural language benefits navigation and claims inquiry.", status: "Planned", startDate: "2026-07-01", endDate: "2027-09-30", priority: "High",   complexity: "High", businessImpact: "Member self-service AI uplift." },
  { id: 10013, jiraId: "GOV-013", domain: "Capability Uplift",       application: "Skills Bootcamp — All Cohorts Complete (200+ resources)", description: "Full Horizon engineering population certified across IBM cloud-native, AI, and agile disciplines.", status: "Planned", startDate: "2026-07-01", endDate: "2027-09-30", priority: "High",   complexity: "Med",  businessImpact: "200+ certified engineers." },
  { id: 10014, jiraId: "GOV-014", domain: "Technical Remediation",   application: "Legacy Elimination — EOL Systems Decommissioned",         description: "All end-of-life systems identified in the Year-1 inventory formally decommissioned.", status: "Planned", startDate: "2026-07-01", endDate: "2027-12-31", priority: "High",   complexity: "High", businessImpact: "Zero unsupported runtime risk." },
  { id: 10015, jiraId: "GOV-015", domain: "Clinical Automation",     application: "AI-Driven Prior Auth — 85% Auto-Approval",                description: "Full production deployment achieving 85% straight-through rate, reducing clinical reviewer load by 60%.", status: "Planned", startDate: "2027-07-01", endDate: "2028-03-31", priority: "High",   complexity: "High", businessImpact: "Clinical reviewer load ‑60%." },
  { id: 10016, jiraId: "GOV-016", domain: "Digital Innovation",      application: "GenAI Member Engagement — Full Production (NPS +12)",     description: "Full member-facing AI platform live; NPS improvement of +12 tracked over 3 months post-launch.", status: "Planned", startDate: "2027-07-01", endDate: "2028-06-30", priority: "High",   complexity: "High", businessImpact: "NPS +12 uplift." },
  { id: 10017, jiraId: "GOV-017", domain: "AIOps & Observability",   application: "Self-Healing Operations — AI-Driven Ticket Prevention",   description: "Predictive remediation engine achieving near-zero reactive ticket volume across all critical systems.", status: "Planned", startDate: "2027-07-01", endDate: "2028-09-30", priority: "High",   complexity: "High", businessImpact: "Near-zero reactive ticket volume." },
  { id: 10018, jiraId: "GOV-018", domain: "Technical Remediation",   application: "Full Technology Stack Modernization Complete",            description: "100% supported, maintained technology estate. Zero unsupported runtime dependencies.", status: "Planned", startDate: "2027-07-01", endDate: "2028-12-31", priority: "High",   complexity: "High", businessImpact: "100% supported tech estate." },
  { id: 10019, jiraId: "GOV-019", domain: "Delivery Transformation", application: "Horizon Digital Operating Model — Steady State",          description: "Horizon operating fully in product-aligned POD model with IBM in advisory and augmentation role.", status: "Planned", startDate: "2027-07-01", endDate: "2028-12-31", priority: "High",   complexity: "Low",  businessImpact: "Self-sustaining digital operating model." },
];

async function buildGovernanceCombined() {
  const rows = await db.select().from(roadmapInitiativesTable).orderBy(roadmapInitiativesTable.initiativeType, roadmapInitiativesTable.domain, roadmapInitiativesTable.application);
  const dbItems = rows.map(r => ({
    id: r.id,
    jiraId: r.jiraId,
    category: CATEGORY_MAP[r.initiativeType] ?? r.initiativeType,
    domain: r.domain || r.product || "General",
    application: r.application,
    description: r.description,
    status: r.status,
    startDate: r.startDate,
    endDate: r.endDate,
    priority: r.priority,
    complexity: r.complexity,
    businessImpact: r.businessImpact,
  }));
  const foundational = FOUNDATIONAL_ITEMS.map(f => ({ ...f, category: "Foundational" }));
  return [...dbItems, ...foundational];
}

router.get("/roadmap/governance-combined", async (_req, res): Promise<void> => {
  const data = await buildGovernanceCombined();
  res.json(data);
});

router.get("/roadmap/governance-export", async (_req, res): Promise<void> => {
  const data = await buildGovernanceCombined();
  const wb = XLSX.utils.book_new();
  const COLS = ["jiraId", "category", "domain", "application", "status", "priority", "complexity", "startDate", "endDate", "description", "businessImpact"];
  const HEADERS = ["ID", "Category", "Domain / Workstream", "Initiative / Application", "Status", "Priority", "Complexity", "Start Date", "End Date", "Description", "Business Impact"];

  const categories: Array<"Strategic" | "Technical Remediation" | "Tactical" | "Foundational" | "All"> = ["All", "Strategic", "Technical Remediation", "Tactical", "Foundational"];
  for (const cat of categories) {
    const subset = cat === "All" ? data : data.filter(d => d.category === cat);
    const rows = [HEADERS, ...subset.map(d => COLS.map(c => (d as Record<string, unknown>)[c] ?? ""))];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [8, 22, 28, 50, 12, 10, 12, 12, 12, 60, 50].map(w => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, cat === "Technical Remediation" ? "Tech Remediation" : cat);
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="Governance_Timeline.xlsx"');
  res.send(buf);
});

router.get("/roadmap/timeline-deliverables", (_req, res): void => {
  res.json([
    { id: 1,  name: "CareOps360 Command Center — Phase 1 Go-Live",             phase: "Foundation", workstream: "Platform Modernization",  owner: "IBM",     ownerTeam: "IBM Platform Delivery",    dueDate: "2026-03-31", status: "Complete",    description: "Executive dashboard with real-time KPIs, claims, PA, and member ops views live for Horizon leadership." },
    { id: 2,  name: "AIOps Event Correlation Engine Deployed",                 phase: "Foundation", workstream: "AIOps & Observability",   owner: "IBM",     ownerTeam: "IBM AIOps Squad",           dueDate: "2026-04-30", status: "Complete",    description: "Unified telemetry pipeline with alert correlation reducing noise by 40%+." },
    { id: 3,  name: "POD Operating Model — Foundation Pods Stood Up",          phase: "Foundation", workstream: "Delivery Transformation", owner: "Joint",   ownerTeam: "IBM + Horizon Delivery",    dueDate: "2026-06-30", status: "Complete",    description: "4 pilot domain pods fully staffed, role assignments finalised, ways-of-working agreed." },
    { id: 4,  name: "Legacy Angular 12 → 17 Migration Wave 1 (30 apps)",       phase: "Foundation", workstream: "Technical Remediation",   owner: "IBM",     ownerTeam: "IBM Platform Engineering",  dueDate: "2026-08-31", status: "On Track",   description: "First wave of 30 applications migrated to Angular 17; regression test packs validated." },
    { id: 5,  name: "Skills Bootcamp — Cloud & AI Cohort 1 Complete",          phase: "Foundation", workstream: "Capability Uplift",       owner: "IBM",     ownerTeam: "IBM Learning Services",     dueDate: "2026-09-30", status: "On Track",   description: "First cohort of 40 Horizon engineers complete IBM cloud-native and AI foundations certification." },
    { id: 6,  name: "Provider Credentialing Automation Live",                  phase: "Foundation", workstream: "Provider Operations",     owner: "Joint",   ownerTeam: "IBM + Provider Ops",        dueDate: "2026-09-30", status: "At Risk",    description: "Automated credentialing workflow reducing audit cycle from 30 → 10 days. Blocked on provider FHIR feed." },
    { id: 7,  name: "API-First Integration Hub — Phase 1",                     phase: "Scale",      workstream: "Platform Modernization",  owner: "IBM",     ownerTeam: "IBM Integration Lab",       dueDate: "2026-12-31", status: "On Track",   description: "Real-time partner exchange API hub deployed across 15 key integration points." },
    { id: 8,  name: "IBM–Horizon Year 2 Contract Extension Signed",            phase: "Scale",      workstream: "Program Governance",      owner: "Horizon", ownerTeam: "Horizon Procurement & IT",  dueDate: "2026-10-31", status: "Not Started", description: "Multi-year extension covering Year 2–3 AMS scope, AI programme, and IBM watsonx licensing — required before Scale-phase mobilisation." },
    { id: 9,  name: "Prior Auth AI Engine — 70% Auto-Approval Target",         phase: "Scale",      workstream: "Clinical Automation",     owner: "IBM",     ownerTeam: "IBM AI & Automation",       dueDate: "2027-03-31", status: "Not Started", description: "ML-driven prior auth decision engine targeting 70% straight-through processing rate." },
    { id: 10, name: "POD Model — Full Scale (All Domains)",                    phase: "Scale",      workstream: "Delivery Transformation", owner: "Joint",   ownerTeam: "IBM + Horizon Delivery",    dueDate: "2027-03-31", status: "Not Started", description: "All 8 domains operating in full POD model with self-service sprint cadences." },
    { id: 11, name: "Power BI Analytics Consolidation",                        phase: "Scale",      workstream: "Data & Analytics",        owner: "IBM",     ownerTeam: "IBM Data Engineering",      dueDate: "2027-06-30", status: "Not Started", description: "Single Power BI platform replacing 6 separate reporting tools; 200+ dashboards migrated." },
    { id: 12, name: "GenAI Member Engagement Platform — Beta",                 phase: "Scale",      workstream: "Digital Innovation",      owner: "IBM",     ownerTeam: "IBM watsonx Labs",          dueDate: "2027-09-30", status: "Not Started", description: "AI-powered member portal with natural language benefits navigation and claims inquiry." },
    { id: 13, name: "Skills Bootcamp — All Cohorts Complete (200+ resources)", phase: "Scale",      workstream: "Capability Uplift",       owner: "IBM",     ownerTeam: "IBM Learning Services",     dueDate: "2027-09-30", status: "Not Started", description: "Full Horizon engineering population certified across IBM cloud-native, AI, and agile disciplines." },
    { id: 14, name: "Legacy Elimination — EOL Systems Decommissioned",         phase: "Scale",      workstream: "Technical Remediation",   owner: "Joint",   ownerTeam: "IBM + Horizon IT",          dueDate: "2027-12-31", status: "Not Started", description: "All end-of-life systems identified in the Year-1 inventory formally decommissioned." },
    { id: 15, name: "AI-Driven Prior Auth — 85% Auto-Approval",                phase: "Operate",    workstream: "Clinical Automation",     owner: "IBM",     ownerTeam: "IBM AI & Automation",       dueDate: "2028-03-31", status: "Not Started", description: "Full production deployment achieving 85% straight-through rate, reducing clinical reviewer load by 60%." },
    { id: 16, name: "GenAI Member Engagement — Full Production (NPS +12)",     phase: "Operate",    workstream: "Digital Innovation",      owner: "IBM",     ownerTeam: "IBM watsonx Labs",          dueDate: "2028-06-30", status: "Not Started", description: "Full member-facing AI platform live; NPS improvement of +12 tracked over 3 months post-launch." },
    { id: 17, name: "Self-Healing Operations — AI-Driven Ticket Prevention",   phase: "Operate",    workstream: "AIOps & Observability",   owner: "IBM",     ownerTeam: "IBM AIOps Squad",           dueDate: "2028-09-30", status: "Not Started", description: "Predictive remediation engine achieving near-zero reactive ticket volume across all critical systems." },
    { id: 18, name: "Full Technology Stack Modernization Complete",            phase: "Operate",    workstream: "Technical Remediation",   owner: "Joint",   ownerTeam: "IBM + Horizon IT",          dueDate: "2028-12-31", status: "Not Started", description: "100% supported, maintained technology estate. Zero unsupported runtime dependencies." },
    { id: 19, name: "Horizon Digital Operating Model — Steady State",          phase: "Operate",    workstream: "Delivery Transformation", owner: "Horizon", ownerTeam: "Horizon IT Leadership",     dueDate: "2028-12-31", status: "Not Started", description: "Horizon operating fully in product-aligned POD model with IBM in advisory and augmentation role." },
  ]);
});

router.get("/roadmap/requirements", async (_req, res): Promise<void> => {
  const rows = await db.select().from(roadmapRequirementsTable).orderBy(roadmapRequirementsTable.id);
  res.json(rows);
});

router.get("/roadmap/risks", async (_req, res): Promise<void> => {
  const rows = await db.select().from(roadmapRisksTable).orderBy(roadmapRisksTable.id);
  res.json(rows);
});

export default router;
