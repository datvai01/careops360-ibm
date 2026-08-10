import { pgTable, varchar, integer, real, serial, text } from "drizzle-orm/pg-core";

/**
 * Account Management (ADM) monthly report tables.
 * Living lists (not month-scoped): adm_action_items, adm_initiatives.
 * Month-scoped (replaced per report month on upload): the rest, keyed by
 * reportMonth (e.g. "Jun 2026") or monthLabel for trend series.
 */

export const admActionItemsTable = pgTable("adm_action_items", {
  id: serial("id").primaryKey(),
  item: text("item").notNull(),
  latestUpdate: text("latest_update").notNull().default(""),
  status: varchar("status", { length: 20 }).notNull().default("Open"), // Open | In Progress | Closed
  owner: varchar("owner", { length: 100 }).notNull().default(""),
  progressSource: varchar("progress_source", { length: 120 }).notNull().default(""),
  createdAt: varchar("created_at", { length: 30 }).notNull().default(""),
  updatedAt: varchar("updated_at", { length: 30 }).notNull().default(""),
});

export const admInitiativesTable = pgTable("adm_initiatives", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull().default(""),
  actions: text("actions").notNull().default(""),
  owner: varchar("owner", { length: 100 }).notNull().default(""),
  nextSteps: text("next_steps").notNull().default(""),
  status: varchar("status", { length: 30 }).notNull().default("Active"), // Active | On Hold | Completed
  updatedAt: varchar("updated_at", { length: 30 }).notNull().default(""),
});

export const admMeetingsTable = pgTable("adm_meetings", {
  id: serial("id").primaryKey(),
  reportMonth: varchar("report_month", { length: 20 }).notNull(), // e.g. "Jun 2026"
  domainArea: varchar("domain_area", { length: 120 }).notNull(),
  meetingDate: varchar("meeting_date", { length: 20 }).notNull(),
  horizonAttendees: text("horizon_attendees").notNull().default(""),
  ibmAttendees: text("ibm_attendees").notNull().default(""),
  deckLink: text("deck_link").notNull().default(""),
});

export const admHeadcountTable = pgTable("adm_headcount", {
  id: serial("id").primaryKey(),
  monthLabel: varchar("month_label", { length: 20 }).notNull(), // series, e.g. "Jun 2025"
  startHc: integer("start_hc").notNull(),
  onboards: integer("onboards").notNull(),
  offboards: integer("offboards").notNull(),
  endHc: integer("end_hc").notNull(),
  attritionPct: real("attrition_pct").notNull(),
});

export const admStaffChangesTable = pgTable("adm_staff_changes", {
  id: serial("id").primaryKey(),
  reportMonth: varchar("report_month", { length: 20 }).notNull(),
  personName: varchar("person_name", { length: 100 }).notNull(),
  team: varchar("team", { length: 100 }).notNull(),
  changeType: varchar("change_type", { length: 20 }).notNull(), // Onboard | Offboard
  reason: text("reason").notNull().default(""),
});

export const admInvoiceSummaryTable = pgTable("adm_invoice_summary", {
  id: serial("id").primaryKey(),
  reportMonth: varchar("report_month", { length: 20 }).notNull(),
  sow: varchar("sow", { length: 60 }).notNull(), // T&M CareRadius | T&M Data | T&M Non-Data
  lineItem: varchar("line_item", { length: 160 }).notNull(),
  hours: real("hours").notNull().default(0),
  amountUsd: real("amount_usd").notNull().default(0),
});

export const admHourlyTrendsTable = pgTable("adm_hourly_trends", {
  id: serial("id").primaryKey(),
  monthLabel: varchar("month_label", { length: 20 }).notNull(), // series
  onshoreNonCr: real("onshore_non_cr").notNull().default(0),
  offshoreNonCr: real("offshore_non_cr").notNull().default(0),
  onshoreCr: real("onshore_cr").notNull().default(0),
  offshoreCr: real("offshore_cr").notNull().default(0),
});

export const admMipsTrendTable = pgTable("adm_mips_trend", {
  id: serial("id").primaryKey(),
  monthLabel: varchar("month_label", { length: 20 }).notNull(), // series
  usageK: real("usage_k").notNull(), // thousands of MIPS
  baselineK: real("baseline_k").notNull().default(96),
  note: varchar("note", { length: 160 }).notNull().default(""),
});

export const admMipsInsightsTable = pgTable("adm_mips_insights", {
  id: serial("id").primaryKey(),
  reportMonth: varchar("report_month", { length: 20 }).notNull(),
  section: varchar("section", { length: 30 }).notNull(), // Optimization | Outlook | Recommendation
  title: varchar("title", { length: 200 }).notNull(),
  detail: text("detail").notNull().default(""),
  ord: integer("ord").notNull().default(0),
});

export const admTeamCompositionTable = pgTable("adm_team_composition", {
  id: serial("id").primaryKey(),
  reportMonth: varchar("report_month", { length: 20 }).notNull(),
  category: varchar("category", { length: 40 }).notNull(), // Technology Mix | Diversity | Experience | Attrition Benchmark
  label: varchar("label", { length: 120 }).notNull(),
  value: real("value").notNull(),
  unit: varchar("unit", { length: 20 }).notNull().default("%"),
  note: varchar("note", { length: 200 }).notNull().default(""),
});

export const admOtherUpdatesTable = pgTable("adm_other_updates", {
  id: serial("id").primaryKey(),
  reportMonth: varchar("report_month", { length: 20 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  detail: text("detail").notNull().default(""),
  status: varchar("status", { length: 30 }).notNull().default("In Progress"),
});

export type AdmActionItem = typeof admActionItemsTable.$inferSelect;
export type AdmInitiative = typeof admInitiativesTable.$inferSelect;
export type AdmMeeting = typeof admMeetingsTable.$inferSelect;
export type AdmHeadcount = typeof admHeadcountTable.$inferSelect;
export type AdmStaffChange = typeof admStaffChangesTable.$inferSelect;
export type AdmInvoiceSummary = typeof admInvoiceSummaryTable.$inferSelect;
export type AdmHourlyTrend = typeof admHourlyTrendsTable.$inferSelect;
export type AdmMipsTrend = typeof admMipsTrendTable.$inferSelect;
export type AdmMipsInsight = typeof admMipsInsightsTable.$inferSelect;
export type AdmTeamComposition = typeof admTeamCompositionTable.$inferSelect;
export type AdmOtherUpdate = typeof admOtherUpdatesTable.$inferSelect;
