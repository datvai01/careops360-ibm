export default function Slide03ExecutiveSnapshot() {
  return (
    <div className="w-screen h-screen overflow-hidden relative font-display px-[7vw] py-[5vh]" style={{ background: "#001141" }}>

      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "#0f62fe" }} />

      <div className="absolute" style={{ top: "10vh", right: "-5vw", width: "50vw", height: "50vw",
        borderRadius: "50%", border: "1px solid rgba(15,98,254,0.1)", opacity: 0.6 }} />
      <div className="absolute" style={{ bottom: "-10vh", left: "20vw", width: "35vw", height: "35vw",
        borderRadius: "50%", border: "1px solid rgba(15,98,254,0.08)", opacity: 0.5 }} />

      <div className="font-semibold tracking-widest uppercase mb-[0.8vh]" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>
        1.3 Executive Snapshot
      </div>
      <div className="font-bold tracking-tight leading-none text-white mb-[0.5vh]" style={{ fontSize: "3.4vw" }}>
        Value Realization at a Glance
      </div>
      <div className="font-light mb-[4vh]" style={{ fontSize: "1.6vw", color: "rgba(255,255,255,0.5)" }}>
        Directional targets — baselined in Phase 0 and tracked through executive dashboards
      </div>

      <div className="grid grid-cols-2 gap-[2vw]" style={{ height: "60vh" }}>

        <div className="rounded-2xl flex flex-col justify-between p-[3vh_3vw]" style={{ background: "rgba(15,98,254,0.12)", border: "1px solid rgba(15,98,254,0.3)" }}>
          <div className="font-semibold tracking-wider uppercase" style={{ fontSize: "1.2vw", color: "#0f62fe" }}>Structural Cost Takeout</div>
          <div>
            <div className="font-black leading-none text-white" style={{ fontSize: "8vw" }}>40–50%</div>
            <div className="font-light" style={{ fontSize: "1.5vw", color: "rgba(255,255,255,0.55)" }}>operational cost reduction over the contract term</div>
          </div>
          <div className="font-medium" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.35)" }}>Tech arbitrage over labor arbitrage</div>
        </div>

        <div className="rounded-2xl flex flex-col justify-between p-[3vh_3vw]" style={{ background: "rgba(0,67,206,0.2)", border: "1px solid rgba(0,67,206,0.35)" }}>
          <div className="font-semibold tracking-wider uppercase" style={{ fontSize: "1.2vw", color: "#5b9cf6" }}>Speed to Value</div>
          <div>
            <div className="font-black leading-none text-white" style={{ fontSize: "8vw" }}>25–40%</div>
            <div className="font-light" style={{ fontSize: "1.5vw", color: "rgba(255,255,255,0.55)" }}>acceleration in time-to-market</div>
          </div>
          <div className="font-medium" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.35)" }}>40–60% faster integration deployment cycles</div>
        </div>

        <div className="rounded-2xl flex flex-col justify-between p-[3vh_3vw]" style={{ background: "rgba(0,17,65,0.6)", border: "1px solid rgba(15,98,254,0.2)" }}>
          <div className="font-semibold tracking-wider uppercase" style={{ fontSize: "1.2vw", color: "#5b9cf6" }}>Incident Reduction</div>
          <div>
            <div className="font-black leading-none text-white" style={{ fontSize: "8vw" }}>30%</div>
            <div className="font-light" style={{ fontSize: "1.5vw", color: "rgba(255,255,255,0.55)" }}>reduction in incident volumes</div>
          </div>
          <div className="font-medium" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.35)" }}>Predictive AIOps + self-healing runbooks</div>
        </div>

        <div className="rounded-2xl flex flex-col justify-between p-[3vh_3vw]" style={{ background: "rgba(0,17,65,0.6)", border: "1px solid rgba(15,98,254,0.2)" }}>
          <div className="font-semibold tracking-wider uppercase" style={{ fontSize: "1.2vw", color: "#5b9cf6" }}>Mean Time to Resolve</div>
          <div>
            <div className="font-black leading-none text-white" style={{ fontSize: "8vw" }}>30–50%</div>
            <div className="font-light" style={{ fontSize: "1.5vw", color: "rgba(255,255,255,0.55)" }}>MTTR reduction — target &lt;1.8 hours</div>
          </div>
          <div className="font-medium" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.35)" }}>Intelligent triage, auto-remediation</div>
        </div>
      </div>

      <div className="absolute flex items-center gap-[3vw]" style={{ bottom: "3.5vh", left: "7vw", right: "7vw" }}>
        <div className="h-[1px] flex-1" style={{ background: "rgba(15,98,254,0.25)" }} />
        <div className="font-medium" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.3)" }}>
          24×7 Global AIOps Coverage · 500+ Applications · Day-1 Efficiencies · AI-First Operating Model
        </div>
        <div className="h-[1px] flex-1" style={{ background: "rgba(15,98,254,0.25)" }} />
      </div>
    </div>
  );
}
