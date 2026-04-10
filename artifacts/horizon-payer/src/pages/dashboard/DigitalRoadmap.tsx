import { useState, useMemo } from "react";
import {
  useGetRoadmapInitiatives,
  useGetRoadmapSummary,
  useGetRoadmapAlerts,
  type RoadmapInitiative,
  type RoadmapAlert,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  X,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Bell,
  Target,
  Layers,
  TrendingUp,
  Zap,
  BarChart2,
  Circle,
} from "lucide-react";

// ─── Types & Constants ────────────────────────────────────────────────────────

type SectionKey = "upgrade" | "transformation" | "ticket";
type YearFilter = 0 | 1 | 2 | 3;

const SECTIONS: { key: SectionKey; label: string; shortLabel: string; initiativeType: string; color: string; accent: string; icon: React.ReactNode; desc: string }[] = [
  {
    key: "upgrade",
    label: "Technical Debt Removal",
    shortLabel: "Tech Debt",
    initiativeType: "Upgrade",
    color: "text-blue-700 dark:text-blue-400",
    accent: "border-blue-500 bg-blue-50 dark:bg-blue-950/40",
    icon: <Layers className="h-4 w-4" />,
    desc: "Legacy upgrades, platform modernization, infrastructure refresh, security & compliance upgrades",
  },
  {
    key: "transformation",
    label: "Transformative Roadmap",
    shortLabel: "Strategic",
    initiativeType: "Transformation",
    color: "text-purple-700 dark:text-purple-400",
    accent: "border-purple-500 bg-purple-50 dark:bg-purple-950/40",
    icon: <TrendingUp className="h-4 w-4" />,
    desc: "AI-driven operations, intelligent automation, GenAI, platform modernization, CareOps360",
  },
  {
    key: "ticket",
    label: "Ticket Reduction Plan",
    shortLabel: "Ticket Reduction",
    initiativeType: "Ticket Reduction",
    color: "text-emerald-700 dark:text-emerald-400",
    accent: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
    icon: <Zap className="h-4 w-4" />,
    desc: "Incident reduction, automation of repetitive work, shift-left strategies, self-service enablement",
  },
];

const DOMAINS = [
  "Payer",
  "Provider",
  "Clinical",
  "Digital",
  "Data & Analytics",
  "Enterprise Platforms",
] as const;

const DOMAIN_STYLE: Record<string, { bg: string; border: string; badge: string; dot: string; header: string }> = {
  Payer: {
    bg: "bg-blue-50/60 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    badge: "text-blue-700 bg-blue-100 border-blue-300 dark:text-blue-300 dark:bg-blue-900/60 dark:border-blue-700",
    dot: "bg-blue-500",
    header: "text-blue-700 dark:text-blue-400",
  },
  Provider: {
    bg: "bg-violet-50/60 dark:bg-violet-950/20",
    border: "border-violet-200 dark:border-violet-800",
    badge: "text-violet-700 bg-violet-100 border-violet-300 dark:text-violet-300 dark:bg-violet-900/60 dark:border-violet-700",
    dot: "bg-violet-500",
    header: "text-violet-700 dark:text-violet-400",
  },
  Clinical: {
    bg: "bg-emerald-50/60 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-800",
    badge: "text-emerald-700 bg-emerald-100 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-900/60 dark:border-emerald-700",
    dot: "bg-emerald-500",
    header: "text-emerald-700 dark:text-emerald-400",
  },
  Digital: {
    bg: "bg-cyan-50/60 dark:bg-cyan-950/20",
    border: "border-cyan-200 dark:border-cyan-800",
    badge: "text-cyan-700 bg-cyan-100 border-cyan-300 dark:text-cyan-300 dark:bg-cyan-900/60 dark:border-cyan-700",
    dot: "bg-cyan-500",
    header: "text-cyan-700 dark:text-cyan-400",
  },
  "Data & Analytics": {
    bg: "bg-amber-50/60 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    badge: "text-amber-700 bg-amber-100 border-amber-300 dark:text-amber-300 dark:bg-amber-900/60 dark:border-amber-700",
    dot: "bg-amber-500",
    header: "text-amber-700 dark:text-amber-400",
  },
  "Enterprise Platforms": {
    bg: "bg-slate-50/60 dark:bg-slate-800/20",
    border: "border-slate-200 dark:border-slate-700",
    badge: "text-slate-700 bg-slate-100 border-slate-300 dark:text-slate-300 dark:bg-slate-800/60 dark:border-slate-600",
    dot: "bg-slate-500",
    header: "text-slate-700 dark:text-slate-400",
  },
};

const COMPLEXITY_STYLE: Record<string, string> = {
  Low: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800",
  Med: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-800",
  High: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800",
};

const STATUS_STYLE: Record<string, string> = {
  Active: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800",
  Planned: "text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700",
  Completed: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800",
  "At Risk": "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800",
};

const PRIORITY_STYLE: Record<string, string> = {
  High: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800",
  Medium: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-800",
  Low: "text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700",
};

const YEAR_LABELS: Record<number, { label: string; theme: string; desc: string }> = {
  1: { label: "Year 1 · 2026", theme: "Quick Wins & Foundation", desc: "High-impact, in-flight programs and immediate cost reduction" },
  2: { label: "Year 2 · 2027", theme: "Scale & Integration", desc: "Platform scaling, cross-domain integration, AI/automation expansion" },
  3: { label: "Year 3 · 2028", theme: "Transform & Optimize", desc: "Legacy elimination, fully AI-driven operations, enterprise-wide optimization" },
};

const YEAR_OUTCOMES: Record<SectionKey, Record<number, string[]>> = {
  upgrade: {
    1: ["25+ legacy platform versions eliminated", "PCI DSS 4.0 compliance achieved", "Angular 17 standardization across entire portfolio", "EOL server and runtime risk eliminated"],
    2: ["Zero unsupported runtime dependencies", "Cloud-native foundation fully established", "Security posture hardened across all application tiers"],
    3: ["Full technology stack modernization complete", "100% supported, maintained technology estate"],
  },
  transformation: {
    1: ["CareOps360 Command Center live for executive leadership", "Key payment and eligibility processes automated", "Cloud migration programs initiated across letter & document generation", "Provider audit cycle reduced 30→10 days"],
    2: ["API-first integration hub deployed — real-time partner exchange", "Analytics consolidated to single Power BI platform", "Business rules fully self-configurable by business users", "Smartcomm cloud document delivery at scale"],
    3: ["AI-driven prior auth at 85% auto-approval rate", "GenAI member engagement platform live — NPS +12", "Legacy application footprint eliminated across all domains"],
  },
  ticket: {
    1: ["1,500+ monthly tickets eliminated or meaningfully reduced", "Self-service capabilities live for billing, enrollment, and broker teams", "AIOps event correlation reducing alert noise by 40%+", "Tier-1 resolution rate improved 20%+"],
    2: ["Full shift-left program operational across all domains", "Predictive monitoring preventing issues before member impact", "Knowledge base achieving 80% first-call resolution"],
    3: ["AI-driven ticket prevention achieving near-zero reactive work", "Self-healing systems live across all critical workflows"],
  },
};

// ─── IBM Consulting Advantage Assets ─────────────────────────────────────────

type IbmAsset = { name: string; tag: string; tagColor: string; value: string; isBob?: boolean };

const IBM_BOB: IbmAsset = {
  name: "IBM BOB — Business Operations Blueprint",
  tag: "Core Asset",
  tagColor: "bg-[#0f62fe] text-white",
  value: "Pre-configured payer operations template suite covering member enrollment, claims adjudication, prior authorization, provider network management, and contact center routing. Delivers reference architectures, integration patterns, and governance playbooks tuned to Blue Cross Blue Shield operating models — accelerating delivery by 30–40% by eliminating design-phase rework.",
  isBob: true,
};

const ASSETS_BY_TYPE: Record<string, IbmAsset[]> = {
  Upgrade: [
    IBM_BOB,
    { name: "IBM Application Modernization Accelerator", tag: "Modernization", tagColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", value: "Automated application discovery, dependency mapping, and migration-wave planning. Reduces assessment effort by up to 60% through AI-assisted portfolio analysis and risk scoring across Java, .NET, and COBOL estates." },
    { name: "IBM DevSecOps Accelerator", tag: "Delivery", tagColor: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200", value: "Pre-built CI/CD pipeline templates with integrated SAST/DAST security scanning, compliance gates, and automated release orchestration. Cuts pipeline build time from weeks to days and enforces HIPAA/SOC 2 controls at every gate." },
    { name: "IBM ADDI — Application Discovery & Delivery Intelligence", tag: "Analysis", tagColor: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200", value: "AI-powered static code analysis platform providing complexity scoring, hidden dependency detection, and upgrade impact assessment across enterprise codebases. Generates refactoring roadmaps with effort and risk estimates per module." },
  ],
  "Ticket Reduction": [
    IBM_BOB,
    { name: "IBM Intelligent IT Operations (AIOps)", tag: "AIOps", tagColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200", value: "Event correlation and anomaly detection across hybrid infrastructure using topology-aware AI. Reduces alert noise by up to 70%, auto-routes incidents to the correct resolver group, and generates predicted resolution timelines based on historical patterns." },
    { name: "IBM Knowledge Accelerator", tag: "Self-Service", tagColor: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200", value: "Automated capture and semantic indexing of ticket resolution patterns, turning institutional knowledge into a searchable runbook library. Powers first-call-resolution improvements and enables self-service deflection across member, provider, and internal IT channels." },
    { name: "IBM Observability Accelerator", tag: "Monitoring", tagColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200", value: "Unified telemetry collection, correlation, and pre-built dashboard templates spanning application, infrastructure, and business KPIs. Establishes full-stack observability in days rather than months, enabling proactive detection before members are impacted." },
  ],
  Transformation: [
    IBM_BOB,
    { name: "IBM Garage Method", tag: "Methodology", tagColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", value: "Co-creation framework combining enterprise design thinking, agile delivery, and DevOps culture change. Used to rapidly prototype, validate, and scale transformation initiatives — minimizing risk through iterative MVPs and continuous stakeholder alignment." },
    { name: "IBM Business Automation Workflow", tag: "Automation", tagColor: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", value: "Low-code process orchestration platform for automating complex, human-in-the-loop payer workflows including claims exceptions, prior auth escalations, and provider credentialing. Reduces manual handling time by up to 80% on targeted workflows." },
    { name: "IBM Process Mining", tag: "Optimization", tagColor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200", value: "Data-driven process discovery using actual event logs from core systems (FACETS, HealthEdge, etc.) to surface bottlenecks, rework loops, and automation opportunities. Provides an evidence base for transformation prioritization and projected ROI." },
    { name: "IBM Consulting Advantage AI Accelerators", tag: "AI / Analytics", tagColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200", value: "Curated library of domain-specific AI use cases, implementation patterns, and reusable model assets for healthcare payer operations — covering prior auth prediction, claim denial prevention, member churn risk scoring, and contact center intent classification." },
  ],
};

// ─── Helper Components ────────────────────────────────────────────────────────

function SmallBadge({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap", className)}>
      {label}
    </span>
  );
}

function IbmConsultingSection({ initiativeType }: { initiativeType: string }) {
  const assets = ASSETS_BY_TYPE[initiativeType] ?? ASSETS_BY_TYPE["Upgrade"];
  return (
    <div className="rounded-lg border border-[#0f62fe]/20 bg-[#0f62fe]/[0.03] dark:bg-[#0f62fe]/[0.06] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#0f62fe]/15 bg-[#0f62fe]/[0.06] dark:bg-[#0f62fe]/[0.10]">
        <svg width="14" height="14" viewBox="0 0 32 32" fill="none" className="flex-shrink-0">
          <rect width="32" height="32" rx="4" fill="#0f62fe" />
          <text x="50%" y="71%" textAnchor="middle" fill="white" fontSize="17" fontWeight="900" fontFamily="Helvetica,Arial,sans-serif">IBM</text>
        </svg>
        <span className="text-xs font-semibold text-[#0f62fe] dark:text-blue-400 uppercase tracking-wide">IBM Consulting Advantage</span>
        <span className="text-[10px] text-muted-foreground/60 ml-auto">Assets &amp; Accelerators</span>
      </div>
      <div className="divide-y divide-[#0f62fe]/10">
        {assets.map(asset => (
          <div key={asset.name} className={cn("px-4 py-3", asset.isBob && "bg-[#0f62fe]/[0.04] dark:bg-[#0f62fe]/[0.08]")}>
            <div className="flex items-start gap-2 mb-1.5">
              <p className={cn("text-xs font-semibold leading-snug", asset.isBob ? "text-[#0f62fe] dark:text-blue-400" : "text-foreground")}>{asset.name}</p>
              <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ml-auto", asset.tagColor)}>{asset.tag}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{asset.value}</p>
          </div>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-[#0f62fe]/15 bg-[#0f62fe]/[0.03]">
        <p className="text-[10px] text-muted-foreground/50 italic">For informational purposes only. Asset applicability subject to engagement scope and client environment assessment.</p>
      </div>
    </div>
  );
}

function DetailPanel({ initiative, onClose }: { initiative: RoadmapInitiative; onClose: () => void }) {
  const domStyle = DOMAIN_STYLE[initiative.domain ?? ""] ?? DOMAIN_STYLE["Enterprise Platforms"];
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
      <div className="relative w-full max-w-lg bg-background border-l border-border shadow-2xl flex flex-col h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-border sticky top-0 bg-background z-10">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">{initiative.workNumber}</span>
              {initiative.domain && (
                <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border", domStyle.badge)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", domStyle.dot)} />
                  {initiative.domain}
                </span>
              )}
            </div>
            <h2 className="text-base font-semibold leading-snug">{initiative.application}</h2>
            <p className="text-sm text-muted-foreground">{initiative.product} · {initiative.portfolio}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors ml-4 flex-shrink-0"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-5 flex-1">
          <div className="flex gap-2 flex-wrap">
            <SmallBadge label={initiative.status} className={STATUS_STYLE[initiative.status] ?? ""} />
            <SmallBadge label={`Priority: ${initiative.priority}`} className={PRIORITY_STYLE[initiative.priority] ?? ""} />
            {initiative.complexity && <SmallBadge label={`Complexity: ${initiative.complexity}`} className={COMPLEXITY_STYLE[initiative.complexity] ?? ""} />}
            {initiative.planYear && <SmallBadge label={`Year ${initiative.planYear} · ${initiative.planQuarter ?? ""}`} className="text-slate-700 bg-slate-100 border-slate-300 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600" />}
            {initiative.daysOverdue != null && initiative.daysOverdue > 0 && <SmallBadge label={`Overdue ${initiative.daysOverdue}d`} className="text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800" />}
            {initiative.daysUntilEnd != null && initiative.daysUntilEnd <= 30 && initiative.daysUntilEnd > 0 && <SmallBadge label={`Ends in ${initiative.daysUntilEnd}d`} className="text-amber-700 bg-amber-50 border-amber-200" />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Description</p>
            <p className="text-sm leading-relaxed">{initiative.description}</p>
          </div>
          {initiative.businessImpact && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Business Impact</p>
              <p className="text-sm text-blue-900 dark:text-blue-200">{initiative.businessImpact}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Expected Outcome</p>
            <p className="text-sm leading-relaxed">{initiative.expectedOutcome}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {([
              ["Technology", initiative.technology],
              ["Service Category", initiative.serviceCategory],
              ["Current Version", initiative.currentVersion || "—"],
              ["Upgrade Version", initiative.upgradeVersion || "—"],
              ["Start Date", initiative.startDate],
              ["End Date", initiative.endDate],
              ["Dependency", initiative.dependency || "None"],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-muted-foreground mb-0.5">{k}</p>
                <p className="font-medium">{v}</p>
              </div>
            ))}
          </div>
          {initiative.notes && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-amber-900 dark:text-amber-200">{initiative.notes}</p>
            </div>
          )}
          <IbmConsultingSection initiativeType={initiative.initiativeType} />
        </div>
      </div>
    </div>
  );
}

function AlertsPanel({ alerts, onDismiss }: { alerts: RoadmapAlert[]; onDismiss: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  if (alerts.length === 0) return null;
  const critical = alerts.filter(a => a.severity === "critical").length;
  const high = alerts.filter(a => a.severity === "high").length;
  const sorted = [...alerts].sort((a, b) => {
    const o: Record<string, number> = { critical: 0, high: 1, medium: 2 };
    return (o[a.severity] ?? 3) - (o[b.severity] ?? 3);
  });
  return (
    <Card className={cn("overflow-hidden", critical > 0 ? "border-red-200 dark:border-red-800" : "border-amber-200 dark:border-amber-800")}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors text-left">
        <Bell className={cn("h-3.5 w-3.5 flex-shrink-0", critical > 0 ? "text-red-500" : "text-amber-500")} />
        <span className="text-xs font-semibold">{alerts.length} Risk &amp; Delay Alert{alerts.length !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-2 ml-1">
          {critical > 0 && <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />{critical} critical</span>}
          {high > 0 && <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 dark:text-orange-400"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />{high} high</span>}
        </div>
        <span className="text-xs text-muted-foreground ml-auto mr-1">{open ? "Collapse" : "Expand"}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-1.5 px-3 w-20">Sev</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-1.5 px-3 w-24">Work #</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-1.5 px-3">Details</th>
                <th className="w-8 py-1.5 px-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((alert, i) => (
                <tr key={alert.id} className={cn("border-b border-border/50 hover:bg-muted/30", i % 2 !== 0 && "bg-muted/10")}>
                  <td className="py-1.5 px-3">
                    <span className={cn("inline-flex items-center gap-1 font-medium capitalize text-xs",
                      alert.severity === "critical" ? "text-red-700 dark:text-red-400" :
                        alert.severity === "high" ? "text-orange-700 dark:text-orange-400" : "text-amber-700 dark:text-amber-400")}>
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0",
                        alert.severity === "critical" ? "bg-red-500" : alert.severity === "high" ? "bg-orange-500" : "bg-amber-400")} />
                      {alert.severity}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 font-mono text-muted-foreground whitespace-nowrap">{alert.workNumber ?? "—"}</td>
                  <td className="py-1.5 px-3 text-muted-foreground max-w-sm truncate" title={alert.message}>{alert.message}</td>
                  <td className="py-1.5 px-3">
                    <button onClick={() => onDismiss(alert.id)} className="opacity-40 hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"><X className="h-3 w-3" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ─── Heatmap (Impact × Complexity) ───────────────────────────────────────────

function ImpactMap({ initiatives }: { initiatives: RoadmapInitiative[] }) {
  const complexityNum = (c?: string) => c === "Low" ? 1 : c === "Med" ? 2 : 3;
  const impactNum = (p: string) => p === "High" ? 3 : p === "Medium" ? 2 : 1;

  const cells: { cx: number; ci: number; items: RoadmapInitiative[] }[] = [];
  for (let ci = 1; ci <= 3; ci++) {
    for (let imp = 1; imp <= 3; imp++) {
      cells.push({
        cx: ci,
        ci: imp,
        items: initiatives.filter(i => complexityNum(i.complexity) === ci && impactNum(i.priority) === imp),
      });
    }
  }

  const complexityLabel = ["Low", "Med", "High"];
  const impactLabel = ["Low Impact", "Med Impact", "High Impact"];
  const quadrantStyle = (ci: number, imp: number): string => {
    if (imp === 3 && ci === 1) return "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800";
    if (imp === 3 && ci === 2) return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800";
    if (imp === 3 && ci === 3) return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800";
    if (imp === 1 && ci === 3) return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800";
    return "bg-muted/30 border-border";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Impact vs Effort Matrix</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Quick Wins</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Strategic Bets</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Avoid / Defer</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: 540 }}>
          <div className="flex gap-1 mb-1 ml-20">
            {complexityLabel.map(l => (
              <div key={l} className="flex-1 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-1">{l} Complexity</div>
            ))}
          </div>
          <div className="space-y-1">
            {[3, 2, 1].map(imp => (
              <div key={imp} className="flex gap-1 items-stretch">
                <div className="w-20 flex items-center justify-end pr-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right flex-shrink-0">{impactLabel[imp - 1]}</div>
                {[1, 2, 3].map(ci => {
                  const cell = cells.find(c => c.cx === ci && c.ci === imp);
                  return (
                    <div key={ci} className={cn("flex-1 min-h-[80px] rounded border p-2 text-xs space-y-1", quadrantStyle(ci, imp))}>
                      {cell?.items.map(item => (
                        <div key={item.id} className="flex items-center gap-1">
                          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", DOMAIN_STYLE[item.domain ?? ""]?.dot ?? "bg-slate-400")} />
                          <span className="truncate text-[10px] font-medium leading-tight">{item.workNumber}</span>
                        </div>
                      )) ?? null}
                      {(!cell || cell.items.length === 0) && <span className="text-muted-foreground/40 text-[10px]">—</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex justify-between ml-20 mt-1">
            <span className="text-[10px] text-muted-foreground">Low effort →</span>
            <span className="text-[10px] text-muted-foreground">High effort</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {DOMAINS.map(d => (
          <span key={d} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className={cn("w-2 h-2 rounded-full flex-shrink-0", DOMAIN_STYLE[d]?.dot)} />{d}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Domain Group ─────────────────────────────────────────────────────────────

function DomainGroup({
  domain,
  initiatives,
  onSelect,
  defaultOpen = true,
}: {
  domain: string;
  initiatives: RoadmapInitiative[];
  onSelect: (i: RoadmapInitiative) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const style = DOMAIN_STYLE[domain] ?? DOMAIN_STYLE["Enterprise Platforms"];
  const counts = {
    active: initiatives.filter(i => i.status === "Active").length,
    completed: initiatives.filter(i => i.status === "Completed").length,
    atRisk: initiatives.filter(i => i.status === "At Risk").length,
  };

  return (
    <div className={cn("rounded-lg border overflow-hidden", style.border)}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn("w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/30", style.bg)}
      >
        <span className={cn("w-2 h-2 rounded-full flex-shrink-0", style.dot)} />
        <span className={cn("text-sm font-semibold", style.header)}>{domain}</span>
        <span className="text-xs text-muted-foreground ml-1">{initiatives.length} initiative{initiatives.length !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-2 ml-auto">
          {counts.atRisk > 0 && <span className="text-[11px] font-medium text-red-600 dark:text-red-400">{counts.atRisk} at risk</span>}
          {counts.active > 0 && <span className="text-[11px] text-muted-foreground">{counts.active} active</span>}
          {counts.completed > 0 && <span className="text-[11px] text-muted-foreground">{counts.completed} done</span>}
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: 820 }}>
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3 w-24">Work #</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3">Initiative</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3 w-14">Year</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3 w-12">Q</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3 w-20">Complexity</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3">Business Impact</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3 w-20">Depends On</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3 w-24">Status</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3 w-20">Priority</th>
              </tr>
            </thead>
            <tbody>
              {initiatives.map((init, i) => (
                <tr
                  key={init.id}
                  onClick={() => onSelect(init)}
                  className={cn(
                    "border-b border-border/50 cursor-pointer hover:bg-muted/40 transition-colors",
                    i % 2 !== 0 && "bg-muted/10",
                    init.status === "At Risk" && "bg-red-50/40 dark:bg-red-950/10 hover:bg-red-50/60 dark:hover:bg-red-950/20",
                    init.status === "Completed" && "opacity-70"
                  )}
                >
                  <td className="py-2 px-3 font-mono text-muted-foreground whitespace-nowrap">{init.workNumber}</td>
                  <td className="py-2 px-3">
                    <p className="font-medium leading-snug text-foreground max-w-xs truncate" title={init.application}>{init.application}</p>
                    <p className="text-muted-foreground text-[11px] truncate max-w-xs">{init.description.slice(0, 80)}{init.description.length > 80 ? "…" : ""}</p>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {init.planYear ? (
                      <span className="text-muted-foreground font-medium">Y{init.planYear}</span>
                    ) : "—"}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap text-muted-foreground">{init.planQuarter ?? "—"}</td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {init.complexity ? <SmallBadge label={init.complexity} className={COMPLEXITY_STYLE[init.complexity] ?? ""} /> : "—"}
                  </td>
                  <td className="py-2 px-3 text-muted-foreground max-w-[200px] truncate" title={init.businessImpact}>{init.businessImpact || "—"}</td>
                  <td className="py-2 px-3 font-mono text-muted-foreground whitespace-nowrap text-[11px]">{init.dependency || "—"}</td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <SmallBadge label={init.status} className={STATUS_STYLE[init.status] ?? ""} />
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <SmallBadge label={init.priority} className={PRIORITY_STYLE[init.priority] ?? ""} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Year Outcomes Strip ──────────────────────────────────────────────────────

function YearOutcomes({ sectionKey, year }: { sectionKey: SectionKey; year: YearFilter }) {
  if (year === 0) return null;
  const outcomes = YEAR_OUTCOMES[sectionKey][year] ?? [];
  const yearInfo = YEAR_LABELS[year];
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Year {year} Business Outcomes — {yearInfo.theme}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
        {outcomes.map(o => (
          <div key={o} className="flex items-start gap-2 text-xs text-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>{o}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section View ─────────────────────────────────────────────────────────────

function SectionView({
  initiatives,
  sectionKey,
  initiativeType,
  onSelect,
}: {
  initiatives: RoadmapInitiative[];
  sectionKey: SectionKey;
  initiativeType: string;
  onSelect: (i: RoadmapInitiative) => void;
}) {
  const [yearFilter, setYearFilter] = useState<YearFilter>(0);
  const [domainFilter, setDomainFilter] = useState("All");
  const [view, setView] = useState<"table" | "heatmap">("table");

  const sectionItems = useMemo(
    () => initiatives.filter(i => i.initiativeType === initiativeType),
    [initiatives, initiativeType]
  );

  const yearFiltered = useMemo(
    () => yearFilter === 0 ? sectionItems : sectionItems.filter(i => (i.planYear ?? 1) === yearFilter),
    [sectionItems, yearFilter]
  );

  const filtered = useMemo(
    () => domainFilter === "All" ? yearFiltered : yearFiltered.filter(i => i.domain === domainFilter),
    [yearFiltered, domainFilter]
  );

  const presentDomains = useMemo(
    () => DOMAINS.filter(d => filtered.some(i => i.domain === d)),
    [filtered]
  );

  const yearCounts = useMemo(() => ({
    1: sectionItems.filter(i => (i.planYear ?? 1) === 1).length,
    2: sectionItems.filter(i => (i.planYear ?? 1) === 2).length,
    3: sectionItems.filter(i => (i.planYear ?? 1) === 3).length,
  }), [sectionItems]);

  const domainOptions = ["All", ...DOMAINS.filter(d => sectionItems.some(i => i.domain === d))];

  return (
    <div className="space-y-4">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: sectionItems.length, icon: <Layers className="h-4 w-4" />, color: "text-foreground" },
          { label: "Active / In-Flight", value: sectionItems.filter(i => i.status === "Active").length, icon: <Activity className="h-4 w-4" />, color: "text-blue-600 dark:text-blue-400" },
          { label: "Completed", value: sectionItems.filter(i => i.status === "Completed").length, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "At Risk", value: sectionItems.filter(i => i.status === "At Risk").length, icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-600 dark:text-red-400" },
        ].map(kpi => (
          <Card key={kpi.label} className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-muted-foreground", kpi.color)}>{kpi.icon}</span>
            </div>
            <p className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </Card>
        ))}
      </div>

      {/* Year Tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {([0, 1, 2, 3] as YearFilter[]).map(y => (
          <button
            key={y}
            onClick={() => setYearFilter(y)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
              yearFilter === y
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
            )}
          >
            {y === 0 ? `All Years (${sectionItems.length})` : `${YEAR_LABELS[y].label} (${yearCounts[y]})`}
          </button>
        ))}
      </div>

      {/* Year outcomes */}
      <YearOutcomes sectionKey={sectionKey} year={yearFilter} />

      {/* Domain filter + view toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {domainOptions.map(d => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-colors",
                domainFilter === d
                  ? d === "All"
                    ? "bg-foreground text-background border-foreground"
                    : cn(DOMAIN_STYLE[d]?.badge, "border-current")
                  : "bg-background text-muted-foreground border-border hover:border-foreground/30"
              )}
            >
              {d !== "All" && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", DOMAIN_STYLE[d]?.dot)} />}
              {d}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 border border-border rounded-md overflow-hidden">
          <button
            onClick={() => setView("table")}
            className={cn("px-3 py-1.5 text-xs font-medium transition-colors", view === "table" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
          >
            Table
          </button>
          <button
            onClick={() => setView("heatmap")}
            className={cn("px-3 py-1.5 text-xs font-medium transition-colors", view === "heatmap" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
          >
            Impact Map
          </button>
        </div>
      </div>

      {/* View content */}
      {view === "heatmap" ? (
        <Card className="p-4">
          <ImpactMap initiatives={filtered} />
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-sm">No initiatives match the current filters.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {presentDomains.map((domain, idx) => (
            <DomainGroup
              key={domain}
              domain={domain}
              initiatives={filtered.filter(i => i.domain === domain)}
              onSelect={onSelect}
              defaultOpen={idx < 3}
            />
          ))}
          {filtered.filter(i => !i.domain || !DOMAINS.includes(i.domain as typeof DOMAINS[number])).length > 0 && (
            <DomainGroup
              domain="Enterprise Platforms"
              initiatives={filtered.filter(i => !i.domain || !DOMAINS.includes(i.domain as typeof DOMAINS[number]))}
              onSelect={onSelect}
              defaultOpen={false}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DigitalRoadmap() {
  const [activeSection, setActiveSection] = useState<SectionKey>("upgrade");
  const [selectedInitiative, setSelectedInitiative] = useState<RoadmapInitiative | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());

  const { data: initiatives = [], isLoading } = useGetRoadmapInitiatives({});
  const { data: summary } = useGetRoadmapSummary();
  const { data: alertsRaw = [] } = useGetRoadmapAlerts();

  const alerts = useMemo(
    () => alertsRaw.filter(a => !dismissedAlerts.has(a.id)),
    [alertsRaw, dismissedAlerts]
  );

  const currentSection = SECTIONS.find(s => s.key === activeSection)!;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading roadmap…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transformation Roadmap</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            3-year IBM &amp; Horizon BCBS strategic initiative portfolio — organized by type, domain, and delivery phase
          </p>
        </div>
        {summary && (
          <div className="flex items-center gap-4 flex-shrink-0 text-sm">
            <div className="text-center">
              <p className="text-xl font-bold">{summary.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{summary.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{summary.completed}</p>
              <p className="text-xs text-muted-foreground">Done</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{summary.atRisk}</p>
              <p className="text-xs text-muted-foreground">At Risk</p>
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      <AlertsPanel alerts={alerts} onDismiss={id => setDismissedAlerts(s => new Set([...s, id]))} />

      {/* Section tabs */}
      <div className="flex flex-col sm:flex-row gap-2">
        {SECTIONS.map(sec => (
          <button
            key={sec.key}
            onClick={() => setActiveSection(sec.key)}
            className={cn(
              "flex-1 flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all",
              activeSection === sec.key
                ? cn("shadow-sm", sec.accent, "border-current")
                : "border-border bg-background hover:bg-muted/30"
            )}
          >
            <span className={cn("mt-0.5 flex-shrink-0", activeSection === sec.key ? sec.color : "text-muted-foreground")}>
              {sec.icon}
            </span>
            <div className="min-w-0">
              <p className={cn("text-sm font-semibold leading-snug", activeSection === sec.key ? sec.color : "text-foreground")}>
                {sec.label}
              </p>
              <p className="text-xs text-muted-foreground leading-snug mt-0.5 hidden sm:block line-clamp-2">{sec.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Active section content */}
      <SectionView
        key={activeSection}
        initiatives={initiatives}
        sectionKey={activeSection}
        initiativeType={currentSection.initiativeType}
        onSelect={setSelectedInitiative}
      />

      {/* Detail panel */}
      {selectedInitiative && (
        <DetailPanel initiative={selectedInitiative} onClose={() => setSelectedInitiative(null)} />
      )}
    </div>
  );
}
