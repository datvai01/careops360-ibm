import { Router, type IRouter } from "express";
import { db, contactcenterCallReasonsTable, contactcenterHourlyTable } from "@workspace/db";
import { desc, asc } from "drizzle-orm";
import { fetchPageKpis } from "../lib/kpiHelper";

const router: IRouter = Router();

router.get("/contactcenter/kpis", async (_req, res): Promise<void> => {
  const kpis = await fetchPageKpis("contactcenter");
  res.json(kpis);
});

router.get("/contactcenter/call-reasons", async (_req, res): Promise<void> => {
  const rows = await db.select().from(contactcenterCallReasonsTable).orderBy(desc(contactcenterCallReasonsTable.count));
  res.json(rows.map((r) => ({ reason: r.reason, count: r.count, percentage: r.percentage, trend: r.trend })));
});

router.get("/contactcenter/hourly-volume", async (_req, res): Promise<void> => {
  const rows = await db.select().from(contactcenterHourlyTable).orderBy(asc(contactcenterHourlyTable.id));
  res.json(rows.map((r) => ({ hour: r.hourLabel, calls: r.calls, chats: r.chats, emails: r.emails })));
});

export default router;
