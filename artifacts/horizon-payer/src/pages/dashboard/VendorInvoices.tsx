import { useState } from "react";
import {
  useGetVendorInvoiceKpis,
  useGetVendorInvoiceList,
  useGetVendorInvoiceAging,
  useGetVendorInvoiceAlerts,
} from "@workspace/api-client-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AlertTriangleIcon, ChevronDownIcon, ChevronRightIcon, XIcon } from "lucide-react";

const VENDOR_COLORS: Record<string, string> = {
  "XYZ Systems": "#0f62fe",
  IBM: "#24a148",
  "ABC Corp": "#8a3ffc",
};

const CATEGORY_COLORS = ["#0f62fe", "#24a148", "#8a3ffc", "#ff832b"];

const VIEWS = [
  { id: "summary-vendor", label: "Summary by Vendor" },
  { id: "status-vendor", label: "Status by Vendor" },
  { id: "aging-vendor", label: "Aging by Vendor" },
  { id: "by-work-number", label: "By Work Number" },
  { id: "by-category", label: "By Service Category" },
];

function alertTypeLabel(type: string) {
  if (type === "delayed_payment") return "Delayed Payment";
  if (type === "high_value_pending") return "High-Value Pending";
  if (type === "invoice_mismatch") return "Invoice Mismatch";
  return type;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Processed: "bg-status-green/10 text-status-green border-status-green/20",
    Pending: "bg-status-yellow/10 text-status-yellow border-status-yellow/20",
    "On Hold": "bg-status-red/10 text-status-red border-status-red/20",
  };
  return (
    <Badge variant="outline" className={`text-[10px] ${map[status] ?? ""}`}>
      {status}
    </Badge>
  );
}

function paymentBadge(ps: string) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] ${ps === "Paid" ? "bg-status-green/10 text-status-green border-status-green/20" : "bg-muted text-muted-foreground"}`}
    >
      {ps}
    </Badge>
  );
}

type DrillDownInvoice = {
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

export default function VendorInvoices() {
  const [activeView, setActiveView] = useState("summary-vendor");
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedWorkNumber, setSelectedWorkNumber] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [drillDown, setDrillDown] = useState<DrillDownInvoice | null>(null);

  const q = { refetchInterval: 30000 };
  const { data: kpis, isLoading: kpisLoading } = useGetVendorInvoiceKpis({ query: q });
  const { data: invoices } = useGetVendorInvoiceList(
    {
      vendor: selectedVendor ?? undefined,
      status: selectedStatus ?? undefined,
      workNumber: selectedWorkNumber ?? undefined,
      serviceCategory: selectedCategory ?? undefined,
    },
    { query: q }
  );
  const { data: aging } = useGetVendorInvoiceAging({ query: q });
  const { data: alerts } = useGetVendorInvoiceAlerts({ query: q });

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

  const displayInvoices = invoices ?? allInvoices;
  const hasFilters = selectedVendor || selectedStatus || selectedWorkNumber || selectedCategory;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Invoice &amp; Billing</h1>
          <p className="text-muted-foreground mt-1">Invoice tracking across XYZ Systems, IBM, and ABC Corp — by vendor, work order, and service category</p>
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts && alerts.filter((a) => a.severity === "high").length > 0 && (
        <div className="space-y-2">
          {alerts
            .filter((a) => a.severity === "high")
            .map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3"
              >
                <AlertTriangleIcon className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-destructive mr-2">{alertTypeLabel(alert.alertType)}</span>
                  <span className="text-xs text-destructive/90">{alert.message}</span>
                </div>
                {alert.amount && (
                  <span className="text-xs font-bold text-destructive flex-shrink-0">
                    ${alert.amount.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
        </div>
      )}

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

      {/* Views */}
      {activeView === "summary-vendor" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Count by Vendor</CardTitle>
              <CardDescription>Total invoices received per vendor</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryByVendor} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="vendor" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" width={90} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="total" name="Invoices" radius={[0, 4, 4, 0]}>
                    {summaryByVendor.map((entry) => (
                      <Cell key={entry.vendor} fill={VENDOR_COLORS[entry.vendor] ?? "#0f62fe"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Value by Vendor</CardTitle>
              <CardDescription>Total dollar value of invoices received</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryByVendor} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                  <YAxis type="category" dataKey="vendor" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" width={90} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} formatter={(v: number) => `$${(v / 1000000).toFixed(2)}M`} />
                  <Bar dataKey="value" name="Total Value" radius={[0, 4, 4, 0]}>
                    {summaryByVendor.map((entry) => (
                      <Cell key={entry.vendor} fill={VENDOR_COLORS[entry.vendor] ?? "#0f62fe"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === "status-vendor" && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status by Vendor</CardTitle>
            <CardDescription>Processed, Pending, and On Hold counts per vendor</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusByVendor} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="vendor" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="Processed" stackId="a" fill="#24a148" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Pending" stackId="a" fill="#f1c21b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="On Hold" stackId="a" fill="#da1e28" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {activeView === "aging-vendor" && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Aging by Vendor</CardTitle>
            <CardDescription>Number of invoices in each aging bucket per vendor</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aging ?? []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="vendor" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="bucket0to30" name="0–30 days" fill="#24a148" radius={[0, 0, 0, 0]} />
                <Bar dataKey="bucket30to60" name="30–60 days" fill="#f1c21b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="bucket60plus" name="60+ days" fill="#da1e28" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

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
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedWorkNumber(selectedWorkNumber === row.workNumber ? null : row.workNumber)}
                    >
                      <TableCell className="font-medium">{row.workNumber}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                      <TableCell className="text-right">${row.value.toLocaleString()}</TableCell>
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

      {activeView === "by-category" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Value by Service Category</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine>
                    {byCategory.map((entry, i) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} formatter={(v: number) => `$${(v / 1000000).toFixed(2)}M`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
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
                    {byCategory.map((row, i) => (
                      <TableRow
                        key={row.name}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedCategory(selectedCategory === row.name ? null : row.name)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                            {row.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{row.count}</TableCell>
                        <TableCell className="text-right">${row.value.toLocaleString()}</TableCell>
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
        </div>
      )}

      {/* Invoice List + Filters (shown in summary views) */}
      {(activeView === "summary-vendor" || activeView === "status-vendor") && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Invoice Detail</CardTitle>
                <CardDescription>Click a row to view full invoice details</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {vendors.map((v) => (
                  <Button
                    key={v}
                    size="sm"
                    variant={selectedVendor === v ? "default" : "outline"}
                    className="text-xs h-7"
                    onClick={() => setSelectedVendor(selectedVendor === v ? null : v)}
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
                    onClick={() => setSelectedStatus(selectedStatus === s ? null : s)}
                  >
                    {s}
                  </Button>
                ))}
                {hasFilters && (
                  <Button size="sm" variant="ghost" className="text-xs h-7 text-muted-foreground" onClick={() => { setSelectedVendor(null); setSelectedStatus(null); }}>
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <InvoiceDetailTable invoices={displayInvoices} onDrillDown={setDrillDown} />
          </CardContent>
        </Card>
      )}

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>Delayed payments, high-value pending, and invoice mismatches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(alerts ?? []).map((alert) => (
              <div key={alert.id} className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${alert.severity === "high" ? "bg-destructive/5 border-destructive/20" : "bg-muted/40 border-border"}`}>
                <AlertTriangleIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.severity === "high" ? "text-destructive" : "text-status-yellow"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="outline" className={`text-[10px] ${alert.severity === "high" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-status-yellow/10 text-status-yellow border-status-yellow/20"}`}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-semibold">{alertTypeLabel(alert.alertType)}</span>
                    {alert.invoiceId && <span className="text-xs text-muted-foreground">{alert.invoiceId}</span>}
                  </div>
                  <p className="text-sm">{alert.message}</p>
                </div>
                {alert.amount && (
                  <span className="text-sm font-bold flex-shrink-0">${alert.amount.toLocaleString()}</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drill-Down Modal */}
      {drillDown && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDrillDown(null)}>
          <div className="bg-card rounded-xl border shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Invoice Details — {drillDown.id}</h2>
              <Button variant="ghost" size="icon" onClick={() => setDrillDown(null)}>
                <XIcon className="w-5 h-5" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><span className="text-muted-foreground">Vendor</span><div className="font-semibold">{drillDown.vendor}</div></div>
              <div><span className="text-muted-foreground">Work Number</span><div className="font-semibold">{drillDown.workNumber}</div></div>
              <div><span className="text-muted-foreground">Service Category</span><div className="font-semibold">{drillDown.serviceCategory}</div></div>
              <div><span className="text-muted-foreground">Invoice Date</span><div className="font-semibold">{drillDown.invoiceDate}</div></div>
              <div><span className="text-muted-foreground">Amount</span><div className="font-semibold text-primary">${drillDown.amount.toLocaleString()}</div></div>
              <div><span className="text-muted-foreground">Age</span><div className="font-semibold">{drillDown.ageDays} days</div></div>
              <div><span className="text-muted-foreground">Status</span><div className="mt-1">{statusBadge(drillDown.status)}</div></div>
              <div><span className="text-muted-foreground">Payment</span><div className="mt-1">{paymentBadge(drillDown.paymentStatus)}</div></div>
              {drillDown.cycleTimeDays != null && (
                <div><span className="text-muted-foreground">Cycle Time</span><div className="font-semibold">{drillDown.cycleTimeDays} days</div></div>
              )}
              {drillDown.hasException === 1 && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Exception</span>
                  <div className="mt-1 flex items-center gap-2 text-destructive font-semibold">
                    <AlertTriangleIcon className="w-4 h-4" />
                    {drillDown.exceptionNote ?? "Discrepancy noted"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceDetailTable({
  invoices,
  onDrillDown,
}: {
  invoices: DrillDownInvoice[];
  onDrillDown: (inv: DrillDownInvoice) => void;
}) {
  return (
    <div className="rounded-md border max-h-80 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Work #</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Age</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">No invoices match selected filters.</TableCell>
            </TableRow>
          ) : (
            invoices.map((inv) => (
              <TableRow
                key={inv.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onDrillDown(inv)}
              >
                <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                <TableCell className="text-xs">{inv.vendor}</TableCell>
                <TableCell className="text-xs font-medium">{inv.workNumber}</TableCell>
                <TableCell className="text-xs">{inv.serviceCategory}</TableCell>
                <TableCell className="text-right text-xs font-semibold">${inv.amount.toLocaleString()}</TableCell>
                <TableCell>{statusBadge(inv.status)}</TableCell>
                <TableCell>{paymentBadge(inv.paymentStatus)}</TableCell>
                <TableCell className="text-right text-xs">
                  <span className={inv.ageDays > 60 ? "text-destructive font-semibold" : inv.ageDays > 30 ? "text-status-yellow" : ""}>{inv.ageDays}d</span>
                </TableCell>
                <TableCell>
                  {inv.hasException === 1 && <AlertTriangleIcon className="w-4 h-4 text-destructive" />}
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground inline" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
