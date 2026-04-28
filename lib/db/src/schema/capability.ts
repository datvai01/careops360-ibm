import { pgTable, varchar, integer, real, text, serial } from "drizzle-orm/pg-core";

export const capabilityKpisTable = pgTable("capability_kpis", {
  id: serial("id").primaryKey(),
  kpiKey: varchar("kpi_key", { length: 80 }).notNull(),
  label: varchar("label", { length: 200 }).notNull(),
  value: real("value").notNull().default(0),
  formatted: varchar("formatted", { length: 100 }).notNull(),
  change: real("change").notNull().default(0),
  status: varchar("status", { length: 10 }).notNull().default("green"),
  trend: varchar("trend", { length: 10 }).notNull().default("flat"),
  sub: text("sub").notNull().default(""),
  iconKey: varchar("icon_key", { length: 40 }).notNull().default("award"),
  colorKey: varchar("color_key", { length: 40 }).notNull().default("blue"),
  delta: text("delta").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
});

export const capabilityStagesTable = pgTable("capability_stages", {
  id: serial("id").primaryKey(),
  stage: varchar("stage", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull().default(""),
  currentMaturity: real("current_maturity").notNull().default(0),
  targetMaturity: real("target_maturity").notNull().default(0),
  status: varchar("status", { length: 30 }).notNull().default("planned"),
  ownerTeam: varchar("owner_team", { length: 100 }).notNull().default(""),
  position: integer("position").notNull().default(0),
  displayOrder: integer("display_order").notNull().default(0),
});

export const capabilityTrainingTable = pgTable("capability_training", {
  id: serial("id").primaryKey(),
  programName: varchar("program_name", { length: 200 }).notNull(),
  vendor: varchar("vendor", { length: 80 }).notNull().default(""),
  track: varchar("track", { length: 100 }).notNull().default(""),
  category: varchar("category", { length: 80 }).notNull().default(""),
  audience: varchar("audience", { length: 200 }).notNull().default(""),
  startDate: varchar("start_date", { length: 10 }).notNull().default(""),
  endDate: varchar("end_date", { length: 10 }).notNull().default(""),
  format: varchar("format", { length: 30 }).notNull().default("Virtual"),
  level: varchar("level", { length: 30 }).notNull().default("Essentials"),
  seats: integer("seats").notNull().default(0),
  enrollment: integer("enrollment").notNull().default(0),
  completionRate: real("completion_rate").notNull().default(0),
  status: varchar("status", { length: 30 }).notNull().default("planned"),
  color: varchar("color", { length: 20 }).notNull().default("#0f62fe"),
  description: text("description").notNull().default(""),
  certificationEarned: text("certification_earned").notNull().default(""),
});

export const capabilityGovernanceTable = pgTable("capability_governance", {
  id: serial("id").primaryKey(),
  practice: varchar("practice", { length: 200 }).notNull(),
  description: text("description").notNull().default(""),
  cadence: varchar("cadence", { length: 50 }).notNull().default(""),
  owner: varchar("owner", { length: 100 }).notNull().default(""),
  status: varchar("status", { length: 30 }).notNull().default("active"),
});

export const capabilityAreasTable = pgTable("capability_areas", {
  id: serial("id").primaryKey(),
  area: varchar("area", { length: 200 }).notNull(),
  sub: text("sub").notNull().default(""),
  currentCount: integer("current_count").notNull().default(0),
  plannedCount: integer("planned_count").notNull().default(0),
  priority: varchar("priority", { length: 20 }).notNull().default("Medium"),
  impact: text("impact").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
});

export const capabilityRadarTable = pgTable("capability_radar", {
  id: serial("id").primaryKey(),
  axis: varchar("axis", { length: 80 }).notNull(),
  current: real("current").notNull().default(0),
  planned: real("planned").notNull().default(0),
  displayOrder: integer("display_order").notNull().default(0),
});

export const capabilityValueImpactTable = pgTable("capability_value_impact", {
  id: serial("id").primaryKey(),
  cap: varchar("cap", { length: 100 }).notNull(),
  metric: text("metric").notNull().default(""),
  value: varchar("value", { length: 40 }).notNull().default(""),
  colorKey: varchar("color_key", { length: 40 }).notNull().default("blue"),
  displayOrder: integer("display_order").notNull().default(0),
});

export const capabilityAiCertsTable = pgTable("capability_ai_certs", {
  id: serial("id").primaryKey(),
  label: varchar("label", { length: 200 }).notNull(),
  currentCount: integer("current_count").notNull().default(0),
  plannedCount: integer("planned_count").notNull().default(0),
  useCase: text("use_case").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
});

export const capabilityWorkforceTransformationTable = pgTable("capability_workforce_transformation", {
  id: serial("id").primaryKey(),
  side: varchar("side", { length: 20 }).notNull(),
  bullet: text("bullet").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export type CapabilityKpi = typeof capabilityKpisTable.$inferSelect;
export type CapabilityStage = typeof capabilityStagesTable.$inferSelect;
