import { useMemo, useState, createContext, useContext, useRef } from "react";
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
  Target, Zap, BookOpen, ChevronDown, ChevronRight,
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
  { key: "industry",  label: "Industry",   field: "industry",  desc: "Healthcare / Insurance domain training" },
  { key: "agile",     label: "Agile",      field: "agile",     desc: "Agile Explorer / CSM / DASSM" },
  { key: "agentic",   label: "Agentic AI", field: "agentic",   desc: "GenAI, watsonx, prompt engineering" },
  { key: "devsecops", label: "DevSecOps",  field: "devops",    desc: "DevSecOps essentials & advanced" },
  { key: "aiops",     label: "AIOps",      field: "aiops",     desc: "AIOps overview & badges" },
  { key: "future",    label: "Future Stack", field: "futureTech", desc: "Future technology stack readiness" },
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
  const productsList = useMemo(() => uniq(filtered.map(r => r.product)).filter(Boolean).sort(), [filtered]);
  const matrix = useMemo(() => {
    return productsList.map(prod => {
      const rs = filtered.filter(r => r.product === prod);
      const cells = SKILL_AREAS.map(area => {
        const filled = rs.filter(r => {
          const v = (r.plan as any)[area.field] as string;
          return v && v.trim() && v.toLowerCase() !== "na";
        }).length;
        const pct = rs.length > 0 ? filled / rs.length : 0;
        return { area: area.label, pct, filled, total: rs.length };
      });
      return { product: prod, headcount: rs.length, cells };
    });
  }, [productsList, filtered]);

  const cellColor = (pct: number) => {
    if (pct >= 0.7) return { bg: C.green, fg: "#fff" };
    if (pct >= 0.3) return { bg: C.yellow, fg: "#1f1f1f" };
    return { bg: C.red, fg: "#fff" };
  };

  return (
    <Card className="p-5">
      <div className="mb-3">
        <h3 className="text-base font-bold flex items-center gap-2"><Target size={16} style={{ color: C.green }} /> Skill Readiness Heatmap</h3>
        <p className="text-xs text-muted-foreground mt-0.5">% of resources with planned coverage in each skill area, by Product</p>
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
                  return (
                    <td key={i} className="px-1 py-1">
                      <TooltipProvider><Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="rounded text-[10px] font-bold flex items-center justify-center cursor-default"
                            style={{ background: col.bg, color: col.fg, height: 22 }}
                          >
                            {Math.round(c.pct * 100)}%
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                          {c.filled} of {c.total} planned for <strong>{c.area}</strong>
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
        Filters apply to the Skill Heatmap, Treemap, Role Transformation, Resource Table, and Product Readiness Cards tabs. The Six-Month Roadmap and Future Operating Model are program-level and not filtered.
      </div>
    </div>
    </TalentDataContext.Provider>
  );
}
