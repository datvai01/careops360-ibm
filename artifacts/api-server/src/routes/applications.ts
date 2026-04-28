import { Router, type IRouter } from "express";
import {
  db,
  applicationsTable,
  incidentsTable,
  batchJobsTable,
  interfacesTable,
  slaComplianceTable,
} from "@workspace/db";
import { eq, asc, count, and } from "drizzle-orm";
import { fetchPageKpis } from "../lib/kpiHelper";

const router: IRouter = Router();

function _mkKpiUnused(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs yesterday`, status, trend };
}

router.get("/applications/health", async (_req, res): Promise<void> => {
  const apps = await db.select().from(applicationsTable);
  const healthy = apps.filter((a) => a.status === "healthy").length;
  const degraded = apps.filter((a) => a.status === "degraded").length;
  const critical = apps.filter((a) => a.status === "critical").length;
  const openIncidents = apps.reduce((sum, a) => sum + a.openIncidents, 0);

  res.json({
    overallAvailability: 99.4,
    totalApplications: apps.length,
    healthyCount: healthy,
    degradedCount: degraded,
    criticalCount: critical,
    openIncidents,
    batchSuccessRate: 98.2,
    interfaceHealth: 94.7,
  });
});

router.get("/applications/list", async (_req, res): Promise<void> => {
  const apps = await db.select().from(applicationsTable).orderBy(asc(applicationsTable.appId));
  res.json(apps);
});

router.get("/applications/incidents", async (req, res): Promise<void> => {
  const severity = req.query.severity as string | undefined;
  const status = req.query.status as string | undefined;

  let incidents = await db.select().from(incidentsTable).orderBy(asc(incidentsTable.openedAt));

  if (severity) incidents = incidents.filter((i) => i.severity === severity);
  if (status) incidents = incidents.filter((i) => i.status === status);

  res.json(incidents.map((i) => ({
    incidentId: i.incidentId,
    severity: i.severity,
    title: i.title,
    affectedApplication: i.affectedApplication,
    status: i.status,
    openedAt: i.openedAt,
    resolvedAt: i.resolvedAt,
    mttr: i.mttr,
    rootCause: i.rootCause,
    assignee: i.assignee,
  })));
});

router.get("/applications/batch-jobs", async (_req, res): Promise<void> => {
  const jobs = await db.select().from(batchJobsTable).orderBy(asc(batchJobsTable.jobId));
  res.json(jobs);
});

router.get("/applications/interfaces", async (_req, res): Promise<void> => {
  const ifaces = await db.select().from(interfacesTable).orderBy(asc(interfacesTable.interfaceId));
  res.json(ifaces.map((i) => ({
    interfaceId: i.interfaceId,
    name: i.name,
    type: i.type,
    sourceSystem: i.sourceSystem,
    targetSystem: i.targetSystem,
    status: i.status,
    lastTransmission: i.lastTransmission,
    recordsToday: i.recordsToday,
    errorRate: i.errorRate,
  })));
});

router.get("/applications/sla", async (_req, res): Promise<void> => {
  const rows = await db.select().from(slaComplianceTable).orderBy(asc(slaComplianceTable.id));
  res.json(rows.map((r) => ({ tower: r.tower, target: r.target, actual: r.actual, status: r.status, trend: r.trend })));
});

router.get("/applications/kpis", async (_req, res): Promise<void> => {
  const kpis = await fetchPageKpis("applications");
  res.json(kpis);
});

export default router;
