#!/usr/bin/env python3
"""Generate CareOps360 Data Mapping & Feasibility workbook.

For every visible element in the portal (excluding the Transformation Roadmap
tab and the Ask-the-Dashboard assistant), this workbook documents:

  - the metric / element shown on the page
  - where it lives today (DB table.column on Replit Postgres)
  - where it will be sourced from in the Horizon target state
  - feasibility (Easy / Medium / Difficult)
  - the recommended initial approach (manual extract, API, etc.)

Output: out/CareOps360_Data_Mapping_Feasibility.xlsx
"""

from __future__ import annotations

from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "out"
OUT_DIR.mkdir(parents=True, exist_ok=True)
XLSX_PATH = OUT_DIR / "CareOps360_Data_Mapping_Feasibility.xlsx"

NAVY = "FF232F3E"
ORANGE = "FFFF9900"
SUBHEAD = "FFE6ECF2"
ALT = "FFF7F9FB"
EASY = "FFD7EAD9"
MED = "FFFFF1C2"
HARD = "FFF8D7DA"

THIN = Side(style="thin", color="FFBFBFBF")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)

HEADER_FONT = Font(name="Calibri", size=11, bold=True, color="FFFFFFFF")
HEADER_FILL = PatternFill("solid", fgColor=NAVY)
BODY_FONT = Font(name="Calibri", size=10)
WRAP = Alignment(wrap_text=True, vertical="top", horizontal="left")
CENTER = Alignment(horizontal="center", vertical="center", wrap_text=True)


# ---------------------------------------------------------------------------
# Per-dashboard summary (matches the user's reference screenshot format)
# ---------------------------------------------------------------------------
SUMMARY_ROWS = [
    {
        "dashboard": "Executive Overview",
        "metrics": "Members served, claims processed (30d), denial rate, contact ASA, app availability, open Sev-1, revenue / claim, alerts feed, AI insights",
        "source": "Aggregated from Core Admin (Facets/QNXT), Claims, CCaaS (NICE/Genesys), AppDynamics/Splunk; Bedrock for AI insights",
        "feasibility": "Medium",
        "approach": "Curated daily aggregate via API + EventBridge stream into Aurora; Bedrock summarisation for the AI insights panel",
    },
    {
        "dashboard": "Member Enrollment",
        "metrics": "Active members, new enrollments, churn, product mix (Commercial / MA / Medicaid / FEP), region split, exception queue",
        "source": "Core Admin System (Facets / QNXT), Enrollment / Eligibility 834 feeds",
        "feasibility": "Medium",
        "approach": "Weekly manual CSV from enrollment reports → S3 ingest; phase 2: nightly 834 feed via SFTP + Glue",
    },
    {
        "dashboard": "Claims Operations",
        "metrics": "Claims processed, pending, TAT, settlement value, denial reasons, aging buckets, LOB breakdown",
        "source": "Claims System (Facets Claims / QNXT Claims)",
        "feasibility": "Medium",
        "approach": "Weekly report dump to S3; automate later via Claims API + DMS to Aurora",
    },
    {
        "dashboard": "Prior Authorization",
        "metrics": "PA volume, approval rate, turnaround time, backlog aging, top procedures, reviewer workload",
        "source": "UM / PA system (e.g., MedHOK, Guiding Care, Availity)",
        "feasibility": "Difficult",
        "approach": "Start with limited metrics via manual reporting; phase 2: API/HL7 FHIR PriorAuth endpoint",
    },
    {
        "dashboard": "Provider Operations",
        "metrics": "Active providers, onboarding status, credentialing pipeline, network coverage, provider issues",
        "source": "Provider Management System (e.g., Cactus, Symplr, IntelliCred)",
        "feasibility": "Easy",
        "approach": "Weekly export; mostly static data — daily delta load via Glue",
    },
    {
        "dashboard": "Contact Center",
        "metrics": "Call volume, ASA, AHT, FCR, abandonment %, top call reasons, hourly distribution",
        "source": "CCaaS (NICE CXone / Genesys Cloud / Verint)",
        "feasibility": "Easy",
        "approach": "Direct integration via vendor API or weekly report; Kinesis for near-real-time hourly metrics",
    },
    {
        "dashboard": "Vendor Invoice & Billing",
        "metrics": "Invoice status, aging, approvals, work-order spend (Managed Services / Flex Services)",
        "source": "Finance / Ariba / Workday",
        "feasibility": "Medium",
        "approach": "Manual upload weekly from finance extracts; phase 2: Ariba API + Workday Financials connector",
    },
    {
        "dashboard": "Application Health",
        "metrics": "Uptime, incidents, MTTR, SLA compliance, batch jobs, interface health",
        "source": "Monitoring tools (Dynatrace, Splunk, AppDynamics, ServiceNow ITSM)",
        "feasibility": "Easy",
        "approach": "Direct integration via Dynatrace/Splunk APIs; ServiceNow REST for incidents; CloudWatch for AWS-native apps",
    },
    {
        "dashboard": "IBM AMS Value",
        "metrics": "Ticket trends, automation runbooks, cost savings, deflection rate",
        "source": "IBM AMS reporting (ServiceNow + IBM internal scorecards)",
        "feasibility": "Medium",
        "approach": "Monthly scorecard upload; phase 2: ServiceNow REST API for ticket trends",
    },
    {
        "dashboard": "Capability Uplift / Talent Plan",
        "metrics": "Skill heatmap, role transformation, training hours, AI cert counts, governance posture, value impact",
        "source": "IBM Workforce systems + Horizon HRIS (Workday HCM)",
        "feasibility": "Medium",
        "approach": "Quarterly Excel upload via Administration page; phase 2: Workday HCM API + IBM Your Learning API",
    },
    {
        "dashboard": "Administration",
        "metrics": "Dataset upload registry, last-refresh metadata, version, uploader, row counts",
        "source": "Internal — generated by the platform itself",
        "feasibility": "Easy",
        "approach": "Already implemented end-to-end (S3 for source files, RDS for metadata, IAM-gated admin role)",
    },
]


# ---------------------------------------------------------------------------
# Element-level mapping per dashboard
# Columns: section, element, current_db, target_source, feasibility, approach
# current_db format: "table.column" or "table (multi-col)" or "API endpoint"
# ---------------------------------------------------------------------------
DASHBOARDS: list[dict] = [
    {
        "name": "Executive Overview",
        "page": "/dashboard",
        "elements": [
            ("KPI Tiles", "Members Served",
             "page_kpis.value (kpi_key='members_served', page='executive')",
             "Core Admin (Facets/QNXT) → membership snapshot",
             "Medium",
             "Daily aggregate API → Aurora; tile reads from materialized view"),
            ("KPI Tiles", "Claims Processed (30d)",
             "page_kpis.value (kpi_key='claims_processed_30d')",
             "Claims System (Facets Claims / QNXT)",
             "Medium",
             "Daily roll-up job; sourced from claims fact table in Aurora"),
            ("KPI Tiles", "Denial Rate %",
             "page_kpis.value (kpi_key='denial_rate')",
             "Claims System — denial reason codes (CARC/RARC)",
             "Medium",
             "Daily aggregate; computed from claims fact + denial dim"),
            ("KPI Tiles", "Avg Speed of Answer (ASA)",
             "page_kpis.value (kpi_key='asa_seconds')",
             "CCaaS (NICE CXone / Genesys)",
             "Easy",
             "Vendor analytics API hourly"),
            ("KPI Tiles", "App Availability %",
             "page_kpis.value (kpi_key='app_availability')",
             "Dynatrace / AppDynamics / CloudWatch",
             "Easy",
             "Synthetic monitor + Dynatrace API"),
            ("KPI Tiles", "Open Sev-1 Incidents",
             "page_kpis.value (kpi_key='open_sev1')",
             "ServiceNow ITSM",
             "Easy",
             "ServiceNow REST poll every 5 min"),
            ("Charts", "Daily Trend (claims, members, calls)",
             "daily_trends (date, claims, members, calls)",
             "Aggregated from Claims + Core Admin + CCaaS",
             "Medium",
             "Nightly batch into Aurora; chart reads last 30 days"),
            ("Alerts Panel", "Executive Alerts feed",
             "executive_alerts (id, severity, title, body, created_at)",
             "ServiceNow + custom rules engine on Bedrock",
             "Medium",
             "EventBridge rules → Lambda → alerts table; Bedrock summarises"),
            ("AI Insights", "AI Insights cards",
             "ai_insights (id, title, insight, recommendation, confidence)",
             "Amazon Bedrock (Claude/Titan) over claims + ops data",
             "Difficult",
             "Phase 2: Bedrock Knowledge Base over RDS + Lambda generator"),
        ],
    },
    {
        "name": "Member Enrollment",
        "page": "/dashboard/members",
        "elements": [
            ("KPI Tiles", "Total Active Members",
             "Aggregated from member_enrollments.member_count",
             "Core Admin System (Facets / QNXT)",
             "Medium",
             "Weekly CSV → S3 → Glue → Aurora"),
            ("KPI Tiles", "New Enrollments (MTD)",
             "member_enrollments.new_enrollments",
             "834 enrollment feed from broker / federal exchange",
             "Medium",
             "Nightly 834 SFTP → AWS Transfer Family → Glue"),
            ("KPI Tiles", "Churn %",
             "Computed from member_enrollments.terminations",
             "Core Admin terminations file",
             "Medium",
             "Daily delta from Facets disenrollment report"),
            ("Charts", "Enrollment trend by month",
             "member_enrollments (month, member_count, new_enrollments, terminations)",
             "Core Admin monthly close",
             "Medium",
             "Monthly batch from Facets warehouse"),
            ("Charts", "Product mix (Commercial/MA/Medicaid/FEP)",
             "member_enrollments.product",
             "Core Admin product master",
             "Easy",
             "Joined to product dim table; static reference"),
            ("Charts", "Region split (NJ counties)",
             "member_enrollments.region",
             "Core Admin geo / ZIP rollup",
             "Easy",
             "Joined to geo dim"),
            ("Exception Queue", "Member exceptions list",
             "member_exceptions (id, member_id, exception_type, status, opened_at)",
             "Core Admin exceptions report + Eligibility errors",
             "Medium",
             "Daily extract via API or nightly file"),
        ],
    },
    {
        "name": "Claims Operations",
        "page": "/dashboard/claims",
        "elements": [
            ("KPI Tiles", "Claims Processed",
             "Count from claims table (status='processed')",
             "Claims System (Facets / QNXT)",
             "Medium",
             "Nightly batch from Claims warehouse → Aurora"),
            ("KPI Tiles", "Pending Claims",
             "Count from claims (status='pending')",
             "Claims System work-in-progress queue",
             "Medium",
             "Hourly delta via Claims API"),
            ("KPI Tiles", "Avg TAT (days)",
             "Computed from claims (date_received, date_paid)",
             "Claims System",
             "Medium",
             "Materialized view in Aurora"),
            ("KPI Tiles", "Settlement Value",
             "Sum of claims.paid_amount",
             "Claims System payments ledger",
             "Medium",
             "Daily reconciliation with Treasury"),
            ("Queue", "Claims queue (top 100)",
             "claims (claim_id, member_id, provider, amount, status, ...)",
             "Claims System OLTP",
             "Medium",
             "Read-replica of Facets Claims via DMS"),
            ("Charts", "Denial reasons breakdown",
             "claims_denial_reasons (reason_code, count, pct)",
             "CARC/RARC codes from Claims System",
             "Medium",
             "Weekly aggregate in Aurora"),
            ("Charts", "Aging buckets (0-30 / 31-60 / 61-90 / 90+)",
             "claims_aging (bucket, count, value)",
             "Claims System",
             "Easy",
             "Computed in materialized view"),
            ("Charts", "LOB breakdown (Commercial/MA/Medicaid/FEP)",
             "claims_lob_stats (lob, count, value, denial_rate)",
             "Claims System + product dim",
             "Easy",
             "Aurora aggregate"),
        ],
    },
    {
        "name": "Prior Authorization",
        "page": "/dashboard/prior-auth",
        "elements": [
            ("KPI Tiles", "PA Volume (MTD)",
             "Aggregated from priorauth_aging",
             "UM/PA system (MedHOK / Guiding Care / Availity)",
             "Difficult",
             "Phase 1: monthly manual extract; Phase 2: HL7 FHIR PriorAuth API"),
            ("KPI Tiles", "Approval Rate %",
             "Computed from priorauth_aging.status",
             "UM/PA system case outcomes",
             "Difficult",
             "Same as above"),
            ("KPI Tiles", "Avg Turnaround (hrs)",
             "priorauth_aging (request_at, decision_at)",
             "UM/PA system case timeline",
             "Difficult",
             "Phase 2: real-time via FHIR Subscription"),
            ("Charts", "Backlog aging by bucket",
             "priorauth_aging (bucket, count)",
             "UM/PA backlog report",
             "Medium",
             "Daily extract"),
            ("Charts", "Top procedures (CPT)",
             "priorauth_procedures (cpt_code, count, approval_rate)",
             "UM/PA + CPT reference",
             "Medium",
             "Weekly extract joined with CPT dim"),
            ("Table", "Reviewer workload",
             "priorauth_reviewers (reviewer_id, name, open_cases, avg_decision_time)",
             "UM/PA reviewer assignment data",
             "Medium",
             "Daily snapshot"),
        ],
    },
    {
        "name": "Provider Operations",
        "page": "/dashboard/providers",
        "elements": [
            ("KPI Tiles", "Active Providers",
             "Count from providers (status='active')",
             "Provider Management System (Cactus / Symplr / IntelliCred)",
             "Easy",
             "Weekly export → S3 → Glue"),
            ("KPI Tiles", "Pending Credentialing",
             "Count from providers (credentialing_status='pending')",
             "Credentialing module of Provider Mgmt",
             "Easy",
             "Weekly export"),
            ("Directory", "Provider directory",
             "providers (provider_id, name, npi, specialty, network, status, ...)",
             "Provider Management System",
             "Easy",
             "Weekly snapshot via DMS / CDC"),
            ("Issues", "Provider issues list",
             "provider_issues (id, provider_id, issue_type, status, opened_at)",
             "ServiceNow case + Provider Mgmt issues",
             "Easy",
             "Daily extract"),
        ],
    },
    {
        "name": "Contact Center",
        "page": "/dashboard/contact-center",
        "elements": [
            ("KPI Tiles", "Call Volume (today)",
             "Sum from contactcenter_hourly.calls",
             "CCaaS (NICE CXone / Genesys / Verint)",
             "Easy",
             "Vendor real-time API → Kinesis → Aurora"),
            ("KPI Tiles", "Avg Speed of Answer (ASA)",
             "Computed from contactcenter_hourly",
             "CCaaS reporting",
             "Easy",
             "Hourly API pull"),
            ("KPI Tiles", "First Call Resolution (FCR) %",
             "Computed from contactcenter_hourly.fcr",
             "CCaaS + CRM (Salesforce Health Cloud)",
             "Medium",
             "Daily aggregate combining CCaaS + CRM disposition"),
            ("KPI Tiles", "Abandonment %",
             "contactcenter_hourly.abandonment_rate",
             "CCaaS",
             "Easy",
             "Hourly API pull"),
            ("Charts", "Hourly call distribution",
             "contactcenter_hourly (hour, calls, asa, aht, fcr, abandonment_rate)",
             "CCaaS hourly stats",
             "Easy",
             "Hourly Lambda → Aurora"),
            ("Charts", "Top call reasons",
             "contactcenter_call_reasons (reason, count, pct)",
             "CCaaS disposition codes + CRM categorisation",
             "Medium",
             "Daily aggregate"),
        ],
    },
    {
        "name": "Vendor Invoice & Billing",
        "page": "/dashboard/vendor-invoices",
        "elements": [
            ("KPI Tiles", "Total Invoiced (MTD)",
             "Sum from finance_billing_exceptions / invoices",
             "Workday Financials / SAP Ariba",
             "Medium",
             "Weekly manual upload via Administration; phase 2: Ariba API"),
            ("KPI Tiles", "Open Invoices",
             "Count from invoices (status in ('submitted','pending'))",
             "Ariba invoice queue",
             "Medium",
             "Same as above"),
            ("KPI Tiles", "Aging > 60 days",
             "Computed from invoices.invoice_date",
             "Ariba aging report",
             "Medium",
             "Same as above"),
            ("Table", "Work orders (Managed Services WO-MS-101..104, Flex WO-FS-201..204)",
             "invoices joined to work_orders (wo_id, vendor, scope, amount, status)",
             "Ariba contract / SOW master + Workday PO",
             "Medium",
             "Quarterly SOW upload + monthly PO sync"),
            ("Charts", "Premium revenue trend (context)",
             "finance_premium_trend (month, premium, paid_claims, mlr)",
             "Workday Financials + Claims paid ledger",
             "Medium",
             "Monthly close"),
            ("Exceptions", "Billing exceptions",
             "finance_billing_exceptions (id, type, member_id, amount, status)",
             "Core Admin billing module",
             "Medium",
             "Daily extract"),
            ("Admin Action", "Upload Invoice (admin only)",
             "POST /api/finance/invoices/upload → S3 + invoices table",
             "Internal — files stored in S3; metadata in RDS",
             "Easy",
             "Already implemented; admin-gated"),
        ],
    },
    {
        "name": "Application Health",
        "page": "/dashboard/app-health",
        "elements": [
            ("KPI Tiles", "Apps Monitored",
             "Count from applications",
             "ServiceNow CMDB",
             "Easy",
             "Weekly CMDB sync via REST"),
            ("KPI Tiles", "Open Incidents",
             "Count from incidents (status='open')",
             "ServiceNow ITSM",
             "Easy",
             "Real-time via ServiceNow REST + EventBridge"),
            ("KPI Tiles", "Avg MTTR (hrs)",
             "incidents.mttr",
             "ServiceNow incident lifecycle",
             "Easy",
             "Daily aggregate"),
            ("Inventory", "Application inventory table",
             "applications (app_id, name, owner, status, availability, open_incidents, version, last_deployment, sla_target, sla_actual, environment, tier)",
             "ServiceNow CMDB + Dynatrace tags",
             "Easy",
             "Hourly sync"),
            ("Incidents", "Incident list",
             "incidents (incident_id, severity, title, affected_application, status, opened_at, resolved_at, mttr, root_cause, assignee)",
             "ServiceNow ITSM",
             "Easy",
             "Real-time webhook → EventBridge → Aurora"),
            ("Batch Jobs", "Batch jobs status",
             "batch_jobs (job_id, job_name, application, status, scheduled_time, start_time, end_time, duration, records_processed)",
             "Control-M / Autosys / AWS Batch",
             "Easy",
             "Scheduler API + CloudWatch Events"),
            ("Interfaces", "Interface health",
             "interfaces (interface_id, name, type, source_system, target_system, status, last_transmission, records_today, error_rate)",
             "MuleSoft / Boomi / EventBridge metrics",
             "Easy",
             "ESB metrics API"),
            ("SLA", "SLA compliance by tower",
             "sla_compliance (id, tower, target, actual, status, trend)",
             "ServiceNow SLA module + Dynatrace SLOs",
             "Easy",
             "Daily aggregate"),
        ],
    },
    {
        "name": "IBM AMS Value",
        "page": "/dashboard/ibm-ams",
        "elements": [
            ("KPI Tiles", "Tickets Resolved (MTD)",
             "Aggregated from ibmams_ticket_trends",
             "ServiceNow assigned to IBM AMS",
             "Medium",
             "ServiceNow REST query filtered by assignment_group"),
            ("KPI Tiles", "Automation Deflection %",
             "Computed from ibmams_runbooks (runs, manual_avoided)",
             "IBM Cloud Pak for AIOps + custom runbook telemetry",
             "Medium",
             "Weekly scorecard from AIOps; phase 2: API"),
            ("KPI Tiles", "Cost Savings ($)",
             "Sum from ibmams_savings_trend",
             "IBM AMS internal scorecard (Excel)",
             "Medium",
             "Monthly upload via Administration"),
            ("Charts", "Ticket trends (12 months)",
             "ibmams_ticket_trends (month, opened, resolved, backlog)",
             "ServiceNow",
             "Medium",
             "Monthly aggregate"),
            ("Table", "Runbooks executed",
             "ibmams_runbooks (runbook_id, name, runs, success_rate, manual_avoided)",
             "IBM Cloud Pak for AIOps",
             "Medium",
             "Weekly export"),
            ("Charts", "Cost savings trend",
             "ibmams_savings_trend (month, savings_usd, category)",
             "IBM AMS scorecard",
             "Medium",
             "Monthly upload"),
        ],
    },
    {
        "name": "Capability Uplift / Talent Plan",
        "page": "/dashboard/capability",
        "elements": [
            ("KPI Tiles", "Capability KPIs (8 tiles)",
             "capability_kpis (kpi_key, label, value, formatted, change, status, trend, ...)",
             "IBM Workforce + Horizon HRIS (Workday HCM)",
             "Medium",
             "Quarterly Excel upload via Administration"),
            ("Stages", "Transformation stages",
             "capability_stages (id, stage, status, start_date, end_date, owner)",
             "PMO (Jira / Planview)",
             "Medium",
             "Quarterly PMO update"),
            ("Areas", "Capability areas",
             "capability_areas (id, area, current_level, target_level, gap)",
             "IBM capability assessment",
             "Medium",
             "Quarterly assessment"),
            ("Radar", "Capability radar",
             "capability_radar (dimension, current, target)",
             "IBM capability scorecard",
             "Medium",
             "Quarterly upload"),
            ("Value Impact", "Value impact metrics",
             "capability_value_impact (metric, baseline, current, target, unit)",
             "Finance + IBM scorecard",
             "Medium",
             "Quarterly upload"),
            ("AI Certs", "AI certification counts",
             "capability_ai_certs (cert_name, count, target)",
             "IBM Your Learning + Horizon LMS",
             "Medium",
             "Monthly export from Your Learning API"),
            ("Training", "Training hours",
             "capability_training (skill, hours, attendees, completion_rate)",
             "Horizon LMS (Workday Learning)",
             "Medium",
             "Monthly export"),
            ("Governance", "Governance posture",
             "capability_governance (control, status, owner, last_reviewed)",
             "GRC tool (RSA Archer / ServiceNow GRC)",
             "Medium",
             "Quarterly attestation"),
            ("Talent Plan — Resources", "Resource roster (391 rows)",
             "talent_plan_resources / talent_resources (employee_id, name, role, current_skills, plan_*)",
             "IBM Workforce + Workday HCM",
             "Medium",
             "Quarterly Excel upload (already wired) → phase 2 Workday API"),
            ("Talent Plan — Products", "Product / portfolio mapping (59 rows)",
             "talent_products (domain, portfolio, product, application_area, current_tech, future_tech, ...)",
             "IBM Architecture catalog + Horizon EA repo",
             "Medium",
             "Quarterly upload"),
            ("Talent Plan — Skills", "Skill heatmap",
             "talent_plan_skills (skill, current, target, gap)",
             "IBM Skills Build + Horizon HRIS",
             "Medium",
             "Quarterly snapshot"),
            ("Talent Plan — Role Transformation", "Role transformation map",
             "talent_plan_role_transformation (current_role, future_role, count, plan)",
             "IBM Workforce planning",
             "Medium",
             "Quarterly snapshot"),
        ],
    },
    {
        "name": "Administration",
        "page": "/dashboard/admin",
        "elements": [
            ("Datasets", "Page-backed dataset registry (12 datasets)",
             "Internal — driven by DATASET_SCHEMAS in datasetSchemas.ts",
             "Internal — generated by the platform",
             "Easy",
             "Already implemented"),
            ("Metadata", "Last refresh / version / uploader",
             "talent_plan_meta + per-dataset meta tables",
             "Internal — captured at upload time from session",
             "Easy",
             "Already implemented"),
            ("File Storage", "Uploaded source files",
             "S3 bucket: careops360-admin-uploads/{dataset_key}/v{n}.xlsx",
             "Internal",
             "Easy",
             "Already implemented (S3 in target state; local FS today)"),
            ("Audit", "Upload audit log",
             "Application logs (Pino → CloudWatch Logs)",
             "Internal",
             "Easy",
             "CloudWatch Logs Insights query"),
        ],
    },
]


# ---------------------------------------------------------------------------
# Workbook builders
# ---------------------------------------------------------------------------
def style_header_row(ws, row: int, cols: int) -> None:
    for c in range(1, cols + 1):
        cell = ws.cell(row=row, column=c)
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
        cell.alignment = CENTER
        cell.border = BORDER
    ws.row_dimensions[row].height = 32
    ws.freeze_panes = ws.cell(row=row + 1, column=1)


def style_body(ws, start_row: int, end_row: int, cols: int) -> None:
    for r in range(start_row, end_row + 1):
        for c in range(1, cols + 1):
            cell = ws.cell(row=r, column=c)
            cell.font = BODY_FONT
            cell.alignment = WRAP
            cell.border = BORDER
        if r % 2 == 0:
            for c in range(1, cols + 1):
                if not ws.cell(row=r, column=c).fill or ws.cell(row=r, column=c).fill.fgColor.rgb in (None, "00000000"):
                    ws.cell(row=r, column=c).fill = PatternFill("solid", fgColor=ALT)


def feasibility_fill(value: str) -> PatternFill | None:
    v = (value or "").strip().lower()
    if v == "easy":
        return PatternFill("solid", fgColor=EASY)
    if v == "medium":
        return PatternFill("solid", fgColor=MED)
    if v == "difficult":
        return PatternFill("solid", fgColor=HARD)
    return None


def set_col_widths(ws, widths: list[int]) -> None:
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w


def build_summary(wb: Workbook) -> None:
    ws = wb.active
    ws.title = "Dashboard Summary"

    ws["A1"] = "CareOps360 — Dashboard Data Mapping & Feasibility"
    ws["A1"].font = Font(name="Calibri", size=16, bold=True, color=NAVY)
    ws.merge_cells("A1:E1")
    ws["A2"] = ("Source-system mapping for each portal tab. "
                "Excludes Transformation Roadmap and Ask the Dashboard (assistant).")
    ws["A2"].font = Font(name="Calibri", size=10, italic=True, color="FF555555")
    ws.merge_cells("A2:E2")

    headers = ["Dashboard", "Key Metrics", "Data Source", "Feasibility", "Initial Approach"]
    for c, h in enumerate(headers, start=1):
        ws.cell(row=4, column=c, value=h)
    style_header_row(ws, 4, len(headers))

    row = 5
    for entry in SUMMARY_ROWS:
        ws.cell(row=row, column=1, value=entry["dashboard"]).font = Font(bold=True, color=NAVY, size=11)
        ws.cell(row=row, column=2, value=entry["metrics"])
        ws.cell(row=row, column=3, value=entry["source"])
        feas_cell = ws.cell(row=row, column=4, value=entry["feasibility"])
        feas_cell.alignment = CENTER
        feas_cell.font = Font(bold=True, size=10)
        fill = feasibility_fill(entry["feasibility"])
        if fill:
            feas_cell.fill = fill
        ws.cell(row=row, column=5, value=entry["approach"])
        for c in range(1, 6):
            ws.cell(row=row, column=c).border = BORDER
            if c != 4:
                ws.cell(row=row, column=c).alignment = WRAP
        ws.row_dimensions[row].height = 60
        row += 1

    set_col_widths(ws, [28, 50, 45, 14, 55])


def safe_sheet(name: str) -> str:
    safe = name.replace("/", "-").replace(":", "-").replace("?", "")
    return safe[:31]


def build_dashboard_sheet(wb: Workbook, dash: dict) -> None:
    ws = wb.create_sheet(safe_sheet(dash["name"]))
    ws["A1"] = dash["name"]
    ws["A1"].font = Font(name="Calibri", size=16, bold=True, color=NAVY)
    ws["A2"] = f"Page: {dash['page']}   |   Element-level data mapping"
    ws["A2"].font = Font(name="Calibri", size=10, italic=True, color="FF555555")
    ws.merge_cells("A1:G1")
    ws.merge_cells("A2:G2")

    headers = [
        "Section / Widget",
        "Element / Field",
        "Current Source (DB table.column / endpoint)",
        "Target Source System",
        "Feasibility",
        "Initial Approach",
        "Owner / Notes",
    ]
    for c, h in enumerate(headers, start=1):
        ws.cell(row=4, column=c, value=h)
    style_header_row(ws, 4, len(headers))

    row = 5
    for section, element, current_db, target, feasibility, approach in dash["elements"]:
        ws.cell(row=row, column=1, value=section)
        ws.cell(row=row, column=2, value=element)
        ws.cell(row=row, column=3, value=current_db).font = Font(name="Consolas", size=9)
        ws.cell(row=row, column=4, value=target)
        feas_cell = ws.cell(row=row, column=5, value=feasibility)
        feas_cell.alignment = CENTER
        feas_cell.font = Font(bold=True, size=10)
        fill = feasibility_fill(feasibility)
        if fill:
            feas_cell.fill = fill
        ws.cell(row=row, column=6, value=approach)
        ws.cell(row=row, column=7, value="")  # owner blank
        for c in range(1, 8):
            ws.cell(row=row, column=c).border = BORDER
            if c not in (5,):
                if c == 3:
                    ws.cell(row=row, column=c).alignment = WRAP
                else:
                    ws.cell(row=row, column=c).alignment = WRAP
        ws.row_dimensions[row].height = 48
        row += 1

    set_col_widths(ws, [22, 38, 55, 38, 14, 50, 28])
    ws.auto_filter.ref = f"A4:G{row - 1}"


def build_flat(wb: Workbook) -> None:
    ws = wb.create_sheet("All Elements (Flat)")
    headers = [
        "Dashboard", "Page", "Section / Widget", "Element / Field",
        "Current Source (DB table.column / endpoint)", "Target Source System",
        "Feasibility", "Initial Approach", "Owner", "Notes",
    ]
    for c, h in enumerate(headers, start=1):
        ws.cell(row=1, column=c, value=h)
    style_header_row(ws, 1, len(headers))

    row = 2
    for dash in DASHBOARDS:
        for section, element, current_db, target, feasibility, approach in dash["elements"]:
            ws.cell(row=row, column=1, value=dash["name"]).font = Font(bold=True, color=NAVY, size=10)
            ws.cell(row=row, column=2, value=dash["page"])
            ws.cell(row=row, column=3, value=section)
            ws.cell(row=row, column=4, value=element)
            ws.cell(row=row, column=5, value=current_db).font = Font(name="Consolas", size=9)
            ws.cell(row=row, column=6, value=target)
            feas_cell = ws.cell(row=row, column=7, value=feasibility)
            feas_cell.alignment = CENTER
            feas_cell.font = Font(bold=True, size=10)
            fill = feasibility_fill(feasibility)
            if fill:
                feas_cell.fill = fill
            ws.cell(row=row, column=8, value=approach)
            for c in range(1, 11):
                ws.cell(row=row, column=c).border = BORDER
                if c != 7:
                    ws.cell(row=row, column=c).alignment = WRAP
            ws.row_dimensions[row].height = 42
            row += 1

    set_col_widths(ws, [22, 22, 20, 32, 50, 32, 12, 45, 18, 22])
    ws.auto_filter.ref = f"A1:J{row - 1}"


def build_legend(wb: Workbook) -> None:
    ws = wb.create_sheet("Legend & Notes")
    ws["A1"] = "Legend & Notes"
    ws["A1"].font = Font(size=14, bold=True, color=NAVY)

    ws["A3"] = "Feasibility scale"
    ws["A3"].font = Font(bold=True, color=NAVY)

    rows = [
        ("Easy",
         "Vendor exposes a documented API or scheduled file feed; ingest is well-understood; <2 weeks of effort.",
         EASY),
        ("Medium",
         "Requires a curated extract or ETL job; some reconciliation across systems; 2–6 weeks of effort.",
         MED),
        ("Difficult",
         "Source system has limited extract capability; needs vendor engagement, FHIR / HL7 work, or new contracts; >6 weeks.",
         HARD),
    ]
    for i, (label, desc, color) in enumerate(rows, start=4):
        c1 = ws.cell(row=i, column=1, value=label)
        c1.font = Font(bold=True)
        c1.fill = PatternFill("solid", fgColor=color)
        c1.alignment = CENTER
        c1.border = BORDER
        c2 = ws.cell(row=i, column=2, value=desc)
        c2.alignment = WRAP
        c2.border = BORDER

    ws["A9"] = "Scope notes"
    ws["A9"].font = Font(bold=True, color=NAVY)
    notes = [
        "This workbook covers every visible dashboard element in the CareOps360 portal except:",
        "  • Transformation Roadmap tab (excluded by request)",
        "  • Ask the Dashboard / AI assistant (excluded by request)",
        "Current Source column shows where data lives today inside the CareOps360 application",
        "  (PostgreSQL table.column or REST endpoint).",
        "Target Source System describes the Horizon system of record we will integrate with",
        "  in the production AWS deployment.",
        "Initial Approach is the recommended Phase-1 onboarding path; Phase-2 enhancements are noted",
        "  inline (e.g., 'phase 2: API').",
    ]
    for i, n in enumerate(notes, start=10):
        ws.cell(row=i, column=1, value=n).alignment = WRAP
        ws.merge_cells(start_row=i, start_column=1, end_row=i, end_column=4)

    set_col_widths(ws, [16, 40, 20, 40])


def main() -> None:
    wb = Workbook()
    build_summary(wb)
    for dash in DASHBOARDS:
        build_dashboard_sheet(wb, dash)
    build_flat(wb)
    build_legend(wb)
    wb.save(XLSX_PATH)
    print(f"[arb-mapping] wrote {XLSX_PATH}")
    print(f"[arb-mapping] sheets ({len(wb.sheetnames)}): {wb.sheetnames}")


if __name__ == "__main__":
    main()
