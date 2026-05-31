export default function Governance() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-body text-text">
      <div className="h-full flex flex-col px-[6vw] pt-[3vh] pb-[2vh]">
        {/* Header */}
        <header>
          <div className="flex items-center gap-[1vw]">
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.18em] text-primary">
              Horizon × IBM
            </span>
            <span className="w-[2.5vw] h-px bg-line" />
            <span className="text-[1.5vw] font-medium uppercase tracking-[0.18em] text-muted">
              Governance &amp; Delivery
            </span>
          </div>
          <h1 className="mt-[1.4vh] text-[2.7vw] font-bold font-display leading-[1.1] tracking-tight max-w-[82vw]">
            Governance cadences keep the transformation on plan and value on track
          </h1>
          <p className="mt-[1.2vh] text-[1.6vw] text-muted leading-snug">
            Clear practices, cadences, and owners turn the roadmap into measurable impact
          </p>
        </header>

        {/* Timeline band — TOP */}
        <div className="mt-[1.4vh]">
          <div className="flex items-center gap-[1vw] mb-[0.7vh]">
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.16em] text-muted">
              Transformation Timeline
            </span>
            <span className="flex-1 h-px bg-line" />
          </div>
          <div className="grid grid-cols-3 gap-[1.4vw]">
            <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[0.8vh]">
              <div className="text-[1.6vw] font-bold font-display text-primary">60 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.2vh]">Cadences and councils stood up</div>
            </div>
            <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[0.8vh]">
              <div className="text-[1.6vw] font-bold font-display text-primary">90 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.2vh]">Quarterly review + certification audit</div>
            </div>
            <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[0.8vh]">
              <div className="text-[1.6vw] font-bold font-display text-accent">180 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.2vh]">Value realization across impact areas</div>
            </div>
          </div>
        </div>

        {/* Governance cadences — MIDDLE (how / what) */}
        <div className="flex-1 flex flex-col py-[1vh]">
          <span className="text-[1.5vw] font-semibold uppercase tracking-[0.14em] text-muted mb-[0.6vh]">
            Governance cadences
          </span>
          <div className="flex-1 rounded-lg bg-surface border border-line overflow-hidden flex flex-col">
            <div className="grid grid-cols-[1.6fr_1fr] bg-bg border-b border-line px-[1.4vw] py-[0.8vh]">
              <span className="text-[1.5vw] font-semibold uppercase tracking-[0.1em] text-muted">Practice</span>
              <span className="text-[1.5vw] font-semibold uppercase tracking-[0.1em] text-muted">Cadence · Owner</span>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="grid grid-cols-[1.6fr_1fr] px-[1.4vw] py-[0.6vh] border-b border-line items-center flex-1">
                <span className="text-[1.6vw] font-semibold">Quarterly Talent Review</span>
                <span className="text-[1.5vw] text-muted">Quarterly · Joint IBM × Horizon</span>
              </div>
              <div className="grid grid-cols-[1.6fr_1fr] px-[1.4vw] py-[0.6vh] border-b border-line items-center flex-1">
                <span className="text-[1.6vw] font-semibold">Skills Inventory Refresh</span>
                <span className="text-[1.5vw] text-muted">Bi-monthly · AMS PMO</span>
              </div>
              <div className="grid grid-cols-[1.6fr_1fr] px-[1.4vw] py-[0.6vh] border-b border-line items-center flex-1">
                <span className="text-[1.6vw] font-semibold">Certification Audit</span>
                <span className="text-[1.5vw] text-muted">Quarterly · Talent CoE</span>
              </div>
              <div className="grid grid-cols-[1.6fr_1fr] px-[1.4vw] py-[0.6vh] border-b border-line items-center flex-1">
                <span className="text-[1.6vw] font-semibold">AI Ethics &amp; Risk Council</span>
                <span className="text-[1.5vw] text-muted">Monthly · AI Transformation Office</span>
              </div>
              <div className="grid grid-cols-[1.6fr_1fr] px-[1.4vw] py-[0.6vh] items-center flex-1">
                <span className="text-[1.6vw] font-semibold">Vendor Training SLA</span>
                <span className="text-[1.5vw] text-muted">Monthly · Procurement + L&amp;D</span>
              </div>
            </div>
          </div>
        </div>

        {/* Outcomes — BOTTOM (value impact areas, no dollar figures) */}
        <div className="mt-[1vh]">
          <div className="flex items-center gap-[1vw] mb-[0.7vh]">
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.16em] text-muted">
              Value impact areas
            </span>
            <span className="flex-1 h-px bg-line" />
          </div>
          <div className="grid grid-cols-3 gap-x-[1.4vw] gap-y-[0.7vh]">
            <div className="flex items-baseline gap-[0.6vw]">
              <span className="text-[1.5vw] font-bold font-display text-primary">Automation</span>
              <span className="text-[1.5vw] text-muted leading-snug">70% less manual work</span>
            </div>
            <div className="flex items-baseline gap-[0.6vw]">
              <span className="text-[1.5vw] font-bold font-display text-primary">Data</span>
              <span className="text-[1.5vw] text-muted leading-snug">real-time processing</span>
            </div>
            <div className="flex items-baseline gap-[0.6vw]">
              <span className="text-[1.5vw] font-bold font-display text-primary">Integration</span>
              <span className="text-[1.5vw] text-muted leading-snug">faster onboarding</span>
            </div>
            <div className="flex items-baseline gap-[0.6vw]">
              <span className="text-[1.5vw] font-bold font-display text-accent">AI / GenAI</span>
              <span className="text-[1.5vw] text-muted leading-snug">95% auto-remediation</span>
            </div>
            <div className="flex items-baseline gap-[0.6vw]">
              <span className="text-[1.5vw] font-bold font-display text-primary">AIOps</span>
              <span className="text-[1.5vw] text-muted leading-snug">13.5 hrs → 5 min</span>
            </div>
            <div className="flex items-baseline gap-[0.6vw]">
              <span className="text-[1.5vw] font-bold font-display text-primary">Domain</span>
              <span className="text-[1.5vw] text-muted leading-snug">compliance &amp; accuracy</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between mt-[1vh]">
          <span className="text-[1.5vw] text-muted">Source: CareOps360 governance &amp; value-impact data, as of May 2026</span>
          <span className="text-[1.5vw] text-muted font-semibold font-mono">05 / 06</span>
        </div>
      </div>
    </div>
  );
}
