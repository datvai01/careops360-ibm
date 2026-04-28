import { pgTable, varchar, text, serial, integer } from "drizzle-orm/pg-core";

export const talentResourcesTable = pgTable("talent_resources", {
  id: serial("id").primaryKey(),
  serial: varchar("serial", { length: 30 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 100 }).notNull().default(""),
  portfolio: varchar("portfolio", { length: 100 }).notNull().default(""),
  product: varchar("product", { length: 100 }).notNull().default(""),
  applicationArea: varchar("application_area", { length: 255 }).notNull().default(""),
  typeOfWork: varchar("type_of_work", { length: 100 }).notNull().default(""),
  role: varchar("role", { length: 100 }).notNull().default(""),
  location: varchar("location", { length: 100 }).notNull().default(""),
  // Current
  currentTechStack: text("current_tech_stack").notNull().default(""),
  currentFutureTech: text("current_future_tech").notNull().default(""),
  currentIndustry: text("current_industry").notNull().default(""),
  currentAgile: text("current_agile").notNull().default(""),
  currentAgentic: text("current_agentic").notNull().default(""),
  currentDevsecops: text("current_devsecops").notNull().default(""),
  currentAiops: text("current_aiops").notNull().default(""),
  // Plan
  planTechStack: text("plan_tech_stack").notNull().default(""),
  planFutureTech: text("plan_future_tech").notNull().default(""),
  planIndustry: text("plan_industry").notNull().default(""),
  planAgile: text("plan_agile").notNull().default(""),
  planAgentic: text("plan_agentic").notNull().default(""),
  planDevops: text("plan_devops").notNull().default(""),
  planAiops: text("plan_aiops").notNull().default(""),
});

export const talentProductsTable = pgTable("talent_products", {
  id: serial("id").primaryKey(),
  domain: varchar("domain", { length: 100 }).notNull().default(""),
  portfolio: varchar("portfolio", { length: 100 }).notNull().default(""),
  product: varchar("product", { length: 100 }).notNull().default(""),
  applicationArea: varchar("application_area", { length: 255 }).notNull().default(""),
  currentTech: text("current_tech").notNull().default(""),
  futureTech: text("future_tech").notNull().default(""),
  industry: text("industry").notNull().default(""),
  agile: text("agile").notNull().default(""),
  agentic: text("agentic").notNull().default(""),
  devsecops: text("devsecops").notNull().default(""),
  aiops: text("aiops").notNull().default(""),
});

export const talentPlanMetaTable = pgTable("talent_plan_meta", {
  id: integer("id").primaryKey().default(1),
  uploadedAt: varchar("uploaded_at", { length: 40 }).notNull(),
  uploadedBy: varchar("uploaded_by", { length: 255 }).notNull(),
  sourceFilename: varchar("source_filename", { length: 255 }).notNull(),
  resourceCount: integer("resource_count").notNull(),
  productCount: integer("product_count").notNull(),
  version: integer("version").notNull(),
});

export type TalentResourceRow = typeof talentResourcesTable.$inferSelect;
export type TalentProductRow = typeof talentProductsTable.$inferSelect;
export type TalentPlanMetaRow = typeof talentPlanMetaTable.$inferSelect;
