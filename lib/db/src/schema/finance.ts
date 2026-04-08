import { pgTable, varchar, integer, real, serial, text } from "drizzle-orm/pg-core";

export const vendorInvoicesTable = pgTable("vendor_invoices", {
  id: varchar("id", { length: 20 }).primaryKey(),
  vendor: varchar("vendor", { length: 100 }).notNull(),
  workNumber: varchar("work_number", { length: 20 }).notNull(),
  serviceCategory: varchar("service_category", { length: 50 }).notNull(),
  invoiceDate: varchar("invoice_date", { length: 15 }).notNull(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull(),
  ageDays: integer("age_days").notNull(),
  cycleTimeDays: real("cycle_time_days"),
  hasException: integer("has_exception").notNull().default(0),
  exceptionNote: text("exception_note"),
});

export const vendorInvoiceAlertsTable = pgTable("vendor_invoice_alerts", {
  id: serial("id").primaryKey(),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  invoiceId: varchar("invoice_id", { length: 20 }),
  vendor: varchar("vendor", { length: 100 }).notNull(),
  message: text("message").notNull(),
  severity: varchar("severity", { length: 10 }).notNull(),
  amount: integer("amount"),
});

export type VendorInvoice = typeof vendorInvoicesTable.$inferSelect;
export type VendorInvoiceAlert = typeof vendorInvoiceAlertsTable.$inferSelect;
