import { Router, type IRouter } from "express";
import { db, providersTable, providerIssuesTable } from "@workspace/db";
import { asc, desc, count } from "drizzle-orm";
import { fetchPageKpis } from "../lib/kpiHelper";

const router: IRouter = Router();

router.get("/providers/kpis", async (_req, res): Promise<void> => {
  const kpis = await fetchPageKpis("providers");
  res.json(kpis);
});

router.get("/providers/list", async (req, res): Promise<void> => {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1")));

  const [providers, totalRow] = await Promise.all([
    db.select().from(providersTable).orderBy(asc(providersTable.providerId)),
    db.select({ cnt: count() }).from(providersTable),
  ]);

  res.json({ providers, total: totalRow[0]?.cnt ?? 0, page });
});

router.get("/providers/issues", async (_req, res): Promise<void> => {
  const rows = await db.select().from(providerIssuesTable).orderBy(desc(providerIssuesTable.count));
  res.json(rows.map((r) => ({ issueType: r.issueType, count: r.count, trend: r.trend, priority: r.priority })));
});

export default router;
