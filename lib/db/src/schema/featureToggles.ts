import { boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const featureTogglesTable = pgTable("feature_toggles", {
  featureKey: varchar("feature_key", { length: 100 }).primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: varchar("updated_by", { length: 255 }),
});