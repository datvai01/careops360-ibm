export default function PodModel() {
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
              Pod &amp; Product Model
            </span>
          </div>
          <h1 className="mt-[1.4vh] text-[2.7vw] font-bold font-display leading-[1.1] tracking-tight max-w-[84vw]">
            CareOps is our blueprint for evolving the organization into a product &amp; pod model
          </h1>
          <p className="mt-[1.2vh] text-[1.6vw] text-muted leading-snug">
            CareRadius shows the shift — a standing product pod owning build, run, and AI uplift, the model we scale org-wide
          </p>
        </header>

        {/* Timeline band — TOP */}
        <div className="mt-[1.4vh]">
          <div className="flex items-center gap-[1vw] mb-[0.7vh]">
            <span className="w-[0.7vw] h-[0.7vw] rounded-sm bg-primary" />
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.16em] text-muted">
              CareRadius Pod Timeline
            </span>
            <span className="flex-1 h-px bg-line" />
          </div>
          <div className="grid grid-cols-3 gap-[1.4vw]">
            <div className="rounded-xl bg-surface border border-line border-l-[0.35vw] border-l-primary shadow-[0_2px_10px_rgba(16,32,46,0.05)] px-[1.4vw] py-[0.8vh]">
              <div className="text-[1.6vw] font-bold font-display text-primary">60 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.2vh]">SAP BO 4.3 upgrade in flight</div>
            </div>
            <div className="rounded-xl bg-surface border border-line border-l-[0.35vw] border-l-primary shadow-[0_2px_10px_rgba(16,32,46,0.05)] px-[1.4vw] py-[0.8vh]">
              <div className="text-[1.6vw] font-bold font-display text-primary">90 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.2vh]">Angular clinical-workflow migration</div>
            </div>
            <div className="rounded-xl bg-surface border border-line border-l-[0.35vw] border-l-accent shadow-[0_2px_10px_rgba(16,32,46,0.05)] px-[1.4vw] py-[0.8vh]">
              <div className="text-[1.6vw] font-bold font-display text-accent">180 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.2vh]">VB6 → .NET 8 modernization begins</div>
            </div>
          </div>
        </div>

        {/* Body: pod profile + initiatives — MIDDLE (how / what) */}
        <div className="flex-1 flex gap-[2vw] py-[0.6vh]">
          {/* Pod profile */}
          <div className="w-[34%] rounded-xl bg-gradient-to-b from-primary/[0.06] to-surface border border-line shadow-[0_2px_12px_rgba(16,32,46,0.06)] p-[1.2vw] flex flex-col">
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.14em] text-muted">Pod profile</span>
            <div className="mt-[0.6vh] text-[2vw] font-bold font-display leading-tight text-primary">CareRadius</div>
            <div className="text-[1.6vw] text-text leading-snug">Clinical Operations pod</div>
            <div className="mt-[0.8vh] text-[1.5vw] text-muted leading-snug whitespace-nowrap">
              Health &amp; Network · ~30 resources
            </div>
            <div className="mt-[1vh] text-[1.5vw] font-semibold uppercase tracking-[0.12em] text-muted">Platform stack</div>
            <div className="mt-[0.6vh] flex flex-wrap gap-[0.4vw]">
              <span className="rounded-md bg-surface border border-line px-[0.8vw] py-[0.3vh] text-[1.5vw]">Java</span>
              <span className="rounded-md bg-surface border border-line px-[0.8vw] py-[0.3vh] text-[1.5vw]">Microservices</span>
              <span className="rounded-md bg-surface border border-line px-[0.8vw] py-[0.3vh] text-[1.5vw]">Angular</span>
              <span className="rounded-md bg-surface border border-line px-[0.8vw] py-[0.3vh] text-[1.5vw]">.NET 8</span>
              <span className="rounded-md bg-surface border border-line px-[0.8vw] py-[0.3vh] text-[1.5vw]">SAP BO</span>
              <span className="rounded-md bg-surface border border-line px-[0.8vw] py-[0.3vh] text-[1.5vw]">AWS / OCP</span>
              <span className="rounded-md bg-surface border border-line px-[0.8vw] py-[0.3vh] text-[1.5vw]">Oracle</span>
            </div>
          </div>

          {/* Initiatives */}
          <div className="flex-1 flex flex-col gap-[0.6vh]">
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.14em] text-muted">In-flight modernization</span>
            {/* Initiative 1 */}
            <div className="flex-1 rounded-xl bg-surface border border-line border-l-[0.35vw] border-l-primary shadow-[0_2px_10px_rgba(16,32,46,0.05)] px-[1.6vw] py-[0.7vh] flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="text-[1.8vw] font-bold font-display">SAP BO Reporting 4.2 → 4.3</span>
                <span className="rounded-full bg-primary/10 text-primary px-[1vw] py-[0.4vh] text-[1.5vw] font-semibold">Active · Sep–Dec</span>
              </div>
              <p className="mt-[0.4vh] text-[1.5vw] text-muted leading-snug">
                Improved report performance, new visualizations, renewed vendor support
              </p>
            </div>
            {/* Initiative 2 */}
            <div className="flex-1 rounded-xl bg-surface border border-line border-l-[0.35vw] border-l-primary shadow-[0_2px_10px_rgba(16,32,46,0.05)] px-[1.6vw] py-[0.7vh] flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="text-[1.8vw] font-bold font-display">Angular Frontend 11 → 17</span>
                <span className="rounded-full bg-primary/10 text-primary px-[1vw] py-[0.4vh] text-[1.5vw] font-semibold">Active · Oct–Jan</span>
              </div>
              <p className="mt-[0.4vh] text-[1.5vw] text-muted leading-snug">
                Modern UI components, faster page loads, improved maintainability
              </p>
            </div>
            {/* Initiative 3 */}
            <div className="flex-1 rounded-xl bg-gradient-to-r from-accent/[0.08] to-surface border border-accent/40 border-l-[0.35vw] border-l-accent shadow-[0_2px_12px_rgba(14,110,110,0.10)] px-[1.6vw] py-[0.7vh] flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="text-[1.8vw] font-bold font-display">VB6 Legacy → .NET 8</span>
                <span className="rounded-full bg-accent/10 text-accent px-[1vw] py-[0.4vh] text-[1.5vw] font-semibold">Planned · Nov–Apr</span>
              </div>
              <p className="mt-[0.4vh] text-[1.5vw] text-muted leading-snug">
                Eliminates VB6 runtime dependency; <span className="text-accent font-semibold">60% fewer legacy incident tickets</span>
              </p>
            </div>
          </div>
        </div>

        {/* Outcomes — BOTTOM */}
        <div className="mt-[0.6vh]">
          <div className="flex items-center gap-[1vw] mb-[0.6vh]">
            <span className="w-[0.7vw] h-[0.7vw] rounded-sm bg-accent" />
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.16em] text-muted">
              Outcomes
            </span>
            <span className="flex-1 h-px bg-line" />
          </div>
          <div className="grid grid-cols-3 gap-[1.4vw]">
            <div className="flex items-baseline gap-[0.6vw]">
              <span className="text-[1.6vw] font-bold font-display text-accent">60% fewer</span>
              <span className="text-[1.5vw] text-muted">legacy tickets</span>
            </div>
            <div className="flex items-baseline gap-[0.6vw]">
              <span className="text-[1.6vw] font-bold font-display text-primary">Faster page loads</span>
              <span className="text-[1.5vw] text-muted">modern UI</span>
            </div>
            <div className="flex items-baseline gap-[0.6vw]">
              <span className="text-[1.6vw] font-bold font-display text-primary">Renewed support</span>
              <span className="text-[1.5vw] text-muted">reporting restored</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between mt-[0.6vh]">
          <span className="flex items-center gap-[0.7vw] text-[1.5vw] text-muted">
            <span className="w-[1vw] h-[1vw] rounded-sm bg-gradient-to-br from-primary to-accent" />
            Source: CareOps360 roadmap initiatives (CareRadius), as of May 2026
          </span>
          <span className="text-[1.5vw] text-muted font-semibold font-mono">03 / 06</span>
        </div>
      </div>
    </div>
  );
}
