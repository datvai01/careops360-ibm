import { useGetIbmAmsKpis, useGetTicketTrends, useGetAutomationRunbooks, useGetCostSavings, useGetAiInsights } from "@workspace/api-client-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CpuIcon, ArrowRightIcon, ZapIcon, LightbulbIcon, ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IbmAms() {
  const { data: kpis, isLoading: isKpisLoading } = useGetIbmAmsKpis();
  const { data: trends, isLoading: isTrendsLoading } = useGetTicketTrends();
  const { data: runbooks, isLoading: isRunbooksLoading } = useGetAutomationRunbooks();
  const { data: savings, isLoading: isSavingsLoading } = useGetCostSavings();
  const { data: insights, isLoading: isInsightsLoading } = useGetAiInsights();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-primary/5 p-6 rounded-xl border border-primary/20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CpuIcon className="text-primary w-8 h-8" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">IBM AMS Value Delivery</h1>
          </div>
          <p className="text-muted-foreground text-lg">Continuous modernization, zero-touch operations, and proven cost reduction</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">YTD Cost Reduction</div>
          <div className="text-4xl font-black text-status-green">
            ${savings?.totalSavingsYtd ? (savings.totalSavingsYtd / 1000000).toFixed(1) : '...'}M
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Shift-Left Rate" metric={kpis?.shiftLeftRate} isLoading={isKpisLoading} icon={<ArrowRightIcon />} />
        <KpiCard title="Self-Heal Events" metric={kpis?.selfHealEvents} isLoading={isKpisLoading} icon={<ShieldCheckIcon />} />
        <KpiCard title="Automation Runbooks" metric={kpis?.automationRunbooks} isLoading={isKpisLoading} icon={<ZapIcon />} />
        <KpiCard title="Defect Leakage" metric={kpis?.defectLeakage} isLoading={isKpisLoading} icon={<ShieldCheckIcon />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Ticket Resolution & Automation Trend</CardTitle>
            <CardDescription>Increasing automation correlates with faster resolution</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isTrendsLoading ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : trends ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trends} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="total" name="Total Tickets" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="automated" name="Automated Resolution" fill="#0f62fe" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="resolvedWithinSla" name="SLA %" stroke="#24a148" strokeWidth={3} dot={{r: 4}} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Cumulative Value Realization</CardTitle>
            <CardDescription>Monthly progression of savings and cost avoidance</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isSavingsLoading ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : savings?.monthlyTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={savings.monthlyTrend} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                   <defs>
                    <linearGradient id="colorSav" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#24a148" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#24a148" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={val => `$${val/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="savings" name="Realized Savings" stroke="#24a148" fill="url(#colorSav)" />
                  <Area type="monotone" dataKey="avoidance" name="Cost Avoidance" stroke="#f1c21b" fill="#f1c21b" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>Active Automation Runbooks</CardTitle>
            <CardDescription>High-impact automations driving zero-touch ops</CardDescription>
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
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Loading runbooks...</TableCell>
                    </TableRow>
                  ) : runbooks ? (
                    runbooks.map((rb) => (
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
              <LightbulbIcon className="w-5 h-5" />
              <span>IBM AI AIOps Insights</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isInsightsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Generating insights...</div>
            ) : insights ? (
              insights.map((insight) => (
                <div key={insight.id} className="bg-card p-4 rounded-lg border shadow-sm space-y-2">
                  <div className="font-semibold text-sm leading-tight">{insight.headline}</div>
                  <p className="text-xs text-muted-foreground">{insight.detail}</p>
                  <div className="bg-primary/10 text-primary text-xs p-2 rounded mt-2 border border-primary/20">
                    <span className="font-bold">Recommendation:</span> {insight.recommendation}
                  </div>
                </div>
              ))
            ) : null}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full text-primary border-primary/30 hover:bg-primary/10">View All AIOps Telemetry</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}