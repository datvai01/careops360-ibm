export default function Slide12WhyIBM() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-display px-[7vw] py-[5vh]">

      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

      <div className="text-[1.5vw] font-semibold text-primary tracking-widest uppercase mb-[1vh]">
        Why IBM as Your Transformation Partner
      </div>
      <div className="text-[3.5vw] font-bold tracking-tight text-text leading-none mb-[0.8vh]">
        Scale, Depth, and Skin in the Game
      </div>
      <div className="text-[1.7vw] text-muted mb-[3.5vh]">
        The only partner combining AI-first platform capability, Horizon institutional knowledge, and outcome-risk sharing
      </div>

      <div className="flex gap-[4vw] h-[62vh]">

        <div className="flex-1 flex flex-col gap-[2vh]">
          <div className="text-[1.5vw] font-semibold text-muted uppercase tracking-widest mb-[0.5vh]">
            What Differentiates IBM
          </div>

          <div className="bg-white rounded-xl border border-text/10 shadow-sm p-[2vh_2vw] flex items-start gap-[1.5vw]">
            <div className="w-[3.5vw] h-[3.5vw] rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <div className="text-[1.8vw] font-bold text-white">01</div>
            </div>
            <div>
              <div className="text-[1.7vw] font-semibold text-text">Skin in the Game</div>
              <div className="text-[1.5vw] text-muted leading-snug">Outcome-based engagement — IBM's full capability behind every phase, success tied to Horizon's outcomes</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-text/10 shadow-sm p-[2vh_2vw] flex items-start gap-[1.5vw]">
            <div className="w-[3.5vw] h-[3.5vw] rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <div className="text-[1.8vw] font-bold text-white">02</div>
            </div>
            <div>
              <div className="text-[1.7vw] font-semibold text-text">AI at Depth, Not at Surface</div>
              <div className="text-[1.5vw] text-muted leading-snug">Agentic AI, GenAI, and AIOps are production-proven across healthcare and financial services — not proof-of-concept</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-text/10 shadow-sm p-[2vh_2vw] flex items-start gap-[1.5vw]">
            <div className="w-[3.5vw] h-[3.5vw] rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <div className="text-[1.8vw] font-bold text-white">03</div>
            </div>
            <div>
              <div className="text-[1.7vw] font-semibold text-text">The BOB Framework</div>
              <div className="text-[1.5vw] text-muted leading-snug">BUILD ONCE, BENEFIT — reusable asset library compresses implementation time and reduces per-solution cost</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-text/10 shadow-sm p-[2vh_2vw] flex items-start gap-[1.5vw]">
            <div className="w-[3.5vw] h-[3.5vw] rounded-lg bg-navy flex items-center justify-center flex-shrink-0">
              <div className="text-[1.8vw] font-bold text-primary">04</div>
            </div>
            <div>
              <div className="text-[1.7vw] font-semibold text-text">Innovation Council</div>
              <div className="text-[1.5vw] text-muted leading-snug">Quarterly structured innovation — governed, prioritized, business-case-backed at Horizon's direction</div>
            </div>
          </div>
        </div>

        <div className="w-[28vw] flex flex-col gap-[2vh]">
          <div className="text-[1.5vw] font-semibold text-muted uppercase tracking-widest mb-[0.5vh]">
            IBM's Global Delivery Strength
          </div>

          <div className="grid grid-rows-4 gap-[1.5vh] flex-1">
            <div className="rounded-xl bg-navy p-[2vh_2vw] flex items-center gap-[2vw]">
              <div className="text-[3.5vw] font-bold text-primary leading-none flex-shrink-0">20K+</div>
              <div className="text-[1.5vw] text-white leading-snug">AI Practitioners globally</div>
            </div>
            <div className="rounded-xl bg-navy p-[2vh_2vw] flex items-center gap-[2vw]">
              <div className="text-[3.5vw] font-bold text-primary leading-none flex-shrink-0">81K+</div>
              <div className="text-[1.5vw] text-white leading-snug">Cloud and Architecture Experts</div>
            </div>
            <div className="rounded-xl bg-navy p-[2vh_2vw] flex items-center gap-[2vw]">
              <div className="text-[3.5vw] font-bold text-primary leading-none flex-shrink-0">40K+</div>
              <div className="text-[1.5vw] text-white leading-snug">AI &amp; Analytics Engagements delivered</div>
            </div>
            <div className="rounded-xl p-[2vh_2vw] flex items-center gap-[2vw] border border-primary/30" style={{background:"rgba(15,98,254,0.12)"}}>
              <div className="text-[3.5vw] font-bold text-primary leading-none flex-shrink-0">$3.4B</div>
              <div className="text-[1.5vw] text-text leading-snug">Saved via IBM's own AI-first client-0 transformation</div>
            </div>
          </div>

          <div className="rounded-xl bg-bg border border-text/10 p-[1.8vh_1.5vw]">
            <div className="text-[1.5vw] font-semibold text-text mb-[0.5vh]">Healthcare Payer Pedigree</div>
            <div className="text-[1.4vw] text-muted">BCBS operating models · CMS compliance · HIPAA data governance · Claims adjudication platform knowledge</div>
          </div>
        </div>
      </div>
    </div>
  );
}
