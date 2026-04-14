export default function Slide08PhasedRoadmap() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-navy font-display px-[6vw] py-[4.5vh]">

      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

      <div className="text-[1.5vw] font-semibold text-primary tracking-widest uppercase mb-[0.8vh]">
        Phased Transformation Roadmap
      </div>
      <div className="text-[3.2vw] font-bold tracking-tight text-white leading-none mb-[0.8vh]">
        Stabilization to Autonomous Operations
      </div>
      <div className="text-[1.7vw] text-white opacity-55 mb-[3vh]">
        Each phase compounds value across the portfolio — quick wins in the immediate term, autonomous operations at 24 months
      </div>

      <div className="grid grid-cols-4 gap-[1.5vw] mb-[2vh]">

        <div className="rounded-xl overflow-hidden border border-white/10" style={{background:"rgba(255,255,255,0.05)"}}>
          <div className="bg-primary px-[1.5vw] py-[1.5vh]">
            <div className="text-[1.4vw] font-semibold text-white uppercase tracking-widest">Phase 0</div>
            <div className="text-[1.8vw] font-bold text-white">Foundation</div>
            <div className="text-[1.4vw] text-white opacity-75">Weeks 1–8</div>
          </div>
          <div className="px-[1.5vw] py-[2vh] flex flex-col gap-[1.2vh]">
            <div className="text-[1.5vw] text-white opacity-80">Command Center blueprint and operationalization</div>
            <div className="text-[1.5vw] text-white opacity-80">ICOE architecture definition</div>
            <div className="text-[1.5vw] text-white opacity-80">Quote to Cart KPI alignment roadmap</div>
            <div className="text-[1.5vw] text-white opacity-80">AIOps baseline measurement</div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-white/10" style={{background:"rgba(255,255,255,0.05)"}}>
          <div className="bg-primary px-[1.5vw] py-[1.5vh]">
            <div className="text-[1.4vw] font-semibold text-white uppercase tracking-widest">Phase 1</div>
            <div className="text-[1.8vw] font-bold text-white">Ignite</div>
            <div className="text-[1.4vw] text-white opacity-75">Months 1–3</div>
          </div>
          <div className="px-[1.5vw] py-[2vh] flex flex-col gap-[1.2vh]">
            <div className="text-[1.5vw] text-white opacity-80">AI-assisted Dev + Intelligent QA rollout</div>
            <div className="text-[1.5vw] text-white opacity-80">Initial AIOps deployment to production</div>
            <div className="text-[1.5vw] text-white opacity-80">Test automation framework initiated</div>
            <div className="text-[1.5vw] text-white opacity-80">Innovation Council formed</div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-white/10" style={{background:"rgba(255,255,255,0.05)"}}>
          <div className="bg-primary px-[1.5vw] py-[1.5vh]">
            <div className="text-[1.4vw] font-semibold text-white uppercase tracking-widest">Phase 2</div>
            <div className="text-[1.8vw] font-bold text-white">Scale</div>
            <div className="text-[1.4vw] text-white opacity-75">Months 3–6</div>
          </div>
          <div className="px-[1.5vw] py-[2vh] flex flex-col gap-[1.2vh]">
            <div className="text-[1.5vw] text-white opacity-80">Agentic AI incident triage live</div>
            <div className="text-[1.5vw] text-white opacity-80">Mainframe modernization initiated</div>
            <div className="text-[1.5vw] text-white opacity-80">COBOL → Java pilot underway</div>
            <div className="text-[1.5vw] text-white opacity-80">Digital Front Door blueprint</div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-white/10" style={{background:"rgba(255,255,255,0.05)"}}>
          <div className="bg-primary px-[1.5vw] py-[1.5vh]">
            <div className="text-[1.4vw] font-semibold text-white uppercase tracking-widest">Phase 3</div>
            <div className="text-[1.8vw] font-bold text-white">Optimize</div>
            <div className="text-[1.4vw] text-white opacity-75">Months 6–12</div>
          </div>
          <div className="px-[1.5vw] py-[2vh] flex flex-col gap-[1.2vh]">
            <div className="text-[1.5vw] text-white opacity-80">Agentic AI — full incident autonomy</div>
            <div className="text-[1.5vw] text-white opacity-80">Claims adjudication parallel run</div>
            <div className="text-[1.5vw] text-white opacity-80">Predictive capacity management</div>
            <div className="text-[1.5vw] text-white opacity-80">Enterprise-wide observability platform</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl px-[2vw] py-[2vh] border border-primary/30" style={{background:"rgba(15,98,254,0.12)"}}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[1.7vw] font-bold text-white">Phase 4 — Transform</div>
            <div className="text-[1.5vw] text-white opacity-60">12–24 Months · Requires Horizon Investment &amp; Involvement</div>
          </div>
          <div className="flex gap-[3vw]">
            <div className="text-center">
              <div className="text-[1.5vw] text-white opacity-70">Full autonomous P3/P4 operations</div>
            </div>
            <div className="w-[1px] bg-white opacity-20" />
            <div className="text-center">
              <div className="text-[1.5vw] text-white opacity-70">Mainframe eligibility decommissioned</div>
            </div>
            <div className="w-[1px] bg-white opacity-20" />
            <div className="text-center">
              <div className="text-[1.5vw] text-white opacity-70">COBOL → Java migration complete</div>
            </div>
            <div className="w-[1px] bg-white opacity-20" />
            <div className="text-center">
              <div className="text-[1.5vw] text-white opacity-70">Member Enrollment front door live</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[2vh] flex gap-[4vw]">
        <div className="text-[1.5vw] text-white opacity-50">60 total initiatives · 25 Year 1 · 15 Active/In-Flight · 9 Milestones completed · All tracked live in CareOps360</div>
      </div>
    </div>
  );
}
