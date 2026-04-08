import { useGetFinanceKpis, useGetBillingExceptions, useGetPremiumTrend } from "@workspace/api-client-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Finance() {
  const { data: kpis, isLoading: isKpisLoading } = useGetFinanceKpis({}, { query: { refetchInterval: 30000 } });
  const { data: exceptions, isLoading: isExceptionsLoading } = useGetBillingExceptions({ query: { refetchInterval: 30000 } });
  const { data: trend, isLoading: isTrendLoading } = useGetPremiumTrend({ query: { refetchInterval: 30000 } });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance & Billing</h1>
          <p className="text-muted-foreground mt-1">Premium collection, delinquency, and financial reconciliation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Premium Billed" metric={kpis?.premiumBilled} isLoading={isKpisLoading} />
        <KpiCard title="Premium Received" metric={kpis?.premiumReceived} isLoading={isKpisLoading} />
        <KpiCard title="Delinquency Count" metric={kpis?.delinquencyCount} isLoading={isKpisLoading} />
        <KpiCard title="Billing Exceptions" metric={kpis?.billingExceptions} isLoading={isKpisLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Premium Billed vs Received (YTD)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isTrendLoading ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : trend ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} 
                         tickFormatter={(value) => `$${value/1000000}M`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => `$${(value/1000000).toFixed(1)}M`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="billed" name="Billed" stroke="#0f62fe" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="received" name="Received" stroke="#24a148" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Exceptions</CardTitle>
            <CardDescription>High priority items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isExceptionsLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">Loading exceptions...</TableCell>
                    </TableRow>
                  ) : exceptions ? (
                    exceptions.map((ex) => (
                      <TableRow key={ex.id}>
                        <TableCell className="font-medium text-xs">{ex.exceptionType}</TableCell>
                        <TableCell className="text-right text-xs">${ex.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            ex.priority === 'high' ? 'bg-status-red/10 text-status-red border-status-red/20 text-[10px]' :
                            'bg-status-yellow/10 text-status-yellow border-status-yellow/20 text-[10px]'
                          }>
                            {ex.priority}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">No exceptions found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}