import { pgTable, varchar, integer, real, serial, text } from "drizzle-orm/pg-core";

export const contactcenterCallReasonsTable = pgTable("contactcenter_call_reasons", {
  id: serial("id").primaryKey(),
  reason: text("reason").notNull(),
  count: integer("count").notNull(),
  percentage: real("percentage").notNull(),
  trend: varchar("trend", { length: 10 }).notNull(),
});

export const contactcenterHourlyTable = pgTable("contactcenter_hourly", {
  id: serial("id").primaryKey(),
  hourLabel: varchar("hour_label", { length: 20 }).notNull(),
  calls: integer("calls").notNull(),
  chats: integer("chats").notNull(),
  emails: integer("emails").notNull(),
});
