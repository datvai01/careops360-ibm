import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import { Headphones, Clock, XCircle, CheckCircle2, MessageSquare, Download, RefreshCw } from "lucide-react";
import { useGetContactCenterKpis, useGetTopCallReasons, useGetHourlyCallVolume } from "@workspace/api-client-react";
import { useTimeRange } from "@/contexts/TimeRangeContext";
import { cn } from "@/lib/utils";

export default function MemberServices() {
  const { periodOption } = useTimeRange();
  const { data: kpis, isLoading: isKpisLoading } = useGetContactCenterKpis({});
  const { data: reasons, isLoading: isReasonsLoading } = useGetTopCallReasons();
  const { data: hourly, isLoading: isHourlyLoading } = useGetHourlyCallVolume();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Operations</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Member Services</h1>
          <p className="text-muted-foreground mt-1">
            Contact center performance, digital engagement channels, and member support operations
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-9">
            <Download size={14} /> Export
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-9">
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>

      {/* Contact Channel KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Headphones,   label: "Calls Received",        metric: kpis?.callsReceived,       color: "#0f62fe" },
          { icon: Clock,        label: "Avg Speed of Answer",   metric: kpis?.avgWaitTime,         color: "#009d9a" },
          { icon: XCircle,      label: "Abandonment Rate",      metric: kpis?.abandonmentRate,     color: "#da1e28" },
          { icon: CheckCircle2, label: "First Call Resolution", metric: kpis?.firstCallResolution, color: "#24a148" },
        ].map(({ icon: Icon, label, metric, color }) => (
          <Card key={label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color }} />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
              </div>
              {isKpisLoading ? (
                <div className="h-7 w-24 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold tabular-nums" style={{ color }}>
                  {metric?.value ?? "—"}
                  {metric?.unit ? <span className="text-sm ml-1 font-normal text-muted-foreground">{metric.unit}</span> : null}
                </p>
              )}
              {metric?.trend && (
                <p className={cn(
                  "text-xs mt-1.5 font-medium",
                  metric.trend.startsWith("+") ? "text-emerald-600" : metric.trend.startsWith("-") ? "text-red-500" : "text-muted-foreground"
                )}>
                  {metric.trend}
                </p>
              )}
            </CardContent>
            <div className="absolute top-0 right-0 w-1 h-full" style={{ background: color }} />
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">Hourly Contact Volume</CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                {periodOption.shortLabel}
              </span>
            </div>
            <CardDescription>Calls and chats by hour — current day</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {isHourlyLoading ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Loading chart…</div>
            ) : hourly ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourly} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="msCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0f62fe" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0f62fe" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="msChats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8a3ffc" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8a3ffc" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="calls" name="Calls" stroke="#0f62fe" fill="url(#msCalls)" strokeWidth={2} />
                  <Area type="monotone" dataKey="chats" name="Chats" stroke="#8a3ffc" fill="url(#msChats)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Call Reasons</CardTitle>
            <CardDescription>Primary contact drivers — current period</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {isReasonsLoading ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Loading chart…</div>
            ) : reasons ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reasons} layout="vertical" margin={{ top: 5, right: 24, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="reason" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={130} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Bar dataKey="count" name="Volume" fill="#0f62fe" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Digital Engagement KPIs */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <MessageSquare size={13} />
          Digital Engagement Metrics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard title="Chatbot Containment" metric={kpis?.chatbotContainment} isLoading={isKpisLoading} />
          <KpiCard title="Digital Adoption"    metric={kpis?.digitalAdoption}    isLoading={isKpisLoading} />
          <KpiCard title="Cases Opened"        metric={kpis?.casesOpened}        isLoading={isKpisLoading} />
          <KpiCard title="Member Complaints"   metric={kpis?.memberComplaints}   isLoading={isKpisLoading} />
        </div>
      </div>

      {/* IBM summary card */}
      <Card className="border-primary/10 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#0f62fe15" }}>
              <Headphones size={16} style={{ color: "#0f62fe" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">IBM Contact Center Intelligence</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI-driven triage and sentiment analysis route members to the right resolution path before an agent picks up.
                Chatbot containment and digital adoption metrics reflect IBM's shift-left strategy —
                reducing cost per contact while improving member satisfaction scores.
                All live metrics are baselined at programme commencement and tracked against IBM's committed service targets on a monthly governance cadence.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
