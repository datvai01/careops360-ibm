import { Router, type IRouter } from "express";
import { db, priorauthAgingTable, priorauthProceduresTable, priorauthReviewersTable } from "@workspace/db";
import { asc, desc } from "drizzle-orm";

const router: IRouter = Router();

function mkKpi(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs yesterday`, status, trend };
}

router.get("/priorauth/kpis", async (_req, res): Promise<void> => {
  res.json({
    requestsReceived: mkKpi(3241, "3,241", 18.7, "red", "up"),
    approved: mkKpi(1842, "1,842", -8.2, "yellow", "down"),
    denied: mkKpi(487, "487", 12.4, "yellow", "up"),
    pended: mkKpi(892, "892", 47.3, "red", "up"),
    avgReviewHours: mkKpi(31.4, "31.4 hrs", 24.8, "red", "up"),
    urgentRequests: mkKpi(218, "218", 33.5, "red", "up"),
    backlogSize: mkKpi(1247, "1,247", 28.4, "red", "up"),
    appealsVolume: mkKpi(142, "142", 8.7, "yellow", "up"),
  });
});

router.get("/priorauth/aging", async (_req, res): Promise<void> => {
  const rows = await db.select().from(priorauthAgingTable).orderBy(asc(priorauthAgingTable.id));
  res.json(rows.map((r) => ({ bucket: r.bucket, count: r.count, percentage: r.percentage, severity: r.severity })));
});

router.get("/priorauth/top-procedures", async (_req, res): Promise<void> => {
  const rows = await db.select().from(priorauthProceduresTable).orderBy(desc(priorauthProceduresTable.requests));
  res.json(rows.map((r) => ({ category: r.category, requests: r.requests, approvalRate: r.approvalRate, avgDays: r.avgDays })));
});

router.get("/priorauth/workload", async (_req, res): Promise<void> => {
  const rows = await db.select().from(priorauthReviewersTable).orderBy(desc(priorauthReviewersTable.openCases));
  res.json(rows.map((r) => ({
    reviewerId: r.reviewerId,
    reviewerName: r.reviewerName,
    openCases: r.openCases,
    completedToday: r.completedToday,
    avgDaysToDecision: r.avgDaysToDecision,
    status: r.status,
  })));
});

export default router;
