export default function Slide08Quality() {
  return (
    <div className="w-screen h-screen overflow-hidden relative font-display px-[7vw] py-[5vh]" style={{ background: "#f2f4f8" }}>

      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "#0f62fe" }} />

      <div className="font-semibold tracking-widest uppercase mb-[0.5vh]" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>
        5.0 Quality Engineering
      </div>
      <div className="font-bold tracking-tight leading-none mb-[0.4vh]" style={{ fontSize: "3.2vw", color: "#161616" }}>
        Quality as an Always-On Control System
      </div>
      <div className="mb-[3vh]" style={{ fontSize: "1.5vw", color: "#525252" }}>
        Measurable quality at every milestone — improving with every release
      </div>

      <div className="flex gap-[4vw]" style={{ height: "68vh" }}>

        <div className="flex-1 flex flex-col gap-[2.5vh]">
          <div className="rounded-xl p-[2.2vh_2vw] flex flex-col gap-[1vh]" style={{ background: "#ffffff", borderLeft: "4px solid #0f62fe" }}>
            <div className="font-semibold leading-tight" style={{ fontSize: "1.6vw", color: "#161616" }}>GenAI-Assisted Test Generation</div>
            <div className="leading-snug" style={{ fontSize: "1.4vw", color: "#525252" }}>AI-generated and maintained test suites increase automation coverage from ~25% to 80%+ through intelligent test authoring</div>
          </div>
          <div className="rounded-xl p-[2.2vh_2vw] flex flex-col gap-[1vh]" style={{ background: "#ffffff", borderLeft: "4px solid #0043ce" }}>
            <div className="font-semibold leading-tight" style={{ fontSize: "1.6vw", color: "#161616" }}>Shift-Left Quality Gates</div>
            <div className="leading-snug" style={{ fontSize: "1.4vw", color: "#525252" }}>Defects caught earlier in the pipeline — reducing production escapes and incident volumes at the source</div>
          </div>
          <div className="rounded-xl p-[2.2vh_2vw] flex flex-col gap-[1vh]" style={{ background: "#ffffff", borderLeft: "4px solid #0f62fe" }}>
            <div className="font-semibold leading-tight" style={{ fontSize: "1.6vw", color: "#161616" }}>Continuous Release Readiness</div>
            <div className="leading-snug" style={{ fontSize: "1.4vw", color: "#525252" }}>Release readiness measured continuously — production insights feed back into the test suite so coverage improves every release</div>
          </div>
          <div className="rounded-xl p-[2.2vh_2vw]" style={{ background: "#001141" }}>
            <div className="font-medium text-white leading-relaxed" style={{ fontSize: "1.4vw" }}>
              Production failures, incidents, and user journeys continuously inform the QE backlog — creating a closed-loop quality system that learns and improves
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ width: "38vw", border: "1px solid rgba(0,0,0,0.1)" }}>
          <div className="grid grid-cols-4" style={{ background: "#001141" }}>
            <div className="py-[1.5vh] px-[1.2vw] font-semibold text-white" style={{ fontSize: "1.3vw" }}>Metric</div>
            <div className="py-[1.5vh] px-[1.2vw] font-semibold text-white" style={{ fontSize: "1.3vw" }}>Now</div>
            <div className="py-[1.5vh] px-[1.2vw] font-semibold" style={{ fontSize: "1.3vw", color: "#5b9cf6" }}>6-Month</div>
            <div className="py-[1.5vh] px-[1.2vw] font-semibold" style={{ fontSize: "1.3vw", color: "#0f62fe" }}>12-Month</div>
          </div>

          <div className="grid grid-cols-4" style={{ background: "#ffffff", borderBottom: "1px solid #e8eaed" }}>
            <div className="py-[2.8vh] px-[1.2vw] font-medium" style={{ fontSize: "1.3vw", color: "#161616" }}>Automation Coverage</div>
            <div className="py-[2.8vh] px-[1.2vw]" style={{ fontSize: "1.4vw", color: "#525252" }}>~25%</div>
            <div className="py-[2.8vh] px-[1.2vw] font-semibold" style={{ fontSize: "1.4vw", color: "#5b9cf6" }}>55%</div>
            <div className="py-[2.8vh] px-[1.2vw] font-bold" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>80%+</div>
          </div>

          <div className="grid grid-cols-4" style={{ background: "#f9fafb", borderBottom: "1px solid #e8eaed" }}>
            <div className="py-[2.8vh] px-[1.2vw] font-medium" style={{ fontSize: "1.3vw", color: "#161616" }}>Defect Escape</div>
            <div className="py-[2.8vh] px-[1.2vw]" style={{ fontSize: "1.4vw", color: "#525252" }}>High</div>
            <div className="py-[2.8vh] px-[1.2vw] font-semibold" style={{ fontSize: "1.4vw", color: "#5b9cf6" }}>−40%</div>
            <div className="py-[2.8vh] px-[1.2vw] font-bold" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>−65%</div>
          </div>

          <div className="grid grid-cols-4" style={{ background: "#ffffff", borderBottom: "1px solid #e8eaed" }}>
            <div className="py-[2.8vh] px-[1.2vw] font-medium" style={{ fontSize: "1.3vw", color: "#161616" }}>Regression Cycle</div>
            <div className="py-[2.8vh] px-[1.2vw]" style={{ fontSize: "1.4vw", color: "#525252" }}>Multi-day</div>
            <div className="py-[2.8vh] px-[1.2vw] font-semibold" style={{ fontSize: "1.4vw", color: "#5b9cf6" }}>−50%</div>
            <div className="py-[2.8vh] px-[1.2vw] font-bold" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>−70%</div>
          </div>

          <div className="grid grid-cols-4" style={{ background: "#f9fafb" }}>
            <div className="py-[2.8vh] px-[1.2vw] font-medium" style={{ fontSize: "1.3vw", color: "#161616" }}>MTTD</div>
            <div className="py-[2.8vh] px-[1.2vw]" style={{ fontSize: "1.4vw", color: "#525252" }}>&gt;2 hrs</div>
            <div className="py-[2.8vh] px-[1.2vw] font-semibold" style={{ fontSize: "1.4vw", color: "#5b9cf6" }}>&lt;30 min</div>
            <div className="py-[2.8vh] px-[1.2vw] font-bold" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>&lt;15 min</div>
          </div>
        </div>
      </div>
    </div>
  );
}
