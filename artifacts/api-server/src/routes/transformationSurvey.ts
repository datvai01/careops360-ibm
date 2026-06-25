import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, transformationSurveyResponsesTable } from "@workspace/db";
import { sql, avg, count } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  next();
}

/* ── helpers ─────────────────────────────────────────────────── */

const DIMENSION_MAP = [
  { key: "ops_stability",   label: "Operations Stability",                     qs: ["q1","q2","q3"]    as const },
  { key: "incident_mgmt",   label: "High-Priority Incident Management",         qs: ["q4","q5","q6"]    as const },
  { key: "proactive",       label: "Proactive Improvement",                     qs: ["q7","q8","q9"]    as const },
  { key: "automation",      label: "Automation & Intelligent Operations",       qs: ["q10","q11","q12"] as const },
  { key: "agile",           label: "Agile Ways of Working",                     qs: ["q13","q14","q15"] as const },
  { key: "governance",      label: "Governance Visibility",                     qs: ["q16","q17"]       as const },
  { key: "product_ownership", label: "Product / Outcome Ownership",             qs: ["q18"]             as const },
] as const;

type DimKey = typeof DIMENSION_MAP[number]["key"];

function dimAvg(rows: Record<string, number | null>[], qs: readonly string[]): number {
  const vals: number[] = [];
  rows.forEach(r => qs.forEach(q => { const v = r[q]; if (v != null && v >= 1 && v <= 5) vals.push(v); }));
  if (!vals.length) return 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
}

type TransitionPlan = {
  executiveSummary: string;
  strengths: string[];
  opportunities: string[];
  plan: { days30: string[]; days60: string[]; days90: string[] };
  risks: { risk: string; mitigation: string }[];
  workshopThemes: string[];
  source: "openai" | "rule-based";
};

const DIM_LABELS: Record<DimKey, string> = Object.fromEntries(DIMENSION_MAP.map(d => [d.key, d.label])) as Record<DimKey, string>;

function ruleBasedPlan(dimScores: Record<DimKey, number>): TransitionPlan {
  const weak = (DIMENSION_MAP.filter(d => dimScores[d.key] < 3.5).map(d => d.label));
  const strong = (DIMENSION_MAP.filter(d => dimScores[d.key] >= 3.5).map(d => d.label));
  const allStrong = weak.length === 0;

  const recs: Record<DimKey, { opp: string; d30: string; d60: string; d90: string }> = {
    ops_stability: {
      opp: "Strengthen operational confidence through SLA transparency and service dependency mapping",
      d30: "Baseline SLA performance and document top 10 service dependencies across towers",
      d60: "Introduce operational readiness checkpoints and service stability scorecards",
      d90: "Establish continuous SLA improvement cycle and risk-flagging governance process",
    },
    incident_mgmt: {
      opp: "Improve major incident response speed, role clarity, and root-cause discipline",
      d30: "Document major incident playbook and clarify role ownership for P1/P2 events",
      d60: "Introduce RCA quality reviews and preventive action tracking in weekly governance",
      d90: "Measure and publish incident prevention ratio; target 20% reduction in recurrence",
    },
    proactive: {
      opp: "Shift from reactive support to proactive improvement through improvement backlog discipline",
      d30: "Create improvement backlog seeded from recurring incidents and service reviews",
      d60: "Establish weekly improvement reviews with ownership and delivery tracking",
      d90: "Demonstrate first wave of proactive improvements preventing at least 5 recurring events",
    },
    automation: {
      opp: "Build automation readiness by identifying and prioritising repeatable manual work",
      d30: "Launch automation intake process and identify top 10 automation candidates",
      d60: "Prototype first 2–3 automations; assess monitoring signal quality for future AIOps readiness",
      d90: "Deliver first automation wave; define intelligent operations readiness roadmap",
    },
    agile: {
      opp: "Introduce Agile discipline in selected transformation areas with practical coaching",
      d30: "Select 2–3 pilot workstreams for Agile adoption; establish sprint cadence and backlog",
      d60: "Run retrospectives and publish sprint health metrics; coach on backlog prioritisation",
      d90: "Expand Agile adoption to additional workstreams; measure outcome delivery vs activity",
    },
    governance: {
      opp: "Establish CareOps360-style governance visibility for weekly leadership decision-making",
      d30: "Define governance dashboard requirements and decision/risk tracking structure",
      d60: "Launch weekly governance cadence using CareOps360; embed decision log and risk tracker",
      d90: "Demonstrate governance-led transformation decisions; tie dashboard usage to outcome delivery",
    },
    product_ownership: {
      opp: "Clarify product/platform ownership model and shift from project to outcome accountability",
      d30: "Define product/service taxonomy and draft ownership RACI across IBM delivery teams",
      d60: "Align roles, metrics, and decision rights to product/platform owners",
      d90: "Publish value realization metrics per product; run first outcome accountability review",
    },
  };

  const days30: string[] = [];
  const days60: string[] = [];
  const days90: string[] = [];
  const opportunities: string[] = [];

  if (allStrong) {
    days30.push("Launch transformation acceleration sprint: identify quick automation wins and governance improvements");
    days60.push("Pilot CareOps360 governance visibility with weekly executive leadership review");
    days90.push("Formalise product/platform ownership model and publish first value realization scorecard");
    days30.push("Define QE transition readiness assessment scope and IBM ownership plan");
    days60.push("Identify automation candidates in QE regression and defect governance workflows");
    days90.push("Position Quality Engineering transition as an enabling workstream for transformation-led delivery");
  } else {
    DIMENSION_MAP.forEach(d => {
      if (dimScores[d.key] < 3.5) {
        const r = recs[d.key];
        opportunities.push(r.opp);
        days30.push(r.d30);
        days60.push(r.d60);
        days90.push(r.d90);
      }
    });
  }

  return {
    executiveSummary: allStrong
      ? "Current operations are stable and the team is ready to accelerate transformation. Focus should shift to automation readiness, governance visibility, product ownership, and value realization — building on a strong operational foundation."
      : `Current operations are stable. The transition plan focuses on moving the IBM-Horizon team toward a transformation-led ecosystem in ${weak.length} priority area${weak.length > 1 ? "s" : ""}: ${weak.slice(0, 3).join(", ")}${weak.length > 3 ? ", and others" : ""}. This is not about correcting failed operations — it is about accelerating maturity.`,
    strengths: strong.length > 0 ? strong.map(s => `${s} is performing at a strong maturity level`) : ["Stable baseline established across all operational towers"],
    opportunities: allStrong
      ? ["Accelerate automation readiness and intelligent operations planning", "Deepen governance visibility through CareOps360", "Formalise product/outcome ownership model", "Define value realization metrics tied to transformation outcomes"]
      : opportunities,
    plan: {
      days30: days30.slice(0, 5),
      days60: days60.slice(0, 5),
      days90: [...days90.slice(0, 4), "Position Quality Engineering transition as a later enabling workstream — reinforce ownership, automation, defect governance, and quality mindset"],
    },
    risks: [
      { risk: "Transformation effort competes with stable-state delivery priorities", mitigation: "Define a dedicated transformation capacity allocation and protect it in sprint planning" },
      { risk: "Governance visibility adoption stalls if leadership engagement is low", mitigation: "Tie CareOps360 reviews to weekly IBM-Horizon governance cadence with exec sponsorship" },
      { risk: "Automation readiness effort underestimates integration complexity", mitigation: "Scope automations conservatively; start with simple repeatable tasks before complex integrations" },
      { risk: "QE transition creates knowledge risk if it is accelerated before ownership model is clear", mitigation: "Stage QE transition after automation and governance foundations are in place; use shadow/reverse-shadow approach" },
    ],
    workshopThemes: [
      "What does 'transformation-led' mean for the IBM-Horizon team day-to-day?",
      "Which 2–3 improvement opportunities would deliver the most visible value in 30 days?",
      "What governance cadence and visibility would help Horizon leadership make faster decisions?",
      "Where does the team see the biggest barrier to automation readiness?",
      "How should ownership and accountability shift as the team moves to a product/platform model?",
    ],
    source: "rule-based",
  };
}

async function openAiPlan(dimScores: Record<DimKey, number>, q19: string[], q20: string[]): Promise<TransitionPlan | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const dimSummary = DIMENSION_MAP.map(d => `${d.label}: ${dimScores[d.key].toFixed(2)}/5`).join("\n");
    const openTextSummary = [
      q19.length ? `Top improvement themes (Q19): ${q19.slice(0, 5).join(" | ")}` : "",
      q20.length ? `Risks and concerns (Q20): ${q20.slice(0, 5).join(" | ")}` : "",
    ].filter(Boolean).join("\n");

    const prompt = `You are an IBM executive advisor producing a workshop transition plan for the Horizon BCBS IBM AMS engagement.

Current maturity scores (1=Needs focus, 5=Transformation-led):
${dimSummary}

Participant open feedback:
${openTextSummary || "No open-text responses yet."}

Framing: Current operations are stable. The plan should focus on moving the IBM-Horizon team toward a transformation-led ecosystem — NOT correcting failed operations. Use constructive language: outcome ownership, proactive improvement, automation readiness, governance visibility, Agile discipline, product/platform ownership, value realization. Quality Engineering transition should be positioned as a later enabling workstream.

Return ONLY a valid JSON object with these exact keys:
{
  "executiveSummary": "2-3 sentence summary",
  "strengths": ["strength1", "strength2", "strength3"],
  "opportunities": ["opp1", "opp2", "opp3", "opp4"],
  "plan": {
    "days30": ["action1", "action2", "action3", "action4", "action5"],
    "days60": ["action1", "action2", "action3", "action4", "action5"],
    "days90": ["action1", "action2", "action3", "action4", "action5"]
  },
  "risks": [
    {"risk": "...", "mitigation": "..."},
    {"risk": "...", "mitigation": "..."},
    {"risk": "...", "mitigation": "..."},
    {"risk": "...", "mitigation": "..."}
  ],
  "workshopThemes": ["theme1", "theme2", "theme3", "theme4", "theme5"]
}`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 1200,
        response_format: { type: "json_object" },
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json() as { choices?: { message?: { content?: string } }[] };
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as Omit<TransitionPlan, "source">;
    return { ...parsed, source: "openai" };
  } catch {
    return null;
  }
}

/* ── routes ──────────────────────────────────────────────────── */

router.post("/transformation-survey/submit", async (req: Request, res: Response): Promise<void> => {
  const body = req.body as Record<string, unknown>;
  const nums: Record<string, number | null> = {};
  for (let i = 1; i <= 18; i++) {
    const k = `q${i}`;
    const v = body[k];
    nums[k] = typeof v === "number" && v >= 1 && v <= 5 ? v : null;
  }
  const required = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
  const missing = required.filter(i => nums[`q${i}`] == null);
  if (missing.length) { res.status(400).json({ error: `Missing answers for questions: ${missing.join(", ")}` }); return; }

  await db.insert(transformationSurveyResponsesTable).values({
    q1: nums.q1!, q2: nums.q2!, q3: nums.q3!, q4: nums.q4!, q5: nums.q5!, q6: nums.q6!,
    q7: nums.q7!, q8: nums.q8!, q9: nums.q9!, q10: nums.q10!, q11: nums.q11!, q12: nums.q12!,
    q13: nums.q13!, q14: nums.q14!, q15: nums.q15!, q16: nums.q16!, q17: nums.q17!, q18: nums.q18!,
    q19: typeof body.q19 === "string" ? body.q19.slice(0, 2000) : null,
    q20: typeof body.q20 === "string" ? body.q20.slice(0, 2000) : null,
  });
  res.json({ ok: true });
});

router.get("/transformation-survey/results", requireAuth, async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(transformationSurveyResponsesTable);
  const total = rows.length;

  const rawRows = rows.map(r => ({
    q1: r.q1, q2: r.q2, q3: r.q3, q4: r.q4, q5: r.q5, q6: r.q6,
    q7: r.q7, q8: r.q8, q9: r.q9, q10: r.q10, q11: r.q11, q12: r.q12,
    q13: r.q13, q14: r.q14, q15: r.q15, q16: r.q16, q17: r.q17, q18: r.q18,
  })) as Record<string, number | null>[];

  const dimensions = Object.fromEntries(
    DIMENSION_MAP.map(d => [d.key, { label: d.label, avg: dimAvg(rawRows, d.qs), count: total }])
  );

  const overallAvg = total > 0
    ? Math.round((Object.values(dimensions).reduce((s, d) => s + d.avg, 0) / Object.values(dimensions).length) * 100) / 100
    : 0;

  const q19 = rows.map(r => r.q19).filter((v): v is string => !!v?.trim());
  const q20 = rows.map(r => r.q20).filter((v): v is string => !!v?.trim());

  res.json({ total, overallAvg, dimensions, q19Responses: q19, q20Responses: q20 });
});

router.post("/transformation-survey/generate-plan", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(transformationSurveyResponsesTable);
  const rawRows = rows.map(r => ({
    q1: r.q1, q2: r.q2, q3: r.q3, q4: r.q4, q5: r.q5, q6: r.q6,
    q7: r.q7, q8: r.q8, q9: r.q9, q10: r.q10, q11: r.q11, q12: r.q12,
    q13: r.q13, q14: r.q14, q15: r.q15, q16: r.q16, q17: r.q17, q18: r.q18,
  })) as Record<string, number | null>[];

  const dimScores = Object.fromEntries(
    DIMENSION_MAP.map(d => [d.key, dimAvg(rawRows, d.qs)])
  ) as Record<DimKey, number>;

  const q19 = rows.map(r => r.q19).filter((v): v is string => !!v?.trim());
  const q20 = rows.map(r => r.q20).filter((v): v is string => !!v?.trim());

  const plan = await openAiPlan(dimScores, q19, q20) ?? ruleBasedPlan(dimScores);
  res.json(plan);
});

router.get("/transformation-survey/export-csv", requireAuth, async (_req: Request, res: Response): Promise<void> => {
  const rows = await db.select().from(transformationSurveyResponsesTable);
  const rawRows = rows.map(r => ({
    q1: r.q1, q2: r.q2, q3: r.q3, q4: r.q4, q5: r.q5, q6: r.q6,
    q7: r.q7, q8: r.q8, q9: r.q9, q10: r.q10, q11: r.q11, q12: r.q12,
    q13: r.q13, q14: r.q14, q15: r.q15, q16: r.q16, q17: r.q17, q18: r.q18,
  })) as Record<string, number | null>[];

  const headers = [...DIMENSION_MAP.map(d => d.label), "Response Count"];
  const dataRow = [...DIMENSION_MAP.map(d => dimAvg(rawRows, d.qs).toFixed(2)), String(rows.length)];
  const csv = [headers.join(","), dataRow.join(",")].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=transformation_survey_results.csv");
  res.send(csv);
});

router.delete("/transformation-survey/clear", requireAuth, async (_req: Request, res: Response): Promise<void> => {
  await db.delete(transformationSurveyResponsesTable);
  res.json({ ok: true });
});

export default router;
