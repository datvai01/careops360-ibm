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
  { label: "Total Certified Resources", value: "382", sub: "Distinct employees with active certifications", icon: Award, color: C.blue, delta: "4,599 total certifications" },
  { label: "Planned Certifications", value: "450+", sub: "Target headcount, next 6–12 months", icon: Target, color: C.purple, delta: "Directional growth target" },
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

// Certified headcounts sourced from Certifications_list_13-Apr-2026 (Distinct Count of EmployeeId per category)
const CAPABILITY_TABLE: CapRow[] = [
  { area: "AI / ML & Data Science",          sub: "GenAI, ML Ops, AIOps, Data Science",       current: 307, planned: 390, priority: "Critical", impact: "Auto-remediation, predictive ops, AI Copilot" },
  { area: "IBM Products & Technologies",      sub: "IBM Platform, Tooling & Enablement",       current: 338, planned: 390, priority: "High",     impact: "Platform capability, delivery quality" },
  { area: "Industry-Specific (Healthcare)",   sub: "Healthcare, Compliance & Regulatory",      current: 342, planned: 380, priority: "High",     impact: "Audit-readiness, domain accuracy" },
  { area: "IBM Consulting & Professional",    sub: "Consulting Methods, Profession Certs",     current: 227, planned: 270, priority: "High",     impact: "Delivery methodology, advisory quality" },
  { area: "Agile & Project Management",       sub: "Agile, Scrum, SAFe, PMI",                 current: 176, planned: 210, priority: "Medium",   impact: "Delivery velocity, programme governance" },
  { area: "Cloud Platforms",                  sub: "AWS, Azure, OpenShift, Cloud Native",      current: 250, planned: 300, priority: "High",     impact: "Scale, resilience, cloud cost optimisation" },
  { area: "Automation & RPA",                 sub: "Automation, RPA, Self-Heal, AIOps",       current: 91,  planned: 135, priority: "Critical", impact: "Manual effort reduction across ops workflows" },
  { area: "Programming & Development",        sub: "Software Engineering & Development",       current: 79,  planned: 105, priority: "Medium",   impact: "Build velocity, code quality" },
  { area: "DevOps & Infrastructure",          sub: "CI/CD, GitOps, SRE, Observability",       current: 41,  planned: 68,  priority: "High",     impact: "Release cadence, MTTR reduction" },
  { area: "Big Data & Analytics",             sub: "Data Engineering, Streaming, Analytics",  current: 53,  planned: 85,  priority: "Critical", impact: "Real-time validation pipeline" },
  { area: "Integration & APIs",               sub: "REST, FHIR, EDI, Event-Driven Arch",      current: 33,  planned: 55,  priority: "High",     impact: "Partner onboarding, 1-day activation" },
  { area: "Security & Compliance",            sub: "HIPAA, Security, Compliance",             current: 26,  planned: 45,  priority: "High",     impact: "Risk reduction, regulatory adherence" },
  { area: "Database & Data Management",       sub: "MDM, Data Quality, Mastering, DB Admin",  current: 18,  planned: 35,  priority: "High",     impact: "Single source of truth, data integrity" },
  { area: "Red Hat Technologies",             sub: "Red Hat OpenShift & Portfolio",            current: 5,   planned: 18,  priority: "Medium",   impact: "Container platform, hybrid cloud" },
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
            IBM is evolving the Horizon delivery model from traditional operations to AI-augmented and autonomous operations.
            Certified AI and ML resources are expanding significantly, automation coverage is scaling across all enrollment workflows,
            and delivery staff are being redeployed from manual tasks to higher-value advisory and engineering roles —
            directly enabling measurable transformation outcomes across the Digital Front Door program.
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
      <WorkforceTransformation />
    </div>
  );
}
