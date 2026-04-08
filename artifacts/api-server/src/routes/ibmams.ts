import { Router, type IRouter } from "express";

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
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (11 - i) * 7);
    const total = 680 + Math.floor(Math.random() * 180) - i * 8;
    const resolved = Math.floor(total * (0.89 + Math.random() * 0.08));
    const automated = Math.floor(total * (0.32 + i * 0.012 + Math.random() * 0.05));
    return {
      week: `Wk ${date.toLocaleDateString("en", { month: "short", day: "2-digit" })}`,
      total: Math.max(total, 500),
      resolvedWithinSla: Math.min(resolved, total),
      automated: Math.min(automated, resolved),
    };
  });
  res.json(weeks);
});

router.get("/ibmams/automation-runbooks", async (_req, res): Promise<void> => {
  res.json([
    { runbookId: "RB-001", name: "Auto-Restart Failed Batch Jobs", category: "Batch Operations", executionsToday: 14, successRate: 100, timeSavedHours: 5.6 },
    { runbookId: "RB-002", name: "DB Connection Pool Reset", category: "Database", executionsToday: 8, successRate: 100, timeSavedHours: 4.0 },
    { runbookId: "RB-003", name: "Log Cleanup & Archival", category: "Infrastructure", executionsToday: 24, successRate: 100, timeSavedHours: 3.6 },
    { runbookId: "RB-004", name: "EDI File Retry on Timeout", category: "Integration", executionsToday: 11, successRate: 90.9, timeSavedHours: 2.75 },
    { runbookId: "RB-005", name: "App Server Cache Flush", category: "Application", executionsToday: 7, successRate: 100, timeSavedHours: 1.75 },
    { runbookId: "RB-006", name: "Certificate Renewal Automation", category: "Security", executionsToday: 3, successRate: 100, timeSavedHours: 3.0 },
    { runbookId: "RB-007", name: "Claims Queue Health Check", category: "Application", executionsToday: 22, successRate: 100, timeSavedHours: 3.3 },
    { runbookId: "RB-008", name: "User Access Provisioning", category: "Identity Management", executionsToday: 0, successRate: 100, timeSavedHours: 0 },
  ]);
});

router.get("/ibmams/savings", async (_req, res): Promise<void> => {
  const months = ["Jan", "Feb", "Mar", "Apr"];
  res.json({
    totalSavingsYtd: 3200000,
    costAvoidanceYtd: 8400000,
    automationSavings: 2100000,
    shiftLeftSavings: 800000,
    selfHealSavings: 300000,
    monthlyTrend: months.map((month, i) => ({
      month: `${month} '25`,
      savings: 720000 + i * 48000 + Math.floor(Math.random() * 50000),
      avoidance: 1900000 + i * 120000 + Math.floor(Math.random() * 100000),
    })),
  });
});

router.get("/ibmams/ai-insights", async (_req, res): Promise<void> => {
  res.json([
    {
      id: "AI-001",
      category: "Prior Authorization",
      severity: "critical",
      headline: "Prior Auth backlog 47% above historical baseline",
      detail: "Analysis of the past 30 days shows prior auth request volume increased 18.7% today. The primary driver is a spike in specialty drug (biologic) authorization requests, up 34% week-over-week. Current reviewer capacity is insufficient to maintain the 48-hour turnaround SLA.",
      recommendation: "Activate surge capacity protocol: reassign 3 clinical reviewers from non-urgent queue. Consider auto-approval for repeat biologics with clean history (eligible: ~287 cases).",
      timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      affectedArea: "Prior Authorization Operations",
    },
    {
      id: "AI-002",
      category: "Claims",
      severity: "warning",
      headline: "Auto-adjudication rate dropped 15pp — root cause identified",
      detail: "The Claims Adjudication Platform degradation is causing rules engine timeouts, forcing claims to manual review. Auto-adjudication dropped from 87% to 72% this morning, adding approximately 4,200 claims to the manual queue.",
      recommendation: "IBM AMS DB team is optimizing the query causing connection pool exhaustion. Expected resolution: 2 hours. Manual reviewer staffing increase recommended for today.",
      timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
      affectedArea: "Claims Operations",
    },
    {
      id: "AI-003",
      category: "Application Health",
      severity: "warning",
      headline: "EDI 835 delay will impact provider payment satisfaction scores",
      detail: "The delayed EDI 835 remittance files affect 312 providers expecting payment today. Based on historical patterns, delays exceeding 4 hours generate an average of 47 provider service calls and 3-5 formal complaints.",
      recommendation: "Proactively notify affected providers via portal message. IBM team has restored SFTP connectivity; backlog processing expected complete by 3:00 PM EST.",
      timestamp: new Date(Date.now() - 55 * 60000).toISOString(),
      affectedArea: "Integration / Provider Relations",
    },
    {
      id: "AI-004",
      category: "Contact Center",
      severity: "warning",
      headline: "Call volume trending toward capacity threshold",
      detail: "Current call volume and ASA trends suggest abandonment rate will exceed 10% within the next 90 minutes if staffing remains unchanged. Prior auth status calls are driving 14.7% of total volume — unusually high.",
      recommendation: "Request 8 additional agents from overflow pool. Activate IVR self-service option for prior auth status checks to deflect an estimated 22% of incoming calls.",
      timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
      affectedArea: "Contact Center Operations",
    },
    {
      id: "AI-005",
      category: "Finance",
      severity: "info",
      headline: "Premium collection rate 3.2% below April target",
      detail: "YTD premium collection is tracking at 94.8% vs 98% target. Analysis identifies 2,841 accounts with 30+ day delinquency that have not received automated outreach. Payment reminder automation would recover an estimated $4.2M.",
      recommendation: "Enable automated payment reminder workflow for 30+ day delinquent accounts. Historical conversion rate: 42% within 10 days of outreach.",
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      affectedArea: "Premium & Billing",
    },
  ]);
});

router.post("/ibmams/ask", async (req, res): Promise<void> => {
  const { question } = req.body;

  const responses: Record<string, { answer: string; sources: string[]; relatedMetrics: { label: string; value: string }[] }> = {
    "prior auth": {
      answer: "Prior auth approvals are down today primarily due to two factors: (1) A 47% spike in backlog driven by an 18.7% increase in requests — particularly biologic specialty drug authorizations up 34% week-over-week — and (2) reviewer capacity constraints with 3 reviewers reporting 90+ open cases each. The overall approval rate is 56.8% today vs 72.1% last week. Urgent requests are consuming a disproportionate share of reviewer time (218 urgent cases representing 25% of the queue but requiring 2x decision time). IBM's AI-driven triage recommendation has identified 287 repeat biologic cases eligible for expedited auto-approval based on clean authorization history.",
      sources: ["Prior Auth Operations Dashboard", "Reviewer Workload Monitor", "IBM AMS Insights Engine"],
      relatedMetrics: [{ label: "Backlog Size", value: "1,247" }, { label: "Avg Review Time", value: "31.4 hrs" }, { label: "Urgent Cases", value: "218" }],
    },
    "claims settlement": {
      answer: "Two applications are currently impacting claims settlement: (1) Claims Adjudication Platform (Sev 2 incident) — database connection pool exhaustion is causing 8.2-second average response times (SLA: 3 sec), reducing auto-adjudication from 87% to 72% and creating a ~4,200 claim manual backlog. (2) API Gateway / EDI Hub (Sev 2 incident) — EDI 835 remittance file transmission has been delayed 95 minutes, holding up $2.1M in settlement payments to 312 providers. IBM AMS teams are actively working both incidents with estimated resolution by 3:00 PM EST.",
      sources: ["Application Health Dashboard", "Active Incident Log", "EDI Interface Monitor"],
      relatedMetrics: [{ label: "Pending Settlement", value: "$2.1M" }, { label: "Auto-Adj Rate", value: "72.4%" }, { label: "Active Incidents", value: "2" }],
    },
    "claims backlog": {
      answer: "Current claims backlog by region/line of business: Commercial: 10,900 pending ($118.4M); Medicare Advantage: 5,400 pending ($87.2M); Medicaid: 4,900 pending ($22.1M); Exchange: 5,743 pending ($14.1M). Geographic distribution: Northern NJ accounts for 31% of volume. Age analysis shows 9.4% of backlog (1,782 claims) is over 31 days old — exceeding prompt pay requirements and potentially incurring interest penalties. The claims over 30 days are concentrated in complex COB (coordination of benefits) cases and high-dollar inpatient surgical claims requiring manual review.",
      sources: ["Claims Operations Dashboard", "Claims Aging Report", "Line of Business Analytics"],
      relatedMetrics: [{ label: "Total Pending", value: "18,943" }, { label: ">30 Day Claims", value: "1,782" }, { label: "Dollar Value", value: "$241.8M" }],
    },
  };

  let matched = null;
  const lq = question?.toLowerCase() || "";
  if (lq.includes("prior auth") || lq.includes("authorization")) matched = responses["prior auth"];
  else if (lq.includes("claim") && (lq.includes("impact") || lq.includes("settlement") || lq.includes("application"))) matched = responses["claims settlement"];
  else if (lq.includes("backlog") || lq.includes("region")) matched = responses["claims backlog"];

  if (matched) {
    res.json(matched);
    return;
  }

  res.json({
    answer: `Based on today's operational data: Your question about "${question}" relates to multiple areas of payer operations. The Horizon Payer Command Center is currently tracking 4.29M active members, 87,432 claims received today ($241.8M settled), 3,241 prior auth requests with a 47% backlog spike, and 2 active incidents affecting Claims Adjudication and EDI Hub systems. IBM AMS has resolved 147 tickets today at 96.8% SLA compliance, with $3.2M in YTD cost savings through automation. For specific drill-downs, please navigate to the relevant dashboard section or refine your question.`,
    sources: ["Executive Overview", "IBM AMS Value Dashboard", "Application Health Monitor"],
    relatedMetrics: [
      { label: "Active Members", value: "4.29M" },
      { label: "Claims Today", value: "87,432" },
      { label: "IBM SLA", value: "96.8%" },
    ],
  });
});

export default router;
