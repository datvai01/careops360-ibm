import { Router, type IRouter } from "express";

const router: IRouter = Router();

function mkKpi(value: number, formatted: string, change: number, status: "green" | "yellow" | "red", trend: "up" | "down" | "flat") {
  return { value, formatted, change, changeLabel: `${change > 0 ? "+" : ""}${change}% vs yesterday`, status, trend };
}

const APPLICATIONS = [
  { appId: "APP-001", name: "Member Enrollment System", owner: "Benefits Administration", status: "healthy", availability: 99.9, openIncidents: 0, version: "4.2.1", lastDeployment: "2025-03-15", slaTarget: 99.5, slaActual: 99.9, environment: "PROD", tier: "Core" },
  { appId: "APP-002", name: "Claims Adjudication Platform", owner: "Claims Operations", status: "degraded", availability: 97.2, openIncidents: 1, version: "7.8.3", lastDeployment: "2025-03-28", slaTarget: 99.5, slaActual: 97.2, environment: "PROD", tier: "Core" },
  { appId: "APP-003", name: "Prior Authorization Workflow", owner: "Clinical Management", status: "healthy", availability: 99.6, openIncidents: 0, version: "3.1.4", lastDeployment: "2025-04-01", slaTarget: 99.0, slaActual: 99.6, environment: "PROD", tier: "Core" },
  { appId: "APP-004", name: "Provider Portal", owner: "Provider Relations", status: "healthy", availability: 99.7, openIncidents: 0, version: "2.4.8", lastDeployment: "2025-03-22", slaTarget: 99.0, slaActual: 99.7, environment: "PROD", tier: "Customer Facing" },
  { appId: "APP-005", name: "Member Portal", owner: "Member Services", status: "healthy", availability: 99.8, openIncidents: 0, version: "5.1.2", lastDeployment: "2025-04-03", slaTarget: 99.5, slaActual: 99.8, environment: "PROD", tier: "Customer Facing" },
  { appId: "APP-006", name: "CRM / Contact Center", owner: "Member Services", status: "healthy", availability: 99.4, openIncidents: 0, version: "8.2.0", lastDeployment: "2025-03-20", slaTarget: 99.0, slaActual: 99.4, environment: "PROD", tier: "Operations" },
  { appId: "APP-007", name: "Billing & Premium System", owner: "Finance Operations", status: "healthy", availability: 99.6, openIncidents: 0, version: "6.3.7", lastDeployment: "2025-03-18", slaTarget: 99.5, slaActual: 99.6, environment: "PROD", tier: "Core" },
  { appId: "APP-008", name: "Data Warehouse / Reporting", owner: "Analytics & BI", status: "healthy", availability: 99.1, openIncidents: 0, version: "3.8.2", lastDeployment: "2025-03-10", slaTarget: 98.0, slaActual: 99.1, environment: "PROD", tier: "Analytics" },
  { appId: "APP-009", name: "API Gateway / EDI Hub", owner: "Integration Services", status: "degraded", availability: 96.8, openIncidents: 1, version: "2.1.9", lastDeployment: "2025-04-05", slaTarget: 99.5, slaActual: 96.8, environment: "PROD", tier: "Integration" },
  { appId: "APP-010", name: "Pharmacy Benefits Manager", owner: "Pharmacy Operations", status: "healthy", availability: 99.5, openIncidents: 0, version: "4.7.1", lastDeployment: "2025-03-25", slaTarget: 99.0, slaActual: 99.5, environment: "PROD", tier: "Core" },
  { appId: "APP-011", name: "Care Management Platform", owner: "Clinical Management", status: "healthy", availability: 99.3, openIncidents: 0, version: "1.9.4", lastDeployment: "2025-04-01", slaTarget: 99.0, slaActual: 99.3, environment: "PROD", tier: "Clinical" },
  { appId: "APP-012", name: "Quality Management System", owner: "Quality & Compliance", status: "healthy", availability: 99.7, openIncidents: 0, version: "2.0.3", lastDeployment: "2025-03-12", slaTarget: 98.5, slaActual: 99.7, environment: "PROD", tier: "Compliance" },
];

router.get("/applications/health", async (_req, res): Promise<void> => {
  const healthy = APPLICATIONS.filter(a => a.status === "healthy").length;
  const degraded = APPLICATIONS.filter(a => a.status === "degraded").length;
  const critical = APPLICATIONS.filter(a => a.status === "critical").length;

  res.json({
    overallAvailability: 99.4,
    totalApplications: APPLICATIONS.length,
    healthyCount: healthy,
    degradedCount: degraded,
    criticalCount: critical,
    openIncidents: 2,
    batchSuccessRate: 98.2,
    interfaceHealth: 94.7,
  });
});

router.get("/applications/list", async (_req, res): Promise<void> => {
  res.json(APPLICATIONS);
});

router.get("/applications/incidents", async (req, res): Promise<void> => {
  const incidents = [
    {
      incidentId: "INC-2025-0842",
      severity: "sev2",
      title: "Claims Adjudication Platform - High Response Time",
      affectedApplication: "Claims Adjudication Platform",
      status: "acknowledged",
      openedAt: new Date(Date.now() - 52 * 60000).toISOString(),
      resolvedAt: null,
      mttr: null,
      rootCause: "Database connection pool exhaustion due to long-running queries",
      assignee: "IBM AMS Team - DB Tower",
    },
    {
      incidentId: "INC-2025-0841",
      severity: "sev2",
      title: "EDI Hub - 835 Remittance File Transmission Delay",
      affectedApplication: "API Gateway / EDI Hub",
      status: "in_progress",
      openedAt: new Date(Date.now() - 95 * 60000).toISOString(),
      resolvedAt: null,
      mttr: null,
      rootCause: "Network timeout on trading partner SFTP connection",
      assignee: "IBM AMS Team - Integration Tower",
    },
    {
      incidentId: "INC-2025-0838",
      severity: "sev3",
      title: "Member Portal - Intermittent Login Failures",
      affectedApplication: "Member Portal",
      status: "resolved",
      openedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      resolvedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      mttr: 121,
      rootCause: "SSO certificate renewal caused token validation failure",
      assignee: "IBM AMS Team - App Tower",
    },
    {
      incidentId: "INC-2025-0835",
      severity: "sev3",
      title: "Prior Auth Workflow - Batch Processing Delay",
      affectedApplication: "Prior Authorization Workflow",
      status: "resolved",
      openedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      resolvedAt: new Date(Date.now() - 22 * 3600000).toISOString(),
      mttr: 98,
      rootCause: "Unoptimized SQL query causing full table scan on large datasets",
      assignee: "IBM AMS Team - App Tower",
    },
    {
      incidentId: "INC-2025-0831",
      severity: "sev4",
      title: "Data Warehouse - Nightly ETL Job Delayed",
      affectedApplication: "Data Warehouse / Reporting",
      status: "resolved",
      openedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      resolvedAt: new Date(Date.now() - 46 * 3600000).toISOString(),
      mttr: 87,
      rootCause: "Storage volume threshold exceeded; auto-cleanup resolved",
      assignee: "IBM AMS Team - Infra Tower",
    },
  ];

  const severity = req.query.severity as string;
  const status = req.query.status as string;

  let filtered = incidents;
  if (severity) filtered = filtered.filter(i => i.severity === severity);
  if (status) filtered = filtered.filter(i => i.status === status);

  res.json(filtered);
});

router.get("/applications/batch-jobs", async (_req, res): Promise<void> => {
  const jobs = [
    { jobId: "BJ-001", jobName: "Claims Nightly Adjudication Sweep", application: "Claims Adjudication Platform", status: "success", scheduledTime: "02:00", startTime: "02:01", endTime: "04:23", duration: 142, recordsProcessed: 87432 },
    { jobId: "BJ-002", jobName: "Member Eligibility 270/271 Batch", application: "Member Enrollment System", status: "success", scheduledTime: "03:00", startTime: "03:00", endTime: "04:48", duration: 108, recordsProcessed: 142841 },
    { jobId: "BJ-003", jobName: "EDI 835 Remittance Processing", application: "API Gateway / EDI Hub", status: "failed", scheduledTime: "05:00", startTime: "05:00", endTime: null, duration: null, recordsProcessed: 0 },
    { jobId: "BJ-004", jobName: "Premium Billing Cycle Run", application: "Billing & Premium System", status: "success", scheduledTime: "01:00", startTime: "01:02", endTime: "02:31", duration: 89, recordsProcessed: 412841 },
    { jobId: "BJ-005", jobName: "Provider Directory Sync", application: "Provider Portal", status: "success", scheduledTime: "04:00", startTime: "04:01", endTime: "04:47", duration: 46, recordsProcessed: 28741 },
    { jobId: "BJ-006", jobName: "Prior Auth Status Updates", application: "Prior Authorization Workflow", status: "success", scheduledTime: "06:00", startTime: "06:00", endTime: "06:28", duration: 28, recordsProcessed: 3241 },
    { jobId: "BJ-007", jobName: "DW Nightly ETL Load", application: "Data Warehouse / Reporting", status: "success", scheduledTime: "00:00", startTime: "00:03", endTime: "02:47", duration: 164, recordsProcessed: 2841720 },
    { jobId: "BJ-008", jobName: "Care Management Risk Stratification", application: "Care Management Platform", status: "success", scheduledTime: "07:00", startTime: "07:01", endTime: "08:12", duration: 71, recordsProcessed: 4287341 },
  ];
  res.json(jobs);
});

router.get("/applications/interfaces", async (_req, res): Promise<void> => {
  res.json([
    { interfaceId: "IF-001", name: "EDI 837 Claims Intake", type: "EDI", sourceSystem: "Provider Portal", targetSystem: "Claims Adjudication Platform", status: "healthy", lastTransmission: new Date(Date.now() - 15 * 60000).toISOString(), recordsToday: 87432, errorRate: 0.2 },
    { interfaceId: "IF-002", name: "EDI 835 Remittance", type: "EDI", sourceSystem: "Claims Adjudication Platform", targetSystem: "Banking / Clearinghouse", status: "failed", lastTransmission: new Date(Date.now() - 95 * 60000).toISOString(), recordsToday: 0, errorRate: 100 },
    { interfaceId: "IF-003", name: "EDI 270/271 Eligibility", type: "EDI", sourceSystem: "Trading Partners", targetSystem: "Member Enrollment System", status: "healthy", lastTransmission: new Date(Date.now() - 5 * 60000).toISOString(), recordsToday: 142841, errorRate: 0.1 },
    { interfaceId: "IF-004", name: "HL7 Clinical Data Feed", type: "HL7", sourceSystem: "Hospital EHR Systems", targetSystem: "Care Management Platform", status: "healthy", lastTransmission: new Date(Date.now() - 8 * 60000).toISOString(), recordsToday: 28741, errorRate: 0.4 },
    { interfaceId: "IF-005", name: "Provider Directory API", type: "REST API", sourceSystem: "CAQH / Credentialing", targetSystem: "Provider Portal", status: "healthy", lastTransmission: new Date(Date.now() - 2 * 60000).toISOString(), recordsToday: 8421, errorRate: 0.0 },
    { interfaceId: "IF-006", name: "Pharmacy PBM Interface", type: "NCPDP", sourceSystem: "Pharmacy PBM", targetSystem: "Member Portal", status: "degraded", lastTransmission: new Date(Date.now() - 32 * 60000).toISOString(), recordsToday: 41284, errorRate: 3.8 },
    { interfaceId: "IF-007", name: "Medicare Part D Reporting", type: "CMS", sourceSystem: "Pharmacy Benefits Manager", targetSystem: "CMS Gateway", status: "healthy", lastTransmission: new Date(Date.now() - 4 * 3600000).toISOString(), recordsToday: 12841, errorRate: 0.0 },
  ]);
});

router.get("/applications/sla", async (_req, res): Promise<void> => {
  res.json([
    { tower: "Application Support", target: 99.0, actual: 98.8, status: "at_risk", trend: "stable" },
    { tower: "Database Administration", target: 99.5, actual: 97.2, status: "breached", trend: "declining" },
    { tower: "Integration / Middleware", target: 99.5, actual: 96.8, status: "breached", trend: "declining" },
    { tower: "Infrastructure", target: 99.5, actual: 99.8, status: "met", trend: "stable" },
    { tower: "Service Desk", target: 98.0, actual: 98.7, status: "met", trend: "improving" },
    { tower: "Security Operations", target: 99.9, actual: 99.9, status: "met", trend: "stable" },
    { tower: "Network Operations", target: 99.9, actual: 99.95, status: "met", trend: "improving" },
  ]);
});

router.get("/applications/kpis", async (_req, res): Promise<void> => {
  res.json({
    overallAvailability: mkKpi(99.4, "99.4%", -0.1, "green", "flat"),
    openIncidents: mkKpi(2, "2", 0, "yellow", "flat"),
    mttr: mkKpi(102, "102 min", -18.4, "green", "down"),
    mttd: mkKpi(8.4, "8.4 min", -22.1, "green", "down"),
    batchSuccessRate: mkKpi(98.2, "98.2%", -0.4, "green", "flat"),
    changeSuccessRate: mkKpi(94.7, "94.7%", 2.1, "green", "up"),
    slaCompliance: mkKpi(96.8, "96.8%", 1.2, "green", "up"),
    interfaceHealth: mkKpi(94.7, "94.7%", -4.1, "yellow", "down"),
  });
});

export default router;
