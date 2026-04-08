import { Router, type IRouter } from "express";

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
  const types = ["Premium Overpayment", "NSF / Returned Payment", "Duplicate Payment", "Address Mismatch", "Account Number Error", "Retroactive Premium Adjustment", "Group Billing Discrepancy"];
  const statuses = ["Pending Review", "In Progress", "Escalated", "Pending Member Response"];
  const priorities: ("high" | "medium" | "low")[] = ["high", "medium", "low"];

  const exceptions = Array.from({ length: 15 }, (_, i) => ({
    id: `BEX-${String(i + 5001).padStart(5, "0")}`,
    memberId: `HBC${Math.floor(Math.random() * 9000000) + 1000000}`,
    memberName: `Member ${i + 1}`,
    exceptionType: types[Math.floor(Math.random() * types.length)],
    amount: Math.floor(Math.random() * 5000) + 100,
    ageDays: Math.floor(Math.random() * 45) + 1,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
  }));

  res.json(exceptions);
});

router.get("/finance/premium-trend", async (_req, res): Promise<void> => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const trend = months.map((month, i) => ({
    month: `${month} '25`,
    billed: 462000000 + i * 3000000 + Math.floor(Math.random() * 5000000),
    received: 440000000 + i * 2800000 + Math.floor(Math.random() * 4000000),
  }));
  res.json(trend);
});

export default router;
