import { Router, type IRouter } from "express";
import {
  db,
  claimsTable,
  claimsDenialReasonsTable,
  claimsLobStatsTable,
  claimsAgingTable,
} from "@workspace/db";
import { asc, count, sql } from "drizzle-orm";

const router: IRouter = Router();

function mkKpi(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs yesterday`, status, trend };
}

router.get("/claims/kpis", async (_req, res): Promise<void> => {
  res.json({
    claimsReceivedToday: mkKpi(87432, "87,432", -2.1, "yellow", "down"),
    claimsInAdjudication: mkKpi(24187, "24,187", 8.4, "yellow", "up"),
    claimsPending: mkKpi(18943, "18,943", 14.2, "red", "up"),
    claimsDenied: mkKpi(4218, "4,218", 5.8, "yellow", "up"),
    claimsSettled: mkKpi(61023, "61,023", 1.2, "green", "flat"),
    totalDollarProcessed: mkKpi(241800000, "$241.8M", 5.2, "green", "up"),
    autoAdjudicationRate: mkKpi(72.4, "72.4%", -14.6, "red", "down"),
    avgTurnaroundDays: mkKpi(4.2, "4.2 days", 10.5, "yellow", "up"),
  });
});

router.get("/claims/queue", async (req, res): Promise<void> => {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1")));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "20"))));
  const offset = (page - 1) * limit;

  const [rows, totalRow] = await Promise.all([
    db.select().from(claimsTable).orderBy(asc(claimsTable.claimId)).limit(limit).offset(offset),
    db.select({ cnt: count() }).from(claimsTable),
  ]);

  res.json({ claims: rows, total: totalRow[0]?.cnt ?? 0, page, limit });
});

router.get("/claims/denial-reasons", async (_req, res): Promise<void> => {
  const rows = await db.select().from(claimsDenialReasonsTable).orderBy(asc(claimsDenialReasonsTable.id));
  res.json(rows.map((r) => ({ reason: r.reason, count: r.count, percentage: r.percentage, trend: r.trend })));
});

router.get("/claims/by-line-of-business", async (_req, res): Promise<void> => {
  const rows = await db.select().from(claimsLobStatsTable).orderBy(asc(claimsLobStatsTable.id));
  res.json(rows.map((r) => ({ lob: r.lob, received: r.received, processed: r.processed, pending: r.pending, amount: r.amount })));
});

router.get("/claims/aging", async (_req, res): Promise<void> => {
  const rows = await db.select().from(claimsAgingTable).orderBy(asc(claimsAgingTable.id));
  res.json(rows.map((r) => ({ bucket: r.bucket, count: r.count, percentage: r.percentage, severity: r.severity })));
});

export default router;
