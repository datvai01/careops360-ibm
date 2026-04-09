import { useGetClaimsKpis, useGetClaimsQueue, useGetDenialReasons, useGetClaimsByLineOfBusiness, useGetClaimsAging } from "@workspace/api-client-react";
import { useTimeRange } from "@/contexts/TimeRangeContext";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#0f62fe', '#24a148', '#8a3ffc', '#002d9c', '#da1e28'];

export default function Claims() {
  const { periodOption } = useTimeRange();
  const { data: kpis, isLoading: isKpisLoading } = useGetClaimsKpis({});
  const { data: lobData, isLoading: isLobLoading } = useGetClaimsByLineOfBusiness();
  const { data: denialReasons, isLoading: isDenialLoading } = useGetDenialReasons();
  const { data: queueData, isLoading: isQueueLoading } = useGetClaimsQueue({});
  const { data: agingData, isLoading: isAgingLoading } = useGetClaimsAging();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Claims Operations</h1>
          <p className="text-muted-foreground mt-1">Claims processing, adjudication, and settlement metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Claims Received Today" metric={kpis?.claimsReceivedToday} isLoading={isKpisLoading} />
        <KpiCard title="Claims In Adjudication" metric={kpis?.claimsInAdjudication} isLoading={isKpisLoading} />
        <KpiCard title="Claims Pending" metric={kpis?.claimsPending} isLoading={isKpisLoading} />
        <KpiCard title="Claims Denied" metric={kpis?.claimsDenied} isLoading={isKpisLoading} />
        <KpiCard title="Claims Settled" metric={kpis?.claimsSettled} isLoading={isKpisLoading} />
        <KpiCard title="Total Dollar Processed" metric={kpis?.totalDollarProcessed} isLoading={isKpisLoading} />
        <KpiCard title="Auto-Adjudication Rate" metric={kpis?.autoAdjudicationRate} isLoading={isKpisLoading} />
        <KpiCard title="Avg Turnaround Days" metric={kpis?.avgTurnaroundDays} isLoading={isKpisLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle>Claims by Line of Business</CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                {periodOption.shortLabel}
              </span>
            </div>
            <CardDescription>{periodOption.label}</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLobLoading ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : lobData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lobData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="lob" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="received" name="Received" stackId="a" fill="#0f62fe" />
                  <Bar dataKey="processed" name="Processed" stackId="a" fill="#24a148" />
                  <Bar dataKey="pending" name="Pending" stackId="a" fill="#f1c21b" />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Denial Reasons</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isDenialLoading ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : denialReasons ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={denialReasons} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="reason" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={100} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="count" name="Count" fill="#da1e28" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claims Queue</CardTitle>
          <CardDescription>Recent claims pending adjudication</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Service Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Age (Days)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isQueueLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">Loading queue data...</TableCell>
                  </TableRow>
                ) : queueData?.claims ? (
                  queueData.claims.map((claim) => (
                    <TableRow key={claim.claimId}>
                      <TableCell className="font-medium">{claim.claimId}</TableCell>
                      <TableCell>{claim.memberName}</TableCell>
                      <TableCell>{claim.provider}</TableCell>
                      <TableCell>{new Date(claim.serviceDate).toLocaleDateString()}</TableCell>
                      <TableCell>${claim.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          claim.status.toLowerCase().includes('pending') ? 'bg-status-yellow/10 text-status-yellow border-status-yellow/20' :
                          claim.status.toLowerCase().includes('denied') ? 'bg-status-red/10 text-status-red border-status-red/20' :
                          'bg-primary/10 text-primary border-primary/20'
                        }>
                          {claim.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={claim.ageDays > 30 ? 'text-status-red' : claim.ageDays > 15 ? 'text-status-yellow' : ''}>
                          {claim.ageDays}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">No claims found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}