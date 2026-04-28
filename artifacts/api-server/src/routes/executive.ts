import { Router, type IRouter } from "express";
import { db, executiveAlertsTable, dailyTrendsTable } from "@workspace/db";
import { asc } from "drizzle-orm";
import { fetchPageKpis } from "../lib/kpiHelper";

const router: IRouter = Router();

type Period = "24h" | "7d" | "14d";

function parsePeriod(raw: unknown): Period {
  if (raw === "7d" || raw === "14d") return raw;
  return "24h";
}

function compareLabel(p: Period) {
  if (p === "7d")  return "vs 7 days ago";
  if (p === "14d") return "vs 14 days ago";
  return "vs yesterday";
}

function periodDays(p: Period): number {
  if (p === "7d") return 7;
  if (p === "14d") return 14;
  return 1;
}

router.get("/executive/kpis", async (req, res): Promise<void> => {
  const period = parsePeriod(req.query.period);
  const kpis = await fetchPageKpis("executive", compareLabel(period));
  res.json(kpis);
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

router.get("/executive/trends", async (req, res): Promise<void> => {
  const period = parsePeriod(req.query.period);
  const limit = periodDays(period);

  const rows = await db
    .select()
    .from(dailyTrendsTable)
    .orderBy(asc(dailyTrendsTable.trendDate));

  const slice = rows.slice(-limit);

  res.json({
    points: slice.map((r) => ({
      date: r.trendDate,
      claims: r.claims,
      enrollments: r.enrollments,
      priorAuths: r.priorAuths,
      availability: r.availability,
      incidents: r.incidents,
    })),
    period,
    totalDays: limit,
  });
});

export default router;
