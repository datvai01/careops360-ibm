export default function Slide05CurrentState() {
  return (
    <div className="w-screen h-screen overflow-hidden relative font-display px-[7vw] py-[5vh]" style={{ background: "#f2f4f8" }}>

      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "#0f62fe" }} />

      <div className="font-semibold tracking-widest uppercase mb-[0.5vh]" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>
        2.3 Transformation Outcomes
      </div>
      <div className="font-bold tracking-tight leading-none mb-[0.4vh]" style={{ fontSize: "3.2vw", color: "#161616" }}>
        Current State vs. 12-Month Targets
      </div>
      <div className="mb-[3vh]" style={{ fontSize: "1.5vw", color: "#525252" }}>
        Baselines established in Phase 0 — targets locked after tooling onboarding and discovery
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.1)" }}>
        <div className="grid grid-cols-4" style={{ background: "#001141" }}>
          <div className="py-[1.6vh] px-[2vw] font-semibold text-white" style={{ fontSize: "1.4vw" }}>Metric</div>
          <div className="py-[1.6vh] px-[2vw] font-semibold text-white" style={{ fontSize: "1.4vw" }}>Current (est.)</div>
          <div className="py-[1.6vh] px-[2vw] font-semibold" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>12-Month Target</div>
          <div className="py-[1.6vh] px-[2vw] font-semibold text-white" style={{ fontSize: "1.4vw" }}>Direction</div>
        </div>

        <div className="grid grid-cols-4" style={{ background: "#ffffff", borderBottom: "1px solid #e8eaed" }}>
          <div className="py-[1.8vh] px-[2vw] font-medium" style={{ fontSize: "1.5vw", color: "#161616" }}>Test Automation Coverage</div>
          <div className="py-[1.8vh] px-[2vw]" style={{ fontSize: "1.5vw", color: "#525252" }}>~25%</div>
          <div className="py-[1.8vh] px-[2vw] font-semibold" style={{ fontSize: "1.5vw", color: "#0f62fe" }}>80%+</div>
          <div className="py-[1.8vh] px-[2vw] font-bold" style={{ fontSize: "1.5vw", color: "#24a148" }}>↑ 3×</div>
        </div>

        <div className="grid grid-cols-4" style={{ background: "#f9fafb", borderBottom: "1px solid #e8eaed" }}>
          <div className="py-[1.8vh] px-[2vw] font-medium" style={{ fontSize: "1.5vw", color: "#161616" }}>Mean Time to Resolve (MTTR)</div>
          <div className="py-[1.8vh] px-[2vw]" style={{ fontSize: "1.5vw", color: "#525252" }}>&gt;4 hours</div>
          <div className="py-[1.8vh] px-[2vw] font-semibold" style={{ fontSize: "1.5vw", color: "#0f62fe" }}>&lt;1.8 hours</div>
          <div className="py-[1.8vh] px-[2vw] font-bold" style={{ fontSize: "1.5vw", color: "#24a148" }}>↓ ~55%</div>
        </div>

        <div className="grid grid-cols-4" style={{ background: "#ffffff", borderBottom: "1px solid #e8eaed" }}>
          <div className="py-[1.8vh] px-[2vw] font-medium" style={{ fontSize: "1.5vw", color: "#161616" }}>Defect Escape to Production</div>
          <div className="py-[1.8vh] px-[2vw]" style={{ fontSize: "1.5vw", color: "#525252" }}>High / untracked</div>
          <div className="py-[1.8vh] px-[2vw] font-semibold" style={{ fontSize: "1.5vw", color: "#0f62fe" }}>65% reduction</div>
          <div className="py-[1.8vh] px-[2vw] font-bold" style={{ fontSize: "1.5vw", color: "#24a148" }}>↓</div>
        </div>

        <div className="grid grid-cols-4" style={{ background: "#f9fafb", borderBottom: "1px solid #e8eaed" }}>
          <div className="py-[1.8vh] px-[2vw] font-medium" style={{ fontSize: "1.5vw", color: "#161616" }}>P3/P4 Auto-Resolution</div>
          <div className="py-[1.8vh] px-[2vw]" style={{ fontSize: "1.5vw", color: "#525252" }}>&lt;10%</div>
          <div className="py-[1.8vh] px-[2vw] font-semibold" style={{ fontSize: "1.5vw", color: "#0f62fe" }}>&gt;74%</div>
          <div className="py-[1.8vh] px-[2vw] font-bold" style={{ fontSize: "1.5vw", color: "#24a148" }}>↑ ~7×</div>
        </div>

        <div className="grid grid-cols-4" style={{ background: "#ffffff", borderBottom: "1px solid #e8eaed" }}>
          <div className="py-[1.8vh] px-[2vw] font-medium" style={{ fontSize: "1.5vw", color: "#161616" }}>Alert Noise per Shift</div>
          <div className="py-[1.8vh] px-[2vw]" style={{ fontSize: "1.5vw", color: "#525252" }}>Unfiltered high</div>
          <div className="py-[1.8vh] px-[2vw] font-semibold" style={{ fontSize: "1.5vw", color: "#0f62fe" }}>&gt;60% reduced</div>
          <div className="py-[1.8vh] px-[2vw] font-bold" style={{ fontSize: "1.5vw", color: "#24a148" }}>↓</div>
        </div>

        <div className="grid grid-cols-4" style={{ background: "#f9fafb" }}>
          <div className="py-[1.8vh] px-[2vw] font-medium" style={{ fontSize: "1.5vw", color: "#161616" }}>System Availability</div>
          <div className="py-[1.8vh] px-[2vw]" style={{ fontSize: "1.5vw", color: "#525252" }}>~99.7%</div>
          <div className="py-[1.8vh] px-[2vw] font-semibold" style={{ fontSize: "1.5vw", color: "#0f62fe" }}>99.9%+</div>
          <div className="py-[1.8vh] px-[2vw] font-bold" style={{ fontSize: "1.5vw", color: "#24a148" }}>↑</div>
        </div>
      </div>

      <div className="mt-[2.5vh]" style={{ fontSize: "1.3vw", color: "#525252", fontStyle: "italic" }}>
        All targets are directional and finalized after Phase 0 baselining. Reporting is transparent — operational dashboards reviewed monthly, executive outcomes reviewed quarterly.
      </div>
    </div>
  );
}
