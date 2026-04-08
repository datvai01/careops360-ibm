import { Router, type IRouter } from "express";
import { db, executiveAlertsTable, dailyTrendsTable } from "@workspace/db";
import { asc } from "drizzle-orm";

const router: IRouter = Router();

function mkKpi(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs yesterday`, status, trend };
}

router.get("/executive/kpis", async (_req, res): Promise<void> => {
  res.json({
    activeMembers: mkKpi(4287341, "4.29M", 0.3, "green", "up"),
    newEnrollmentsToday: mkKpi(1842, "1,842", 12.4, "green", "up"),
    claimsReceivedToday: mkKpi(87432, "87,432", -2.1, "yellow", "down"),
    claimsSettledAmount: mkKpi(241800000, "$241.8M", 5.2, "green", "up"),
    priorAuthRequests: mkKpi(3241, "3,241", 18.7, "red", "up"),
    openProviderTickets: mkKpi(412, "412", -8.3, "green", "down"),
    callCenterASA: mkKpi(47, "47 sec", 15.2, "yellow", "up"),
    applicationAvailability: mkKpi(99.4, "99.4%", -0.1, "green", "flat"),
    criticalIncidents: mkKpi(2, "2", 0, "yellow", "flat"),
    slaAttainment: mkKpi(96.8, "96.8%", 1.2, "green", "up"),
    batchSuccessRate: mkKpi(98.2, "98.2%", -0.4, "green", "flat"),
    automationSavings: mkKpi(3200000, "$3.2M YTD", 22.1, "green", "up"),
  });
});

router.get("/executive/alerts", async (_req, res): Promise<void> => {
  const alerts = await db
    .select()
    .from(executiveAlertsTable)
    .orderBy(asc(executiveAlertsTable.alertTimestamp));

  res.json(
    alerts.map((a) => ({
      id: a.id,
      severity: a.severity,
      category: a.category,
      title: a.title,
      description: a.description,
      timestamp: a.alertTimestamp,
      status: a.status,
      impactedSystem: a.impactedSystem,
      drillDownPath: a.drillDownPath,
    }))
  );
});

router.get("/executive/snapshot", async (_req, res): Promise<void> => {
  res.json({
    businessHealth: "degraded",
    itHealth: "degraded",
    businessSummary: "Payer operations are experiencing moderate stress today. Prior auth backlog is 47% above normal and claims settlement is delayed due to EDI interface issues. Member enrollment is tracking above plan with 1,842 new enrollments.",
    itSummary: "2 active incidents impacting Claims Adjudication Platform and EDI Hub. Application availability at 99.4% — within SLA. Batch job success rate at 98.2%. IBM AMS team has acknowledged all critical incidents and root cause analysis is underway.",
    highlights: [
      "4.29M active members — up 0.3% day-over-day",
      "Member enrollment 12.4% above plan for today",
      "Auto-adjudication rate 72% — below 87% target",
      "IBM AMS resolved 147 tickets today — 96.8% within SLA",
      "Cost savings of $3.2M YTD through automation",
    ],
    watchItems: [
      "Prior auth backlog: 892 cases > 48-hour threshold",
      "EDI 835 remittance delay: ~$2.1M pending settlement",
      "Claims Adjudication Platform: degraded response times",
      "Call center ASA 57% above 30-second target",
    ],
    lastUpdated: new Date().toISOString(),
  });
});

router.get("/executive/trends", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(dailyTrendsTable)
    .orderBy(asc(dailyTrendsTable.trendDate));

  res.json({
    points: rows.map((r) => ({
      date: r.trendDate,
      claims: r.claims,
      enrollments: r.enrollments,
      priorAuths: r.priorAuths,
      availability: r.availability,
      incidents: r.incidents,
    })),
    period: "30d",
  });
});

export default router;
