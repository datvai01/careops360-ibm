import React, { useState, useMemo, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  useGetRoadmapInitiatives,
  useGetRoadmapSummary,
  useGetRoadmapAlerts,
  useGetRoadmapGovernanceCombined,
  useGetRoadmapRequirements,
  useGetRoadmapRisks,
  useCreateRoadmapInitiative,
  useUpdateRoadmapInitiative,
  type RoadmapInitiative,
  type RoadmapAlert,
  type CreateRoadmapInitiativeRequest,
  type GovernanceCombinedInitiative,
  type HorizonRequirement,
  type TransformationRisk,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LastRefresh } from "@/components/admin/LastRefresh";
import { HelpHint } from "@/components/admin/HelpHint";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
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
  Wrench,
  Layers,
  TrendingUp,
  Zap,
  BarChart2,
  Circle,
  Pencil,
  Plus,
  Download,
  FileSpreadsheet,
  FileText,
  CalendarDays,
  ClipboardList,
  ShieldAlert,
  Star,
} from "lucide-react";

// ─── Export Utilities ─────────────────────────────────────────────────────────

const EXPORT_COLUMNS: { key: keyof RoadmapInitiative; label: string }[] = [
  { key: "jiraId", label: "Jira ID" },
  { key: "initiativeType", label: "Type" },
  { key: "domain", label: "Domain" },
  { key: "portfolio", label: "Portfolio" },
  { key: "product", label: "Product" },
  { key: "application", label: "Application" },
  { key: "serviceCategory", label: "Service Category" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "complexity", label: "Complexity" },
  { key: "technology", label: "Technology" },
  { key: "currentVersion", label: "Current Version" },
  { key: "upgradeVersion", label: "Target Version" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "planYear", label: "Plan Year" },
  { key: "planQuarter", label: "Quarter" },
  { key: "description", label: "Description" },
  { key: "expectedOutcome", label: "Expected Outcome" },
  { key: "businessImpact", label: "Business Impact" },
  { key: "dependency", label: "Dependencies" },
  { key: "tShirtSize", label: "T-Shirt Size" },
  { key: "tShirtRationale", label: "T-Shirt Rationale" },
  { key: "roiPlan", label: "How Horizon Gets the ROI" },
  { key: "notes", label: "Notes" },
];

function exportToCSV(data: RoadmapInitiative[], filename: string) {
  const headers = EXPORT_COLUMNS.map(c => `"${c.label}"`).join(",");
  const rows = data.map(row =>
    EXPORT_COLUMNS.map(c => {
      const val = row[c.key] ?? "";
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(",")
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToXLSX(data: RoadmapInitiative[], filename: string) {
  const rows = data.map(row =>
    Object.fromEntries(
      EXPORT_COLUMNS.map(c => [c.label, row[c.key] ?? ""])
    )
  );
  const ws = XLSX.utils.json_to_sheet(rows, { header: EXPORT_COLUMNS.map(c => c.label) });

  // Auto-width columns
  const colWidths = EXPORT_COLUMNS.map(c => ({
    wch: Math.max(c.label.length, 18),
  }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Initiatives");

  // Summary sheet
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byDomain: Record<string, number> = {};
  data.forEach(d => {
    byType[d.initiativeType] = (byType[d.initiativeType] || 0) + 1;
    byStatus[d.status] = (byStatus[d.status] || 0) + 1;
    byDomain[d.domain || "—"] = (byDomain[d.domain || "—"] || 0) + 1;
  });
  const summaryRows = [
    { Category: "By Type", Value: "", Count: "" },
    ...Object.entries(byType).map(([k, v]) => ({ Category: "", Value: k, Count: v })),
    { Category: "", Value: "", Count: "" },
    { Category: "By Status", Value: "", Count: "" },
    ...Object.entries(byStatus).map(([k, v]) => ({ Category: "", Value: k, Count: v })),
    { Category: "", Value: "", Count: "" },
    { Category: "By Domain", Value: "", Count: "" },
    ...Object.entries(byDomain).map(([k, v]) => ({ Category: "", Value: k, Count: v })),
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 20 }, { wch: 30 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  XLSX.writeFile(wb, filename);
}

// ─── Types & Constants ────────────────────────────────────────────────────────

type SectionKey = "upgrade" | "transformation" | "ticket";
type YearFilter = 0 | 1 | 2 | 3;

type SectionTier = "STRATEGIC" | "TACTICAL";

const SECTIONS: { key: SectionKey; label: string; shortLabel: string; initiativeType: string; color: string; accent: string; icon: React.ReactNode; desc: string; tier: SectionTier; tierBadge: string }[] = [
  {
    key: "transformation",
    label: "Transformation Roadmap",
    shortLabel: "Strategic",
    initiativeType: "Transformation",
    color: "text-purple-700 dark:text-purple-400",
    accent: "border-purple-500 bg-purple-50 dark:bg-purple-950/40",
    icon: <Target className="h-4 w-4" />,
    desc: "AI-driven operations, intelligent automation, GenAI, platform modernization, CareOps360",
    tier: "STRATEGIC",
    tierBadge: "border-purple-300 bg-purple-100 text-purple-800 dark:border-purple-700 dark:bg-purple-900/60 dark:text-purple-200",
  },
  {
    key: "upgrade",
    label: "Technical Remediation",
    shortLabel: "Tech Remediation",
    initiativeType: "Upgrade",
    color: "text-blue-700 dark:text-blue-400",
    accent: "border-blue-500 bg-blue-50 dark:bg-blue-950/40",
    icon: <Wrench className="h-4 w-4" />,
    desc: "Legacy upgrades, platform modernization, infrastructure refresh, security & compliance upgrades",
    tier: "TACTICAL",
    tierBadge: "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-900/60 dark:text-blue-200",
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
    tier: "TACTICAL",
    tierBadge: "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200",
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

// ─── Timeline constants ────────────────────────────────────────────────────────

const DOMAIN_HEX: Record<string, string> = {
  Payer: "#3b82f6",
  Provider: "#8b5cf6",
  Clinical: "#10b981",
  Digital: "#06b6d4",
  "Data & Analytics": "#f59e0b",
  "Enterprise Platforms": "#64748b",
};

const TL_START = new Date("2026-01-01").getTime();
const TL_END = new Date("2029-01-01").getTime();
const TL_MS = TL_END - TL_START;
const TL_TODAY_PCT = Math.min(100, Math.max(0, ((Date.now() - TL_START) / TL_MS) * 100));

const TL_QUARTERS: { label: string; pct: number; yearStart?: boolean }[] = [0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
  const yr = 2026 + Math.floor(i / 4);
  const mo = (i % 4) * 3;
  const date = new Date(yr, mo, 1);
  return { label: `Q${(i % 4) + 1}`, pct: ((date.getTime() - TL_START) / TL_MS) * 100, yearStart: i % 4 === 0 };
});

function tlBarStyle(startDate: string, endDate: string): { left: string; width: string } {
  const s = Math.max(new Date(startDate).getTime(), TL_START);
  const e = Math.min(new Date(endDate + "T23:59:59").getTime(), TL_END);
  if (s >= TL_END || e <= TL_START) return { left: "0%", width: "0.5%" };
  const left = ((s - TL_START) / TL_MS) * 100;
  const width = Math.max(((e - s) / TL_MS) * 100, 0.8);
  return { left: `${left.toFixed(2)}%`, width: `${width.toFixed(2)}%` };
}

// ─── Timeline View ────────────────────────────────────────────────────────────

function TimelineView({ initiatives, onSelect, onEdit }: { initiatives: RoadmapInitiative[]; onSelect: (i: RoadmapInitiative) => void; onEdit: (i: RoadmapInitiative) => void; }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const grouped = useMemo(() => {
    const groups = DOMAINS
      .map(d => ({ domain: d, items: initiatives.filter(i => i.domain === d).sort((a, b) => a.startDate.localeCompare(b.startDate)) }))
      .filter(g => g.items.length > 0);
    const loose = initiatives.filter(i => !i.domain || !(DOMAINS as readonly string[]).includes(i.domain));
    if (loose.length > 0) groups.push({ domain: "Enterprise Platforms", items: loose });
    return groups;
  }, [initiatives]);

  if (grouped.length === 0) {
    return <Card className="p-8 text-center"><p className="text-sm text-muted-foreground">No initiatives match the current filters.</p></Card>;
  }

  const YEAR_BANDS = [
    { label: "Year 1 · 2026", sub: "Quick Wins & Foundation" },
    { label: "Year 2 · 2027", sub: "Scale & Integration" },
    { label: "Year 3 · 2028", sub: "Transform & Optimize" },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: 900 }}>
          {/* Year band headers */}
          <div className="flex border-b border-border bg-background sticky top-0 z-10">
            <div className="w-52 flex-shrink-0 border-r border-border bg-background" />
            {YEAR_BANDS.map((yb, yi) => (
              <div key={yb.label} className={cn("flex-1 text-center py-2 border-r border-border last:border-r-0", yi % 2 === 1 && "bg-muted/10")}>
                <p className="text-xs font-semibold text-foreground leading-tight">{yb.label}</p>
                <p className="text-[10px] text-muted-foreground">{yb.sub}</p>
              </div>
            ))}
          </div>
          {/* Quarter sub-headers */}
          <div className="flex border-b border-border bg-muted/20">
            <div className="w-52 flex-shrink-0 border-r border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Initiative</div>
            <div className="flex-1 relative">
              <div className="flex h-full">
                {TL_QUARTERS.map((q, i) => (
                  <div
                    key={i}
                    className={cn("flex-1 text-center text-[10px] font-medium text-muted-foreground py-1.5 border-r border-border/50 last:border-r-0",
                      q.yearStart && "border-l-2 border-border")}
                  >
                    {q.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Domain groups + initiative rows */}
          {grouped.map(({ domain, items }) => {
            const domStyle = DOMAIN_STYLE[domain] ?? DOMAIN_STYLE["Enterprise Platforms"];
            const hex = DOMAIN_HEX[domain] ?? "#64748b";
            return (
              <div key={domain}>
                {/* Domain header */}
                <div className={cn("flex items-center border-b border-border/50 sticky", domStyle.bg)}>
                  <div className={cn("w-52 flex-shrink-0 border-r border-border px-3 py-1.5 flex items-center gap-1.5")}>
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0", domStyle.dot)} />
                    <span className={cn("text-xs font-semibold", domStyle.header)}>{domain}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">({items.length})</span>
                  </div>
                  <div className="flex-1 relative h-6">
                    {TL_QUARTERS.map((q, i) => (
                      <div key={i} className={cn("absolute top-0 bottom-0 border-l border-border/30", q.yearStart && "border-l-2 border-border/50")} style={{ left: `${q.pct}%` }} />
                    ))}
                    {/* Year dividers as background bands */}
                    {[0, 1, 2].map(yi => (
                      <div key={yi} className={cn("absolute top-0 bottom-0", yi % 2 === 1 && "bg-muted/10")} style={{ left: `${(yi / 3) * 100}%`, width: `${100 / 3}%` }} />
                    ))}
                  </div>
                </div>
                {/* Initiative rows */}
                {items.map((init, rowIdx) => {
                  const bar = tlBarStyle(init.startDate, init.endDate);
                  const isHovered = hoveredId === init.id;
                  const isAtRisk = init.status === "At Risk";
                  const isCompleted = init.status === "Completed";
                  return (
                    <div
                      key={init.id}
                      onClick={() => onSelect(init)}
                      onMouseEnter={() => setHoveredId(init.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={cn(
                        "flex items-center border-b border-border/20 cursor-pointer group transition-colors",
                        rowIdx % 2 === 0 ? "bg-background" : "bg-muted/5",
                        isHovered && "bg-muted/30"
                      )}
                    >
                      {/* Label column */}
                      <div className="w-52 flex-shrink-0 border-r border-border px-3 py-1.5 group-hover:bg-muted/20 transition-colors">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-medium truncate leading-tight flex-1">{init.application}</p>
                          <button
                            onClick={e => { e.stopPropagation(); onEdit(init); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex-shrink-0"
                            title="Edit initiative"
                          >
                            <Pencil className="h-2.5 w-2.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] font-mono text-muted-foreground">{init.jiraId}</span>
                          <SmallBadge label={init.status} className={cn(STATUS_STYLE[init.status] ?? "", "text-[9px] py-0 px-1")} />
                        </div>
                      </div>
                      {/* Bar area */}
                      <div className="flex-1 relative h-9">
                        {/* Year alternating bands */}
                        {[0, 1, 2].map(yi => (
                          <div key={yi} className={cn("absolute top-0 bottom-0", yi % 2 === 1 && "bg-muted/5")} style={{ left: `${(yi / 3) * 100}%`, width: `${100 / 3}%` }} />
                        ))}
                        {/* Quarter gridlines */}
                        {TL_QUARTERS.map((q, i) => (
                          <div key={i} className={cn("absolute top-0 bottom-0 border-l pointer-events-none", q.yearStart ? "border-border/40" : "border-border/20")} style={{ left: `${q.pct}%` }} />
                        ))}
                        {/* Today marker */}
                        <div className="absolute top-0 bottom-0 w-px bg-red-400/70 pointer-events-none z-10" style={{ left: `${TL_TODAY_PCT}%` }}>
                          <div className="absolute -top-0 left-0.5 text-[8px] text-red-500 font-medium whitespace-nowrap">Today</div>
                        </div>
                        {/* Gantt bar */}
                        <div
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 h-5 rounded flex items-center px-1.5 overflow-hidden transition-opacity duration-150",
                            isCompleted && "opacity-40",
                            isAtRisk && "ring-1 ring-red-400 ring-offset-0"
                          )}
                          style={{
                            left: bar.left,
                            width: bar.width,
                            backgroundColor: hex + (isHovered ? "ff" : "cc"),
                          }}
                        >
                          <span className="text-white text-[9px] font-medium truncate whitespace-nowrap drop-shadow-sm">{init.jiraId}</span>
                        </div>
                        {/* Hover tooltip */}
                        {isHovered && (
                          <div className="absolute z-40 pointer-events-none" style={{ left: bar.left, bottom: "calc(100% + 4px)" }}>
                            <div className="bg-popover border border-border rounded-lg shadow-2xl p-3 w-72">
                              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                <span className="font-mono text-[10px] text-muted-foreground">{init.jiraId}</span>
                                <SmallBadge label={init.status} className={STATUS_STYLE[init.status] ?? ""} />
                                {init.complexity && <SmallBadge label={`${init.complexity} complexity`} className={COMPLEXITY_STYLE[init.complexity] ?? ""} />}
                              </div>
                              <p className="text-xs font-semibold mb-1 leading-snug">{init.application}</p>
                              {init.businessImpact && (
                                <p className="text-[11px] text-blue-700 dark:text-blue-400 mb-1.5 leading-snug">{init.businessImpact.slice(0, 100)}{(init.businessImpact?.length ?? 0) > 100 ? "…" : ""}</p>
                              )}
                              <p className="text-[11px] text-muted-foreground leading-snug">{init.description.slice(0, 90)}…</p>
                              <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground border-t border-border/50 pt-1.5">
                                <span>{init.startDate}</span>
                                <span>→</span>
                                <span>{init.endDate}</span>
                                <span className="ml-auto font-medium">Y{init.planYear} · {init.planQuarter}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {/* Footer legend */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-muted/10 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className="w-px h-3 bg-red-400/70" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {DOMAINS.map(d => (
                <span key={d} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="w-3.5 h-2 rounded" style={{ backgroundColor: DOMAIN_HEX[d] + "cc" }} />
                  {d}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 ml-auto text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3.5 h-2 rounded opacity-40" style={{ backgroundColor: "#64748bcc" }} />Completed</span>
              <span className="flex items-center gap-1"><span className="w-3.5 h-2 rounded ring-1 ring-red-400" style={{ backgroundColor: "#64748bcc" }} />At Risk</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Transition Plan helpers ──────────────────────────────────────────────────

type TPMilestone = { label: string; date: string; pct: number; kind: "kickoff" | "mid" | "golive" | "custom" };
type TPDecisionPoint = { label: string; pct: number };

const MILESTONE_NOTE_RE = /^[ \t]*Milestone:\s*(.+?)\s*@\s*(\d{4}-\d{2}-\d{2})\s*$/gim;
const JIRA_REF_RE = /\b[A-Z][A-Z0-9]+-\d+\b/g;

// Status → bar fill hex (matches STATUS_STYLE semantics: blue/emerald/red/slate)
const STATUS_HEX: Record<string, string> = {
  Active: "#3b82f6",
  Completed: "#10b981",
  "At Risk": "#ef4444",
  Planned: "#94a3b8",
};

function statusBarHex(status: string): string {
  return STATUS_HEX[status] ?? "#64748b";
}

// Build a planning horizon that respects the year filter.
function buildHorizon(yearFilter: 0 | 1 | 2 | 3) {
  const startYear = yearFilter === 0 ? 2026 : 2025 + yearFilter;
  const endYear = yearFilter === 0 ? 2029 : 2026 + yearFilter; // exclusive
  const start = new Date(`${startYear}-01-01`).getTime();
  const end = new Date(`${endYear}-01-01`).getTime();
  const ms = end - start;
  const years = endYear - startYear;
  const quarters: { label: string; pct: number; yearStart: boolean }[] = [];
  for (let i = 0; i < years * 4; i++) {
    const yr = startYear + Math.floor(i / 4);
    const mo = (i % 4) * 3;
    const t = new Date(yr, mo, 1).getTime();
    quarters.push({
      label: `Q${(i % 4) + 1}`,
      pct: ((t - start) / ms) * 100,
      yearStart: i % 4 === 0,
    });
  }
  const todayPct = Math.min(100, Math.max(0, ((Date.now() - start) / ms) * 100));
  return { start, end, ms, startYear, years, quarters, todayPct };
}

type Horizon = ReturnType<typeof buildHorizon>;

function barStyleFor(startDate: string, endDate: string, h: Horizon): { left: string; width: string; visible: boolean } {
  const s = Math.max(new Date(startDate).getTime(), h.start);
  const e = Math.min(new Date(endDate + "T23:59:59").getTime(), h.end);
  if (s >= h.end || e <= h.start) return { left: "0%", width: "0%", visible: false };
  const left = ((s - h.start) / h.ms) * 100;
  const width = Math.max(((e - s) / h.ms) * 100, 0.8);
  return { left: `${left.toFixed(2)}%`, width: `${width.toFixed(2)}%`, visible: true };
}

function dateToPctIn(d: string, h: Horizon): number {
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return -1;
  return ((t - h.start) / h.ms) * 100;
}

function deriveTransitionPlan(init: RoadmapInitiative, h: Horizon): {
  owner: string;
  milestones: TPMilestone[];
  decisionPoints: TPDecisionPoint[];
} {
  const owner = (init.serviceCategory && init.serviceCategory.trim()) || init.portfolio || "—";

  const start = new Date(init.startDate).getTime();
  const end = new Date(init.endDate + "T23:59:59").getTime();

  const milestones: TPMilestone[] = [];
  const kickoffPct = dateToPctIn(init.startDate, h);
  if (kickoffPct >= 0 && kickoffPct <= 100) milestones.push({ label: "Kickoff", date: init.startDate, pct: kickoffPct, kind: "kickoff" });
  if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
    const mid = new Date(start + (end - start) / 2);
    if (!Number.isNaN(mid.getTime())) {
      const midISO = mid.toISOString().slice(0, 10);
      const midPct = dateToPctIn(midISO, h);
      if (midPct >= 0 && midPct <= 100) milestones.push({ label: "Mid-Point", date: midISO, pct: midPct, kind: "mid" });
    }
  }
  const golivePct = dateToPctIn(init.endDate, h);
  if (golivePct >= 0 && golivePct <= 100) milestones.push({ label: "Go-Live", date: init.endDate, pct: golivePct, kind: "golive" });

  if (init.notes) {
    MILESTONE_NOTE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = MILESTONE_NOTE_RE.exec(init.notes)) !== null) {
      const pct = dateToPctIn(m[2], h);
      if (pct >= 0 && pct <= 100) {
        milestones.push({ label: m[1].trim(), date: m[2], pct, kind: "custom" });
      }
    }
  }

  const decisionPoints: TPDecisionPoint[] = [];
  const statusLc = (init.status ?? "").toLowerCase();
  const kpc = dateToPctIn(init.startDate, h);
  const kpClamped = Math.max(0, Math.min(100, kpc));
  if (statusLc.includes("decision") || statusLc.includes("approval")) {
    decisionPoints.push({ label: init.status, pct: kpClamped });
  }
  if ((init.priority as string) === "Critical") {
    decisionPoints.push({ label: "Critical priority — exec sign-off", pct: kpClamped });
  }

  return { owner, milestones, decisionPoints };
}

function resolveDependencyEdges(
  initiatives: RoadmapInitiative[],
): { fromId: number; toId: number; kind: "hard" | "soft" }[] {
  const byJira = new Map<string, RoadmapInitiative>();
  for (const i of initiatives) if (i.jiraId) byJira.set(i.jiraId.toUpperCase(), i);

  const edges: { fromId: number; toId: number; kind: "hard" | "soft" }[] = [];
  const seenEdges = new Set<string>();
  const pushEdge = (fromId: number, toId: number, kind: "hard" | "soft") => {
    const k = `${fromId}->${toId}`;
    if (seenEdges.has(k)) return;
    seenEdges.add(k);
    edges.push({ fromId, toId, kind });
  };
  for (const target of initiatives) {
    const dep = (target.dependency ?? "").trim();
    if (!dep) continue;

    const matchedIds = new Set<number>();
    const jiraMatches = dep.match(JIRA_REF_RE) ?? [];
    for (const j of jiraMatches) {
      const src = byJira.get(j.toUpperCase());
      if (src && src.id !== target.id) {
        pushEdge(src.id, target.id, "hard");
        matchedIds.add(src.id);
      }
    }

    if (matchedIds.size === 0) {
      const depLc = dep.toLowerCase();
      for (const src of initiatives) {
        if (src.id === target.id) continue;
        const pName = (src.product ?? "").trim().toLowerCase();
        const aName = (src.application ?? "").trim().toLowerCase();
        if ((pName && pName.length >= 4 && depLc.includes(pName)) ||
            (aName && aName.length >= 4 && depLc.includes(aName))) {
          pushEdge(src.id, target.id, "soft");
          matchedIds.add(src.id);
          if (matchedIds.size >= 2) break;
        }
      }
    }
  }
  return edges;
}

// ─── Transition Plan View ─────────────────────────────────────────────────────

const TP_ROW_H = 40;
const TP_DOMAIN_H = 30;
const TP_PORTFOLIO_H = 24;
const TP_LABEL_W = 248;

type TPGroup = {
  domain: string;
  portfolios: { portfolio: string; items: RoadmapInitiative[] }[];
};

function TransitionPlanView({
  initiatives,
  yearFilter,
  onEdit,
}: {
  initiatives: RoadmapInitiative[];
  yearFilter: 0 | 1 | 2 | 3;
  onEdit: (i: RoadmapInitiative) => void;
}) {
  const horizon = useMemo(() => buildHorizon(yearFilter), [yearFilter]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Domain (collapsible) → Portfolio (sub-grouping) → Initiatives
  const grouped: TPGroup[] = useMemo(() => {
    const baseOrder = [...DOMAINS, "Enterprise Platforms", "Unassigned"];
    const domainOrder = Array.from(new Set(baseOrder));
    const byDomain = new Map<string, RoadmapInitiative[]>();
    for (const i of initiatives) {
      const d = (i.domain && (DOMAINS as readonly string[]).includes(i.domain)) ? i.domain : "Enterprise Platforms";
      if (!byDomain.has(d)) byDomain.set(d, []);
      byDomain.get(d)!.push(i);
    }
    const out: TPGroup[] = [];
    for (const dom of domainOrder) {
      const items = byDomain.get(dom);
      if (!items || items.length === 0) continue;
      const byPort = new Map<string, RoadmapInitiative[]>();
      for (const it of items) {
        const p = it.portfolio || "Unassigned";
        if (!byPort.has(p)) byPort.set(p, []);
        byPort.get(p)!.push(it);
      }
      const portfolios = Array.from(byPort.entries())
        .map(([portfolio, list]) => ({
          portfolio,
          items: list.slice().sort((a, b) => a.startDate.localeCompare(b.startDate)),
        }))
        .sort((a, b) => a.portfolio.localeCompare(b.portfolio));
      out.push({ domain: dom, portfolios });
    }
    return out;
  }, [initiatives]);

  // Vertical layout: domain header → (per portfolio: portfolio header + rows)
  const layout = useMemo(() => {
    const initY = new Map<number, number>();
    const domainY = new Map<string, number>();
    let y = 0;
    for (const g of grouped) {
      domainY.set(g.domain, y + TP_DOMAIN_H / 2);
      y += TP_DOMAIN_H;
      if (collapsed.has(g.domain)) continue;
      for (const p of g.portfolios) {
        y += TP_PORTFOLIO_H;
        for (const it of p.items) {
          initY.set(it.id, y + TP_ROW_H / 2);
          y += TP_ROW_H;
        }
      }
    }
    return { initY, domainY, totalH: Math.max(y, 60) };
  }, [grouped, collapsed]);

  const edges = useMemo(() => resolveDependencyEdges(initiatives), [initiatives]);

  const derived = useMemo(() => {
    const m = new Map<number, ReturnType<typeof deriveTransitionPlan>>();
    for (const i of initiatives) m.set(i.id, deriveTransitionPlan(i, horizon));
    return m;
  }, [initiatives, horizon]);

  if (initiatives.length === 0) {
    return <Card className="p-8 text-center"><p className="text-sm text-muted-foreground">No initiatives match the current filters.</p></Card>;
  }

  type Arrow = { x1: number; y1: number; x2: number; y2: number; kind: "hard" | "soft" };
  const arrows: Arrow[] = [];
  for (const e of edges) {
    const src = initiatives.find(i => i.id === e.fromId);
    const tgt = initiatives.find(i => i.id === e.toId);
    if (!src || !tgt) continue;
    const srcDom = (src.domain && (DOMAINS as readonly string[]).includes(src.domain)) ? src.domain : "Enterprise Platforms";
    const tgtDom = (tgt.domain && (DOMAINS as readonly string[]).includes(tgt.domain)) ? tgt.domain : "Enterprise Platforms";
    const srcY = layout.initY.get(src.id) ?? layout.domainY.get(srcDom);
    const tgtY = layout.initY.get(tgt.id) ?? layout.domainY.get(tgtDom);
    if (srcY == null || tgtY == null) continue;
    const srcBar = barStyleFor(src.startDate, src.endDate, horizon);
    const tgtBar = barStyleFor(tgt.startDate, tgt.endDate, horizon);
    if (!srcBar.visible || !tgtBar.visible) continue;
    const x1 = parseFloat(srcBar.left) + parseFloat(srcBar.width);
    const x2 = parseFloat(tgtBar.left);
    arrows.push({ x1, y1: srcY, x2, y2: tgtY, kind: e.kind });
  }

  return (
    <Card className="overflow-hidden">
      {/* Legend (top-right) */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border bg-muted/10 flex-wrap">
        <p className="text-xs font-semibold text-foreground">Transition Plan — milestones, owners, decision gates & dependencies</p>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap ml-auto">
          <span className="font-semibold text-foreground/80">Status:</span>
          <span className="flex items-center gap-1"><span className="w-3.5 h-2 rounded" style={{ backgroundColor: STATUS_HEX.Active }} />Active</span>
          <span className="flex items-center gap-1"><span className="w-3.5 h-2 rounded" style={{ backgroundColor: STATUS_HEX.Completed }} />Completed</span>
          <span className="flex items-center gap-1"><span className="w-3.5 h-2 rounded" style={{ backgroundColor: STATUS_HEX["At Risk"] }} />At Risk</span>
          <span className="flex items-center gap-1"><span className="w-3.5 h-2 rounded" style={{ backgroundColor: STATUS_HEX.Planned }} />Planned</span>
          <span className="flex items-center gap-1 pl-2 border-l border-border"><span className="w-2 h-2 rounded-full bg-white border border-foreground" />Milestone</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rotate-45 bg-amber-500" />Decision gate</span>
          <span className="flex items-center gap-1 pl-2 border-l border-border"><svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke="#475569" strokeWidth="1.5" /></svg>Hard dep</span>
          <span className="flex items-center gap-1"><svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,2" /></svg>Soft dep</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 900 }}>
          {/* Year band headers (dynamic, based on horizon) */}
          <div className="flex border-b border-border bg-background sticky top-0 z-10">
            <div className="flex-shrink-0 border-r border-border bg-background" style={{ width: TP_LABEL_W }} />
            {Array.from({ length: horizon.years }, (_, yi) => (
              <div key={yi} className={cn("flex-1 text-center py-2 border-r border-border last:border-r-0", yi % 2 === 1 && "bg-muted/10")}>
                <p className="text-xs font-semibold text-foreground leading-tight">Year {horizon.startYear - 2025 + yi} · {horizon.startYear + yi}</p>
              </div>
            ))}
          </div>
          {/* Quarter sub-headers */}
          <div className="flex border-b border-border bg-muted/20">
            <div className="flex-shrink-0 border-r border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground" style={{ width: TP_LABEL_W }}>Initiative · Owner</div>
            <div className="flex-1 relative">
              <div className="flex h-full">
                {horizon.quarters.map((q, i) => (
                  <div
                    key={i}
                    className={cn("flex-1 text-center text-[10px] font-medium text-muted-foreground py-1.5 border-r border-border/50 last:border-r-0",
                      q.yearStart && "border-l-2 border-border")}
                  >
                    {q.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Body: label column + bars+SVG */}
          <div className="flex relative">
            {/* Label column */}
            <div className="flex-shrink-0 border-r border-border" style={{ width: TP_LABEL_W }}>
              {grouped.map(g => {
                const isCollapsed = collapsed.has(g.domain);
                const domStyle = DOMAIN_STYLE[g.domain] ?? DOMAIN_STYLE["Enterprise Platforms"];
                const total = g.portfolios.reduce((a, b) => a + b.items.length, 0);
                return (
                  <div key={g.domain}>
                    {/* Domain header (collapsible) */}
                    <button
                      type="button"
                      onClick={() => setCollapsed(s => {
                        const n = new Set(s);
                        n.has(g.domain) ? n.delete(g.domain) : n.add(g.domain);
                        return n;
                      })}
                      className={cn("w-full flex items-center gap-1.5 px-2 border-b border-border transition-colors", domStyle.bg, "hover:brightness-95")}
                      style={{ height: TP_DOMAIN_H }}
                    >
                      {isCollapsed ? <ChevronRight className="h-3 w-3 flex-shrink-0" /> : <ChevronDown className="h-3 w-3 flex-shrink-0" />}
                      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", domStyle.dot)} />
                      <span className={cn("text-[12px] font-semibold truncate", domStyle.header)}>{g.domain}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">({total})</span>
                    </button>
                    {!isCollapsed && g.portfolios.map(p => (
                      <div key={p.portfolio}>
                        {/* Portfolio sub-header */}
                        <div className="px-2 flex items-center bg-muted/30 border-b border-border/40" style={{ height: TP_PORTFOLIO_H }}>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground truncate">{p.portfolio}</span>
                          <span className="text-[10px] text-muted-foreground/70 ml-auto">{p.items.length}</span>
                        </div>
                        {p.items.map(init => {
                          const d = derived.get(init.id)!;
                          return (
                            <div
                              key={init.id}
                              className="px-2 py-1 border-b border-border/30 flex flex-col justify-center cursor-pointer hover:bg-muted/30"
                              style={{ height: TP_ROW_H }}
                              onClick={() => onEdit(init)}
                            >
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">{init.jiraId}</span>
                                <span className="text-[11px] font-medium truncate">{init.application}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="inline-flex items-center gap-1 text-[9px] px-1 py-0 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-full">
                                  <Circle className="h-1.5 w-1.5 fill-current flex-shrink-0" />
                                  <span className="truncate">{d.owner}</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Bars + SVG overlay */}
            <div className="flex-1 relative" style={{ height: layout.totalH }}>
              {/* Year band backgrounds */}
              {Array.from({ length: horizon.years }, (_, yi) => (
                <div key={yi} className={cn("absolute top-0 bottom-0", yi % 2 === 1 && "bg-muted/5")} style={{ left: `${(yi / horizon.years) * 100}%`, width: `${100 / horizon.years}%` }} />
              ))}
              {/* Quarter gridlines */}
              {horizon.quarters.map((q, i) => (
                <div key={i} className={cn("absolute top-0 bottom-0 border-l pointer-events-none", q.yearStart ? "border-border/40" : "border-border/20")} style={{ left: `${q.pct}%` }} />
              ))}
              {/* Today marker */}
              <div className="absolute top-0 bottom-0 w-px bg-red-400/70 pointer-events-none z-10" style={{ left: `${horizon.todayPct}%` }}>
                <div className="absolute top-0.5 left-0.5 text-[8px] text-red-500 font-medium whitespace-nowrap">Today</div>
              </div>

              {/* Per-row content */}
              {(() => {
                let y = 0;
                const nodes: React.ReactNode[] = [];
                for (const g of grouped) {
                  const isCollapsed = collapsed.has(g.domain);
                  const domStyle = DOMAIN_STYLE[g.domain] ?? DOMAIN_STYLE["Enterprise Platforms"];
                  nodes.push(
                    <div key={`dh-${g.domain}`} className={cn("absolute left-0 right-0 border-b border-border", domStyle.bg)} style={{ top: y, height: TP_DOMAIN_H }} />
                  );
                  y += TP_DOMAIN_H;
                  if (isCollapsed) continue;
                  for (const p of g.portfolios) {
                    nodes.push(
                      <div key={`ph-${g.domain}-${p.portfolio}`} className="absolute left-0 right-0 bg-muted/30 border-b border-border/40" style={{ top: y, height: TP_PORTFOLIO_H }} />
                    );
                    y += TP_PORTFOLIO_H;
                    for (const init of p.items) {
                      const bar = barStyleFor(init.startDate, init.endDate, horizon);
                      const d = derived.get(init.id)!;
                      const hex = statusBarHex(init.status);
                      const isCompleted = init.status === "Completed";
                      const isAtRisk = init.status === "At Risk";
                      const rowTop = y;
                      nodes.push(
                        <div
                          key={init.id}
                          className="absolute left-0 right-0 border-b border-border/20 hover:bg-muted/20 transition-colors"
                          style={{ top: rowTop, height: TP_ROW_H }}
                        >
                          {bar.visible && (
                            <HoverCard openDelay={120} closeDelay={60}>
                              <HoverCardTrigger asChild>
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => onEdit(init)}
                                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEdit(init); } }}
                                  className={cn(
                                    "absolute top-1/2 -translate-y-1/2 h-5 rounded cursor-pointer flex items-center px-1.5 overflow-hidden transition-all hover:ring-2 hover:ring-foreground/40 hover:z-20",
                                    isCompleted && "opacity-60",
                                    isAtRisk && "ring-1 ring-red-400",
                                  )}
                                  style={{ left: bar.left, width: bar.width, backgroundColor: hex }}
                                  title={`${init.jiraId} — ${init.application}`}
                                >
                                  <span className="text-white text-[9px] font-medium truncate whitespace-nowrap drop-shadow-sm">{init.jiraId}</span>
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent side="top" align="start" className="w-96 p-3">
                                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                  <span className="font-mono text-[10px] text-muted-foreground">{init.jiraId}</span>
                                  <SmallBadge label={init.status} className={STATUS_STYLE[init.status] ?? ""} />
                                  <SmallBadge label={`Priority: ${init.priority}`} className={PRIORITY_STYLE[init.priority] ?? ""} />
                                  {init.complexity && <SmallBadge label={init.complexity} className={COMPLEXITY_STYLE[init.complexity] ?? ""} />}
                                </div>
                                <p className="text-sm font-semibold mb-1 leading-snug">{init.application}</p>
                                <p className="text-[10px] text-muted-foreground mb-2">Owner: <span className="text-foreground font-medium">{d.owner}</span> · {init.startDate} → {init.endDate}</p>
                                {init.description && (
                                  <p className="text-[11px] text-foreground/90 mb-1.5 leading-snug">{init.description.slice(0, 220)}{init.description.length > 220 ? "…" : ""}</p>
                                )}
                                {init.businessImpact && (
                                  <p className="text-[11px] text-blue-700 dark:text-blue-400 mb-1 leading-snug"><span className="font-semibold">Impact:</span> {init.businessImpact.slice(0, 140)}{init.businessImpact.length > 140 ? "…" : ""}</p>
                                )}
                                {init.expectedOutcome && (
                                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mb-1 leading-snug"><span className="font-semibold">Outcome:</span> {init.expectedOutcome.slice(0, 140)}{init.expectedOutcome.length > 140 ? "…" : ""}</p>
                                )}
                                {init.dependency && (
                                  <p className="text-[10px] text-muted-foreground leading-snug mt-1"><span className="font-semibold text-foreground/80">Depends on:</span> {init.dependency.slice(0, 120)}</p>
                                )}
                                {init.roiPlan && (
                                  <p className="text-[10px] text-muted-foreground leading-snug mt-1"><span className="font-semibold text-foreground/80">ROI:</span> {init.roiPlan.slice(0, 120)}</p>
                                )}
                                <div className="mt-2 pt-1.5 border-t border-border/50 text-[10px] text-muted-foreground">
                                  <span className="font-semibold text-foreground/80">Milestones:</span>{" "}
                                  {d.milestones.map((ms, mi) => (
                                    <span key={mi}>{ms.label}={ms.date}{mi < d.milestones.length - 1 ? ", " : ""}</span>
                                  ))}
                                </div>
                                {d.decisionPoints.length > 0 && (
                                  <div className="mt-1 text-[10px] text-amber-700 dark:text-amber-400">
                                    <span className="font-semibold">Decision gates:</span>{" "}
                                    {d.decisionPoints.map((dp, di) => (
                                      <span key={di}>{dp.label}{di < d.decisionPoints.length - 1 ? "; " : ""}</span>
                                    ))}
                                  </div>
                                )}
                                <p className="text-[9px] text-muted-foreground mt-2 italic">Click bar to edit</p>
                              </HoverCardContent>
                            </HoverCard>
                          )}
                          {/* Milestone markers */}
                          {d.milestones.map((ms, mi) => {
                            if (ms.pct < 0 || ms.pct > 100) return null;
                            return (
                              <div
                                key={`m-${mi}`}
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white border border-foreground/80 z-10 pointer-events-none"
                                style={{ left: `${ms.pct}%` }}
                                title={`${ms.label} — ${ms.date}`}
                              />
                            );
                          })}
                          {/* Decision-point diamonds */}
                          {d.decisionPoints.map((dp, di) => (
                            <div
                              key={`d-${di}`}
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-amber-500 border border-amber-700 z-10 pointer-events-none"
                              style={{ left: `${dp.pct}%` }}
                              title={`Decision gate — ${dp.label}`}
                            />
                          ))}
                        </div>
                      );
                      y += TP_ROW_H;
                    }
                  }
                }
                return nodes;
              })()}

              {/* Dependency arrows SVG overlay */}
              <svg
                className="absolute inset-0 pointer-events-none"
                width="100%"
                height={layout.totalH}
                preserveAspectRatio="none"
                viewBox={`0 0 100 ${layout.totalH}`}
              >
                <defs>
                  <marker id="tp-arrow-hard" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                  </marker>
                  <marker id="tp-arrow-soft" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                  </marker>
                </defs>
                {arrows.map((a, ai) => {
                  const stroke = a.kind === "hard" ? "#475569" : "#94a3b8";
                  const dash = a.kind === "soft" ? "1.5,1" : undefined;
                  const markerId = a.kind === "hard" ? "url(#tp-arrow-hard)" : "url(#tp-arrow-soft)";
                  const midX = (a.x1 + a.x2) / 2;
                  return (
                    <path
                      key={ai}
                      d={`M ${a.x1} ${a.y1} C ${midX} ${a.y1}, ${midX} ${a.y2}, ${a.x2} ${a.y2}`}
                      stroke={stroke}
                      strokeWidth="0.3"
                      fill="none"
                      strokeDasharray={dash}
                      markerEnd={markerId}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Initiative Form Modal ────────────────────────────────────────────────────

const EMPTY_FORM: Omit<CreateRoadmapInitiativeRequest, "initiativeType" | "status" | "priority"> & {
  initiativeType: string; status: string; priority: string;
} = {
  portfolio: "", product: "", application: "", initiativeType: "Upgrade", description: "",
  expectedOutcome: "", technology: "", currentVersion: "", upgradeVersion: "",
  serviceCategory: "", startDate: "", endDate: "", status: "Planned", priority: "Medium",
  notes: "", domain: "Enterprise Platforms", planYear: 1, planQuarter: "Q1",
  complexity: "Med", businessImpact: "", dependency: "",
  tShirtSize: "", tShirtRationale: "", roiPlan: "",
};

function FieldRow({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function FormInput({ value, onChange, placeholder, type = "text", required }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full text-sm border border-border rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-muted-foreground/50"
    />
  );
}

function FormSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full text-sm border border-border rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function FormTextarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full text-sm border border-border rounded-md px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-muted-foreground/50 resize-none"
    />
  );
}

function InitiativeFormModal({
  editTarget,
  onClose,
  onSaved,
}: {
  editTarget: RoadmapInitiative | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = editTarget !== null;
  const [form, setForm] = useState(() =>
    isEdit ? {
      portfolio: editTarget.portfolio,
      product: editTarget.product,
      application: editTarget.application,
      initiativeType: editTarget.initiativeType as string,
      description: editTarget.description,
      expectedOutcome: editTarget.expectedOutcome,
      technology: editTarget.technology,
      currentVersion: editTarget.currentVersion,
      upgradeVersion: editTarget.upgradeVersion,
      serviceCategory: editTarget.serviceCategory,
      startDate: editTarget.startDate,
      endDate: editTarget.endDate,
      status: editTarget.status as string,
      priority: editTarget.priority as string,
      notes: editTarget.notes,
      domain: editTarget.domain ?? "Enterprise Platforms",
      planYear: editTarget.planYear ?? 1,
      planQuarter: editTarget.planQuarter ?? "Q1",
      complexity: editTarget.complexity ?? "Med",
      businessImpact: editTarget.businessImpact ?? "",
      dependency: editTarget.dependency ?? "",
      tShirtSize: editTarget.tShirtSize ?? "",
      tShirtRationale: editTarget.tShirtRationale ?? "",
      roiPlan: editTarget.roiPlan ?? "",
    } : { ...EMPTY_FORM }
  );

  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateRoadmapInitiative();
  const updateMutation = useUpdateRoadmapInitiative();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const set = (key: keyof typeof form) => (v: string | number) =>
    setForm(f => ({ ...f, [key]: v }));

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit && editTarget) {
        await updateMutation.mutateAsync({
          id: editTarget.id,
          data: {
            ...form,
            initiativeType: form.initiativeType as "Upgrade" | "Ticket Reduction" | "Transformation" | undefined,
            status: form.status as "Active" | "Planned" | "Completed" | "At Risk" | undefined,
            priority: form.priority as "High" | "Medium" | "Low" | undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          data: {
            ...form,
            initiativeType: form.initiativeType as CreateRoadmapInitiativeRequest["initiativeType"],
            status: form.status as CreateRoadmapInitiativeRequest["status"],
            priority: form.priority as CreateRoadmapInitiativeRequest["priority"],
          },
        });
      }
      onSaved();
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Failed to save. Please try again.");
    }
  }, [form, isEdit, editTarget, createMutation, updateMutation, onSaved]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
      <div
        className="relative w-full max-w-2xl bg-background border border-border rounded-xl shadow-2xl mt-8 mb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold">
              {isEdit ? "Edit Initiative" : "New Initiative"}
            </h2>
            {isEdit && (
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                Jira ID: <span className="font-semibold text-foreground">{editTarget!.jiraId}</span>
              </p>
            )}
            {!isEdit && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Jira ID will be auto-generated on save
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(90vh - 130px)" }}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Application / Initiative Name" required>
              <FormInput value={form.application} onChange={set("application")} placeholder="e.g. Claims Processing Engine" required />
            </FieldRow>
            <FieldRow label="Initiative Type" required>
              <FormSelect value={form.initiativeType} onChange={set("initiativeType")} options={[
                { value: "Upgrade", label: "Upgrade" },
                { value: "Ticket Reduction", label: "Ticket Reduction" },
                { value: "Transformation", label: "Transformation" },
              ]} />
            </FieldRow>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Portfolio" required>
              <FormInput value={form.portfolio} onChange={set("portfolio")} placeholder="e.g. Enrollment & Eligibility" required />
            </FieldRow>
            <FieldRow label="Product" required>
              <FormInput value={form.product} onChange={set("product")} placeholder="e.g. Membership System" required />
            </FieldRow>
          </div>

          <FieldRow label="Description" required>
            <FormTextarea value={form.description} onChange={set("description")} placeholder="Describe what this initiative entails…" required />
          </FieldRow>

          <FieldRow label="Expected Outcome" required>
            <FormTextarea value={form.expectedOutcome} onChange={set("expectedOutcome")} placeholder="What will be achieved?" required />
          </FieldRow>

          <FieldRow label="Business Impact">
            <FormTextarea value={form.businessImpact} onChange={set("businessImpact")} placeholder="Quantified business value (e.g. 25% cost reduction)…" rows={2} />
          </FieldRow>

          <div className="grid grid-cols-3 gap-4">
            <FieldRow label="Technology" required>
              <FormInput value={form.technology} onChange={set("technology")} placeholder="e.g. Angular, .NET 8" required />
            </FieldRow>
            <FieldRow label="Current Version">
              <FormInput value={form.currentVersion} onChange={set("currentVersion")} placeholder="e.g. 4.8" />
            </FieldRow>
            <FieldRow label="Upgrade Version">
              <FormInput value={form.upgradeVersion} onChange={set("upgradeVersion")} placeholder="e.g. 8.0" />
            </FieldRow>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Service Category" required>
              <FormInput value={form.serviceCategory} onChange={set("serviceCategory")} placeholder="e.g. Platform Upgrade" required />
            </FieldRow>
            <FieldRow label="Domain">
              <FormSelect value={form.domain} onChange={set("domain")} options={DOMAINS.map(d => ({ value: d, label: d }))} />
            </FieldRow>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <FieldRow label="Plan Year">
              <FormSelect value={String(form.planYear)} onChange={v => set("planYear")(Number(v))} options={[
                { value: "1", label: "Year 1 · 2026" },
                { value: "2", label: "Year 2 · 2027" },
                { value: "3", label: "Year 3 · 2028" },
              ]} />
            </FieldRow>
            <FieldRow label="Quarter">
              <FormSelect value={form.planQuarter} onChange={set("planQuarter")} options={["Q1","Q2","Q3","Q4"].map(q => ({ value: q, label: q }))} />
            </FieldRow>
            <FieldRow label="Complexity">
              <FormSelect value={form.complexity} onChange={set("complexity")} options={[
                { value: "Low", label: "Low" },
                { value: "Med", label: "Medium" },
                { value: "High", label: "High" },
              ]} />
            </FieldRow>
            <FieldRow label="Dependency">
              <FormInput value={form.dependency} onChange={set("dependency")} placeholder="e.g. HLGN-1004" />
            </FieldRow>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Start Date" required>
              <FormInput type="date" value={form.startDate} onChange={set("startDate")} required />
            </FieldRow>
            <FieldRow label="End Date" required>
              <FormInput type="date" value={form.endDate} onChange={set("endDate")} required />
            </FieldRow>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="Status" required>
              <FormSelect value={form.status} onChange={set("status")} options={[
                { value: "Planned", label: "Planned" },
                { value: "Active", label: "Active" },
                { value: "Completed", label: "Completed" },
                { value: "At Risk", label: "At Risk" },
              ]} />
            </FieldRow>
            <FieldRow label="Priority" required>
              <FormSelect value={form.priority} onChange={set("priority")} options={[
                { value: "High", label: "High" },
                { value: "Medium", label: "Medium" },
                { value: "Low", label: "Low" },
              ]} />
            </FieldRow>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldRow label="T-Shirt Size Estimate">
              <FormSelect value={form.tShirtSize} onChange={set("tShirtSize")} options={[
                { value: "", label: "— Not sized —" },
                { value: "XS", label: "XS · ≤ 1 month" },
                { value: "S", label: "S · 1–3 months" },
                { value: "M", label: "M · 3–6 months" },
                { value: "L", label: "L · 6–12 months" },
                { value: "XL", label: "XL · 12+ months / multi-team" },
              ]} />
            </FieldRow>
            <FieldRow label="T-Shirt Sizing Rationale">
              <FormTextarea value={form.tShirtRationale} onChange={set("tShirtRationale")} placeholder="Why this size — scope, complexity, dependencies, team count…" rows={2} />
            </FieldRow>
          </div>

          <FieldRow label="How Horizon Will Get the ROI">
            <FormTextarea value={form.roiPlan} onChange={set("roiPlan")} placeholder="Quantified value, payback period, cost levers, and the path to realize the ROI…" rows={3} />
          </FieldRow>

          <FieldRow label="Notes">
            <FormTextarea value={form.notes} onChange={set("notes")} placeholder="Additional context, risks, or decisions…" rows={2} />
          </FieldRow>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEdit ? "Save Changes" : "Create Initiative"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── IBM Consulting Advantage Assets ─────────────────────────────────────────

type IbmAsset = { name: string; tag: string; tagColor: string; value: string; isBob?: boolean };

const IBM_BOB: IbmAsset = {
  name: "IBM BOB (Project Bob)",
  tag: "AI Pair Developer",
  tagColor: "bg-[#0f62fe] text-white",
  value: "IBM BOB (Project Bob) is an AI-powered software development and modernization platform that acts like an intelligent \u201Cpair developer\u201D embedded directly within the IDE, helping teams design, build, refactor, secure, and document code faster. It understands developer intent, the underlying codebase, and enterprise standards, enabling it to assist across the full software development lifecycle\u2014from planning and coding to automated code reviews, vulnerability detection, and large-scale application modernization (e.g., legacy to modern stacks). Beyond just a coding assistant, BOB brings agentic workflows, built-in security, and enterprise compliance guardrails into everyday development, making it particularly valuable for complex, regulated environments and modernization programs.",
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
              <span className="text-xs font-mono text-muted-foreground">{initiative.jiraId}</span>
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
          {(initiative.tShirtSize || initiative.tShirtRationale) && (
            <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-violet-700 dark:text-violet-400 uppercase tracking-wide">T-Shirt Size Estimate</p>
                {initiative.tShirtSize && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold border bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 border-violet-300 dark:border-violet-700">
                    {initiative.tShirtSize}
                  </span>
                )}
              </div>
              {initiative.tShirtRationale && (
                <p className="text-sm text-violet-900 dark:text-violet-200 leading-relaxed">{initiative.tShirtRationale}</p>
              )}
            </div>
          )}
          {initiative.roiPlan && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1">How Horizon Will Get the ROI</p>
              <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed">{initiative.roiPlan}</p>
            </div>
          )}
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
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-1.5 px-3 w-24">Jira ID</th>
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
                  <td className="py-1.5 px-3 font-mono text-muted-foreground whitespace-nowrap">{alert.jiraId ?? "—"}</td>
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
        items: initiatives.filter(i => complexityNum(i.complexity ?? undefined) === ci && impactNum(i.priority) === imp),
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
                          <span className="truncate text-[10px] font-medium leading-tight">{item.jiraId}</span>
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
  onEdit,
  defaultOpen = true,
  showSize = true,
}: {
  domain: string;
  initiatives: RoadmapInitiative[];
  onSelect: (i: RoadmapInitiative) => void;
  onEdit: (i: RoadmapInitiative) => void;
  defaultOpen?: boolean;
  showSize?: boolean;
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
                <th className="w-8 py-2 px-3" />
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3 w-28">Jira #</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3">Initiative</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3 w-14">Year</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3 w-12">Q</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3 w-20">Complexity</th>
                {showSize && <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3 w-14">Size</th>}
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-2 px-3">Business Impact / ROI</th>
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
                    "border-b border-border/50 cursor-pointer hover:bg-muted/40 transition-colors group",
                    i % 2 !== 0 && "bg-muted/10",
                    init.status === "At Risk" && "bg-red-50/40 dark:bg-red-950/10 hover:bg-red-50/60 dark:hover:bg-red-950/20",
                    init.status === "Completed" && "opacity-70"
                  )}
                >
                  <td className="py-2 px-2 whitespace-nowrap">
                    <button
                      onClick={e => { e.stopPropagation(); onEdit(init); }}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit initiative"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </td>
                  <td className="py-2 px-3 font-mono text-muted-foreground whitespace-nowrap">{init.jiraId}</td>
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
                  {showSize && (
                    <td className="py-2 px-3 whitespace-nowrap">
                      {init.tShirtSize
                        ? <SmallBadge label={init.tShirtSize} className="text-violet-700 bg-violet-50 border-violet-200 dark:text-violet-300 dark:bg-violet-950 dark:border-violet-800" />
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                  )}
                  <td className="py-2 px-3 text-muted-foreground max-w-[220px]" title={[init.businessImpact, init.roiPlan].filter(Boolean).join(" — ")}>
                    {init.businessImpact && <p className="truncate">{init.businessImpact}</p>}
                    {init.roiPlan && <p className="truncate text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">ROI: {init.roiPlan}</p>}
                    {!init.businessImpact && !init.roiPlan && "—"}
                  </td>
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
  const [view, setView] = useState<"table" | "heatmap" | "timeline">("table");
  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<RoadmapInitiative | null>(null);
  const queryClient = useQueryClient();

  const handleEdit = useCallback((init: RoadmapInitiative) => {
    setFormTarget(init);
    setFormOpen(true);
  }, []);

  const handleNewInitiative = useCallback(() => {
    setFormTarget(null);
    setFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setFormTarget(null);
  }, []);

  const handleFormSaved = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/roadmap/initiatives"] });
    setFormOpen(false);
    setFormTarget(null);
  }, [queryClient]);

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
        <button
          onClick={handleNewInitiative}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors flex-shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          New Initiative
        </button>
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
          {(["table", "heatmap", "timeline"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors border-r border-border/50 last:border-r-0",
                view === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
            >
              {v === "table" ? "Table" : v === "heatmap" ? "Impact Map" : "Timeline"}
            </button>
          ))}
        </div>
      </div>

      {/* View content */}
      {view === "heatmap" ? (
        <Card className="p-4">
          <ImpactMap initiatives={filtered} />
        </Card>
      ) : view === "timeline" ? (
        <TimelineView initiatives={filtered} onSelect={onSelect} onEdit={handleEdit} />
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
              onEdit={handleEdit}
              defaultOpen={idx < 3}
              showSize={initiativeType === "Transformation"}
            />
          ))}
          {filtered.filter(i => !i.domain || !DOMAINS.includes(i.domain as typeof DOMAINS[number])).length > 0 && (
            <DomainGroup
              domain="Enterprise Platforms"
              initiatives={filtered.filter(i => !i.domain || !DOMAINS.includes(i.domain as typeof DOMAINS[number]))}
              onSelect={onSelect}
              onEdit={handleEdit}
              defaultOpen={false}
              showSize={initiativeType === "Transformation"}
            />
          )}
        </div>
      )}

      {/* Form Modal */}
      {formOpen && (
        <InitiativeFormModal
          editTarget={formTarget}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  );
}

// ─── Governance Colour Helpers ────────────────────────────────────────────────

const REQ_STATUS_STYLE: Record<string, string> = {
  "Open":        "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-800",
  "In Progress": "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800",
  "Met":         "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800",
  "Overdue":     "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800",
};

const PRIORITY_BADGE: Record<string, string> = {
  High: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800",
  Med:  "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-800",
  Low:  "text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700",
};

const RISK_STATUS_STYLE: Record<string, string> = {
  "Open":       "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800",
  "Mitigating": "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-800",
  "Closed":     "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800",
};

const RISK_RATING_STYLE: Record<string, string> = {
  High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-bold",
  Med:  "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-semibold",
  Low:  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
};

// heatmap cell background: likelihood row × impact column
function heatmapCellClass(l: string, i: string): string {
  if (l === "High" && i === "High") return "bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100";
  if ((l === "High" && i === "Med") || (l === "Med" && i === "High")) return "bg-orange-200 dark:bg-orange-900 text-orange-900 dark:text-orange-100";
  if ((l === "High" && i === "Low") || (l === "Low" && i === "High") || (l === "Med" && i === "Med")) return "bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100";
  if ((l === "Med" && i === "Low") || (l === "Low" && i === "Med")) return "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100";
  return "bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100";
}

const CATEGORY_HEX: Record<string, string> = {
  "Strategic":             "#3b82f6",
  "Technical Remediation": "#f97316",
  "Tactical":              "#10b981",
  "Foundational":          "#8b5cf6",
};

const CATEGORY_ORDER = ["Strategic", "Technical Remediation", "Tactical", "Foundational"] as const;

const COMBINED_YEAR_BANDS = [
  { label: "Year 1 · 2026", sub: "Quick Wins & Foundation" },
  { label: "Year 2 · 2027", sub: "Scale & Integration" },
  { label: "Year 3 · 2028", sub: "Transform & Optimize" },
];

// ─── Combined Governance Timeline (Gantt-bar view across all categories) ──────

function CombinedGovernanceTimeline({
  initiatives,
  onSelect,
}: {
  initiatives: GovernanceCombinedInitiative[];
  onSelect: (id: number) => void;
}) {
  const [hoveredId, setHoveredId]         = useState<number | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [collapsedDoms, setCollapsedDoms] = useState<Set<string>>(new Set());

  const toggleCat = useCallback((cat: string) => setCollapsedCats(prev => {
    const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n;
  }), []);
  const toggleDom = useCallback((key: string) => setCollapsedDoms(prev => {
    const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n;
  }), []);

  const grouped = useMemo(() =>
    CATEGORY_ORDER
      .filter(cat => initiatives.some(i => i.category === cat))
      .map(cat => {
        const catItems = initiatives.filter(i => i.category === cat);
        const domains  = [...new Set(catItems.map(i => i.domain))].sort();
        return {
          category: cat,
          items:    catItems,
          domainGroups: domains.map(d => ({
            domain: d,
            items:  catItems.filter(i => i.domain === d).sort((a, b) => a.startDate.localeCompare(b.startDate)),
          })),
        };
      }),
  [initiatives]);

  if (grouped.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No initiatives match the current filters.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: 960 }}>
          {/* Year band headers */}
          <div className="flex border-b border-border bg-background sticky top-0 z-10">
            <div className="w-64 flex-shrink-0 border-r border-border bg-background" />
            {COMBINED_YEAR_BANDS.map((yb, yi) => (
              <div key={yb.label} className={cn("flex-1 text-center py-2 border-r border-border last:border-r-0", yi % 2 === 1 && "bg-muted/10")}>
                <p className="text-xs font-semibold text-foreground leading-tight">{yb.label}</p>
                <p className="text-[10px] text-muted-foreground">{yb.sub}</p>
              </div>
            ))}
          </div>
          {/* Quarter sub-headers */}
          <div className="flex border-b border-border bg-muted/20">
            <div className="w-64 flex-shrink-0 border-r border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Category / Domain / Initiative
            </div>
            <div className="flex-1 relative">
              <div className="flex h-full">
                {TL_QUARTERS.map((q, i) => (
                  <div
                    key={i}
                    className={cn("flex-1 text-center text-[10px] font-medium text-muted-foreground py-1.5 border-r border-border/50 last:border-r-0",
                      q.yearStart && "border-l-2 border-border")}
                  >
                    {q.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category groups */}
          {grouped.map(({ category, items: catItems, domainGroups }) => {
            const catHex       = CATEGORY_HEX[category] ?? "#64748b";
            const catCollapsed = collapsedCats.has(category);
            return (
              <div key={category}>
                {/* Category header */}
                <div
                  className="flex items-center border-b border-border bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleCat(category)}
                >
                  <div className="w-64 flex-shrink-0 border-r border-border px-3 py-2 flex items-center gap-1.5">
                    {catCollapsed
                      ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: catHex }} />
                    <span className="text-xs font-bold" style={{ color: catHex }}>{category}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">({catItems.length})</span>
                  </div>
                  <div className="flex-1 relative h-7">
                    {[0, 1, 2].map(yi => (
                      <div key={yi} className={cn("absolute top-0 bottom-0", yi % 2 === 1 && "bg-muted/10")} style={{ left: `${(yi / 3) * 100}%`, width: `${100 / 3}%` }} />
                    ))}
                    {TL_QUARTERS.map((q, i) => (
                      <div key={i} className={cn("absolute top-0 bottom-0 border-l border-border/30", q.yearStart && "border-l-2 border-border/50")} style={{ left: `${q.pct}%` }} />
                    ))}
                    {catItems.map(init => {
                      const bar = tlBarStyle(init.startDate, init.endDate);
                      return (
                        <div key={init.id} className="absolute top-1/2 h-1.5 rounded-full pointer-events-none"
                          style={{ left: bar.left, width: bar.width, backgroundColor: catHex + "44", transform: "translateY(-50%)" }} />
                      );
                    })}
                  </div>
                </div>

                {/* Domain sub-groups */}
                {!catCollapsed && domainGroups.map(({ domain, items }) => {
                  const domKey       = `${category}::${domain}`;
                  const domCollapsed = collapsedDoms.has(domKey);
                  return (
                    <div key={domain}>
                      {/* Domain sub-header */}
                      <div
                        className="flex items-center border-b border-border/40 bg-muted/5 cursor-pointer hover:bg-muted/15 transition-colors"
                        onClick={() => toggleDom(domKey)}
                      >
                        <div className="w-64 flex-shrink-0 border-r border-border pl-6 pr-3 py-1.5 flex items-center gap-1.5">
                          {domCollapsed
                            ? <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            : <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: catHex + "99" }} />
                          <span className="text-xs font-semibold text-foreground/70 truncate">{domain}</span>
                          <span className="text-[10px] text-muted-foreground ml-1 flex-shrink-0">({items.length})</span>
                        </div>
                        <div className="flex-1 relative h-6">
                          {[0, 1, 2].map(yi => (
                            <div key={yi} className={cn("absolute top-0 bottom-0", yi % 2 === 1 && "bg-muted/5")} style={{ left: `${(yi / 3) * 100}%`, width: `${100 / 3}%` }} />
                          ))}
                          {TL_QUARTERS.map((q, i) => (
                            <div key={i} className={cn("absolute top-0 bottom-0 border-l border-border/20", q.yearStart && "border-l-2 border-border/40")} style={{ left: `${q.pct}%` }} />
                          ))}
                          {items.map(init => {
                            const bar = tlBarStyle(init.startDate, init.endDate);
                            return (
                              <div key={init.id} className="absolute top-1/2 h-1.5 rounded-sm pointer-events-none"
                                style={{ left: bar.left, width: bar.width, backgroundColor: catHex + "66", transform: "translateY(-50%)" }} />
                            );
                          })}
                        </div>
                      </div>

                      {/* Initiative rows */}
                      {!domCollapsed && items.map((init, rowIdx) => {
                        const bar         = tlBarStyle(init.startDate, init.endDate);
                        const isHovered   = hoveredId === init.id;
                        const isCompleted = init.status === "Completed";
                        const isAtRisk    = init.status === "At Risk";
                        return (
                          <div
                            key={init.id}
                            onClick={() => onSelect(init.id)}
                            onMouseEnter={() => setHoveredId(init.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={cn(
                              "flex items-center border-b border-border/20 cursor-pointer group transition-colors",
                              rowIdx % 2 === 0 ? "bg-background" : "bg-muted/5",
                              isHovered && "bg-muted/20"
                            )}
                          >
                            {/* Label column */}
                            <div className="w-64 flex-shrink-0 border-r border-border pl-10 pr-3 py-1.5 group-hover:bg-muted/10 transition-colors">
                              <p className="text-xs font-medium leading-tight truncate">{init.application}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] font-mono text-muted-foreground">{init.jiraId}</span>
                                <SmallBadge label={init.status} className={cn(STATUS_STYLE[init.status] ?? "", "text-[9px] py-0 px-1")} />
                              </div>
                            </div>
                            {/* Bar area */}
                            <div className="flex-1 relative h-9">
                              {[0, 1, 2].map(yi => (
                                <div key={yi} className={cn("absolute top-0 bottom-0", yi % 2 === 1 && "bg-muted/5")} style={{ left: `${(yi / 3) * 100}%`, width: `${100 / 3}%` }} />
                              ))}
                              {TL_QUARTERS.map((q, i) => (
                                <div key={i} className={cn("absolute top-0 bottom-0 border-l pointer-events-none", q.yearStart ? "border-border/40" : "border-border/20")} style={{ left: `${q.pct}%` }} />
                              ))}
                              <div className="absolute top-0 bottom-0 w-px bg-red-400/70 pointer-events-none z-10" style={{ left: `${TL_TODAY_PCT}%` }}>
                                <div className="absolute top-0 left-0.5 text-[8px] text-red-500 font-medium whitespace-nowrap">Today</div>
                              </div>
                              <div
                                className={cn(
                                  "absolute top-1/2 -translate-y-1/2 h-5 rounded flex items-center px-1.5 overflow-hidden transition-opacity duration-150",
                                  isCompleted && "opacity-40",
                                  isAtRisk && "ring-1 ring-red-400 ring-offset-0"
                                )}
                                style={{ left: bar.left, width: bar.width, backgroundColor: catHex + (isHovered ? "ff" : "cc") }}
                              >
                                <span className="text-white text-[9px] font-medium truncate whitespace-nowrap drop-shadow-sm">{init.jiraId}</span>
                              </div>
                              {/* Hover tooltip */}
                              {isHovered && (
                                <div className="absolute z-40 pointer-events-none" style={{ left: bar.left, bottom: "calc(100% + 4px)" }}>
                                  <div className="bg-popover border border-border rounded-lg shadow-2xl p-3 w-80">
                                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                      <span className="font-mono text-[10px] text-muted-foreground">{init.jiraId}</span>
                                      <SmallBadge label={init.status}   className={STATUS_STYLE[init.status] ?? ""} />
                                      <SmallBadge label={init.priority} className={PRIORITY_BADGE[init.priority] ?? ""} />
                                    </div>
                                    <p className="text-xs font-semibold mb-1 leading-snug">{init.application}</p>
                                    {init.businessImpact && (
                                      <p className="text-[11px] text-blue-700 dark:text-blue-400 mb-1.5 leading-snug">
                                        {init.businessImpact.slice(0, 100)}{(init.businessImpact?.length ?? 0) > 100 ? "…" : ""}
                                      </p>
                                    )}
                                    <p className="text-[11px] text-muted-foreground leading-snug">{init.description.slice(0, 90)}…</p>
                                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground border-t border-border/50 pt-1.5">
                                      <span>{init.startDate}</span><span>→</span><span>{init.endDate}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Footer legend */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-muted/10 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className="w-px h-3 bg-red-400/70" /><span>Today</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {CATEGORY_ORDER.map(cat => (
                <span key={cat} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: (CATEGORY_HEX[cat] ?? "#64748b") + "cc" }} />
                  {cat}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 ml-auto flex-wrap text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="ring-1 ring-red-400 w-3 h-3 rounded-sm inline-block bg-transparent" /> At Risk</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm inline-block opacity-40 bg-slate-400" /> Completed</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Timeline & Deliverables Section (new) ────────────────────────────────────

function TimelineDeliverablesSection() {
  const { data: rawInitiatives, isLoading } = useGetRoadmapGovernanceCombined();
  const initiatives: GovernanceCombinedInitiative[] = rawInitiatives ?? [];
  const [catFilter, setCatFilter]       = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [view, setView]                 = useState<"timeline" | "table">("timeline");
  const [selectedId, setSelectedId]     = useState<number | null>(null);
  const rowRefs = React.useRef<Map<number, HTMLTableRowElement>>(new Map());

  const filtered = useMemo(() => initiatives
    .filter(i => catFilter    === "All" || i.category === catFilter)
    .filter(i => statusFilter === "All" || i.status   === statusFilter),
  [initiatives, catFilter, statusFilter]);

  const handleBarClick = useCallback((id: number) => {
    setSelectedId(id);
    setView("table");
  }, []);

  React.useEffect(() => {
    if (view === "table" && selectedId !== null) {
      const el = rowRefs.current.get(selectedId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [view, selectedId]);

  const kpis = useMemo(() => ({
    total:     initiatives.length,
    active:    initiatives.filter(i => i.status === "Active").length,
    atRisk:    initiatives.filter(i => i.status === "At Risk").length,
    planned:   initiatives.filter(i => i.status === "Planned").length,
    completed: initiatives.filter(i => i.status === "Completed").length,
  }), [initiatives]);

  const handleDownload = useCallback(() => {
    const a = document.createElement("a");
    a.href = "/api/roadmap/governance-export";
    a.download = "Governance_Timeline.xlsx";
    a.click();
  }, []);

  if (isLoading) return <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Initiatives", value: kpis.total,     color: "text-foreground",                         icon: <Layers className="h-4 w-4" /> },
          { label: "Active",            value: kpis.active,    color: "text-emerald-600 dark:text-emerald-400",  icon: <CheckCircle2 className="h-4 w-4" /> },
          { label: "Completed",         value: kpis.completed, color: "text-blue-600 dark:text-blue-400",        icon: <Star className="h-4 w-4" fill="currentColor" /> },
          { label: "At Risk",           value: kpis.atRisk,    color: "text-red-600 dark:text-red-400",          icon: <AlertTriangle className="h-4 w-4" /> },
          { label: "Planned",           value: kpis.planned,   color: "text-slate-500 dark:text-slate-400",      icon: <Clock className="h-4 w-4" /> },
        ].map(k => (
          <Card key={k.label} className="p-3">
            <div className={cn("mb-1", k.color)}>{k.icon}</div>
            <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Category breakdown */}
      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Initiative Categories</p>
        <div className="space-y-2">
          {CATEGORY_ORDER.map(cat => {
            const catItems  = initiatives.filter(i => i.category === cat);
            const completed = catItems.filter(i => i.status === "Completed").length;
            const active    = catItems.filter(i => i.status === "Active").length;
            const atRisk    = catItems.filter(i => i.status === "At Risk").length;
            const planned   = catItems.filter(i => i.status === "Planned").length;
            const hex       = CATEGORY_HEX[cat] ?? "#64748b";
            if (catItems.length === 0) return null;
            return (
              <div key={cat} className="flex items-center gap-4 p-2.5 rounded-lg border border-border bg-muted/5">
                <div className="w-44 flex-shrink-0 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
                  <div>
                    <p className="text-xs font-bold" style={{ color: hex }}>{cat}</p>
                    <p className="text-[10px] text-muted-foreground">{catItems.length} initiatives</p>
                  </div>
                </div>
                <div className="flex-1 h-4 rounded-full overflow-hidden flex bg-muted/40">
                  {completed > 0 && <div title={`${completed} Completed`}  className="h-full bg-blue-500"    style={{ width: `${(completed / catItems.length) * 100}%` }} />}
                  {active    > 0 && <div title={`${active} Active`}        className="h-full bg-emerald-500" style={{ width: `${(active    / catItems.length) * 100}%` }} />}
                  {atRisk    > 0 && <div title={`${atRisk} At Risk`}       className="h-full bg-red-500"     style={{ width: `${(atRisk    / catItems.length) * 100}%` }} />}
                  {planned   > 0 && <div title={`${planned} Planned`}      className="h-full bg-slate-400"   style={{ width: `${(planned   / catItems.length) * 100}%` }} />}
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[10px] flex-shrink-0">
                  {completed > 0 && <span className="text-blue-600 dark:text-blue-400 font-medium">{completed} done</span>}
                  {active    > 0 && <span className="text-emerald-600 dark:text-emerald-400 font-medium">{active} active</span>}
                  {atRisk    > 0 && <span className="text-red-600 dark:text-red-400 font-medium">{atRisk} at risk</span>}
                  {planned   > 0 && <span className="text-muted-foreground">{planned} planned</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filters + view toggle + download */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">Category:</span>
        {(["All", ...CATEGORY_ORDER] as string[]).map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)}
            className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
              catFilter === cat
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border hover:text-foreground")}>
            {cat === "All" ? "All" : cat}
          </button>
        ))}
        <span className="text-border mx-1">|</span>
        <span className="text-xs text-muted-foreground font-medium">Status:</span>
        {(["All", "Active", "At Risk", "Planned", "Completed"] as string[]).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
              statusFilter === s
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border hover:text-foreground")}>
            {s}
          </button>
        ))}
        {(catFilter !== "All" || statusFilter !== "All") && (
          <button onClick={() => { setCatFilter("All"); setStatusFilter("All"); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-border hover:bg-muted text-muted-foreground">
            <X className="h-3 w-3" /> Clear
          </button>
        )}
        <span className="text-[11px] text-muted-foreground">{filtered.length} of {initiatives.length}</span>
        <button onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted text-muted-foreground transition-colors">
          <Download className="h-3.5 w-3.5" /> Download Excel
        </button>
        <div className="ml-auto flex items-center border border-border rounded-md overflow-hidden">
          {(["timeline", "table"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors border-r border-border/50 last:border-r-0",
                view === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
              {v === "timeline" ? "Timeline" : "Table"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {view === "timeline" ? (
        <CombinedGovernanceTimeline initiatives={filtered} onSelect={handleBarClick} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Initiative</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-36">Category</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Domain</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-24">Status</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-16">Priority</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-16">Size</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-24">Start</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-24">End</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No initiatives match the current filters.</td></tr>
                ) : filtered.map((d, i) => {
                  const isCompleted = d.status === "Completed";
                  const isAtRisk    = d.status === "At Risk";
                  const isSelected  = selectedId === d.id;
                  const catHex      = CATEGORY_HEX[d.category] ?? "#64748b";
                  return (
                    <tr
                      key={d.id}
                      ref={el => { if (el) rowRefs.current.set(d.id, el); else rowRefs.current.delete(d.id); }}
                      onClick={() => setSelectedId(isSelected ? null : d.id)}
                      className={cn(
                        "border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer",
                        isSelected  ? "ring-2 ring-inset ring-blue-400 bg-blue-50/60 dark:bg-blue-950/30" :
                        isCompleted ? "bg-blue-50/30 dark:bg-blue-950/15" :
                        isAtRisk    ? "bg-red-50/40 dark:bg-red-950/20" :
                        i % 2 === 0 ? "bg-background" : "bg-muted/5"
                      )}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="font-mono text-[10px] text-muted-foreground">{d.jiraId}</span>
                          {isCompleted && <Star className="h-3 w-3 text-amber-400 flex-shrink-0" fill="currentColor" />}
                        </div>
                        <p className="font-medium text-xs leading-tight">{d.application}</p>
                        <p className="text-muted-foreground text-[11px] mt-0.5 leading-snug">{d.description.slice(0, 80)}{d.description.length > 80 ? "…" : ""}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: catHex }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: catHex }} />
                          {d.category}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground text-[11px]">{d.domain}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className={cn("text-[10px]", STATUS_STYLE[d.status] ?? "")}>{d.status}</Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className={cn("text-[10px]", PRIORITY_BADGE[d.priority] ?? "")}>{d.priority}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground text-[10px]">{d.complexity}</td>
                      <td className="px-3 py-2.5 text-muted-foreground font-mono text-[10px]">{d.startDate}</td>
                      <td className="px-3 py-2.5 text-muted-foreground font-mono text-[10px]">{d.endDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Requirements for Horizon Section ────────────────────────────────────────

function RequirementsSection() {
  const { data: requirements = [], isLoading } = useGetRoadmapRequirements();
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const categories = useMemo(() => {
    const cats = [...new Set(requirements.map(r => r.category))].sort();
    return ["All", ...cats];
  }, [requirements]);

  const filtered = useMemo(() => requirements
    .filter(r => catFilter === "All" || r.category === catFilter)
    .filter(r => statusFilter === "All" || r.status === statusFilter),
  [requirements, catFilter, statusFilter]);

  const kpis = useMemo(() => ({
    open:       requirements.filter(r => r.status === "Open").length,
    inProgress: requirements.filter(r => r.status === "In Progress").length,
    met:        requirements.filter(r => r.status === "Met").length,
    overdue:    requirements.filter(r => r.status === "Overdue").length,
  }), [requirements]);

  if (isLoading) return <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open",        value: kpis.open,       color: "text-amber-600 dark:text-amber-400",   icon: <Clock className="h-4 w-4" /> },
          { label: "In Progress", value: kpis.inProgress, color: "text-blue-600 dark:text-blue-400",     icon: <Activity className="h-4 w-4" /> },
          { label: "Met",         value: kpis.met,        color: "text-emerald-600 dark:text-emerald-400", icon: <CheckCircle2 className="h-4 w-4" /> },
          { label: "Overdue",     value: kpis.overdue,    color: "text-red-600 dark:text-red-400",       icon: <AlertTriangle className="h-4 w-4" /> },
        ].map(k => (
          <Card key={k.label} className="p-3">
            <div className={cn("mb-1", k.color)}>{k.icon}</div>
            <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Category:</span>
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
              catFilter === c ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border hover:text-foreground")}>
            {c}
          </button>
        ))}
        <span className="text-border ml-1">|</span>
        <span className="text-xs text-muted-foreground ml-1">Status:</span>
        {["All", "Open", "In Progress", "Met", "Overdue"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
              statusFilter === s ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border hover:text-foreground")}>
            {s}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} of {requirements.length}</span>
      </div>

      {/* Requirements table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Requirement</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-32">Category</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">IBM Workstream Unblocked</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-36">Owner</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-16">Priority</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-24">Due</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No requirements match the current filters.</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id} className={cn("border-b border-border/30 hover:bg-muted/20 transition-colors", i % 2 === 0 ? "bg-background" : "bg-muted/5")}>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-sm leading-tight">{r.name}</p>
                    <p className="text-muted-foreground mt-0.5 leading-snug">{r.description}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.ibmWorkstream}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-[10px]">{r.owner}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className={cn("text-[10px]", PRIORITY_BADGE[r.priority] ?? "")}>{r.priority}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground font-mono">{r.dueDate}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className={cn("text-[10px]", REQ_STATUS_STYLE[r.status] ?? "")}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Risks & Mitigation Section ───────────────────────────────────────────────

function RisksMitigationSection() {
  const { data: risks = [], isLoading } = useGetRoadmapRisks();
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");

  const filtered = useMemo(() => risks
    .filter(r => catFilter === "All" || r.category === catFilter)
    .filter(r => statusFilter === "All" || r.status === statusFilter)
    .filter(r => ratingFilter === "All" || r.rating === ratingFilter),
  [risks, catFilter, statusFilter, ratingFilter]);

  const kpis = useMemo(() => ({
    open:       risks.filter(r => r.status === "Open").length,
    mitigating: risks.filter(r => r.status === "Mitigating").length,
    closed:     risks.filter(r => r.status === "Closed").length,
    highRating: risks.filter(r => r.rating === "High").length,
    medRating:  risks.filter(r => r.rating === "Med").length,
  }), [risks]);

  const heatmapData = useMemo(() => {
    const levels = ["High", "Med", "Low"];
    return levels.map(l => ({
      likelihood: l,
      cells: levels.map(i => ({
        impact: i,
        count: risks.filter(r => r.likelihood === l && r.impact === i && r.status !== "Closed").length,
      })),
    }));
  }, [risks]);

  if (isLoading) return <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Open",           value: kpis.open,       color: "text-red-600 dark:text-red-400",       icon: <AlertTriangle className="h-4 w-4" /> },
          { label: "Mitigating",     value: kpis.mitigating, color: "text-amber-600 dark:text-amber-400",   icon: <Wrench className="h-4 w-4" /> },
          { label: "Closed",         value: kpis.closed,     color: "text-emerald-600 dark:text-emerald-400", icon: <CheckCircle2 className="h-4 w-4" /> },
          { label: "High Rating",    value: kpis.highRating, color: "text-red-600 dark:text-red-400",       icon: <AlertTriangle className="h-4 w-4" /> },
          { label: "Medium Rating",  value: kpis.medRating,  color: "text-amber-600 dark:text-amber-400",   icon: <Activity className="h-4 w-4" /> },
        ].map(k => (
          <Card key={k.label} className="p-3">
            <div className={cn("mb-1", k.color)}>{k.icon}</div>
            <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Risk heatmap */}
      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Risk Heatmap (Open + Mitigating)</p>
        <div className="inline-block">
          <div className="flex items-end gap-1 mb-1">
            <div className="w-20 flex-shrink-0" />
            {["High Impact", "Med Impact", "Low Impact"].map(label => (
              <div key={label} className="w-24 text-center text-[10px] font-semibold text-muted-foreground">{label}</div>
            ))}
          </div>
          {heatmapData.map(row => (
            <div key={row.likelihood} className="flex items-center gap-1 mb-1">
              <div className="w-20 flex-shrink-0 text-[10px] font-semibold text-muted-foreground text-right pr-2">{row.likelihood} Likelihood</div>
              {row.cells.map(cell => (
                <div key={cell.impact}
                  className={cn("w-24 h-12 rounded-lg flex items-center justify-center text-sm font-bold border border-border/20 transition-colors", heatmapCellClass(row.likelihood, cell.impact))}
                >
                  {cell.count > 0 ? cell.count : <span className="text-[10px] opacity-40">—</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Rating:</span>
        {["All", "High", "Med", "Low"].map(r => (
          <button key={r} onClick={() => setRatingFilter(r)}
            className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
              ratingFilter === r ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border hover:text-foreground")}>
            {r === "All" ? "All Ratings" : r}
          </button>
        ))}
        <span className="text-border ml-1">|</span>
        <span className="text-xs text-muted-foreground ml-1">Status:</span>
        {["All", "Open", "Mitigating", "Closed"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn("px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
              statusFilter === s ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border hover:text-foreground")}>
            {s}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} of {risks.length}</span>
      </div>

      {/* Risk table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Risk</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-24">Category</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-20">Likelihood</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-16">Impact</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-16">Rating</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Mitigation Action</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-32">Owner</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No risks match the current filters.</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id} className={cn("border-b border-border/30 hover:bg-muted/20 transition-colors", i % 2 === 0 ? "bg-background" : "bg-muted/5")}>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-sm leading-tight">{r.title}</p>
                    {r.notes && <p className="text-muted-foreground mt-0.5 text-[10px] italic">{r.notes}</p>}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px]", RISK_RATING_STYLE[r.likelihood] ?? "")}>{r.likelihood}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px]", RISK_RATING_STYLE[r.impact] ?? "")}>{r.impact}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px]", RISK_RATING_STYLE[r.rating] ?? "")}>{r.rating}</span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground leading-snug">{r.mitigationAction}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-[10px]">{r.owner}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className={cn("text-[10px]", RISK_STATUS_STYLE[r.status] ?? "")}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type GovSectionKey = "timeline" | "requirements" | "risks";

const GOV_NAV: { key: GovSectionKey; label: string; shortLabel: string }[] = [
  { key: "timeline",     label: "Timeline & Deliverables",   shortLabel: "Timeline"     },
  { key: "requirements", label: "Requirements for Horizon",  shortLabel: "Requirements" },
  { key: "risks",        label: "Risks & Mitigation",        shortLabel: "Risks"        },
];

export default function DigitalRoadmap() {
  const [activeSection, setActiveSection] = useState<SectionKey>("transformation");
  const [govSection, setGovSection] = useState<GovSectionKey | null>(null);
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

  const sectionInitiatives = useMemo(
    () => initiatives.filter(i => i.initiativeType === currentSection.initiativeType),
    [initiatives, currentSection.initiativeType]
  );

  const handleExportCSV = useCallback((scope: "all" | "section") => {
    const data = scope === "all" ? initiatives : sectionInitiatives;
    const label = scope === "all" ? "all" : currentSection.shortLabel.toLowerCase().replace(/\s+/g, "-");
    exportToCSV(data, `horizon-roadmap-${label}-${new Date().toISOString().slice(0, 10)}.csv`);
  }, [initiatives, sectionInitiatives, currentSection.shortLabel]);

  const handleExportXLSX = useCallback((scope: "all" | "section") => {
    const data = scope === "all" ? initiatives : sectionInitiatives;
    const label = scope === "all" ? "all" : currentSection.shortLabel.toLowerCase().replace(/\s+/g, "-");
    exportToXLSX(data, `horizon-roadmap-${label}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [initiatives, sectionInitiatives, currentSection.shortLabel]);

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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transformation Roadmap</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            3-year IBM &amp; Horizon BCBS strategic initiative portfolio — organized by type, domain, and delivery phase
          </p>
          <div className="flex items-center gap-2 mt-2">
            <LastRefresh datasetKey="transformation-roadmap" variant="compact" />
            <HelpHint
              title="Transformation Roadmap"
              description="Initiative portfolio across all transformation streams — type, domain, phase, status, and risk. Drives all roadmap views and the alerts feed."
              tables={["roadmap_initiatives", "roadmap_summary", "roadmap_alerts"]}
              datasetKey="transformation-roadmap"
              adminAction="Upload the Transformation Roadmap workbook to refresh the entire portfolio in one shot."
            />
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {summary && (
            <div className="flex items-center gap-4 text-sm">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-9">
                <Download className="w-3.5 h-3.5" />
                Export
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Current Section — {currentSection.label}
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExportCSV("section")} className="gap-2 cursor-pointer">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportXLSX("section")} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Export as Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Full Portfolio ({initiatives.length} initiatives)
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExportCSV("all")} className="gap-2 cursor-pointer">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Export all as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportXLSX("all")} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Export all as Excel (.xlsx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Alerts */}
      <AlertsPanel alerts={alerts} onDismiss={id => setDismissedAlerts(s => new Set([...s, id]))} />

      {/* Governance link-nav */}
      <div className="flex items-center gap-1 border border-border rounded-lg px-3 py-2 bg-muted/20">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mr-2 flex-shrink-0">Governance</span>
        {GOV_NAV.map(nav => (
          <button
            key={nav.key}
            onClick={() => setGovSection(prev => prev === nav.key ? null : nav.key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
              govSection === nav.key
                ? "bg-foreground text-background border-foreground shadow-sm"
                : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/40"
            )}
          >
            {nav.label}
          </button>
        ))}
        {govSection && (
          <button
            onClick={() => setGovSection(null)}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            <X className="h-3 w-3" />
            Back to Initiatives
          </button>
        )}
      </div>

      {/* Governance sections — swap in when a gov link is active */}
      {govSection === "timeline" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-500" />
            <h2 className="text-base font-semibold">Timeline &amp; Deliverables</h2>
            <span className="text-xs text-muted-foreground">— Key milestones and delivery commitments by phase</span>
          </div>
          <TimelineDeliverablesSection />
        </div>
      )}

      {govSection === "requirements" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-violet-500" />
            <h2 className="text-base font-semibold">Requirements for Horizon</h2>
            <span className="text-xs text-muted-foreground">— Decisions, approvals, and resources Horizon must provide to unblock IBM delivery</span>
          </div>
          <RequirementsSection />
        </div>
      )}

      {govSection === "risks" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <h2 className="text-base font-semibold">Risks &amp; Mitigation</h2>
            <span className="text-xs text-muted-foreground">— Active transformation risk register with mitigation actions and heatmap</span>
          </div>
          <RisksMitigationSection />
        </div>
      )}

      {/* Section tabs — hidden when a governance section is active */}
      {!govSection && (
        <>
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
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={cn("text-sm font-semibold leading-snug", activeSection === sec.key ? sec.color : "text-foreground")}>
                      {sec.label}
                    </p>
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase leading-none",
                      sec.tierBadge
                    )}>
                      {sec.tier === "STRATEGIC" ? <Target className="h-2.5 w-2.5" /> : <Wrench className="h-2.5 w-2.5" />}
                      {sec.tier}
                    </span>
                  </div>
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
        </>
      )}
    </div>
  );
}
