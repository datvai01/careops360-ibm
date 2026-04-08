import { Router, type IRouter } from "express";
import { db, ibmamsRunbooksTable, ibmamsSavingsTrendTable, ibmamsTicketTrendsTable, aiInsightsTable } from "@workspace/db";
import { asc, desc } from "drizzle-orm";

const router: IRouter = Router();

function mkKpi(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs yesterday`, status, trend };
}

router.get("/ibmams/kpis", async (_req, res): Promise<void> => {
  res.json({
    ticketsResolved: mkKpi(147, "147 today", 8.1, "green", "up"),
    slaCompliance: mkKpi(96.8, "96.8%", 1.4, "green", "up"),
    shiftLeftRate: mkKpi(42.3, "42.3%", 12.7, "green", "up"),
    selfHealEvents: mkKpi(24, "24 today", 33.3, "green", "up"),
    productivityGain: mkKpi(31.4, "31.4%", 5.2, "green", "up"),
    costReduction: mkKpi(18.7, "18.7%", 3.8, "green", "up"),
    defectLeakage: mkKpi(2.4, "2.4%", -18.6, "green", "down"),
    repeatIncidentReduction: mkKpi(67.3, "67.3%", 8.4, "green", "up"),
    automationRunbooks: mkKpi(89, "89 executed", 24.1, "green", "up"),
    costAvoidance: mkKpi(8400000, "$8.4M YTD", 31.2, "green", "up"),
    knowledgeArticles: mkKpi(1247, "1,247 used", 12.3, "green", "up"),
    changeVelocity: mkKpi(24, "24 per week", 14.3, "green", "up"),
  });
});

router.get("/ibmams/ticket-trends", async (_req, res): Promise<void> => {
  const rows = await db.select().from(ibmamsTicketTrendsTable).orderBy(asc(ibmamsTicketTrendsTable.id));
  res.json(rows.map((r) => ({
    week: r.weekLabel,
    total: r.total,
    resolvedWithinSla: r.resolvedWithinSla,
    automated: r.automated,
  })));
});

router.get("/ibmams/automation-runbooks", async (_req, res): Promise<void> => {
  const rows = await db.select().from(ibmamsRunbooksTable).orderBy(desc(ibmamsRunbooksTable.executionsToday));
  res.json(rows.map((r) => ({
    runbookId: r.runbookId,
    name: r.name,
    category: r.category,
    executionsToday: r.executionsToday,
    successRate: r.successRate,
    timeSavedHours: r.timeSavedHours,
  })));
});

router.get("/ibmams/savings", async (_req, res): Promise<void> => {
  const rows = await db.select().from(ibmamsSavingsTrendTable).orderBy(asc(ibmamsSavingsTrendTable.id));
  res.json({
    totalSavingsYtd: 3200000,
    costAvoidanceYtd: 8400000,
    automationSavings: 2100000,
    shiftLeftSavings: 800000,
    selfHealSavings: 300000,
    monthlyTrend: rows.map((r) => ({ month: r.monthLabel, savings: r.savings, avoidance: r.avoidance })),
  });
});

router.get("/ibmams/ai-insights", async (_req, res): Promise<void> => {
  const rows = await db.select().from(aiInsightsTable).orderBy(desc(aiInsightsTable.insightTimestamp));
  res.json(rows.map((r) => ({
    id: r.id,
    category: r.category,
    severity: r.severity,
    headline: r.headline,
    detail: r.detail,
    recommendation: r.recommendation,
    timestamp: r.insightTimestamp,
    affectedArea: r.affectedArea,
  })));
});

router.post("/ibmams/ask", async (req, res): Promise<void> => {
  const { question } = req.body;

  const responses: Record<string, { answer: string; sources: string[]; relatedMetrics: { label: string; value: string }[] }> = {
    "prior auth": {
      answer: "Prior auth approvals are down today primarily due to two factors: (1) A 47% spike in backlog driven by an 18.7% increase in requests — particularly biologic specialty drug authorizations up 34% week-over-week — and (2) reviewer capacity constraints with 3 reviewers reporting 90+ open cases each. The overall approval rate is 56.8% today vs 72.1% last week. IBM's AI-driven triage recommendation has identified 287 repeat biologic cases eligible for expedited auto-approval based on clean authorization history.",
      sources: ["Prior Auth Operations Dashboard", "Reviewer Workload Monitor", "IBM AMS Insights Engine"],
      relatedMetrics: [{ label: "Backlog Size", value: "1,247" }, { label: "Avg Review Time", value: "31.4 hrs" }, { label: "Urgent Cases", value: "218" }],
    },
    "claims settlement": {
      answer: "Two applications are currently impacting claims settlement: (1) Claims Adjudication Platform (Sev 2 incident) — database connection pool exhaustion is causing 8.2-second average response times (SLA: 3 sec), reducing auto-adjudication from 87% to 72% and creating a ~4,200 claim manual backlog. (2) API Gateway / EDI Hub (Sev 2 incident) — EDI 835 remittance file transmission has been delayed 95 minutes, holding up $2.1M in settlement payments to 312 providers. IBM AMS teams are actively working both incidents.",
      sources: ["Application Health Dashboard", "Active Incident Log", "EDI Interface Monitor"],
      relatedMetrics: [{ label: "Pending Settlement", value: "$2.1M" }, { label: "Auto-Adj Rate", value: "72.4%" }, { label: "Active Incidents", value: "2" }],
    },
    "claims backlog": {
      answer: "Current claims backlog by line of business: Commercial: 10,900 pending ($118.4M); Medicare Advantage: 5,400 pending ($87.2M); Medicaid: 4,900 pending ($22.1M); Exchange: 5,743 pending ($14.1M). Age analysis shows 9.4% of backlog (1,782 claims) is over 31 days old — exceeding prompt pay requirements. These are concentrated in complex COB cases and high-dollar inpatient surgical claims requiring manual review.",
      sources: ["Claims Operations Dashboard", "Claims Aging Report", "Line of Business Analytics"],
      relatedMetrics: [{ label: "Total Pending", value: "18,943" }, { label: ">30 Day Claims", value: "1,782" }, { label: "Dollar Value", value: "$241.8M" }],
    },
  };

  const lq = question?.toLowerCase() || "";
  let matched = null;
  if (lq.includes("prior auth") || lq.includes("authorization")) matched = responses["prior auth"];
  else if (lq.includes("claim") && (lq.includes("impact") || lq.includes("settlement") || lq.includes("application"))) matched = responses["claims settlement"];
  else if (lq.includes("backlog") || lq.includes("region")) matched = responses["claims backlog"];

  if (matched) {
    res.json(matched);
    return;
  }

  res.json({
    answer: `Based on today's operational data: Your question about "${question}" relates to multiple areas of payer operations. The Horizon Payer Command Center is currently tracking 4.29M active members, 87,432 claims received today ($241.8M settled), 3,241 prior auth requests with a 47% backlog spike, and 2 active incidents affecting Claims Adjudication and EDI Hub systems. IBM AMS has resolved 147 tickets today at 96.8% SLA compliance, with $3.2M in YTD cost savings through automation.`,
    sources: ["Executive Overview", "IBM AMS Value Dashboard", "Application Health Monitor"],
    relatedMetrics: [
      { label: "Active Members", value: "4.29M" },
      { label: "Claims Today", value: "87,432" },
      { label: "IBM SLA", value: "96.8%" },
    ],
  });
});

export default router;
