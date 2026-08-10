import {
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
  applicationsTable,
  incidentsTable,
  batchJobsTable,
  interfacesTable,
  slaComplianceTable,
  ibmamsRunbooksTable,
  ibmamsSavingsTrendTable,
  ibmamsTicketTrendsTable,
  roadmapInitiativesTable,
  roadmapRequirementsTable,
  roadmapRisksTable,
  executiveAlertsTable,
  dailyTrendsTable,
  aiInsightsTable,
  knowledgeArticlesTable,
  admMeetingsTable,
  admHeadcountTable,
  admStaffChangesTable,
  admInvoiceSummaryTable,
  admHourlyTrendsTable,
  admMipsTrendTable,
  admMipsInsightsTable,
  admTeamCompositionTable,
  admOtherUpdatesTable,
} from "@workspace/db";
import type { DatasetSchema } from "./datasetEngine";

const STATUS_NOTE = "Allowed values are listed in the Instructions sheet.";

export const DATASET_SCHEMAS: Record<string, DatasetSchema> = {
  members: {
    key: "members",
    title: "Members & Enrollment — CareOps360 Upload Template",
    introLines: [
      "This workbook drives the Members page (enrollment trends + exception queue).",
      "Two sheets: Enrollments (time series), Exceptions (work queue).",
    ],
    sheets: [
      {
        sheetName: "Enrollments",
        tableName: "member_enrollments",
        table: memberEnrollmentsTable,
        columns: [
          { header: "Period Type", key: "periodType", type: "str", sample: "daily", required: true },
          { header: "Period Label", key: "periodLabel", type: "str", sample: "Mon Apr 21", required: true },
          { header: "Enrollments", key: "enrollments", type: "int", sample: 1842, required: true },
          { header: "Terminations", key: "terminations", type: "int", sample: 634, required: true },
        ],
        sampleRows: [
          { "Period Type": "daily", "Period Label": "Mon Apr 21", "Enrollments": 1640, "Terminations": 580 },
          { "Period Type": "daily", "Period Label": "Tue Apr 22", "Enrollments": 1842, "Terminations": 634 },
          { "Period Type": "weekly", "Period Label": "Wk 16", "Enrollments": 9217, "Terminations": 4120 },
          { "Period Type": "monthly", "Period Label": "Apr 2026", "Enrollments": 38450, "Terminations": 17840 },
        ],
      },
      {
        sheetName: "Exceptions",
        tableName: "member_exceptions",
        table: memberExceptionsTable,
        columns: [
          { header: "Exception ID", key: "id", type: "str", sample: "EX001", required: true },
          { header: "Member ID", key: "memberId", type: "str", sample: "M00012345", required: true },
          { header: "Member Name", key: "memberName", type: "str", sample: "Jane Doe", required: true },
          { header: "Exception Type", key: "exceptionType", type: "str", sample: "Eligibility mismatch", required: true },
          { header: "Product", key: "product", type: "str", sample: "Commercial PPO", required: true },
          { header: "Age (days)", key: "ageDays", type: "int", sample: 4, required: true },
          { header: "Status", key: "status", type: "str", sample: "Open", required: true },
          { header: "Priority", key: "priority", type: "str", sample: "High", required: true },
        ],
        sampleRows: [
          { "Exception ID": "EX001", "Member ID": "M00012345", "Member Name": "Jane Doe", "Exception Type": "Eligibility mismatch", "Product": "Commercial PPO", "Age (days)": 4, "Status": "Open", "Priority": "High" },
        ],
      },
    ],
  },

  claims: {
    key: "claims",
    title: "Claims Operations — CareOps360 Upload Template",
    introLines: [
      "Drives the Claims page: queue, denial reasons, LOB rollups, aging buckets.",
      "Four sheets — each replaces the corresponding table on upload.",
    ],
    sheets: [
      {
        sheetName: "Claims",
        tableName: "claims",
        table: claimsTable,
        columns: [
          { header: "Claim ID", key: "claimId", type: "str", sample: "CLM-000001", required: true },
          { header: "Member ID", key: "memberId", type: "str", sample: "M00012345", required: true },
          { header: "Member Name", key: "memberName", type: "str", sample: "Jane Doe", required: true },
          { header: "Provider", key: "provider", type: "str", sample: "Atlantic Health", required: true },
          { header: "Service Date", key: "serviceDate", type: "str", sample: "2026-04-15", required: true },
          { header: "Received Date", key: "receivedDate", type: "str", sample: "2026-04-18", required: true },
          { header: "Status", key: "status", type: "str", sample: "Pending", required: true },
          { header: "Amount (USD)", key: "amount", type: "int", sample: 1240, required: true },
          { header: "Line of Business", key: "lineOfBusiness", type: "str", sample: "Commercial", required: true },
          { header: "Age (days)", key: "ageDays", type: "int", sample: 6, required: true },
          { header: "Denial Reason", key: "denialReason", type: "str", sample: "", nullable: true },
        ],
        sampleRows: [
          { "Claim ID": "CLM-000001", "Member ID": "M00012345", "Member Name": "Jane Doe", "Provider": "Atlantic Health", "Service Date": "2026-04-15", "Received Date": "2026-04-18", "Status": "Pending", "Amount (USD)": 1240, "Line of Business": "Commercial", "Age (days)": 6, "Denial Reason": "" },
        ],
      },
      {
        sheetName: "Denial Reasons",
        tableName: "claims_denial_reasons",
        table: claimsDenialReasonsTable,
        columns: [
          { header: "Reason", key: "reason", type: "str", sample: "Coding error", required: true },
          { header: "Count", key: "count", type: "int", sample: 482, required: true },
          { header: "Percentage", key: "percentage", type: "real", sample: 11.4, required: true },
          { header: "Trend", key: "trend", type: "str", sample: "up", required: true },
        ],
        sampleRows: [
          { "Reason": "Coding error", "Count": 482, "Percentage": 11.4, "Trend": "up" },
          { "Reason": "Missing prior auth", "Count": 318, "Percentage": 7.5, "Trend": "down" },
        ],
      },
      {
        sheetName: "LOB Stats",
        tableName: "claims_lob_stats",
        table: claimsLobStatsTable,
        columns: [
          { header: "Line of Business", key: "lob", type: "str", sample: "Commercial", required: true },
          { header: "Received", key: "received", type: "int", sample: 38400, required: true },
          { header: "Processed", key: "processed", type: "int", sample: 32100, required: true },
          { header: "Pending", key: "pending", type: "int", sample: 6300, required: true },
          { header: "Amount (USD)", key: "amount", type: "int", sample: 109200000, required: true },
        ],
        sampleRows: [
          { "Line of Business": "Commercial", "Received": 38400, "Processed": 32100, "Pending": 6300, "Amount (USD)": 109200000 },
          { "Line of Business": "Medicare", "Received": 22100, "Processed": 18900, "Pending": 3200, "Amount (USD)": 78400000 },
        ],
      },
      {
        sheetName: "Aging",
        tableName: "claims_aging",
        table: claimsAgingTable,
        columns: [
          { header: "Bucket", key: "bucket", type: "str", sample: "0-7 days", required: true },
          { header: "Count", key: "count", type: "int", sample: 12400, required: true },
          { header: "Percentage", key: "percentage", type: "real", sample: 65.4, required: true },
          { header: "Severity", key: "severity", type: "str", sample: "green", required: true },
        ],
        sampleRows: [
          { "Bucket": "0-7 days", "Count": 12400, "Percentage": 65.4, "Severity": "green" },
          { "Bucket": "8-14 days", "Count": 4100, "Percentage": 21.6, "Severity": "yellow" },
          { "Bucket": "15-30 days", "Count": 1800, "Percentage": 9.5, "Severity": "yellow" },
          { "Bucket": "30+ days", "Count": 643, "Percentage": 3.4, "Severity": "red" },
        ],
      },
    ],
  },

  "prior-auth": {
    key: "prior-auth",
    title: "Prior Authorization — CareOps360 Upload Template",
    introLines: [
      "Drives the Prior Auth page: aging, procedure mix, reviewer workload.",
    ],
    sheets: [
      {
        sheetName: "Aging",
        tableName: "priorauth_aging",
        table: priorauthAgingTable,
        columns: [
          { header: "Bucket", key: "bucket", type: "str", sample: "0-1 day", required: true },
          { header: "Count", key: "count", type: "int", sample: 1240, required: true },
          { header: "Percentage", key: "percentage", type: "real", sample: 48.2, required: true },
          { header: "Severity", key: "severity", type: "str", sample: "green", required: true },
        ],
        sampleRows: [
          { "Bucket": "0-1 day", "Count": 1240, "Percentage": 48.2, "Severity": "green" },
          { "Bucket": "1-3 days", "Count": 820, "Percentage": 31.9, "Severity": "yellow" },
          { "Bucket": "3-7 days", "Count": 380, "Percentage": 14.8, "Severity": "yellow" },
          { "Bucket": "7+ days", "Count": 130, "Percentage": 5.1, "Severity": "red" },
        ],
      },
      {
        sheetName: "Procedures",
        tableName: "priorauth_procedures",
        table: priorauthProceduresTable,
        columns: [
          { header: "Category", key: "category", type: "str", sample: "Imaging", required: true },
          { header: "Requests", key: "requests", type: "int", sample: 842, required: true },
          { header: "Approval Rate (%)", key: "approvalRate", type: "real", sample: 87.4, required: true },
          { header: "Avg Days to Decision", key: "avgDays", type: "real", sample: 1.8, required: true },
        ],
        sampleRows: [
          { "Category": "Imaging", "Requests": 842, "Approval Rate (%)": 87.4, "Avg Days to Decision": 1.8 },
          { "Category": "Surgery", "Requests": 318, "Approval Rate (%)": 78.5, "Avg Days to Decision": 2.4 },
        ],
      },
      {
        sheetName: "Reviewers",
        tableName: "priorauth_reviewers",
        table: priorauthReviewersTable,
        columns: [
          { header: "Reviewer ID", key: "reviewerId", type: "str", sample: "RV001", required: true },
          { header: "Reviewer Name", key: "reviewerName", type: "str", sample: "Dr. Patel", required: true },
          { header: "Open Cases", key: "openCases", type: "int", sample: 24, required: true },
          { header: "Completed Today", key: "completedToday", type: "int", sample: 18, required: true },
          { header: "Avg Days to Decision", key: "avgDaysToDecision", type: "real", sample: 1.6, required: true },
          { header: "Status", key: "status", type: "str", sample: "Active", required: true },
        ],
        sampleRows: [
          { "Reviewer ID": "RV001", "Reviewer Name": "Dr. Patel", "Open Cases": 24, "Completed Today": 18, "Avg Days to Decision": 1.6, "Status": "Active" },
        ],
      },
    ],
  },

  providers: {
    key: "providers",
    title: "Provider Network — CareOps360 Upload Template",
    introLines: [
      "Drives the Providers page: directory, credentialing, top issues.",
    ],
    sheets: [
      {
        sheetName: "Providers",
        tableName: "providers",
        table: providersTable,
        columns: [
          { header: "Provider ID", key: "providerId", type: "str", sample: "PRV-00001", required: true },
          { header: "Provider Name", key: "providerName", type: "str", sample: "Atlantic Health", required: true },
          { header: "NPI", key: "npi", type: "str", sample: "1234567890", required: true },
          { header: "Specialty", key: "specialty", type: "str", sample: "Cardiology", required: true },
          { header: "Status", key: "status", type: "str", sample: "Active", required: true },
          { header: "Credentialing Status", key: "credentialingStatus", type: "str", sample: "Approved", required: true },
          { header: "Open Claims", key: "openClaims", type: "int", sample: 42, required: true },
          { header: "Open Tickets", key: "openTickets", type: "int", sample: 3, required: true },
          { header: "Last Updated", key: "lastUpdated", type: "str", sample: "2026-04-25", required: true },
        ],
        sampleRows: [
          { "Provider ID": "PRV-00001", "Provider Name": "Atlantic Health", "NPI": "1234567890", "Specialty": "Cardiology", "Status": "Active", "Credentialing Status": "Approved", "Open Claims": 42, "Open Tickets": 3, "Last Updated": "2026-04-25" },
        ],
      },
      {
        sheetName: "Provider Issues",
        tableName: "provider_issues",
        table: providerIssuesTable,
        columns: [
          { header: "Issue Type", key: "issueType", type: "str", sample: "Credentialing delay", required: true },
          { header: "Count", key: "count", type: "int", sample: 28, required: true },
          { header: "Trend", key: "trend", type: "str", sample: "up", required: true },
          { header: "Priority", key: "priority", type: "str", sample: "High", required: true },
        ],
        sampleRows: [
          { "Issue Type": "Credentialing delay", "Count": 28, "Trend": "up", "Priority": "High" },
        ],
      },
    ],
  },

  "contact-center": {
    key: "contact-center",
    title: "Contact Center — CareOps360 Upload Template",
    introLines: [
      "Drives the Contact Center page: call reasons + hourly volume.",
    ],
    sheets: [
      {
        sheetName: "Call Reasons",
        tableName: "contactcenter_call_reasons",
        table: contactcenterCallReasonsTable,
        columns: [
          { header: "Reason", key: "reason", type: "str", sample: "Claim status inquiry", required: true },
          { header: "Count", key: "count", type: "int", sample: 1240, required: true },
          { header: "Percentage", key: "percentage", type: "real", sample: 38.4, required: true },
          { header: "Trend", key: "trend", type: "str", sample: "down", required: true },
        ],
        sampleRows: [
          { "Reason": "Claim status inquiry", "Count": 1240, "Percentage": 38.4, "Trend": "down" },
          { "Reason": "Eligibility verification", "Count": 820, "Percentage": 25.4, "Trend": "flat" },
        ],
      },
      {
        sheetName: "Hourly",
        tableName: "contactcenter_hourly",
        table: contactcenterHourlyTable,
        columns: [
          { header: "Hour", key: "hourLabel", type: "str", sample: "08:00", required: true },
          { header: "Calls", key: "calls", type: "int", sample: 240, required: true },
          { header: "Chats", key: "chats", type: "int", sample: 84, required: true },
          { header: "Emails", key: "emails", type: "int", sample: 31, required: true },
        ],
        sampleRows: [
          { "Hour": "08:00", "Calls": 240, "Chats": 84, "Emails": 31 },
          { "Hour": "09:00", "Calls": 410, "Chats": 142, "Emails": 56 },
        ],
      },
    ],
  },

  "app-health": {
    key: "app-health",
    title: "Application Health & ~1,000 Apps — CareOps360 Upload Template",
    introLines: [
      "Drives the App Health page: catalog, incidents, batch jobs, interfaces, SLA.",
      "Five sheets — each fully replaces the matching table.",
    ],
    sheets: [
      {
        sheetName: "Applications",
        tableName: "applications",
        table: applicationsTable,
        columns: [
          { header: "App ID", key: "appId", type: "str", sample: "APP-0001", required: true },
          { header: "Name", key: "name", type: "str", sample: "Claims Engine", required: true },
          { header: "Owner", key: "owner", type: "str", sample: "Claims Ops", required: true },
          { header: "Status", key: "status", type: "str", sample: "Healthy", required: true },
          { header: "Availability (%)", key: "availability", type: "real", sample: 99.94, required: true },
          { header: "Open Incidents", key: "openIncidents", type: "int", sample: 2, required: true },
          { header: "Version", key: "version", type: "str", sample: "4.12.1", required: true },
          { header: "Last Deployment", key: "lastDeployment", type: "str", sample: "2026-04-22", required: true },
          { header: "SLA Target (%)", key: "slaTarget", type: "real", sample: 99.9, required: true },
          { header: "SLA Actual (%)", key: "slaActual", type: "real", sample: 99.94, required: true },
          { header: "Environment", key: "environment", type: "str", sample: "Prod", required: true },
          { header: "Tier", key: "tier", type: "str", sample: "Mission Critical", required: true },
        ],
        sampleRows: [
          { "App ID": "APP-0001", "Name": "Claims Engine", "Owner": "Claims Ops", "Status": "Healthy", "Availability (%)": 99.94, "Open Incidents": 2, "Version": "4.12.1", "Last Deployment": "2026-04-22", "SLA Target (%)": 99.9, "SLA Actual (%)": 99.94, "Environment": "Prod", "Tier": "Mission Critical" },
        ],
      },
      {
        sheetName: "Incidents",
        tableName: "incidents",
        table: incidentsTable,
        columns: [
          { header: "Incident ID", key: "incidentId", type: "str", sample: "INC-0001", required: true },
          { header: "Severity", key: "severity", type: "str", sample: "Sev2", required: true },
          { header: "Title", key: "title", type: "str", sample: "Claims latency spike", required: true },
          { header: "Affected Application", key: "affectedApplication", type: "str", sample: "Claims Engine", required: true },
          { header: "Status", key: "status", type: "str", sample: "Open", required: true },
          { header: "Opened At (ISO)", key: "openedAt", type: "date", sample: "2026-04-25T08:30:00Z", required: true },
          { header: "Resolved At (ISO)", key: "resolvedAt", type: "date", sample: "", nullable: true },
          { header: "MTTR (minutes)", key: "mttr", type: "int", sample: 0, nullable: true },
          { header: "Root Cause", key: "rootCause", type: "str", sample: "DB connection pool exhausted", required: true },
          { header: "Assignee", key: "assignee", type: "str", sample: "Sarah Lee", required: true },
        ],
        sampleRows: [
          { "Incident ID": "INC-0001", "Severity": "Sev2", "Title": "Claims latency spike", "Affected Application": "Claims Engine", "Status": "Open", "Opened At (ISO)": "2026-04-25T08:30:00Z", "Resolved At (ISO)": "", "MTTR (minutes)": 0, "Root Cause": "DB connection pool exhausted", "Assignee": "Sarah Lee" },
        ],
      },
      {
        sheetName: "Batch Jobs",
        tableName: "batch_jobs",
        table: batchJobsTable,
        columns: [
          { header: "Job ID", key: "jobId", type: "str", sample: "BATCH-001", required: true },
          { header: "Job Name", key: "jobName", type: "str", sample: "Daily claims rollup", required: true },
          { header: "Application", key: "application", type: "str", sample: "Claims Engine", required: true },
          { header: "Status", key: "status", type: "str", sample: "Completed", required: true },
          { header: "Scheduled Time", key: "scheduledTime", type: "str", sample: "02:00", required: true },
          { header: "Start Time", key: "startTime", type: "str", sample: "02:00", required: true },
          { header: "End Time", key: "endTime", type: "str", sample: "02:42", nullable: true },
          { header: "Duration (minutes)", key: "duration", type: "int", sample: 42, nullable: true },
          { header: "Records Processed", key: "recordsProcessed", type: "int", sample: 384000, required: true },
        ],
        sampleRows: [
          { "Job ID": "BATCH-001", "Job Name": "Daily claims rollup", "Application": "Claims Engine", "Status": "Completed", "Scheduled Time": "02:00", "Start Time": "02:00", "End Time": "02:42", "Duration (minutes)": 42, "Records Processed": 384000 },
        ],
      },
      {
        sheetName: "Interfaces",
        tableName: "interfaces",
        table: interfacesTable,
        columns: [
          { header: "Interface ID", key: "interfaceId", type: "str", sample: "IF-001", required: true },
          { header: "Name", key: "name", type: "str", sample: "EDI 837 inbound", required: true },
          { header: "Type", key: "type", type: "str", sample: "EDI", required: true },
          { header: "Source System", key: "sourceSystem", type: "str", sample: "Clearinghouse", required: true },
          { header: "Target System", key: "targetSystem", type: "str", sample: "Claims Engine", required: true },
          { header: "Status", key: "status", type: "str", sample: "Healthy", required: true },
          { header: "Last Transmission (ISO)", key: "lastTransmission", type: "date", sample: "2026-04-25T10:30:00Z", required: true },
          { header: "Records Today", key: "recordsToday", type: "int", sample: 87432, required: true },
          { header: "Error Rate (%)", key: "errorRate", type: "real", sample: 0.4, required: true },
        ],
        sampleRows: [
          { "Interface ID": "IF-001", "Name": "EDI 837 inbound", "Type": "EDI", "Source System": "Clearinghouse", "Target System": "Claims Engine", "Status": "Healthy", "Last Transmission (ISO)": "2026-04-25T10:30:00Z", "Records Today": 87432, "Error Rate (%)": 0.4 },
        ],
      },
      {
        sheetName: "SLA Compliance",
        tableName: "sla_compliance",
        table: slaComplianceTable,
        columns: [
          { header: "ID", key: "id", type: "str", sample: "SLA-001", required: true },
          { header: "Tower", key: "tower", type: "str", sample: "Claims", required: true },
          { header: "Target (%)", key: "target", type: "real", sample: 99.9, required: true },
          { header: "Actual (%)", key: "actual", type: "real", sample: 99.94, required: true },
          { header: "Status", key: "status", type: "str", sample: "Met", required: true },
          { header: "Trend", key: "trend", type: "str", sample: "up", required: true },
        ],
        sampleRows: [
          { "ID": "SLA-001", "Tower": "Claims", "Target (%)": 99.9, "Actual (%)": 99.94, "Status": "Met", "Trend": "up" },
        ],
      },
    ],
  },

  "ibm-aiops": {
    key: "ibm-aiops",
    title: "IBM AIOps Value Metrics — CareOps360 Upload Template",
    introLines: [
      "Drives the IBM AIOps Value page: runbooks, savings trend, ticket trend.",
    ],
    sheets: [
      {
        sheetName: "Runbooks",
        tableName: "ibmams_runbooks",
        table: ibmamsRunbooksTable,
        columns: [
          { header: "Runbook ID", key: "runbookId", type: "str", sample: "RB-001", required: true },
          { header: "Name", key: "name", type: "str", sample: "Auto-restart Claims Engine", required: true },
          { header: "Category", key: "category", type: "str", sample: "Self-heal", required: true },
          { header: "Executions Today", key: "executionsToday", type: "int", sample: 24, required: true },
          { header: "Success Rate (%)", key: "successRate", type: "real", sample: 96.5, required: true },
          { header: "Time Saved (hours)", key: "timeSavedHours", type: "real", sample: 18.4, required: true },
        ],
        sampleRows: [
          { "Runbook ID": "RB-001", "Name": "Auto-restart Claims Engine", "Category": "Self-heal", "Executions Today": 24, "Success Rate (%)": 96.5, "Time Saved (hours)": 18.4 },
        ],
      },
      {
        sheetName: "Savings Trend",
        tableName: "ibmams_savings_trend",
        table: ibmamsSavingsTrendTable,
        columns: [
          { header: "Month", key: "monthLabel", type: "str", sample: "Apr 2026", required: true },
          { header: "Savings (USD)", key: "savings", type: "int", sample: 240000, required: true },
          { header: "Avoidance (USD)", key: "avoidance", type: "int", sample: 380000, required: true },
        ],
        sampleRows: [
          { "Month": "Feb 2026", "Savings (USD)": 180000, "Avoidance (USD)": 290000 },
          { "Month": "Mar 2026", "Savings (USD)": 220000, "Avoidance (USD)": 340000 },
          { "Month": "Apr 2026", "Savings (USD)": 240000, "Avoidance (USD)": 380000 },
        ],
      },
      {
        sheetName: "Ticket Trends",
        tableName: "ibmams_ticket_trends",
        table: ibmamsTicketTrendsTable,
        columns: [
          { header: "Week", key: "weekLabel", type: "str", sample: "Wk 16", required: true },
          { header: "Total Tickets", key: "total", type: "int", sample: 842, required: true },
          { header: "Resolved within SLA", key: "resolvedWithinSla", type: "int", sample: 798, required: true },
          { header: "Automated", key: "automated", type: "int", sample: 412, required: true },
        ],
        sampleRows: [
          { "Week": "Wk 14", "Total Tickets": 920, "Resolved within SLA": 850, "Automated": 380 },
          { "Week": "Wk 15", "Total Tickets": 880, "Resolved within SLA": 820, "Automated": 395 },
          { "Week": "Wk 16", "Total Tickets": 842, "Resolved within SLA": 798, "Automated": 412 },
        ],
      },
    ],
  },

  "transformation-roadmap": {
    key: "transformation-roadmap",
    title: "Transformation Roadmap — CareOps360 Upload Template",
    introLines: [
      "Single sheet 'Initiatives' driving the Transformation Roadmap — all swimlanes, timeline, and drill-downs.",
      `Initiative Type values: Transformation | Upgrade | Ticket Reduction | Foundational. ${STATUS_NOTE}`,
      "Foundational rows appear in the dedicated 'Foundational Initiatives' tab and in the governance Gantt as a 4th category.",
      `Status values: Active | Planned | Completed | At Risk | On Hold. ${STATUS_NOTE}`,
      `Priority values: High | Medium | Low | Critical. ${STATUS_NOTE}`,
      `Complexity values: High | Med | Low. ${STATUS_NOTE}`,
      `Plan Year values: 1 (2026) | 2 (2027) | 3 (2028). ${STATUS_NOTE}`,
    ],
    sheets: [
      {
        sheetName: "Initiatives",
        tableName: "roadmap_initiatives",
        table: roadmapInitiativesTable,
        columns: [
          { header: "Portfolio", key: "portfolio", type: "str", sample: "IT Infrastructure", required: true },
          { header: "Product", key: "product", type: "str", sample: "IBM Instana", required: true },
          { header: "Application", key: "application", type: "str", sample: "AIOps Event Correlation Engine", required: true },
          { header: "Initiative Type", key: "initiativeType", type: "str", sample: "Foundational", required: true },
          { header: "Description", key: "description", type: "str", sample: "Automate denial drafting with LLM", required: true },
          { header: "Expected Outcome", key: "expectedOutcome", type: "str", sample: "30% denial-letter cycle reduction", required: true },
          { header: "Technology", key: "technology", type: "str", sample: "watsonx.ai", required: true },
          { header: "Current Version", key: "currentVersion", type: "str", sample: "4.12" },
          { header: "Upgrade Version", key: "upgradeVersion", type: "str", sample: "5.0" },
          { header: "JIRA ID", key: "jiraId", type: "str", sample: "HRZN-1001", required: true },
          { header: "Service Category", key: "serviceCategory", type: "str", sample: "Claims Modernization", required: true },
          { header: "Start Date", key: "startDate", type: "str", sample: "2026-Q2", required: true },
          { header: "End Date", key: "endDate", type: "str", sample: "2026-Q4", required: true },
          { header: "Status", key: "status", type: "str", sample: "In Progress", required: true },
          { header: "Priority", key: "priority", type: "str", sample: "High", required: true },
          { header: "Notes", key: "notes", type: "str", sample: "", required: true },
          { header: "Domain", key: "domain", type: "str", sample: "Claims", required: true },
          { header: "Plan Year", key: "planYear", type: "int", sample: 1, required: true },
          { header: "Plan Quarter", key: "planQuarter", type: "str", sample: "Q2", required: true },
          { header: "Complexity", key: "complexity", type: "str", sample: "Med", required: true },
          { header: "Business Impact", key: "businessImpact", type: "str", sample: "High - 30% cycle reduction", required: true },
          { header: "Dependency", key: "dependency", type: "str", sample: "watsonx.ai license" },
        ],
        sampleRows: [
          { "Portfolio": "Claims", "Product": "Claims Engine", "Application": "Claims Engine v4", "Initiative Type": "Transformation", "Description": "Automate denial drafting with LLM", "Expected Outcome": "30% denial-letter cycle reduction", "Technology": "watsonx.ai", "Current Version": "4.12", "Upgrade Version": "5.0", "JIRA ID": "HRZN-1001", "Service Category": "Claims Modernization", "Start Date": "2026-Q2", "End Date": "2026-Q4", "Status": "In Progress", "Priority": "High", "Notes": "", "Domain": "Claims", "Plan Year": 1, "Plan Quarter": "Q2", "Complexity": "Med", "Business Impact": "High - 30% cycle reduction", "Dependency": "watsonx.ai license" },
          { "Portfolio": "IT Infrastructure", "Product": "IBM Instana", "Application": "AIOps Event Correlation Engine", "Initiative Type": "Foundational", "Description": "Unified telemetry pipeline with AI-driven alert correlation reducing noise by 40%+ across all production systems.", "Expected Outcome": "40%+ alert noise reduction; 30% MTTR improvement", "Technology": "IBM Instana / Turbonomic / Kafka", "Current Version": "", "Upgrade Version": "", "JIRA ID": "GOV-002", "Service Category": "AIOps & Observability", "Start Date": "2026-01-01", "End Date": "2026-04-30", "Status": "Completed", "Priority": "High", "Notes": "Unified telemetry pipeline live.", "Domain": "AIOps & Observability", "Plan Year": 1, "Plan Quarter": "Q1", "Complexity": "High", "Business Impact": "Noise reduction and faster MTTR.", "Dependency": "" },
        ],
      },
    ],
  },

  "roadmap-requirements": {
    key: "roadmap-requirements",
    title: "Roadmap — Requirements for Horizon Upload Template",
    introLines: [
      "Drives the 'Requirements for Horizon' governance section on the Transformation Roadmap page.",
      "Each row is an IBM ask of Horizon — access grants, approvals, resource commitments, or infrastructure decisions.",
      `Status values: Met | In Progress | Open | Overdue. ${STATUS_NOTE}`,
      `Priority values: High | Med | Low. ${STATUS_NOTE}`,
      `Category values: Data Access | Approval | Decision | Resource | Infrastructure | Commercial. ${STATUS_NOTE}`,
    ],
    sheets: [
      {
        sheetName: "Requirements",
        tableName: "roadmap_requirements",
        table: roadmapRequirementsTable,
        columns: [
          { header: "Name",           key: "name",           type: "str",  sample: "Production DB Read Access — Claims",         required: true  },
          { header: "Category",       key: "category",       type: "str",  sample: "Data Access",                                required: true  },
          { header: "Description",    key: "description",    type: "str",  sample: "IBM AIOps team requires read-only access…",   required: true  },
          { header: "Due Date",       key: "dueDate",        type: "str",  sample: "2026-07-31",                                 required: true  },
          { header: "Status",         key: "status",         type: "str",  sample: "Open",                                       required: true  },
          { header: "IBM Workstream", key: "ibmWorkstream",  type: "str",  sample: "AIOps & Observability",                      required: true  },
          { header: "Owner",          key: "owner",          type: "str",  sample: "Horizon IT Security",                        required: true  },
          { header: "Priority",       key: "priority",       type: "str",  sample: "High",                                       required: true  },
        ],
        sampleRows: [
          { "Name": "Production DB Read Access — Claims", "Category": "Data Access", "Description": "IBM AIOps team requires read-only access to claims DB for analytics.", "Due Date": "2026-07-31", "Status": "Open", "IBM Workstream": "AIOps & Observability", "Owner": "Horizon IT Security", "Priority": "High" },
        ],
      },
    ],
  },

  "roadmap-risks": {
    key: "roadmap-risks",
    title: "Roadmap — Transformation Risks Upload Template",
    introLines: [
      "Drives the 'Risks & Mitigation' governance section on the Transformation Roadmap page.",
      "Each row is a programme, technical, resource, compliance, commercial, or vendor risk.",
      `Status values: Open | Mitigating | Closed. ${STATUS_NOTE}`,
      `Likelihood / Impact / Rating values: High | Med | Low. ${STATUS_NOTE}`,
      `Category values: Program | Technical | Resource | Compliance | Commercial | Vendor. ${STATUS_NOTE}`,
    ],
    sheets: [
      {
        sheetName: "Risks",
        tableName: "roadmap_risks",
        table: roadmapRisksTable,
        columns: [
          { header: "Title",             key: "title",            type: "str",  sample: "Legacy Inventory Sign-Off Delay",              required: true  },
          { header: "Category",          key: "category",         type: "str",  sample: "Program",                                      required: true  },
          { header: "Likelihood",        key: "likelihood",       type: "str",  sample: "High",                                         required: true  },
          { header: "Impact",            key: "impact",           type: "str",  sample: "High",                                         required: true  },
          { header: "Rating",            key: "rating",           type: "str",  sample: "High",                                         required: true  },
          { header: "Owner",             key: "owner",            type: "str",  sample: "Horizon App Portfolio Team",                   required: true  },
          { header: "Mitigation Action", key: "mitigationAction", type: "str",  sample: "IBM to provide pre-populated spreadsheet…",    required: true  },
          { header: "Status",            key: "status",           type: "str",  sample: "Open",                                         required: true  },
          { header: "Raised Date",       key: "raisedDate",       type: "str",  sample: "2026-04-10",                                   required: true  },
          { header: "Notes",             key: "notes",            type: "str",  sample: "",                                             required: false },
        ],
        sampleRows: [
          { "Title": "Legacy Inventory Sign-Off Delay", "Category": "Program", "Likelihood": "High", "Impact": "High", "Rating": "High", "Owner": "Horizon App Portfolio Team", "Mitigation Action": "IBM to provide pre-populated spreadsheet with draft decommission priorities.", "Status": "Open", "Raised Date": "2026-04-10", "Notes": "" },
        ],
      },
    ],
  },

  "executive-overview": {
    key: "executive-overview",
    title: "Executive Overview — CareOps360 Upload Template",
    introLines: [
      "Drives the Executive Overview page: alerts, daily trends, AI insights.",
    ],
    sheets: [
      {
        sheetName: "Alerts",
        tableName: "executive_alerts",
        table: executiveAlertsTable,
        columns: [
          { header: "Alert ID", key: "id", type: "str", sample: "ALT-001", required: true },
          { header: "Severity", key: "severity", type: "str", sample: "High", required: true },
          { header: "Category", key: "category", type: "str", sample: "Claims", required: true },
          { header: "Title", key: "title", type: "str", sample: "Claims latency above target", required: true },
          { header: "Description", key: "description", type: "str", sample: "TAT trending up 14% WoW", required: true },
          { header: "Status", key: "status", type: "str", sample: "Open", required: true },
          { header: "Alert Timestamp (ISO)", key: "alertTimestamp", type: "date", sample: "2026-04-25T09:15:00Z", required: true },
          { header: "Impacted System", key: "impactedSystem", type: "str", sample: "Claims Engine", required: true },
          { header: "Drill-Down Path", key: "drillDownPath", type: "str", sample: "/dashboard/claims", required: true },
        ],
        sampleRows: [
          { "Alert ID": "ALT-001", "Severity": "High", "Category": "Claims", "Title": "Claims latency above target", "Description": "TAT trending up 14% WoW", "Status": "Open", "Alert Timestamp (ISO)": "2026-04-25T09:15:00Z", "Impacted System": "Claims Engine", "Drill-Down Path": "/dashboard/claims" },
        ],
      },
      {
        sheetName: "Daily Trends",
        tableName: "daily_trends",
        table: dailyTrendsTable,
        columns: [
          { header: "ID", key: "id", type: "str", sample: "DT-2026-04-25", required: true },
          { header: "Trend Date", key: "trendDate", type: "str", sample: "2026-04-25", required: true },
          { header: "Claims", key: "claims", type: "int", sample: 87432, required: true },
          { header: "Enrollments", key: "enrollments", type: "int", sample: 1842, required: true },
          { header: "Prior Auths", key: "priorAuths", type: "int", sample: 2570, required: true },
          { header: "Availability (%)", key: "availability", type: "real", sample: 99.94, required: true },
          { header: "Incidents", key: "incidents", type: "int", sample: 4, required: true },
        ],
        sampleRows: [
          { "ID": "DT-2026-04-25", "Trend Date": "2026-04-25", "Claims": 87432, "Enrollments": 1842, "Prior Auths": 2570, "Availability (%)": 99.94, "Incidents": 4 },
        ],
      },
      {
        sheetName: "AI Insights",
        tableName: "ai_insights",
        table: aiInsightsTable,
        columns: [
          { header: "Insight ID", key: "id", type: "str", sample: "INS-001", required: true },
          { header: "Category", key: "category", type: "str", sample: "Claims", required: true },
          { header: "Severity", key: "severity", type: "str", sample: "High", required: true },
          { header: "Headline", key: "headline", type: "str", sample: "Auto-adjudication drift detected", required: true },
          { header: "Detail", key: "detail", type: "str", sample: "Rate dropped 14% in 7 days", required: true },
          { header: "Recommendation", key: "recommendation", type: "str", sample: "Tune denial rules pack v3.2", required: true },
          { header: "Insight Timestamp (ISO)", key: "insightTimestamp", type: "date", sample: "2026-04-25T09:15:00Z", required: true },
          { header: "Affected Area", key: "affectedArea", type: "str", sample: "Claims Engine", required: true },
        ],
        sampleRows: [
          { "Insight ID": "INS-001", "Category": "Claims", "Severity": "High", "Headline": "Auto-adjudication drift detected", "Detail": "Rate dropped 14% in 7 days", "Recommendation": "Tune denial rules pack v3.2", "Insight Timestamp (ISO)": "2026-04-25T09:15:00Z", "Affected Area": "Claims Engine" },
        ],
      },
    ],
  },

  knowledge: {
    key: "knowledge",
    title: "Knowledge Articles — CareOps360 Upload Template",
    introLines: [
      "This workbook drives the Knowledge Base page and the AI Ask assistant's retrieval corpus.",
      "One sheet: Articles. Tags are comma-separated. Source Type must be one of: confluence, sharepoint, onedrive, gdrive, uploaded, ai-generated, manual.",
    ],
    sheets: [
      {
        sheetName: "Articles",
        tableName: "knowledge_articles",
        table: knowledgeArticlesTable,
        columns: [
          { header: "Slug", key: "slug", type: "str", sample: "edi-835-remittance-delay-runbook", required: true },
          { header: "Title", key: "title", type: "str", sample: "EDI 835 Remittance Delay — Triage Runbook", required: true },
          { header: "Summary", key: "summary", type: "str", sample: "Step-by-step triage for outbound 835 remittance delays.", required: true },
          { header: "Body (Markdown)", key: "body", type: "str", sample: "### When to use\nOutbound 835 files delayed more than 30 minutes...", required: true },
          { header: "Domain", key: "domain", type: "str", sample: "IT Ops / AIOps", required: true },
          { header: "Tags (comma-separated)", key: "tags", type: "str", sample: "edi,835,runbook", required: false, nullable: true },
          { header: "Source Type", key: "sourceType", type: "str", sample: "uploaded", required: true },
          { header: "Source URL", key: "sourceUrl", type: "str", sample: "", required: false, nullable: true },
          { header: "Author", key: "author", type: "str", sample: "Maria Chen (Integration Ops)", required: true },
          { header: "View Count", key: "viewCount", type: "int", sample: 0, required: false, nullable: true },
        ],
        sampleRows: [
          {
            "Slug": "sample-article",
            "Title": "Sample Knowledge Article",
            "Summary": "One-sentence summary shown in search results.",
            "Body (Markdown)": "### Overview\nWrite the article body in markdown.",
            "Domain": "Claims",
            "Tags (comma-separated)": "claims,sample",
            "Source Type": "uploaded",
            "Source URL": null,
            "Author": "Jane Doe (Claims Ops)",
            "View Count": 0,
          },
        ],
      },
    ],
  },
  "account-management": {
    key: "account-management",
    title: "Account Management (ADM) — Monthly Report Upload Template",
    introLines: [
      "Drives the Account Management tab (monthly ADM report).",
      "Month-scoped replace: rows for the months present in the workbook replace those months' data; other months are untouched.",
      "Report Month format: 'Jun 2026'. Trend sheets (Headcount, Hourly Trends, MIPS Trend) use the same 'Mon YYYY' format per series month.",
      "Action Items and Transformation Initiatives are maintained directly in the UI and are NOT part of this workbook.",
      `Staff Change Type values: Onboard | Offboard. ${STATUS_NOTE}`,
      `Invoice SOW values: T&M CareRadius | T&M Data | T&M Non-Data. ${STATUS_NOTE}`,
      `MIPS Insight Section values: Optimization | Outlook | Recommendation. ${STATUS_NOTE}`,
      `Team Composition Category values: Technology Mix | Diversity | Experience | Attrition Benchmark. ${STATUS_NOTE}`,
    ],
    sheets: [
      {
        sheetName: "Director Meetings",
        tableName: "adm_meetings",
        table: admMeetingsTable,
        scopeKey: "reportMonth",
        columns: [
          { header: "Report Month", key: "reportMonth", type: "str", sample: "Jun 2026", required: true },
          { header: "Domain / Area", key: "domainArea", type: "str", sample: "Care Radius", required: true },
          { header: "Meeting Date", key: "meetingDate", type: "str", sample: "2026-06-12", required: true },
          { header: "Horizon Attendees", key: "horizonAttendees", type: "str", sample: "S. Mehta; R. Alvarez", required: true },
          { header: "IBM Attendees", key: "ibmAttendees", type: "str", sample: "K. Rao; T. Nguyen", required: true },
          { header: "Deck Link", key: "deckLink", type: "str", sample: "https://ibm.box.com/adm-jun26-cr" },
        ],
        sampleRows: [
          { "Report Month": "Jun 2026", "Domain / Area": "Care Radius", "Meeting Date": "2026-06-12", "Horizon Attendees": "S. Mehta; R. Alvarez", "IBM Attendees": "K. Rao; T. Nguyen", "Deck Link": "https://ibm.box.com/adm-jun26-cr" },
        ],
      },
      {
        sheetName: "Headcount",
        tableName: "adm_headcount",
        table: admHeadcountTable,
        scopeKey: "monthLabel",
        columns: [
          { header: "Month", key: "monthLabel", type: "str", sample: "Jun 2026", required: true },
          { header: "Start HC", key: "startHc", type: "int", sample: 410, required: true },
          { header: "Onboards", key: "onboards", type: "int", sample: 10, required: true },
          { header: "Offboards", key: "offboards", type: "int", sample: 7, required: true },
          { header: "End HC", key: "endHc", type: "int", sample: 413, required: true },
          { header: "Attrition (%)", key: "attritionPct", type: "real", sample: 0.2, required: true },
        ],
        sampleRows: [
          { "Month": "Jun 2026", "Start HC": 410, "Onboards": 10, "Offboards": 7, "End HC": 413, "Attrition (%)": 0.2 },
        ],
      },
      {
        sheetName: "Staff Changes",
        tableName: "adm_staff_changes",
        table: admStaffChangesTable,
        scopeKey: "reportMonth",
        columns: [
          { header: "Report Month", key: "reportMonth", type: "str", sample: "Jun 2026", required: true },
          { header: "Name", key: "personName", type: "str", sample: "Henna David", required: true },
          { header: "Team", key: "team", type: "str", sample: "Care Radius", required: true },
          { header: "Change Type", key: "changeType", type: "str", sample: "Offboard", required: true },
          { header: "Reason", key: "reason", type: "str", sample: "Maternity leave" },
        ],
        sampleRows: [
          { "Report Month": "Jun 2026", "Name": "Henna David", "Team": "Care Radius", "Change Type": "Offboard", "Reason": "Maternity leave" },
        ],
      },
      {
        sheetName: "Invoice Summary",
        tableName: "adm_invoice_summary",
        table: admInvoiceSummaryTable,
        scopeKey: "reportMonth",
        columns: [
          { header: "Report Month", key: "reportMonth", type: "str", sample: "Jun 2026", required: true },
          { header: "SOW", key: "sow", type: "str", sample: "T&M CareRadius", required: true },
          { header: "Line Item", key: "lineItem", type: "str", sample: "Onshore hours", required: true },
          { header: "Hours", key: "hours", type: "real", sample: 420, required: true },
          { header: "Amount (USD)", key: "amountUsd", type: "real", sample: 52500, required: true },
        ],
        sampleRows: [
          { "Report Month": "Jun 2026", "SOW": "T&M CareRadius", "Line Item": "Onshore hours", "Hours": 420, "Amount (USD)": 52500 },
        ],
      },
      {
        sheetName: "Hourly Trends",
        tableName: "adm_hourly_trends",
        table: admHourlyTrendsTable,
        scopeKey: "monthLabel",
        columns: [
          { header: "Month", key: "monthLabel", type: "str", sample: "Jun 2026", required: true },
          { header: "Onshore Non-CR Hours", key: "onshoreNonCr", type: "real", sample: 5600, required: true },
          { header: "Offshore Non-CR Hours", key: "offshoreNonCr", type: "real", sample: 24000, required: true },
          { header: "Onshore CareRadius Hours", key: "onshoreCr", type: "real", sample: 420, required: true },
          { header: "Offshore CareRadius Hours", key: "offshoreCr", type: "real", sample: 2440, required: true },
        ],
        sampleRows: [
          { "Month": "Jun 2026", "Onshore Non-CR Hours": 5600, "Offshore Non-CR Hours": 24000, "Onshore CareRadius Hours": 420, "Offshore CareRadius Hours": 2440 },
        ],
      },
      {
        sheetName: "MIPS Trend",
        tableName: "adm_mips_trend",
        table: admMipsTrendTable,
        scopeKey: "monthLabel",
        columns: [
          { header: "Month", key: "monthLabel", type: "str", sample: "Jun 2026", required: true },
          { header: "Usage (K MIPS)", key: "usageK", type: "real", sample: 51, required: true },
          { header: "Baseline (K MIPS)", key: "baselineK", type: "real", sample: 96, required: true },
          { header: "Note", key: "note", type: "str", sample: "Post-optimization" },
        ],
        sampleRows: [
          { "Month": "Jun 2026", "Usage (K MIPS)": 51, "Baseline (K MIPS)": 96, "Note": "Post-optimization" },
        ],
      },
      {
        sheetName: "MIPS Insights",
        tableName: "adm_mips_insights",
        table: admMipsInsightsTable,
        scopeKey: "reportMonth",
        columns: [
          { header: "Report Month", key: "reportMonth", type: "str", sample: "Jun 2026", required: true },
          { header: "Section", key: "section", type: "str", sample: "Optimization", required: true },
          { header: "Title", key: "title", type: "str", sample: "Average usage reduced 85K → 51K", required: true },
          { header: "Detail", key: "detail", type: "str", sample: "Optimization program details…" },
          { header: "Order", key: "ord", type: "int", sample: 1, required: true },
        ],
        sampleRows: [
          { "Report Month": "Jun 2026", "Section": "Optimization", "Title": "Average usage reduced 85K → 51K", "Detail": "Batch tuning, workload re-platforming.", "Order": 1 },
        ],
      },
      {
        sheetName: "Team Composition",
        tableName: "adm_team_composition",
        table: admTeamCompositionTable,
        scopeKey: "reportMonth",
        columns: [
          { header: "Report Month", key: "reportMonth", type: "str", sample: "Jun 2026", required: true },
          { header: "Category", key: "category", type: "str", sample: "Technology Mix", required: true },
          { header: "Label", key: "label", type: "str", sample: "Java / Spring", required: true },
          { header: "Value", key: "value", type: "real", sample: 28, required: true },
          { header: "Unit", key: "unit", type: "str", sample: "%", required: true },
          { header: "Note", key: "note", type: "str", sample: "" },
        ],
        sampleRows: [
          { "Report Month": "Jun 2026", "Category": "Technology Mix", "Label": "Java / Spring", "Value": 28, "Unit": "%", "Note": "" },
        ],
      },
      {
        sheetName: "Other Updates",
        tableName: "adm_other_updates",
        table: admOtherUpdatesTable,
        scopeKey: "reportMonth",
        columns: [
          { header: "Report Month", key: "reportMonth", type: "str", sample: "Jun 2026", required: true },
          { header: "Title", key: "title", type: "str", sample: "NSA/NSSD medical record review", required: true },
          { header: "Detail", key: "detail", type: "str", sample: "Progress overview…" },
          { header: "Status", key: "status", type: "str", sample: "In Progress", required: true },
        ],
        sampleRows: [
          { "Report Month": "Jun 2026", "Title": "NSA/NSSD medical record review", "Detail": "Review pipeline on track.", "Status": "In Progress" },
        ],
      },
    ],
  },
};

void STATUS_NOTE;
