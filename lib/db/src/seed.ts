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
} from "./schema/index.js";

async function ensureSchema() {
  console.log("Ensuring schema is up to date...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vendor_invoice_alerts (
      id serial PRIMARY KEY,
      alert_type varchar(50) NOT NULL,
      invoice_id varchar(20),
      vendor varchar(100) NOT NULL,
      message text NOT NULL,
      severity varchar(10) NOT NULL,
      amount integer
    )
  `);
  console.log("  schema check complete");
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

  console.log("\nDatabase seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
