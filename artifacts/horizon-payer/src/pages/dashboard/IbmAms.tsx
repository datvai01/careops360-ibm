import { useGetIbmAmsKpis, useGetTicketTrends, useGetAutomationRunbooks, useGetCostSavings, useGetAiInsights } from "@workspace/api-client-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CpuIcon, ArrowRightIcon, ZapIcon, LightbulbIcon, ShieldCheckIcon, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const IBM_BLUE = "#0f62fe";
const TEAL     = "#009d9a";
const GREEN    = "#24a148";
const SLATE    = "#8d8d8d";

const AUTOMATION_PCT  = 2100000 / 3200000;
const SHIFTLEFT_PCT   = 800000  / 3200000;
const SELFHEAL_PCT    = 300000  / 3200000;

function fmt$(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000)     return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

function FormulaModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
      <div
        className="relative bg-background border border-border rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: IBM_BLUE }}>
              <span className="text-white text-[9px] font-black">IBM</span>
            </div>
            <h2 className="text-sm font-semibold">YTD Cost Reduction — Calculation Methodology</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 font-mono text-xs leading-relaxed">
            <p className="text-muted-foreground mb-1 font-sans font-semibold text-[11px] uppercase tracking-wide">Formula</p>
            <p><span className="text-[#0f62fe] font-semibold">YTD Cost Reduction</span> =</p>
            <p className="ml-4 mt-1">Automation Offset</p>
            <p className="ml-4">+ Shift-Left Deflection Savings</p>
            <p className="ml-4">+ Self-Heal Event Prevention</p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                label: "Automation Offset",
                value: "$2,100,000",
                color: IBM_BLUE,
                formula: "Δ Automated Tickets × Avg. Fully-Loaded Cost per Ticket ($142) × Months Elapsed",
                note: "Tickets resolved via runbook automation compared to manual baseline. Loaded labor rate includes engineer time, tooling overhead, and management allocation.",
              },
              {
                label: "Shift-Left Deflection Savings",
                value: "$800,000",
                color: TEAL,
                formula: "Deflected Tickets (self-service / Tier 0) × Avg. Tier-1 Ticket Cost ($68)",
                note: "Cases resolved at self-service or knowledge-base tier before reaching a human agent. Deflection volume measured against pre-AMS ticket routing baseline.",
              },
              {
                label: "Self-Heal Event Prevention",
                value: "$300,000",
                color: GREEN,
                formula: "Self-Heal Events × Avg. P2 Incident Cost ($12,500) × Prevention Rate (96%)",
                note: "Automated remediation events that resolved conditions before they escalated to a reportable P2/P3 incident. Prevention rate sourced from post-event correlation analysis.",
              },
            ].map(item => (
              <div key={item.label} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold" style={{ color: item.color }}>{item.label}</span>
                  <span className="text-xs font-bold">{item.value}</span>
                </div>
                <p className="text-xs font-mono text-muted-foreground mb-1 bg-muted/40 px-2 py-1 rounded">{item.formula}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-[#0f62fe]/5 border border-[#0f62fe]/20 px-4 py-2.5 flex justify-between items-center">
            <span className="text-xs font-semibold text-[#0f62fe]">YTD Total Realized Cost Reduction</span>
            <span className="text-sm font-black text-[#0f62fe]">$3,200,000</span>
          </div>

          <p className="text-[10px] text-muted-foreground/60 italic">
            Cost avoidance ($8.4M YTD) is tracked separately and represents incidents prevented before business impact.
            It is not included in the realized cost reduction figure above.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function IbmAms() {
  const { data: kpis, isLoading: isKpisLoading } = useGetIbmAmsKpis();
  const { data: trends, isLoading: isTrendsLoading } = useGetTicketTrends();
  const { data: runbooks, isLoading: isRunbooksLoading } = useGetAutomationRunbooks();
  const { data: savings, isLoading: isSavingsLoading } = useGetCostSavings();
  const { data: insights, isLoading: isInsightsLoading } = useGetAiInsights();
  const [showFormula, setShowFormula] = useState(false);

  const breakdownData = savings?.monthlyTrend?.map(m => ({
    month: m.month,
    automation: Math.round(m.savings * AUTOMATION_PCT),
    shiftLeft:  Math.round(m.savings * SHIFTLEFT_PCT),
    selfHeal:   Math.round(m.savings * SELFHEAL_PCT),
    avoidance:  m.avoidance,
  })) ?? [];

  const ytdTotal = savings?.totalSavingsYtd ?? 0;
  const ytdAvoidance = savings?.costAvoidanceYtd ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 bg-primary/5 p-5 rounded-xl border border-primary/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CpuIcon className="text-primary w-6 h-6" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">IBM Application Management Services</h1>
          </div>
          <p className="text-sm text-muted-foreground">Performance &amp; Value Summary · CY2026 · Horizon BCBS Managed Engagement</p>
        </div>
        <div className="flex gap-6 items-start flex-shrink-0">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mb-0.5">
              YTD Cost Reduction
              <button
                onClick={() => setShowFormula(true)}
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

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Shift-Left Rate"        metric={kpis?.shiftLeftRate}    isLoading={isKpisLoading} icon={<ArrowRightIcon />} />
        <KpiCard title="Self-Heal Events"        metric={kpis?.selfHealEvents}   isLoading={isKpisLoading} icon={<ShieldCheckIcon />} />
        <KpiCard title="Automation Runbooks"     metric={kpis?.automationRunbooks} isLoading={isKpisLoading} icon={<ZapIcon />} />
        <KpiCard title="Defect Leakage"          metric={kpis?.defectLeakage}    isLoading={isKpisLoading} icon={<ShieldCheckIcon />} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1 — Ticket & Automation Trend (unchanged) */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Ticket Resolution &amp; Automation Trend</CardTitle>
            <CardDescription>Rising automation rate correlates with faster resolution and higher SLA</CardDescription>
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

        {/* Chart 2 — Monthly Cost Reduction Breakdown (replaces Cumulative Value Realization) */}
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
                  <Bar dataKey="automation" name="Automation Offset"       stackId="a" fill={IBM_BLUE} radius={[0,0,0,0]} />
                  <Bar dataKey="shiftLeft"  name="Shift-Left Deflection"   stackId="a" fill={TEAL}     radius={[0,0,0,0]} />
                  <Bar dataKey="selfHeal"   name="Self-Heal Prevention"    stackId="a" fill={GREEN}    radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
          <div className="px-6 pb-4">
            <div className="rounded-lg bg-muted/40 border border-border px-4 py-2.5 flex flex-wrap gap-x-6 gap-y-1 text-xs">
              {[
                { label: "Automation Offset", value: fmt$(savings?.automationSavings ?? 0), color: IBM_BLUE },
                { label: "Shift-Left Deflection", value: fmt$(savings?.shiftLeftSavings ?? 0), color: TEAL },
                { label: "Self-Heal Prevention", value: fmt$(savings?.selfHealSavings ?? 0), color: GREEN },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-semibold">{item.value} YTD</span>
                </div>
              ))}
              <button onClick={() => setShowFormula(true)} className="ml-auto text-[#0f62fe] hover:underline flex items-center gap-0.5">
                <InfoIcon className="h-3 w-3" /> Methodology
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Runbooks + Insights row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>Active Automation Runbooks</CardTitle>
            <CardDescription>High-impact automations driving zero-touch operations</CardDescription>
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

      {showFormula && <FormulaModal onClose={() => setShowFormula(false)} />}
    </div>
  );
}
