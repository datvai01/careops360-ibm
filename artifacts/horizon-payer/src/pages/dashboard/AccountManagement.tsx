import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  BriefcaseIcon,
  CalendarIcon,
  UsersIcon,
  DollarSignIcon,
  CpuIcon,
  RocketIcon,
  PieChartIcon,
  InfoIcon,
  DownloadIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  ExternalLinkIcon,
  ClipboardListIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import VendorInvoices from "./VendorInvoices";

const IBM_BLUE = "#0f62fe";
const GREEN = "#24a148";
const PURPLE = "#8a3ffc";
const ORANGE = "#ff832b";
const API = `${import.meta.env.BASE_URL}api`;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("horizon_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

async function apiSend(method: string, path: string, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data;
}

type ActionItem = { id: number; item: string; latestUpdate: string; status: string; owner: string; progressSource: string; updatedAt: string };
type Initiative = { id: number; title: string; description: string; actions: string; owner: string; nextSteps: string; status: string; updatedAt: string };
type Meeting = { id: number; domainArea: string; meetingDate: string; horizonAttendees: string; ibmAttendees: string; deckLink: string };
type HeadcountRow = { id: number; monthLabel: string; startHc: number; onboards: number; offboards: number; endHc: number; attritionPct: number };
type StaffChange = { id: number; personName: string; team: string; changeType: string; reason: string };
type InvoiceRow = { id: number; sow: string; lineItem: string; hours: number; amountUsd: number };
type HourlyTrend = { id: number; monthLabel: string; onshoreNonCr: number; offshoreNonCr: number; onshoreCr: number; offshoreCr: number };
type MipsTrend = { id: number; monthLabel: string; usageK: number; baselineK: number; note: string };
type MipsInsight = { id: number; section: string; title: string; detail: string; ord: number };
type TeamComp = { id: number; category: string; label: string; value: number; unit: string; note: string };
type OtherUpdate = { id: number; title: string; detail: string; status: string };

type AdmReport = {
  month: string;
  actionItems: ActionItem[];
  initiatives: Initiative[];
  meetings: Meeting[];
  headcount: HeadcountRow[];
  staffChanges: StaffChange[];
  invoiceSummary: InvoiceRow[];
  hourlyTrends: HourlyTrend[];
  mipsTrend: MipsTrend[];
  mipsInsights: MipsInsight[];
  teamComposition: TeamComp[];
  otherUpdates: OtherUpdate[];
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Open: "bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800",
    "In Progress": "bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800",
    Closed: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
    Active: "bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800",
    "On Hold": "bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800",
    Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
  };
  return (
    <Badge variant="outline" className={`text-[10px] whitespace-nowrap font-medium ${map[status] ?? ""}`}>
      {status}
    </Badge>
  );
}

function SectionCard({
  icon: Icon,
  num,
  title,
  description,
  children,
  actions,
}: {
  icon: React.ElementType;
  num: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${IBM_BLUE}14` }}>
              <Icon className="w-4 h-4" style={{ color: IBM_BLUE }} />
            </div>
            <div>
              <CardTitle className="text-base">
                <span className="text-muted-foreground mr-1.5">{num}.</span>
                {title}
              </CardTitle>
              {description && <CardDescription className="text-xs mt-0.5">{description}</CardDescription>}
            </div>
          </div>
          {actions}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

// ─── Action Items (editable) ─────────────────────────────────────────────────

const EMPTY_ACTION = { item: "", latestUpdate: "", status: "Open", owner: "", progressSource: "" };

function ActionItemsSection({ items, isAdmin }: { items: ActionItem[]; isAdmin: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<(typeof EMPTY_ACTION & { id?: number }) | null>(null);

  const save = useMutation({
    mutationFn: async (form: typeof EMPTY_ACTION & { id?: number }) =>
      form.id ? apiSend("PATCH", `/adm/action-items/${form.id}`, form) : apiSend("POST", "/adm/action-items", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adm-report"] });
      setEditing(null);
      toast({ title: "Action item saved" });
    },
    onError: (e: Error) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });
  const remove = useMutation({
    mutationFn: async (id: number) => apiSend("DELETE", `/adm/action-items/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adm-report"] });
      toast({ title: "Action item deleted" });
    },
    onError: (e: Error) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  return (
    <SectionCard
      icon={ClipboardListIcon}
      num={1}
      title="Action Items"
      description="Living list maintained by the IBM account team"
      actions={
        isAdmin && (
          <Button size="sm" className="h-8 text-xs" onClick={() => setEditing({ ...EMPTY_ACTION })}>
            <PlusIcon className="w-3.5 h-3.5 mr-1" /> Add item
          </Button>
        )
      }
    >
      <div className="rounded-lg border overflow-auto">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Action Item</TableHead>
              <TableHead>Latest Update</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Progress Source</TableHead>
              {isAdmin && <TableHead className="w-20" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-6 text-sm text-muted-foreground">
                  No action items yet
                </TableCell>
              </TableRow>
            )}
            {items.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="text-sm font-medium max-w-[260px]">{a.item}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[280px]">{a.latestUpdate}</TableCell>
                <TableCell>{statusBadge(a.status)}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">{a.owner}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{a.progressSource}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditing({ id: a.id, item: a.item, latestUpdate: a.latestUpdate, status: a.status, owner: a.owner, progressSource: a.progressSource })}>
                        <PencilIcon className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => remove.mutate(a.id)}>
                        <Trash2Icon className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit action item" : "New action item"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Action item</Label>
                <Textarea value={editing.item} onChange={(e) => setEditing({ ...editing, item: e.target.value })} rows={2} />
              </div>
              <div>
                <Label className="text-xs">Latest update</Label>
                <Textarea value={editing.latestUpdate} onChange={(e) => setEditing({ ...editing, latestUpdate: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Open", "In Progress", "Closed"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Owner</Label>
                  <Input value={editing.owner} onChange={(e) => setEditing({ ...editing, owner: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Progress update source</Label>
                <Input value={editing.progressSource} onChange={(e) => setEditing({ ...editing, progressSource: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button disabled={!editing?.item.trim() || save.isPending} onClick={() => editing && save.mutate(editing)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}

// ─── Initiatives (editable) ──────────────────────────────────────────────────

const EMPTY_INITIATIVE = { title: "", description: "", actions: "", owner: "", nextSteps: "", status: "Active" };

function InitiativesSection({ initiatives, isAdmin }: { initiatives: Initiative[]; isAdmin: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<(typeof EMPTY_INITIATIVE & { id?: number }) | null>(null);

  const save = useMutation({
    mutationFn: async (form: typeof EMPTY_INITIATIVE & { id?: number }) =>
      form.id ? apiSend("PATCH", `/adm/initiatives/${form.id}`, form) : apiSend("POST", "/adm/initiatives", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adm-report"] });
      setEditing(null);
      toast({ title: "Initiative saved" });
    },
    onError: (e: Error) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });
  const remove = useMutation({
    mutationFn: async (id: number) => apiSend("DELETE", `/adm/initiatives/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adm-report"] });
      toast({ title: "Initiative deleted" });
    },
    onError: (e: Error) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  return (
    <SectionCard
      icon={RocketIcon}
      num={6}
      title="Transformation Initiatives"
      description="Actions, owners, and next steps — maintained by the IBM account team"
      actions={
        isAdmin && (
          <Button size="sm" className="h-8 text-xs" onClick={() => setEditing({ ...EMPTY_INITIATIVE })}>
            <PlusIcon className="w-3.5 h-3.5 mr-1" /> Add initiative
          </Button>
        )
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        {initiatives.length === 0 && <p className="text-sm text-muted-foreground py-4">No initiatives yet</p>}
        {initiatives.map((i) => (
          <div key={i.id} className="rounded-lg border p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold">{i.title}</p>
              <div className="flex items-center gap-1">
                {statusBadge(i.status)}
                {isAdmin && (
                  <>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditing({ id: i.id, title: i.title, description: i.description, actions: i.actions, owner: i.owner, nextSteps: i.nextSteps, status: i.status })}>
                      <PencilIcon className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => remove.mutate(i.id)}>
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            {i.description && <p className="text-xs text-muted-foreground">{i.description}</p>}
            {i.actions && (
              <p className="text-xs"><span className="font-medium">Actions:</span> <span className="text-muted-foreground">{i.actions}</span></p>
            )}
            {i.nextSteps && (
              <p className="text-xs"><span className="font-medium">Next steps:</span> <span className="text-muted-foreground">{i.nextSteps}</span></p>
            )}
            {i.owner && <p className="text-[11px] text-muted-foreground">Owner: {i.owner}</p>}
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit initiative" : "New initiative"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
              </div>
              <div>
                <Label className="text-xs">Actions</Label>
                <Textarea value={editing.actions} onChange={(e) => setEditing({ ...editing, actions: e.target.value })} rows={2} />
              </div>
              <div>
                <Label className="text-xs">Next steps</Label>
                <Textarea value={editing.nextSteps} onChange={(e) => setEditing({ ...editing, nextSteps: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Owner</Label>
                  <Input value={editing.owner} onChange={(e) => setEditing({ ...editing, owner: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Active", "On Hold", "Completed"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button disabled={!editing?.title.trim() || save.isPending} onClick={() => editing && save.mutate(editing)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AccountManagement() {
  const { data: currentUser } = useGetCurrentUser();
  const isAdmin = (currentUser?.role as string | undefined) === "admin";
  const { toast } = useToast();
  const [month, setMonth] = useState<string>("");
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: months = [] } = useQuery<string[]>({
    queryKey: ["adm-months"],
    queryFn: () => apiGet<string[]>("/adm/months"),
  });
  const activeMonth = month || months[0] || "";

  const { data: report, isLoading } = useQuery<AdmReport>({
    queryKey: ["adm-report", activeMonth],
    queryFn: () => apiGet<AdmReport>(`/adm/report?month=${encodeURIComponent(activeMonth)}`),
    enabled: !!activeMonth,
  });

  const exportPdf = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API}/adm/export-pdf?month=${encodeURIComponent(activeMonth)}`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ADM-Report-${activeMonth.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast({ title: "PDF export failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const latestHc = report?.headcount[report.headcount.length - 1];
  const latestMips = report?.mipsTrend[report.mipsTrend.length - 1];
  const invoiceTotal = (report?.invoiceSummary ?? []).reduce((s, r) => s + r.amountUsd, 0);
  const invoiceHours = (report?.invoiceSummary ?? []).reduce((s, r) => s + r.hours, 0);

  const teamCats = [...new Set((report?.teamComposition ?? []).map((t) => t.category))];

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5" style={{ color: IBM_BLUE }} />
            Account Management
          </h1>
          <p className="text-sm text-muted-foreground">Monthly ADM report — IBM × Horizon BCBS{!isAdmin && " (read-only)"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={activeMonth} onValueChange={setMonth}>
            <SelectTrigger className="h-9 w-36">
              <CalendarIcon className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportPdf} disabled={!activeMonth || exporting} className="h-9 text-xs">
            <DownloadIcon className="w-3.5 h-3.5 mr-1.5" />
            {exporting ? "Exporting…" : "Export PDF"}
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground py-8 text-center">Loading report…</p>}
      {!isLoading && !activeMonth && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No report months available yet. {isAdmin ? "Upload the ADM workbook via Administration." : "Check back soon."}
        </p>
      )}

      {report && (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground uppercase">IBM Team @ Horizon</p>
              <p className="text-2xl font-bold tabular-nums">{latestHc?.endHc ?? "—"}</p>
              <p className="text-[11px] text-muted-foreground">End HC · attrition {latestHc?.attritionPct ?? "—"}%</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground uppercase">Invoiced ({report.month})</p>
              <p className="text-2xl font-bold tabular-nums">${(invoiceTotal / 1e6).toFixed(2)}M</p>
              <p className="text-[11px] text-muted-foreground">{invoiceHours.toLocaleString()} hours across T&M SOWs</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground uppercase">MIPS Usage</p>
              <p className="text-2xl font-bold tabular-nums">{latestMips ? `${latestMips.usageK}K` : "—"}</p>
              <p className="text-[11px] text-muted-foreground">vs {latestMips?.baselineK ?? 96}K contracted baseline</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground uppercase">Open Action Items</p>
              <p className="text-2xl font-bold tabular-nums">{report.actionItems.filter((a) => a.status !== "Closed").length}</p>
              <p className="text-[11px] text-muted-foreground">{report.initiatives.filter((i) => i.status === "Active").length} active initiatives</p>
            </CardContent></Card>
          </div>

          {/* 1. Action items */}
          <ActionItemsSection items={report.actionItems} isAdmin={isAdmin} />

          {/* 2. Director meetings */}
          <SectionCard icon={CalendarIcon} num={2} title="Monthly Meetings with Directors" description={`Director-level reviews held in ${report.month}`}>
            <div className="rounded-lg border overflow-auto">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead>Domain / Area</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Horizon Attendees</TableHead>
                    <TableHead>IBM Attendees</TableHead>
                    <TableHead>Deck</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.meetings.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">No meetings recorded for {report.month}</TableCell></TableRow>
                  )}
                  {report.meetings.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm font-medium">{m.domainArea}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{m.meetingDate}</TableCell>
                      <TableCell className="text-xs">{m.horizonAttendees}</TableCell>
                      <TableCell className="text-xs">{m.ibmAttendees}</TableCell>
                      <TableCell>
                        {m.deckLink ? (
                          <a href={m.deckLink} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 hover:underline" style={{ color: IBM_BLUE }}>
                            Shared deck <ExternalLinkIcon className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>

          {/* 3. IBM Team @ Horizon */}
          <SectionCard icon={UsersIcon} num={3} title="IBM Team @ Horizon" description="Monthly headcount, onboards, offboards, and attrition">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={report.headcount} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="monthLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis yAxisId="hc" domain={["dataMin - 5", "dataMax + 5"]} tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="pct" orientation="right" tick={{ fontSize: 10 }} unit="%" />
                    <RTooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line yAxisId="hc" type="monotone" dataKey="endHc" name="End HC" stroke={IBM_BLUE} strokeWidth={2} dot={false} />
                    <Line yAxisId="pct" type="monotone" dataKey="attritionPct" name="Attrition %" stroke={ORANGE} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-lg border overflow-auto max-h-64">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted/60 z-10">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.staffChanges.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center py-6 text-sm text-muted-foreground">No staff changes for {report.month}</TableCell></TableRow>
                    )}
                    {report.staffChanges.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-sm">{s.personName}</TableCell>
                        <TableCell className="text-xs">{s.team}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${s.changeType === "Onboard" ? "text-emerald-600 border-emerald-200" : "text-amber-600 border-amber-200"}`}>
                            {s.changeType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{s.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </SectionCard>

          {/* 4. Invoice summary */}
          <SectionCard
            icon={DollarSignIcon}
            num={4}
            title="Invoice Summary"
            description={`T&M invoices for ${report.month} and hourly trends`}
            actions={
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowInvoiceDetail((v) => !v)}>
                {showInvoiceDetail ? "Hide invoice detail" : "Vendor invoice detail"}
              </Button>
            }
          >
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/60">
                    <TableRow>
                      <TableHead>SOW</TableHead>
                      <TableHead>Line Item</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.invoiceSummary.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center py-6 text-sm text-muted-foreground">No invoice rows for {report.month}</TableCell></TableRow>
                    )}
                    {report.invoiceSummary.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs font-medium whitespace-nowrap">{r.sow}</TableCell>
                        <TableCell className="text-xs">{r.lineItem}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{r.hours.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs font-semibold tabular-nums">${r.amountUsd.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {report.invoiceSummary.length > 0 && (
                      <TableRow className="bg-muted/40 font-semibold">
                        <TableCell className="text-xs" colSpan={2}>Total</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{invoiceHours.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">${invoiceTotal.toLocaleString()}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report.hourlyTrends} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="monthLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <RTooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="offshoreNonCr" name="Offshore Non-CR" stackId="1" stroke={IBM_BLUE} fill={`${IBM_BLUE}55`} />
                    <Area type="monotone" dataKey="onshoreNonCr" name="Onshore Non-CR" stackId="1" stroke={PURPLE} fill={`${PURPLE}55`} />
                    <Area type="monotone" dataKey="offshoreCr" name="Offshore CareRadius" stackId="1" stroke={GREEN} fill={`${GREEN}55`} />
                    <Area type="monotone" dataKey="onshoreCr" name="Onshore CareRadius" stackId="1" stroke={ORANGE} fill={`${ORANGE}55`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            {showInvoiceDetail && (
              <div className="mt-4 border-t pt-4">
                <VendorInvoices />
              </div>
            )}
          </SectionCard>

          {/* 5. MIPS */}
          <SectionCard icon={CpuIcon} num={5} title="MIPS Usage & Capacity" description="Usage trend vs contracted baseline, optimization impact, and re-baseline recommendation">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={report.mipsTrend} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="monthLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} unit="K" domain={[0, 110]} />
                    <RTooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <ReferenceLine y={96} stroke="#da1e28" strokeDasharray="6 3" label={{ value: "96K baseline", fontSize: 10, fill: "#da1e28", position: "insideTopRight" }} />
                    <Line type="monotone" dataKey="usageK" name="Usage (K MIPS)" stroke={IBM_BLUE} strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {report.mipsInsights.map((ins) => (
                  <div key={ins.id} className="rounded-lg border p-3">
                    <Badge variant="outline" className="text-[10px] mb-1" style={{ color: IBM_BLUE, borderColor: `${IBM_BLUE}55` }}>{ins.section}</Badge>
                    <p className="text-sm font-medium">{ins.title}</p>
                    {ins.detail && <p className="text-xs text-muted-foreground mt-1">{ins.detail}</p>}
                  </div>
                ))}
                {report.mipsInsights.length === 0 && <p className="text-sm text-muted-foreground py-4">No MIPS insights for {report.month}</p>}
              </div>
            </div>
          </SectionCard>

          {/* 6. Initiatives */}
          <InitiativesSection initiatives={report.initiatives} isAdmin={isAdmin} />

          {/* 7. Team composition */}
          <SectionCard icon={PieChartIcon} num={7} title="Team Composition" description="Technology mix, diversity, experience, and attrition vs industry benchmark">
            <div className="grid md:grid-cols-2 gap-4">
              {teamCats.map((cat) => {
                const rows = report.teamComposition.filter((t) => t.category === cat);
                return (
                  <div key={cat} className="rounded-lg border p-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{cat}</p>
                    {cat === "Technology Mix" ? (
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 40 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={120} />
                            <RTooltip formatter={(v: number) => `${v}%`} />
                            <Bar dataKey="value" fill={IBM_BLUE} radius={[0, 4, 4, 0]} barSize={14} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {rows.map((t) => (
                          <div key={t.id} className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm">{t.label}</p>
                              {t.note && <p className="text-[11px] text-muted-foreground">{t.note}</p>}
                            </div>
                            <p className="text-lg font-bold tabular-nums" style={{ color: cat === "Attrition Benchmark" && t.label.toLowerCase().includes("account") ? GREEN : undefined }}>
                              {t.value}{t.unit}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {teamCats.length === 0 && <p className="text-sm text-muted-foreground py-4">No team composition data for {report.month}</p>}
            </div>
          </SectionCard>

          {/* 8. Other updates */}
          <SectionCard icon={InfoIcon} num={8} title="Other Updates" description="NSA/NSSD and other programme updates">
            <div className="space-y-3">
              {report.otherUpdates.length === 0 && <p className="text-sm text-muted-foreground py-4">No other updates for {report.month}</p>}
              {report.otherUpdates.map((o) => (
                <div key={o.id} className="rounded-lg border p-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{o.title}</p>
                    {o.detail && <p className="text-xs text-muted-foreground mt-1">{o.detail}</p>}
                  </div>
                  {statusBadge(o.status)}
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
