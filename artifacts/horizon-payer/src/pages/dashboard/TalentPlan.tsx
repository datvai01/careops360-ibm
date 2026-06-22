import { useMemo, useState, useEffect, createContext, useContext, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  ResponsiveContainer,
  Treemap,
} from "recharts";
import {
  Users, MapPin, Briefcase, Code2, Wrench, Brain, ShieldCheck, Activity,
  Building2, Layers, Package, GraduationCap, Sparkles, Workflow,
  CheckCircle2, AlertCircle, Search, Download, ArrowRight,
  Target, Zap, BookOpen, ChevronDown, ChevronRight, Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import talentJson from "@/data/talentPlan.json";

const C = {
  blue: "#0f62fe",
  green: "#24a148",
  teal: "#009d9a",
  purple: "#8a3ffc",
  orange: "#ff832b",
  red: "#da1e28",
  yellow: "#f1c21b",
  gray: "#697077",
};

type Resource = {
  serial: string; name: string; domain: string; portfolio: string;
  product: string; applicationArea: string; typeOfWork: string;
  role: string; location: string;
  current: { techStack: string; futureTech: string; industry: string; agile: string; agentic: string; devsecops: string; aiops: string; };
  plan: { techStack: string; futureTech: string; industry: string; agile: string; agentic: string; devops: string; aiops: string; };
};
type Product = {
  domain: string; portfolio: string; product: string; applicationArea: string;
  currentTech: string; futureTech: string; industry: string;
  agile: string; agentic: string; devsecops: string; aiops: string;
};

const SEED_RESOURCES: Resource[] = (talentJson as { resources: Resource[] }).resources;
const SEED_PRODUCTS: Product[] = (talentJson as { products: Product[] }).products;

interface TalentPlanMeta {
  uploadedAt: string;
  uploadedBy: string;
  sourceFilename: string;
  resourceCount: number;
  productCount: number;
  version: number;
}

const TalentDataContext = createContext<{ resources: Resource[]; products: Product[] }>({
  resources: SEED_RESOURCES,
  products: SEED_PRODUCTS,
});
const useTalentData = () => useContext(TalentDataContext);

/* ─────────────────────── HELPERS ─────────────────────── */

const ROLE_TRANSFORMATION: Record<string, { future: string; color: string; desc: string }> = {
  "Operations Engineer":  { future: "AI-enabled Operations / AIOps Engineer",        color: C.teal,   desc: "Reskill from reactive ticket handling to AIOps-led monitoring, automation, and self-healing." },
  "Developer":            { future: "AI-assisted Product Engineer",                  color: C.blue,   desc: "Adopt GenAI pair-programming, agentic workflows, and product squad ownership." },
  "Technical Lead":       { future: "Product Technical Lead / AI Delivery Lead",     color: C.purple, desc: "Lead AI-augmented squads with focus on agentic delivery and quality engineering." },
  "Project Manager":      { future: "Product Delivery Lead",                         color: C.orange, desc: "Move from project gates to product flow with AI-assisted delivery telemetry." },
  "BSA":                  { future: "Product Analyst / AI Business Analyst",         color: C.green,  desc: "Use GenAI for requirement synthesis, knowledge mapping, and story generation." },
  "DBA":                  { future: "Data Reliability / Platform Operations Engineer", color: C.yellow, desc: "Modern data ops, vector DBs, observability and platform reliability." },
  "Platform Admin/ DBA":  { future: "Data Reliability / Platform Operations Engineer", color: C.yellow, desc: "Infra-as-code, AIOps for DB, automated patch & resilience." },
  "Solution Architect":   { future: "AI Transformation Architect",                   color: C.red,    desc: "Design AI-first reference architectures, agentic patterns, and modernization playbooks." },
};

const SKILL_AREAS = [
  { key: "techStack", label: "Tech Stack", field: "techStack",  currentField: "techStack", desc: "Current production tech stack expertise" },
  { key: "future",    label: "Future Stack", field: "futureTech", currentField: "futureTech", desc: "Future technology stack readiness" },
  { key: "industry",  label: "Industry",   field: "industry",   currentField: "industry",  desc: "Healthcare / Insurance domain training" },
  { key: "agile",     label: "Agile",      field: "agile",      currentField: "agile",     desc: "Agile Explorer / CSM / DASSM" },
  { key: "agentic",   label: "Agentic AI", field: "agentic",    currentField: "agentic",   desc: "GenAI, watsonx, prompt engineering" },
  { key: "devsecops", label: "DevSecOps",  field: "devops",     currentField: "devsecops", desc: "DevSecOps essentials & advanced" },
  { key: "aiops",     label: "AIOps",      field: "aiops",      currentField: "aiops",     desc: "AIOps overview & badges" },
] as const;

function readinessScore(p: { future: string; industry: string; agile: string; agentic: string; devops: string; aiops: string }) {
  let s = 0;
  if (p.future)   s += 20;
  if (p.industry) s += 20;
  if (p.agile)    s += 20;
  if (p.agentic)  s += 20;
  if (p.devops)   s += 10;
  if (p.aiops)    s += 10;
  return s;
}
function readinessTier(s: number): { label: "High" | "Medium" | "Low"; color: string } {
  if (s >= 80) return { label: "High",   color: C.green };
  if (s >= 50) return { label: "Medium", color: C.orange };
  return { label: "Low", color: C.red };
}

function uniq<T>(arr: T[]): T[] { return [...new Set(arr)]; }
function distinct(resources: Resource[], field: keyof Resource): string[] {
  return uniq(resources.map(r => r[field] as string).filter(Boolean)).sort();
}

/* ─────────────────────── KPI TILES ─────────────────────── */

type KpiTileData = {
  label: string;
  value: number;
  icon: typeof Users;
  color: string;
  sub: string;
};

function buildKpiTiles(resources: Resource[]): KpiTileData[] {
  const total = resources.length || 1;
  const countBy = (pred: (r: Resource) => boolean) => resources.filter(pred).length;
  const pct = (n: number) => `${Math.round((n / total) * 100)}% of total workforce`;

  const offshore = countBy(r => r.location === "Offshore");
  const onshore  = countBy(r => r.location === "Onshore");
  const ops      = countBy(r => r.typeOfWork === "Operations Support");
  const project  = countBy(r => r.typeOfWork === "Projects");
  const shared   = countBy(r => r.typeOfWork === "Shared");
  const devs     = countBy(r => r.role === "Developer");
  const opsEng   = countBy(r => r.role === "Operations Engineer");
  const techLead = countBy(r => r.role === "Technical Lead");
  const pm       = countBy(r => r.role === "Project Manager");

  return [
    { label: "Total Resources",       value: resources.length, icon: Users,       color: C.blue,   sub: "Active Horizon delivery team" },
    { label: "Offshore Resources",    value: offshore,         icon: MapPin,      color: C.teal,   sub: pct(offshore) },
    { label: "Onshore Resources",     value: onshore,          icon: Building2,   color: C.purple, sub: pct(onshore) },
    { label: "Operations Support",    value: ops,              icon: Activity,    color: C.orange, sub: "Run-the-business resources" },
    { label: "Project Resources",     value: project,          icon: Briefcase,   color: C.blue,   sub: "Change-the-business resources" },
    { label: "Shared Resources",      value: shared,           icon: Layers,      color: C.green,  sub: "Cross-product enablement" },
    { label: "Developers",            value: devs,             icon: Code2,       color: C.blue,   sub: "Largest role pool" },
    { label: "Operations Engineers",  value: opsEng,           icon: Wrench,      color: C.teal,   sub: "AIOps reskill candidates" },
    { label: "Technical Leads",       value: techLead,         icon: Brain,       color: C.purple, sub: "Product squad lead pool" },
    { label: "Project Managers",      value: pm,               icon: ShieldCheck, color: C.orange, sub: "Product delivery lead pool" },
  ];
}

function KpiTile({ t }: { t: KpiTileData }) {
  const Icon = t.icon;
  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground truncate">{t.label}</div>
          <div className="text-2xl font-bold mt-0.5" style={{ color: t.color }}>{t.value}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{t.sub}</div>
        </div>
        <div className="rounded-md p-1.5 flex-shrink-0" style={{ background: `${t.color}15` }}>
          <Icon size={16} style={{ color: t.color }} />
        </div>
      </div>
    </Card>
  );
}

/* ─────────────────────── PRODUCT TREEMAP (Interactive Drill-Down) ───────────────────────
 *
 * Levels: Domain (0) → Portfolio (1) → Product (2) → Application Area (3) → Resources (4)
 * Click any tile to drill in. Click a breadcrumb to go back. Hover for rich details.
 * "Apply as filter" pushes the current path into the page filter state.
 */

const LEVELS = ["domain", "portfolio", "product", "applicationArea"] as const;
const LEVEL_LABELS = ["Domain", "Portfolio", "Product", "Application Area"];
const LEVEL_FILTER_KEYS: (keyof FilterState)[] = ["domain", "portfolio", "product", "applicationArea"];
const PALETTE = [C.blue, C.teal, C.purple, C.orange, C.green, C.yellow, "#1192e8", "#005d5d", "#9f1853", C.red, C.gray, "#a56eff", "#ee5396"];

type DrillNode = { key: string; label: string; count: number; resources: Resource[]; color: string };

function buildLevel(resources: Resource[], path: string[]): DrillNode[] {
  const level = path.length;
  if (level >= LEVELS.length) return [];
  const field = LEVELS[level];
  const groups: Record<string, Resource[]> = {};
  for (const r of resources) {
    const k = (r[field] as string) || "Unspecified";
    (groups[k] ??= []).push(r);
  }
  return Object.entries(groups)
    .map(([k, rs], i) => ({ key: k, label: k, count: rs.length, resources: rs, color: PALETTE[i % PALETTE.length] }))
    .sort((a, b) => b.count - a.count);
}

type TreemapHandlers = {
  onTileClick: (n: DrillNode) => void;
  onTileHover: (n: DrillNode | null) => void;
};
const TreemapHandlersContext = createContext<TreemapHandlers | null>(null);

function ProductTreemap({
  filtered, filters, setFilters,
}: { filtered: Resource[]; filters: FilterState; setFilters: (f: FilterState) => void }) {
  const [path, setPath] = useState<string[]>([]);
  const [hover, setHover] = useState<DrillNode | null>(null);

  // Apply existing filters as drill path on mount (but no auto-sync after)
  // Filter resources by current drill path
  const scoped = useMemo(() => {
    return filtered.filter(r =>
      path.every((p, i) => (r[LEVELS[i]] as string) === p),
    );
  }, [filtered, path]);

  const nodes = useMemo(() => buildLevel(filtered, path), [filtered, path]);

  // Resources at the deepest reached level — used when drilled all the way in
  const atLeaf = path.length >= LEVELS.length;

  function drillInto(node: DrillNode) {
    if (path.length >= LEVELS.length - 1) return; // stop at applicationArea
    setPath([...path, node.key]);
    setHover(null);
  }
  function jumpTo(idx: number) {
    setPath(path.slice(0, idx));
    setHover(null);
  }
  function applyFilter() {
    const next = { ...filters };
    LEVEL_FILTER_KEYS.forEach((k, i) => { next[k] = path[i] ?? ""; });
    setFilters(next);
  }
  function resetDrill() {
    setPath([]);
    setHover(null);
  }

  const focused = hover ?? (path.length > 0
    ? { key: path[path.length - 1], label: path[path.length - 1], count: scoped.length, resources: scoped, color: C.blue }
    : null);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <Package size={16} style={{ color: C.blue }} /> Product-Based Talent View
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click any tile to drill: Domain &rarr; Portfolio &rarr; Product &rarr; Application Area &mdash; sized by headcount
          </p>
        </div>
        <div className="flex items-center gap-2">
          {path.length > 0 && (
            <Button onClick={applyFilter} size="sm" variant="outline" className="h-7 text-xs gap-1.5">
              <Target size={11} /> Apply as Page Filter
            </Button>
          )}
          {path.length > 0 && (
            <Button onClick={resetDrill} size="sm" variant="ghost" className="h-7 text-xs gap-1.5">
              Reset
            </Button>
          )}
          <Badge variant="outline" className="text-xs">{scoped.length} of {filtered.length}</Badge>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs mb-3 flex-wrap">
        <button onClick={resetDrill} className={cn("px-2 py-1 rounded font-semibold transition-colors", path.length === 0 ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground")}>
          All Domains
        </button>
        {path.map((p, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight size={11} className="text-muted-foreground" />
            <button
              onClick={() => jumpTo(i + 1)}
              className={cn("px-2 py-1 rounded font-semibold transition-colors", i === path.length - 1 ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground")}
              title={`Go back to ${LEVEL_LABELS[i]} level`}
            >
              {p}
            </button>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{LEVEL_LABELS[i]}</span>
          </span>
        ))}
        {path.length < LEVELS.length && (
          <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground/70">
            Showing {nodes.length} {LEVEL_LABELS[path.length]}{nodes.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* Treemap + side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Treemap area */}
        <div className="lg:col-span-2 h-[440px]">
          {atLeaf ? (
            <ResourceList resources={scoped} />
          ) : nodes.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground border rounded-md">
              No resources match the current selection.
            </div>
          ) : (
            <TreemapHandlersContext.Provider
              value={{
                onTileClick: (n: DrillNode) => drillInto(n),
                onTileHover: (n: DrillNode | null) => setHover(n),
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={nodes.map(n => ({ name: n.label, size: n.count, color: n.color, node: n }))}
                  dataKey="size"
                  stroke="#fff"
                  isAnimationActive={false}
                  content={<InteractiveTile />}
                />
              </ResponsiveContainer>
            </TreemapHandlersContext.Provider>
          )}
        </div>

        {/* Detail side panel */}
        <DrillDetailPanel focused={focused} level={path.length} canDrill={!atLeaf && hover !== null} />
      </div>
    </Card>
  );
}

/* Custom interactive treemap tile — pulls handlers from React context to dodge Recharts prop merging */
function InteractiveTile(props: any) {
  const { x, y, width, height, depth, payload, name, color } = props;
  // Recharts spreads each data row's fields directly onto the cloned content
  // element, so the `node` we attached at data time arrives on props.node.
  // Older versions exposed it via `payload.node` — try both.
  const node: DrillNode | undefined = props.node ?? payload?.node;
  const fill = color || node?.color || C.blue;
  const handlers = useContext(TreemapHandlersContext);
  // Recharts calls `content` for every node (root + leaves). At depth 0 the
  // root spans the full chart area; rendering a clickable rect there would
  // block clicks on the leaves below it, so we draw nothing.
  if (depth === 0) return <g />;
  if (depth > 1) return null;

  const showLabel = width > 70 && height > 28;
  const showCount = width > 70 && height > 44;
  const handleEnter = () => { if (node && handlers) handlers.onTileHover(node); };
  const handleLeave = () => { if (handlers) handlers.onTileHover(null); };
  const handleClick = () => { if (node && handlers) handlers.onTileClick(node); };

  return (
    <g style={{ cursor: node ? "pointer" : "default", pointerEvents: "all" }}>
      <rect
        x={x} y={y} width={width} height={height}
        fill={fill}
        fillOpacity={0.88}
        stroke="#fff"
        strokeWidth={2}
        style={{ pointerEvents: "all", cursor: node ? "pointer" : "default" }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={handleClick}
      />
      {showLabel && (
        <text x={x + 8} y={y + 18} fill="#fff" fontSize={12} fontWeight={700} style={{ pointerEvents: "none" }}>
          {String(name).length > Math.floor(width / 7) ? String(name).slice(0, Math.floor(width / 7) - 1) + "…" : name}
        </text>
      )}
      {showCount && node && (
        <text x={x + 8} y={y + 34} fill="#fff" fontSize={10} fontWeight={500} fillOpacity={0.85} style={{ pointerEvents: "none" }}>
          {node.count} resource{node.count === 1 ? "" : "s"}
        </text>
      )}
    </g>
  );
}

/* Side panel describing the focused/hovered node */
function DrillDetailPanel({ focused, level, canDrill }: { focused: DrillNode | null; level: number; canDrill: boolean }) {
  if (!focused) {
    return (
      <div className="rounded-lg border bg-muted/20 p-4 h-[440px] flex flex-col items-center justify-center text-center">
        <Package size={32} className="text-muted-foreground/40 mb-2" />
        <div className="text-sm font-semibold text-muted-foreground">Hover or click any tile</div>
        <div className="text-xs text-muted-foreground/70 mt-1">Drill into the talent map to see role mix, locations, and skill coverage at every level.</div>
      </div>
    );
  }
  const rs = focused.resources;
  const off = rs.filter(r => r.location === "Offshore").length;
  const on  = rs.filter(r => r.location === "Onshore").length;
  const roleCounts: Record<string, number> = {};
  for (const r of rs) roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
  const roles = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]);
  const workCounts: Record<string, number> = {};
  for (const r of rs) workCounts[r.typeOfWork] = (workCounts[r.typeOfWork] || 0) + 1;

  // Skill plan coverage at this scope
  const totalRs = rs.length || 1;
  const skillPct = (field: keyof Resource["plan"]) => {
    const filled = rs.filter(r => {
      const v = r.plan[field] as string;
      return v && v.trim() && v.toLowerCase() !== "na";
    }).length;
    return Math.round((filled / totalRs) * 100);
  };
  const skills = [
    { label: "Industry",     pct: skillPct("industry") },
    { label: "Agile",        pct: skillPct("agile") },
    { label: "Agentic AI",   pct: skillPct("agentic") },
    { label: "DevSecOps",    pct: skillPct("devops") },
    { label: "AIOps",        pct: skillPct("aiops") },
    { label: "Future Stack", pct: skillPct("futureTech") },
  ];

  return (
    <div className="rounded-lg border bg-card p-4 h-[440px] overflow-auto">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">{LEVEL_LABELS[level] ?? "Selection"}</div>
          <div className="text-base font-bold truncate flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded" style={{ background: focused.color }} />
            {focused.label}
          </div>
        </div>
        <Badge style={{ background: focused.color, color: "#fff" }} className="text-xs">{focused.count}</Badge>
      </div>

      {canDrill && (
        <div className="text-[10px] text-primary mb-3 flex items-center gap-1">
          <ArrowRight size={10} /> Click tile to drill into {LEVEL_LABELS[level + 1] ?? "next"}
        </div>
      )}

      {/* Location split */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">Location</div>
        <div className="flex h-5 rounded overflow-hidden border">
          <div className="flex items-center justify-center text-[10px] font-bold text-white" style={{ background: C.teal, width: `${(off/totalRs)*100}%` }} title={`${off} offshore`}>
            {off > 0 && (off/totalRs > 0.12 ? `${off} Off` : "")}
          </div>
          <div className="flex items-center justify-center text-[10px] font-bold text-white" style={{ background: C.purple, width: `${(on/totalRs)*100}%` }} title={`${on} onshore`}>
            {on > 0 && (on/totalRs > 0.12 ? `${on} On` : "")}
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
          <span>{off} offshore ({Math.round((off/totalRs)*100)}%)</span>
          <span>{on} onshore ({Math.round((on/totalRs)*100)}%)</span>
        </div>
      </div>

      {/* Roles */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">Roles ({roles.length})</div>
        <div className="space-y-1">
          {roles.slice(0, 6).map(([role, count]) => (
            <div key={role} className="flex items-center gap-2 text-[11px]">
              <div className="w-28 truncate text-muted-foreground" title={role}>{role}</div>
              <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                <div className="h-full rounded" style={{ width: `${(count/totalRs)*100}%`, background: focused.color, opacity: 0.85 }} />
              </div>
              <div className="w-6 text-right font-semibold tabular-nums">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Type of work */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">Type of Work</div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(workCounts).sort((a,b)=>b[1]-a[1]).map(([w, c]) => (
            <Badge key={w} variant="outline" className="text-[10px] font-normal">{w} &middot; {c}</Badge>
          ))}
        </div>
      </div>

      {/* Skill plan coverage */}
      <div>
        <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">6-Month Plan Coverage</div>
        <div className="grid grid-cols-2 gap-1.5">
          {skills.map(s => {
            const tone = s.pct >= 70 ? C.green : s.pct >= 30 ? C.yellow : C.red;
            return (
              <div key={s.label} className="flex items-center gap-1.5 text-[11px]">
                <div className="w-20 truncate text-muted-foreground">{s.label}</div>
                <div className="flex-1 h-1.5 rounded bg-muted overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${s.pct}%`, background: tone }} />
                </div>
                <div className="w-7 text-right font-bold tabular-nums" style={{ color: tone }}>{s.pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* Resource list shown when fully drilled into Application Area */
function ResourceList({ resources }: { resources: Resource[] }) {
  return (
    <div className="h-full overflow-auto rounded-md border">
      <table className="w-full text-xs">
        <thead className="bg-muted/40 sticky top-0">
          <tr>
            <th className="text-left py-2 px-3 font-semibold">Resource</th>
            <th className="text-left py-2 px-3 font-semibold">Role</th>
            <th className="text-left py-2 px-3 font-semibold">Location</th>
            <th className="text-left py-2 px-3 font-semibold">Type of Work</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r, i) => (
            <tr key={`${r.serial}-${i}`} className="border-t hover:bg-muted/20">
              <td className="py-1.5 px-3 font-medium">{r.name}</td>
              <td className="py-1.5 px-3">{r.role}</td>
              <td className="py-1.5 px-3"><Badge variant="outline" className="text-[10px] font-normal">{r.location}</Badge></td>
              <td className="py-1.5 px-3 text-muted-foreground">{r.typeOfWork}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────── ROLE TRANSFORMATION ─────────────────────── */

function RoleTransformation({ filtered }: { filtered: Resource[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of filtered) counts[r.role] = (counts[r.role] || 0) + 1;
    return Object.entries(counts)
      .map(([role, count]) => ({ role, count, ...(ROLE_TRANSFORMATION[role] ?? { future: "Reskilling Track", color: C.gray, desc: "Custom transformation pathway." }) }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  return (
    <Card className="p-5">
      <div className="mb-3">
        <h3 className="text-base font-bold flex items-center gap-2"><Workflow size={16} style={{ color: C.purple }} /> Role Transformation View</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Current Role &rarr; Future Transformation Focus (6&ndash;12 months)</p>
      </div>
      <div className="space-y-2">
        {data.map(d => (
          <div key={d.role} className="flex items-center gap-3 p-2.5 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors">
            <div className="w-44 flex-shrink-0">
              <div className="text-xs font-semibold">{d.role}</div>
              <div className="text-[10px] text-muted-foreground">{d.count} resource{d.count > 1 ? "s" : ""}</div>
            </div>
            <div className="flex-1 relative h-6 rounded bg-muted overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded flex items-center justify-end pr-2"
                style={{ width: `${Math.min(100, (d.count / Math.max(...data.map(x => x.count))) * 100)}%`, background: d.color, opacity: 0.85 }}
              >
                <span className="text-[10px] font-bold text-white">{d.count}</span>
              </div>
            </div>
            <ArrowRight size={14} className="flex-shrink-0 text-muted-foreground" />
            <div className="w-72 flex-shrink-0">
              <div className="text-xs font-semibold" style={{ color: d.color }}>{d.future}</div>
              <div className="text-[10px] text-muted-foreground line-clamp-2">{d.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─────────────────────── SKILL HEATMAP ─────────────────────── */

function SkillHeatmap({ filtered }: { filtered: Resource[] }) {
  const [view, setView] = useState<"current" | "planned">("current");

  const productsList = useMemo(() => uniq(filtered.map(r => r.product)).filter(Boolean).sort(), [filtered]);
  const matrix = useMemo(() => {
    const isCovered = (r: Resource, area: typeof SKILL_AREAS[number]) => {
      const key = view === "current" ? area.currentField : area.field;
      const bucket = view === "current" ? r.current : r.plan;
      const v = (bucket as any)[key] as string | undefined;
      return !!(v && v.trim() && v.toLowerCase() !== "na");
    };
    return productsList.map(prod => {
      const rs = filtered.filter(r => r.product === prod);
      const cells = SKILL_AREAS.map(area => {
        const untrained = rs.filter(r => !isCovered(r, area));
        const filled = rs.length - untrained.length;
        const pct = rs.length > 0 ? filled / rs.length : 0;
        return {
          area: area.label,
          field: area.field,
          pct,
          filled,
          total: rs.length,
          untrained,
        };
      });
      return { product: prod, headcount: rs.length, cells };
    });
  }, [productsList, filtered, view]);

  const cellColor = (pct: number) => {
    if (pct >= 0.7) return { bg: C.green, fg: "#fff", level: "green" as const };
    if (pct >= 0.3) return { bg: C.yellow, fg: "#1f1f1f", level: "yellow" as const };
    return { bg: C.red, fg: "#fff", level: "red" as const };
  };

  const MAX_NAMES = 12;
  const verbCovered = view === "current" ? "have today" : "have a plan for";
  const verbUntrained = view === "current" ? "Missing today" : "No plan yet";
  const noun = view === "current" ? "current skill" : "planned training";

  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2"><Target size={16} style={{ color: C.green }} /> Skill Readiness Heatmap</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {view === "current"
              ? "% of resources who already have a current skill in each area today, by Product."
              : "% of resources with a future training plan in each area, by Product."}
            {" "}Hover red or yellow cells to see who is missing.
          </p>
        </div>
        <div className="inline-flex rounded-md border border-slate-200 overflow-hidden text-[11px] shrink-0" role="group" aria-label="Heatmap view">
          <button
            type="button"
            onClick={() => setView("current")}
            className={`px-3 py-1.5 font-semibold transition ${view === "current" ? "text-white" : "text-slate-700 bg-white hover:bg-slate-50"}`}
            style={view === "current" ? { background: C.blue } : undefined}
          >
            Current State
          </button>
          <button
            type="button"
            onClick={() => setView("planned")}
            className={`px-3 py-1.5 font-semibold transition border-l border-slate-200 ${view === "planned" ? "text-white" : "text-slate-700 bg-white hover:bg-slate-50"}`}
            style={view === "planned" ? { background: C.blue } : undefined}
          >
            Future Plan
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 font-semibold sticky left-0 bg-background">Product</th>
              <th className="text-center py-2 px-2 font-semibold">Headcount</th>
              {SKILL_AREAS.map(a => (
                <th key={a.key} className="text-center py-2 px-2 font-semibold">{a.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map(row => (
              <tr key={row.product} className="border-b hover:bg-muted/30">
                <td className="py-1.5 px-2 font-medium sticky left-0 bg-background">{row.product}</td>
                <td className="text-center text-muted-foreground">{row.headcount}</td>
                {row.cells.map((c, i) => {
                  const col = cellColor(c.pct);
                  const showDrillDown = col.level !== "green" && c.untrained.length > 0;
                  const visible = c.untrained.slice(0, MAX_NAMES);
                  const overflow = c.untrained.length - visible.length;
                  return (
                    <td key={i} className="px-1 py-1">
                      <TooltipProvider delayDuration={150}><Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="rounded text-[10px] font-bold flex items-center justify-center cursor-default"
                            style={{ background: col.bg, color: col.fg, height: 22 }}
                          >
                            {Math.round(c.pct * 100)}%
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="center"
                          className="text-xs max-w-sm p-0 leading-relaxed bg-white text-slate-900 border border-slate-200 shadow-lg rounded-md overflow-hidden"
                        >
                          <div
                            className="px-3 py-2 border-b border-slate-200"
                            style={{ background: "#f4f6fa" }}
                          >
                            <div className="font-semibold text-slate-900">
                              {row.product} <span className="text-slate-400">·</span> {c.area}
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              {c.filled} of {c.total} {verbCovered} {c.area} ({Math.round(c.pct * 100)}%)
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 leading-snug">
                              <span className="font-mono">
                                {Math.round(c.pct * 100)}% = {c.filled} ÷ {c.total} × 100
                              </span>
                              <div className="mt-0.5">
                                <strong>{view === "current" ? "Current State view" : "Future Plan view"}:</strong> a resource counts when their {view === "current" ? "current" : "planned"} {c.area} {noun} field has a real value. Blank or "NA" means a gap.
                              </div>
                            </div>
                          </div>
                          <div className="px-3 py-2">
                            {showDrillDown ? (
                              <>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <span
                                    className="inline-block w-2 h-2 rounded-full"
                                    style={{ background: col.bg }}
                                  />
                                  <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-700">
                                    {verbUntrained} ({c.untrained.length})
                                  </span>
                                </div>
                                <ul className="space-y-0.5 text-[11px] text-slate-800">
                                  {visible.map(r => (
                                    <li key={r.serial} className="flex items-baseline gap-1.5">
                                      <span className="font-medium">{r.name}</span>
                                      <span className="text-slate-500">
                                        · {r.role} · {r.location}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                                {overflow > 0 && (
                                  <div className="text-[10px] text-slate-500 mt-1.5">
                                    +{overflow} more — see Resource Detail Table
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-[11px] text-slate-600">
                                All resources have a plan for this area.
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip></TooltipProvider>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: C.green }} />&ge; 70% planned</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: C.yellow }} />30&ndash;70% planned</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: C.red }} />&lt; 30% planned</span>
      </div>
    </Card>
  );
}

/* ─────────────────────── 6-MONTH ROADMAP ─────────────────────── */

const PHASES = [
  {
    phase: "Phase 1", title: "Foundation", months: "Months 0\u20132", color: C.blue, icon: BookOpen,
    items: [
      "Horizon mandatory training",
      "Healthcare industry badge / Healthcare Jumpstart",
      "Agile basics / IBM Agile Explorer",
      "Product and application familiarization",
    ],
  },
  {
    phase: "Phase 2", title: "AI + Automation Enablement", months: "Months 2\u20134", color: C.purple, icon: Brain,
    items: [
      "IBM Generative & Agentic AI Foundation",
      "watsonx Essentials",
      "Prompt Engineering",
      "DevSecOps Essentials",
      "AIOps Overview",
    ],
  },
  {
    phase: "Phase 3", title: "Product Operations Readiness", months: "Months 4\u20136", color: C.green, icon: Zap,
    items: [
      "Apply AIOps to incident / ticket analysis",
      "Use GenAI for documentation, knowledge search, and root cause analysis",
      "Build product-level knowledge maps",
      "Identify automation opportunities by application area",
      "Prepare resources for AI-enabled product operations model",
    ],
  },
];

function SixMonthRoadmap() {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold flex items-center gap-2"><GraduationCap size={16} style={{ color: C.teal }} /> Six-Month Upskilling Roadmap</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Three sequenced phases bringing the workforce to AI-led product operations readiness</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PHASES.map(p => {
          const Icon = p.icon;
          return (
            <div key={p.phase} className="rounded-lg border p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: p.color }} />
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-md p-1.5" style={{ background: `${p.color}18` }}>
                  <Icon size={14} style={{ color: p.color }} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wide font-bold" style={{ color: p.color }}>{p.phase}</div>
                  <div className="text-sm font-bold">{p.title}</div>
                  <div className="text-[10px] text-muted-foreground">{p.months}</div>
                </div>
              </div>
              <ul className="space-y-1.5 mt-3">
                {p.items.map((it, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs">
                    <CheckCircle2 size={11} className="mt-0.5 flex-shrink-0" style={{ color: p.color }} />
                    <span className="text-muted-foreground">{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ─────────────────────── PRODUCT READINESS CARDS ─────────────────────── */

function ProductReadinessCards({ filtered }: { filtered: Resource[] }) {
  const productData = useMemo(() => {
    const byProduct: Record<string, Resource[]> = {};
    for (const r of filtered) {
      if (!r.product) continue;
      (byProduct[r.product] ??= []).push(r);
    }
    return Object.entries(byProduct).map(([product, rs]) => {
      const off = rs.filter(r => r.location === "Offshore").length;
      const on = rs.filter(r => r.location === "Onshore").length;
      const roleCounts: Record<string, number> = {};
      for (const r of rs) roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      const primaryRoles = Object.entries(roleCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
      // readiness based on the average plan completeness across resources
      const avgScore = Math.round(rs.reduce((acc, r) => acc + readinessScore({
        future: r.plan.futureTech, industry: r.plan.industry, agile: r.plan.agile,
        agentic: r.plan.agentic, devops: r.plan.devops, aiops: r.plan.aiops,
      }), 0) / rs.length);
      const tier = readinessTier(avgScore);
      const techs = uniq(rs.flatMap(r => r.current.techStack.split(/[,;]/).map(s => s.trim()).filter(Boolean))).slice(0, 5);
      const futures = uniq(rs.flatMap(r => r.plan.futureTech.split(/[,;]/).map(s => s.trim()).filter(Boolean).filter(t => t.toLowerCase() !== "na"))).slice(0, 4);
      return { product, count: rs.length, off, on, primaryRoles, score: avgScore, tier, techs, futures };
    }).sort((a, b) => b.count - a.count);
  }, [filtered]);

  return (
    <Card className="p-5">
      <div className="mb-3">
        <h3 className="text-base font-bold flex items-center gap-2"><Package size={16} style={{ color: C.orange }} /> Product Readiness Cards</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Per-product transformation readiness based on planned skill coverage</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {productData.map(p => (
          <div key={p.product} className="rounded-lg border p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <div className="text-sm font-bold truncate">{p.product}</div>
                <div className="text-[10px] text-muted-foreground">{p.count} resources &middot; {p.on} onshore / {p.off} offshore</div>
              </div>
              <Badge style={{ background: p.tier.color, color: "#fff" }} className="text-[10px]">{p.tier.label} &middot; {p.score}</Badge>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Primary Roles</div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {p.primaryRoles.map(([r, c]) => (
                    <Badge key={r} variant="outline" className="text-[10px] font-normal">{r} &middot; {c}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Current Tech</div>
                <div className="text-[11px] text-muted-foreground line-clamp-2">{p.techs.join(", ") || "\u2014"}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Future Direction</div>
                <div className="text-[11px] text-muted-foreground line-clamp-2">{p.futures.length ? p.futures.join(", ") : "Sustain current stack"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─────────────────────── RESOURCE TABLE ─────────────────────── */

function ResourceTable({ filtered }: { filtered: Resource[] }) {
  const { resources: RESOURCES } = useTalentData();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let data = filtered;
    if (q) {
      data = data.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q) ||
        r.applicationArea.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.portfolio.toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    return [...data].sort((a, b) => ((a as any)[sortKey] ?? "").toString().localeCompare(((b as any)[sortKey] ?? "").toString()) * dir);
  }, [filtered, search, sortKey, sortDir]);

  function toggleSort(k: string) {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  }

  function exportCsv() {
    const headers = [
      "Resource Name","Domain","Portfolio","Product","Application Area","Type of Work","Role","Location",
      "Current Tech Stack","Future Tech Stack",
      "Current AI/Agentic Training","Planned AI/Agentic Training",
      "Planned DevSecOps","Planned AIOps","Planned Industry","Planned Agile",
    ];
    const escape = (v: string) => `"${(v ?? "").toString().replace(/"/g, '""')}"`;
    const lines = [headers.map(escape).join(",")];
    for (const r of rows) {
      lines.push([
        r.name, r.domain, r.portfolio, r.product, r.applicationArea, r.typeOfWork, r.role, r.location,
        r.current.techStack, r.plan.futureTech,
        r.current.agentic, r.plan.agentic,
        r.plan.devops, r.plan.aiops, r.plan.industry, r.plan.agile,
      ].map(escape).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `horizon-talent-plan-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const cols: { key: string; label: string }[] = [
    { key: "name", label: "Resource" },
    { key: "domain", label: "Domain" },
    { key: "portfolio", label: "Portfolio" },
    { key: "product", label: "Product" },
    { key: "applicationArea", label: "App Area" },
    { key: "role", label: "Role" },
    { key: "location", label: "Location" },
    { key: "typeOfWork", label: "Work Type" },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2"><Users size={16} style={{ color: C.blue }} /> Resource Detail Table</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{rows.length} of {RESOURCES.length} resources &middot; click a row to expand training plan</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search resource, product, role..."
              className="pl-7 h-8 text-xs w-64"
            />
          </div>
          <Button onClick={exportCsv} variant="outline" size="sm" className="gap-1.5 text-xs h-8">
            <Download size={12} /> CSV
          </Button>
        </div>
      </div>
      <div className="border rounded-md overflow-hidden">
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-6"></TableHead>
                {cols.map(c => (
                  <TableHead key={c.key} className="text-xs font-bold cursor-pointer select-none" onClick={() => toggleSort(c.key)}>
                    {c.label}{sortKey === c.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => {
                const rowKey = `${r.serial}-${i}`;
                return (
                  <Row key={rowKey} r={r} expanded={expanded === rowKey} onToggle={() => setExpanded(expanded === rowKey ? null : rowKey)} />
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}

function Row({ r, expanded, onToggle }: { r: Resource; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onToggle}>
        <TableCell className="py-2">
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </TableCell>
        <TableCell className="text-xs py-2 font-medium">{r.name}</TableCell>
        <TableCell className="text-xs py-2">{r.domain}</TableCell>
        <TableCell className="text-xs py-2">{r.portfolio}</TableCell>
        <TableCell className="text-xs py-2">{r.product}</TableCell>
        <TableCell className="text-xs py-2">{r.applicationArea}</TableCell>
        <TableCell className="text-xs py-2">{r.role}</TableCell>
        <TableCell className="text-xs py-2">
          <Badge variant="outline" className="text-[10px] font-normal">{r.location}</Badge>
        </TableCell>
        <TableCell className="text-xs py-2">{r.typeOfWork}</TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="bg-muted/20">
          <TableCell></TableCell>
          <TableCell colSpan={8} className="py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground mb-1">Current Baseline</div>
                <Field label="Tech Stack"     v={r.current.techStack} />
                <Field label="Industry"       v={r.current.industry} />
                <Field label="Agile"          v={r.current.agile} />
                <Field label="Agentic / GenAI" v={r.current.agentic} />
                <Field label="DevSecOps"      v={r.current.devsecops} />
                <Field label="AIOps"          v={r.current.aiops} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground mb-1">6-Month Plan</div>
                <Field label="Future Tech"     v={r.plan.futureTech} accent />
                <Field label="Industry"        v={r.plan.industry} accent />
                <Field label="Agile"           v={r.plan.agile} accent />
                <Field label="Agentic / GenAI" v={r.plan.agentic} accent />
                <Field label="DevSecOps"       v={r.plan.devops} accent />
                <Field label="AIOps"           v={r.plan.aiops} accent />
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function Field({ label, v, accent }: { label: string; v: string; accent?: boolean }) {
  const filled = v && v.trim() && v.toLowerCase() !== "na";
  return (
    <div className="flex gap-2 py-0.5">
      <div className="w-28 flex-shrink-0 text-muted-foreground">{label}:</div>
      <div className={cn("flex-1", accent && filled ? "text-foreground font-medium" : "text-muted-foreground")}>
        {filled ? v : <span className="opacity-60 italic">Not planned</span>}
      </div>
    </div>
  );
}

/* ─────────────────────── TARGET OPERATING MODEL ─────────────────────── */

const TOM_PILLARS = [
  { label: "Product-aligned squads",   icon: Package,    color: C.blue,   desc: "Cross-functional squads owning a product end-to-end with clear application area scope." },
  { label: "AI-assisted engineering",  icon: Sparkles,   color: C.purple, desc: "GenAI pair programming, agentic test/code review, and automated docs accelerate delivery." },
  { label: "AIOps-led operations",     icon: Activity,   color: C.teal,   desc: "Anomaly detection, intelligent triage, automated runbooks reduce MTTR and toil." },
  { label: "DevSecOps automation",     icon: ShieldCheck, color: C.green, desc: "Pipeline-embedded security, policy-as-code, and continuous compliance." },
  { label: "Healthcare domain fluency", icon: Brain,     color: C.orange, desc: "Industry training, FHIR/Interop fluency, and Horizon-specific journeys baked in." },
];

function TargetOperatingModel() {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold flex items-center gap-2"><Workflow size={16} style={{ color: C.blue }} /> Future Product-Based AI Operations Model</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Five capability pillars supporting Horizon&rsquo;s shift from role-based support to product-based ownership</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        {TOM_PILLARS.map(p => {
          const Icon = p.icon;
          return (
            <div key={p.label} className="rounded-lg border p-3" style={{ borderTop: `3px solid ${p.color}` }}>
              <div className="rounded-md p-2 inline-block mb-2" style={{ background: `${p.color}15` }}>
                <Icon size={16} style={{ color: p.color }} />
              </div>
              <div className="text-xs font-bold mb-1">{p.label}</div>
              <div className="text-[11px] text-muted-foreground leading-relaxed">{p.desc}</div>
            </div>
          );
        })}
      </div>
      <div className="rounded-md bg-muted/40 p-3 border-l-4" style={{ borderLeftColor: C.blue }}>
        <p className="text-xs leading-relaxed text-muted-foreground">
          The proposed model moves Horizon from <span className="font-semibold text-foreground">role-based operations support</span> toward
          <span className="font-semibold text-foreground"> product-based ownership</span>, where teams understand the business process, application landscape,
          technology stack, and AI-enabled operations capabilities required to improve speed, quality, and resiliency.
        </p>
      </div>
    </Card>
  );
}

/* ─────────────────────── POD MODEL TRANSFORMATION ─────────────────────── */

type PodRoleSlice = { role: string; count: number; color: string; futureRole: string };
type PodMember = { name: string; role: string; futureRole: string; futureRoleShort: string; color: string; location: string };
type Pod = {
  id: string;
  name: string;
  domain: string;
  portfolio: string;
  product: string;
  headcount: number;
  onshore: number;
  offshore: number;
  roleMix: PodRoleSlice[];
  members: PodMember[];
  skills: string[];
  leadOnshore: PodMember | null;
  leadOffshore: PodMember | null;
};
type RoleBucket = { role: string; count: number; color: string; futureRole: string };

const ROLE_ORDER = [
  "Developer",
  "Operations Engineer",
  "Technical Lead",
  "Project Manager",
  "BSA",
  "DBA",
  "Platform Admin/ DBA",
  "Solution Architect",
];

// Pod sizing — aligns with the slide examples (POD2 = 15, POD3 = 12) but capped at 10 by default
const MAX_POD_SIZE = 10;
const MIN_POD_SIZE = 3;
const LEAD_ROLES = ["Technical Lead", "Project Manager", "Solution Architect"];

function roleMeta(role: string): { color: string; future: string } {
  const m = ROLE_TRANSFORMATION[role];
  if (m) return { color: m.color, future: m.future };
  return { color: C.gray, future: "Reskilling Track" };
}

// Shorter future-role label suited for member chips (matches slide terminology)
function shortFutureRole(role: string): string {
  switch (role) {
    case "Operations Engineer":   return "Support Engineer";
    case "Developer":             return "AI Engineer";
    case "Technical Lead":        return "Tech Lead";
    case "Project Manager":       return "Scrum Master";
    case "BSA":                   return "QA / Analyst";
    case "DBA":
    case "Platform Admin/ DBA":   return "Reliability Engineer";
    case "Solution Architect":    return "Solution Architect";
    default:                       return role || "Pod Member";
  }
}

function bucketByRole(resources: Resource[]): RoleBucket[] {
  const counts: Record<string, number> = {};
  for (const r of resources) {
    const role = r.role || "Unassigned";
    counts[role] = (counts[role] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([role, count]) => {
      const meta = roleMeta(role);
      return { role, count, color: meta.color, futureRole: meta.future };
    })
    .sort((a, b) => {
      const ai = ROLE_ORDER.indexOf(a.role); const bi = ROLE_ORDER.indexOf(b.role);
      if (ai === -1 && bi === -1) return b.count - a.count;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
}

// Split a list into roughly-equal pods of at most maxSize (e.g. 22 → [8, 7, 7])
function chunkResources(rs: Resource[], maxSize: number = MAX_POD_SIZE): Resource[][] {
  if (rs.length === 0) return [];
  if (rs.length <= maxSize) return [rs];
  const podCount = Math.ceil(rs.length / maxSize);
  const baseSize = Math.floor(rs.length / podCount);
  const remainder = rs.length % podCount;
  const chunks: Resource[][] = [];
  let i = 0;
  for (let p = 0; p < podCount; p++) {
    const size = baseSize + (p < remainder ? 1 : 0);
    chunks.push(rs.slice(i, i + size));
    i += size;
  }
  return chunks;
}

function extractPodSkills(rs: Resource[]): string[] {
  const SPLIT = /[,;|/\n]+/;
  const seen = new Map<string, string>(); // lowercased → original casing
  const push = (raw: string) => {
    raw.split(SPLIT)
      .map(s => s.trim())
      .filter(s => s.length >= 2 && s.length <= 32 && s.toLowerCase() !== "na" && s.toLowerCase() !== "n/a")
      .forEach(s => {
        const k = s.toLowerCase();
        if (!seen.has(k)) seen.set(k, s);
      });
  };
  for (const r of rs) {
    push(r.plan.futureTech);
    push(r.plan.techStack);
    push(r.plan.agentic);
    push(r.plan.devops);
    push(r.plan.aiops);
  }
  // Always inject the platform skill set every pod should have
  ["Agentic AI", "DevOps", "AIOps", "Agile", "FHIR"].forEach(s => {
    if (!seen.has(s.toLowerCase())) seen.set(s.toLowerCase(), s);
  });
  return Array.from(seen.values()).slice(0, 10);
}

function pickLead(rs: Resource[], location: "Onshore" | "Offshore"): PodMember | null {
  const inLoc = rs.filter(r => r.location === location);
  const pool = inLoc.length > 0 ? inLoc : rs;
  // prefer LEAD_ROLES in order
  for (const role of LEAD_ROLES) {
    const found = pool.find(r => r.role === role);
    if (found) return toMember(found);
  }
  return pool[0] ? toMember(pool[0]) : null;
}

function toMember(r: Resource): PodMember {
  const meta = roleMeta(r.role);
  return {
    name: r.name,
    role: r.role,
    futureRole: meta.future,
    futureRoleShort: shortFutureRole(r.role),
    color: meta.color,
    location: r.location || "Unknown",
  };
}

function buildPod(id: string, name: string, domain: string, portfolio: string, product: string, rs: Resource[]): Pod {
  const slices: Record<string, PodRoleSlice> = {};
  for (const r of rs) {
    const role = r.role || "Unassigned";
    if (!slices[role]) {
      const meta = roleMeta(role);
      slices[role] = { role, count: 0, color: meta.color, futureRole: meta.future };
    }
    slices[role].count += 1;
  }
  const roleMix = Object.values(slices).sort((a, b) => b.count - a.count);
  const onshore = rs.filter(r => r.location === "Onshore").length;
  const offshore = rs.filter(r => r.location === "Offshore").length;
  const members = rs.map(toMember).sort((a, b) => {
    const ai = ROLE_ORDER.indexOf(a.role); const bi = ROLE_ORDER.indexOf(b.role);
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  return {
    id,
    name,
    domain,
    portfolio,
    product,
    headcount: rs.length,
    onshore,
    offshore,
    roleMix,
    members,
    skills: extractPodSkills(rs),
    leadOnshore: pickLead(rs, "Onshore"),
    leadOffshore: pickLead(rs, "Offshore"),
  };
}

// Group resources by Business Domain and build size-capped pods.
// Each domain's project resources are chunked into ≤MAX_POD_SIZE pods named "${domain} Pod N".
function buildDomainPods(resources: Resource[], idPrefix: string): Pod[] {
  const tree: Record<string, Resource[]> = {};
  for (const r of resources) {
    const d = r.domain || "Cross-Domain";
    (tree[d] ??= []).push(r);
  }

  const pods: Pod[] = [];
  Object.entries(tree)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([domain, rs]) => {
      const chunks = chunkResources(rs);
      chunks.forEach((chunk, idx) => {
        const podN = idx + 1;
        const name = chunks.length > 1 ? `${domain} Pod ${podN}` : `${domain} Pod`;
        pods.push(buildPod(`${idPrefix}-${domain}-${podN}`, name, domain, domain, domain, chunk));
      });
    });

  return pods;
}

const DEFAULT_PILOT_COUNT = 5;

// Domains that represent technical functions, not business delivery domains — excluded from pods.
const EXCLUDED_POD_DOMAINS = new Set(["Data Area", "DataBase Administrator"]);

// Domain-specific accent colors used in the swimlane and pod cards.
const DOMAIN_ACCENT_MAP: Record<string, string> = {
  "Horizontal Functions":     C.blue,
  "Health and Network":       C.teal,
  "Service & Administration": C.purple,
  "Corporate Functions":      C.orange,
  "Specialty Business":       "#059669",
  "Market Facing":            "#dc2626",
};
const getDomainAccent = (domain: string) => DOMAIN_ACCENT_MAP[domain] ?? C.gray;

function buildPodStages(resources: Resource[], pilotSelection?: string[] | null): {
  today: RoleBucket[];
  sixMonth: { pods: Pod[]; remaining: RoleBucket[]; remainingCount: number };
  twelveMonth: { pods: Pod[] };
  totals: { resources: number; projectResources: number };
} {
  const today = bucketByRole(resources);

  // Only "Projects" typeOfWork resources form pods — Operations Support, Shared, and
  // non-business-domain technical groupings are excluded.
  const projectResources = resources.filter(
    r => r.typeOfWork === "Projects" && !EXCLUDED_POD_DOMAINS.has(r.domain ?? "")
  );

  // ── 6-month: pilot pods. Default = top N domains by project headcount; override via pilotSelection.
  const byDomain: Record<string, Resource[]> = {};
  for (const r of projectResources) {
    const key = r.domain || "Cross-Domain";
    (byDomain[key] ??= []).push(r);
  }
  const domainEntries = Object.entries(byDomain).sort((a, b) => b[1].length - a[1].length);

  let pilotDomainNames: Set<string>;
  if (pilotSelection && pilotSelection.length > 0) {
    const available = new Set(domainEntries.map(([d]) => d));
    pilotDomainNames = new Set(pilotSelection.filter(d => available.has(d)));
  } else {
    pilotDomainNames = new Set(domainEntries.slice(0, DEFAULT_PILOT_COUNT).map(([d]) => d));
  }
  const pilotResources = projectResources.filter(r => pilotDomainNames.has(r.domain || "Cross-Domain"));
  const sixMonthPods = buildDomainPods(pilotResources, "6m");
  const remainingResources = projectResources.filter(r => !pilotDomainNames.has(r.domain || "Cross-Domain"));
  const sixMonthRemaining = bucketByRole(remainingResources);

  // ── 12-month: all project resources in pods, grouped by domain
  const twelveMonthPods = buildDomainPods(projectResources, "12m");

  return {
    today,
    sixMonth: { pods: sixMonthPods, remaining: sixMonthRemaining, remainingCount: remainingResources.length },
    twelveMonth: { pods: twelveMonthPods },
    totals: { resources: resources.length, projectResources: projectResources.length },
  };
}

function StageHeader({ phase, title, months, caption, color }: { phase: string; title: string; months: string; caption: string; color: string }) {
  return (
    <div className="rounded-lg border bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: color }} />
      <div className="p-3">
        <div className="text-[10px] uppercase tracking-wide font-bold" style={{ color }}>{phase}</div>
        <div className="text-sm font-bold mt-0.5">{title}</div>
        <div className="text-[10px] text-muted-foreground">{months}</div>
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{caption}</p>
      </div>
    </div>
  );
}

function RoleBucketCard({ b, total }: { b: RoleBucket; total: number }) {
  const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
  return (
    <div className="rounded-md border bg-white p-2.5 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold truncate" title={b.role}>{b.role}</div>
          <div className="text-[10px] text-muted-foreground">{b.count} resource{b.count > 1 ? "s" : ""} · {pct}%</div>
        </div>
        <div className="text-lg font-bold flex-shrink-0" style={{ color: b.color }}>{b.count}</div>
      </div>
      <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: b.color }} />
      </div>
    </div>
  );
}

function PodCard({ pod, accent }: { pod: Pod; accent: string }) {
  const overSize = pod.headcount > MAX_POD_SIZE;
  const topRoles = pod.roleMix.slice(0, 3).map(r => r.futureRole || r.role).filter(Boolean);
  return (
    <div
      className="rounded-md border bg-white hover:shadow-md transition-shadow overflow-hidden"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      {/* Header */}
      <div
        className="px-3 py-2.5 border-b"
        style={{ background: `linear-gradient(135deg, ${accent}14 0%, ${accent}06 100%)` }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold truncate leading-tight" title={pod.name}>{pod.name}</div>
            {topRoles.length > 0 && (
              <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                {topRoles.join(" · ")}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {overSize && (
              <Badge variant="outline" className="text-[9px] h-4 px-1" style={{ borderColor: C.orange, color: C.orange }}>
                oversized
              </Badge>
            )}
            <div
              className="flex items-center justify-center rounded-full text-white text-[11px] font-bold w-7 h-7 flex-shrink-0"
              style={{ background: accent }}
              title={`${pod.headcount} members`}
            >
              {pod.headcount}
            </div>
          </div>
        </div>
        {/* Mini role-mix bar in header */}
        <div className="h-1 w-full rounded-full overflow-hidden flex mt-2 opacity-80">
          {pod.roleMix.map(s => (
            <div
              key={s.role}
              title={`${s.futureRole || s.role} (${s.count})`}
              style={{ width: `${(s.count / pod.headcount) * 100}%`, background: s.color }}
            />
          ))}
        </div>
      </div>

      {/* Body: 3-column meta + members */}
      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-0">
        {/* Left meta column (mimics slide's POD Size / Skills / Leads block) */}
        <div className="p-2.5 space-y-2 sm:border-r bg-muted/20">
          <div>
            <div className="text-[9px] uppercase tracking-wide font-bold text-muted-foreground">POD Size</div>
            <div className="text-sm font-bold leading-tight mt-0.5">{pod.headcount}</div>
            <div className="text-[10px] text-muted-foreground leading-tight">
              On – {pod.onshore}; Off – {pod.offshore}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wide font-bold text-muted-foreground">POD Skills</div>
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {pod.skills.slice(0, 8).map(s => (
                <span key={s} className="text-[9px] leading-tight px-1 py-0.5 rounded bg-white border" title={s}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wide font-bold text-muted-foreground">POD Leads</div>
            {pod.leadOnshore && (
              <div className="text-[10px] leading-tight mt-0.5 truncate" title={pod.leadOnshore.name}>
                <span style={{ color: C.teal }}>●</span>{" "}
                <span className="font-semibold">{pod.leadOnshore.name.split(" ")[0]}</span>{" "}
                <span className="text-muted-foreground">(on)</span>
              </div>
            )}
            {pod.leadOffshore && (
              <div className="text-[10px] leading-tight truncate" title={pod.leadOffshore.name}>
                <span style={{ color: C.blue }}>●</span>{" "}
                <span className="font-semibold">{pod.leadOffshore.name.split(" ")[0]}</span>{" "}
                <span className="text-muted-foreground">(off)</span>
              </div>
            )}
            {!pod.leadOnshore && !pod.leadOffshore && (
              <div className="text-[10px] text-muted-foreground italic">TBD</div>
            )}
          </div>
        </div>

        {/* Right: role-mix bar + member roster */}
        <div className="p-2.5">
          {/* role mix bar */}
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex">
            {pod.roleMix.map(s => (
              <div
                key={s.role}
                title={`${s.role} → ${s.futureRole} (${s.count})`}
                style={{ width: `${(s.count / pod.headcount) * 100}%`, background: s.color }}
              />
            ))}
          </div>

          {/* members with future-role chips */}
          <div className="mt-2 max-h-44 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-0.5">
              {pod.members.map((m, i) => {
                const isOn = m.location === "Onshore";
                return (
                  <div key={`${pod.id}-m-${i}`} className="flex items-center gap-1.5 text-[10px] py-0.5">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: isOn ? C.teal : C.blue }}
                      title={m.location}
                    />
                    <span className="truncate flex-1 font-medium" title={`${m.name} · ${m.location}`}>
                      {m.name}
                    </span>
                    <span
                      className="text-[9px] px-1 py-0 rounded flex-shrink-0"
                      style={{ background: `${m.color}15`, color: m.color }}
                      title={`${m.role} → ${m.futureRole}`}
                    >
                      {m.futureRoleShort}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Domain footer */}
      <div className="px-3 py-1.5 border-t bg-slate-700 text-white text-[9px] leading-tight">
        <div><span className="opacity-70">Domain:</span> <span className="font-semibold">{pod.domain}</span></div>
        <div className="opacity-60 italic">Projects workforce · {pod.onshore} on · {pod.offshore} off</div>
      </div>
    </div>
  );
}

const PILOT_SELECTION_STORAGE_KEY = "talent.pilotDomains.v2";

function usePilotSelection() {
  const [selection, setSelectionState] = useState<string[] | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(PILOT_SELECTION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : null;
    } catch {
      return null;
    }
  });

  const setSelection = (next: string[] | null) => {
    setSelectionState(next);
    if (typeof window === "undefined") return;
    try {
      if (next === null) window.localStorage.removeItem(PILOT_SELECTION_STORAGE_KEY);
      else window.localStorage.setItem(PILOT_SELECTION_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota/serialization errors
    }
  };

  return [selection, setSelection] as const;
}

function PilotPodSelector({
  domainOptions,
  selection,
  setSelection,
  defaultSelection,
}: {
  domainOptions: { domain: string; headcount: number }[];
  selection: string[] | null;
  setSelection: (next: string[] | null) => void;
  defaultSelection: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const effective = selection && selection.length > 0 ? selection : defaultSelection;
  const effectiveSet = new Set(effective);
  const isCustom = selection !== null;

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return domainOptions;
    return domainOptions.filter(o => o.domain.toLowerCase().includes(q));
  }, [domainOptions, query]);

  const toggle = (domain: string) => {
    const next = new Set(effectiveSet);
    if (next.has(domain)) next.delete(domain);
    else next.add(domain);
    setSelection(Array.from(next));
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Target size={12} />
            Pilot domains: <span className="font-bold">{effective.length}</span>
            <ChevronDown size={12} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="end">
          <div className="p-2 border-b">
            <div className="text-xs font-semibold mb-1">Choose Phase 1 pilot domains</div>
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search domains…"
              className="h-7 text-xs"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="text-[11px] text-muted-foreground p-3 text-center">No matching domains</div>
            ) : (
              filteredOptions.map(o => {
                const checked = effectiveSet.has(o.domain);
                return (
                  <label
                    key={o.domain}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/60 cursor-pointer"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(o.domain)}
                    />
                    <span className="text-xs flex-1 truncate" title={o.domain}>{o.domain}</span>
                    <span className="text-[10px] text-muted-foreground">{o.headcount} proj</span>
                  </label>
                );
              })
            )}
          </div>
          <div className="p-2 border-t flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground">
              {isCustom ? "Custom selection" : `Default: top ${defaultSelection.length} by headcount`}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px]"
                onClick={() => setSelection(null)}
                disabled={!isCustom}
              >
                Reset
              </Button>
              <Button
                size="sm"
                className="h-7 text-[11px]"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {isCustom && (
        <Badge variant="outline" className="text-[10px]" style={{ borderColor: C.orange, color: C.orange }}>
          Custom pilots
        </Badge>
      )}
    </div>
  );
}

function groupByDomain(pods: Pod[]): Record<string, Pod[]> {
  const result: Record<string, Pod[]> = {};
  for (const p of pods) {
    (result[p.domain] ??= []).push(p);
  }
  return result;
}

function PodChip({ pod, accent, showAI = false }: { pod: Pod; accent: string; showAI?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[10px] font-medium hover:shadow-sm transition-shadow w-full text-left"
          style={{ borderColor: `${accent}50`, background: `${accent}08` }}
        >
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
          <span className="truncate flex-1 min-w-0" title={pod.name}>{pod.name}</span>
          <span className="flex-shrink-0 tabular-nums font-bold text-[9px]" style={{ color: accent }}>{pod.headcount}</span>
          {showAI && (
            <span className="flex-shrink-0 text-[9px] px-1 rounded font-bold" style={{ background: `${C.purple}20`, color: C.purple }}>AI</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" side="right">
        <PodCard pod={pod} accent={accent} />
      </PopoverContent>
    </Popover>
  );
}

const POD_PHASES = [
  {
    id: 1, label: "Foundation", timeframe: "Months 0–6",
    desc: "Pilot pods launched for top products; shared services remain centralized; IBM delivery model onboarded.",
    color: C.teal, Icon: BookOpen,
  },
  {
    id: 2, label: "Scale", timeframe: "Months 6–12",
    desc: "All products moved into cross-functional pods; shared pods formalized; value stream fully operational.",
    color: C.blue, Icon: Layers,
  },
  {
    id: 3, label: "Operate", timeframe: "Months 12–18",
    desc: "AI-augmented autonomous operations; continuous improvement cadence; steady-state pod model.",
    color: C.purple, Icon: Sparkles,
  },
] as const;

const VALUE_STREAM_STEPS = [
  "Demand Mgmt", "Intake", "Backlog Refinement", "Capacity Planning",
  "Agile Delivery", "SIT & UAT", "Deploy & Release",
];

const SHARED_POD_DEFS = [
  { name: "KTLO & Run",             minPhase: 1 },
  { name: "Control Tower",          minPhase: 1 },
  { name: "Quality & Compliance",   minPhase: 2 },
  { name: "Release Management",     minPhase: 2 },
  { name: "Change Management",      minPhase: 2 },
];

function PodModelTransformation({ filtered }: { filtered: Resource[] }) {
  const [pilotSelection, setPilotSelection] = usePilotSelection();
  const [activePhase, setActivePhase] = useState<number>(1);

  const domainOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of filtered) {
      if (r.typeOfWork !== "Projects") continue;
      if (EXCLUDED_POD_DOMAINS.has(r.domain ?? "")) continue;
      const key = r.domain || "Cross-Domain";
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([domain, headcount]) => ({ domain, headcount }))
      .sort((a, b) => b.headcount - a.headcount);
  }, [filtered]);

  const defaultSelection = useMemo(
    () => domainOptions.slice(0, DEFAULT_PILOT_COUNT).map(o => o.domain),
    [domainOptions],
  );

  const stages = useMemo(
    () => buildPodStages(filtered, pilotSelection),
    [filtered, pilotSelection],
  );
  const total = stages.totals.resources || 1;
  const projectTotal = stages.totals.projectResources || 1;

  // Derive domains from actual pods — so excluded domains never appear as empty swimlane rows.
  const domains = useMemo(() => {
    const seen = new Set<string>();
    for (const p of stages.twelveMonth.pods) seen.add(p.domain);
    return [...seen].sort();
  }, [stages.twelveMonth.pods]);

  const byDomainP1 = useMemo(() => groupByDomain(stages.sixMonth.pods), [stages.sixMonth.pods]);
  const byDomainP2 = useMemo(() => groupByDomain(stages.twelveMonth.pods), [stages.twelveMonth.pods]);

  const sixMonthInPods  = stages.sixMonth.pods.reduce((s, p) => s + p.headcount, 0);
  const twelveMonthInPods = stages.twelveMonth.pods.reduce((s, p) => s + p.headcount, 0);

  const kpis = [
    { label: "Active Pods",        p1: stages.sixMonth.pods.length,                         p2: stages.twelveMonth.pods.length,                    p3: stages.twelveMonth.pods.length, color: C.blue },
    { label: "% Projects in Pods",  p1: Math.round((sixMonthInPods / projectTotal) * 100),   p2: Math.round((twelveMonthInPods / projectTotal) * 100), p3: 100,                         color: C.teal,   suffix: "%" },
    { label: "Legacy Pool",        p1: stages.sixMonth.remainingCount,                       p2: 0,                                                 p3: 0,                              color: C.orange },
    { label: "Role Silos",         p1: stages.sixMonth.remaining.length,                     p2: 0,                                                 p3: 0,                              color: C.purple },
  ];

  const activePhaseCfg = POD_PHASES.find(p => p.id === activePhase) ?? POD_PHASES[0];

  return (
    <Card className="pod-model-card p-5 space-y-5">

      {/* ── Title ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <Package size={16} style={{ color: C.blue }} /> Pod Model — Phased Operating Model
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            How the current {total}-person team evolves from role-based silos into AI-augmented product pods across 3 phases.
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Badge variant="outline" className="text-[10px]" style={{ borderColor: C.blue, color: C.blue }}>
            {stages.twelveMonth.pods.length} target pods
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5"
            onClick={() => {
              const cleanup = () => {
                document.body.classList.remove("print-pod-model");
                window.removeEventListener("afterprint", cleanup);
              };
              window.addEventListener("afterprint", cleanup);
              document.body.classList.add("print-pod-model");
              window.print();
            }}
          >
            <Printer size={13} />
            Print / Export
          </Button>
        </div>
      </div>

      {/* ── Value Stream Banner ───────────────────────────── */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="bg-[#001141] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5">
          Value &amp; Delivery Stream — Demand to Release
        </div>
        <div className="flex items-center overflow-x-auto bg-gradient-to-r from-[#0f62fe]/5 via-transparent to-[#8a3ffc]/5 px-2 py-2 gap-0.5 flex-nowrap">
          {VALUE_STREAM_STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-shrink-0 gap-0.5">
              <div
                className={cn(
                  "px-2.5 py-1 text-[10px] font-semibold rounded whitespace-nowrap",
                  i === VALUE_STREAM_STEPS.length - 1
                    ? "text-white"
                    : "text-foreground bg-muted/60 border border-border"
                )}
                style={i === VALUE_STREAM_STEPS.length - 1 ? { background: C.blue } : {}}
              >
                {step}
              </div>
              {i < VALUE_STREAM_STEPS.length - 1 && (
                <ChevronRight size={12} className="text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Phase Toggle + Pilot Selector ─────────────────── */}
      <div className="space-y-2 no-print">
        <div className="flex items-center gap-2 flex-wrap">
          {POD_PHASES.map(ph => {
            const PhIcon = ph.Icon;
            const isActive = activePhase === ph.id;
            return (
              <button
                key={ph.id}
                onClick={() => setActivePhase(ph.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all",
                  isActive ? "shadow-md" : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                )}
                style={isActive ? { background: ph.color, color: "#fff", borderColor: ph.color } : {}}
              >
                <PhIcon size={14} />
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">Phase {ph.id}: {ph.label}</div>
                  <div className={cn("text-[10px] leading-tight", isActive ? "opacity-80" : "text-muted-foreground")}>{ph.timeframe}</div>
                </div>
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-medium hidden sm:block">Phase 1 Pilot Domains:</span>
            <PilotPodSelector
              domainOptions={domainOptions}
              selection={pilotSelection}
              setSelection={setPilotSelection}
              defaultSelection={defaultSelection}
            />
          </div>
        </div>
        <div
          className="rounded-md px-3 py-2 text-xs border"
          style={{ background: `${activePhaseCfg.color}08`, borderColor: `${activePhaseCfg.color}30`, color: activePhaseCfg.color }}
        >
          <span className="font-semibold">Phase {activePhase} — {activePhaseCfg.label}:</span>{" "}
          {activePhaseCfg.desc}
        </div>
      </div>

      {/* ── Operating Model Swimlane ──────────────────────── */}
      <div className="rounded-lg border border-border overflow-hidden">

        {/* Column headers */}
        <div className="grid border-b border-border" style={{ gridTemplateColumns: "130px repeat(3, 1fr)" }}>
          <div className="px-3 py-2 bg-muted/50 border-r border-border flex items-center gap-1.5">
            <Building2 size={11} className="text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground">Division / LOB</span>
          </div>
          {POD_PHASES.map(ph => {
            const PhIcon = ph.Icon;
            const isActive = activePhase === ph.id;
            return (
              <div
                key={ph.id}
                className="px-3 py-2 border-r border-border last:border-r-0 transition-colors"
                style={{
                  background: isActive ? `${ph.color}12` : "transparent",
                  borderTop: `3px solid ${isActive ? ph.color : "transparent"}`,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: ph.color }}
                  >
                    {ph.id}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold leading-tight" style={{ color: ph.color }}>{ph.label}</div>
                    <div className="text-[9px] text-muted-foreground leading-tight">{ph.timeframe}</div>
                  </div>
                  {isActive && (
                    <span
                      className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: ph.color, color: "#fff" }}
                    >
                      Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* LOB rows */}
        {domains.map((domain, di) => {
          const p1Pods = byDomainP1[domain] ?? [];
          const p2Pods = byDomainP2[domain] ?? [];
          const dAccent = getDomainAccent(domain);
          return (
            <div
              key={domain}
              className={cn("grid border-b border-border last:border-b-0", di % 2 !== 0 ? "bg-muted/10" : "")}
              style={{ gridTemplateColumns: "130px repeat(3, 1fr)" }}
            >
              {/* Row label */}
              <div className="px-3 py-2.5 border-r border-border flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: dAccent, boxShadow: `0 0 4px ${dAccent}60` }}
                />
                <span className="text-xs font-semibold truncate" title={domain} style={{ color: dAccent }}>{domain}</span>
              </div>

              {/* Phase 1 cell — pilot pods */}
              <div
                className={cn("px-2 py-2 border-r border-border transition-opacity", activePhase !== 1 && "opacity-40")}
                style={{ background: activePhase === 1 ? `${C.teal}06` : undefined }}
              >
                {p1Pods.length > 0 ? (
                  <div className="space-y-1">
                    {p1Pods.map((p, pi) => (
                      <div
                        key={p.id}
                        className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                        style={{ animationDelay: `${(di * 2 + pi) * 40}ms`, animationFillMode: "both" }}
                      >
                        <PodChip pod={p} accent={C.teal} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-muted-foreground italic px-1 py-1">Ramping up…</div>
                )}
              </div>

              {/* Phase 2 cell — all pods */}
              <div
                className={cn("px-2 py-2 border-r border-border transition-opacity", activePhase !== 2 && "opacity-40")}
                style={{ background: activePhase === 2 ? `${C.blue}06` : undefined }}
              >
                {p2Pods.length > 0 ? (
                  <div className="space-y-1">
                    {p2Pods.map((p, pi) => (
                      <div
                        key={p.id}
                        className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                        style={{ animationDelay: `${(di * 2 + pi) * 40}ms`, animationFillMode: "both" }}
                      >
                        <PodChip pod={p} accent={C.blue} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-muted-foreground italic px-1 py-1">No pods</div>
                )}
              </div>

              {/* Phase 3 cell — AI-augmented autonomous ops */}
              <div
                className={cn("px-2 py-2 transition-opacity", activePhase !== 3 && "opacity-40")}
                style={{ background: activePhase === 3 ? `${C.purple}06` : undefined }}
              >
                {p2Pods.length > 0 ? (
                  <div className="space-y-1">
                    <div className="text-[9px] font-bold uppercase tracking-wide mb-1" style={{ color: C.purple }}>Autonomous Ops</div>
                    {p2Pods.map((p, pi) => (
                      <div
                        key={p.id}
                        className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                        style={{ animationDelay: `${(di * 2 + pi) * 40}ms`, animationFillMode: "both" }}
                      >
                        <PodChip pod={p} accent={C.purple} showAI />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] text-muted-foreground italic px-1 py-1">No pods</div>
                )}
              </div>
            </div>
          );
        })}

        {/* Shared PODs band */}
        <div
          className="grid border-t-2 border-border"
          style={{ gridTemplateColumns: "130px repeat(3, 1fr)" }}
        >
          <div className="px-3 py-2.5 border-r border-border flex items-center gap-2 bg-muted/20">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.orange }} />
            <div>
              <div className="text-[10px] font-bold text-foreground">Shared PODs</div>
              <div className="text-[9px] text-muted-foreground">Cross-org services</div>
            </div>
          </div>
          {POD_PHASES.map(ph => {
            const active = SHARED_POD_DEFS.filter(sp => sp.minPhase <= ph.id);
            const isActive = activePhase === ph.id;
            return (
              <div
                key={ph.id}
                className={cn("px-2 py-2.5 border-r border-border last:border-r-0 transition-opacity", !isActive && "opacity-50")}
                style={{ background: isActive ? `${ph.color}06` : undefined }}
              >
                <div className="flex flex-wrap gap-1">
                  {active.map(sp => (
                    <span
                      key={sp.name}
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border"
                      style={{
                        borderColor: ph.id === 3 ? `${C.green}60` : `${ph.color}40`,
                        background:  ph.id === 3 ? `${C.green}12` : `${ph.color}10`,
                        color:       ph.id === 3 ? C.green : ph.color,
                      }}
                    >
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: ph.id === 3 ? C.green : ph.color }} />
                      {sp.name}
                    </span>
                  ))}
                  {active.length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic">Not yet active</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Cross-Functional Services Legend ─────────────── */}
      <div className="rounded-md border border-border px-3 py-2.5 bg-muted/20">
        <div className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground mb-2">Cross-Functional Services</div>
        <div className="flex flex-wrap gap-4 text-[10px]">
          {[
            { label: "Horizon",        color: C.blue,   icon: "◉" },
            { label: "IBM AMS",        color: C.purple, icon: "◎" },
            { label: "Horizon × IBM",  color: C.teal,   icon: "⊕" },
            { label: "Change Agents",  color: C.orange, icon: "◈" },
            { label: "Support",        color: C.gray,   icon: "○" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="text-base leading-none" style={{ color: item.color }}>{item.icon}</span>
              <span className="font-semibold" style={{ color: item.color }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI Strip ────────────────────────────────────── */}
      <div>
        <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-2">Transformation KPIs by Phase</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {kpis.map(k => (
            <div key={k.label} className="rounded-md border bg-muted/20 p-2.5">
              <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">{k.label}</div>
              <div className="grid grid-cols-3 gap-1 mt-1.5 text-center">
                {([1, 2, 3] as const).map(ph => {
                  const val = ph === 1 ? k.p1 : ph === 2 ? k.p2 : k.p3;
                  const isActive = activePhase === ph;
                  return (
                    <div key={ph} className={cn("rounded py-0.5 transition-colors", isActive ? "bg-white dark:bg-background shadow-sm" : "")}>
                      <div className="text-sm font-bold" style={{ color: k.color }}>{val}{k.suffix ?? ""}</div>
                      <div className="text-[9px] text-muted-foreground">Phase {ph}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Role Color Legend ─────────────────────────────── */}
      <div className="pt-4 border-t">
        <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-2">Pod Role Color Key — Current Role → Future Role</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1.5">
          {Object.entries(ROLE_TRANSFORMATION).map(([role, m]) => (
            <div key={role} className="flex items-center gap-2 text-[11px]">
              <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
              <span className="truncate">
                <span className="font-medium">{role}</span>
                {" → "}
                <span style={{ color: m.color }}>{m.future}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground italic">
        Pod composition is derived from live talent data (Projects workforce only — Operations Support &amp; Shared roles excluded). Phase 1 = pilot pods for top {DEFAULT_PILOT_COUNT} domains by headcount (customize via the picker above). Phase 2 = all domains in cross-functional pods. Phase 3 = same structure with AI-augmented operating model. Click any pod chip to see its full roster.
      </div>
    </Card>
  );
}

/* ─────────────────────── FILTERS ─────────────────────── */

type FilterState = {
  domain: string; portfolio: string; product: string; applicationArea: string;
  role: string; location: string; typeOfWork: string;
};
const ALL = "__all__";

function FiltersBar({ filters, setFilters }: { filters: FilterState; setFilters: (f: FilterState) => void }) {
  const { resources } = useTalentData();
  const opts = useMemo(() => ({
    domain:          ["", ...distinct(resources, "domain")],
    portfolio:       ["", ...distinct(resources, "portfolio")],
    product:         ["", ...distinct(resources, "product")],
    applicationArea: ["", ...distinct(resources, "applicationArea")],
    role:            ["", ...distinct(resources, "role")],
    location:        ["", ...distinct(resources, "location")],
    typeOfWork:      ["", ...distinct(resources, "typeOfWork")],
  }), [resources]);

  const reset = () => setFilters({ domain: "", portfolio: "", product: "", applicationArea: "", role: "", location: "", typeOfWork: "" });
  const dirty = Object.values(filters).some(Boolean);

  const make = (key: keyof FilterState, label: string) => (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">{label}</div>
      <Select value={filters[key] || ALL} onValueChange={(v) => setFilters({ ...filters, [key]: v === ALL ? "" : v })}>
        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL} className="text-xs">All</SelectItem>
          {opts[key].filter(Boolean).map(o => (
            <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Card className="p-3">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {make("domain", "Domain")}
        {make("portfolio", "Portfolio")}
        {make("product", "Product")}
        {make("applicationArea", "Application Area")}
        {make("role", "Role")}
        {make("location", "Location")}
        {make("typeOfWork", "Type of Work")}
      </div>
      {dirty && (
        <div className="flex justify-end mt-2">
          <Button onClick={reset} variant="ghost" size="sm" className="text-xs h-7">Reset filters</Button>
        </div>
      )}
    </Card>
  );
}

/* ─────────────────────── ADMIN / REFRESH DATA TAB ─────────────────────── */

function fmtDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function RefreshDataTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    ok: boolean;
    message: string;
    warnings?: string[];
    meta?: TalentPlanMeta;
  } | null>(null);

  const meta = useQuery<TalentPlanMeta>({
    queryKey: ["talent-plan", "metadata"],
    queryFn: async () => {
      const res = await fetch("/api/talent-plan/metadata");
      if (!res.ok) throw new Error("Failed to load metadata");
      return res.json();
    },
    staleTime: 5_000,
  });

  async function uploadFile(file: File) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setLastResult({
        ok: false,
        message: "Please upload a .xlsx workbook (Excel 2007+).",
      });
      return;
    }
    setUploading(true);
    setLastResult(null);
    try {
      const buf = await file.arrayBuffer();
      const res = await fetch("/api/talent-plan/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Filename": file.name,
          "X-Uploader":
            (typeof window !== "undefined" &&
              (localStorage.getItem("horizon_user") || "Horizon Admin")) ||
            "Horizon Admin",
        },
        body: buf,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setLastResult({
          ok: false,
          message: json.error || "Upload failed.",
          warnings: json.warnings,
        });
        toast({
          title: "Upload failed",
          description: json.error || "Please verify the workbook format.",
          variant: "destructive",
        });
      } else {
        setLastResult({
          ok: true,
          message: `Talent plan refreshed — ${json.meta.resourceCount} resources, ${json.meta.productCount} products loaded.`,
          warnings: json.warnings,
          meta: json.meta,
        });
        toast({
          title: "Talent plan refreshed",
          description: `${json.meta.resourceCount} resources · ${json.meta.productCount} products · v${json.meta.version}`,
        });
        // Refresh both the data and the metadata everywhere on the page
        await queryClient.invalidateQueries({ queryKey: ["talent-plan"] });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      setLastResult({ ok: false, message });
      toast({ title: "Upload failed", description: message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function downloadTemplate() {
    window.location.href = "/api/talent-plan/template";
  }

  return (
    <div className="space-y-5">
      <Card className="p-5 border-l-4" style={{ borderLeftColor: C.blue }}>
        <div className="flex items-start gap-4">
          <div className="rounded-lg p-2.5 flex-shrink-0" style={{ background: `${C.blue}15` }}>
            <Sparkles size={20} style={{ color: C.blue }} />
          </div>
          <div>
            <h3 className="text-base font-bold">Weekly Talent Plan Refresh</h3>
            <p className="text-sm leading-relaxed text-muted-foreground mt-1">
              Download the standard template, fill in the latest resource roster and product skill matrix,
              then upload here to instantly refresh every KPI, treemap, roadmap, and report on this page.
              The file format must match the template exactly.
            </p>
          </div>
        </div>
      </Card>

      {/* Last refresh status + Download template */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} style={{ color: C.green }} />
            <h4 className="text-sm font-bold">Last Refresh</h4>
          </div>
          {meta.isLoading ? (
            <div className="text-xs text-muted-foreground">Loading…</div>
          ) : meta.error || !meta.data ? (
            <div className="text-xs text-red-600">Could not load refresh status.</div>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refreshed at</span>
                <span className="font-semibold">{fmtDateTime(meta.data.uploadedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refreshed by</span>
                <span className="font-semibold">{meta.data.uploadedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source file</span>
                <span className="font-semibold truncate ml-2 max-w-[240px]">{meta.data.sourceFilename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Resources</span>
                <span className="font-semibold">{meta.data.resourceCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Products</span>
                <span className="font-semibold">{meta.data.productCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dataset version</span>
                <Badge variant="outline" className="text-[10px]" style={{ borderColor: C.blue, color: C.blue }}>
                  v{meta.data.version}
                </Badge>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Download size={16} style={{ color: C.blue }} />
            <h4 className="text-sm font-bold">Step 1 — Download Template</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Pre-formatted Excel workbook with the four sheets the system expects.
            Includes one sample row in each data sheet so the team can see the structure.
          </p>
          <ul className="text-[11px] text-muted-foreground space-y-1 mb-4 list-disc list-inside">
            <li><span className="font-semibold text-foreground">Product Level - Required Skills</span> — one row per product</li>
            <li><span className="font-semibold text-foreground">Resource Level - Talent Plan</span> — one row per resource</li>
            <li><span className="font-semibold text-foreground">References</span> — Role / Type of Work / Location lookups</li>
            <li><span className="font-semibold text-foreground">Instructions</span> — quick-start guide</li>
          </ul>
          <Button onClick={downloadTemplate} className="w-full" style={{ background: C.blue }}>
            <Download size={14} className="mr-2" />
            Download Talent_Plan_Template.xlsx
          </Button>
        </Card>
      </div>

      {/* Upload card */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Workflow size={16} style={{ color: C.blue }} />
          <h4 className="text-sm font-bold">Step 2 — Upload Refreshed Workbook</h4>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Drop the completed .xlsx file below or browse for it. The system will parse, validate, and
          immediately replace the current dataset across all tabs of this page.
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) uploadFile(f);
          }}
          className={cn(
            "border-2 border-dashed rounded-lg p-10 text-center transition-colors",
            dragOver ? "bg-blue-50 border-[#0F62FE]" : "border-muted-foreground/25",
            uploading && "opacity-60 pointer-events-none",
          )}
        >
          <Download
            size={28}
            className="mx-auto mb-2 rotate-180 text-muted-foreground/60"
          />
          <div className="text-sm font-semibold mb-1">
            {uploading ? "Uploading and parsing…" : "Drop the .xlsx file here"}
          </div>
          <div className="text-xs text-muted-foreground mb-4">or</div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
            }}
          />
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Search size={14} className="mr-2" />
            Browse for file
          </Button>
          <div className="text-[10px] text-muted-foreground mt-3">
            Maximum file size: 20 MB · Format: .xlsx
          </div>
        </div>

        {lastResult && (
          <div
            className={cn(
              "mt-4 rounded-md border p-3 text-xs flex items-start gap-2",
              lastResult.ok
                ? "border-green-200 bg-green-50 text-green-900"
                : "border-red-200 bg-red-50 text-red-900",
            )}
          >
            {lastResult.ok ? (
              <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" style={{ color: C.green }} />
            ) : (
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: C.red }} />
            )}
            <div className="space-y-1">
              <div className="font-semibold">{lastResult.message}</div>
              {lastResult.warnings && lastResult.warnings.length > 0 && (
                <ul className="list-disc list-inside text-[11px] opacity-80">
                  {lastResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* What gets refreshed */}
      <Card className="p-5">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Zap size={14} style={{ color: C.blue }} />
          What gets refreshed
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {[
            "10 KPI tiles",
            "Filter dropdowns",
            "Product treemap drill-down",
            "Role transformation view",
            "Skill readiness heatmap",
            "Six-month roadmap counts",
            "Resource detail table",
            "Product readiness cards",
            "CSV export",
          ].map(x => (
            <div key={x} className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle2 size={12} style={{ color: C.green }} />
              <span>{x}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────── MAIN ─────────────────────── */

export default function TalentPlan() {
  const dataQ = useQuery<{ resources: Resource[]; products: Product[] }>({
    queryKey: ["talent-plan", "data"],
    queryFn: async () => {
      const res = await fetch("/api/talent-plan");
      if (!res.ok) throw new Error("Failed to load talent plan");
      return res.json();
    },
    initialData: { resources: SEED_RESOURCES, products: SEED_PRODUCTS },
    staleTime: 5_000,
  });

  const RESOURCES = dataQ.data?.resources ?? SEED_RESOURCES;
  const PRODUCTS = dataQ.data?.products ?? SEED_PRODUCTS;

  const kpiTiles = useMemo(() => buildKpiTiles(RESOURCES), [RESOURCES]);

  const [filters, setFilters] = useState<FilterState>({
    domain: "", portfolio: "", product: "", applicationArea: "",
    role: "", location: "", typeOfWork: "",
  });

  const filtered = useMemo(() => {
    return RESOURCES.filter(r =>
      (!filters.domain          || r.domain          === filters.domain) &&
      (!filters.portfolio       || r.portfolio       === filters.portfolio) &&
      (!filters.product         || r.product         === filters.product) &&
      (!filters.applicationArea || r.applicationArea === filters.applicationArea) &&
      (!filters.role            || r.role            === filters.role) &&
      (!filters.location        || r.location        === filters.location) &&
      (!filters.typeOfWork      || r.typeOfWork      === filters.typeOfWork),
    );
  }, [filters, RESOURCES]);

  return (
    <TalentDataContext.Provider value={{ resources: RESOURCES, products: PRODUCTS }}>
    <div className="space-y-5">
      {/* Title block */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Horizon Operations Talent Transformation Plan</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Product-aligned 6-month upskilling roadmap evolving {RESOURCES.length} resources into an AI-led product operations workforce
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">{RESOURCES.length} resources</Badge>
          <Badge variant="outline" className="text-[10px]" style={{ borderColor: C.blue, color: C.blue }}>{PRODUCTS.length} products mapped</Badge>
        </div>
      </div>

      {/* KPI tiles — 5 columns x 2 rows */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {kpiTiles.map(t => <KpiTile key={t.label} t={t} />)}
      </div>

      {/* Filters */}
      <FiltersBar filters={filters} setFilters={setFilters} />

      {/* Tabbed views */}
      <Tabs defaultValue="skill" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto justify-start gap-1 bg-muted/50 p-1">
          <TabsTrigger value="skill" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#0F62FE] data-[state=active]:shadow-sm">
            Skill Readiness Heatmap
          </TabsTrigger>
          <TabsTrigger value="product" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#0F62FE] data-[state=active]:shadow-sm">
            Product-Based Talent View
          </TabsTrigger>
          <TabsTrigger value="role" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#0F62FE] data-[state=active]:shadow-sm">
            Role Transformation View
          </TabsTrigger>
          <TabsTrigger value="pods" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#0F62FE] data-[state=active]:shadow-sm">
            Pod Model Transformation
          </TabsTrigger>
          <TabsTrigger value="resources" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#0F62FE] data-[state=active]:shadow-sm">
            Resource Detail Table
          </TabsTrigger>
          <TabsTrigger value="readiness" className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#0F62FE] data-[state=active]:shadow-sm">
            Product Readiness Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skill" className="mt-4 space-y-6">
          <SkillHeatmap filtered={filtered} />
          <SixMonthRoadmap />
          <TargetOperatingModel />
        </TabsContent>

        <TabsContent value="product" className="mt-4">
          <ProductTreemap filtered={filtered} filters={filters} setFilters={setFilters} />
        </TabsContent>

        <TabsContent value="role" className="mt-4">
          <RoleTransformation filtered={filtered} />
        </TabsContent>

        <TabsContent value="pods" className="mt-4">
          <PodModelTransformation filtered={filtered} />
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          <ResourceTable filtered={filtered} />
        </TabsContent>

        <TabsContent value="readiness" className="mt-4">
          <ProductReadinessCards filtered={filtered} />
        </TabsContent>
      </Tabs>

      {/* Footnote */}
      <div className="text-[10px] text-muted-foreground text-center pt-4">
        <AlertCircle size={10} className="inline mr-1" />
        Filters apply to the Skill Heatmap, Treemap, Role Transformation, Pod Model Transformation, Resource Table, and Product Readiness Cards tabs. The Six-Month Roadmap and Future Operating Model are program-level and not filtered.
      </div>
    </div>
    </TalentDataContext.Provider>
  );
}
