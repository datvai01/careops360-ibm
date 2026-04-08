import { pgTable, text, varchar, timestamp, real, integer } from "drizzle-orm/pg-core";

export const executiveAlertsTable = pgTable("executive_alerts", {
  id: varchar("id", { length: 20 }).primaryKey(),
  severity: varchar("severity", { length: 20 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 30 }).notNull(),
  alertTimestamp: timestamp("alert_timestamp").notNull(),
  impactedSystem: varchar("impacted_system", { length: 255 }).notNull(),
  drillDownPath: varchar("drill_down_path", { length: 255 }).notNull(),
});

export const dailyTrendsTable = pgTable("daily_trends", {
  id: text("id").primaryKey(),
  trendDate: varchar("trend_date", { length: 10 }).notNull().unique(),
  claims: integer("claims").notNull(),
  enrollments: integer("enrollments").notNull(),
  priorAuths: integer("prior_auths").notNull(),
  availability: real("availability").notNull(),
  incidents: integer("incidents").notNull(),
});

export const aiInsightsTable = pgTable("ai_insights", {
  id: varchar("id", { length: 20 }).primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  headline: text("headline").notNull(),
  detail: text("detail").notNull(),
  recommendation: text("recommendation").notNull(),
  insightTimestamp: timestamp("insight_timestamp").notNull(),
  affectedArea: varchar("affected_area", { length: 255 }).notNull(),
});

export type ExecutiveAlert = typeof executiveAlertsTable.$inferSelect;
export type DailyTrend = typeof dailyTrendsTable.$inferSelect;
export type AiInsight = typeof aiInsightsTable.$inferSelect;
