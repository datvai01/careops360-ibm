import { Router, type IRouter } from "express";
import { db, vendorInvoicesTable, vendorInvoiceAlertsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

function mkKpi(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs last period`, status, trend };
}

router.get("/vendor-invoices/kpis", async (_req, res): Promise<void> => {
  const rows = await db.select().from(vendorInvoicesTable);
  const total = rows.length;
  const processed = rows.filter((r) => r.status === "Processed").length;
  const pendingOnHold = rows.filter((r) => r.status === "Pending" || r.status === "On Hold").length;
  const totalValue = rows.reduce((s, r) => s + r.amount, 0);
  const paidCount = rows.filter((r) => r.paymentStatus === "Paid").length;
  const withCycle = rows.filter((r) => r.cycleTimeDays != null);
  const avgCycle = withCycle.length > 0 ? withCycle.reduce((s, r) => s + (r.cycleTimeDays ?? 0), 0) / withCycle.length : 0;
  const exceptions = rows.filter((r) => r.hasException === 1).length;
  res.json({
    totalReceived: mkKpi(total, `${total}`, 8.4, "green", "up"),
    totalProcessed: mkKpi(processed, `${processed}`, 4.1, "green", "up"),
    pendingOnHold: mkKpi(pendingOnHold, `${pendingOnHold}`, 12.5, "yellow", "up"),
    totalValue: mkKpi(totalValue, `$${(totalValue / 1000000).toFixed(2)}M`, 6.2, "green", "up"),
    paidCount: mkKpi(paidCount, `${paidCount}`, 3.7, "green", "up"),
    avgCycleTime: mkKpi(Math.round(avgCycle * 10) / 10, `${(Math.round(avgCycle * 10) / 10)} days`, -2.1, "green", "down"),
    exceptionCount: mkKpi(exceptions, `${exceptions}`, 33.3, "yellow", "up"),
  });
});

router.get("/vendor-invoices/list", async (req, res): Promise<void> => {
  let rows = await db.select().from(vendorInvoicesTable);
  const { vendor, status, workNumber, serviceCategory } = req.query as Record<string, string | undefined>;
  if (vendor) rows = rows.filter((r) => r.vendor === vendor);
  if (status) rows = rows.filter((r) => r.status === status);
  if (workNumber) rows = rows.filter((r) => r.workNumber === workNumber);
  if (serviceCategory) rows = rows.filter((r) => r.serviceCategory === serviceCategory);
  res.json(rows);
});

router.get("/vendor-invoices/aging", async (_req, res): Promise<void> => {
  const rows = await db.select().from(vendorInvoicesTable);
  const vendors = [...new Set(rows.map((r) => r.vendor))].sort();
  const result = vendors.map((v) => {
    const vRows = rows.filter((r) => r.vendor === v);
    return {
      vendor: v,
      bucket0to30: vRows.filter((r) => r.ageDays <= 30).length,
      bucket30to60: vRows.filter((r) => r.ageDays > 30 && r.ageDays <= 60).length,
      bucket60plus: vRows.filter((r) => r.ageDays > 60).length,
      total: vRows.length,
    };
  });
  res.json(result);
});

router.get("/vendor-invoices/alerts", async (_req, res): Promise<void> => {
  const rows = await db.select().from(vendorInvoiceAlertsTable);
  res.json(rows);
});

export default router;
