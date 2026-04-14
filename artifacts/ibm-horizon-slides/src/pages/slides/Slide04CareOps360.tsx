const base = import.meta.env.BASE_URL;

export default function Slide04CareOps360() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-navy font-display px-[6vw] py-[4vh]">

      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

      <div className="flex items-start justify-between mb-[2.5vh]">
        <div>
          <div className="text-[1.5vw] font-semibold text-primary tracking-widest uppercase mb-[0.8vh]">
            CareOps360 Command Center
          </div>
          <div className="text-[3.2vw] font-bold tracking-tight text-white leading-none mb-[0.8vh]">
            Real-Time Executive Intelligence
          </div>
          <div className="text-[1.6vw] text-white opacity-60">
            Production-grade platform — deployed, live, architecture-ready for Horizon data
          </div>
        </div>
        <div className="text-right">
          <div className="text-[1.5vw] text-white opacity-50 mb-[0.5vh]">Demo Access</div>
          <div className="text-[1.5vw] text-primary font-medium">exec@horizon.com</div>
          <div className="text-[1.5vw] text-white opacity-60">Horizon&amp;IBM2026</div>
        </div>
      </div>

      <div className="flex gap-[2vw] h-[72vh]">

        <div className="flex-1 rounded-xl overflow-hidden border border-white/10" style={{background:"rgba(255,255,255,0.04)"}}>
          <div className="flex items-center gap-[1vw] px-[1.5vw] py-[1.2vh] border-b border-white/10" style={{background:"rgba(15,98,254,0.15)"}}>
            <div className="flex gap-[0.5vw]">
              <div className="w-[1vw] h-[1vw] rounded-full bg-red-500 opacity-70" />
              <div className="w-[1vw] h-[1vw] rounded-full bg-yellow-500 opacity-70" />
              <div className="w-[1vw] h-[1vw] rounded-full bg-emerald-500 opacity-70" />
            </div>
            <div className="text-[1.5vw] text-white opacity-60">careops360-ibm.com — Executive Dashboard</div>
          </div>

          <div className="p-[1.5vw]">
            <div className="grid grid-cols-4 gap-[1vw] mb-[1.5vh]">

              <div className="rounded-lg p-[1.2vh_1vw] border border-white/10" style={{background:"rgba(255,255,255,0.06)"}}>
                <div className="text-[1.2vw] text-white opacity-50 mb-[0.3vh]">Active Members</div>
                <div className="text-[2.5vw] font-bold text-white leading-none">3.7M</div>
                <div className="text-[1.2vw] text-emerald-400 mt-[0.3vh]">+2.1% YTD</div>
              </div>

              <div className="rounded-lg p-[1.2vh_1vw] border border-white/10" style={{background:"rgba(255,255,255,0.06)"}}>
                <div className="text-[1.2vw] text-white opacity-50 mb-[0.3vh]">Claims Settled</div>
                <div className="text-[2.5vw] font-bold text-white leading-none">142K</div>
                <div className="text-[1.2vw] text-emerald-400 mt-[0.3vh]">Today</div>
              </div>

              <div className="rounded-lg p-[1.2vh_1vw] border border-white/10" style={{background:"rgba(255,255,255,0.06)"}}>
                <div className="text-[1.2vw] text-white opacity-50 mb-[0.3vh]">SLA Attainment</div>
                <div className="text-[2.5vw] font-bold text-white leading-none">99.4%</div>
                <div className="text-[1.2vw] text-emerald-400 mt-[0.3vh]">Target: 99%</div>
              </div>

              <div className="rounded-lg p-[1.2vh_1vw] border border-primary/30" style={{background:"rgba(15,98,254,0.15)"}}>
                <div className="text-[1.2vw] text-white opacity-50 mb-[0.3vh]">Automation Savings</div>
                <div className="text-[2.5vw] font-bold text-primary leading-none">$4.2M</div>
                <div className="text-[1.2vw] text-emerald-400 mt-[0.3vh]">YTD Cost Avoidance</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-[1vw]">
              <div className="rounded-lg p-[1.5vh_1vw] border border-white/10" style={{background:"rgba(255,255,255,0.04)"}}>
                <div className="text-[1.3vw] font-semibold text-white mb-[1vh]">App Health — 500+ Apps</div>
                <div className="flex gap-[0.8vw] mb-[0.5vh]">
                  <div className="flex-1 rounded" style={{background:"rgba(16,185,129,0.3)"}}>
                    <div className="h-[3vh] rounded bg-emerald-500" style={{width:"94%"}} />
                  </div>
                </div>
                <div className="text-[1.2vw] text-white opacity-50">94% Available · 6 Incidents Open</div>
              </div>

              <div className="rounded-lg p-[1.5vh_1vw] border border-white/10" style={{background:"rgba(255,255,255,0.04)"}}>
                <div className="text-[1.3vw] font-semibold text-white mb-[1vh]">Prior Auth Backlog</div>
                <div className="text-[2vw] font-bold text-white">847</div>
                <div className="text-[1.2vw] text-amber-400">Avg Review: 18.2 hrs</div>
                <div className="text-[1.2vw] text-white opacity-40 mt-[0.3vh]">Target: &lt; 24 hrs SLA</div>
              </div>

              <div className="rounded-lg p-[1.5vh_1vw] border border-white/10" style={{background:"rgba(255,255,255,0.04)"}}>
                <div className="text-[1.3vw] font-semibold text-white mb-[1vh]">Enrollment Pipeline</div>
                <div className="text-[2vw] font-bold text-white">98.3%</div>
                <div className="text-[1.2vw] text-emerald-400">Auto-match Rate</div>
                <div className="text-[1.2vw] text-white opacity-40 mt-[0.3vh]">2,840 records processed today</div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[22vw] flex flex-col gap-[1.5vh]">
          <div className="text-[1.5vw] font-semibold text-white opacity-60 uppercase tracking-widest mb-[0.5vh]">
            14 Dashboard Modules
          </div>

          <div className="flex-1 flex flex-col gap-[1vh]">
            <div className="rounded-lg px-[1.2vw] py-[1vh] text-[1.5vw] text-white border-l-[3px] border-primary" style={{background:"rgba(255,255,255,0.06)"}}>Executive Overview</div>
            <div className="rounded-lg px-[1.2vw] py-[1vh] text-[1.5vw] text-white border-l-[3px] border-primary" style={{background:"rgba(255,255,255,0.06)"}}>Application Health</div>
            <div className="rounded-lg px-[1.2vw] py-[1vh] text-[1.5vw] text-white border-l-[3px] border-primary" style={{background:"rgba(255,255,255,0.06)"}}>Claims Operations</div>
            <div className="rounded-lg px-[1.2vw] py-[1vh] text-[1.5vw] text-white border-l-[3px] border-primary" style={{background:"rgba(255,255,255,0.06)"}}>Prior Authorization</div>
            <div className="rounded-lg px-[1.2vw] py-[1vh] text-[1.5vw] text-white border-l-[3px] border-primary" style={{background:"rgba(255,255,255,0.06)"}}>Enrollment Intelligence</div>
            <div className="rounded-lg px-[1.2vw] py-[1vh] text-[1.5vw] text-white border-l-[3px] border-white/20" style={{background:"rgba(255,255,255,0.03)"}}>Member Services</div>
            <div className="rounded-lg px-[1.2vw] py-[1vh] text-[1.5vw] text-white border-l-[3px] border-white/20" style={{background:"rgba(255,255,255,0.03)"}}>IBM AIOps Value</div>
            <div className="rounded-lg px-[1.2vw] py-[1vh] text-[1.5vw] text-white border-l-[3px] border-white/20" style={{background:"rgba(255,255,255,0.03)"}}>Transformation Roadmap</div>
            <div className="rounded-lg px-[1.2vw] py-[1vh] text-[1.5vw] text-white border-l-[3px] border-white/20" style={{background:"rgba(255,255,255,0.03)"}}>Capability Uplift + 5 more</div>
          </div>

          <div className="rounded-lg p-[1.5vh_1.2vw] border border-primary/30" style={{background:"rgba(15,98,254,0.12)"}}>
            <div className="text-[1.5vw] font-semibold text-primary mb-[0.5vh]">Role-Based Access</div>
            <div className="text-[1.4vw] text-white opacity-70">IBM · Horizon Executive · HIPAA-compliant · No PHI data</div>
          </div>
        </div>
      </div>
    </div>
  );
}
