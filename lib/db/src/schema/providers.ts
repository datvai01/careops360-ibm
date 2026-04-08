import { pgTable, varchar, integer, serial, text } from "drizzle-orm/pg-core";

export const providersTable = pgTable("providers", {
  providerId: varchar("provider_id", { length: 15 }).primaryKey(),
  providerName: varchar("provider_name", { length: 255 }).notNull(),
  npi: varchar("npi", { length: 15 }).notNull(),
  specialty: varchar("specialty", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  credentialingStatus: varchar("credentialing_status", { length: 50 }).notNull(),
  openClaims: integer("open_claims").notNull(),
  openTickets: integer("open_tickets").notNull(),
  lastUpdated: varchar("last_updated", { length: 10 }).notNull(),
});

export const providerIssuesTable = pgTable("provider_issues", {
  id: serial("id").primaryKey(),
  issueType: text("issue_type").notNull(),
  count: integer("count").notNull(),
  trend: varchar("trend", { length: 10 }).notNull(),
  priority: varchar("priority", { length: 10 }).notNull(),
});

export type Provider = typeof providersTable.$inferSelect;
