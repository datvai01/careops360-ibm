import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";
import {
  ArrowLeft, ChevronDown, ChevronRight, Zap, Shield, GitMerge, Database,
  Activity, Bot, Layers, ArrowUpRight, CheckCircle2, TrendingUp, Clock,
  Users, BarChart2, RefreshCw, Network, Cpu, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  blue:   "#0f62fe",
  green:  "#24a148",
  amber:  "#f1a10d",
  red:    "#da1e28",
  purple: "#8a3ffc",
  teal:   "#009d9a",
  indigo: "#393afc",
  cyan:   "#1192e8",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────

const EXEC_KPIS = [
  { label: "Total Annual Value",          value: "$16M–$26M",    color: C.green,  icon: TrendingUp   },
  { label: "Value Begins",                value: "Week 3",       color: C.blue,   icon: Clock        },
  { label: "Auto-Remediation Rate",       value: "95%",          color: C.purple, icon: Bot          },
  { label: "Confidence Threshold",        value: "98%",          color: C.teal,   icon: Shield       },
  { label: "FTEs Redeployed",             value: "124",          color: C.cyan,   icon: Users        },
  { label: "Member Activation",           value: "4d → 1d",      color: C.green,  icon: CheckCircle2 },
  { label: "Error Detection",             value: "13.5h → 5min", color: C.amber,  icon: Activity     },
  { label: "Cost Avoidance",              value: "$2M+",         color: C.indigo, icon: BarChart2    },
];

const MILESTONES = [
  {
    label: "Week 3",
    sublabel: "Go-Live",
    color: C.green,
    desc: "Platform goes live. Auto-ingestion ramp begins. Labor savings start accruing from Day 1.",
    chips: ["Auto-ingestion ↑", "Labor savings begin", "Intake governed"],
  },
  {
    label: "Month 2",
    sublabel: "Mastering Uplift",
    color: C.blue,
    desc: "IDS mastering improvements take hold. Member activation hits the 1-day target for the first time.",
    chips: ["Activation: 4d → 1d", "Mastering failure: 5 min", "Error rate: ↓"],
  },
  {
    label: "Month 3",
    sublabel: "Retention Margin",
    color: C.purple,
    desc: "Retention margin begins accruing measurably. 53,300 members protected from late-enrollment churn.",
    chips: ["53.3K members protected", "$11.2M margin active", "Churn curve bends"],
  },
  {
    label: "Month 6",
    sublabel: "Steady State",
    color: C.teal,
    desc: "All 6 metrics reach target. Auto-remediation at 95%. CareNexus real-time API fully active.",
    chips: ["All 6 metrics ✓", "95% auto-remediation", "CareNexus live"],
  },
  {
    label: "Month 12",
    sublabel: "Full Run Rate",
    color: C.amber,
    desc: "Full $16M–$26M annual run rate confirmed. Continuous improvement loop driving ongoing gains.",
    chips: ["$16M–$26M confirmed", "99.9% delivery rate", "10× scalability"],
  },
];

const WAVES = [
  {
    id: "w1",
    label: "Wave 1",
    period: "Week 3 – Month 2",
    title: "Labor Optimization",
    value: "$9.7M",
    color: C.blue,
    gradient: `linear-gradient(135deg, ${C.blue}18 0%, ${C.cyan}12 100%)`,
    border: C.blue,
    metrics: ["124 FTEs redeployed", "Manual handling: 20% → 4%", "Auto-ingestion: 80% → 96%"],
    desc: "FTE redeployment begins immediately at go-live. Intake automation drives rapid headcount efficiency from Week 3.",
  },
  {
    id: "w2",
    label: "Wave 2",
    period: "Month 2 – Month 4",
    title: "Retention Margin",
    value: "$11.2M",
    color: C.purple,
    gradient: `linear-gradient(135deg, ${C.purple}18 0%, ${C.indigo}12 100%)`,
    border: C.purple,
    metrics: ["Activation: 4 days → 1 day", "53.3K members protected", "Churn curve bends M3"],
    desc: "Activation time hits the 1-day target. Member churn from late enrollment eliminated. Retention margin accrues.",
  },
  {
    id: "w3",
    label: "Wave 3",
    period: "Month 4 – Month 6",
    title: "Prior Auth Efficiency + Cost Avoidance",
    value: "$0.5M + $2M+",
    color: C.teal,
    gradient: `linear-gradient(135deg, ${C.teal}18 0%, ${C.green}12 100%)`,
    border: C.teal,
    metrics: ["CareNexus real-time API live", "$2M+ cost avoidance", "Steady-state ops achieved"],
    desc: "CareNexus integration activates prior auth efficiency gains. Cost avoidance from prevented rework exceeds $2M.",
  },
];

const VALUE_WATERFALL = [
  { name: "Retention Margin",  value: 11.2, color: C.purple },
  { name: "Labor Optimization",value: 9.7,  color: C.blue   },
  { name: "Cost Avoidance",    value: 2.0,  color: C.teal   },
  { name: "Prior Auth Eff.",   value: 0.5,  color: C.cyan   },
];

const LAYERS = [
  {
    num: 1,
    name: "Unified Enrollment Channels",
    tagline: "DFD consolidates all intake channels into a governed, auditable pipeline — format chaos eliminated at the point of submission",
    icon: GitMerge,
    color: C.blue,
    accentGrad: `linear-gradient(135deg, ${C.blue} 0%, ${C.cyan} 100%)`,
    what: [
      "Consolidates EDI 834, Excel, MFT Drop, and APIs into a single governed intake pipeline",
      "Enables trading partner management and onboarding through a consistent submission path",
      "Enforces format standards at the point of entry",
      "Provides real-time file acknowledgment",
      "Reduces partner onboarding from months to days",
    ],
    metrics: [
      { label: "Auto-Ingestion Rate",    before: "80%",       after: "96%"       },
      { label: "Format Standards",       before: "5+ formats", after: "1 governed" },
      { label: "Partner Onboarding",     before: "Months",    after: "Days/Hours" },
      { label: "Manual Handling",        before: "20%",       after: "~4%"       },
    ],
    impact: [
      "Predictable, scalable operations",
      "Audit-ready intake trail across 2.03M annual transactions",
      "Reduces downstream data quality issues",
      "Contributes to $9.7M labor optimization",
    ],
    systems: ["EDI 834", "Excel/XLSX", "MFT Drop", "REST API"],
  },
  {
    num: 2,
    name: "Pre-Validation & Early Coverage Validation",
    tagline: "Group activity, coverage, and compliance confirmed before mastering — invalid records exit immediately",
    icon: Shield,
    color: C.teal,
    accentGrad: `linear-gradient(135deg, ${C.teal} 0%, ${C.green} 100%)`,
    what: [
      "Confirms group activity status early in the pipeline",
      "Performs header/footer reconciliation, format, and date checks before canonical conversion",
      "Uses fast-fail logic to stop invalid records within minutes",
      "Applies cheapest checks first before expensive downstream processing",
    ],
    metrics: [
      { label: "Exception Rate",         before: "1.0%",       after: "0.25%"                },
      { label: "Invalid Record Detection",before: "Hours post", after: "Minutes"              },
      { label: "Pipeline Protection",    before: "Polluted",   after: "Invalid records exit" },
    ],
    impact: [
      "Prevents non-compliant records from polluting the master",
      "Reduces rework across Commercial, Medicaid, and Medicare",
      "Protects pipeline capacity for clean records",
      "Supports 124 FTE redeployment",
    ],
    systems: ["Group Registry", "Coverage Engine", "Compliance Rules", "Fast-Fail Logic"],
  },
  {
    num: 3,
    name: "Horizon 834 Canonical Standard + Real-Time Validation",
    tagline: "All eligible records converted to the universal format and validated against 6 tiers and 45 rules in real time",
    icon: CheckCircle2,
    color: C.green,
    accentGrad: `linear-gradient(135deg, ${C.green} 0%, ${C.teal} 100%)`,
    what: [
      "Converts X12 834, CSV, Excel, JSON, and XML into Horizon 834 canonical format",
      "Supports partner-agnostic onboarding",
      "Applies 6 validation tiers and 45 rules: HIPAA/X12 Structural, Implementation Guide, Trading Partner Rules, Data Integrity, Enrollment Lifecycle, Advanced Analytics",
    ],
    metrics: [
      { label: "Error Detection Time",   before: "13.5 hours", after: "5 minutes" },
      { label: "Enrollment Error Rate",  before: "4.1%",       after: "1.5%"     },
      { label: "Validation Coverage",    before: "Partial",    after: "6 tiers, 45 rules" },
      { label: "Format Consistency",     before: "5 inputs",   after: "1 canonical" },
    ],
    impact: [
      "~54,000 fewer annual transaction failures",
      "Timely enrollment compliance improves",
      "Trading partner onboarding becomes faster",
      "Clean records reach downstream systems",
    ],
    systems: ["X12 834", "CSV/Excel", "JSON", "XML", "Validation Engine"],
  },
  {
    num: 4,
    name: "Early Member Record Mastering",
    tagline: "Golden record created at the earliest possible point from clean, normalized, validated data",
    icon: Database,
    color: C.amber,
    accentGrad: `linear-gradient(135deg, ${C.amber} 0%, ${C.red}aa 100%)`,
    what: [
      "Performs identity mastering at intake — before downstream distribution",
      "Applies enrollment rules in correct sequence before master creation",
      "Handles duplicate detection and conflict resolution on clean data",
      "Creates the single source of truth for downstream distribution",
      "Validates PCP assignment, demographics, and effective date sequencing",
    ],
    metrics: [
      { label: "Mastering Failure Recovery", before: "28.5h + 24h delay", after: "~5 minutes" },
      { label: "Input Quality",              before: "Contaminated",       after: "Clean only" },
      { label: "Reconciliation Effort",      before: "High",               after: "Eliminated by design" },
    ],
    impact: [
      "One truth delivered everywhere — no divergence between systems",
      "Reduces stewardship and reconciliation effort",
      "Supports member maintenance operations",
      "Enables same-day enrollment confirmation",
    ],
    systems: ["Identity Resolution", "MPI", "PCP Validator", "Effective Date Engine"],
  },
  {
    num: 5,
    name: "Automated Syndication — Intelligent Last-Mile Distribution",
    tagline: "Streaming, priority-based distribution to all downstream systems with zero-data-loss governance",
    icon: Network,
    color: C.purple,
    accentGrad: `linear-gradient(135deg, ${C.purple} 0%, ${C.indigo} 100%)`,
    what: [
      "Routes records using P0 to P3 priority logic for time-sensitive cases",
      "Distributes to NMS, Members Edge, NASCX, API Cache, Analytics, Databricks, Vendor Feeds, CareNexus, and PriorityJob",
      "Uses automated retry, circuit breaker, dead letter queue, and at-least-once delivery guarantees",
    ],
    metrics: [
      { label: "Member Activation",       before: "4 days",    after: "1 day"    },
      { label: "Time to Publication",     before: "13.5 hours", after: "5 minutes" },
      { label: "Time to CareNexus",       before: "36.5 hours", after: "10 minutes" },
      { label: "Time to PriorityJob",     before: "39 hours",  after: "15 minutes" },
      { label: "Delivery Success Rate",   before: "85%",       after: "99.9%"    },
      { label: "SLA Compliance",          before: "75%",       after: "99%"      },
    ],
    impact: [
      "Newborns covered before hospital discharge",
      "Protects $11.2M retention contribution margin",
      "Supports timely enrollment compliance",
      "Ensures zero-data-loss style delivery governance",
    ],
    systems: ["NMS", "Members Edge", "NASCX", "CareNexus", "Analytics", "Databricks"],
  },
  {
    num: 6,
    name: "Command Center — Mission Control for Enrollment",
    tagline: "Real-time visibility, AI intelligence, and automated intervention across all upstream layers",
    icon: Cpu,
    color: C.red,
    accentGrad: `linear-gradient(135deg, ${C.red} 0%, ${C.amber} 100%)`,
    what: [
      "Provides real-time monitoring, SLA risk tracking, and operational health dashboards",
      "RAG-powered copilot for root cause analysis and pattern recognition",
      "AI-driven automation remediates failures automatically",
      "Supports rollback, approvals, and full audit trails",
    ],
    metrics: [
      { label: "Issue Diagnosis Time",   before: "13.5 hours", after: "5 minutes" },
      { label: "Auto-Remediation Rate",  before: "Manual",     after: "95%"      },
      { label: "Confidence Scoring",     before: "None",       after: "98%"      },
      { label: "Manual Work Reduction",  before: "Baseline",   after: "~70%"     },
      { label: "Cost Avoidance",         before: "$0",         after: "$2M+"     },
      { label: "Scalability",            before: "10× staff",  after: "10× volume, same staff" },
    ],
    impact: [
      "Shifts operations from reactive to proactive",
      "Provides full transparency across all pipeline layers",
      "Fixes most issues without human touch",
      "Gives operators instant AI-supported answers",
    ],
    systems: ["AI Copilot", "SLA Monitor", "Auto-Remediation", "Audit Trail"],
  },
];

const AI_FABRIC_CHIPS = [
  { label: "AI-Assisted Remediation",        metric: "95%" },
  { label: "Knowledge Base",                  metric: "Continuous" },
  { label: "Threshold Auto-Apply",             metric: "98% confidence" },
  { label: "HITL Reduction",                  metric: "~70%" },
  { label: "Explainable Decisions",           metric: "Full audit" },
  { label: "Real-Time Feedback Loops",        metric: "Continuous" },
  { label: "Quality Improvement",             metric: "Ongoing" },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function ExecKpiStrip() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {EXEC_KPIS.map(({ label, value, color, icon: Icon }) => (
        <div key={label} className="relative overflow-hidden rounded-xl border bg-card p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Icon size={13} style={{ color }} />
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          </div>
          <p className="text-lg font-extrabold tabular-nums leading-none" style={{ color }}>{value}</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: color }} />
        </div>
      ))}
    </div>
  );
}

function MilestoneTimeline() {
  return (
    <div className="relative">
      {/* Horizontal connector line */}
      <div className="absolute top-8 left-0 right-0 h-0.5 bg-border hidden lg:block" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {MILESTONES.map((m, i) => (
          <div key={m.label} className="relative flex flex-col items-start lg:items-center">
            {/* Node */}
            <div className="flex lg:flex-col items-center gap-3 lg:gap-2 w-full lg:w-auto">
              <div
                className="w-14 h-14 rounded-full flex flex-col items-center justify-center text-white flex-shrink-0 shadow-lg z-10"
                style={{ background: `linear-gradient(135deg, ${m.color} 0%, ${m.color}bb 100%)` }}
              >
                <span className="text-xs font-bold leading-none">{m.label.split(" ")[0]}</span>
                <span className="text-[10px] font-semibold opacity-90">{m.label.split(" ")[1]}</span>
              </div>
              <div className="lg:text-center">
                <p className="font-bold text-sm">{m.label}</p>
                <p className="text-xs font-semibold" style={{ color: m.color }}>{m.sublabel}</p>
              </div>
            </div>

            {/* Card */}
            <div className="mt-4 w-full rounded-xl border bg-card p-3 text-sm">
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{m.desc}</p>
              <div className="flex flex-wrap gap-1">
                {m.chips.map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-full text-xs font-medium border" style={{ borderColor: `${m.color}40`, background: `${m.color}10`, color: m.color }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ValueWaves() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {WAVES.map((w) => (
        <div key={w.id} className="rounded-2xl border overflow-hidden" style={{ borderColor: `${w.border}30` }}>
          {/* Header band */}
          <div className="px-5 py-4" style={{ background: w.gradient, borderBottom: `1px solid ${w.border}20` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: w.color }}>{w.label}</p>
                <p className="font-bold text-foreground text-base mt-0.5">{w.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{w.period}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold tabular-nums" style={{ color: w.color }}>{w.value}</p>
                <p className="text-xs text-muted-foreground">annual value</p>
              </div>
            </div>
          </div>
          {/* Body */}
          <div className="p-4 space-y-3 bg-card">
            <p className="text-xs text-muted-foreground">{w.desc}</p>
            <div className="space-y-1.5">
              {w.metrics.map(m => (
                <div key={m} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 size={12} style={{ color: w.color }} className="flex-shrink-0" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LayerCard({ layer, isExpanded, onToggle }: { layer: typeof LAYERS[0]; isExpanded: boolean; onToggle: () => void }) {
  const Icon = layer.icon;
  return (
    <div className={cn("rounded-2xl border overflow-hidden transition-all duration-300", isExpanded && "shadow-lg")}>
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left p-5 flex items-start gap-4 hover:bg-muted/30 transition-colors"
      >
        {/* Layer number badge */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow"
          style={{ background: layer.accentGrad }}
        >
          {layer.num}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Icon size={16} style={{ color: layer.color }} />
            <p className="font-bold text-base">{layer.name}</p>
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{layer.tagline}</p>

          {/* Quick metric chips — always visible */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {layer.metrics.slice(0, 3).map(m => (
              <span key={m.label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium"
                style={{ borderColor: `${layer.color}40`, background: `${layer.color}10`, color: layer.color }}>
                <span className="text-muted-foreground">{m.label}:</span>
                <span className="font-bold">{m.after}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 ml-2 text-muted-foreground">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t bg-muted/20">
          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* What it does */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">What It Does</p>
              <ul className="space-y-2">
                {layer.what.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" style={{ color: layer.color }} />
                    <span className="text-muted-foreground">{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Before/After metrics */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Before → After</p>
              <div className="space-y-2">
                {layer.metrics.map(m => (
                  <div key={m.label} className="rounded-lg border bg-card p-2.5">
                    <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-red-500 line-through tabular-nums">{m.before}</span>
                      <ArrowUpRight size={11} style={{ color: layer.color }} />
                      <span className="font-bold tabular-nums" style={{ color: layer.color }}>{m.after}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business impact + systems */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Business Impact</p>
                <ul className="space-y-1.5">
                  {layer.impact.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Star size={11} className="flex-shrink-0 mt-1" style={{ color: layer.color }} />
                      <span className="text-muted-foreground">{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Connected Systems</p>
                <div className="flex flex-wrap gap-1.5">
                  {layer.systems.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-md text-xs font-medium bg-muted border">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AiFabricBand() {
  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ background: `linear-gradient(135deg, #0f062a 0%, #0d1f52 50%, #001240 100%)`, borderColor: `${C.purple}30` }}
    >
      <div className="px-6 py-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.purple}30` }}>
            <Bot size={16} className="text-purple-400" />
          </div>
          <div>
            <p className="font-bold text-white text-base">Agentic Automation & Real-Time Orchestration</p>
            <p className="text-xs text-purple-300/80">Cross-cutting intelligence fabric — spans all six value layers</p>
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {AI_FABRIC_CHIPS.map(({ label, metric }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs"
              style={{ borderColor: `${C.purple}40`, background: `${C.purple}18` }}>
              <span className="text-purple-200/80">{label}</span>
              <span className="font-bold text-purple-300">·</span>
              <span className="font-bold text-purple-200">{metric}</span>
            </div>
          ))}
        </div>

        {/* Metric strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Auto-Remediation",   value: "95%",  color: C.purple },
            { label: "Confidence Score",    value: "98%",  color: C.teal   },
            { label: "FTEs Redeployed",     value: "124",  color: C.cyan   },
            { label: "Manual Work ↓",       value: "~70%", color: C.green  },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border p-3 text-center" style={{ borderColor: `${color}30`, background: `${color}15` }}>
              <p className="text-2xl font-extrabold tabular-nums" style={{ color }}>{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ValueWaterfall() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Annual Value by Category</CardTitle>
          <CardDescription>Quantified business value contribution — $M annual</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={VALUE_WATERFALL} margin={{ top: 10, right: 20, left: 0, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v}M`} />
              <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" width={130} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                formatter={(v: number) => [`$${v}M`, "Annual Value"]}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {VALUE_WATERFALL.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Value cards */}
      <div className="space-y-3">
        {[
          ...VALUE_WATERFALL.map(v => ({ ...v, suffix: "annual", highlight: false })),
          { name: "Total Quantified Annual Value", value: null as null, suffix: "$16M–$26M", color: C.green, highlight: true },
        ].map((v, i) => (
          <div key={i} className={cn(
            "flex items-center justify-between rounded-xl border p-4",
            v.highlight && "border-emerald-400/40 shadow-lg"
          )}
            style={v.highlight ? { background: `linear-gradient(135deg, ${C.green}18 0%, ${C.teal}10 100%)` } : {}}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: v.color }} />
              <p className={cn("font-semibold text-sm", v.highlight && "text-base font-bold")}>{v.name}</p>
            </div>
            <p className={cn("font-extrabold tabular-nums", v.highlight ? "text-2xl text-emerald-600" : "text-lg")}
              style={{ color: v.highlight ? C.green : v.color }}>
              {v.value !== null ? `$${v.value}M` : v.suffix}
            </p>
          </div>
        ))}
        <p className="text-xs text-muted-foreground text-center pt-1">
          All values are annual run-rate projections based on Horizon BCBS operational baselines and DFD transformation modeling.
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold tracking-tight">{label}</h2>
      {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function DigitalFrontDoorRoadmap() {
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null);

  const toggle = (n: number) => setExpandedLayer(prev => (prev === n ? null : n));

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-24">

      {/* ── Back nav ── */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/enrollment-intelligence">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2">
            <ArrowLeft size={14} />
            Enrollment Intelligence Hub
          </Button>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">Digital Front Door Roadmap</span>
      </div>

      {/* ── Page header ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: C.green }} />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transformation Roadmap</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Digital Front Door Roadmap</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl text-base leading-relaxed">
          Six sequential value layers transforming enrollment operations from fragmented intake to intelligent,
          real-time command and control — with measurable outcomes from Week 3.
        </p>
      </div>

      {/* ── IBM Vision Note ── */}
      <div className="flex items-start gap-4 rounded-xl border px-5 py-4" style={{ borderColor: "#0f62fe30", background: "linear-gradient(135deg, #0f62fe08 0%, #0f62fe04 100%)" }}>
        <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#0f62fe15" }}>
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="4" fill="#0f62fe" />
            <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial">i</text>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#0f62fe" }}>IBM Vision — Subject to Collaborative Refinement with Horizon</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-4xl">
            This roadmap represents IBM's proposed vision and strategic direction for the Digital Front Door transformation programme.
            All timelines, sequencing, value targets, and capability layers will be validated, adjusted, and finalised in partnership
            with Horizon BCBS leadership and subject matter experts during the programme discovery and planning phase.
            This is a starting point for a shared conversation — not a unilateral commitment.
          </p>
        </div>
      </div>

      {/* ── 1. Executive Value Summary ── */}
      <section>
        <SectionTitle label="Executive Value Summary" sub="Quantified outcomes across the 12-month transformation horizon" />
        <ExecKpiStrip />
      </section>

      {/* ── 2. Timeline ── */}
      <section>
        <SectionTitle
          label="Value Realization Timeline"
          sub="Key milestones and operational triggers across a 12-month horizon"
        />
        <MilestoneTimeline />
      </section>

      {/* ── 4. Six Layers ── */}
      <section>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Six Sequential Value Layers</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Each layer is a distinct operational capability. Layers are sequentially dependent — earlier layers enable later ones.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setExpandedLayer(null)}>Collapse All</Button>
            <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setExpandedLayer(-1)}>Expand All</Button>
          </div>
        </div>

        {/* Connecting line left */}
        <div className="relative space-y-3">
          <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-border hidden lg:block" />
          {LAYERS.map(layer => (
            <LayerCard
              key={layer.num}
              layer={layer}
              isExpanded={expandedLayer === layer.num || expandedLayer === -1}
              onToggle={() => toggle(layer.num)}
            />
          ))}
        </div>
      </section>

      {/* ── 5. AI Fabric ── */}
      <section>
        <SectionTitle
          label="Cross-Cutting Intelligence Fabric"
          sub="Agentic automation and real-time orchestration span all six layers — not a separate capability"
        />
        <AiFabricBand />
      </section>

      {/* ── 6. Value Waterfall ── */}
      <section>
        <SectionTitle
          label="Annual Value Waterfall"
          sub="Quantified business value by category — full annual run-rate at Month 12"
        />
        <ValueWaterfall />
      </section>

      {/* ── Footer CTA ── */}
      <section className="rounded-2xl border p-8 text-center" style={{ background: `linear-gradient(135deg, ${C.blue}08 0%, ${C.purple}06 100%)` }}>
        <p className="text-lg font-bold mb-2">Ready to explore the platform in detail?</p>
        <p className="text-sm text-muted-foreground mb-5 max-w-xl mx-auto">
          Return to the Enrollment Intelligence Hub to see live pipeline operations, AI remediation, and compliance tracking in action.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/dashboard/enrollment-intelligence">
            <Button className="gap-2" style={{ background: C.blue }}>
              <Activity size={15} />
              Open Enrollment Intelligence Hub
            </Button>
          </Link>
          <Link href="/dashboard/digital-roadmap">
            <Button variant="outline" className="gap-2">
              <RefreshCw size={15} />
              View Transformation Roadmap
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
