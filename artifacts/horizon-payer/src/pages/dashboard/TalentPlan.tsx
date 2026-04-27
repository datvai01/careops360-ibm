import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
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

const RESOURCES: Resource[] = (talentJson as { resources: Resource[] }).resources;
const PRODUCTS: Product[] = (talentJson as { products: Product[] }).products;

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
function distinct(field: keyof Resource): string[] {
  return uniq(RESOURCES.map(r => r[field] as string).filter(Boolean)).sort();
}

/* ─────────────────────── KPI TILES ─────────────────────── */

const KPI_TILES = [
  { label: "Total Resources",       value: 391, icon: Users,         color: C.blue,   sub: "Active Horizon delivery team" },
  { label: "Offshore Resources",    value: 322, icon: MapPin,        color: C.teal,   sub: "82% of total workforce" },
  { label: "Onshore Resources",     value: 69,  icon: Building2,     color: C.purple, sub: "18% of total workforce" },
  { label: "Operations Support",    value: 196, icon: Activity,      color: C.orange, sub: "Run-the-business resources" },
  { label: "Project Resources",     value: 136, icon: Briefcase,     color: C.blue,   sub: "Change-the-business resources" },
  { label: "Shared Resources",      value: 59,  icon: Layers,        color: C.green,  sub: "Cross-product enablement" },
  { label: "Developers",            value: 160, icon: Code2,         color: C.blue,   sub: "Largest role pool" },
  { label: "Operations Engineers",  value: 104, icon: Wrench,        color: C.teal,   sub: "AIOps reskill candidates" },
  { label: "Technical Leads",       value: 49,  icon: Brain,         color: C.purple, sub: "Product squad lead pool" },
  { label: "Project Managers",      value: 37,  icon: ShieldCheck,   color: C.orange, sub: "Product delivery lead pool" },
];

function KpiTile({ t }: { t: typeof KPI_TILES[number] }) {
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

/* ─────────────────────── EXEC NARRATIVE ─────────────────────── */

function ExecNarrative() {
  return (
    <Card className="p-6 border-l-4" style={{ borderLeftColor: C.blue }}>
      <div className="flex items-start gap-4">
        <div className="rounded-lg p-2.5 flex-shrink-0" style={{ background: `${C.blue}15` }}>
          <Sparkles size={20} style={{ color: C.blue }} />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-bold">Executive Summary</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            IBM is proposing a structured, product-aligned talent transformation plan to evolve Horizon&rsquo;s current operations team into an
            <span className="font-semibold text-foreground"> AI-enabled product operations model</span>. The plan maps each of the 391 resources to their current
            product, application area, role, location, and skill baseline, then defines a 6-month upskilling path across <span className="font-semibold text-foreground">healthcare industry knowledge, agile delivery,
            Agentic AI, DevSecOps, and AIOps</span>. Outcomes: faster product flow, reduced MTTR, automated remediation, and a workforce ready for AI-led operations transformation.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ─────────────────────── PRODUCT TREEMAP ─────────────────────── */

function ProductTreemap({ filtered }: { filtered: Resource[] }) {
  const data = useMemo(() => {
    const byDomain: Record<string, Record<string, Record<string, number>>> = {};
    for (const r of filtered) {
      const d = r.domain || "Unspecified";
      const p = r.portfolio || "—";
      const pr = r.product || "—";
      byDomain[d] ??= {};
      byDomain[d][p] ??= {};
      byDomain[d][p][pr] = (byDomain[d][p][pr] || 0) + 1;
    }
    const colors = [C.blue, C.teal, C.purple, C.orange, C.green, C.yellow, C.red, C.gray, "#1192e8", "#005d5d", "#9f1853"];
    let i = 0;
    return Object.entries(byDomain).map(([domain, ports]) => ({
      name: domain,
      fill: colors[i++ % colors.length],
      children: Object.entries(ports).map(([port, prods]) => ({
        name: port,
        children: Object.entries(prods).map(([prod, count]) => ({ name: prod, size: count })),
      })),
    }));
  }, [filtered]);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2"><Package size={16} style={{ color: C.blue }} /> Product-Based Talent View</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Domain &rarr; Portfolio &rarr; Product &mdash; sized by resource count</p>
        </div>
        <Badge variant="outline" className="text-xs">{filtered.length} resources</Badge>
      </div>
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={data}
            dataKey="size"
            stroke="#fff"
            fill={C.blue}
            content={<TreemapNode />}
          />
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function TreemapNode(props: any) {
  const { x, y, width, height, depth, name, fill } = props;
  if (depth > 2) return null;
  const colors = [C.blue, C.teal, C.purple, C.orange, C.green, C.yellow, "#1192e8", "#005d5d", "#9f1853", C.red, C.gray];
  const colorIdx = (props.index ?? 0) % colors.length;
  const bg = depth === 1 ? (fill ?? colors[colorIdx]) : colors[colorIdx];
  const opacity = depth === 1 ? 0.95 : 0.6;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={bg} fillOpacity={opacity} stroke="#fff" strokeWidth={depth === 1 ? 2 : 1} />
      {width > 60 && height > 22 && (
        <text x={x + 6} y={y + 16} fill="#fff" fontSize={11} fontWeight={600} style={{ pointerEvents: "none" }}>
          {name}
        </text>
      )}
    </g>
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
              {rows.map(r => (
                <Row key={r.serial} r={r} expanded={expanded === r.serial} onToggle={() => setExpanded(expanded === r.serial ? null : r.serial)} />
              ))}
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
  const opts = useMemo(() => ({
    domain:          ["", ...distinct("domain")],
    portfolio:       ["", ...distinct("portfolio")],
    product:         ["", ...distinct("product")],
    applicationArea: ["", ...distinct("applicationArea")],
    role:            ["", ...distinct("role")],
    location:        ["", ...distinct("location")],
    typeOfWork:      ["", ...distinct("typeOfWork")],
  }), []);

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

/* ─────────────────────── MAIN ─────────────────────── */

export default function TalentPlan() {
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
  }, [filters]);

  return (
    <div className="space-y-5">
      {/* Title block */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Horizon Operations Talent Transformation Plan</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Product-aligned 6-month upskilling roadmap evolving 391 resources into an AI-led product operations workforce
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">Source: Talent Plan 0422a.xlsx</Badge>
          <Badge variant="outline" className="text-[10px]" style={{ borderColor: C.blue, color: C.blue }}>{PRODUCTS.length} products mapped</Badge>
        </div>
      </div>

      {/* KPI tiles — 5 columns x 2 rows */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {KPI_TILES.map(t => <KpiTile key={t.label} t={t} />)}
      </div>

      {/* Exec narrative */}
      <ExecNarrative />

      {/* Filters */}
      <FiltersBar filters={filters} setFilters={setFilters} />

      {/* Product treemap */}
      <ProductTreemap filtered={filtered} />

      {/* Role transformation */}
      <RoleTransformation filtered={filtered} />

      {/* Skill heatmap */}
      <SkillHeatmap filtered={filtered} />

      {/* Six-month roadmap */}
      <SixMonthRoadmap />

      {/* Resource table */}
      <ResourceTable filtered={filtered} />

      {/* Product readiness cards */}
      <ProductReadinessCards filtered={filtered} />

      {/* Target operating model */}
      <TargetOperatingModel />

      {/* Footnote */}
      <div className="text-[10px] text-muted-foreground text-center pt-4">
        <AlertCircle size={10} className="inline mr-1" />
        Filters apply to the Treemap, Role Transformation, Skill Heatmap, Resource Table, and Product Readiness Cards. The 6-Month Roadmap and Target Operating Model are program-level and not filtered.
      </div>
    </div>
  );
}
