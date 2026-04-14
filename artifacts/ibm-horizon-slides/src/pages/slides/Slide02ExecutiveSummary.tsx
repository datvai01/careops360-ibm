export default function Slide02ExecutiveSummary() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-display px-[7vw] py-[5vh]">

      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-text opacity-10" />

      <div className="text-[1.5vw] font-semibold text-primary tracking-widest uppercase mb-[1vh]">
        Executive Summary
      </div>
      <div className="text-[3.5vw] font-bold tracking-tight text-text leading-none mb-[0.8vh]">
        Five Strategic Commitments
      </div>
      <div className="text-[1.7vw] text-muted mb-[3.5vh]">
        IBM's proposal for AI-led transformation of Horizon's Application Management Services
      </div>

      <div className="flex gap-[4vw] h-[67vh]">

        <div className="flex-1 flex flex-col gap-[2vh]">

          <div className="flex items-start gap-[1.5vw] p-[2vh_2vw] rounded-lg bg-white border-l-[4px] border-primary shadow-sm">
            <div className="text-[2.5vw] font-bold text-primary leading-none mt-[0.3vh]">01</div>
            <div>
              <div className="text-[1.7vw] font-semibold text-text leading-tight">AI-First Operating Model</div>
              <div className="text-[1.5vw] text-muted leading-snug">AI embedded across every AMS and QA lifecycle layer from Day 1</div>
            </div>
          </div>

          <div className="flex items-start gap-[1.5vw] p-[2vh_2vw] rounded-lg bg-white border-l-[4px] border-primary shadow-sm">
            <div className="text-[2.5vw] font-bold text-primary leading-none mt-[0.3vh]">02</div>
            <div>
              <div className="text-[1.7vw] font-semibold text-text leading-tight">Tech Arbitrage over Labor Arbitrage</div>
              <div className="text-[1.5vw] text-muted leading-snug">Cost compression through automation, not headcount</div>
            </div>
          </div>

          <div className="flex items-start gap-[1.5vw] p-[2vh_2vw] rounded-lg bg-white border-l-[4px] border-primary shadow-sm">
            <div className="text-[2.5vw] font-bold text-primary leading-none mt-[0.3vh]">03</div>
            <div>
              <div className="text-[1.7vw] font-semibold text-text leading-tight">Outcome-Based Delivery</div>
              <div className="text-[1.5vw] text-muted leading-snug">Committed SLAs tied to measurable business outcomes</div>
            </div>
          </div>

          <div className="flex items-start gap-[1.5vw] p-[2vh_2vw] rounded-lg bg-white border-l-[4px] border-primary shadow-sm">
            <div className="text-[2.5vw] font-bold text-primary leading-none mt-[0.3vh]">04</div>
            <div>
              <div className="text-[1.7vw] font-semibold text-text leading-tight">Zero-Disruption Delivery</div>
              <div className="text-[1.5vw] text-muted leading-snug">Risk-free phased transition protecting operational continuity</div>
            </div>
          </div>

          <div className="flex items-start gap-[1.5vw] p-[2vh_2vw] rounded-lg bg-white border-l-[4px] border-primary shadow-sm">
            <div className="text-[2.5vw] font-bold text-primary leading-none mt-[0.3vh]">05</div>
            <div>
              <div className="text-[1.7vw] font-semibold text-text leading-tight">Continuous Innovation Engine</div>
              <div className="text-[1.5vw] text-muted leading-snug">Horizon Transformation Office driving sustained value beyond steady state</div>
            </div>
          </div>
        </div>

        <div className="w-[28vw] flex flex-col justify-between">
          <div className="text-[1.5vw] font-semibold text-muted uppercase tracking-widest mb-[2vh]">
            IBM's Scale Behind This Proposal
          </div>

          <div className="flex-1 grid grid-rows-4 gap-[1.5vh]">
            <div className="rounded-lg bg-navy p-[2vh_2vw] flex flex-col justify-center">
              <div className="text-[4vw] font-bold text-primary leading-none">20K+</div>
              <div className="text-[1.5vw] text-white opacity-80 mt-[0.5vh]">AI &amp; Data Practitioners</div>
            </div>
            <div className="rounded-lg bg-navy p-[2vh_2vw] flex flex-col justify-center">
              <div className="text-[4vw] font-bold text-primary leading-none">81K+</div>
              <div className="text-[1.5vw] text-white opacity-80 mt-[0.5vh]">Cloud &amp; Architecture Experts</div>
            </div>
            <div className="rounded-lg bg-navy p-[2vh_2vw] flex flex-col justify-center">
              <div className="text-[4vw] font-bold text-primary leading-none">40K+</div>
              <div className="text-[1.5vw] text-white opacity-80 mt-[0.5vh]">AI &amp; Analytics Engagements</div>
            </div>
            <div className="rounded-lg bg-navy p-[2vh_2vw] flex flex-col justify-center">
              <div className="text-[4vw] font-bold text-primary leading-none">15K+</div>
              <div className="text-[1.5vw] text-white opacity-80 mt-[0.5vh]">People across 40 Global Delivery Centres</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
