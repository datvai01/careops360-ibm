import { useQuery } from "@tanstack/react-query";
import { CheckCircle2Icon, ClockIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const IBM_BLUE = "#0f62fe";

interface DatasetMeta {
  key: string;
  label: string;
  uploadedAt: string | null;
  uploadedBy: string | null;
  sourceFilename: string | null;
  sizeBytes: number | null;
  version: number;
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return "Not yet uploaded";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch {
    return iso;
  }
}

function fmtBytes(n: number | null): string {
  if (!n) return "—";
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

interface LastRefreshProps {
  datasetKey: string;
  variant?: "card" | "compact";
  className?: string;
}

export function LastRefresh({ datasetKey, variant = "card", className }: LastRefreshProps) {
  const { data, isLoading, error } = useQuery<DatasetMeta>({
    queryKey: ["/api/admin/datasets", datasetKey, "metadata"],
    queryFn: async () => {
      const token = localStorage.getItem("horizon_token");
      const res = await fetch(`/api/admin/datasets/${datasetKey}/metadata`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load metadata");
      return res.json();
    },
    refetchInterval: 60000,
  });

  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-1.5 text-[11px] text-muted-foreground ${className ?? ""}`}>
        <ClockIcon className="w-3 h-3" />
        <span>Last refresh:</span>
        <span className="font-medium text-foreground">
          {isLoading ? "loading…" : error ? "unknown" : fmtDateTime(data?.uploadedAt ?? null)}
        </span>
        {data?.version != null && (
          <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-semibold" style={{ borderColor: IBM_BLUE, color: IBM_BLUE }}>
            v{data.version}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={`p-4 ${className ?? ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2Icon className="w-4 h-4 text-emerald-600" />
        <h4 className="text-sm font-bold">Last Refresh</h4>
        {data?.version != null && data.version > 0 && (
          <Badge variant="outline" className="ml-auto text-[10px] font-semibold" style={{ borderColor: IBM_BLUE, color: IBM_BLUE }}>
            v{data.version}
          </Badge>
        )}
      </div>
      {isLoading ? (
        <div className="text-xs text-muted-foreground">Loading…</div>
      ) : error || !data ? (
        <div className="text-xs text-red-600">Could not load refresh status.</div>
      ) : (
        <div className="space-y-1.5 text-xs">
          <Row label="Refreshed at" value={fmtDateTime(data.uploadedAt)} />
          <Row label="Refreshed by" value={data.uploadedBy ?? "—"} />
          <Row label="Source file" value={data.sourceFilename ?? "—"} truncate />
          {data.sizeBytes != null && <Row label="File size" value={fmtBytes(data.sizeBytes)} />}
        </div>
      )}
    </Card>
  );
}

function Row({ label, value, truncate }: { label: string; value: string; truncate?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold text-right ${truncate ? "truncate max-w-[220px]" : ""}`}>{value}</span>
    </div>
  );
}
