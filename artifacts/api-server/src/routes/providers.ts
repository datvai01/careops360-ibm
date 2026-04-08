import { Router, type IRouter } from "express";
import { db, providersTable, providerIssuesTable } from "@workspace/db";
import { asc, desc, count } from "drizzle-orm";

const router: IRouter = Router();

function mkKpi(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs yesterday`, status, trend };
}

router.get("/providers/kpis", async (_req, res): Promise<void> => {
  res.json({
    onboardingRequests: mkKpi(142, "142", 8.4, "yellow", "up"),
    directoryUpdates: mkKpi(2841, "2,841", -3.2, "green", "down"),
    credentialingPending: mkKpi(387, "387", 12.1, "yellow", "up"),
    openTickets: mkKpi(412, "412", -8.3, "green", "down"),
    disputeCases: mkKpi(87, "87", 4.8, "yellow", "up"),
    contractLoads: mkKpi(24, "24", 33.3, "yellow", "up"),
  });
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
