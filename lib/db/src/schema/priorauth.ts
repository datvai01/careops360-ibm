import { pgTable, varchar, integer, real, serial } from "drizzle-orm/pg-core";

export const priorauthAgingTable = pgTable("priorauth_aging", {
  id: serial("id").primaryKey(),
  bucket: varchar("bucket", { length: 50 }).notNull(),
  count: integer("count").notNull(),
  percentage: real("percentage").notNull(),
  severity: varchar("severity", { length: 10 }).notNull(),
});

export const priorauthProceduresTable = pgTable("priorauth_procedures", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  requests: integer("requests").notNull(),
  approvalRate: real("approval_rate").notNull(),
  avgDays: real("avg_days").notNull(),
});

export const priorauthReviewersTable = pgTable("priorauth_reviewers", {
  reviewerId: varchar("reviewer_id", { length: 10 }).primaryKey(),
  reviewerName: varchar("reviewer_name", { length: 100 }).notNull(),
  openCases: integer("open_cases").notNull(),
  completedToday: integer("completed_today").notNull(),
  avgDaysToDecision: real("avg_days_to_decision").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
});

export type PriorauthReviewer = typeof priorauthReviewersTable.$inferSelect;
