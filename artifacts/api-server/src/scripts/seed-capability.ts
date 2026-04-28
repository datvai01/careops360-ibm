/**
 * Seeds capability_* tables to mirror the data shown on the Capability Uplift page.
 * Idempotent — deletes and re-inserts each table.
 */
import {
  db,
  capabilityKpisTable,
  capabilityStagesTable,
  capabilityTrainingTable,
  capabilityGovernanceTable,
  capabilityAreasTable,
  capabilityRadarTable,
  capabilityValueImpactTable,
  capabilityAiCertsTable,
} from "@workspace/db";

async function main() {
  await db.delete(capabilityKpisTable);
  await db.delete(capabilityStagesTable);
  await db.delete(capabilityTrainingTable);
  await db.delete(capabilityGovernanceTable);
  await db.delete(capabilityAreasTable);
  await db.delete(capabilityRadarTable);
  await db.delete(capabilityValueImpactTable);
  await db.delete(capabilityAiCertsTable);

  await db.insert(capabilityKpisTable).values([
    { kpiKey: "totalCertified",     label: "Total Certified Resources", value: 382, formatted: "382",   change: 0, status: "green", trend: "up", sub: "Distinct employees with active certifications", iconKey: "award",      colorKey: "blue",   delta: "4,599 total certifications",   displayOrder: 0 },
    { kpiKey: "plannedCerts",       label: "Planned Certifications",    value: 450, formatted: "450+",  change: 0, status: "green", trend: "up", sub: "Target headcount, next 6–12 months",            iconKey: "target",     colorKey: "purple", delta: "Directional growth target",    displayOrder: 1 },
    { kpiKey: "workforceAiEnabled", label: "Workforce AI-Enabled",      value: 41,  formatted: "41%",   change: 0, status: "green", trend: "up", sub: "Of total delivery team",                        iconKey: "brain",      colorKey: "teal",   delta: "→ 78% target by Month 12",     displayOrder: 2 },
    { kpiKey: "automationCoverage", label: "Automation Coverage",       value: 63,  formatted: "63%",   change: 0, status: "green", trend: "up", sub: "Processes with automation",                     iconKey: "zap",        colorKey: "orange", delta: "→ 91% target by Month 12",     displayOrder: 3 },
    { kpiKey: "fteProductivity",    label: "FTE Productivity Gain",     value: 70,  formatted: "~70%",  change: 0, status: "green", trend: "up", sub: "Manual work eliminated",                        iconKey: "trendingUp", colorKey: "green",  delta: "124 FTEs redeployed",          displayOrder: 4 },
    { kpiKey: "autoRemediation",    label: "Auto-Remediation Ready",    value: 95,  formatted: "95%",   change: 0, status: "green", trend: "up", sub: "Target capability milestone",                   iconKey: "shield",     colorKey: "violet", delta: "Achieved at Month 6",          displayOrder: 5 },
  ]);

  await db.insert(capabilityStagesTable).values([
    { stage: "traditional",  title: "Traditional Ops",       description: "Reactive, manual operations with ticket-driven support models. High FTE dependency.",                          currentMaturity: 100, targetMaturity: 0,   status: "completed", ownerTeam: "",                              position: 0, displayOrder: 0 },
    { stage: "automation",   title: "Automation-Led Ops",    description: "Runbook automation and scripted remediation reduce manual triage. Shift-left begins.",                         currentMaturity: 63,  targetMaturity: 80,  status: "on-track",  ownerTeam: "Platform Engineering",          position: 1, displayOrder: 1 },
    { stage: "ai-augmented", title: "AI-Augmented Ops",      description: "AIOps and ML models drive proactive alerting, anomaly detection, and co-pilot assistance.",                    currentMaturity: 41,  targetMaturity: 78,  status: "on-track",  ownerTeam: "AI Transformation Office",      position: 2, displayOrder: 2 },
    { stage: "autonomous",   title: "Autonomous Ops",        description: "Self-healing systems, generative AI orchestration, and 95%+ auto-remediation. Minimal human intervention.",     currentMaturity: 12,  targetMaturity: 95,  status: "planned",   ownerTeam: "Joint IBM × Horizon",           position: 3, displayOrder: 3 },
  ]);

  await db.insert(capabilityAreasTable).values([
    { area: "AI / ML & Data Science",          sub: "GenAI, ML Ops, AIOps, Data Science",      currentCount: 307, plannedCount: 390, priority: "Critical", impact: "Auto-remediation, predictive ops, AI Copilot",  displayOrder: 0  },
    { area: "IBM Products & Technologies",     sub: "IBM Platform, Tooling & Enablement",      currentCount: 338, plannedCount: 390, priority: "High",     impact: "Platform capability, delivery quality",         displayOrder: 1  },
    { area: "Industry-Specific (Healthcare)",  sub: "Healthcare, Compliance & Regulatory",     currentCount: 342, plannedCount: 380, priority: "High",     impact: "Audit-readiness, domain accuracy",              displayOrder: 2  },
    { area: "IBM Consulting & Professional",   sub: "Consulting Methods, Profession Certs",    currentCount: 227, plannedCount: 270, priority: "High",     impact: "Delivery methodology, advisory quality",        displayOrder: 3  },
    { area: "Agile & Project Management",      sub: "Agile, Scrum, SAFe, PMI",                 currentCount: 176, plannedCount: 210, priority: "Medium",   impact: "Delivery velocity, programme governance",       displayOrder: 4  },
    { area: "Cloud Platforms",                 sub: "AWS, Azure, OpenShift, Cloud Native",     currentCount: 250, plannedCount: 300, priority: "High",     impact: "Scale, resilience, cloud cost optimisation",    displayOrder: 5  },
    { area: "Automation & RPA",                sub: "Automation, RPA, Self-Heal, AIOps",       currentCount: 91,  plannedCount: 135, priority: "Critical", impact: "Manual effort reduction across ops workflows",  displayOrder: 6  },
    { area: "Programming & Development",       sub: "Software Engineering & Development",      currentCount: 79,  plannedCount: 105, priority: "Medium",   impact: "Build velocity, code quality",                  displayOrder: 7  },
    { area: "DevOps & Infrastructure",         sub: "CI/CD, GitOps, SRE, Observability",       currentCount: 41,  plannedCount: 68,  priority: "High",     impact: "Release cadence, MTTR reduction",               displayOrder: 8  },
    { area: "Big Data & Analytics",            sub: "Data Engineering, Streaming, Analytics",  currentCount: 53,  plannedCount: 85,  priority: "Critical", impact: "Real-time validation pipeline",                 displayOrder: 9  },
    { area: "Integration & APIs",              sub: "REST, FHIR, EDI, Event-Driven Arch",      currentCount: 33,  plannedCount: 55,  priority: "High",     impact: "Partner onboarding, 1-day activation",          displayOrder: 10 },
    { area: "Security & Compliance",           sub: "HIPAA, Security, Compliance",             currentCount: 26,  plannedCount: 45,  priority: "High",     impact: "Risk reduction, regulatory adherence",          displayOrder: 11 },
    { area: "Database & Data Management",      sub: "MDM, Data Quality, Mastering, DB Admin",  currentCount: 18,  plannedCount: 35,  priority: "High",     impact: "Single source of truth, data integrity",        displayOrder: 12 },
    { area: "Red Hat Technologies",            sub: "Red Hat OpenShift & Portfolio",           currentCount: 5,   plannedCount: 18,  priority: "Medium",   impact: "Container platform, hybrid cloud",              displayOrder: 13 },
  ]);

  await db.insert(capabilityAiCertsTable).values([
    { label: "LLM / Foundation Models", currentCount: 6,  plannedCount: 18, useCase: "AI Copilot, root cause, GenAI summarisation", displayOrder: 0 },
    { label: "RAG / Vector Embeddings", currentCount: 4,  plannedCount: 14, useCase: "Knowledge retrieval, ops assistant",          displayOrder: 1 },
    { label: "ML Ops / Model Lifecycle", currentCount: 8, plannedCount: 22, useCase: "Auto-remediation models, drift detection",    displayOrder: 2 },
    { label: "AIOps / Observability AI", currentCount: 12, plannedCount: 28, useCase: "Predictive alerting, self-healing",          displayOrder: 3 },
    { label: "NLP / Text Analytics",     currentCount: 8,  plannedCount: 22, useCase: "Ticket classification, Copilot",             displayOrder: 4 },
    { label: "Computer Vision / OCR",    currentCount: 3,  plannedCount: 10, useCase: "Document processing, forms intake",          displayOrder: 5 },
  ]);

  await db.insert(capabilityRadarTable).values([
    { axis: "AI / GenAI",    current: 38, planned: 82, displayOrder: 0 },
    { axis: "Automation",    current: 63, planned: 91, displayOrder: 1 },
    { axis: "Data Eng",      current: 52, planned: 85, displayOrder: 2 },
    { axis: "Integration",   current: 68, planned: 90, displayOrder: 3 },
    { axis: "Cloud / Infra", current: 74, planned: 92, displayOrder: 4 },
    { axis: "Domain",        current: 71, planned: 88, displayOrder: 5 },
  ]);

  await db.insert(capabilityValueImpactTable).values([
    { cap: "AI / GenAI",    metric: "95% Auto-Remediation",       value: "$2M+",    colorKey: "purple", displayOrder: 0 },
    { cap: "Data Skills",   metric: "Real-Time Processing",       value: "$3.2M",   colorKey: "teal",   displayOrder: 1 },
    { cap: "AIOps",         metric: "13.5 hrs → 5 min resolution", value: "$1.8M",  colorKey: "blue",   displayOrder: 2 },
    { cap: "Integration",   metric: "Partner Onboarding Speed",   value: "$2.1M",   colorKey: "orange", displayOrder: 3 },
    { cap: "Domain Skills", metric: "Compliance & Accuracy",      value: "$0.8M",   colorKey: "green",  displayOrder: 4 },
    { cap: "Automation",    metric: "70% Manual Work Eliminated", value: "$9.7M",   colorKey: "red",    displayOrder: 5 },
  ]);

  await db.insert(capabilityTrainingTable).values([
    { programName: "IBM AIOps Bootcamp",                        vendor: "IBM",        track: "AIOps",                   category: "Operations", audience: "AMS + SRE",                  startDate: "2026-05-05", endDate: "2026-05-07", format: "Virtual",   level: "Essentials",   seats: 40, enrollment: 34, completionRate: 0,    status: "scheduled", color: "#0f62fe", description: "Foundational training on IBM Watson AIOps — event correlation, alert deduplication, and AI-driven incident management for ops teams.",                                                                                                                                                                          certificationEarned: "IBM AIOps Foundations Badge" },
    { programName: "AWS Gen AI Lunch & Learn",                  vendor: "AWS",        track: "AI / GenAI",              category: "AI",         audience: "All Developers",             startDate: "2026-05-19", endDate: "2026-05-21", format: "Virtual",   level: "Essentials",   seats: 50, enrollment: 47, completionRate: 0,    status: "scheduled", color: "#ff9900", description: "AWS Gen AI Practitioner certification prep — large language models, prompt engineering, Amazon Bedrock, and responsible AI practices.",                                                                                                                                                                          certificationEarned: "AWS Certified AI Practitioner (AIF-C01)" },
    { programName: "IBM BOB — Build on Bedrock",                vendor: "IBM BOB",    track: "AI / GenAI",              category: "AI",         audience: "Architects + Leads",         startDate: "2026-06-02", endDate: "2026-06-04", format: "In-Person", level: "Associate",    seats: 30, enrollment: 28, completionRate: 0,    status: "scheduled", color: "#8a3ffc", description: "IBM Build on Bedrock (bob.ibm.com) — 3-day hands-on programme covering IBM's curated GenAI toolchain built on Amazon Bedrock: foundation model selection, RAG implementation, IBM watsonx integration, and enterprise-grade GenAI application patterns for regulated industries.", certificationEarned: "IBM BOB Practitioner Badge" },
    { programName: "Databricks Data Engineering Bootcamp",      vendor: "Databricks", track: "Data & Analytics",        category: "Data",       audience: "Data Engineers",             startDate: "2026-06-16", endDate: "2026-06-18", format: "Virtual",   level: "Associate",    seats: 35, enrollment: 29, completionRate: 0,    status: "scheduled", color: "#ff3621", description: "Databricks Certified Associate Developer — Delta Lake, Apache Spark, streaming pipelines, Unity Catalog, and medallion architecture for healthcare data.",                                                                                                                                                       certificationEarned: "Databricks Certified Data Engineer Associate" },
    { programName: "Snowflake Core Bootcamp",                   vendor: "Snowflake",  track: "Data & Analytics",        category: "Data",       audience: "Data Engineers",             startDate: "2026-07-07", endDate: "2026-07-09", format: "Virtual",   level: "Associate",    seats: 30, enrollment: 22, completionRate: 0,    status: "scheduled", color: "#29b5e8", description: "SnowPro Core certification prep — Snowflake architecture, virtual warehouses, data sharing, performance tuning, and security for enterprise workloads.",                                                                                                                                                          certificationEarned: "Snowflake SnowPro Core Certification" },
    { programName: "COBOL to Java & .NET AI Bootcamp",          vendor: "IBM",        track: "Application Modernization", category: "Engineering", audience: "AMS Modernization",         startDate: "2026-07-21", endDate: "2026-07-23", format: "Hybrid",    level: "Professional", seats: 25, enrollment: 19, completionRate: 0,    status: "scheduled", color: "#0f62fe", description: "AI-assisted COBOL to Java & .NET modernization — IBM watsonx Code Assistant for Z, automated code translation, test generation, and refactoring strategies for legacy healthcare payer systems.",                                                                                                              certificationEarned: "IBM watsonx Code Assistant Specialist Badge" },
    { programName: "Mosaic AI Bootcamp",                        vendor: "Databricks", track: "AI / GenAI",              category: "AI",         audience: "ML Engineers",                startDate: "2026-08-11", endDate: "2026-08-13", format: "Virtual",   level: "Professional", seats: 25, enrollment: 18, completionRate: 0,    status: "scheduled", color: "#ff3621", description: "ML engineering on Databricks — MLflow, Feature Store, model serving, model monitoring, and AutoML for healthcare prediction workloads.",                                                                                                                                                                         certificationEarned: "Databricks Certified ML Professional" },
    { programName: "AWS Bedrock Deep Dive Bootcamp",            vendor: "AWS",        track: "AI / GenAI",              category: "AI",         audience: "AI Engineers",                startDate: "2026-09-08", endDate: "2026-09-10", format: "Virtual",   level: "Professional", seats: 30, enrollment: 24, completionRate: 0,    status: "scheduled", color: "#ff9900", description: "Deep dive on Amazon Bedrock — agent orchestration, knowledge bases, guardrails, and production deployment patterns for enterprise GenAI.",                                                                                                                                                                       certificationEarned: "AWS Certified AI Specialty" },
    { programName: "IBM Consulting Gen & Agentic AI Jumpstart", vendor: "IBM",        track: "AI / GenAI",              category: "AI",         audience: "All Developers + AMS",        startDate: "2026-01-15", endDate: "2026-06-30", format: "Virtual",   level: "Essentials",   seats: 900, enrollment: 842, completionRate: 71.4, status: "in-progress", color: "#0f62fe", description: "Foundational GenAI and agentic AI program for all IBM Consulting practitioners.",                                                                                                                                                                                                                                  certificationEarned: "IBM Consulting AI Practitioner" },
    { programName: "Healthcare Industry Foundations",           vendor: "IBM",        track: "Industry",                category: "Industry",   audience: "All Squads",                  startDate: "2026-02-01", endDate: "2026-04-30", format: "Virtual",   level: "Essentials",   seats: 1300, enrollment: 1240, completionRate: 88.2, status: "in-progress", color: "#0f62fe", description: "Healthcare payer industry foundations — HIPAA, claims, prior auth, member experience.",                                                                                                                                                                                                                                certificationEarned: "Healthcare Foundations Badge" },
    { programName: "DevSecOps Practitioner",                    vendor: "IBM",        track: "Engineering",             category: "Engineering",audience: "Platform + AMS",              startDate: "2026-01-10", endDate: "2026-05-31", format: "Virtual",   level: "Associate",    seats: 400, enrollment: 384, completionRate: 64.8, status: "in-progress", color: "#0f62fe", description: "DevSecOps practices, secure CI/CD, SBOM, and shift-left security.",                                                                                                                                                                                                                                                              certificationEarned: "DevSecOps Practitioner Badge" },
    { programName: "AIOps Operator Certification",              vendor: "IBM",        track: "AIOps",                   category: "Operations", audience: "AMS + SRE",                  startDate: "2026-03-01", endDate: "2026-07-31", format: "Virtual",   level: "Professional", seats: 260, enrollment: 247, completionRate: 31.2, status: "in-progress", color: "#0f62fe", description: "Operator certification for IBM Watson AIOps platform.",                                                                                                                                                                                                                                                                          certificationEarned: "IBM Watson AIOps Operator" },
    { programName: "Agentic Workflow Design",                   vendor: "IBM",        track: "AI / GenAI",              category: "AI",         audience: "Architects + Leads",         startDate: "2026-04-15", endDate: "2026-08-31", format: "Hybrid",    level: "Expert",       seats: 150, enrollment: 142, completionRate: 12.1, status: "in-progress", color: "#8a3ffc", description: "Designing multi-agent workflows with guardrails for regulated workloads.",                                                                                                                                                                                                                                                       certificationEarned: "Agentic AI Architect Badge" },
  ]);

  await db.insert(capabilityGovernanceTable).values([
    { practice: "Quarterly Talent Review",      description: "Joint IBM × Horizon governance review of capability gaps, hiring, and certification velocity.",      cadence: "Quarterly", owner: "Joint IBM × Horizon", status: "active" },
    { practice: "Skills Inventory Refresh",     description: "Bi-monthly refresh of resource skills matrix (current vs. plan).",                                    cadence: "Bi-monthly", owner: "AMS PMO",            status: "active" },
    { practice: "Certification Audit",          description: "Quarterly audit of badge attainment vs. plan; flag at-risk roles.",                                   cadence: "Quarterly", owner: "Talent CoE",          status: "active" },
    { practice: "AI Ethics & Risk Council",     description: "Monthly review of agentic deployments, guardrails, and compliance posture.",                          cadence: "Monthly",   owner: "AI Transformation Office", status: "active" },
    { practice: "Vendor Training SLA",          description: "Track committed training delivery from IBM, AWS, Databricks, Snowflake.",                              cadence: "Monthly",   owner: "Procurement + L&D",   status: "active" },
  ]);

  console.log("[seed-capability] Seeded all 8 capability_* tables.");
  process.exit(0);
}

main().catch((e) => {
  console.error("[seed-capability] FAILED:", e);
  process.exit(1);
});
