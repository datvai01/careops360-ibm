import * as XLSX from "xlsx";

function safeVal(v: unknown): string | number {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return v;
  return String(v);
}

function addSheet(wb: XLSX.WorkBook, name: string, rows: Record<string, unknown>[]) {
  if (!rows || rows.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  // Style header row width
  const cols = Object.keys(rows[0]);
  ws["!cols"] = cols.map((k) => ({ wch: Math.max(k.length + 2, 16) }));
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
}

function fmtDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function exportAllDashboardsToExcel(data: {
  executiveKpis?: Record<string, unknown> | null;
  operationsSnapshot?: Record<string, unknown>[] | null;
  alerts?: Record<string, unknown>[] | null;
  claimsKpis?: Record<string, unknown> | null;
  claimsQueue?: Record<string, unknown>[] | null;
  denialReasons?: Record<string, unknown>[] | null;
  claimsByLob?: Record<string, unknown>[] | null;
  priorAuthKpis?: Record<string, unknown> | null;
  priorAuthAging?: Record<string, unknown>[] | null;
  topProcedures?: Record<string, unknown>[] | null;
  reviewerWorkload?: Record<string, unknown>[] | null;
  enrollmentKpis?: Record<string, unknown> | null;
  enrollmentExceptions?: Record<string, unknown>[] | null;
  appList?: Record<string, unknown>[] | null;
  incidents?: Record<string, unknown>[] | null;
  batchJobs?: Record<string, unknown>[] | null;
  interfaceHealth?: Record<string, unknown>[] | null;
  ibmAmsKpis?: Record<string, unknown> | null;
  automationRunbooks?: Record<string, unknown>[] | null;
  costSavings?: Record<string, unknown>[] | null;
  roadmapInitiatives?: Record<string, unknown>[] | null;
}) {
  const wb = XLSX.utils.book_new();

  // ── SHEET 1: Executive Summary KPIs ─────────────────────────────────────
  const execRows: Record<string, unknown>[] = [];
  if (data.executiveKpis) {
    const k = data.executiveKpis as Record<string, unknown>;
    execRows.push(
      { Metric: "Active Members", Value: safeVal(k.activeMembers), Unit: "members", Dashboard: "Executive Overview" },
      { Metric: "Claims Settled", Value: safeVal(k.claimsSettled), Unit: "claims", Dashboard: "Executive Overview" },
      { Metric: "Prior Auth Requests", Value: safeVal(k.priorAuthRequests), Unit: "requests", Dashboard: "Executive Overview" },
      { Metric: "App Availability", Value: safeVal(k.appAvailability), Unit: "%", Dashboard: "Executive Overview" },
      { Metric: "SLA Attainment", Value: safeVal(k.slaAttainment), Unit: "%", Dashboard: "Executive Overview" },
      { Metric: "Critical Incidents", Value: safeVal(k.criticalIncidents), Unit: "incidents", Dashboard: "Executive Overview" },
      { Metric: "Automation Savings YTD", Value: safeVal(k.automationSavings), Unit: "USD", Dashboard: "Executive Overview" },
      { Metric: "Call Center ASA", Value: safeVal(k.callCenterAsa), Unit: "seconds", Dashboard: "Executive Overview" },
    );
  }
  if (execRows.length > 0) addSheet(wb, "Executive KPIs", execRows);

  // ── SHEET 2: Alerts ───────────────────────────────────────────────────────
  if (data.alerts && data.alerts.length > 0) {
    addSheet(wb, "Alerts", data.alerts.map((a) => ({
      "Alert ID": safeVal(a.id),
      Title: safeVal(a.title),
      Description: safeVal(a.description),
      Severity: safeVal(a.severity),
      Status: safeVal(a.status),
      Source: safeVal(a.source),
      Timestamp: safeVal(a.timestamp),
    })));
  }

  // ── SHEET 3: Claims KPIs ──────────────────────────────────────────────────
  const claimsKpiRows: Record<string, unknown>[] = [];
  if (data.claimsKpis) {
    const k = data.claimsKpis as Record<string, unknown>;
    claimsKpiRows.push(
      { Metric: "Claims Received Today", Value: safeVal(k.receivedToday), Unit: "claims" },
      { Metric: "In Adjudication", Value: safeVal(k.inAdjudication), Unit: "claims" },
      { Metric: "Claims Settled", Value: safeVal(k.settled), Unit: "claims" },
      { Metric: "Claims Pending", Value: safeVal(k.pending), Unit: "claims" },
      { Metric: "Claims Denied", Value: safeVal(k.denied), Unit: "claims" },
      { Metric: "Total $ Processed", Value: safeVal(k.totalDollarProcessed), Unit: "USD" },
      { Metric: "Auto-Adjudication Rate", Value: safeVal(k.autoAdjudicationRate), Unit: "%" },
      { Metric: "Avg Turnaround Days", Value: safeVal(k.avgTurnaroundDays), Unit: "days" },
    );
  }
  if (claimsKpiRows.length > 0) addSheet(wb, "Claims KPIs", claimsKpiRows);

  // ── SHEET 4: Claims Queue ─────────────────────────────────────────────────
  if (data.claimsQueue && data.claimsQueue.length > 0) {
    addSheet(wb, "Claims Queue", data.claimsQueue.map((c) => ({
      "Claim ID": safeVal(c.claimId),
      Member: safeVal(c.memberName),
      Provider: safeVal(c.providerName),
      "Line of Business": safeVal(c.lineOfBusiness),
      Amount: safeVal(c.amount),
      Status: safeVal(c.status),
      "Aging (days)": safeVal(c.agingDays),
      "Submitted Date": safeVal(c.submittedDate),
    })));
  }

  // ── SHEET 5: Denial Reasons ───────────────────────────────────────────────
  if (data.denialReasons && data.denialReasons.length > 0) {
    addSheet(wb, "Denial Reasons", data.denialReasons.map((d) => ({
      "Denial Code": safeVal(d.denialCode),
      "Denial Reason": safeVal(d.reason),
      Count: safeVal(d.count),
      "% of Total": safeVal(d.percentage),
      Trend: safeVal(d.trend),
    })));
  }

  // ── SHEET 6: Claims by Line of Business ──────────────────────────────────
  if (data.claimsByLob && data.claimsByLob.length > 0) {
    addSheet(wb, "Claims by LOB", data.claimsByLob.map((l) => ({
      "Line of Business": safeVal(l.lineOfBusiness),
      Volume: safeVal(l.volume),
      "Auto-Adj Rate": safeVal(l.autoAdjRate),
      "Avg TAT": safeVal(l.avgTat),
      "Denial Rate": safeVal(l.denialRate),
    })));
  }

  // ── SHEET 7: Prior Auth KPIs ──────────────────────────────────────────────
  const paKpiRows: Record<string, unknown>[] = [];
  if (data.priorAuthKpis) {
    const k = data.priorAuthKpis as Record<string, unknown>;
    paKpiRows.push(
      { Metric: "Requests Received Today", Value: safeVal(k.requestsReceived), Unit: "requests" },
      { Metric: "Avg Review Hours", Value: safeVal(k.avgReviewHours), Unit: "hours" },
      { Metric: "Urgent Requests", Value: safeVal(k.urgentRequests), Unit: "requests" },
      { Metric: "Backlog Size", Value: safeVal(k.backlogSize), Unit: "requests" },
      { Metric: "Auto-Approval Rate", Value: safeVal(k.autoApprovalRate), Unit: "%" },
      { Metric: "Urgent SLA Compliance", Value: safeVal(k.urgentSlaCompliance), Unit: "%" },
    );
  }
  if (paKpiRows.length > 0) addSheet(wb, "Prior Auth KPIs", paKpiRows);

  // ── SHEET 8: Prior Auth Aging ─────────────────────────────────────────────
  if (data.priorAuthAging && data.priorAuthAging.length > 0) {
    addSheet(wb, "Prior Auth Aging", data.priorAuthAging.map((a) => ({
      "Auth ID": safeVal(a.authId),
      Member: safeVal(a.memberName),
      Provider: safeVal(a.providerName),
      Procedure: safeVal(a.procedure),
      Status: safeVal(a.status),
      "Days Open": safeVal(a.daysOpen),
      Priority: safeVal(a.priority),
    })));
  }

  // ── SHEET 9: Top Procedures ───────────────────────────────────────────────
  if (data.topProcedures && data.topProcedures.length > 0) {
    addSheet(wb, "Prior Auth Procedures", data.topProcedures.map((p) => ({
      Procedure: safeVal(p.procedure),
      "Category": safeVal(p.category),
      "Approval Rate": safeVal(p.approvalRate),
      "Avg Review Days": safeVal(p.avgReviewDays),
      Volume: safeVal(p.volume),
    })));
  }

  // ── SHEET 10: Enrollment KPIs ─────────────────────────────────────────────
  const enrollKpiRows: Record<string, unknown>[] = [];
  if (data.enrollmentKpis) {
    const k = data.enrollmentKpis as Record<string, unknown>;
    enrollKpiRows.push(
      { Metric: "Time-to-Good (avg)", Value: safeVal(k.timeToGood), Unit: "hours" },
      { Metric: "Auto-Match Rate", Value: safeVal(k.autoMatchRate), Unit: "%" },
      { Metric: "Manual Intervention Rate", Value: safeVal(k.manualInterventionRate), Unit: "%" },
      { Metric: "Records in Queue", Value: safeVal(k.recordsInQueue), Unit: "records" },
      { Metric: "Failed Records", Value: safeVal(k.failedRecords), Unit: "records" },
      { Metric: "SLA Compliance", Value: safeVal(k.slaCompliance), Unit: "%" },
    );
  }
  if (enrollKpiRows.length > 0) addSheet(wb, "Enrollment KPIs", enrollKpiRows);

  // ── SHEET 11: Enrollment Exceptions ──────────────────────────────────────
  if (data.enrollmentExceptions && data.enrollmentExceptions.length > 0) {
    addSheet(wb, "Enrollment Exceptions", data.enrollmentExceptions.map((e) => ({
      "Record ID": safeVal(e.recordId),
      Member: safeVal(e.memberName),
      Channel: safeVal(e.channel),
      "Error Type": safeVal(e.errorType),
      Status: safeVal(e.status),
      "AI Resolution": safeVal(e.aiResolution),
      "Created At": safeVal(e.createdAt),
    })));
  }

  // ── SHEET 12: Application Inventory ──────────────────────────────────────
  if (data.appList && data.appList.length > 0) {
    addSheet(wb, "App Inventory", data.appList.map((a) => ({
      "App ID": safeVal(a.appId),
      "Application Name": safeVal(a.name),
      Domain: safeVal(a.domain),
      Tier: safeVal(a.tier),
      Availability: safeVal(a.availability),
      "Stack Version": safeVal(a.stackVersion),
      "n-1 Compliant": safeVal(a.nMinusOneCompliant),
      Status: safeVal(a.status),
      Owner: safeVal(a.owner),
    })));
  }

  // ── SHEET 13: Active Incidents ────────────────────────────────────────────
  if (data.incidents && data.incidents.length > 0) {
    addSheet(wb, "Active Incidents", data.incidents.map((i) => ({
      "Incident ID": safeVal(i.incidentId),
      Title: safeVal(i.title),
      Severity: safeVal(i.severity),
      Status: safeVal(i.status),
      Application: safeVal(i.application),
      "Assigned To": safeVal(i.assignedTo),
      "MTTR Target": safeVal(i.mttrTarget),
      "Created At": safeVal(i.createdAt),
      "Auto-Resolved": safeVal(i.autoResolved),
    })));
  }

  // ── SHEET 14: Batch Jobs ──────────────────────────────────────────────────
  if (data.batchJobs && data.batchJobs.length > 0) {
    addSheet(wb, "Batch Jobs", data.batchJobs.map((b) => ({
      "Job ID": safeVal(b.jobId),
      "Job Name": safeVal(b.name),
      Status: safeVal(b.status),
      "Start Time": safeVal(b.startTime),
      "End Time": safeVal(b.endTime),
      "Duration (min)": safeVal(b.durationMinutes),
      "Records Processed": safeVal(b.recordsProcessed),
    })));
  }

  // ── SHEET 15: IBM AIOps KPIs ──────────────────────────────────────────────
  const amsKpiRows: Record<string, unknown>[] = [];
  if (data.ibmAmsKpis) {
    const k = data.ibmAmsKpis as Record<string, unknown>;
    amsKpiRows.push(
      { Metric: "Shift-Left Rate", Value: safeVal(k.shiftLeftRate), Unit: "%" },
      { Metric: "Self-Heal Events (MTD)", Value: safeVal(k.selfHealEvents), Unit: "events" },
      { Metric: "Automation Runbooks", Value: safeVal(k.automationRunbooks), Unit: "runbooks" },
      { Metric: "Defect Leakage", Value: safeVal(k.defectLeakage), Unit: "%" },
      { Metric: "YTD Cost Reduction", Value: safeVal(k.ytdCostReduction), Unit: "USD" },
      { Metric: "Cost Avoidance (MTD)", Value: safeVal(k.costAvoidance), Unit: "USD" },
      { Metric: "P3/P4 Auto-Resolution Rate", Value: safeVal(k.autoResolutionRate), Unit: "%" },
      { Metric: "Alert Noise Reduction", Value: safeVal(k.alertNoiseReduction), Unit: "%" },
    );
  }
  if (amsKpiRows.length > 0) addSheet(wb, "AIOps KPIs", amsKpiRows);

  // ── SHEET 16: Automation Runbooks ─────────────────────────────────────────
  if (data.automationRunbooks && data.automationRunbooks.length > 0) {
    addSheet(wb, "Automation Runbooks", data.automationRunbooks.map((r) => ({
      "Runbook ID": safeVal(r.runbookId),
      Title: safeVal(r.title),
      Category: safeVal(r.category),
      "Times Executed": safeVal(r.timesExecuted),
      "Success Rate": safeVal(r.successRate),
      "Avg Time Saved (min)": safeVal(r.avgTimeSavedMinutes),
      "Last Updated": safeVal(r.lastUpdated),
    })));
  }

  // ── SHEET 17: Cost Savings ────────────────────────────────────────────────
  if (data.costSavings && data.costSavings.length > 0) {
    addSheet(wb, "Cost Savings", data.costSavings.map((c) => ({
      Month: safeVal(c.month),
      "Shift-Left Savings": safeVal(c.shiftLeftSavings),
      "Self-Heal Savings": safeVal(c.selfHealSavings),
      "Automation Savings": safeVal(c.automationSavings),
      "Total Savings": safeVal(c.totalSavings),
    })));
  }

  // ── SHEET 18: Transformation Roadmap ─────────────────────────────────────
  if (data.roadmapInitiatives && data.roadmapInitiatives.length > 0) {
    addSheet(wb, "Transformation Roadmap", data.roadmapInitiatives.map((i) => ({
      "Initiative ID": safeVal(i.jiraId || i.id),
      Title: safeVal(i.title),
      Type: safeVal(i.type),
      Domain: safeVal(i.domain),
      Phase: safeVal(i.phase),
      Status: safeVal(i.status),
      Priority: safeVal(i.priority),
      Owner: safeVal(i.owner),
      "Start Date": safeVal(i.startDate),
      "Target Date": safeVal(i.targetDate),
      "% Complete": safeVal(i.percentComplete),
      "Business Impact": safeVal(i.businessImpact),
      "Expected Outcome": safeVal(i.expectedOutcome),
    })));
  }

  // ── SHEET 19: Export Metadata ─────────────────────────────────────────────
  addSheet(wb, "Export Info", [
    { Field: "Export Date", Value: new Date().toISOString() },
    { Field: "Portal", Value: "CareOps360 — Horizon BCBS × IBM" },
    { Field: "Classification", Value: "CONFIDENTIAL — IBM & Horizon Internal Use Only" },
    { Field: "Generated By", Value: "CareOps360 Executive Data Export" },
    { Field: "Sheets Included", Value: "Executive KPIs, Alerts, Claims, Prior Auth, Enrollment, App Inventory, Incidents, AIOps, Roadmap" },
    { Field: "Data Note", Value: "Demonstration environment — synthetic data only. Live metrics upon production go-live." },
  ]);

  // Write file
  XLSX.writeFile(wb, `CareOps360_Horizon_Export_${fmtDate()}.xlsx`);
}
