import { pgTable, varchar, integer, real, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const applicationsTable = pgTable("applications", {
  appId: varchar("app_id", { length: 15 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  owner: varchar("owner", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  availability: real("availability").notNull(),
  openIncidents: integer("open_incidents").notNull(),
  version: varchar("version", { length: 20 }).notNull(),
  lastDeployment: varchar("last_deployment", { length: 10 }).notNull(),
  slaTarget: real("sla_target").notNull(),
  slaActual: real("sla_actual").notNull(),
  environment: varchar("environment", { length: 10 }).notNull(),
  tier: varchar("tier", { length: 30 }).notNull(),
});

export const incidentsTable = pgTable("incidents", {
  incidentId: varchar("incident_id", { length: 20 }).primaryKey(),
  severity: varchar("severity", { length: 10 }).notNull(),
  title: text("title").notNull(),
  affectedApplication: varchar("affected_application", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  openedAt: timestamp("opened_at").notNull(),
  resolvedAt: timestamp("resolved_at"),
  mttr: integer("mttr"),
  rootCause: text("root_cause").notNull(),
  assignee: varchar("assignee", { length: 100 }).notNull(),
});

export const batchJobsTable = pgTable("batch_jobs", {
  jobId: varchar("job_id", { length: 10 }).primaryKey(),
  jobName: text("job_name").notNull(),
  application: varchar("application", { length: 255 }).notNull(),
  status: varchar("status", { length: 15 }).notNull(),
  scheduledTime: varchar("scheduled_time", { length: 10 }).notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }),
  duration: integer("duration"),
  recordsProcessed: integer("records_processed").notNull(),
});

export const interfacesTable = pgTable("interfaces", {
  interfaceId: varchar("interface_id", { length: 10 }).primaryKey(),
  name: text("name").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  sourceSystem: varchar("source_system", { length: 100 }).notNull(),
  targetSystem: varchar("target_system", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  lastTransmission: timestamp("last_transmission").notNull(),
  recordsToday: integer("records_today").notNull(),
  errorRate: real("error_rate").notNull(),
});

export const slaComplianceTable = pgTable("sla_compliance", {
  id: varchar("id", { length: 30 }).primaryKey(),
  tower: varchar("tower", { length: 100 }).notNull(),
  target: real("target").notNull(),
  actual: real("actual").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  trend: varchar("trend", { length: 15 }).notNull(),
});

export type Application = typeof applicationsTable.$inferSelect;
export type Incident = typeof incidentsTable.$inferSelect;
export type BatchJob = typeof batchJobsTable.$inferSelect;
