import { Router, type IRouter } from "express";
import { db, contactcenterCallReasonsTable, contactcenterHourlyTable } from "@workspace/db";
import { desc, asc } from "drizzle-orm";

const router: IRouter = Router();

function mkKpi(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs yesterday`, status, trend };
}

router.get("/contactcenter/kpis", async (_req, res): Promise<void> => {
  res.json({
    callsReceived: mkKpi(8421, "8,421", 5.2, "yellow", "up"),
    avgWaitTime: mkKpi(47, "47 sec", 56.7, "red", "up"),
    abandonmentRate: mkKpi(8.2, "8.2%", 37.0, "red", "up"),
    firstCallResolution: mkKpi(72.4, "72.4%", -4.7, "yellow", "down"),
    casesOpened: mkKpi(1247, "1,247", 8.1, "yellow", "up"),
    casesResolved: mkKpi(1084, "1,084", 2.4, "green", "up"),
    memberComplaints: mkKpi(87, "87", 12.8, "yellow", "up"),
    chatbotContainment: mkKpi(41.2, "41.2%", 8.4, "green", "up"),
    digitalAdoption: mkKpi(34.7, "34.7%", 3.1, "green", "up"),
  });
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
