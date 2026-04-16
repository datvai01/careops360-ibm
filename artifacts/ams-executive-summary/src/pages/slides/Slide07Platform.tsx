export default function Slide07Platform() {
  return (
    <div className="w-screen h-screen overflow-hidden relative font-display px-[7vw] py-[5vh]" style={{ background: "#f2f4f8" }}>

      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "#0f62fe" }} />

      <div className="font-semibold tracking-widest uppercase mb-[0.5vh]" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>
        4.0 Platform &amp; Data Modernization
      </div>
      <div className="font-bold tracking-tight leading-none mb-[0.4vh]" style={{ fontSize: "3.2vw", color: "#161616" }}>
        Integration, Mainframe &amp; DataOps
      </div>
      <div className="mb-[2.5vh]" style={{ fontSize: "1.5vw", color: "#525252" }}>
        Modernizing how Horizon integrates, upgrades, and governs platforms at enterprise scale
      </div>

      <div className="grid grid-cols-3 gap-[2vw] mb-[2.5vh]" style={{ height: "38vh" }}>

        <div className="rounded-xl flex flex-col p-[2.2vh_2vw]" style={{ background: "#001141", borderTop: "3px solid #0f62fe" }}>
          <div className="font-black leading-none mb-[1.5vh]" style={{ fontSize: "2.5vw", color: "#0f62fe" }}>API Hub</div>
          <div className="font-bold text-white leading-tight mb-[1vh]" style={{ fontSize: "1.6vw" }}>Integration Modernization</div>
          <div className="leading-snug flex-1" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.6)" }}>
            Evolve from point-to-point and batch-heavy patterns to API-first and event-driven integration architecture
          </div>
          <div className="mt-[1.5vh] font-semibold" style={{ fontSize: "1.2vw", color: "#0f62fe" }}>Year 1 Delivery</div>
        </div>

        <div className="rounded-xl flex flex-col p-[2.2vh_2vw]" style={{ background: "#001141", borderTop: "3px solid #0043ce" }}>
          <div className="font-black leading-none mb-[1.5vh]" style={{ fontSize: "2.5vw", color: "#0f62fe" }}>API→Refactor</div>
          <div className="font-bold text-white leading-tight mb-[1vh]" style={{ fontSize: "1.6vw" }}>Mainframe Modernization</div>
          <div className="leading-snug flex-1" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.6)" }}>
            Phased approach: API-wrap → rehost → refactor with parallel-run validation and risk gates at each stage
          </div>
          <div className="mt-[1.5vh] font-semibold" style={{ fontSize: "1.2vw", color: "#0f62fe" }}>Year 1–2 Delivery</div>
        </div>

        <div className="rounded-xl flex flex-col p-[2.2vh_2vw]" style={{ background: "#001141", borderTop: "3px solid #0f62fe" }}>
          <div className="font-black leading-none mb-[1.5vh]" style={{ fontSize: "2.5vw", color: "#0f62fe" }}>DataOps</div>
          <div className="font-bold text-white leading-tight mb-[1vh]" style={{ fontSize: "1.6vw" }}>Data Intelligence</div>
          <div className="leading-snug flex-1" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.6)" }}>
            Pipeline intelligence and quality engine transforming data operations — monitoring expanded months 3–12
          </div>
          <div className="mt-[1.5vh] font-semibold" style={{ fontSize: "1.2vw", color: "#0f62fe" }}>Months 3–12</div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="grid grid-cols-3" style={{ background: "#0f62fe" }}>
          <div className="py-[1.2vh] px-[2vw] font-semibold text-white" style={{ fontSize: "1.3vw" }}>Workstream</div>
          <div className="py-[1.2vh] px-[2vw] font-semibold text-white" style={{ fontSize: "1.3vw" }}>Approach</div>
          <div className="py-[1.2vh] px-[2vw] font-semibold text-white" style={{ fontSize: "1.3vw" }}>Timeline</div>
        </div>
        <div className="grid grid-cols-3" style={{ background: "#ffffff", borderBottom: "1px solid #e8eaed" }}>
          <div className="py-[1.4vh] px-[2vw] font-medium" style={{ fontSize: "1.4vw", color: "#161616" }}>Integration Hub</div>
          <div className="py-[1.4vh] px-[2vw]" style={{ fontSize: "1.4vw", color: "#525252" }}>API-first hub; event streaming</div>
          <div className="py-[1.4vh] px-[2vw] font-semibold" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>Year 1</div>
        </div>
        <div className="grid grid-cols-3" style={{ background: "#f9fafb", borderBottom: "1px solid #e8eaed" }}>
          <div className="py-[1.4vh] px-[2vw] font-medium" style={{ fontSize: "1.4vw", color: "#161616" }}>Mainframe Workloads</div>
          <div className="py-[1.4vh] px-[2vw]" style={{ fontSize: "1.4vw", color: "#525252" }}>API-wrap → rehost → refactor</div>
          <div className="py-[1.4vh] px-[2vw] font-semibold" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>Year 1–2</div>
        </div>
        <div className="grid grid-cols-3" style={{ background: "#ffffff" }}>
          <div className="py-[1.4vh] px-[2vw] font-medium" style={{ fontSize: "1.4vw", color: "#161616" }}>Application Portfolio (~500)</div>
          <div className="py-[1.4vh] px-[2vw]" style={{ fontSize: "1.4vw", color: "#525252" }}>Assess, rationalize, modernize</div>
          <div className="py-[1.4vh] px-[2vw] font-semibold" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>Ongoing</div>
        </div>
      </div>

      <div className="mt-[2vh]" style={{ fontSize: "1.3vw", color: "#525252" }}>
        n-1 standard maintained across all stacks — monthly compliance reporting and emergency patching for critical CVEs
      </div>
    </div>
  );
}
