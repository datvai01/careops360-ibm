import { useGetContactCenterKpis, useGetTopCallReasons, useGetHourlyCallVolume } from "@workspace/api-client-react";
import { useTimeRange } from "@/contexts/TimeRangeContext";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from "recharts";
import { LastRefresh } from "@/components/admin/LastRefresh";
import { HelpHint } from "@/components/admin/HelpHint";

export default function ContactCenter() {
  const { periodOption } = useTimeRange();
  const { data: kpis, isLoading: isKpisLoading } = useGetContactCenterKpis({});
  const { data: reasons, isLoading: isReasonsLoading } = useGetTopCallReasons();
  const { data: hourly, isLoading: isHourlyLoading } = useGetHourlyCallVolume();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Services</h1>
          <p className="text-muted-foreground mt-1">Contact center performance and digital engagement</p>
          <LastRefresh datasetKey="contact-center" variant="compact" className="mt-2" />
        </div>
      </div>

      <div className="flex items-center gap-2 -mb-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Center KPIs</h2>
        <HelpHint
          title="Contact Center KPIs"
          description="Voice + digital engagement metrics: ASA, abandonment, FCR, chatbot containment, complaints, and case volume."
          tables={["contact_center_kpis", "contact_center_call_reasons"]}
          datasetKey="contact-center"
          adminAction="Upload the Contact Center workbook to refresh KPIs and call-reason mix."
        />
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
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                Hourly Contact Volume
                <HelpHint
                  title="Hourly Contact Volume"
                  description="Voice + chat call density across the day. Used to right-size shift schedules and trigger AI deflection campaigns."
                  tables={["contact_center_hourly_volume"]}
                  datasetKey="contact-center"
                  adminAction="Re-upload the Contact Center workbook to refresh hourly volume bands."
                />
              </CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                {periodOption.shortLabel}
              </span>
            </div>
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
            <CardTitle className="flex items-center gap-2">
              Top Call Reasons
              <HelpHint
                title="Top Call Reasons"
                description="Drivers behind voice contacts. Used to prioritise self-service journeys, knowledge-base updates, and chatbot intents."
                tables={["contact_center_call_reasons"]}
                datasetKey="contact-center"
                adminAction="Refresh by uploading the Contact Center workbook with the latest call-reason rollups."
              />
            </CardTitle>
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