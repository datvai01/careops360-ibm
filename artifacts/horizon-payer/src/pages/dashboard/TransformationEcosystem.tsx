import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";
import {
  Sparkles, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle,
  AlertCircle, Download, RotateCcw, Plus, ChevronRight, ShieldAlert,
  Target, Zap, Users, BarChart2, Brain, Layers, ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const IBM_BLUE   = "#0F62FE";
const IBM_LIGHT  = "#D0E2FF";
const IBM_CYAN   = "#1192E8";
const AMBER      = "#F1C21B";
const GREEN      = "#24A148";
const RED        = "#DA1E28";

const WORKSTREAM_ORDER = [
  "Governance & Operating Model",
  "AIOps & Automation",
  "Agile Adoption",
  "CareOps360 Enablement",
  "Product Model Transformation",
  "Value Realization",
  "Quality Engineering Transition",
];

const KPI_DATA = [
  {
    label: "Transformation Mindset Adoption",
    current: 2.5, target: 4.5, status: "In Progress",
    explanation: "Team is shifting from task completion to outcome ownership.",
    icon: Brain,
  },
  {
    label: "Agile Discipline Maturity",
    current: 2.0, target: 4.5, status: "In Progress",
    explanation: "Ceremonies are running but backlog discipline and retrospectives need reinforcement.",
    icon: Layers,
  },
  {
    label: "Automation-First Behaviors",
    current: 1.8, target: 4.5, status: "At Risk",
    explanation: "Manual handling remains the default; automation intake not yet established.",
    icon: Zap,
  },
  {
    label: "Product Ownership Alignment",
    current: 2.2, target: 4.5, status: "In Progress",
    explanation: "Product model agreed in principle; role alignment and metrics still in progress.",
    icon: Target,
  },
  {
    label: "CareOps360 Governance Adoption",
    current: 3.0, target: 4.5, status: "On Track",
    explanation: "Dashboard reviewed weekly by leadership; decision-tracking behaviour emerging.",
    icon: BarChart2,
  },
  {
    label: "QE Transition Readiness",
    current: 1.5, target: 4.0, status: "At Risk",
    explanation: "Knowledge currently resides with incumbent; IBM ownership plan in early stage.",
    icon: Users,
  },
];

const JOURNEY_STAGES = [
  {
    label: "Stabilize Current Delivery",
    completion: 90,
    owner: "IBM Delivery Lead",
    status: "Completed",
    evidence: [
      "Baseline metrics established across all towers",
      "Incident and ticket SLAs stabilised",
      "Horizon stakeholder relationships onboarded",
    ],
  },
  {
    label: "Align on Transformation Outcomes",
    completion: 75,
    owner: "IBM Program Director",
    status: "On Track",
    evidence: [
      "Value metrics baselined and agreed",
      "Product ownership model documented",
      "Horizon exec alignment session completed",
    ],
  },
  {
    label: "Adopt New Ways of Working",
    completion: 52,
    owner: "IBM CoE Lead",
    status: "In Progress",
    evidence: [
      "Agile ceremonies running across 4 of 7 workstreams",
      "Automation backlog created with 23 candidates",
      "CareOps360 governance cadence adopted",
    ],
  },
  {
    label: "Embed Automation & Governance",
    completion: 28,
    owner: "IBM AIOps Lead",
    status: "In Progress",
    evidence: [
      "AIOps event correlation live in 2 domains",
      "Runbook library seeded with 14 automations",
      "Weekly governance review rhythm established",
    ],
  },
  {
    label: "Operate as Transformation Ecosystem",
    completion: 10,
    owner: "IBM Alliance Executive",
    status: "Planned",
    evidence: [
      "QE transition readiness assessment underway",
      "Product-led KPIs defined; adoption in progress",
      "IBM–Horizon Year 2 strategy being finalised",
    ],
  },
];

const RADAR_DATA = WORKSTREAM_ORDER.map((ws, i) => {
  const defaults: [number, number][] = [
    [2.5, 4.5],
    [1.8, 4.5],
    [2.0, 4.5],
    [3.0, 4.5],
    [2.2, 4.5],
    [2.0, 4.5],
    [1.5, 4.0],
  ];
  return { subject: ws.replace("& ", "& ").replace("Quality Engineering Transition", "QE Transition"), current: defaults[i][0], target: defaults[i][1] };
});

const BAR_DATA = WORKSTREAM_ORDER.map((ws, i) => {
  const pct = [62, 38, 48, 72, 44, 40, 28][i];
  const status = pct >= 65 ? "On Track" : pct >= 40 ? "In Progress" : "At Risk";
  const color = pct >= 65 ? GREEN : pct >= 40 ? AMBER : RED;
  return { workstream: ws.replace("Quality Engineering Transition", "QE Transition"), pct, status, color };
});

const SEED_BEHAVIORS = [
  {
    id: "b1", behavior: "Outcome ownership", workstream: "Governance & Operating Model",
    currentMindset: "Team focuses on completing assigned tasks",
    targetMindset: "Team owns business and operational outcomes",
    owner: "IBM Delivery Lead", adoptionScore: 2.5,
    evidenceNeeded: "Outcome KPIs tracked in governance reviews",
    risk: "Resistance to accountability shift",
    mitigation: "Tie individual OKRs to outcome metrics",
    nextAction: "Baseline outcome KPIs by end of Q2",
  },
  {
    id: "b2", behavior: "Agile discipline", workstream: "Agile Adoption",
    currentMindset: "Agile ceremonies are inconsistent",
    targetMindset: "Teams use backlog discipline, sprint planning, reviews, and retrospectives consistently",
    owner: "IBM CoE Lead", adoptionScore: 2.0,
    evidenceNeeded: "Sprint health metrics published weekly",
    risk: "Ceremonies become checkbox activity",
    mitigation: "Coaching, backlog quality checks, team-level adoption reviews",
    nextAction: "Introduce sprint health scorecard in Q2",
  },
  {
    id: "b3", behavior: "Automation-first thinking", workstream: "AIOps & Automation",
    currentMindset: "Manual issue handling is accepted as normal",
    targetMindset: "Repeatable work is reviewed for automation opportunity",
    owner: "IBM AIOps Lead", adoptionScore: 1.8,
    evidenceNeeded: "Automation intake log reviewed weekly",
    risk: "Automation seen as threat to job security",
    mitigation: "Frame automation as capacity creation, not reduction",
    nextAction: "Launch automation intake process in Q2",
  },
  {
    id: "b4", behavior: "Proactive operations", workstream: "AIOps & Automation",
    currentMindset: "Team responds after incidents occur",
    targetMindset: "Team uses AIOps insights to prevent recurring issues",
    owner: "IBM AIOps Lead", adoptionScore: 2.2,
    evidenceNeeded: "Proactive alert ratio > 60% in AIOps dashboard",
    risk: "AIOps insights ignored in daily operations",
    mitigation: "Embed AIOps review in daily standup agenda",
    nextAction: "Set proactive alert target for Q3",
  },
  {
    id: "b5", behavior: "Governance transparency", workstream: "CareOps360 Enablement",
    currentMindset: "Reporting is manual and fragmented",
    targetMindset: "CareOps360 provides weekly governance visibility",
    owner: "IBM Program Director", adoptionScore: 3.0,
    evidenceNeeded: "CareOps360 used in every weekly governance review",
    risk: "Dashboard becomes a reporting tool, not a governance behaviour",
    mitigation: "Tie CareOps360 usage to decision tracking",
    nextAction: "Add decision log to weekly review template",
  },
  {
    id: "b6", behavior: "Product-based ownership", workstream: "Product Model Transformation",
    currentMindset: "Teams align around projects and tasks",
    targetMindset: "Teams align around products, platforms, and outcomes",
    owner: "IBM Alliance Executive", adoptionScore: 2.2,
    evidenceNeeded: "Product ownership map published and agreed",
    risk: "Product model defined but not adopted day-to-day",
    mitigation: "Align roles, metrics, and decision rights to product teams",
    nextAction: "Publish product ownership RACI by end of Q2",
  },
  {
    id: "b7", behavior: "Value realization", workstream: "Value Realization",
    currentMindset: "Progress is measured through activities",
    targetMindset: "Progress is measured through benefits, KPIs, and value outcomes",
    owner: "IBM Delivery Lead", adoptionScore: 2.0,
    evidenceNeeded: "Value scorecard reviewed monthly by Horizon exec",
    risk: "Value metrics become vanity metrics",
    mitigation: "Tie value KPIs to contract milestones and renewals",
    nextAction: "Publish Q1 value scorecard by end of Q2",
  },
  {
    id: "b8", behavior: "Quality Engineering transition", workstream: "Quality Engineering Transition",
    currentMindset: "QE knowledge sits with incumbent vendor",
    targetMindset: "IBM owns QE process, regression knowledge, automation assets, and defect governance",
    owner: "IBM QE Lead", adoptionScore: 1.5,
    evidenceNeeded: "IBM QE readiness sign-off from Horizon CIO",
    risk: "Transition remains knowledge-transfer focused without mindset shift",
    mitigation: "Shadow/reverse-shadow, quality ownership metrics, automation assessment",
    nextAction: "Complete QE capability assessment by end of Q3",
  },
];

const RISKS = [
  {
    level: "High",
    risk: "Team may continue to operate in task-execution mode.",
    mitigation: "Reinforce outcome-based KPIs, governance reviews, and ownership-based accountability.",
  },
  {
    level: "High",
    risk: "Agile adoption may remain superficial.",
    mitigation: "Use practical coaching, backlog quality checks, sprint health metrics, and team-level adoption reviews.",
  },
  {
    level: "Med",
    risk: "Automation may remain secondary to daily operations.",
    mitigation: "Establish automation intake, prioritisation, and weekly review of repeatable manual work.",
  },
  {
    level: "Med",
    risk: "CareOps360 may become a reporting tool instead of a governance behaviour.",
    mitigation: "Tie CareOps360 usage to weekly leadership reviews and decision tracking.",
  },
  {
    level: "Med",
    risk: "Product model may be defined but not adopted.",
    mitigation: "Align roles, ownership, metrics, and decision rights to product/platform teams.",
  },
  {
    level: "High",
    risk: "QE transition may remain knowledge-transfer focused without mindset shift.",
    mitigation: "Use shadow/reverse-shadow, quality ownership metrics, automation assessment, and IBM readiness sign-off.",
  },
];

const LS_KEY = "cco_transformation_behaviors";

function loadBehaviors() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as typeof SEED_BEHAVIORS;
  } catch { }
  return SEED_BEHAVIORS;
}

function saveBehaviors(rows: typeof SEED_BEHAVIORS) {
  localStorage.setItem(LS_KEY, JSON.stringify(rows));
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = {
    "Completed":    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    "On Track":     { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    "In Progress":  { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200" },
    "At Risk":      { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200" },
    "Planned":      { bg: "bg-slate-50",   text: "text-slate-600",   border: "border-slate-200" },
  }[status] ?? { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", cfg.bg, cfg.text, cfg.border)}>
      {status}
    </span>
  );
}

function ScoreBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = pct >= 70 ? "bg-emerald-500" : pct >= 44 ? "bg-amber-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-600 w-8 text-right">{value}/{max}</span>
    </div>
  );
}

export default function TransformationEcosystem() {
  const [behaviors, setBehaviors] = useState<typeof SEED_BEHAVIORS>(loadBehaviors);
  const [editCell, setEditCell] = useState<{ row: string; col: string } | null>(null);
  const [editVal, setEditVal] = useState("");
  const [wsFilter, setWsFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("");

  useEffect(() => { saveBehaviors(behaviors); }, [behaviors]);

  const commitEdit = useCallback(() => {
    if (!editCell) return;
    setBehaviors(prev => prev.map(b =>
      b.id === editCell.row ? { ...b, [editCell.col]: editCell.col === "adoptionScore" ? parseFloat(editVal) || b.adoptionScore : editVal } : b
    ));
    setEditCell(null);
  }, [editCell, editVal]);

  const resetData = () => { setBehaviors(SEED_BEHAVIORS); localStorage.removeItem(LS_KEY); };

  const exportCsv = () => {
    const cols = ["behavior","currentMindset","targetMindset","workstream","owner","adoptionScore","evidenceNeeded","risk","mitigation","nextAction"] as const;
    const header = ["Behaviour","Current Mindset","Target Mindset","Workstream","Owner","Adoption Score","Evidence Needed","Risk","Mitigation","Next Action"];
    const rows = filtered.map(b => cols.map(c => `"${String(b[c]).replace(/"/g,'""')}"`).join(","));
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "transformation_behaviors.csv"; a.click();
  };

  const addRow = () => {
    const id = `b${Date.now()}`;
    setBehaviors(prev => [...prev, {
      id, behavior: "New Behaviour", workstream: WORKSTREAM_ORDER[0],
      currentMindset: "", targetMindset: "", owner: "", adoptionScore: 1.0,
      evidenceNeeded: "", risk: "", mitigation: "", nextAction: "",
    }]);
  };

  const filtered = behaviors.filter(b => {
    if (wsFilter !== "all" && b.workstream !== wsFilter) return false;
    if (statusFilter !== "all") {
      const pct = (b.adoptionScore / 5) * 100;
      const s = pct >= 65 ? "On Track" : pct >= 40 ? "In Progress" : "At Risk";
      if (s !== statusFilter) return false;
    }
    if (ownerFilter && !b.owner.toLowerCase().includes(ownerFilter.toLowerCase())) return false;
    return true;
  });

  const EDITABLE_COLS: { key: keyof typeof SEED_BEHAVIORS[0]; label: string; width?: string }[] = [
    { key: "behavior",       label: "Behaviour / Capability",  width: "min-w-[140px]" },
    { key: "currentMindset", label: "Current Mindset",         width: "min-w-[180px]" },
    { key: "targetMindset",  label: "Target Mindset",          width: "min-w-[180px]" },
    { key: "workstream",     label: "Workstream",              width: "min-w-[160px]" },
    { key: "owner",          label: "Owner",                   width: "min-w-[120px]" },
    { key: "adoptionScore",  label: "Adoption Score",          width: "min-w-[100px]" },
    { key: "evidenceNeeded", label: "Evidence Needed",         width: "min-w-[160px]" },
    { key: "risk",           label: "Risk",                    width: "min-w-[140px]" },
    { key: "mitigation",     label: "Mitigation",              width: "min-w-[160px]" },
    { key: "nextAction",     label: "Next Action",             width: "min-w-[140px]" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900">
      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-10">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.45, delay: 0 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F62FE] via-[#0353E9] to-[#0043CE] shadow-2xl px-10 py-10 text-white">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-blue-200 text-sm font-medium tracking-wide uppercase">IBM AMS · Transformation Program</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Horizon Transformation Mindset & Ecosystem Dashboard</h1>
            <p className="text-blue-100 text-base mb-5">IBM team transition from steady-state delivery to transformation-led operations</p>
            <p className="text-blue-50/90 text-sm max-w-4xl leading-relaxed mb-6">
              IBM will transition the team into a transformation ecosystem focused on outcome ownership, Agile discipline, automation-first thinking,
              product-based delivery, CareOps360-enabled governance, measurable value realization, and controlled Quality Engineering transition.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Current Stage", value: "Foundation",          icon: "🏗️" },
                { label: "Target Stage",  value: "Transformation-Led",  icon: "🚀" },
                { label: "Overall Health",value: "On Track",            icon: "✅" },
                { label: "Gov Cadence",   value: "Weekly",              icon: "📅" },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
                  <span className="text-base">{b.icon}</span>
                  <div>
                    <p className="text-blue-200 text-xs">{b.label}</p>
                    <p className="text-white font-semibold text-sm">{b.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── KPI Cards ────────────────────────────────────────── */}
        <section>
          <motion.h2 variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.45, delay: 0.07 }}
            className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Transformation KPI Scorecard
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {KPI_DATA.map((k, i) => {
              const pct = (k.current / k.target) * 100;
              const TrendIcon = k.status === "On Track" ? TrendingUp : k.status === "At Risk" ? TrendingDown : Minus;
              const trendColor = k.status === "On Track" ? "text-emerald-600" : k.status === "At Risk" ? "text-red-500" : "text-amber-500";
              const Icon = k.icon;
              return (
                <motion.div key={k.label} variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.45, delay: i * 0.08 + 0.15 }}
                  className="group relative bg-white/70 backdrop-blur-md border border-white/60 shadow-lg rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${IBM_LIGHT}` }}>
                        <Icon className="w-5 h-5" style={{ color: IBM_BLUE }} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendIcon className={cn("w-4 h-4", trendColor)} />
                        <StatusBadge status={k.status} />
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mb-1 leading-snug">{k.label}</p>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">{k.explanation}</p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-3xl font-bold" style={{ color: IBM_BLUE }}>{k.current}</span>
                      <span className="text-slate-400 text-sm">/ 5</span>
                      <span className="ml-auto text-xs text-slate-400">Target {k.target}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: IBM_BLUE }}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{Math.round(pct)}% of target</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Journey Timeline ─────────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.45, delay: 0.35 }}
          className="bg-white border border-slate-100 rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-blue-600" /> Mindset Shift Journey
          </h2>
          <div className="relative">
            <div className="absolute top-7 left-0 right-0 h-0.5 bg-slate-100 mx-8 z-0" />
            <div className="grid grid-cols-5 gap-3">
              {JOURNEY_STAGES.map((stage, i) => {
                const isLast = i === JOURNEY_STAGES.length - 1;
                const dotColor = stage.completion >= 80 ? GREEN : stage.completion >= 40 ? IBM_BLUE : "#94a3b8";
                return (
                  <div key={stage.label} className="flex flex-col items-center text-center group">
                    <motion.div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-md border-4 border-white mb-3 text-white text-sm font-bold"
                      style={{ background: dotColor }}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}>
                      {stage.completion}%
                    </motion.div>
                    <p className="text-xs font-semibold text-slate-800 mb-1 leading-tight">{stage.label}</p>
                    <p className="text-xs text-slate-400 mb-2">{stage.owner}</p>
                    <StatusBadge status={stage.status} />
                    <ul className="mt-3 space-y-1.5 text-left w-full">
                      {stage.evidence.map((e, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-slate-500">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-slate-300" />
                          <span className="leading-tight">{e}</span>
                        </li>
                      ))}
                    </ul>
                    {!isLast && <ChevronRight className="hidden xl:block absolute top-5 right-0 w-4 h-4 text-slate-300" />}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* ── Charts row ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Radar */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.45, delay: 0.4 }}
            className="bg-white border border-slate-100 rounded-2xl shadow-md p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" /> Ecosystem Maturity — Current vs Target
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={RADAR_DATA} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                <Radar name="Current" dataKey="current" stroke={IBM_BLUE} fill={IBM_BLUE} fillOpacity={0.25} strokeWidth={2} dot />
                <Radar name="Target"  dataKey="target"  stroke={IBM_CYAN} fill={IBM_CYAN}  fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 3" />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Horizontal bar */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.45, delay: 0.45 }}
            className="bg-white border border-slate-100 rounded-2xl shadow-md p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" /> Behaviour Adoption by Workstream
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={BAR_DATA} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="workstream" width={160} tick={{ fontSize: 10, fill: "#475569" }} />
                <Tooltip formatter={(v: number) => [`${v}%`, "Adoption"]} />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, formatter: (v: number) => `${v}%` }}>
                  {BAR_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 justify-center">
              {[["On Track", GREEN], ["In Progress", AMBER], ["At Risk", RED]].map(([l, c]) => (
                <div key={l} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-3 h-3 rounded-sm" style={{ background: c as string }} />
                  {l}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Behaviour Tracker ────────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.45, delay: 0.5 }}
          className="bg-white border border-slate-100 rounded-2xl shadow-md p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Transformation Behaviour Tracker
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={wsFilter} onValueChange={setWsFilter}>
                <SelectTrigger className="h-8 text-xs w-48"><SelectValue placeholder="All Workstreams" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workstreams</SelectItem>
                  {WORKSTREAM_ORDER.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs w-36"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="On Track">On Track</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Owner…" value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}
                className="h-8 text-xs w-32" />
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={addRow}>
                <Plus className="w-3 h-3" /> Add Behaviour
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={exportCsv}>
                <Download className="w-3 h-3" /> Export CSV
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 text-slate-500" onClick={resetData}>
                <RotateCcw className="w-3 h-3" /> Reset
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  {EDITABLE_COLS.map(c => (
                    <th key={c.key} className={cn("py-2 px-3 text-left font-semibold text-slate-500 whitespace-nowrap bg-slate-50/60", c.width)}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, ri) => (
                  <tr key={b.id} className={cn("border-b border-slate-50 hover:bg-blue-50/30 transition-colors", ri % 2 === 0 ? "" : "bg-slate-50/30")}>
                    {EDITABLE_COLS.map(c => {
                      const val = b[c.key];
                      const isEditing = editCell?.row === b.id && editCell?.col === c.key;
                      return (
                        <td key={c.key} className={cn("py-2 px-3 align-top", c.width)}
                          onClick={() => { if (!isEditing) { setEditCell({ row: b.id, col: String(c.key) }); setEditVal(String(val)); } }}>
                          {isEditing ? (
                            <input autoFocus value={editVal}
                              className="w-full bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-blue-400"
                              onChange={e => setEditVal(e.target.value)}
                              onBlur={commitEdit} onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditCell(null); }} />
                          ) : c.key === "adoptionScore" ? (
                            <div className="cursor-pointer"><ScoreBar value={Number(val)} /></div>
                          ) : (
                            <span className="cursor-pointer leading-snug text-slate-700 hover:text-blue-700 transition-colors line-clamp-3">
                              {String(val) || <span className="text-slate-300 italic">—</span>}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="py-8 text-center text-slate-400">No rows match the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-3">Click any cell to edit inline. Changes are saved automatically to your browser.</p>
        </motion.section>

        {/* ── Risks ────────────────────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.45, delay: 0.55 }}>
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" /> Risks & Mitigations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RISKS.map((r, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.45, delay: i * 0.06 + 0.55 }}
                className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 flex gap-3 hover:shadow-md transition-shadow">
                <div className="shrink-0 mt-0.5">
                  {r.level === "High"
                    ? <AlertCircle className="w-5 h-5 text-red-500" />
                    : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                      r.level === "High" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700")}>
                      {r.level}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mb-1.5">{r.risk}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <span className="font-semibold text-slate-600">Mitigation: </span>{r.mitigation}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <div className="h-4" />
      </div>
    </div>
  );
}
