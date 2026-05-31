export default function PodModel() {
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
              Pod &amp; Product Model
            </span>
          </div>
          <h1 className="mt-[1.4vh] text-[2.7vw] font-bold font-display leading-[1.1] tracking-tight max-w-[82vw]">
            CareRadius becomes a product-aligned pod owning build, run, and AI uplift
          </h1>
          <p className="mt-[1.2vh] text-[1.6vw] text-muted leading-snug">
            Project teams → a standing product pod accountable end-to-end for the clinical platform
          </p>
        </header>

        {/* Body: pod profile + initiatives */}
        <div className="flex-1 flex gap-[2vw] py-[1.4vh]">
          {/* Pod profile */}
          <div className="w-[34%] rounded-lg bg-surface border border-line p-[1.6vw] flex flex-col">
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.14em] text-muted">Pod profile</span>
            <div className="mt-[1vh] text-[2.4vw] font-bold font-display leading-tight text-primary">CareRadius</div>
            <div className="text-[1.6vw] text-text leading-snug">Clinical Operations pod</div>
            <div className="mt-[1.6vh] text-[1.5vw] text-muted leading-relaxed">
              Health &amp; Network domain · Healthcare Management portfolio · ~30 resources
            </div>
            <div className="mt-[1.8vh] text-[1.5vw] font-semibold uppercase tracking-[0.12em] text-muted">Platform stack</div>
            <div className="mt-[1vh] flex flex-wrap gap-[0.6vw]">
              <span className="rounded-md bg-bg border border-line px-[0.9vw] py-[0.5vh] text-[1.5vw]">Java</span>
              <span className="rounded-md bg-bg border border-line px-[0.9vw] py-[0.5vh] text-[1.5vw]">Microservices</span>
              <span className="rounded-md bg-bg border border-line px-[0.9vw] py-[0.5vh] text-[1.5vw]">Angular</span>
              <span className="rounded-md bg-bg border border-line px-[0.9vw] py-[0.5vh] text-[1.5vw]">.NET 8</span>
              <span className="rounded-md bg-bg border border-line px-[0.9vw] py-[0.5vh] text-[1.5vw]">SAP BO</span>
              <span className="rounded-md bg-bg border border-line px-[0.9vw] py-[0.5vh] text-[1.5vw]">AWS / OCP</span>
              <span className="rounded-md bg-bg border border-line px-[0.9vw] py-[0.5vh] text-[1.5vw]">Oracle</span>
            </div>
          </div>

          {/* Initiatives */}
          <div className="flex-1 flex flex-col gap-[1vh]">
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.14em] text-muted">In-flight modernization</span>
            {/* Initiative 1 */}
            <div className="flex-1 rounded-lg bg-surface border border-line px-[1.6vw] py-[1.1vh] flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="text-[1.8vw] font-bold font-display">SAP BO Reporting 4.2 → 4.3</span>
                <span className="rounded-full bg-primary/10 text-primary px-[1vw] py-[0.4vh] text-[1.5vw] font-semibold">Active · Feb–May</span>
              </div>
              <p className="mt-[0.6vh] text-[1.5vw] text-muted leading-snug">
                Improved report performance, new visualizations, renewed vendor support
              </p>
            </div>
            {/* Initiative 2 */}
            <div className="flex-1 rounded-lg bg-surface border border-line px-[1.6vw] py-[1.1vh] flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="text-[1.8vw] font-bold font-display">Angular Frontend 11 → 17</span>
                <span className="rounded-full bg-primary/10 text-primary px-[1vw] py-[0.4vh] text-[1.5vw] font-semibold">Active · Mar–Jun</span>
              </div>
              <p className="mt-[0.6vh] text-[1.5vw] text-muted leading-snug">
                Modern UI components, faster page loads, improved maintainability for the IBM team
              </p>
            </div>
            {/* Initiative 3 */}
            <div className="flex-1 rounded-lg bg-surface border border-accent/40 px-[1.6vw] py-[1.1vh] flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="text-[1.8vw] font-bold font-display">VB6 Legacy → .NET 8</span>
                <span className="rounded-full bg-accent/10 text-accent px-[1vw] py-[0.4vh] text-[1.5vw] font-semibold">Planned · Apr–Sep</span>
              </div>
              <p className="mt-[0.6vh] text-[1.5vw] text-muted leading-snug">
                Eliminates VB6 runtime dependency; <span className="text-accent font-semibold">60% fewer legacy-related incident tickets</span>
              </p>
            </div>
          </div>
        </div>

        {/* Timeline band */}
        <div>
          <div className="flex items-center gap-[1vw] mb-[1.1vh]">
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.16em] text-muted">
              CareRadius Pod Timeline
            </span>
            <span className="flex-1 h-px bg-line" />
          </div>
          <div className="grid grid-cols-3 gap-[1.4vw]">
            <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display text-primary">60 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.4vh]">SAP BO 4.3 upgrade in flight</div>
            </div>
            <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display text-primary">90 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.4vh]">Angular clinical-workflow migration</div>
            </div>
            <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display text-accent">180 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.4vh]">VB6 → .NET 8 modernization begins</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between mt-[1.4vh]">
          <span className="text-[1.5vw] text-muted">Source: CareOps360 roadmap initiatives (CareRadius), as of May 2026</span>
          <span className="text-[1.5vw] text-muted font-semibold font-mono">03 / 06</span>
        </div>
      </div>
    </div>
  );
}
