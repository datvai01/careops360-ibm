export default function Asks() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-body text-text">
      <div className="h-full flex flex-col px-[6vw] pt-[4vh] pb-[2.5vh]">
        {/* Header */}
        <header>
          <div className="flex items-center gap-[1vw]">
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.18em] text-primary">
              Horizon × IBM
            </span>
            <span className="w-[2.5vw] h-px bg-line" />
            <span className="text-[1.5vw] font-medium uppercase tracking-[0.18em] text-muted">
              Asks from Horizon
            </span>
          </div>
          <h1 className="mt-[1.4vh] text-[2.7vw] font-bold font-display leading-[1.1] tracking-tight max-w-[82vw]">
            Six commitments from Horizon keep the six-month roadmap on track
          </h1>
        </header>

        {/* Asks grid */}
        <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-x-[2.4vw] gap-y-[2vh] py-[2.4vh]">
          {/* Ask 1 */}
          <div className="flex gap-[1.2vw] items-start">
            <span className="shrink-0 w-[2.8vw] h-[2.8vw] rounded-md bg-primary text-white flex items-center justify-center font-display font-bold text-[1.5vw]">1</span>
            <div>
              <div className="text-[1.8vw] font-bold font-display leading-tight">Executive sponsorship &amp; decision velocity</div>
              <p className="mt-[0.5vh] text-[1.5vw] text-muted leading-snug">Hold the six-month roadmap and clear blockers at the steering level.</p>
            </div>
          </div>
          {/* Ask 2 */}
          <div className="flex gap-[1.2vw] items-start">
            <span className="shrink-0 w-[2.8vw] h-[2.8vw] rounded-md bg-primary text-white flex items-center justify-center font-display font-bold text-[1.5vw]">2</span>
            <div>
              <div className="text-[1.8vw] font-bold font-display leading-tight">Dedicated SME &amp; product-owner access</div>
              <p className="mt-[0.5vh] text-[1.5vw] text-muted leading-snug">Enable knowledge transfer into the standing product pods.</p>
            </div>
          </div>
          {/* Ask 3 */}
          <div className="flex gap-[1.2vw] items-start">
            <span className="shrink-0 w-[2.8vw] h-[2.8vw] rounded-md bg-primary text-white flex items-center justify-center font-display font-bold text-[1.5vw]">3</span>
            <div>
              <div className="text-[1.8vw] font-bold font-display leading-tight">Source-system data governance ownership</div>
              <p className="mt-[0.5vh] text-[1.5vw] text-muted leading-snug">Unblocks the at-risk Member Data Hub MDM (~180 tickets/mo).</p>
            </div>
          </div>
          {/* Ask 4 */}
          <div className="flex gap-[1.2vw] items-start">
            <span className="shrink-0 w-[2.8vw] h-[2.8vw] rounded-md bg-primary text-white flex items-center justify-center font-display font-bold text-[1.5vw]">4</span>
            <div>
              <div className="text-[1.8vw] font-bold font-display leading-tight">Vendor coordination support</div>
              <p className="mt-[0.5vh] text-[1.5vw] text-muted leading-snug">NASCO, Premium Rating &amp; SAP dependencies (~80 tickets/mo at risk).</p>
            </div>
          </div>
          {/* Ask 5 */}
          <div className="flex gap-[1.2vw] items-start">
            <span className="shrink-0 w-[2.8vw] h-[2.8vw] rounded-md bg-primary text-white flex items-center justify-center font-display font-bold text-[1.5vw]">5</span>
            <div>
              <div className="text-[1.8vw] font-bold font-display leading-tight">Timely environment, tooling &amp; security approvals</div>
              <p className="mt-[0.5vh] text-[1.5vw] text-muted leading-snug">Keep delivery cadence; Transformation Workbench licensing already secured.</p>
            </div>
          </div>
          {/* Ask 6 */}
          <div className="flex gap-[1.2vw] items-start">
            <span className="shrink-0 w-[2.8vw] h-[2.8vw] rounded-md bg-accent text-white flex items-center justify-center font-display font-bold text-[1.5vw]">6</span>
            <div>
              <div className="text-[1.8vw] font-bold font-display leading-tight">Certification &amp; enablement time</div>
              <p className="mt-[0.5vh] text-[1.5vw] text-muted leading-snug">Protect capacity to land the 450+ planned certifications.</p>
            </div>
          </div>
        </div>

        {/* Closing note */}
        <div className="rounded-lg bg-accent/[0.06] border border-accent/30 px-[2vw] py-[1.8vh]">
          <p className="text-[1.6vw] leading-snug">
            <span className="font-semibold text-accent">Shared accountability.</span> These commitments convert at-risk dependencies into a jointly owned path to Autonomous Ops.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between mt-[2vh]">
          <span className="text-[1.5vw] text-muted">Source: CareOps360 roadmap risks &amp; capability data, as of May 2026</span>
          <span className="text-[1.5vw] text-muted font-semibold font-mono">06 / 06</span>
        </div>
      </div>
    </div>
  );
}
