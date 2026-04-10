import { db, pool } from "./index.js";
import {
  usersTable,
  executiveAlertsTable,
  dailyTrendsTable,
  aiInsightsTable,
  memberEnrollmentsTable,
  memberExceptionsTable,
  claimsTable,
  claimsDenialReasonsTable,
  claimsLobStatsTable,
  claimsAgingTable,
  priorauthAgingTable,
  priorauthProceduresTable,
  priorauthReviewersTable,
  providersTable,
  providerIssuesTable,
  contactcenterCallReasonsTable,
  contactcenterHourlyTable,
  vendorInvoicesTable,
  vendorInvoiceAlertsTable,
  applicationsTable,
  incidentsTable,
  batchJobsTable,
  interfacesTable,
  slaComplianceTable,
  ibmamsRunbooksTable,
  ibmamsSavingsTrendTable,
  ibmamsTicketTrendsTable,
  roadmapInitiativesTable,
} from "./schema/index.js";

async function ensureSchema() {
  console.log("Ensuring all tables exist...");
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      username varchar(255) NOT NULL UNIQUE,
      password_hash text NOT NULL,
      name varchar(255) NOT NULL,
      role varchar(50) NOT NULL,
      email varchar(255) NOT NULL UNIQUE,
      avatar varchar(10) NOT NULL,
      title varchar(255) NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS executive_alerts (
      id varchar(20) PRIMARY KEY,
      severity varchar(20) NOT NULL,
      category varchar(100) NOT NULL,
      title text NOT NULL,
      description text NOT NULL,
      status varchar(30) NOT NULL,
      alert_timestamp timestamp NOT NULL,
      impacted_system varchar(255) NOT NULL,
      drill_down_path varchar(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS daily_trends (
      id text PRIMARY KEY,
      trend_date varchar(10) NOT NULL UNIQUE,
      claims integer NOT NULL,
      enrollments integer NOT NULL,
      prior_auths integer NOT NULL,
      availability real NOT NULL,
      incidents integer NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS ai_insights (
      id varchar(20) PRIMARY KEY,
      category varchar(100) NOT NULL,
      severity varchar(20) NOT NULL,
      headline text NOT NULL,
      detail text NOT NULL,
      recommendation text NOT NULL,
      insight_timestamp timestamp NOT NULL,
      affected_area varchar(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS member_enrollments (
      id serial PRIMARY KEY,
      period_type varchar(10) NOT NULL,
      period_label varchar(50) NOT NULL,
      enrollments integer NOT NULL,
      terminations integer NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS member_exceptions (
      id varchar(20) PRIMARY KEY,
      member_id varchar(20) NOT NULL,
      member_name varchar(100) NOT NULL,
      exception_type varchar(100) NOT NULL,
      product varchar(50) NOT NULL,
      age_days integer NOT NULL,
      status varchar(50) NOT NULL,
      priority varchar(10) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS claims (
      claim_id varchar(20) PRIMARY KEY,
      member_id varchar(20) NOT NULL,
      member_name varchar(100) NOT NULL,
      provider varchar(255) NOT NULL,
      service_date varchar(10) NOT NULL,
      received_date varchar(10) NOT NULL,
      status varchar(30) NOT NULL,
      amount integer NOT NULL,
      line_of_business varchar(50) NOT NULL,
      age_days integer NOT NULL,
      denial_reason varchar(100)
    )`,
    `CREATE TABLE IF NOT EXISTS claims_denial_reasons (
      id serial PRIMARY KEY,
      reason text NOT NULL,
      count integer NOT NULL,
      percentage real NOT NULL,
      trend varchar(10) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS claims_lob_stats (
      id serial PRIMARY KEY,
      lob varchar(50) NOT NULL,
      received integer NOT NULL,
      processed integer NOT NULL,
      pending integer NOT NULL,
      amount integer NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS claims_aging (
      id serial PRIMARY KEY,
      bucket varchar(30) NOT NULL,
      count integer NOT NULL,
      percentage real NOT NULL,
      severity varchar(10) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS priorauth_aging (
      id serial PRIMARY KEY,
      bucket varchar(50) NOT NULL,
      count integer NOT NULL,
      percentage real NOT NULL,
      severity varchar(10) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS priorauth_procedures (
      id serial PRIMARY KEY,
      category varchar(100) NOT NULL,
      requests integer NOT NULL,
      approval_rate real NOT NULL,
      avg_days real NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS priorauth_reviewers (
      reviewer_id varchar(10) PRIMARY KEY,
      reviewer_name varchar(100) NOT NULL,
      open_cases integer NOT NULL,
      completed_today integer NOT NULL,
      avg_days_to_decision real NOT NULL,
      status varchar(20) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS providers (
      provider_id varchar(15) PRIMARY KEY,
      provider_name varchar(255) NOT NULL,
      npi varchar(15) NOT NULL,
      specialty varchar(100) NOT NULL,
      status varchar(20) NOT NULL,
      credentialing_status varchar(50) NOT NULL,
      open_claims integer NOT NULL,
      open_tickets integer NOT NULL,
      last_updated varchar(10) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS provider_issues (
      id serial PRIMARY KEY,
      issue_type text NOT NULL,
      count integer NOT NULL,
      trend varchar(10) NOT NULL,
      priority varchar(10) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS contactcenter_call_reasons (
      id serial PRIMARY KEY,
      reason text NOT NULL,
      count integer NOT NULL,
      percentage real NOT NULL,
      trend varchar(10) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS contactcenter_hourly (
      id serial PRIMARY KEY,
      hour_label varchar(20) NOT NULL,
      calls integer NOT NULL,
      chats integer NOT NULL,
      emails integer NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS vendor_invoices (
      id varchar(20) PRIMARY KEY,
      vendor varchar(100) NOT NULL,
      work_number varchar(20) NOT NULL,
      service_category varchar(50) NOT NULL,
      invoice_date varchar(15) NOT NULL,
      amount integer NOT NULL,
      status varchar(20) NOT NULL,
      payment_status varchar(20) NOT NULL,
      age_days integer NOT NULL,
      cycle_time_days real,
      has_exception integer NOT NULL DEFAULT 0,
      exception_note text
    )`,
    `CREATE TABLE IF NOT EXISTS vendor_invoice_alerts (
      id serial PRIMARY KEY,
      alert_type varchar(50) NOT NULL,
      invoice_id varchar(20),
      vendor varchar(100) NOT NULL,
      message text NOT NULL,
      severity varchar(10) NOT NULL,
      amount integer
    )`,
    `CREATE TABLE IF NOT EXISTS applications (
      app_id varchar(15) PRIMARY KEY,
      name varchar(255) NOT NULL,
      owner varchar(100) NOT NULL,
      status varchar(20) NOT NULL,
      availability real NOT NULL,
      open_incidents integer NOT NULL,
      version varchar(20) NOT NULL,
      last_deployment varchar(10) NOT NULL,
      sla_target real NOT NULL,
      sla_actual real NOT NULL,
      environment varchar(10) NOT NULL,
      tier varchar(30) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS incidents (
      incident_id varchar(20) PRIMARY KEY,
      severity varchar(10) NOT NULL,
      title text NOT NULL,
      affected_application varchar(255) NOT NULL,
      status varchar(20) NOT NULL,
      opened_at timestamp NOT NULL,
      resolved_at timestamp,
      mttr integer,
      root_cause text NOT NULL,
      assignee varchar(100) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS batch_jobs (
      job_id varchar(10) PRIMARY KEY,
      job_name text NOT NULL,
      application varchar(255) NOT NULL,
      status varchar(15) NOT NULL,
      scheduled_time varchar(10) NOT NULL,
      start_time varchar(10) NOT NULL,
      end_time varchar(10),
      duration integer,
      records_processed integer NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS interfaces (
      interface_id varchar(10) PRIMARY KEY,
      name text NOT NULL,
      type varchar(20) NOT NULL,
      source_system varchar(100) NOT NULL,
      target_system varchar(100) NOT NULL,
      status varchar(20) NOT NULL,
      last_transmission timestamp NOT NULL,
      records_today integer NOT NULL,
      error_rate real NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS sla_compliance (
      id varchar(30) PRIMARY KEY,
      tower varchar(100) NOT NULL,
      target real NOT NULL,
      actual real NOT NULL,
      status varchar(20) NOT NULL,
      trend varchar(15) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS ibmams_runbooks (
      runbook_id varchar(10) PRIMARY KEY,
      name text NOT NULL,
      category varchar(50) NOT NULL,
      executions_today integer NOT NULL,
      success_rate real NOT NULL,
      time_saved_hours real NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS ibmams_savings_trend (
      id serial PRIMARY KEY,
      month_label varchar(15) NOT NULL,
      savings integer NOT NULL,
      avoidance integer NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS ibmams_ticket_trends (
      id serial PRIMARY KEY,
      week_label varchar(20) NOT NULL,
      total integer NOT NULL,
      resolved_within_sla integer NOT NULL,
      automated integer NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS roadmap_initiatives (
      id serial PRIMARY KEY,
      portfolio varchar(100) NOT NULL,
      product varchar(100) NOT NULL,
      application varchar(255) NOT NULL,
      initiative_type varchar(50) NOT NULL,
      description text NOT NULL,
      expected_outcome text NOT NULL,
      technology varchar(100) NOT NULL,
      current_version varchar(50) NOT NULL DEFAULT '',
      upgrade_version varchar(50) NOT NULL DEFAULT '',
      jira_id varchar(20) NOT NULL UNIQUE,
      service_category varchar(100) NOT NULL,
      start_date varchar(10) NOT NULL,
      end_date varchar(10) NOT NULL,
      status varchar(30) NOT NULL,
      priority varchar(20) NOT NULL,
      notes text NOT NULL DEFAULT ''
    )`,
  ];
  for (const sql of statements) {
    await pool.query(sql);
  }
  const alterRoadmap = [
    `ALTER TABLE roadmap_initiatives ADD COLUMN IF NOT EXISTS domain varchar(100) NOT NULL DEFAULT ''`,
    `ALTER TABLE roadmap_initiatives ADD COLUMN IF NOT EXISTS plan_year integer NOT NULL DEFAULT 1`,
    `ALTER TABLE roadmap_initiatives ADD COLUMN IF NOT EXISTS plan_quarter varchar(5) NOT NULL DEFAULT 'Q1'`,
    `ALTER TABLE roadmap_initiatives ADD COLUMN IF NOT EXISTS complexity varchar(10) NOT NULL DEFAULT 'Med'`,
    `ALTER TABLE roadmap_initiatives ADD COLUMN IF NOT EXISTS business_impact text NOT NULL DEFAULT ''`,
    `ALTER TABLE roadmap_initiatives ADD COLUMN IF NOT EXISTS dependency text NOT NULL DEFAULT ''`,
  ];
  for (const sql of alterRoadmap) {
    await pool.query(sql);
  }
  // Handle legacy environments where column was still named work_number
  try {
    await pool.query(`ALTER TABLE roadmap_initiatives RENAME COLUMN work_number TO jira_id`);
    console.log("  renamed work_number -> jira_id");
  } catch {
    // already renamed — safe to ignore
  }
  console.log("  all tables verified");
}

async function seed() {
  await ensureSchema();
  console.log("Seeding database...");

  // Users
  await db.delete(usersTable);
  await db.insert(usersTable).values([
    { id: "1", username: "exec@horizon.com", passwordHash: "demo123", name: "Sarah Mitchell", role: "executive", email: "exec@horizon.com", avatar: "SM", title: "Chief Executive Officer" },
    { id: "2", username: "ops@horizon.com", passwordHash: "demo123", name: "Michael Torres", role: "operations", email: "ops@horizon.com", avatar: "MT", title: "VP Operations" },
    { id: "3", username: "it@horizon.com", passwordHash: "demo123", name: "Jennifer Chen", role: "it", email: "it@horizon.com", avatar: "JC", title: "Chief Information Officer" },
    { id: "4", username: "ibm@horizon.com", passwordHash: "demo123", name: "David Kumar", role: "ibm_delivery", email: "ibm@horizon.com", avatar: "DK", title: "IBM AMS Delivery Manager" },
  ]);
  console.log("  users seeded");

  // Executive Alerts
  const now = new Date();
  await db.delete(executiveAlertsTable);
  await db.insert(executiveAlertsTable).values([
    { id: "ALT-001", severity: "critical", category: "Prior Authorization", title: "Prior Auth Backlog Spike Detected", description: "Prior auth backlog increased 47% in the last 2 hours. 892 requests pending review exceeding 48-hour SLA threshold.", status: "active", alertTimestamp: new Date(now.getTime() - 25 * 60000), impactedSystem: "Prior Authorization Workflow", drillDownPath: "/dashboard/prior-auth" },
    { id: "ALT-002", severity: "high", category: "Application Health", title: "Claims Adjudication Platform - Degraded Performance", description: "Claims Adjudication Platform response time averaging 8.2 seconds (SLA: 3 sec). Auto-adjudication rate dropped from 87% to 72%.", status: "acknowledged", alertTimestamp: new Date(now.getTime() - 52 * 60000), impactedSystem: "Claims Adjudication Platform", drillDownPath: "/dashboard/app-health" },
    { id: "ALT-003", severity: "high", category: "Claims", title: "Claims Settlement Delay - EDI 835 Interface", description: "EDI 835 remittance file transmission delayed by 3.5 hours. 14,200 claim settlements pending. Estimated $2.1M payment delay.", status: "in_progress", alertTimestamp: new Date(now.getTime() - 95 * 60000), impactedSystem: "EDI Hub / Claims Settlement", drillDownPath: "/dashboard/claims" },
    { id: "ALT-004", severity: "medium", category: "Contact Center", title: "Call Center Wait Times Above Threshold", description: "Average speed to answer reached 47 seconds (threshold: 30 sec). Abandonment rate at 8.2%.", status: "active", alertTimestamp: new Date(now.getTime() - 15 * 60000), impactedSystem: "CRM / Contact Center", drillDownPath: "/dashboard/contact-center" },
  ]);
  console.log("  executive_alerts seeded");

  // Daily Trends (30 days)
  await db.delete(dailyTrendsTable);
  const trendRows = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split("T")[0];
    return {
      id: dateStr,
      trendDate: dateStr,
      claims: 84000 + Math.floor(Math.random() * 8000),
      enrollments: 1600 + Math.floor(Math.random() * 500),
      priorAuths: 2800 + Math.floor(Math.random() * 700),
      availability: 99.1 + Math.random() * 0.8,
      incidents: Math.floor(Math.random() * 5),
    };
  });
  await db.insert(dailyTrendsTable).values(trendRows);
  console.log("  daily_trends seeded");

  // AI Insights
  await db.delete(aiInsightsTable);
  await db.insert(aiInsightsTable).values([
    { id: "AI-001", category: "Prior Authorization", severity: "critical", headline: "Prior Auth backlog 47% above historical baseline", detail: "Analysis of the past 30 days shows prior auth request volume increased 18.7% today. The primary driver is a spike in specialty drug (biologic) authorization requests, up 34% week-over-week. Current reviewer capacity is insufficient to maintain the 48-hour turnaround SLA.", recommendation: "Activate surge capacity protocol: reassign 3 clinical reviewers from non-urgent queue. Consider auto-approval for repeat biologics with clean history (eligible: ~287 cases).", insightTimestamp: new Date(now.getTime() - 20 * 60000), affectedArea: "Prior Authorization Operations" },
    { id: "AI-002", category: "Claims", severity: "warning", headline: "Auto-adjudication rate dropped 15pp — root cause identified", detail: "The Claims Adjudication Platform degradation is causing rules engine timeouts, forcing claims to manual review. Auto-adjudication dropped from 87% to 72% this morning, adding approximately 4,200 claims to the manual queue.", recommendation: "IBM AMS DB team is optimizing the query causing connection pool exhaustion. Expected resolution: 2 hours. Manual reviewer staffing increase recommended for today.", insightTimestamp: new Date(now.getTime() - 35 * 60000), affectedArea: "Claims Operations" },
    { id: "AI-003", category: "Application Health", severity: "warning", headline: "EDI 835 delay will impact provider payment satisfaction scores", detail: "The delayed EDI 835 remittance files affect 312 providers expecting payment today. Based on historical patterns, delays exceeding 4 hours generate an average of 47 provider service calls and 3-5 formal complaints.", recommendation: "Proactively notify affected providers via portal message. IBM team has restored SFTP connectivity; backlog processing expected complete by 3:00 PM EST.", insightTimestamp: new Date(now.getTime() - 55 * 60000), affectedArea: "Integration / Provider Relations" },
    { id: "AI-004", category: "Contact Center", severity: "warning", headline: "Call volume trending toward capacity threshold", detail: "Current call volume and ASA trends suggest abandonment rate will exceed 10% within the next 90 minutes if staffing remains unchanged. Prior auth status calls are driving 14.7% of total volume — unusually high.", recommendation: "Request 8 additional agents from overflow pool. Activate IVR self-service option for prior auth status checks to deflect an estimated 22% of incoming calls.", insightTimestamp: new Date(now.getTime() - 8 * 60000), affectedArea: "Contact Center Operations" },
    { id: "AI-005", category: "Finance", severity: "info", headline: "Premium collection rate 3.2% below April target", detail: "YTD premium collection is tracking at 94.8% vs 98% target. Analysis identifies 2,841 accounts with 30+ day delinquency that have not received automated outreach. Payment reminder automation would recover an estimated $4.2M.", recommendation: "Enable automated payment reminder workflow for 30+ day delinquent accounts. Historical conversion rate: 42% within 10 days of outreach.", insightTimestamp: new Date(now.getTime() - 2 * 3600000), affectedArea: "Premium & Billing" },
  ]);
  console.log("  ai_insights seeded");

  // Member Enrollments (daily: 30 days, weekly: 12 weeks, monthly: 12 months)
  await db.delete(memberEnrollmentsTable);
  const enrollRows: typeof memberEnrollmentsTable.$inferInsert[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    enrollRows.push({ periodType: "daily", periodLabel: d.toISOString().split("T")[0], enrollments: 1400 + Math.floor(Math.random() * 700), terminations: 500 + Math.floor(Math.random() * 300) });
  }
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (11 - i) * 7);
    enrollRows.push({ periodType: "weekly", periodLabel: `Week of ${d.toISOString().split("T")[0]}`, enrollments: 8500 + Math.floor(Math.random() * 2000), terminations: 3000 + Math.floor(Math.random() * 1000) });
  }
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    const label = `${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
    enrollRows.push({ periodType: "monthly", periodLabel: label, enrollments: 34000 + Math.floor(Math.random() * 8000), terminations: 12000 + Math.floor(Math.random() * 4000) });
  }
  await db.insert(memberEnrollmentsTable).values(enrollRows);
  console.log("  member_enrollments seeded");

  // Member Exceptions
  const excTypes = ["Missing SSN", "Duplicate Member ID", "Coverage Gap", "Invalid DOB", "Address Verification Failed", "Plan Code Mismatch", "Dependent Age Override", "Retroactive Change"];
  const excProducts = ["Commercial", "Medicare Advantage", "Medicaid", "Exchange"];
  const excStatuses = ["Pending Review", "In Progress", "Escalated", "Awaiting Member"];
  const excPriorities = ["high", "medium", "low"] as const;
  await db.delete(memberExceptionsTable);
  await db.insert(memberExceptionsTable).values(
    Array.from({ length: 20 }, (_, i) => ({
      id: `EXC-${String(i + 1001).padStart(5, "0")}`,
      memberId: `HBC${String(1000000 + i * 43712)}`,
      memberName: `Member ${i + 1}`,
      exceptionType: excTypes[i % excTypes.length],
      product: excProducts[i % excProducts.length],
      ageDays: (i * 3 % 30) + 1,
      status: excStatuses[i % excStatuses.length],
      priority: excPriorities[i % excPriorities.length],
    }))
  );
  console.log("  member_exceptions seeded");

  // Claims (500 rows for paginated queries)
  const claimStatuses = ["Pending", "In Adjudication", "Suspended", "Denied", "Settled", "Returned"];
  const claimProviders = ["St. Barnabas Medical Center", "RWJBarnabas Health", "Atlantic Health System", "Virtua Health", "Cooper University Hospital", "Hackensack Meridian Health"];
  const claimLobs = ["Commercial", "Medicare Advantage", "Medicaid", "Exchange"];
  const claimDenialReasons = ["Medical Necessity", "Not Covered", "Duplicate Claim", "Prior Auth Required", "Out of Network"];
  await db.delete(claimsTable);
  const claimRows: typeof claimsTable.$inferInsert[] = Array.from({ length: 500 }, (_, i) => {
    const status = claimStatuses[i % claimStatuses.length];
    const ageDays = (i * 7 % 60) + 1;
    const sd = new Date(Date.now() - ageDays * 86400000);
    return {
      claimId: `CLM-${String(i + 2024001).padStart(8, "0")}`,
      memberId: `HBC${String(1000000 + i * 11237)}`,
      memberName: `Member ${i + 1}`,
      provider: claimProviders[i % claimProviders.length],
      serviceDate: sd.toISOString().split("T")[0],
      receivedDate: new Date(sd.getTime() + 2 * 86400000).toISOString().split("T")[0],
      status,
      amount: 500 + (i * 317 % 49500),
      lineOfBusiness: claimLobs[i % claimLobs.length],
      ageDays,
      denialReason: status === "Denied" ? claimDenialReasons[i % claimDenialReasons.length] : null,
    };
  });
  await db.insert(claimsTable).values(claimRows);
  console.log("  claims seeded (500 rows)");

  // Claims Denial Reasons
  await db.delete(claimsDenialReasonsTable);
  await db.insert(claimsDenialReasonsTable).values([
    { reason: "Medical Necessity Not Established", count: 1482, percentage: 35.1, trend: "up" },
    { reason: "Prior Authorization Required", count: 892, percentage: 21.1, trend: "up" },
    { reason: "Not a Covered Service", count: 634, percentage: 15.0, trend: "flat" },
    { reason: "Duplicate Claim Submission", count: 421, percentage: 9.98, trend: "down" },
    { reason: "Out of Network Provider", count: 387, percentage: 9.17, trend: "up" },
    { reason: "Timely Filing Exceeded", count: 248, percentage: 5.88, trend: "down" },
    { reason: "Coordination of Benefits", count: 154, percentage: 3.65, trend: "flat" },
  ]);
  console.log("  claims_denial_reasons seeded");

  // Claims LOB Stats
  await db.delete(claimsLobStatsTable);
  await db.insert(claimsLobStatsTable).values([
    { lob: "Commercial", received: 42100, processed: 31200, pending: 10900, amount: 118400000 },
    { lob: "Medicare Advantage", received: 21800, processed: 16400, pending: 5400, amount: 87200000 },
    { lob: "Medicaid", received: 14700, processed: 9800, pending: 4900, amount: 22100000 },
    { lob: "Exchange", received: 8832, processed: 3623, pending: 5743, amount: 14100000 },
  ]);
  console.log("  claims_lob_stats seeded");

  // Claims Aging
  await db.delete(claimsAgingTable);
  await db.insert(claimsAgingTable).values([
    { bucket: "0-7 days", count: 6241, percentage: 32.9, severity: "green" },
    { bucket: "8-14 days", count: 4892, percentage: 25.8, severity: "green" },
    { bucket: "15-21 days", count: 3187, percentage: 16.8, severity: "yellow" },
    { bucket: "22-30 days", count: 2841, percentage: 15.0, severity: "yellow" },
    { bucket: "31-45 days", count: 1241, percentage: 6.55, severity: "red" },
    { bucket: "46+ days", count: 541, percentage: 2.86, severity: "red" },
  ]);
  console.log("  claims_aging seeded");

  // Prior Auth Aging
  await db.delete(priorauthAgingTable);
  await db.insert(priorauthAgingTable).values([
    { bucket: "0-24 hours", count: 412, percentage: 33.0, severity: "green" },
    { bucket: "24-48 hours", count: 287, percentage: 23.0, severity: "green" },
    { bucket: "48-72 hours (SLA)", count: 341, percentage: 27.3, severity: "yellow" },
    { bucket: "72-96 hours", count: 142, percentage: 11.4, severity: "red" },
    { bucket: "96+ hours (Breach)", count: 65, percentage: 5.21, severity: "red" },
  ]);
  console.log("  priorauth_aging seeded");

  // Prior Auth Procedures
  await db.delete(priorauthProceduresTable);
  await db.insert(priorauthProceduresTable).values([
    { category: "Inpatient Surgery", requests: 487, approvalRate: 78.2, avgDays: 1.8 },
    { category: "Outpatient MRI/CT", requests: 412, approvalRate: 84.1, avgDays: 0.9 },
    { category: "Specialty Drugs (Biologics)", requests: 387, approvalRate: 62.4, avgDays: 3.2 },
    { category: "Home Health Services", requests: 341, approvalRate: 91.2, avgDays: 0.7 },
    { category: "Physical/OT Therapy (Extended)", requests: 298, approvalRate: 87.6, avgDays: 0.5 },
    { category: "Behavioral Health", requests: 274, approvalRate: 89.4, avgDays: 0.8 },
    { category: "Durable Medical Equipment", requests: 241, approvalRate: 93.1, avgDays: 0.4 },
    { category: "Oncology Treatment", requests: 187, approvalRate: 71.7, avgDays: 2.4 },
    { category: "Cardiac Procedures", requests: 163, approvalRate: 74.2, avgDays: 2.1 },
    { category: "Transplant Services", requests: 51, approvalRate: 58.8, avgDays: 5.7 },
  ]);
  console.log("  priorauth_procedures seeded");

  // Prior Auth Reviewers
  await db.delete(priorauthReviewersTable);
  await db.insert(priorauthReviewersTable).values([
    { reviewerId: "RV001", reviewerName: "Dr. Lisa Park", openCases: 87, completedToday: 34, avgDaysToDecision: 1.2, status: "high" },
    { reviewerId: "RV002", reviewerName: "Dr. James Wilson", openCases: 62, completedToday: 28, avgDaysToDecision: 1.0, status: "normal" },
    { reviewerId: "RV003", reviewerName: "RN Patricia Gomez", openCases: 124, completedToday: 41, avgDaysToDecision: 1.8, status: "critical" },
    { reviewerId: "RV004", reviewerName: "Dr. Aisha Johnson", openCases: 53, completedToday: 22, avgDaysToDecision: 0.9, status: "normal" },
    { reviewerId: "RV005", reviewerName: "RN Mark Stevens", openCases: 98, completedToday: 31, avgDaysToDecision: 1.5, status: "high" },
    { reviewerId: "RV006", reviewerName: "Dr. Sarah Kim", openCases: 41, completedToday: 19, avgDaysToDecision: 0.8, status: "normal" },
  ]);
  console.log("  priorauth_reviewers seeded");

  // Providers
  const providerNames = [
    "Atlantic Health System", "RWJBarnabas Health", "Hackensack Meridian Health",
    "St. Barnabas Medical Center", "Cooper University Hospital", "Virtua Health System",
    "Valley Health System", "Holy Name Medical Center", "Morristown Medical Center",
    "Jersey Shore University Medical Center", "CarePoint Health", "Bergen New Bridge Medical Center",
    "Robert Wood Johnson University Hospital", "Newark Beth Israel Medical Center", "Trinitas Regional Medical Center",
  ];
  const specialties = ["Internal Medicine", "Cardiology", "Orthopedic Surgery", "Family Medicine", "Oncology", "Neurology", "Psychiatry", "Radiology", "Obstetrics", "Pediatrics"];
  const provStatuses = ["active", "active", "active", "active", "pending", "pending", "suspended"] as const;
  const credStatuses = ["Credentialed", "Credentialed", "Credentialed", "Pending Review", "Initial Application", "Expired - Renewal Pending"];
  await db.delete(providersTable);
  await db.insert(providersTable).values(
    providerNames.map((name, i) => ({
      providerId: `PRV${String(i + 10001).padStart(6, "0")}`,
      providerName: name,
      npi: String(1000000000 + i * 112345678 % 9000000000),
      specialty: specialties[i % specialties.length],
      status: provStatuses[i % provStatuses.length],
      credentialingStatus: credStatuses[i % credStatuses.length],
      openClaims: 10 + (i * 37 % 490),
      openTickets: i * 13 % 20,
      lastUpdated: new Date(Date.now() - (i * 3 % 30) * 86400000).toISOString().split("T")[0],
    }))
  );
  console.log("  providers seeded");

  // Provider Issues
  await db.delete(providerIssuesTable);
  await db.insert(providerIssuesTable).values([
    { issueType: "Claims Billing Errors", count: 187, trend: "up", priority: "high" },
    { issueType: "Directory Information Outdated", count: 142, trend: "flat", priority: "medium" },
    { issueType: "Credentialing Delays", count: 98, trend: "up", priority: "high" },
    { issueType: "Contract Rate Disputes", count: 87, trend: "up", priority: "high" },
    { issueType: "Portal Access Issues", count: 64, trend: "down", priority: "medium" },
    { issueType: "ERA/EFT Setup", count: 41, trend: "flat", priority: "low" },
    { issueType: "Prior Auth Denials Appeals", count: 38, trend: "up", priority: "medium" },
  ]);
  console.log("  provider_issues seeded");

  // Contact Center Call Reasons
  await db.delete(contactcenterCallReasonsTable);
  await db.insert(contactcenterCallReasonsTable).values([
    { reason: "Benefits & Coverage Inquiry", count: 1842, percentage: 21.9, trend: "flat" },
    { reason: "Claims Status Check", count: 1687, percentage: 20.0, trend: "up" },
    { reason: "Prior Authorization Status", count: 1241, percentage: 14.7, trend: "up" },
    { reason: "ID Card / Documents Request", count: 842, percentage: 10.0, trend: "down" },
    { reason: "Provider Network Inquiry", count: 714, percentage: 8.48, trend: "flat" },
    { reason: "Billing & Payment Issues", count: 612, percentage: 7.27, trend: "up" },
    { reason: "Enrollment Changes", count: 487, percentage: 5.78, trend: "flat" },
    { reason: "Prescription Drug Coverage", count: 412, percentage: 4.89, trend: "up" },
    { reason: "Appeals & Grievances", count: 341, percentage: 4.05, trend: "up" },
    { reason: "Other", count: 241, percentage: 2.86, trend: "flat" },
  ]);
  console.log("  contactcenter_call_reasons seeded");

  // Contact Center Hourly
  await db.delete(contactcenterHourlyTable);
  await db.insert(contactcenterHourlyTable).values(
    Array.from({ length: 10 }, (_, i) => {
      const hour = i + 8;
      const isBusy = hour >= 10 && hour <= 14;
      const label = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
      return {
        hourLabel: label,
        calls: isBusy ? 600 + (i * 71 % 400) : 200 + (i * 43 % 300),
        chats: isBusy ? 200 + (i * 23 % 150) : 80 + (i * 17 % 100),
        emails: 40 + (i * 11 % 80),
      };
    })
  );
  console.log("  contactcenter_hourly seeded");

  // Vendor Invoices — IBM only; 7 service categories
  await db.delete(vendorInvoiceAlertsTable);
  await db.delete(vendorInvoicesTable);

  // Today = 2026-04-08. Dates span Oct 2025 – Apr 2026 so date-range filters show distinct subsets:
  //   Last 7d  (Apr 1–8):  7 invoices
  //   Last 30d (Mar 9–31): 4 more  → 11 total
  //   Last 90d (Jan 8–Mar 8): 9 more → 20 total
  //   Older (Oct–Jan 7):  13 invoices → 33 total
  const ibmInvoices = [
    // Application Support
    { id: "INV-IBM-001", workNumber: "WO-AS-001", serviceCategory: "Application Support",      invoiceDate: "2025-10-08", amount: 385000, status: "Processed", paymentStatus: "Paid",    ageDays: 182, cycleTimeDays: 14.2, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-002", workNumber: "WO-AS-001", serviceCategory: "Application Support",      invoiceDate: "2025-11-15", amount: 390000, status: "Processed", paymentStatus: "Paid",    ageDays: 144, cycleTimeDays: 15.0, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-003", workNumber: "WO-AS-002", serviceCategory: "Application Support",      invoiceDate: "2026-01-10", amount: 395000, status: "Processed", paymentStatus: "Paid",    ageDays: 88,  cycleTimeDays: 16.5, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-004", workNumber: "WO-AS-002", serviceCategory: "Application Support",      invoiceDate: "2026-02-20", amount: 398000, status: "Processed", paymentStatus: "Unpaid",  ageDays: 47,  cycleTimeDays: 18.0, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-005", workNumber: "WO-AS-003", serviceCategory: "Application Support",      invoiceDate: "2026-03-20", amount: 402000, status: "Pending",   paymentStatus: "Unpaid",  ageDays: 19,  cycleTimeDays: null, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-006", workNumber: "WO-AS-003", serviceCategory: "Application Support",      invoiceDate: "2026-04-05", amount: 402000, status: "On Hold",   paymentStatus: "Unpaid",  ageDays: 3,   cycleTimeDays: null, hasException: 1, exceptionNote: "Amount mismatch vs. PO-AS-0094 ($402,000 vs $395,500). Reconciliation required." },
    // Application Development
    { id: "INV-IBM-007", workNumber: "WO-AD-001", serviceCategory: "Application Development",  invoiceDate: "2025-10-20", amount: 620000, status: "Processed", paymentStatus: "Paid",    ageDays: 170, cycleTimeDays: 22.4, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-008", workNumber: "WO-AD-001", serviceCategory: "Application Development",  invoiceDate: "2025-12-05", amount: 580000, status: "Processed", paymentStatus: "Paid",    ageDays: 124, cycleTimeDays: 20.8, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-009", workNumber: "WO-AD-002", serviceCategory: "Application Development",  invoiceDate: "2026-01-20", amount: 745000, status: "Processed", paymentStatus: "Paid",    ageDays: 78,  cycleTimeDays: 24.1, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-010", workNumber: "WO-AD-002", serviceCategory: "Application Development",  invoiceDate: "2026-03-10", amount: 695000, status: "Pending",   paymentStatus: "Unpaid",  ageDays: 29,  cycleTimeDays: null, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-011", workNumber: "WO-AD-003", serviceCategory: "Application Development",  invoiceDate: "2026-04-04", amount: 810000, status: "On Hold",   paymentStatus: "Unpaid",  ageDays: 4,   cycleTimeDays: null, hasException: 1, exceptionNote: "Missing SOW milestone sign-off for Phase 3 deliverable — approval pending." },
    // Infrastructure
    { id: "INV-IBM-012", workNumber: "WO-INF-001", serviceCategory: "Infrastructure",          invoiceDate: "2025-10-15", amount: 298000, status: "Processed", paymentStatus: "Paid",    ageDays: 175, cycleTimeDays: 13.5, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-013", workNumber: "WO-INF-001", serviceCategory: "Infrastructure",          invoiceDate: "2025-12-01", amount: 302000, status: "Processed", paymentStatus: "Paid",    ageDays: 128, cycleTimeDays: 14.2, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-014", workNumber: "WO-INF-002", serviceCategory: "Infrastructure",          invoiceDate: "2026-01-15", amount: 312000, status: "Processed", paymentStatus: "Paid",    ageDays: 83,  cycleTimeDays: 15.8, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-015", workNumber: "WO-INF-002", serviceCategory: "Infrastructure",          invoiceDate: "2026-03-01", amount: 318000, status: "Processed", paymentStatus: "Unpaid",  ageDays: 38,  cycleTimeDays: 17.0, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-016", workNumber: "WO-INF-003", serviceCategory: "Infrastructure",          invoiceDate: "2026-04-01", amount: 325000, status: "Pending",   paymentStatus: "Unpaid",  ageDays: 7,   cycleTimeDays: null, hasException: 0, exceptionNote: null },
    // Data Services
    { id: "INV-IBM-017", workNumber: "WO-DS-001",  serviceCategory: "Data Services",           invoiceDate: "2025-11-01", amount: 187500, status: "Processed", paymentStatus: "Paid",    ageDays: 158, cycleTimeDays: 19.3, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-018", workNumber: "WO-DS-001",  serviceCategory: "Data Services",           invoiceDate: "2026-01-05", amount: 195000, status: "Processed", paymentStatus: "Paid",    ageDays: 93,  cycleTimeDays: 18.6, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-019", workNumber: "WO-DS-002",  serviceCategory: "Data Services",           invoiceDate: "2026-02-15", amount: 210000, status: "Processed", paymentStatus: "Paid",    ageDays: 52,  cycleTimeDays: 21.5, hasException: 1, exceptionNote: "Duplicate invoice reference shared with INV-IBM-018 — reconciliation in progress." },
    { id: "INV-IBM-020", workNumber: "WO-DS-002",  serviceCategory: "Data Services",           invoiceDate: "2026-04-03", amount: 220000, status: "Pending",   paymentStatus: "Unpaid",  ageDays: 5,   cycleTimeDays: null, hasException: 0, exceptionNote: null },
    // Technology
    { id: "INV-IBM-021", workNumber: "WO-TECH-001", serviceCategory: "Technology",             invoiceDate: "2025-10-25", amount: 465000, status: "Processed", paymentStatus: "Paid",    ageDays: 165, cycleTimeDays: 20.7, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-022", workNumber: "WO-TECH-001", serviceCategory: "Technology",             invoiceDate: "2025-12-15", amount: 480000, status: "Processed", paymentStatus: "Paid",    ageDays: 114, cycleTimeDays: 22.1, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-023", workNumber: "WO-TECH-002", serviceCategory: "Technology",             invoiceDate: "2026-02-08", amount: 495000, status: "Processed", paymentStatus: "Unpaid",  ageDays: 59,  cycleTimeDays: 23.4, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-024", workNumber: "WO-TECH-002", serviceCategory: "Technology",             invoiceDate: "2026-04-06", amount: 510000, status: "Pending",   paymentStatus: "Unpaid",  ageDays: 2,   cycleTimeDays: null, hasException: 0, exceptionNote: null },
    // Software
    { id: "INV-IBM-025", workNumber: "WO-SW-001",  serviceCategory: "Software",                invoiceDate: "2025-11-08", amount: 142000, status: "Processed", paymentStatus: "Paid",    ageDays: 151, cycleTimeDays: 12.8, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-026", workNumber: "WO-SW-001",  serviceCategory: "Software",                invoiceDate: "2026-01-01", amount: 148000, status: "Processed", paymentStatus: "Paid",    ageDays: 97,  cycleTimeDays: 13.2, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-027", workNumber: "WO-SW-002",  serviceCategory: "Software",                invoiceDate: "2026-02-01", amount: 155000, status: "Processed", paymentStatus: "Paid",    ageDays: 66,  cycleTimeDays: 14.0, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-028", workNumber: "WO-SW-002",  serviceCategory: "Software",                invoiceDate: "2026-03-25", amount: 162000, status: "Pending",   paymentStatus: "Unpaid",  ageDays: 14,  cycleTimeDays: null, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-029", workNumber: "WO-SW-003",  serviceCategory: "Software",                invoiceDate: "2026-04-05", amount: 168000, status: "On Hold",   paymentStatus: "Unpaid",  ageDays: 3,   cycleTimeDays: null, hasException: 1, exceptionNote: "License count discrepancy — actual vs. contracted seat count under audit." },
    // Quality Engineering
    { id: "INV-IBM-030", workNumber: "WO-QE-001",  serviceCategory: "Quality Engineering",     invoiceDate: "2025-11-20", amount: 124000, status: "Processed", paymentStatus: "Paid",    ageDays: 139, cycleTimeDays: 16.4, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-031", workNumber: "WO-QE-001",  serviceCategory: "Quality Engineering",     invoiceDate: "2026-01-25", amount: 131000, status: "Processed", paymentStatus: "Paid",    ageDays: 73,  cycleTimeDays: 17.9, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-032", workNumber: "WO-QE-002",  serviceCategory: "Quality Engineering",     invoiceDate: "2026-03-15", amount: 138000, status: "Processed", paymentStatus: "Unpaid",  ageDays: 24,  cycleTimeDays: 18.5, hasException: 0, exceptionNote: null },
    { id: "INV-IBM-033", workNumber: "WO-QE-002",  serviceCategory: "Quality Engineering",     invoiceDate: "2026-04-04", amount: 145000, status: "Pending",   paymentStatus: "Unpaid",  ageDays: 4,   cycleTimeDays: null, hasException: 0, exceptionNote: null },
  ];

  await db.insert(vendorInvoicesTable).values(
    ibmInvoices.map((inv) => ({ ...inv, vendor: "IBM" }))
  );
  console.log("  vendor_invoices seeded (IBM only — 7 service categories)");

  await db.insert(vendorInvoiceAlertsTable).values([
    { alertType: "invoice_mismatch",   invoiceId: "INV-IBM-006", vendor: "IBM", message: "INV-IBM-006 ($402,000) amount does not match PO-AS-0094 ($395,500). Finance reconciliation required.", severity: "high",   amount: 402000 },
    { alertType: "high_value_pending", invoiceId: "INV-IBM-011", vendor: "IBM", message: "Application Development invoice INV-IBM-011 ($810,000) on hold — SOW milestone sign-off missing.", severity: "high",   amount: 810000 },
    { alertType: "delayed_payment",    invoiceId: "INV-IBM-023", vendor: "IBM", message: "Technology invoice INV-IBM-023 ($495,000) processed 66 days ago — payment not yet initiated.", severity: "high",   amount: 495000 },
    { alertType: "invoice_mismatch",   invoiceId: "INV-IBM-019", vendor: "IBM", message: "INV-IBM-019 ($210,000) duplicate PO reference shared with INV-IBM-018 — Data Services reconciliation pending.", severity: "medium", amount: 210000 },
    { alertType: "invoice_mismatch",   invoiceId: "INV-IBM-029", vendor: "IBM", message: "Software invoice INV-IBM-029 ($168,000) on hold — licensed seat count under audit.", severity: "medium", amount: 168000 },
    { alertType: "delayed_payment",    invoiceId: "INV-IBM-004", vendor: "IBM", message: "Application Support invoice INV-IBM-004 ($395,000) processed 38 days ago with no payment record.", severity: "medium", amount: 395000 },
  ]);
  console.log("  vendor_invoice_alerts seeded");

  // Applications
  await db.delete(applicationsTable);
  await db.insert(applicationsTable).values([
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
  ]);
  console.log("  applications seeded");

  // Incidents
  await db.delete(incidentsTable);
  await db.insert(incidentsTable).values([
    { incidentId: "INC-2025-0842", severity: "sev2", title: "Claims Adjudication Platform - High Response Time", affectedApplication: "Claims Adjudication Platform", status: "acknowledged", openedAt: new Date(now.getTime() - 52 * 60000), resolvedAt: null, mttr: null, rootCause: "Database connection pool exhaustion due to long-running queries", assignee: "IBM AMS Team - DB Tower" },
    { incidentId: "INC-2025-0841", severity: "sev2", title: "EDI Hub - 835 Remittance File Transmission Delay", affectedApplication: "API Gateway / EDI Hub", status: "in_progress", openedAt: new Date(now.getTime() - 95 * 60000), resolvedAt: null, mttr: null, rootCause: "Network timeout on trading partner SFTP connection", assignee: "IBM AMS Team - Integration Tower" },
    { incidentId: "INC-2025-0838", severity: "sev3", title: "Member Portal - Intermittent Login Failures", affectedApplication: "Member Portal", status: "resolved", openedAt: new Date(now.getTime() - 8 * 3600000), resolvedAt: new Date(now.getTime() - 6 * 3600000), mttr: 121, rootCause: "SSO certificate renewal caused token validation failure", assignee: "IBM AMS Team - App Tower" },
    { incidentId: "INC-2025-0835", severity: "sev3", title: "Prior Auth Workflow - Batch Processing Delay", affectedApplication: "Prior Authorization Workflow", status: "resolved", openedAt: new Date(now.getTime() - 24 * 3600000), resolvedAt: new Date(now.getTime() - 22 * 3600000), mttr: 98, rootCause: "Unoptimized SQL query causing full table scan on large datasets", assignee: "IBM AMS Team - App Tower" },
    { incidentId: "INC-2025-0831", severity: "sev4", title: "Data Warehouse - Nightly ETL Job Delayed", affectedApplication: "Data Warehouse / Reporting", status: "resolved", openedAt: new Date(now.getTime() - 48 * 3600000), resolvedAt: new Date(now.getTime() - 46 * 3600000), mttr: 87, rootCause: "Storage volume threshold exceeded; auto-cleanup resolved", assignee: "IBM AMS Team - Infra Tower" },
  ]);
  console.log("  incidents seeded");

  // Batch Jobs
  await db.delete(batchJobsTable);
  await db.insert(batchJobsTable).values([
    { jobId: "BJ-001", jobName: "Claims Nightly Adjudication Sweep", application: "Claims Adjudication Platform", status: "success", scheduledTime: "02:00", startTime: "02:01", endTime: "04:23", duration: 142, recordsProcessed: 87432 },
    { jobId: "BJ-002", jobName: "Member Eligibility 270/271 Batch", application: "Member Enrollment System", status: "success", scheduledTime: "03:00", startTime: "03:00", endTime: "04:48", duration: 108, recordsProcessed: 142841 },
    { jobId: "BJ-003", jobName: "EDI 835 Remittance Processing", application: "API Gateway / EDI Hub", status: "failed", scheduledTime: "05:00", startTime: "05:00", endTime: null, duration: null, recordsProcessed: 0 },
    { jobId: "BJ-004", jobName: "Premium Billing Cycle Run", application: "Billing & Premium System", status: "success", scheduledTime: "01:00", startTime: "01:02", endTime: "02:31", duration: 89, recordsProcessed: 412841 },
    { jobId: "BJ-005", jobName: "Provider Directory Sync", application: "Provider Portal", status: "success", scheduledTime: "04:00", startTime: "04:01", endTime: "04:47", duration: 46, recordsProcessed: 28741 },
    { jobId: "BJ-006", jobName: "Prior Auth Status Updates", application: "Prior Authorization Workflow", status: "success", scheduledTime: "06:00", startTime: "06:00", endTime: "06:28", duration: 28, recordsProcessed: 3241 },
    { jobId: "BJ-007", jobName: "DW Nightly ETL Load", application: "Data Warehouse / Reporting", status: "success", scheduledTime: "00:00", startTime: "00:03", endTime: "02:47", duration: 164, recordsProcessed: 2841720 },
    { jobId: "BJ-008", jobName: "Care Management Risk Stratification", application: "Care Management Platform", status: "success", scheduledTime: "07:00", startTime: "07:01", endTime: "08:12", duration: 71, recordsProcessed: 4287341 },
  ]);
  console.log("  batch_jobs seeded");

  // Interfaces
  await db.delete(interfacesTable);
  await db.insert(interfacesTable).values([
    { interfaceId: "IF-001", name: "EDI 837 Claims Intake", type: "EDI", sourceSystem: "Provider Portal", targetSystem: "Claims Adjudication Platform", status: "healthy", lastTransmission: new Date(now.getTime() - 15 * 60000), recordsToday: 87432, errorRate: 0.2 },
    { interfaceId: "IF-002", name: "EDI 835 Remittance", type: "EDI", sourceSystem: "Claims Adjudication Platform", targetSystem: "Banking / Clearinghouse", status: "failed", lastTransmission: new Date(now.getTime() - 95 * 60000), recordsToday: 0, errorRate: 100 },
    { interfaceId: "IF-003", name: "EDI 270/271 Eligibility", type: "EDI", sourceSystem: "Trading Partners", targetSystem: "Member Enrollment System", status: "healthy", lastTransmission: new Date(now.getTime() - 5 * 60000), recordsToday: 142841, errorRate: 0.1 },
    { interfaceId: "IF-004", name: "HL7 Clinical Data Feed", type: "HL7", sourceSystem: "Hospital EHR Systems", targetSystem: "Care Management Platform", status: "healthy", lastTransmission: new Date(now.getTime() - 8 * 60000), recordsToday: 28741, errorRate: 0.4 },
    { interfaceId: "IF-005", name: "Provider Directory API", type: "REST API", sourceSystem: "CAQH / Credentialing", targetSystem: "Provider Portal", status: "healthy", lastTransmission: new Date(now.getTime() - 2 * 60000), recordsToday: 8421, errorRate: 0.0 },
    { interfaceId: "IF-006", name: "Pharmacy PBM Interface", type: "NCPDP", sourceSystem: "Pharmacy PBM", targetSystem: "Member Portal", status: "degraded", lastTransmission: new Date(now.getTime() - 32 * 60000), recordsToday: 41284, errorRate: 3.8 },
    { interfaceId: "IF-007", name: "Medicare Part D Reporting", type: "CMS", sourceSystem: "Pharmacy Benefits Manager", targetSystem: "CMS Gateway", status: "healthy", lastTransmission: new Date(now.getTime() - 4 * 3600000), recordsToday: 12841, errorRate: 0.0 },
  ]);
  console.log("  interfaces seeded");

  // SLA Compliance
  await db.delete(slaComplianceTable);
  await db.insert(slaComplianceTable).values([
    { id: "sla-app", tower: "Application Support", target: 99.0, actual: 98.8, status: "at_risk", trend: "stable" },
    { id: "sla-db", tower: "Database Administration", target: 99.5, actual: 97.2, status: "breached", trend: "declining" },
    { id: "sla-int", tower: "Integration / Middleware", target: 99.5, actual: 96.8, status: "breached", trend: "declining" },
    { id: "sla-infra", tower: "Infrastructure", target: 99.5, actual: 99.8, status: "met", trend: "stable" },
    { id: "sla-sd", tower: "Service Desk", target: 98.0, actual: 98.7, status: "met", trend: "improving" },
    { id: "sla-sec", tower: "Security Operations", target: 99.9, actual: 99.9, status: "met", trend: "stable" },
    { id: "sla-net", tower: "Network Operations", target: 99.9, actual: 99.95, status: "met", trend: "improving" },
  ]);
  console.log("  sla_compliance seeded");

  // IBM AMS Runbooks
  await db.delete(ibmamsRunbooksTable);
  await db.insert(ibmamsRunbooksTable).values([
    { runbookId: "RB-001", name: "Auto-Restart Failed Batch Jobs", category: "Batch Operations", executionsToday: 14, successRate: 100, timeSavedHours: 5.6 },
    { runbookId: "RB-002", name: "DB Connection Pool Reset", category: "Database", executionsToday: 8, successRate: 100, timeSavedHours: 4.0 },
    { runbookId: "RB-003", name: "Log Cleanup & Archival", category: "Infrastructure", executionsToday: 24, successRate: 100, timeSavedHours: 3.6 },
    { runbookId: "RB-004", name: "EDI File Retry on Timeout", category: "Integration", executionsToday: 11, successRate: 90.9, timeSavedHours: 2.75 },
    { runbookId: "RB-005", name: "App Server Cache Flush", category: "Application", executionsToday: 7, successRate: 100, timeSavedHours: 1.75 },
    { runbookId: "RB-006", name: "Certificate Renewal Automation", category: "Security", executionsToday: 3, successRate: 100, timeSavedHours: 3.0 },
    { runbookId: "RB-007", name: "Claims Queue Health Check", category: "Application", executionsToday: 22, successRate: 100, timeSavedHours: 3.3 },
    { runbookId: "RB-008", name: "User Access Provisioning", category: "Identity Management", executionsToday: 0, successRate: 100, timeSavedHours: 0 },
  ]);
  console.log("  ibmams_runbooks seeded");

  // IBM AMS Savings Trend
  await db.delete(ibmamsSavingsTrendTable);
  const savMonths = ["Jan", "Feb", "Mar", "Apr"];
  await db.insert(ibmamsSavingsTrendTable).values(
    savMonths.map((month, i) => ({
      monthLabel: `${month} '25`,
      savings: 720000 + i * 48000 + (i * 12345 % 50000),
      avoidance: 1900000 + i * 120000 + (i * 23456 % 100000),
    }))
  );
  console.log("  ibmams_savings_trend seeded");

  // IBM AMS Ticket Trends (12 weeks)
  await db.delete(ibmamsTicketTrendsTable);
  const ticketRows = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (11 - i) * 7);
    const total = Math.max(500, 680 + (i * 23 % 180) - i * 8);
    const resolved = Math.floor(total * 0.93);
    const automated = Math.floor(total * (0.32 + i * 0.012));
    return {
      weekLabel: `Wk ${d.toLocaleDateString("en", { month: "short", day: "2-digit" })}`,
      total,
      resolvedWithinSla: Math.min(resolved, total),
      automated: Math.min(automated, resolved),
    };
  });
  await db.insert(ibmamsTicketTrendsTable).values(ticketRows);
  console.log("  ibmams_ticket_trends seeded");

  // Roadmap Initiatives
  await db.delete(roadmapInitiativesTable);
  await db.insert(roadmapInitiativesTable).values([
    { portfolio: "IT Infrastructure", product: "IBM ODM", application: "Process Automation Platform", initiativeType: "Upgrade", description: "IBM ODM upgrade from 8.9 to 9.2 for rules engine modernization", expectedOutcome: "40% improvement in rules processing speed; enhanced AI-assisted decision support", technology: "IBM ODM", currentVersion: "8.9", upgradeVersion: "9.2", jiraId: "WO-1001", serviceCategory: "Platform Upgrade", startDate: "2026-01-15", endDate: "2026-04-30", status: "Active", priority: "High", notes: "Phase 1 complete; UAT in progress. IBM delivery team engaged.", domain: "Enterprise Platforms", planYear: 1, planQuarter: "Q1", complexity: "High", businessImpact: "40% faster rules processing; foundation for cloud-native ODM migration", dependency: "" },
    { portfolio: "Enrollment & Eligibility", product: "WAM SSO", application: "WAM SSO Cloud Application", initiativeType: "Upgrade", description: "Angular framework upgrade from v12 to v17 for WAM SSO cloud application", expectedOutcome: "Enhanced security posture, improved performance, and modern UI component library", technology: "Angular", currentVersion: "12", upgradeVersion: "17", jiraId: "WO-1002", serviceCategory: "Application Modernization", startDate: "2026-02-01", endDate: "2026-05-31", status: "Active", priority: "High", notes: "Frontend components 60% migrated. SSO integration testing underway.", domain: "Digital", planYear: 1, planQuarter: "Q1", complexity: "Med", businessImpact: "Secure identity foundation; modern UX for 3,200+ internal users", dependency: "WO-1003" },
    { portfolio: "IT Infrastructure", product: "Internal Cloud Applications", application: "Multiple Cloud-Hosted Apps", initiativeType: "Upgrade", description: "Angular upgrade from v12 to v17 across 8 internal cloud-hosted applications", expectedOutcome: "Standardized framework version across portfolio; eliminated CVE-2022-25869 vulnerability class", technology: "Angular", currentVersion: "12", upgradeVersion: "17", jiraId: "WO-1003", serviceCategory: "Application Modernization", startDate: "2026-01-01", endDate: "2026-03-31", status: "Completed", priority: "Medium", notes: "All 8 applications successfully upgraded and deployed to production.", domain: "Enterprise Platforms", planYear: 1, planQuarter: "Q1", complexity: "Med", businessImpact: "Critical CVE class eliminated; unified framework baseline across portfolio", dependency: "" },
    { portfolio: "Finance & Billing", product: "Fee Schedule Repository", application: "Fee Schedule Repository", initiativeType: "Upgrade", description: ".NET framework upgrade from 4.8 to .NET 8.0 for fee schedule management system", expectedOutcome: "Improved processing performance, cross-platform support, LTS lifecycle through 2026", technology: ".NET", currentVersion: "4.8", upgradeVersion: "8.0", jiraId: "WO-1004", serviceCategory: "Platform Upgrade", startDate: "2026-04-01", endDate: "2026-07-31", status: "Planned", priority: "High", notes: "Architecture review completed. Development resources confirmed for Q2.", domain: "Payer", planYear: 1, planQuarter: "Q2", complexity: "Med", businessImpact: "LTS compliance; 25% fee processing performance gain; enables WO-1005", dependency: "" },
    { portfolio: "Finance & Billing", product: "GroupFee", application: "GroupFee Application", initiativeType: "Upgrade", description: ".NET framework upgrade from 4.8 to .NET 8.0 for group fee management", expectedOutcome: "Reduced maintenance cost; improved stability and application performance", technology: ".NET", currentVersion: "4.8", upgradeVersion: "8.0", jiraId: "WO-1005", serviceCategory: "Platform Upgrade", startDate: "2026-05-01", endDate: "2026-08-31", status: "Planned", priority: "Medium", notes: "Sequenced after Fee Schedule Repository completion. Shared codebase components to be reused.", domain: "Payer", planYear: 1, planQuarter: "Q3", complexity: "Low", businessImpact: "Shared codebase gains from WO-1004; 20% lower group fee maintenance cost", dependency: "WO-1004" },
    { portfolio: "IT Infrastructure", product: "NAR Platform", application: "NAR Windows Platform", initiativeType: "Upgrade", description: "NAR Windows Server platform upgrade from 2012 R2 to Windows Server 2022", expectedOutcome: "Extended support lifecycle, improved security posture, and modern hardware support", technology: "Windows Server", currentVersion: "2012 R2", upgradeVersion: "2022", jiraId: "WO-1006", serviceCategory: "Infrastructure", startDate: "2026-01-01", endDate: "2026-02-28", status: "Completed", priority: "High", notes: "Migration complete. Post-cutover monitoring closed with no critical incidents.", domain: "Enterprise Platforms", planYear: 1, planQuarter: "Q1", complexity: "Low", businessImpact: "End-of-life server risk eliminated; security posture hardened", dependency: "" },
    { portfolio: "Clinical Management", product: "CareRadius", application: "CareRadius Angular Frontend", initiativeType: "Upgrade", description: "CareRadius Angular framework upgrade from v11 to v17 across all clinical management modules", expectedOutcome: "Modern UI components, improved page load performance, enhanced maintainability for IBM team", technology: "Angular", currentVersion: "11", upgradeVersion: "17", jiraId: "WO-1007", serviceCategory: "Application Modernization", startDate: "2026-03-01", endDate: "2026-06-30", status: "Active", priority: "High", notes: "Module-by-module migration. Clinical workflows (intake, auth, care plan) migrated. Billing pending.", domain: "Clinical", planYear: 1, planQuarter: "Q2", complexity: "High", businessImpact: "Modern clinical UI; IBM team maintainability; unblocks WO-1008", dependency: "WO-1003" },
    { portfolio: "Clinical Management", product: "CareRadius", application: "CareRadius VB Legacy System", initiativeType: "Upgrade", description: "CareRadius Visual Basic 6 modernization to .NET 8 using IBM-led transformation methodology", expectedOutcome: "Elimination of VB6 runtime dependency; 60% reduction in legacy-related incident tickets", technology: "Visual Basic → .NET", currentVersion: "VB6", upgradeVersion: ".NET 8", jiraId: "WO-1008", serviceCategory: "Application Modernization", startDate: "2026-04-01", endDate: "2026-09-30", status: "Planned", priority: "High", notes: "Code analysis complete. 142K LOC identified. IBM Transformation Workbench tooling licensed.", domain: "Clinical", planYear: 1, planQuarter: "Q2", complexity: "High", businessImpact: "VB6 runtime EOL risk eliminated; 60% fewer legacy clinical incidents", dependency: "WO-1007" },
    { portfolio: "Clinical Management", product: "CareRadius", application: "CareRadius SAP BO Reporting", initiativeType: "Upgrade", description: "SAP BusinessObjects upgrade from 4.2 to 4.3 for CareRadius clinical reporting layer", expectedOutcome: "Improved report performance, new visualization capabilities, renewed vendor support", technology: "SAP BusinessObjects", currentVersion: "4.2", upgradeVersion: "4.3", jiraId: "WO-1009", serviceCategory: "Platform Upgrade", startDate: "2026-02-15", endDate: "2026-05-15", status: "Active", priority: "Medium", notes: "Crystal Reports migration 70% complete. Universe migration in progress.", domain: "Clinical", planYear: 1, planQuarter: "Q1", complexity: "Med", businessImpact: "Renewed SAP support; improved clinical reporting performance; new visualizations", dependency: "" },
    { portfolio: "Member Services", product: "Communication Services", application: "Communication Services Portal", initiativeType: "Upgrade", description: "Angular 12 to 17 upgrade for member communication and notification services portal", expectedOutcome: "Enhanced member notification capabilities, improved mobile responsiveness", technology: "Angular", currentVersion: "12", upgradeVersion: "17", jiraId: "WO-1010", serviceCategory: "Application Modernization", startDate: "2026-03-15", endDate: "2026-06-15", status: "Active", priority: "Medium", notes: "50% of components migrated. SMS and email notification modules complete.", domain: "Digital", planYear: 1, planQuarter: "Q2", complexity: "Low", businessImpact: "Enhanced member SMS/email reliability; mobile-responsive communication hub", dependency: "WO-1003" },
    { portfolio: "IT Infrastructure", product: "Doc Portal", application: "Document Management Portal", initiativeType: "Upgrade", description: "Doc Portal Angular framework upgrade from v13 to v17", expectedOutcome: "Modern document management, improved search and retrieval performance by 30%", technology: "Angular", currentVersion: "13", upgradeVersion: "17", jiraId: "WO-1011", serviceCategory: "Application Modernization", startDate: "2026-05-01", endDate: "2026-08-01", status: "Planned", priority: "Medium", notes: "Dependency mapping and component inventory complete.", domain: "Enterprise Platforms", planYear: 1, planQuarter: "Q3", complexity: "Low", businessImpact: "30% faster document retrieval; modern content search capabilities", dependency: "" },
    { portfolio: "IT Infrastructure", product: "Horizon ECM", application: "Horizon ECM Platform", initiativeType: "Upgrade", description: "Horizon ECM Angular upgrade from v12 to v17 for enterprise content management", expectedOutcome: "Improved content workflow capabilities, modern security standards compliance", technology: "Angular", currentVersion: "12", upgradeVersion: "17", jiraId: "WO-1012", serviceCategory: "Application Modernization", startDate: "2026-06-01", endDate: "2026-09-30", status: "Planned", priority: "Medium", notes: "ECM team engaged. Scope and resource plan finalized.", domain: "Enterprise Platforms", planYear: 1, planQuarter: "Q3", complexity: "Med", businessImpact: "Modern content workflow; HIPAA-compliant ECM security posture", dependency: "" },
    { portfolio: "Analytics & Reporting", product: "Cognos BI", application: "Cognos Business Intelligence Platform", initiativeType: "Upgrade", description: "IBM Cognos Business Intelligence platform upgrade from 11.1 to 12.0", expectedOutcome: "Enhanced analytics, AI-assisted insights, improved cloud connectivity and dashboard performance", technology: "IBM Cognos", currentVersion: "11.1", upgradeVersion: "12.0", jiraId: "WO-1013", serviceCategory: "Platform Upgrade", startDate: "2026-01-01", endDate: "2026-03-15", status: "Completed", priority: "High", notes: "Production upgrade complete. End-user training delivered to 240 report consumers.", domain: "Data & Analytics", planYear: 1, planQuarter: "Q1", complexity: "High", businessImpact: "AI-assisted insights for 240 report consumers; cloud connectivity unlocked; foundation for WO-3013", dependency: "" },
    { portfolio: "Analytics & Reporting", product: "Tableau", application: "Tableau Analytics Platform", initiativeType: "Upgrade", description: "Tableau platform upgrade from 2022.3 to 2024.1 for enhanced data visualization", expectedOutcome: "New visualization types, Pulse AI analytics integration, improved extract performance", technology: "Tableau", currentVersion: "2022.3", upgradeVersion: "2024.1", jiraId: "WO-1014", serviceCategory: "Platform Upgrade", startDate: "2026-01-15", endDate: "2026-03-31", status: "Completed", priority: "Medium", notes: "Live in production. Pulse AI feature rollout in progress for executive dashboards.", domain: "Data & Analytics", planYear: 1, planQuarter: "Q1", complexity: "Low", businessImpact: "Pulse AI analytics for executives; improved extract throughput; prepares for WO-3013", dependency: "" },
    { portfolio: "Enrollment & Eligibility", product: "Membership System", application: "New Membership System", initiativeType: "Upgrade", description: "New Membership System technology modernization from legacy COBOL/mainframe to cloud-native microservices architecture", expectedOutcome: "50% reduction in processing time; real-time eligibility verification; 99.99% availability SLA", technology: "COBOL → Cloud Native", currentVersion: "Legacy Mainframe", upgradeVersion: "Cloud Microservices", jiraId: "WO-1015", serviceCategory: "Application Modernization", startDate: "2026-01-01", endDate: "2026-12-31", status: "Active", priority: "High", notes: "Phase 1 of 4 complete. Enrollment service APIs live. Claims integration Phase 2 underway.", domain: "Payer", planYear: 1, planQuarter: "Q1", complexity: "High", businessImpact: "50% faster eligibility processing; real-time verification; 99.99% SLA", dependency: "" },
    { portfolio: "Analytics & Reporting", product: "MPD Mainframe Extracts", application: "MPD Data Extract Pipeline", initiativeType: "Upgrade", description: "MPD Mainframe Extracts modernization from COBOL batch processing to modern ETL pipelines", expectedOutcome: "Near real-time data availability; reduced batch windows from 6hrs to 45min; improved data quality", technology: "COBOL → Apache Airflow", currentVersion: "COBOL Batch", upgradeVersion: "Modern ETL", jiraId: "WO-1016", serviceCategory: "Data & Analytics", startDate: "2026-04-01", endDate: "2026-08-31", status: "Planned", priority: "Medium", notes: "Data flow analysis and lineage documentation complete. Airflow environment provisioned.", domain: "Data & Analytics", planYear: 1, planQuarter: "Q2", complexity: "Med", businessImpact: "Batch window 6hrs→45min; near real-time reporting; improved data lineage", dependency: "" },
    { portfolio: "Enrollment & Eligibility", product: "Route Code Eligibility", application: "Route Code Eligibility System", initiativeType: "Upgrade", description: "Route Code Eligibility system upgrade from legacy file-based routing to API-driven architecture", expectedOutcome: "Real-time eligibility routing; reduced manual intervention; improved partner connectivity", technology: "Legacy → REST API", currentVersion: "Legacy File-Based", upgradeVersion: "REST API", jiraId: "WO-1017", serviceCategory: "Application Modernization", startDate: "2026-07-01", endDate: "2026-10-31", status: "Planned", priority: "Medium", notes: "API design phase scheduled. Partner integration catalog in progress.", domain: "Payer", planYear: 1, planQuarter: "Q3", complexity: "Med", businessImpact: "Real-time partner routing; manual intervention eliminated; partner SLA improvement", dependency: "" },
    { portfolio: "Enrollment & Eligibility", product: "EDI Eligibility Data Store", application: "EDI Eligibility Data Store", initiativeType: "Upgrade", description: "EDI Eligibility Data Store upgrade to support X12 278 prior authorization transaction alongside X12 270", expectedOutcome: "Expanded trading partner support; reduced eligibility disputes by 25%", technology: "EDI X12", currentVersion: "270 Only", upgradeVersion: "270 + 278", jiraId: "WO-1018", serviceCategory: "Data & Analytics", startDate: "2026-07-15", endDate: "2026-11-30", status: "Planned", priority: "Low", notes: "Regulatory compliance review pending. Trading partner communication plan to be drafted.", domain: "Payer", planYear: 1, planQuarter: "Q4", complexity: "Low", businessImpact: "25% fewer eligibility disputes; expanded X12 278 partner support", dependency: "" },
    { portfolio: "Enrollment & Eligibility", product: "Consumer Data Management", application: "Consumer Data Management Portal", initiativeType: "Upgrade", description: "Consumer Data Management portal Angular upgrade from v11 to v17", expectedOutcome: "Improved consumer-facing self-service capabilities, modern accessibility standards (WCAG 2.1)", technology: "Angular", currentVersion: "11", upgradeVersion: "17", jiraId: "WO-1019", serviceCategory: "Application Modernization", startDate: "2026-08-01", endDate: "2026-11-30", status: "Planned", priority: "Low", notes: "Queued for H2 2026. UX design refresh to be included.", domain: "Digital", planYear: 1, planQuarter: "Q4", complexity: "Low", businessImpact: "WCAG 2.1 compliance; modern consumer self-service; accessibility risk eliminated", dependency: "WO-1003" },
    { portfolio: "Enrollment & Eligibility", product: "Personal Representative Mgmt", application: "Horizon Personal Representative Management System", initiativeType: "Upgrade", description: ".NET 4.7 to .NET 8.0 upgrade for Personal Representative management system", expectedOutcome: "Long-term platform support through 2029; improved performance; security compliance", technology: ".NET", currentVersion: "4.7", upgradeVersion: "8.0", jiraId: "WO-1020", serviceCategory: "Platform Upgrade", startDate: "2026-09-01", endDate: "2026-12-15", status: "Planned", priority: "Low", notes: "Scope assessment complete. Queued for Q4 development sprint.", domain: "Payer", planYear: 1, planQuarter: "Q4", complexity: "Low", businessImpact: "LTS support through 2029; security compliance; no service interruption risk", dependency: "" },
    { portfolio: "Enrollment & Eligibility", product: "NASCO", application: "NASCO Enrollment and Claims Platform", initiativeType: "Upgrade", description: "NASCO platform upgrade from version 14 to 16 for enrollment and claims processing", expectedOutcome: "Enhanced NASCO feature set; improved SLA compliance for eligibility transactions; HIPAA 2024 alignment", technology: "NASCO", currentVersion: "14", upgradeVersion: "16", jiraId: "WO-1021", serviceCategory: "Platform Upgrade", startDate: "2026-05-01", endDate: "2026-09-30", status: "Planned", priority: "High", notes: "Vendor coordination in progress. NASCO technical review scheduled for April.", domain: "Payer", planYear: 1, planQuarter: "Q2", complexity: "High", businessImpact: "HIPAA 2024 alignment; improved eligibility SLA; expanded NASCO feature set", dependency: "" },
    { portfolio: "Finance & Billing", product: "Legacy Finance Platform", application: "Finance Core Systems", initiativeType: "Upgrade", description: "Legacy Finance platform upgrade from .NET 3.5 to .NET 8.0 across 5 financial management modules", expectedOutcome: "Elimination of unsupported .NET 3.5 runtime; 35% improvement in financial processing throughput", technology: ".NET", currentVersion: "3.5", upgradeVersion: "8.0", jiraId: "WO-1022", serviceCategory: "Platform Upgrade", startDate: "2026-06-01", endDate: "2026-10-31", status: "Planned", priority: "High", notes: "Impact assessment underway. Finance and IBM teams aligned on modernization approach.", domain: "Payer", planYear: 1, planQuarter: "Q3", complexity: "High", businessImpact: "EOL .NET 3.5 eliminated; 35% financial throughput improvement", dependency: "" },
    { portfolio: "Finance & Billing", product: "Universal Payment System", application: "Universal Payment System (UPS)", initiativeType: "Upgrade", description: "Universal Payment System upgrade from 2.1 to 3.0 with PCI DSS 4.0 compliance enhancements", expectedOutcome: "PCI DSS 4.0 compliance; improved payment processing reliability and audit trail", technology: "UPS Platform", currentVersion: "2.1", upgradeVersion: "3.0", jiraId: "WO-1023", serviceCategory: "Platform Upgrade", startDate: "2026-02-01", endDate: "2026-05-31", status: "Active", priority: "High", notes: "PCI DSS gap assessment complete. Tokenization enhancements in development.", domain: "Payer", planYear: 1, planQuarter: "Q1", complexity: "High", businessImpact: "PCI DSS 4.0 compliance; full payment audit trail; tokenization security", dependency: "" },
    { portfolio: "IT Infrastructure", product: "Image Plus", application: "Image Plus Document Imaging", initiativeType: "Upgrade", description: "Image Plus document imaging platform upgrade from version 7 to 9", expectedOutcome: "Improved document processing speed; enhanced OCR accuracy; vendor support renewal", technology: "Image Plus", currentVersion: "7", upgradeVersion: "9", jiraId: "WO-1024", serviceCategory: "Infrastructure", startDate: "2026-03-01", endDate: "2026-05-31", status: "Active", priority: "Medium", notes: "Integration testing phase. OCR model training on Horizon-specific document types complete.", domain: "Enterprise Platforms", planYear: 1, planQuarter: "Q1", complexity: "Low", businessImpact: "OCR accuracy improvement; vendor support renewed; document processing speed", dependency: "" },
    { portfolio: "Finance & Billing", product: "Financial Reporting Suite", application: "Chargeback / EDW / SPS / MHP / Worker Comp", initiativeType: "Upgrade", description: "Coordinated upgrade of Chargeback, EDW, SPS, MHP, and Worker Comp systems across .NET, jQuery, and SQL Server", expectedOutcome: "Unified technology stack; reduced cross-system integration risk; 20% lower maintenance cost", technology: ".NET / jQuery / SQL Server", currentVersion: "Mixed Versions", upgradeVersion: "Standardized Stack", jiraId: "WO-1025", serviceCategory: "Platform Upgrade", startDate: "2026-08-01", endDate: "2026-12-31", status: "Planned", priority: "High", notes: "Program charter approved. Multi-team coordination plan finalized.", domain: "Payer", planYear: 1, planQuarter: "Q4", complexity: "High", businessImpact: "Unified financial stack; 20% maintenance cost reduction; integration risk eliminated", dependency: "" },
    { portfolio: "Enrollment & Eligibility", product: "IDR System", application: "Identity Resolution System", initiativeType: "Ticket Reduction", description: "Automation of IDR update process for SSN randomization edge cases to eliminate manual review queue", expectedOutcome: "Reduction of ~120 monthly tickets; 100% automation of SSN randomization case updates", technology: "IBM RPA", currentVersion: "", upgradeVersion: "", jiraId: "WO-2001", serviceCategory: "Automation", startDate: "2026-01-15", endDate: "2026-03-15", status: "Completed", priority: "High", notes: "Automation live since March 15. Ticket volume reduced 94% in first 30-day window.", domain: "Payer", planYear: 1, planQuarter: "Q1", complexity: "Low", businessImpact: "120 monthly tickets eliminated; 94% reduction achieved in production", dependency: "" },
    { portfolio: "Enrollment & Eligibility", product: "HMU", application: "Health Management Utility", initiativeType: "Ticket Reduction", description: "Enhance HMU design to ensure accurate snapshot timestamp recording for member health records", expectedOutcome: "Elimination of ~85 monthly data discrepancy tickets related to timestamp inaccuracies", technology: "Java / Spring Boot", currentVersion: "", upgradeVersion: "", jiraId: "WO-2002", serviceCategory: "Quality Improvement", startDate: "2026-02-01", endDate: "2026-04-30", status: "Active", priority: "Medium", notes: "Design changes complete. UAT running with enrollment operations team.", domain: "Payer", planYear: 1, planQuarter: "Q1", complexity: "Low", businessImpact: "85 monthly discrepancy tickets eliminated; member record accuracy improved", dependency: "" },
    { portfolio: "Finance & Billing", product: "Billing Portal", application: "Billing Analyst Workbench", initiativeType: "Ticket Reduction", description: "Self-service solution enabling billing analysts to perform standard premium adjustments without IT ticket submission", expectedOutcome: "~200 monthly tickets reduced; 2-day SLA improvement for billing resolution", technology: "React / Node.js", currentVersion: "", upgradeVersion: "", jiraId: "WO-2003", serviceCategory: "Operational Efficiency", startDate: "2026-02-15", endDate: "2026-05-31", status: "Active", priority: "High", notes: "Phase 1 self-service features live. 35 billing analysts onboarded.", domain: "Payer", planYear: 1, planQuarter: "Q1", complexity: "Med", businessImpact: "200 monthly tickets eliminated; 2-day SLA gain; 35 analysts self-sufficient", dependency: "" },
    { portfolio: "Analytics & Reporting", product: "Data Load Pipeline", application: "ETL Data Load System", initiativeType: "Ticket Reduction", description: "Reduce data load anomalies through improved validation rules, reconciliation alerts, and root cause monitoring dashboards", expectedOutcome: "60% reduction in data load anomaly tickets across 12 reporting systems", technology: "Python / Apache Airflow", currentVersion: "", upgradeVersion: "", jiraId: "WO-2004", serviceCategory: "Data & Analytics", startDate: "2026-01-01", endDate: "2026-03-31", status: "Completed", priority: "High", notes: "Validation framework deployed. Monitoring dashboards live in Grafana.", domain: "Data & Analytics", planYear: 1, planQuarter: "Q1", complexity: "Low", businessImpact: "60% data load anomaly reduction across 12 systems; Grafana monitoring live", dependency: "" },
    { portfolio: "Claims Processing", product: "Claims Audit Engine", application: "Claims Comparison Engine", initiativeType: "Ticket Reduction", description: "Automate comparison of claims, EOB, and EOP data to detect discrepancies before manual audit escalation", expectedOutcome: "~150 monthly audit exception tickets eliminated through automated daily reconciliation", technology: "IBM RPA / Python", currentVersion: "", upgradeVersion: "", jiraId: "WO-2005", serviceCategory: "Automation", startDate: "2026-01-15", endDate: "2026-04-15", status: "Active", priority: "High", notes: "Reconciliation engine in production pilot with claims operations. Accuracy rate 97.2%.", domain: "Payer", planYear: 1, planQuarter: "Q1", complexity: "Med", businessImpact: "150 monthly audit tickets eliminated; 97.2% automated reconciliation accuracy", dependency: "" },
    { portfolio: "IT Infrastructure", product: "API Management", application: "API Gateway Platform", initiativeType: "Ticket Reduction", description: "API coverage cleanup: consolidate redundant endpoints, improve documentation, and implement health monitoring", expectedOutcome: "~75 monthly API support tickets reduced; improved developer self-service", technology: "API Gateway / OpenAPI", currentVersion: "", upgradeVersion: "", jiraId: "WO-2006", serviceCategory: "Quality Improvement", startDate: "2026-03-01", endDate: "2026-06-30", status: "Active", priority: "Low", notes: "API inventory complete. 340 endpoints catalogued. Documentation portal in build.", domain: "Enterprise Platforms", planYear: 1, planQuarter: "Q2", complexity: "Low", businessImpact: "75 monthly API tickets reduced; 340 endpoints catalogued; developer self-service", dependency: "" },
    { portfolio: "IT Infrastructure", product: "File Processing Service", application: "Multi-File Merge Service", initiativeType: "Ticket Reduction", description: "Automate multi-file checking and merge process for batch integrations to eliminate manual validation handling", expectedOutcome: "~60 monthly operations tickets eliminated; 4-hour reduction in batch processing window", technology: "Python / Shell", currentVersion: "", upgradeVersion: "", jiraId: "WO-2007", serviceCategory: "Automation", startDate: "2026-02-01", endDate: "2026-03-31", status: "Completed", priority: "Medium", notes: "Automation deployed to production. Handling 2,400 file merges daily without incidents.", domain: "Enterprise Platforms", planYear: 1, planQuarter: "Q1", complexity: "Low", businessImpact: "60 operations tickets gone; 4hr batch window reduction; 2,400 daily merges automated", dependency: "" },
    { portfolio: "Member Services", product: "Broker Sales Portal", application: "Broker Sales Portal", initiativeType: "Ticket Reduction", description: "Sales portal enhancement for subgroup billing and eligibility edge case scenarios", expectedOutcome: "~90 monthly portal support tickets reduced for complex subgroup configurations", technology: "Angular / Java", currentVersion: "", upgradeVersion: "", jiraId: "WO-2008", serviceCategory: "Operational Efficiency", startDate: "2026-04-01", endDate: "2026-07-31", status: "Planned", priority: "Medium", notes: "Requirements gathered from 12 sales operations stakeholders. Design complete.", domain: "Digital", planYear: 1, planQuarter: "Q2", complexity: "Low", businessImpact: "90 broker support tickets reduced; subgroup edge cases self-served", dependency: "" },
    { portfolio: "Enrollment & Eligibility", product: "Member Enrollment System", application: "Online Enrollment Portal", initiativeType: "Ticket Reduction", description: "Real-time address validation at point of enrollment entry using USPS Address API", expectedOutcome: "~110 monthly enrollment error tickets reduced; 15% improvement in clean enrollment submissions", technology: "USPS API / React", currentVersion: "", upgradeVersion: "", jiraId: "WO-2009", serviceCategory: "Quality Improvement", startDate: "2026-04-15", endDate: "2026-07-15", status: "Planned", priority: "High", notes: "USPS API integration contract reviewed. Development kick-off scheduled April 15.", domain: "Payer", planYear: 1, planQuarter: "Q2", complexity: "Low", businessImpact: "110 enrollment tickets reduced; 15% clean submission improvement; USPS validation at point of entry", dependency: "" },
    { portfolio: "IT Infrastructure", product: "ChatOps Platform", application: "BOE / SSIS / XACT Monitoring", initiativeType: "Ticket Reduction", description: "ChatOps integration for BOE, SSIS, and XACT incident reporting and automated triage", expectedOutcome: "~130 monthly operational incident tickets consolidated; MTTR reduced by 40%", technology: "Slack / PagerDuty", currentVersion: "", upgradeVersion: "", jiraId: "WO-2010", serviceCategory: "Automation", startDate: "2026-05-01", endDate: "2026-07-31", status: "Planned", priority: "Medium", notes: "Tool selection finalized. IBM AMS team to lead implementation.", domain: "Enterprise Platforms", planYear: 1, planQuarter: "Q2", complexity: "Med", businessImpact: "130 incident tickets consolidated; 40% MTTR reduction; automated triage", dependency: "" },
    { portfolio: "Claims Processing", product: "Authorization Integration", application: "Prior Authorization Platform", initiativeType: "Ticket Reduction", description: "Cross-system collaboration with integrating partners to prevent upstream authorization processing errors", expectedOutcome: "~95 monthly authorization error tickets prevented through partner validation improvements", technology: "SOAP / REST APIs", currentVersion: "", upgradeVersion: "", jiraId: "WO-2011", serviceCategory: "Quality Improvement", startDate: "2026-03-01", endDate: "2026-06-30", status: "Active", priority: "High", notes: "Root cause analysis complete with 3 partner systems. Code changes in 2 systems deployed.", domain: "Clinical", planYear: 1, planQuarter: "Q2", complexity: "Med", businessImpact: "95 auth error tickets prevented; partner validation at source; member care uninterrupted", dependency: "" },
    { portfolio: "Enrollment & Eligibility", product: "Member Data Hub", application: "Member Master Record System", initiativeType: "Ticket Reduction", description: "Cross-system master data governance collaboration to reduce member data discrepancy incidents at source systems", expectedOutcome: "~180 monthly member discrepancy tickets reduced through MDM-level governance", technology: "MDM Platform", currentVersion: "", upgradeVersion: "", jiraId: "WO-2012", serviceCategory: "Quality Improvement", startDate: "2026-02-01", endDate: "2026-05-31", status: "At Risk", priority: "High", notes: "At Risk: downstream system coordination delayed 3 weeks due to source system freeze. Recovery plan in place.", domain: "Payer", planYear: 1, planQuarter: "Q1", complexity: "High", businessImpact: "180 monthly discrepancy tickets reduced through MDM governance at source", dependency: "" },
    { portfolio: "Claims Processing", product: "MPV Processing", application: "Multi-Plan Verification System", initiativeType: "Ticket Reduction", description: "Automate reprocessing of failed MPV records to eliminate manual IT intervention and requeue tickets", expectedOutcome: "~70 monthly reprocessing tickets eliminated; 78% reduction achieved in pilot", technology: "Python / SQL Server", currentVersion: "", upgradeVersion: "", jiraId: "WO-2013", serviceCategory: "Automation", startDate: "2026-01-01", endDate: "2026-02-28", status: "Completed", priority: "Medium", notes: "Auto-retry logic deployed to production. Monitoring shows 78% ticket reduction sustained.", domain: "Payer", planYear: 1, planQuarter: "Q1", complexity: "Low", businessImpact: "70 reprocessing tickets eliminated; 78% reduction sustained in production", dependency: "" },
    { portfolio: "Member Services", product: "Survey Platform", application: "Member Satisfaction Survey System", initiativeType: "Ticket Reduction", description: "Enhanced structured logging to proactively detect and resolve survey delivery and completion failures", expectedOutcome: "~45 monthly survey issue tickets resolved proactively through monitoring alerts", technology: "ELK Stack (Elasticsearch / Kibana)", currentVersion: "", upgradeVersion: "", jiraId: "WO-2014", serviceCategory: "Quality Improvement", startDate: "2026-05-01", endDate: "2026-07-31", status: "Planned", priority: "Low", notes: "Logging requirements defined. ELK dashboard templates designed.", domain: "Digital", planYear: 1, planQuarter: "Q2", complexity: "Low", businessImpact: "45 survey tickets proactively resolved before member impact", dependency: "" },
    { portfolio: "Enrollment & Eligibility", product: "Membership Workflow Engine", application: "Member Data Update System", initiativeType: "Ticket Reduction", description: "Queue optimization and priority-based scheduling for database update requests in membership workflows", expectedOutcome: "~65 monthly database update delay tickets eliminated through queue management improvements", technology: "Java / Apache Kafka", currentVersion: "", upgradeVersion: "", jiraId: "WO-2015", serviceCategory: "Operational Efficiency", startDate: "2026-04-01", endDate: "2026-06-30", status: "Planned", priority: "Medium", notes: "Architecture design complete. Kafka topic design reviewed with platform team.", domain: "Payer", planYear: 1, planQuarter: "Q2", complexity: "Med", businessImpact: "65 update delay tickets eliminated; Kafka-based priority scheduling", dependency: "" },
    { portfolio: "Member Services", product: "IVR Platform", application: "CPL IVR Configuration System", initiativeType: "Ticket Reduction", description: "Automate loading of CPL (Coverage and Plan List) data into IVR system configuration", expectedOutcome: "~55 monthly IVR configuration tickets eliminated; real-time plan data in IVR", technology: "IVR / Python", currentVersion: "", upgradeVersion: "", jiraId: "WO-2016", serviceCategory: "Automation", startDate: "2026-06-01", endDate: "2026-08-31", status: "Planned", priority: "Medium", notes: "IVR vendor API documentation received. Integration design underway.", domain: "Digital", planYear: 1, planQuarter: "Q3", complexity: "Low", businessImpact: "55 IVR config tickets eliminated; real-time plan data in member IVR", dependency: "" },
    { portfolio: "Finance & Billing", product: "Premium Rating Engine", application: "Premium Rating System", initiativeType: "Ticket Reduction", description: "Vendor coordination to implement upstream validation improvements reducing rate-member mismatch incidents", expectedOutcome: "~80 monthly rating mismatch tickets reduced through vendor data quality enhancements", technology: "Rating Engine APIs", currentVersion: "", upgradeVersion: "", jiraId: "WO-2017", serviceCategory: "Operational Efficiency", startDate: "2026-03-01", endDate: "2026-06-30", status: "At Risk", priority: "High", notes: "At Risk: Vendor response to technical requirements delayed 3 weeks. Escalation to vendor account team initiated.", domain: "Payer", planYear: 1, planQuarter: "Q2", complexity: "Med", businessImpact: "80 monthly mismatch tickets reduced; vendor data quality enforced upstream", dependency: "" },
    { portfolio: "Claims Processing", product: "Claims Adjudication", application: "Claims Processing System", initiativeType: "Ticket Reduction", description: "Structured training program for tier-1 support to reduce unnecessary claims processing escalation tickets", expectedOutcome: "~100 monthly escalation tickets reduced through knowledge transfer; 20% improvement in first-call resolution", technology: "LMS / Training Platform", currentVersion: "", upgradeVersion: "", jiraId: "WO-2018", serviceCategory: "Operational Efficiency", startDate: "2026-01-15", endDate: "2026-03-15", status: "Completed", priority: "Low", notes: "3 training cohorts completed. 85 support staff certified. Knowledge base articles published.", domain: "Payer", planYear: 1, planQuarter: "Q1", complexity: "Low", businessImpact: "100 escalation tickets reduced; 85 staff certified; 20% first-call resolution gain", dependency: "WO-2005" },
    { portfolio: "Member Services", product: "Broker Management Portal", application: "Broker Self-Service Portal", initiativeType: "Ticket Reduction", description: "Enhanced broker portal screens for policy and enrollment updates to reduce manual IBM AMS team intervention", expectedOutcome: "~90 monthly manual broker update tickets eliminated through broker self-service portal enhancements", technology: "Angular / Java", currentVersion: "", upgradeVersion: "", jiraId: "WO-2019", serviceCategory: "Automation", startDate: "2026-07-01", endDate: "2026-10-31", status: "Planned", priority: "Medium", notes: "UX design complete. Developer resources allocated for Q3.", domain: "Digital", planYear: 1, planQuarter: "Q3", complexity: "Med", businessImpact: "90 broker update tickets eliminated; IBM AMS team capacity freed for value-add work", dependency: "WO-2008" },
    { portfolio: "Finance & Billing", product: "SHBS-UPS", application: "SHBS-UPS MS Access System", initiativeType: "Transformation", description: "SHBS-UPS modernization from MS Access 2016 to cloud-hosted web application with multi-user support and audit trails", expectedOutcome: "Elimination of MS Access dependency; multi-user concurrent access; full audit trail compliance", technology: "MS Access → React / Node.js", currentVersion: "MS Access 2016", upgradeVersion: "Cloud Web Application", jiraId: "WO-3001", serviceCategory: "Application Modernization", startDate: "2028-01-01", endDate: "2028-09-30", status: "Planned", priority: "Medium", notes: "Sequenced as Year 3 initiative after integration hub foundation established.", domain: "Payer", planYear: 3, planQuarter: "Q1", complexity: "High", businessImpact: "MS Access dependency eliminated; multi-user concurrent access; full audit compliance", dependency: "WO-3009" },
    { portfolio: "Enterprise Operations", product: "CareOps360", application: "CareOps360 Executive Command Center", initiativeType: "Transformation", description: "Real-time executive operations portal providing unified visibility across claims, eligibility, provider, finance, and IBM AMS operations for Horizon BCBS leadership", expectedOutcome: "90% reduction in executive reporting cycle time; real-time operational decision support; unified IBM-Horizon leadership dashboard", technology: "React / Node.js / PostgreSQL", currentVersion: "", upgradeVersion: "CareOps360 v1.0", jiraId: "WO-3002", serviceCategory: "Digital Transformation", startDate: "2026-01-01", endDate: "2026-06-30", status: "Active", priority: "High", notes: "Phase 1 delivered. Live in production for executive leadership. Iterative feature releases in progress.", domain: "Enterprise Platforms", planYear: 1, planQuarter: "Q1", complexity: "High", businessImpact: "Real-time executive visibility; 90% faster reporting cycle; unified IBM-Horizon command surface", dependency: "" },
    { portfolio: "Enterprise Operations", product: "IBM BAW", application: "Intelligent Process Orchestration Platform", initiativeType: "Transformation", description: "IBM Business Automation Workflow uplift to orchestrate claims exceptions, prior auth escalations, and provider credentialing workflows with low-code automation and human-in-the-loop routing", expectedOutcome: "80% reduction in manual workflow handling time; full audit trail for regulated workflows; scalable to 20+ process domains", technology: "IBM BAW / CP4BA", currentVersion: "", upgradeVersion: "BAW 23.0", jiraId: "WO-3003", serviceCategory: "Intelligent Automation", startDate: "2026-04-01", endDate: "2026-09-30", status: "Active", priority: "High", notes: "BAW environment provisioned. Claims exception workflow pilot underway with operations team.", domain: "Enterprise Platforms", planYear: 1, planQuarter: "Q2", complexity: "Med", businessImpact: "80% manual workflow reduction; scalable to 20+ process domains; regulated audit trail", dependency: "WO-1001" },
    { portfolio: "Enrollment & Eligibility", product: "IKA", application: "IKA Eligibility Processing Automation", initiativeType: "Transformation", description: "Transform IKA legacy eligibility file processing from manual batch intervention to fully automated, exception-driven pipeline with real-time monitoring", expectedOutcome: "Straight-through processing for 95% of eligibility transactions; manual intervention reduced to exception-only; processing time 4hrs→20min", technology: "Python / Apache Kafka / IBM RPA", currentVersion: "", upgradeVersion: "Automated Pipeline", jiraId: "WO-3004", serviceCategory: "Intelligent Automation", startDate: "2026-01-01", endDate: "2026-04-30", status: "Planned", priority: "Medium", notes: "Process discovery workshop complete. Exception taxonomy defined with enrollment operations.", domain: "Payer", planYear: 1, planQuarter: "Q1", complexity: "Low", businessImpact: "95% straight-through eligibility; processing time 4hrs→20min; manual exceptions only", dependency: "" },
    { portfolio: "Finance & Billing", product: "HVCPS", application: "HVCPS Capitation Payment Automation", initiativeType: "Transformation", description: "Modernize HVCPS capitation payment processing from semi-manual reconciliation to fully automated calculation, validation, and remittance workflow", expectedOutcome: "99.9% payment calculation accuracy; auto-reconciliation eliminating manual review; remittance time reduced from 5 days to same-day", technology: "Java / Spring Boot / IBM ODM", currentVersion: "", upgradeVersion: "Automated Capitation Engine", jiraId: "WO-3005", serviceCategory: "Intelligent Automation", startDate: "2026-05-01", endDate: "2026-09-30", status: "Planned", priority: "High", notes: "Payment calculation logic documented. IBM ODM rules model in design.", domain: "Payer", planYear: 1, planQuarter: "Q2", complexity: "Low", businessImpact: "99.9% payment accuracy; 5-day→same-day remittance; provider satisfaction improvement", dependency: "WO-1001" },
    { portfolio: "Analytics & Reporting", product: "OnDemand", application: "OnDemand Self-Service Reporting Portal", initiativeType: "Transformation", description: "Transform OnDemand financial reporting from IT-delivered batch reports to an executive self-service portal with ad-hoc query, scheduling, and export capabilities", expectedOutcome: "Report delivery from 48hrs to real-time self-service; 80% reduction in IT reporting tickets; 300+ reports migrated to self-service", technology: "React / Node.js / IBM Cognos", currentVersion: "", upgradeVersion: "Self-Service Portal", jiraId: "WO-3006", serviceCategory: "Digital Transformation", startDate: "2026-07-01", endDate: "2026-12-31", status: "Planned", priority: "Medium", notes: "Report catalog inventory complete. 312 reports identified; 180 prioritized for self-service migration.", domain: "Data & Analytics", planYear: 1, planQuarter: "Q3", complexity: "Med", businessImpact: "Report delivery 48hrs→real-time; 80% IT reporting ticket reduction; 300+ reports self-served", dependency: "WO-1013" },
    { portfolio: "Member Services", product: "HLGS", application: "HLGS Letter Generation Cloud Migration", initiativeType: "Transformation", description: "Migrate Horizon Letter Generation System (HLGS) from on-premise mainframe batch to cloud-hosted, API-driven letter generation with multi-channel delivery (print, email, portal)", expectedOutcome: "40% letter generation cost reduction; multi-channel delivery capability; real-time letter status tracking; vendor SLA enforcement", technology: "Cloud Platform / Java / REST APIs", currentVersion: "On-Premise Mainframe", upgradeVersion: "Cloud API Platform", jiraId: "WO-3007", serviceCategory: "Application Modernization", startDate: "2026-07-01", endDate: "2026-12-31", status: "Planned", priority: "High", notes: "Cloud vendor selected. Architecture design in progress with IBM cloud team.", domain: "Digital", planYear: 1, planQuarter: "Q3", complexity: "High", businessImpact: "40% letter cost reduction; multi-channel delivery; real-time status tracking; enables WO-3012", dependency: "" },
    { portfolio: "Provider Management", product: "IPA", application: "IPA Provider Audit Self-Service Platform", initiativeType: "Transformation", description: "Transform IPA (Individual Practice Association) provider audit process from manual IBM AMS team intervention to a self-service portal enabling providers to submit, track, and resolve audit findings independently", expectedOutcome: "Provider audit cycle time 30→10 days; 60% manual effort reduction; provider satisfaction improvement; full audit trail", technology: "React / Node.js / IBM BPM", currentVersion: "", upgradeVersion: "Provider Self-Service Portal", jiraId: "WO-3008", serviceCategory: "Digital Transformation", startDate: "2026-10-01", endDate: "2027-03-31", status: "Planned", priority: "Medium", notes: "Provider journey mapping workshop complete. Portal UX design in progress.", domain: "Provider", planYear: 1, planQuarter: "Q4", complexity: "Med", businessImpact: "Audit cycle 30→10 days; 60% manual effort reduction; provider self-service portal", dependency: "WO-3003" },
    { portfolio: "IT Infrastructure", product: "MOM", application: "MOM Enterprise Integration Hub (API-First)", initiativeType: "Transformation", description: "Transform Messaging-Oriented Middleware (MOM) from point-to-point integration topology to an API-first enterprise integration hub enabling real-time, event-driven partner data exchange across claims, eligibility, and provider domains", expectedOutcome: "Unified API gateway for all trading partner integrations; real-time event streaming replacing batch; 50% integration maintenance cost reduction", technology: "IBM API Connect / Event Streams / Kafka", currentVersion: "", upgradeVersion: "API-First Integration Hub", jiraId: "WO-3009", serviceCategory: "Platform Transformation", startDate: "2027-01-01", endDate: "2027-06-30", status: "Planned", priority: "High", notes: "Integration topology audit complete. 87 point-to-point integrations identified for consolidation.", domain: "Enterprise Platforms", planYear: 2, planQuarter: "Q1", complexity: "High", businessImpact: "Unified partner API gateway; real-time event streaming; 50% integration maintenance reduction", dependency: "" },
    { portfolio: "IT Infrastructure", product: "IBM ODM", application: "ODM Decision Center Cloud-Native Migration", initiativeType: "Transformation", description: "Migrate IBM ODM Decision Center from on-premise deployment to cloud-native containerized environment, enabling business users to configure rules without IT ticket submission", expectedOutcome: "Business-user-configurable rules reducing IT rule-change tickets to zero; cloud scalability; sub-second rule evaluation at enterprise scale", technology: "IBM ODM / OpenShift / Kubernetes", currentVersion: "", upgradeVersion: "Cloud-Native ODM", jiraId: "WO-3010", serviceCategory: "Platform Transformation", startDate: "2027-01-01", endDate: "2027-06-30", status: "Planned", priority: "High", notes: "OpenShift capacity planning complete. Business rules governance model designed.", domain: "Enterprise Platforms", planYear: 2, planQuarter: "Q1", complexity: "Med", businessImpact: "IT rule-change tickets eliminated; business self-configurable rules; cloud elasticity", dependency: "WO-1001" },
    { portfolio: "Compliance", product: "SBC", application: "SBC Regulatory Compliance Automation", initiativeType: "Transformation", description: "Automate Summary of Benefits and Coverage (SBC) generation, validation, and distribution to achieve ERISA and ACA compliance with zero manual intervention", expectedOutcome: "100% ERISA/ACA SBC compliance; automated generation and distribution across all plan types; regulatory audit readiness in real-time", technology: "IBM BPM / Java / DocGen API", currentVersion: "", upgradeVersion: "Automated SBC Platform", jiraId: "WO-3011", serviceCategory: "Compliance Automation", startDate: "2027-04-01", endDate: "2027-09-30", status: "Planned", priority: "Medium", notes: "Compliance requirements mapped across 47 plan types. Regulatory review with legal complete.", domain: "Payer", planYear: 2, planQuarter: "Q2", complexity: "Med", businessImpact: "100% ERISA/ACA compliance; zero manual SBC intervention; real-time regulatory audit readiness", dependency: "WO-3007" },
    { portfolio: "Member Services", product: "Smartcomm", application: "Smartcomm Cloud Document Generation Platform", initiativeType: "Transformation", description: "Migrate Smartcomm document generation from on-premise legacy deployment to cloud-hosted, API-driven platform with omni-channel delivery across print, email, digital portal, and SMS", expectedOutcome: "50% document production cost reduction; omni-channel delivery capability; real-time composition; centralized brand governance across all member communications", technology: "Quadient Inspire / Cloud Platform / REST APIs", currentVersion: "On-Premise Smartcomm", upgradeVersion: "Cloud CCM Platform", jiraId: "WO-3012", serviceCategory: "Application Modernization", startDate: "2027-04-01", endDate: "2027-12-31", status: "Planned", priority: "High", notes: "Vendor assessment complete. Quadient Inspire cloud selected. Architecture blueprint in review.", domain: "Digital", planYear: 2, planQuarter: "Q2", complexity: "High", businessImpact: "50% document cost reduction; omni-channel delivery; centralized brand governance", dependency: "WO-3007" },
    { portfolio: "Analytics & Reporting", product: "Enterprise BI", application: "Analytics Platform Consolidation (Power BI)", initiativeType: "Transformation", description: "Consolidate Cognos and Tableau analytics platforms into a unified Microsoft Power BI enterprise environment, eliminating dual-vendor licensing and delivering a single analytics experience for all Horizon business users", expectedOutcome: "40% analytics licensing cost reduction; single analytics platform for 1,200+ business users; Power BI embedded in operational portals; real-time self-service BI", technology: "Microsoft Power BI / Azure / Fabric", currentVersion: "IBM Cognos + Tableau", upgradeVersion: "Microsoft Power BI Enterprise", jiraId: "WO-3013", serviceCategory: "Platform Transformation", startDate: "2027-07-01", endDate: "2027-12-31", status: "Planned", priority: "High", notes: "Power BI licensing negotiation in progress. Migration playbook drafted for 840 active Cognos reports.", domain: "Data & Analytics", planYear: 2, planQuarter: "Q3", complexity: "High", businessImpact: "40% licensing cost reduction; 1,200+ users on single platform; real-time self-service BI", dependency: "WO-1013" },
    { portfolio: "Provider Management", product: "CAGUI", application: "CAGUI Pharmacy Benefit Crosswalk Modernization", initiativeType: "Transformation", description: "Modernize CAGUI pharmacy benefit crosswalk from manual data entry and spreadsheet-driven reconciliation to an automated, rules-based crosswalk engine with provider portal integration", expectedOutcome: "70% reduction in manual crosswalk review effort; automated formulary alignment across 15,000+ provider contracts; exception-only human review", technology: "IBM ODM / React / REST APIs", currentVersion: "", upgradeVersion: "Automated Crosswalk Engine", jiraId: "WO-3014", serviceCategory: "Intelligent Automation", startDate: "2027-10-01", endDate: "2028-03-31", status: "Planned", priority: "Medium", notes: "Business rules analysis across 47 formulary tiers complete. ODM rules model in design.", domain: "Provider", planYear: 2, planQuarter: "Q4", complexity: "Med", businessImpact: "70% manual crosswalk effort reduction; 15,000+ contracts automated; exception-only review", dependency: "WO-3010" },
    { portfolio: "Clinical Management", product: "Prior Auth AI", application: "AI-Powered Prior Authorization Decision Support", initiativeType: "Transformation", description: "Deploy AI/ML-driven prior authorization decision support engine that auto-adjudicates routine requests, surfaces clinical criteria guidance, and routes complex cases to appropriate reviewers — reducing manual review burden by 85%", expectedOutcome: "85% auto-approval rate for routine prior auth; authorization cycle 3 days→4 hours; $4.2M annual administrative cost avoidance; CMS compliance for electronic PA", technology: "IBM AI / ML / REST APIs / FHIR", currentVersion: "", upgradeVersion: "AI Decision Support Engine", jiraId: "WO-3015", serviceCategory: "AI-Driven Operations", startDate: "2028-01-01", endDate: "2028-09-30", status: "Planned", priority: "High", notes: "Clinical criteria taxonomy mapped to 2,400 PA request types. Model training dataset prepared.", domain: "Clinical", planYear: 3, planQuarter: "Q1", complexity: "High", businessImpact: "85% auto-approval; cycle 3d→4hr; $4.2M admin cost avoidance; CMS PA compliance", dependency: "WO-3003" },
    { portfolio: "Member Services", product: "Member Engagement AI", application: "GenAI-Powered Member Engagement Platform", initiativeType: "Transformation", description: "Deploy GenAI-powered member engagement platform enabling personalized outreach, intelligent care gap closure, and conversational member support across digital channels — reducing churn and improving health outcomes", expectedOutcome: "25% member engagement rate improvement; 18% care gap closure increase; 30% contact center deflection; member NPS improvement of 12 points", technology: "GenAI / LLM / React / Omni-Channel APIs", currentVersion: "", upgradeVersion: "GenAI Member Platform", jiraId: "WO-3016", serviceCategory: "AI-Driven Operations", startDate: "2028-04-01", endDate: "2028-12-31", status: "Planned", priority: "High", notes: "Member journey mapping complete across 14 care pathways. LLM evaluation in progress.", domain: "Digital", planYear: 3, planQuarter: "Q2", complexity: "High", businessImpact: "25% engagement gain; 18% care gap closure; 30% contact center deflection; NPS +12", dependency: "WO-3012" },
  ]);
  console.log("  roadmap_initiatives seeded");

  console.log("\nDatabase seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
