import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useGetVendorInvoiceKpis,
  useGetVendorInvoiceList,
  useGetVendorInvoiceAging,
} from "@workspace/api-client-react";
import { KpiCard } from "@/components/ui/kpi-card";
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
} from "lucide-react";

const VENDOR_COLORS: Record<string, string> = {
  "XYZ Systems": "#0f62fe",
  IBM: "#24a148",
  "ABC Corp": "#8a3ffc",
};

const VIEWS = [
  { id: "summary-vendor", label: "Summary by Vendor" },
  { id: "status-vendor", label: "Status by Vendor" },
  { id: "aging-vendor", label: "Aging by Vendor" },
  { id: "by-work-number", label: "By Work Number" },
  { id: "by-category", label: "By Service Category" },
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Processed: "bg-status-green/10 text-status-green border-status-green/20",
    Pending: "bg-status-yellow/10 text-status-yellow border-status-yellow/20",
    "On Hold": "bg-status-red/10 text-status-red border-status-red/20",
  };
  return (
    <Badge variant="outline" className={`text-[10px] whitespace-nowrap ${map[status] ?? ""}`}>
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
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-invoices/kpis"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/vendor-invoices/kpis"] });
    },
  });
}

function ActionButtons({ invoice }: { invoice: Invoice }) {
  const { toast } = useToast();
  const mutation = useUpdateStatus();
  const isPending = mutation.isPending;

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
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] px-2 text-status-green border-status-green/30 hover:bg-status-green/10"
          disabled={isPending}
          onClick={(e) => { e.stopPropagation(); act("release", "Released for Payment"); }}
        >
          <PlayCircleIcon className="w-3 h-3 mr-1" /> Release
        </Button>
      )}
      {invoice.status !== "On Hold" && (
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] px-2 text-status-red border-status-red/30 hover:bg-status-red/10"
          disabled={isPending}
          onClick={(e) => { e.stopPropagation(); act("hold", "Put On Hold"); }}
        >
          <PauseCircleIcon className="w-3 h-3 mr-1" /> Hold
        </Button>
      )}
      {invoice.status !== "Processed" && (
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] px-2 text-primary border-primary/30 hover:bg-primary/10"
          disabled={isPending}
          onClick={(e) => { e.stopPropagation(); act("processed", "Marked as Processed"); }}
        >
          <CheckCircle2Icon className="w-3 h-3 mr-1" /> Processed
        </Button>
      )}
    </div>
  );
}

function InvoiceDetailTable({
  invoices,
  onDrillDown,
}: {
  invoices: Invoice[];
  onDrillDown: (inv: Invoice) => void;
}) {
  if (invoices.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">No invoices match the selected filters.</div>;
  }
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice ID</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Work #</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Admin Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow
              key={inv.id}
              className="cursor-pointer hover:bg-muted/40"
              onClick={() => onDrillDown(inv)}
            >
              <TableCell className="font-mono text-xs font-medium">{inv.id}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: VENDOR_COLORS[inv.vendor] ?? "#888" }}
                  />
                  <span className="text-xs">{inv.vendor}</span>
                </div>
              </TableCell>
              <TableCell className="text-xs">{inv.workNumber}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{inv.serviceCategory}</TableCell>
              <TableCell className="text-xs">{inv.invoiceDate}</TableCell>
              <TableCell className="text-right text-xs font-semibold">${inv.amount.toLocaleString()}</TableCell>
              <TableCell>{statusBadge(inv.status)}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${inv.paymentStatus === "Paid" ? "bg-status-green/10 text-status-green border-status-green/20" : "bg-muted text-muted-foreground"}`}
                >
                  {inv.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell className={`text-xs ${inv.ageDays > 60 ? "text-status-red font-semibold" : inv.ageDays > 30 ? "text-status-yellow" : ""}`}>
                {inv.ageDays}d
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <ActionButtons invoice={inv} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const mutation = useUploadInvoice();
  const [form, setForm] = useState({
    vendor: "XYZ Systems",
    workNumber: "WO-1001",
    serviceCategory: "Application Support",
    invoiceDate: new Date().toISOString().split("T")[0],
    amount: "",
    exceptionNote: "",
    fileName: "",
  });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setForm((f) => ({ ...f, fileName: e.target.files![0].name }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    mutation.mutate(
      {
        vendor: form.vendor,
        workNumber: form.workNumber,
        serviceCategory: form.serviceCategory,
        invoiceDate: form.invoiceDate,
        amount,
        exceptionNote: form.exceptionNote || undefined,
      },
      {
        onSuccess: (data: { id?: string }) => {
          toast({ title: "Invoice uploaded", description: `Invoice ${data?.id ?? ""} created with Pending status.` });
          onClose();
        },
        onError: (e) => toast({ title: "Upload failed", description: e.message, variant: "destructive" }),
      }
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl border shadow-2xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-bold">Upload Invoice</h2>
            <p className="text-sm text-muted-foreground">Add a new vendor invoice to the system</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* File drop area */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer relative">
            <input type="file" accept=".pdf,.xlsx,.csv,.png,.jpg" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
            <UploadCloudIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            {form.fileName ? (
              <p className="text-sm font-medium text-foreground">{form.fileName}</p>
            ) : (
              <>
                <p className="text-sm font-medium">Drop invoice file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, Excel, CSV, or image (max 20 MB)</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Vendor</Label>
              <select
                className="w-full rounded-md border bg-background text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.vendor}
                onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
              >
                <option>XYZ Systems</option>
                <option>IBM</option>
                <option>ABC Corp</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Work Number</Label>
              <select
                className="w-full rounded-md border bg-background text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.workNumber}
                onChange={(e) => setForm((f) => ({ ...f, workNumber: e.target.value }))}
              >
                {["WO-1001","WO-1002","WO-1003","WO-2001","WO-2002","WO-3001","WO-3002"].map((wn) => (
                  <option key={wn}>{wn}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Service Category</Label>
              <select
                className="w-full rounded-md border bg-background text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.serviceCategory}
                onChange={(e) => setForm((f) => ({ ...f, serviceCategory: e.target.value }))}
              >
                <option>Application Support</option>
                <option>Infrastructure</option>
                <option>Data Services</option>
                <option>BPO</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Invoice Date</Label>
              <Input
                type="date"
                value={form.invoiceDate}
                onChange={(e) => setForm((f) => ({ ...f, invoiceDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 125000"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Exception Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                placeholder="Describe any discrepancy or exception..."
                value={form.exceptionNote}
                onChange={(e) => setForm((f) => ({ ...f, exceptionNote: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? "Uploading..." : "Upload Invoice"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VendorInvoices() {
  const [activeView, setActiveView] = useState("summary-vendor");
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedWorkNumber, setSelectedWorkNumber] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [drillDown, setDrillDown] = useState<Invoice | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const q = { refetchInterval: 30000 };
  const { data: kpis, isLoading: kpisLoading } = useGetVendorInvoiceKpis({ query: q });
  const { data: invoices } = useGetVendorInvoiceList(
    {
      vendor: selectedVendor ?? undefined,
      status: selectedStatus ?? undefined,
      workNumber: selectedWorkNumber ?? undefined,
      serviceCategory: selectedCategory ?? undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    { query: q }
  );
  const { data: aging } = useGetVendorInvoiceAging({ query: q });

  const allInvoices = useGetVendorInvoiceList({}, { query: q }).data ?? [];

  const vendors = [...new Set(allInvoices.map((i) => i.vendor))].sort();
  const workNumbers = [...new Set(allInvoices.map((i) => i.workNumber))].sort();
  const categories = [...new Set(allInvoices.map((i) => i.serviceCategory))].sort();

  const summaryByVendor = vendors.map((v) => {
    const rows = allInvoices.filter((i) => i.vendor === v);
    return {
      vendor: v,
      total: rows.length,
      value: rows.reduce((s, r) => s + r.amount, 0),
      processed: rows.filter((r) => r.status === "Processed").length,
      pending: rows.filter((r) => r.status === "Pending").length,
      onHold: rows.filter((r) => r.status === "On Hold").length,
    };
  });

  const statusByVendor = vendors.map((v) => {
    const rows = allInvoices.filter((i) => i.vendor === v);
    return {
      vendor: v,
      Processed: rows.filter((r) => r.status === "Processed").length,
      Pending: rows.filter((r) => r.status === "Pending").length,
      "On Hold": rows.filter((r) => r.status === "On Hold").length,
    };
  });

  const byWorkNumber = workNumbers.map((wn) => {
    const rows = allInvoices.filter((i) => i.workNumber === wn);
    return { workNumber: wn, count: rows.length, value: rows.reduce((s, r) => s + r.amount, 0) };
  });

  const byCategory = categories.map((cat) => {
    const rows = allInvoices.filter((i) => i.serviceCategory === cat);
    return { name: cat, value: rows.reduce((s, r) => s + r.amount, 0), count: rows.length };
  });

  const displayInvoices = (invoices ?? allInvoices) as Invoice[];
  const hasFilters = selectedVendor || selectedStatus || selectedWorkNumber || selectedCategory || dateFrom || dateTo;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Invoice &amp; Billing</h1>
          <p className="text-muted-foreground mt-1">
            Invoice tracking across XYZ Systems, IBM, and ABC Corp — by vendor, work order, and service category
          </p>
        </div>
        <Button
          className="flex-shrink-0 gap-2"
          onClick={() => setUploadOpen(true)}
        >
          <UploadCloudIcon className="w-4 h-4" />
          Upload Invoice
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiCard title="Total Invoices" metric={kpis?.totalReceived} isLoading={kpisLoading} />
        <KpiCard title="Processed" metric={kpis?.totalProcessed} isLoading={kpisLoading} />
        <KpiCard title="Pending / On Hold" metric={kpis?.pendingOnHold} isLoading={kpisLoading} />
        <KpiCard title="Total Invoice Value" metric={kpis?.totalValue} isLoading={kpisLoading} />
        <KpiCard title="Invoices Paid" metric={kpis?.paidCount} isLoading={kpisLoading} />
        <KpiCard title="Avg Cycle Time" metric={kpis?.avgCycleTime} isLoading={kpisLoading} />
        <KpiCard title="Exceptions" metric={kpis?.exceptionCount} isLoading={kpisLoading} />
      </div>

      {/* Date Range Filter */}
      <Card className="border-dashed">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-end gap-4">
            <CalendarIcon className="w-4 h-4 text-muted-foreground mb-2 flex-shrink-0" />
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-8 text-sm w-40"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-8 text-sm w-40"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-muted-foreground mb-0"
                onClick={() => { setDateFrom(""); setDateTo(""); }}
              >
                <XIcon className="w-3 h-3 mr-1" /> Clear dates
              </Button>
            )}
            <div className="text-xs text-muted-foreground self-end mb-2 ml-auto">
              Showing <strong>{displayInvoices.length}</strong> of <strong>{allInvoices.length}</strong> invoices
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Tabs */}
      <div className="flex gap-2 flex-wrap border-b pb-0">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeView === v.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Summary by Vendor — stat cards + detail table */}
      {activeView === "summary-vendor" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summaryByVendor.map((sv) => (
              <Card key={sv.vendor} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedVendor(selectedVendor === sv.vendor ? null : sv.vendor)}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: VENDOR_COLORS[sv.vendor] ?? "#888" }} />
                    <span className="font-semibold text-sm">{sv.vendor}</span>
                    {selectedVendor === sv.vendor && (
                      <Badge variant="default" className="ml-auto text-[10px]">Filtered</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-2xl font-bold">{sv.total}</div>
                      <div className="text-xs text-muted-foreground">Total Invoices</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">${(sv.value / 1000000).toFixed(2)}M</div>
                      <div className="text-xs text-muted-foreground">Total Value</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-status-green" />
                      <span className="text-xs">{sv.processed} Processed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-status-yellow" />
                      <span className="text-xs">{sv.pending} Pending</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      <div className="w-2 h-2 rounded-full bg-status-red" />
                      <span className="text-xs">{sv.onHold} On Hold</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <InvoiceDetailCard
            invoices={displayInvoices}
            vendors={vendors}
            selectedVendor={selectedVendor}
            selectedStatus={selectedStatus}
            hasFilters={!!hasFilters}
            onVendor={setSelectedVendor}
            onStatus={setSelectedStatus}
            onClear={() => { setSelectedVendor(null); setSelectedStatus(null); setDateFrom(""); setDateTo(""); }}
            onDrillDown={setDrillDown}
          />
        </div>
      )}

      {/* Status by Vendor */}
      {activeView === "status-vendor" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Status by Vendor</CardTitle>
              <CardDescription>Processed, Pending, and On Hold counts per vendor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead className="text-right text-status-green">Processed</TableHead>
                      <TableHead className="text-right text-status-yellow">Pending</TableHead>
                      <TableHead className="text-right text-status-red">On Hold</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statusByVendor.map((row) => (
                      <TableRow key={row.vendor} className="cursor-pointer hover:bg-muted/40"
                                onClick={() => setSelectedVendor(selectedVendor === row.vendor ? null : row.vendor)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: VENDOR_COLORS[row.vendor] ?? "#888" }} />
                            <span className="font-medium text-sm">{row.vendor}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-status-green">{row.Processed}</TableCell>
                        <TableCell className="text-right font-semibold text-status-yellow">{row.Pending}</TableCell>
                        <TableCell className="text-right font-semibold text-status-red">{row["On Hold"]}</TableCell>
                        <TableCell className="text-right font-semibold">{row.Processed + row.Pending + row["On Hold"]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <InvoiceDetailCard
            invoices={displayInvoices}
            vendors={vendors}
            selectedVendor={selectedVendor}
            selectedStatus={selectedStatus}
            hasFilters={!!hasFilters}
            onVendor={setSelectedVendor}
            onStatus={setSelectedStatus}
            onClear={() => { setSelectedVendor(null); setSelectedStatus(null); setDateFrom(""); setDateTo(""); }}
            onDrillDown={setDrillDown}
          />
        </div>
      )}

      {/* Aging by Vendor */}
      {activeView === "aging-vendor" && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Aging by Vendor</CardTitle>
            <CardDescription>Number of invoices in each aging bucket per vendor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right text-status-green">0–30 days</TableHead>
                    <TableHead className="text-right text-status-yellow">31–60 days</TableHead>
                    <TableHead className="text-right text-status-red">60+ days</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(aging ?? []).map((row) => (
                    <TableRow key={row.vendor}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: VENDOR_COLORS[row.vendor] ?? "#888" }} />
                          <span className="font-medium text-sm">{row.vendor}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-status-green">{row.bucket0to30}</TableCell>
                      <TableCell className="text-right font-semibold text-status-yellow">{row.bucket30to60}</TableCell>
                      <TableCell className="text-right font-semibold text-status-red">{row.bucket60plus}</TableCell>
                      <TableCell className="text-right font-semibold">{row.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* By Work Number */}
      {activeView === "by-work-number" && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary by Work Number</CardTitle>
            <CardDescription>Invoice volume and value per work order / project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Number</TableHead>
                    <TableHead className="text-right">Invoice Count</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byWorkNumber.map((row) => (
                    <TableRow
                      key={row.workNumber}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => setSelectedWorkNumber(selectedWorkNumber === row.workNumber ? null : row.workNumber)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{row.workNumber}</span>
                          {selectedWorkNumber === row.workNumber && <Badge variant="default" className="text-[10px]">Filtered</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                      <TableCell className="text-right font-semibold">${row.value.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {selectedWorkNumber && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Invoices for {selectedWorkNumber}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedWorkNumber(null)}>
                    <XIcon className="w-4 h-4 mr-1" /> Clear
                  </Button>
                </div>
                <InvoiceDetailTable invoices={displayInvoices} onDrillDown={setDrillDown} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* By Service Category */}
      {activeView === "by-category" && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary by Service Category</CardTitle>
            <CardDescription>Invoice volume and total value per service category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Category</TableHead>
                    <TableHead className="text-right">Invoices</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byCategory.map((row) => (
                    <TableRow
                      key={row.name}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => setSelectedCategory(selectedCategory === row.name ? null : row.name)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{row.name}</span>
                          {selectedCategory === row.name && <Badge variant="default" className="text-[10px]">Filtered</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                      <TableCell className="text-right font-semibold">${row.value.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {selectedCategory && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Invoices — {selectedCategory}</span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                    <XIcon className="w-4 h-4 mr-1" /> Clear
                  </Button>
                </div>
                <InvoiceDetailTable invoices={displayInvoices} onDrillDown={setDrillDown} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Drill-Down Modal */}
      {drillDown && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDrillDown(null)}>
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Invoice — {drillDown.id}</h2>
              <Button variant="ghost" size="icon" onClick={() => setDrillDown(null)}>
                <XIcon className="w-5 h-5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-5">
              <div><span className="text-muted-foreground">Vendor</span><div className="font-semibold">{drillDown.vendor}</div></div>
              <div><span className="text-muted-foreground">Work Number</span><div className="font-semibold">{drillDown.workNumber}</div></div>
              <div><span className="text-muted-foreground">Service Category</span><div className="font-semibold">{drillDown.serviceCategory}</div></div>
              <div><span className="text-muted-foreground">Invoice Date</span><div className="font-semibold">{drillDown.invoiceDate}</div></div>
              <div><span className="text-muted-foreground">Amount</span><div className="font-bold text-lg">${drillDown.amount.toLocaleString()}</div></div>
              <div><span className="text-muted-foreground">Age</span><div className={`font-semibold ${drillDown.ageDays > 60 ? "text-status-red" : ""}`}>{drillDown.ageDays} days</div></div>
              <div><span className="text-muted-foreground">Status</span><div className="mt-0.5">{statusBadge(drillDown.status)}</div></div>
              <div><span className="text-muted-foreground">Payment</span><div className="font-semibold">{drillDown.paymentStatus}</div></div>
              {drillDown.cycleTimeDays != null && (
                <div><span className="text-muted-foreground">Cycle Time</span><div className="font-semibold">{drillDown.cycleTimeDays} days</div></div>
              )}
              {drillDown.hasException === 1 && drillDown.exceptionNote && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Exception Note</span>
                  <div className="font-medium text-status-red mt-0.5">{drillDown.exceptionNote}</div>
                </div>
              )}
            </div>
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Admin Actions</p>
              <ActionButtons invoice={drillDown} />
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}
    </div>
  );
}

function InvoiceDetailCard({
  invoices,
  vendors,
  selectedVendor,
  selectedStatus,
  hasFilters,
  onVendor,
  onStatus,
  onClear,
  onDrillDown,
}: {
  invoices: Invoice[];
  vendors: string[];
  selectedVendor: string | null;
  selectedStatus: string | null;
  hasFilters: boolean;
  onVendor: (v: string | null) => void;
  onStatus: (s: string | null) => void;
  onClear: () => void;
  onDrillDown: (inv: Invoice) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Invoice Detail</CardTitle>
            <CardDescription>Click a row to view details · Use admin actions to manage status</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {vendors.map((v) => (
              <Button
                key={v}
                size="sm"
                variant={selectedVendor === v ? "default" : "outline"}
                className="text-xs h-7"
                onClick={() => onVendor(selectedVendor === v ? null : v)}
              >
                {v}
              </Button>
            ))}
            {(["Processed", "Pending", "On Hold"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={selectedStatus === s ? "default" : "outline"}
                className="text-xs h-7"
                onClick={() => onStatus(selectedStatus === s ? null : s)}
              >
                {s}
              </Button>
            ))}
            {hasFilters && (
              <Button size="sm" variant="ghost" className="text-xs h-7 text-muted-foreground" onClick={onClear}>
                Clear all filters
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <InvoiceDetailTable invoices={invoices} onDrillDown={onDrillDown} />
      </CardContent>
    </Card>
  );
}
