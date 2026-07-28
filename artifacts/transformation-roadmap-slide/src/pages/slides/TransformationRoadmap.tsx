export default function TransformationRoadmap() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-body text-text">
      {/* Top brand rule */}
      <div className="absolute top-0 left-0 w-full h-[0.8vh] bg-primary" />

      {/* Header */}
      <div className="absolute top-[2.4vh] left-[3vw] right-[3vw] flex items-end justify-between">
        <div>
          <div className="text-[1.5vw] font-semibold text-primary tracking-wide uppercase">
            CareOps360 · IBM × Horizon BCBS · AMS Reinvention Program
          </div>
          <div className="font-display text-[2.2vw] font-extrabold tracking-tight leading-tight">
            Year-1 Transformation &amp; Transition Roadmap
          </div>
        </div>

      </div>

      {/* ===== LEFT: GANTT ===== */}
      <div className="absolute top-[13vh] left-[3vw] w-[59vw]">
        {/* Quarter header */}
        <div className="flex ml-[13.5vw]">
          <div className="w-1/4 text-center text-[1.5vw] font-bold text-primary border-b-[0.3vh] border-primary pb-[0.4vh]">Q1 · Foundation</div>
          <div className="w-1/4 text-center text-[1.5vw] font-bold text-primary/80 border-b-[0.3vh] border-primary/60 pb-[0.4vh]">Q2 · Pilot</div>
          <div className="w-1/4 text-center text-[1.5vw] font-bold text-primary/80 border-b-[0.3vh] border-primary/60 pb-[0.4vh]">Q3 · Expand</div>
          <div className="w-1/4 text-center text-[1.5vw] font-bold text-primary/80 border-b-[0.3vh] border-primary/60 pb-[0.4vh]">Q4 · Operate</div>
        </div>

        {/* Chart body with quarter gridlines */}
        <div className="relative mt-[0.8vh]">
          <div className="absolute top-0 bottom-0 left-[13.5vw] right-0">
            <div className="absolute top-0 bottom-0 left-0 w-px bg-slate-300" />
            <div className="absolute top-0 bottom-0 left-1/4 w-px bg-slate-300" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-300" />
            <div className="absolute top-0 bottom-0 left-3/4 w-px bg-slate-300" />
            <div className="absolute top-0 bottom-0 right-0 w-px bg-slate-300" />
          </div>

          {/* Row 1 */}
          <div className="relative flex items-center h-[7.4vh]">
            <div className="w-[13.5vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-tight">Transition-in &amp; discovery</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.8vh] rounded-sm bg-primary left-[0%] w-[16.7%] flex items-center pl-[0.5vw]">
                <span className="text-white text-[1.5vw] font-medium whitespace-nowrap">M1–M2</span>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="relative flex items-center h-[7.4vh] bg-white/60">
            <div className="w-[13.5vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-tight">Governance &amp; agent backlog</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.8vh] rounded-sm bg-primary left-[0%] w-[16.7%]" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[16.7%] -ml-[0.55vw] w-[1.1vw] h-[1.1vw] rotate-45 bg-accent border-2 border-white shadow" />
            </div>
          </div>

          {/* Row 3 */}
          <div className="relative flex items-center h-[7.4vh]">
            <div className="w-[13.5vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-tight">Build four pilot agents</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.8vh] rounded-sm bg-primary left-[8.3%] w-[16.7%] flex items-center pl-[0.5vw]">
                <span className="text-white text-[1.5vw] font-medium whitespace-nowrap">M2–M3</span>
              </div>
            </div>
          </div>

          {/* Row 4 */}
          <div className="relative flex items-center h-[7.4vh] bg-white/60">
            <div className="w-[13.5vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-tight">Pilots &amp; value tracking</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.8vh] rounded-sm bg-primary/85 left-[16.7%] w-[16.6%]" />
              <div className="absolute top-1/2 -translate-y-1/2 left-[25%] -ml-[0.55vw] w-[1.1vw] h-[1.1vw] rotate-45 bg-accent border-2 border-white shadow" />
            </div>
          </div>

          {/* Row 5 */}
          <div className="relative flex items-center h-[7.4vh]">
            <div className="w-[13.5vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-tight">Scale to six agents</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.8vh] rounded-sm bg-primary/85 left-[25%] w-[25%] flex items-center pl-[0.5vw]">
                <span className="text-white text-[1.5vw] font-medium whitespace-nowrap">M4–M6</span>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 left-[50%] -ml-[0.55vw] w-[1.1vw] h-[1.1vw] rotate-45 bg-accent border-2 border-white shadow" />
            </div>
          </div>

          {/* Row 6 */}
          <div className="relative flex items-center h-[7.4vh] bg-white/60">
            <div className="w-[13.5vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-tight">Knowledge &amp; AI assistant</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.8vh] rounded-sm bg-primary/70 left-[25%] w-[33.3%] flex items-center pl-[0.5vw]">
                <span className="text-white text-[1.5vw] font-medium whitespace-nowrap">M4–M8</span>
              </div>
            </div>
          </div>

          {/* Row 7 */}
          <div className="relative flex items-center h-[7.4vh]">
            <div className="w-[13.5vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-tight">Provider &amp; member ops</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.8vh] rounded-sm bg-primary/70 left-[50%] w-[25%] flex items-center pl-[0.5vw]">
                <span className="text-white text-[1.5vw] font-medium whitespace-nowrap">M7–M9</span>
              </div>
            </div>
          </div>

          {/* Row 8 */}
          <div className="relative flex items-center h-[7.4vh] bg-white/60">
            <div className="w-[13.5vw] pr-[0.8vw] text-[1.5vw] font-semibold leading-tight">Pod model &amp; steady state</div>
            <div className="relative flex-1 h-full">
              <div className="absolute top-1/2 -translate-y-1/2 h-[2.8vh] rounded-sm bg-primary/55 left-[50%] w-[50%] flex items-center pl-[0.5vw]">
                <span className="text-white text-[1.5vw] font-medium whitespace-nowrap">M7–M12</span>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 left-[100%] -ml-[0.9vw] w-[1.1vw] h-[1.1vw] rotate-45 bg-accent border-2 border-white shadow" />
            </div>
          </div>
        </div>

        {/* Milestone legend */}
        <div className="mt-[1.4vh] flex items-start gap-[1vw]">
          <div className="flex items-center gap-[0.5vw] shrink-0 pt-[0.2vh]">
            <div className="w-[0.9vw] h-[0.9vw] rotate-45 bg-accent border-2 border-white shadow" />
            <span className="text-[1.5vw] font-bold">Milestones:</span>
          </div>
          <div className="text-[1.5vw] text-muted leading-snug">
            M2 governance approved · M3 four pilots live · M6 governed autonomy &amp; value report · M12 pod model operational
          </div>
        </div>
      </div>

      {/* ===== RIGHT: ROI & NEEDS ===== */}
      <div className="absolute top-[13vh] right-[3vw] w-[31.5vw] bottom-[7vh] flex flex-col gap-[1.4vh]">
        {/* ROI panel */}
        <div className="bg-white rounded-md shadow-sm border border-slate-200 px-[1.1vw] py-[1.2vh]">
          <div className="text-[1.5vw] font-bold text-primary uppercase tracking-wide">ROI &amp; Value</div>
          <div className="mt-[0.8vh] grid grid-cols-2 gap-x-[1vw] gap-y-[1vh]">
            <div>
              <div className="font-display text-[2.3vw] font-extrabold leading-none">$4.6M</div>
              <div className="text-[1.5vw] text-muted leading-tight">Year-1 realized savings</div>
            </div>
            <div>
              <div className="font-display text-[2.3vw] font-extrabold leading-none">$12.2M</div>
              <div className="text-[1.5vw] text-muted leading-tight">cost avoidance projected</div>
            </div>
            <div>
              <div className="font-display text-[2.3vw] font-extrabold leading-none text-accent">110%</div>
              <div className="text-[1.5vw] text-muted leading-tight">ROI vs. $1.2M investment</div>
            </div>
            <div>
              <div className="font-display text-[2.3vw] font-extrabold leading-none text-accent">~6 mo</div>
              <div className="text-[1.5vw] text-muted leading-tight">payback on agents</div>
            </div>
          </div>
          <div className="mt-[1vh] pt-[0.9vh] border-t border-slate-200 text-[1.5vw] leading-snug text-muted">
            <span className="font-semibold text-text">Productivity:</span> 31.4% gain from IBM tooling · 20–30% pilot effort reduction · 18.7% lower cost per ticket
          </div>
        </div>

        {/* Horizon needs panel */}
        <div className="flex-1 bg-[#0b2e6b] text-white rounded-md shadow-sm px-[1.1vw] py-[1.2vh]">
          <div className="text-[1.5vw] font-bold uppercase tracking-wide text-[#8ab4ff]">What We Need from Horizon</div>
          <div className="mt-[0.9vh] space-y-[0.9vh]">
            <div className="flex gap-[0.6vw] text-[1.5vw] leading-snug">
              <span className="text-[#8ab4ff] font-bold">01</span>
              <span className="font-medium">Executive sponsor &amp; steering cadence</span>
            </div>
            <div className="flex gap-[0.6vw] text-[1.5vw] leading-snug">
              <span className="text-[#8ab4ff] font-bold">02</span>
              <span className="font-medium">SME time (~20%) in Q1–Q2 builds</span>
            </div>
            <div className="flex gap-[0.6vw] text-[1.5vw] leading-snug">
              <span className="text-[#8ab4ff] font-bold">03</span>
              <span className="font-medium">System, data &amp; environment access</span>
            </div>
            <div className="flex gap-[0.6vw] text-[1.5vw] leading-snug">
              <span className="text-[#8ab4ff] font-bold">04</span>
              <span className="font-medium">Security sign-off per pilot wave</span>
            </div>
            <div className="flex gap-[0.6vw] text-[1.5vw] leading-snug">
              <span className="text-[#8ab4ff] font-bold">05</span>
              <span className="font-medium">Pod staffing &amp; change plan by Q3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-[2vh] left-[3vw] right-[3vw] flex items-center justify-between border-t border-slate-300 pt-[0.9vh]">
        <div className="text-[1.5vw] text-muted">Source: CareOps360 value tracking &amp; agent business case (expected scenario)</div>
        <div className="text-[1.5vw] font-semibold text-muted">IBM Confidential · Demonstration · 2026</div>
      </div>
    </div>
  );
}
