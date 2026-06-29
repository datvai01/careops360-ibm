import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Rocket, Flag, CalendarDays, Layers, GitMerge, ShieldCheck, Activity,
  Gauge, Building2, Workflow, Target, CheckCircle2, Clock, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/components/ui/tooltip";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  Cell, LabelList, Tooltip as RTooltip,
} from "recharts";
import transitionJson from "@/data/transitionPlan.json";

const C = {
  blue: "#0f62fe", teal: "#009d9a", purple: "#8a3ffc",
  orange: "#ff832b", green: "#24a148", red: "#da1e28",
  yellow: "#f1c21b", gray: "#697077",
};

type Task = {
  id: string; workstream: string; phase: string; task: string;
  ibmOwner: string; horizonOwner: string; start: string; end: string;
  durationDays: number; startDay: number; endDay: number;
  dependencies: string; deliverable: string; successMetric: string;
  status: string; priority: string; percentComplete: number; rag: string; notes: string;
};
type Milestone = { id: string; label: string; phase: string; workstream: string; day: number; date: string };
type Plan = {
  meta: { projectStart: string; projectEnd: string; totalDays: number; title: string; subtitle: string };
  phases: { name: string; idx: number }[];
  workstreams: string[];
  tasks: Task[];
  milestones: Milestone[];
};

const plan = transitionJson as Plan;

// Phase visual metadata + grouping into Foundational vs Transformational
const PHASE_META: Record<string, { color: string; short: string; group: "Foundational" | "Transformational"; Icon: any; desc: string }> = {
  "0-30 Foundation": {
    color: C.teal, short: "Foundation", group: "Foundational", Icon: ShieldCheck,
    desc: "Days 0–30 — mobilize teams, confirm scope & governance, baseline current state, and stand up environments.",
  },
  "31-60 Production Ready": {
    color: C.blue, short: "Production Ready", group: "Transformational", Icon: Rocket,
    desc: "Days 31–60 — first automations, MVP builds and pilot capabilities move toward production readiness.",
  },
  "61-90 Standardize & Integrate": {
    color: C.purple, short: "Standardize & Integrate", group: "Transformational", Icon: GitMerge,
    desc: "Days 61–90 — standardize patterns, integrate workstreams, and harden the operating model.",
  },
  "91-180 Scale & Optimize": {
    color: C.orange, short: "Scale & Optimize", group: "Transformational", Icon: Gauge,
    desc: "Days 91–180 — scale across the estate, optimize value, and transition to steady-state run.",
  },
};

const WS_META: Record<string, { color: string; Icon: any; short: string }> = {
  "Overall Transition":    { color: C.gray,   Icon: Workflow,    short: "Transition" },
  "Quality Engineering":   { color: C.green,  Icon: ShieldCheck, short: "Quality Eng." },
  "AIOps Implementation":  { color: C.purple, Icon: Activity,    short: "AIOps" },
  "CareOps360":            { color: C.blue,   Icon: Building2,   short: "CareOps360" },
  "Agile Product Model":   { color: C.orange, Icon: Target,      short: "Agile/Product" },
};

// Day -> percentage across the timeline.
// Tasks use inclusive day ranges (startDay..endDay), so the span is endDay - startDay + 1.
// The timeline runs from day 0 through the last task's end day (inclusive).
const LAST_DAY = Math.max(...plan.tasks.map(t => t.endDay));
const TOTAL = LAST_DAY + 1;
const pct = (day: number) => `${Math.max(0, Math.min(100, (day / TOTAL) * 100))}%`;
const spanPct = (startDay: number, endDay: number) =>
  Math.max(1.2, ((endDay - startDay + 1) / TOTAL) * 100);

function TaskDetail({ t, isMilestone }: { t: Task; isMilestone: boolean }) {
  const m = PHASE_META[t.phase];
  const w = WS_META[t.workstream];
  const statusColor =
    t.status === "Complete" || t.status === "Completed" ? C.green
    : t.status === "In Progress" ? C.blue
    : t.status === "Blocked" || t.status === "At Risk" ? C.red
    : C.gray;
  return (
    <div className="w-72 text-left">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="font-mono text-[9px] px-1 py-0.5 rounded" style={{ background: `${m?.color}22`, color: m?.color }}>{t.id}</span>
        {isMilestone && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold" style={{ color: C.yellow }}>
            <Flag size={9} /> Milestone
          </span>
        )}
        <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${statusColor}22`, color: statusColor }}>
          {t.status}
        </span>
      </div>
      <div className="text-[12px] font-semibold leading-snug mb-1.5">{t.task.replace(/^\[QE\]\s*/, "")}</div>

      <div className="flex flex-wrap gap-1 mb-2">
        <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${w?.color}22`, color: w?.color }}>{t.workstream}</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${m?.color}22`, color: m?.color }}>{m?.short ?? t.phase}</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{t.priority} priority</span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] mb-2">
        <div><span className="text-muted-foreground">Start</span><div className="font-medium">{t.start}</div></div>
        <div><span className="text-muted-foreground">End</span><div className="font-medium">{t.end}</div></div>
        <div><span className="text-muted-foreground">Duration</span><div className="font-medium">{t.durationDays} days</div></div>
        <div><span className="text-muted-foreground">Progress</span><div className="font-medium">{t.percentComplete}% complete</div></div>
      </div>

      <div className="space-y-1 text-[10px]">
        <div><span className="text-muted-foreground">IBM owner: </span><span className="font-medium">{t.ibmOwner}</span></div>
        <div><span className="text-muted-foreground">Horizon owner: </span><span className="font-medium">{t.horizonOwner}</span></div>
        {t.deliverable && (
          <div><span className="text-muted-foreground">Deliverable: </span><span className="font-medium">{t.deliverable}</span></div>
        )}
        {t.successMetric && (
          <div><span className="text-muted-foreground">Success metric: </span><span className="font-medium">{t.successMetric}</span></div>
        )}
        {t.dependencies && (
          <div><span className="text-muted-foreground">Depends on: </span><span className="font-medium">{t.dependencies}</span></div>
        )}
      </div>
    </div>
  );
}
const monthMarks = [
  { day: 0, label: "Jul" }, { day: 31, label: "Aug" }, { day: 62, label: "Sep" },
  { day: 92, label: "Oct" }, { day: 123, label: "Nov" }, { day: 153, label: "Dec" },
];
// Phase boundaries (calendar months) for background bands
const PHASE_BANDS = [
  { name: "0-30 Foundation", from: 0, to: 30 },
  { name: "31-60 Production Ready", from: 30, to: 60 },
  { name: "61-90 Standardize & Integrate", from: 60, to: 90 },
  { name: "91-180 Scale & Optimize", from: 90, to: 180 },
];

export default function Transition() {
  const [wsFilter, setWsFilter] = useState<string | "All">("All");

  const tasks = plan.tasks;
  const totalTasks = tasks.length;
  const highPriority = tasks.filter(t => t.priority === "High").length;

  // Tasks per phase (for chart)
  const phaseChart = useMemo(() => plan.phases.map(p => {
    const inPh = tasks.filter(t => t.phase === p.name);
    return {
      name: PHASE_META[p.name]?.short ?? p.name,
      full: p.name,
      tasks: inPh.length,
      color: PHASE_META[p.name]?.color ?? C.gray,
    };
  }), [tasks]);

  // Stacked effort: tasks per phase split by workstream
  const stackedPhase = useMemo(() => plan.phases.map(p => {
    const row: Record<string, any> = { name: PHASE_META[p.name]?.short ?? p.name };
    for (const w of plan.workstreams) {
      row[w] = tasks.filter(t => t.phase === p.name && t.workstream === w).length;
    }
    return row;
  }), [tasks]);

  const ganttWorkstreams = wsFilter === "All" ? plan.workstreams : [wsFilter];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge className="text-[10px]" style={{ background: C.blue, color: "#fff" }}>IBM Managed Services</Badge>
            <Badge variant="outline" className="text-[10px]">Horizon BCBS</Badge>
            <Badge variant="outline" className="text-[10px]" style={{ borderColor: C.teal, color: C.teal }}>180-Day Plan</Badge>
          </div>
          <h2 className="text-xl font-bold">Transition Program Timeline</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {plan.meta.title} — {plan.meta.subtitle}
          </p>
        </div>
        <div className="text-right text-[11px] text-muted-foreground hidden sm:block">
          <div className="font-semibold text-foreground">Program Window</div>
          <div>{plan.meta.projectStart} → {plan.meta.projectEnd}</div>
          <div>{TOTAL} days · 4 phases</div>
        </div>
      </div>

      {/* ── KPI strip ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Program Duration", value: `${TOTAL}d`, sub: "Jul 1 – Dec 26, 2026", color: C.blue, Icon: CalendarDays },
          { label: "Planned Activities", value: totalTasks, sub: `${highPriority} high priority`, color: C.teal, Icon: Layers },
          { label: "Workstreams", value: plan.workstreams.length, sub: "Parallel delivery tracks", color: C.purple, Icon: Workflow },
          { label: "Delivery Phases", value: plan.phases.length, sub: "Foundation → Scale", color: C.orange, Icon: Flag },
          { label: "Key Milestones", value: plan.milestones.length, sub: "Across all phases", color: C.green, Icon: CheckCircle2 },
        ].map(k => (
          <Card key={k.label} className="p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: k.color }} />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold leading-tight">{k.label}</div>
                <div className="text-2xl font-bold mt-1">{k.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>
              </div>
              <k.Icon size={18} style={{ color: k.color }} />
            </div>
          </Card>
        ))}
      </div>

      {/* ── Phase journey (Foundational vs Transformational) ── */}
      {(["Foundational", "Transformational"] as const).map(group => {
        const groupPhases = plan.phases.filter(p => PHASE_META[p.name]?.group === group);
        const accent = group === "Foundational" ? C.teal : C.blue;
        return (
          <div key={group}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-5 rounded-full" style={{ background: accent }} />
              <h3 className="text-sm font-bold">{group} Phases</h3>
              <span className="text-[11px] text-muted-foreground">
                {group === "Foundational" ? "Stabilize, baseline and stand up the program" : "Build, integrate, scale and optimize toward steady state"}
              </span>
            </div>
            <div className={cn("grid gap-3", groupPhases.length === 1 ? "md:grid-cols-1" : "md:grid-cols-3")}>
              {groupPhases.map(p => {
                const m = PHASE_META[p.name];
                const inPh = tasks.filter(t => t.phase === p.name);
                const phaseMilestones = plan.milestones.filter(ms => ms.phase === p.name);
                return (
                  <Card key={p.name} className="p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-1" style={{ background: m.color }} />
                    <div className="flex items-center gap-2 mb-1.5 pl-1.5">
                      <m.Icon size={16} style={{ color: m.color }} />
                      <div className="font-bold text-sm">{m.short}</div>
                      <Badge variant="outline" className="text-[9px] ml-auto" style={{ borderColor: m.color, color: m.color }}>
                        {inPh.length} tasks
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug pl-1.5 mb-2">{m.desc}</p>
                    <div className="pl-1.5 space-y-1">
                      {phaseMilestones.map(ms => (
                        <div key={ms.id} className="flex items-start gap-1.5 text-[10px]">
                          <Flag size={10} className="mt-0.5 flex-shrink-0" style={{ color: m.color }} />
                          <span className="text-muted-foreground leading-tight">{ms.label}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── Gantt chart ─────────────────────────────────── */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays size={16} style={{ color: C.blue }} />
              <h3 className="text-sm font-bold">180-Day Transition Gantt</h3>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Activities by workstream across the timeline. Diamonds mark key milestones; color encodes phase.
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setWsFilter("All")}
              className={cn("text-[10px] px-2 py-1 rounded border transition-colors",
                wsFilter === "All" ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:bg-muted")}
            >All</button>
            {plan.workstreams.map(w => (
              <button
                key={w}
                onClick={() => setWsFilter(w)}
                className={cn("text-[10px] px-2 py-1 rounded border transition-colors",
                  wsFilter === w ? "text-white border-transparent" : "border-border text-muted-foreground hover:bg-muted")}
                style={wsFilter === w ? { background: WS_META[w].color } : undefined}
              >{WS_META[w]?.short ?? w}</button>
            ))}
          </div>
        </div>

        {/* Phase legend */}
        <div className="flex flex-wrap gap-3 mb-2">
          {plan.phases.map(p => (
            <div key={p.name} className="flex items-center gap-1.5 text-[10px]">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PHASE_META[p.name]?.color }} />
              <span className="text-muted-foreground">{PHASE_META[p.name]?.short}</span>
            </div>
          ))}
        </div>

        {/* Timeline scale */}
        <div className="relative h-5 ml-[150px] border-b border-border">
          {monthMarks.map(mk => (
            <div key={mk.label} className="absolute top-0 text-[10px] text-muted-foreground font-medium" style={{ left: pct(mk.day) }}>
              {mk.label}
            </div>
          ))}
          {[30, 60, 90].map(d => (
            <div key={d} className="absolute top-0 bottom-0 border-l border-dashed border-border/70" style={{ left: pct(d) }}>
              <span className="absolute -top-0.5 left-1 text-[8px] text-muted-foreground whitespace-nowrap">Day {d}</span>
            </div>
          ))}
        </div>

        {/* Gantt rows grouped by workstream */}
        <TooltipProvider delayDuration={100}>
        <div className="mt-1 space-y-3">
          {ganttWorkstreams.map(w => {
            const wTasks = tasks.filter(t => t.workstream === w).sort((a, b) => a.startDay - b.startDay);
            const wMeta = WS_META[w];
            return (
              <div key={w}>
                <div className="flex items-center gap-1.5 mb-1">
                  <wMeta.Icon size={13} style={{ color: wMeta.color }} />
                  <span className="text-[11px] font-semibold">{w}</span>
                  <span className="text-[10px] text-muted-foreground">({wTasks.length})</span>
                </div>
                <div className="space-y-[3px]">
                  {wTasks.map(t => {
                    const left = pct(t.startDay);
                    const width = `${spanPct(t.startDay, t.endDay)}%`;
                    const color = PHASE_META[t.phase]?.color ?? C.gray;
                    const isMilestone = plan.milestones.some(ms => ms.id === t.id);
                    return (
                      <div key={t.id} className="flex items-center gap-2 group">
                        <div className="w-[142px] flex-shrink-0 text-[10px] text-muted-foreground truncate" title={t.task}>
                          <span className="font-mono text-[9px] mr-1" style={{ color }}>{t.id}</span>
                          {t.task.replace(/^\[QE\]\s*/, "")}
                        </div>
                        <div className="relative flex-1 h-4">
                          {/* phase background bands */}
                          {PHASE_BANDS.map(b => (
                            <div key={b.name} className="absolute top-0 bottom-0"
                              style={{ left: pct(b.from), width: `${((b.to - b.from) / TOTAL) * 100}%`,
                                background: PHASE_META[b.name]?.color, opacity: 0.05 }} />
                          ))}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute top-0.5 h-3 rounded-sm flex items-center cursor-pointer transition-all hover:brightness-110 hover:ring-1 hover:ring-foreground/40"
                                style={{ left, width, background: color }}
                              >
                                {t.percentComplete > 0 && (
                                  <div className="h-full rounded-sm bg-white/35" style={{ width: `${t.percentComplete}%` }} />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start" className="p-3 bg-popover text-popover-foreground border shadow-lg">
                              <TaskDetail t={t} isMilestone={isMilestone} />
                            </TooltipContent>
                          </Tooltip>
                          {isMilestone && (
                            <div
                              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 border border-white shadow pointer-events-none"
                              style={{ left: `calc(${pct(t.endDay)} - 5px)`, background: C.yellow }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        </TooltipProvider>

        <div className="flex items-center gap-4 mt-3 pt-2 border-t text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rotate-45 inline-block" style={{ background: C.yellow }} /> Key milestone</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm inline-block bg-white/40 border border-border" /> % complete overlay</span>
          <span>Dashed lines = phase boundaries (Day 30 / 60 / 90)</span>
        </div>
      </Card>

      {/* ── Supporting charts ───────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-bold mb-0.5">Activities by Phase</h3>
          <p className="text-[11px] text-muted-foreground mb-2">Planned activity count per delivery phase</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={phaseChart} margin={{ top: 18, right: 12, left: -12, bottom: 2 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <RTooltip formatter={(v: number) => [`${v} tasks`, "Planned"]} />
              <Bar dataKey="tasks" radius={[5, 5, 0, 0]} barSize={48}>
                {phaseChart.map((p, i) => <Cell key={i} fill={p.color} />)}
                <LabelList dataKey="tasks" position="top" style={{ fontWeight: 700, fontSize: 12, fill: "hsl(var(--foreground))" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-bold mb-0.5">Workstream Effort Across Phases</h3>
          <p className="text-[11px] text-muted-foreground mb-2">Activities per phase, stacked by workstream</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stackedPhase} margin={{ top: 8, right: 12, left: -12, bottom: 2 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <RTooltip />
              <Legend iconSize={9} wrapperStyle={{ fontSize: 9 }} formatter={(v: string) => WS_META[v]?.short ?? v} />
              {plan.workstreams.map((w, i) => (
                <Bar key={w} dataKey={w} stackId="a" fill={WS_META[w]?.color}
                  radius={i === plan.workstreams.length - 1 ? [4, 4, 0, 0] : undefined} barSize={48} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Milestone register ──────────────────────────── */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flag size={16} style={{ color: C.green }} />
          <h3 className="text-sm font-bold">Milestone Register</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          {plan.milestones.slice().sort((a, b) => a.day - b.day).map(ms => {
            const m = PHASE_META[ms.phase];
            const wMeta = WS_META[ms.workstream];
            return (
              <div key={ms.id} className="flex items-center gap-3 rounded-md border border-border p-2.5"
                style={{ borderLeftColor: m?.color, borderLeftWidth: 3 }}>
                <div className="flex flex-col items-center justify-center flex-shrink-0 w-12">
                  <Clock size={12} className="text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground mt-0.5">Day {ms.day}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium leading-tight truncate" title={ms.label}>{ms.label}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="outline" className="text-[8px]" style={{ borderColor: wMeta?.color, color: wMeta?.color }}>
                      {wMeta?.short ?? ms.workstream}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground">{ms.date}</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground italic mt-3">
          Timeline, activities and milestones are sourced from the Horizon 180-Day Transition project plan (QE, AIOps, CareOps360 & Agile/Product model). Dates assume a July 1, 2026 program start.
        </p>
      </Card>
    </div>
  );
}
