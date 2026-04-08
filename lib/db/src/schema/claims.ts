import { pgTable, text, varchar, integer, real, serial } from "drizzle-orm/pg-core";

export const claimsTable = pgTable("claims", {
  claimId: varchar("claim_id", { length: 20 }).primaryKey(),
  memberId: varchar("member_id", { length: 20 }).notNull(),
  memberName: varchar("member_name", { length: 100 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  serviceDate: varchar("service_date", { length: 10 }).notNull(),
  receivedDate: varchar("received_date", { length: 10 }).notNull(),
  status: varchar("status", { length: 30 }).notNull(),
  amount: integer("amount").notNull(),
  lineOfBusiness: varchar("line_of_business", { length: 50 }).notNull(),
  ageDays: integer("age_days").notNull(),
  denialReason: varchar("denial_reason", { length: 100 }),
});

export const claimsDenialReasonsTable = pgTable("claims_denial_reasons", {
  id: serial("id").primaryKey(),
  reason: text("reason").notNull(),
  count: integer("count").notNull(),
  percentage: real("percentage").notNull(),
  trend: varchar("trend", { length: 10 }).notNull(),
});

export const claimsLobStatsTable = pgTable("claims_lob_stats", {
  id: serial("id").primaryKey(),
  lob: varchar("lob", { length: 50 }).notNull(),
  received: integer("received").notNull(),
  processed: integer("processed").notNull(),
  pending: integer("pending").notNull(),
  amount: integer("amount").notNull(),
});

export const claimsAgingTable = pgTable("claims_aging", {
  id: serial("id").primaryKey(),
  bucket: varchar("bucket", { length: 30 }).notNull(),
  count: integer("count").notNull(),
  percentage: real("percentage").notNull(),
  severity: varchar("severity", { length: 10 }).notNull(),
});

export type Claim = typeof claimsTable.$inferSelect;
export type ClaimsDenialReason = typeof claimsDenialReasonsTable.$inferSelect;
