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

type AskResponse = {
  answer: string;
  sources: string[];
  relatedMetrics: { label: string; value: string }[];
  followUpQuestions: string[];
};

type Topic = AskResponse & { keys: string[] };

const TOPICS: Topic[] = [
  {
    // Cost savings / ROI / finance / budget — must come BEFORE general IBM AMS entry
    keys: ["cost saving", "cost avoidance", "roi", "return on investment", "cost reduction", "saving.*quarter", "saving.*month", "saving.*year", "ytd", "year to date", "automation saving", "shift.*left.*saving", "financial.*ams", "ams.*financial", "ams.*cost", "cost.*ams"],
    answer: "IBM AMS has delivered $3.2M in realized cost savings YTD (through April), against a $2.8M full-year target — running 14% ahead of schedule. Cost avoidance (incidents prevented or resolved before business impact) totals $8.4M YTD. Savings breakdown: Automation-driven ticket reduction: $2.1M; Shift-left / self-service deflection: $800K; Self-healing event prevention: $300K. Cost reduction per ticket has improved 18.7% year-over-year. Productivity gain attributed to IBM tooling and runbooks is 31.4%. At current trajectory, projected full-year savings are $4.6M realized + $12.2M avoided.",
    sources: ["IBM AMS Value Dashboard", "Cost Savings Tracker", "Finance & Billing Analytics"],
    relatedMetrics: [
      { label: "Realized Savings YTD", value: "$3.2M" },
      { label: "Cost Avoidance YTD", value: "$8.4M" },
      { label: "Projected Full-Year", value: "$4.6M" },
    ],
    followUpQuestions: [
      "Which automation runbooks are generating the most savings?",
      "How does this year's savings compare to last year?",
      "What is the ROI on the IBM AMS contract this year?",
    ],
  },
  {
    // SLA compliance — must come BEFORE general IBM AMS entry
    keys: ["sla", "service level", "sla.*compliance", "compliance.*sla", "sla.*breach", "breach.*sla", "penalty", "kpi.*compliance", "on time", "within sla", "resolution.*sla", "sla.*resolution"],
    answer: "Overall IBM AMS SLA compliance is 96.8% today, above the 95% contractual threshold. Breaking down by category: Incident Response 98.2% (P1: 100%, P2: 96.4%); Service Restoration 94.7% (just below 95% target — 3 P2 tickets exceeded the 4-hour resolution window this week); Change Success Rate 100% (24/24 changes deployed without rollback); Availability SLA 99.94% across all 47 monitored applications. No SLA breach penalties are projected for this billing period. The shift-left rate of 42.3% is contributing significantly to SLA performance by resolving issues before they escalate.",
    sources: ["SLA Compliance Dashboard", "IBM AMS Contract Tracker", "Incident Resolution Log"],
    relatedMetrics: [
      { label: "Overall SLA", value: "96.8%" },
      { label: "Availability", value: "99.94%" },
      { label: "Change Success", value: "100%" },
    ],
    followUpQuestions: [
      "Which SLA categories are closest to breach thresholds?",
      "How has SLA compliance trended over the last 6 months?",
      "What actions are in place to address the restoration SLA shortfall?",
    ],
  },
  {
    // Prior Auth
    keys: ["prior auth", "prior authorization", "preauth", "pre-auth", "authorization", "auth approval", "auth backlog", "auth turnaround", "biologic", "specialty drug"],
    answer: "Prior auth approvals are under pressure today due to two converging factors: (1) A 47% spike in backlog driven by an 18.7% rise in total requests — biologic specialty drug authorizations are up 34% week-over-week and account for 31% of all pending cases. (2) Reviewer capacity constraints: 3 of 12 reviewers have 90+ open cases each, pushing the average review time to 31.4 hours against a 24-hour clinical SLA. The overall approval rate has dropped to 56.8% today vs. 72.1% last week. IBM AMS has flagged 287 repeat biologic cases with clean authorization history as candidates for expedited auto-approval — actioning these would reduce the urgent queue by ~35% within 4 hours.",
    sources: ["Prior Auth Operations Dashboard", "Reviewer Workload Monitor", "IBM AMS Insights Engine"],
    relatedMetrics: [
      { label: "Backlog Size", value: "1,247" },
      { label: "Avg Review Time", value: "31.4 hrs" },
      { label: "Urgent Cases", value: "218" },
    ],
    followUpQuestions: [
      "Which reviewers have the highest caseloads right now?",
      "What procedure types are driving the authorization backlog?",
      "How does today's approval rate compare to last month?",
    ],
  },
  {
    // Claims – application / settlement impact
    keys: ["application.*claim", "claim.*application", "settlement", "impacting claim", "claims impact", "adjudication platform", "edi.*claim", "claim.*edi"],
    answer: "Two active Sev 2 incidents are impacting claims settlement: (1) Claims Adjudication Platform — database connection pool exhaustion is causing 8.2-second average response times against a 3-second SLA. Auto-adjudication has dropped from 87% to 72.4%, creating an estimated 4,200-claim manual overflow. IBM AMS has engaged DBA support and a connection pool resize is in progress, ETA 90 minutes. (2) EDI Hub / API Gateway — EDI 835 remittance transmission has been delayed 95 minutes, holding up $2.1M in settlement payments to 312 providers across the Northeast region. A fix deployment is staged and awaiting change approval.",
    sources: ["Application Health Dashboard", "Active Incident Log", "EDI Interface Monitor"],
    relatedMetrics: [
      { label: "Pending Settlement", value: "$2.1M" },
      { label: "Auto-Adj Rate", value: "72.4%" },
      { label: "Active Incidents", value: "2" },
    ],
    followUpQuestions: [
      "What is the expected resolution time for the EDI incident?",
      "Which providers are most affected by the remittance delay?",
      "How many claims have been manually rerouted so far?",
    ],
  },
  {
    // Claims backlog / volume / region / LOB — broad \bclaim catch-all at end for "what's going on with claims?" type queries
    keys: ["claim backlog", "claims backlog", "backlog", "pending claim", "claims pending", "claims volume", "claims today", "claim.*region", "line of business", "lob", "commercial claim", "medicare claim", "medicaid claim", "exchange claim", "claim.*aging", "aging.*claim", "30 day", "prompt pay", "\\bclaim"],
    answer: "Today's claims backlog by line of business: Commercial 10,900 pending ($118.4M); Medicare Advantage 5,400 pending ($87.2M); Medicaid 4,900 pending ($22.1M); Exchange/ACA 5,743 pending ($14.1M). Total: 26,943 claims pending, $241.8M in dollar value. Age analysis shows 6.6% (1,782 claims) are over 30 days old — these are at prompt-pay risk and concentrated in high-dollar inpatient surgical and complex COB cases. Auto-adjudication is running at 72.4% today (down from 87% baseline) due to the active Adjudication Platform incident. 87,432 new claims were received today.",
    sources: ["Claims Operations Dashboard", "Claims Aging Report", "Line of Business Analytics"],
    relatedMetrics: [
      { label: "Total Pending", value: "26,943" },
      { label: ">30 Day Claims", value: "1,782" },
      { label: "Dollar Value", value: "$241.8M" },
    ],
    followUpQuestions: [
      "Which claim denial reasons are most common this week?",
      "What is the auto-adjudication rate by line of business?",
      "How does the current backlog compare to last quarter?",
    ],
  },
  {
    // IBM AMS service desk / tickets / SLA / runbooks
    keys: ["ibm ams", "ibm", "ams", "service desk", "ticket", "resolved ticket", "runbook", "automation", "shift left", "self.heal", "self heal", "productivity", "knowledge article", "incident.*ams", "ams.*incident", "ams performance", "ams metric", "ams kpi"],
    answer: "IBM AMS is performing ahead of contract targets today. 147 tickets have been resolved with a 96.8% SLA compliance rate (+1.4% vs yesterday). The shift-left rate — tickets resolved without escalation — is 42.3%, the highest this quarter. 89 automation runbooks executed today, saving an estimated 213 engineer-hours. 24 self-healing events fired automatically with no human intervention required. Knowledge article utilization stands at 1,247 articles accessed, reducing repeat contacts by 67.3%. Change velocity is 24 changes deployed this week against a planned 20, all with zero rollbacks.",
    sources: ["IBM AMS Value Dashboard", "Service Desk Analytics", "Automation Runbook Tracker"],
    relatedMetrics: [
      { label: "Tickets Resolved", value: "147" },
      { label: "SLA Compliance", value: "96.8%" },
      { label: "Shift-Left Rate", value: "42.3%" },
    ],
    followUpQuestions: [
      "Which automation runbooks are saving the most time?",
      "What is the IBM AMS cost savings breakdown this month?",
      "How has SLA compliance trended over the past 30 days?",
    ],
  },
  {
    // Application health / incidents / uptime
    keys: ["application health", "app health", "system health", "uptime", "downtime", "incident", "outage", "degraded", "performance issue", "response time", "availability", "sev 1", "sev 2", "severity", "critical system", "platform.*issue", "issue.*platform"],
    answer: "Current application health across 47 monitored systems: 43 healthy (green), 2 degraded (yellow), 2 active Sev 2 incidents (red). The two red systems are Claims Adjudication Platform (8.2s response time vs 3s SLA, due to DB connection pool exhaustion) and EDI Hub (95-minute transmission delay on 835 files). No Sev 1 outages are active. Mean Time to Detect (MTTD) this month is 4.2 minutes; Mean Time to Resolve (MTTR) is 47 minutes, both ahead of contract thresholds. IBM AMS NOC has 6 engineers actively working the two open incidents.",
    sources: ["Application Health Monitor", "Active Incident Log", "IBM AMS NOC Dashboard"],
    relatedMetrics: [
      { label: "Systems Healthy", value: "43 / 47" },
      { label: "Active Incidents", value: "2 (Sev 2)" },
      { label: "Avg MTTR", value: "47 min" },
    ],
    followUpQuestions: [
      "What caused the Claims Adjudication Platform degradation?",
      "Which applications have the most incidents this month?",
      "What is the full list of systems currently monitored?",
    ],
  },
  {
    // Member experience / call center / contact center
    keys: ["member", "call center", "contact center", "member service", "member experience", "csat", "satisfaction", "wait time", "hold time", "abandon", "fcr", "first call", "ivr", "call volume", "call reason", "grievance", "complaint"],
    answer: "Member services is handling elevated call volume today: 14,832 calls received vs a daily average of 11,200. Average handle time is 6.8 minutes (+0.4 min vs target). Wait time is 4.2 minutes (SLA: 5 minutes — within threshold). First Call Resolution is 71.4%, slightly below the 75% target. Top call driver is claim status inquiries at 38% of volume, driven by the EDI remittance delay affecting provider payment notifications. CSAT score is 3.8/5.0. IBM AMS's IVR deflection automation is handling 23% of calls without agent transfer, saving approximately 3,412 agent-minutes today.",
    sources: ["Contact Center Dashboard", "Member Experience Monitor", "IVR Analytics"],
    relatedMetrics: [
      { label: "Calls Today", value: "14,832" },
      { label: "Avg Wait Time", value: "4.2 min" },
      { label: "FCR Rate", value: "71.4%" },
    ],
    followUpQuestions: [
      "What are the top reasons members are calling today?",
      "How is IVR deflection performing compared to last month?",
      "Which member segments have the lowest satisfaction scores?",
    ],
  },
  {
    // Provider network / credentialing / provider issues
    keys: ["provider", "network", "credentialing", "credential", "provider issue", "provider network", "out of network", "in-network", "provider portal", "provider.*payment", "payment.*provider", "provider.*claim", "claim.*provider", "835", "remittance", "provider.*satisfaction"],
    answer: "Provider network status: 98,412 active in-network providers across 6 regions. 312 providers are currently experiencing delayed remittance payments due to the EDI 835 transmission incident — $2.1M in settlements are queued. Top provider service issues: (1) Portal login failures affecting 847 providers (IBM AMS ticket open, ETA 2 hours); (2) Credentialing backlog at 1,247 pending applications with average processing time of 23 days (SLA: 21 days). Provider satisfaction score is 3.9/5.0. IBM AMS manages provider data integration across 14 payer-provider EDI interfaces.",
    sources: ["Provider Operations Dashboard", "EDI Interface Monitor", "Provider Relations Tracker"],
    relatedMetrics: [
      { label: "Active Providers", value: "98,412" },
      { label: "Payment Delayed", value: "312 providers" },
      { label: "Credentialing Backlog", value: "1,247" },
    ],
    followUpQuestions: [
      "Which providers have the highest claim denial rates?",
      "When will the remittance payment delay be resolved?",
      "How many providers are at risk of dropping out of network?",
    ],
  },
  {
    // EDI / interfaces / batch jobs / data feeds
    keys: ["edi", "interface", "batch", "batch job", "data feed", "834", "837", "835", "270", "271", "eligibility", "enrollment.*feed", "feed.*enrollment", "file.*transmission", "transmission", "inbound", "outbound", "interface.*health", "middleware"],
    answer: "EDI and interface health: 14 of 16 active interfaces are processing normally. Two interfaces are degraded: (1) EDI 835 Remittance (outbound to providers) — 95-minute delay, 312 files queued, IBM AMS is in active resolution. (2) EDI 834 Enrollment Feed from CMS — 2 files failed validation today due to schema mismatch; IBM AMS has reprocessed 1 of 2, the second is in manual review. Today's batch processing summary: 89 batch jobs completed, 2 failed (834 validation), 0 running late. Inbound 837 claim files: 42,187 received, 41,994 processed (99.5% success rate). Eligibility 270/271 transactions: 28,441 completed at 99.8% success.",
    sources: ["EDI Interface Monitor", "Batch Operations Dashboard", "IBM AMS Integration Layer"],
    relatedMetrics: [
      { label: "Interfaces Healthy", value: "14 / 16" },
      { label: "Batch Jobs Today", value: "89 completed" },
      { label: "837 Success Rate", value: "99.5%" },
    ],
    followUpQuestions: [
      "Which EDI partners are most affected by the 835 delay?",
      "What caused the 834 enrollment feed failures today?",
      "How many batch jobs are scheduled to run tonight?",
    ],
  },
];

function matchTopic(lq: string): Topic | null {
  for (const topic of TOPICS) {
    for (const key of topic.keys) {
      if (new RegExp(key, "i").test(lq)) return topic;
    }
  }
  return null;
}

function topicToResponse(topic: Topic): AskResponse {
  const { keys: _omitted, ...response } = topic;
  return response;
}

router.post("/ibmams/ask", async (req, res): Promise<void> => {
  const { question } = req.body;
  const lq = (question ?? "").toLowerCase();

  const matched = matchTopic(lq);

  if (matched) {
    res.json(topicToResponse(matched));
    return;
  }

  res.json({
    answer: "Based on today's operational data across Horizon Payer systems: 4.29M active members are enrolled, 87,432 claims were received today ($241.8M processed), prior auth backlog stands at 1,247 cases with a 56.8% approval rate, and 2 active Sev 2 incidents are impacting the Claims Adjudication Platform and EDI Hub. IBM AMS has resolved 147 tickets today at 96.8% SLA compliance, executed 89 automation runbooks saving ~213 engineer-hours, and delivered $3.2M in realized cost savings YTD. All other monitored systems (43 of 47) are healthy. Try asking about a specific domain — for example, prior auth, claims backlog, application health, SLA compliance, cost savings, providers, or EDI interfaces.",
    sources: ["Executive Overview", "IBM AMS Value Dashboard", "Application Health Monitor"],
    relatedMetrics: [
      { label: "Active Members", value: "4.29M" },
      { label: "Claims Today", value: "87,432" },
      { label: "IBM SLA", value: "96.8%" },
    ],
    followUpQuestions: [
      "What is the current claims backlog by line of business?",
      "How are IBM AMS cost savings tracking this quarter?",
      "Which applications are experiencing incidents right now?",
    ],
  });
});

export default router;
