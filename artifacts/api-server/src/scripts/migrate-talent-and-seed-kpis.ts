/**
 * One-shot migration:
 * 1. Imports the legacy talentPlan.json into the talent_resources / talent_products tables.
 * 2. Seeds page_kpis for every dashboard page from the previously hardcoded constants.
 * 3. Seeds capability_kpis / capability_stages / capability_training / capability_governance.
 *
 * Idempotent: safe to re-run (it deletes & re-inserts).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import {
  db,
  talentResourcesTable,
  talentProductsTable,
  talentPlanMetaTable,
  pageKpisTable,
  capabilityKpisTable,
  capabilityStagesTable,
  capabilityTrainingTable,
  capabilityGovernanceTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_FILE = path.resolve(__dirname, "../../data/talentPlan.json");
const META_FILE = path.resolve(__dirname, "../../data/talentPlan.meta.json");

async function migrateTalent() {
  if (!fs.existsSync(JSON_FILE)) {
    console.log("[migrate] No talentPlan.json found, skipping talent migration.");
    return;
  }
  const raw = JSON.parse(fs.readFileSync(JSON_FILE, "utf-8")) as {
    resources: any[];
    products: any[];
  };
  console.log(`[migrate] talent: ${raw.resources.length} resources, ${raw.products.length} products`);

  await db.transaction(async (tx) => {
    await tx.delete(talentResourcesTable);
    await tx.delete(talentProductsTable);

    if (raw.resources.length > 0) {
      const rows = raw.resources.map((r: any) => ({
        serial: String(r.serial ?? ""),
        name: String(r.name ?? ""),
        domain: String(r.domain ?? ""),
        portfolio: String(r.portfolio ?? ""),
        product: String(r.product ?? ""),
        applicationArea: String(r.applicationArea ?? ""),
        typeOfWork: String(r.typeOfWork ?? ""),
        role: String(r.role ?? ""),
        location: String(r.location ?? ""),
        currentTechStack: String(r.current?.techStack ?? ""),
        currentFutureTech: String(r.current?.futureTech ?? ""),
        currentIndustry: String(r.current?.industry ?? ""),
        currentAgile: String(r.current?.agile ?? ""),
        currentAgentic: String(r.current?.agentic ?? ""),
        currentDevsecops: String(r.current?.devsecops ?? ""),
        currentAiops: String(r.current?.aiops ?? ""),
        planTechStack: String(r.plan?.techStack ?? ""),
        planFutureTech: String(r.plan?.futureTech ?? ""),
        planIndustry: String(r.plan?.industry ?? ""),
        planAgile: String(r.plan?.agile ?? ""),
        planAgentic: String(r.plan?.agentic ?? ""),
        planDevops: String(r.plan?.devops ?? ""),
        planAiops: String(r.plan?.aiops ?? ""),
      }));
      const CHUNK = 200;
      for (let i = 0; i < rows.length; i += CHUNK) {
        await tx.insert(talentResourcesTable).values(rows.slice(i, i + CHUNK));
      }
    }

    if (raw.products.length > 0) {
      const rows = raw.products.map((p: any) => ({
        domain: String(p.domain ?? ""),
        portfolio: String(p.portfolio ?? ""),
        product: String(p.product ?? ""),
        applicationArea: String(p.applicationArea ?? ""),
        currentTech: String(p.currentTech ?? ""),
        futureTech: String(p.futureTech ?? ""),
        industry: String(p.industry ?? ""),
        agile: String(p.agile ?? ""),
        agentic: String(p.agentic ?? ""),
        devsecops: String(p.devsecops ?? ""),
        aiops: String(p.aiops ?? ""),
      }));
      await tx.insert(talentProductsTable).values(rows);
    }

    // Meta
    let meta: any = {
      uploadedAt: new Date().toISOString(),
      uploadedBy: "system (migrated from JSON)",
      sourceFilename: "Talent_Plan_seed.xlsx",
      resourceCount: raw.resources.length,
      productCount: raw.products.length,
      version: 1,
    };
    if (fs.existsSync(META_FILE)) {
      try {
        meta = { ...meta, ...JSON.parse(fs.readFileSync(META_FILE, "utf-8")) };
        meta.resourceCount = raw.resources.length;
        meta.productCount = raw.products.length;
      } catch {}
    }
    await tx.delete(talentPlanMetaTable).where(eq(talentPlanMetaTable.id, 1));
    await tx.insert(talentPlanMetaTable).values({
      id: 1,
      uploadedAt: meta.uploadedAt,
      uploadedBy: meta.uploadedBy,
      sourceFilename: meta.sourceFilename,
      resourceCount: meta.resourceCount,
      productCount: meta.productCount,
      version: meta.version,
    });
  });
  console.log("[migrate] talent: done.");
}

type KpiSeed = {
  kpiKey: string;
  label: string;
  value: number;
  formatted: string;
  change: number;
  status: "green" | "yellow" | "red";
  trend: "up" | "down" | "flat";
};

const PAGE_KPIS: Record<string, KpiSeed[]> = {
  executive: [
    { kpiKey: "activeMembers", label: "Active Members", value: 4287341, formatted: "4.29M", change: 0.8, status: "green", trend: "up" },
    { kpiKey: "claimsSettledAmount", label: "Claims Settled (7D)", value: 241800000, formatted: "$241.8M", change: 5.2, status: "green", trend: "up" },
    { kpiKey: "priorAuthRequests", label: "Prior Auth (7D)", value: 3241, formatted: "3,241", change: 18.7, status: "red", trend: "up" },
    { kpiKey: "callCenterASA", label: "Call Center ASA", value: 4.8, formatted: "4.8 min", change: 12.3, status: "yellow", trend: "up" },
    { kpiKey: "applicationAvailability", label: "App Availability", value: 99.94, formatted: "99.94%", change: 0.02, status: "green", trend: "flat" },
    { kpiKey: "criticalIncidents", label: "Critical Incidents", value: 3, formatted: "3", change: -25.0, status: "yellow", trend: "down" },
    { kpiKey: "slaAttainment", label: "SLA Attainment", value: 96.8, formatted: "96.8%", change: 1.4, status: "green", trend: "flat" },
    { kpiKey: "automationSavings", label: "Automation Savings", value: 3200000, formatted: "$3.2M", change: 14.0, status: "green", trend: "up" },
  ],
  members: [
    { kpiKey: "totalActiveMembers", label: "Total Active Members", value: 4287341, formatted: "4.29M", change: 0.8, status: "green", trend: "up" },
    { kpiKey: "newEnrollmentsToday", label: "New Enrollments Today", value: 1247, formatted: "1,247", change: 12.3, status: "green", trend: "up" },
    { kpiKey: "exceptionQueueSize", label: "Exception Queue Size", value: 342, formatted: "342", change: 28.4, status: "red", trend: "up" },
    { kpiKey: "terminations", label: "Terminations (30d)", value: 482, formatted: "482", change: -8.4, status: "green", trend: "down" },
  ],
  claims: [
    { kpiKey: "claimsReceivedToday", label: "Claims Received Today", value: 87432, formatted: "87,432", change: -2.1, status: "yellow", trend: "down" },
    { kpiKey: "claimsInAdjudication", label: "Claims In Adjudication", value: 24187, formatted: "24,187", change: 8.4, status: "yellow", trend: "up" },
    { kpiKey: "claimsPending", label: "Claims Pending", value: 18943, formatted: "18,943", change: 14.2, status: "red", trend: "up" },
    { kpiKey: "claimsDenied", label: "Claims Denied", value: 4218, formatted: "4,218", change: 5.8, status: "yellow", trend: "up" },
    { kpiKey: "claimsSettled", label: "Claims Settled", value: 61023, formatted: "61,023", change: 1.2, status: "green", trend: "flat" },
    { kpiKey: "totalDollarProcessed", label: "Total Dollar Processed", value: 241800000, formatted: "$241.8M", change: 5.2, status: "green", trend: "up" },
    { kpiKey: "autoAdjudicationRate", label: "Auto-Adjudication Rate", value: 72.4, formatted: "72.4%", change: -14.6, status: "red", trend: "down" },
    { kpiKey: "avgTurnaroundDays", label: "Avg Turnaround (days)", value: 4.2, formatted: "4.2 days", change: 10.5, status: "yellow", trend: "up" },
  ],
  priorauth: [
    { kpiKey: "requestsReceived", label: "Requests Received", value: 3241, formatted: "3,241", change: 18.7, status: "red", trend: "up" },
    { kpiKey: "approved", label: "Approved", value: 1842, formatted: "1,842", change: -8.2, status: "yellow", trend: "down" },
    { kpiKey: "denied", label: "Denied", value: 487, formatted: "487", change: 12.4, status: "yellow", trend: "up" },
    { kpiKey: "pended", label: "Pended", value: 892, formatted: "892", change: 47.3, status: "red", trend: "up" },
    { kpiKey: "avgReviewHours", label: "Avg Review (hrs)", value: 31.4, formatted: "31.4 hrs", change: 24.8, status: "red", trend: "up" },
    { kpiKey: "urgentRequests", label: "Urgent Requests", value: 218, formatted: "218", change: 33.5, status: "red", trend: "up" },
    { kpiKey: "backlogSize", label: "Backlog Size", value: 1247, formatted: "1,247", change: 28.4, status: "red", trend: "up" },
    { kpiKey: "appealsVolume", label: "Appeals Volume", value: 142, formatted: "142", change: 8.7, status: "yellow", trend: "up" },
  ],
  providers: [
    { kpiKey: "contractLoads", label: "Contract Loads (MTD)", value: 87, formatted: "87", change: 12.1, status: "green", trend: "up" },
    { kpiKey: "credentialingPending", label: "Credentialing Pending", value: 247, formatted: "247", change: -8.3, status: "green", trend: "down" },
    { kpiKey: "directoryUpdates", label: "Directory Updates (7D)", value: 412, formatted: "412", change: 4.8, status: "green", trend: "up" },
    { kpiKey: "disputeCases", label: "Open Dispute Cases", value: 89, formatted: "89", change: 14.7, status: "yellow", trend: "up" },
    { kpiKey: "onboardingRequests", label: "Onboarding Requests", value: 142, formatted: "142", change: 8.4, status: "yellow", trend: "up" },
    { kpiKey: "openTickets", label: "Open Provider Tickets", value: 218, formatted: "218", change: -4.2, status: "green", trend: "down" },
  ],
  contactcenter: [
    { kpiKey: "callsReceived", label: "Calls Received Today", value: 12842, formatted: "12,842", change: 8.4, status: "yellow", trend: "up" },
    { kpiKey: "avgWaitTime", label: "Avg Wait Time", value: 4.8, formatted: "4.8 min", change: 12.3, status: "yellow", trend: "up" },
    { kpiKey: "abandonmentRate", label: "Abandonment Rate", value: 7.4, formatted: "7.4%", change: 18.7, status: "red", trend: "up" },
    { kpiKey: "firstCallResolution", label: "First-Call Resolution", value: 78.4, formatted: "78.4%", change: -2.1, status: "yellow", trend: "down" },
    { kpiKey: "casesOpened", label: "Cases Opened (7D)", value: 487, formatted: "487", change: 6.2, status: "yellow", trend: "up" },
    { kpiKey: "memberComplaints", label: "Member Complaints", value: 142, formatted: "142", change: -12.4, status: "green", trend: "down" },
    { kpiKey: "chatbotContainment", label: "Chatbot Containment", value: 42.1, formatted: "42.1%", change: 8.4, status: "green", trend: "up" },
    { kpiKey: "digitalAdoption", label: "Digital Self-Service Adoption", value: 71.4, formatted: "71.4%", change: 4.8, status: "green", trend: "up" },
  ],
  finance: [
    { kpiKey: "mtdRevenue", label: "MTD Revenue", value: 1240000000, formatted: "$1.24B", change: 3.2, status: "green", trend: "up" },
    { kpiKey: "mtdClaimsCost", label: "MTD Claims Cost", value: 982000000, formatted: "$982M", change: 5.4, status: "yellow", trend: "up" },
    { kpiKey: "openInvoices", label: "Open Invoices", value: 218, formatted: "218", change: 14.2, status: "yellow", trend: "up" },
    { kpiKey: "totalInvoiceValue", label: "Total Invoice Value", value: 14200000, formatted: "$14.2M", change: 7.8, status: "yellow", trend: "up" },
    { kpiKey: "vendorAlerts", label: "Vendor Alerts", value: 9, formatted: "9", change: 28.6, status: "red", trend: "up" },
    { kpiKey: "ibmAmsBilling", label: "IBM AMS MTD Billing", value: 1840000, formatted: "$1.84M", change: -2.1, status: "green", trend: "down" },
    { kpiKey: "savingsYtd", label: "Savings YTD", value: 3200000, formatted: "$3.2M", change: 14.0, status: "green", trend: "up" },
    { kpiKey: "budgetVariance", label: "Budget Variance", value: -1.4, formatted: "-1.4%", change: 0.4, status: "green", trend: "flat" },
  ],
  applications: [
    { kpiKey: "overallAvailability", label: "Overall Availability", value: 99.94, formatted: "99.94%", change: 0.02, status: "green", trend: "flat" },
    { kpiKey: "openIncidents", label: "Open Incidents", value: 47, formatted: "47", change: 4.4, status: "yellow", trend: "up" },
    { kpiKey: "mttr", label: "MTTR", value: 38, formatted: "38 min", change: -12.4, status: "green", trend: "down" },
    { kpiKey: "batchSuccessRate", label: "Batch Success Rate", value: 98.7, formatted: "98.7%", change: 0.3, status: "green", trend: "flat" },
    { kpiKey: "totalApplications", label: "Total Applications", value: 47, formatted: "47", change: 0, status: "green", trend: "flat" },
    { kpiKey: "p1Incidents", label: "P1 Incidents (open)", value: 0, formatted: "0", change: -100, status: "green", trend: "flat" },
    { kpiKey: "p2Incidents", label: "P2 Incidents (open)", value: 3, formatted: "3", change: 50, status: "yellow", trend: "up" },
    { kpiKey: "interfaceHealth", label: "Interface Health", value: 96.4, formatted: "96.4%", change: -1.2, status: "green", trend: "down" },
    { kpiKey: "slaBreaches30d", label: "SLA Breaches (30d)", value: 2, formatted: "2", change: -33.3, status: "green", trend: "down" },
  ],
  ibmams: [
    { kpiKey: "shiftLeftRate", label: "Shift-Left Rate", value: 42.3, formatted: "42.3%", change: 8.7, status: "green", trend: "up" },
    { kpiKey: "automationRunbooks", label: "Automation Runbooks", value: 184, formatted: "184", change: 12.4, status: "green", trend: "up" },
    { kpiKey: "selfHealEvents", label: "Self-Heal Events (7D)", value: 247, formatted: "247", change: 24.8, status: "green", trend: "up" },
    { kpiKey: "defectLeakage", label: "Defect Leakage", value: 0.4, formatted: "0.4%", change: -22.1, status: "green", trend: "down" },
  ],
  roadmap: [
    { kpiKey: "totalInitiatives", label: "Total Initiatives", value: 24, formatted: "24", change: 0, status: "green", trend: "flat" },
    { kpiKey: "onTrack", label: "On Track", value: 18, formatted: "18", change: 5.9, status: "green", trend: "up" },
    { kpiKey: "atRisk", label: "At Risk", value: 4, formatted: "4", change: 33.3, status: "yellow", trend: "up" },
    { kpiKey: "delayed", label: "Delayed", value: 2, formatted: "2", change: 0, status: "red", trend: "flat" },
    { kpiKey: "completedYtd", label: "Completed YTD", value: 12, formatted: "12", change: 20, status: "green", trend: "up" },
    { kpiKey: "totalBudget", label: "Total Budget", value: 48400000, formatted: "$48.4M", change: 2.1, status: "green", trend: "flat" },
    { kpiKey: "budgetSpent", label: "Budget Spent", value: 18200000, formatted: "$18.2M", change: 8.4, status: "green", trend: "up" },
    { kpiKey: "valueRealized", label: "Value Realized YTD", value: 12400000, formatted: "$12.4M", change: 28.6, status: "green", trend: "up" },
  ],
};

async function seedPageKpis() {
  console.log("[seed] page_kpis: clearing & seeding...");
  await db.delete(pageKpisTable);
  const rows: any[] = [];
  for (const [page, kpis] of Object.entries(PAGE_KPIS)) {
    kpis.forEach((k, idx) => {
      rows.push({
        page,
        kpiKey: k.kpiKey,
        label: k.label,
        value: k.value,
        formatted: k.formatted,
        change: k.change,
        status: k.status,
        trend: k.trend,
        displayOrder: idx,
      });
    });
  }
  await db.insert(pageKpisTable).values(rows);
  console.log(`[seed] page_kpis: ${rows.length} rows.`);
}

async function seedCapability() {
  console.log("[seed] capability_*: clearing & seeding...");
  await db.delete(capabilityKpisTable);
  await db.delete(capabilityStagesTable);
  await db.delete(capabilityTrainingTable);
  await db.delete(capabilityGovernanceTable);

  await db.insert(capabilityKpisTable).values([
    { kpiKey: "talentMaturity", label: "Talent Maturity Index", value: 62.4, formatted: "62.4 / 100", change: 8.4, status: "green", trend: "up", displayOrder: 0 },
    { kpiKey: "agenticReady", label: "Agentic-Ready Resources", value: 38.2, formatted: "38.2%", change: 14.7, status: "green", trend: "up", displayOrder: 1 },
    { kpiKey: "aiopsAdoption", label: "AIOps Tooling Adoption", value: 47.1, formatted: "47.1%", change: 12.3, status: "green", trend: "up", displayOrder: 2 },
    { kpiKey: "trainingHours", label: "Training Hours (YTD)", value: 18420, formatted: "18,420 hrs", change: 28.4, status: "green", trend: "up", displayOrder: 3 },
    { kpiKey: "certificationsEarned", label: "Certifications Earned", value: 247, formatted: "247", change: 41.2, status: "green", trend: "up", displayOrder: 4 },
    { kpiKey: "skillCoverageGap", label: "Skill Coverage Gap", value: 22.6, formatted: "22.6%", change: -18.4, status: "green", trend: "down", displayOrder: 5 },
    { kpiKey: "shiftLeftReady", label: "Shift-Left Ready Teams", value: 14, formatted: "14 of 22", change: 27.3, status: "green", trend: "up", displayOrder: 6 },
    { kpiKey: "internalMobility", label: "Internal Mobility (YTD)", value: 9.8, formatted: "9.8%", change: 4.2, status: "green", trend: "up", displayOrder: 7 },
  ]);

  await db.insert(capabilityStagesTable).values([
    { stage: "stage1", title: "Foundation: Cloud + Agile + DevSecOps", description: "Modern engineering hygiene across all squads.", currentMaturity: 78, targetMaturity: 90, status: "on-track", ownerTeam: "Platform Engineering", displayOrder: 0 },
    { stage: "stage2", title: "Data & AI Literacy", description: "Industry data fluency + IBM Gen AI Jumpstart for every developer.", currentMaturity: 54, targetMaturity: 80, status: "on-track", ownerTeam: "Data & AI CoE", displayOrder: 1 },
    { stage: "stage3", title: "AIOps Adoption", description: "Self-healing runbooks, observability, predictive incident routing.", currentMaturity: 42, targetMaturity: 75, status: "at-risk", ownerTeam: "IBM AMS", displayOrder: 2 },
    { stage: "stage4", title: "Agentic Operating Model", description: "Multi-agent workflows, guardrailed autonomy across claims, prior-auth, member ops.", currentMaturity: 28, targetMaturity: 60, status: "planned", ownerTeam: "AI Transformation Office", displayOrder: 3 },
    { stage: "stage5", title: "Zero-Touch IT", description: "Closed-loop autonomy, change-as-code, exception-only humans-in-loop.", currentMaturity: 12, targetMaturity: 35, status: "planned", ownerTeam: "Joint IBM × Horizon", displayOrder: 4 },
  ]);

  await db.insert(capabilityTrainingTable).values([
    { programName: "IBM Consulting Gen & Agentic AI Jumpstart", category: "AI", audience: "All Developers + AMS", startDate: "2026-01-15", endDate: "2026-06-30", enrollment: 842, completionRate: 71.4, status: "in-progress" },
    { programName: "Healthcare Industry Foundations", category: "Industry", audience: "All Squads", startDate: "2026-02-01", endDate: "2026-04-30", enrollment: 1240, completionRate: 88.2, status: "in-progress" },
    { programName: "DevSecOps Practitioner", category: "Engineering", audience: "Platform + AMS", startDate: "2026-01-10", endDate: "2026-05-31", enrollment: 384, completionRate: 64.8, status: "in-progress" },
    { programName: "AIOps Operator Certification", category: "Operations", audience: "AMS + SRE", startDate: "2026-03-01", endDate: "2026-07-31", enrollment: 247, completionRate: 31.2, status: "in-progress" },
    { programName: "Agentic Workflow Design", category: "AI", audience: "Architects + Leads", startDate: "2026-04-15", endDate: "2026-08-31", enrollment: 142, completionRate: 12.1, status: "starting" },
    { programName: "Zero-Touch IT Operating Model", category: "Strategy", audience: "Leadership", startDate: "2026-05-01", endDate: "2026-09-30", enrollment: 48, completionRate: 0, status: "planned" },
  ]);

  await db.insert(capabilityGovernanceTable).values([
    { practice: "Capability Council (Joint Horizon × IBM)", description: "Bi-weekly review of maturity scores, risks, and reallocation.", cadence: "Bi-weekly", owner: "CIO + IBM Partner", status: "active" },
    { practice: "Skill Heatmap Refresh", description: "Quarterly re-baseline of every resource against tech, agentic, AIOps skills.", cadence: "Quarterly", owner: "Talent Office", status: "active" },
    { practice: "Squad-level OKRs on Maturity", description: "Each squad commits to 1 maturity-stage advance per quarter.", cadence: "Quarterly", owner: "Engineering Managers", status: "active" },
    { practice: "Agentic Use-Case Review", description: "Pre-prod review for every agent-enabled workflow before guardrail release.", cadence: "Per release", owner: "AI Transformation Office", status: "active" },
    { practice: "Certification Sponsorship", description: "100% reimbursement for IBM, AWS, Azure, GCP, and AI certifications.", cadence: "Continuous", owner: "HR + Talent", status: "active" },
  ]);

  console.log("[seed] capability_*: done.");
}

async function main() {
  await migrateTalent();
  await seedPageKpis();
  await seedCapability();
  console.log("✓ migrate-talent-and-seed-kpis complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("✗ migration failed:", err);
  process.exit(1);
});
