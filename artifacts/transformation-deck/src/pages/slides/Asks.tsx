export default function Asks() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-gradient-to-b from-[#f7f9fc] to-[#eaeef4] font-body text-text">
      {/* Decorative background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(58vw 52vh at 88% -12%, rgba(15,98,254,0.08), transparent 60%), radial-gradient(48vw 46vh at -6% 112%, rgba(14,110,110,0.08), transparent 60%)",
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-[0.5vh] bg-gradient-to-r from-primary via-primary to-accent" />

      <div className="relative h-full flex flex-col px-[6vw] pt-[3vh] pb-[2vh]">
        {/* Header */}
        <header>
          <div className="flex items-center gap-[1vw]">
            <span className="rounded-full bg-primary/10 text-primary px-[1.1vw] py-[0.4vh] text-[1.5vw] font-semibold uppercase tracking-[0.18em]">
              Horizon × IBM
            </span>
            <span className="w-[2.5vw] h-px bg-line" />
            <span className="text-[1.5vw] font-medium uppercase tracking-[0.18em] text-muted">
              Asks from Horizon
            </span>
          </div>
          <h1 className="mt-[1.4vh] text-[2.7vw] font-bold font-display leading-[1.1] tracking-tight max-w-[84vw]">
            Six commitments from Horizon keep the six-month roadmap on track
          </h1>
          <p className="mt-[1.2vh] text-[1.6vw] text-muted leading-snug">
            Each commitment converts an at-risk dependency into a jointly owned path to Autonomous Ops
          </p>
        </header>

        {/* Asks grid */}
        <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-x-[1.6vw] gap-y-[1.2vh] py-[1.2vh]">
          {/* Ask 1 */}
          <div className="flex gap-[1.2vw] items-start rounded-xl bg-surface border border-line border-l-[0.35vw] border-l-primary shadow-[0_2px_10px_rgba(16,32,46,0.05)] px-[1.4vw] py-[0.8vh]">
            <span className="shrink-0 w-[2.8vw] h-[2.8vw] rounded-lg bg-gradient-to-br from-[#4589ff] to-primary text-white flex items-center justify-center font-display font-bold text-[1.5vw] shadow-sm">1</span>
            <div>
              <div className="text-[1.8vw] font-bold font-display leading-tight">Executive sponsorship &amp; decision velocity</div>
              <p className="mt-[0.5vh] text-[1.5vw] text-muted leading-snug">Hold the six-month roadmap and clear blockers at the steering level.</p>
            </div>
          </div>
          {/* Ask 2 */}
          <div className="flex gap-[1.2vw] items-start rounded-xl bg-surface border border-line border-l-[0.35vw] border-l-primary shadow-[0_2px_10px_rgba(16,32,46,0.05)] px-[1.4vw] py-[0.8vh]">
            <span className="shrink-0 w-[2.8vw] h-[2.8vw] rounded-lg bg-gradient-to-br from-[#4589ff] to-primary text-white flex items-center justify-center font-display font-bold text-[1.5vw] shadow-sm">2</span>
            <div>
              <div className="text-[1.8vw] font-bold font-display leading-tight">Dedicated SME &amp; product-owner access</div>
              <p className="mt-[0.5vh] text-[1.5vw] text-muted leading-snug">Enable knowledge transfer into the standing product pods.</p>
            </div>
          </div>
          {/* Ask 3 */}
          <div className="flex gap-[1.2vw] items-start rounded-xl bg-surface border border-line border-l-[0.35vw] border-l-primary shadow-[0_2px_10px_rgba(16,32,46,0.05)] px-[1.4vw] py-[0.8vh]">
            <span className="shrink-0 w-[2.8vw] h-[2.8vw] rounded-lg bg-gradient-to-br from-[#4589ff] to-primary text-white flex items-center justify-center font-display font-bold text-[1.5vw] shadow-sm">3</span>
            <div>
              <div className="text-[1.8vw] font-bold font-display leading-tight">Source-system data governance ownership</div>
              <p className="mt-[0.5vh] text-[1.5vw] text-muted leading-snug">Unblocks the at-risk Member Data Hub MDM (~180 tickets/mo).</p>
            </div>
          </div>
          {/* Ask 4 */}
          <div className="flex gap-[1.2vw] items-start rounded-xl bg-surface border border-line border-l-[0.35vw] border-l-primary shadow-[0_2px_10px_rgba(16,32,46,0.05)] px-[1.4vw] py-[0.8vh]">
            <span className="shrink-0 w-[2.8vw] h-[2.8vw] rounded-lg bg-gradient-to-br from-[#4589ff] to-primary text-white flex items-center justify-center font-display font-bold text-[1.5vw] shadow-sm">4</span>
            <div>
              <div className="text-[1.8vw] font-bold font-display leading-tight">Vendor coordination support</div>
              <p className="mt-[0.5vh] text-[1.5vw] text-muted leading-snug">NASCO, Premium Rating &amp; SAP dependencies (~80 tickets/mo at risk).</p>
            </div>
          </div>
          {/* Ask 5 */}
          <div className="flex gap-[1.2vw] items-start rounded-xl bg-surface border border-line border-l-[0.35vw] border-l-primary shadow-[0_2px_10px_rgba(16,32,46,0.05)] px-[1.4vw] py-[0.8vh]">
            <span className="shrink-0 w-[2.8vw] h-[2.8vw] rounded-lg bg-gradient-to-br from-[#4589ff] to-primary text-white flex items-center justify-center font-display font-bold text-[1.5vw] shadow-sm">5</span>
            <div>
              <div className="text-[1.8vw] font-bold font-display leading-tight">Timely environment, tooling &amp; security approvals</div>
              <p className="mt-[0.5vh] text-[1.5vw] text-muted leading-snug">Keep delivery cadence; Transformation Workbench licensing already secured.</p>
            </div>
          </div>
          {/* Ask 6 */}
          <div className="flex gap-[1.2vw] items-start rounded-xl bg-gradient-to-r from-accent/[0.08] to-surface border border-accent/40 border-l-[0.35vw] border-l-accent shadow-[0_2px_12px_rgba(14,110,110,0.10)] px-[1.4vw] py-[0.8vh]">
            <span className="shrink-0 w-[2.8vw] h-[2.8vw] rounded-lg bg-gradient-to-br from-[#1f9b9b] to-accent text-white flex items-center justify-center font-display font-bold text-[1.5vw] shadow-sm">6</span>
            <div>
              <div className="text-[1.8vw] font-bold font-display leading-tight">Certification &amp; enablement time</div>
              <p className="mt-[0.5vh] text-[1.5vw] text-muted leading-snug">Protect capacity to land the 450+ planned certifications.</p>
            </div>
          </div>
        </div>

        {/* Closing note */}
        <div className="rounded-xl bg-gradient-to-r from-accent/[0.10] to-accent/[0.03] border border-accent/30 border-l-[0.35vw] border-l-accent shadow-[0_2px_12px_rgba(14,110,110,0.08)] px-[2vw] py-[1.3vh]">
          <p className="text-[1.6vw] leading-snug">
            <span className="font-semibold text-accent">Shared accountability.</span> These commitments convert at-risk dependencies into a jointly owned path to Autonomous Ops.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between mt-[1.2vh]">
          <span className="flex items-center gap-[0.7vw] text-[1.5vw] text-muted">
            <span className="w-[1vw] h-[1vw] rounded-sm bg-gradient-to-br from-primary to-accent" />
            Source: CareOps360 roadmap risks &amp; capability data, as of May 2026
          </span>
          <span className="text-[1.5vw] text-muted font-semibold font-mono">06 / 06</span>
        </div>
      </div>
    </div>
  );
}
