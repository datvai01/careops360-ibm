export default function Governance() {
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
              Governance &amp; Delivery
            </span>
          </div>
          <h1 className="mt-[1.4vh] text-[2.7vw] font-bold font-display leading-[1.1] tracking-tight max-w-[82vw]">
            Governance cadences and value tracking keep the transformation on plan
          </h1>
        </header>

        {/* Body: cadences + value */}
        <div className="flex-1 flex gap-[2.4vw] py-[1vh]">
          {/* Governance cadences */}
          <div className="w-[48%] flex flex-col">
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.14em] text-muted mb-[0.8vh]">
              Governance cadences
            </span>
            <div className="flex-1 rounded-lg bg-surface border border-line overflow-hidden flex flex-col">
              <div className="grid grid-cols-[1.6fr_1fr] bg-bg border-b border-line px-[1.4vw] py-[1vh]">
                <span className="text-[1.5vw] font-semibold uppercase tracking-[0.1em] text-muted">Practice</span>
                <span className="text-[1.5vw] font-semibold uppercase tracking-[0.1em] text-muted">Cadence · Owner</span>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-[1.6fr_1fr] px-[1.4vw] py-[0.8vh] border-b border-line items-center flex-1">
                  <span className="text-[1.6vw] font-semibold">Quarterly Talent Review</span>
                  <span className="text-[1.5vw] text-muted">Quarterly · Joint IBM × Horizon</span>
                </div>
                <div className="grid grid-cols-[1.6fr_1fr] px-[1.4vw] py-[0.8vh] border-b border-line items-center flex-1">
                  <span className="text-[1.6vw] font-semibold">Skills Inventory Refresh</span>
                  <span className="text-[1.5vw] text-muted">Bi-monthly · AMS PMO</span>
                </div>
                <div className="grid grid-cols-[1.6fr_1fr] px-[1.4vw] py-[0.8vh] border-b border-line items-center flex-1">
                  <span className="text-[1.6vw] font-semibold">Certification Audit</span>
                  <span className="text-[1.5vw] text-muted">Quarterly · Talent CoE</span>
                </div>
                <div className="grid grid-cols-[1.6fr_1fr] px-[1.4vw] py-[0.8vh] border-b border-line items-center flex-1">
                  <span className="text-[1.6vw] font-semibold">AI Ethics &amp; Risk Council</span>
                  <span className="text-[1.5vw] text-muted">Monthly · AI Transformation Office</span>
                </div>
                <div className="grid grid-cols-[1.6fr_1fr] px-[1.4vw] py-[0.8vh] items-center flex-1">
                  <span className="text-[1.6vw] font-semibold">Vendor Training SLA</span>
                  <span className="text-[1.5vw] text-muted">Monthly · Procurement + L&amp;D</span>
                </div>
              </div>
            </div>
          </div>

          {/* Value tracking */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-baseline justify-between mb-[0.8vh]">
              <span className="text-[1.5vw] font-semibold uppercase tracking-[0.14em] text-muted">
                Tracked benefit pool
              </span>
              <span className="text-[2vw] font-bold font-display text-accent">≈ $19.6M</span>
            </div>
            <div className="flex-1 flex flex-col justify-between rounded-lg bg-surface border border-line p-[1.1vw]">
              {/* Bar 1 */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[1.5vw]">Automation — 70% manual work eliminated</span>
                  <span className="text-[1.6vw] font-bold font-display text-primary">$9.7M</span>
                </div>
                <div className="mt-[0.4vh] h-[1vh] rounded-full bg-line overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "100%" }} />
                </div>
              </div>
              {/* Bar 2 */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[1.5vw]">Data skills — real-time processing</span>
                  <span className="text-[1.6vw] font-bold font-display text-primary">$3.2M</span>
                </div>
                <div className="mt-[0.4vh] h-[1vh] rounded-full bg-line overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "33%" }} />
                </div>
              </div>
              {/* Bar 3 */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[1.5vw]">Integration — partner onboarding speed</span>
                  <span className="text-[1.6vw] font-bold font-display text-primary">$2.1M</span>
                </div>
                <div className="mt-[0.4vh] h-[1vh] rounded-full bg-line overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "22%" }} />
                </div>
              </div>
              {/* Bar 4 */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[1.5vw]">AI / GenAI — 95% auto-remediation</span>
                  <span className="text-[1.6vw] font-bold font-display text-accent">$2M+</span>
                </div>
                <div className="mt-[0.4vh] h-[1vh] rounded-full bg-line overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: "21%" }} />
                </div>
              </div>
              {/* Bar 5 */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[1.5vw]">AIOps — 13.5 hrs → 5 min resolution</span>
                  <span className="text-[1.6vw] font-bold font-display text-primary">$1.8M</span>
                </div>
                <div className="mt-[0.4vh] h-[1vh] rounded-full bg-line overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "19%" }} />
                </div>
              </div>
              {/* Bar 6 */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[1.5vw]">Domain skills — compliance &amp; accuracy</span>
                  <span className="text-[1.6vw] font-bold font-display text-primary">$0.8M</span>
                </div>
                <div className="mt-[0.4vh] h-[1vh] rounded-full bg-line overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "8%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline band */}
        <div>
          <div className="flex items-center gap-[1vw] mb-[0.8vh]">
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.16em] text-muted">
              Transformation Timeline
            </span>
            <span className="flex-1 h-px bg-line" />
          </div>
          <div className="grid grid-cols-3 gap-[1.4vw]">
            <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display text-primary">60 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.4vh]">Cadences and councils stood up</div>
            </div>
            <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display text-primary">90 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.4vh]">Quarterly review + certification audit</div>
            </div>
            <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display text-accent">180 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.4vh]">Value realization vs. benefit pool</div>
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
