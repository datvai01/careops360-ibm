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
  CheckCircle2, ExternalLink, Loader2, Lock, Database,
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
};

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

function DatasetCard({ ds, onUploaded, uploader }: { ds: DatasetRow; onUploaded: () => void; uploader: string }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const hasUpload = !!ds.storedFilename;

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/admin/datasets/${ds.key}/upload`, {
        method: "POST",
        headers: { "X-Uploader": uploader },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        toast({ title: "Upload failed", description: json.error || "Unknown error", variant: "destructive" });
      } else {
        toast({
          title: "Upload complete",
          description: `${ds.label} — v${json.meta.version}, ${fmtBytes(json.meta.sizeBytes)}`,
        });
        onUploaded();
      }
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

  function downloadCurrent() {
    window.location.href = `/api/admin/datasets/${ds.key}/download`;
  }

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet size={16} style={{ color: IBM_BLUE }} />
            <h4 className="text-sm font-bold truncate">{ds.label}</h4>
            {hasUpload && (
              <Badge variant="outline" className="text-[10px]" style={{ borderColor: IBM_BLUE, color: IBM_BLUE }}>
                v{ds.version}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{ds.description}</p>
        </div>
        <Link href={ds.pageRoute}>
          <Button variant="ghost" size="sm" className="text-[11px] h-7 gap-1 flex-shrink-0">
            <ExternalLink size={11} /> Open
          </Button>
        </Link>
      </div>

      {/* Last refresh status */}
      <div className="rounded-md border bg-muted/30 p-3 text-[11px] space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
          {hasUpload ? (
            <CheckCircle2 size={12} className="text-green-600" />
          ) : (
            <Database size={12} className="text-muted-foreground" />
          )}
          {hasUpload ? "Last Refresh" : "No upload yet — using seeded data"}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <span className="text-muted-foreground">When</span>
          <span className="font-medium text-right truncate">{fmtDateTime(ds.uploadedAt)}</span>
          <span className="text-muted-foreground">By</span>
          <span className="font-medium text-right truncate">{ds.uploadedBy || "—"}</span>
          <span className="text-muted-foreground">File</span>
          <span className="font-medium text-right truncate" title={ds.sourceFilename || ""}>
            {ds.sourceFilename || "—"}
          </span>
          <span className="text-muted-foreground">Size</span>
          <span className="font-medium text-right">{fmtBytes(ds.sizeBytes)}</span>
        </div>
      </div>

      {/* Drop zone */}
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
            <Loader2 size={14} className="animate-spin" /> Uploading and validating…
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Upload size={14} /> Drop or click to upload
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

      {hasUpload && (
        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={downloadCurrent}>
          <Download size={12} /> Download current file
        </Button>
      )}
    </Card>
  );
}

function DatasetRepository({ uploader }: { uploader: string }) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery<{ datasets: DatasetRow[] }>({
    queryKey: ["admin", "datasets"],
    queryFn: async () => {
      const res = await fetch("/api/admin/datasets");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    staleTime: 5_000,
  });

  const grouped = useMemo(() => {
    const m = new Map<string, DatasetRow[]>();
    (data?.datasets || []).forEach((d) => {
      if (!m.has(d.category)) m.set(d.category, []);
      m.get(d.category)!.push(d);
    });
    return Array.from(m.entries());
  }, [data]);

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

  return (
    <div className="space-y-6">
      <Card className="p-4 border-l-4" style={{ borderLeftColor: IBM_BLUE }}>
        <div className="flex items-start gap-3">
          <Database size={18} style={{ color: IBM_BLUE }} className="mt-0.5 flex-shrink-0" />
          <div className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Source-of-truth dataset repository.</span>{" "}
            Each card below corresponds to a CareOps360 page. Drop the latest export here and the system records the upload (file, uploader, version, timestamp).
            The portal reads from these uploads on the next page load — no engineering ticket, no restart.
            For the Talent Plan, use the dedicated tab for the full template-driven workflow.
          </div>
        </div>
      </Card>

      {grouped.map(([category, items]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{category}</h3>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground">{items.length} dataset{items.length === 1 ? "" : "s"}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((ds) => (
              <DatasetCard
                key={ds.key}
                ds={ds}
                uploader={uploader}
                onUploaded={() => qc.invalidateQueries({ queryKey: ["admin", "datasets"] })}
              />
            ))}
          </div>
        </div>
      ))}
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
              Platform-wide controls for the CareOps360 portal. Refresh source-of-truth datasets
              for any page, monitor upload history, and download the current file at any time.
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
          <DatasetRepository uploader={user.email} />
        </TabsContent>

        <TabsContent value="talent-plan" className="mt-4">
          <RefreshDataTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
