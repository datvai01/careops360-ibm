import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, ComposedChart, Line, ReferenceLine,
} from "recharts";
import {
  ArrowLeft, TrendingUp, Users, FileText, Layers, CheckCircle,
  AlertTriangle, ChevronDown, ChevronUp, Cloud, Target, Zap,
  BarChart2, Download, Share2, Info, ArrowRight, DollarSign,
  Clock, Shield, Star,
} from "lucide-react";
import {
  TRANSFORMATION_INITIATIVES,
  PORTFOLIO_SUMMARY,
  WAVE_ROADMAP,
  DECISIONS_NEEDED,
  type TransformationInitiative,
  type ValueCategory,
} from "@/data/transformationInitiatives";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const IBM_BLUE = "#0f62fe";

const VALUE_CATEGORY_COLORS: Record<ValueCategory, string> = {
  "Labor Productivity": "#1e40af",
  "Revenue / Margin Protection": "#0f766e",
  "Technology Cost Reduction": "#6d28d9",
  "Risk & Compliance Reduction": "#b45309",
  "Experience Improvement": "#be185d",
};

const STATUS_COLORS: Record<string, string> = {
  "Active Discovery": "bg-blue-100 text-blue-800",
  "MVP Design": "bg-emerald-100 text-emerald-800",
  "Planned": "bg-slate-100 text-slate-700",
  "In Delivery": "bg-purple-100 text-purple-800",
};

const COMPLEXITY_COLORS: Record<string, string> = {
  "High": "bg-red-100 text-red-700",
  "Medium-High": "bg-orange-100 text-orange-700",
  "Medium": "bg-yellow-100 text-yellow-800",
  "Low": "bg-green-100 text-green-700",
};

function MetricPill({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs font-medium text-blue-200 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-blue-300">{sub}</div>}
    </div>
  );
}

function SectionToggle({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="font-semibold text-slate-800">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

// ─── Portfolio Charts ─────────────────────────────────────────────────────────

function ValueBarChart() {
  const data = TRANSFORMATION_INITIATIVES.map(i => ({
    name: i.title.replace(" Modernization", "\nMod.").replace("Digital Front Door", "Digital\nFront Door").replace("Quote-to-Card", "Quote-\nto-Card"),
    low: i.annualValueLow,
    incremental: i.annualValueHigh - i.annualValueLow,
    color: i.primaryColor,
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} unit="M" />
        <Tooltip formatter={(v: number) => [`$${v}M`, ""]} />
        <Bar dataKey="low" name="Low estimate ($M)" stackId="a" radius={[0, 0, 4, 4]}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Bar>
        <Bar dataKey="incremental" name="Upside ($M)" stackId="a" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.color} opacity={0.4} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function BubbleChart() {
  const data = TRANSFORMATION_INITIATIVES.map(i => ({
    x: i.complexityScore,
    y: i.businessValueScore,
    z: (i.annualValueLow + i.annualValueHigh) / 2,
    name: i.title,
    color: i.primaryColor,
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis type="number" dataKey="x" name="Complexity" domain={[3, 11]} tick={{ fontSize: 11 }} label={{ value: "Complexity →", position: "insideBottom", offset: -10, fontSize: 10 }} />
        <YAxis type="number" dataKey="y" name="Business Value" domain={[4, 12]} tick={{ fontSize: 11 }} label={{ value: "Value ↑", angle: -90, position: "insideLeft", fontSize: 10 }} />
        <ZAxis type="number" dataKey="z" range={[400, 2000]} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ payload }) => {
          if (!payload?.length) return null;
          const d = payload[0].payload;
          return (
            <div className="bg-white border rounded-lg shadow-lg p-3 text-xs">
              <p className="font-semibold">{d.name}</p>
              <p>Business Value: {d.y}/10</p>
              <p>Complexity: {d.x}/10</p>
              <p>Avg Value: ${d.z}M</p>
            </div>
          );
        }} />
        <Scatter data={data}>
          {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function ValueMixDonut() {
  const cats: Record<ValueCategory, number> = {
    "Labor Productivity": 0,
    "Revenue / Margin Protection": 0,
    "Technology Cost Reduction": 0,
    "Risk & Compliance Reduction": 0,
    "Experience Improvement": 0,
  };
  TRANSFORMATION_INITIATIVES.forEach(i =>
    i.valueLevers.forEach(l => { cats[l.category] += (l.lowM + l.highM) / 2; })
  );
  const total = Object.values(cats).reduce((a, b) => a + b, 0);
  const data = Object.entries(cats).map(([name, val]) => ({
    name, value: Math.round((val / total) * 100),
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" nameKey="name" label={({ name, value }) => `${value}%`} labelLine={false}>
          {data.map((d, i) => <Cell key={i} fill={VALUE_CATEGORY_COLORS[d.name as ValueCategory]} />)}
        </Pie>
        <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function SpeedRadar() {
  const data = TRANSFORMATION_INITIATIVES.map(i => ({
    initiative: i.title.split(" ")[0],
    "Business Value": i.businessValueScore,
    "Speed to Value": i.speedToValueScore,
    "Low Complexity": 10 - i.complexityScore,
  }));
  const metrics = ["Business Value", "Speed to Value", "Low Complexity"];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="initiative" tick={{ fontSize: 11 }} />
        {metrics.map((m, i) => (
          <Radar key={m} name={m} dataKey={m} stroke={["#1e40af", "#0f766e", "#6d28d9"][i]} fill={["#1e40af", "#0f766e", "#6d28d9"][i]} fillOpacity={0.15} />
        ))}
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── Value Lever Waterfall ────────────────────────────────────────────────────

function ValueLeverWaterfall({ initiative, filter }: { initiative: TransformationInitiative; filter: string }) {
  const levers = filter === "All"
    ? initiative.valueLevers
    : initiative.valueLevers.filter(l => l.category === filter);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={levers} layout="vertical" margin={{ top: 5, right: 60, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" unit="M" tick={{ fontSize: 11 }} tickFormatter={v => `$${v}M`} />
        <YAxis type="category" dataKey="label" width={160} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => [`$${v}M`, ""]} />
        <Bar dataKey="lowM" name="Low ($M)" stackId="a" radius={[0, 0, 0, 0]}>
          {levers.map((l, i) => <Cell key={i} fill={VALUE_CATEGORY_COLORS[l.category]} />)}
        </Bar>
        <Bar dataKey="highM" name="Upside ($M)" stackId="a" radius={[0, 4, 4, 0]}>
          {levers.map((l, i) => <Cell key={i} fill={VALUE_CATEGORY_COLORS[l.category]} opacity={0.35} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── AWS Pattern Panel ────────────────────────────────────────────────────────

function AwsPatternPanel({ initiative }: { initiative: TransformationInitiative }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {initiative.awsPattern.map((comp, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">{comp.icon}</div>
          <div className="font-semibold text-sm text-slate-800 mb-1">{comp.label}</div>
          <div className="space-y-0.5">
            {comp.services.map((s, j) => (
              <div key={j} className="text-xs text-slate-500 flex items-center gap-1">
                <Cloud className="h-3 w-3 text-orange-400 flex-shrink-0" />
                {s}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Roadmap Timeline ─────────────────────────────────────────────────────────

function RoadmapTimeline({ initiative }: { initiative: TransformationInitiative }) {
  const colors = [initiative.primaryColor, "#475569", "#64748b", "#94a3b8"];
  return (
    <div className="space-y-4">
      {initiative.implementationRoadmap.map((phase, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: colors[i] || "#94a3b8" }}>
              {i + 1}
            </div>
            {i < initiative.implementationRoadmap.length - 1 && (
              <div className="w-0.5 flex-1 mt-2" style={{ background: colors[i] || "#94a3b8", opacity: 0.25 }} />
            )}
          </div>
          <div className="pb-4 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-slate-800">{phase.label}</span>
              <Badge variant="outline" className="text-xs">{phase.duration}</Badge>
            </div>
            <ul className="space-y-1 mb-2">
              {phase.deliverables.map((d, j) => (
                <li key={j} className="flex items-start gap-1.5 text-sm text-slate-600">
                  <CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-emerald-500" />
                  {d}
                </li>
              ))}
            </ul>
            <div className="text-sm font-medium text-slate-700 bg-slate-50 rounded-lg px-3 py-1.5 border">
              <span className="text-emerald-600 font-semibold">Outcome: </span>{phase.outcome}
            </div>
            {phase.decisionGate && (
              <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-200 flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span><strong>Decision gate: </strong>{phase.decisionGate}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Persona Cards ────────────────────────────────────────────────────────────

function PersonaCards({ initiative }: { initiative: TransformationInitiative }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {initiative.personas.map((p, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: initiative.primaryColor }}>
              {p.title.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <span className="font-semibold text-sm text-slate-800">{p.title}</span>
          </div>
          <div className="space-y-2">
            <div className="text-xs rounded-lg bg-red-50 border border-red-100 p-2">
              <span className="font-semibold text-red-700">Pain today: </span>
              <span className="text-slate-600">{p.painToday}</span>
            </div>
            <div className="text-xs rounded-lg bg-emerald-50 border border-emerald-100 p-2">
              <span className="font-semibold text-emerald-700">Benefit tomorrow: </span>
              <span className="text-slate-600">{p.benefitTomorrow}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Risk Table ───────────────────────────────────────────────────────────────

function RiskTable({ initiative }: { initiative: TransformationInitiative }) {
  const lvlColor = { High: "bg-red-100 text-red-700", Medium: "bg-amber-100 text-amber-700", Low: "bg-green-100 text-green-700" };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 pr-4 font-semibold text-slate-700 w-1/2">Risk</th>
            <th className="text-left py-2 pr-4 font-semibold text-slate-700">Mitigation</th>
            <th className="text-left py-2 font-semibold text-slate-700 w-20">Level</th>
          </tr>
        </thead>
        <tbody>
          {initiative.risks.map((r, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-2.5 pr-4 text-slate-700 align-top">{r.risk}</td>
              <td className="py-2.5 pr-4 text-slate-500 align-top">{r.mitigation}</td>
              <td className="py-2.5 align-top">
                <Badge className={cn("text-xs border-0", lvlColor[r.level])}>{r.level}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── KPI Table ────────────────────────────────────────────────────────────────

function KpiSection({ initiative }: { initiative: TransformationInitiative }) {
  const icons = [<BarChart2 className="h-4 w-4" />, <DollarSign className="h-4 w-4" />, <Star className="h-4 w-4" />, <Shield className="h-4 w-4" />];
  const colors = ["text-blue-600", "text-emerald-600", "text-purple-600", "text-amber-600"];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {initiative.kpis.map((cat, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className={cn("flex items-center gap-2 mb-3 font-semibold text-sm", colors[i % 4])}>
            {icons[i % 4]} {cat.category} KPIs
          </div>
          <ul className="space-y-1.5">
            {cat.items.map((kpi, j) => (
              <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                <Target className="h-3 w-3 text-slate-400 flex-shrink-0" />
                {kpi}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─── Initiative Detail View ───────────────────────────────────────────────────

const VALUE_FILTERS = ["All", "Labor Productivity", "Revenue / Margin Protection", "Technology Cost Reduction", "Risk & Compliance Reduction", "Experience Improvement"];

function InitiativeDetail({ initiative, onBack }: { initiative: TransformationInitiative; onBack: () => void }) {
  const [viewMode, setViewMode] = useState<"executive" | "delivery">("executive");
  const [valueFilter, setValueFilter] = useState("All");
  const { toast } = useToast();

  const handleExport = () => {
    toast({ title: "Export capability coming soon", description: "Business case export to PDF/PowerPoint will be available in the next release." });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-slate-600 hover:text-slate-900 gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back to Portfolio
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="h-4 w-4" /> Export Business Case
          </Button>
          <div className="flex rounded-lg border overflow-hidden">
            <button onClick={() => setViewMode("executive")}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", viewMode === "executive" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}>
              Executive View
            </button>
            <button onClick={() => setViewMode("delivery")}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", viewMode === "delivery" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50")}>
              Delivery View
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${initiative.primaryColor} 0%, ${initiative.primaryColor}cc 100%)` }}>
        <div className="p-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={cn("border-0", STATUS_COLORS[initiative.status])}>{initiative.status}</Badge>
            <Badge className={cn("border-0", COMPLEXITY_COLORS[initiative.complexity])}>Complexity: {initiative.complexity}</Badge>
            <Badge className="bg-orange-100 text-orange-700 border-0">
              <Cloud className="h-3 w-3 mr-1 inline" />AWS Cloud-Native
            </Badge>
          </div>
          <div className="text-4xl mb-3">{initiative.icon}</div>
          <h1 className="text-3xl font-bold text-white mb-2">{initiative.title}</h1>
          <p className="text-lg text-white/80 italic mb-6">"{initiative.storyline}"</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-white/70 text-xs font-medium mb-1">ANNUAL VALUE ESTIMATE</div>
              <div className="text-2xl font-bold text-white">${initiative.annualValueLow}M–${initiative.annualValueHigh}M</div>
              <div className="text-white/60 text-xs">Directional estimate</div>
            </div>
            <div>
              <div className="text-white/70 text-xs font-medium mb-1">DELIVERY HORIZON</div>
              <div className="text-2xl font-bold text-white">{initiative.deliveryHorizon}</div>
            </div>
            <div>
              <div className="text-white/70 text-xs font-medium mb-1">FIRST MVP</div>
              <div className="text-base font-semibold text-white">{initiative.firstMvp}</div>
            </div>
            <div>
              <div className="text-white/70 text-xs font-medium mb-1">CONFIDENCE</div>
              <div className="text-2xl font-bold text-white">{initiative.confidenceLevel}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why this matters */}
      <SectionToggle title="Why This Matters">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Business Problem
            </h3>
            <p className="text-sm text-slate-600 mb-3">{initiative.purpose}</p>
            <ul className="space-y-2">
              {initiative.businessPain.map((pain, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                  {pain}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" /> Target Outcomes
            </h3>
            <div className="space-y-2">
              {initiative.targetStateMetrics.slice(0, 6).map((m, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-600">{m.label}</span>
                  <span className="text-sm font-semibold text-emerald-700">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionToggle>

      {/* Current vs Future State */}
      <SectionToggle title="Current State → Future State">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Current State
            </h4>
            <div className="space-y-2">
              {initiative.currentStateMetrics.map((m, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-red-50">
                  <span className="text-xs text-slate-600">{m.label}</span>
                  <span className="text-xs font-bold text-slate-800">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-600 mb-3 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Target State
            </h4>
            <div className="space-y-2">
              {initiative.targetStateMetrics.map((m, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-emerald-50">
                  <span className="text-xs text-slate-600">{m.label}</span>
                  <span className="text-xs font-bold text-emerald-800">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionToggle>

      {/* ROI / Value Levers */}
      <SectionToggle title="Value Levers & ROI Storyline">
        <div className="mb-4 flex flex-wrap gap-2">
          {VALUE_FILTERS.map(f => (
            <button key={f} onClick={() => setValueFilter(f)}
              className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                valueFilter === f ? "bg-slate-900 text-white border-slate-900" : "text-slate-600 hover:bg-slate-100 border-slate-200")}>
              {f}
            </button>
          ))}
        </div>
        <ValueLeverWaterfall initiative={initiative} filter={valueFilter} />
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 flex items-start gap-2">
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          {initiative.roiNote} Final ROI requires confirmation of Horizon baseline volumes, cost-to-serve, current run cost, FTE allocation, and implementation scope.
        </div>
      </SectionToggle>

      {/* How IBM helps */}
      <SectionToggle title="How IBM Helps">
        <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-900 font-medium">
          IBM acts as Horizon's transformation partner, systems integrator, AWS cloud-native delivery partner, and healthcare payer operations advisor throughout this engagement.
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {initiative.howIbmHelps.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ background: IBM_BLUE }}>
                {i + 1}
              </div>
              <span className="text-sm text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </SectionToggle>

      {/* AWS Pattern */}
      <SectionToggle title="AWS Cloud-Native Foundation">
        <div className="mb-4 text-sm text-slate-600">
          This initiative is built on AWS-native services, providing Horizon with a modern, scalable, and secure platform without proprietary technology lock-in.
        </div>
        <AwsPatternPanel initiative={initiative} />
      </SectionToggle>

      {/* Roadmap */}
      <SectionToggle title="Implementation Roadmap">
        <RoadmapTimeline initiative={initiative} />
      </SectionToggle>

      {/* Personas — delivery view only or always */}
      <SectionToggle title="Personas Impacted">
        <PersonaCards initiative={initiative} />
      </SectionToggle>

      {/* Risks */}
      <SectionToggle title="Risks & Mitigations">
        <RiskTable initiative={initiative} />
      </SectionToggle>

      {/* KPIs */}
      <SectionToggle title="KPIs to Track">
        <KpiSection initiative={initiative} />
      </SectionToggle>

      {viewMode === "delivery" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base text-blue-900">Delivery View — Team & Governance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-800">
            <p>IBM operates in a pod-based delivery model aligned to Horizon's product domains. Each initiative has a named IBM Delivery Lead, a Horizon Product Owner, and a cross-functional pod with embedded change management.</p>
            <div className="grid md:grid-cols-3 gap-3">
              {["IBM Delivery Lead", "Horizon Product Owner", "Transformation PMO"].map((r, i) => (
                <div key={i} className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="font-semibold text-blue-900 mb-1">{r}</div>
                  <div className="text-xs text-blue-700">To be confirmed</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compare button */}
      <div className="text-center pt-2">
        <Button onClick={onBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Compare All Initiatives
        </Button>
      </div>
    </div>
  );
}

// ─── Initiative Card ──────────────────────────────────────────────────────────

function InitiativeCard({ initiative, onSelect }: { initiative: TransformationInitiative; onSelect: () => void }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-slate-200 overflow-hidden group"
      onClick={onSelect}>
      <div className="h-1.5" style={{ background: initiative.primaryColor }} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl">{initiative.icon}</div>
          <Badge className={cn("text-xs border-0", STATUS_COLORS[initiative.status])}>{initiative.status}</Badge>
        </div>
        <h3 className="font-bold text-slate-900 text-lg mb-1">{initiative.title}</h3>
        <p className="text-xs italic text-slate-500 mb-3">"{initiative.storyline}"</p>
        <p className="text-sm text-slate-600 mb-4 line-clamp-3">{initiative.shortDescription}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg p-2.5 text-center" style={{ background: initiative.accentColor }}>
            <div className="text-lg font-bold" style={{ color: initiative.primaryColor }}>
              ${initiative.annualValueLow}M–${initiative.annualValueHigh}M
            </div>
            <div className="text-xs text-slate-600 mt-0.5">Annual Value Est.</div>
          </div>
          <div className="rounded-lg p-2.5 text-center bg-slate-50">
            <div className="text-lg font-bold text-slate-800">{initiative.deliveryHorizon}</div>
            <div className="text-xs text-slate-500 mt-0.5">Delivery Horizon</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge className={cn("text-xs border-0", COMPLEXITY_COLORS[initiative.complexity])}>
            {initiative.complexity} complexity
          </Badge>
          <Badge className="text-xs bg-orange-50 text-orange-700 border-0">
            <Cloud className="h-3 w-3 mr-0.5 inline" />AWS-Native
          </Badge>
        </div>

        <Button className="w-full group-hover:opacity-90 transition-opacity gap-2 text-white"
          style={{ background: initiative.primaryColor }}>
          View Business Case <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Portfolio Table ──────────────────────────────────────────────────────────

function PortfolioTable({ onSelect }: { onSelect: (id: string) => void }) {
  const rows = [
    { init: TRANSFORMATION_INITIATIVES[0], purpose: "Modernize legacy payment platform to cloud-native AWS services", currentPain: "Long batch windows, limited traceability, high print dependency", outcome: "24/7 availability, 40–70% print reduction, real-time reconciliation", execOwner: "CIO / COO" },
    { init: TRANSFORMATION_INITIATIVES[1], purpose: "Streamline Large Group quoting and sales-to-enrollment handoff", currentPain: "15–25 manual touchpoints, 15–25% rework rate, version confusion", outcome: "50% fewer touches, faster cycle time, improved win rate", execOwner: "Chief Sales Officer" },
    { init: TRANSFORMATION_INITIATIVES[2], purpose: "Create real-time enrollment intake and validation gateway", currentPain: "48–119 hr activation, 4.1% error rate, 435 FTE manual effort", outcome: "Same-day activation, 96% auto-ingestion, 124 FTEs redeployable", execOwner: "CIO / Chief Enrollment Officer" },
    { init: TRANSFORMATION_INITIATIVES[3], purpose: "Digitize payer document operations across 100+ document types", currentPain: "60K+ daily pages, fragmented templates, manual QA, poor traceability", outcome: "40–70% print reduction, digital-first delivery, automated compliance", execOwner: "COO / Chief Member Officer" },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            {["Initiative", "Purpose", "Current Pain", "Target Outcome", "Annual Value", "Complexity", "Horizon", "First MVP", "Exec Owner"].map(h => (
              <th key={h} className="text-left px-3 py-3 font-semibold text-slate-700 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
              <td className="px-3 py-3">
                <button onClick={() => onSelect(row.init.id)}
                  className="flex items-center gap-2 font-semibold hover:underline text-left"
                  style={{ color: row.init.primaryColor }}>
                  <span>{row.init.icon}</span> {row.init.title}
                </button>
              </td>
              <td className="px-3 py-3 text-slate-600 max-w-[180px]">{row.purpose}</td>
              <td className="px-3 py-3 text-slate-500 max-w-[180px] text-xs">{row.currentPain}</td>
              <td className="px-3 py-3 text-emerald-700 max-w-[180px] text-xs">{row.outcome}</td>
              <td className="px-3 py-3 font-bold whitespace-nowrap" style={{ color: row.init.primaryColor }}>
                ${row.init.annualValueLow}M–${row.init.annualValueHigh}M
              </td>
              <td className="px-3 py-3">
                <Badge className={cn("text-xs border-0", COMPLEXITY_COLORS[row.init.complexity])}>{row.init.complexity}</Badge>
              </td>
              <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{row.init.deliveryHorizon}</td>
              <td className="px-3 py-3 text-slate-500 text-xs max-w-[140px]">{row.init.firstMvp}</td>
              <td className="px-3 py-3 text-slate-500 text-xs whitespace-nowrap">{row.execOwner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Portfolio Wave Roadmap ───────────────────────────────────────────────────

function WaveRoadmap() {
  const waveColors = ["#1e40af", "#0f766e", "#6d28d9", "#b45309"];
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {WAVE_ROADMAP.map((wave, i) => (
        <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 text-white font-bold text-sm" style={{ background: waveColors[i] }}>
            {wave.wave} · {wave.period}
          </div>
          <div className="p-3 space-y-1.5">
            {wave.items.map((item, j) => (
              <div key={j} className="text-xs text-slate-600 flex items-start gap-1.5">
                <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-slate-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Ticket Reduction Plan ───────────────────────────────────────────────────

const TICKET_VOLUME_TREND = [
  { period: "Baseline", volume: 120000, indexPct: 100, yoyPct: 0 },
  { period: "Year 1", volume: 96000, indexPct: 80, yoyPct: -20 },
  { period: "Year 2", volume: 81600, indexPct: 68, yoyPct: -15 },
  { period: "Year 3+", volume: 75072, indexPct: 62.6, yoyPct: -8 },
];

const TICKET_REDUCTION_BREAKDOWN = [
  {
    period: "Year 1",
    totalReduction: 24000,
    yoyLabel: "−20%",
    aiops: 9600,
    digitalFrontDoor: 8400,
    coreMod: 3600,
    quoteToCard: 2400,
  },
  {
    period: "Year 2",
    totalReduction: 14400,
    yoyLabel: "−15%",
    aiops: 3600,
    digitalFrontDoor: 6480,
    coreMod: 2880,
    quoteToCard: 1440,
  },
  {
    period: "Year 3+",
    totalReduction: 6528,
    yoyLabel: "−8%",
    aiops: 1958,
    digitalFrontDoor: 2611,
    coreMod: 1306,
    quoteToCard: 653,
  },
];

const TICKET_INITIATIVE_META = [
  {
    key: "aiops" as const,
    name: "AIOps & Operational Intelligence",
    color: "#1e40af",
    y1Pct: "40%", y2Pct: "25%", y3Pct: "30%",
    factors: [
      "Proactive anomaly detection eliminates reactive incident-ticket storms",
      "Automated remediation resolves ~60% of L1 issues without human intervention",
      "Noise reduction cuts duplicate / alert-only tickets by 70%+",
      "Self-healing operations reduce infrastructure-incident queue volume",
    ],
  },
  {
    key: "digitalFrontDoor" as const,
    name: "Digital Front Door",
    color: "#0f766e",
    y1Pct: "35%", y2Pct: "45%", y3Pct: "40%",
    factors: [
      "Self-service portal deflects member inquiry tickets (EOB, ID cards, benefits)",
      "AI-assisted chat resolves 50%+ of member questions without agent hand-off",
      "IVR modernisation deflects routine call volume that generates work orders",
      "Provider portal automation reduces provider-initiated helpdesk tickets",
    ],
  },
  {
    key: "coreMod" as const,
    name: "Core Systems Modernisation",
    color: "#6d28d9",
    y1Pct: "15%", y2Pct: "20%", y3Pct: "20%",
    factors: [
      "Fewer integration failures reduce downstream exception and retry tickets",
      "Automated batch reconciliation eliminates manual error-correction tickets",
      "API-first architecture reduces manual-workaround volume across teams",
      "Event-driven processing reduces SLA-breach escalation tickets",
    ],
  },
  {
    key: "quoteToCard" as const,
    name: "Quote-to-Card Automation",
    color: "#b45309",
    y1Pct: "10%", y2Pct: "10%", y3Pct: "10%",
    factors: [
      "Automated enrollment processing reduces broker error-correction tickets",
      "EDI 834 validation at ingestion reduces downstream exception queues",
      "Real-time eligibility status eliminates 'where is my card' inquiry tickets",
      "Broker self-service reduces agent-assisted enrollment support volume",
    ],
  },
];

const TICKET_COLORS = {
  aiops: "#1e40af",
  digitalFrontDoor: "#0f766e",
  coreMod: "#6d28d9",
  quoteToCard: "#b45309",
};

function VolumeTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={TICKET_VOLUME_TREND.filter(d => d.period !== "Baseline")} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
        <YAxis
          yAxisId="left"
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
          tick={{ fontSize: 11 }}
          label={{ value: "Ticket Volume", angle: -90, position: "insideLeft", offset: 10, fontSize: 10 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[55, 105]}
          tickFormatter={(v: number) => `${v}%`}
          tick={{ fontSize: 11 }}
          label={{ value: "Index (Baseline=100)", angle: 90, position: "insideRight", offset: 10, fontSize: 10 }}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === "Ticket Volume") return [`${(value / 1000).toFixed(1)}K`, name];
            return [`${value}%`, "Index vs Baseline"];
          }}
        />
        <ReferenceLine yAxisId="left" y={96000} stroke="#94a3b8" strokeDasharray="4 2" strokeWidth={1} />
        <Bar yAxisId="left" dataKey="volume" name="Ticket Volume" radius={[4, 4, 0, 0]} maxBarSize={60}>
          {TICKET_VOLUME_TREND.filter(d => d.period !== "Baseline").map((d, i) => (
            <Cell
              key={i}
              fill={i === 0 ? "#3b82f6" : i === 1 ? "#22c55e" : "#10b981"}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="indexPct"
          name="Index vs Baseline"
          stroke="#0f62fe"
          strokeWidth={2.5}
          dot={{ r: 5, fill: "#0f62fe", strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 7 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function ReductionBreakdownChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={TICKET_REDUCTION_BREAKDOWN} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(v: number, name: string) => {
            const meta = TICKET_INITIATIVE_META.find(m => m.key === name);
            return [`${v.toLocaleString()} tickets`, meta?.name ?? name];
          }}
        />
        <Legend
          formatter={(value: string) => {
            const meta = TICKET_INITIATIVE_META.find(m => m.key === value);
            return <span style={{ fontSize: 11 }}>{meta?.name ?? value}</span>;
          }}
          wrapperStyle={{ paddingTop: 8 }}
        />
        <Bar dataKey="aiops" name="aiops" stackId="a" fill={TICKET_COLORS.aiops} radius={[0, 0, 0, 0]} />
        <Bar dataKey="digitalFrontDoor" name="digitalFrontDoor" stackId="a" fill={TICKET_COLORS.digitalFrontDoor} />
        <Bar dataKey="coreMod" name="coreMod" stackId="a" fill={TICKET_COLORS.coreMod} />
        <Bar dataKey="quoteToCard" name="quoteToCard" stackId="a" fill={TICKET_COLORS.quoteToCard} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TicketReductionSection() {
  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Ticket Reduction Plan</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Year-over-year operational ticket reduction targets driven by the four transformation initiatives.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0 mt-1">
          <Badge className="bg-blue-50 text-blue-800 border-0 text-xs">−20% Year 1</Badge>
          <Badge className="bg-emerald-50 text-emerald-800 border-0 text-xs">−15% Year 2</Badge>
          <Badge className="bg-teal-50 text-teal-800 border-0 text-xs">−8% Year 3+</Badge>
        </div>
      </div>

      {/* KPI summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-5 mt-4">
        {[
          { label: "Year 1 Target", value: "96,000", sub: "−24,000 tickets (−20%)", color: "border-blue-200 bg-blue-50" },
          { label: "Year 2 Target", value: "81,600", sub: "−14,400 tickets (−15%)", color: "border-emerald-200 bg-emerald-50" },
          { label: "Year 3+ Steady State", value: "75,072", sub: "−6,528 tickets (−8%)", color: "border-teal-200 bg-teal-50" },
        ].map((kpi, i) => (
          <div key={i} className={`rounded-xl border px-4 py-3 ${kpi.color}`}>
            <div className="text-xl font-bold text-slate-900">{kpi.value}</div>
            <div className="text-xs font-medium text-slate-700 mt-0.5">{kpi.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Two charts side by side */}
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">Total Ticket Volume Trend</CardTitle>
            <p className="text-xs text-slate-500">Bars = absolute volume · Line = index vs baseline (right axis)</p>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <VolumeTrendChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-slate-700">Annual Reduction by Initiative</CardTitle>
            <p className="text-xs text-slate-500">Stacked bars show tickets removed each year, attributed by initiative</p>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <ReductionBreakdownChart />
          </CardContent>
        </Card>
      </div>

      {/* YoY contribution split table */}
      <Card className="mb-5">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-slate-700">Initiative Contribution Split</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4 px-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Initiative</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Year 1</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Year 2</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Year 3+</th>
                  <th className="text-left py-2 pl-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Primary Lever</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { meta: TICKET_INITIATIVE_META[0], lever: "Automated L1 remediation & alert noise reduction" },
                  { meta: TICKET_INITIATIVE_META[1], lever: "Self-service deflection & AI-assisted member chat" },
                  { meta: TICKET_INITIATIVE_META[2], lever: "Integration reliability & batch automation" },
                  { meta: TICKET_INITIATIVE_META[3], lever: "EDI validation & broker self-service portal" },
                ].map(({ meta, lever }) => (
                  <tr key={meta.key} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                        <span className="text-slate-700 font-medium">{meta.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${meta.color}18`, color: meta.color }}>
                        {meta.y1Pct}
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${meta.color}18`, color: meta.color }}>
                        {meta.y2Pct}
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: `${meta.color}18`, color: meta.color }}>
                        {meta.y3Pct}
                      </span>
                    </td>
                    <td className="pl-4 py-2.5 text-xs text-slate-500">{lever}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Contributing factors cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {TICKET_INITIATIVE_META.map(meta => (
          <div key={meta.key} className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: `${meta.color}12`, borderBottom: `2px solid ${meta.color}30` }}>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: meta.color }} />
              <span className="font-semibold text-sm" style={{ color: meta.color }}>{meta.name}</span>
              <span className="ml-auto text-xs font-medium text-slate-500">
                Y1: {meta.y1Pct} · Y2: {meta.y2Pct} · Y3+: {meta.y3Pct}
              </span>
            </div>
            <div className="p-4 space-y-2">
              {meta.factors.map((f, j) => (
                <div key={j} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: meta.color }} />
                  {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-500 flex items-start gap-2">
        <Info className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        Ticket volume figures are directional business case estimates indexed to a normalised baseline. Final targets require confirmation of Horizon's actual operational ticket volumes, classification taxonomy, channel mix, and current automation baseline.
      </div>
    </div>
  );
}

// ─── Portfolio Landing Page ───────────────────────────────────────────────────

function PortfolioView({ onSelect }: { onSelect: (id: string) => void }) {
  const { toast } = useToast();

  const handleExport = () => {
    toast({ title: "Export capability coming soon", description: "Portfolio-level business case export will be available in the next release." });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">Portfolio View</Badge>
            <Badge className="bg-orange-50 text-orange-700 border-0 text-xs">
              <Cloud className="h-3 w-3 mr-1 inline" />AWS Cloud-Native
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Transformation Initiatives Business Case</h1>
          <p className="text-slate-500 max-w-3xl text-sm">
            Four high-value initiatives to modernize Horizon operations, improve member and employer experience, reduce administrative cost, and create a cloud-native AWS foundation for future growth.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="h-4 w-4" /> Export Portfolio
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: "Share link copied", description: "Portfolio link ready to share." })}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      {/* Summary banner */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #0f62fe 100%)" }}>
        <div className="px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <MetricPill label="Total Annual Value" value={`$${PORTFOLIO_SUMMARY.totalValueLow}M–$${PORTFOLIO_SUMMARY.totalValueHigh}M`} sub="Directional estimate" />
            <MetricPill label="Productivity Opportunity" value={PORTFOLIO_SUMMARY.productivityRange} />
            <MetricPill label="Cycle-Time Reduction" value={PORTFOLIO_SUMMARY.cycleTimeReduction} />
            <MetricPill label="Member / Provider Impact" value={PORTFOLIO_SUMMARY.memberProviderImpact} />
            <MetricPill label="AWS Alignment" value={PORTFOLIO_SUMMARY.awsAlignment} />
            <MetricPill label="Delivery Horizon" value={PORTFOLIO_SUMMARY.deliveryHorizon} />
          </div>
        </div>
      </div>

      {/* Initiative Cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Four Initiatives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {TRANSFORMATION_INITIATIVES.map(init => (
            <InitiativeCard key={init.id} initiative={init} onSelect={() => onSelect(init.id)} />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Portfolio Analytics</h2>
        <Tabs defaultValue="value">
          <TabsList className="mb-4">
            <TabsTrigger value="value">Annual Value</TabsTrigger>
            <TabsTrigger value="bubble">Value vs Complexity</TabsTrigger>
            <TabsTrigger value="donut">Value Mix</TabsTrigger>
            <TabsTrigger value="radar">Scoring</TabsTrigger>
          </TabsList>
          <Card>
            <CardContent className="pt-4">
              <TabsContent value="value">
                <p className="text-xs text-slate-500 mb-3">Stacked bar shows low estimate + upside range. All values are directional business case estimates ($M annual).</p>
                <ValueBarChart />
              </TabsContent>
              <TabsContent value="bubble">
                <p className="text-xs text-slate-500 mb-3">Bubble size = average annual value. Top-left quadrant = high value, lower complexity.</p>
                <BubbleChart />
              </TabsContent>
              <TabsContent value="donut">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <ValueMixDonut />
                  <div className="space-y-2 flex-shrink-0">
                    {Object.entries(VALUE_CATEGORY_COLORS).map(([cat, color]) => (
                      <div key={cat} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
                        <span className="text-slate-600">{cat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="radar">
                <p className="text-xs text-slate-500 mb-3">Comparison across business value, speed-to-value, and implementation ease (inverse of complexity).</p>
                <SpeedRadar />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>

      {/* Portfolio comparison table */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Portfolio Comparison</h2>
        <PortfolioTable onSelect={onSelect} />
      </div>

      {/* Wave roadmap */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Recommended Sequencing</h2>
        <p className="text-sm text-slate-500 mb-4">All four initiatives run in parallel waves, optimized for speed-to-value.</p>
        <WaveRoadmap />
      </div>

      {/* Ticket Reduction Plan */}
      <TicketReductionSection />

      {/* Decisions needed */}
      <Card className="border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Decisions Needed from Horizon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2">
            {DECISIONS_NEEDED.map((d, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 text-xs font-bold flex-shrink-0">{i + 1}</div>
                <span className="text-sm text-slate-700">{d}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assumptions disclaimer */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 px-5 py-4 text-xs text-slate-500 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-700">Business Case Assumptions: </strong>
          All financial values are directional business case estimates intended for prioritization and discussion. Final ROI requires confirmation of Horizon baseline volumes, cost-to-serve, current run cost, FTE allocation, channel mix, document volumes, and implementation scope.
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransformationInitiatives() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId
    ? TRANSFORMATION_INITIATIVES.find(i => i.id === selectedId) ?? null
    : null;

  return (
    <div className="p-6">
      {selected ? (
        <InitiativeDetail initiative={selected} onBack={() => setSelectedId(null)} />
      ) : (
        <PortfolioView onSelect={setSelectedId} />
      )}
    </div>
  );
}
