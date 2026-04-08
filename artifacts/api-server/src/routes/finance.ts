import { Router, type IRouter } from "express";
import { db, financeBillingExceptionsTable, financePremiumTrendTable } from "@workspace/db";
import { asc } from "drizzle-orm";

const router: IRouter = Router();

function mkKpi(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs yesterday`, status, trend };
}

router.get("/finance/kpis", async (_req, res): Promise<void> => {
  res.json({
    premiumBilled: mkKpi(487200000, "$487.2M", 4.1, "green", "up"),
    premiumReceived: mkKpi(461840000, "$461.8M", 3.8, "green", "up"),
    delinquencyCount: mkKpi(8742, "8,742", 12.3, "yellow", "up"),
    refunds: mkKpi(2840000, "$2.84M", -8.2, "green", "down"),
    billingExceptions: mkKpi(1247, "1,247", 18.7, "yellow", "up"),
    paymentPostingLatency: mkKpi(2.4, "2.4 hrs", 33.3, "yellow", "up"),
    reconciliationStatus: mkKpi(97.8, "97.8%", -0.8, "green", "flat"),
  });
});

router.get("/finance/billing-exceptions", async (_req, res): Promise<void> => {
  const rows = await db.select().from(financeBillingExceptionsTable).orderBy(asc(financeBillingExceptionsTable.id));
  res.json(rows);
});

router.get("/finance/premium-trend", async (_req, res): Promise<void> => {
  const rows = await db.select().from(financePremiumTrendTable).orderBy(asc(financePremiumTrendTable.id));
  res.json(rows.map((r) => ({ month: r.monthLabel, billed: r.billed, received: r.received })));
});

export default router;
