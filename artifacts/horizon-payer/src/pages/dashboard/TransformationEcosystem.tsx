import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend,
} from "recharts";
import {
  Sparkles, CheckCircle2,
  Download, RotateCcw, Plus,
  ClipboardList, Send, History, ChevronDown,
  ChevronUp, TrendingUp, TrendingDown, Minus, Clock, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const IBM_BLUE  = "#0F62FE";
const IBM_CYAN  = "#1192E8";
const AMBER     = "#F1C21B";
const GREEN     = "#24A148";
const RED       = "#DA1E28";

const WORKSTREAM_ORDER = [
  "Governance & Operating Model",
  "AIOps & Automation",
  "Agile Adoption",
  "CareOps360 Enablement",
  "Product Model Transformation",
  "Value Realization",
  "Quality Engineering Transition",
];

const SCALE_LABELS: Record<number, string> = {
  1: "Not Started",
  2: "Early Signs",
  3: "In Progress",
  4: "Well Embedded",
  5: "Fully Embedded",
};

const SURVEY_QUESTIONS = [
  {
    id: "q1",
    workstream: "Governance & Operating Model",
    question: "The team consistently focuses on business outcomes rather than completing tasks. Accountability is tied to value delivery, not activity.",
    hint: "Consider: Do team members own outcomes, or just close tickets?",
  },
  {
    id: "q2",
    workstream: "AIOps & Automation",
    question: "Repeatable work is actively reviewed for automation opportunities. AIOps insights are used proactively to prevent recurring incidents.",
    hint: "Consider: Is automation a backlog priority, or only discussed reactively?",
  },
  {
    id: "q3",
    workstream: "Agile Adoption",
    question: "Agile ceremonies run consistently across workstreams with genuine backlog discipline, meaningful retrospectives, and sprint health tracking.",
    hint: "Consider: Are sprints planned and reviewed, or are they just a naming convention?",
  },
  {
    id: "q4",
    workstream: "CareOps360 Enablement",
    question: "CareOps360 is reviewed weekly in governance meetings and actively drives decisions — not just used as a reporting artifact.",
    hint: "Consider: Were decisions made last week based on CareOps360 data?",
  },
  {
    id: "q5",
    workstream: "Product Model Transformation",
    question: "Teams are aligned around products and platforms with clear ownership, metrics, and decision rights — not around projects and tasks.",
    hint: "Consider: Can team members name their product and its outcomes?",
  },
  {
    id: "q6",
    workstream: "Value Realization",
    question: "Progress is measured and communicated through value outcomes and KPIs. Activity metrics are secondary to benefit realisation.",
    hint: "Consider: What was the last value outcome reported to Horizon leadership?",
  },
  {
    id: "q7",
    workstream: "Quality Engineering Transition",
    question: "IBM is building genuine ownership of QE processes, regression assets, and defect governance — not just shadowing the incumbent vendor.",
    hint: "Consider: Could IBM operate QE independently today?",
  },
];

const DEFAULT_SCORES: Record<string, number> = {
  q1: 2, q2: 2, q3: 2, q4: 3, q5: 2, q6: 2, q7: 1,
};

type SurveySnapshot = {
  id: string;
  date: string;
  assessor: string;
  scores: Record<string, number>;
  comments: Record<string, string>;
};

const SURVEY_LS_KEY = "cco_transformation_survey";
const BEHAVIORS_LS_KEY = "cco_transformation_behaviors";

function loadSnapshots(): SurveySnapshot[] {
  try {
    const raw = localStorage.getItem(SURVEY_LS_KEY);
    if (raw) return JSON.parse(raw) as SurveySnapshot[];
  } catch { }
  return [];
}

function saveSnapshots(snaps: SurveySnapshot[]) {
  localStorage.setItem(SURVEY_LS_KEY, JSON.stringify(snaps));
}


const SEED_BEHAVIORS = [
  { id: "b1", behavior: "Outcome ownership", workstream: "Governance & Operating Model", currentMindset: "Team focuses on completing assigned tasks", targetMindset: "Team owns business and operational outcomes", owner: "IBM Delivery Lead", adoptionScore: 2.5, evidenceNeeded: "Outcome KPIs tracked in governance reviews", risk: "Resistance to accountability shift", mitigation: "Tie individual OKRs to outcome metrics", nextAction: "Baseline outcome KPIs by end of Q2" },
  { id: "b2", behavior: "Agile discipline", workstream: "Agile Adoption", currentMindset: "Agile ceremonies are inconsistent", targetMindset: "Teams use backlog discipline, sprint planning, reviews, and retrospectives consistently", owner: "IBM CoE Lead", adoptionScore: 2.0, evidenceNeeded: "Sprint health metrics published weekly", risk: "Ceremonies become checkbox activity", mitigation: "Coaching, backlog quality checks, team-level adoption reviews", nextAction: "Introduce sprint health scorecard in Q2" },
  { id: "b3", behavior: "Automation-first thinking", workstream: "AIOps & Automation", currentMindset: "Manual issue handling is accepted as normal", targetMindset: "Repeatable work is reviewed for automation opportunity", owner: "IBM AIOps Lead", adoptionScore: 1.8, evidenceNeeded: "Automation intake log reviewed weekly", risk: "Automation seen as threat to job security", mitigation: "Frame automation as capacity creation, not reduction", nextAction: "Launch automation intake process in Q2" },
  { id: "b4", behavior: "Proactive operations", workstream: "AIOps & Automation", currentMindset: "Team responds after incidents occur", targetMindset: "Team uses AIOps insights to prevent recurring issues", owner: "IBM AIOps Lead", adoptionScore: 2.2, evidenceNeeded: "Proactive alert ratio > 60% in AIOps dashboard", risk: "AIOps insights ignored in daily operations", mitigation: "Embed AIOps review in daily standup agenda", nextAction: "Set proactive alert target for Q3" },
  { id: "b5", behavior: "Governance transparency", workstream: "CareOps360 Enablement", currentMindset: "Reporting is manual and fragmented", targetMindset: "CareOps360 provides weekly governance visibility", owner: "IBM Program Director", adoptionScore: 3.0, evidenceNeeded: "CareOps360 used in every weekly governance review", risk: "Dashboard becomes a reporting tool, not a governance behaviour", mitigation: "Tie CareOps360 usage to decision tracking", nextAction: "Add decision log to weekly review template" },
  { id: "b6", behavior: "Product-based ownership", workstream: "Product Model Transformation", currentMindset: "Teams align around projects and tasks", targetMindset: "Teams align around products, platforms, and outcomes", owner: "IBM Alliance Executive", adoptionScore: 2.2, evidenceNeeded: "Product ownership map published and agreed", risk: "Product model defined but not adopted day-to-day", mitigation: "Align roles, metrics, and decision rights to product teams", nextAction: "Publish product ownership RACI by end of Q2" },
  { id: "b7", behavior: "Value realization", workstream: "Value Realization", currentMindset: "Progress is measured through activities", targetMindset: "Progress is measured through benefits, KPIs, and value outcomes", owner: "IBM Delivery Lead", adoptionScore: 2.0, evidenceNeeded: "Value scorecard reviewed monthly by Horizon exec", risk: "Value metrics become vanity metrics", mitigation: "Tie value KPIs to contract milestones and renewals", nextAction: "Publish Q1 value scorecard by end of Q2" },
  { id: "b8", behavior: "Quality Engineering transition", workstream: "Quality Engineering Transition", currentMindset: "QE knowledge sits with incumbent vendor", targetMindset: "IBM owns QE process, regression knowledge, automation assets, and defect governance", owner: "IBM QE Lead", adoptionScore: 1.5, evidenceNeeded: "IBM QE readiness sign-off from Horizon CIO", risk: "Transition remains knowledge-transfer focused without mindset shift", mitigation: "Shadow/reverse-shadow, quality ownership metrics, automation assessment", nextAction: "Complete QE capability assessment by end of Q3" },
];


const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    "Completed":   "bg-emerald-50 text-emerald-700 border-emerald-200",
    "On Track":    "bg-emerald-50 text-emerald-700 border-emerald-200",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
    "At Risk":     "bg-red-50 text-red-600 border-red-200",
    "Planned":     "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", cfg[status] ?? "bg-slate-50 text-slate-600 border-slate-200")}>
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

function ScoreChip({ score }: { score: number }) {
  const color = score >= 4 ? "bg-emerald-500" : score >= 3 ? "bg-blue-500" : score >= 2 ? "bg-amber-400" : "bg-red-500";
  return (
    <span className={cn("inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shadow-sm", color)}>
      {score}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function loadBehaviors() {
  try {
    const raw = localStorage.getItem(BEHAVIORS_LS_KEY);
    if (raw) return JSON.parse(raw) as typeof SEED_BEHAVIORS;
  } catch { }
  return SEED_BEHAVIORS;
}

export default function TransformationEcosystem() {
  const [snapshots, setSnapshots] = useState<SurveySnapshot[]>(loadSnapshots);
  const [draftScores, setDraftScores] = useState<Record<string, number>>({});
  const [draftComments, setDraftComments] = useState<Record<string, string>>({});
  const [assessor, setAssessor] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [behaviors, setBehaviors] = useState<typeof SEED_BEHAVIORS>(loadBehaviors);
  const [editCell, setEditCell] = useState<{ row: string; col: string } | null>(null);
  const [editVal, setEditVal] = useState("");
  const [wsFilter, setWsFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("");

  useEffect(() => { localStorage.setItem(BEHAVIORS_LS_KEY, JSON.stringify(behaviors)); }, [behaviors]);

  const latestSnapshot = snapshots[snapshots.length - 1];
  const prevSnapshot = snapshots[snapshots.length - 2];

  const activeScores: Record<string, number> = useMemo(() => {
    if (latestSnapshot) return latestSnapshot.scores;
    return DEFAULT_SCORES;
  }, [latestSnapshot]);

  const radarData = useMemo(() =>
    SURVEY_QUESTIONS.map(q => ({
      subject: q.workstream.replace("Quality Engineering Transition", "QE Transition"),
      current: activeScores[q.id] ?? DEFAULT_SCORES[q.id],
      target: 5,
    })),
  [activeScores]);


  const answeredCount = SURVEY_QUESTIONS.filter(q => draftScores[q.id] !== undefined).length;
  const allAnswered = answeredCount === SURVEY_QUESTIONS.length;

  const handleSubmit = () => {
    if (!allAnswered) return;
    const snap: SurveySnapshot = {
      id: `snap_${Date.now()}`,
      date: new Date().toISOString(),
      assessor: assessor.trim() || "Anonymous",
      scores: { ...draftScores },
      comments: { ...draftComments },
    };
    const next = [...snapshots, snap];
    setSnapshots(next);
    saveSnapshots(next);
    setDraftScores({});
    setDraftComments({});
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 3000);
  };

  const clearHistory = () => {
    setSnapshots([]);
    localStorage.removeItem(SURVEY_LS_KEY);
  };

  const commitEdit = useCallback(() => {
    if (!editCell) return;
    setBehaviors(prev => prev.map(b =>
      b.id === editCell.row ? { ...b, [editCell.col]: editCell.col === "adoptionScore" ? parseFloat(editVal) || b.adoptionScore : editVal } : b
    ));
    setEditCell(null);
  }, [editCell, editVal]);

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
        <motion.section variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.45 }}
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
                { label: "Current Stage", value: "Foundation",         icon: "🏗️" },
                { label: "Target Stage",  value: "Transformation-Led", icon: "🚀" },
                { label: "Overall Health",value: "On Track",           icon: "✅" },
                { label: "Gov Cadence",   value: "Weekly",             icon: "📅" },
                { label: "Assessments",   value: `${snapshots.length} submitted`, icon: "📋" },
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

        {/* ── Transition Readiness Survey ──────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.45, delay: 0.07 }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-800">Transition Readiness Assessment</h2>
              {snapshots.length > 0 && (
                <span className="ml-2 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2.5 py-0.5 font-medium">
                  {snapshots.length} {snapshots.length === 1 ? "response" : "responses"} on record
                </span>
              )}
            </div>
            {snapshots.length > 0 && (
              <button onClick={() => setShowHistory(h => !h)}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                <History className="w-4 h-4" />
                {showHistory ? "Hide history" : "Show history"}
                {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Latest scores summary bar */}
          {latestSnapshot && (
            <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl px-5 py-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-700">Latest assessment</span>
                  <span className="text-xs text-slate-400">by {latestSnapshot.assessor} · {formatDate(latestSnapshot.date)}</span>
                </div>
                <span className="text-xs text-slate-400">
                  Avg: <span className="font-bold text-blue-700">
                    {(Object.values(latestSnapshot.scores).reduce((a, b) => a + b, 0) / Object.values(latestSnapshot.scores).length).toFixed(1)}
                  </span> / 5
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
                {SURVEY_QUESTIONS.map(q => {
                  const score = latestSnapshot.scores[q.id];
                  const prev = prevSnapshot?.scores[q.id];
                  const delta = prev !== undefined ? score - prev : null;
                  return (
                    <div key={q.id} className="bg-white rounded-xl p-2.5 shadow-sm border border-white/80 text-center">
                      <p className="text-xs text-slate-400 mb-1 truncate" title={q.workstream}>
                        {q.workstream.replace("Quality Engineering Transition", "QE Transition").replace("& Operating Model", "")}
                      </p>
                      <div className="flex items-center justify-center gap-1.5">
                        <ScoreChip score={score} />
                        {delta !== null && (
                          <span className={cn("text-xs font-medium", delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-500" : "text-slate-400")}>
                            {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{SCALE_LABELS[score]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* History panel */}
          <AnimatePresence>
            {showHistory && snapshots.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
                className="mb-5 overflow-hidden">
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" /> Assessment History ({snapshots.length})
                    </p>
                    <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                      <RotateCcw className="w-3 h-3" /> Clear all
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {[...snapshots].reverse().map((snap, i) => (
                      <div key={snap.id} className={cn("rounded-xl p-3 border", i === 0 ? "bg-blue-50/60 border-blue-100" : "bg-slate-50 border-slate-100")}>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-medium text-slate-700">{snap.assessor}</span>
                          <span className="text-xs text-slate-400">{formatDate(snap.date)}</span>
                          {i === 0 && <span className="ml-auto text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">Latest</span>}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {SURVEY_QUESTIONS.map(q => (
                            <div key={q.id} className="flex items-center gap-1 text-xs text-slate-500">
                              <ScoreChip score={snap.scores[q.id]} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Survey form */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Rate each dimension from 1–5</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  1 = Not Started · 2 = Early Signs · 3 = In Progress · 4 = Well Embedded · 5 = Fully Embedded
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(answeredCount / SURVEY_QUESTIONS.length) * 100}%`, background: IBM_BLUE }} />
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">{answeredCount} / {SURVEY_QUESTIONS.length} answered</span>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {SURVEY_QUESTIONS.map((q, qi) => {
                const score = draftScores[q.id];
                const comment = draftComments[q.id] ?? "";
                return (
                  <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: qi * 0.05 }}
                    className={cn("px-6 py-5 transition-colors", score !== undefined ? "bg-blue-50/20" : "")}>
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 flex flex-col items-center gap-1 pt-0.5">
                        <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all"
                          style={score !== undefined ? { borderColor: IBM_BLUE, color: IBM_BLUE, background: "#EEF4FF" } : { borderColor: "#e2e8f0", color: "#94a3b8" }}>
                          {score !== undefined ? score : qi + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 text-blue-700 bg-blue-50 border border-blue-100">{q.workstream}</span>
                          {score !== undefined && (
                            <span className="text-xs text-slate-500 italic">{SCALE_LABELS[score]}</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed mb-1">{q.question}</p>
                        <p className="text-xs text-slate-400 mb-3 italic">{q.hint}</p>

                        {/* Rating buttons */}
                        <div className="flex gap-2 flex-wrap mb-3">
                          {[1, 2, 3, 4, 5].map(n => {
                            const isSelected = score === n;
                            const bg = isSelected
                              ? n >= 4 ? "bg-emerald-500 border-emerald-500 text-white shadow-md"
                              : n >= 3 ? "bg-blue-600 border-blue-600 text-white shadow-md"
                              : n >= 2 ? "bg-amber-400 border-amber-400 text-white shadow-md"
                              : "bg-red-500 border-red-500 text-white shadow-md"
                              : "bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600";
                            return (
                              <button key={n} onClick={() => setDraftScores(s => ({ ...s, [q.id]: n }))}
                                className={cn("flex items-center justify-center w-10 h-10 rounded-xl border-2 text-sm font-bold transition-all duration-150 hover:scale-105", bg)}
                                title={SCALE_LABELS[n]}>
                                {n}
                              </button>
                            );
                          })}
                          <div className="ml-2 flex items-center">
                            {score !== undefined && (
                              <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-300"
                                  style={{ width: `${(score / 5) * 100}%`, background: score >= 4 ? GREEN : score >= 3 ? IBM_BLUE : score >= 2 ? AMBER : RED }} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Optional comment */}
                        <input
                          placeholder="Add a comment or evidence (optional)…"
                          value={comment}
                          onChange={e => setDraftComments(c => ({ ...c, [q.id]: e.target.value }))}
                          className="w-full max-w-xl text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 placeholder:text-slate-300 outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 bg-white/70 transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer — assessor + submit */}
            <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <input placeholder="Your name (optional)"
                  value={assessor}
                  onChange={e => setAssessor(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-48 outline-none focus:ring-1 focus:ring-blue-300 bg-white placeholder:text-slate-300"
                />
              </div>
              <div className="flex items-center gap-3">
                <AnimatePresence>
                  {justSubmitted && (
                    <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Assessment saved!
                    </motion.span>
                  )}
                </AnimatePresence>
                <Button onClick={handleSubmit} disabled={!allAnswered}
                  className="gap-2 font-semibold disabled:opacity-40"
                  style={{ background: IBM_BLUE }}>
                  <Send className="w-4 h-4" />
                  Submit Assessment
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Ecosystem Maturity Radar ─────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.45, delay: 0.15 }}
          className="bg-white border border-slate-100 rounded-2xl shadow-md p-6">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Ecosystem Maturity Model
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {latestSnapshot
                  ? `Live from assessment by ${latestSnapshot.assessor} · ${formatDate(latestSnapshot.date)}`
                  : "Submit an assessment above to populate this chart with your scores"}
              </p>
            </div>
            {latestSnapshot && (
              <div className="flex items-center gap-4 flex-wrap">
                {[
                  { label: "Current", color: IBM_BLUE, dash: false },
                  { label: "Target (5)", color: IBM_CYAN, dash: true },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <svg width="20" height="4">
                      <line x1="0" y1="2" x2="20" y2="2"
                        stroke={l.color} strokeWidth="2"
                        strokeDasharray={l.dash ? "4 3" : undefined} />
                    </svg>
                    {l.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!latestSnapshot && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-300">
              <Sparkles className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm font-medium text-slate-400">No assessment submitted yet</p>
              <p className="text-xs text-slate-300 mt-1">Complete the survey above and click Submit Assessment</p>
            </div>
          )}

          {latestSnapshot && (
            <>
              <ResponsiveContainer width="100%" height={420}>
                <RadarChart data={radarData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#475569" }} />
                  <Radar name="Current" dataKey="current" stroke={IBM_BLUE} fill={IBM_BLUE} fillOpacity={0.28} strokeWidth={2.5} dot={{ r: 4, fill: IBM_BLUE }} />
                  <Radar name="Target (5)" dataKey="target" stroke={IBM_CYAN} fill={IBM_CYAN} fillOpacity={0.05} strokeWidth={1.5} strokeDasharray="5 3" />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                </RadarChart>
              </ResponsiveContainer>

              {/* Per-dimension score strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2 mt-2">
                {SURVEY_QUESTIONS.map(q => {
                  const score = activeScores[q.id];
                  const prev  = prevSnapshot?.scores[q.id];
                  const delta = prev !== undefined ? score - prev : null;
                  const barColor = score >= 4 ? GREEN : score >= 3 ? IBM_BLUE : score >= 2 ? AMBER : RED;
                  return (
                    <div key={q.id} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-slate-400 mb-1.5 leading-tight truncate" title={q.workstream}>
                        {q.workstream.replace("Quality Engineering Transition", "QE Transition").replace("& Operating Model", "& Ops")}
                      </p>
                      <div className="flex items-center justify-center gap-1 mb-1.5">
                        <span className="text-2xl font-bold" style={{ color: barColor }}>{score}</span>
                        <span className="text-xs text-slate-300">/5</span>
                        {delta !== null && delta !== 0 && (
                          <span className={cn("text-xs font-semibold ml-1", delta > 0 ? "text-emerald-500" : "text-red-400")}>
                            {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          </span>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(score / 5) * 100}%`, background: barColor }} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{SCALE_LABELS[score]}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.section>

        {/* ── Behaviour Tracker ────────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.45, delay: 0.3 }}
          className="bg-white border border-slate-100 rounded-2xl shadow-md p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Transformation Behaviour Tracker
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
              <Input placeholder="Owner…" value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="h-8 text-xs w-32" />
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => {
                const id = `b${Date.now()}`;
                setBehaviors(prev => [...prev, { id, behavior: "New Behaviour", workstream: WORKSTREAM_ORDER[0], currentMindset: "", targetMindset: "", owner: "", adoptionScore: 1.0, evidenceNeeded: "", risk: "", mitigation: "", nextAction: "" }]);
              }}>
                <Plus className="w-3 h-3" /> Add
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => {
                const cols = ["behavior","currentMindset","targetMindset","workstream","owner","adoptionScore","evidenceNeeded","risk","mitigation","nextAction"] as const;
                const header = ["Behaviour","Current Mindset","Target Mindset","Workstream","Owner","Adoption Score","Evidence Needed","Risk","Mitigation","Next Action"];
                const rows = filtered.map(b => cols.map(c => `"${String(b[c]).replace(/"/g,'""')}"`).join(","));
                const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
                const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "behaviours.csv"; a.click();
              }}>
                <Download className="w-3 h-3" /> Export
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 text-slate-500" onClick={() => { setBehaviors(SEED_BEHAVIORS); localStorage.removeItem(BEHAVIORS_LS_KEY); }}>
                <RotateCcw className="w-3 h-3" /> Reset
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  {EDITABLE_COLS.map(c => (
                    <th key={c.key} className={cn("py-2 px-3 text-left font-semibold text-slate-500 whitespace-nowrap bg-slate-50/60", c.width)}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, ri) => (
                  <tr key={b.id} className={cn("border-b border-slate-50 hover:bg-blue-50/30 transition-colors", ri % 2 === 1 ? "bg-slate-50/30" : "")}>
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
          <p className="text-xs text-slate-400 mt-3">Click any cell to edit inline. Changes are auto-saved to your browser.</p>
        </motion.section>

        <div className="h-4" />
      </div>
    </div>
  );
}
