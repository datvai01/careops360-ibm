import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
} from "recharts";
import {
  CheckCircle2, AlertTriangle, XCircle, Clock, RefreshCw, Download, Search,
  ChevronRight, ChevronDown, Zap, User, ArrowUpRight, Shield, GitBranch,
  Activity, Database, RotateCcw, FileCheck, Bot, X, Info, Layers,
  TrendingUp, TrendingDown, Users, AlertCircle, Headphones, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetContactCenterKpis, useGetTopCallReasons, useGetHourlyCallVolume, useGetMemberKpis, useGetEnrollmentTrends, useGetMembersByProduct } from "@workspace/api-client-react";
import { useTimeRange } from "@/contexts/TimeRangeContext";
import { KpiCard } from "@/components/ui/kpi-card";

// ─── COLOR PALETTE ───────────────────────────────────────────────────────────
const C = {
  blue:   "#0f62fe",
  green:  "#24a148",
  amber:  "#f1a10d",
  red:    "#da1e28",
  purple: "#8a3ffc",
  teal:   "#009d9a",
  gray:   "#8d8d8d",
};

// ─── STATIC DATA ─────────────────────────────────────────────────────────────

const TREND_DATA = [
  { date: "Mar 1",  volume: 1840, issues: 142, remediated: 98  },
  { date: "Mar 4",  volume: 2120, issues: 178, remediated: 145 },
  { date: "Mar 7",  volume: 1990, issues: 131, remediated: 112 },
  { date: "Mar 10", volume: 2340, issues: 204, remediated: 189 },
  { date: "Mar 13", volume: 2580, issues: 187, remediated: 174 },
  { date: "Mar 16", volume: 2210, issues: 159, remediated: 148 },
  { date: "Mar 19", volume: 2650, issues: 223, remediated: 209 },
  { date: "Mar 22", volume: 2890, issues: 241, remediated: 227 },
  { date: "Mar 25", volume: 2730, issues: 198, remediated: 187 },
  { date: "Mar 28", volume: 3010, issues: 268, remediated: 251 },
  { date: "Mar 31", volume: 2940, issues: 245, remediated: 234 },
  { date: "Apr 3",  volume: 3180, issues: 271, remediated: 258 },
  { date: "Apr 6",  volume: 3050, issues: 252, remediated: 241 },
  { date: "Apr 9",  volume: 3320, issues: 289, remediated: 278 },
];

const ISSUE_TYPES = [
  { name: "Demographic Mismatch",    value: 34, color: C.red    },
  { name: "Effective Date Error",    value: 22, color: C.amber  },
  { name: "PCP Assignment Failure",  value: 18, color: C.purple },
  { name: "COB Conflict",            value: 14, color: C.blue   },
  { name: "Eligibility Gap",         value: 12, color: C.teal   },
];

const SOURCE_DATA = [
  { source: "EDI 834",     received: 18420, passed: 17110, issues: 1310, color: C.blue   },
  { source: "API",         received: 9830,  passed: 9480,  issues: 350,  color: C.purple },
  { source: "Excel/XLSX",  received: 2140,  passed: 1860,  issues: 280,  color: C.amber  },
  { source: "MFT Drop",    received: 3670,  passed: 3490,  issues: 180,  color: C.teal   },
];

const QUEUE_SUMMARY = [
  { status: "Passed",     count: 31940, color: C.green,  icon: CheckCircle2  },
  { status: "Needs Fix",  count: 1620,  color: C.amber,  icon: AlertTriangle },
  { status: "Failed",     count: 500,   color: C.red,    icon: XCircle       },
  { status: "In Progress",count: 284,   color: C.blue,   icon: Clock         },
  { status: "Remediated", count: 2156,  color: C.teal,   icon: CheckCircle2  },
];

const INTAKE_RECORDS = [
  { id: "ENR-20240401-00892", member: "Patricia Harmon",   dob: "1978-06-14", source: "EDI 834",    group: "GRP-10041", status: "Failed",  rules: ["PCP Check", "Demographic Consistency"], priority: "High"   },
  { id: "ENR-20240401-00893", member: "Derek Mouton",      dob: "1991-03-22", source: "API",        group: "GRP-10088", status: "Passed",  rules: ["COB Check", "Effective Date Sequence"], priority: "Low"    },
  { id: "ENR-20240401-00894", member: "Sandra Fitzgerald", dob: "1964-11-08", source: "EDI 834",    group: "GRP-20014", status: "Warning", rules: ["Eligibility Validation"],               priority: "Medium" },
  { id: "ENR-20240401-00895", member: "James Okafor",      dob: "2001-07-30", source: "Excel/XLSX", group: "GRP-10099", status: "Failed",  rules: ["Demographic Consistency", "COB Check"], priority: "High"   },
  { id: "ENR-20240401-00896", member: "Mei Lin Zhao",      dob: "1956-02-19", source: "MFT Drop",   group: "GRP-30002", status: "Passed",  rules: ["PCP Check", "Eligibility Validation"],  priority: "Low"    },
  { id: "ENR-20240401-00897", member: "Thomas Restrepo",   dob: "1983-09-04", source: "API",        group: "GRP-10041", status: "Warning", rules: ["Effective Date Sequence"],              priority: "Medium" },
  { id: "ENR-20240401-00898", member: "Gloria Nakamura",   dob: "1970-12-27", source: "EDI 834",    group: "GRP-20007", status: "Passed",  rules: ["COB Check"],                            priority: "Low"    },
  { id: "ENR-20240401-00899", member: "Benjamin Achebe",   dob: "1947-04-15", source: "EDI 834",    group: "GRP-10066", status: "Failed",  rules: ["PCP Check", "Eligibility Validation"],  priority: "High"   },
  { id: "ENR-20240401-00900", member: "Vanessa Kowalski",  dob: "1988-08-11", source: "MFT Drop",   group: "GRP-10041", status: "Passed",  rules: ["Demographic Consistency"],              priority: "Low"    },
  { id: "ENR-20240401-00901", member: "Raymond Osei",      dob: "2005-01-03", source: "Excel/XLSX", group: "GRP-20014", status: "Warning", rules: ["PCP Check", "COB Check"],               priority: "Medium" },
  { id: "ENR-20240401-00902", member: "Isabelle Tremblay", dob: "1972-05-29", source: "API",        group: "GRP-30002", status: "Failed",  rules: ["Effective Date Sequence", "PCP Check"], priority: "High"   },
  { id: "ENR-20240401-00903", member: "Marcus Delgado",    dob: "1999-10-16", source: "EDI 834",    group: "GRP-10088", status: "Passed",  rules: ["Eligibility Validation"],               priority: "Low"    },
];

const AI_RECORDS_AUTO = [
  {
    id: "ENR-20240401-00788", member: "Harold Jennings",   issue: "Effective date precedes group enrollment window by 3 days",
    remedy: "Adjust effective date to 04/01/2026 — group effective date alignment",
    confidence: 97, why: "Historical pattern: 94% of similar records in GRP-10041 have been corrected by aligning to group effective date. No COB conflicts detected.",
    source: "EDI 834",
  },
  {
    id: "ENR-20240401-00791", member: "Tanya Oduya",      issue: "PCP NPI 1083724561 not in-network for selected plan tier",
    remedy: "Auto-assign nearest in-network PCP (Dr. Ellen Soto, NPI 1049382810) within 5-mile radius",
    confidence: 94, why: "Geocode match confidence 99.1%. No member PCP preference on file. Plan tier rules unambiguous.",
    source: "API",
  },
  {
    id: "ENR-20240401-00794", member: "Leo Petrakis",     issue: "Duplicate enrollment detected — same SSN, different member ID",
    remedy: "Suppress new record and flag for master data governance merge resolution",
    confidence: 91, why: "SSN match confirmed. DOB, gender, and address all align within 95% confidence. Previous record active since 2022-09.",
    source: "MFT Drop",
  },
  {
    id: "ENR-20240401-00801", member: "Charlotte Nwosu",  issue: "COB spouse coverage record missing insurer code",
    remedy: "Default to primary-only coverage; secondary COB record flagged for batch update from trading partner",
    confidence: 89, why: "No insurer code in segment data. 89% of similar COB gaps resolve via trading partner batch refresh within 48hrs.",
    source: "EDI 834",
  },
];

const AI_RECORDS_HUMAN = [
  {
    id: "ENR-20240401-00803", member: "Patricia Harmon",  issue: "Demographic mismatch — DOB conflict between IDX and MPI records",
    remedy: "Route to Enrollment Data Steward for manual verification against government-issued ID",
    confidence: 58, why: "DOB difference of 2 years between systems. Cannot determine authoritative source without human verification.",
    source: "EDI 834",
  },
  {
    id: "ENR-20240401-00810", member: "James Okafor",     issue: "COB primary/secondary order conflict — two active group coverages",
    remedy: "Escalate to Benefits Coordination team for member outreach and clarification",
    confidence: 47, why: "Both group coverages show active status. COB order resolution requires member or employer confirmation.",
    source: "Excel/XLSX",
  },
  {
    id: "ENR-20240401-00815", member: "Isabelle Tremblay",issue: "Effective date retroactive > 60 days — requires compliance sign-off",
    remedy: "Route to Compliance Officer for retroactive enrollment approval per CMS guidelines",
    confidence: 44, why: "Retroactive enrollment beyond 60 days requires manual compliance approval. Cannot auto-apply.",
    source: "API",
  },
];

const OPS_QUEUE = [
  { id: "ENR-20240401-00892", member: "Patricia Harmon",   issue: "Demographic Mismatch",    priority: "High",   source: "EDI 834",    assigned: "K. Williams",  slaHrs: 1.2,  status: "In Progress", slaBreached: false },
  { id: "ENR-20240401-00895", member: "James Okafor",      issue: "COB Conflict",            priority: "High",   source: "Excel/XLSX", assigned: "Unassigned",   slaHrs: 0.5,  status: "Open",        slaBreached: true  },
  { id: "ENR-20240401-00815", member: "Isabelle Tremblay", issue: "Retroactive > 60 Days",   priority: "High",   source: "API",        assigned: "M. Rodriguez", slaHrs: 3.8,  status: "Escalated",   slaBreached: false },
  { id: "ENR-20240401-00899", member: "Benjamin Achebe",   issue: "PCP Assignment Failure",  priority: "High",   source: "EDI 834",    assigned: "D. Patel",     slaHrs: 2.1,  status: "In Progress", slaBreached: false },
  { id: "ENR-20240401-00894", member: "Sandra Fitzgerald", issue: "Eligibility Gap",         priority: "Medium", source: "EDI 834",    assigned: "K. Williams",  slaHrs: 5.4,  status: "In Progress", slaBreached: false },
  { id: "ENR-20240401-00897", member: "Thomas Restrepo",   issue: "Effective Date Sequence", priority: "Medium", source: "API",        assigned: "Unassigned",   slaHrs: 4.7,  status: "Open",        slaBreached: false },
  { id: "ENR-20240401-00901", member: "Raymond Osei",      issue: "PCP Check",               priority: "Medium", source: "Excel/XLSX", assigned: "S. Chang",     slaHrs: 6.2,  status: "Pending",     slaBreached: false },
  { id: "ENR-20240401-00902", member: "Isabelle Tremblay", issue: "Effective Date Sequence", priority: "High",   source: "API",        assigned: "M. Rodriguez", slaHrs: 1.1,  status: "In Progress", slaBreached: false },
];

const SYNDICATION_TARGETS = [
  { id: "NMS",           label: "CoreEnroll NMS",      status: "Synced",   lastAttempt: "2026-04-13 09:14:22", records: 31940, errors: 0,   color: C.green  },
  { id: "MEMBERS_EDGE",  label: "Members Edge",         status: "Synced",   lastAttempt: "2026-04-13 09:12:08", records: 31940, errors: 0,   color: C.green  },
  { id: "NASCX",         label: "NASCX Platform",       status: "Partial",  lastAttempt: "2026-04-13 08:58:44", records: 31744, errors: 196, color: C.amber  },
  { id: "CARENEXUS",     label: "CareNexus Clinical",   status: "Synced",   lastAttempt: "2026-04-13 09:01:33", records: 31940, errors: 0,   color: C.green  },
  { id: "API_CACHE",     label: "API Eligibility Cache", status: "Failed",   lastAttempt: "2026-04-13 08:45:17", records: 0,     errors: 31940, color: C.red  },
  { id: "ANALYTICS",     label: "Analytics DataFeed",   status: "Synced",   lastAttempt: "2026-04-13 09:10:55", records: 31940, errors: 0,   color: C.green  },
];

const RECON_SYSTEMS = [
  { system: "CoreEnroll NMS",      ack: 31940, nack: 0,   pending: 0,   sla: 100 },
  { system: "Members Edge",        ack: 31940, nack: 0,   pending: 0,   sla: 100 },
  { system: "NASCX Platform",      ack: 31744, nack: 196, pending: 0,   sla: 99.4},
  { system: "CareNexus Clinical",  ack: 31940, nack: 0,   pending: 0,   sla: 100 },
  { system: "API Eligibility Cache",ack: 0,   nack: 0,   pending: 31940, sla: 0  },
  { system: "Analytics DataFeed",  ack: 31940, nack: 0,   pending: 0,   sla: 100 },
];

const AUDIT_LOGS = [
  { ts: "2026-04-13 09:14:22", actor: "System", action: "Auto-remediation applied",         record: "ENR-20240401-00788", outcome: "Success", rule: "Effective Date Alignment v2.4" },
  { ts: "2026-04-13 09:12:58", actor: "System", action: "Auto-remediation applied",         record: "ENR-20240401-00791", outcome: "Success", rule: "PCP Auto-Assign v1.9"          },
  { ts: "2026-04-13 09:10:11", actor: "K. Williams", action: "Manual override applied",     record: "ENR-20240401-00803", outcome: "Success", rule: "Manual Review — DOB Conflict"  },
  { ts: "2026-04-13 09:08:44", actor: "System", action: "Record routed to steward",         record: "ENR-20240401-00810", outcome: "Pending", rule: "COB Escalation v1.2"           },
  { ts: "2026-04-13 09:05:30", actor: "M. Rodriguez", action: "Compliance escalation filed",record: "ENR-20240401-00815", outcome: "Pending", rule: "Retroactive Enrollment Policy"  },
  { ts: "2026-04-13 09:02:17", actor: "System", action: "Auto-remediation applied",         record: "ENR-20240401-00794", outcome: "Success", rule: "Duplicate Suppression v3.1"    },
  { ts: "2026-04-13 09:00:09", actor: "D. Patel",  action: "SLA breach acknowledged",       record: "ENR-20240401-00895", outcome: "Warning", rule: "SLA Policy v1.0"               },
  { ts: "2026-04-13 08:58:22", actor: "System", action: "Intake validation complete",       record: "ENR-20240401-00900", outcome: "Success", rule: "Validation Suite v4.2"         },
];

const RULE_VERSIONS = [
  { rule: "Effective Date Alignment",  version: "v2.4", updated: "2026-03-15", author: "Enrollment Ops", status: "Active"   },
  { rule: "PCP Auto-Assignment",       version: "v1.9", updated: "2026-02-28", author: "Clinical Ops",   status: "Active"   },
  { rule: "COB Order Resolution",      version: "v1.2", updated: "2026-01-10", author: "Benefits Team",  status: "Active"   },
  { rule: "Duplicate Suppression",     version: "v3.1", updated: "2026-03-01", author: "MDM Governance", status: "Active"   },
  { rule: "Retroactive Enrollment",    version: "v1.0", updated: "2025-12-01", author: "Compliance",     status: "Active"   },
  { rule: "PCP Network Validation",    version: "v2.1", updated: "2026-01-22", author: "Network Mgmt",   status: "Active"   },
  { rule: "Eligibility Gap Detection", version: "v1.7", updated: "2026-02-14", author: "Enrollment Ops", status: "Deprecated"},
];

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

function KpiTile({
  label, value, sub, trend, trendDir, color = C.blue,
}: { label: string; value: string | number; sub?: string; trend?: string; trendDir?: "up" | "down" | "neutral"; color?: string }) {
  const TrendIcon = trendDir === "up" ? TrendingUp : trendDir === "down" ? TrendingDown : null;
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold mt-1.5 tabular-nums" style={{ color }}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        {trend && (
          <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium",
            trendDir === "up" ? "text-emerald-500" : trendDir === "down" ? "text-red-500" : "text-muted-foreground"
          )}>
            {TrendIcon && <TrendIcon size={12} />}
            {trend}
          </div>
        )}
      </CardContent>
      <div className="absolute top-0 right-0 w-1 h-full" style={{ background: color }} />
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: React.ElementType }> = {
    Passed:      { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
    Warning:     { color: "bg-amber-500/10 text-amber-600 border-amber-500/20",       icon: AlertTriangle },
    Failed:      { color: "bg-red-500/10 text-red-600 border-red-500/20",             icon: XCircle      },
    Synced:      { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
    Partial:     { color: "bg-amber-500/10 text-amber-600 border-amber-500/20",       icon: AlertTriangle },
    Active:      { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
    Deprecated:  { color: "bg-gray-500/10 text-gray-500 border-gray-500/20",          icon: AlertCircle  },
    "In Progress":{ color: "bg-blue-500/10 text-blue-600 border-blue-500/20",         icon: Clock        },
    Open:        { color: "bg-slate-500/10 text-slate-600 border-slate-500/20",       icon: AlertCircle  },
    Escalated:   { color: "bg-purple-500/10 text-purple-600 border-purple-500/20",    icon: ArrowUpRight },
    Pending:     { color: "bg-amber-500/10 text-amber-600 border-amber-500/20",       icon: Clock        },
    Success:     { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  };
  const cfg = map[status] ?? { color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: Info };
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium", cfg.color)}>
      <Icon size={10} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    High:   "bg-red-500/10 text-red-600 border-red-500/20",
    Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Low:    "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };
  return (
    <span className={cn("inline-flex px-2 py-0.5 rounded-full border text-xs font-semibold", map[priority] ?? map["Low"])}>
      {priority}
    </span>
  );
}

function ConfidenceBar({ score }: { score: number }) {
  const color = score >= 90 ? C.green : score >= 70 ? C.amber : C.red;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-muted rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}%</span>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}

// ─── SECTION: OVERVIEW DASHBOARD ─────────────────────────────────────────────
function OverviewSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Enrollment Operations Overview"
        description="Real-time view of enrollment pipeline health, AI performance, and compliance posture"
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <KpiTile label="Time-to-Good"            value="4.2 hrs" sub="vs 6.8 hr baseline"   trend="+38% faster"   trendDir="up"      color={C.green}  />
        <KpiTile label="Auto-Match Rate"         value="88.7%"   sub="of all intake records" trend="+2.4% MoM"    trendDir="up"      color={C.blue}   />
        <KpiTile label="Manual Intervention"     value="6.1%"    sub="records requiring ops" trend="-1.8% MoM"    trendDir="up"      color={C.teal}   />
        <KpiTile label="Records in Queue"        value="1,620"   sub="awaiting validation"   trend="124 new today" trendDir="neutral" color={C.amber}  />
        <KpiTile label="Failed Records"          value="500"     sub="hard failures"          trend="-12 from peak" trendDir="up"      color={C.red}    />
        <KpiTile label="SLA Compliance"          value="97.3%"   sub="within SLA window"      trend="+0.5% WoW"    trendDir="up"      color={C.green}  />
        <KpiTile label="Syndication Success"     value="95.8%"   sub="downstream sync rate"   trend="API cache down" trendDir="down"   color={C.amber}  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Enrollment Volume & Issue Trend</CardTitle>
            <CardDescription>Daily intake volume with issues identified and remediated (last 14 days)</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA} margin={{ top: 5, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="volume"     name="Intake Volume" stroke={C.blue}   strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="issues"     name="Issues Found"  stroke={C.amber}  strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="remediated" name="Remediated"    stroke={C.green}  strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Issue Types Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Issue Type Breakdown</CardTitle>
            <CardDescription>Current period — % of total flagged records</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={ISSUE_TYPES} dataKey="value" cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={3}>
                  {ISSUE_TYPES.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} formatter={(v: number) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 w-full mt-1">
              {ISSUE_TYPES.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-muted-foreground truncate">{d.name}</span>
                  </div>
                  <span className="font-semibold tabular-nums">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Source Channel Breakdown</CardTitle>
            <CardDescription>Records received by intake channel — current period</CardDescription>
          </CardHeader>
          <CardContent className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SOURCE_DATA} margin={{ top: 5, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="source" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} formatter={(v: number) => [v.toLocaleString(), ""]} />
                <Bar dataKey="passed" name="Passed"  fill={C.green} radius={[3,3,0,0]} />
                <Bar dataKey="issues" name="Issues"  fill={C.red}   radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Queue Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Queue Summary by Status</CardTitle>
            <CardDescription>Live record distribution across pipeline stages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {QUEUE_SUMMARY.map(({ status, count, color, icon: Icon }) => {
              const total = QUEUE_SUMMARY.reduce((s, r) => s + r.count, 0);
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color }} />
                      <span className="font-medium">{status}</span>
                    </div>
                    <span className="font-bold tabular-nums" style={{ color }}>{count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── SECTION: INTAKE & VALIDATION ────────────────────────────────────────────
function IntakeSection() {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<typeof INTAKE_RECORDS[0] | null>(null);

  const filtered = useMemo(() => INTAKE_RECORDS.filter(r => {
    const matchSearch = r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.member.toLowerCase().includes(search.toLowerCase());
    const matchSource = sourceFilter === "all" || r.source === sourceFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchSource && matchStatus;
  }), [search, sourceFilter, statusFilter]);

  const RULE_RESULT_MAP: Record<string, { result: string; detail: string }> = {
    "PCP Check":                { result: "Failed",  detail: "PCP NPI not in-network for selected plan tier" },
    "COB Check":                { result: "Passed",  detail: "No coordination of benefits conflicts detected" },
    "Demographic Consistency":  { result: "Warning", detail: "DOB discrepancy between EDI segment and MPI record" },
    "Effective Date Sequence":  { result: "Passed",  detail: "Effective date within acceptable range" },
    "Eligibility Validation":   { result: "Warning", detail: "Eligibility gap detected; partial month coverage unresolved" },
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Intake & Validation"
        description="Incoming enrollment records from all channels with pre-mastering validation results"
      />
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <Input placeholder="Search record ID or member name…" className="pl-9 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="EDI 834">EDI 834</SelectItem>
            <SelectItem value="API">API</SelectItem>
            <SelectItem value="Excel/XLSX">Excel / XLSX</SelectItem>
            <SelectItem value="MFT Drop">MFT Drop</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Passed">Passed</SelectItem>
            <SelectItem value="Warning">Warning</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} records</span>
      </div>

      <div className="flex gap-4">
        {/* Table */}
        <Card className="flex-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {["Record ID", "Member", "DOB", "Source", "Group", "Status", "Priority"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className={cn(
                      "border-b cursor-pointer transition-colors hover:bg-muted/40",
                      selected?.id === r.id && "bg-primary/5 border-l-2 border-l-primary",
                      i % 2 === 0 ? "" : "bg-muted/10"
                    )}
                    onClick={() => setSelected(selected?.id === r.id ? null : r)}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-blue-600 font-medium whitespace-nowrap">{r.id}</td>
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap">{r.member}</td>
                    <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{r.dob}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted border">{r.source}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.group}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-2.5"><PriorityBadge priority={r.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detail Panel */}
        {selected && (
          <Card className="w-80 flex-shrink-0 h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-mono text-blue-600">{selected.id}</CardTitle>
                  <p className="text-base font-semibold mt-0.5">{selected.member}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <div className="flex gap-2 mt-2">
                <StatusBadge status={selected.status} />
                <PriorityBadge priority={selected.priority} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Record Details</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span className="text-muted-foreground">Date of Birth</span><span className="font-medium">{selected.dob}</span>
                  <span className="text-muted-foreground">Source</span><span className="font-medium">{selected.source}</span>
                  <span className="text-muted-foreground">Group ID</span><span className="font-mono font-medium">{selected.group}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Validation Rule Results</p>
                {selected.rules.map(rule => {
                  const r = RULE_RESULT_MAP[rule] ?? { result: "Unknown", detail: "" };
                  return (
                    <div key={rule} className="rounded-lg border p-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-xs">{rule}</span>
                        <StatusBadge status={r.result} />
                      </div>
                      <p className="text-xs text-muted-foreground">{r.detail}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="flex-1 text-xs h-8" style={{ background: C.blue }}>Route to Ops</Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs h-8">View Lineage</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── SECTION: AI REMEDIATION ──────────────────────────────────────────────────
function AiRemediationSection() {
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [routed, setRouted] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-6">
      <SectionHeader
        title="AI Remediation"
        description="Confidence-based automated and human-assisted remediation recommendations"
      />

      {/* Metrics strip */}
      <div className="grid grid-cols-3 gap-4">
        <KpiTile label="Auto-Resolved Today"    value="4"   sub="high-confidence cases" color={C.green}  />
        <KpiTile label="Human Review Required"  value="3"   sub="lower-confidence cases" color={C.amber}  />
        <KpiTile label="Avg Confidence Score"   value="74%" sub="across all recommendations" color={C.blue} />
      </div>

      {/* Auto-Resolved */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${C.green}18`, color: C.green, border: `1px solid ${C.green}30` }}>
            <Zap size={12} />
            Auto-Resolved Records — Confidence ≥ 85%
          </div>
          <span className="text-xs text-muted-foreground">{AI_RECORDS_AUTO.length} records</span>
        </div>
        <div className="space-y-3">
          {AI_RECORDS_AUTO.map(r => (
            <Card key={r.id} className={cn("transition-all", applied.has(r.id) && "opacity-60")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-600">{r.id}</span>
                      <span className="font-semibold text-sm">{r.member}</span>
                      <span className="text-xs px-2 py-0.5 rounded border bg-muted font-medium">{r.source}</span>
                      {applied.has(r.id) && <StatusBadge status="Success" />}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider">Issue Detected</p>
                        <p className="text-red-600 font-medium">{r.issue}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider">AI Recommendation</p>
                        <p className="text-foreground">{r.remedy}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confidence</p>
                      <ConfidenceBar score={r.confidence} />
                    </div>
                    <div className="rounded-lg bg-muted/50 border p-2.5 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Why this recommendation: </span>{r.why}
                    </div>
                  </div>
                  {!applied.has(r.id) && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button size="sm" className="text-xs h-8 whitespace-nowrap" style={{ background: C.green }} onClick={() => setApplied(s => new Set([...s, r.id]))}>
                        <CheckCircle2 size={12} className="mr-1" /> Auto Apply
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-8 whitespace-nowrap">
                        <User size={12} className="mr-1" /> Send to Steward
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-8 whitespace-nowrap text-red-600 border-red-200 hover:bg-red-50">
                        <ArrowUpRight size={12} className="mr-1" /> Escalate
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Human Review Required */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${C.amber}18`, color: C.amber, border: `1px solid ${C.amber}30` }}>
            <User size={12} />
            Human Review Required — Confidence &lt; 65%
          </div>
          <span className="text-xs text-muted-foreground">{AI_RECORDS_HUMAN.length} records</span>
        </div>
        <div className="space-y-3">
          {AI_RECORDS_HUMAN.map(r => (
            <Card key={r.id} className={cn("border-amber-200 dark:border-amber-900/40", routed.has(r.id) && "opacity-60")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-600">{r.id}</span>
                      <span className="font-semibold text-sm">{r.member}</span>
                      <span className="text-xs px-2 py-0.5 rounded border bg-muted font-medium">{r.source}</span>
                      {routed.has(r.id) && <StatusBadge status="Pending" />}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider">Issue Detected</p>
                        <p className="text-amber-600 font-medium">{r.issue}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-muted-foreground uppercase tracking-wider">AI Recommendation</p>
                        <p className="text-foreground">{r.remedy}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confidence</p>
                      <ConfidenceBar score={r.confidence} />
                    </div>
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-2.5 text-xs text-muted-foreground">
                      <span className="font-semibold text-amber-700 dark:text-amber-400">Why manual review is needed: </span>{r.why}
                    </div>
                  </div>
                  {!routed.has(r.id) && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button size="sm" className="text-xs h-8 whitespace-nowrap" style={{ background: C.amber }} onClick={() => setRouted(s => new Set([...s, r.id]))}>
                        <User size={12} className="mr-1" /> Send to Steward
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-8 whitespace-nowrap text-red-600 border-red-200 hover:bg-red-50">
                        <ArrowUpRight size={12} className="mr-1" /> Escalate
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION: OPERATIONS COMMAND CENTER ──────────────────────────────────────
function OpsCommandSection() {
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOps, setSelectedOps] = useState<typeof OPS_QUEUE[0] | null>(null);

  const filtered = useMemo(() => OPS_QUEUE.filter(r => {
    const matchPriority = priorityFilter === "all" || r.priority === priorityFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchPriority && matchStatus;
  }), [priorityFilter, statusFilter]);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Operations Command Center"
        description="Work queue and case management for enrollment operations staff"
      />

      <div className="grid grid-cols-4 gap-3">
        <KpiTile label="Open Cases"    value={OPS_QUEUE.filter(r => r.status === "Open").length}         color={C.red}    sub="unassigned" />
        <KpiTile label="In Progress"   value={OPS_QUEUE.filter(r => r.status === "In Progress").length}  color={C.blue}   sub="being worked" />
        <KpiTile label="SLA Breaches"  value={OPS_QUEUE.filter(r => r.slaBreached).length}               color={C.red}    sub="action required" />
        <KpiTile label="Escalated"     value={OPS_QUEUE.filter(r => r.status === "Escalated").length}    color={C.purple} sub="compliance / legal" />
      </div>

      <div className="flex items-center gap-3">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Escalated">Escalated</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} cases</span>
      </div>

      <div className="flex gap-4">
        <Card className="flex-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {["Record ID", "Member", "Issue Type", "Priority", "Source", "Assigned To", "SLA Remaining", "Status"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r.id + r.issue}
                    className={cn(
                      "border-b cursor-pointer transition-colors hover:bg-muted/40",
                      r.slaBreached && "bg-red-500/5",
                      selectedOps?.id === r.id && selectedOps?.issue === r.issue && "bg-primary/5 border-l-2 border-l-primary",
                      i % 2 === 0 ? "" : "bg-muted/10"
                    )}
                    onClick={() => setSelectedOps(selectedOps?.id === r.id && selectedOps?.issue === r.issue ? null : r)}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-blue-600 font-medium whitespace-nowrap">{r.id}</td>
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap">{r.member}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">{r.issue}</td>
                    <td className="px-4 py-2.5"><PriorityBadge priority={r.priority} /></td>
                    <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded text-xs font-medium bg-muted border">{r.source}</span></td>
                    <td className="px-4 py-2.5">
                      {r.assigned === "Unassigned"
                        ? <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        : <span className="text-xs font-medium">{r.assigned}</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn("text-xs font-bold tabular-nums", r.slaBreached ? "text-red-600" : r.slaHrs < 2 ? "text-amber-600" : "text-muted-foreground")}>
                        {r.slaBreached ? "⚠ BREACHED" : `${r.slaHrs}h`}
                      </span>
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {selectedOps && (
          <Card className="w-72 flex-shrink-0 h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xs font-mono text-blue-600">{selectedOps.id}</CardTitle>
                  <p className="text-sm font-semibold mt-0.5">{selectedOps.member}</p>
                </div>
                <button onClick={() => setSelectedOps(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                <span className="text-muted-foreground">Issue</span><span className="font-medium">{selectedOps.issue}</span>
                <span className="text-muted-foreground">Priority</span><PriorityBadge priority={selectedOps.priority} />
                <span className="text-muted-foreground">Source</span><span>{selectedOps.source}</span>
                <span className="text-muted-foreground">SLA Status</span>
                <span className={selectedOps.slaBreached ? "text-red-600 font-bold" : "text-muted-foreground"}>{selectedOps.slaBreached ? "⚠ Breached" : `${selectedOps.slaHrs}h remaining`}</span>
                <span className="text-muted-foreground">Assigned</span><span>{selectedOps.assigned}</span>
              </div>
              <div className="border-t pt-3 space-y-1.5">
                <p className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">Activity Log</p>
                <div className="space-y-2">
                  {[
                    { ts: "09:02", note: "Record escalated from intake validation", actor: "System" },
                    { ts: "09:05", note: "Assigned to ops queue — unassigned", actor: "System" },
                    { ts: "09:12", note: "Reviewed by supervisor", actor: selectedOps.assigned === "Unassigned" ? "On Hold" : selectedOps.assigned },
                  ].map((l, i) => (
                    <div key={i} className="pl-3 border-l-2 border-muted">
                      <p className="text-muted-foreground">{l.ts} — <span className="text-foreground">{l.note}</span></p>
                      <p className="text-muted-foreground/60">{l.actor}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-1.5 pt-1">
                <Button size="sm" className="flex-1 h-7 text-xs" style={{ background: C.blue }}>Assign</Button>
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">Resolve</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── SECTION: SYNDICATION ─────────────────────────────────────────────────────
function SyndicationSection() {
  const [retried, setRetried] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Syndication & Distribution"
        description="Real-time status of mastered records being syndicated to downstream systems"
      />

      {/* Flow diagram (CSS-based) */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Distribution Pipeline</CardTitle>
          <CardDescription>Mastered records → downstream system propagation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Source */}
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-primary/30 bg-primary/5 min-w-[120px] text-center">
              <Database size={22} style={{ color: C.blue }} />
              <p className="text-xs font-bold">Member Master</p>
              <p className="text-xs text-muted-foreground">31,940 records</p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-0.5 bg-primary/30 rounded relative">
                <div className="absolute inset-0 bg-primary/60 rounded animate-pulse" style={{ width: "75%" }} />
              </div>
              <span className="text-xs text-muted-foreground">Syndication Bus</span>
            </div>

            {/* Targets */}
            <div className="grid grid-cols-3 gap-3">
              {SYNDICATION_TARGETS.map(t => (
                <div key={t.id} className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border min-w-[110px] text-center",
                  t.status === "Synced" ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900/40"
                    : t.status === "Partial" ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40"
                    : "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/40"
                )}>
                  <Layers size={18} style={{ color: t.color }} />
                  <p className="text-xs font-bold">{t.label}</p>
                  <StatusBadge status={t.status} />
                  <p className="text-xs text-muted-foreground tabular-nums">{t.records.toLocaleString()} records</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Detail Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">System Sync Status</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Target System", "Status", "Records Synced", "Errors", "Last Attempt", "Action"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SYNDICATION_TARGETS.map((t, i) => (
                <tr key={t.id} className={cn("border-b transition-colors hover:bg-muted/30", i % 2 === 0 ? "" : "bg-muted/10")}>
                  <td className="px-4 py-3 font-medium">{t.label}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 tabular-nums font-medium">{t.records.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={cn("tabular-nums font-medium", t.errors > 0 ? "text-red-600" : "text-emerald-600")}>
                      {t.errors.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{t.lastAttempt}</td>
                  <td className="px-4 py-3">
                    {t.status !== "Synced" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => setRetried(s => new Set([...s, t.id]))}
                        disabled={retried.has(t.id)}
                      >
                        <RotateCcw size={11} />
                        {retried.has(t.id) ? "Retrying…" : "Retry"}
                      </Button>
                    )}
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

// ─── SECTION: RECONCILIATION ──────────────────────────────────────────────────
function ReconciliationSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Reconciliation & Feedback Loop"
        description="Downstream acknowledgements, closed-loop reconciliation, and open exception tracking"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiTile label="Total ACK"        value="159,504" sub="across all systems"    color={C.green}  />
        <KpiTile label="Total NACK"       value="196"     sub="rejection responses"   color={C.red}    />
        <KpiTile label="Pending"          value="31,940"  sub="API cache outstanding" color={C.amber}  />
        <KpiTile label="Overall Recon SLA"value="83.2%"   sub="all systems in scope"  color={C.blue}   />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">ACK / NACK by Target System</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {["System", "ACK", "NACK", "Pending", "SLA Compliance", "State"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECON_SYSTEMS.map((r, i) => (
                <tr key={r.system} className={cn("border-b hover:bg-muted/30 transition-colors", i % 2 === 0 ? "" : "bg-muted/10")}>
                  <td className="px-4 py-3 font-medium">{r.system}</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold tabular-nums">{r.ack.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={cn("font-bold tabular-nums", r.nack > 0 ? "text-red-600" : "text-muted-foreground")}>{r.nack}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("tabular-nums", r.pending > 0 ? "text-amber-600 font-bold" : "text-muted-foreground")}>{r.pending.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${r.sla}%`, background: r.sla >= 99 ? C.green : r.sla >= 90 ? C.amber : C.red }} />
                      </div>
                      <span className={cn("text-xs font-bold tabular-nums", r.sla >= 99 ? "text-emerald-600" : r.sla >= 90 ? "text-amber-600" : "text-red-600")}>{r.sla}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.sla === 100 ? "Passed" : r.sla === 0 ? "Failed" : "Warning"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Open Exception Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { system: "NASCX Platform",      count: 196,   desc: "196 records rejected due to plan code mismatch — batch correction in progress",                     sla: "Within SLA"   },
            { system: "API Eligibility Cache", count: 31940, desc: "Full sync failure due to API gateway certificate expiry — incident INC-2026-0104 open",           sla: "SLA Breached"  },
          ].map(e => (
            <div key={e.system} className="flex items-start gap-3 rounded-lg border p-3">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: e.sla === "SLA Breached" ? C.red : C.amber }} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{e.system}</p>
                  <StatusBadge status={e.sla === "SLA Breached" ? "Failed" : "Warning"} />
                  <span className="text-xs text-muted-foreground ml-auto">{e.count.toLocaleString()} records</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{e.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── SECTION: COMPLIANCE & AUDIT ─────────────────────────────────────────────
function ComplianceSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Compliance & Audit"
        description="Rule version governance, decision traceability, and audit-ready reporting"
      />

      <div className="grid grid-cols-3 gap-4">
        <KpiTile label="Active Rules"      value="6"     sub="in production"          color={C.blue}   />
        <KpiTile label="Audit Events Today"value="847"   sub="decision actions logged" color={C.purple} />
        <KpiTile label="Compliance Score"  value="97.3%" sub="across validation suite" color={C.green}  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule Version Registry */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Rule Version Registry</CardTitle>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1"><Download size={12} /> Export</Button>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {["Rule Name", "Version", "Updated", "Author", "Status"].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RULE_VERSIONS.map((r, i) => (
                  <tr key={r.rule} className={cn("border-b hover:bg-muted/30 transition-colors", i % 2 === 0 ? "" : "bg-muted/10")}>
                    <td className="px-4 py-2.5 font-medium text-xs">{r.rule}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-blue-600">{r.version}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.updated}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.author}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Decision Traceability */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Record Lineage — Sample Trace</CardTitle>
            <CardDescription>ENR-20240401-00788 · Patricia Harmon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { stage: "Intake",        ts: "09:00:11", note: "EDI 834 received via trading partner FTP",      status: "Passed"  },
                { stage: "Validation",    ts: "09:00:14", note: "Effective date rule violation detected",         status: "Warning" },
                { stage: "AI Analysis",   ts: "09:00:15", note: "Confidence 97% — effective date alignment rule", status: "Passed"  },
                { stage: "Remediation",   ts: "09:00:16", note: "Auto-applied: date corrected to 04/01/2026",    status: "Passed"  },
                { stage: "Mastering",     ts: "09:00:18", note: "Record merged into Member Master",               status: "Passed"  },
                { stage: "Syndication",   ts: "09:14:22", note: "Propagated to all 5 active target systems",     status: "Passed"  },
              ].map((step, i, arr) => (
                <div key={step.stage} className="flex items-start gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0",
                      step.status === "Passed" ? "bg-emerald-500" : step.status === "Warning" ? "bg-amber-500" : "bg-red-500"
                    )}>{i + 1}</div>
                    {i < arr.length - 1 && <div className="w-0.5 h-6 bg-border mt-1" />}
                  </div>
                  <div className="pt-0.5 pb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold">{step.stage}</p>
                      <span className="text-xs text-muted-foreground font-mono">{step.ts}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{step.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Audit Log</CardTitle>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
              <Download size={12} /> Export Audit Report
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {["Timestamp", "Actor", "Action", "Record", "Rule Applied", "Outcome"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOGS.map((l, i) => (
                <tr key={i} className={cn("border-b hover:bg-muted/30 transition-colors", i % 2 === 0 ? "" : "bg-muted/10")}>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{l.ts}</td>
                  <td className="px-4 py-2.5 text-xs font-medium whitespace-nowrap">{l.actor}</td>
                  <td className="px-4 py-2.5 text-xs whitespace-nowrap">{l.action}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-blue-600 whitespace-nowrap">{l.record}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{l.rule}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={l.outcome} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── SECTION: MEMBER SERVICES & CONTACT CENTER ───────────────────────────────
function MemberServicesSection() {
  const { periodOption } = useTimeRange();
  const { data: kpis, isLoading: isKpisLoading } = useGetContactCenterKpis({});
  const { data: reasons, isLoading: isReasonsLoading } = useGetTopCallReasons();
  const { data: hourly, isLoading: isHourlyLoading } = useGetHourlyCallVolume();

  const digitalKpis = [
    { label: "Chatbot Containment", key: "chatbotContainment" },
    { label: "Digital Adoption",    key: "digitalAdoption"    },
    { label: "Cases Opened",        key: "casesOpened"        },
    { label: "Member Complaints",   key: "memberComplaints"   },
  ] as const;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Member Services & Contact Center"
        description="Real-time contact center performance, digital engagement channels, and member support operations"
      />

      {/* Contact Channel Overview strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Headphones,    label: "Calls Received",        metric: kpis?.callsReceived,      color: "#0f62fe" },
          { icon: Clock,         label: "Avg Speed of Answer",   metric: kpis?.avgWaitTime,        color: "#009d9a" },
          { icon: XCircle,       label: "Abandonment Rate",      metric: kpis?.abandonmentRate,    color: "#da1e28" },
          { icon: CheckCircle2,  label: "First Call Resolution", metric: kpis?.firstCallResolution, color: "#24a148" },
        ].map(({ icon: Icon, label, metric, color }) => (
          <Card key={label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color }} />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
              </div>
              {isKpisLoading ? (
                <div className="h-7 w-24 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold tabular-nums" style={{ color }}>
                  {metric?.value ?? "—"}
                  {metric?.unit ? <span className="text-sm ml-1 font-normal text-muted-foreground">{metric.unit}</span> : null}
                </p>
              )}
              {metric?.trend && (
                <p className={cn("text-xs mt-1.5 font-medium", metric.trend.startsWith("+") ? "text-emerald-600" : metric.trend.startsWith("-") ? "text-red-500" : "text-muted-foreground")}>
                  {metric.trend}
                </p>
              )}
            </CardContent>
            <div className="absolute top-0 right-0 w-1 h-full" style={{ background: color }} />
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">Hourly Contact Volume</CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                {periodOption.shortLabel}
              </span>
            </div>
            <CardDescription>Calls and chats by hour — current day</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {isHourlyLoading ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Loading chart…</div>
            ) : hourly ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourly} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ccCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0f62fe" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0f62fe" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="ccChats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8a3ffc" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8a3ffc" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="calls" name="Calls" stroke="#0f62fe" fill="url(#ccCalls)" strokeWidth={2} />
                  <Area type="monotone" dataKey="chats" name="Chats" stroke="#8a3ffc" fill="url(#ccChats)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Call Reasons</CardTitle>
            <CardDescription>Primary contact drivers — current period</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {isReasonsLoading ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Loading chart…</div>
            ) : reasons ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reasons} layout="vertical" margin={{ top: 5, right: 24, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="reason" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={130} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Bar dataKey="count" name="Volume" fill="#0f62fe" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Digital engagement KPIs */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <MessageSquare size={13} />
          Digital Engagement Metrics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard title="Chatbot Containment" metric={kpis?.chatbotContainment} isLoading={isKpisLoading} />
          <KpiCard title="Digital Adoption"    metric={kpis?.digitalAdoption}    isLoading={isKpisLoading} />
          <KpiCard title="Cases Opened"        metric={kpis?.casesOpened}        isLoading={isKpisLoading} />
          <KpiCard title="Member Complaints"   metric={kpis?.memberComplaints}   isLoading={isKpisLoading} />
        </div>
      </div>

      {/* Service quality summary */}
      <Card className="border-primary/10 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#0f62fe15" }}>
              <Headphones size={16} style={{ color: "#0f62fe" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">IBM Contact Center Intelligence</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI-driven triage and sentiment analysis route members to the right resolution path before an agent picks up.
                Chatbot containment and digital adoption metrics reflect IBM's shift-left strategy —
                reducing cost per contact while improving member satisfaction scores.
                All live metrics are baselined at programme commencement and tracked against IBM's committed service targets on a monthly governance cadence.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── MEMBER DEMOGRAPHICS SECTION ─────────────────────────────────────────────
const MEMBER_PRODUCT_COLORS = ['#0f62fe', '#24a148', '#8a3ffc', '#002d9c', '#da1e28'];

function MemberDemographicsSection() {
  const { periodOption } = useTimeRange();
  const { data: kpis, isLoading: isKpisLoading } = useGetMemberKpis({});
  const { data: trends, isLoading: isTrendsLoading } = useGetEnrollmentTrends();
  const { data: products, isLoading: isProductsLoading } = useGetMembersByProduct();
  const slicedDaily = trends?.daily?.slice(-periodOption.days);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Active Members"    metric={kpis?.totalActiveMembers}    isLoading={isKpisLoading} />
        <KpiCard title="New Enrollments (Today)" metric={kpis?.newEnrollmentsToday}   isLoading={isKpisLoading} />
        <KpiCard title="Terminations"            metric={kpis?.terminations}           isLoading={isKpisLoading} />
        <KpiCard title="Exception Queue"         metric={kpis?.exceptionQueueSize}     isLoading={isKpisLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle>Enrollment Trends</CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                {periodOption.shortLabel}
              </span>
            </div>
            <CardDescription>{periodOption.label}</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isTrendsLoading ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : trends && slicedDaily ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={slicedDaily} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="enrollments" name="Enrollments" stroke="#24a148" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="terminations" name="Terminations" stroke="#da1e28" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members by Product</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isProductsLoading ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : products ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={products}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="product"
                  >
                    {products.map((_entry: unknown, index: number) => (
                      <Cell key={`cell-${index}`} fill={MEMBER_PRODUCT_COLORS[index % MEMBER_PRODUCT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => new Intl.NumberFormat('en-US').format(value)}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── OPERATIONS COPILOT ───────────────────────────────────────────────────────
function OperationsCopilot({ onClose, onViewQueue }: { onClose: () => void; onViewQueue: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 w-80 rounded-2xl border shadow-2xl bg-card z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ background: "linear-gradient(135deg, #1a237e 0%, #0f62fe 100%)" }}>
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-white" />
          <p className="text-sm font-semibold text-white">Operations Copilot</p>
          <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">Live</span>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white"><X size={16} /></button>
      </div>
      <div className="p-4 space-y-3 text-sm">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Queue Health Summary</p>
          <div className="rounded-lg bg-muted/50 border p-3 text-xs space-y-1.5">
            <div className="flex justify-between"><span>Records in queue</span><span className="font-bold text-amber-600">1,620</span></div>
            <div className="flex justify-between"><span>SLA compliance</span><span className="font-bold text-emerald-600">97.3%</span></div>
            <div className="flex justify-between"><span>SLA breaches</span><span className="font-bold text-red-600">1</span></div>
            <div className="flex justify-between"><span>Unassigned cases</span><span className="font-bold text-amber-600">2</span></div>
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority Recommendations</p>
          {[
            { icon: AlertTriangle, color: C.red,   text: "ENR-00895 (James Okafor) — SLA breached. Assign immediately." },
            { icon: AlertCircle,   color: C.amber, text: "API Eligibility Cache sync failed. INC-2026-0104 open. Escalate to infra." },
            { icon: Bot,           color: C.blue,  text: "4 auto-remediations ready to apply — review AI Remediation section." },
          ].map(({ icon: Icon, color, text }, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <Icon size={13} className="flex-shrink-0 mt-0.5" style={{ color }} />
              <p className="text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
        <div className="pt-1">
          <Button size="sm" className="w-full text-xs h-8" style={{ background: C.blue }} onClick={onViewQueue}>
            <Activity size={12} className="mr-1.5" /> View Full Queue Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EnrollmentIntelligence() {
  const [activeTab, setActiveTab] = useState("overview");
  const [copilotOpen, setCopilotOpen] = useState(true);

  const TABS = [
    { id: "overview",            label: "Overview",            icon: Activity  },
    { id: "member-demographics", label: "Member Demographics", icon: Users     },
    { id: "ops",                 label: "Operations Command",  icon: Users     },
    { id: "syndication",         label: "Syndication",         icon: GitBranch },
    { id: "reconciliation",      label: "Reconciliation",      icon: RefreshCw },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Operations</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Member & Enrollment Operations</h1>
          <p className="text-muted-foreground mt-1">Enrollment pipeline, member demographics, member services, and operations command</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/dashboard/digital-front-door-roadmap">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-9 border-primary/30 hover:border-primary/60 hover:text-primary" style={{ borderColor: "#0f62fe30" }}>
              <Layers size={14} style={{ color: C.blue }} />
              Digital Front Door Roadmap
            </Button>
          </Link>
          <Button
            size="sm"
            variant={copilotOpen ? "default" : "outline"}
            className="gap-1.5 text-xs h-9"
            style={copilotOpen ? { background: C.blue } : {}}
            onClick={() => setCopilotOpen(v => !v)}
          >
            <Bot size={14} />
            {copilotOpen ? "Hide Copilot" : "Operations Copilot"}
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-9">
            <Download size={14} /> Export
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-9">
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>

      {/* Sub-navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Tab bar */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-none">
            {TABS.map(({ id, label, icon: Icon }, idx) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 px-6 py-4 min-w-[120px] flex-1 transition-all duration-150 select-none",
                  idx !== TABS.length - 1 && "border-r border-border",
                  activeTab === id
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    "transition-colors",
                    activeTab === id ? "text-primary" : "text-muted-foreground/70"
                  )}
                />
                <span className={cn(
                  "text-xs font-medium text-center leading-tight whitespace-nowrap",
                  activeTab === id && "font-semibold"
                )}>
                  {label}
                </span>
                {activeTab === id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: "#0f62fe" }} />
                )}
              </button>
            ))}
          </div>
        </div>

        <TabsContent value="overview"             className="mt-6"><OverviewSection /></TabsContent>
        <TabsContent value="member-demographics"  className="mt-6"><MemberDemographicsSection /></TabsContent>
        <TabsContent value="ops"                  className="mt-6"><OpsCommandSection /></TabsContent>
        <TabsContent value="syndication"          className="mt-6"><SyndicationSection /></TabsContent>
        <TabsContent value="reconciliation"       className="mt-6"><ReconciliationSection /></TabsContent>
      </Tabs>

      {/* Floating Copilot */}
      {copilotOpen && (
        <OperationsCopilot
          onClose={() => setCopilotOpen(false)}
          onViewQueue={() => { setActiveTab("ops"); setCopilotOpen(false); }}
        />
      )}
    </div>
  );
}
