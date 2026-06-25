import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, kpiDefinitionsTable, kpiMonthlyEntriesTable, kpiFeedbackTable } from "@workspace/db";
import { eq, and, desc, asc } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(_req: Request, res: Response, next: NextFunction): void {
  const h = _req.headers.authorization;
  if (!h?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  next();
}

/* ── seed data ────────────────────────────────────────────────── */
const SEED_MONTHS: { year: number; month: number }[] = [];
for (let y = 2025; y <= 2026; y++) {
  for (let m = 1; m <= 12; m++) {
    if (y === 2026 && m > 6) break;
    SEED_MONTHS.push({ year: y, month: m });
  }
}

const KPI_SEED = [
  /* ── Critical Service Levels (CSL) ── */
  { key: "incident_response",               category: "Critical Service Levels", name: "Incident Response",                    unit: "%",   target: 98,   dir: "higher", order: 1,  desc: "SLA: % of incidents responded to within defined response time",         values: [91,92,90,93,93,94,94,95,95,96,95,96,97,97,97,98,98,98] },
  { key: "incident_resolution",             category: "Critical Service Levels", name: "Incident Resolution",                  unit: "%",   target: 95,   dir: "higher", order: 2,  desc: "SLA: % of incidents resolved within defined resolution time",           values: [86,87,85,88,89,88,90,91,91,92,92,93,93,94,94,94,95,95] },
  { key: "problem_resolution",              category: "Critical Service Levels", name: "Problem Resolution",                   unit: "%",   target: 90,   dir: "higher", order: 3,  desc: "SLA: % of root-cause problems resolved within target timeframe",        values: [78,80,78,81,82,82,84,85,85,86,87,87,88,88,89,89,90,90] },
  { key: "quality_delivery_prod",           category: "Critical Service Levels", name: "Quality Delivery to Prod",             unit: "%",   target: 95,   dir: "higher", order: 4,  desc: "SLA: % of releases deployed to production without critical defects",     values: [86,87,85,88,89,89,91,91,92,93,92,94,94,95,95,95,96,96] },
  { key: "application_availability",        category: "Critical Service Levels", name: "Application Availability",             unit: "%",   target: 99.5, dir: "higher", order: 5,  desc: "SLA: % uptime across all managed applications",                         values: [98.7,99.0,98.5,99.1,99.2,99.0,99.3,99.2,99.4,99.5,99.3,99.5,99.6,99.5,99.7,99.6,99.7,99.8] },
  { key: "staffing_attrition",              category: "Critical Service Levels", name: "Staffing Attrition",                   unit: "%",   target: 10,   dir: "lower",  order: 6,  desc: "SLA: Monthly attrition rate of IBM AMS delivery staff (lower = better)", values: [18,17,19,16,15,15,14,13,14,13,12,12,11,11,10,10,9,9] },
  { key: "service_request_completion",      category: "Critical Service Levels", name: "Service Request Completion",           unit: "%",   target: 95,   dir: "higher", order: 7,  desc: "SLA: % of service requests fulfilled within agreed SLA window",          values: [84,85,83,86,87,87,88,89,89,90,91,91,92,93,93,94,94,95] },
  { key: "testing_coverage_ratio",          category: "Critical Service Levels", name: "Testing Coverage Ratio",               unit: "%",   target: 80,   dir: "higher", order: 8,  desc: "SLA: % of application code covered by automated test suites",            values: [62,64,61,65,67,67,69,70,71,72,73,74,75,76,77,78,78,79] },
  { key: "quality_delivery_uat",            category: "Critical Service Levels", name: "Quality Delivery to UAT",              unit: "%",   target: 95,   dir: "higher", order: 9,  desc: "SLA: % of releases deployed to UAT meeting quality gates",               values: [85,86,84,87,88,88,89,90,91,92,91,92,93,94,94,95,95,96] },
  { key: "story_test_automation",           category: "Critical Service Levels", name: "Story Test Automation",                unit: "%",   target: 70,   dir: "higher", order: 10, desc: "SLA: % of user stories covered by automated regression tests",           values: [48,50,47,52,54,54,56,58,59,61,61,63,64,65,66,67,68,69] },
  { key: "devops_deployments",              category: "Critical Service Levels", name: "DevOps Deployments",                   unit: "count", target: 20, dir: "higher", order: 11, desc: "SLA: Monthly count of deployments executed via DevOps pipeline",         values: [9,10,8,11,12,12,13,14,14,15,15,16,17,18,18,19,19,20] },
  { key: "unit_test_automation",            category: "Critical Service Levels", name: "Unit Test Automation",                 unit: "%",   target: 80,   dir: "higher", order: 12, desc: "SLA: % of code units covered by automated unit tests",                   values: [58,60,57,62,63,64,65,67,68,70,71,72,73,74,75,76,77,78] },
  { key: "on_budget_delivery",              category: "Critical Service Levels", name: "On-budget Delivery",                   unit: "%",   target: 95,   dir: "higher", order: 13, desc: "SLA: % of projects and work orders delivered within approved budget",     values: [82,84,81,85,86,86,87,88,89,90,90,91,92,93,93,94,94,95] },
  { key: "it_customer_satisfaction",        category: "Critical Service Levels", name: "IT Customer Satisfaction",             unit: "/ 5", target: 4.0,  dir: "higher", order: 14, desc: "SLA: Average satisfaction score from Horizon IT stakeholders (1–5)",     values: [2.8,2.9,2.8,3.0,3.1,3.1,3.2,3.3,3.3,3.4,3.5,3.5,3.6,3.7,3.7,3.8,3.9,4.0] },
  { key: "change_mgmt_effectiveness",       category: "Critical Service Levels", name: "Change Management Effectiveness",      unit: "%",   target: 90,   dir: "higher", order: 15, desc: "SLA: % of changes implemented without unplanned outages or rollbacks",    values: [74,75,73,77,78,78,80,81,82,83,83,84,85,86,87,88,88,89] },
  { key: "retention_of_key_personnel",      category: "Critical Service Levels", name: "Retention of Key Personnel",           unit: "%",   target: 90,   dir: "higher", order: 16, desc: "SLA: % of key / named delivery personnel retained month-over-month",     values: [78,79,78,80,81,81,82,83,84,85,85,86,86,87,88,88,89,90] },
  { key: "root_cause_analysis_reporting",   category: "Critical Service Levels", name: "Root Cause Analysis & Reporting",      unit: "%",   target: 95,   dir: "higher", order: 17, desc: "SLA: % of P1/P2 incidents with RCA delivered within SLA",                values: [82,83,81,84,85,85,87,88,88,89,89,91,91,92,93,93,94,94] },
  { key: "deployment_without_defects",      category: "Critical Service Levels", name: "Deployment without Known Defects",     unit: "%",   target: 98,   dir: "higher", order: 18, desc: "SLA: % of production deployments with zero known critical defects",       values: [88,89,87,90,91,91,92,93,93,94,94,95,95,96,96,97,97,98] },

  /* ── Business KPIs ── */
  { key: "timely_claims_payment",           category: "Business KPIs", name: "Timely Claims Payment",           unit: "%", target: 98,  dir: "higher", order: 19, desc: "KPI: % of claims paid within the contractually required timeframe",        values: [92,93,91,93,94,94,95,95,96,96,96,97,97,97,98,98,98,98] },
  { key: "letters_generation_ontime",       category: "Business KPIs", name: "Letters Generation On-time",      unit: "%", target: 99,  dir: "higher", order: 20, desc: "KPI: % of member/provider letters generated and dispatched on schedule",    values: [94,95,93,95,96,96,96,97,97,97,98,98,98,98,99,99,99,99] },
  { key: "timely_claims_submission",        category: "Business KPIs", name: "Timely Claims Submission",         unit: "%", target: 99,  dir: "higher", order: 21, desc: "KPI: % of claims submitted to clearing-house within required window",       values: [93,94,92,94,95,95,96,96,97,97,97,98,98,98,98,99,99,99] },
  { key: "id_cards_generation",             category: "Business KPIs", name: "ID Cards Generation",              unit: "%", target: 98,  dir: "higher", order: 22, desc: "KPI: % of member ID cards generated and mailed within SLA",                values: [91,92,90,93,94,94,94,95,95,96,96,96,97,97,97,98,98,98] },
  { key: "ontime_enrollments",              category: "Business KPIs", name: "On-time Enrollments",              unit: "%", target: 99,  dir: "higher", order: 23, desc: "KPI: % of enrollment transactions processed by effective date",             values: [93,94,92,94,95,95,96,96,97,97,97,98,98,98,99,99,99,99] },
  { key: "timely_bills_generation",         category: "Business KPIs", name: "Timely Bills Generation",          unit: "%", target: 99,  dir: "higher", order: 24, desc: "KPI: % of billing statements generated and delivered on schedule",          values: [93,94,92,95,95,95,96,96,97,97,98,98,98,99,99,99,99,99] },
  { key: "aso_billing_compliance",          category: "Business KPIs", name: "ASO Billing Compliance",           unit: "%", target: 100, dir: "higher", order: 25, desc: "KPI: % of ASO (Administrative Services Only) billing processed accurately",  values: [94,95,93,96,96,97,97,97,98,98,98,99,99,99,100,100,100,100] },
  { key: "small_group_conversion",          category: "Business KPIs", name: "Successful Small-Group Conversion",unit: "%", target: 85,  dir: "higher", order: 26, desc: "KPI: % of small-group accounts successfully migrated / converted",          values: [68,70,67,72,73,73,75,76,77,78,78,80,81,82,82,83,84,84] },
  { key: "rates_loading_ontime",            category: "Business KPIs", name: "Rates Loading on Time",            unit: "%", target: 98,  dir: "higher", order: 27, desc: "KPI: % of rate changes loaded to systems before the effective date",        values: [90,91,89,92,93,93,94,94,95,95,96,96,97,97,97,98,98,98] },
  { key: "efax_to_care_radius",             category: "Business KPIs", name: "Same-day eFax to Care Radius",     unit: "%", target: 99,  dir: "higher", order: 28, desc: "KPI: % of eFax referrals transmitted to Care Radius on the same day",       values: [92,93,91,94,95,95,96,96,97,97,97,98,98,98,99,99,99,99] },
  { key: "hipaa_forms_processing",          category: "Business KPIs", name: "Timely HIPAA Forms Processing",    unit: "%", target: 99,  dir: "higher", order: 29, desc: "KPI: % of HIPAA transaction forms processed within required SLA window",    values: [91,92,90,93,94,94,95,95,96,96,97,97,97,98,98,98,99,99] },
  { key: "patient_logs_rightfax",           category: "Business KPIs", name: "Patient Logs to RightFax",         unit: "%", target: 99,  dir: "higher", order: 30, desc: "KPI: % of patient log documents successfully delivered to RightFax",        values: [90,91,89,92,93,93,94,95,95,96,96,97,97,97,98,98,99,99] },
];

async function initKpiTracker(): Promise<void> {
  try {
    const existing = await db.select().from(kpiDefinitionsTable).limit(1);
    if (existing.length > 0) return;
    for (const k of KPI_SEED) {
      await db.insert(kpiDefinitionsTable).values({
        key: k.key, category: k.category, name: k.name, unit: k.unit,
        description: k.desc, target: k.target, targetDirection: k.dir, displayOrder: k.order,
      });
      for (let i = 0; i < SEED_MONTHS.length && i < k.values.length; i++) {
        const { year, month } = SEED_MONTHS[i];
        await db.insert(kpiMonthlyEntriesTable).values({ kpiKey: k.key, year, month, value: k.values[i] });
      }
    }
  } catch { /* ignore */ }
}

void initKpiTracker();

/* ── helpers ─────────────────────────────────────────────────── */
function prevMonth(year: number, month: number): { year: number; month: number } {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

/* ── routes ──────────────────────────────────────────────────── */

router.get("/kpi-tracker/kpis", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const year  = parseInt(String(req.query.year  ?? new Date().getFullYear()));
  const month = parseInt(String(req.query.month ?? new Date().getMonth() + 1));
  const prev  = prevMonth(year, month);

  const defs = await db.select().from(kpiDefinitionsTable).orderBy(asc(kpiDefinitionsTable.displayOrder));
  const allEntries = await db.select().from(kpiMonthlyEntriesTable);

  const result = defs.map(d => {
    const entries = allEntries.filter(e => e.kpiKey === d.key);
    const cur  = entries.find(e => e.year === year && e.month === month);
    const prv  = entries.find(e => e.year === prev.year && e.month === prev.month);
    // last 6 months sparkline
    const spark: number[] = [];
    let sy = year, sm = month;
    for (let i = 0; i < 6; i++) {
      const e = entries.find(x => x.year === sy && x.month === sm);
      spark.unshift(e?.value ?? 0);
      const p = prevMonth(sy, sm); sy = p.year; sm = p.month;
    }
    return {
      key: d.key, category: d.category, name: d.name, unit: d.unit,
      description: d.description, target: d.target, targetDirection: d.targetDirection,
      displayOrder: d.displayOrder,
      currentValue: cur?.value ?? null,
      previousValue: prv?.value ?? null,
      sparkline: spark,
    };
  });

  res.json(result);
});

router.get("/kpi-tracker/kpis/:key/history", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { key } = req.params;
  const entries = await db.select().from(kpiMonthlyEntriesTable)
    .where(eq(kpiMonthlyEntriesTable.kpiKey, key))
    .orderBy(asc(kpiMonthlyEntriesTable.year), asc(kpiMonthlyEntriesTable.month));
  res.json(entries.map(e => ({ year: e.year, month: e.month, value: e.value, note: e.note })));
});

router.post("/kpi-tracker/entries", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { kpiKey, year, month, value, note } = req.body as Record<string, unknown>;
  if (!kpiKey || !year || !month || value === undefined || value === null) {
    res.status(400).json({ error: "kpiKey, year, month, value are required" }); return;
  }
  const y = Number(year), m = Number(month), v = Number(value);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(v) || m < 1 || m > 12) {
    res.status(400).json({ error: "Invalid year, month, or value" }); return;
  }
  const existing = await db.select().from(kpiMonthlyEntriesTable)
    .where(and(eq(kpiMonthlyEntriesTable.kpiKey, String(kpiKey)), eq(kpiMonthlyEntriesTable.year, y), eq(kpiMonthlyEntriesTable.month, m)));
  if (existing.length > 0) {
    await db.update(kpiMonthlyEntriesTable)
      .set({ value: v, note: typeof note === "string" ? note : null })
      .where(eq(kpiMonthlyEntriesTable.id, existing[0].id));
  } else {
    await db.insert(kpiMonthlyEntriesTable).values({ kpiKey: String(kpiKey), year: y, month: m, value: v, note: typeof note === "string" ? note : null });
  }
  res.json({ ok: true });
});

router.get("/kpi-tracker/feedback", requireAuth, async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(kpiFeedbackTable).orderBy(desc(kpiFeedbackTable.createdAt)).limit(50);
  res.json(rows);
});

router.post("/kpi-tracker/feedback", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { kpiKey, comment, sentiment, authorName } = req.body as Record<string, unknown>;
  if (!comment || typeof comment !== "string" || !comment.trim()) {
    res.status(400).json({ error: "comment is required" }); return;
  }
  const validSentiment = ["positive", "neutral", "concern"].includes(String(sentiment)) ? String(sentiment) : "neutral";
  await db.insert(kpiFeedbackTable).values({
    kpiKey: typeof kpiKey === "string" && kpiKey ? kpiKey : null,
    comment: comment.trim().slice(0, 2000),
    sentiment: validSentiment,
    authorName: typeof authorName === "string" && authorName ? authorName.slice(0, 100) : null,
  });
  res.json({ ok: true });
});

router.delete("/kpi-tracker/feedback/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  await db.delete(kpiFeedbackTable).where(eq(kpiFeedbackTable.id, Number(req.params.id)));
  res.json({ ok: true });
});

export default router;
