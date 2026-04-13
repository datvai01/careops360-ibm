import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ArrowLeft,
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
  Layers,
  Cpu,
  AlertCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const C = {
  blue: "#0f62fe",
  green: "#24a148",
  teal: "#009d9a",
  purple: "#8a3ffc",
  orange: "#ff832b",
  red: "#da1e28",
};

/* ─────────────────────── DATA ─────────────────────── */

const KPI_TILES = [
  { label: "Total Certified Resources", value: "214", sub: "Current, active certifications", icon: Award, color: C.blue, delta: "+18 vs prior quarter" },
  { label: "Planned Certifications", value: "312", sub: "Next 6–12 months", icon: Target, color: C.purple, delta: "+46% growth planned" },
  { label: "Workforce AI-Enabled", value: "41%", sub: "Of total delivery team", icon: Brain, color: C.teal, delta: "→ 78% target by Month 12" },
  { label: "Automation Coverage", value: "63%", sub: "Processes with automation", icon: Zap, color: C.orange, delta: "→ 91% target by Month 12" },
  { label: "FTE Productivity Gain", value: "~70%", sub: "Manual work eliminated", icon: TrendingUp, color: C.green, delta: "124 FTEs redeployed" },
  { label: "Auto-Remediation Ready", value: "95%", sub: "Target capability milestone", icon: Shield, color: "#8a3ffc", delta: "Achieved at Month 6" },
];

const MATURITY_STAGES = [
  {
    id: "traditional",
    label: "Traditional Ops",
    desc: "Reactive, manual operations with ticket-driven support models. High FTE dependency.",
    position: 0,
  },
  {
    id: "automation",
    label: "Automation-Led Ops",
    desc: "Runbook automation and scripted remediation reduce manual triage. Shift-left begins.",
    position: 1,
  },
  {
    id: "ai-augmented",
    label: "AI-Augmented Ops",
    desc: "AIOps and ML models drive proactive alerting, anomaly detection, and co-pilot assistance.",
    position: 2,
  },
  {
    id: "autonomous",
    label: "Autonomous Ops",
    desc: "Self-healing systems, generative AI orchestration, and 95%+ auto-remediation. Minimal human intervention.",
    position: 3,
  },
];

type CapRow = {
  area: string;
  sub: string;
  current: number;
  planned: number;
  priority: "Critical" | "High" | "Medium";
  impact: string;
};

const CAPABILITY_TABLE: CapRow[] = [
  { area: "AI / ML / GenAI",            sub: "LLM, RAG, ML Ops, AIOps",             current: 14,  planned: 42,  priority: "Critical", impact: "Auto-remediation, predictive ops" },
  { area: "AI / ML / GenAI",            sub: "Natural Language Processing",          current: 8,   planned: 22,  priority: "Critical", impact: "AI Copilot, root cause analysis" },
  { area: "Automation / AIOps",         sub: "Runbook Automation, Self-Heal",        current: 31,  planned: 54,  priority: "Critical", impact: "70% manual effort reduction" },
  { area: "Automation / AIOps",         sub: "DevOps / GitOps / SRE",               current: 28,  planned: 41,  priority: "High",     impact: "Release velocity, MTTR reduction" },
  { area: "Data Engineering",           sub: "Real-Time Streaming, Kafka",           current: 17,  planned: 34,  priority: "Critical", impact: "Real-time validation pipeline" },
  { area: "Data Engineering",           sub: "MDM, Data Quality, Mastering",        current: 11,  planned: 28,  priority: "High",     impact: "Single source of truth, accuracy" },
  { area: "Integration (API / EDI)",    sub: "REST, FHIR, 834/820 EDI",             current: 24,  planned: 36,  priority: "High",     impact: "Faster partner onboarding" },
  { area: "Integration (API / EDI)",    sub: "Event-Driven Architecture",           current: 9,   planned: 21,  priority: "High",     impact: "1-day member activation" },
  { area: "Cloud & Platform",           sub: "AWS, Azure, OpenShift",               current: 38,  planned: 52,  priority: "Medium",   impact: "Scale, reliability, cloud costs" },
  { area: "Cloud & Platform",           sub: "Kubernetes, Service Mesh",             current: 21,  planned: 31,  priority: "Medium",   impact: "Resilience, zero-downtime deploys" },
  { area: "Healthcare Domain",          sub: "HIPAA, ACA, 834 Compliance",           current: 19,  planned: 26,  priority: "High",     impact: "Audit-readiness, accuracy" },
  { area: "Healthcare Domain",          sub: "Claims, Prior Auth, Enrollment",      current: 17,  planned: 22,  priority: "Medium",   impact: "Domain accuracy in AI outputs" },
];

type Layer = {
  id: number;
  name: string;
  shortName: string;
  skills: string[];
  outcome: string;
  currentStrength: number;
  plannedStrength: number;
  requiredCerts: number;
  plannedCerts: number;
  value: string;
  timeline: string;
  color: string;
};

const LAYERS: Layer[] = [
  {
    id: 1,
    name: "Unified Enrollment Channels",
    shortName: "Layer 1: Intake",
    skills: ["REST API", "EDI 834", "Event Streaming", "Web / Portal Dev"],
    outcome: "4-day → 1-day activation; all intake channels unified",
    currentStrength: 62,
    plannedStrength: 88,
    requiredCerts: 24,
    plannedCerts: 36,
    value: "Member friction eliminated at onboarding",
    timeline: "Week 3 go-live",
    color: C.blue,
  },
  {
    id: 2,
    name: "Pre-Validation & Coverage Validation",
    shortName: "Layer 2: Validation",
    skills: ["Rules Engines", "AI Validation Models", "Data Quality"],
    outcome: "95%+ error detection pre-submission; zero downstream rejects",
    currentStrength: 54,
    plannedStrength: 86,
    requiredCerts: 17,
    plannedCerts: 34,
    value: "↓ rework cost, ↑ first-pass accuracy",
    timeline: "Month 2",
    color: C.teal,
  },
  {
    id: 3,
    name: "Horizon 834 Canonical + Real-Time Validation",
    shortName: "Layer 3: Canonical",
    skills: ["Data Engineering", "Streaming (Kafka)", "Schema Governance"],
    outcome: "Real-time validation; 13.5 hrs → 5 min error detection",
    currentStrength: 48,
    plannedStrength: 82,
    requiredCerts: 17,
    plannedCerts: 34,
    value: "Operational speed, real-time SLA visibility",
    timeline: "Month 3",
    color: C.purple,
  },
  {
    id: 4,
    name: "Early Member Record Mastering",
    shortName: "Layer 4: Mastering",
    skills: ["MDM", "AI Identity Resolution", "Deduplication"],
    outcome: "Single source of truth; duplicate rate < 0.5%",
    currentStrength: 41,
    plannedStrength: 78,
    requiredCerts: 11,
    plannedCerts: 28,
    value: "Data integrity for all downstream systems",
    timeline: "Month 3",
    color: C.orange,
  },
  {
    id: 5,
    name: "Automated Syndication",
    shortName: "Layer 5: Syndication",
    skills: ["Integration Patterns", "Event-Driven Arch", "API Gateway"],
    outcome: "Automated multi-system syndication in < 4 hours",
    currentStrength: 57,
    plannedStrength: 90,
    requiredCerts: 9,
    plannedCerts: 21,
    value: "1-day member activation, partner confidence",
    timeline: "Month 6",
    color: C.green,
  },
  {
    id: 6,
    name: "Command Center — Mission Control",
    shortName: "Layer 6: Command Center",
    skills: ["AIOps", "GenAI", "ML Ops", "Observability", "NLP"],
    outcome: "~70% manual effort reduced; AI Copilot live for all ops",
    currentStrength: 38,
    plannedStrength: 85,
    requiredCerts: 14,
    plannedCerts: 42,
    value: "$2M+ cost avoidance; autonomous operations",
    timeline: "Month 12",
    color: C.purple,
  },
];

const AI_CERTS = [
  { label: "LLM / Foundation Models", current: 6, planned: 18, use: "AI Copilot, root cause, GenAI summarisation" },
  { label: "RAG / Vector Embeddings", current: 4, planned: 14, use: "Knowledge retrieval, ops assistant" },
  { label: "ML Ops / Model Lifecycle", current: 8, planned: 22, use: "Auto-remediation models, drift detection" },
  { label: "AIOps / Observability AI", current: 12, planned: 28, use: "Predictive alerting, self-healing" },
  { label: "NLP / Text Analytics", current: 8, planned: 22, use: "Ticket classification, Copilot" },
  { label: "Computer Vision / OCR", current: 3, planned: 10, use: "Document processing, forms intake" },
];

const RADAR_DATA = [
  { axis: "AI / GenAI",    current: 38, planned: 82 },
  { axis: "Automation",    current: 63, planned: 91 },
  { axis: "Data Eng",      current: 52, planned: 85 },
  { axis: "Integration",   current: 68, planned: 90 },
  { axis: "Cloud / Infra", current: 74, planned: 92 },
  { axis: "Domain",        current: 71, planned: 88 },
];

const VALUE_IMPACT = [
  { cap: "AI / GenAI",    metric: "95% Auto-Remediation",       value: "$2M+",    color: C.purple },
  { cap: "Data Skills",   metric: "Real-Time Processing",        value: "$3.2M",   color: C.teal },
  { cap: "AIOps",         metric: "13.5 hrs → 5 min resolution", value: "$1.8M",   color: C.blue },
  { cap: "Integration",   metric: "Partner Onboarding Speed",    value: "$2.1M",   color: C.orange },
  { cap: "Domain Skills", metric: "Compliance & Accuracy",       value: "$0.8M",   color: C.green },
  { cap: "Automation",    metric: "70% Manual Work Eliminated",  value: "$9.7M",   color: "#da1e28" },
];

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
  const pct = Math.round(((planned - current) / current) * 100);
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
  return (
    <div className="space-y-4">
      <SectionHeader icon={Target} title="Executive Summary" sub="IBM delivery capability evolution — current state to AI-autonomous operations" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {KPI_TILES.map((t) => (
          <div key={t.label} className="rounded-xl border p-4 space-y-2 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <t.icon size={16} style={{ color: t.color }} />
              <span className="text-xs text-muted-foreground">{t.delta}</span>
            </div>
            <div className="text-2xl font-black tracking-tight" style={{ color: t.color }}>{t.value}</div>
            <div>
              <div className="text-sm font-semibold">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.sub}</div>
            </div>
          </div>
        ))}
      </div>
      {/* AI summary box */}
      <div className="rounded-xl border p-4 flex items-start gap-3"
        style={{ background: `${C.blue}08`, borderColor: `${C.blue}25` }}>
        <Brain size={18} style={{ color: C.blue }} className="mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold mb-1">Strategic Capability Narrative</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            IBM is evolving the Horizon delivery model from traditional operations to AI-augmented and autonomous operations over 12 months.
            Certified AI/ML resources will grow <strong className="text-foreground">3×</strong>, automation coverage reaches <strong className="text-foreground">91%</strong>,
            and 124 FTEs are redeployed from manual tasks to higher-value advisory work — directly enabling the Digital Front Door value of <strong className="text-foreground">$16M–$26M</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

function MaturityProgression() {
  const current = 1;
  const target  = 3;

  return (
    <div className="space-y-4">
      <SectionHeader icon={TrendingUp} title="Capability Maturity Progression" sub="Where IBM delivery sits today and where it will be in 12 months" color={C.teal} />
      <div className="relative">
        {/* track */}
        <div className="flex items-center relative z-0">
          {MATURITY_STAGES.map((s, i) => (
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
              {i < MATURITY_STAGES.length - 1 && (
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
              <div className="text-xs font-bold" style={{ color: C.blue }}>Current State — Automation-Led Ops</div>
              <div className="text-xs text-muted-foreground">Runbook automation live; AIOps pilots running; shift-left at 63%</div>
            </div>
          </div>
          <div className="rounded-lg border p-3 flex items-center gap-3"
            style={{ borderColor: `${C.purple}30`, background: `${C.purple}06` }}>
            <div className="w-3 h-3 rounded-full" style={{ background: C.purple }} />
            <div>
              <div className="text-xs font-bold" style={{ color: C.purple }}>12-Month Target — Autonomous Ops</div>
              <div className="text-xs text-muted-foreground">95% auto-remediation, GenAI Copilot, self-healing systems</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CapabilityTable() {
  const [search, setSearch] = useState("");
  const [area, setArea]     = useState("all");
  const [priority, setPri]  = useState("all");
  const [sort, setSort]     = useState<"growth" | "current" | "planned">("growth");

  const areas = ["all", ...Array.from(new Set(CAPABILITY_TABLE.map(r => r.area)))];

  const filtered = CAPABILITY_TABLE
    .filter(r =>
      (area === "all" || r.area === area) &&
      (priority === "all" || r.priority === priority) &&
      (r.area.toLowerCase().includes(search.toLowerCase()) || r.sub.toLowerCase().includes(search.toLowerCase()) || r.impact.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sort === "growth") return ((b.planned - b.current) / b.current) - ((a.planned - a.current) / a.current);
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

function SkillValueMapping() {
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const selected = LAYERS.find(l => l.id === activeLayer);

  return (
    <div className="space-y-4">
      <SectionHeader icon={Layers} title="Skill-to-Value Mapping" sub="Click any layer to explore required skills, capability strength, and business outcomes" color={C.orange} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {LAYERS.map((layer) => {
          const isActive = activeLayer === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(isActive ? null : layer.id)}
              className="rounded-xl border text-left p-4 transition-all hover:shadow-md focus:outline-none"
              style={{
                borderColor: isActive ? layer.color : `${layer.color}30`,
                background: isActive ? `${layer.color}10` : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                  style={{ background: layer.color }}>
                  {layer.id}
                </div>
                {isActive ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
              </div>
              <div className="text-xs font-bold mb-1" style={{ color: layer.color }}>{layer.shortName}</div>
              <div className="text-sm font-semibold mb-2 leading-snug">{layer.name}</div>
              <div className="flex flex-wrap gap-1 mb-3">
                {layer.skills.map(s => (
                  <span key={s} className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground font-medium">{s}</span>
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-muted-foreground">Capability strength</span>
                  <span className="font-bold" style={{ color: layer.color }}>{layer.currentStrength}% → {layer.plannedStrength}%</span>
                </div>
                <StrengthBar value={layer.currentStrength} color={layer.color} />
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={11} />{layer.timeline}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="rounded-xl border p-5 space-y-4"
          style={{ borderColor: `${selected.color}40`, background: `${selected.color}06` }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: selected.color }}>{selected.shortName}</div>
              <h3 className="text-lg font-bold">{selected.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selected.outcome}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-muted-foreground">Business value</div>
              <div className="text-base font-bold mt-0.5" style={{ color: selected.color }}>{selected.value}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg bg-background border p-3 text-center">
              <div className="text-2xl font-black" style={{ color: selected.color }}>{selected.currentStrength}%</div>
              <div className="text-xs text-muted-foreground mt-1">Current Strength</div>
            </div>
            <div className="rounded-lg bg-background border p-3 text-center">
              <div className="text-2xl font-black" style={{ color: selected.color }}>{selected.plannedStrength}%</div>
              <div className="text-xs text-muted-foreground mt-1">Planned Strength</div>
            </div>
            <div className="rounded-lg bg-background border p-3 text-center">
              <div className="text-2xl font-black" style={{ color: selected.color }}>{selected.requiredCerts}</div>
              <div className="text-xs text-muted-foreground mt-1">Current Certs</div>
            </div>
            <div className="rounded-lg bg-background border p-3 text-center">
              <div className="text-2xl font-black" style={{ color: selected.color }}>{selected.plannedCerts}</div>
              <div className="text-xs text-muted-foreground mt-1">Planned Certs</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Required Skills</div>
            <div className="flex flex-wrap gap-2">
              {selected.skills.map(s => (
                <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-semibold border"
                  style={{ background: `${selected.color}12`, borderColor: `${selected.color}30`, color: selected.color }}>{s}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} style={{ color: C.green }} />
            <span className="text-xs text-muted-foreground">Target go-live: <strong className="text-foreground">{selected.timeline}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

function AIDeepDive() {
  return (
    <div className="space-y-4">
      <SectionHeader icon={Brain} title="AI Capability Deep Dive" sub="Focused view of AI/ML/GenAI certification pipeline and use cases enabled" color={C.purple} />
      <div className="grid md:grid-cols-2 gap-6">
        {/* cert table */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Certification Pipeline</div>
          {AI_CERTS.map((c) => (
            <div key={c.label} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{c.label}</div>
                <GrowthPill current={c.current} planned={c.planned} />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span><strong className="text-foreground">{c.current}</strong> current</span>
                <ArrowUpRight size={11} style={{ color: C.purple }} />
                <span><strong className="text-foreground">{c.planned}</strong> planned</span>
              </div>
              <div className="flex gap-2">
                <div className="h-1.5 rounded-full bg-muted flex-1 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(c.current / c.planned) * 100}%`, background: C.purple }} />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Use cases: {c.use}</div>
            </div>
          ))}
        </div>
        {/* radar */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capability Radar — Current vs Planned</div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={RADAR_DATA} outerRadius="75%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Radar name="Current" dataKey="current" stroke={C.blue} fill={C.blue} fillOpacity={0.18} strokeWidth={2} />
              <Radar name="Planned" dataKey="planned" stroke={C.purple} fill={C.purple} fillOpacity={0.12} strokeWidth={2} strokeDasharray="5 3" />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center">
            <div className="flex items-center gap-1.5 text-xs"><div className="w-3 h-0.5 rounded" style={{ background: C.blue }} />Current</div>
            <div className="flex items-center gap-1.5 text-xs"><div className="w-3 h-0.5 rounded border-t-2 border-dashed" style={{ borderColor: C.purple }} />Planned</div>
          </div>
          {/* use case chips */}
          <div className="rounded-xl border p-3 space-y-2" style={{ background: `${C.purple}07`, borderColor: `${C.purple}25` }}>
            <div className="text-xs font-bold" style={{ color: C.purple }}>AI Use Cases Enabled by Uplift</div>
            {[
              { label: "Auto-Remediation", stat: "95%", color: C.green },
              { label: "Predictive Issue Detection", stat: "~80% fewer surprises", color: C.teal },
              { label: "AI Copilot for Operations", stat: "Live at Month 6", color: C.blue },
              { label: "Root Cause Analysis", stat: "5 min MTTR", color: C.orange },
            ].map(u => (
              <div key={u.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: u.color }} />
                  <span>{u.label}</span>
                </div>
                <span className="font-bold" style={{ color: u.color }}>{u.stat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkforceTransformation() {
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
          {["Manual ticket triage and escalation", "Reactive incident response", "High FTE dependency on L1/L2 ops", "Siloed tools, context-switching overhead", "Days to resolve member enrollment errors"].map(x => (
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
          {["AI-assisted triage with 95% auto-remediation", "Proactive anomaly detection — issues resolved before impact", "124 FTEs redeployed to strategic advisory roles", "Unified Command Center with GenAI Copilot", "5-minute mean time to resolution for enrollment errors"].map(x => (
            <div key={x} className="flex items-start gap-2 text-sm">
              <CheckCircle2 size={13} style={{ color: C.green }} className="mt-0.5 flex-shrink-0" />
              <span>{x}</span>
            </div>
          ))}
        </div>
      </div>
      {/* stat strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "FTEs Redeployed", value: "124", sub: "Manual → advisory & AI ops", color: C.teal },
          { label: "Manual Work Eliminated", value: "~70%", sub: "Through automation + AI", color: C.orange },
          { label: "Skills Shift", value: "Ops → AI Ops", sub: "Domain + AI hybrid model", color: C.purple },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-3 text-center">
            <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-semibold mt-1">{s.label}</div>
            <div className="text-xs text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessValueImpact() {
  return (
    <div className="space-y-4">
      <SectionHeader icon={Zap} title="Business Value Impact" sub="How capability uplift maps to measurable transformation outcomes" color={C.green} />
      <div className="grid md:grid-cols-2 gap-6">
        {/* bar chart */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Value by Capability Domain ($M)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={VALUE_IMPACT} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${v}M`} domain={[0, 12]} />
              <YAxis type="category" dataKey="cap" tick={{ fontSize: 10 }} width={88} />
              <RTooltip formatter={(v: any) => [`$${v}M`, "Estimated Value"]} />
              <Bar dataKey={(d) => parseFloat(d.value.replace(/[$M+]/g, ""))} radius={[0, 4, 4, 0]}>
                {VALUE_IMPACT.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* value cards */}
        <div className="space-y-2.5">
          {VALUE_IMPACT.map((v) => (
            <div key={v.cap} className="rounded-lg border p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: v.color }} />
                <div>
                  <div className="text-xs font-bold">{v.cap}</div>
                  <div className="text-xs text-muted-foreground">{v.metric}</div>
                </div>
              </div>
              <div className="text-base font-black flex-shrink-0" style={{ color: v.color }}>{v.value}</div>
            </div>
          ))}
          <div className="rounded-lg border p-3 flex items-center justify-between"
            style={{ background: `${C.blue}08`, borderColor: `${C.blue}25` }}>
            <div className="flex items-center gap-2">
              <Info size={14} style={{ color: C.blue }} />
              <span className="text-xs font-semibold">Total Estimated Value</span>
            </div>
            <span className="text-base font-black" style={{ color: C.blue }}>$16M–$26M</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopilotInsightBox() {
  return (
    <div className="rounded-xl border p-5 space-y-3"
      style={{ background: "linear-gradient(135deg, #0f62fe08 0%, #8a3ffc08 100%)", borderColor: `${C.purple}25` }}>
      <div className="flex items-center gap-2">
        <Cpu size={16} style={{ color: C.purple }} />
        <span className="text-sm font-bold">AI Capability Copilot Insights</span>
        <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: `${C.purple}15`, color: C.purple }}>Strategic Advisory</span>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {[
          {
            icon: AlertCircle,
            color: C.orange,
            label: "Capability Gap",
            text: "AI/ML skills are the most critical gap — current 41% AI-enablement must reach 78% by Month 12. Accelerate LLM and RAG certification tracks now.",
          },
          {
            icon: Shield,
            color: C.red,
            label: "Risk Area",
            text: "Layer 4 (Record Mastering) has the lowest current strength (41%). MDM and AI identity resolution uplift must begin no later than Month 2 to avoid downstream delays.",
          },
          {
            icon: Target,
            color: C.green,
            label: "Recommended Focus",
            text: "Prioritize AIOps + GenAI certifications for the Command Center team. This unlocks $2M+ cost avoidance and is the critical path to autonomous operations.",
          },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-background border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <item.icon size={14} style={{ color: item.color }} />
              <span className="text-xs font-bold" style={{ color: item.color }}>{item.label}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── PAGE ─────────────────────── */

export default function CapabilityUplift() {
  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/dashboard/ibm-ams" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors">
            <ArrowLeft size={13} /> IBM AIOps Value
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.purple }} />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">IBM Delivery Capability</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Capability Uplift & AI Readiness</h1>
          <p className="text-muted-foreground mt-1">How IBM capability evolution directly enables Horizon transformation outcomes</p>
        </div>
      </div>

      {/* Sections */}
      <ExecSummary />
      <MaturityProgression />
      <CapabilityTable />
      <SkillValueMapping />
      <AIDeepDive />
      <WorkforceTransformation />
      <BusinessValueImpact />
      <CopilotInsightBox />
    </div>
  );
}
