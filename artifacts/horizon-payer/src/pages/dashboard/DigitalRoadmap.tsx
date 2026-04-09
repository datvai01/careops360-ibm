import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetRoadmapInitiatives,
  useGetRoadmapSummary,
  useGetRoadmapAlerts,
  useCreateRoadmapInitiative,
  type RoadmapInitiative,
  type RoadmapAlert,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  X,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  BarChart3,
  Plus,
  AlertCircle,
  Bell,
} from "lucide-react";

const TYPE_BAR_COLORS: Record<string, string> = {
  Upgrade: "bg-blue-500",
  "Ticket Reduction": "bg-emerald-500",
  Transformation: "bg-purple-500",
};
const TYPE_TEXT_COLORS: Record<string, string> = {
  Upgrade: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800",
  "Ticket Reduction": "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800",
  Transformation: "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950 dark:border-purple-800",
};
const STATUS_COLORS: Record<string, string> = {
  Active: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950 dark:border-blue-800",
  Planned: "text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700",
  Completed: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950 dark:border-emerald-800",
  "At Risk": "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800",
};
const PRIORITY_COLORS: Record<string, string> = {
  High: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800",
  Medium: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-800",
  Low: "text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700",
};

const PORTFOLIOS = ["All", "IT Infrastructure", "Enrollment & Eligibility", "Claims Processing", "Finance & Billing", "Member Services", "Clinical Management", "Analytics & Reporting"];
const TYPES = ["All", "Upgrade", "Ticket Reduction", "Transformation"];
const STATUSES = ["All", "Active", "Planned", "Completed", "At Risk"];
const PRIORITIES = ["All", "High", "Medium", "Low"];
const CATEGORIES = ["All", "Application Modernization", "Automation", "Quality Improvement", "Platform Upgrade", "Operational Efficiency", "Infrastructure", "Data & Analytics"];
const QUARTERS = ["All", "Q1", "Q2", "Q3", "Q4"];

const YEAR_START = new Date("2026-01-01").getTime();
const YEAR_END = new Date("2026-12-31").getTime();
const YEAR_MS = YEAR_END - YEAR_START;

function getBarStyle(startDate: string, endDate: string) {
  const s = Math.max(new Date(startDate).getTime(), YEAR_START);
  const e = Math.min(new Date(endDate).getTime(), YEAR_END);
  const left = ((s - YEAR_START) / YEAR_MS) * 100;
  const width = Math.max(((e - s) / YEAR_MS) * 100, 1.5);
  return { left: `${left.toFixed(2)}%`, width: `${width.toFixed(2)}%` };
}

function initiativeInQuarter(init: RoadmapInitiative, quarter: string): boolean {
  if (quarter === "All") return true;
  const qStart: Record<string, Date> = { Q1: new Date("2026-01-01"), Q2: new Date("2026-04-01"), Q3: new Date("2026-07-01"), Q4: new Date("2026-10-01") };
  const qEnd: Record<string, Date> = { Q1: new Date("2026-03-31"), Q2: new Date("2026-06-30"), Q3: new Date("2026-09-30"), Q4: new Date("2026-12-31") };
  const s = new Date(init.startDate);
  const e = new Date(init.endDate);
  return s <= qEnd[quarter] && e >= qStart[quarter];
}

function SmallBadge({ label, className }: { label: string; className: string }) {
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", className)}>{label}</span>;
}

function SelectFilter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="text-sm rounded-md border border-border bg-background px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-400",
};
const SEVERITY_LABEL_COLORS: Record<string, string> = {
  critical: "text-red-700 dark:text-red-400",
  high: "text-orange-700 dark:text-orange-400",
  medium: "text-amber-700 dark:text-amber-400",
};

function AlertsTable({ alerts, onDismiss }: { alerts: RoadmapAlert[]; onDismiss: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  if (alerts.length === 0) return null;

  const critical = alerts.filter(a => a.severity === "critical").length;
  const high = alerts.filter(a => a.severity === "high").length;
  const sorted = [...alerts].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2 };
    return (order[a.severity as keyof typeof order] ?? 3) - (order[b.severity as keyof typeof order] ?? 3);
  });

  return (
    <Card className={cn("overflow-hidden transition-colors", critical > 0 ? "border-red-200 dark:border-red-800" : "border-amber-200 dark:border-amber-800")}>
      {/* Collapsed header — always visible, single row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors text-left"
        aria-expanded={open}
      >
        <Bell className={cn("h-3.5 w-3.5 flex-shrink-0", critical > 0 ? "text-red-500" : "text-amber-500")} />
        <span className="text-xs font-semibold text-foreground">
          {alerts.length} Risk &amp; Delay Alert{alerts.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2 ml-1">
          {critical > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              {critical} critical
            </span>
          )}
          {high > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 dark:text-orange-400">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
              {high} high
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground ml-auto mr-1">
          {open ? "Collapse" : "Expand"}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>

      {/* Expanded table */}
      {open && (
        <div className="border-t border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-1.5 px-3 w-20">Sev</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-1.5 px-3 w-24">Work #</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-1.5 px-3">Application</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-1.5 px-3 w-32">Alert Type</th>
                <th className="text-left font-semibold uppercase tracking-wide text-muted-foreground py-1.5 px-3">Details</th>
                <th className="w-8 py-1.5 px-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((alert, i) => (
                <tr key={alert.id} className={cn("border-b border-border/50 hover:bg-muted/30 transition-colors", i % 2 !== 0 && "bg-muted/10")}>
                  <td className="py-1.5 px-3 whitespace-nowrap">
                    <span className={cn("inline-flex items-center gap-1 font-medium capitalize", SEVERITY_LABEL_COLORS[alert.severity])}>
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", SEVERITY_DOT[alert.severity])} />
                      {alert.severity}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 font-mono text-muted-foreground whitespace-nowrap">{alert.workNumber ?? "—"}</td>
                  <td className="py-1.5 px-3 font-medium max-w-[200px] truncate">{alert.application ?? alert.title}</td>
                  <td className="py-1.5 px-3 whitespace-nowrap text-muted-foreground">{alert.alertType ?? "Risk Flag"}</td>
                  <td className="py-1.5 px-3 text-muted-foreground max-w-xs truncate" title={alert.message}>{alert.message}</td>
                  <td className="py-1.5 px-3">
                    <button onClick={() => onDismiss(alert.id)} className="opacity-40 hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
                      <X className="h-3 w-3" />
                    </button>
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

function DetailPanel({ initiative, onClose }: { initiative: RoadmapInitiative; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
      <div className="relative w-full max-w-lg bg-background border-l border-border shadow-2xl flex flex-col h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 border-b border-border sticky top-0 bg-background z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">{initiative.workNumber}</span>
              <SmallBadge label={initiative.initiativeType} className={TYPE_TEXT_COLORS[initiative.initiativeType] ?? ""} />
            </div>
            <h2 className="text-base font-semibold leading-snug">{initiative.application}</h2>
            <p className="text-sm text-muted-foreground">{initiative.product} · {initiative.portfolio}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors ml-4 flex-shrink-0"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-5 flex-1">
          <div className="flex gap-2 flex-wrap">
            <SmallBadge label={initiative.status} className={STATUS_COLORS[initiative.status] ?? ""} />
            <SmallBadge label={`Priority: ${initiative.priority}`} className={PRIORITY_COLORS[initiative.priority] ?? ""} />
            {initiative.daysOverdue != null && initiative.daysOverdue > 0 && (
              <SmallBadge label={`Overdue ${initiative.daysOverdue}d`} className="text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800" />
            )}
            {initiative.daysUntilEnd != null && initiative.daysUntilEnd <= 30 && initiative.daysUntilEnd > 0 && (
              <SmallBadge label={`Ends in ${initiative.daysUntilEnd}d`} className="text-amber-700 bg-amber-50 border-amber-200" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Description</p>
            <p className="text-sm leading-relaxed">{initiative.description}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Expected Outcome</p>
            <p className="text-sm leading-relaxed">{initiative.expectedOutcome}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {([
              ["Service Category", initiative.serviceCategory],
              ["Technology", initiative.technology],
              ["Current Version", initiative.currentVersion || "—"],
              ["Upgrade Version", initiative.upgradeVersion || "—"],
              ["Start Date", initiative.startDate],
              ["End Date", initiative.endDate],
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
        </div>
      </div>
    </div>
  );
}

function GanttChart({ initiatives, onSelect }: { initiatives: RoadmapInitiative[]; onSelect: (i: RoadmapInitiative) => void }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 800 }}>
        <div className="relative flex border-b border-border mb-1">
          {[{ q: "Q1 · Jan – Mar" }, { q: "Q2 · Apr – Jun" }, { q: "Q3 · Jul – Sep" }, { q: "Q4 · Oct – Dec" }].map((item, i) => (
            <div key={item.q} className={cn("flex-1 text-center text-xs font-medium py-2 text-muted-foreground", i < 3 && "border-r border-border")}>{item.q}</div>
          ))}
        </div>
        <div className="space-y-1">
          {initiatives.map(init => {
            const bar = getBarStyle(init.startDate, init.endDate);
            const isHovered = hoveredId === init.id;
            return (
              <div key={init.id} className="relative h-9 flex items-center cursor-pointer group" onClick={() => onSelect(init)} onMouseEnter={() => setHoveredId(init.id)} onMouseLeave={() => setHoveredId(null)}>
                {[25, 50, 75].map(pct => (
                  <div key={pct} className="absolute top-0 bottom-0 border-l border-border/40" style={{ left: `${pct}%` }} />
                ))}
                <div
                  className={cn(
                    "absolute rounded-md h-6 transition-all duration-150 flex items-center px-2 overflow-hidden",
                    TYPE_BAR_COLORS[init.initiativeType] ?? "bg-slate-400",
                    isHovered ? "opacity-100 shadow-md ring-2 ring-white/30" : "opacity-75",
                    init.status === "Completed" && "opacity-40",
                    init.status === "At Risk" && "ring-2 ring-red-400"
                  )}
                  style={{ left: bar.left, width: bar.width }}
                >
                  <span className="text-white text-xs font-medium truncate whitespace-nowrap">{init.workNumber}</span>
                </div>
                {isHovered && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20 pointer-events-none">
                    <div className="bg-popover border border-border rounded-lg shadow-xl p-3 w-72 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">{init.workNumber}</span>
                        <SmallBadge label={init.initiativeType} className={TYPE_TEXT_COLORS[init.initiativeType] ?? ""} />
                      </div>
                      <p className="font-semibold text-xs mb-1">{init.application}</p>
                      <p className="text-xs text-muted-foreground mb-2">{init.description.slice(0, 100)}…</p>
                      <div className="flex gap-1.5 flex-wrap">
                        <SmallBadge label={init.status} className={STATUS_COLORS[init.status] ?? ""} />
                        <SmallBadge label={init.priority} className={PRIORITY_COLORS[init.priority] ?? ""} />
                        {init.daysOverdue != null && init.daysOverdue > 0 && <SmallBadge label={`Overdue ${init.daysOverdue}d`} className="text-red-700 bg-red-50 border-red-200" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{init.startDate} → {init.endDate}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-6 pt-4 mt-2 border-t border-border flex-wrap">
          {Object.entries(TYPE_BAR_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded-sm", color)} />
              <span className="text-xs text-muted-foreground">{type}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-4">
            <div className="w-3 h-3 rounded-sm bg-slate-400 ring-2 ring-red-400" />
            <span className="text-xs text-muted-foreground">At Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InitiativesTable({ initiatives, onSelect }: { initiatives: RoadmapInitiative[]; onSelect: (i: RoadmapInitiative) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {["Work #", "Portfolio", "Application", "Type", "Technology", "Dates", "Status", "Priority", ""].map(h => (
              <th key={h} className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-2.5 px-3 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {initiatives.map((init, i) => (
            <tr key={init.id} onClick={() => onSelect(init)} className={cn("border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors", i % 2 !== 0 && "bg-muted/20")}>
              <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{init.workNumber}</td>
              <td className="py-2.5 px-3 whitespace-nowrap max-w-[140px] truncate text-xs">{init.portfolio}</td>
              <td className="py-2.5 px-3 max-w-[180px]">
                <div className="font-medium text-xs truncate">{init.application}</div>
                <div className="text-xs text-muted-foreground truncate">{init.product}</div>
              </td>
              <td className="py-2.5 px-3 whitespace-nowrap"><SmallBadge label={init.initiativeType} className={TYPE_TEXT_COLORS[init.initiativeType] ?? ""} /></td>
              <td className="py-2.5 px-3 text-xs text-muted-foreground whitespace-nowrap max-w-[120px] truncate">{init.technology}</td>
              <td className="py-2.5 px-3 text-xs text-muted-foreground whitespace-nowrap">
                <div>{init.startDate}</div>
                <div>{init.endDate}</div>
                {init.daysOverdue != null && init.daysOverdue > 0 && (
                  <div className="text-red-600 font-medium">Overdue {init.daysOverdue}d</div>
                )}
              </td>
              <td className="py-2.5 px-3 whitespace-nowrap"><SmallBadge label={init.status} className={STATUS_COLORS[init.status] ?? ""} /></td>
              <td className="py-2.5 px-3 whitespace-nowrap"><SmallBadge label={init.priority} className={PRIORITY_COLORS[init.priority] ?? ""} /></td>
              <td className="py-2.5 px-3"><ChevronRight className="h-4 w-4 text-muted-foreground" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {initiatives.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No initiatives match the selected filters.</div>
      )}
    </div>
  );
}

const EMPTY_FORM = {
  portfolio: "", product: "", application: "", initiativeType: "Upgrade",
  description: "", expectedOutcome: "", technology: "", currentVersion: "", upgradeVersion: "",
  workNumber: "", serviceCategory: "Platform Upgrade", startDate: "", endDate: "",
  status: "Planned", priority: "Medium", notes: "",
};

function NewInitiativeModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: typeof EMPTY_FORM) => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(key: keyof typeof EMPTY_FORM, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  }

  function validate() {
    const e: Record<string, string> = {};
    const required = ["portfolio", "product", "application", "description", "expectedOutcome",
      "technology", "workNumber", "serviceCategory", "startDate", "endDate"] as (keyof typeof EMPTY_FORM)[];
    for (const k of required) {
      if (!form[k]) e[k] = "Required";
    }
    if (form.startDate && form.endDate && form.startDate >= form.endDate) {
      e.endDate = "End date must be after start date";
    }
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onCreate(form);
  }

  const fieldClass = (k: string) => cn(
    "text-sm rounded-md border bg-background px-2.5 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500",
    errors[k] ? "border-red-400" : "border-border"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
      <div className="relative w-full max-w-xl bg-background border-l border-border shadow-2xl h-full overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-background z-10">
          <div>
            <h2 className="text-base font-semibold">New Initiative</h2>
            <p className="text-xs text-muted-foreground">Add a new item to the Transition Roadmap</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1">
          {/* Portfolio + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Portfolio *</Label>
              <select value={form.portfolio} onChange={e => set("portfolio", e.target.value)} className={fieldClass("portfolio")}>
                <option value="">Select portfolio…</option>
                {PORTFOLIOS.filter(p => p !== "All").map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.portfolio && <p className="text-xs text-red-500 mt-0.5">{errors.portfolio}</p>}
            </div>
            <div>
              <Label className="text-xs">Initiative Type *</Label>
              <select value={form.initiativeType} onChange={e => set("initiativeType", e.target.value)} className={fieldClass("initiativeType")}>
                {TYPES.filter(t => t !== "All").map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Product + Application */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Product *</Label>
              <Input value={form.product} onChange={e => set("product", e.target.value)} placeholder="e.g. CareRadius" className={cn("text-sm h-8", errors.product && "border-red-400")} />
              {errors.product && <p className="text-xs text-red-500 mt-0.5">{errors.product}</p>}
            </div>
            <div>
              <Label className="text-xs">Application *</Label>
              <Input value={form.application} onChange={e => set("application", e.target.value)} placeholder="Full application name" className={cn("text-sm h-8", errors.application && "border-red-400")} />
              {errors.application && <p className="text-xs text-red-500 mt-0.5">{errors.application}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs">Description *</Label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief description of the initiative scope and approach" rows={3} className={cn(fieldClass("description"), "resize-none")} />
            {errors.description && <p className="text-xs text-red-500 mt-0.5">{errors.description}</p>}
          </div>

          {/* Expected Outcome */}
          <div>
            <Label className="text-xs">Expected Outcome *</Label>
            <textarea value={form.expectedOutcome} onChange={e => set("expectedOutcome", e.target.value)} placeholder="Measurable outcome or benefit expected upon completion" rows={2} className={cn(fieldClass("expectedOutcome"), "resize-none")} />
            {errors.expectedOutcome && <p className="text-xs text-red-500 mt-0.5">{errors.expectedOutcome}</p>}
          </div>

          {/* Technology + Versions */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Label className="text-xs">Technology *</Label>
              <Input value={form.technology} onChange={e => set("technology", e.target.value)} placeholder="e.g. Angular" className={cn("text-sm h-8", errors.technology && "border-red-400")} />
              {errors.technology && <p className="text-xs text-red-500 mt-0.5">{errors.technology}</p>}
            </div>
            <div>
              <Label className="text-xs">Current Version</Label>
              <Input value={form.currentVersion} onChange={e => set("currentVersion", e.target.value)} placeholder="e.g. 12" className="text-sm h-8" />
            </div>
            <div>
              <Label className="text-xs">Upgrade Version</Label>
              <Input value={form.upgradeVersion} onChange={e => set("upgradeVersion", e.target.value)} placeholder="e.g. 17" className="text-sm h-8" />
            </div>
          </div>

          {/* Work Number + Service Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Work Number *</Label>
              <Input value={form.workNumber} onChange={e => set("workNumber", e.target.value)} placeholder="e.g. WO-1050" className={cn("text-sm h-8 font-mono", errors.workNumber && "border-red-400")} />
              {errors.workNumber && <p className="text-xs text-red-500 mt-0.5">{errors.workNumber}</p>}
            </div>
            <div>
              <Label className="text-xs">Service Category *</Label>
              <select value={form.serviceCategory} onChange={e => set("serviceCategory", e.target.value)} className={fieldClass("serviceCategory")}>
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Start Date *</Label>
              <Input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} className={cn("text-sm h-8", errors.startDate && "border-red-400")} />
              {errors.startDate && <p className="text-xs text-red-500 mt-0.5">{errors.startDate}</p>}
            </div>
            <div>
              <Label className="text-xs">End Date *</Label>
              <Input type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} className={cn("text-sm h-8", errors.endDate && "border-red-400")} />
              {errors.endDate && <p className="text-xs text-red-500 mt-0.5">{errors.endDate}</p>}
            </div>
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Status *</Label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={fieldClass("status")}>
                {STATUSES.filter(s => s !== "All").map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Priority *</Label>
              <select value={form.priority} onChange={e => set("priority", e.target.value)} className={fieldClass("priority")}>
                {PRIORITIES.filter(p => p !== "All").map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs">Notes</Label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional — current status, blockers, key contacts, etc." rows={2} className={cn(fieldClass("notes"), "resize-none")} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" style={{ backgroundColor: "#0f62fe" }} className="text-white">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Initiative
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DigitalRoadmap() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: initiatives = [], isLoading } = useGetRoadmapInitiatives(undefined, {
    query: { refetchInterval: 30000 },
  });
  const { data: summary } = useGetRoadmapSummary({
    query: { refetchInterval: 30000 },
  });
  const { data: allAlerts = [] } = useGetRoadmapAlerts({
    query: { refetchInterval: 30000 },
  });

  const createMutation = useCreateRoadmapInitiative({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/roadmap"] });
        toast({ title: "Initiative added", description: "The new initiative has been added to the roadmap." });
        setShowModal(false);
      },
      onError: () => {
        toast({ title: "Error creating initiative", description: "A work number conflict may exist, or a required field is missing.", variant: "destructive" });
      },
    },
  });

  const [portfolio, setPortfolio] = useState("All");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [category, setCategory] = useState("All");
  const [quarter, setQuarter] = useState("All");
  const [view, setView] = useState<"timeline" | "table">("timeline");
  const [selected, setSelected] = useState<RoadmapInitiative | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());

  const visibleAlerts = allAlerts.filter(a => !dismissedAlerts.has(a.id));

  function dismissAlert(id: number) {
    setDismissedAlerts(s => new Set(s).add(id));
  }

  const filtered = useMemo(() => {
    return initiatives.filter(i =>
      (portfolio === "All" || i.portfolio === portfolio) &&
      (type === "All" || i.initiativeType === type) &&
      (status === "All" || i.status === status) &&
      (priority === "All" || i.priority === priority) &&
      (category === "All" || i.serviceCategory === category) &&
      initiativeInQuarter(i, quarter)
    );
  }, [initiatives, portfolio, type, status, priority, category, quarter]);

  const hasFilters = [portfolio, type, status, priority, category, quarter].some(v => v !== "All");

  function clearFilters() {
    setPortfolio("All"); setType("All"); setStatus("All");
    setPriority("All"); setCategory("All"); setQuarter("All");
  }

  function handleCreate(form: typeof EMPTY_FORM) {
    createMutation.mutate({ data: form });
  }

  return (
    <div className="p-6 space-y-5 max-w-screen-2xl">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transition Roadmap</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Horizon + IBM · CY2026 · Upgrades, Ticket Reduction &amp; Transformation Initiatives</p>
          <p className="text-xs text-muted-foreground/60 mt-1 italic">
            Disclaimer: This dashboard contains representative initiative data for demonstration and prototype purposes only. It should not be interpreted as a final approved delivery plan, production commitment, or live operational record.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex-shrink-0 text-white" style={{ backgroundColor: "#0f62fe" }}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Initiative
        </Button>
      </div>

      {/* Delay & risk alerts — collapsible table */}
      <AlertsTable alerts={visibleAlerts} onDismiss={dismissAlert} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", value: summary?.total ?? filtered.length, icon: <BarChart3 className="h-4 w-4 text-slate-400" />, cls: "" },
          { label: "Active", value: summary?.active ?? 0, icon: <Activity className="h-4 w-4 text-blue-500" />, cls: "text-blue-700 dark:text-blue-400" },
          { label: "Planned", value: summary?.planned ?? 0, icon: <Clock className="h-4 w-4 text-slate-400" />, cls: "" },
          { label: "Completed", value: summary?.completed ?? 0, icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, cls: "text-emerald-700 dark:text-emerald-400" },
          { label: "At Risk", value: summary?.atRisk ?? 0, icon: <AlertTriangle className="h-4 w-4 text-red-500" />, cls: "text-red-700 dark:text-red-400" },
          { label: "High Priority", value: summary?.highPriority ?? 0, icon: <AlertCircle className="h-4 w-4 text-amber-500" />, cls: "text-amber-700 dark:text-amber-400" },
        ].map(card => (
          <Card key={card.label} className="py-3">
            <CardContent className="px-4 py-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                {card.icon}
              </div>
              <p className={cn("text-2xl font-bold", card.cls)}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <SelectFilter label="Portfolio" value={portfolio} options={PORTFOLIOS} onChange={setPortfolio} />
            <SelectFilter label="Initiative Type" value={type} options={TYPES} onChange={setType} />
            <SelectFilter label="Status" value={status} options={STATUSES} onChange={setStatus} />
            <SelectFilter label="Priority" value={priority} options={PRIORITIES} onChange={setPriority} />
            <SelectFilter label="Service Category" value={category} options={CATEGORIES} onChange={setCategory} />
            <SelectFilter label="Quarter" value={quarter} options={QUARTERS} onChange={setQuarter} />
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-blue-600 dark:text-blue-400 hover:underline self-end pb-1.5">
                Clear filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {isLoading ? "Loading…" : (
                <>{filtered.length} Initiative{filtered.length !== 1 ? "s" : ""}
                  {hasFilters && <span className="text-sm font-normal text-muted-foreground ml-2">(filtered from {initiatives.length} total)</span>}
                </>
              )}
            </CardTitle>
            <div className="flex rounded-lg border border-border overflow-hidden text-sm">
              {(["timeline", "table"] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className={cn("px-4 py-1.5 capitalize transition-colors", view === v ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Loading initiatives from database…</div>
          ) : view === "timeline" ? (
            <GanttChart initiatives={filtered} onSelect={setSelected} />
          ) : (
            <InitiativesTable initiatives={filtered} onSelect={setSelected} />
          )}
        </CardContent>
      </Card>

      {/* IBM footer */}
      <p className="text-xs text-muted-foreground/60 text-center pb-2">
        © 2026 IBM Corporation. All rights reserved. IBM and the IBM logo are trademarks of IBM Corporation, registered in many jurisdictions worldwide.
      </p>

      {/* Detail panel */}
      {selected && <DetailPanel initiative={selected} onClose={() => setSelected(null)} />}

      {/* New initiative modal */}
      {showModal && (
        <NewInitiativeModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
