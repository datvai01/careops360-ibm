import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetVendorInvoiceList } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  UploadCloudIcon,
  XIcon,
  CalendarIcon,
  CheckCircle2Icon,
  PauseCircleIcon,
  PlayCircleIcon,
  SearchIcon,
  FileTextIcon,
  FilterIcon,
  ChevronDownIcon,
} from "lucide-react";

const IBM_BLUE = "#0f62fe";

const CATEGORY_COLORS: Record<string, string> = {
  "Application Support":     "#0f62fe",
  "Application Development": "#8a3ffc",
  "Infrastructure":          "#24a148",
  "Data Services":           "#ff832b",
  "Technology":              "#1192e8",
  "Software":                "#fa4d56",
  "Quality Engineering":     "#009d9a",
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

const WORK_NUMBERS_BY_CATEGORY: Record<string, string[]> = {
  "Application Support":     ["WO-AS-001", "WO-AS-002", "WO-AS-003"],
  "Application Development": ["WO-AD-001", "WO-AD-002", "WO-AD-003"],
  "Infrastructure":          ["WO-INF-001", "WO-INF-002", "WO-INF-003"],
  "Data Services":           ["WO-DS-001", "WO-DS-002"],
  "Technology":              ["WO-TECH-001", "WO-TECH-002"],
  "Software":                ["WO-SW-001", "WO-SW-002", "WO-SW-003"],
  "Quality Engineering":     ["WO-QE-001", "WO-QE-002"],
};

const VIEWS = [
  { id: "overview",        label: "IBM Overview" },
  { id: "by-work-number", label: "By Work Number" },
];

function datePresetRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Processed: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
    Pending:   "bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800",
    "On Hold": "bg-red-500/10 text-red-600 border-red-200 dark:text-red-400 dark:border-red-800",
  };
  return (
    <Badge variant="outline" className={`text-[10px] whitespace-nowrap font-medium ${map[status] ?? ""}`}>
      {status}
    </Badge>
  );
}

type Invoice = {
  id: string;
  vendor: string;
  workNumber: string;
  serviceCategory: string;
  invoiceDate: string;
  amount: number;
  status: string;
  paymentStatus: string;
  ageDays: number;
  cycleTimeDays?: number | null;
  hasException: number;
  exceptionNote?: string | null;
};

function useUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "release" | "hold" | "processed" }) => {
      const res = await fetch(`/api/vendor-invoices/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to update invoice status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-invoices/list"] });
    },
  });
}

function useUploadInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/vendor-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to upload invoice");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-invoices/list"] });
    },
  });
}

/* ── PDF preview button ─────────────────────────────────────── */
function PdfButton({ invoice }: { invoice: Invoice }) {
  const { toast } = useToast();
  return (
    <button
      title="View attached invoice document"
      onClick={(e) => {
        e.stopPropagation();
        toast({
          title: "No document attached",
          description: `Invoice ${invoice.id} — upload a PDF or image using the Upload Invoice action to attach a document.`,
        });
      }}
      className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
    >
      <FileTextIcon className="w-4 h-4" />
    </button>
  );
}

/* ── Admin action buttons ───────────────────────────────────── */
function ActionButtons({ invoice }: { invoice: Invoice }) {
  const { toast } = useToast();
  const mutation = useUpdateStatus();

  function act(action: "release" | "hold" | "processed", label: string) {
    mutation.mutate(
      { id: invoice.id, action },
      {
        onSuccess: () => toast({ title: "Invoice updated", description: `${invoice.id} — ${label}` }),
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      }
    );
  }

  return (
    <div className="flex items-center gap-1">
      {invoice.status !== "Processed" && invoice.paymentStatus !== "Paid" && (
        <Button size="sm" variant="ghost"
          className="h-6 text-[10px] px-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          disabled={mutation.isPending}
          onClick={(e) => { e.stopPropagation(); act("release", "Released for Payment"); }}>
          <PlayCircleIcon className="w-3 h-3 mr-1" /> Release
        </Button>
      )}
      {invoice.status !== "On Hold" && (
        <Button size="sm" variant="ghost"
          className="h-6 text-[10px] px-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          disabled={mutation.isPending}
          onClick={(e) => { e.stopPropagation(); act("hold", "Put On Hold"); }}>
          <PauseCircleIcon className="w-3 h-3 mr-1" /> Hold
        </Button>
      )}
      {invoice.status !== "Processed" && (
        <Button size="sm" variant="ghost"
          className="h-6 text-[10px] px-2 text-primary hover:bg-primary/10"
          disabled={mutation.isPending}
          onClick={(e) => { e.stopPropagation(); act("processed", "Marked as Processed"); }}>
          <CheckCircle2Icon className="w-3 h-3 mr-1" /> Mark Processed
        </Button>
      )}
    </div>
  );
}

/* ── Invoice table ──────────────────────────────────────────── */
function InvoiceTable({
  invoices,
  onDrillDown,
}: {
  invoices: Invoice[];
  onDrillDown: (inv: Invoice) => void;
}) {
  if (invoices.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileTextIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No invoices match the selected filters.</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border overflow-auto max-h-[520px]">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/40">
          <TableRow className="border-b">
            <TableHead className="w-8" />
            <TableHead>Invoice ID</TableHead>
            <TableHead>Work Order</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Age</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow
              key={inv.id}
              className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                inv.hasException ? "border-l-2 border-l-amber-400" : ""
              }`}
              onClick={() => onDrillDown(inv)}
            >
              <TableCell className="pr-0" onClick={(e) => e.stopPropagation()}>
                <PdfButton invoice={inv} />
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs font-semibold tracking-tight">{inv.id}</span>
                {inv.hasException === 1 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block ml-1.5 mb-0.5" title="Has exception" />
                )}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{inv.workNumber}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                       style={{ backgroundColor: CATEGORY_COLORS[inv.serviceCategory] ?? "#888" }} />
                  <span className="text-xs">{inv.serviceCategory}</span>
                </div>
              </TableCell>
              <TableCell className="text-xs tabular-nums text-muted-foreground">{inv.invoiceDate}</TableCell>
              <TableCell className="text-right font-semibold tabular-nums text-sm">
                ${inv.amount.toLocaleString()}
              </TableCell>
              <TableCell>{statusBadge(inv.status)}</TableCell>
              <TableCell>
                <Badge variant="outline"
                  className={`text-[10px] ${inv.paymentStatus === "Paid"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800"
                    : "bg-muted/60 text-muted-foreground"}`}>
                  {inv.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <span className={`text-xs tabular-nums font-medium ${
                  inv.ageDays > 60 ? "text-red-600 dark:text-red-400" : inv.ageDays > 30 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                }`}>
                  {inv.ageDays}d
                </span>
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <ActionButtons invoice={inv} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ── Upload modal ───────────────────────────────────────────── */
function UploadModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const mutation = useUploadInvoice();
  const [selectedCat, setSelectedCat] = useState("Application Support");
  const [form, setForm] = useState({
    workNumber: WORK_NUMBERS_BY_CATEGORY["Application Support"][0],
    invoiceDate: new Date().toISOString().split("T")[0],
    amount: "",
    exceptionNote: "",
    fileName: "",
  });

  function handleCatChange(cat: string) {
    setSelectedCat(cat);
    setForm((f) => ({ ...f, workNumber: WORK_NUMBERS_BY_CATEGORY[cat][0] }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) setForm((f) => ({ ...f, fileName: e.target.files![0].name }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) { toast({ title: "Invalid amount", variant: "destructive" }); return; }
    mutation.mutate(
      { vendor: "IBM", workNumber: form.workNumber, serviceCategory: selectedCat, invoiceDate: form.invoiceDate, amount, exceptionNote: form.exceptionNote || undefined },
      {
        onSuccess: (data: { id?: string }) => {
          toast({ title: "Invoice uploaded", description: `${data?.id ?? "Invoice"} created — status: Pending.` });
          onClose();
        },
        onError: (e) => toast({ title: "Upload failed", description: e.message, variant: "destructive" }),
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-xl border shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-base font-semibold">Upload IBM Invoice</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Attach a new invoice to the IBM billing register</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
            <XIcon className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="border-2 border-dashed rounded-lg p-5 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer relative">
            <input type="file" accept=".pdf,.xlsx,.csv,.png,.jpg" onChange={handleFile}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
            <UploadCloudIcon className="w-7 h-7 mx-auto mb-2 text-muted-foreground" />
            {form.fileName
              ? <p className="text-sm font-medium">{form.fileName}</p>
              : <><p className="text-sm font-medium">Drop invoice file or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-0.5">PDF, Excel, CSV, or image · max 20 MB</p></>
            }
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Vendor</Label>
            <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-muted/40 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: IBM_BLUE }} />
              <span className="font-semibold">IBM</span>
              <span className="ml-auto text-xs text-muted-foreground">Fixed</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Service Category</Label>
              <select className="w-full rounded-md border bg-background text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedCat} onChange={(e) => handleCatChange(e.target.value)}>
                {CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Work Order</Label>
              <select className="w-full rounded-md border bg-background text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.workNumber} onChange={(e) => setForm((f) => ({ ...f, workNumber: e.target.value }))}>
                {(WORK_NUMBERS_BY_CATEGORY[selectedCat] ?? []).map((wn) => <option key={wn}>{wn}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Invoice Date</Label>
              <Input type="date" value={form.invoiceDate} onChange={(e) => setForm((f) => ({ ...f, invoiceDate: e.target.value }))} required className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Amount ($)</Label>
              <Input type="number" min="0" step="0.01" placeholder="e.g. 250000"
                value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs">Exception Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input placeholder="Describe any discrepancy or exception..."
                value={form.exceptionNote} onChange={(e) => setForm((f) => ({ ...f, exceptionNote: e.target.value }))} className="h-9 text-sm" />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? "Uploading…" : "Upload Invoice"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Invoice drill-down modal ───────────────────────────────── */
function DrillDownModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-xl border shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold">{invoice.id}</span>
            {statusBadge(invoice.status)}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
            <XIcon className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Work Order</p>
              <p className="font-mono font-semibold">{invoice.workNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Service Category</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[invoice.serviceCategory] ?? "#888" }} />
                <span className="font-semibold">{invoice.serviceCategory}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Invoice Date</p>
              <p className="font-semibold">{invoice.invoiceDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
              <p className="text-lg font-black">${invoice.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Payment Status</p>
              <p className="font-semibold">{invoice.paymentStatus}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Age</p>
              <p className={`font-semibold ${invoice.ageDays > 60 ? "text-red-600 dark:text-red-400" : ""}`}>{invoice.ageDays} days</p>
            </div>
            {invoice.cycleTimeDays != null && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Cycle Time</p>
                <p className="font-semibold">{invoice.cycleTimeDays} days</p>
              </div>
            )}
          </div>

          {invoice.hasException === 1 && invoice.exceptionNote && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Exception Note</p>
              <p className="text-xs text-amber-800 dark:text-amber-300">{invoice.exceptionNote}</p>
            </div>
          )}

          <div className="border rounded-lg px-4 py-3 bg-muted/30">
            <p className="text-xs text-muted-foreground font-medium mb-2.5">Attached Document</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg border border-dashed flex items-center justify-center bg-background">
                <FileTextIcon className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">No document attached</p>
                <p className="text-[10px] text-muted-foreground/60">Upload an invoice document to attach it to this record</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground font-medium mb-2.5 uppercase tracking-wide">Admin Actions</p>
            <ActionButtons invoice={invoice} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function VendorInvoices() {
  const [activeView, setActiveView] = useState("overview");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedWorkNumber, setSelectedWorkNumber] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [datePreset, setDatePreset] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [workSearch, setWorkSearch] = useState("");
  const [drillDown, setDrillDown] = useState<Invoice | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const q = { refetchInterval: 30000 };
  const { data: invoices } = useGetVendorInvoiceList(
    {
      status: selectedStatus ?? undefined,
      workNumber: selectedWorkNumber ?? undefined,
      serviceCategory: selectedCategory ?? undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    { query: q }
  );
  const allInvoices = useGetVendorInvoiceList({}, { query: q }).data ?? [];

  const displayInvoices = (invoices ?? allInvoices) as Invoice[];
  const hasFilters = !!(selectedStatus || selectedWorkNumber || selectedCategory || dateFrom || dateTo);

  const workNumbers = useMemo(() => [...new Set(allInvoices.map((i) => i.workNumber))].sort(), [allInvoices]);
  const categories = useMemo(() => [...new Set(allInvoices.map((i) => i.serviceCategory))].sort(), [allInvoices]);

  const byCategory = useMemo(() => categories.map((cat) => {
    const rows = allInvoices.filter((i) => i.serviceCategory === cat);
    return {
      name: cat,
      count: rows.length,
      value: rows.reduce((s, r) => s + r.amount, 0),
      processed: rows.filter((r) => r.status === "Processed").length,
      pending: rows.filter((r) => r.status === "Pending").length,
      onHold: rows.filter((r) => r.status === "On Hold").length,
    };
  }), [allInvoices, categories]);

  const byWorkNumber = useMemo(() => workNumbers.map((wn) => {
    const rows = allInvoices.filter((i) => i.workNumber === wn);
    return { workNumber: wn, count: rows.length, value: rows.reduce((s, r) => s + r.amount, 0), category: rows[0]?.serviceCategory ?? "" };
  }), [allInvoices, workNumbers]);

  const filteredBySearch = useMemo(() =>
    workSearch.trim()
      ? byWorkNumber.filter((r) =>
          r.workNumber.toLowerCase().includes(workSearch.toLowerCase()) ||
          r.category.toLowerCase().includes(workSearch.toLowerCase()))
      : byWorkNumber,
  [byWorkNumber, workSearch]);

  function clearAll() {
    setSelectedStatus(null);
    setSelectedWorkNumber(null);
    setSelectedCategory(null);
    setDateFrom("");
    setDateTo("");
    setDatePreset(null);
    setShowDatePicker(false);
  }

  const dateLabel = datePreset
    ? `Last ${datePreset}d`
    : dateFrom || dateTo
    ? `${dateFrom || "…"} → ${dateTo || "…"}`
    : null;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Vendor Invoice &amp; Billing</h1>
            <Badge variant="outline" className="text-xs font-semibold border-[#0f62fe]/40 text-[#0f62fe] bg-[#0f62fe]/5">
              IBM
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            IBM invoicing to Horizon — 7 service categories &nbsp;·&nbsp;{" "}
            <span className="text-muted-foreground/60 text-xs">Additional vendors can be onboarded as needed</span>
          </p>
        </div>
        <Button className="gap-2 flex-shrink-0" onClick={() => setUploadOpen(true)}>
          <UploadCloudIcon className="w-4 h-4" /> Upload Invoice
        </Button>
      </div>

      {/* ── Tabs + Toolbar in one line ───────────────────────── */}
      <div className="flex items-center gap-0 border-b">
        {VIEWS.map((v) => (
          <button key={v.id} onClick={() => setActiveView(v.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeView === v.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {v.label}
          </button>
        ))}
      </div>

      {/* ── Unified filter toolbar ───────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
          <FilterIcon className="w-3.5 h-3.5" /> Filters
        </div>

        {/* Date preset buttons */}
        {[7, 30, 90].map((days) => (
          <button key={days}
            onClick={() => { const r = datePresetRange(days); setDateFrom(r.from); setDateTo(r.to); setDatePreset(days); setShowDatePicker(false); }}
            className={`h-7 px-2.5 rounded-md border text-xs font-medium transition-colors ${
              datePreset === days
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-primary/40 bg-background"
            }`}>
            Last {days}d
          </button>
        ))}

        {/* Custom date range toggle */}
        <button
          onClick={() => setShowDatePicker((v) => !v)}
          className={`h-7 px-2.5 rounded-md border text-xs font-medium flex items-center gap-1 transition-colors ${
            showDatePicker || (!datePreset && (dateFrom || dateTo))
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border hover:border-primary/40 bg-background"
          }`}>
          <CalendarIcon className="w-3 h-3" />
          {dateLabel && !datePreset ? dateLabel : "Custom"}
          <ChevronDownIcon className="w-3 h-3" />
        </button>

        {showDatePicker && (
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">From</Label>
              <Input type="date" value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setDatePreset(null); }}
                className="h-7 text-xs w-36" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">To</Label>
              <Input type="date" value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setDatePreset(null); }}
                className="h-7 text-xs w-36" />
            </div>
          </div>
        )}

        <div className="w-px h-5 bg-border mx-1" />

        {/* Status chips */}
        {(["Processed", "Pending", "On Hold"] as const).map((s) => (
          <button key={s}
            onClick={() => setSelectedStatus(selectedStatus === s ? null : s)}
            className={`h-7 px-2.5 rounded-md border text-xs font-medium transition-colors ${
              selectedStatus === s
                ? s === "Processed" ? "bg-emerald-500 text-white border-emerald-500"
                  : s === "Pending" ? "bg-amber-500 text-white border-amber-500"
                  : "bg-red-500 text-white border-red-500"
                : "border-border hover:border-primary/40 bg-background"
            }`}>
            {s}
          </button>
        ))}

        {/* Clear + count */}
        {hasFilters && (
          <button onClick={clearAll}
            className="h-7 px-2 rounded-md border border-dashed text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <XIcon className="w-3 h-3" /> Clear
          </button>
        )}
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {displayInvoices.length} / {allInvoices.length} invoices
        </span>
      </div>

      {/* ══ IBM OVERVIEW ════════════════════════════════════════ */}
      {activeView === "overview" && (
        <div className="space-y-4">
          {/* Category filter pill strip */}
          <div className="flex flex-wrap gap-1.5">
            {byCategory.map((cat) => {
              const active = selectedCategory === cat.name;
              return (
                <button key={cat.name}
                  onClick={() => setSelectedCategory(active ? null : cat.name)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    active
                      ? "text-white border-transparent shadow-sm"
                      : "bg-background border-border hover:border-primary/40 hover:shadow-sm"
                  }`}
                  style={active ? { backgroundColor: CATEGORY_COLORS[cat.name] ?? IBM_BLUE, borderColor: CATEGORY_COLORS[cat.name] ?? IBM_BLUE } : {}}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                       style={{ backgroundColor: active ? "rgba(255,255,255,0.8)" : (CATEGORY_COLORS[cat.name] ?? "#888") }} />
                  {cat.name}
                  <span className={`${active ? "text-white/70" : "text-muted-foreground"}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Invoice table */}
          <InvoiceTable invoices={displayInvoices} onDrillDown={setDrillDown} />
        </div>
      )}

      {/* ══ BY WORK NUMBER ══════════════════════════════════════ */}
      {activeView === "by-work-number" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">By Work Order</CardTitle>
                  <CardDescription className="text-xs">Click a row to filter invoices by that work order</CardDescription>
                </div>
                <div className="relative w-full sm:w-60">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <Input placeholder="Search work order or category…"
                    value={workSearch} onChange={(e) => setWorkSearch(e.target.value)}
                    className="pl-8 h-8 text-xs" />
                  {workSearch && (
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setWorkSearch("")}>
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-lg border overflow-auto max-h-[320px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-muted/60">
                    <TableRow>
                      <TableHead>Work Order</TableHead>
                      <TableHead>Service Category</TableHead>
                      <TableHead className="text-right">Invoices</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBySearch.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-sm text-muted-foreground">
                          No work orders match "{workSearch}"
                        </TableCell>
                      </TableRow>
                    ) : filteredBySearch.map((row) => (
                      <TableRow key={row.workNumber}
                        className={`cursor-pointer hover:bg-muted/40 transition-colors ${
                          selectedWorkNumber === row.workNumber ? "bg-primary/5 border-l-2 border-l-primary" : ""
                        }`}
                        onClick={() => setSelectedWorkNumber(selectedWorkNumber === row.workNumber ? null : row.workNumber)}>
                        <TableCell>
                          <span className="font-mono text-sm font-semibold">{row.workNumber}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0"
                                 style={{ backgroundColor: CATEGORY_COLORS[row.category] ?? "#888" }} />
                            <span className="text-sm">{row.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">${row.value.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {selectedWorkNumber && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">Invoices for <span className="font-mono">{selectedWorkNumber}</span></p>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedWorkNumber(null)}>
                  <XIcon className="w-3.5 h-3.5 mr-1" /> Clear selection
                </Button>
              </div>
              <InvoiceTable invoices={displayInvoices} onDrillDown={setDrillDown} />
            </div>
          )}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────── */}
      {drillDown && <DrillDownModal invoice={drillDown} onClose={() => setDrillDown(null)} />}
      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}
    </div>
  );
}
