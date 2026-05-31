export default function CulturalChange() {
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
              Cultural Change
            </span>
          </div>
          <h1 className="mt-[1.4vh] text-[2.7vw] font-bold font-display leading-[1.1] tracking-tight max-w-[80vw]">
            Operations shift from reactive and manual to AI-assisted and proactive
          </h1>
          <p className="mt-[1.2vh] text-[1.6vw] text-muted leading-snug">
            From the current operating model to the AI-augmented target — enabled by a certified workforce
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
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.2vh]">Copilot rollout + certification wave 1</div>
            </div>
            <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[0.8vh]">
              <div className="text-[1.6vw] font-bold font-display text-primary">90 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.2vh]">Squads operating cross-functionally</div>
            </div>
            <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[0.8vh]">
              <div className="text-[1.6vw] font-bold font-display text-accent">180 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.2vh]">Advisory-role redeployment underway</div>
            </div>
          </div>
        </div>

        {/* From -> To rows — MIDDLE (how / what) */}
        <div className="flex-1 flex flex-col justify-center py-[1vh]">
          <div className="grid grid-cols-[1fr_2.5vw_1fr] gap-[1vw] mb-[0.8vh]">
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.14em] text-muted">From — current model</span>
            <span />
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.14em] text-accent">To — target model</span>
          </div>

          <div className="flex flex-col gap-[0.7vh]">
            {/* Row 1 */}
            <div className="grid grid-cols-[1fr_2.5vw_1fr] items-center gap-[1vw]">
              <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[0.8vh] text-[1.6vw] text-muted leading-snug">
                Manual ticket triage and escalation
              </div>
              <div className="text-[1.9vw] text-accent text-center font-bold">→</div>
              <div className="rounded-lg bg-accent/[0.06] border border-accent/30 px-[1.4vw] py-[0.8vh] text-[1.6vw] leading-snug">
                AI-assisted triage with 95% auto-remediation
              </div>
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-[1fr_2.5vw_1fr] items-center gap-[1vw]">
              <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[0.8vh] text-[1.6vw] text-muted leading-snug">
                Reactive incident response
              </div>
              <div className="text-[1.9vw] text-accent text-center font-bold">→</div>
              <div className="rounded-lg bg-accent/[0.06] border border-accent/30 px-[1.4vw] py-[0.8vh] text-[1.6vw] leading-snug">
                Proactive anomaly detection before impact
              </div>
            </div>
            {/* Row 3 */}
            <div className="grid grid-cols-[1fr_2.5vw_1fr] items-center gap-[1vw]">
              <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[0.8vh] text-[1.6vw] text-muted leading-snug">
                High FTE dependency on L1/L2 ops
              </div>
              <div className="text-[1.9vw] text-accent text-center font-bold">→</div>
              <div className="rounded-lg bg-accent/[0.06] border border-accent/30 px-[1.4vw] py-[0.8vh] text-[1.6vw] leading-snug">
                124 FTEs redeployed to advisory roles
              </div>
            </div>
            {/* Row 4 */}
            <div className="grid grid-cols-[1fr_2.5vw_1fr] items-center gap-[1vw]">
              <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[0.8vh] text-[1.6vw] text-muted leading-snug">
                Siloed tools, context-switching overhead
              </div>
              <div className="text-[1.9vw] text-accent text-center font-bold">→</div>
              <div className="rounded-lg bg-accent/[0.06] border border-accent/30 px-[1.4vw] py-[0.8vh] text-[1.6vw] leading-snug">
                Unified Command Center with GenAI Copilot
              </div>
            </div>
            {/* Row 5 */}
            <div className="grid grid-cols-[1fr_2.5vw_1fr] items-center gap-[1vw]">
              <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[0.8vh] text-[1.6vw] text-muted leading-snug">
                Days to resolve member enrollment errors
              </div>
              <div className="text-[1.9vw] text-accent text-center font-bold">→</div>
              <div className="rounded-lg bg-accent/[0.06] border border-accent/30 px-[1.4vw] py-[0.8vh] text-[1.6vw] leading-snug">
                5-minute MTTR for enrollment errors
              </div>
            </div>
          </div>
        </div>

        {/* Outcomes — BOTTOM */}
        <div className="mt-[1vh]">
          <div className="flex items-center gap-[1vw] mb-[0.7vh]">
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.16em] text-muted">
              Outcomes
            </span>
            <span className="flex-1 h-px bg-line" />
          </div>
          <div className="grid grid-cols-3 gap-[1.4vw]">
            <div className="flex items-baseline gap-[0.7vw]">
              <span className="text-[2vw] font-bold font-display text-primary">382</span>
              <span className="text-[1.5vw] text-muted">certified resources</span>
            </div>
            <div className="flex items-baseline gap-[0.7vw]">
              <span className="text-[2vw] font-bold font-display text-primary">450+</span>
              <span className="text-[1.5vw] text-muted">planned certifications</span>
            </div>
            <div className="flex items-baseline gap-[0.7vw]">
              <span className="text-[2vw] font-bold font-display text-accent">41%</span>
              <span className="text-[1.5vw] text-muted">workforce AI-enabled</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between mt-[1vh]">
          <span className="text-[1.5vw] text-muted">Source: CareOps360 workforce transformation data, as of May 2026</span>
          <span className="text-[1.5vw] text-muted font-semibold font-mono">02 / 06</span>
        </div>
      </div>
    </div>
  );
}
