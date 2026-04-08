import { useGetExecutiveKpis, useGetExecutiveTrends } from "@workspace/api-client-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UsersIcon, FileTextIcon, StethoscopeIcon, BuildingIcon, PhoneCallIcon, ServerIcon, CheckCircleIcon, TrendingUpIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";

export default function ExecutiveOverview() {
  const { data: kpis, isLoading: isKpisLoading } = useGetExecutiveKpis({ query: { refetchInterval: 30000 } });
  const { data: trends, isLoading: isTrendsLoading } = useGetExecutiveTrends({ query: { refetchInterval: 30000 } });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time pulse of Horizon Payer operations</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Active Members" 
          metric={kpis?.activeMembers} 
          isLoading={isKpisLoading}
          icon={<UsersIcon />}
        />
        <KpiCard 
          title="Claims Settled Today" 
          metric={kpis?.claimsSettledAmount} 
          isLoading={isKpisLoading}
          icon={<FileTextIcon />}
        />
        <KpiCard 
          title="Prior Auth Requests" 
          metric={kpis?.priorAuthRequests} 
          isLoading={isKpisLoading}
          icon={<StethoscopeIcon />}
        />
        <KpiCard 
          title="Call Center ASA" 
          metric={kpis?.callCenterASA} 
          isLoading={isKpisLoading}
          icon={<PhoneCallIcon />}
        />
        <KpiCard 
          title="App Availability" 
          metric={kpis?.applicationAvailability} 
          isLoading={isKpisLoading}
          icon={<ServerIcon />}
        />
        <KpiCard 
          title="Critical Incidents" 
          metric={kpis?.criticalIncidents} 
          isLoading={isKpisLoading}
          icon={<TrendingUpIcon />}
        />
        <KpiCard 
          title="SLA Attainment" 
          metric={kpis?.slaAttainment} 
          isLoading={isKpisLoading}
          icon={<CheckCircleIcon />}
        />
        <KpiCard 
          title="Automation Savings" 
          metric={kpis?.automationSavings} 
          isLoading={isKpisLoading}
          icon={<TrendingUpIcon />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>30-Day Operational Volume Trend</CardTitle>
            <CardDescription>Claims, Enrollments, and Prior Auths</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isTrendsLoading ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : trends && trends.points ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.points} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f62fe" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0f62fe" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#24a148" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#24a148" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="claims" name="Claims" stroke="#0f62fe" fillOpacity={1} fill="url(#colorClaims)" />
                  <Area type="monotone" dataKey="enrollments" name="Enrollments" stroke="#24a148" fillOpacity={1} fill="url(#colorEnroll)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health Status</CardTitle>
            <CardDescription>Current state of IT ops</CardDescription>
          </CardHeader>
          <CardContent>
            {isTrendsLoading ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : trends && trends.points ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={trends.points.slice(-7)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    cursor={{fill: 'hsl(var(--muted))'}}
                  />
                  <Bar dataKey="incidents" name="Incidents" fill="#da1e28" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}