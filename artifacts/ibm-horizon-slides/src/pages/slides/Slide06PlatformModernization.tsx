export default function Slide06PlatformModernization() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-display px-[7vw] py-[5vh]">

      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

      <div className="text-[1.5vw] font-semibold text-primary tracking-widest uppercase mb-[1vh]">
        Platform Modernization
      </div>
      <div className="text-[3.5vw] font-bold tracking-tight text-text leading-none mb-[0.8vh]">
        Integration · Mainframe · Tech Debt Governance
      </div>
      <div className="text-[1.7vw] text-muted mb-[3.5vh]">
        Three interlocking modernization programs — delivered without disruption to Horizon's live operations
      </div>

      <div className="grid grid-cols-3 gap-[2.5vw] h-[64vh]">

        <div className="bg-white rounded-xl border border-text/10 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-navy px-[2vw] py-[2vh]">
            <div className="text-[1.5vw] font-semibold text-primary uppercase tracking-widest mb-[0.5vh]">Integration Modernization</div>
            <div className="text-[1.8vw] font-bold text-white leading-tight">Batch to Real-Time</div>
          </div>
          <div className="px-[2vw] py-[2.5vh] flex flex-col gap-[1.5vh] flex-1">
            <div className="flex items-start gap-[0.8vw]">
              <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-primary mt-[1vh] flex-shrink-0" />
              <div className="text-[1.6vw] text-text leading-snug">MOM API-First Hub — event-driven partner exchange replacing point-to-point</div>
            </div>
            <div className="flex items-start gap-[0.8vw]">
              <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-primary mt-[1vh] flex-shrink-0" />
              <div className="text-[1.6vw] text-text leading-snug">Apache Kafka streaming on AWS MSK — sub-second data freshness</div>
            </div>
            <div className="flex items-start gap-[0.8vw]">
              <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-primary mt-[1vh] flex-shrink-0" />
              <div className="text-[1.6vw] text-text leading-snug">API Gateway consolidation — replacing 70+ point-to-point integrations</div>
            </div>
            <div className="flex items-start gap-[0.8vw]">
              <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-primary mt-[1vh] flex-shrink-0" />
              <div className="text-[1.6vw] text-text leading-snug">ODM Cloud-Native — real-time business rule evaluation</div>
            </div>
            <div className="mt-auto pt-[2vh] border-t border-text/8">
              <div className="text-[2.5vw] font-bold text-primary">50%</div>
              <div className="text-[1.5vw] text-muted">Integration cost reduction target</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-text/10 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-navy px-[2vw] py-[2vh]">
            <div className="text-[1.5vw] font-semibold text-primary uppercase tracking-widest mb-[0.5vh]">Mainframe Modernization</div>
            <div className="text-[1.8vw] font-bold text-white leading-tight">Parallel-Run Migration</div>
          </div>
          <div className="px-[2vw] py-[2.5vh] flex flex-col gap-[1.5vh] flex-1">
            <div className="flex justify-between items-center py-[0.8vh] border-b border-text/8">
              <div className="text-[1.5vw] text-text">Eligibility Processing</div>
              <div className="text-[1.4vw] font-medium text-primary">Q2–Q4 2026</div>
            </div>
            <div className="flex justify-between items-center py-[0.8vh] border-b border-text/8">
              <div className="text-[1.5vw] text-text">COBOL → Java Pilot</div>
              <div className="text-[1.4vw] font-medium text-primary">Q3 2026</div>
            </div>
            <div className="flex justify-between items-center py-[0.8vh] border-b border-text/8">
              <div className="text-[1.5vw] text-text">Unified Payments</div>
              <div className="text-[1.4vw] font-medium text-primary">Q3 2026</div>
            </div>
            <div className="flex justify-between items-center py-[0.8vh] border-b border-text/8">
              <div className="text-[1.5vw] text-text">Claims Engine</div>
              <div className="text-[1.4vw] font-medium text-primary">Q1–Q2 2027</div>
            </div>
            <div className="flex justify-between items-center py-[0.8vh]">
              <div className="text-[1.5vw] text-text">Member Data Services</div>
              <div className="text-[1.4vw] font-medium text-primary">Q4 2026+</div>
            </div>
            <div className="mt-auto pt-[2vh] border-t border-text/8">
              <div className="text-[2.5vw] font-bold text-primary">40–60%</div>
              <div className="text-[1.5vw] text-muted">Code conversion time reduction via AI-assisted COBOL → Java</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-text/10 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-navy px-[2vw] py-[2vh]">
            <div className="text-[1.5vw] font-semibold text-primary uppercase tracking-widest mb-[0.5vh]">Tech Debt Governance</div>
            <div className="text-[1.8vw] font-bold text-white leading-tight">n-1/n-2 Version Standard</div>
          </div>
          <div className="px-[2vw] py-[2.5vh] flex flex-col gap-[1.5vh] flex-1">
            <div className="flex items-start gap-[0.8vw]">
              <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-primary mt-[1vh] flex-shrink-0" />
              <div className="text-[1.6vw] text-text leading-snug">All Horizon stacks maintained at n-1 (one version behind latest LTS)</div>
            </div>
            <div className="flex items-start gap-[0.8vw]">
              <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-primary mt-[1vh] flex-shrink-0" />
              <div className="text-[1.6vw] text-text leading-snug">Quarterly version review — IBM + Horizon ARB jointly</div>
            </div>
            <div className="flex items-start gap-[0.8vw]">
              <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-primary mt-[1vh] flex-shrink-0" />
              <div className="text-[1.6vw] text-text leading-snug">Priority-1 CVEs patched within 72 hours regardless of cadence</div>
            </div>
            <div className="flex items-start gap-[0.8vw]">
              <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-primary mt-[1vh] flex-shrink-0" />
              <div className="text-[1.6vw] text-text leading-snug">25 platform upgrades in flight — Angular 17, .NET 8, ODM 9.2, SAP BO 4.3</div>
            </div>
            <div className="mt-auto pt-[2vh] border-t border-text/8">
              <div className="text-[2.5vw] font-bold text-primary">~500</div>
              <div className="text-[1.5vw] text-muted">Applications assessed via IBM Texture + ICCA accelerators</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
