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
  { key: "claims_processed",       category: "Claims Operations", name: "Claims Processed",           unit: "count",  target: 5000,  dir: "higher", order: 1,  desc: "Total claims processed in the month",                     values: [4320,4410,4280,4510,4620,4490,4680,4720,4800,4850,4780,4900,4980,5020,4960,5080,5120,5150] },
  { key: "denial_rate",            category: "Claims Operations", name: "Denial Rate",                unit: "%",      target: 8.0,   dir: "lower",  order: 2,  desc: "Percentage of claims denied",                             values: [11.2,10.8,11.5,10.5,10.1,9.8,9.5,9.2,9.0,8.8,9.1,8.7,8.5,8.3,8.6,8.2,8.0,7.8] },
  { key: "claims_aging_30",        category: "Claims Operations", name: "Claims Aging >30 Days",      unit: "%",      target: 5.0,   dir: "lower",  order: 3,  desc: "Percentage of claims older than 30 days",                 values: [8.4,8.1,8.6,7.9,7.5,7.2,6.9,6.7,6.5,6.3,6.6,6.1,5.9,5.7,5.5,5.3,5.1,4.9] },
  { key: "avg_processing_days",    category: "Claims Operations", name: "Avg Processing Time",        unit: "days",   target: 14.0,  dir: "lower",  order: 4,  desc: "Average number of days to process a claim",               values: [18.5,18.2,19.1,17.8,17.2,16.9,16.5,16.2,15.9,15.6,16.0,15.3,15.0,14.8,14.5,14.3,14.1,13.9] },
  { key: "member_enrollment_net",  category: "Member Operations", name: "Net New Enrollments",        unit: "count",  target: 500,   dir: "higher", order: 5,  desc: "Net new member enrollments in the month",                 values: [312,345,298,378,410,389,425,448,432,465,443,489,502,521,498,538,545,562] },
  { key: "exception_resolution",   category: "Member Operations", name: "Exception Resolution Rate",  unit: "%",      target: 95.0,  dir: "higher", order: 6,  desc: "Rate at which member exceptions are resolved",            values: [82,84,81,85,87,86,88,89,88,90,91,90,92,93,91,94,93,95] },
  { key: "system_uptime",          category: "App Health",        name: "System Uptime",              unit: "%",      target: 99.5,  dir: "higher", order: 7,  desc: "Overall platform availability percentage",                values: [98.7,99.0,98.5,99.1,99.2,99.0,99.3,99.2,99.4,99.5,99.3,99.5,99.6,99.5,99.7,99.6,99.7,99.8] },
  { key: "p1_incidents",           category: "App Health",        name: "P1 Incidents",               unit: "count",  target: 0,     dir: "lower",  order: 8,  desc: "Number of Priority 1 incidents in the month",             values: [6,5,7,4,5,4,3,4,3,2,3,2,2,1,2,1,1,1] },
  { key: "batch_sla",              category: "App Health",        name: "Batch Job SLA Compliance",   unit: "%",      target: 98.0,  dir: "higher", order: 9,  desc: "Percentage of batch jobs completing within SLA",          values: [91,92,90,93,94,93,95,94,96,95,97,96,97,98,97,98,98,99] },
  { key: "automation_rate",        category: "IBM AMS Value",     name: "Automation Rate",            unit: "%",      target: 30.0,  dir: "higher", order: 10, desc: "Percentage of repeatable work automated",                 values: [14,15,14,16,17,17,18,19,20,21,20,22,23,24,25,26,27,28] },
  { key: "monthly_cost_savings",   category: "IBM AMS Value",     name: "Monthly Cost Savings",       unit: "$K",     target: 150,   dir: "higher", order: 11, desc: "Monthly savings delivered by IBM AMS automation & ops",   values: [95,102,98,108,115,112,121,128,132,138,135,142,148,155,152,158,163,168] },
  { key: "ticket_resolution_rate", category: "IBM AMS Value",     name: "Ticket Resolution Rate",     unit: "%",      target: 95.0,  dir: "higher", order: 12, desc: "Percentage of tickets resolved within SLA",               values: [87,88,86,89,90,89,91,92,91,93,92,94,93,94,95,95,96,96] },
  { key: "agile_adoption",         category: "Transformation",    name: "Agile Adoption Score",       unit: "/ 5",    target: 4.0,   dir: "higher", order: 13, desc: "Team self-assessed Agile maturity (1–5 scale)",           values: [2.2,2.3,2.2,2.4,2.5,2.5,2.6,2.7,2.8,2.8,2.9,3.0,3.0,3.1,3.2,3.3,3.4,3.5] },
  { key: "governance_maturity",    category: "Transformation",    name: "Governance Maturity",        unit: "/ 5",    target: 4.0,   dir: "higher", order: 14, desc: "Governance visibility and decision-making maturity (1–5)", values: [2.0,2.1,2.0,2.2,2.3,2.3,2.4,2.5,2.5,2.6,2.7,2.7,2.8,2.9,3.0,3.1,3.2,3.3] },
  { key: "automation_readiness",   category: "Transformation",    name: "Automation Readiness",       unit: "/ 5",    target: 3.5,   dir: "higher", order: 15, desc: "Readiness for increased automation and AIOps (1–5)",      values: [1.8,1.9,1.8,2.0,2.1,2.1,2.2,2.3,2.4,2.4,2.5,2.6,2.7,2.8,2.9,3.0,3.1,3.2] },
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
