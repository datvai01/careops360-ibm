#!/usr/bin/env python3
"""Generate the CareOps360 AWS Architecture Review Board (ARB) submission as a Word .docx."""

from __future__ import annotations

import os
import zipfile
from datetime import date
from pathlib import Path

import matplotlib.patches as patches
import matplotlib.pyplot as plt
from docx import Document
from docx.enum.table import WD_ALIGN_VERTICAL
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Cm, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "out"
OUT_DIR.mkdir(parents=True, exist_ok=True)
DOCX_PATH = OUT_DIR / "CareOps360_AWS_Architecture_Review.docx"
DIAGRAM_PATH = OUT_DIR / "_aws_arch_diagram.png"

AWS_NAVY = "#232F3E"
AWS_ORANGE = "#FF9900"
AWS_TEAL = "#1A476F"
AWS_GREEN = "#3FB34F"
AWS_LIGHT = "#F2F3F3"


# -------------------------------------------------------------------------
# AWS architecture diagram (matplotlib)
# -------------------------------------------------------------------------
def render_aws_diagram(path: Path) -> None:
    fig, ax = plt.subplots(figsize=(16, 9), dpi=120)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 56)
    ax.set_axis_off()
    ax.set_facecolor("white")

    def box(x, y, w, h, label, fill, edge=AWS_NAVY, fontsize=9,
            text_color="white", ls="-", radius=0.6):
        rect = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle=f"round,pad=0.1,rounding_size={radius}",
            linewidth=1.2, edgecolor=edge, facecolor=fill, linestyle=ls,
        )
        ax.add_patch(rect)
        ax.text(x + w / 2, y + h / 2, label, ha="center", va="center",
                fontsize=fontsize, color=text_color, weight="bold", wrap=True)

    def arrow(x1, y1, x2, y2, color=AWS_NAVY):
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", color=color, lw=1.4))

    # Title bar
    ax.text(50, 54, "CareOps360 — Target AWS Deployment Architecture",
            ha="center", va="center", fontsize=15, color=AWS_NAVY, weight="bold")
    ax.text(50, 51.5,
            "Horizon BCBS Payer Command Center  •  Multi-AZ  •  HIPAA-aligned",
            ha="center", va="center", fontsize=10, color="#555")

    # External users
    box(2, 44, 14, 4, "End Users\n(Horizon Staff, IBM AMS)", "#FFFFFF",
        text_color=AWS_NAVY, edge="#888")
    box(2, 37, 14, 4, "Federated IdP\n(Horizon SSO / Azure AD)", "#FFFFFF",
        text_color=AWS_NAVY, edge="#888")

    # Edge layer
    box(20, 44, 14, 4, "Amazon Route 53\n(DNS, health checks)", AWS_ORANGE)
    box(20, 38, 14, 4, "Amazon CloudFront\n+ AWS WAF + Shield", AWS_ORANGE)

    # AWS Account / Region container
    region = patches.FancyBboxPatch(
        (37, 4), 60, 46, boxstyle="round,pad=0.2,rounding_size=1.0",
        linewidth=1.6, edgecolor=AWS_NAVY, facecolor="#FAFBFC", linestyle="--",
    )
    ax.add_patch(region)
    ax.text(67, 49, "AWS Account  •  Region us-east-1",
            ha="center", va="center", fontsize=10, color=AWS_NAVY, weight="bold")

    # VPC container
    vpc = patches.FancyBboxPatch(
        (39, 6), 56, 39, boxstyle="round,pad=0.2,rounding_size=1.0",
        linewidth=1.4, edgecolor=AWS_TEAL, facecolor="#EEF5FB",
    )
    ax.add_patch(vpc)
    ax.text(67, 43.5, "VPC  10.20.0.0/16",
            ha="center", va="center", fontsize=10, color=AWS_TEAL, weight="bold")

    # AZ-A
    az_a = patches.FancyBboxPatch(
        (40.5, 8), 26, 33, boxstyle="round,pad=0.15,rounding_size=0.6",
        linewidth=1, edgecolor="#7AA6C8", facecolor="#FFFFFF", linestyle=":",
    )
    ax.add_patch(az_a)
    ax.text(53.5, 39.5, "Availability Zone A",
            ha="center", va="center", fontsize=9, color=AWS_TEAL, weight="bold")

    # AZ-B
    az_b = patches.FancyBboxPatch(
        (67.5, 8), 26, 33, boxstyle="round,pad=0.15,rounding_size=0.6",
        linewidth=1, edgecolor="#7AA6C8", facecolor="#FFFFFF", linestyle=":",
    )
    ax.add_patch(az_b)
    ax.text(80.5, 39.5, "Availability Zone B",
            ha="center", va="center", fontsize=9, color=AWS_TEAL, weight="bold")

    # Public subnets (top of each AZ)
    box(42, 33.5, 23, 4, "Public Subnet — ALB target",
        "#D9E8F4", text_color=AWS_NAVY, edge=AWS_TEAL, fontsize=8)
    box(69, 33.5, 23, 4, "Public Subnet — ALB target",
        "#D9E8F4", text_color=AWS_NAVY, edge=AWS_TEAL, fontsize=8)

    # ALB spanning AZs (drawn as one box centered)
    box(50, 28, 34, 4, "Application Load Balancer  (HTTPS, ACM cert)",
        AWS_TEAL, fontsize=10)

    # Private subnets — ECS Fargate
    box(42, 21, 23, 5, "ECS Fargate Service\nAPI (Express/Node 24)\nAuto-scaling tasks",
        AWS_ORANGE, fontsize=8)
    box(69, 21, 23, 5, "ECS Fargate Service\nAPI (Express/Node 24)\nAuto-scaling tasks",
        AWS_ORANGE, fontsize=8)

    # Data subnets — RDS Multi-AZ
    box(42, 12, 23, 5, "Amazon RDS for PostgreSQL\nPrimary  •  Encrypted",
        AWS_GREEN, fontsize=8)
    box(69, 12, 23, 5, "Amazon RDS for PostgreSQL\nStandby  •  Sync replica",
        "#7CC98A", text_color=AWS_NAVY, edge=AWS_GREEN, fontsize=8)

    # Connections
    arrow(16, 46, 20, 46)         # users -> route53
    arrow(34, 46, 38, 46)         # route53 -> region edge (visual)
    arrow(27, 44, 27, 42)         # route53 -> cloudfront
    arrow(34, 40, 50, 30)         # cloudfront -> ALB
    arrow(53.5, 28, 53.5, 26)     # ALB -> Fargate-A
    arrow(80.5, 28, 80.5, 26)     # ALB -> Fargate-B
    arrow(53.5, 21, 53.5, 17)     # Fargate-A -> RDS-A
    arrow(80.5, 21, 80.5, 17)     # Fargate-B -> RDS-B
    arrow(65, 14.5, 69, 14.5, color=AWS_GREEN)  # RDS replication
    arrow(69, 14.5, 65, 14.5, color=AWS_GREEN)

    # Side service column (bottom strip)
    services = [
        ("Amazon S3\nStatic site +\nupload buckets", AWS_ORANGE),
        ("Amazon Cognito\nUser pools / SSO", AWS_NAVY),
        ("AWS Secrets\nManager + KMS", AWS_TEAL),
        ("CloudWatch Logs\n+ Metrics + X-Ray", AWS_NAVY),
        ("Amazon ECR\n+ CodePipeline /\nGitHub Actions OIDC", AWS_ORANGE),
        ("Amazon\nEventBridge\nScheduled jobs", AWS_TEAL),
    ]
    for i, (label, color) in enumerate(services):
        x = 2 + i * 16
        box(x, 1, 14, 5, label, color, fontsize=7.5)

    # Backplane arrow into account
    ax.annotate("", xy=(40, 22), xytext=(20, 6.5),
                arrowprops=dict(arrowstyle="-", color="#999", lw=0.8, ls=":"))

    plt.tight_layout()
    plt.savefig(path, bbox_inches="tight", facecolor="white")
    plt.close(fig)


# -------------------------------------------------------------------------
# Document helpers
# -------------------------------------------------------------------------
def set_cell_bg(cell, color_hex: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), color_hex.lstrip("#"))
    tc_pr.append(shd)


def add_heading(doc: Document, text: str, level: int = 1) -> None:
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.color.rgb = RGBColor(0x23, 0x2F, 0x3E)


def add_para(doc: Document, text: str, bold: bool = False, italic: bool = False,
             size: int = 11, align=None) -> None:
    p = doc.add_paragraph()
    if align is not None:
        p.alignment = align
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.size = Pt(size)


def add_bullets(doc: Document, items: list[str]) -> None:
    for it in items:
        doc.add_paragraph(it, style="List Bullet")


def add_table(doc: Document, headers: list[str], rows: list[list[str]],
              col_widths: list[float] | None = None,
              header_fill: str = "232F3E") -> None:
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Light Grid Accent 1"
    table.autofit = False
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = ""
        p = cell.paragraphs[0]
        run = p.add_run(h)
        run.bold = True
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        run.font.size = Pt(10)
        set_cell_bg(cell, header_fill)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    for r_idx, row in enumerate(rows, start=1):
        for c_idx, val in enumerate(row):
            cell = table.rows[r_idx].cells[c_idx]
            cell.text = ""
            run = cell.paragraphs[0].add_run(str(val))
            run.font.size = Pt(9)
    if col_widths:
        for r in table.rows:
            for c, w in zip(r.cells, col_widths):
                c.width = Cm(w)
    doc.add_paragraph()


# -------------------------------------------------------------------------
# Content
# -------------------------------------------------------------------------
DOC_TITLE = "CareOps360 — Horizon BCBS Payer Command Center"
DOC_SUBTITLE = "Application Architecture Review Board (ARB) Submission"
DOC_TARGET = "Target Platform: Amazon Web Services (AWS)"
DOC_VERSION = "1.0"
DOC_DATE = date(2026, 5, 11).strftime("%B %d, %Y")
DOC_AUTHOR = "IBM Application Management Services — CareOps360 Architecture Team"
DOC_CLASSIFICATION = "Horizon BCBS Internal — Architecture Review"

DOC_CONTROL_ROWS = [
    ["0.1", "Apr 22, 2026", "IBM AMS Architecture", "—",
     "Initial outline circulated for internal review."],
    ["0.5", "May 02, 2026", "IBM AMS Architecture", "Horizon Enterprise Architecture",
     "Added AWS service mapping, NFRs, and security/compliance sections."],
    ["0.9", "May 08, 2026", "IBM AMS Architecture", "Horizon Cloud CoE",
     "Incorporated CoE feedback on landing-zone, KMS, and observability."],
    [DOC_VERSION, DOC_DATE, DOC_AUTHOR, "Pending ARB",
     "Submission to Horizon Application Architecture Review Board."],
]

NFR_ROWS = [
    ["Availability", "API monthly availability ≥ 99.9% (excluding planned change windows). Frontend ≥ 99.95% via CloudFront edge."],
    ["Performance", "p95 dashboard tile latency ≤ 500 ms; p99 ≤ 1.2 s under 100 concurrent executive users."],
    ["Scalability", "ECS Fargate auto-scales 2 → 12 tasks on CPU and ALB request count. RDS scales vertically with read replicas for reporting."],
    ["Recoverability", "RPO ≤ 5 minutes (RDS automated backups + PITR), RTO ≤ 30 minutes (Multi-AZ failover + IaC re-deploy)."],
    ["Security", "All data in transit TLS 1.2+. All data at rest encrypted with AWS KMS CMKs. No PHI in logs."],
    ["Compliance", "HIPAA, HITRUST CSF v11 alignment, NIST 800-53 Moderate baseline, Horizon enterprise security policy."],
    ["Maintainability", "Single source of truth via OpenAPI 3.1 contract; codegen for clients and validators; ≥ 80% type coverage."],
    ["Observability", "Structured JSON logs to CloudWatch; X-Ray distributed traces; CloudWatch alarms paged via Horizon ServiceNow."],
    ["Auditability", "All admin actions (uploads, releases, holds) emit audit records retained 7 years in S3 Object Lock (compliance mode)."],
    ["Accessibility", "WCAG 2.1 AA compliance for all dashboard pages."],
]

AWS_SERVICE_ROWS = [
    ["Edge / DNS", "Amazon Route 53, AWS Certificate Manager", "DNS resolution, health-checked failover, public TLS certificates."],
    ["CDN / Edge Security", "Amazon CloudFront, AWS WAF, AWS Shield Standard", "Static asset delivery, OWASP rule sets, L3/L4 DDoS protection."],
    ["Load Balancing", "Application Load Balancer", "Path-based routing for /api, TLS termination, health checks."],
    ["Compute (API)", "Amazon ECS on AWS Fargate", "Stateless Express/Node 24 API as Fargate service, auto-scaling, blue/green deploys via CodeDeploy."],
    ["Compute (Frontend)", "Amazon S3 + CloudFront", "React/Vite static bundle hosted in versioned S3 bucket served via CloudFront with OAC."],
    ["Database", "Amazon RDS for PostgreSQL (Multi-AZ)", "Primary store for all dashboards (35+ tables); automated backups, PITR, encryption with KMS CMK."],
    ["Caching (optional)", "Amazon ElastiCache for Redis", "Hot KPI cache and rate-limit counters (Phase 2)."],
    ["Object Storage", "Amazon S3", "Admin XLSX upload archive, generated PPTX/PDF exports, audit logs (Object Lock)."],
    ["Identity", "Amazon Cognito + SAML/OIDC federation", "Federated SSO with Horizon IdP; role claims drive RBAC (executive / operations / IT / IBM AMS / admin)."],
    ["Secrets / Keys", "AWS Secrets Manager, AWS KMS", "DB credentials, API keys, JWT signing material; CMKs scoped per environment."],
    ["Observability", "Amazon CloudWatch Logs/Metrics, AWS X-Ray", "Structured Pino logs, custom KPIs, distributed traces, alarms → Horizon ServiceNow."],
    ["Eventing", "Amazon EventBridge", "Scheduled refresh jobs (e.g. nightly KPI rollups), dataset-upload notifications."],
    ["Container Registry", "Amazon ECR", "Immutable, signed (Sigstore) container images."],
    ["CI/CD", "AWS CodePipeline + CodeBuild  (or)  GitHub Actions → AWS via OIDC", "Build, test, scan, deploy to Dev → QA → Stage → Prod."],
    ["Network", "VPC, Subnets, NAT Gateway, VPC Endpoints, Security Groups", "Three-tier subnet design across two AZs; private endpoints for S3/Secrets Manager."],
    ["Governance", "AWS Organizations, AWS Config, AWS Control Tower, Security Hub, GuardDuty", "Account vending, drift detection, threat detection, compliance posture."],
]

RISK_ROWS = [
    ["R-01", "PHI exposure via misconfigured S3 bucket", "High", "Low",
     "Block Public Access at account level, mandatory Object Lock + KMS, AWS Config rule + Security Hub control."],
    ["R-02", "Single-AZ outage during failover", "Medium", "Low",
     "RDS Multi-AZ, ECS service spans ≥ 2 AZs, ALB cross-zone load balancing, chaos drills quarterly."],
    ["R-03", "Long-running admin XLSX upload blocks API", "Medium", "Medium",
     "Process uploads asynchronously via EventBridge + worker Fargate task; show job status in Administration UI."],
    ["R-04", "Vendor lock-in on AWS-only services", "Low", "Medium",
     "Use OpenTelemetry + Postgres + S3 (portable); keep IaC modular (Terraform); avoid niche AWS-only data services for core path."],
    ["R-05", "Insider misuse of admin upload (overwrites prod data)", "High", "Low",
     "All uploads versioned in S3 Object Lock, immutable audit trail, dual-control approval workflow (Phase 2)."],
    ["R-06", "Cost overrun from unbounded Fargate scaling", "Medium", "Medium",
     "Per-service max-task ceiling, AWS Budgets alerts at 60/80/100%, monthly FinOps review."],
    ["R-07", "Schema drift between Dev/Prod", "Medium", "Medium",
     "Drizzle migrations gated by CI; pre-deploy `migrate --dry-run`; production migrations require change ticket."],
    ["R-08", "Third-party AI integration leaking PHI", "High", "Low",
     "All Ask-the-Dashboard prompts pass through redaction layer; no raw member rows sent to LLM; PHI redaction unit-tested."],
]

ADRS = [
    {
        "id": "ADR-001",
        "title": "Use ECS Fargate (not EKS) for the API runtime",
        "context": (
            "The CareOps360 API is a single Node.js service with modest scaling needs and no requirement for "
            "complex pod-level orchestration, custom CRDs, or multi-tenant Kubernetes patterns. The team is already "
            "operating several Fargate-based workloads at Horizon and has limited Kubernetes operational experience."
        ),
        "decision": (
            "Run the API on Amazon ECS with the AWS Fargate launch type. Use a single ECS service per environment "
            "with auto-scaling on CPU and ALB request count. Frontend is delivered as static assets from S3 + CloudFront."
        ),
        "consequences": (
            "Lower operational overhead, no control-plane to patch, faster onboarding for delivery teams. "
            "Trade-offs: less flexibility than Kubernetes for complex networking patterns and tighter coupling to AWS. "
            "If the workload later needs heavy multi-tenant orchestration, the service layer can be re-platformed onto EKS."
        ),
    },
    {
        "id": "ADR-002",
        "title": "Adopt OpenAPI 3.1 as the single source of truth for contracts",
        "context": (
            "Multiple client surfaces (web dashboard, future mobile, batch jobs) and multiple delivery teams need "
            "a stable, versioned contract. Hand-written types drift from the server implementation."
        ),
        "decision": (
            "Maintain `lib/api-spec/openapi.yaml` as the contract. Generate React Query hooks and Zod schemas "
            "via Orval at build time. Server validates inbound and outbound payloads with the generated Zod schemas."
        ),
        "consequences": (
            "Compile-time guarantees across client and server; explicit, reviewable contract changes; first-class API portal. "
            "Trade-off: codegen step is required in CI, and contract changes are blocking for both teams — mitigated "
            "by versioned routes and additive-by-default change policy."
        ),
    },
    {
        "id": "ADR-003",
        "title": "Use Amazon RDS for PostgreSQL (Multi-AZ) instead of Aurora at Phase 1",
        "context": (
            "Initial workload is a moderate OLTP dashboard (≈ 35 tables, hundreds of writes per minute, sub-second reads). "
            "Aurora offers higher performance and faster failover at meaningfully higher cost per workload-hour."
        ),
        "decision": (
            "Use RDS for PostgreSQL with Multi-AZ for HA at Phase 1. Re-evaluate Aurora at Phase 2 once workload "
            "characteristics are measured (read-replica fan-out, IO patterns, peak concurrency)."
        ),
        "consequences": (
            "Lower cost and simpler operating model now; clear migration path to Aurora PostgreSQL-Compatible later "
            "(same wire protocol, snapshot-based migration). Trade-off: failover is ~60–120 s on RDS Multi-AZ vs "
            "~30 s on Aurora — accepted at Phase 1 given the dashboard's tolerance for brief read-only periods."
        ),
    },
    {
        "id": "ADR-004",
        "title": "Federate identity through Horizon SSO via Cognito (no local passwords in production)",
        "context": (
            "Production must align with Horizon enterprise identity policy: SSO, MFA, conditional access, and "
            "centralized de-provisioning. Local password storage is a compliance and audit liability."
        ),
        "decision": (
            "Use Amazon Cognito user pools as the federation broker, federating to Horizon's enterprise IdP via "
            "SAML 2.0 / OIDC. Application receives short-lived JWTs with role claims. Demo accounts exist in non-prod only."
        ),
        "consequences": (
            "No local credential store in production; uniform MFA and lifecycle; clean audit trail. "
            "Trade-off: federation must be in place before production cutover; non-prod retains local accounts for demos."
        ),
    },
    {
        "id": "ADR-005",
        "title": "Treat dashboard data sources as a layered model (mock → DB → SoR)",
        "context": (
            "The platform was bootstrapped with seeded/mock data so business stakeholders could validate UX before "
            "system-of-record integrations were available. Future state requires every tile to be backed by a "
            "named system of record (claims platform, member admin, contact center suite, etc.)."
        ),
        "decision": (
            "Maintain an explicit Data Source Mapping (Appendix A) covering every visible field on every tab, with "
            "two columns: Near-Term (current DB / seed) and Long-Term (target SoR). Domain owners populate the "
            "Long-Term column; integrations are delivered tab-by-tab."
        ),
        "consequences": (
            "Clear, auditable migration path from demo to production data; per-tab integration backlog is explicit; "
            "non-prod can keep mocks for training. Trade-off: requires ongoing curation of the mapping as tabs evolve."
        ),
    },
]

OPEN_QUESTIONS = [
    "Confirm AWS landing zone account assignment (workload account vs shared services account).",
    "Confirm Horizon IdP supports SAML 2.0 federation to Amazon Cognito (vs OIDC).",
    "Confirm data residency requirement: us-east-1 only, or us-east-1 + us-west-2 active/passive DR.",
    "Confirm Horizon's preferred SIEM/SOC integration (CloudWatch → Splunk vs Security Hub → ServiceNow).",
    "Confirm system-of-record owners and refresh cadence for each row in Appendix A.",
    "Confirm whether AI-assisted Ask-the-Dashboard requires an on-prem LLM vs Amazon Bedrock.",
]

# -------------------------------------------------------------------------
# Feature specifications (one per module)
# -------------------------------------------------------------------------
FEATURE_SPECS = [
    {
        "title": "Executive Overview",
        "purpose": "Give Horizon executive leadership a single-screen, near-real-time view of enterprise operational health across members, claims, prior auth, contact center, application availability, and IBM AMS value.",
        "users": ["Executive Leadership (CEO, COO)", "Operations Leadership", "IBM AMS Delivery Manager"],
        "capabilities": [
            "View 8 enterprise KPI tiles (members, claims settled $, prior auth volume, ASA, app availability, critical incidents, SLA attainment, automation savings).",
            "View daily trend charts (24h / 7d / 14d period selector) for key metrics.",
            "Read active operational alerts with severity and source.",
            "Read AI-generated narrative insights summarizing the day.",
        ],
        "kpis": [
            "Active Members, Claims Settled ($), Prior Authorization Requests, Call Center ASA, Application Availability, Critical Incidents, SLA Attainment, Automation Savings.",
            "Trend lines for the selected period.",
            "Alerts list (severity, title, source, created-at).",
            "AI Insights cards (title, body, confidence).",
        ],
        "data_inputs": [
            "GET /api/executive/kpis  → db.page_kpis (key prefix `executive.*`).",
            "GET /api/executive/trends → db.daily_trends.",
            "GET /api/executive/alerts → db.executive_alerts.",
            "GET /api/executive/snapshot → derived snapshot rollup.",
        ],
        "interactions": [
            "Period selector (24h / 7d / 14d) drives trends endpoint.",
            "Auto-refresh every 30 s via the data layer.",
            "All visitors can view; only admin can edit underlying data via Administration uploads.",
        ],
        "acceptance": [
            "All 8 KPI tiles render numeric values from the database within 1.5 s p95.",
            "Trend chart updates when the period selector changes without a page reload.",
            "Alerts list reflects the latest seeded/uploaded data after a successful Administration upload.",
            "AI insights area degrades gracefully if the AI service is unavailable.",
        ],
        "future": [
            "Wire KPIs to live system-of-record feeds (claims platform, member admin) instead of `page_kpis`.",
            "Add executive drill-down from any KPI tile into its source tab.",
            "Add anomaly detection on trends with explainable narratives.",
        ],
    },
    {
        "title": "Member Enrollment",
        "purpose": "Operational view of member enrollment: trends, distribution by product line and region, and the exception queue that needs analyst intervention.",
        "users": ["Operations Leadership", "Membership Operations", "Executive (read-only)"],
        "capabilities": [
            "View enrollment KPIs (active members, new this period, terminations, exception count).",
            "Read enrollment trend chart by day/week/month.",
            "View distribution by product line and by region.",
            "Work the enrollment exception queue.",
        ],
        "kpis": [
            "Active members, new enrollments, terminations, exception count.",
            "Enrollment trend chart (line).",
            "Members-by-product (bar/donut).",
            "Members-by-region (bar/map-style).",
            "Enrollment exceptions table (member id, type, age, status).",
        ],
        "data_inputs": [
            "GET /api/members/kpis → db.page_kpis (key prefix `members.*`).",
            "GET /api/members/enrollments → db.member_enrollments.",
            "GET /api/members/by-product, /by-region → derived from db.member_enrollments.",
            "GET /api/members/exceptions → db.member_exceptions.",
        ],
        "interactions": [
            "Filters: date range, product line, region.",
            "Exception rows expandable to show next-best-action.",
            "Admin can replace dataset via Administration → Members template.",
        ],
        "acceptance": [
            "Filters update KPIs and charts without page reload.",
            "Exception queue paginates and is sortable by age and severity.",
            "After an Administration upload of the Members dataset, KPIs reflect the new totals on next page load.",
        ],
        "future": [
            "Replace seeded enrollments with the membership system of record (e.g. Facets / HealthEdge).",
            "Add member-level drill-down with PHI access controls.",
            "Add forecasted enrollment using historical seasonality.",
        ],
    },
    {
        "title": "Claims Operations",
        "purpose": "End-to-end view of claims throughput: queue, denial reasons, aging buckets, and line-of-business breakdown.",
        "users": ["Operations Leadership", "Claims Operations Managers", "Executive (read-only)"],
        "capabilities": [
            "View claims KPIs (received, paid, denied, in-process, average TAT).",
            "Browse the claims queue with status, aging, and LOB.",
            "Read top denial reasons (with counts).",
            "View aging buckets (0–30, 31–60, 61–90, 90+).",
            "View claims by line of business.",
        ],
        "kpis": [
            "Claims KPI tiles (count and $).",
            "Claims queue table.",
            "Denial reasons (bar).",
            "Aging buckets (stacked bar).",
            "LOB breakdown (donut/bar).",
        ],
        "data_inputs": [
            "GET /api/claims/kpis → db.page_kpis (`claims.*`).",
            "GET /api/claims/queue → db.claims (paginated).",
            "GET /api/claims/denial-reasons → db.claims_denial_reasons.",
            "GET /api/claims/aging → db.claims_aging.",
            "GET /api/claims/by-line-of-business → db.claims_lob_stats.",
        ],
        "interactions": [
            "Filters: date range, line of business, status.",
            "Pagination on queue.",
            "Admin can replace dataset via Administration → Claims template.",
        ],
        "acceptance": [
            "Queue paginates within 1 s for 500-row demo and ≥ 50 k rows in production.",
            "Aging buckets always sum to total open claims.",
            "Denial reasons table is sortable by count and percent.",
        ],
        "future": [
            "Integrate live claims platform (e.g. Facets / QNXT) via CDC into RDS replica.",
            "Add denial root-cause analysis with NLP on remit-codes.",
            "Predictive aging risk score per claim.",
        ],
    },
    {
        "title": "Prior Authorization",
        "purpose": "Operational dashboard for the prior authorization workflow: KPIs, backlog aging, top procedure categories, and reviewer workload.",
        "users": ["Clinical Operations", "Utilization Management Leadership", "Operations Leadership"],
        "capabilities": [
            "View PA KPIs (open, approved, denied, average TAT, escalations).",
            "Read backlog aging by bucket.",
            "View top procedure categories.",
            "View nurse/reviewer workload.",
        ],
        "kpis": [
            "Prior auth KPI tiles.",
            "Aging chart.",
            "Top procedures table.",
            "Reviewer workload table (reviewer, open, completed today, avg TAT).",
        ],
        "data_inputs": [
            "GET /api/priorauth/kpis → db.page_kpis (`priorauth.*`).",
            "GET /api/priorauth/aging → db.priorauth_aging.",
            "GET /api/priorauth/top-procedures → db.priorauth_procedures.",
            "GET /api/priorauth/workload → db.priorauth_reviewers.",
        ],
        "interactions": [
            "Filters: date range, request type.",
            "Reviewer rows clickable for drill-down (Phase 2).",
            "Admin can replace dataset via Administration → Prior Auth template.",
        ],
        "acceptance": [
            "All four data panels render with live values.",
            "Aging buckets reconcile to KPI total open.",
            "Workload table sortable by open count and avg TAT.",
        ],
        "future": [
            "Integrate UM platform of record.",
            "Auto-route requests to least-loaded reviewer.",
            "AI-assisted clinical-criteria check for low-risk requests.",
        ],
    },
    {
        "title": "Provider Operations",
        "purpose": "Provider directory health and credentialing operations view, including the top provider service issues.",
        "users": ["Provider Network Operations", "Operations Leadership"],
        "capabilities": [
            "View provider KPIs (network size, % credentialed, % directory-validated, open issues).",
            "Browse the provider list with status.",
            "Review top provider service issues.",
        ],
        "kpis": [
            "Provider KPI tiles.",
            "Provider list table.",
            "Top provider issues list.",
        ],
        "data_inputs": [
            "GET /api/providers/kpis → db.page_kpis (`providers.*`).",
            "GET /api/providers/list → db.providers.",
            "GET /api/providers/issues → db.provider_issues.",
        ],
        "interactions": [
            "Filters: status, page.",
            "Admin can replace dataset via Administration → Providers template.",
        ],
        "acceptance": [
            "Provider list paginates and reflects status filter.",
            "Issue counts match the underlying records.",
        ],
        "future": [
            "Integrate provider data management (PDM) system of record.",
            "Add directory-accuracy automated audits with CMS-rule scoring.",
        ],
    },
    {
        "title": "Contact Center",
        "purpose": "Real-time and trailing view of the member-services contact center: ASA, FCR, abandonment, call volume, and top reasons.",
        "users": ["Contact Center Leadership", "Operations Leadership"],
        "capabilities": [
            "View contact-center KPIs.",
            "Read top call reasons.",
            "Read hourly call volume.",
        ],
        "kpis": [
            "ASA, FCR, abandonment %, total calls, repeat callers.",
            "Top call reasons table/bar.",
            "Hourly volume chart for today.",
        ],
        "data_inputs": [
            "GET /api/contactcenter/kpis → db.page_kpis (`contactcenter.*`).",
            "GET /api/contactcenter/call-reasons → db.contactcenter_call_reasons.",
            "GET /api/contactcenter/hourly-volume → db.contactcenter_hourly.",
        ],
        "interactions": [
            "Filter: date range.",
            "Admin can replace dataset via Administration → Contact Center template.",
        ],
        "acceptance": [
            "Hourly volume covers 0–23 hours and matches sum of intervals.",
            "ASA / FCR / abandonment values render with units.",
        ],
        "future": [
            "Integrate contact-center platform (NICE / Genesys) for live streaming metrics.",
            "Add agent-level coaching insights.",
        ],
    },
    {
        "title": "Vendor Invoice & Billing",
        "purpose": "IBM-scoped invoice tracking spanning Managed Services and Flex Services, with admin actions to release, hold, or mark invoices processed; extensible to other vendors.",
        "users": ["Finance Operations", "IBM AMS Delivery Manager", "Admin"],
        "capabilities": [
            "Track invoices across work orders (WO-MS-101–104, WO-FS-201–204).",
            "View aging analysis and payment status.",
            "Admin actions: release, hold, mark processed.",
            "Admin upload modal to ingest invoice data.",
        ],
        "kpis": [
            "Total billed, total paid, total open, % on-hold.",
            "Aging table.",
            "Invoice list with status pills.",
        ],
        "data_inputs": [
            "GET /api/finance/* → db.finance_billing_exceptions, db.finance_premium_trend, vendor invoice tables.",
            "Admin Upload → POST /api/admin/datasets/vendor_invoices/upload.",
        ],
        "interactions": [
            "Filters by vendor, work order, status.",
            "Upload Invoice button only renders for admin (role-gated, not just disabled).",
            "Status changes audit-logged.",
        ],
        "acceptance": [
            "Upload Invoice button is absent from DOM for non-admin users.",
            "Status change updates list and metrics within one refresh cycle.",
            "Aging buckets reconcile to total open.",
        ],
        "future": [
            "Integrate ERP system of record for invoicing.",
            "Auto-match invoices against contracts and POs.",
        ],
    },
    {
        "title": "Application Health",
        "purpose": "IT operations view of the application portfolio: inventory, incidents, batch jobs, interfaces, and SLA compliance.",
        "users": ["IT Leadership / CIO", "Application Operations", "IBM AMS Delivery Manager"],
        "capabilities": [
            "View application inventory with status.",
            "Read open and recent incidents.",
            "Monitor batch job success/failure.",
            "Monitor interfaces.",
            "Read SLA compliance.",
        ],
        "kpis": [
            "Overall availability, open incidents, MTTR, batch success rate.",
            "Apps list, incidents list, batch jobs list, interfaces list, SLA compliance table.",
        ],
        "data_inputs": [
            "GET /api/applications/list → db.applications.",
            "GET /api/applications/incidents → db.incidents.",
            "GET /api/applications/batch-jobs → db.batch_jobs.",
            "GET /api/applications/interfaces → db.interfaces.",
            "GET /api/applications/sla → db.sla_compliance.",
            "KPIs from db.page_kpis (`applications.*`).",
        ],
        "interactions": [
            "Filters: severity, status, app.",
            "Admin can replace dataset via Administration → App Health template.",
        ],
        "acceptance": [
            "Critical incidents tile reflects underlying open incidents count.",
            "Batch success rate matches sum of successful runs / total in window.",
        ],
        "future": [
            "Integrate live ITSM (ServiceNow), monitoring (Datadog/CloudWatch), and batch schedulers.",
            "Add automated incident clustering and SLA breach forecasting.",
        ],
    },
    {
        "title": "IBM AMS Value",
        "purpose": "Quantify the value delivered by IBM Application Management Services: ticket trends, automation runbooks, and cost savings.",
        "users": ["IBM AMS Delivery Manager", "Horizon IT Leadership"],
        "capabilities": [
            "View AMS KPI tiles (tickets resolved, automation runs, savings).",
            "Read ticket trend chart.",
            "Read automation runbook list with execution counts.",
            "Read savings trend.",
        ],
        "kpis": [
            "Tickets resolved, MTTR, automation runs, $ saved.",
            "Ticket trend chart.",
            "Automation runbooks list.",
            "Savings trend chart.",
        ],
        "data_inputs": [
            "GET /api/ibmams/kpis → db.page_kpis (`ibmams.*`).",
            "GET /api/ibmams/ticket-trends → db.ibmams_ticket_trends.",
            "GET /api/ibmams/automation-runbooks → db.ibmams_runbooks.",
            "GET /api/ibmams/savings → db.ibmams_savings_trend.",
        ],
        "interactions": [
            "Filters: time period.",
            "Admin can replace dataset via Administration → IBM AIOps template.",
        ],
        "acceptance": [
            "Savings trend monotonically reconciles to cumulative total.",
            "Runbook list shows last-run timestamp.",
        ],
        "future": [
            "Integrate live ServiceNow ticket feed.",
            "Connect runbook execution telemetry from AMS automation platform.",
        ],
    },
    {
        "title": "Ask the Dashboard",
        "purpose": "Conversational interface that lets executives and operations leaders ask natural-language questions about operational data and get summarized answers.",
        "users": ["Executive Leadership", "Operations Leadership", "IBM AMS Delivery Manager"],
        "capabilities": [
            "Free-form question input.",
            "Receive narrative answer with cited KPI context.",
            "View suggested follow-up questions.",
        ],
        "kpis": [
            "Question input.",
            "Answer panel.",
            "Citations / data sources used.",
        ],
        "data_inputs": [
            "AI provider integration (Bedrock / OpenAI-compatible) with PHI redaction layer.",
            "Reads aggregate KPIs from existing API endpoints; never raw PHI.",
        ],
        "interactions": [
            "User submits question; receives streaming answer.",
            "User can rate answer (thumbs up/down) for quality feedback (Phase 2).",
        ],
        "acceptance": [
            "All prompts pass through redaction before leaving the VPC.",
            "Answers cite the underlying KPI source.",
            "Service degrades to a friendly error if AI provider is unavailable.",
        ],
        "future": [
            "Add session memory and saved conversations.",
            "Add domain-specific evaluation harness for answer quality.",
        ],
    },
    {
        "title": "Capability Uplift / Talent Plan",
        "purpose": "Track the talent and capability transformation program: skill heatmap, product treemap, role transformation, AI certifications, training plans, governance.",
        "users": ["IBM AMS Delivery Manager", "Horizon HR / L&D", "Executive Leadership"],
        "capabilities": [
            "View capability KPIs and stage progress.",
            "Read skill heatmap and capability radar.",
            "View role transformation table.",
            "View AI certifications and training pipeline.",
            "Upload talent plan workbook (admin).",
        ],
        "kpis": [
            "Capability KPI tiles, stages, radar, value impact.",
            "AI certifications list, training catalog, governance posture.",
            "Talent resources, products, skills, role-transformation tables.",
        ],
        "data_inputs": [
            "GET /api/capability/* → db.capability_* tables.",
            "GET /api/talent-plan/* → db.talent_plan_*.",
            "Upload: POST /api/talent-plan/upload (XLSX).",
        ],
        "interactions": [
            "Tab navigation across sub-views (Skill Heatmap, Product Treemap, Role Transformation).",
            "Admin upload via Administration → Talent Plan workflow.",
        ],
        "acceptance": [
            "After XLSX upload, all four talent tables refresh on next load.",
            "Capability radar reflects the latest scores from db.capability_radar.",
        ],
        "future": [
            "Integrate HRIS (Workday) for live employee/role data.",
            "Personalized learning recommendations per resource.",
        ],
    },
    {
        "title": "Roadmap",
        "purpose": "Multi-year digital roadmap and portfolio view of initiatives, milestones, and status.",
        "users": ["Executive Leadership", "Portfolio Managers", "IBM AMS Delivery Manager"],
        "capabilities": [
            "View roadmap initiatives by track.",
            "Update initiative status (admin).",
            "Filter by year, owner, status.",
        ],
        "kpis": [
            "Initiative tiles by status (planned, in-flight, complete, at-risk).",
            "Roadmap table (initiative, owner, target date, status).",
        ],
        "data_inputs": [
            "GET /api/roadmap/initiatives → db.roadmap_initiatives.",
            "PATCH /api/roadmap/initiatives/:id/status (admin).",
            "Admin upload via Administration → Roadmap template.",
        ],
        "interactions": [
            "Status badge editable for admin.",
            "Filters: year, owner, status.",
        ],
        "acceptance": [
            "Status changes are audit-logged.",
            "Counts on tiles match table groupings.",
        ],
        "future": [
            "Integrate enterprise portfolio management tool (Jira Align / Planview).",
            "Add dependency graph view across initiatives.",
        ],
    },
    {
        "title": "Administration",
        "purpose": "Admin-only console for managing per-page datasets and the live Talent Plan workflow. Lets the team replace the data behind any tab via versioned XLSX uploads.",
        "users": ["Admin (admin@horizon.com)"],
        "capabilities": [
            "List 12 page-backed datasets.",
            "Download dataset templates with current data baked in.",
            "Upload new dataset workbooks to replace underlying tables.",
            "View last-refresh metadata per dataset.",
            "Operate the Talent Plan live workflow.",
        ],
        "kpis": [
            "Dataset list (left).",
            "Detail panel: Download Template, Upload, Last Refresh, post-upload import counts.",
            "Talent Plan workflow tab.",
        ],
        "data_inputs": [
            "GET /api/admin/datasets → catalog.",
            "GET /api/admin/datasets/:key/template → multi-sheet XLSX with snapshot.",
            "POST /api/admin/datasets/:key/upload → replaces rows in target tables.",
            "GET /api/admin/datasets/:key/metadata → last refresh, version.",
            "GET /api/admin/datasets/:key/download → latest stored file.",
        ],
        "interactions": [
            "Page is double-gated: nav hidden + page-level role check renders Access Denied for non-admin.",
            "After successful upload, all client caches invalidated.",
            "uploadedBy is derived from the session, not headers.",
        ],
        "acceptance": [
            "Non-admin users cannot reach the page or see the nav entry.",
            "Upload of a valid template replaces all rows in matching tables and reflects on the corresponding tab on next load.",
            "Invalid upload returns row-level validation warnings without modifying the database.",
        ],
        "future": [
            "Per-row validation preview before commit.",
            "Dual-control approval for production uploads.",
            "Webhook to notify Slack/Teams on dataset refresh.",
        ],
    },
]

# -------------------------------------------------------------------------
# Appendix A — Data Source Mapping
#   Columns: Tab, Section / Widget, Field / Metric, Type,
#   Near-Term Source (pre-filled), Long-Term Source (blank), Owner, Refresh, Notes
# -------------------------------------------------------------------------
def src(p): return p

SOURCE_MAP = [
    # Executive Overview
    ("Executive Overview", "KPI Tiles", "Active Members", "KPI",
     "db.page_kpis['executive.activeMembers']"),
    ("Executive Overview", "KPI Tiles", "Claims Settled ($)", "KPI",
     "db.page_kpis['executive.claimsSettledAmount']"),
    ("Executive Overview", "KPI Tiles", "Prior Authorization Requests", "KPI",
     "db.page_kpis['executive.priorAuthRequests']"),
    ("Executive Overview", "KPI Tiles", "Call Center ASA", "KPI",
     "db.page_kpis['executive.callCenterASA']"),
    ("Executive Overview", "KPI Tiles", "Application Availability", "KPI",
     "db.page_kpis['executive.applicationAvailability']"),
    ("Executive Overview", "KPI Tiles", "Critical Incidents", "KPI",
     "db.page_kpis['executive.criticalIncidents']"),
    ("Executive Overview", "KPI Tiles", "SLA Attainment", "KPI",
     "db.page_kpis['executive.slaAttainment']"),
    ("Executive Overview", "KPI Tiles", "Automation Savings", "KPI",
     "db.page_kpis['executive.automationSavings']"),
    ("Executive Overview", "Trends", "Daily trend series (per metric)", "Chart",
     "GET /api/executive/trends → db.daily_trends"),
    ("Executive Overview", "Alerts", "Severity, title, source, created-at", "Row",
     "GET /api/executive/alerts → db.executive_alerts"),
    ("Executive Overview", "AI Insights", "Title, body, confidence", "Row",
     "GET /api/executive/snapshot → db.ai_insights"),

    # Member Enrollment
    ("Member Enrollment", "KPI Tiles", "Active members / new / terminations / exceptions", "KPI",
     "db.page_kpis['members.*']"),
    ("Member Enrollment", "Trends", "Enrollment by day/week/month", "Chart",
     "GET /api/members/enrollments → db.member_enrollments"),
    ("Member Enrollment", "Distribution", "Members by product line", "Chart",
     "GET /api/members/by-product → derived(db.member_enrollments)"),
    ("Member Enrollment", "Distribution", "Members by region", "Chart",
     "GET /api/members/by-region → derived(db.member_enrollments)"),
    ("Member Enrollment", "Exception Queue", "Member id, type, age, status", "Row",
     "GET /api/members/exceptions → db.member_exceptions"),

    # Claims Operations
    ("Claims Operations", "KPI Tiles", "Received / paid / denied / in-process / avg TAT", "KPI",
     "db.page_kpis['claims.*']"),
    ("Claims Operations", "Queue", "Claim id, member, status, age, LOB, $", "Row",
     "GET /api/claims/queue → db.claims (paginated)"),
    ("Claims Operations", "Denials", "Reason, count, %", "Row",
     "GET /api/claims/denial-reasons → db.claims_denial_reasons"),
    ("Claims Operations", "Aging", "Bucket, count, $", "Chart",
     "GET /api/claims/aging → db.claims_aging"),
    ("Claims Operations", "By LOB", "LOB, count, $", "Chart",
     "GET /api/claims/by-line-of-business → db.claims_lob_stats"),

    # Prior Auth
    ("Prior Authorization", "KPI Tiles", "Open / approved / denied / avg TAT / escalations", "KPI",
     "db.page_kpis['priorauth.*']"),
    ("Prior Authorization", "Aging", "Bucket, count", "Chart",
     "GET /api/priorauth/aging → db.priorauth_aging"),
    ("Prior Authorization", "Top Procedures", "Procedure, count", "Row",
     "GET /api/priorauth/top-procedures → db.priorauth_procedures"),
    ("Prior Authorization", "Workload", "Reviewer, open, completed today, avg TAT", "Row",
     "GET /api/priorauth/workload → db.priorauth_reviewers"),

    # Providers
    ("Provider Operations", "KPI Tiles", "Network size / % credentialed / % validated / open issues", "KPI",
     "db.page_kpis['providers.*']"),
    ("Provider Operations", "Provider List", "NPI, name, specialty, status", "Row",
     "GET /api/providers/list → db.providers"),
    ("Provider Operations", "Issues", "Provider, issue, severity, age", "Row",
     "GET /api/providers/issues → db.provider_issues"),

    # Contact Center
    ("Contact Center", "KPI Tiles", "ASA / FCR / abandonment % / total calls", "KPI",
     "db.page_kpis['contactcenter.*']"),
    ("Contact Center", "Top Reasons", "Reason, count, %", "Row",
     "GET /api/contactcenter/call-reasons → db.contactcenter_call_reasons"),
    ("Contact Center", "Hourly Volume", "Hour 0..23, calls", "Chart",
     "GET /api/contactcenter/hourly-volume → db.contactcenter_hourly"),

    # Vendor Invoice & Billing
    ("Vendor Invoice & Billing", "KPI Tiles", "Total billed / paid / open / % on-hold", "KPI",
     "db.page_kpis['finance.*']"),
    ("Vendor Invoice & Billing", "Invoice List", "Invoice id, vendor, WO, status, $, age", "Row",
     "GET /api/finance/* → vendor invoice tables"),
    ("Vendor Invoice & Billing", "Aging", "Bucket, count, $", "Chart",
     "derived(vendor invoice tables)"),
    ("Vendor Invoice & Billing", "Admin Upload", "XLSX import", "Action",
     "POST /api/admin/datasets/vendor_invoices/upload"),

    # App Health
    ("Application Health", "KPI Tiles", "Overall availability / open incidents / MTTR / batch success", "KPI",
     "db.page_kpis['applications.*']"),
    ("Application Health", "App Inventory", "App, owner, tier, status", "Row",
     "GET /api/applications/list → db.applications"),
    ("Application Health", "Incidents", "Id, severity, app, status, opened-at", "Row",
     "GET /api/applications/incidents → db.incidents"),
    ("Application Health", "Batch Jobs", "Job, schedule, last run, status", "Row",
     "GET /api/applications/batch-jobs → db.batch_jobs"),
    ("Application Health", "Interfaces", "Interface, source, target, status", "Row",
     "GET /api/applications/interfaces → db.interfaces"),
    ("Application Health", "SLA", "Service, target, attainment", "Row",
     "GET /api/applications/sla → db.sla_compliance"),

    # IBM AMS Value
    ("IBM AMS Value", "KPI Tiles", "Tickets resolved / MTTR / automation runs / $ saved", "KPI",
     "db.page_kpis['ibmams.*']"),
    ("IBM AMS Value", "Ticket Trends", "Date, opened, closed", "Chart",
     "GET /api/ibmams/ticket-trends → db.ibmams_ticket_trends"),
    ("IBM AMS Value", "Automation Runbooks", "Runbook, runs, last run, $ saved", "Row",
     "GET /api/ibmams/automation-runbooks → db.ibmams_runbooks"),
    ("IBM AMS Value", "Savings Trend", "Date, cumulative $ saved", "Chart",
     "GET /api/ibmams/savings → db.ibmams_savings_trend"),

    # Ask the Dashboard
    ("Ask the Dashboard", "Question Input", "User question (free text)", "Action",
     "POST /api/ask  (no PHI; aggregate-only)"),
    ("Ask the Dashboard", "Answer", "Narrative answer", "Row",
     "AI provider via redaction layer"),
    ("Ask the Dashboard", "Citations", "Source KPI / endpoint", "Row",
     "Derived from answered KPIs"),

    # Capability Uplift / Talent Plan
    ("Capability Uplift", "KPIs", "Capability KPI tiles", "KPI",
     "GET /api/capability/kpis → db.capability_kpis"),
    ("Capability Uplift", "Stages", "Stage progress", "Chart",
     "GET /api/capability/stages → db.capability_stages"),
    ("Capability Uplift", "Areas", "Capability area scores", "Row",
     "GET /api/capability/areas → db.capability_areas"),
    ("Capability Uplift", "Radar", "Radar dimensions", "Chart",
     "GET /api/capability/radar → db.capability_radar"),
    ("Capability Uplift", "Value Impact", "Value impact entries", "Row",
     "GET /api/capability/value-impact → db.capability_value_impact"),
    ("Capability Uplift", "AI Certifications", "Cert, count", "Row",
     "GET /api/capability/ai-certs → db.capability_ai_certs"),
    ("Capability Uplift", "Training", "Training program rows", "Row",
     "GET /api/capability/training → db.capability_training"),
    ("Capability Uplift", "Governance", "Governance items", "Row",
     "GET /api/capability/governance → db.capability_governance"),
    ("Talent Plan", "Resources", "Resource roster", "Row",
     "GET /api/talent-plan/resources → db.talent_plan_resources"),
    ("Talent Plan", "Products", "Product allocation", "Row",
     "GET /api/talent-plan/products → db.talent_plan_products"),
    ("Talent Plan", "Skills", "Skill matrix", "Row",
     "GET /api/talent-plan/skills → db.talent_plan_skills"),
    ("Talent Plan", "Role Transformation", "From-role / to-role / count", "Row",
     "GET /api/talent-plan/role-transformation → db.talent_plan_role_transformation"),
    ("Talent Plan", "Upload", "XLSX import", "Action",
     "POST /api/talent-plan/upload"),

    # Roadmap
    ("Roadmap", "Tiles", "Counts by status (planned / in-flight / complete / at-risk)", "KPI",
     "derived(GET /api/roadmap/initiatives)"),
    ("Roadmap", "Initiatives", "Initiative, owner, target, status", "Row",
     "GET /api/roadmap/initiatives → db.roadmap_initiatives"),
    ("Roadmap", "Status Update", "Update status badge", "Action",
     "PATCH /api/roadmap/initiatives/:id/status (admin)"),

    # Administration
    ("Administration", "Dataset List", "12 page-backed datasets", "Row",
     "GET /api/admin/datasets"),
    ("Administration", "Template Download", "Multi-sheet XLSX with snapshot", "Action",
     "GET /api/admin/datasets/:key/template (admin)"),
    ("Administration", "Upload", "XLSX import; replaces rows", "Action",
     "POST /api/admin/datasets/:key/upload (admin)"),
    ("Administration", "Last Refresh", "Last refresh time and version", "Row",
     "GET /api/admin/datasets/:key/metadata"),
    ("Administration", "Latest File Download", "Latest stored XLSX", "Action",
     "GET /api/admin/datasets/:key/download (admin)"),
    ("Administration", "Talent Plan Workflow", "Live talent plan upload + preview", "Action",
     "POST /api/talent-plan/upload + Talent Plan endpoints"),
]


# -------------------------------------------------------------------------
# Build document
# -------------------------------------------------------------------------
def build_document() -> Document:
    doc = Document()
    # Page margins
    for section in doc.sections:
        section.top_margin = Cm(2.0)
        section.bottom_margin = Cm(2.0)
        section.left_margin = Cm(2.0)
        section.right_margin = Cm(2.0)

    # ---- Cover page ----
    for _ in range(4):
        doc.add_paragraph()
    add_para(doc, DOC_TITLE, bold=True, size=24, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_para(doc, DOC_SUBTITLE, size=16, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_para(doc, DOC_TARGET, italic=True, size=13, align=WD_ALIGN_PARAGRAPH.CENTER)
    for _ in range(8):
        doc.add_paragraph()
    cover_meta = [
        ("Version", DOC_VERSION),
        ("Date", DOC_DATE),
        ("Author", DOC_AUTHOR),
        ("Classification", DOC_CLASSIFICATION),
        ("Status", "Submitted for ARB Review"),
    ]
    t = doc.add_table(rows=len(cover_meta), cols=2)
    t.autofit = False
    for i, (k, v) in enumerate(cover_meta):
        c0 = t.rows[i].cells[0]
        c1 = t.rows[i].cells[1]
        c0.width = Cm(5)
        c1.width = Cm(11)
        r0 = c0.paragraphs[0].add_run(k); r0.bold = True; r0.font.size = Pt(11)
        r1 = c1.paragraphs[0].add_run(v); r1.font.size = Pt(11)
        set_cell_bg(c0, "F2F3F3")
    doc.add_page_break()

    # ---- Document control ----
    add_heading(doc, "Document Control", level=1)
    add_table(
        doc,
        ["Version", "Date", "Author", "Reviewer", "Change Summary"],
        DOC_CONTROL_ROWS,
        col_widths=[1.6, 2.4, 4.5, 3.5, 5.0],
    )
    add_heading(doc, "Distribution", level=2)
    add_bullets(doc, [
        "Horizon BCBS Application Architecture Review Board",
        "Horizon Enterprise Architecture and Cloud Center of Excellence",
        "Horizon Information Security and Privacy Office",
        "IBM AMS Delivery Leadership",
    ])
    doc.add_page_break()

    # ---- 1. Executive Summary ----
    add_heading(doc, "1. Executive Summary", level=1)
    add_para(doc,
        "CareOps360 is the executive operations portal for Horizon BCBS payer leadership. It consolidates "
        "real-time operational intelligence across members, claims, prior authorization, providers, contact "
        "center, vendor invoicing, application health, and the value delivered by IBM Application Management "
        "Services. This document presents the target-state architecture for hosting CareOps360 on Amazon Web "
        "Services (AWS) for review by the Horizon Application Architecture Review Board.")
    add_para(doc,
        "The proposed architecture is a containerized, multi-AZ deployment composed of an ECS Fargate API "
        "tier, an S3 + CloudFront static frontend, an Amazon RDS for PostgreSQL Multi-AZ data tier, and "
        "supporting AWS services for identity (Cognito), secrets and keys (Secrets Manager + KMS), object "
        "storage (S3), eventing (EventBridge), and observability (CloudWatch + X-Ray). Identity is federated "
        "to Horizon's enterprise IdP and all data is encrypted in transit and at rest with KMS-managed keys.")
    add_para(doc,
        "The dashboard is currently powered by a curated dataset stored in PostgreSQL with admin-managed XLSX "
        "uploads. As system-of-record integrations are delivered, each visible field is migrated from the "
        "near-term database source to its long-term system of record. The migration backlog is captured row "
        "by row in Appendix A, which is the working artifact for domain owners.")

    # ---- 2. Business Context & Drivers ----
    add_heading(doc, "2. Business Context & Drivers", level=1)
    add_bullets(doc, [
        "Horizon executive leadership needs a single operational view across all payer domains.",
        "Operations leaders need actionable, near-real-time visibility into queues, aging, and exceptions.",
        "IT leadership needs application-health and incident posture tied to business outcomes.",
        "IBM AMS needs to demonstrate measurable value (tickets resolved, automation, savings).",
        "All of the above must be delivered on a HIPAA-aligned, auditable AWS platform consistent with Horizon enterprise standards.",
    ])

    # ---- 3. Scope ----
    add_heading(doc, "3. Scope", level=1)
    add_heading(doc, "3.1 In Scope", level=2)
    add_bullets(doc, [
        "Hosting and operating the CareOps360 web application and API on AWS.",
        "Multi-AZ PostgreSQL data tier with automated backups and PITR.",
        "Identity federation to Horizon enterprise IdP via Amazon Cognito.",
        "Admin-driven dataset uploads with full audit trail.",
        "Observability, alerting, and incident response integration.",
        "CI/CD pipeline with Dev → QA → Stage → Prod promotion gates.",
    ])
    add_heading(doc, "3.2 Out of Scope", level=2)
    add_bullets(doc, [
        "Modifications to upstream systems of record.",
        "Provisioning of corporate network/VPN/Direct Connect (handled by Horizon Network Engineering).",
        "End-user device hardening.",
        "Regulatory submissions beyond architecture-level evidence.",
    ])

    # ---- 4. Solution Overview ----
    add_heading(doc, "4. Solution Overview", level=1)
    add_para(doc,
        "CareOps360 is delivered as a single-page React application served from S3 + CloudFront, backed by "
        "an Express/Node 24 API running on ECS Fargate behind an Application Load Balancer. The API reads "
        "and writes a PostgreSQL database (RDS Multi-AZ). All visible fields trace back to either the "
        "operational PostgreSQL store (near-term) or the corresponding system of record (long-term). "
        "OpenAPI 3.1 is the single source of truth for the contract between client and server, with codegen "
        "for client hooks and server-side Zod validators.")

    # ---- 5. Feature Specifications ----
    add_heading(doc, "5. Feature Specifications", level=1)
    add_para(doc,
        "Each subsection describes one module of the dashboard at functional-spec depth: purpose, primary "
        "users, capabilities, KPIs and visualizations, data inputs, interactions and admin actions, "
        "acceptance criteria, and future enhancements.")
    for i, fs in enumerate(FEATURE_SPECS, start=1):
        add_heading(doc, f"5.{i} {fs['title']}", level=2)
        add_para(doc, "Purpose", bold=True)
        add_para(doc, fs["purpose"])
        add_para(doc, "Primary Users / Roles", bold=True)
        add_bullets(doc, fs["users"])
        add_para(doc, "Key Capabilities", bold=True)
        add_bullets(doc, fs["capabilities"])
        add_para(doc, "KPIs & Visualizations", bold=True)
        add_bullets(doc, fs["kpis"])
        add_para(doc, "Data Inputs (Near-Term)", bold=True)
        add_bullets(doc, fs["data_inputs"])
        add_para(doc, "Interactions & Admin Actions", bold=True)
        add_bullets(doc, fs["interactions"])
        add_para(doc, "Acceptance Criteria", bold=True)
        add_bullets(doc, fs["acceptance"])
        add_para(doc, "Future Enhancements (Long-Term)", bold=True)
        add_bullets(doc, fs["future"])

    # ---- 6. Logical Architecture ----
    add_heading(doc, "6. Logical Architecture", level=1)
    add_para(doc,
        "The logical architecture follows a classic three-tier model. The presentation tier is a React/Vite "
        "single-page application. The application tier is a stateless Node.js API exposing OpenAPI-described "
        "endpoints grouped by domain (executive, members, claims, priorauth, providers, contact center, "
        "finance/vendor invoices, applications, IBM AMS, roadmap, capability, talent, administration). The "
        "data tier is PostgreSQL with Drizzle ORM. Cross-cutting concerns include authentication, role-based "
        "access control, structured logging, and dataset-version metadata.")

    # ---- 7. AWS Deployment Architecture ----
    add_heading(doc, "7. AWS Deployment Architecture", level=1)
    add_para(doc,
        "Figure 1 shows the target AWS deployment. Public traffic enters via Route 53 and CloudFront with "
        "AWS WAF and Shield. The API tier runs as ECS Fargate tasks in private subnets across two AZs, "
        "fronted by an internet-facing Application Load Balancer. The data tier is RDS for PostgreSQL "
        "Multi-AZ. Supporting services include Cognito for identity, Secrets Manager + KMS for credentials "
        "and keys, S3 for static assets and uploaded artifacts, EventBridge for scheduled jobs, and "
        "CloudWatch + X-Ray for observability.")
    if DIAGRAM_PATH.exists():
        doc.add_picture(str(DIAGRAM_PATH), width=Cm(17))
        cap = doc.add_paragraph()
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = cap.add_run("Figure 1. CareOps360 Target AWS Deployment Architecture")
        r.italic = True; r.font.size = Pt(10)
    add_heading(doc, "7.1 AWS Service Mapping", level=2)
    add_table(
        doc,
        ["Capability", "AWS Service(s)", "Role in CareOps360"],
        AWS_SERVICE_ROWS,
        col_widths=[3.5, 5.5, 8.0],
    )

    # ---- 8. Data Architecture ----
    add_heading(doc, "8. Data Architecture", level=1)
    add_para(doc,
        "The application uses a single PostgreSQL database with ~35 tables organized by domain (executive, "
        "members, claims, prior auth, providers, contact center, finance, applications, IBM AMS, capability, "
        "talent, roadmap, administration). All KPI tiles read from a generic `page_kpis` table keyed by "
        "`<page>.<metric>`, which is populated either by seeded data, scheduled rollups, or admin uploads. "
        "Domain tables are populated via the same dataset-engine framework that powers the Administration "
        "console: a per-dataset schema declares sheet/table/column mapping; the engine generates the "
        "template, validates uploads, deletes existing rows, and bulk-inserts new ones (500-row chunks).")
    add_para(doc,
        "Production data is encrypted at rest with KMS CMKs. Backups are automatic (daily snapshots + PITR "
        "with a 7-day window minimum). All admin upload artifacts are archived in S3 with Object Lock in "
        "compliance mode for the regulatory retention period.")

    # ---- 9. Integration Architecture ----
    add_heading(doc, "9. Integration Architecture", level=1)
    add_para(doc,
        "External integrations are scoped per-domain and delivered iteratively. Near-term, dashboard data "
        "originates from the curated PostgreSQL store. Long-term, each domain integrates with its system of "
        "record (claims platform, member admin, contact-center suite, ITSM, HRIS, ERP, etc.). Integration "
        "patterns include: change data capture into an RDS read-replica for high-volume OLTP sources, "
        "EventBridge schedules for periodic rollups, and S3-based file ingestion for partner workbooks.")

    # ---- 10. Security & Compliance ----
    add_heading(doc, "10. Security & Compliance", level=1)
    add_bullets(doc, [
        "HIPAA: Covered-entity workload; PHI encrypted at rest (KMS) and in transit (TLS 1.2+); least-privilege IAM; audit logging.",
        "HITRUST CSF v11 and NIST 800-53 Moderate baselines applied to landing zone and workload.",
        "AWS Organizations + Control Tower for account vending; AWS Config + Security Hub + GuardDuty for continuous compliance and threat detection.",
        "Block Public Access enforced on all S3 buckets at the account level.",
        "Secrets stored in AWS Secrets Manager with rotation; no secrets in environment files or container images.",
        "Container images scanned in ECR (Inspector) and signed (Sigstore); only signed, scanned images are deployed.",
        "WAF with managed rule sets (OWASP, AWS Common, Anonymous IP).",
        "Vulnerability management via Amazon Inspector and partner SAST/DAST tooling.",
    ])

    # ---- 11. Identity & Access ----
    add_heading(doc, "11. Identity & Access", level=1)
    add_para(doc,
        "Production identity is federated to Horizon's enterprise IdP through Amazon Cognito user pools. "
        "Cognito issues short-lived JWTs with role claims; the API enforces role-based access control "
        "(executive, operations, IT, IBM AMS Delivery, admin). The Administration console is double-gated: "
        "the navigation entry is hidden for non-admin roles, and the page itself enforces a server-checked "
        "role guard. Local accounts exist only in non-production environments for demonstration and testing.")

    # ---- 12. NFRs ----
    add_heading(doc, "12. Non-Functional Requirements", level=1)
    add_table(doc, ["Category", "Requirement"], NFR_ROWS, col_widths=[4.5, 12.5])

    # ---- 13. Observability & Operations ----
    add_heading(doc, "13. Observability & Operations", level=1)
    add_bullets(doc, [
        "Structured Pino logs to CloudWatch Logs with request id correlation.",
        "Custom CloudWatch metrics for KPI freshness, dataset upload volume, and API latency by route.",
        "AWS X-Ray traces across ALB → Fargate → RDS for end-to-end latency analysis.",
        "CloudWatch alarms paged to Horizon ServiceNow on-call with severity routing.",
        "Operational runbooks for: ECS task failure, RDS failover, dataset upload rollback, secret rotation.",
        "Quarterly chaos drill: kill primary AZ; expected RTO ≤ 30 minutes.",
    ])

    # ---- 14. CI/CD & Environments ----
    add_heading(doc, "14. CI/CD and Environments", level=1)
    add_bullets(doc, [
        "Environments: Dev → QA → Stage → Prod, each in its own AWS account.",
        "Pipeline (CodePipeline or GitHub Actions via OIDC): build → unit test → typecheck → SAST → container scan → deploy.",
        "Database migrations gated by CI; production migrations require an approved change ticket.",
        "Blue/green deployment with CodeDeploy; automatic rollback on alarm breach.",
        "Infrastructure as Code via Terraform; PRs reviewed by Cloud CoE.",
    ])

    # ---- 15. Cost ----
    add_heading(doc, "15. Cost Estimate (Order of Magnitude)", level=1)
    add_table(
        doc,
        ["Category", "Monthly (Steady State)", "Notes"],
        [
            ["ECS Fargate (API, prod)", "$350 – $700", "2–4 tasks @ 1 vCPU / 2 GB; auto-scales."],
            ["RDS for PostgreSQL Multi-AZ (db.m6g.large, 200 GB gp3)", "$450 – $600", "Backups 7 days; PITR enabled."],
            ["CloudFront + S3", "$80 – $150", "Static frontend; modest egress."],
            ["ALB", "$25 – $40", "One ALB per env."],
            ["CloudWatch + X-Ray", "$120 – $250", "Log retention 90 days; metrics + traces."],
            ["Cognito + KMS + Secrets Manager", "$40 – $80", "MAU + KMS key + secret store."],
            ["WAF + Shield Standard", "$30 – $80", "Managed rule sets."],
            ["Total (production)", "≈ $1.1k – $1.9k / month", "Excludes data egress overage and DR region."],
        ],
        col_widths=[5.5, 4.5, 7.0],
    )
    add_para(doc,
        "All figures are order-of-magnitude estimates for the Phase-1 production footprint and exclude data "
        "egress overage and an optional warm DR region.", italic=True)

    # ---- 16. Risks ----
    add_heading(doc, "16. Risks and Mitigations", level=1)
    add_table(
        doc,
        ["#", "Risk", "Impact", "Likelihood", "Mitigation"],
        RISK_ROWS,
        col_widths=[1.0, 4.5, 1.6, 1.8, 7.6],
    )

    # ---- 17. ADRs ----
    add_heading(doc, "17. Architecture Decision Records (ADRs)", level=1)
    for adr in ADRS:
        add_heading(doc, f"{adr['id']}: {adr['title']}", level=2)
        add_para(doc, "Context", bold=True)
        add_para(doc, adr["context"])
        add_para(doc, "Decision", bold=True)
        add_para(doc, adr["decision"])
        add_para(doc, "Consequences", bold=True)
        add_para(doc, adr["consequences"])

    # ---- 18. Open Questions ----
    add_heading(doc, "18. Open Questions for the Board", level=1)
    add_bullets(doc, OPEN_QUESTIONS)

    # ---- Appendix A: Source Mapping ----
    doc.add_page_break()
    add_heading(doc, "Appendix A — Data Source Mapping (Near-Term & Long-Term)", level=1)
    add_para(doc,
        "Each row represents one visible field on a dashboard tab. The Near-Term Source column is "
        "pre-populated from the current implementation. Domain owners are asked to populate the Long-Term "
        "Source (Target System of Record), Owner, Refresh Cadence, and Notes columns. This appendix is the "
        "working artifact for the per-tab integration backlog and will be updated as systems of record are "
        "wired in.")
    rows = []
    for tab, section, field, ftype, near in SOURCE_MAP:
        rows.append([tab, section, field, ftype, near, "", "", "", ""])
    add_table(
        doc,
        ["Tab", "Section / Widget", "Field / Metric", "Type",
         "Near-Term Source", "Long-Term Source (Target System of Record)",
         "Owner", "Refresh Cadence", "Notes"],
        rows,
        col_widths=[2.6, 2.6, 3.0, 1.2, 4.0, 4.0, 1.6, 1.6, 2.0],
    )

    # ---- Sign-off ----
    doc.add_page_break()
    add_heading(doc, "Approvals / Sign-off", level=1)
    sign_rows = [
        ["Application Architecture Review Board", "", "", ""],
        ["Enterprise Architecture", "", "", ""],
        ["Information Security and Privacy", "", "", ""],
        ["Cloud Center of Excellence", "", "", ""],
        ["IBM AMS Delivery Lead", "", "", ""],
    ]
    add_table(
        doc,
        ["Role", "Name", "Signature", "Date"],
        sign_rows,
        col_widths=[5.5, 4.0, 4.0, 3.5],
    )

    return doc


def main() -> None:
    print(f"[arb-doc] rendering AWS diagram → {DIAGRAM_PATH}")
    render_aws_diagram(DIAGRAM_PATH)
    print(f"[arb-doc] building document → {DOCX_PATH}")
    doc = build_document()
    doc.save(DOCX_PATH)

    # Verify no Replit references in any XML part of the .docx
    forbidden = ["Replit", "Repl ", "replit.app", "REPLIT_"]
    found: list[tuple[str, str]] = []
    with zipfile.ZipFile(DOCX_PATH) as zf:
        for name in zf.namelist():
            if not name.endswith((".xml", ".rels")):
                continue
            data = zf.read(name).decode("utf-8", errors="ignore")
            for term in forbidden:
                if term in data:
                    found.append((name, term))
    if found:
        for n, t in found:
            print(f"[arb-doc] FORBIDDEN '{t}' in {n}")
        raise SystemExit(2)
    size = os.path.getsize(DOCX_PATH)
    print(f"[arb-doc] OK — {DOCX_PATH} ({size:,} bytes), no forbidden terms.")


if __name__ == "__main__":
    main()
