import { useGetContactCenterKpis, useGetTopCallReasons, useGetHourlyCallVolume } from "@workspace/api-client-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from "recharts";

export default function ContactCenter() {
  const { data: kpis, isLoading: isKpisLoading } = useGetContactCenterKpis({});
  const { data: reasons, isLoading: isReasonsLoading } = useGetTopCallReasons();
  const { data: hourly, isLoading: isHourlyLoading } = useGetHourlyCallVolume();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Services</h1>
          <p className="text-muted-foreground mt-1">Contact center performance and digital engagement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Calls Received" metric={kpis?.callsReceived} isLoading={isKpisLoading} />
        <KpiCard title="Avg Speed of Answer" metric={kpis?.avgWaitTime} isLoading={isKpisLoading} />
        <KpiCard title="Abandonment Rate" metric={kpis?.abandonmentRate} isLoading={isKpisLoading} />
        <KpiCard title="First Call Resolution" metric={kpis?.firstCallResolution} isLoading={isKpisLoading} />
        <KpiCard title="Chatbot Containment" metric={kpis?.chatbotContainment} isLoading={isKpisLoading} />
        <KpiCard title="Digital Adoption" metric={kpis?.digitalAdoption} isLoading={isKpisLoading} />
        <KpiCard title="Cases Opened" metric={kpis?.casesOpened} isLoading={isKpisLoading} />
        <KpiCard title="Member Complaints" metric={kpis?.memberComplaints} isLoading={isKpisLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Contact Volume</CardTitle>
            <CardDescription>Calls, chats, and emails throughout the day</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isHourlyLoading ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : hourly ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourly} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f62fe" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0f62fe" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8a3ffc" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8a3ffc" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="calls" name="Calls" stroke="#0f62fe" fillOpacity={1} fill="url(#colorCalls)" />
                  <Area type="monotone" dataKey="chats" name="Chats" stroke="#8a3ffc" fillOpacity={1} fill="url(#colorChats)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Call Reasons</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isReasonsLoading ? (
               <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : reasons ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reasons} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="reason" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={120} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="count" name="Volume" fill="#0f62fe" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}