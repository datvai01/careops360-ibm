import { useGetPriorAuthKpis, useGetPriorAuthAging, useGetTopProcedures, useGetReviewerWorkload } from "@workspace/api-client-react";
import { useTimeRange } from "@/contexts/TimeRangeContext";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LastRefresh } from "@/components/admin/LastRefresh";
import { HelpHint } from "@/components/admin/HelpHint";

const COLORS = ['#24a148', '#da1e28', '#f1c21b', '#0f62fe'];

export default function PriorAuth() {
  const { periodOption } = useTimeRange();
  const { data: kpis, isLoading: isKpisLoading } = useGetPriorAuthKpis({});
  const { data: aging, isLoading: isAgingLoading } = useGetPriorAuthAging();
  const { data: procedures, isLoading: isProceduresLoading } = useGetTopProcedures();
  const { data: workload, isLoading: isWorkloadLoading } = useGetReviewerWorkload();

  const authData = [
    { name: 'Approved', value: kpis?.approved.value || 0 },
    { name: 'Denied', value: kpis?.denied.value || 0 },
    { name: 'Pended', value: kpis?.pended.value || 0 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prior Authorization</h1>
          <p className="text-muted-foreground mt-1">Utilization management and authorization workflows</p>
          <LastRefresh datasetKey="prior-auth" variant="compact" className="mt-2" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Authorization KPIs</h2>
        <HelpHint
          title="Prior Authorization KPIs"
          description="Request volume, urgent flag share, average review hours, and backlog size — drives SLA risk reporting."
          tables={["prior_auth_kpis", "prior_auth_requests"]}
          datasetKey="prior-auth"
          adminAction="Upload the Prior Auth workbook to refresh KPIs, aging, and reviewer workload."
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Requests Received" metric={kpis?.requestsReceived} isLoading={isKpisLoading} />
        <KpiCard title="Avg Review Hours" metric={kpis?.avgReviewHours} isLoading={isKpisLoading} />
        <KpiCard title="Urgent Requests" metric={kpis?.urgentRequests} isLoading={isKpisLoading} />
        <KpiCard title="Backlog Size" metric={kpis?.backlogSize} isLoading={isKpisLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                Authorization Status
                <HelpHint
                  title="Authorization Status Mix"
                  description="Pie of approved / denied / pended decisions for the period. Used to monitor approval-rate trends."
                  tables={["prior_auth_kpis"]}
                  datasetKey="prior-auth"
                  adminAction="Refresh by uploading the Prior Auth workbook with current KPI rollups."
                />
              </CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                {periodOption.shortLabel}
              </span>
            </div>
            <CardDescription>{periodOption.label}</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isKpisLoading ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={authData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {authData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Top Procedure Categories
              <HelpHint
                title="Top Procedure Categories"
                description="Procedure categories ranked by request count, with approval rate and average decision days."
                tables={["prior_auth_top_procedures"]}
                datasetKey="prior-auth"
                adminAction="Re-upload the Prior Auth workbook with updated procedure category rollups."
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Approval Rate</TableHead>
                    <TableHead className="text-right">Avg Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isProceduresLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Loading procedures...</TableCell>
                    </TableRow>
                  ) : procedures ? (
                    procedures.map((proc, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{proc.category}</TableCell>
                        <TableCell className="text-right">{proc.requests.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={proc.approvalRate} className="w-16 h-2" />
                            <span className="text-xs w-8 text-right">{proc.approvalRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{proc.avgDays}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">No data found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Reviewer Workload
              <HelpHint
                title="Reviewer Workload"
                description="Per-reviewer open vs completed cases with capacity status. Used to rebalance assignments and flag burnout risk."
                tables={["prior_auth_reviewer_workload"]}
                datasetKey="prior-auth"
                adminAction="Refresh by uploading the Prior Auth workbook with current reviewer rosters."
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer</TableHead>
                    <TableHead className="text-right">Open</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isWorkloadLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Loading workload...</TableCell>
                    </TableRow>
                  ) : workload ? (
                    workload.map((w, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{w.reviewerName}</TableCell>
                        <TableCell className="text-right">{w.openCases}</TableCell>
                        <TableCell className="text-right">{w.completedToday}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            w.status === 'high' ? 'bg-status-yellow/10 text-status-yellow border-status-yellow/20' :
                            w.status === 'critical' ? 'bg-status-red/10 text-status-red border-status-red/20' :
                            'bg-status-green/10 text-status-green border-status-green/20'
                          }>
                            {w.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">No workload data.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Backlog Aging
              <HelpHint
                title="Backlog Aging"
                description="Open authorisation requests bucketed by age, colour-coded for SLA breach risk."
                tables={["prior_auth_aging"]}
                datasetKey="prior-auth"
                adminAction="Re-upload the Prior Auth workbook to refresh aging buckets."
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isAgingLoading ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : aging ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aging} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="bucket" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="count" name="Cases" radius={[4, 4, 0, 0]}>
                    {aging.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.severity === 'red' ? '#da1e28' : 
                        entry.severity === 'yellow' ? '#f1c21b' : 
                        '#24a148'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}