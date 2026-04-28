import { Router, type IRouter } from "express";
import {
  db,
  capabilityKpisTable,
  capabilityStagesTable,
  capabilityTrainingTable,
  capabilityGovernanceTable,
  capabilityAreasTable,
  capabilityRadarTable,
  capabilityValueImpactTable,
  capabilityAiCertsTable,
  capabilityWorkforceTransformationTable,
} from "@workspace/db";
import { asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/capability/kpis", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(capabilityKpisTable)
    .orderBy(asc(capabilityKpisTable.displayOrder), asc(capabilityKpisTable.id));
  res.json(
    rows.map((r) => ({
      key: r.kpiKey,
      label: r.label,
      value: r.value,
      formatted: r.formatted,
      change: r.change,
      status: r.status,
      trend: r.trend,
      sub: r.sub,
      iconKey: r.iconKey,
      colorKey: r.colorKey,
      delta: r.delta,
    })),
  );
});

router.get("/capability/stages", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(capabilityStagesTable)
    .orderBy(asc(capabilityStagesTable.displayOrder), asc(capabilityStagesTable.id));
  res.json(
    rows.map((r) => ({
      id: r.stage,
      label: r.title,
      desc: r.description,
      currentMaturity: r.currentMaturity,
      targetMaturity: r.targetMaturity,
      status: r.status,
      ownerTeam: r.ownerTeam,
      position: r.position,
    })),
  );
});

router.get("/capability/training", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(capabilityTrainingTable)
    .orderBy(asc(capabilityTrainingTable.startDate), asc(capabilityTrainingTable.id));
  res.json(
    rows.map((r) => ({
      id: `t${String(r.id).padStart(2, "0")}`,
      title: r.programName,
      vendor: r.vendor,
      track: r.track,
      category: r.category,
      audience: r.audience,
      date: r.startDate,
      endDate: r.endDate,
      format: r.format,
      level: r.level,
      seats: r.seats,
      enrolled: r.enrollment,
      enrollment: r.enrollment,
      completionRate: r.completionRate,
      status: r.status,
      color: r.color,
      description: r.description,
      certificationEarned: r.certificationEarned,
    })),
  );
});

router.get("/capability/governance", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(capabilityGovernanceTable)
    .orderBy(asc(capabilityGovernanceTable.id));
  res.json(
    rows.map((r) => ({
      practice: r.practice,
      description: r.description,
      cadence: r.cadence,
      owner: r.owner,
      status: r.status,
    })),
  );
});

router.get("/capability/areas", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(capabilityAreasTable)
    .orderBy(asc(capabilityAreasTable.displayOrder), asc(capabilityAreasTable.id));
  res.json(
    rows.map((r) => ({
      area: r.area,
      sub: r.sub,
      current: r.currentCount,
      planned: r.plannedCount,
      priority: r.priority,
      impact: r.impact,
    })),
  );
});

router.get("/capability/radar", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(capabilityRadarTable)
    .orderBy(asc(capabilityRadarTable.displayOrder), asc(capabilityRadarTable.id));
  res.json(rows.map((r) => ({ axis: r.axis, current: r.current, planned: r.planned })));
});

router.get("/capability/value-impact", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(capabilityValueImpactTable)
    .orderBy(asc(capabilityValueImpactTable.displayOrder), asc(capabilityValueImpactTable.id));
  res.json(
    rows.map((r) => ({ cap: r.cap, metric: r.metric, value: r.value, colorKey: r.colorKey })),
  );
});

router.get("/capability/workforce-transformation", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(capabilityWorkforceTransformationTable)
    .orderBy(asc(capabilityWorkforceTransformationTable.side), asc(capabilityWorkforceTransformationTable.displayOrder), asc(capabilityWorkforceTransformationTable.id));
  res.json(rows.map((r) => ({ side: r.side, bullet: r.bullet })));
});

router.get("/capability/ai-certs", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(capabilityAiCertsTable)
    .orderBy(asc(capabilityAiCertsTable.displayOrder), asc(capabilityAiCertsTable.id));
  res.json(
    rows.map((r) => ({
      label: r.label,
      current: r.currentCount,
      planned: r.plannedCount,
      use: r.useCase,
    })),
  );
});

export default router;
