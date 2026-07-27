import { pgTable, varchar, integer, serial, text, timestamp } from "drizzle-orm/pg-core";

export const knowledgeArticlesTable = pgTable("knowledge_articles", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  domain: varchar("domain", { length: 60 }).notNull(), // Claims, Prior Auth, Providers, Enrollment, Contact Center, IT Ops / AIOps, Finance, Compliance
  tags: text("tags").notNull().default(""), // comma-separated
  sourceType: varchar("source_type", { length: 30 }).notNull(), // confluence | sharepoint | onedrive | gdrive | uploaded | ai-generated | manual
  sourceUrl: text("source_url"),
  author: varchar("author", { length: 120 }).notNull(),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const knowledgeSourcesTable = pgTable("knowledge_sources", {
  id: serial("id").primaryKey(),
  sourceType: varchar("source_type", { length: 30 }).notNull().unique(), // confluence | sharepoint | onedrive | gdrive
  displayName: varchar("display_name", { length: 80 }).notNull(),
  status: varchar("status", { length: 30 }).notNull().default("not_connected"), // not_connected | connected | syncing | error
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  lastSyncMessage: text("last_sync_message"),
  articleCount: integer("article_count").notNull().default(0),
});
