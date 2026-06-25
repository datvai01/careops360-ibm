import { pgTable, serial, integer, real, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const kpiDefinitionsTable = pgTable("kpi_tracker_definitions", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  category: varchar("category", { length: 100 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  description: text("description"),
  target: real("target"),
  targetDirection: varchar("target_direction", { length: 10 }).notNull().default("higher"),
  displayOrder: integer("display_order").notNull().default(0),
});

export const kpiMonthlyEntriesTable = pgTable("kpi_tracker_entries", {
  id: serial("id").primaryKey(),
  kpiKey: varchar("kpi_key", { length: 80 }).notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  value: real("value").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kpiFeedbackTable = pgTable("kpi_tracker_feedback", {
  id: serial("id").primaryKey(),
  kpiKey: varchar("kpi_key", { length: 80 }),
  comment: text("comment").notNull(),
  sentiment: varchar("sentiment", { length: 10 }).notNull().default("neutral"),
  authorName: varchar("author_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
