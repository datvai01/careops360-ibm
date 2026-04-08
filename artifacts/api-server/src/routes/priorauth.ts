import { Router, type IRouter } from "express";

const router: IRouter = Router();

function mkKpi(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs yesterday`, status, trend };
}

router.get("/priorauth/kpis", async (_req, res): Promise<void> => {
  res.json({
    requestsReceived: mkKpi(3241, "3,241", 18.7, "red", "up"),
    approved: mkKpi(1842, "1,842", -8.2, "yellow", "down"),
    denied: mkKpi(487, "487", 12.4, "yellow", "up"),
    pended: mkKpi(892, "892", 47.3, "red", "up"),
    avgReviewHours: mkKpi(31.4, "31.4 hrs", 24.8, "red", "up"),
    urgentRequests: mkKpi(218, "218", 33.5, "red", "up"),
    backlogSize: mkKpi(1247, "1,247", 28.4, "red", "up"),
    appealsVolume: mkKpi(142, "142", 8.7, "yellow", "up"),
  });
});

router.get("/priorauth/aging", async (_req, res): Promise<void> => {
  res.json([
    { bucket: "0-24 hours", count: 412, percentage: 33.0, severity: "green" },
    { bucket: "24-48 hours", count: 287, percentage: 23.0, severity: "green" },
    { bucket: "48-72 hours (SLA)", count: 341, percentage: 27.3, severity: "yellow" },
    { bucket: "72-96 hours", count: 142, percentage: 11.4, severity: "red" },
    { bucket: "96+ hours (Breach)", count: 65, percentage: 5.21, severity: "red" },
  ]);
});

router.get("/priorauth/top-procedures", async (_req, res): Promise<void> => {
  res.json([
    { category: "Inpatient Surgery", requests: 487, approvalRate: 78.2, avgDays: 1.8 },
    { category: "Outpatient MRI/CT", requests: 412, approvalRate: 84.1, avgDays: 0.9 },
    { category: "Specialty Drugs (Biologics)", requests: 387, approvalRate: 62.4, avgDays: 3.2 },
    { category: "Home Health Services", requests: 341, approvalRate: 91.2, avgDays: 0.7 },
    { category: "Physical/OT Therapy (Extended)", requests: 298, approvalRate: 87.6, avgDays: 0.5 },
    { category: "Behavioral Health", requests: 274, approvalRate: 89.4, avgDays: 0.8 },
    { category: "Durable Medical Equipment", requests: 241, approvalRate: 93.1, avgDays: 0.4 },
    { category: "Oncology Treatment", requests: 187, approvalRate: 71.7, avgDays: 2.4 },
    { category: "Cardiac Procedures", requests: 163, approvalRate: 74.2, avgDays: 2.1 },
    { category: "Transplant Services", requests: 51, approvalRate: 58.8, avgDays: 5.7 },
  ]);
});

router.get("/priorauth/workload", async (_req, res): Promise<void> => {
  const reviewers = [
    { reviewerId: "RV001", reviewerName: "Dr. Lisa Park", openCases: 87, completedToday: 34, avgDaysToDecision: 1.2, status: "high" as const },
    { reviewerId: "RV002", reviewerName: "Dr. James Wilson", openCases: 62, completedToday: 28, avgDaysToDecision: 1.0, status: "normal" as const },
    { reviewerId: "RV003", reviewerName: "RN Patricia Gomez", openCases: 124, completedToday: 41, avgDaysToDecision: 1.8, status: "critical" as const },
    { reviewerId: "RV004", reviewerName: "Dr. Aisha Johnson", openCases: 53, completedToday: 22, avgDaysToDecision: 0.9, status: "normal" as const },
    { reviewerId: "RV005", reviewerName: "RN Mark Stevens", openCases: 98, completedToday: 31, avgDaysToDecision: 1.5, status: "high" as const },
    { reviewerId: "RV006", reviewerName: "Dr. Sarah Kim", openCases: 41, completedToday: 19, avgDaysToDecision: 0.8, status: "normal" as const },
  ];
  res.json(reviewers);
});

export default router;
