import { pgTable, varchar, real, integer, serial } from "drizzle-orm/pg-core";

export const pageKpisTable = pgTable("page_kpis", {
  id: serial("id").primaryKey(),
  page: varchar("page", { length: 50 }).notNull(),
  kpiKey: varchar("kpi_key", { length: 80 }).notNull(),
  label: varchar("label", { length: 200 }).notNull().default(""),
  value: real("value").notNull().default(0),
  formatted: varchar("formatted", { length: 100 }).notNull().default(""),
  change: real("change").notNull().default(0),
  status: varchar("status", { length: 10 }).notNull().default("green"),
  trend: varchar("trend", { length: 10 }).notNull().default("flat"),
  displayOrder: integer("display_order").notNull().default(0),
});

export type PageKpi = typeof pageKpisTable.$inferSelect;
