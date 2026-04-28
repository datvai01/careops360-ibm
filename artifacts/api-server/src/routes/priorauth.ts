import { Router, type IRouter } from "express";
import { db, priorauthAgingTable, priorauthProceduresTable, priorauthReviewersTable } from "@workspace/db";
import { asc, desc } from "drizzle-orm";
import { fetchPageKpis } from "../lib/kpiHelper";

const router: IRouter = Router();

router.get("/priorauth/kpis", async (_req, res): Promise<void> => {
  const kpis = await fetchPageKpis("priorauth");
  res.json(kpis);
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
