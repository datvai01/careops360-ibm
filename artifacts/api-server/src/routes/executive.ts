import { Router, type IRouter } from "express";

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
  res.json([
    {
      id: "ALT-001",
      severity: "critical",
      category: "Prior Authorization",
      title: "Prior Auth Backlog Spike Detected",
      description: "Prior auth backlog increased 47% in the last 2 hours. 892 requests pending review exceeding 48-hour SLA threshold.",
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      status: "active",
      impactedSystem: "Prior Authorization Workflow",
      drillDownPath: "/dashboard/prior-auth",
    },
    {
      id: "ALT-002",
      severity: "high",
      category: "Application Health",
      title: "Claims Adjudication Platform - Degraded Performance",
      description: "Claims Adjudication Platform response time averaging 8.2 seconds (SLA: 3 sec). Auto-adjudication rate dropped from 87% to 72%.",
      timestamp: new Date(Date.now() - 52 * 60000).toISOString(),
      status: "acknowledged",
      impactedSystem: "Claims Adjudication Platform",
      drillDownPath: "/dashboard/app-health",
    },
    {
      id: "ALT-003",
      severity: "high",
      category: "Claims",
      title: "Claims Settlement Delay - EDI 835 Interface",
      description: "EDI 835 remittance file transmission delayed by 3.5 hours. 14,200 claim settlements pending. Estimated $2.1M payment delay.",
      timestamp: new Date(Date.now() - 95 * 60000).toISOString(),
      status: "in_progress",
      impactedSystem: "EDI Hub / Claims Settlement",
      drillDownPath: "/dashboard/claims",
    },
    {
      id: "ALT-004",
      severity: "medium",
      category: "Contact Center",
      title: "Call Center Wait Times Above Threshold",
      description: "Average speed to answer reached 47 seconds (threshold: 30 sec). Abandonment rate at 8.2%.",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      status: "active",
      impactedSystem: "CRM / Contact Center",
      drillDownPath: "/dashboard/contact-center",
    },
  ]);
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
  const points = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const baseEnrollments = 1600 + Math.floor(Math.random() * 500);
    const baseClaims = 84000 + Math.floor(Math.random() * 8000);
    const basePriorAuths = 2800 + Math.floor(Math.random() * 700);
    return {
      date: date.toISOString().split("T")[0],
      claims: baseClaims,
      enrollments: baseEnrollments,
      priorAuths: basePriorAuths,
      availability: 99.1 + Math.random() * 0.8,
      incidents: Math.floor(Math.random() * 5),
    };
  });

  res.json({ points, period: "30d" });
});

export default router;
