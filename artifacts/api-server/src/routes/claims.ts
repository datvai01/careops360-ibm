import { Router, type IRouter } from "express";
import {
  db,
  claimsTable,
  claimsDenialReasonsTable,
  claimsLobStatsTable,
  claimsAgingTable,
} from "@workspace/db";
import { asc, count, sql } from "drizzle-orm";
import { fetchPageKpis } from "../lib/kpiHelper";

const router: IRouter = Router();

router.get("/claims/kpis", async (_req, res): Promise<void> => {
  const kpis = await fetchPageKpis("claims");
  res.json(kpis);
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
