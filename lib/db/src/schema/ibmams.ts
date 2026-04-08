import { pgTable, varchar, integer, real, serial, text } from "drizzle-orm/pg-core";

export const ibmamsRunbooksTable = pgTable("ibmams_runbooks", {
  runbookId: varchar("runbook_id", { length: 10 }).primaryKey(),
  name: text("name").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  executionsToday: integer("executions_today").notNull(),
  successRate: real("success_rate").notNull(),
  timeSavedHours: real("time_saved_hours").notNull(),
});

export const ibmamsSavingsTrendTable = pgTable("ibmams_savings_trend", {
  id: serial("id").primaryKey(),
  monthLabel: varchar("month_label", { length: 15 }).notNull(),
  savings: integer("savings").notNull(),
  avoidance: integer("avoidance").notNull(),
});

export const ibmamsTicketTrendsTable = pgTable("ibmams_ticket_trends", {
  id: serial("id").primaryKey(),
  weekLabel: varchar("week_label", { length: 20 }).notNull(),
  total: integer("total").notNull(),
  resolvedWithinSla: integer("resolved_within_sla").notNull(),
  automated: integer("automated").notNull(),
});
