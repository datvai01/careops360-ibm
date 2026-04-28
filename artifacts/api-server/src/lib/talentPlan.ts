import * as XLSX from "xlsx";
import {
  db,
  talentResourcesTable,
  talentProductsTable,
  talentPlanMetaTable,
} from "@workspace/db";
import { asc, eq } from "drizzle-orm";

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

/* ─────────────────────── Storage (DB) ─────────────────────── */

function rowToResource(r: typeof talentResourcesTable.$inferSelect): TalentResource {
  return {
    serial: r.serial,
    name: r.name,
    domain: r.domain,
    portfolio: r.portfolio,
    product: r.product,
    applicationArea: r.applicationArea,
    typeOfWork: r.typeOfWork,
    role: r.role,
    location: r.location,
    current: {
      techStack: r.currentTechStack,
      futureTech: r.currentFutureTech,
      industry: r.currentIndustry,
      agile: r.currentAgile,
      agentic: r.currentAgentic,
      devsecops: r.currentDevsecops,
      aiops: r.currentAiops,
    },
    plan: {
      techStack: r.planTechStack,
      futureTech: r.planFutureTech,
      industry: r.planIndustry,
      agile: r.planAgile,
      agentic: r.planAgentic,
      devops: r.planDevops,
      aiops: r.planAiops,
    },
  };
}

function rowToProduct(r: typeof talentProductsTable.$inferSelect): TalentProduct {
  return {
    domain: r.domain,
    portfolio: r.portfolio,
    product: r.product,
    applicationArea: r.applicationArea,
    currentTech: r.currentTech,
    futureTech: r.futureTech,
    industry: r.industry,
    agile: r.agile,
    agentic: r.agentic,
    devsecops: r.devsecops,
    aiops: r.aiops,
  };
}

export async function getTalentPlan(): Promise<TalentPlanData> {
  const [resourceRows, productRows] = await Promise.all([
    db.select().from(talentResourcesTable).orderBy(asc(talentResourcesTable.id)),
    db.select().from(talentProductsTable).orderBy(asc(talentProductsTable.id)),
  ]);
  return {
    resources: resourceRows.map(rowToResource),
    products: productRows.map(rowToProduct),
  };
}

export async function getTalentPlanMeta(): Promise<TalentPlanMeta> {
  const rows = await db.select().from(talentPlanMetaTable).where(eq(talentPlanMetaTable.id, 1));
  if (rows.length > 0) {
    const m = rows[0];
    return {
      uploadedAt: m.uploadedAt,
      uploadedBy: m.uploadedBy,
      sourceFilename: m.sourceFilename,
      resourceCount: m.resourceCount,
      productCount: m.productCount,
      version: m.version,
    };
  }
  // Synthesize from current row counts
  const data = await getTalentPlan();
  return {
    uploadedAt: new Date().toISOString(),
    uploadedBy: "system (initial seed)",
    sourceFilename: "Talent_Plan_seed.xlsx",
    resourceCount: data.resources.length,
    productCount: data.products.length,
    version: 1,
  };
}

export async function saveTalentPlan(
  data: TalentPlanData,
  uploader: string,
  sourceFilename: string,
): Promise<TalentPlanMeta> {
  const prevMeta = await getTalentPlanMeta();
  const meta: TalentPlanMeta = {
    uploadedAt: new Date().toISOString(),
    uploadedBy: uploader || "unknown",
    sourceFilename: sourceFilename || "uploaded.xlsx",
    resourceCount: data.resources.length,
    productCount: data.products.length,
    version: prevMeta.version + 1,
  };

  await db.transaction(async (tx) => {
    await tx.delete(talentResourcesTable);
    await tx.delete(talentProductsTable);

    if (data.resources.length > 0) {
      const CHUNK = 200;
      const rows = data.resources.map((r) => ({
        serial: r.serial,
        name: r.name,
        domain: r.domain,
        portfolio: r.portfolio,
        product: r.product,
        applicationArea: r.applicationArea,
        typeOfWork: r.typeOfWork,
        role: r.role,
        location: r.location,
        currentTechStack: r.current.techStack,
        currentFutureTech: r.current.futureTech,
        currentIndustry: r.current.industry,
        currentAgile: r.current.agile,
        currentAgentic: r.current.agentic,
        currentDevsecops: r.current.devsecops,
        currentAiops: r.current.aiops,
        planTechStack: r.plan.techStack,
        planFutureTech: r.plan.futureTech,
        planIndustry: r.plan.industry,
        planAgile: r.plan.agile,
        planAgentic: r.plan.agentic,
        planDevops: r.plan.devops,
        planAiops: r.plan.aiops,
      }));
      for (let i = 0; i < rows.length; i += CHUNK) {
        await tx.insert(talentResourcesTable).values(rows.slice(i, i + CHUNK));
      }
    }

    if (data.products.length > 0) {
      const rows = data.products.map((p) => ({
        domain: p.domain,
        portfolio: p.portfolio,
        product: p.product,
        applicationArea: p.applicationArea,
        currentTech: p.currentTech,
        futureTech: p.futureTech,
        industry: p.industry,
        agile: p.agile,
        agentic: p.agentic,
        devsecops: p.devsecops,
        aiops: p.aiops,
      }));
      const CHUNK = 200;
      for (let i = 0; i < rows.length; i += CHUNK) {
        await tx.insert(talentProductsTable).values(rows.slice(i, i + CHUNK));
      }
    }

    // Upsert meta (single-row table id=1)
    await tx.delete(talentPlanMetaTable).where(eq(talentPlanMetaTable.id, 1));
    await tx.insert(talentPlanMetaTable).values({
      id: 1,
      uploadedAt: meta.uploadedAt,
      uploadedBy: meta.uploadedBy,
      sourceFilename: meta.sourceFilename,
      resourceCount: meta.resourceCount,
      productCount: meta.productCount,
      version: meta.version,
    });
  });

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
    warnings.push(`No product rows found in "${PRODUCT_SHEET}".`);
  }

  /* ── Resources ── */
  const resourceSheet = wb.Sheets[RESOURCE_SHEET];
  const resourceRows = XLSX.utils.sheet_to_json<any[]>(resourceSheet, {
    defval: "",
    header: 1,
  });
  const rHeaderRow = findHeaderRow(resourceRows, "Serial#");
  if (rHeaderRow < 0) {
    throw new Error(
      `Could not find header row starting with "Serial#" in sheet "${RESOURCE_SHEET}".`,
    );
  }
  const resources: TalentResource[] = [];
  for (let i = rHeaderRow + 1; i < resourceRows.length; i++) {
    const r = resourceRows[i];
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
    warnings.push(`No resource rows found in "${RESOURCE_SHEET}".`);
  }

  return { data: { resources, products }, warnings };
}

/* ─────────────────────── Template generation ─────────────────────── */

export async function buildTalentPlanTemplate(): Promise<Buffer> {
  const current = await getTalentPlan();
  const wb = XLSX.utils.book_new();

  /* Reference sheet */
  const refData = [
    ["Domain", "Portfolio", "Product", "Application Area", "Type of Work", "Role", "Location"],
    ["Specialty Business", "Specialty", "Ancillary", "PPA", "Projects", "Developer", "Onshore"],
    ["Healthcare Operations", "Operations", "Claims", "Adjudication", "AMS", "Lead", "Offshore"],
    ["Member Services", "Member", "Enrollment", "Eligibility", "Enhancements", "Architect", "Hybrid"],
  ];
  const wsRef = XLSX.utils.aoa_to_sheet(refData);
  XLSX.utils.book_append_sheet(wb, wsRef, REFERENCE_SHEET);

  /* Product sheet */
  const productHeader = [
    [
      "Domain",
      "Portfolio",
      "Product",
      "Application Area",
      "Current Tech Stack",
      "Future Tech Stack",
      "Industry Knowledge",
      "Agile",
      "Agentic",
      "DevSecOps",
      "AIOps",
    ],
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
      : [
          [
            "Specialty Business",
            "Specialty",
            "Ancillary",
            "PPA",
            "Microservices, SQL, Angular, .Net Core",
            "Microservices, SQL, Angular, .Net Core",
            "Healthcare Industry Jumpstart",
            "Agile Basics",
            "IBM Consulting Gen & Agentic AI",
            "DevSecOps Essentials",
            "AIOps Overview",
          ],
        ];
  const wsProd = XLSX.utils.aoa_to_sheet([...productHeader, ...productDataRows]);
  wsProd["!cols"] = [
    { wch: 22 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 38 },
    { wch: 38 },
    { wch: 28 },
    { wch: 16 },
    { wch: 32 },
    { wch: 22 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, wsProd, PRODUCT_SHEET);

  /* Resource sheet */
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
    "Current State",
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
    { wch: 12 },
    { wch: 24 },
    { wch: 22 },
    { wch: 20 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 12 },
  ];
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
        ? `This workbook is pre-populated with the CURRENT live talent plan from the database: ${current.products.length} products and ${current.resources.length} resources (downloaded ${new Date().toISOString().slice(0, 10)}).`
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
    ["  • Do not change the column headers or sheet names."],
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
