export default function Slide04SixTenets() {
  return (
    <div className="w-screen h-screen overflow-hidden relative font-display px-[7vw] py-[5vh]" style={{ background: "#f2f4f8" }}>

      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "#0f62fe" }} />

      <div className="font-semibold tracking-widest uppercase mb-[0.5vh]" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>
        2.1 Transformation Overview
      </div>
      <div className="font-bold tracking-tight leading-none mb-[0.4vh]" style={{ fontSize: "3.2vw", color: "#161616" }}>
        Six Core Tenets
      </div>
      <div className="mb-[2.5vh]" style={{ fontSize: "1.5vw", color: "#525252" }}>
        The operating principles that govern every delivery decision
      </div>

      <div className="grid grid-cols-3 gap-[1.8vw]" style={{ height: "69vh" }}>

        <div className="rounded-xl p-[2.2vh_2vw] flex flex-col" style={{ background: "#ffffff", borderTop: "3px solid #0f62fe" }}>
          <div className="font-black leading-none mb-[1.5vh]" style={{ fontSize: "3.5vw", color: "#0f62fe" }}>01</div>
          <div className="font-bold leading-tight mb-[1vh]" style={{ fontSize: "1.7vw", color: "#161616" }}>AI-First Operating Model</div>
          <div className="leading-snug flex-1" style={{ fontSize: "1.4vw", color: "#525252" }}>Embed AI in triage, diagnosis, resolution, test generation, and analytics to shift from reactive to predictive operations from Day 1</div>
        </div>

        <div className="rounded-xl p-[2.2vh_2vw] flex flex-col" style={{ background: "#ffffff", borderTop: "3px solid #0043ce" }}>
          <div className="font-black leading-none mb-[1.5vh]" style={{ fontSize: "3.5vw", color: "#0043ce" }}>02</div>
          <div className="font-bold leading-tight mb-[1vh]" style={{ fontSize: "1.7vw", color: "#161616" }}>Integrated Delivery</div>
          <div className="leading-snug flex-1" style={{ fontSize: "1.4vw", color: "#525252" }}>Unified build + run pods across AMS, QE, and Data to reduce handoffs and accelerate change safely with end-to-end ownership</div>
        </div>

        <div className="rounded-xl p-[2.2vh_2vw] flex flex-col" style={{ background: "#ffffff", borderTop: "3px solid #0f62fe" }}>
          <div className="font-black leading-none mb-[1.5vh]" style={{ fontSize: "3.5vw", color: "#0f62fe" }}>03</div>
          <div className="font-bold leading-tight mb-[1vh]" style={{ fontSize: "1.7vw", color: "#161616" }}>Automation &amp; Self-Healing</div>
          <div className="leading-snug flex-1" style={{ fontSize: "1.4vw", color: "#525252" }}>Noise reduction, auto-triage, auto-remediation, and runbook automation to eliminate recurring demand and free engineer capacity</div>
        </div>

        <div className="rounded-xl p-[2.2vh_2vw] flex flex-col" style={{ background: "#001141" }}>
          <div className="font-black leading-none mb-[1.5vh]" style={{ fontSize: "3.5vw", color: "#0f62fe" }}>04</div>
          <div className="font-bold leading-tight text-white mb-[1vh]" style={{ fontSize: "1.7vw" }}>Outcome-Driven Transformation</div>
          <div className="leading-snug flex-1" style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.6)" }}>Apply ticket economics to remove demand and track business impact rather than activity metrics — transparency is a commitment</div>
        </div>

        <div className="rounded-xl p-[2.2vh_2vw] flex flex-col" style={{ background: "#001141" }}>
          <div className="font-black leading-none mb-[1.5vh]" style={{ fontSize: "3.5vw", color: "#0f62fe" }}>05</div>
          <div className="font-bold leading-tight text-white mb-[1vh]" style={{ fontSize: "1.7vw" }}>Continuous Innovation Engine</div>
          <div className="leading-snug flex-1" style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.6)" }}>Modernization sprints and a governed value pipeline to deliver incremental improvements continuously within steady state</div>
        </div>

        <div className="rounded-xl p-[2.2vh_2vw] flex flex-col" style={{ background: "#001141" }}>
          <div className="font-black leading-none mb-[1.5vh]" style={{ fontSize: "3.5vw", color: "#0f62fe" }}>06</div>
          <div className="font-bold leading-tight text-white mb-[1vh]" style={{ fontSize: "1.7vw" }}>Zero-Disruption Transition</div>
          <div className="leading-snug flex-1" style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.6)" }}>Risk-controlled onboarding and phased rollout leveraging existing Horizon knowledge to maintain continuity and stability</div>
        </div>
      </div>
    </div>
  );
}
