import { useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  LayoutDashboardIcon,
  ArrowRightIcon,
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

type ActionItem = { id: number; item: string; latestUpdate: string; status: string; owner: string; progressSource: string; createdAt?: string; updatedAt: string };
type Initiative = { id: number; title: string; description: string; actions: string; owner: string; nextSteps: string; status: string; updatedAt: string };
type Meeting = { id: number; domainArea: string; meetingDate: string; horizonAttendees: string; ibmAttendees: string; deckLink: string };
type HeadcountRow = { id: number; monthLabel: string; startHc: number; onboards: number; offboards: number; endHc: number; attritionPct: number };
type StaffChange = { id: number; personName: string; team: string; changeType: string; reason: string };
type InvoiceRow = { id: number; invoiceNo: string; poNumber: string; sow: string; lineItem: string; hours: number; amountUsd: number; note: string };
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

const TAB_DEFS = [
  { key: "overview", label: "Overview", icon: LayoutDashboardIcon },
  { key: "action-items", label: "Action Items", icon: ClipboardListIcon },
  { key: "meetings", label: "Key Monthly Meeting", icon: CalendarIcon },
  { key: "ibm-team", label: "IBM Team", icon: UsersIcon },
  { key: "invoices", label: "Invoice Summary", icon: DollarSignIcon },
  { key: "mips", label: "MIPS", icon: CpuIcon },
  { key: "initiatives", label: "Initiatives", icon: RocketIcon },
  { key: "team-composition", label: "Team Composition", icon: PieChartIcon },
  { key: "other-updates", label: "Other Updates", icon: InfoIcon },
] as const;
type TabKey = (typeof TAB_DEFS)[number]["key"];
const TAB_KEYS = TAB_DEFS.map((t) => t.key) as readonly string[];

function fmtTimestamp(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

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
  title,
  description,
  children,
  actions,
}: {
  icon: React.ElementType;
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
              <CardTitle className="text-base">{title}</CardTitle>
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

// ─── Action Items tab (editable, filterable, detail panel) ──────────────────

const EMPTY_ACTION = { item: "", latestUpdate: "", status: "Open", owner: "", progressSource: "" };

function ActionItemsTab({ items, isAdmin }: { items: ActionItem[]; isAdmin: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<(typeof EMPTY_ACTION & { id?: number }) | null>(null);
  const [detail, setDetail] = useState<ActionItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");

  const owners = useMemo(() => [...new Set(items.map((a) => a.owner).filter(Boolean))].sort(), [items]);
  const filtered = items.filter(
    (a) => (statusFilter === "all" || a.status === statusFilter) && (ownerFilter === "all" || a.owner === ownerFilter),
  );

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

  const counts = {
    open: items.filter((a) => a.status === "Open").length,
    inProgress: items.filter((a) => a.status === "In Progress").length,
    closed: items.filter((a) => a.status === "Closed").length,
  };

  return (
    <SectionCard
      icon={ClipboardListIcon}
      title="Action Items"
      description="Current living list (not month-scoped) maintained by the IBM account team — click any row for full detail"
      actions={
        isAdmin && (
          <Button size="sm" className="h-8 text-xs" onClick={() => setEditing({ ...EMPTY_ACTION })}>
            <PlusIcon className="w-3.5 h-3.5 mr-1" /> Add item
          </Button>
        )
      }
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="flex gap-2 text-xs text-muted-foreground mr-auto">
          <span>{counts.open} open</span>·<span>{counts.inProgress} in progress</span>·<span>{counts.closed} closed</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["Open", "In Progress", "Closed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All owners</SelectItem>
            {owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-auto">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead>Action Item</TableHead>
              <TableHead>Latest Update</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Progress Source</TableHead>
              <TableHead>Last Updated</TableHead>
              {isAdmin && <TableHead className="w-20" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-6 text-sm text-muted-foreground">
                  {items.length === 0 ? "No action items yet" : "No items match the current filters"}
                </TableCell>
              </TableRow>
            )}
            {filtered.map((a) => (
              <TableRow key={a.id} className="cursor-pointer" onClick={() => setDetail(a)}>
                <TableCell className="text-sm font-medium max-w-[260px]">{a.item}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[320px]">{a.latestUpdate}</TableCell>
                <TableCell>{statusBadge(a.status)}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">{a.owner}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{a.progressSource}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtTimestamp(a.updatedAt)}</TableCell>
                {isAdmin && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
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

      {/* Detail panel */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="pr-6">{detail?.item}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">{statusBadge(detail.status)}</div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Latest update</p>
                <p className="whitespace-pre-wrap">{detail.latestUpdate || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Owner</p>
                  <p>{detail.owner || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Progress source</p>
                  <p>{detail.progressSource || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Created</p>
                  <p className="text-xs">{fmtTimestamp(detail.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Last updated</p>
                  <p className="text-xs">{fmtTimestamp(detail.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {isAdmin && detail && (
              <Button variant="outline" onClick={() => { setEditing({ id: detail.id, item: detail.item, latestUpdate: detail.latestUpdate, status: detail.status, owner: detail.owner, progressSource: detail.progressSource }); setDetail(null); }}>
                <PencilIcon className="w-3.5 h-3.5 mr-1.5" /> Edit
              </Button>
            )}
            <Button onClick={() => setDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

// ─── Invoices tab (editable) ─────────────────────────────────────────────────

const EMPTY_INVOICE = { invoiceNo: "", poNumber: "", sow: "", lineItem: "", hours: 0, amountUsd: 0, note: "" };
type InvoiceForm = typeof EMPTY_INVOICE & { id?: number };

const fmtUsd = (n: number) =>
  `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function InvoicesTab({ rows, month, isAdmin }: { rows: InvoiceRow[]; month: string; isAdmin: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<InvoiceForm | null>(null);

  const save = useMutation({
    mutationFn: async (form: InvoiceForm) =>
      form.id
        ? apiSend("PATCH", `/adm/invoices/${form.id}`, form)
        : apiSend("POST", "/adm/invoices", { ...form, reportMonth: month }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adm-report"] });
      setEditing(null);
      toast({ title: "Invoice row saved" });
    },
    onError: (e: Error) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });
  const remove = useMutation({
    mutationFn: async (id: number) => apiSend("DELETE", `/adm/invoices/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adm-report"] });
      toast({ title: "Invoice row deleted" });
    },
    onError: (e: Error) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  const grandTotal = rows.reduce((s, r) => s + r.amountUsd, 0);

  // Group rows into invoices by invoice number (unlabeled rows grouped as "—")
  const invoices = useMemo(() => {
    const map = new Map<string, { invoiceNo: string; poNumber: string; note: string; total: number; lines: InvoiceRow[] }>();
    for (const r of rows) {
      const key = r.invoiceNo || "—";
      const cur = map.get(key) ?? { invoiceNo: key, poNumber: r.poNumber, note: r.note, total: 0, lines: [] };
      cur.total += r.amountUsd;
      cur.lines.push(r);
      if (!cur.poNumber && r.poNumber) cur.poNumber = r.poNumber;
      if (!cur.note && r.note) cur.note = r.note;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => a.invoiceNo.localeCompare(b.invoiceNo));
  }, [rows]);

  return (
    <>
      <SectionCard
        icon={DollarSignIcon}
        title={`Invoice — ${month}`}
        description="Invoices submitted for the month, by invoice and purchase order"
        actions={
          isAdmin && (
            <Button size="sm" className="h-8 text-xs" onClick={() => setEditing({ ...EMPTY_INVOICE })}>
              <PlusIcon className="w-3.5 h-3.5 mr-1" /> Add line item
            </Button>
          )
        }
      >
        {/* Summary by invoice */}
        <div className="rounded-lg border overflow-auto mb-4">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>PO Number</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center py-6 text-sm text-muted-foreground">No invoices for {month}</TableCell></TableRow>
              )}
              {invoices.map((inv) => (
                <TableRow key={inv.invoiceNo}>
                  <TableCell className="text-xs font-semibold whitespace-nowrap">{inv.invoiceNo}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{inv.poNumber || "—"}</TableCell>
                  <TableCell className={`text-right text-xs font-semibold tabular-nums ${inv.total < 0 ? "text-destructive" : ""}`}>{fmtUsd(inv.total)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[380px]">{inv.note}</TableCell>
                </TableRow>
              ))}
              {invoices.length > 0 && (
                <TableRow className="bg-muted/40 font-semibold">
                  <TableCell className="text-xs" colSpan={2}>Grand total</TableCell>
                  <TableCell className={`text-right text-xs tabular-nums ${grandTotal < 0 ? "text-destructive" : ""}`}>{fmtUsd(grandTotal)}</TableCell>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Per-invoice line-item detail */}
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div key={inv.invoiceNo} className="rounded-lg border overflow-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-muted/40 border-b">
                <p className="text-xs font-semibold">
                  Invoice {inv.invoiceNo}
                  {inv.poNumber && <span className="text-muted-foreground font-normal"> · {inv.poNumber}</span>}
                </p>
                <p className={`text-xs font-semibold tabular-nums ${inv.total < 0 ? "text-destructive" : ""}`}>{fmtUsd(inv.total)}</p>
              </div>
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>SOW</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    {isAdmin && <TableHead className="w-20" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inv.lines.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs">{r.lineItem}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">{r.sow}</TableCell>
                      <TableCell className="text-right text-xs tabular-nums">{r.hours ? r.hours.toLocaleString() : "—"}</TableCell>
                      <TableCell className={`text-right text-xs font-medium tabular-nums ${r.amountUsd < 0 ? "text-destructive" : ""}`}>{fmtUsd(r.amountUsd)}</TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditing({ id: r.id, invoiceNo: r.invoiceNo, poNumber: r.poNumber, sow: r.sow, lineItem: r.lineItem, hours: r.hours, amountUsd: r.amountUsd, note: r.note })}>
                              <PencilIcon className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => remove.mutate(r.id)}>
                              <Trash2Icon className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {inv.note && <p className="px-3 py-2 text-[11px] text-muted-foreground border-t">{inv.note}</p>}
            </div>
          ))}
        </div>
      </SectionCard>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit invoice line item" : `New invoice line item — ${month}`}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Invoice No</Label>
                  <Input value={editing.invoiceNo} onChange={(e) => setEditing({ ...editing, invoiceNo: e.target.value })} placeholder="HBC0726a" />
                </div>
                <div>
                  <Label className="text-xs">PO Number</Label>
                  <Input value={editing.poNumber} onChange={(e) => setEditing({ ...editing, poNumber: e.target.value })} placeholder="PO-016703" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={editing.lineItem} onChange={(e) => setEditing({ ...editing, lineItem: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">SOW</Label>
                  <Input value={editing.sow} onChange={(e) => setEditing({ ...editing, sow: e.target.value })} placeholder="T&M CareRadius" />
                </div>
                <div>
                  <Label className="text-xs">Hours</Label>
                  <Input type="number" value={editing.hours} onChange={(e) => setEditing({ ...editing, hours: Number(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label className="text-xs">Amount (USD)</Label>
                  <Input type="number" step="0.01" value={editing.amountUsd} onChange={(e) => setEditing({ ...editing, amountUsd: Number(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Note</Label>
                <Textarea value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} rows={2} placeholder="e.g. Purchase Order reference or credit explanation" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button disabled={!editing?.lineItem.trim() || save.isPending} onClick={() => editing && save.mutate(editing)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Initiatives tab (editable) ──────────────────────────────────────────────

const EMPTY_INITIATIVE = { title: "", description: "", actions: "", owner: "", nextSteps: "", status: "Active" };

function InitiativesTab({ initiatives, isAdmin }: { initiatives: Initiative[]; isAdmin: boolean }) {
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
      title="Transformation Initiatives"
      description="Current living list (not month-scoped) — actions, owners, and next steps maintained by the IBM account team"
      actions={
        isAdmin && (
          <Button size="sm" className="h-8 text-xs" onClick={() => setEditing({ ...EMPTY_INITIATIVE })}>
            <PlusIcon className="w-3.5 h-3.5 mr-1" /> Add initiative
          </Button>
        )
      }
    >
      <div className="space-y-3">
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
            {i.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{i.description}</p>}
            <div className="grid md:grid-cols-2 gap-3 pt-1">
              {i.actions && (
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Actions</p>
                  <p className="text-xs whitespace-pre-wrap">{i.actions}</p>
                </div>
              )}
              {i.nextSteps && (
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Next steps</p>
                  <p className="text-xs whitespace-pre-wrap">{i.nextSteps}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
              {i.owner && <span>Owner: {i.owner}</span>}
              <span>Last updated: {fmtTimestamp(i.updatedAt)}</span>
            </div>
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

// ─── Overview tab ────────────────────────────────────────────────────────────

function OverviewSummaryCard({
  icon: Icon,
  title,
  onOpen,
  children,
}: {
  icon: React.ElementType;
  title: string;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${IBM_BLUE}14` }}>
              <Icon className="w-3.5 h-3.5" style={{ color: IBM_BLUE }} />
            </div>
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" style={{ color: IBM_BLUE }} onClick={onOpen}>
            View details <ArrowRightIcon className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-sm">{children}</CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AccountManagement() {
  const { data: currentUser } = useGetCurrentUser();
  const isAdmin = (currentUser?.role as string | undefined) === "admin";
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const search = useSearch();
  const [month, setMonth] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  const tabParam = new URLSearchParams(search).get("tab") ?? "";
  const activeTab: TabKey = (TAB_KEYS.includes(tabParam) ? tabParam : "overview") as TabKey;
  const setTab = (t: string) => navigate(`/dashboard/account-management${t === "overview" ? "" : `?tab=${t}`}`, { replace: false });

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
  const sortedMeetings = useMemo(
    () => [...(report?.meetings ?? [])].sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime()),
    [report?.meetings],
  );
  const onboards = (report?.staffChanges ?? []).filter((s) => s.changeType === "Onboard");
  const offboards = (report?.staffChanges ?? []).filter((s) => s.changeType !== "Onboard");
  const sowTotals = useMemo(() => {
    const map = new Map<string, { hours: number; amountUsd: number; lines: number }>();
    for (const r of report?.invoiceSummary ?? []) {
      const cur = map.get(r.sow) ?? { hours: 0, amountUsd: 0, lines: 0 };
      cur.hours += r.hours;
      cur.amountUsd += r.amountUsd;
      cur.lines += 1;
      map.set(r.sow, cur);
    }
    return [...map.entries()];
  }, [report?.invoiceSummary]);

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
        <Tabs value={activeTab} onValueChange={setTab}>
          <div className="overflow-x-auto -mx-1 px-1">
            <TabsList className="h-auto flex-wrap justify-start">
              {TAB_DEFS.map(({ key, label, icon: Icon }) => (
                <TabsTrigger key={key} value={key} className="text-xs gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="space-y-4 mt-4">
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

            <div className="grid md:grid-cols-2 gap-3">
              <OverviewSummaryCard icon={ClipboardListIcon} title="Action Items" onOpen={() => setTab("action-items")}>
                <div className="space-y-1.5">
                  {report.actionItems.filter((a) => a.status !== "Closed").slice(0, 4).map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2">
                      <p className="text-xs truncate">{a.item}</p>
                      {statusBadge(a.status)}
                    </div>
                  ))}
                  {report.actionItems.length === 0 && <p className="text-xs text-muted-foreground">No action items</p>}
                </div>
              </OverviewSummaryCard>

              <OverviewSummaryCard icon={CalendarIcon} title="Key Monthly Meeting" onOpen={() => setTab("meetings")}>
                <div className="space-y-1.5">
                  {sortedMeetings.slice(0, 4).map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-2">
                      <p className="text-xs truncate">{m.domainArea}</p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{m.meetingDate}</p>
                    </div>
                  ))}
                  {sortedMeetings.length === 0 && <p className="text-xs text-muted-foreground">No meetings recorded for {report.month}</p>}
                </div>
              </OverviewSummaryCard>

              <OverviewSummaryCard icon={UsersIcon} title="IBM Team" onOpen={() => setTab("ibm-team")}>
                <p className="text-xs text-muted-foreground">
                  {latestHc ? `${latestHc.endHc} end HC in ${latestHc.monthLabel} (${latestHc.onboards} onboards, ${latestHc.offboards} offboards, ${latestHc.attritionPct}% attrition)` : "No headcount data"}
                  {report.staffChanges.length > 0 && ` · ${report.staffChanges.length} staff change${report.staffChanges.length === 1 ? "" : "s"} this month`}
                </p>
              </OverviewSummaryCard>

              <OverviewSummaryCard icon={DollarSignIcon} title="Invoice Summary" onOpen={() => setTab("invoices")}>
                <p className="text-xs text-muted-foreground">
                  ${invoiceTotal.toLocaleString()} invoiced across {sowTotals.length} SOW{sowTotals.length === 1 ? "" : "s"} · {invoiceHours.toLocaleString()} hours
                </p>
              </OverviewSummaryCard>

              <OverviewSummaryCard icon={CpuIcon} title="MIPS Usage & Capacity" onOpen={() => setTab("mips")}>
                <p className="text-xs text-muted-foreground">
                  {latestMips ? `${latestMips.usageK}K MIPS in ${latestMips.monthLabel} vs ${latestMips.baselineK}K baseline` : "No MIPS data"}
                  {report.mipsInsights.length > 0 && ` · ${report.mipsInsights.length} insight${report.mipsInsights.length === 1 ? "" : "s"}`}
                </p>
              </OverviewSummaryCard>

              <OverviewSummaryCard icon={RocketIcon} title="Transformation Initiatives" onOpen={() => setTab("initiatives")}>
                <div className="space-y-1.5">
                  {report.initiatives.slice(0, 4).map((i) => (
                    <div key={i.id} className="flex items-center justify-between gap-2">
                      <p className="text-xs truncate">{i.title}</p>
                      {statusBadge(i.status)}
                    </div>
                  ))}
                  {report.initiatives.length === 0 && <p className="text-xs text-muted-foreground">No initiatives</p>}
                </div>
              </OverviewSummaryCard>

              <OverviewSummaryCard icon={PieChartIcon} title="Team Composition" onOpen={() => setTab("team-composition")}>
                <p className="text-xs text-muted-foreground">
                  {teamCats.length > 0 ? teamCats.join(" · ") : `No team composition data for ${report.month}`}
                </p>
              </OverviewSummaryCard>

              <OverviewSummaryCard icon={InfoIcon} title="Other Updates" onOpen={() => setTab("other-updates")}>
                <div className="space-y-1.5">
                  {report.otherUpdates.slice(0, 4).map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-2">
                      <p className="text-xs truncate">{o.title}</p>
                      {statusBadge(o.status)}
                    </div>
                  ))}
                  {report.otherUpdates.length === 0 && <p className="text-xs text-muted-foreground">No other updates for {report.month}</p>}
                </div>
              </OverviewSummaryCard>
            </div>
          </TabsContent>

          {/* ── Action Items ── */}
          <TabsContent value="action-items" className="mt-4">
            <ActionItemsTab items={report.actionItems} isAdmin={isAdmin} />
          </TabsContent>

          {/* ── Key Monthly Meeting ── */}
          <TabsContent value="meetings" className="mt-4">
            <SectionCard icon={CalendarIcon} title="Key Monthly Meetings" description={`Key reviews held in ${report.month}, sorted by date`}>
              <div className="space-y-3">
                {sortedMeetings.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">No meetings recorded for {report.month}</p>
                )}
                {sortedMeetings.map((m) => (
                  <div key={m.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{m.domainArea}</p>
                        <p className="text-xs text-muted-foreground">{m.meetingDate}</p>
                      </div>
                      {m.deckLink ? (
                        <a href={m.deckLink} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 hover:underline whitespace-nowrap" style={{ color: IBM_BLUE }}>
                          Shared deck <ExternalLinkIcon className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">No deck shared</span>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="rounded-md bg-muted/40 p-3">
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Horizon attendees</p>
                        <p className="text-xs whitespace-pre-wrap">{m.horizonAttendees || "—"}</p>
                      </div>
                      <div className="rounded-md bg-muted/40 p-3">
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">IBM attendees</p>
                        <p className="text-xs whitespace-pre-wrap">{m.ibmAttendees || "—"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          {/* ── IBM Team ── */}
          <TabsContent value="ibm-team" className="mt-4 space-y-4">
            <SectionCard icon={UsersIcon} title="IBM Team @ Horizon — Headcount Trend" description="Monthly headcount, onboards, offboards, and attrition">
              <div className="h-64 mb-4">
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
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/60">
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Start HC</TableHead>
                      <TableHead className="text-right">Onboards</TableHead>
                      <TableHead className="text-right">Offboards</TableHead>
                      <TableHead className="text-right">End HC</TableHead>
                      <TableHead className="text-right">Net Change</TableHead>
                      <TableHead className="text-right">Attrition %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.headcount.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-6 text-sm text-muted-foreground">No headcount data</TableCell></TableRow>
                    )}
                    {report.headcount.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="text-xs font-medium whitespace-nowrap">{h.monthLabel}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{h.startHc}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums" style={{ color: h.onboards > 0 ? GREEN : undefined }}>{h.onboards > 0 ? `+${h.onboards}` : h.onboards}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums" style={{ color: h.offboards > 0 ? ORANGE : undefined }}>{h.offboards > 0 ? `−${h.offboards}` : h.offboards}</TableCell>
                        <TableCell className="text-right text-xs font-semibold tabular-nums">{h.endHc}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{h.endHc - h.startHc >= 0 ? `+${h.endHc - h.startHc}` : h.endHc - h.startHc}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{h.attritionPct}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </SectionCard>

            <SectionCard icon={UsersIcon} title={`On/Offboarding — ${report.month}`} description={`${onboards.length} onboard${onboards.length === 1 ? "" : "s"}, ${offboards.length} offboard${offboards.length === 1 ? "" : "s"} this month`}>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/60">
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
            </SectionCard>
          </TabsContent>

          {/* ── Invoice Summary ── */}
          <TabsContent value="invoices" className="mt-4 space-y-4">
            <InvoicesTab rows={report.invoiceSummary} month={report.month} isAdmin={isAdmin} />

            <SectionCard icon={DollarSignIcon} title="Hourly Trends" description="Monthly hours by shore and CareRadius split">
              <div className="h-64 mb-4">
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
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/60">
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Onshore Non-CR</TableHead>
                      <TableHead className="text-right">Offshore Non-CR</TableHead>
                      <TableHead className="text-right">Onshore CR</TableHead>
                      <TableHead className="text-right">Offshore CR</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.hourlyTrends.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-6 text-sm text-muted-foreground">No hourly trend data</TableCell></TableRow>
                    )}
                    {report.hourlyTrends.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="text-xs font-medium whitespace-nowrap">{h.monthLabel}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{h.onshoreNonCr.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{h.offshoreNonCr.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{h.onshoreCr.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{h.offshoreCr.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs font-semibold tabular-nums">{(h.onshoreNonCr + h.offshoreNonCr + h.onshoreCr + h.offshoreCr).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </SectionCard>

          </TabsContent>

          {/* ── MIPS ── */}
          <TabsContent value="mips" className="mt-4 space-y-4">
            <SectionCard icon={CpuIcon} title="MIPS Usage & Capacity" description="Usage trend vs contracted baseline">
              <div className="h-64 mb-4">
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
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/60">
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Usage (K MIPS)</TableHead>
                      <TableHead className="text-right">Baseline (K MIPS)</TableHead>
                      <TableHead className="text-right">Headroom</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.mipsTrend.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">No MIPS trend data</TableCell></TableRow>
                    )}
                    {report.mipsTrend.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-xs font-medium whitespace-nowrap">{m.monthLabel}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{m.usageK}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums">{m.baselineK}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums" style={{ color: m.baselineK - m.usageK >= 0 ? GREEN : "#da1e28" }}>
                          {m.baselineK - m.usageK >= 0 ? `+${m.baselineK - m.usageK}` : m.baselineK - m.usageK}K
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{m.note || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </SectionCard>

            <SectionCard icon={CpuIcon} title="MIPS Insights" description="Optimization impact and re-baseline recommendation">
              <div className="space-y-3">
                {report.mipsInsights.map((ins) => (
                  <div key={ins.id} className="rounded-lg border p-4">
                    <Badge variant="outline" className="text-[10px] mb-1.5" style={{ color: IBM_BLUE, borderColor: `${IBM_BLUE}55` }}>{ins.section}</Badge>
                    <p className="text-sm font-medium">{ins.title}</p>
                    {ins.detail && <p className="text-xs text-muted-foreground mt-1.5 whitespace-pre-wrap">{ins.detail}</p>}
                  </div>
                ))}
                {report.mipsInsights.length === 0 && <p className="text-sm text-muted-foreground py-4">No MIPS insights for {report.month}</p>}
              </div>
            </SectionCard>
          </TabsContent>

          {/* ── Initiatives ── */}
          <TabsContent value="initiatives" className="mt-4">
            <InitiativesTab initiatives={report.initiatives} isAdmin={isAdmin} />
          </TabsContent>

          {/* ── Team Composition ── */}
          <TabsContent value="team-composition" className="mt-4">
            <SectionCard icon={PieChartIcon} title="Team Composition" description="Technology mix, diversity, experience, and attrition vs industry benchmark">
              <div className="grid md:grid-cols-2 gap-4">
                {teamCats.map((cat) => {
                  const rows = report.teamComposition.filter((t) => t.category === cat);
                  return (
                    <div key={cat} className="rounded-lg border p-4">
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">{cat}</p>
                      {cat === "Technology Mix" && (
                        <div className="h-44 mb-3">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 40 }}>
                              <XAxis type="number" hide />
                              <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={120} />
                              <RTooltip formatter={(v: number) => `${v}%`} />
                              <Bar dataKey="value" fill={IBM_BLUE} radius={[0, 4, 4, 0]} barSize={14} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      <div className="space-y-2.5">
                        {rows.map((t) => (
                          <div key={t.id} className="flex items-start justify-between gap-2 border-b last:border-b-0 pb-2 last:pb-0">
                            <div>
                              <p className="text-sm">{t.label}</p>
                              {t.note && <p className="text-[11px] text-muted-foreground">{t.note}</p>}
                            </div>
                            <p className="text-lg font-bold tabular-nums whitespace-nowrap" style={{ color: cat === "Attrition Benchmark" && t.label.toLowerCase().includes("account") ? GREEN : undefined }}>
                              {t.value}{t.unit}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {teamCats.length === 0 && <p className="text-sm text-muted-foreground py-4">No team composition data for {report.month}</p>}
              </div>
            </SectionCard>
          </TabsContent>

          {/* ── Other Updates ── */}
          <TabsContent value="other-updates" className="mt-4">
            <SectionCard icon={InfoIcon} title="Other Updates" description="NSA/NSSD and other programme updates">
              <div className="space-y-3">
                {report.otherUpdates.length === 0 && <p className="text-sm text-muted-foreground py-4">No other updates for {report.month}</p>}
                {report.otherUpdates.map((o) => (
                  <div key={o.id} className="rounded-lg border p-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{o.title}</p>
                      {o.detail && <p className="text-xs text-muted-foreground mt-1.5 whitespace-pre-wrap">{o.detail}</p>}
                    </div>
                    {statusBadge(o.status)}
                  </div>
                ))}
              </div>
            </SectionCard>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
