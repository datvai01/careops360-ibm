export default function TransformationRoadmap() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-body text-text">
      {/* Top brand rule */}
      <div className="absolute top-0 left-0 w-full h-[0.7vh] bg-primary" />

      {/* Header */}
      <div className="absolute top-[1.8vh] left-[3vw] right-[3vw] flex items-end justify-between">
        <div>
          <div className="text-[1.5vw] font-semibold text-primary tracking-wide uppercase">
            CareOps360 · IBM × Horizon BCBS
          </div>
          <div className="font-display text-[2.2vw] font-extrabold tracking-tight leading-tight">
            Year-1 Transformation &amp; Transition Roadmap
          </div>
        </div>
        <div className="text-right pb-[0.5vh] text-[1.5vw] text-muted font-medium">AMS Reinvention · Months 1–12</div>
      </div>

      {/* ===== GANTT ===== */}
      <div className="absolute top-[9.6vh] left-[3vw] right-[3vw]">
        {/* Quarter header */}
        <div className="flex ml-[21vw]">
          <div className="w-1/4 text-center text-[1.5vw] font-bold text-primary border-b-[0.3vh] border-primary pb-[0.3vh]">Q1 · Foundation</div>
          <div className="w-1/4 text-center text-[1.5vw] font-bold text-primary/80 border-b-[0.3vh] border-primary/60 pb-[0.3vh]">Q2 · Pilot &amp; Scale</div>
          <div className="w-1/4 text-center text-[1.5vw] font-bold text-primary/80 border-b-[0.3vh] border-primary/60 pb-[0.3vh]">Q3 · Expand</div>
          <div className="w-1/4 text-center text-[1.5vw] font-bold text-primary/80 border-b-[0.3vh] border-primary/60 pb-[0.3vh]">Q4 · Operate</div>
        </div>

        <div className="relative mt-[0.4vh]">
          {/* Quarter gridlines */}
          <div className="absolute top-0 bottom-0 left-[21vw] right-0">
            <div className="absolute top-0 bottom-0 left-0 w-px bg-slate-300" />
            <div className="absolute top-0 bottom-0 left-1/4 w-px bg-slate-300" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-300" />
            <div className="absolute top-0 bottom-0 left-3/4 w-px bg-slate-300" />
            <div className="absolute top-0 bottom-0 right-0 w-px bg-slate-300" />
          </div>

          {/* ---- FOUNDATIONAL ---- */}
          <div className="relative flex items-center h-[2.7vh] bg-[#0f62fe]/10">
            <span className="text-[1.5vw] font-bold uppercase tracking-wide text-[#0f62fe] pl-[0.3vw]">Foundational</span>
          </div>

          <div className="relative flex items-center h-[4.1vh]">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Transition-in &amp; discovery</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#0f62fe] left-[0%] w-[16.7%]" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[17.5%] text-[1.5vw] text-muted leading-none whitespace-nowrap">M1–M2 · knowledge transfer, app inventory, service baselining</div>
            </div>
          </div>

          <div className="relative flex items-center h-[4.1vh] bg-white/60">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Governance &amp; backlog</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#0f62fe] left-[0%] w-[16.7%]" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[16.7%] -ml-[0.5vw] w-[1vw] h-[1vw] rotate-45 bg-[#f1c21b] border border-slate-500" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[18.3%] text-[1.5vw] text-muted leading-none whitespace-nowrap">M1–M2 · steering cadence set, prioritized agent backlog approved</div>
            </div>
          </div>

          <div className="relative flex items-center h-[4.1vh]">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Value dashboard &amp; KPIs</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#0f62fe]/85 left-[0%] w-[25%]" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[25.8%] text-[1.5vw] text-muted leading-none whitespace-nowrap">M1–M3 · savings instrumentation, SLA &amp; productivity baselines</div>
            </div>
          </div>

          <div className="relative flex items-center h-[4.1vh] bg-white/60">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Security &amp; guardrails</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#0f62fe]/85 left-[8.3%] w-[25%]" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[34.2%] text-[1.5vw] text-muted leading-none whitespace-nowrap">M2–M4 · agent guardrails, HIPAA &amp; compliance reviews</div>
            </div>
          </div>

          {/* ---- STRATEGIC ---- */}
          <div className="relative flex items-center h-[2.7vh] bg-[#6929c4]/10">
            <span className="text-[1.5vw] font-bold uppercase tracking-wide text-[#6929c4] pl-[0.3vw]">Strategic</span>
          </div>

          <div className="relative flex items-center h-[4.1vh]">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Business case &amp; funding</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#6929c4] left-[0%] w-[25%]" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[25.8%] text-[1.5vw] text-muted leading-none whitespace-nowrap">M1–M3 · expected-case ROI model, stage-gate funding approvals</div>
            </div>
          </div>

          <div className="relative flex items-center h-[4.1vh] bg-white/60">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Modernization assessment</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#6929c4] left-[25%] w-[25%]" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[50.8%] text-[1.5vw] text-muted leading-none whitespace-nowrap">M4–M6 · app rationalization &amp; cloud roadmap</div>
            </div>
          </div>

          <div className="relative flex items-center h-[4.1vh]">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Pod model &amp; talent plan</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#6929c4]/85 left-[25%] w-[33.3%]" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[59.2%] text-[1.5vw] text-muted leading-none whitespace-nowrap">M4–M7 · pod design &amp; role mapping</div>
            </div>
          </div>

          <div className="relative flex items-center h-[4.1vh] bg-white/60">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Expansion strategy</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#6929c4]/85 left-[41.7%] w-[33.3%] flex items-center pl-[0.5vw]">
                <span className="text-white text-[1.5vw] font-medium leading-none whitespace-nowrap">M6–M9 · Provider &amp; Member Svc</span>
              </div>
            </div>
          </div>

          {/* ---- TACTICAL ---- */}
          <div className="relative flex items-center h-[2.7vh] bg-[#1192e8]/10">
            <span className="text-[1.5vw] font-bold uppercase tracking-wide text-[#1192e8] pl-[0.3vw]">Tactical</span>
          </div>

          <div className="relative flex items-center h-[4.1vh]">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Build four pilot agents</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#1192e8] left-[8.3%] w-[16.7%]" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[25.8%] text-[1.5vw] text-muted leading-none whitespace-nowrap">M2–M3 · Triage, QE, Claims, Prior Auth</div>
            </div>
          </div>

          <div className="relative flex items-center h-[4.1vh] bg-white/60">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Pilots &amp; value tracking</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#1192e8] left-[16.7%] w-[16.6%]" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[25%] -ml-[0.5vw] w-[1vw] h-[1vw] rotate-45 bg-[#f1c21b] border border-slate-500" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[34.2%] text-[1.5vw] text-muted leading-none whitespace-nowrap">M3–M4 · pilots live in production, value report to steering</div>
            </div>
          </div>

          <div className="relative flex items-center h-[4.1vh]">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Scale to six agents</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#1192e8]/85 left-[25%] w-[25%]" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[50%] -ml-[0.5vw] w-[1vw] h-[1vw] rotate-45 bg-[#f1c21b] border border-slate-500" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[51.6%] text-[1.5vw] text-muted leading-none whitespace-nowrap">M4–M6 · + Modernization &amp; Release Readiness</div>
            </div>
          </div>

          <div className="relative flex items-center h-[4.1vh] bg-white/60">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Knowledge &amp; AI assistant</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#1192e8]/85 left-[25%] w-[41.7%]" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[67.5%] text-[1.5vw] text-muted leading-none whitespace-nowrap">M4–M8 · corpus, Ask, Teams bot</div>
            </div>
          </div>

          {/* ---- OPERATIONAL ---- */}
          <div className="relative flex items-center h-[2.7vh] bg-[#24a148]/10">
            <span className="text-[1.5vw] font-bold uppercase tracking-wide text-[#24a148] pl-[0.3vw]">Operational</span>
          </div>

          <div className="relative flex items-center h-[4.1vh]">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Triage &amp; runbook ops</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#24a148] left-[16.7%] w-[83.3%] flex items-center pl-[0.5vw]">
                <span className="text-white text-[1.5vw] font-medium leading-none whitespace-nowrap">M3–M12 · 24×7 ops, automation coverage grows quarterly</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center h-[4.1vh] bg-white/60">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">SLA &amp; value reviews</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#24a148]/85 left-[16.7%] w-[83.3%] flex items-center pl-[0.5vw]">
                <span className="text-white text-[1.5vw] font-medium leading-none whitespace-nowrap">M3–M12 · monthly scorecards, quarterly value reviews</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center h-[4.1vh]">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Pod transition</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#24a148]/85 left-[50%] w-[50%] flex items-center pl-[0.5vw]">
                <span className="text-white text-[1.5vw] font-medium leading-none whitespace-nowrap">M7–M12 · wave cutover to pods</span>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 left-[100%] -ml-[0.8vw] w-[1vw] h-[1vw] rotate-45 bg-[#f1c21b] border border-slate-500" />
            </div>
          </div>

          <div className="relative flex items-center h-[4.1vh] bg-white/60">
            <div className="w-[21vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-none truncate">Governed autonomy</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.5vh] rounded-sm bg-[#24a148]/70 left-[66.7%] w-[33.3%] flex items-center pl-[0.5vw]">
                <span className="text-white text-[1.5vw] font-medium leading-none whitespace-nowrap">M9–M12 · autonomy by risk tier</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-[1.6vh] left-[3vw] right-[3vw] flex items-center justify-between border-t border-slate-300 pt-[0.8vh]">
        <div className="flex items-center gap-[1.2vw]">
          <div className="flex items-center gap-[0.4vw]"><div className="w-[0.9vw] h-[0.9vw] rounded-sm bg-[#0f62fe]" /><span className="text-[1.5vw] text-muted">Foundational</span></div>
          <div className="flex items-center gap-[0.4vw]"><div className="w-[0.9vw] h-[0.9vw] rounded-sm bg-[#6929c4]" /><span className="text-[1.5vw] text-muted">Strategic</span></div>
          <div className="flex items-center gap-[0.4vw]"><div className="w-[0.9vw] h-[0.9vw] rounded-sm bg-[#1192e8]" /><span className="text-[1.5vw] text-muted">Tactical</span></div>
          <div className="flex items-center gap-[0.4vw]"><div className="w-[0.9vw] h-[0.9vw] rounded-sm bg-[#24a148]" /><span className="text-[1.5vw] text-muted">Operational</span></div>
          <div className="flex items-center gap-[0.4vw]"><div className="w-[0.9vw] h-[0.9vw] rotate-45 bg-[#f1c21b] border border-slate-500" /><span className="text-[1.5vw] text-muted">Milestone</span></div>
        </div>
        <div className="text-[1.5vw] font-semibold text-muted">IBM Confidential · Demonstration · 2026</div>
      </div>
    </div>
  );
}
