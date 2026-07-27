import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, ChevronLeft, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const IBM_BLUE = "#0F62FE";

const SCALE = [
  { n: 1, label: "Needs\nFocus" },
  { n: 2, label: "Emerging" },
  { n: 3, label: "Stable" },
  { n: 4, label: "Proactive" },
  { n: 5, label: "Transformation-\nLed" },
];

const SECTIONS = [
  {
    title: "Section 1: Current Operations Stability",
    qs: [
      { id: "q1", text: "How would you rate the overall stability of current operations?" },
      { id: "q2", text: "Have there been any P1 (Priority 1) incidents in the past 12 months? Rate how effectively they were identified, escalated, and resolved to prevent recurrence." },
      { id: "q3", text: "How confident are you that current operations can support future transformation without disruption?" },
      {
        id: "q_outage",
        text: "How many outages with measurable business impact have occurred in the past 12 months?",
        type: "radio" as const,
        options: ["None", "0–2", "3–6", "Every month"],
      },
    ],
  },
  {
    title: "Section 2: Incident & High-Priority Incident Management",
    qs: [
      { id: "q4", text: "How effectively are high-priority incidents managed from identification to resolution?" },
      { id: "q5", text: "How clearly are roles, responsibilities, and communication handled during major incidents?" },
      { id: "q6", text: "How well are recurring issues, root causes, and preventive actions identified and tracked?" },
    ],
  },
  {
    title: "Section 3: Proactive Improvement Mindset",
    qs: [
      { id: "q7", text: "How ready is the team to shift from reactive support to proactive improvement?" },
      { id: "q8", text: "How often does the team identify improvement opportunities before issues occur?" },
      { id: "q9", text: "How effectively are lessons learned converted into sustained operational improvements?" },
    ],
  },
  {
    title: "Section 4: Data, Automation & Intelligent Operations Readiness",
    subtitle: "Rate current readiness and future potential — not current AIOps implementation.",
    qs: [
      { id: "q10", text: "How effectively does the team use operational data, trends, and patterns to drive improvements?" },
      { id: "q11", text: "How ready is the environment for increased automation and intelligent operations capabilities in the future?" },
      { id: "q12", text: "How clearly are automation opportunities identified, prioritized, and tracked today?" },
    ],
  },
  {
    title: "Section 5: Agile & Transformation Ways of Working",
    qs: [
      { id: "q13", text: "How consistently are Agile ways of working used where applicable, including backlog discipline, prioritization, and team ceremonies?" },
      { id: "q14", text: "How ready are teams to adopt Agile discipline in selected transformation areas?" },
      { id: "q15", text: "How effectively are business priorities translated into delivery actions and measurable outcomes?" },
    ],
  },
  {
    title: "Section 6: Governance & Visibility",
    qs: [
      { id: "q16", text: "How effective is current governance visibility across operations, risks, decisions, and transformation activities?" },
      { id: "q17", text: "How useful would a CareOps360-style governance dashboard be for weekly leadership visibility and decision-making?" },
    ],
  },
  {
    title: "Section 7: Product & Outcome Ownership",
    qs: [
      { id: "q18", text: "How ready is the organization to move toward product/platform ownership and outcome-based accountability?" },
    ],
  },
  {
    title: "Section 8: Open Feedback",
    subtitle: "Share your candid thoughts to help shape the IBM-Horizon transformation plan.",
    qs: [
      { id: "q19", text: "What are the top 2–3 changes that would help the IBM-Horizon team move from stable operations to a transformation-led mindset?", type: "text" as const },
      { id: "q20", text: "What risks, concerns, or dependencies should IBM and Horizon address early to make this transformation successful?", type: "text" as const },
    ],
  },
];

const ALL_RATING_IDS = SECTIONS.flatMap(s => s.qs.filter(q => !(q as any).type).map(q => q.id));

const Q_NUMBER_MAP = Object.fromEntries(
  SECTIONS.flatMap(s => s.qs).map((q, i) => [q.id, i + 1])
);

export default function TransformationMindsetSurvey() {
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [step, setStep] = useState(0); // 0 = intro, 1..N = sections, N+1 = done
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = SECTIONS.length;
  const isIntro = step === 0;
  const isDone = step === totalSteps + 1;
  const sectionIdx = step - 1;
  const currentSection = SECTIONS[sectionIdx];

  const sectionAnswered = (si: number) => {
    const sec = SECTIONS[si];
    return sec.qs.filter(q => !(q as any).type).every(q => answers[q.id] !== undefined);
  };

  const canNext = isIntro || (currentSection && (
    currentSection.qs.filter(q => !(q as any).type).length === 0 ||
    sectionAnswered(sectionIdx)
  ));

  const answeredRating = ALL_RATING_IDS.filter(id => answers[id] !== undefined).length;
  const progress = isDone ? 100 : isIntro ? 0 : Math.round((answeredRating / ALL_RATING_IDS.length) * 100);

  async function handleSubmit() {
    const missingRating = ALL_RATING_IDS.find(id => answers[id] === undefined);
    if (missingRating) { setError("Please answer all rating questions before submitting."); return; }
    setSubmitting(true); setError(null);
    try {
      const payload: Record<string, unknown> = {};
      ALL_RATING_IDS.forEach(id => { payload[id] = answers[id]; });
      payload.q19 = answers.q19 ?? "";
      payload.q20 = answers.q20 ?? "";
      payload.q_outage = answers.q_outage ?? "";
      const res = await fetch("/api/transformation-survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const j = await res.json() as { error?: string }; setError(j.error ?? "Submission failed"); return; }
      setStep(totalSteps + 1);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#1a237e,#0d47a1)" }}>
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
            <path d="M4 4h5v10h14V4h5v24h-5V19H9v9H4V4z" fill="white"/>
          </svg>
        </div>
        <span className="text-sm font-semibold text-slate-700">IBM · Horizon BCBS — Transformation Mindset Survey</span>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          Anonymous · Aggregate use only
        </div>
      </div>

      {/* Progress bar */}
      {!isDone && (
        <div className="h-1 bg-slate-100">
          <motion.div className="h-full" style={{ background: IBM_BLUE }}
            animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">

          {/* Intro */}
          {isIntro && (
            <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="text-center mb-8">
                <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-4 shadow-lg"
                  style={{ background: IBM_BLUE }}>
                  <ClipboardList className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-3">Horizon Transformation Mindset Survey</h1>
                <p className="text-slate-600 leading-relaxed max-w-lg mx-auto">
                  This anonymous workshop survey captures feedback on current operations maturity and opportunities to move toward a more proactive, transformation-led operating model.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">What to expect</p>
                  <ul className="text-sm text-slate-500 space-y-1.5">
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> 18 rating questions across 7 dimensions (takes ~4 minutes)</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> 2 optional open-text questions for your candid thoughts</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" /> Scale: 1 (Needs Focus) → 5 (Transformation-Led)</li>
                  </ul>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
                  🔒 <strong>Privacy:</strong> Responses are anonymous and will be used only in aggregate for workshop planning. No name, email, or identifier is collected.
                </div>
              </div>
              <Button className="w-full gap-2 text-base py-6" style={{ background: IBM_BLUE }}
                onClick={() => setStep(1)}>
                Start Survey <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* Survey sections */}
          {!isIntro && !isDone && currentSection && (
            <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-400 font-medium">Section {step} of {totalSteps}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">{currentSection.title}</h2>
              {currentSection.subtitle && (
                <p className="text-sm text-slate-500 mb-4 italic">{currentSection.subtitle}</p>
              )}

              <div className="space-y-6 mb-8">
                {currentSection.qs.map((q, qi) => (
                  <div key={q.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <p className="text-sm font-medium text-slate-800 mb-4 leading-snug">
                      <span className="text-blue-500 font-bold mr-1.5">{Q_NUMBER_MAP[q.id]}.</span>
                      {q.text}
                    </p>

                    {(q as any).type === "radio" && "options" in q ? (
                      <div className="flex flex-wrap gap-2">
                        {(q as any).options.map((opt: string) => {
                          const selected = answers[q.id] === opt;
                          return (
                            <button key={opt} type="button"
                              onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                              className={cn(
                                "px-5 py-2 rounded-full border-2 text-sm font-medium transition-all duration-150",
                                selected
                                  ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300",
                              )}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    ) : !(q as any).type ? (
                      <>
                        {/* Scale legend */}
                        <div className="grid grid-cols-5 gap-1.5 mb-3">
                          {SCALE.map(s => {
                            const sel = answers[q.id] === s.n;
                            return (
                              <button key={s.n} onClick={() => setAnswers(a => ({ ...a, [q.id]: s.n }))}
                                className={cn(
                                  "flex flex-col items-center justify-start rounded-xl border-2 p-2 transition-all duration-150 hover:scale-105 gap-1",
                                  sel
                                    ? s.n <= 2 ? "border-red-400 bg-red-50 shadow-md"
                                    : s.n === 3 ? "border-amber-400 bg-amber-50 shadow-md"
                                    : "border-blue-500 bg-blue-50 shadow-md"
                                    : "border-slate-200 bg-white hover:border-blue-200"
                                )}>
                                <span className={cn("text-xl font-bold", sel
                                  ? s.n <= 2 ? "text-red-600" : s.n === 3 ? "text-amber-600" : "text-blue-600"
                                  : "text-slate-400")}>
                                  {s.n}
                                </span>
                                <span className={cn("text-center leading-tight", sel ? "text-xs font-medium" : "text-xs text-slate-400")}
                                  style={{ whiteSpace: "pre-line", fontSize: 9 }}>
                                  {s.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {answers[q.id] && (
                          <p className="text-xs text-slate-400">
                            Selected: <span className="font-semibold text-blue-600">{answers[q.id]} — {SCALE.find(s => s.n === answers[q.id])?.label.replace("\n", " ")}</span>
                          </p>
                        )}
                      </>
                    ) : (
                      <textarea
                        rows={4}
                        placeholder="Type your response here (optional)…"
                        value={(answers[q.id] as string) ?? ""}
                        onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-slate-50/50"
                      />
                    )}
                  </div>
                ))}
              </div>

              {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-1" onClick={() => setStep(s => s - 1)}>
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                {step < totalSteps ? (
                  <Button className="flex-2 gap-1 flex-1" style={{ background: IBM_BLUE }}
                    disabled={!canNext} onClick={() => setStep(s => s + 1)}>
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button className="flex-2 gap-1 flex-1 font-semibold" style={{ background: IBM_BLUE }}
                    disabled={submitting} onClick={handleSubmit}>
                    {submitting ? "Submitting…" : "Submit Survey"}
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {/* Thank you */}
          {isDone && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
              <div className="inline-flex w-20 h-20 rounded-full items-center justify-center mb-6 shadow-lg"
                style={{ background: "#24A148" }}>
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Thank you!</h2>
              <p className="text-slate-600 leading-relaxed max-w-sm mx-auto mb-6">
                Your response has been recorded anonymously. Your feedback will help shape the IBM-Horizon transformation plan.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 text-sm text-blue-700 max-w-sm mx-auto">
                Results will be reviewed in aggregate by the workshop facilitator. Individual responses will not be attributed.
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
