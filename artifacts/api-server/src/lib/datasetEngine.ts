import * as XLSX from "xlsx";
import { db } from "@workspace/db";
import type { PgTable } from "drizzle-orm/pg-core";
import { inArray, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

export type ColType = "str" | "int" | "real" | "date";

export interface ColumnDef {
  header: string;
  key: string;
  type: ColType;
  sample: string | number;
  required?: boolean;
  nullable?: boolean;
}

export interface SheetDef {
  sheetName: string;
  tableName: string;
  table: PgTable;
  columns: ColumnDef[];
  sampleRows: Record<string, string | number | null>[];
  /**
   * If set, only rows matching this predicate are deleted (and snapshotted)
   * for shared tables (e.g. page_kpis where page = "members").
   */
  deleteWhere?: SQL;
  /**
   * Fixed fields injected into every inserted row (e.g. { page: "members" }).
   */
  fixedFields?: Record<string, unknown>;
  /**
   * If set, upload replaces only rows whose value in this record key matches
   * a value present in the uploaded sheet (e.g. scopeKey "reportMonth" makes a
   * Jun 2026 upload replace only Jun 2026 rows, leaving other months intact).
   */
  scopeKey?: string;
}

export interface DatasetSchema {
  key: string;
  title: string;
  introLines: string[];
  sheets: SheetDef[];
}

export interface ImportResult {
  tableName: string;
  rowsInserted: number;
  warnings: string[];
}

export class DatasetImportError extends Error {
  errors: string[];
  warnings: string[];
  constructor(errors: string[], warnings: string[] = []) {
    super(`Dataset import aborted: ${errors.length} validation error(s)`);
    this.errors = errors;
    this.warnings = warnings;
  }
}

type CoerceOk = { ok: true; value: string | number | Date | null };
type CoerceErr = { ok: false; error: string };

function coerce(
  value: unknown,
  type: ColType,
  nullable: boolean,
): CoerceOk | CoerceErr {
  if (value === undefined || value === null || value === "") {
    if (nullable) return { ok: true, value: null };
    if (type === "int" || type === "real") return { ok: true, value: 0 };
    if (type === "date") return { ok: true, value: new Date() };
    return { ok: true, value: "" };
  }
  switch (type) {
    case "str":
      return { ok: true, value: String(value) };
    case "int": {
      const n =
        typeof value === "number"
          ? value
          : parseInt(String(value).replace(/[$,%\s]/g, ""), 10);
      if (!Number.isFinite(n)) return { ok: false, error: `expected an integer, got "${String(value)}"` };
      return { ok: true, value: Math.trunc(n) };
    }
    case "real": {
      const n =
        typeof value === "number"
          ? value
          : parseFloat(String(value).replace(/[$,%\s]/g, ""));
      if (!Number.isFinite(n)) return { ok: false, error: `expected a number, got "${String(value)}"` };
      return { ok: true, value: n };
    }
    case "date": {
      if (value instanceof Date) return { ok: true, value };
      if (typeof value === "number") {
        const d = XLSX.SSF.parse_date_code(value);
        if (d)
          return {
            ok: true,
            value: new Date(Date.UTC(d.y, d.m - 1, d.d, d.H || 0, d.M || 0, Math.floor(d.S || 0))),
          };
      }
      const d = new Date(String(value));
      if (isNaN(d.getTime())) return { ok: false, error: `expected a date, got "${String(value)}"` };
      return { ok: true, value: d };
    }
  }
}

export function buildDatasetTemplate(schema: DatasetSchema): Buffer {
  const wb = XLSX.utils.book_new();

  const instructions: (string | number)[][] = [
    [schema.title],
    [""],
    ...schema.introLines.map((l) => [l]),
    [""],
    ["Sheets in this workbook:"],
    ...schema.sheets.map((s) => [`  • ${s.sheetName} — ${s.columns.length} columns, writes to table "${s.tableName}"`]),
    [""],
    ["Rules:"],
    ["  • The first row of every sheet is the header row. Do not rename or reorder columns."],
    ["  • Each sheet is loaded into its own table. Existing rows are replaced on upload."],
    ["  • Required cells must not be empty. Optional cells may be left blank."],
    ["  • The entire upload is atomic: if any row fails validation, NOTHING is written and the database stays as it was."],
    ["  • Save as .xlsx (Excel Workbook) and upload via Administration → this dataset's tab."],
  ];
  const wsInstr = XLSX.utils.aoa_to_sheet(instructions);
  wsInstr["!cols"] = [{ wch: 110 }];
  XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");

  for (const sheet of schema.sheets) {
    const headers = sheet.columns.map((c) => c.header);
    const sampleRows = (sheet.sampleRows.length > 0 ? sheet.sampleRows : [Object.fromEntries(sheet.columns.map((c) => [c.header, c.sample]))]).map(
      (row) => sheet.columns.map((c) => row[c.header] ?? c.sample ?? ""),
    );
    const aoa: (string | number | null)[][] = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = sheet.columns.map((c) => ({ wch: Math.max(14, c.header.length + 2) }));
    XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName);
  }

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

interface PreparedSheet {
  sheet: SheetDef;
  records: Record<string, unknown>[];
  warnings: string[];
}

function prepareImport(
  schema: DatasetSchema,
  buffer: Buffer,
): { prepared: PreparedSheet[]; errors: string[]; warnings: string[] } {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const prepared: PreparedSheet[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const sheet of schema.sheets) {
    const ws = wb.Sheets[sheet.sheetName];
    if (!ws) {
      warnings.push(`Sheet "${sheet.sheetName}" not found in workbook — table "${sheet.tableName}" left unchanged.`);
      prepared.push({ sheet, records: [], warnings: ["Sheet missing in workbook (table left unchanged)"] });
      continue;
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });
    const sheetWarnings: string[] = [];
    const records: Record<string, unknown>[] = [];

    rows.forEach((row, idx) => {
      const rec: Record<string, unknown> = {};
      let allEmpty = true;
      const rowErrors: string[] = [];

      for (const col of sheet.columns) {
        const raw = row[col.header];
        const isEmpty = raw === null || raw === undefined || raw === "";
        if (!isEmpty) allEmpty = false;

        if (col.required && isEmpty) {
          rowErrors.push(`[${sheet.sheetName} row ${idx + 2}] "${col.header}" is required.`);
          continue;
        }

        // Optional empty cell on a non-nullable column: omit the key so the
        // database column default applies (avoids NOT NULL violations).
        if (isEmpty && !col.required && col.nullable !== true) {
          continue;
        }

        const result = coerce(raw, col.type, col.nullable === true);
        if (!result.ok) {
          rowErrors.push(`[${sheet.sheetName} row ${idx + 2}] "${col.header}" — ${result.error}.`);
          continue;
        }
        rec[col.key] = result.value;
      }

      if (allEmpty) return;

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
        return;
      }
      records.push(rec);
    });

    prepared.push({ sheet, records, warnings: sheetWarnings });
  }

  return { prepared, errors, warnings };
}

export async function importDatasetWorkbook(
  schema: DatasetSchema,
  buffer: Buffer,
): Promise<{ results: ImportResult[]; totalRows: number; warnings: string[] }> {
  const { prepared, errors, warnings } = prepareImport(schema, buffer);

  if (errors.length > 0) {
    throw new DatasetImportError(errors, warnings);
  }

  const sheetsWithRecords = prepared.filter((p) => p.records.length > 0 || p.warnings.length === 0);
  if (sheetsWithRecords.every((p) => p.records.length === 0) && prepared.some((p) => p.warnings.length > 0)) {
    throw new DatasetImportError(
      ["No valid rows found in any expected sheet. Refusing to wipe all tables."],
      warnings,
    );
  }

  const results: ImportResult[] = [];

  // Workbook-level scope: union scope values per scopeKey name across all
  // present sheets, so a present-but-empty sheet still clears the uploaded
  // scope (true replace semantics) instead of silently keeping stale rows.
  const scopeValuesByKey = new Map<string, Set<string>>();
  for (const { sheet, records } of prepared) {
    if (!sheet.scopeKey) continue;
    const set = scopeValuesByKey.get(sheet.scopeKey) ?? new Set<string>();
    for (const r of records) {
      const v = r[sheet.scopeKey];
      if (v != null) set.add(String(v));
    }
    scopeValuesByKey.set(sheet.scopeKey, set);
  }

  await db.transaction(async (tx) => {
    for (const { sheet, records, warnings: sheetWarnings } of prepared) {
      if (sheetWarnings.length > 0 && records.length === 0) {
        results.push({ tableName: sheet.tableName, rowsInserted: 0, warnings: sheetWarnings });
        continue;
      }

      if (sheet.scopeKey) {
        const col = (sheet.table as unknown as Record<string, PgColumn>)[sheet.scopeKey];
        const values = [...(scopeValuesByKey.get(sheet.scopeKey) ?? new Set<string>())];
        if (col && values.length > 0) {
          await tx.delete(sheet.table).where(inArray(col, values));
        }
      } else if (sheet.deleteWhere) {
        await tx.delete(sheet.table).where(sheet.deleteWhere);
      } else {
        await tx.delete(sheet.table);
      }
      let inserted = 0;
      if (records.length > 0) {
        const enriched = sheet.fixedFields
          ? records.map((r) => ({ ...sheet.fixedFields, ...r }))
          : records;
        const CHUNK = 500;
        for (let i = 0; i < enriched.length; i += CHUNK) {
          const slice = enriched.slice(i, i + CHUNK);
          await tx.insert(sheet.table).values(slice as never);
          inserted += slice.length;
        }
      }
      results.push({ tableName: sheet.tableName, rowsInserted: inserted, warnings: sheetWarnings });
    }
  });

  return {
    results,
    totalRows: results.reduce((s, r) => s + r.rowsInserted, 0),
    warnings,
  };
}

export async function snapshotCurrentDataAsRows(
  schema: DatasetSchema,
): Promise<Record<string, Record<string, string | number | null>[]>> {
  const out: Record<string, Record<string, string | number | null>[]> = {};
  for (const sheet of schema.sheets) {
    try {
      const q = sheet.deleteWhere
        ? db.select().from(sheet.table).where(sheet.deleteWhere).limit(2000)
        : db.select().from(sheet.table).limit(2000);
      const rows = await q;
      out[sheet.sheetName] = rows.map((r) => {
        const obj: Record<string, string | number | null> = {};
        for (const col of sheet.columns) {
          const v = (r as Record<string, unknown>)[col.key];
          if (v === null || v === undefined) obj[col.header] = null;
          else if (v instanceof Date) obj[col.header] = v.toISOString();
          else if (typeof v === "number") obj[col.header] = v;
          else obj[col.header] = String(v);
        }
        return obj;
      });
    } catch {
      out[sheet.sheetName] = [];
    }
  }
  return out;
}

export function buildDatasetTemplateWithLiveData(
  schema: DatasetSchema,
  liveRows: Record<string, Record<string, string | number | null>[]>,
): Buffer {
  const enriched: DatasetSchema = {
    ...schema,
    sheets: schema.sheets.map((s) => ({
      ...s,
      sampleRows: liveRows[s.sheetName]?.length ? liveRows[s.sheetName].slice(0, 500) : s.sampleRows,
    })),
  };
  return buildDatasetTemplate(enriched);
}
