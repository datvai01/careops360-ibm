import { pgTable, varchar, integer, real, serial, text } from "drizzle-orm/pg-core";

export const financeBillingExceptionsTable = pgTable("finance_billing_exceptions", {
  id: varchar("id", { length: 15 }).primaryKey(),
  memberId: varchar("member_id", { length: 20 }).notNull(),
  memberName: varchar("member_name", { length: 100 }).notNull(),
  exceptionType: text("exception_type").notNull(),
  amount: integer("amount").notNull(),
  ageDays: integer("age_days").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  priority: varchar("priority", { length: 10 }).notNull(),
});

export const financePremiumTrendTable = pgTable("finance_premium_trend", {
  id: serial("id").primaryKey(),
  monthLabel: varchar("month_label", { length: 15 }).notNull(),
  billed: integer("billed").notNull(),
  received: integer("received").notNull(),
});

export type FinanceBillingException = typeof financeBillingExceptionsTable.$inferSelect;
