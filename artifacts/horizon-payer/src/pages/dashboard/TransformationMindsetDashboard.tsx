import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList,
} from "recharts";
import {
  Sparkles, Users, TrendingUp, Target, Copy, Check, RefreshCw,
  Download, Trash2, Brain, ChevronDown, ChevronUp, Zap,
  Shield, ClipboardList, CheckCircle2, Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const IBM_BLUE = "#0F62FE";
const GREEN    = "#24A148";
const AMBER    = "#F1C21B";
const RED      = "#DA1E28";
const TARGET   = 4.5;

const DIMENSION_ORDER = [
  { key: "ops_stability",    short: "Ops Stability" },
  { key: "incident_mgmt",   short: "Incident Mgmt" },
  { key: "proactive",       short: "Proactive" },
  { key: "automation",      short: "Automation" },
  { key: "agile",           short: "Agile" },
  { key: "governance",      short: "Governance" },
  { key: "product_ownership", short: "Product Ownership" },
];

type Dimension = { label: string; avg: number; count: number };
type Results = {
  total: number;
  overallAvg: number;
  dimensions: Record<string, Dimension>;
  q19Responses: string[];
  q20Responses: string[];
};
type TransitionPlan = {
  executiveSummary: string;
  strengths: string[];
  opportunities: string[];
  plan: { days30: string[]; days60: string[]; days90: string[] };
  risks: { risk: string; mitigation: string }[];
  workshopThemes: string[];
  source: "openai" | "rule-based";
};

function dimColor(avg: number): string {
  if (avg >= 4.0) return GREEN;
  if (avg >= 3.0) return AMBER;
  return RED;
}

function dimStatus(avg: number): string {
  if (avg >= 4.0) return "On Track";
  if (avg >= 3.0) return "In Progress";
  return "Needs Focus";
}

function getToken(): string {
  return localStorage.getItem("horizon_token") ?? "";
}

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(opts?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

const PLAN_TABS = [
  { key: "days30", label: "30 Days", icon: "🏃" },
  { key: "days60", label: "60 Days", icon: "⚡" },
  { key: "days90", label: "90 Days", icon: "🚀" },
] as const;

export default function TransformationMindsetDashboard() {
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TransitionPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planTab, setPlanTab] = useState<"days30" | "days60" | "days90">("days30");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThemes, setShowThemes] = useState(true);
  const [clearConfirm, setClearConfirm] = useState(false);

  const surveyUrl = `${window.location.origin}${import.meta.env.BASE_URL}survey`;

  const loadResults = useCallback(async () => {
    setLoading(true); setError(null);
    try { setResults(await apiFetch<Results>("/api/transformation-survey/results")); }
    catch { setError("Could not load results. Check your connection."); }
    finally { setLoading(false); }
  }, []);

  const generatePlan = useCallback(async () => {
    setPlanLoading(true);
    try { setPlan(await apiFetch<TransitionPlan>("/api/transformation-survey/generate-plan", { method: "POST" })); }
    catch { setError("Could not generate plan."); }
    finally { setPlanLoading(false); }
  }, []);

  const handleExport = async () => {
    const token = getToken();
    const res = await fetch("/api/transformation-survey/export-csv", { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "transformation_survey_results.csv"; a.click();
  };

  const handleClear = async () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    await apiFetch("/api/transformation-survey/clear", { method: "DELETE" });
    setResults(null); setPlan(null); setClearConfirm(false);
  };

  const copySurveyLink = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const dims = DIMENSION_ORDER.map(d => ({
    key: d.key, short: d.short,
    label: results?.dimensions[d.key]?.label ?? d.short,
    avg: results?.dimensions[d.key]?.avg ?? 0,
  }));

  const strongest = [...dims].sort((a, b) => b.avg - a.avg)[0];
  const weakest   = [...dims].filter(d => d.avg > 0).sort((a, b) => a.avg - b.avg)[0];
  const readiness = results ? Math.round((results.overallAvg / 5) * 100) : 0;

  // Chart data
  const chart1Data = dims.map(d => ({ name: d.short, avg: d.avg, fill: dimColor(d.avg) }));
  const chart2Data = dims.map(d => ({ name: d.short, current: d.avg, target: TARGET }));
  const chart3Data = [...dims].filter(d => d.avg > 0).sort((a, b) => a.avg - b.avg)
    .map(d => ({ name: d.short, avg: d.avg, fill: dimColor(d.avg) }));

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">

        {/* ── Hero ─── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.4 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0F62FE] via-[#0353E9] to-[#0043CE] shadow-2xl px-8 py-8 text-white">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "50px 50px",
          }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-5 h-5 text-blue-200" />
              <span className="text-blue-200 text-sm font-medium tracking-wide uppercase">IBM AMS · Workshop Tool</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Horizon Transformation Transition Survey</h1>
            <p className="text-blue-100 text-sm mb-5">Anonymous workshop feedback to shape IBM-Horizon's transition from stable operations to transformation-led delivery</p>
            <div className="flex flex-wrap gap-3 mb-5">
              {[
                { label: "Anonymous survey", value: "Active", icon: "🔒" },
                { label: "Responses",       value: String(results?.total ?? "—"), icon: "📋" },
                { label: "Overall Maturity", value: results ? `${results.overallAvg.toFixed(1)} / 5` : "—", icon: "📊" },
                { label: "AI Plan",         value: plan ? (plan.source === "openai" ? "OpenAI" : "Rule-based") : "Not generated", icon: "🤖" },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
                  <span>{b.icon}</span>
                  <div><p className="text-blue-200 text-xs">{b.label}</p><p className="text-white font-semibold text-sm">{b.value}</p></div>
                </div>
              ))}
            </div>
            {/* Survey link */}
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 max-w-lg">
              <Link className="w-4 h-4 text-blue-200 shrink-0" />
              <span className="text-sm text-white truncate flex-1 font-mono">{surveyUrl}</span>
              <button onClick={copySurveyLink}
                className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 rounded-lg px-2.5 py-1.5 transition-colors whitespace-nowrap">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Action bar ─── */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadResults} disabled={loading} className="gap-2" style={{ background: IBM_BLUE }}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            {results ? "Refresh Results" : "Load Results"}
          </Button>
          <Button onClick={generatePlan} disabled={planLoading || !results || results.total === 0} variant="outline" className="gap-2">
            <Brain className={cn("w-4 h-4", planLoading && "animate-spin")} />
            {plan ? "Refresh AI Plan" : "Generate AI Transition Plan"}
          </Button>
          <Button onClick={handleExport} disabled={!results || results.total === 0} variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button onClick={handleClear} variant="ghost"
            className={cn("gap-2", clearConfirm ? "text-red-600 border-red-300 border" : "text-slate-500")}>
            <Trash2 className="w-4 h-4" />
            {clearConfirm ? "Confirm Clear?" : "Clear Demo Data"}
          </Button>
          {clearConfirm && (
            <Button onClick={() => setClearConfirm(false)} variant="ghost" className="text-slate-400">Cancel</Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        {!results && !loading && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 text-center">
            <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Click "Load Results" to view survey responses</p>
            <p className="text-slate-400 text-sm mt-1">Share the survey link above with workshop participants first</p>
          </div>
        )}

        {results && (
          <>
            {/* ── KPI Cards ─── */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {[
                { icon: Users,      label: "Total Responses",       value: String(results.total),                      badge: results.total > 0 ? "Active" : "No data",  color: IBM_BLUE },
                { icon: TrendingUp, label: "Overall Maturity",      value: `${results.overallAvg.toFixed(1)} / 5`,     badge: dimStatus(results.overallAvg),              color: dimColor(results.overallAvg) },
                { icon: CheckCircle2, label: "Strongest Dimension", value: strongest?.short ?? "—",                   badge: strongest ? `${strongest.avg.toFixed(1)}/5` : "—", color: GREEN },
                { icon: Target,     label: "Priority Focus",        value: weakest?.short ?? "—",                     badge: weakest ? `${weakest.avg.toFixed(1)}/5` : "—",   color: RED },
                { icon: Zap,        label: "Transformation Readiness", value: `${readiness}%`,                        badge: readiness >= 70 ? "Strong" : readiness >= 50 ? "Building" : "Early stage", color: AMBER },
                { icon: Brain,      label: "AI Plan",               value: plan ? "Ready" : "Not generated",         badge: plan?.source === "openai" ? "OpenAI" : plan ? "Rule-based" : "—", color: "#8B5CF6" },
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <motion.div key={c.label} variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}
                    className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${c.color}18` }}>
                      <Icon className="w-4.5 h-4.5" style={{ color: c.color }} />
                    </div>
                    <p className="text-xs text-slate-400 mb-0.5">{c.label}</p>
                    <p className="text-base font-bold text-slate-800 leading-tight">{c.value}</p>
                    <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${c.color}18`, color: c.color }}>{c.badge}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* ── Charts ─── */}
            {results.total > 0 && (
              <div className="space-y-6">
                {/* Chart 1 & 2 side by side */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Chart 1 - Current maturity */}
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                    <h3 className="text-sm font-bold text-slate-800 mb-0.5">Current Maturity by Dimension</h3>
                    <p className="text-xs text-slate-400 mb-4">Average score per dimension (1–5 scale)</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={chart1Data} margin={{ left: -10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} tickCount={6} />
                        <Tooltip formatter={(v: number) => [v.toFixed(2), "Avg Score"]} />
                        <ReferenceLine y={4} stroke="#94a3b8" strokeDasharray="4 3" label={{ value: "Target 4.0", fontSize: 9, fill: "#94a3b8", position: "insideTopRight" }} />
                        <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                          {chart1Data.map((d, i) => <Cell key={i} fill={d.fill} />)}
                          <LabelList dataKey="avg" position="top" formatter={(v: number) => v.toFixed(1)} style={{ fontSize: 9, fill: "#64748b" }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Chart 2 - Current vs Target */}
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                    <h3 className="text-sm font-bold text-slate-800 mb-0.5">Current vs Target Mindset</h3>
                    <p className="text-xs text-slate-400 mb-4">Current average score vs target of 4.5 per dimension</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={chart2Data} margin={{ left: -10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} tickCount={6} />
                        <Tooltip />
                        <Bar dataKey="current" name="Current" fill={IBM_BLUE} radius={[4, 4, 0, 0]} barSize={14} />
                        <Bar dataKey="target"  name="Target"  fill="#CBD5E1"  radius={[4, 4, 0, 0]} barSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-1 justify-center">
                      {[["Current", IBM_BLUE], ["Target (4.5)", "#CBD5E1"]].map(([l, c]) => (
                        <div key={l} className="flex items-center gap-1.5 text-xs text-slate-500">
                          <div className="w-3 h-3 rounded-sm" style={{ background: c }} />{l}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chart 3 - Priority areas */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                  <h3 className="text-sm font-bold text-slate-800 mb-0.5">Priority Transformation Areas</h3>
                  <p className="text-xs text-slate-400 mb-1">Dimensions sorted by score — lowest = highest priority focus</p>
                  <div className="flex gap-3 mb-4">
                    {[["≥ 4.0 — On Track", GREEN], ["3.0–3.9 — In Progress", AMBER], ["< 3.0 — Needs Focus", RED]].map(([l, c]) => (
                      <div key={l} className="flex items-center gap-1.5 text-xs text-slate-500">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />{l}
                      </div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chart3Data} layout="vertical" margin={{ left: 10, right: 60, top: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10 }} tickCount={6} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10, fill: "#475569" }} />
                      <Tooltip formatter={(v: number) => [v.toFixed(2), "Avg Score"]} />
                      <Bar dataKey="avg" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, formatter: (v: number) => v.toFixed(1) }}>
                        {chart3Data.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── Aggregate table ─── */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Aggregate Results by Dimension</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-left">
                      {["Dimension", "Avg Score", "Responses", "Status", "Focus Area"].map(h => (
                        <th key={h} className="py-2 px-3 text-slate-400 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dims.map((d, i) => (
                      <tr key={d.key} className={cn("border-b border-slate-50", i % 2 === 1 ? "bg-slate-50/40" : "")}>
                        <td className="py-2.5 px-3 font-medium text-slate-700">{d.label}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${(d.avg / 5) * 100}%`, background: dimColor(d.avg) }} />
                            </div>
                            <span className="font-bold" style={{ color: dimColor(d.avg) }}>{d.avg > 0 ? d.avg.toFixed(2) : "—"}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{results.total}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: `${dimColor(d.avg)}18`, color: dimColor(d.avg) }}>
                            {d.avg > 0 ? dimStatus(d.avg) : "No data"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {d.avg > 0 && d.avg < 3.5 ? "Priority improvement area" : d.avg >= 3.5 ? "Maintain and accelerate" : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Response themes ─── */}
            {(results.q19Responses.length > 0 || results.q20Responses.length > 0) && (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                <button className="flex items-center justify-between w-full"
                  onClick={() => setShowThemes(t => !t)}>
                  <h3 className="text-sm font-bold text-slate-800">Anonymous Feedback Themes</h3>
                  {showThemes ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                <AnimatePresence>
                  {showThemes && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                        {results.q19Responses.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Q19 — Top improvement themes</p>
                            <div className="space-y-2">
                              {results.q19Responses.slice(0, 8).map((r, i) => (
                                <div key={i} className="bg-blue-50/60 border border-blue-100 rounded-xl px-3 py-2 text-xs text-slate-700 leading-relaxed">
                                  "{r}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {results.q20Responses.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Q20 — Risks & concerns</p>
                            <div className="space-y-2">
                              {results.q20Responses.slice(0, 8).map((r, i) => (
                                <div key={i} className="bg-amber-50/60 border border-amber-100 rounded-xl px-3 py-2 text-xs text-slate-700 leading-relaxed">
                                  "{r}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* ── AI Transition Plan ─── */}
        <AnimatePresence>
          {plan && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" /> AI-Suggested Transition Plan
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generated using {plan.source === "openai" ? "OpenAI GPT-4o mini" : "rule-based engine"} · Based on {results?.total ?? 0} response{(results?.total ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: plan.source === "openai" ? "#EEF4FF" : "#F0FDF4", color: plan.source === "openai" ? IBM_BLUE : GREEN }}>
                  {plan.source === "openai" ? "🤖 OpenAI" : "⚙️ Rule-based"}
                </span>
              </div>

              {/* Executive summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl px-5 py-4">
                <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">Executive Summary</p>
                <p className="text-sm text-slate-700 leading-relaxed">{plan.executiveSummary}</p>
              </div>

              {/* Strengths & Opportunities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Current Strengths
                  </p>
                  <ul className="space-y-1.5">
                    {plan.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Transformation Opportunities
                  </p>
                  <ul className="space-y-1.5">
                    {plan.opportunities.map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />{o}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 30/60/90 plan */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Recommended Transition Plan</p>
                <div className="flex gap-2 mb-4">
                  {PLAN_TABS.map(t => (
                    <button key={t.key} onClick={() => setPlanTab(t.key)}
                      className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all border",
                        planTab === t.key ? "text-white shadow-md border-transparent" : "bg-white border-slate-200 text-slate-500 hover:border-blue-200")}
                      style={planTab === t.key ? { background: IBM_BLUE } : {}}>
                      <span>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.ul key={planTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="space-y-2">
                    {plan.plan[planTab].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 mt-0.5">{i + 1}</span>
                        {item}
                      </li>
                    ))}
                  </motion.ul>
                </AnimatePresence>
              </div>

              {/* Risks */}
              <div>
                <p className="text-xs font-semibold text-red-600 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Risks & Mitigations
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plan.risks.map((r, i) => (
                    <div key={i} className="bg-red-50/50 border border-red-100 rounded-xl px-4 py-3 text-xs">
                      <p className="font-semibold text-slate-700 mb-1">{r.risk}</p>
                      <p className="text-slate-500 leading-relaxed"><span className="font-medium text-slate-600">Mitigation: </span>{r.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workshop themes */}
              <div>
                <p className="text-xs font-semibold text-purple-700 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" /> Suggested Workshop Discussion Themes
                </p>
                <div className="space-y-2">
                  {plan.workshopThemes.map((t, i) => (
                    <div key={i} className="flex items-start gap-3 bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-2.5 text-xs text-slate-700">
                      <span className="text-purple-400 font-bold shrink-0">Q{i + 1}</span> {t}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {planLoading && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-10 text-center">
            <Brain className="w-10 h-10 text-blue-300 mx-auto mb-3 animate-pulse" />
            <p className="text-slate-500 font-medium">Generating transition plan…</p>
            <p className="text-slate-400 text-xs mt-1">Analysing survey scores and open feedback</p>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
