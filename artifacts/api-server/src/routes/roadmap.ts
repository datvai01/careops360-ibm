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

export default router;
