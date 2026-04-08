import { pgTable, text, varchar, integer, serial } from "drizzle-orm/pg-core";

export const memberEnrollmentsTable = pgTable("member_enrollments", {
  id: serial("id").primaryKey(),
  periodType: varchar("period_type", { length: 10 }).notNull(),
  periodLabel: varchar("period_label", { length: 50 }).notNull(),
  enrollments: integer("enrollments").notNull(),
  terminations: integer("terminations").notNull(),
});

export const memberExceptionsTable = pgTable("member_exceptions", {
  id: varchar("id", { length: 20 }).primaryKey(),
  memberId: varchar("member_id", { length: 20 }).notNull(),
  memberName: varchar("member_name", { length: 100 }).notNull(),
  exceptionType: varchar("exception_type", { length: 100 }).notNull(),
  product: varchar("product", { length: 50 }).notNull(),
  ageDays: integer("age_days").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  priority: varchar("priority", { length: 10 }).notNull(),
});

export type MemberException = typeof memberExceptionsTable.$inferSelect;
export type MemberEnrollment = typeof memberEnrollmentsTable.$inferSelect;
