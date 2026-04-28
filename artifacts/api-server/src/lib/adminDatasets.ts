import fs from "fs";
import path from "path";
import {
  buildDatasetTemplate,
  buildDatasetTemplateWithLiveData,
  importDatasetWorkbook,
  snapshotCurrentDataAsRows,
  DatasetImportError,
  type ImportResult,
} from "./datasetEngine";
import { DATASET_SCHEMAS } from "./datasetSchemas";

export interface DatasetDefinition {
  key: string;
  label: string;
  page: string;
  pageRoute: string;
  description: string;
  acceptedFormats: string;
  category: "Operations" | "Finance" | "Talent" | "Roadmap" | "Member Experience";
}

export interface DatasetMeta {
  key: string;
  uploadedAt: string | null;
  uploadedBy: string | null;
  sourceFilename: string | null;
  sizeBytes: number | null;
  version: number;
  storedFilename: string | null;
}

export const DATASET_REGISTRY: DatasetDefinition[] = [
  {
    key: "talent-plan",
    label: "Talent Plan & Skill Heatmap",
    page: "Talent Plan",
    pageRoute: "/dashboard/talent-plan",
    description:
      "Resource roster + product skill matrix. Drives KPI tiles, Skill Readiness Heatmap (J–P current, Q–W planned), role mapping, and workforce reports.",
    acceptedFormats: ".xlsx",
    category: "Talent",
  },
  {
    key: "members",
    label: "Members & Enrollment",
    page: "Members & Enrollment Ops",
    pageRoute: "/dashboard/enrollment-intelligence",
    description:
      "Member roster, enrollment status, plan tier, and demographics. Refreshes the Members page tiles, segmentation, and enrollment intelligence.",
    acceptedFormats: ".xlsx, .csv",
    category: "Member Experience",
  },
  {
    key: "claims",
    label: "Claims Operations",
    page: "Claims",
    pageRoute: "/dashboard/claims",
    description:
      "Claim volumes, auto-adjudication rates, denial reasons, EDI throughput. Refreshes Claims tiles, trend lines, and denial drill-downs.",
    acceptedFormats: ".xlsx, .csv",
    category: "Operations",
  },
  {
    key: "prior-auth",
    label: "Prior Authorization",
    page: "Prior Auth",
    pageRoute: "/dashboard/prior-auth",
    description:
      "PA queue, approval rate, reviewer workload, SLA breach counts. Refreshes the Prior Auth backlog, reviewer view, and SLA charts.",
    acceptedFormats: ".xlsx, .csv",
    category: "Operations",
  },
  {
    key: "providers",
    label: "Provider Network",
    page: "Providers",
    pageRoute: "/dashboard/providers",
    description:
      "Provider directory, network status, credentialing pipeline, contract lifecycle. Refreshes the Providers tiles and network maps.",
    acceptedFormats: ".xlsx, .csv",
    category: "Operations",
  },
  {
    key: "contact-center",
    label: "Contact Center",
    page: "Member Services / Contact Center",
    pageRoute: "/dashboard/member-services",
    description:
      "Call volume, ASA, AHT, FCR, IVR deflection, agent productivity. Refreshes the Contact Center KPI dashboard and agent rollups.",
    acceptedFormats: ".xlsx, .csv",
    category: "Operations",
  },
  {
    key: "vendor-invoices",
    label: "Vendor Invoices (IBM-scoped)",
    page: "Vendor Invoices",
    pageRoute: "/dashboard/vendor-invoices",
    description:
      "IBM-scoped invoice register, PO mapping, payment status, service category. Refreshes the Vendor Invoices ledger and category rollups.",
    acceptedFormats: ".xlsx, .csv",
    category: "Finance",
  },
  {
    key: "app-health",
    label: "Application Health & ~1,000 Apps",
    page: "Application Health",
    pageRoute: "/dashboard/app-health",
    description:
      "Application catalog, runtime health, SLA, incident counts. Refreshes the App Health grid and the ~1,000-app inventory.",
    acceptedFormats: ".xlsx, .csv",
    category: "Operations",
  },
  {
    key: "ibm-aiops",
    label: "IBM AIOps Value Metrics",
    page: "IBM AIOps Value",
    pageRoute: "/dashboard/ibm-ams",
    description:
      "Automation events, MTTR delta, cost-take-out, ticket deflection (7D/14D/21D). Refreshes the IBM AIOps Value scoreboard.",
    acceptedFormats: ".xlsx, .csv",
    category: "Operations",
  },
  {
    key: "transformation-roadmap",
    label: "Transformation Roadmap",
    page: "Digital Roadmap",
    pageRoute: "/dashboard/digital-roadmap",
    description:
      "Initiative timeline, milestones, swimlanes, status. Refreshes the Transformation Roadmap and milestone tracker.",
    acceptedFormats: ".xlsx, .csv",
    category: "Roadmap",
  },
  {
    key: "executive-overview",
    label: "Executive Overview KPIs",
    page: "Executive Overview",
    pageRoute: "/dashboard",
    description:
      "Top-line KPIs, daily trends, executive alerts. Refreshes the Executive Overview hero metrics and alert bar.",
    acceptedFormats: ".xlsx, .csv",
    category: "Operations",
  },
  {
    key: "capability-uplift",
    label: "Capability Uplift Targets",
    page: "Capability Uplift",
    pageRoute: "/dashboard/capability-uplift",
    description:
      "Capability scorecards, uplift targets, FY26 commitments. Refreshes the Capability Uplift heatmap and target tables.",
    acceptedFormats: ".xlsx, .csv",
    category: "Roadmap",
  },
];

const DATA_DIR = path.join(process.cwd(), "data");
const ADMIN_DIR = path.join(DATA_DIR, "admin-uploads");
const META_FILE = path.join(ADMIN_DIR, "_metadata.json");

function ensureDir() {
  if (!fs.existsSync(ADMIN_DIR)) fs.mkdirSync(ADMIN_DIR, { recursive: true });
}

function loadAllMeta(): Record<string, DatasetMeta> {
  ensureDir();
  if (!fs.existsSync(META_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(META_FILE, "utf-8")) as Record<string, DatasetMeta>;
  } catch {
    return {};
  }
}

function saveAllMeta(all: Record<string, DatasetMeta>) {
  ensureDir();
  fs.writeFileSync(META_FILE, JSON.stringify(all, null, 2));
}

export function getDatasetMeta(key: string): DatasetMeta {
  const all = loadAllMeta();
  return (
    all[key] || {
      key,
      uploadedAt: null,
      uploadedBy: null,
      sourceFilename: null,
      sizeBytes: null,
      version: 0,
      storedFilename: null,
    }
  );
}

export function getAllDatasetMeta(): DatasetMeta[] {
  const all = loadAllMeta();
  return DATASET_REGISTRY.map((d) => all[d.key] || {
    key: d.key,
    uploadedAt: null,
    uploadedBy: null,
    sourceFilename: null,
    sizeBytes: null,
    version: 0,
    storedFilename: null,
  });
}

export function saveDatasetUpload(
  key: string,
  buffer: Buffer,
  sourceFilename: string,
  uploadedBy: string,
): DatasetMeta {
  const def = DATASET_REGISTRY.find((d) => d.key === key);
  if (!def) throw new Error(`Unknown dataset key: ${key}`);
  ensureDir();
  const safeName = sourceFilename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const ext = path.extname(safeName) || ".bin";
  const storedFilename = `${key}__v${Date.now()}${ext}`;
  fs.writeFileSync(path.join(ADMIN_DIR, storedFilename), buffer);

  const all = loadAllMeta();
  const prev = all[key];
  const meta: DatasetMeta = {
    key,
    uploadedAt: new Date().toISOString(),
    uploadedBy: uploadedBy || "unknown",
    sourceFilename: safeName,
    sizeBytes: buffer.length,
    version: (prev?.version || 0) + 1,
    storedFilename,
  };
  all[key] = meta;
  saveAllMeta(all);
  return meta;
}

export function getDatasetFilePath(key: string): { fullPath: string; meta: DatasetMeta } | null {
  const meta = getDatasetMeta(key);
  if (!meta.storedFilename) return null;
  const fullPath = path.join(ADMIN_DIR, meta.storedFilename);
  if (!fs.existsSync(fullPath)) return null;
  return { fullPath, meta };
}

export function hasImporter(key: string): boolean {
  return key in DATASET_SCHEMAS;
}

export async function buildTemplateForKey(key: string): Promise<Buffer | null> {
  const schema = DATASET_SCHEMAS[key];
  if (!schema) return null;
  try {
    const liveRows = await snapshotCurrentDataAsRows(schema);
    return buildDatasetTemplateWithLiveData(schema, liveRows);
  } catch {
    return buildDatasetTemplate(schema);
  }
}

export async function runImporterForKey(
  key: string,
  buffer: Buffer,
): Promise<
  | { ok: true; results: ImportResult[]; totalRows: number; warnings: string[] }
  | { ok: false; error: string; validationErrors?: string[]; warnings?: string[] }
> {
  const schema = DATASET_SCHEMAS[key];
  if (!schema) return { ok: false, error: `No importer registered for "${key}"` };
  try {
    const out = await importDatasetWorkbook(schema, buffer);
    return { ok: true, ...out };
  } catch (err) {
    if (err instanceof DatasetImportError) {
      return {
        ok: false,
        error: err.message,
        validationErrors: err.errors,
        warnings: err.warnings,
      };
    }
    return { ok: false, error: err instanceof Error ? err.message : "Import failed" };
  }
}
