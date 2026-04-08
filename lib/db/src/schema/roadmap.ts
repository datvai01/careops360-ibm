import { pgTable, text, varchar, integer, serial } from "drizzle-orm/pg-core";

export const roadmapInitiativesTable = pgTable("roadmap_initiatives", {
  id: serial("id").primaryKey(),
  portfolio: varchar("portfolio", { length: 100 }).notNull(),
  product: varchar("product", { length: 100 }).notNull(),
  application: varchar("application", { length: 255 }).notNull(),
  initiativeType: varchar("initiative_type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  expectedOutcome: text("expected_outcome").notNull(),
  technology: varchar("technology", { length: 100 }).notNull(),
  currentVersion: varchar("current_version", { length: 50 }).notNull().default(""),
  upgradeVersion: varchar("upgrade_version", { length: 50 }).notNull().default(""),
  workNumber: varchar("work_number", { length: 20 }).notNull().unique(),
  serviceCategory: varchar("service_category", { length: 100 }).notNull(),
  startDate: varchar("start_date", { length: 10 }).notNull(),
  endDate: varchar("end_date", { length: 10 }).notNull(),
  status: varchar("status", { length: 30 }).notNull(),
  priority: varchar("priority", { length: 20 }).notNull(),
  notes: text("notes").notNull().default(""),
});
