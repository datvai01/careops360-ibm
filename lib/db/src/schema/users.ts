import { pgTable, text, varchar, timestamp, serial, integer } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  avatar: varchar("avatar", { length: 10 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Session audit log, written by the api-server auth routes via raw SQL.
 * Declared here so drizzle-kit push knows about the table and does not
 * prompt to rename it when new tables are added.
 */
export const userSessionLogsTable = pgTable("user_session_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  loginAt: timestamp("login_at").defaultNow().notNull(),
  logoutAt: timestamp("logout_at"),
  sessionDurationSeconds: integer("session_duration_seconds"),
  token: text("token").notNull(),
});

export type UserSessionLog = typeof userSessionLogsTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
