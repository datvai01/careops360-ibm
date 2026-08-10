/**
 * Seed Jun 2026 Account Management (ADM) report data, derived from the
 * ADM Deck — Jun 2026 v4.0. Idempotent: clears ADM tables and re-inserts.
 * Run: pnpm --filter @workspace/api-server exec tsx src/scripts/seed-adm.ts
 */
import {
  db,
  admActionItemsTable,
  admInitiativesTable,
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

const M = "Jun 2026";
const now = new Date().toISOString();

async function main() {
  await db.transaction(async (tx) => {
    await tx.delete(admActionItemsTable);
    await tx.delete(admInitiativesTable);
    await tx.delete(admMeetingsTable);
    await tx.delete(admHeadcountTable);
    await tx.delete(admStaffChangesTable);
    await tx.delete(admInvoiceSummaryTable);
    await tx.delete(admHourlyTrendsTable);
    await tx.delete(admMipsTrendTable);
    await tx.delete(admMipsInsightsTable);
    await tx.delete(admTeamCompositionTable);
    await tx.delete(admOtherUpdatesTable);

    await tx.insert(admActionItemsTable).values([
      { item: "Finalize MIPS re-baseline proposal with Horizon finance", latestUpdate: "Draft phased recommendation shared; awaiting Horizon CFO review.", status: "In Progress", owner: "IBM — K. Rao", progressSource: "Monthly ADM review", createdAt: now, updatedAt: now },
      { item: "Close CareRadius SOW onboarding for offshore pod", latestUpdate: "12 of 14 offshore engineers onboarded; final 2 badges pending.", status: "In Progress", owner: "IBM — T. Nguyen", progressSource: "CareRadius SOW tracker", createdAt: now, updatedAt: now },
      { item: "EDI Modernization business case sign-off", latestUpdate: "Business case v2 submitted with revised ROI model.", status: "Open", owner: "Horizon — R. Alvarez", progressSource: "Transformation steering committee", createdAt: now, updatedAt: now },
      { item: "Publish updated on/offboarding SLA runbook", latestUpdate: "Runbook published to Knowledge Base; team walkthrough completed.", status: "Closed", owner: "IBM — S. Iyer", progressSource: "Account operations", createdAt: now, updatedAt: now },
    ]);

    await tx.insert(admInitiativesTable).values([
      { title: "AIOps Expansion", description: "$1.2M IBM investment expanding AIOps coverage across production estate.", actions: "Instana rollout wave 3; correlate EDI alerts; expand runbook automation.", owner: "IBM — AIOps Pod", nextSteps: "Wave 3 go-live Jul 2026; quarterly value report to Horizon CIO.", status: "Active", updatedAt: now },
      { title: "ICA Deployment Options", description: "Evaluate deployment options for Intelligent Claims Assistant (ICA).", actions: "Option analysis: SaaS vs on-prem vs hybrid; security review with Horizon IT.", owner: "IBM — Claims Modernization", nextSteps: "Present option recommendation at Jul 2026 steering committee.", status: "Active", updatedAt: now },
      { title: "EDI Modernization", description: "Business case to modernize EDI gateways and reduce transaction latency.", actions: "ROI model refresh; vendor landscape scan; pilot scope definition.", owner: "Joint — IBM & Horizon", nextSteps: "Sign-off on business case; pilot kickoff targeted Q3 2026.", status: "Active", updatedAt: now },
      { title: "UPS Modernization", description: "Business case for Utilization/Provider Services platform modernization.", actions: "Current-state assessment complete; draft target architecture.", owner: "IBM — Platform Engineering", nextSteps: "Cost model review with Horizon finance in Jul 2026.", status: "On Hold", updatedAt: now },
    ]);

    await tx.insert(admMeetingsTable).values([
      { reportMonth: M, domainArea: "Care Radius", meetingDate: "2026-06-10", horizonAttendees: "S. Mehta; L. Brooks", ibmAttendees: "K. Rao; T. Nguyen", deckLink: "https://ibm.box.com/adm-jun26-careradius" },
      { reportMonth: M, domainArea: "Claims & EDI", meetingDate: "2026-06-15", horizonAttendees: "R. Alvarez; D. Kim", ibmAttendees: "S. Iyer; M. Chen", deckLink: "https://ibm.box.com/adm-jun26-claims-edi" },
      { reportMonth: M, domainArea: "Data & Analytics", meetingDate: "2026-06-18", horizonAttendees: "P. Okafor", ibmAttendees: "A. Sharma; J. Park", deckLink: "https://ibm.box.com/adm-jun26-data" },
      { reportMonth: M, domainArea: "Infrastructure & AIOps", meetingDate: "2026-06-24", horizonAttendees: "L. Brooks; H. Patel", ibmAttendees: "K. Rao; V. Singh", deckLink: "https://ibm.box.com/adm-jun26-aiops" },
    ]);

    const hc = [
      ["Jun 2025", 402, 6, 4, 404, 0.3],
      ["Jul 2025", 404, 8, 5, 407, 0.2],
      ["Aug 2025", 407, 5, 6, 406, 0.4],
      ["Sep 2025", 406, 9, 4, 411, 0.2],
      ["Oct 2025", 411, 4, 6, 409, 0.3],
      ["Nov 2025", 409, 6, 5, 410, 0.2],
      ["Dec 2025", 410, 3, 4, 409, 0.2],
      ["Jan 2026", 409, 8, 5, 412, 0.2],
      ["Feb 2026", 412, 5, 6, 411, 0.3],
      ["Mar 2026", 411, 7, 5, 413, 0.2],
      ["Apr 2026", 413, 4, 6, 411, 0.3],
      ["May 2026", 411, 6, 7, 410, 0.2],
      ["Jun 2026", 410, 10, 7, 413, 0.2],
    ] as const;
    await tx.insert(admHeadcountTable).values(hc.map(([monthLabel, startHc, onboards, offboards, endHc, attritionPct]) => ({ monthLabel, startHc, onboards, offboards, endHc, attritionPct })));

    await tx.insert(admStaffChangesTable).values([
      { reportMonth: M, personName: "Henna David", team: "Care Radius", changeType: "Offboard", reason: "Maternity leave" },
      { reportMonth: M, personName: "Prashant Kadam", team: "Customer Service", changeType: "Offboard", reason: "Attrition" },
      { reportMonth: M, personName: "Miguel Santos", team: "EDI", changeType: "Offboard", reason: "Internal IBM rotation" },
      { reportMonth: M, personName: "Aisha Verma", team: "Data & Analytics", changeType: "Onboard", reason: "Backfill — data engineering" },
      { reportMonth: M, personName: "Chen Wei", team: "Care Radius", changeType: "Onboard", reason: "CareRadius SOW ramp-up" },
      { reportMonth: M, personName: "Olu Adeyemi", team: "AIOps", changeType: "Onboard", reason: "AIOps expansion pod" },
    ]);

    await tx.insert(admInvoiceSummaryTable).values([
      { reportMonth: M, sow: "T&M CareRadius", lineItem: "Onshore hours", hours: 420, amountUsd: 71400 },
      { reportMonth: M, sow: "T&M CareRadius", lineItem: "Offshore hours", hours: 2440, amountUsd: 97600 },
      { reportMonth: M, sow: "T&M Data", lineItem: "Onshore hours", hours: 1180, amountUsd: 200600 },
      { reportMonth: M, sow: "T&M Data", lineItem: "Offshore hours", hours: 5400, amountUsd: 216000 },
      { reportMonth: M, sow: "T&M Non-Data", lineItem: "Onshore hours", hours: 4380, amountUsd: 744600 },
      { reportMonth: M, sow: "T&M Non-Data", lineItem: "Offshore hours", hours: 18600, amountUsd: 744000 },
    ]);

    const ht = [
      ["Jun 2025", 3800, 12800, 0, 0],
      ["Jul 2025", 4000, 13600, 0, 0],
      ["Aug 2025", 4100, 14900, 0, 0],
      ["Sep 2025", 4300, 16200, 0, 0],
      ["Oct 2025", 4500, 17500, 0, 0],
      ["Nov 2025", 4600, 18300, 0, 0],
      ["Dec 2025", 4400, 17800, 0, 0],
      ["Jan 2026", 4800, 19600, 120, 600],
      ["Feb 2026", 5000, 20700, 180, 980],
      ["Mar 2026", 5200, 21900, 240, 1400],
      ["Apr 2026", 5400, 22800, 300, 1850],
      ["May 2026", 5500, 23400, 360, 2150],
      ["Jun 2026", 5600, 24000, 420, 2440],
    ] as const;
    await tx.insert(admHourlyTrendsTable).values(ht.map(([monthLabel, onshoreNonCr, offshoreNonCr, onshoreCr, offshoreCr]) => ({ monthLabel, onshoreNonCr, offshoreNonCr, onshoreCr, offshoreCr })));

    const mt = [
      ["Jun 2025", 85, 96, "Pre-optimization"],
      ["Jul 2025", 84, 96, ""],
      ["Aug 2025", 82, 96, ""],
      ["Sep 2025", 78, 96, "Optimization wave 1"],
      ["Oct 2025", 72, 96, ""],
      ["Nov 2025", 66, 96, "Optimization wave 2"],
      ["Dec 2025", 61, 96, ""],
      ["Jan 2026", 58, 96, ""],
      ["Feb 2026", 55, 96, ""],
      ["Mar 2026", 53, 96, ""],
      ["Apr 2026", 52, 96, ""],
      ["May 2026", 51, 96, ""],
      ["Jun 2026", 51, 96, "Post-optimization steady state"],
    ] as const;
    await tx.insert(admMipsTrendTable).values(mt.map(([monthLabel, usageK, baselineK, note]) => ({ monthLabel, usageK, baselineK, note })));

    await tx.insert(admMipsInsightsTable).values([
      { reportMonth: M, section: "Optimization", title: "Average usage reduced from 85K to 51K MIPS", detail: "Batch tuning, workload re-platforming, and scheduler consolidation delivered a 40% reduction versus the 96K contracted baseline — 45K headroom (47%).", ord: 1 },
      { reportMonth: M, section: "Outlook", title: "Steady state ~65K; migration spike to ~78K expected Sep 2026 – Sep 2027", detail: "Planned platform migrations temporarily raise usage before settling back to a ~65K steady state.", ord: 2 },
      { reportMonth: M, section: "Recommendation", title: "Phased re-baseline: 70K now → 82K uplift during migration → capacity review → revisit", detail: "Re-baseline to 70K immediately, apply an 82K uplift for the migration window, then run a joint capacity review before setting the long-term baseline.", ord: 3 },
    ]);

    await tx.insert(admTeamCompositionTable).values([
      { reportMonth: M, category: "Technology Mix", label: "CareRadius / Facets", value: 26, unit: "%", note: "" },
      { reportMonth: M, category: "Technology Mix", label: "Java / Spring", value: 24, unit: "%", note: "" },
      { reportMonth: M, category: "Technology Mix", label: "Data Engineering & Analytics", value: 18, unit: "%", note: "" },
      { reportMonth: M, category: "Technology Mix", label: "Mainframe / EDI", value: 17, unit: "%", note: "" },
      { reportMonth: M, category: "Technology Mix", label: "Cloud & AIOps", value: 15, unit: "%", note: "" },
      { reportMonth: M, category: "Diversity", label: "Women in team", value: 38, unit: "%", note: "" },
      { reportMonth: M, category: "Diversity", label: "Women in leadership roles", value: 33, unit: "%", note: "" },
      { reportMonth: M, category: "Experience", label: "5+ years tenure on account", value: 40, unit: "%", note: "Deep Horizon domain knowledge retained" },
      { reportMonth: M, category: "Experience", label: "Average industry experience", value: 9.5, unit: "yrs", note: "" },
      { reportMonth: M, category: "Attrition Benchmark", label: "Account attrition (trailing 12 mo)", value: 2.9, unit: "%", note: "Well below industry benchmark" },
      { reportMonth: M, category: "Attrition Benchmark", label: "Industry benchmark attrition", value: 18, unit: "%", note: "IT services industry average" },
    ]);

    await tx.insert(admOtherUpdatesTable).values([
      { reportMonth: M, title: "NSA/NSSD medical record review", detail: "Medical record review pipeline on track: intake automation live, reviewer throughput up 22% month over month; backlog projected to clear by Aug 2026.", status: "In Progress" },
      { reportMonth: M, title: "Disaster recovery exercise", detail: "Annual DR exercise completed for Tier-1 applications with all recovery objectives met.", status: "Completed" },
    ]);
  });

  console.log("ADM Jun 2026 seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
