import { Router, type IRouter } from "express";

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
  const page = parseInt(String(req.query.page ?? "1"));
  const limit = parseInt(String(req.query.limit ?? "20"));

  const statuses = ["Pending", "In Adjudication", "Suspended", "Denied", "Settled", "Returned"];
  const providers = ["St. Barnabas Medical Center", "RWJBarnabas Health", "Atlantic Health System", "Virtua Health", "Cooper University Hospital", "Hackensack Meridian Health"];
  const lobs = ["Commercial", "Medicare Advantage", "Medicaid", "Exchange"];
  const denialReasons = ["Medical Necessity", "Not Covered", "Duplicate Claim", "Prior Auth Required", "Out of Network", null, null, null, null, null];

  const total = 18943;
  const claims = Array.from({ length: limit }, (_, i) => {
    const claimIndex = (page - 1) * limit + i;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const denialReason = status === "Denied" ? denialReasons[Math.floor(Math.random() * 5)] : null;
    const ageDays = Math.floor(Math.random() * 60) + 1;
    const serviceDate = new Date(Date.now() - ageDays * 86400000);
    return {
      claimId: `CLM-${String(claimIndex + 2024001).padStart(8, "0")}`,
      memberId: `HBC${Math.floor(Math.random() * 9000000) + 1000000}`,
      memberName: `Member ${claimIndex + 1}`,
      provider: providers[Math.floor(Math.random() * providers.length)],
      serviceDate: serviceDate.toISOString().split("T")[0],
      receivedDate: new Date(serviceDate.getTime() + 2 * 86400000).toISOString().split("T")[0],
      status,
      amount: Math.floor(Math.random() * 50000) + 500,
      lineOfBusiness: lobs[Math.floor(Math.random() * lobs.length)],
      ageDays,
      denialReason: denialReason ?? undefined,
    };
  });

  res.json({ claims, total, page, limit });
});

router.get("/claims/denial-reasons", async (_req, res): Promise<void> => {
  res.json([
    { reason: "Medical Necessity Not Established", count: 1482, percentage: 35.1, trend: "up" },
    { reason: "Prior Authorization Required", count: 892, percentage: 21.1, trend: "up" },
    { reason: "Not a Covered Service", count: 634, percentage: 15.0, trend: "flat" },
    { reason: "Duplicate Claim Submission", count: 421, percentage: 9.98, trend: "down" },
    { reason: "Out of Network Provider", count: 387, percentage: 9.17, trend: "up" },
    { reason: "Timely Filing Exceeded", count: 248, percentage: 5.88, trend: "down" },
    { reason: "Coordination of Benefits", count: 154, percentage: 3.65, trend: "flat" },
  ]);
});

router.get("/claims/by-line-of-business", async (_req, res): Promise<void> => {
  res.json([
    { lob: "Commercial", received: 42100, processed: 31200, pending: 10900, amount: 118400000 },
    { lob: "Medicare Advantage", received: 21800, processed: 16400, pending: 5400, amount: 87200000 },
    { lob: "Medicaid", received: 14700, processed: 9800, pending: 4900, amount: 22100000 },
    { lob: "Exchange", received: 8832, processed: 3623, pending: 5743, amount: 14100000 },
  ]);
});

router.get("/claims/aging", async (_req, res): Promise<void> => {
  res.json([
    { bucket: "0-7 days", count: 6241, percentage: 32.9, severity: "green" },
    { bucket: "8-14 days", count: 4892, percentage: 25.8, severity: "green" },
    { bucket: "15-21 days", count: 3187, percentage: 16.8, severity: "yellow" },
    { bucket: "22-30 days", count: 2841, percentage: 15.0, severity: "yellow" },
    { bucket: "31-45 days", count: 1241, percentage: 6.55, severity: "red" },
    { bucket: "46+ days", count: 541, percentage: 2.86, severity: "red" },
  ]);
});

export default router;
