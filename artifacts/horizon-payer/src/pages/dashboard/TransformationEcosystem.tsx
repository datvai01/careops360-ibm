import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight,
  Plus, X, MessageSquare, AlertTriangle, BarChart2,
  CheckCircle2, Clock, ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const IBM_BLUE = "#0F62FE";
const GREEN    = "#24A148";
const AMBER    = "#F1C21B";
const RED      = "#DA1E28";
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CATEGORIES = ["All","Claims Operations","Member Operations","App Health","IBM AMS Value","Transformation"];
const SENTIMENT_OPTS = [
  { v: "positive", label: "✅ Positive" },
  { v: "neutral",  label: "🔵 Neutral"  },
  { v: "concern",  label: "⚠️ Concern"  },
];

type KpiDef = {
  key: string; category: string; name: string; unit: string;
  description: string | null; target: number | null; targetDirection: string;
  displayOrder: number; currentValue: number | null; previousValue: number | null;
  sparkline: number[];
};
type HistoryEntry = { year: number; month: number; value: number; note: string | null };
type FeedbackItem = { id: number; kpiKey: string | null; comment: string; sentiment: string; authorName: string | null; createdAt: string };

function getToken() { return localStorage.getItem("horizon_token") ?? ""; }
async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const r = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(opts?.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json() as Promise<T>;
}

function kpiStatus(k: KpiDef): "on-track" | "at-risk" | "behind" | "no-data" {
  if (k.currentValue === null || k.target === null) return "no-data";
  const r = k.currentValue / k.target;
  if (k.targetDirection === "higher") return r >= 0.95 ? "on-track" : r >= 0.80 ? "at-risk" : "behind";
  return r <= 1.05 ? "on-track" : r <= 1.30 ? "at-risk" : "behind";
}

function kpiProgress(k: KpiDef): number {
  if (k.currentValue === null || k.target === null) return 0;
  if (k.targetDirection === "higher") return Math.min(100, (k.currentValue / k.target) * 100);
  if (k.target === 0) return k.currentValue === 0 ? 100 : 0;
  return Math.max(0, Math.min(100, ((2 * k.target - k.currentValue) / k.target) * 100));
}

function kpiTrend(k: KpiDef) {
  if (k.currentValue === null || k.previousValue === null || k.previousValue === 0)
    return { pct: 0, dir: "flat" as const, good: false };
  const raw = ((k.currentValue - k.previousValue) / Math.abs(k.previousValue)) * 100;
  const dir = Math.abs(raw) < 0.05 ? ("flat" as const) : raw > 0 ? ("up" as const) : ("down" as const);
  const good = k.targetDirection === "higher" ? dir === "up" : dir === "down";
  return { pct: Math.abs(raw), dir, good };
}

function fmt(v: number, unit: string): string {
  if (unit === "count" || unit === "$K") return v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(Math.round(v));
  if (unit === "%" || unit === "days") return v.toFixed(1);
  if (unit === "/ 5") return v.toFixed(1);
  return String(v);
}

function sentColor(s: string) { return s === "positive" ? GREEN : s === "concern" ? RED : IBM_BLUE; }

const STATUS_STYLES = {
  "on-track": { label: "On Track",    bg: "#DEFBE6", color: GREEN, Icon: CheckCircle2 },
  "at-risk":  { label: "At Risk",     bg: "#FFF8E1", color: AMBER, Icon: AlertTriangle },
  "behind":   { label: "Needs Focus", bg: "#FFF1F1", color: RED,   Icon: AlertTriangle },
  "no-data":  { label: "No Data",     bg: "#F4F4F4", color: "#8D8D8D", Icon: Clock },
};

/* ─── Sparkline ─────────────────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={pts} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={`sg_${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#sg_${color.replace("#", "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─── KPI Card ───────────────────────────────────────────────── */
function KpiCard({ k, selected, onClick }: { k: KpiDef; selected: boolean; onClick: () => void }) {
  const s  = kpiStatus(k);
  const t  = kpiTrend(k);
  const p  = kpiProgress(k);
  const ss = STATUS_STYLES[s];
  const { Icon: StatusIcon } = ss;
  const TrendIcon = t.dir === "up" ? TrendingUp : t.dir === "down" ? TrendingDown : Minus;
  const trendColor = t.good ? GREEN : t.dir === "flat" ? "#6B7280" : RED;
  const sparkColor = s === "behind" ? RED : GREEN;

  return (
    <motion.button whileHover={{ y: -2 }} onClick={onClick}
      className={cn(
        "text-left bg-white rounded-2xl border-2 shadow-sm p-4 transition-all duration-150 w-full",
        selected ? "border-blue-500 shadow-blue-100 shadow-md" : "border-slate-100 hover:border-blue-200 hover:shadow-md",
      )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#EEF4FF", color: IBM_BLUE }}>
          {k.category}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: ss.bg, color: ss.color }}>
          <StatusIcon className="w-3 h-3" /> {ss.label}
        </span>
      </div>

      <p className="text-sm font-bold text-slate-800 mb-1 leading-tight">{k.name}</p>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl font-bold text-slate-900">
          {k.currentValue !== null ? fmt(k.currentValue, k.unit) : "—"}
        </span>
        <span className="text-xs text-slate-400">{k.unit}</span>
        {k.currentValue !== null && k.previousValue !== null && (
          <span className="flex items-center gap-0.5 text-xs font-medium ml-auto" style={{ color: trendColor }}>
            <TrendIcon className="w-3.5 h-3.5" />
            {t.pct.toFixed(1)}%
          </span>
        )}
      </div>

      {k.target !== null && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-slate-400 mb-0.5">
            <span>Target: {fmt(k.target, k.unit)} {k.unit}</span>
            <span>{Math.round(p)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: ss.color }}
              initial={{ width: 0 }}
              animate={{ width: `${p}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }} />
          </div>
        </div>
      )}

      <Sparkline data={k.sparkline} color={sparkColor} />
    </motion.button>
  );
}

/* ─── Expanded Panel ─────────────────────────────────────────── */
function ExpandedPanel({ kpi, history, feedback, onClose, onFeedbackSubmit }: {
  kpi: KpiDef; history: HistoryEntry[]; feedback: FeedbackItem[];
  onClose: () => void; onFeedbackSubmit: () => void;
}) {
  const [fbForm, setFbForm] = useState({ comment: "", sentiment: "neutral", authorName: "" });
  const [fbSending, setFbSending] = useState(false);
  const [fbSuccess, setFbSuccess] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const chartData = history.map(h => ({
    label: `${MONTH_LABELS[h.month - 1]} ${String(h.year).slice(2)}`,
    value: h.value,
  }));

  const myFeedback = feedback.filter(f => f.kpiKey === kpi.key);

  async function submitFeedback() {
    if (!fbForm.comment.trim()) return;
    setFbSending(true);
    try {
      await api("/api/kpi-tracker/feedback", {
        method: "POST",
        body: JSON.stringify({ kpiKey: kpi.key, comment: fbForm.comment, sentiment: fbForm.sentiment, authorName: fbForm.authorName }),
      });
      setFbForm({ comment: "", sentiment: "neutral", authorName: "" });
      setFbSuccess(true);
      setTimeout(() => setFbSuccess(false), 3000);
      onFeedbackSubmit();
    } finally { setFbSending(false); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="bg-white border border-blue-100 rounded-2xl shadow-lg p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-600 mb-0.5">{kpi.category}</p>
          <h3 className="text-xl font-bold text-slate-900">{kpi.name}</h3>
          {kpi.description && <p className="text-sm text-slate-500 mt-0.5">{kpi.description}</p>}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">18-Month Historical Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ left: -10, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={2} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                formatter={(v: number) => [`${fmt(v, kpi.unit)} ${kpi.unit}`, kpi.name]}
              />
              {kpi.target !== null && (
                <ReferenceLine y={kpi.target} stroke={GREEN} strokeDasharray="5 3"
                  label={{ value: `Target ${fmt(kpi.target, kpi.unit)}`, fontSize: 9, fill: GREEN, position: "insideTopRight" }}
                />
              )}
              <Line type="monotone" dataKey="value" stroke={IBM_BLUE} strokeWidth={2}
                dot={{ r: 2, fill: IBM_BLUE }} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Data table toggle */}
      <div>
        <button onClick={() => setShowTable(v => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">
          <BarChart2 className="w-3.5 h-3.5" />
          Monthly Data Table
          {showTable ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <AnimatePresence>
          {showTable && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-slate-100">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      {["Month","Value","vs Target","Note"].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-slate-400 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...history].reverse().map((h, i) => {
                      const gap = kpi.target ? ((h.value - kpi.target) / kpi.target) * 100 : null;
                      const isGood = gap === null ? null : kpi.targetDirection === "higher" ? gap >= 0 : gap <= 0;
                      return (
                        <tr key={i} className="border-t border-slate-50">
                          <td className="px-3 py-1.5 font-medium text-slate-600">{MONTH_LABELS[h.month - 1]} {h.year}</td>
                          <td className="px-3 py-1.5 font-bold text-slate-800">
                            {fmt(h.value, kpi.unit)} <span className="font-normal text-slate-400">{kpi.unit}</span>
                          </td>
                          <td className="px-3 py-1.5">
                            {gap !== null && (
                              <span style={{ color: isGood ? GREEN : RED }}>
                                {gap > 0 ? "+" : ""}{gap.toFixed(1)}%
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-1.5 text-slate-400">{h.note ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feedback */}
      <div className="border-t border-slate-100 pt-5 space-y-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> Feedback on this KPI ({myFeedback.length})
        </p>

        {myFeedback.length > 0 && (
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {myFeedback.map(f => (
              <div key={f.id} className="bg-slate-50 rounded-xl px-3 py-2 text-xs">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sentColor(f.sentiment) }} />
                  <span className="font-medium text-slate-600">{f.authorName ?? "Anonymous"}</span>
                  <span className="text-slate-400 ml-auto">{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">&quot;{f.comment}&quot;</p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex gap-2">
            <Select value={fbForm.sentiment} onValueChange={v => setFbForm(f => ({ ...f, sentiment: v }))}>
              <SelectTrigger className="w-36 text-xs h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SENTIMENT_OPTS.map(o => <SelectItem key={o.v} value={o.v} className="text-xs">{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Your name (optional)" value={fbForm.authorName}
              onChange={e => setFbForm(f => ({ ...f, authorName: e.target.value }))}
              className="text-xs h-8 flex-1" />
          </div>
          <Textarea rows={2} placeholder="Share your observations on this KPI…"
            value={fbForm.comment}
            onChange={e => setFbForm(f => ({ ...f, comment: e.target.value }))}
            className="text-xs resize-none" />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => void submitFeedback()}
              disabled={fbSending || !fbForm.comment.trim()}
              className="text-xs gap-1" style={{ background: IBM_BLUE }}>
              <MessageSquare className="w-3 h-3" /> Submit Feedback
            </Button>
            {fbSuccess && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Add Entry Modal ────────────────────────────────────────── */
function AddEntryModal({ kpis, open, onClose, onSaved }: {
  kpis: KpiDef[]; open: boolean; onClose: () => void; onSaved: () => void;
}) {
  const now = new Date();
  const [form, setForm] = useState({
    kpiKey: "", year: now.getFullYear(), month: now.getMonth() + 1, value: "", note: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (!form.kpiKey || !form.value) { setErr("Select a KPI and enter a value."); return; }
    setSaving(true); setErr(null);
    try {
      await api("/api/kpi-tracker/entries", {
        method: "POST",
        body: JSON.stringify({ ...form, value: Number(form.value) }),
      });
      onSaved();
      onClose();
    } catch { setErr("Failed to save. Try again."); }
    finally { setSaving(false); }
  }

  const selectedKpi = kpis.find(k => k.key === form.kpiKey);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" /> Add Monthly Entry
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">KPI</label>
            <Select value={form.kpiKey} onValueChange={v => setForm(f => ({ ...f, kpiKey: v }))}>
              <SelectTrigger className="text-sm"><SelectValue placeholder="Select a KPI…" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.slice(1).map(cat => (
                  <div key={cat}>
                    <p className="text-xs text-slate-400 px-2 pt-2 pb-1 font-semibold">{cat}</p>
                    {kpis.filter(k => k.category === cat).map(k => (
                      <SelectItem key={k.key} value={k.key} className="text-sm">{k.name}</SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Month</label>
              <Select value={String(form.month)} onValueChange={v => setForm(f => ({ ...f, month: Number(v) }))}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTH_LABELS.map((m, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)} className="text-sm">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Year</label>
              <Input type="number" value={form.year}
                onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
                className="text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
              Value {selectedKpi ? `(${selectedKpi.unit})` : ""}
              {selectedKpi?.target ? (
                <span className="ml-1 font-normal text-slate-400">
                  — Target: {fmt(selectedKpi.target, selectedKpi.unit)} {selectedKpi.unit}
                </span>
              ) : null}
            </label>
            <Input type="number" step="any" placeholder="Enter value…" value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              className="text-sm" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
              Note <span className="font-normal">(optional)</span>
            </label>
            <Textarea rows={2} placeholder="Context or explanation for this value…"
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              className="text-sm resize-none" />
          </div>

          {err && <p className="text-xs text-red-500">{err}</p>}

          <div className="flex gap-2 pt-1">
            <Button onClick={() => void save()} disabled={saving} className="flex-1 gap-1" style={{ background: IBM_BLUE }}>
              {saving ? "Saving…" : "Save Entry"}
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function KpiTracker() {
  const [viewMonth, setViewMonth] = useState({ year: 2026, month: 6 });
  const [kpis, setKpis] = useState<KpiDef[]>([]);
  const [category, setCategory] = useState("All");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [genFb, setGenFb] = useState({ comment: "", sentiment: "neutral", authorName: "" });
  const [genFbSending, setGenFbSending] = useState(false);
  const [genFbSuccess, setGenFbSuccess] = useState(false);
  const expandedRef = useRef<HTMLDivElement>(null);

  const loadKpis = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<KpiDef[]>(`/api/kpi-tracker/kpis?year=${viewMonth.year}&month=${viewMonth.month}`);
      setKpis(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [viewMonth]);

  const loadFeedback = useCallback(async () => {
    try { setFeedback(await api<FeedbackItem[]>("/api/kpi-tracker/feedback")); }
    catch { /* ignore */ }
  }, []);

  useEffect(() => { void loadKpis(); }, [loadKpis]);
  useEffect(() => { void loadFeedback(); }, [loadFeedback]);

  useEffect(() => {
    if (!selectedKey) { setHistory([]); return; }
    setHistLoading(true);
    api<HistoryEntry[]>(`/api/kpi-tracker/kpis/${selectedKey}/history`)
      .then(h => setHistory(h))
      .catch(() => {})
      .finally(() => setHistLoading(false));
  }, [selectedKey]);

  useEffect(() => {
    if (selectedKey) {
      setTimeout(() => expandedRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
    }
  }, [selectedKey]);

  function navigate(delta: number) {
    setViewMonth(prev => {
      let m = prev.month + delta, y = prev.year;
      if (m < 1) { m = 12; y--; }
      if (m > 12) { m = 1;  y++; }
      return { year: y, month: m };
    });
    setSelectedKey(null);
  }

  const filtered = category === "All" ? kpis : kpis.filter(k => k.category === category);
  const selectedKpi = kpis.find(k => k.key === selectedKey) ?? null;

  const summary = {
    onTrack: kpis.filter(k => kpiStatus(k) === "on-track").length,
    atRisk:  kpis.filter(k => kpiStatus(k) === "at-risk").length,
    behind:  kpis.filter(k => kpiStatus(k) === "behind").length,
  };

  async function submitGenFeedback() {
    if (!genFb.comment.trim()) return;
    setGenFbSending(true);
    try {
      await api("/api/kpi-tracker/feedback", {
        method: "POST",
        body: JSON.stringify({ kpiKey: null, ...genFb }),
      });
      setGenFb({ comment: "", sentiment: "neutral", authorName: "" });
      setGenFbSuccess(true);
      setTimeout(() => setGenFbSuccess(false), 3000);
      void loadFeedback();
    } finally { setGenFbSending(false); }
  }

  const generalFeedback = feedback.filter(f => !f.kpiKey);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-blue-600" /> KPI Tracker
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Monthly operational KPI monitoring · User feedback · Historical trends
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Month navigator */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm">
              <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-50 rounded-lg">
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
              <span className="text-sm font-semibold text-slate-700 w-24 text-center">
                {MONTH_LABELS[viewMonth.month - 1]} {viewMonth.year}
              </span>
              <button onClick={() => navigate(1)} className="p-1 hover:bg-slate-50 rounded-lg">
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <Button onClick={() => void loadKpis()} variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
            </Button>
            <Button onClick={() => setShowAddEntry(true)} size="sm" className="gap-1.5" style={{ background: IBM_BLUE }}>
              <Plus className="w-3.5 h-3.5" /> Add Entry
            </Button>
          </div>
        </div>

        {/* ── Summary pills ── */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: `${kpis.length} KPIs Tracked`, color: IBM_BLUE },
            { label: `${summary.onTrack} On Track`,  color: GREEN  },
            { label: `${summary.atRisk} At Risk`,    color: AMBER  },
            { label: `${summary.behind} Needs Focus`, color: RED   },
          ].map(pill => (
            <div key={pill.label}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
              style={{ background: `${pill.color}12`, borderColor: `${pill.color}30`, color: pill.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: pill.color }} />
              {pill.label}
            </div>
          ))}
        </div>

        {/* ── Category tabs ── */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setCategory(cat); setSelectedKey(null); }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                category === cat
                  ? "text-white border-transparent shadow"
                  : "bg-white border-slate-200 text-slate-600 hover:border-blue-200",
              )}
              style={category === cat ? { background: IBM_BLUE } : {}}>
              {cat}
            </button>
          ))}
        </div>

        {/* ── KPI Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(k => (
              <KpiCard key={k.key} k={k} selected={selectedKey === k.key}
                onClick={() => setSelectedKey(prev => prev === k.key ? null : k.key)} />
            ))}
          </div>
        )}

        {/* ── Expanded KPI panel ── */}
        <AnimatePresence>
          {selectedKpi && (
            <div ref={expandedRef}>
              {histLoading ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
                  <RefreshCw className="w-6 h-6 text-blue-300 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Loading historical data…</p>
                </div>
              ) : (
                <ExpandedPanel
                  kpi={selectedKpi}
                  history={history}
                  feedback={feedback}
                  onClose={() => setSelectedKey(null)}
                  onFeedbackSubmit={() => void loadFeedback()}
                />
              )}
            </div>
          )}
        </AnimatePresence>

        {/* ── General Feedback ── */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" /> General Feedback &amp; Observations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Submit form */}
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Share overall observations about KPI performance or operational trends.
              </p>
              <div className="flex gap-2">
                <Select value={genFb.sentiment} onValueChange={v => setGenFb(f => ({ ...f, sentiment: v }))}>
                  <SelectTrigger className="w-36 text-xs h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SENTIMENT_OPTS.map(o => (
                      <SelectItem key={o.v} value={o.v} className="text-xs">{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Your name (optional)" value={genFb.authorName}
                  onChange={e => setGenFb(f => ({ ...f, authorName: e.target.value }))}
                  className="text-xs h-8 flex-1" />
              </div>
              <Textarea rows={3}
                placeholder="Your observations, suggestions, or concerns for this period…"
                value={genFb.comment}
                onChange={e => setGenFb(f => ({ ...f, comment: e.target.value }))}
                className="text-xs resize-none" />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => void submitGenFeedback()}
                  disabled={genFbSending || !genFb.comment.trim()}
                  className="gap-1 text-xs" style={{ background: IBM_BLUE }}>
                  <MessageSquare className="w-3 h-3" /> Submit
                </Button>
                {genFbSuccess && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>
            </div>

            {/* Recent general feedback */}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">
                Recent Observations ({generalFeedback.length})
              </p>
              {generalFeedback.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No general feedback yet. Be the first to share an observation.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {generalFeedback.map(f => (
                    <div key={f.id} className="bg-slate-50 rounded-xl px-3 py-2 text-xs">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sentColor(f.sentiment) }} />
                        <span className="font-medium text-slate-600">{f.authorName ?? "Anonymous"}</span>
                        <span className="text-slate-400 ml-auto">{new Date(f.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">&quot;{f.comment}&quot;</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-4" />
      </div>

      <AddEntryModal
        kpis={kpis}
        open={showAddEntry}
        onClose={() => setShowAddEntry(false)}
        onSaved={() => { void loadKpis(); void loadFeedback(); }}
      />
    </div>
  );
}
