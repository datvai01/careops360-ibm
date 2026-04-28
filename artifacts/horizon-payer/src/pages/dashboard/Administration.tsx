import { useState, useRef, useMemo } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Settings, Users, ShieldAlert, Upload, Download, FileSpreadsheet,
  CheckCircle2, ExternalLink, Loader2, Lock, Database, ChevronRight, AlertCircle, FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RefreshDataTab } from "./TalentPlan";

const IBM_BLUE = "#0F62FE";

type DatasetRow = {
  key: string;
  label: string;
  page: string;
  pageRoute: string;
  description: string;
  acceptedFormats: string;
  category: string;
  uploadedAt: string | null;
  uploadedBy: string | null;
  sourceFilename: string | null;
  sizeBytes: number | null;
  version: number;
  storedFilename: string | null;
  hasImporter: boolean;
  hasTemplate: boolean;
};

type ImportResultRow = { tableName: string; rowsInserted: number; warnings: string[] };

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function fmtBytes(n: number | null) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function getAuthHeaders(): HeadersInit {
  const t = localStorage.getItem("horizon_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function authedFetch(url: string, init: RequestInit = {}) {
  return fetch(url, {
    ...init,
    headers: { ...(init.headers || {}), ...getAuthHeaders() },
  });
}

function authedDownload(url: string, filename: string) {
  return authedFetch(url).then(async (res) => {
    if (!res.ok) throw new Error(`Download failed (${res.status})`);
    const blob = await res.blob();
    const a = document.createElement("a");
    const u = URL.createObjectURL(blob);
    a.href = u;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(u);
  });
}

function DatasetDetail({ ds, onUploaded }: { ds: DatasetRow; onUploaded: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [lastResult, setLastResult] = useState<{
    rows: ImportResultRow[];
    totalRows: number;
    warnings: string[];
  } | null>(null);
  const [lastError, setLastError] = useState<{
    message: string;
    validationErrors: string[];
    warnings: string[];
  } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const hasUpload = !!ds.storedFilename;

  async function uploadFile(file: File) {
    if (ds.hasImporter) {
      const ok = window.confirm(
        `This will replace the underlying ${ds.label} tables in the database with the contents of "${file.name}".\n\n` +
          `The change is atomic — if any row fails validation, NOTHING is written and the database stays as it was.\n\n` +
          `Proceed?`,
      );
      if (!ok) return;
    }
    setUploading(true);
    setLastResult(null);
    setLastError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await authedFetch(`/api/admin/datasets/${ds.key}/upload`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        const validationErrors: string[] = json.validationErrors || [];
        const warnings: string[] = json.warnings || [];
        setLastError({
          message: json.error || "Upload failed",
          validationErrors,
          warnings,
        });
        toast({
          title: "Upload rejected — database unchanged",
          description:
            validationErrors.length > 0
              ? `${validationErrors.length} validation error${validationErrors.length === 1 ? "" : "s"}. See details below.`
              : json.error || "Unknown error",
          variant: "destructive",
        });
        return;
      }
      const rows = (json.results as ImportResultRow[] | undefined) || [];
      const totalRows = (json.totalRows as number | undefined) || 0;
      const warnings = (json.warnings as string[] | undefined) || [];
      setLastResult({ rows, totalRows, warnings });
      toast({
        title: "Upload complete",
        description:
          rows.length > 0
            ? `${ds.label} — v${json.meta.version}, ${totalRows} rows imported into ${rows.length} table${rows.length === 1 ? "" : "s"}.`
            : `${ds.label} — v${json.meta.version} (file recorded).`,
      });
      qc.invalidateQueries();
      onUploaded();
    } catch (e) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Network error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  function downloadTemplate() {
    const fname = `${ds.label.replace(/[^a-zA-Z0-9]+/g, "_")}_Template.xlsx`;
    authedDownload(`/api/admin/datasets/${ds.key}/template`, fname).catch((e) => {
      toast({ title: "Template download failed", description: String(e), variant: "destructive" });
    });
  }

  function downloadCurrent() {
    if (!ds.sourceFilename) return;
    authedDownload(`/api/admin/datasets/${ds.key}/download`, ds.sourceFilename).catch((e) => {
      toast({ title: "Download failed", description: String(e), variant: "destructive" });
    });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-5 border-l-4" style={{ borderLeftColor: IBM_BLUE }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <FileSpreadsheet size={16} style={{ color: IBM_BLUE }} />
              <h3 className="text-base font-bold">{ds.label}</h3>
              <Badge variant="outline" className="text-[10px]">{ds.category}</Badge>
              {hasUpload && (
                <Badge style={{ background: IBM_BLUE, color: "white" }} className="text-[10px]">
                  v{ds.version}
                </Badge>
              )}
              {!ds.hasImporter && (
                <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-700">
                  File-only (no DB importer)
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{ds.description}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Drives the <span className="font-semibold text-foreground">{ds.page}</span> page.
            </p>
          </div>
          <Link href={ds.pageRoute}>
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <ExternalLink size={12} /> Open page
            </Button>
          </Link>
        </div>
      </Card>

      {/* Two-column action row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1: Download template */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="rounded-full text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center flex-shrink-0"
              style={{ background: IBM_BLUE }}
            >
              1
            </div>
            <h4 className="text-sm font-semibold">Download template</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {ds.hasTemplate
              ? "Excel template with the exact column layout, an Instructions sheet, and a snapshot of the current data so the team can edit and re-upload."
              : "No automatic template available for this dataset yet. Upload your file directly using the panel on the right."}
          </p>
          <Button
            onClick={downloadTemplate}
            disabled={!ds.hasTemplate}
            className="w-full text-xs gap-1.5"
            style={ds.hasTemplate ? { background: IBM_BLUE, color: "white" } : undefined}
            size="sm"
          >
            <FileDown size={13} /> Download {ds.label} template
          </Button>
        </Card>

        {/* Step 2: Upload */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="rounded-full text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center flex-shrink-0"
              style={{ background: IBM_BLUE }}
            >
              2
            </div>
            <h4 className="text-sm font-semibold">Upload completed file</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Drop the {ds.acceptedFormats} file. The system validates it, replaces the underlying tables, and the page refreshes automatically.
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
            onClick={() => !uploading && fileInput.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors",
              dragOver ? "bg-blue-50 border-[#0F62FE]" : "border-muted-foreground/25 hover:border-muted-foreground/50",
              uploading && "opacity-60 pointer-events-none",
            )}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 size={14} className="animate-spin" /> Uploading, parsing, refreshing…
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                <Upload size={16} />
                <span>Drop or click to upload</span>
                <span className="text-[10px] opacity-70">({ds.acceptedFormats})</span>
              </div>
            )}
            <input
              ref={fileInput}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f);
                if (fileInput.current) fileInput.current.value = "";
              }}
            />
          </div>
        </Card>
      </div>

      {/* Last refresh / current file panel */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {hasUpload ? (
            <CheckCircle2 size={14} className="text-green-600" />
          ) : (
            <Database size={14} className="text-muted-foreground" />
          )}
          <h4 className="text-sm font-semibold">
            {hasUpload ? "Last refresh" : "No upload yet — page is using seeded data"}
          </h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-muted-foreground mb-0.5">When</div>
            <div className="font-medium">{fmtDateTime(ds.uploadedAt)}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-0.5">By</div>
            <div className="font-medium truncate">{ds.uploadedBy || "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-0.5">Source file</div>
            <div className="font-medium truncate" title={ds.sourceFilename || ""}>
              {ds.sourceFilename || "—"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-0.5">Size</div>
            <div className="font-medium">{fmtBytes(ds.sizeBytes)}</div>
          </div>
        </div>
        {hasUpload && (
          <Button variant="outline" size="sm" className="text-xs gap-1.5 mt-3" onClick={downloadCurrent}>
            <Download size={12} /> Download current file
          </Button>
        )}
      </Card>

      {/* Validation error panel */}
      {lastError && (
        <Card className="p-4 border-l-4" style={{ borderLeftColor: "#da1e28" }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-red-600" />
            <h4 className="text-sm font-semibold text-red-900">Upload rejected — database is unchanged</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            The file did not pass validation. The import is atomic, so no rows were deleted or
            inserted. Fix the issues below in the workbook and re-upload.
          </p>
          {lastError.validationErrors.length > 0 && (
            <div className="rounded bg-red-50 border border-red-200 p-3 max-h-72 overflow-y-auto">
              <div className="text-[11px] font-semibold text-red-900 mb-1.5">
                {lastError.validationErrors.length} validation error{lastError.validationErrors.length === 1 ? "" : "s"}:
              </div>
              <ul className="list-disc ml-5 text-[11px] text-red-900 space-y-0.5">
                {lastError.validationErrors.slice(0, 50).map((e, i) => <li key={i}>{e}</li>)}
                {lastError.validationErrors.length > 50 && (
                  <li className="opacity-70">…and {lastError.validationErrors.length - 50} more</li>
                )}
              </ul>
            </div>
          )}
          {lastError.warnings.length > 0 && (
            <div className="mt-2 rounded bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900">
              <div className="font-semibold mb-1">Warnings:</div>
              <ul className="list-disc ml-5 space-y-0.5">
                {lastError.warnings.slice(0, 8).map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Post-upload import results */}
      {lastResult && (
        <Card className="p-4 border-l-4" style={{ borderLeftColor: "#198038" }}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-green-600" />
            <h4 className="text-sm font-semibold">Database refresh complete</h4>
            <Badge variant="outline" className="text-[10px]">{lastResult.totalRows} total rows</Badge>
          </div>
          {lastResult.rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="text-xs w-full">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    <th className="text-left py-1.5 pr-3 font-normal">Table</th>
                    <th className="text-right py-1.5 px-3 font-normal">Rows inserted</th>
                    <th className="text-left py-1.5 pl-3 font-normal">Warnings</th>
                  </tr>
                </thead>
                <tbody>
                  {lastResult.rows.map((r) => (
                    <tr key={r.tableName} className="border-b last:border-b-0">
                      <td className="py-1.5 pr-3 font-mono text-[11px]">{r.tableName}</td>
                      <td className="py-1.5 px-3 text-right font-semibold">{r.rowsInserted.toLocaleString()}</td>
                      <td className="py-1.5 pl-3 text-amber-700">
                        {r.warnings.length === 0 ? "—" : `${r.warnings.length} (see below)`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">File recorded; no DB importer is configured for this dataset yet.</p>
          )}
          {lastResult.warnings.length > 0 && (
            <div className="mt-3 p-3 rounded bg-amber-50 border border-amber-200 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                <AlertCircle size={12} /> Warnings
              </div>
              <ul className="list-disc ml-5 text-amber-900 space-y-0.5">
                {lastResult.warnings.slice(0, 8).map((w, i) => <li key={i}>{w}</li>)}
                {lastResult.warnings.length > 8 && (
                  <li className="opacity-70">…and {lastResult.warnings.length - 8} more</li>
                )}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function DatasetRepository() {
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery<{ datasets: DatasetRow[] }>({
    queryKey: ["admin", "datasets"],
    queryFn: async () => {
      const res = await authedFetch("/api/admin/datasets");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    staleTime: 5_000,
  });

  const datasets = useMemo(() => data?.datasets || [], [data]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const m = new Map<string, DatasetRow[]>();
    datasets.forEach((d) => {
      if (!m.has(d.category)) m.set(d.category, []);
      m.get(d.category)!.push(d);
    });
    return Array.from(m.entries());
  }, [datasets]);

  const selected = useMemo(
    () => datasets.find((d) => d.key === selectedKey) || datasets[0] || null,
    [datasets, selectedKey],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading dataset registry…
      </div>
    );
  }
  if (error) {
    return <div className="text-sm text-red-600 py-8">Failed to load datasets.</div>;
  }
  if (!selected) {
    return <div className="text-sm text-muted-foreground py-8">No datasets registered.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
      {/* Left nav: dataset list grouped by category */}
      <div className="space-y-4">
        <Card className="p-3">
          <div className="space-y-3">
            {grouped.map(([category, items]) => (
              <div key={category}>
                <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground px-2 mb-1">
                  {category}
                </div>
                <div className="space-y-0.5">
                  {items.map((d) => {
                    const active = d.key === selected.key;
                    return (
                      <button
                        key={d.key}
                        onClick={() => setSelectedKey(d.key)}
                        className={cn(
                          "w-full text-left rounded-md px-2 py-1.5 text-xs flex items-center justify-between gap-2 transition-colors",
                          active
                            ? "bg-blue-50 text-[#0F62FE] font-semibold"
                            : "hover:bg-muted text-foreground",
                        )}
                      >
                        <span className="truncate">{d.label}</span>
                        <span className="flex items-center gap-1 flex-shrink-0">
                          {d.storedFilename && (
                            <CheckCircle2 size={10} className="text-green-600" />
                          )}
                          <ChevronRight size={11} className="opacity-50" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-3 text-[11px] text-muted-foreground leading-relaxed">
          <p className="mb-1.5">
            <span className="font-semibold text-foreground">How it works.</span> Pick any
            dataset, download the template, fill it in, and upload. The system parses the
            workbook, replaces the matching DB tables, and the corresponding page refreshes
            automatically.
          </p>
        </Card>
      </div>

      {/* Right pane: selected dataset detail */}
      <div>
        <DatasetDetail
          ds={selected}
          onUploaded={() => qc.invalidateQueries({ queryKey: ["admin", "datasets"] }).then(() => refetch())}
        />
      </div>
    </div>
  );
}

function AccessDenied({ role }: { role: string | undefined }) {
  return (
    <div className="p-6">
      <Card className="p-8 max-w-2xl mx-auto text-center border-l-4" style={{ borderLeftColor: "#da1e28" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full p-3" style={{ background: "rgba(218,30,40,0.1)" }}>
            <Lock size={24} style={{ color: "#da1e28" }} />
          </div>
          <h2 className="text-lg font-bold">Administrator access required</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            The Administration area is restricted to platform administrators.
            Your current role <Badge variant="outline" className="mx-1 text-[10px]">{role || "unknown"}</Badge>
            does not include Administration permissions.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            To request access, contact the CareOps360 admin team or sign in with an admin account
            (e.g. <code className="px-1.5 py-0.5 rounded bg-muted text-[11px]">admin@horizon.com</code>).
          </p>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="mt-3 text-xs">Return to dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function Administration() {
  const { data: user, isLoading } = useGetCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground gap-2">
        <Loader2 size={16} className="animate-spin" /> Verifying administrator access…
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <AccessDenied role={user?.role} />;
  }

  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <Card className="p-5 border-l-4" style={{ borderLeftColor: IBM_BLUE }}>
        <div className="flex items-start gap-4">
          <div className="rounded-lg p-2.5 flex-shrink-0" style={{ background: `${IBM_BLUE}15` }}>
            <Settings size={20} style={{ color: IBM_BLUE }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight">Administration</h1>
              <Badge style={{ background: IBM_BLUE, color: "white" }} className="text-[10px] gap-1">
                <ShieldAlert size={10} /> Admin only
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground mt-1">
              Refresh source-of-truth data for any CareOps360 page. For each dataset you can
              download a ready-to-fill Excel template, drop a completed file back, and the
              underlying database tables are replaced and the page refreshes automatically.
              Signed in as <span className="font-semibold text-foreground">{user.name}</span> ({user.email}).
            </p>
          </div>
        </div>
      </Card>

      {/* Admin tabs */}
      <Tabs defaultValue="datasets" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto justify-start gap-1 bg-muted/50 p-1">
          <TabsTrigger
            value="datasets"
            className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#0F62FE] data-[state=active]:shadow-sm gap-1.5"
          >
            <Database size={12} /> Page Datasets
          </TabsTrigger>
          <TabsTrigger
            value="talent-plan"
            className="text-xs data-[state=active]:bg-white data-[state=active]:text-[#0F62FE] data-[state=active]:shadow-sm gap-1.5"
          >
            <Users size={12} /> Talent Plan (live workflow)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="mt-4">
          <DatasetRepository />
        </TabsContent>

        <TabsContent value="talent-plan" className="mt-4">
          <RefreshDataTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
