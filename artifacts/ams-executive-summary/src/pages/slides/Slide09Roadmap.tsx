export default function Slide09Roadmap() {
  return (
    <div className="w-screen h-screen overflow-hidden relative font-display px-[7vw] py-[5vh]" style={{ background: "#001141" }}>

      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "#0f62fe" }} />

      <div className="absolute" style={{ top: "-5vh", right: "-5vw", width: "40vw", height: "40vw",
        borderRadius: "50%", border: "1px solid rgba(15,98,254,0.1)", opacity: 0.5 }} />

      <div className="font-semibold tracking-widest uppercase mb-[0.5vh]" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>
        6.0 Phased Roadmap &amp; Governance
      </div>
      <div className="font-bold tracking-tight leading-none text-white mb-[0.4vh]" style={{ fontSize: "3.2vw" }}>
        Stabilization to Autonomous Operations
      </div>
      <div className="font-light mb-[3vh]" style={{ fontSize: "1.5vw", color: "rgba(255,255,255,0.5)" }}>
        Risk-controlled delivery — compounding value across operations, engineering, and data
      </div>

      <div className="flex gap-[1.5vw] mb-[3vh]" style={{ height: "45vh" }}>

        <div className="flex-1 rounded-xl p-[2vh_1.8vw] flex flex-col" style={{ background: "rgba(15,98,254,0.15)", border: "1px solid rgba(15,98,254,0.3)" }}>
          <div className="font-black leading-none mb-[0.8vh]" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>Phase 0</div>
          <div className="font-bold text-white mb-[0.5vh]" style={{ fontSize: "1.5vw" }}>Foundation</div>
          <div className="font-light mb-[1vh]" style={{ fontSize: "1.2vw", color: "rgba(255,255,255,0.4)" }}>0–8 weeks</div>
          <div className="leading-snug flex-1" style={{ fontSize: "1.2vw", color: "rgba(255,255,255,0.65)" }}>
            Baselines and discovery; transition plan; initial telemetry onboarding and AI enablement
          </div>
        </div>

        <div className="flex-1 rounded-xl p-[2vh_1.8vw] flex flex-col" style={{ background: "rgba(15,98,254,0.1)", border: "1px solid rgba(15,98,254,0.2)" }}>
          <div className="font-black leading-none mb-[0.8vh]" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>Phase 1</div>
          <div className="font-bold text-white mb-[0.5vh]" style={{ fontSize: "1.5vw" }}>Ignite</div>
          <div className="font-light mb-[1vh]" style={{ fontSize: "1.2vw", color: "rgba(255,255,255,0.4)" }}>1–3 months</div>
          <div className="leading-snug flex-1" style={{ fontSize: "1.2vw", color: "rgba(255,255,255,0.65)" }}>
            Initial AIOps deployment; QE automation framework; innovation council; quick-win automations
          </div>
        </div>

        <div className="flex-1 rounded-xl p-[2vh_1.8vw] flex flex-col" style={{ background: "rgba(15,98,254,0.1)", border: "1px solid rgba(15,98,254,0.2)" }}>
          <div className="font-black leading-none mb-[0.8vh]" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>Phase 2</div>
          <div className="font-bold text-white mb-[0.5vh]" style={{ fontSize: "1.5vw" }}>Scale</div>
          <div className="font-light mb-[1vh]" style={{ fontSize: "1.2vw", color: "rgba(255,255,255,0.4)" }}>3–6 months</div>
          <div className="leading-snug flex-1" style={{ fontSize: "1.2vw", color: "rgba(255,255,255,0.65)" }}>
            Expand self-heal; agentic triage live; integration modernization pilots; DataOps monitoring expanded
          </div>
        </div>

        <div className="flex-1 rounded-xl p-[2vh_1.8vw] flex flex-col" style={{ background: "rgba(15,98,254,0.1)", border: "1px solid rgba(15,98,254,0.2)" }}>
          <div className="font-black leading-none mb-[0.8vh]" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>Phase 3</div>
          <div className="font-bold text-white mb-[0.5vh]" style={{ fontSize: "1.5vw" }}>Optimize</div>
          <div className="font-light mb-[1vh]" style={{ fontSize: "1.2vw", color: "rgba(255,255,255,0.4)" }}>6–12 months</div>
          <div className="leading-snug flex-1" style={{ fontSize: "1.2vw", color: "rgba(255,255,255,0.65)" }}>
            Autonomous ops for common incidents; advanced QE gates; continuous modernization sprints; outcome reporting
          </div>
        </div>

        <div className="flex-1 rounded-xl p-[2vh_1.8vw] flex flex-col" style={{ background: "rgba(15,98,254,0.06)", border: "1px solid rgba(15,98,254,0.15)" }}>
          <div className="font-black leading-none mb-[0.8vh]" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>Phase 4</div>
          <div className="font-bold text-white mb-[0.5vh]" style={{ fontSize: "1.5vw" }}>Transform</div>
          <div className="font-light mb-[1vh]" style={{ fontSize: "1.2vw", color: "rgba(255,255,255,0.4)" }}>12–24 months</div>
          <div className="leading-snug flex-1" style={{ fontSize: "1.2vw", color: "rgba(255,255,255,0.65)" }}>
            Broader autonomy; platform modernization milestones; enterprise observability; co-invest opportunities
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-[2.5vh_3vw]" style={{ background: "rgba(15,98,254,0.1)", border: "1px solid rgba(15,98,254,0.2)" }}>
        <div className="font-semibold text-white mb-[1.5vh]" style={{ fontSize: "1.5vw" }}>Value Realization &amp; KPI Framework</div>
        <div className="flex gap-[4vw]">
          <div>
            <div className="font-medium" style={{ fontSize: "1.3vw", color: "#0f62fe" }}>Operational Excellence</div>
            <div style={{ fontSize: "1.2vw", color: "rgba(255,255,255,0.55)" }}>MTTR · Incident volume · Availability</div>
          </div>
          <div>
            <div className="font-medium" style={{ fontSize: "1.3vw", color: "#0f62fe" }}>Automation &amp; Self-Heal</div>
            <div style={{ fontSize: "1.2vw", color: "rgba(255,255,255,0.55)" }}>Auto-resolution % · Noise reduction</div>
          </div>
          <div>
            <div className="font-medium" style={{ fontSize: "1.3vw", color: "#0f62fe" }}>Quality Engineering</div>
            <div style={{ fontSize: "1.2vw", color: "rgba(255,255,255,0.55)" }}>Automation coverage · Defect leakage</div>
          </div>
          <div>
            <div className="font-medium" style={{ fontSize: "1.3vw", color: "#0f62fe" }}>Business Outcomes</div>
            <div style={{ fontSize: "1.2vw", color: "rgba(255,255,255,0.55)" }}>Claims cycle · Enrollment throughput · ASA/FCR</div>
          </div>
        </div>
      </div>
    </div>
  );
}
