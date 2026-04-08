import { useGetMemberKpis, useGetEnrollmentTrends, useGetMembersByProduct } from "@workspace/api-client-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#0f62fe', '#24a148', '#8a3ffc', '#002d9c', '#da1e28'];

export default function Members() {
  const { data: kpis, isLoading: isKpisLoading } = useGetMemberKpis({}, { query: { refetchInterval: 30000 } });
  const { data: trends, isLoading: isTrendsLoading } = useGetEnrollmentTrends({ query: { refetchInterval: 30000 } });
  const { data: products, isLoading: isProductsLoading } = useGetMembersByProduct({ query: { refetchInterval: 30000 } });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Enrollment</h1>
          <p className="text-muted-foreground mt-1">Enrollment trends and member distributions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Active Members" metric={kpis?.totalActiveMembers} isLoading={isKpisLoading} />
        <KpiCard title="New Enrollments (Today)" metric={kpis?.newEnrollmentsToday} isLoading={isKpisLoading} />
        <KpiCard title="Terminations" metric={kpis?.terminations} isLoading={isKpisLoading} />
        <KpiCard title="Exception Queue" metric={kpis?.exceptionQueueSize} isLoading={isKpisLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Enrollment Trends (30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isTrendsLoading ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : trends && trends.daily ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.daily} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="enrollments" name="Enrollments" stroke="#24a148" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="terminations" name="Terminations" stroke="#da1e28" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members by Product</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isProductsLoading ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : products ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={products}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="product"
                  >
                    {products.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}