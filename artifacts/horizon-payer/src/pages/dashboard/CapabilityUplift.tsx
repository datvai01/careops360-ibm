import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Cell,
} from "recharts";
import {
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
  Users,
  TrendingUp,
  Shield,
  Award,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Target,
  Cpu,
  AlertCircle,
  Info,
  CalendarDays,
  BookOpen,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import TalentPlan from "./TalentPlan";
import { LastRefresh } from "@/components/admin/LastRefresh";
import { HelpHint } from "@/components/admin/HelpHint";

const C = {
  blue: "#0f62fe",
  green: "#24a148",
  teal: "#009d9a",
  purple: "#8a3ffc",
  orange: "#ff832b",
  red: "#da1e28",
};

/* ─────────────────────── DATA TYPES ─────────────────────── */

type ApiKpi = {
  key: string;
  label: string;
  value: number;
  formatted: string;
  sub: string;
  iconKey: string;
  colorKey: string;
  delta: string;
};

type ApiStage = {
  id: string;
  label: string;
  desc: string;
  currentMaturity: number;
  targetMaturity: number;
  status: string;
  position: number;
};

type CapRow = {
  area: string;
  sub: string;
  current: number;
  planned: number;
  priority: "Critical" | "High" | "Medium";
  impact: string;
};

type ApiTrainingEvent = {
  id: string;
  title: string;
  vendor: string;
  track: string;
  date: string;
  endDate: string;
  format: "Virtual" | "In-Person" | "Hybrid";
  seats: number;
  enrolled: number;
  level: "Essentials" | "Associate" | "Professional" | "Expert";
  color: string;
  description: string;
  certificationEarned: string;
};

const ICON_MAP: Record<string, React.ElementType> = {
  award: Award, target: Target, brain: Brain, zap: Zap,
  trendingUp: TrendingUp, shield: Shield, users: Users, cpu: Cpu,
};

function colorFor(key: string): string {
  switch (key) {
    case "blue":   return C.blue;
    case "green":  return C.green;
    case "teal":   return C.teal;
    case "purple": return C.purple;
    case "orange": return C.orange;
    case "red":    return C.red;
    case "violet": return "#8a3ffc";
    default:       return C.blue;
  }
}

function useApi<T>(url: string, fallback: T): T {
  const [data, setData] = useState<T>(fallback);
  useEffect(() => {
    let cancelled = false;
    fetch(url, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((j) => { if (!cancelled) setData(j as T); })
      .catch((e) => { console.warn(`[capability] fetch ${url} failed:`, e); });
    return () => { cancelled = true; };
  }, [url]);
  return data;
}

// Certified headcounts sourced from Certifications_list_13-Apr-2026 (Distinct Count of EmployeeId per category)

/* ─────────────────────── HELPERS ─────────────────────── */

function StrengthBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color, minWidth: 30 }}>{value}%</span>
    </div>
  );
}

function GrowthPill({ current, planned }: { current: number; planned: number }) {
  const pct = Math.round(((planned - current) / Math.max(current, 1)) * 100);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ background: `${C.green}15`, color: C.green }}>
      <ArrowUpRight size={11} />+{pct}%
    </span>
  );
}

function PriorityBadge({ p }: { p: "Critical" | "High" | "Medium" }) {
  const map = {
    Critical: { bg: "#da1e2810", color: C.red, border: "#da1e2830" },
    High:     { bg: "#ff832b10", color: C.orange, border: "#ff832b30" },
    Medium:   { bg: "#0f62fe10", color: C.blue, border: "#0f62fe30" },
  };
  const s = map[p];
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>{p}</span>
  );
}

/* ─────────────────────── SECTIONS ─────────────────────── */

function SectionHeader({ icon: Icon, title, sub, color = C.blue }: { icon: React.ElementType; title: string; sub?: string; color?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ExecSummary() {
  const tiles = useApi<ApiKpi[]>("/api/capability/kpis", []);
  return (
    <div className="space-y-4">
      <SectionHeader icon={Target} title="Executive Summary" sub="IBM delivery capability evolution — current state to AI-autonomous operations" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {tiles.map((t) => {
          const Icon = ICON_MAP[t.iconKey] ?? Award;
          const color = colorFor(t.colorKey);
          return (
            <div key={t.key} className="rounded-xl border p-4 space-y-2 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <Icon size={16} style={{ color }} />
                <span className="text-xs text-muted-foreground">{t.delta}</span>
              </div>
              <div className="text-2xl font-black tracking-tight" style={{ color }}>{t.formatted}</div>
              <div>
                <div className="text-sm font-semibold">{t.label}</div>
                <div className="text-xs text-muted-foreground">{t.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MaturityProgression() {
  const stages = useApi<ApiStage[]>("/api/capability/stages", []);

  // Derive current/target stage indices from API data:
  //   current = first stage with status === "on-track" (the active stage)
  //   target  = last stage with targetMaturity > 50 (the 12-mo goal)
  const current = useMemo(() => {
    const idx = stages.findIndex((s) => s.status === "on-track");
    return idx >= 0 ? idx : 0;
  }, [stages]);
  const target = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < stages.length; i++) {
      if (stages[i].targetMaturity >= 50) idx = i;
    }
    return idx >= 0 ? idx : Math.max(0, stages.length - 1);
  }, [stages]);
  const currentStage = stages[current];
  const targetStage = stages[target];

  return (
    <div className="space-y-4">
      <SectionHeader icon={TrendingUp} title="Capability Maturity Progression" sub="Where IBM delivery sits today and where it will be in 12 months" color={C.teal} />
      <div className="relative">
        {/* track */}
        <div className="flex items-center relative z-0">
          {stages.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center cursor-default">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all shadow-sm"
                      style={{
                        background: i === current ? C.blue : i === target ? C.purple : i < current ? `${C.blue}20` : `${C.purple}10`,
                        borderColor: i === current ? C.blue : i === target ? C.purple : i < current ? `${C.blue}40` : `#e5e7eb`,
                        color: i === current || i === target ? "#fff" : i < current ? C.blue : "var(--muted-foreground)",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-xs font-semibold">{s.label}</div>
                      {i === current && (
                        <div className="mt-0.5 px-1.5 py-0.5 rounded text-xs font-bold"
                          style={{ background: `${C.blue}15`, color: C.blue }}>Current</div>
                      )}
                      {i === target && (
                        <div className="mt-0.5 px-1.5 py-0.5 rounded text-xs font-bold"
                          style={{ background: `${C.purple}15`, color: C.purple }}>12-mo Target</div>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">{s.desc}</TooltipContent>
              </Tooltip>
              {i < stages.length - 1 && (
                <div className="flex-1 h-1 mx-2 rounded-full"
                  style={{ background: i < current ? `linear-gradient(90deg,${C.blue},${C.blue}60)` : i < target ? `linear-gradient(90deg,${C.blue}30,${C.purple}30)` : "#e5e7eb" }} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3 flex items-center gap-3"
            style={{ borderColor: `${C.blue}30`, background: `${C.blue}06` }}>
            <div className="w-3 h-3 rounded-full" style={{ background: C.blue }} />
            <div>
              <div className="text-xs font-bold" style={{ color: C.blue }}>
                Current State{currentStage ? ` — ${currentStage.label}` : ""}
              </div>
              <div className="text-xs text-muted-foreground">
                {currentStage?.desc ?? ""}
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-3 flex items-center gap-3"
            style={{ borderColor: `${C.purple}30`, background: `${C.purple}06` }}>
            <div className="w-3 h-3 rounded-full" style={{ background: C.purple }} />
            <div>
              <div className="text-xs font-bold" style={{ color: C.purple }}>
                12-Month Target{targetStage ? ` — ${targetStage.label}` : ""}
              </div>
              <div className="text-xs text-muted-foreground">
                {targetStage?.desc ?? ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CapabilityTable() {
  const rows = useApi<CapRow[]>("/api/capability/areas", []);
  const [search, setSearch] = useState("");
  const [area, setArea]     = useState("all");
  const [priority, setPri]  = useState("all");
  const [sort, setSort]     = useState<"growth" | "current" | "planned">("current");

  const areas = useMemo(
    () => ["all", ...Array.from(new Set(rows.map(r => r.area)))],
    [rows],
  );

  const filtered = rows
    .filter(r =>
      (area === "all" || r.area === area) &&
      (priority === "all" || r.priority === priority) &&
      (r.area.toLowerCase().includes(search.toLowerCase()) || r.sub.toLowerCase().includes(search.toLowerCase()) || r.impact.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sort === "growth") return ((b.planned - b.current) / Math.max(b.current,1)) - ((a.planned - a.current) / Math.max(a.current,1));
      if (sort === "current") return b.current - a.current;
      return b.planned - a.planned;
    });

  return (
    <div className="space-y-4">
      <SectionHeader icon={Award} title="Current vs Planned Capability" sub="Certified resource counts by skill area — filterable and sortable" color={C.purple} />
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8 h-8 text-xs" placeholder="Search capability areas…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={area} onValueChange={setArea}>
          <SelectTrigger className="h-8 text-xs w-52"><SelectValue placeholder="All Areas" /></SelectTrigger>
          <SelectContent>
            {areas.map(a => <SelectItem key={a} value={a} className="text-xs">{a === "all" ? "All Areas" : a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPri}>
          <SelectTrigger className="h-8 text-xs w-36"><SelectValue placeholder="All Priority" /></SelectTrigger>
          <SelectContent>
            {["all","Critical","High","Medium"].map(p => <SelectItem key={p} value={p} className="text-xs">{p === "all" ? "All Priority" : p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={v => setSort(v as any)}>
          <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="growth" className="text-xs">Sort: Growth %</SelectItem>
            <SelectItem value="current" className="text-xs">Sort: Current</SelectItem>
            <SelectItem value="planned" className="text-xs">Sort: Planned</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs font-bold">Capability Area</TableHead>
              <TableHead className="text-xs font-bold">Sub-Capability</TableHead>
              <TableHead className="text-xs font-bold text-center">Current</TableHead>
              <TableHead className="text-xs font-bold text-center">Planned</TableHead>
              <TableHead className="text-xs font-bold text-center">Growth</TableHead>
              <TableHead className="text-xs font-bold">Priority</TableHead>
              <TableHead className="text-xs font-bold">Business Impact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r, i) => (
              <TableRow key={i} className="hover:bg-muted/30 transition-colors text-sm">
                <TableCell className="font-semibold text-xs">{r.area}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.sub}</TableCell>
                <TableCell className="text-center font-bold tabular-nums">{r.current}</TableCell>
                <TableCell className="text-center font-bold tabular-nums" style={{ color: C.blue }}>{r.planned}</TableCell>
                <TableCell className="text-center"><GrowthPill current={r.current} planned={r.planned} /></TableCell>
                <TableCell><PriorityBadge p={r.priority} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.impact}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">No capability areas match the current filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}



type WorkforceBullet = { side: "current" | "target"; bullet: string };

function WorkforceTransformation() {
  const rows = useApi<WorkforceBullet[]>("/api/capability/workforce-transformation", []);
  const currentBullets = rows.filter((r) => r.side === "current").map((r) => r.bullet);
  const targetBullets = rows.filter((r) => r.side === "target").map((r) => r.bullet);

  return (
    <div className="space-y-4">
      <SectionHeader icon={Users} title="Workforce Transformation" sub="From reactive, manual operations to AI-assisted and autonomous delivery" color={C.teal} />
      <div className="grid md:grid-cols-2 gap-4">
        {/* FROM */}
        <div className="rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.red }} />
            <span className="text-sm font-bold text-muted-foreground">Current Model</span>
          </div>
          {currentBullets.map(x => (
            <div key={x} className="flex items-start gap-2 text-sm">
              <AlertCircle size={13} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{x}</span>
            </div>
          ))}
        </div>
        {/* TO */}
        <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: `${C.green}30`, background: `${C.green}05` }}>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.green }} />
            <span className="text-sm font-bold" style={{ color: C.green }}>Target Model (Month 12)</span>
          </div>
          {targetBullets.map(x => (
            <div key={x} className="flex items-start gap-2 text-sm">
              <CheckCircle2 size={13} style={{ color: C.green }} className="mt-0.5 flex-shrink-0" />
              <span>{x}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



/* ─────────────────────── TRAINING CALENDAR ─────────────────────── */

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function TrainingCalendar() {
  const events = useApi<ApiTrainingEvent[]>("/api/capability/training", []);
  const [filterVendor, setFilterVendor] = useState("all");
  const [filterTrack, setFilterTrack]   = useState("all");

  const vendors = useMemo(
    () => ["all", ...Array.from(new Set(events.map(e => e.vendor).filter(Boolean)))],
    [events],
  );
  const tracks = useMemo(
    () => ["all", ...Array.from(new Set(events.map(e => e.track).filter(Boolean)))],
    [events],
  );

  const filtered = events.filter(e =>
    (filterVendor === "all" || e.vendor === filterVendor) &&
    (filterTrack  === "all" || e.track  === filterTrack)
  );

  const totalSeats = events.reduce((s, e) => s + e.seats, 0);
  const certCount  = events.length;

  // Derive delivery mode summary from training rows (no hardcoded copy)
  const deliveryMode = useMemo(() => {
    if (events.length === 0) return "—";
    const counts: Record<string, number> = {};
    for (const e of events) counts[e.format] = (counts[e.format] ?? 0) + 1;
    const total = events.length;
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const [topFormat, topCount] = sorted[0];
    const pct = Math.round((topCount / total) * 100);
    if (sorted.length === 1 || pct >= 100) return `100% ${topFormat}`;
    return `${pct}% ${topFormat}`;
  }, [events]);

  // Build vendor color legend dynamically from events
  const vendorColors = useMemo(() => {
    const out: Record<string, string> = {};
    for (const ev of events) {
      if (ev.vendor && !out[ev.vendor]) out[ev.vendor] = ev.color;
    }
    return out;
  }, [events]);

  // Build month list from event dates (YYYY-MM)
  const months = useMemo(() => {
    const keys = Array.from(new Set(events.map(e => e.date.slice(0, 7)))).sort();
    return keys.map(key => {
      const [y, m] = key.split("-");
      const d = new Date(Number(y), Number(m) - 1, 1);
      return {
        key,
        label: d.toLocaleDateString("en-US", { month: "short" }),
        full:  d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      };
    });
  }, [events]);

  const levelColors: Record<string, string> = {
    Essentials: "#24a148", Associate: "#0f62fe", Professional: "#8a3ffc", Expert: "#da1e28",
  };

  return (
    <div className="space-y-4">
      <SectionHeader icon={CalendarDays} title="Bootcamp & Learning Calendar" sub="Upcoming bootcamps and lunch & learns — May through November 2026" color={C.teal} />

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Programmes", value: String(certCount), color: C.blue },
          { label: "Total Seats", value: String(totalSeats), color: C.teal },
          { label: "Delivery Mode", value: deliveryMode, color: C.green },
        ].map(k => (
          <div key={k.label} className="rounded-lg border p-2.5 space-y-0.5">
            <div className="text-xl font-black tabular-nums" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + legend */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filterVendor} onValueChange={setFilterVendor}>
          <SelectTrigger className="h-7 text-xs w-36"><SelectValue placeholder="All Vendors" /></SelectTrigger>
          <SelectContent>
            {vendors.map(v => <SelectItem key={v} value={v} className="text-xs">{v === "all" ? "All Vendors" : v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterTrack} onValueChange={setFilterTrack}>
          <SelectTrigger className="h-7 text-xs w-40"><SelectValue placeholder="All Tracks" /></SelectTrigger>
          <SelectContent>
            {tracks.map(t => <SelectItem key={t} value={t} className="text-xs">{t === "all" ? "All Tracks" : t}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        {Object.entries(vendorColors).map(([v, col]) => (
          <div key={v} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: col }} />
            <span className="text-xs text-muted-foreground">{v}</span>
          </div>
        ))}
      </div>

      {/* Compact monthly calendar grid */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/40 border-b">
              <th className="text-left text-xs font-bold px-3 py-2 w-16 text-muted-foreground">Month</th>
              <th className="text-left text-xs font-bold px-3 py-2 text-muted-foreground">Events</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month, mi) => {
              const monthEvents = filtered.filter(e => e.date.startsWith(month.key));
              if (monthEvents.length === 0) return null;
              return (
                <tr key={month.key} className={cn("border-b last:border-0", mi % 2 === 0 ? "bg-background" : "bg-muted/20")}>
                  <td className="px-3 py-2 align-top">
                    <div className="text-xs font-bold text-muted-foreground whitespace-nowrap pt-0.5">{month.label}</div>
                    <div className="text-xs text-muted-foreground">{monthEvents.length} event{monthEvents.length > 1 ? "s" : ""}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {monthEvents.map(ev => {
                        const days = Math.round((new Date(ev.endDate).getTime() - new Date(ev.date).getTime()) / 86400000) + 1;
                        return (
                          <Tooltip key={ev.id} delayDuration={100}>
                            <TooltipTrigger asChild>
                              <div
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium cursor-default transition-all hover:shadow-md hover:scale-[1.02]"
                                style={{
                                  borderColor: `${ev.color}40`,
                                  background: `${ev.color}08`,
                                  color: "var(--foreground)",
                                }}
                              >
                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                                <span>{ev.title}</span>
                                <span className="text-muted-foreground flex-shrink-0">{fmtDate(ev.date)}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start" className="p-0 overflow-hidden max-w-xs bg-background text-foreground border border-border shadow-xl rounded-xl" sideOffset={6}>
                              <div className="p-3 space-y-2.5" style={{ borderTop: `3px solid ${ev.color}` }}>
                                {/* Header */}
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                    <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: `${ev.color}25`, color: ev.color }}>{ev.vendor}</span>
                                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: `${levelColors[ev.level]}20`, color: levelColors[ev.level] }}>{ev.level}</span>
                                  </div>
                                  <div className="font-semibold text-sm leading-snug">{ev.title}</div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {fmtDate(ev.date)} – {fmtDate(ev.endDate)} · {days}d · {ev.track}
                                  </div>
                                </div>
                                {/* Description */}
                                <p className="text-xs text-muted-foreground leading-relaxed">{ev.description}</p>
                                {/* Cert */}
                                <div className="flex items-start gap-1.5 pt-1 border-t">
                                  <Award size={11} style={{ color: ev.color }} className="mt-0.5 flex-shrink-0" />
                                  <div className="text-xs">
                                    <span className="font-semibold">Credential: </span>
                                    <span className="text-muted-foreground">{ev.certificationEarned}</span>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">No training events match the selected filters.</div>
      )}
    </div>
  );
}

/* ─────────────────────── PAGE ─────────────────────── */

export default function CapabilityUplift() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.purple }} />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">IBM Delivery Capability</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Skills & Enablement</h1>
        <p className="text-muted-foreground mt-1">IBM capability evolution and structured learning directly enabling Horizon transformation outcomes</p>
        <div className="flex items-center gap-2 mt-2">
          <LastRefresh datasetKey="capability-uplift" variant="compact" />
          <HelpHint
            title="Skills & Enablement"
            description="Capability maturity, bootcamp calendar, and the linked Talent Plan. Sourced from the Capability Uplift workbook."
            tables={["capability_uplift", "capability_skill_matrix", "talent_plan_resources"]}
            datasetKey="capability-uplift"
            adminAction="Upload the Capability Uplift workbook to refresh maturity progression, bootcamps, and table view."
          />
        </div>
      </div>

      {/* Tab layout */}
      <Tabs defaultValue="exec-summary">
        <TabsList className="h-9">
          <TabsTrigger value="exec-summary" className="text-xs px-4">Executive Summary</TabsTrigger>
          <TabsTrigger value="maturity" className="text-xs px-4">Capability Maturity</TabsTrigger>
          <TabsTrigger value="bootcamps" className="text-xs px-4">Bootcamp Calendar</TabsTrigger>
          <TabsTrigger value="talent-plan" className="text-xs px-4">Talent Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="exec-summary" className="mt-6 space-y-10">
          <ExecSummary />
          <WorkforceTransformation />
        </TabsContent>

        <TabsContent value="maturity" className="mt-6 space-y-10">
          <MaturityProgression />
          <CapabilityTable />
        </TabsContent>

        <TabsContent value="bootcamps" className="mt-6">
          <TrainingCalendar />
        </TabsContent>

        <TabsContent value="talent-plan" className="mt-6">
          <TalentPlan />
        </TabsContent>
      </Tabs>
    </div>
  );
}
