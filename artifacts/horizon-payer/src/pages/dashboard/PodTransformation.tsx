import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package, Target, Brain, ShieldCheck, Workflow, Wrench, Users, Sparkles,
  CheckCircle2, Building2, BarChart3, Zap, BookOpen, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import talentJson from "@/data/talentPlan.json";

type TResource = { domain?: string; typeOfWork?: string; location?: string };

const C = {
  blue: "#0f62fe", teal: "#009d9a", purple: "#8a3ffc",
  orange: "#ff832b", green: "#24a148", gray: "#697077",
};
const EXCLUDED = new Set(["Data Area", "DataBase Administrator"]);
const MAX_POD = 10;
const DOMAIN_ACCENT: Record<string, string> = {
  "Horizontal Functions":     C.blue,
  "Health and Network":       C.teal,
  "Service & Administration": C.purple,
  "Corporate Functions":      C.orange,
  "Specialty Business":       "#059669",
  "Market Facing":            "#dc2626",
};

const PHASES = [
  {
    id: 1, label: "Foundation", timeframe: "Months 0–6", color: C.teal, Icon: BookOpen,
    desc: "Pilot pods launched for top 5 business domains. IBM AMS delivery model onboarded. Shared services centralized.",
    milestones: ["5 pilot domains go-live", "IBM AMS onboarding complete", "Pod leads identified", "Backlog pipelines established"],
  },
  {
    id: 2, label: "Scale", timeframe: "Months 6–12", color: C.blue, Icon: Layers,
    desc: "All business domains in cross-functional pods. Shared pods formalized. Value stream fully operational with AI augmentation.",
    milestones: ["All 6 domains in pods", "Digital labor deployed in every pod", "Scrum ceremonies running", "Velocity tracking active"],
  },
  {
    id: 3, label: "Operate", timeframe: "Months 12–18", color: C.purple, Icon: Sparkles,
    desc: "AI-augmented autonomous operations. Continuous improvement cadence established. Full steady-state pod operating model.",
    milestones: ["AI co-pilots in all pods", "Self-healing incident automation", "Pod performance dashboards live", "Innovation sprints running"],
  },
] as const;

const POD_ROLES = [
  { role: "Product Owner",                Icon: Target,     color: C.blue,   dotted: false, shared: false, digital: false, count: 1 },
  { role: "AI Engineer",                  Icon: Brain,      color: C.purple, dotted: false, shared: false, digital: false, count: 1 },
  { role: "QA Engineer",                  Icon: ShieldCheck,color: C.green,  dotted: false, shared: false, digital: false, count: 1 },
  { role: "Data / Integration Eng.",      Icon: Workflow,   color: C.teal,   dotted: false, shared: false, digital: false, count: 1 },
  { role: "Operational Eng. (dotted)",    Icon: Wrench,     color: C.orange, dotted: true,  shared: false, digital: false, count: 1 },
  { role: "Scrum Master (÷ 2 pods)",      Icon: Users,      color: C.gray,   dotted: false, shared: true,  digital: false, count: 0.5 },
  { role: "AI Agents — Digital Labor",    Icon: Sparkles,   color: C.purple, dotted: false, shared: false, digital: true,  count: 2 },
];

export default function PodTransformation() {
  const resources = useMemo(() => (talentJson as { resources: TResource[] }).resources, []);

  const domainData = useMemo(() => {
    const map: Record<string, { total: number; onshore: number; offshore: number }> = {};
    for (const r of resources) {
      if (r.typeOfWork !== "Projects") continue;
      if (EXCLUDED.has(r.domain ?? "")) continue;
      const d = r.domain || "Other";
      map[d] ??= { total: 0, onshore: 0, offshore: 0 };
      map[d].total++;
      if (r.location === "Onshore") map[d].onshore++;
      else map[d].offshore++;
    }
    return Object.entries(map)
      .map(([domain, { total, onshore, offshore }]) => ({
        domain, total, onshore, offshore,
        podCount: Math.ceil(total / MAX_POD),
        aiAgents: Math.ceil(total / MAX_POD) * 2,
        color: DOMAIN_ACCENT[domain] ?? C.gray,
      }))
      .sort((a, b) => b.total - a.total);
  }, [resources]);

  const totalPods   = domainData.reduce((s, d) => s + d.podCount, 0);
  const totalFTEs   = domainData.reduce((s, d) => s + d.total, 0);
  const totalAI     = totalPods * 2;
  const phase1Pods  = domainData.slice(0, 5).reduce((s, d) => s + d.podCount, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge className="text-[10px]" style={{ background: C.blue, color: "#fff" }}>IBM Managed Services</Badge>
            <Badge variant="outline" className="text-[10px]">Horizon BCBS</Badge>
            <Badge variant="outline" className="text-[10px]" style={{ borderColor: C.teal, color: C.teal }}>3-Phase Delivery</Badge>
          </div>
          <h2 className="text-xl font-bold">Pod Transformation Program</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Operating model evolution — from role-based silos to AI-augmented business domain pods
          </p>
        </div>
        <div className="text-right text-[11px] text-muted-foreground hidden sm:block">
          <div className="font-semibold text-foreground">Program Sponsor</div>
          <div>IBM AMS Delivery</div>
          <div>Horizon BCBS Technology</div>
        </div>
      </div>

      {/* ── KPI strip ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Target Pods (Phase 2)", value: totalPods,  sub: `${phase1Pods} pods piloted in Phase 1`, color: C.blue,   Icon: Package    },
          { label: "Project FTEs in Pods",  value: totalFTEs,  sub: "Projects workforce only",              color: C.teal,   Icon: Users      },
          { label: "AI Digital Workers",    value: totalAI,    sub: "2 AI agents per pod",                  color: C.purple, Icon: Sparkles   },
          { label: "Business Domains",      value: domainData.length, sub: "Cross-functional coverage",    color: C.orange, Icon: Building2  },
        ].map(k => (
          <Card key={k.label} className="p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: k.color }} />
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold leading-tight">{k.label}</div>
                <div className="text-3xl font-bold mt-1.5" style={{ color: k.color }}>{k.value}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{k.sub}</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${k.color}12` }}>
                <k.Icon size={18} style={{ color: k.color }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── What We're Doing ────────────────────────────── */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Zap size={14} style={{ color: C.blue }} />
          What We&apos;re Doing — 3-Phase Operating Model
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PHASES.map(ph => {
            const PhIcon = ph.Icon;
            return (
              <Card key={ph.id} className="p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: ph.color }} />
                <div className="flex items-center gap-2 mb-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: ph.color }}
                  >
                    {ph.id}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold" style={{ color: ph.color }}>{ph.label}</div>
                    <div className="text-[10px] text-muted-foreground">{ph.timeframe}</div>
                  </div>
                  <PhIcon size={14} className="ml-auto flex-shrink-0" style={{ color: ph.color }} />
                </div>
                <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">{ph.desc}</p>
                <div className="space-y-1.5">
                  {ph.milestones.map(m => (
                    <div key={m} className="flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 size={11} className="flex-shrink-0" style={{ color: ph.color }} />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── How We're Doing ─────────────────────────────── */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <BarChart3 size={14} style={{ color: C.blue }} />
          How We&apos;re Doing — Domain Transformation Status
        </h3>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  {["Domain", "FTEs", "On / Off", "Pods", "AI Agents", "FTE Scale", "Phase"].map(h => (
                    <th key={h} className="px-3 py-2.5 font-semibold text-[10px] uppercase tracking-wide text-muted-foreground text-left first:px-4 last:text-center">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {domainData.map((d, i) => {
                  const phase     = i < 5 ? 1 : 2;
                  const phaseColor = phase === 1 ? C.teal : C.blue;
                  return (
                    <tr key={d.domain} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color, boxShadow: `0 0 4px ${d.color}60` }} />
                          <span className="font-semibold" style={{ color: d.color }}>{d.domain}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-bold tabular-nums text-center">{d.total}</td>
                      <td className="px-3 py-2.5 text-[11px] text-muted-foreground tabular-nums text-center">
                        <span style={{ color: C.teal }}>{d.onshore}</span>
                        {" / "}
                        <span style={{ color: C.blue }}>{d.offshore}</span>
                      </td>
                      <td className="px-3 py-2.5 font-bold tabular-nums text-center" style={{ color: d.color }}>{d.podCount}</td>
                      <td className="px-3 py-2.5 tabular-nums text-center font-medium" style={{ color: C.purple }}>🤖 {d.aiAgents}</td>
                      <td className="px-3 py-2.5 min-w-[100px]">
                        <div className="flex h-2 rounded-full overflow-hidden bg-muted w-full">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${(d.total / domainData[0].total) * 100}%`, background: d.color }}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge
                          className="text-[9px] h-4 px-1.5"
                          style={{ background: `${phaseColor}15`, color: phaseColor, border: `1px solid ${phaseColor}40` }}
                        >
                          Ph {phase}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted/20 font-semibold border-t-2">
                  <td className="px-4 py-2.5 text-xs">Total</td>
                  <td className="px-3 py-2.5 text-xs text-center">{totalFTEs}</td>
                  <td className="px-3 py-2.5 text-[11px] text-muted-foreground text-center">—</td>
                  <td className="px-3 py-2.5 text-xs text-center" style={{ color: C.blue }}>{totalPods}</td>
                  <td className="px-3 py-2.5 text-xs text-center" style={{ color: C.purple }}>🤖 {totalAI}</td>
                  <td className="px-3 py-2.5" />
                  <td className="px-3 py-2.5 text-center text-[10px] text-muted-foreground">2 phases</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>

      {/* ── Pod Composition Model ───────────────────────── */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Package size={14} style={{ color: C.blue }} />
          Ideal Pod Composition — Standard Role Template
        </h3>
        <Card className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-4">
            {POD_ROLES.map(r => {
              const Icon = r.Icon;
              return (
                <div
                  key={r.role}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-shadow hover:shadow-md",
                    r.digital ? "bg-purple-50 dark:bg-purple-950/20" : "bg-muted/30",
                  )}
                  style={{
                    border: `2px ${r.dotted ? "dashed" : "solid"} ${r.color}${(r.dotted || r.shared) ? "50" : "80"}`,
                  }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${r.color}15` }}>
                    <Icon size={18} style={{ color: r.color }} />
                  </div>
                  <div className="text-[10px] font-bold leading-tight" style={{ color: r.color }}>{r.role}</div>
                  <div className="text-[9px] text-muted-foreground leading-tight">
                    {r.digital ? `×${r.count} per pod` : r.shared ? "÷ 2 pods" : r.dotted ? "dotted-line" : "×1 per pod"}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-[10px] text-muted-foreground border-t pt-3">
            <span>━━ Core member (full-time in pod)</span>
            <span>╌╌ Dotted-line — Ops Eng shared with Run team</span>
            <span>÷ 2 = Scrum Master shared across 2 pods</span>
            <span className="font-medium" style={{ color: C.purple }}>🤖 Digital Labor = AI co-pilot, test-gen, runbook automation</span>
          </div>
        </Card>
      </div>

      {/* ── Program Summary Banner ──────────────────────── */}
      <Card
        className="p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #001141 0%, #0f3460 100%)" }}
      >
        <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: `linear-gradient(90deg, ${C.teal}, ${C.blue}, ${C.purple})` }} />
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-white">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Program Summary</div>
            <div className="text-lg font-bold">
              {totalPods} pods · {totalFTEs} FTEs · {totalAI} AI agents · {domainData.length} business domains
            </div>
            <div className="text-sm opacity-70 mt-0.5">
              Full pod model operational by Month 12 · Autonomous operations by Month 18
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {PHASES.map(ph => (
              <div key={ph.id} className="text-center px-3 py-2 rounded-lg" style={{ background: `${ph.color}25` }}>
                <div className="text-[10px] font-bold" style={{ color: ph.color }}>Phase {ph.id}: {ph.label}</div>
                <div className="text-[10px] text-white/60">{ph.timeframe}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

    </div>
  );
}
