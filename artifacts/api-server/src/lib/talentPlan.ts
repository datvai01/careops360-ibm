import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import * as XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "talentPlan.json");
const META_FILE = path.join(DATA_DIR, "talentPlan.meta.json");

export interface TalentResource {
  serial: string;
  name: string;
  domain: string;
  portfolio: string;
  product: string;
  applicationArea: string;
  typeOfWork: string;
  role: string;
  location: string;
  current: {
    techStack: string;
    futureTech: string;
    industry: string;
    agile: string;
    agentic: string;
    devsecops: string;
    aiops: string;
  };
  plan: {
    techStack: string;
    futureTech: string;
    industry: string;
    agile: string;
    agentic: string;
    devops: string;
    aiops: string;
  };
}

export interface TalentProduct {
  domain: string;
  portfolio: string;
  product: string;
  applicationArea: string;
  currentTech: string;
  futureTech: string;
  industry: string;
  agile: string;
  agentic: string;
  devsecops: string;
  aiops: string;
}

export interface TalentPlanData {
  resources: TalentResource[];
  products: TalentProduct[];
}

export interface TalentPlanMeta {
  uploadedAt: string;
  uploadedBy: string;
  sourceFilename: string;
  resourceCount: number;
  productCount: number;
  version: number;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function defaultMeta(data: TalentPlanData): TalentPlanMeta {
  return {
    uploadedAt: new Date().toISOString(),
    uploadedBy: "system (initial seed)",
    sourceFilename: "Talent_Plan_0422a.xlsx",
    resourceCount: data.resources.length,
    productCount: data.products.length,
    version: 1,
  };
}

export function getTalentPlan(): TalentPlanData {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    return { resources: [], products: [] };
  }
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as TalentPlanData;
}

export function getTalentPlanMeta(): TalentPlanMeta {
  ensureDataDir();
  if (fs.existsSync(META_FILE)) {
    return JSON.parse(fs.readFileSync(META_FILE, "utf-8")) as TalentPlanMeta;
  }
  // Synthesize meta from data file if no meta file exists yet
  const data = getTalentPlan();
  const meta = defaultMeta(data);
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
  return meta;
}

export function saveTalentPlan(
  data: TalentPlanData,
  uploader: string,
  sourceFilename: string,
): TalentPlanMeta {
  ensureDataDir();
  const prevVersion = fs.existsSync(META_FILE)
    ? (JSON.parse(fs.readFileSync(META_FILE, "utf-8")) as TalentPlanMeta).version
    : 0;
  const meta: TalentPlanMeta = {
    uploadedAt: new Date().toISOString(),
    uploadedBy: uploader || "unknown",
    sourceFilename: sourceFilename || "uploaded.xlsx",
    resourceCount: data.resources.length,
    productCount: data.products.length,
    version: prevVersion + 1,
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(data));
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
  return meta;
}

/* ─────────────────────── Excel parsing ─────────────────────── */

const PRODUCT_SHEET = "Product Level - Required Skills";
const RESOURCE_SHEET = "Resource Level - Talent Plan";
const REFERENCE_SHEET = "References";

function s(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function findHeaderRow(rows: any[][], expectedFirstCell: string): number {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    if (s(rows[i]?.[0]).toLowerCase() === expectedFirstCell.toLowerCase()) {
      return i;
    }
  }
  return -1;
}

export interface ParseResult {
  data: TalentPlanData;
  warnings: string[];
}

export function parseTalentPlanWorkbook(buffer: Buffer): ParseResult {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const warnings: string[] = [];

  // Validate sheets exist
  const missing: string[] = [];
  if (!wb.SheetNames.includes(PRODUCT_SHEET)) missing.push(PRODUCT_SHEET);
  if (!wb.SheetNames.includes(RESOURCE_SHEET)) missing.push(RESOURCE_SHEET);
  if (missing.length) {
    throw new Error(
      `Workbook is missing required sheet(s): ${missing.join(", ")}. ` +
        `Please use the provided template.`,
    );
  }

  /* ── Products ── */
  const productSheet = wb.Sheets[PRODUCT_SHEET];
  const productRows = XLSX.utils.sheet_to_json<any[]>(productSheet, {
    defval: "",
    header: 1,
  });
  const pHeaderRow = findHeaderRow(productRows, "Domain");
  if (pHeaderRow < 0) {
    throw new Error(
      `Could not find header row starting with "Domain" in sheet "${PRODUCT_SHEET}".`,
    );
  }
  const products: TalentProduct[] = [];
  for (let i = pHeaderRow + 1; i < productRows.length; i++) {
    const r = productRows[i];
    if (!r) continue;
    const domain = s(r[0]);
    const product = s(r[2]);
    if (!domain && !product) continue;
    products.push({
      domain,
      portfolio: s(r[1]),
      product,
      applicationArea: s(r[3]),
      currentTech: s(r[4]),
      futureTech: s(r[5]),
      industry: s(r[6]),
      agile: s(r[7]),
      agentic: s(r[8]),
      devsecops: s(r[9]),
      aiops: s(r[10]),
    });
  }
  if (products.length === 0) {
    warnings.push(`No product rows parsed from "${PRODUCT_SHEET}".`);
  }

  /* ── Resources ── */
  const resSheet = wb.Sheets[RESOURCE_SHEET];
  const resRows = XLSX.utils.sheet_to_json<any[]>(resSheet, {
    defval: "",
    header: 1,
  });
  const rHeaderRow = findHeaderRow(resRows, "Serial#");
  if (rHeaderRow < 0) {
    throw new Error(
      `Could not find header row starting with "Serial#" in sheet "${RESOURCE_SHEET}".`,
    );
  }
  const resources: TalentResource[] = [];
  for (let i = rHeaderRow + 1; i < resRows.length; i++) {
    const r = resRows[i];
    if (!r) continue;
    const serial = s(r[0]);
    const name = s(r[1]);
    if (!serial && !name) continue;
    resources.push({
      serial,
      name,
      domain: s(r[2]),
      portfolio: s(r[3]),
      product: s(r[4]),
      applicationArea: s(r[5]),
      typeOfWork: s(r[6]),
      role: s(r[7]),
      location: s(r[8]),
      current: {
        techStack: s(r[9]),
        futureTech: s(r[10]),
        industry: s(r[11]),
        agile: s(r[12]),
        agentic: s(r[13]),
        devsecops: s(r[14]),
        aiops: s(r[15]),
      },
      plan: {
        techStack: s(r[16]),
        futureTech: s(r[17]),
        industry: s(r[18]),
        agile: s(r[19]),
        agentic: s(r[20]),
        devops: s(r[21]),
        aiops: s(r[22]),
      },
    });
  }
  if (resources.length === 0) {
    warnings.push(`No resource rows parsed from "${RESOURCE_SHEET}".`);
  }

  return { data: { resources, products }, warnings };
}

/* ─────────────────────── Template generation ─────────────────────── */

export function buildTemplateWorkbook(): Buffer {
  const wb = XLSX.utils.book_new();

  // Always pre-populate the template with the current production data so
  // teams download a working copy of the latest plan, edit it, and re-upload.
  const current = getTalentPlan();

  /* Product Level — Required Skills */
  const productGroupHeader = [
    "",
    "",
    "",
    "",
    "Technical Skills",
    "",
    "Industry",
    "NextGen Skills",
    "",
    "",
    "",
  ];
  const productColumnHeader = [
    "Domain",
    "Portfolio",
    "Product",
    "Application Areas",
    "Current Tech Stack",
    "Future Tech Stack",
    "Industry Knowledge",
    "Agile",
    "Agentic",
    "DevSecOps",
    "AIOps",
  ];
  const productExampleRow = [
    "Horizontal Functions",
    "Enterprise Platforms",
    "Shared Platforms",
    "CS",
    "Microservices, Java, Springboot, Mongo DB, Postgres",
    "NA",
    "Industry badge",
    "CSM, DASSM, Agile Explorer",
    "GenAI/ML certs; Prompt Engineering",
    "DevOps certifications",
    "IBM AIOps training and badge",
  ];
  const productDataRows =
    current.products.length > 0
      ? current.products.map((p) => [
          p.domain,
          p.portfolio,
          p.product,
          p.applicationArea,
          p.currentTech,
          p.futureTech,
          p.industry,
          p.agile,
          p.agentic,
          p.devsecops,
          p.aiops,
        ])
      : [productExampleRow];
  const productHeader = [
    productGroupHeader,
    productColumnHeader,
    ...productDataRows,
  ];
  const wsProducts = XLSX.utils.aoa_to_sheet(productHeader);
  wsProducts["!cols"] = [
    { wch: 22 },
    { wch: 24 },
    { wch: 24 },
    { wch: 18 },
    { wch: 38 },
    { wch: 38 },
    { wch: 24 },
    { wch: 28 },
    { wch: 28 },
    { wch: 24 },
    { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(wb, wsProducts, PRODUCT_SHEET);

  /* References */
  const refRows = [
    ["Role", "Type of Work", "Location"],
    ["Developer", "Projects", "Onshore"],
    ["Technical Lead", "Operations Support", "Offshore"],
    ["Operations Engineer", "Shared", ""],
    ["Project Manager", "", ""],
    ["Quality Engineer", "", ""],
    ["Business Analyst", "", ""],
  ];
  const wsRef = XLSX.utils.aoa_to_sheet(refRows);
  wsRef["!cols"] = [{ wch: 22 }, { wch: 22 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsRef, REFERENCE_SHEET);

  /* Resource Level — Talent Plan */
  const resourceGroupHeader = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Current Level",
    "",
    "",
    "",
    "",
    "",
    "",
    "Talent Plan (6 Months)",
    "",
    "",
    "",
    "",
    "",
    "",
  ];
  const resourceColumnHeader = [
    "Serial#",
    "Resource Name",
    "Domain",
    "Portfolio",
    "Product",
    "Application Area",
    "Type of Work",
    "Role",
    "Location",
    "Current Tech Stack",
    "Future Tech Stack",
    "Industry Knowledge",
    "Agile",
    "Agentic",
    "DevSecOps",
    "AIOps",
    "Current Tech Stack",
    "Future Tech Stack",
    "Industry Knowledge",
    "Agile",
    "Agentic",
    "DevOps",
    "AIOps",
  ];
  const resourceExampleRow = [
    "C-EXAMPLE",
    "Sample Resource",
    "Specialty Business",
    "Specialty",
    "Ancillary",
    "PPA",
    "Projects",
    "Developer",
    "Onshore",
    "Microservices, SQL, Angular, .Net Core",
    "NA",
    "Healthcare Industry Jumpstart",
    "Agile Basics",
    "IBM Consulting Gen & Agentic AI",
    "",
    "",
    "Microservices, SQL, Angular, .Net Core",
    "Microservices, SQL, Angular, .Net Core",
    "Healthcare Industry Jumpstart",
    "Agile Basics",
    "IBM Consulting Gen & Agentic AI",
    "DevSecOps Essentials",
    "AIOps Overview",
  ];
  const resourceDataRows =
    current.resources.length > 0
      ? current.resources.map((r) => [
          r.serial,
          r.name,
          r.domain,
          r.portfolio,
          r.product,
          r.applicationArea,
          r.typeOfWork,
          r.role,
          r.location,
          r.current.techStack,
          r.current.futureTech,
          r.current.industry,
          r.current.agile,
          r.current.agentic,
          r.current.devsecops,
          r.current.aiops,
          r.plan.techStack,
          r.plan.futureTech,
          r.plan.industry,
          r.plan.agile,
          r.plan.agentic,
          r.plan.devops,
          r.plan.aiops,
        ])
      : [resourceExampleRow];
  const resourceHeader = [
    resourceGroupHeader,
    Array(23).fill(""),
    resourceColumnHeader,
    ...resourceDataRows,
  ];
  const wsRes = XLSX.utils.aoa_to_sheet(resourceHeader);
  const colWidths = [
    { wch: 12 }, // Serial
    { wch: 24 }, // Name
    { wch: 22 }, // Domain
    { wch: 20 }, // Portfolio
    { wch: 22 }, // Product
    { wch: 18 }, // App Area
    { wch: 18 }, // Type of Work
    { wch: 22 }, // Role
    { wch: 12 }, // Location
  ];
  // 7 current + 7 plan
  for (let i = 0; i < 14; i++) colWidths.push({ wch: 26 });
  wsRes["!cols"] = colWidths;
  XLSX.utils.book_append_sheet(wb, wsRes, RESOURCE_SHEET);

  /* Instructions sheet */
  const isSeeded = current.resources.length > 0 || current.products.length > 0;
  const instructions = [
    ["Horizon × IBM — Talent Plan Upload Template"],
    [""],
    [
      isSeeded
        ? `This workbook is pre-populated with the CURRENT live talent plan: ${current.products.length} products and ${current.resources.length} resources (downloaded ${new Date().toISOString().slice(0, 10)}).`
        : "This workbook defines the format the CareOps360 admin upload expects.",
    ],
    [""],
    ["Required sheets:"],
    [`  1. ${PRODUCT_SHEET}`],
    [`  2. ${RESOURCE_SHEET}`],
    [`  3. ${REFERENCE_SHEET} (optional, lookups only)`],
    [""],
    ["How to use:"],
    [
      "  • Edit, add, or remove rows directly — every row in this file becomes the new live plan when uploaded.",
    ],
    [
      "  • Do not change the column headers or sheet names.",
    ],
    [
      "  • Header row positions must match the template (header row 2 on Products, header row 3 on Resources).",
    ],
    [
      "  • Empty cells are allowed; leave blank for skills or fields not yet planned.",
    ],
    [
      "  • Save as .xlsx (Excel Workbook) and upload via Talent Plan → Refresh Data tab.",
    ],
    [""],
    ["Once uploaded, the system instantly refreshes:"],
    [
      "  • All KPI tiles, treemap, role transformation, skill heatmap, roadmap, resource table, and product readiness cards.",
    ],
  ];
  const wsInstr = XLSX.utils.aoa_to_sheet(instructions);
  wsInstr["!cols"] = [{ wch: 96 }];
  XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");

  // Move Instructions to first
  wb.SheetNames = ["Instructions", PRODUCT_SHEET, RESOURCE_SHEET, REFERENCE_SHEET];

  const out = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return out as Buffer;
}
