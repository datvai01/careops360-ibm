import { useQuery } from "@tanstack/react-query";
import { useGetTicketTrends, useGetAutomationRunbooks, useGetCostSavings, useGetAiInsights } from "@workspace/api-client-react";
import type { IbmAmsKpis } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CpuIcon, ArrowRightIcon, ZapIcon, LightbulbIcon, ShieldCheckIcon, InfoIcon,
  ArrowUpIcon, ArrowDownIcon, MinusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip as UiTooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { KpiMetric } from "@workspace/api-client-react";

const IBM_BLUE = "#0f62fe";
const TEAL     = "#009d9a";
const GREEN    = "#24a148";

type IbmPeriod = "30d";

const IBM_PERIOD_OPTIONS = [
  { value: "30d" as IbmPeriod, label: "Last 30 Days (Monthly)", shortLabel: "30D" },
];

const AUTOMATION_PCT  = 2100000 / 3200000;
const SHIFTLEFT_PCT   = 800000  / 3200000;
const SELFHEAL_PCT    = 300000  / 3200000;

function fmt$(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000)     return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

type MethodologyTopic = "shiftLeft" | "selfHeal" | "runbooks" | "defectLeakage" | "costReduction";

const METHODOLOGY: Record<MethodologyTopic, {
  title: string;
  color: string;
  formula: string;
  components: { label: string; detail: string }[];
  target?: string;
  source: string;
  note: string;
}> = {
  shiftLeft: {
    title: "Shift-Left Rate — Calculation Methodology",
    color: TEAL,
    formula: "(Tier-0 Resolutions + IVR Deflections + Self-Service Closures) ÷ Total Incidents × 100",
    components: [
      {
        label: "Tier-0 Resolutions",
        detail: "Incidents closed automatically via knowledge-base match or runbook deflection at intake — before any human agent contact.",
      },
      {
        label: "IVR Deflections",
        detail: "Member / end-user contacts resolved within the IVR / self-service portal without transfer to a live agent.",
      },
      {
        label: "Self-Service Closures",
        detail: "Tickets raised by users that were resolved through guided self-service workflows without engineer involvement.",
      },
    ],
    target: "≥ 40% (contractual SLA threshold)",
    source: "IBM AMS Ticket Routing Engine · Pre-AMS manual-baseline comparison",
    note: "Deflection volume is measured against a frozen pre-AMS ticket-routing baseline established in Q4 2024. Any ticket routed to a human agent after a self-service attempt does NOT count as shift-left.",
  },
  selfHeal: {
    title: "Self-Heal Events — Calculation Methodology",
    color: GREEN,
    formula: "Count of events where: Alert Fired → Runbook Auto-Triggered → Condition Resolved → No Incident Created",
    components: [
      {
        label: "Detection (Alert Fired)",
        detail: "IBM AIOps Event Management detects an anomaly via metric threshold, log pattern, or topology correlation — within 4.2 minutes on average.",
      },
      {
        label: "Automated Remediation",
        detail: "A pre-approved runbook is triggered automatically (zero human approval required) and executes the remediation sequence.",
      },
      {
        label: "Outcome Validation",
        detail: "The system confirms the condition is cleared: metric returns to baseline, health-check passes, no further alerts within 15 minutes.",
      },
      {
        label: "Incident Prevention",
        detail: "No P1, P2, or P3 incident is created. If an incident is created before the runbook closes the event, the event does NOT qualify as self-heal.",
      },
    ],
    target: "No floor target — each event represents a prevented P2 incident (avg. cost: $12,500)",
    source: "IBM AIOps Event Management Audit Log · Runbook Execution Records",
    note: "Events must resolve within 15 minutes of first signal. Events where a human engineer is paged — even if they do not act — are excluded.",
  },
  runbooks: {
    title: "Automation Runbooks — Calculation Methodology",
    color: IBM_BLUE,
    formula: "Σ(Runbooks where exit_status = SUCCESS and outcome_validation = PASS) for the selected period",
    components: [
      {
        label: "Infrastructure Recovery (42%)",
        detail: "Automated restarts, failover triggers, pod reschedules, and connection pool resets across cloud and on-prem infrastructure.",
      },
      {
        label: "DB Maintenance (22%)",
        detail: "Index rebuilds, statistics refreshes, log rotation, archival jobs, and query-plan cache purges executed on schedule or on alert.",
      },
      {
        label: "Certificate & Access Rotation (18%)",
        detail: "SSL certificate renewals, API key rotations, and service-account credential cycling performed without manual intervention.",
      },
      {
        label: "Compliance Scanning (18%)",
        detail: "HIPAA / SOC 2 configuration scans, patch-status audits, and vulnerability assessments triggered by policy schedule.",
      },
    ],
    target: "Each successful execution replaces an average of 2.4 engineer-hours of manual work",
    source: "IBM AMS Runbook Orchestration Platform · Execution Audit Trail",
    note: "A runbook is counted only once per execution event regardless of how many sub-tasks it performs. Partial completions (exit_status = PARTIAL) are tracked separately and not included in this KPI.",
  },
  defectLeakage: {
    title: "Defect Leakage — Calculation Methodology",
    color: "#ee5396",
    formula: "(Production-Origin Defects ÷ Total Defects Closed in Period) × 100",
    components: [
      {
        label: "Production-Origin Defects",
        detail: "Defects tagged 'Environment: Production' in the IBM DevOps toolchain — meaning they were first discovered by end-users or monitoring in the live environment.",
      },
      {
        label: "Total Defects Closed",
        detail: "All defects closed (resolved + verified) across all environments (Dev, Staging, Production) during the period.",
      },
      {
        label: "Shift-Left Quality Gates",
        detail: "Automated unit, integration, and contract tests enforced via CI pipeline. A failing gate blocks promotion to the next environment, preventing defects from propagating.",
      },
    ],
    target: "< 5% (industry SLA) — current 2.4% exceeds target",
    source: "IBM DevOps Toolchain · Defect Tracking System · CI/CD Pipeline Reports",
    note: "Lower is better. A declining trend indicates improved upstream test coverage. Security-classified defects are counted but detail is withheld from this dashboard per HIPAA data-handling policy.",
  },
  costReduction: {
    title: "YTD Cost Reduction — Calculation Methodology",
    color: IBM_BLUE,
    formula: "Automation Offset + Shift-Left Deflection Savings + Self-Heal Event Prevention",
    components: [
      {
        label: "Automation Offset — $2,100,000",
        detail: "Δ Automated Tickets × Avg. Fully-Loaded Cost per Ticket ($142) × Months Elapsed. Tickets resolved via runbook automation compared to manual baseline. Loaded labor rate includes engineer time, tooling overhead, and management allocation.",
      },
      {
        label: "Shift-Left Deflection Savings — $800,000",
        detail: "Deflected Tickets (self-service / Tier 0) × Avg. Tier-1 Ticket Cost ($68). Cases resolved at self-service tier before reaching a human agent. Deflection volume measured against pre-AMS routing baseline.",
      },
      {
        label: "Self-Heal Event Prevention — $300,000",
        detail: "Self-Heal Events × Avg. P2 Incident Cost ($12,500) × Prevention Rate (96%). Automated remediation events that resolved conditions before escalation to a reportable P2/P3 incident.",
      },
    ],
    target: "$2.8M full-year target — currently 14% ahead of schedule",
    source: "IBM AMS Value Dashboard · Finance & Billing Analytics",
    note: "Cost avoidance ($8.4M YTD) is tracked separately and represents incidents prevented before business impact. It is not included in the realized cost reduction figure above.",
  },
};

function MethodologyModal({ topic, onClose }: { topic: MethodologyTopic; onClose: () => void }) {
  const m = METHODOLOGY[topic];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
      <div
        className="relative bg-background border border-border rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: IBM_BLUE }}>
              <span className="text-white text-[9px] font-black">IBM</span>
            </div>
            <h2 className="text-sm font-semibold">{m.title}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 font-mono text-xs leading-relaxed">
            <p className="text-muted-foreground mb-1 font-sans font-semibold text-[11px] uppercase tracking-wide">Formula</p>
            <p style={{ color: m.color }} className="font-semibold">{m.formula}</p>
          </div>

          <div className="space-y-2.5">
            {m.components.map(c => (
              <div key={c.label} className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold mb-1" style={{ color: m.color }}>{c.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>

          {m.target && (
            <div className="rounded-lg px-4 py-2.5 flex items-center gap-2 border" style={{ background: `${m.color}10`, borderColor: `${m.color}30` }}>
              <span className="text-xs font-semibold" style={{ color: m.color }}>Target:</span>
              <span className="text-xs">{m.target}</span>
            </div>
          )}

          <div className="rounded-lg bg-muted/30 border border-border px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Data Source</p>
            <p className="text-xs text-muted-foreground">{m.source}</p>
          </div>

          <p className="text-[10px] text-muted-foreground/60 italic leading-relaxed">{m.note}</p>
        </div>
      </div>
    </div>
  );
}

function KpiCardIbm({
  title,
  metric,
  isLoading,
  icon,
  onInfo,
}: {
  title: string;
  metric?: KpiMetric;
  isLoading?: boolean;
  icon?: React.ReactNode;
  onInfo?: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex items-center gap-1.5">
          {onInfo && (
            <button
              onClick={onInfo}
              className="text-muted-foreground/40 hover:text-primary transition-colors"
              title="View methodology"
            >
              <InfoIcon className="h-3.5 w-3.5" />
            </button>
          )}
          {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : metric ? (
          <>
            <div className="text-2xl font-bold">{metric.formatted}</div>
            {metric.change !== undefined && (
              <div className="flex items-center mt-1 text-xs">
                {metric.trend === "up" && (
                  <ArrowUpIcon className={cn("mr-1 h-3 w-3", metric.status === "green" ? "text-status-green" : metric.status === "red" ? "text-status-red" : "text-status-yellow")} />
                )}
                {metric.trend === "down" && (
                  <ArrowDownIcon className={cn("mr-1 h-3 w-3", metric.status === "green" ? "text-status-green" : metric.status === "red" ? "text-status-red" : "text-status-yellow")} />
                )}
                {metric.trend === "flat" && (
                  <MinusIcon className="mr-1 h-3 w-3 text-muted-foreground" />
                )}
                <span className={cn(
                  "font-medium",
                  metric.status === "green" ? "text-status-green" : metric.status === "red" ? "text-status-red" : metric.status === "yellow" ? "text-status-yellow" : "text-muted-foreground",
                )}>
                  {Math.abs(metric.change)}% {metric.changeLabel}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="text-2xl font-bold">-</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function IbmAms() {
  const [ibmPeriod, setIbmPeriod] = useState<IbmPeriod>("7d");
  const periodOption = IBM_PERIOD_OPTIONS.find(o => o.value === ibmPeriod) ?? IBM_PERIOD_OPTIONS[0];

  const { data: kpis, isLoading: isKpisLoading } = useQuery<IbmAmsKpis>({
    queryKey: ["/api/ibmams/kpis", ibmPeriod],
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api/ibmams/kpis?period=${ibmPeriod}`, { signal });
      return res.json();
    },
    refetchInterval: 30000,
  });
  const { data: trends, isLoading: isTrendsLoading } = useGetTicketTrends(
    { period: ibmPeriod },
    { query: { refetchInterval: 30000 } }
  );
  const { data: runbooks, isLoading: isRunbooksLoading } = useGetAutomationRunbooks();
  const { data: savings, isLoading: isSavingsLoading } = useGetCostSavings();
  const { data: insights, isLoading: isInsightsLoading } = useGetAiInsights();

  const [showMethodology, setShowMethodology] = useState<MethodologyTopic | null>(null);

  const breakdownData = savings?.monthlyTrend?.map(m => ({
    month: m.month,
    automation: Math.round(m.savings * AUTOMATION_PCT),
    shiftLeft:  Math.round(m.savings * SHIFTLEFT_PCT),
    selfHeal:   Math.round(m.savings * SELFHEAL_PCT),
    avoidance:  m.avoidance,
  })) ?? [];

  const ytdTotal    = savings?.totalSavingsYtd ?? 0;
  const ytdAvoidance = savings?.costAvoidanceYtd ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 bg-primary/5 p-5 rounded-xl border border-primary/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CpuIcon className="text-primary w-6 h-6" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Going Beyond Traditional IT Service Levels</h1>
          </div>
          <p className="text-sm text-muted-foreground">IBM commits to Horizon&rsquo;s business KPIs alongside critical service levels &middot; CY2026 &middot; Horizon BCBS</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-shrink-0">
          {/* Reporting period — fixed at monthly cadence */}
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 rounded-lg px-3 py-1.5" title="Reporting period: Last 30 Days">
            <span className="text-[10px] uppercase tracking-wide font-bold text-primary/70">Period</span>
            <span className="text-xs font-bold text-primary">Last 30 Days &middot; Monthly</span>
          </div>

          {/* YTD totals */}
          <div className="flex gap-6 items-start">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mb-0.5">
                YTD Cost Reduction
                <button
                  onClick={() => setShowMethodology("costReduction")}
                  className="ml-0.5 text-muted-foreground/50 hover:text-primary transition-colors"
                  title="View calculation methodology"
                >
                  <InfoIcon className="h-3 w-3" />
                </button>
              </div>
              <div className="text-3xl font-black text-status-green">{fmt$(ytdTotal)}</div>
              <div className="text-xs text-muted-foreground/60 mt-0.5">realized savings</div>
            </div>
            <div className="text-right border-l border-border pl-6">
              <div className="text-xs text-muted-foreground mb-0.5">YTD Cost Avoidance</div>
              <div className="text-3xl font-black" style={{ color: IBM_BLUE }}>{fmt$(ytdAvoidance)}</div>
              <div className="text-xs text-muted-foreground/60 mt-0.5">incidents prevented</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl">
          <TabsTrigger value="performance" className="text-xs sm:text-sm">
            <ZapIcon className="w-3.5 h-3.5 mr-1.5" />
            Performance &amp; Cost
          </TabsTrigger>
          <TabsTrigger value="automation" className="text-xs sm:text-sm">
            <CpuIcon className="w-3.5 h-3.5 mr-1.5" />
            Automation &amp; Insights
          </TabsTrigger>
          <TabsTrigger value="kpis" className="text-xs sm:text-sm">
            <ShieldCheckIcon className="w-3.5 h-3.5 mr-1.5" />
            Service Levels &amp; KPIs
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Performance & Cost ────────────────────────────────────── */}
        <TabsContent value="performance" className="space-y-6 mt-0">
      {/* KPI row — all 4 with methodology info buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCardIbm
          title="Shift-Left Rate"
          metric={kpis?.shiftLeftRate}
          isLoading={isKpisLoading}
          icon={<ArrowRightIcon />}
          onInfo={() => setShowMethodology("shiftLeft")}
        />
        <KpiCardIbm
          title="Self-Heal Events"
          metric={kpis?.selfHealEvents}
          isLoading={isKpisLoading}
          icon={<ShieldCheckIcon />}
          onInfo={() => setShowMethodology("selfHeal")}
        />
        <KpiCardIbm
          title="Automation Runbooks"
          metric={kpis?.automationRunbooks}
          isLoading={isKpisLoading}
          icon={<ZapIcon />}
          onInfo={() => setShowMethodology("runbooks")}
        />
        <KpiCardIbm
          title="Defect Leakage"
          metric={kpis?.defectLeakage}
          isLoading={isKpisLoading}
          icon={<ShieldCheckIcon />}
          onInfo={() => setShowMethodology("defectLeakage")}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1 — Ticket & Automation Trend */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Ticket Resolution &amp; Automation Trend</CardTitle>
                <CardDescription>Rising automation rate correlates with faster resolution and higher SLA · {periodOption.label}</CardDescription>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                {periodOption.shortLabel}
              </span>
            </div>
          </CardHeader>
          <CardContent className="h-80">
            {isTrendsLoading ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Loading chart…</div>
            ) : trends ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trends} margin={{ top: 16, right: 20, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="total"     name="Total Tickets"         fill="hsl(var(--muted))" radius={[3,3,0,0]} />
                  <Bar yAxisId="left" dataKey="automated" name="Automated Resolution"  fill={IBM_BLUE}          radius={[3,3,0,0]} />
                  <Line yAxisId="right" type="monotone" dataKey="resolvedWithinSla" name="SLA %" stroke={GREEN} strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        {/* Chart 2 — Monthly Cost Reduction Breakdown */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Monthly Cost Reduction Breakdown</CardTitle>
            <CardDescription>
              Realized savings attributed by driver — Automation, Shift-Left, and Self-Heal · excludes cost avoidance
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isSavingsLoading ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Loading chart…</div>
            ) : breakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} margin={{ top: 16, right: 20, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                    formatter={(value: number, name: string) => [fmt$(value), name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="automation" name="Automation Offset"     stackId="a" fill={IBM_BLUE} radius={[0,0,0,0]} />
                  <Bar dataKey="shiftLeft"  name="Shift-Left Deflection" stackId="a" fill={TEAL}     radius={[0,0,0,0]} />
                  <Bar dataKey="selfHeal"   name="Self-Heal Prevention"  stackId="a" fill={GREEN}    radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
          <div className="px-6 pb-4">
            <div className="rounded-lg bg-muted/40 border border-border px-4 py-2.5 flex flex-wrap gap-x-6 gap-y-1 text-xs">
              {[
                { label: "Automation Offset",    value: fmt$(savings?.automationSavings ?? 0), color: IBM_BLUE, topic: "runbooks"      as MethodologyTopic },
                { label: "Shift-Left Deflection", value: fmt$(savings?.shiftLeftSavings  ?? 0), color: TEAL,    topic: "shiftLeft"     as MethodologyTopic },
                { label: "Self-Heal Prevention",  value: fmt$(savings?.selfHealSavings   ?? 0), color: GREEN,   topic: "selfHeal"      as MethodologyTopic },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-semibold">{item.value} YTD</span>
                </div>
              ))}
              <button onClick={() => setShowMethodology("costReduction")} className="ml-auto text-[#0f62fe] hover:underline flex items-center gap-0.5">
                <InfoIcon className="h-3 w-3" /> Methodology
              </button>
            </div>
          </div>
        </Card>
      </div>
        </TabsContent>

        {/* ── Tab 2: Automation & Insights ─────────────────────────────────── */}
        <TabsContent value="automation" className="space-y-6 mt-0">
      {/* Runbooks + Insights row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Active Automation Runbooks</CardTitle>
                <CardDescription>High-impact automations driving zero-touch operations</CardDescription>
              </div>
              <button
                onClick={() => setShowMethodology("runbooks")}
                className="text-muted-foreground/40 hover:text-primary transition-colors mt-0.5"
                title="View runbook counting methodology"
              >
                <InfoIcon className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Runbook</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Daily Executions</TableHead>
                    <TableHead className="text-right">Success Rate</TableHead>
                    <TableHead className="text-right">Hours Saved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isRunbooksLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Loading runbooks…</TableCell>
                    </TableRow>
                  ) : runbooks ? (
                    runbooks.map(rb => (
                      <TableRow key={rb.runbookId}>
                        <TableCell className="font-medium">{rb.name}</TableCell>
                        <TableCell>{rb.category}</TableCell>
                        <TableCell className="text-right">{rb.executionsToday.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium text-status-green">{rb.successRate}%</TableCell>
                        <TableCell className="text-right font-bold">{rb.timeSavedHours}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">No runbooks active.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-primary/20 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <LightbulbIcon className="w-4 h-4" />
              <span className="text-sm">IBM AIOps Insights</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isInsightsLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading insights…</div>
            ) : insights ? (
              insights.map(insight => (
                <div key={insight.id} className="bg-card p-3.5 rounded-lg border shadow-sm space-y-1.5">
                  <div className="font-semibold text-xs leading-tight">{insight.headline}</div>
                  <p className="text-xs text-muted-foreground">{insight.detail}</p>
                  <div className="bg-primary/10 text-primary text-xs p-2 rounded border border-primary/20">
                    <span className="font-bold">Recommendation:</span> {insight.recommendation}
                  </div>
                </div>
              ))
            ) : null}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full text-primary border-primary/30 hover:bg-primary/10 text-sm">
              View All AIOps Telemetry
            </Button>
          </CardFooter>
        </Card>
      </div>

        </TabsContent>

        {/* ── Tab 3: Service Levels & Business KPIs ────────────────────────── */}
        <TabsContent value="kpis" className="mt-0">
          <ServiceLevelAndKpiPanel />
        </TabsContent>
      </Tabs>

      {showMethodology && (
        <MethodologyModal topic={showMethodology} onClose={() => setShowMethodology(null)} />
      )}
    </div>
  );
}

// ─── Critical Service Levels & Business KPIs ──────────────────────────────────
// Modeled on IBM's "Going Beyond Traditional IT Service Levels" framework.
// CSLs are the technical/delivery commitments; KPIs are the business outcomes
// that IBM commits to deliver alongside Horizon's operations teams.

type ServiceMetric = {
  name: string;
  target: string;
  actual: string;
  status: "green" | "amber" | "red";
  description: string;
  measurement: string;
};

const CRITICAL_SERVICE_LEVELS: ServiceMetric[] = [
  {
    name: "Incident Response (P1)", target: "≤ 15 min", actual: "11 min", status: "green",
    description: "Time from a Severity-1 incident being raised to an IBM responder acknowledging and beginning triage. Drives perception of operational discipline for member-impacting outages.",
    measurement: "Mean acknowledgement time across all P1 tickets in the reporting period (ServiceNow + IBM AIOps event log).",
  },
  {
    name: "Incident Resolution (P1)", target: "≤ 4 hrs", actual: "3.2 hrs", status: "green",
    description: "End-to-end clock from P1 incident creation to verified service restoration. Direct measure of how fast IBM restores claims, enrollment, and provider-facing services.",
    measurement: "Mean time-to-restore (MTTR) for P1 tickets resolved in the period.",
  },
  {
    name: "Problem Resolution", target: "≤ 30 days", actual: "22 days", status: "green",
    description: "Time to permanently eliminate the underlying root cause behind a recurring incident — preventing repeat occurrences and reducing future ticket volume.",
    measurement: "Average elapsed days from problem-record open to closed-with-permanent-fix.",
  },
  {
    name: "Application Availability", target: "≥ 99.7%", actual: "99.84%", status: "green",
    description: "Composite uptime across Tier-1 payer applications (FACETS, claims portals, member self-service, provider portal). The single most-watched metric for member trust.",
    measurement: "Monthly weighted average of synthetic + real-user monitoring across Tier-1 apps, excluding planned maintenance.",
  },
  {
    name: "Quality Delivery to Production", target: "≥ 98%", actual: "98.6%", status: "green",
    description: "Percentage of production releases that ship without a Severity-1 or Severity-2 defect surfacing within 30 days. Validates IBM's shift-left quality engineering rigor.",
    measurement: "(Releases without S1/S2 defect in 30-day window) ÷ (total production releases).",
  },
  {
    name: "Quality Delivery to UAT", target: "≥ 95%", actual: "96.2%", status: "green",
    description: "First-time UAT pass rate on builds promoted by IBM. A leading indicator that prevents downstream production defects and rework.",
    measurement: "UAT cycles passed on first submission ÷ total UAT cycles in the period.",
  },
  {
    name: "Service Request Completion", target: "≥ 96%", actual: "97.4%", status: "green",
    description: "Standard service requests (access, configuration, reports) fulfilled within their committed turnaround time. Reflects day-to-day responsiveness for Horizon staff.",
    measurement: "(SRs closed within SLA) ÷ (total SRs closed in the period).",
  },
  {
    name: "Testing Coverage Ratio", target: "≥ 85%", actual: "82%", status: "amber",
    description: "Share of code paths and business scenarios covered by automated tests across the Tier-1 portfolio. Currently below target — uplift planned via the Test Automation initiative.",
    measurement: "Weighted average of unit + integration coverage across covered repositories (SonarQube + IBM ADDI).",
  },
  {
    name: "Story Test Automation", target: "≥ 80%", actual: "84%", status: "green",
    description: "Percentage of agile user stories that ship with automated acceptance tests (BDD/Cucumber). Locks in feature behavior and prevents regressions.",
    measurement: "(Stories with automated acceptance tests) ÷ (stories closed in the sprint).",
  },
  {
    name: "Unit Test Automation", target: "≥ 75%", actual: "78%", status: "green",
    description: "Code-level unit test coverage on net-new code committed in the period. Foundational to the IBM shift-left strategy.",
    measurement: "Lines of new code covered by unit tests ÷ total new lines (SonarQube).",
  },
  {
    name: "DevOps Deployments / Month", target: "≥ 120", actual: "147", status: "green",
    description: "Total successful production deployments per month across the Horizon portfolio. A direct measure of delivery throughput and CI/CD maturity.",
    measurement: "Count of green production pipeline runs per calendar month (Jenkins / GitHub Actions).",
  },
  {
    name: "Deployment w/o Known Defects", target: "≥ 97%", actual: "98.1%", status: "green",
    description: "Percentage of releases promoted to production with zero open Severity-1/2 defects. Enforces the no-known-defects gate at the release boundary.",
    measurement: "(Releases with zero open S1/S2 at promotion) ÷ (total releases).",
  },
  {
    name: "Change Mgmt Effectiveness", target: "≥ 96%", actual: "97.5%", status: "green",
    description: "Successful changes implemented without rollback, emergency, or post-implementation incident. Reflects Change Advisory Board (CAB) discipline.",
    measurement: "(Successful changes) ÷ (total changes), excluding standard pre-approved changes.",
  },
  {
    name: "Root Cause Analysis & Reporting", target: "100%", actual: "100%", status: "green",
    description: "All P1/P2 incidents receive a documented RCA within 5 business days, reviewed jointly with Horizon leadership. Builds an institutional knowledge loop.",
    measurement: "RCAs delivered on time ÷ RCAs required for P1/P2 incidents in the period.",
  },
  {
    name: "On-Budget Delivery", target: "≥ 95%", actual: "96.8%", status: "green",
    description: "Programs and projects delivered within ±5% of their approved budget envelope. Protects Horizon's planned IT spend and prevents surprise overruns.",
    measurement: "(Projects closed within ±5% budget) ÷ (total projects closed in the period).",
  },
  {
    name: "IT Customer Satisfaction (CSAT)", target: "≥ 4.3/5", actual: "4.5/5", status: "green",
    description: "Quarterly business-stakeholder satisfaction score on IBM's delivery, support, and partnership across the AMS engagement.",
    measurement: "Average of stakeholder survey scores (1–5 scale) collected at end of quarter.",
  },
  {
    name: "Retention of Key Personnel", target: "≥ 90%", actual: "92%", status: "green",
    description: "Retention of IBM team members designated as Key Personnel under the contract — protects continuity, deep platform knowledge, and Horizon-specific institutional context.",
    measurement: "(Key Personnel still on engagement at period end) ÷ (Key Personnel at period start), rolling 12-month.",
  },
  {
    name: "Staffing Attrition (annualized)", target: "≤ 12%", actual: "9.4%", status: "green",
    description: "Annualized voluntary attrition across the entire IBM delivery team. Lower attrition correlates directly with delivery velocity and quality.",
    measurement: "(Voluntary departures in trailing 12 months ÷ average headcount) annualized.",
  },
];

const BUSINESS_KPIS: ServiceMetric[] = [
  {
    name: "Timely Claims Payment", target: "≥ 98%", actual: "98.6%", status: "green",
    description: "Provider claims paid within the regulatory turnaround time required by NJ DOBI and CMS. Direct driver of provider satisfaction and audit posture.",
    measurement: "(Claims paid within mandated TAT) ÷ (total claims paid in the period).",
  },
  {
    name: "Timely Claims Submission", target: "≥ 97%", actual: "97.8%", status: "green",
    description: "Outbound encounter and 837 submissions transmitted to CMS, BCBSA, and downstream payers within their submission windows. Prevents revenue leakage and rework.",
    measurement: "(Submissions on time) ÷ (total submissions due in the period).",
  },
  {
    name: "Letters Generation On-Time", target: "≥ 95%", actual: "96.1%", status: "green",
    description: "Member-facing correspondence (EOBs, denial letters, appeals notices) generated and dispatched within regulatory and SLA windows.",
    measurement: "(Letters dispatched on time) ÷ (total letters required in the period).",
  },
  {
    name: "ID Cards Generation", target: "≤ 5 days", actual: "3.8 days", status: "green",
    description: "End-to-end turnaround from enrollment confirmation to physical ID card mailed. Critical first-impression KPI for new members.",
    measurement: "Mean elapsed days from enrollment-effective to ID card produced and mailed.",
  },
  {
    name: "On-Time Enrollments", target: "≥ 98%", actual: "98.4%", status: "green",
    description: "Member enrollment transactions fully processed and effective by the requested coverage start date. Drives member experience and revenue accuracy.",
    measurement: "(Enrollments active by requested effective date) ÷ (total enrollments processed).",
  },
  {
    name: "Timely Bills Generation", target: "≥ 99%", actual: "99.2%", status: "green",
    description: "Premium bills generated and sent to subscribers / groups in line with the billing calendar — preserves cash flow and downstream collections.",
    measurement: "(Bills generated on schedule) ÷ (total bills due in the period).",
  },
  {
    name: "ASO Billing Compliance", target: "100%", actual: "99.7%", status: "amber",
    description: "Administrative Services Only (self-funded) groups billed in strict accordance with their contract terms — high-stakes accuracy KPI under audit.",
    measurement: "(ASO bills meeting contract terms) ÷ (total ASO bills issued).",
  },
  {
    name: "Successful Small-Group Conversion", target: "≥ 95%", actual: "96.3%", status: "green",
    description: "Small-group renewals and plan changes completed without member or broker escalation. Reflects clean handoff between Sales, Underwriting, and Operations.",
    measurement: "(Small-group conversions closed without escalation) ÷ (total small-group conversions).",
  },
  {
    name: "Rates Loading On-Time", target: "≥ 98%", actual: "98.9%", status: "green",
    description: "Annual and off-cycle rate sheets loaded into core systems before their effective date — prevents incorrect billing and benefit calculation.",
    measurement: "(Rate loads completed before effective date) ÷ (total rate loads scheduled).",
  },
  {
    name: "Same-Day eFax to Care Radius", target: "≥ 95%", actual: "94.2%", status: "amber",
    description: "Inbound clinical eFaxes (auths, clinical docs) delivered to Care Radius the same business day. Below target — being remediated via the AIOps document-routing automation.",
    measurement: "(eFaxes delivered to Care Radius same business day) ÷ (total inbound clinical eFaxes).",
  },
  {
    name: "Timely HIPAA Forms Processing", target: "≥ 99%", actual: "99.4%", status: "green",
    description: "HIPAA authorization, disclosure, and request forms processed within mandated regulatory windows. Compliance-critical privacy KPI.",
    measurement: "(HIPAA forms processed within mandated TAT) ÷ (total HIPAA forms received).",
  },
  {
    name: "Patient Logs to RightFax", target: "≥ 98%", actual: "98.7%", status: "green",
    description: "Patient interaction logs successfully transmitted from clinical workflow systems to the RightFax archive — ensures complete care documentation and audit trail.",
    measurement: "(Logs successfully delivered to RightFax) ÷ (total logs queued for transmission).",
  },
];

function StatusDot({ status }: { status: ServiceMetric["status"] }) {
  const cls =
    status === "green" ? "bg-status-green" :
    status === "amber" ? "bg-status-yellow" :
    "bg-status-red";
  return <span className={cn("w-2 h-2 rounded-full flex-shrink-0", cls)} />;
}

function MetricTile({ metric, accent }: { metric: ServiceMetric; accent: "blue" | "teal" }) {
  const ring = accent === "blue"
    ? "border-[#0f62fe]/20 bg-[#0f62fe]/[0.04] hover:border-[#0f62fe]/60 hover:shadow-md hover:shadow-[#0f62fe]/10"
    : "border-emerald-500/20 bg-emerald-500/[0.04] hover:border-emerald-500/60 hover:shadow-md hover:shadow-emerald-500/10";
  const accentText = accent === "blue" ? "text-[#0f62fe]" : "text-emerald-700 dark:text-emerald-400";
  const statusLabel =
    metric.status === "green" ? "On Target" :
    metric.status === "amber" ? "At Risk"   :
    "Below Target";
  return (
    <UiTooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <div className={cn(
          "rounded-md border px-3 py-2.5 transition-all cursor-help flex flex-col gap-1.5",
          ring,
        )}>
          <div className="flex items-start justify-between gap-2">
            <div className="text-[11px] font-semibold leading-tight text-foreground">{metric.name}</div>
            <StatusDot status={metric.status} />
          </div>
          <div className="flex items-baseline justify-between gap-2 text-[10.5px]">
            <span className="text-muted-foreground">Target: <span className="font-medium text-foreground/80">{metric.target}</span></span>
            <span className="font-bold text-foreground">{metric.actual}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm p-0 overflow-hidden border-0 shadow-xl">
        <div className="bg-card border border-border rounded-md">
          <div className={cn("px-3 py-2 border-b border-border flex items-center justify-between gap-3 bg-muted/40")}>
            <div className={cn("text-xs font-bold leading-tight", accentText)}>{metric.name}</div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <StatusDot status={metric.status} />
              <span className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">{statusLabel}</span>
            </div>
          </div>
          <div className="p-3 space-y-2.5">
            <div className="flex items-baseline justify-between gap-3 pb-2 border-b border-border/60">
              <div>
                <div className="text-[9.5px] uppercase font-semibold tracking-wide text-muted-foreground">Target</div>
                <div className="text-xs font-semibold text-foreground">{metric.target}</div>
              </div>
              <div className="text-right">
                <div className="text-[9.5px] uppercase font-semibold tracking-wide text-muted-foreground">Actual</div>
                <div className="text-sm font-bold text-foreground">{metric.actual}</div>
              </div>
            </div>
            <div>
              <div className="text-[9.5px] uppercase font-semibold tracking-wide text-muted-foreground mb-0.5">What it measures</div>
              <p className="text-[11px] leading-snug text-foreground/85">{metric.description}</p>
            </div>
            <div>
              <div className="text-[9.5px] uppercase font-semibold tracking-wide text-muted-foreground mb-0.5">Calculation</div>
              <p className="text-[11px] leading-snug text-muted-foreground italic">{metric.measurement}</p>
            </div>
          </div>
        </div>
      </TooltipContent>
    </UiTooltip>
  );
}

function ServiceLevelAndKpiPanel() {
  const cslGreen = CRITICAL_SERVICE_LEVELS.filter(m => m.status === "green").length;
  const kpiGreen = BUSINESS_KPIS.filter(m => m.status === "green").length;
  return (
    <TooltipProvider delayDuration={150}>
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <CardTitle>Service Levels &amp; Business KPI Commitments</CardTitle>
            <CardDescription>
              Critical Service Levels (CSL) measure delivery quality; Business KPIs measure operational outcomes for Horizon members and providers. Sample list — to be reviewed with Horizon during transition and baselining.
            </CardDescription>
          </div>
          <div className="flex gap-4 text-[11px] text-muted-foreground">
            <div><span className="font-bold text-foreground">{cslGreen}/{CRITICAL_SERVICE_LEVELS.length}</span> CSLs on target</div>
            <div><span className="font-bold text-foreground">{kpiGreen}/{BUSINESS_KPIS.length}</span> KPIs on target</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Critical Service Levels (technical / delivery) */}
          <section className="rounded-lg border border-[#0f62fe]/30 bg-card overflow-hidden">
            <header className="bg-[#0f62fe]/[0.08] border-b border-[#0f62fe]/20 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#0f62fe] rounded-sm" />
                <h3 className="text-sm font-bold text-[#0f62fe]">Critical Service Levels (CSL) &middot; Technical Metrics</h3>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Delivery &amp; Quality</span>
            </header>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {CRITICAL_SERVICE_LEVELS.map((m) => (
                <MetricTile key={m.name} metric={m} accent="blue" />
              ))}
            </div>
          </section>

          {/* Right — Business KPIs */}
          <section className="rounded-lg border border-emerald-500/30 bg-card overflow-hidden">
            <header className="bg-emerald-500/[0.08] border-b border-emerald-500/20 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-emerald-500 rounded-sm" />
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Key Performance Indicators (KPI) &middot; Business Outcomes</h3>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Member &amp; Operations</span>
            </header>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {BUSINESS_KPIS.map((m) => (
                <MetricTile key={m.name} metric={m} accent="teal" />
              ))}
            </div>
          </section>
        </div>

        <div className="mt-4 flex items-center justify-between text-[10.5px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-green" /> On Target</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-yellow" /> At Risk</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-red" /> Below Target</span>
          </div>
          <span className="italic">Sample list — to be reviewed with Horizon during transition &amp; baselining</span>
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}
