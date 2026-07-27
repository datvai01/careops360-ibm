import { useQuery } from "@tanstack/react-query";
import { useGetTicketTrends, useGetAutomationRunbooks, useGetCostSavings, useGetAiInsights } from "@workspace/api-client-react";
import type { IbmAmsKpis } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LabelList, AreaChart, Area, LineChart, ReferenceLine,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CpuIcon, ArrowRightIcon, ZapIcon, LightbulbIcon, ShieldCheckIcon, InfoIcon,
  ArrowUpIcon, ArrowDownIcon, MinusIcon,
  TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight,
  Plus, X, MessageSquare, BarChart2, CheckCircle2, Clock,
  ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip as UiTooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { KpiMetric } from "@workspace/api-client-react";
import { LastRefresh } from "@/components/admin/LastRefresh";
import { HelpHint } from "@/components/admin/HelpHint";

const IBM_BLUE = "#0f62fe";
const TEAL     = "#009d9a";
const GREEN    = "#24a148";
const AMBER    = "#F1C21B";
const RED      = "#DA1E28";
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const KPI_CATEGORIES = ["All","Critical Service Levels","Business KPIs"];
const SENTIMENT_OPTS = [
  { v: "positive", label: "✅ Positive" },
  { v: "neutral",  label: "🔵 Neutral"  },
  { v: "concern",  label: "⚠️ Concern"  },
];

type IbmPeriod = "7d" | "14d" | "30d";

const IBM_PERIOD_OPTIONS = [
  { value: "7d"  as IbmPeriod, label: "Last 7 Days",  shortLabel: "7D"  },
  { value: "14d" as IbmPeriod, label: "Last 14 Days", shortLabel: "14D" },
  { value: "30d" as IbmPeriod, label: "Last 21 Days", shortLabel: "21D" },
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
    { period: ibmPeriod as any },
    { query: { refetchInterval: 30000 } } as any
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
          <div className="flex items-center gap-2 mt-2">
            <LastRefresh datasetKey="ibm-aiops" variant="compact" />
            <HelpHint
              title="IBM AMS — Watsonx AIOps Hub"
              description="Performance, automation runbooks, cost-savings, and service-level commitments. Sourced from the AIOps telemetry pipeline."
              tables={["ibm_ams_kpis", "ibm_ams_runbooks", "ibm_ams_savings", "ibm_ams_insights"]}
              datasetKey="ibm-aiops"
              adminAction="Upload the IBM AIOps workbook to refresh all KPIs, runbooks, savings, and insights."
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-shrink-0">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-lg p-0.5">
            {IBM_PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setIbmPeriod(opt.value)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold transition-all",
                  ibmPeriod === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
                title={opt.label}
              >
                {opt.shortLabel}
              </button>
            ))}
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

// ─── KPI Tracker — dynamic types & helpers ────────────────────────────────────

function getToken() { return localStorage.getItem("horizon_token") ?? ""; }
async function kpiApi<T>(path: string, opts?: RequestInit): Promise<T> {
  const r = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(opts?.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json() as Promise<T>;
}

type KpiDef = {
  key: string; category: string; name: string; unit: string;
  description: string | null; target: number | null; targetDirection: string;
  displayOrder: number; currentValue: number | null; previousValue: number | null;
  sparkline: number[];
};
type HistoryEntry = { year: number; month: number; value: number; note: string | null };
type FeedbackItem = { id: number; kpiKey: string | null; comment: string; sentiment: string; authorName: string | null; createdAt: string };

function kpiStatus(k: KpiDef): "on-track" | "at-risk" | "behind" | "no-data" {
  if (k.currentValue === null || k.target === null) return "no-data";
  const r = k.currentValue / k.target;
  if (k.targetDirection === "higher") return r >= 0.95 ? "on-track" : r >= 0.80 ? "at-risk" : "behind";
  return r <= 1.05 ? "on-track" : r <= 1.30 ? "at-risk" : "behind";
}
function kpiProgress(k: KpiDef): number {
  if (k.currentValue === null || k.target === null) return 0;
  if (k.targetDirection === "higher") return Math.min(100, (k.currentValue / k.target) * 100);
  if (k.target === 0) return k.currentValue === 0 ? 100 : 0;
  return Math.max(0, Math.min(100, ((2 * k.target - k.currentValue) / k.target) * 100));
}
function kpiTrend(k: KpiDef) {
  if (k.currentValue === null || k.previousValue === null || k.previousValue === 0)
    return { pct: 0, dir: "flat" as const, good: false };
  const raw = ((k.currentValue - k.previousValue) / Math.abs(k.previousValue)) * 100;
  const dir = Math.abs(raw) < 0.05 ? ("flat" as const) : raw > 0 ? ("up" as const) : ("down" as const);
  const good = k.targetDirection === "higher" ? dir === "up" : dir === "down";
  return { pct: Math.abs(raw), dir, good };
}
function kpiFmt(v: number, unit: string): string {
  if (unit === "count" || unit === "$K") return v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(Math.round(v));
  if (unit === "%" || unit === "days") return v.toFixed(1);
  if (unit === "/ 5") return v.toFixed(1);
  return String(v);
}
function sentColor(s: string) { return s === "positive" ? GREEN : s === "concern" ? RED : IBM_BLUE; }

const KPI_STATUS_STYLES = {
  "on-track": { label: "On Track",    bg: "#DEFBE6", color: GREEN, Icon: CheckCircle2 },
  "at-risk":  { label: "At Risk",     bg: "#FFF8E1", color: AMBER, Icon: Clock },
  "behind":   { label: "Needs Focus", bg: "#FFF1F1", color: RED,   Icon: ChevronDown },
  "no-data":  { label: "No Data",     bg: "#F4F4F4", color: "#8D8D8D", Icon: Clock },
};

/* ── Tracker Charts Section ─────────────────────────────────── */
function TrackerChartsSection({ kpis }: { kpis: KpiDef[] }) {
  if (kpis.length === 0) return null;
  const counts = { onTrack: 0, atRisk: 0, behind: 0, noData: 0 };
  kpis.forEach(k => {
    const s = kpiStatus(k);
    if (s === "on-track") counts.onTrack++;
    else if (s === "at-risk") counts.atRisk++;
    else if (s === "behind") counts.behind++;
    else counts.noData++;
  });
  const healthPct = Math.round((counts.onTrack / kpis.length) * 100);
  const donutData = [
    { name: "On Track",    value: counts.onTrack,  color: GREEN },
    { name: "At Risk",     value: counts.atRisk,   color: AMBER },
    { name: "Needs Focus", value: counts.behind,   color: RED   },
    ...(counts.noData > 0 ? [{ name: "No Data", value: counts.noData, color: "#D1D5DB" }] : []),
  ].filter(d => d.value > 0);

  const BUCKETS = [
    { label: "<70%",    min: 0,   max: 70,       count: 0, color: RED   },
    { label: "70–80%",  min: 70,  max: 80,       count: 0, color: "#F05032" },
    { label: "80–90%",  min: 80,  max: 90,       count: 0, color: AMBER },
    { label: "90–95%",  min: 90,  max: 95,       count: 0, color: "#42BE65" },
    { label: "95–100%", min: 95,  max: 100,      count: 0, color: GREEN },
    { label: ">100%",   min: 100, max: Infinity, count: 0, color: "#0043CE" },
  ];
  kpis.forEach(k => {
    if (k.currentValue === null || k.target === null || k.target === 0) return;
    const p = kpiProgress(k);
    const bucket = BUCKETS.find(b => p >= b.min && p < b.max) ?? BUCKETS[BUCKETS.length - 1];
    bucket.count++;
  });

  const movers = kpis
    .filter(k => k.currentValue !== null && k.previousValue !== null && k.previousValue !== 0)
    .map(k => {
      const raw = ((k.currentValue! - k.previousValue!) / Math.abs(k.previousValue!)) * 100;
      const dir = k.targetDirection === "higher" ? raw : -raw;
      const nm = k.name.length > 24 ? k.name.slice(0, 22) + "…" : k.name;
      return { name: nm, change: Math.round(dir * 10) / 10, color: dir >= 0 ? GREEN : RED };
    })
    .sort((a, b) => b.change - a.change);
  const moverData = [...movers.slice(0, 5), ...movers.slice(-3).filter(m => m.change < 0)]
    .filter((m, i, arr) => arr.findIndex(x => x.name === m.name) === i);

  const catData = ["Critical Service Levels", "Business KPIs"].map(cat => {
    const group = kpis.filter(k => k.category === cat);
    const avg = group.length ? Math.round(group.reduce((s, k) => s + kpiProgress(k), 0) / group.length) : 0;
    return {
      cat: cat === "Critical Service Levels" ? "CSL" : "Biz KPIs",
      avg,
      onTrack: group.filter(k => kpiStatus(k) === "on-track").length,
      atRisk:  group.filter(k => kpiStatus(k) === "at-risk").length,
      behind:  group.filter(k => kpiStatus(k) === "behind").length,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1 — Overall Health Donut */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-5 flex flex-col">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Overall Health</p>
        <p className="text-xs text-muted-foreground mb-3">All {kpis.length} metrics · {MONTH_LABELS[new Date().getMonth()]} {new Date().getFullYear()}</p>
        <div className="relative flex-1 flex items-center justify-center min-h-[160px]">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                {donutData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number, n: string) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold">{healthPct}%</span>
            <span className="text-[10px] text-muted-foreground font-medium">On Track</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
          {donutData.map(d => (
            <div key={d.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
              {d.name} <span className="font-semibold">({d.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2 — Performance Distribution */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Performance vs Target</p>
        <p className="text-xs text-muted-foreground mb-3">Count of metrics by % of target achieved</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={BUCKETS} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => [v, "Metrics"]} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {BUCKETS.map((b, i) => <Cell key={i} fill={b.color} />)}
              <LabelList dataKey="count" position="top" style={{ fontSize: 10, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 3 — Status by Group */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Status by Group</p>
        <p className="text-xs text-muted-foreground mb-3">CSL (18) vs Business KPIs (12)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={catData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="cat" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Bar dataKey="onTrack" name="On Track"    stackId="a" fill={GREEN} radius={[0,0,0,0]} />
            <Bar dataKey="atRisk"  name="At Risk"     stackId="a" fill={AMBER} radius={[0,0,0,0]} />
            <Bar dataKey="behind"  name="Needs Focus" stackId="a" fill={RED}   radius={[4,4,0,0]}>
              <LabelList dataKey="avg" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 10, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-3 justify-center mt-1">
          {[{ c: GREEN, l: "On Track" }, { c: AMBER, l: "At Risk" }, { c: RED, l: "Needs Focus" }].map(x => (
            <div key={x.l} className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-sm" style={{ background: x.c }} /> {x.l}
            </div>
          ))}
        </div>
      </div>

      {/* 4 — M-o-M Movers */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">M-o-M Movers</p>
        <p className="text-xs text-muted-foreground mb-3">Top improvements &amp; declines vs prior month</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={moverData} layout="vertical" margin={{ top: 4, right: 36, left: 4, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 8 }} tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 8 }} width={90} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => [`${v > 0 ? "+" : ""}${v}%`, "vs prev"]} />
            <ReferenceLine x={0} stroke="hsl(var(--border))" />
            <Bar dataKey="change" radius={[0, 3, 3, 0]}>
              {moverData.map((m, i) => <Cell key={i} fill={m.color} fillOpacity={0.85} />)}
              <LabelList dataKey="change" position="right"
                formatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`}
                style={{ fontSize: 8 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Sparkline ──────────────────────────────────────────────── */
function TrackerSparkline({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={pts} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={`tsg_${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#tsg_${color.replace("#", "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── Compact Dynamic Metric Tile (replaces old static MetricTile) ── */
function DynStatusDot({ s }: { s: ReturnType<typeof kpiStatus> }) {
  const color =
    s === "on-track" ? "bg-status-green" :
    s === "at-risk"  ? "bg-status-yellow" :
    s === "behind"   ? "bg-status-red" : "bg-muted-foreground/40";
  return <span className={cn("w-2 h-2 rounded-full flex-shrink-0", color)} />;
}

function DynMetricTile({ k, accent, selected, onClick }: {
  k: KpiDef; accent: "blue" | "teal"; selected: boolean; onClick: () => void;
}) {
  const s = kpiStatus(k);
  const statusLabel =
    s === "on-track" ? "On Target" : s === "at-risk" ? "At Risk" : s === "behind" ? "Below Target" : "No Data";
  const actualStr = k.currentValue !== null ? `${kpiFmt(k.currentValue, k.unit)} ${k.unit}` : "—";
  const targetStr = k.target !== null ? `${kpiFmt(k.target, k.unit)} ${k.unit}` : "—";

  const ring = accent === "blue"
    ? cn(
        "border-[#0f62fe]/20 bg-[#0f62fe]/[0.04] hover:border-[#0f62fe]/50 hover:shadow-md hover:shadow-[#0f62fe]/10",
        selected && "border-[#0f62fe] shadow-md shadow-[#0f62fe]/20",
      )
    : cn(
        "border-emerald-500/20 bg-emerald-500/[0.04] hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/10",
        selected && "border-emerald-500 shadow-md shadow-emerald-500/20",
      );

  return (
    <UiTooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button onClick={onClick}
          className={cn("rounded-md border px-3 py-2.5 transition-all text-left flex flex-col gap-1.5 w-full", ring)}>
          <div className="flex items-start justify-between gap-2">
            <div className="text-[11px] font-semibold leading-tight">{k.name}</div>
            <DynStatusDot s={s} />
          </div>
          <div className="flex items-baseline justify-between gap-2 text-[10.5px]">
            <span className="text-muted-foreground">Target: <span className="font-medium text-foreground/80">{targetStr}</span></span>
            <span className="font-bold">{actualStr}</span>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm p-0 overflow-hidden border-0 shadow-xl">
        <div className="bg-card border border-border rounded-md">
          <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-3 bg-muted/40">
            <div className={cn("text-xs font-bold leading-tight",
              accent === "blue" ? "text-[#0f62fe]" : "text-emerald-700 dark:text-emerald-400")}>
              {k.name}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <DynStatusDot s={s} />
              <span className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">{statusLabel}</span>
            </div>
          </div>
          <div className="p-3 space-y-2.5">
            <div className="flex items-baseline justify-between gap-3 pb-2 border-b border-border/60">
              <div>
                <div className="text-[9.5px] uppercase font-semibold tracking-wide text-muted-foreground">Target</div>
                <div className="text-xs font-semibold">{targetStr}</div>
              </div>
              <div className="text-right">
                <div className="text-[9.5px] uppercase font-semibold tracking-wide text-muted-foreground">Actual</div>
                <div className="text-sm font-bold">{actualStr}</div>
              </div>
            </div>
            {k.description && (
              <div>
                <div className="text-[9.5px] uppercase font-semibold tracking-wide text-muted-foreground mb-0.5">What it measures</div>
                <p className="text-[11px] leading-snug text-foreground/85">{k.description}</p>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground italic">Click to view history &amp; leave feedback</p>
          </div>
        </div>
      </TooltipContent>
    </UiTooltip>
  );
}

/* ── Expanded Panel ─────────────────────────────────────────── */
function TrackerExpandedPanel({ kpi, history, feedback, onClose, onFeedbackSubmit }: {
  kpi: KpiDef; history: HistoryEntry[]; feedback: FeedbackItem[];
  onClose: () => void; onFeedbackSubmit: () => void;
}) {
  const [fbForm, setFbForm] = useState({ comment: "", sentiment: "neutral", authorName: "" });
  const [fbSending, setFbSending] = useState(false);
  const [fbSuccess, setFbSuccess] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const chartData = history.map(h => ({
    label: `${MONTH_LABELS[h.month - 1]} ${String(h.year).slice(2)}`,
    value: h.value,
  }));
  const myFeedback = feedback.filter(f => f.kpiKey === kpi.key);

  async function submitFeedback() {
    if (!fbForm.comment.trim()) return;
    setFbSending(true);
    try {
      await kpiApi("/api/kpi-tracker/feedback", {
        method: "POST",
        body: JSON.stringify({ kpiKey: kpi.key, comment: fbForm.comment, sentiment: fbForm.sentiment, authorName: fbForm.authorName }),
      });
      setFbForm({ comment: "", sentiment: "neutral", authorName: "" });
      setFbSuccess(true);
      setTimeout(() => setFbSuccess(false), 3000);
      onFeedbackSubmit();
    } finally { setFbSending(false); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="bg-card border border-primary/20 rounded-2xl shadow-lg p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-primary mb-0.5">{kpi.category}</p>
          <h3 className="text-xl font-bold">{kpi.name}</h3>
          {kpi.description && <p className="text-sm text-muted-foreground mt-0.5">{kpi.description}</p>}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
          <X className="w-5 h-5" />
        </button>
      </div>

      {chartData.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">18-Month Historical Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ left: -10, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={2} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }}
                formatter={(v: number) => [`${kpiFmt(v, kpi.unit)} ${kpi.unit}`, kpi.name]} />
              {kpi.target !== null && (
                <ReferenceLine y={kpi.target} stroke={GREEN} strokeDasharray="5 3"
                  label={{ value: `Target ${kpiFmt(kpi.target, kpi.unit)}`, fontSize: 9, fill: GREEN, position: "insideTopRight" }} />
              )}
              <Line type="monotone" dataKey="value" stroke={IBM_BLUE} strokeWidth={2}
                dot={{ r: 2, fill: IBM_BLUE }} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div>
        <button onClick={() => setShowTable(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <BarChart2 className="w-3.5 h-3.5" /> Monthly Data Table
          {showTable ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <AnimatePresence>
          {showTable && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      {["Month","Value","vs Target","Note"].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-muted-foreground font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...history].reverse().map((h, i) => {
                      const gap = kpi.target ? ((h.value - kpi.target) / kpi.target) * 100 : null;
                      const isGood = gap === null ? null : kpi.targetDirection === "higher" ? gap >= 0 : gap <= 0;
                      return (
                        <tr key={i} className="border-t border-border/50">
                          <td className="px-3 py-1.5 font-medium">{MONTH_LABELS[h.month - 1]} {h.year}</td>
                          <td className="px-3 py-1.5 font-bold">
                            {kpiFmt(h.value, kpi.unit)} <span className="font-normal text-muted-foreground">{kpi.unit}</span>
                          </td>
                          <td className="px-3 py-1.5">
                            {gap !== null && (
                              <span style={{ color: isGood ? GREEN : RED }}>
                                {gap > 0 ? "+" : ""}{gap.toFixed(1)}%
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-1.5 text-muted-foreground">{h.note ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-border pt-5 space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> Feedback on this KPI ({myFeedback.length})
        </p>
        {myFeedback.length > 0 && (
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {myFeedback.map(f => (
              <div key={f.id} className="bg-muted/40 rounded-xl px-3 py-2 text-xs">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sentColor(f.sentiment) }} />
                  <span className="font-medium">{f.authorName ?? "Anonymous"}</span>
                  <span className="text-muted-foreground ml-auto">{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="leading-relaxed">&quot;{f.comment}&quot;</p>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Select value={fbForm.sentiment} onValueChange={v => setFbForm(f => ({ ...f, sentiment: v }))}>
              <SelectTrigger className="w-36 text-xs h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SENTIMENT_OPTS.map(o => <SelectItem key={o.v} value={o.v} className="text-xs">{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Your name (optional)" value={fbForm.authorName}
              onChange={e => setFbForm(f => ({ ...f, authorName: e.target.value }))}
              className="text-xs h-8 flex-1" />
          </div>
          <Textarea rows={2} placeholder="Share your observations on this KPI…"
            value={fbForm.comment}
            onChange={e => setFbForm(f => ({ ...f, comment: e.target.value }))}
            className="text-xs resize-none" />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => void submitFeedback()}
              disabled={fbSending || !fbForm.comment.trim()}
              className="text-xs gap-1" style={{ background: IBM_BLUE }}>
              <MessageSquare className="w-3 h-3" /> Submit Feedback
            </Button>
            {fbSuccess && <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Saved</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Add Entry Modal ────────────────────────────────────────── */
function TrackerAddEntryModal({ kpis, open, onClose, onSaved }: {
  kpis: KpiDef[]; open: boolean; onClose: () => void; onSaved: () => void;
}) {
  const now = new Date();
  const [form, setForm] = useState({
    kpiKey: "", year: now.getFullYear(), month: now.getMonth() + 1, value: "", note: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (!form.kpiKey || !form.value) { setErr("Select a KPI and enter a value."); return; }
    setSaving(true); setErr(null);
    try {
      await kpiApi("/api/kpi-tracker/entries", {
        method: "POST",
        body: JSON.stringify({ ...form, value: Number(form.value) }),
      });
      onSaved(); onClose();
    } catch { setErr("Failed to save. Try again."); }
    finally { setSaving(false); }
  }

  const selectedKpi = kpis.find(k => k.key === form.kpiKey);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Add Monthly Entry
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">KPI</label>
            <Select value={form.kpiKey} onValueChange={v => setForm(f => ({ ...f, kpiKey: v }))}>
              <SelectTrigger className="text-sm"><SelectValue placeholder="Select a KPI…" /></SelectTrigger>
              <SelectContent>
                {KPI_CATEGORIES.slice(1).map(cat => (
                  <div key={cat}>
                    <p className="text-xs text-muted-foreground px-2 pt-2 pb-1 font-semibold">{cat}</p>
                    {kpis.filter(k => k.category === cat).map(k => (
                      <SelectItem key={k.key} value={k.key} className="text-sm">{k.name}</SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Year</label>
              <Select value={String(form.year)} onValueChange={v => setForm(f => ({ ...f, year: Number(v) }))}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(y => <SelectItem key={y} value={String(y)} className="text-sm">{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Month</label>
              <Select value={String(form.month)} onValueChange={v => setForm(f => ({ ...f, month: Number(v) }))}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTH_LABELS.map((m, i) => <SelectItem key={i} value={String(i + 1)} className="text-sm">{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
              Value {selectedKpi ? `(${selectedKpi.unit})` : ""}
            </label>
            <Input type="number" step="any" placeholder="Enter value…"
              value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              className="text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Note (optional)</label>
            <Textarea rows={2} placeholder="Context or observations…"
              value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              className="text-sm resize-none" />
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={() => void save()} disabled={saving}
              style={{ background: IBM_BLUE }} className="text-xs">
              {saving ? "Saving…" : "Save Entry"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Service Levels & KPIs Panel (dynamic) ──────────────────── */
function ServiceLevelAndKpiPanel() {
  const [kpis, setKpis] = useState<KpiDef[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const expandedRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const [ks, fbs] = await Promise.all([
        kpiApi<KpiDef[]>("/api/kpi-tracker/kpis"),
        kpiApi<FeedbackItem[]>("/api/kpi-tracker/feedback"),
      ]);
      setKpis(ks);
      setFeedback(fbs);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  async function selectKpi(key: string) {
    if (selectedKey === key) { setSelectedKey(null); return; }
    setSelectedKey(key);
    setHistLoading(true);
    try {
      const data = await kpiApi<HistoryEntry[]>(`/api/kpi-tracker/kpis/${key}/history`);
      setHistory(data);
    } finally { setHistLoading(false); }
    setTimeout(() => expandedRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  }

  const summary = {
    onTrack: kpis.filter(k => kpiStatus(k) === "on-track").length,
    atRisk:  kpis.filter(k => kpiStatus(k) === "at-risk").length,
    behind:  kpis.filter(k => kpiStatus(k) === "behind").length,
  };

  const selectedKpi = kpis.find(k => k.key === selectedKey) ?? null;

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        {[0, 1].map(col => (
          <div key={col} className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="bg-muted/40 border-b border-border px-4 py-2.5"><Skeleton className="h-4 w-1/2" /></div>
            <div className="p-3 grid grid-cols-2 xl:grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-md border border-border px-3 py-2.5 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {[
            { label: `${kpis.length} KPIs Tracked`, color: IBM_BLUE },
            { label: `${summary.onTrack} On Track`,   color: GREEN  },
            { label: `${summary.atRisk} At Risk`,     color: AMBER  },
            { label: `${summary.behind} Needs Focus`, color: RED    },
          ].map(pill => (
            <div key={pill.label} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
              style={{ background: `${pill.color}12`, borderColor: `${pill.color}30`, color: pill.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: pill.color }} />
              {pill.label}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void loadData(true)}
            className={cn("p-1.5 rounded-lg hover:bg-muted text-muted-foreground", refreshing && "animate-spin")}>
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button size="sm" onClick={() => setShowAdd(true)}
            className="gap-1 text-xs" style={{ background: IBM_BLUE }}>
            <Plus className="w-3.5 h-3.5" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Charts */}
      <TrackerChartsSection kpis={kpis} />

      {/* Two-column tile grid — CSL | Business KPIs */}
      <TooltipProvider delayDuration={150}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Critical Service Levels */}
          <section className="rounded-lg border border-[#0f62fe]/30 bg-card overflow-hidden">
            <header className="bg-[#0f62fe]/[0.08] border-b border-[#0f62fe]/20 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#0f62fe] rounded-sm" />
                <h3 className="text-sm font-bold text-[#0f62fe]">Critical Service Levels · Technical Metrics</h3>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Delivery &amp; Quality</span>
            </header>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {kpis.filter(k => k.category === "Critical Service Levels").map(k => (
                <DynMetricTile key={k.key} k={k} accent="blue"
                  selected={selectedKey === k.key}
                  onClick={() => void selectKpi(k.key)} />
              ))}
            </div>
          </section>

          {/* Right — Business KPIs */}
          <section className="rounded-lg border border-emerald-500/30 bg-card overflow-hidden">
            <header className="bg-emerald-500/[0.08] border-b border-emerald-500/20 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-emerald-500 rounded-sm" />
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Key Performance Indicators · Business Outcomes</h3>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Member &amp; Operations</span>
            </header>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {kpis.filter(k => k.category === "Business KPIs").map(k => (
                <DynMetricTile key={k.key} k={k} accent="teal"
                  selected={selectedKey === k.key}
                  onClick={() => void selectKpi(k.key)} />
              ))}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-green" /> On Target</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-yellow" /> At Risk</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-red" /> Below Target</span>
          </div>
          <span className="italic">Click any tile to expand history &amp; feedback</span>
        </div>
      </TooltipProvider>

      {/* Expanded panel */}
      <AnimatePresence>
        {selectedKpi && (
          <div ref={expandedRef}>
            {histLoading ? (
              <div className="bg-card border border-border rounded-2xl p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <TrackerExpandedPanel
                kpi={selectedKpi}
                history={history}
                feedback={feedback}
                onClose={() => setSelectedKey(null)}
                onFeedbackSubmit={() => void loadData(true)}
              />
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Add Entry modal */}
      <TrackerAddEntryModal
        kpis={kpis}
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSaved={() => void loadData(true)}
      />
    </div>
  );
}

