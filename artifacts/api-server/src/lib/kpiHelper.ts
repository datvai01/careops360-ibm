import { db, pageKpisTable } from "@workspace/db";
import { asc, eq } from "drizzle-orm";

export type KpiTile = {
  value: number;
  formatted: string;
  change: number;
  changeLabel: string;
  status: "green" | "yellow" | "red";
  trend: "up" | "down" | "flat";
};

/**
 * Fetch all KPI tiles for a given dashboard page from the page_kpis table.
 * Returns an object keyed by kpiKey, each value is a KpiTile.
 *
 * @param page page identifier ("executive", "members", "claims", etc.)
 * @param compareLabel suffix for changeLabel; defaults to "vs yesterday"
 */
export async function fetchPageKpis(
  page: string,
  compareLabel: string = "vs yesterday",
): Promise<Record<string, KpiTile>> {
  const rows = await db
    .select()
    .from(pageKpisTable)
    .where(eq(pageKpisTable.page, page))
    .orderBy(asc(pageKpisTable.displayOrder), asc(pageKpisTable.id));

  const out: Record<string, KpiTile> = {};
  for (const r of rows) {
    out[r.kpiKey] = {
      value: r.value,
      formatted: r.formatted,
      change: r.change,
      changeLabel: `${r.change > 0 ? "+" : ""}${r.change}% ${compareLabel}`,
      status: (r.status as "green" | "yellow" | "red") ?? "green",
      trend: (r.trend as "up" | "down" | "flat") ?? "flat",
    };
  }
  return out;
}
