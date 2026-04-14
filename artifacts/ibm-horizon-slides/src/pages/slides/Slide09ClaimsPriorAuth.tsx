export default function Slide09ClaimsPriorAuth() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-display px-[7vw] py-[5vh]">

      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

      <div className="text-[1.5vw] font-semibold text-primary tracking-widest uppercase mb-[1vh]">
        Claims &amp; Prior Authorization
      </div>
      <div className="text-[3.5vw] font-bold tracking-tight text-text leading-none mb-[0.8vh]">
        AI-Augmented Adjudication at Scale
      </div>
      <div className="text-[1.7vw] text-muted mb-[3.5vh]">
        Accelerating adjudication, reducing denials, and eliminating manual backlog management at enterprise scale
      </div>

      <div className="flex gap-[3vw] h-[63vh]">

        <div className="flex-1 bg-white rounded-xl border border-text/10 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-navy px-[2vw] py-[2vh]">
            <div className="text-[1.5vw] font-semibold text-primary uppercase tracking-widest mb-[0.3vh]">Claims Operations</div>
            <div className="text-[2vw] font-bold text-white">AI-Enhanced Adjudication Intelligence</div>
          </div>
          <div className="px-[2vw] py-[2.5vh] flex flex-col gap-[2vh] flex-1">

            <div className="grid grid-cols-2 gap-[1.5vw]">
              <div className="rounded-lg bg-bg p-[1.8vh_1.5vw] border border-text/8">
                <div className="text-[1.5vw] text-muted mb-[0.5vh]">Claims Daily Volume</div>
                <div className="text-[3vw] font-bold text-text leading-none">142K</div>
                <div className="text-[1.5vw] text-muted">YoY trend tracked</div>
              </div>
              <div className="rounded-lg bg-bg p-[1.8vh_1.5vw] border border-text/8">
                <div className="text-[1.5vw] text-muted mb-[0.5vh]">Auto-Adjudication Rate</div>
                <div className="text-[3vw] font-bold text-primary leading-none">68%</div>
                <div className="text-[1.5vw] text-emerald-600">Target: improvement over baseline</div>
              </div>
            </div>

            <div>
              <div className="text-[1.6vw] font-semibold text-text mb-[1.5vh]">What IBM Will Deliver</div>
              <div className="flex flex-col gap-[1vh]">
                <div className="flex items-start gap-[0.8vw]">
                  <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-primary mt-[0.9vh] flex-shrink-0" />
                  <div className="text-[1.6vw] text-text">AI-enhanced auto-adjudication rules engine — reducing manual rates</div>
                </div>
                <div className="flex items-start gap-[0.8vw]">
                  <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-primary mt-[0.9vh] flex-shrink-0" />
                  <div className="text-[1.6vw] text-text">Denial pattern analytics — root cause across procedure, eligibility, COB</div>
                </div>
                <div className="flex items-start gap-[0.8vw]">
                  <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-primary mt-[0.9vh] flex-shrink-0" />
                  <div className="text-[1.6vw] text-text">Real-time dashboard — volume by line of business, TAT trending</div>
                </div>
                <div className="flex items-start gap-[0.8vw]">
                  <div className="w-[0.5vw] h-[0.5vw] rounded-full bg-primary mt-[0.9vh] flex-shrink-0" />
                  <div className="text-[1.6vw] text-text">SLA-bound TAT reduction — target agreed at contract</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-text/10 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-navy px-[2vw] py-[2vh]">
            <div className="text-[1.5vw] font-semibold text-primary uppercase tracking-widest mb-[0.3vh]">Prior Authorization</div>
            <div className="text-[2vw] font-bold text-white">AI-Assisted Review &amp; Triage</div>
          </div>
          <div className="px-[2vw] py-[2.5vh] flex flex-col gap-[2vh] flex-1">

            <div className="grid grid-cols-2 gap-[1.5vw]">
              <div className="rounded-lg bg-bg p-[1.8vh_1.5vw] border border-text/8">
                <div className="text-[1.5vw] text-muted mb-[0.5vh]">Urgent Request SLA</div>
                <div className="text-[2.5vw] font-bold text-text leading-none">100%</div>
                <div className="text-[1.5vw] text-muted">within 72-hr regulatory SLA</div>
              </div>
              <div className="rounded-lg bg-bg p-[1.8vh_1.5vw] border border-text/8">
                <div className="text-[1.5vw] text-muted mb-[0.5vh]">Auto-Approval Rate Target</div>
                <div className="text-[2.5vw] font-bold text-primary leading-none">&gt;40%</div>
                <div className="text-[1.5vw] text-muted">by Month 12 (low-risk cases)</div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-text/8">
              <div className="bg-bg px-[1.5vw] py-[1.2vh] grid grid-cols-2">
                <div className="text-[1.5vw] font-semibold text-text">Metric</div>
                <div className="text-[1.5vw] font-semibold text-text">Target Direction</div>
              </div>
              <div className="grid grid-cols-2 bg-white px-[1.5vw] py-[1.2vh] border-b border-text/8">
                <div className="text-[1.5vw] text-text">Requests Received Daily</div>
                <div className="text-[1.5vw] text-primary font-medium">Trend monitored weekly</div>
              </div>
              <div className="grid grid-cols-2 bg-bg/60 px-[1.5vw] py-[1.2vh] border-b border-text/8">
                <div className="text-[1.5vw] text-text">Average Review Time</div>
                <div className="text-[1.5vw] text-primary font-medium">30%+ reduction target</div>
              </div>
              <div className="grid grid-cols-2 bg-white px-[1.5vw] py-[1.2vh]">
                <div className="text-[1.5vw] text-text">Backlog Size</div>
                <div className="text-[1.5vw] text-primary font-medium">Reduction tracked monthly</div>
              </div>
            </div>

            <div className="mt-auto rounded-xl bg-primary/8 border border-primary/20 p-[1.5vh_1.5vw]">
              <div className="text-[1.6vw] font-semibold text-text mb-[0.5vh]">Prior Auth AI Engine (HLGN-1059)</div>
              <div className="text-[1.5vw] text-muted">85% auto-approval rate target · Auth cycle: 3 days → 4 hours · $4.2M annual cost avoidance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
