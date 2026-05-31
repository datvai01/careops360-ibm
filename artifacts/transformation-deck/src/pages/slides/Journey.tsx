export default function Journey() {
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
              CareOps360 Transformation
            </span>
          </div>
          <h1 className="mt-[1.4vh] text-[2.7vw] font-bold font-display leading-[1.1] tracking-tight max-w-[78vw]">
            Horizon's operating model advances through four maturity stages toward autonomous delivery
          </h1>
          <p className="mt-[1.2vh] text-[1.6vw] text-muted leading-snug">
            391 resources across 11 domains, 15 portfolios, and 28 products · CareOps (CareRadius) leads the shift to the product &amp; pod model
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
            <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[0.9vh]">
              <div className="text-[1.6vw] font-bold font-display text-primary">60 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.2vh]">Quick-win automations live</div>
            </div>
            <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[0.9vh]">
              <div className="text-[1.6vw] font-bold font-display text-primary">90 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.2vh]">AI-augmented foundations stood up</div>
            </div>
            <div className="rounded-lg bg-surface border border-line px-[1.4vw] py-[0.9vh]">
              <div className="text-[1.6vw] font-bold font-display text-accent">180 Days</div>
              <div className="text-[1.5vw] text-text/80 leading-snug mt-[0.2vh]">Autonomous-ops roadmap locked</div>
            </div>
          </div>
        </div>

        {/* Stage cards — MIDDLE (how / what) */}
        <div className="flex-1 flex flex-col justify-center py-[1vh]">
          <div className="grid grid-cols-4 gap-[1.4vw]">
            {/* Stage 1 */}
            <div className="rounded-lg bg-surface border border-line p-[1.3vw] flex flex-col">
              <div className="flex items-center gap-[0.8vw]">
                <div className="w-[2.4vw] h-[2.4vw] rounded-md bg-text text-white flex items-center justify-center font-display font-bold text-[1.5vw]">
                  1
                </div>
                <span className="text-[1.5vw] font-bold font-display leading-tight">Traditional Ops</span>
              </div>
              <p className="mt-[1vh] text-[1.5vw] text-muted leading-snug">
                Reactive, manual, ticket-driven; high FTE dependency
              </p>
              <div className="mt-[1.2vh] flex items-baseline gap-[0.6vw]">
                <span className="text-[2.4vw] font-bold font-display text-text">100%</span>
                <span className="text-[1.5vw] text-muted">legacy</span>
              </div>
              <div className="mt-[0.8vh] h-[0.8vh] rounded-full bg-line overflow-hidden">
                <div className="h-full bg-text/40" style={{ width: "100%" }} />
              </div>
              <div className="mt-auto pt-[1vh] text-[1.5vw] text-muted">Phasing out</div>
            </div>

            {/* Stage 2 */}
            <div className="rounded-lg bg-surface border border-line p-[1.3vw] flex flex-col">
              <div className="flex items-center gap-[0.8vw]">
                <div className="w-[2.4vw] h-[2.4vw] rounded-md bg-primary text-white flex items-center justify-center font-display font-bold text-[1.5vw]">
                  2
                </div>
                <span className="text-[1.5vw] font-bold font-display leading-tight">Automation-Led Ops</span>
              </div>
              <p className="mt-[1vh] text-[1.5vw] text-muted leading-snug">
                Runbook automation + scripted remediation
              </p>
              <div className="mt-[1.2vh] flex items-baseline gap-[0.6vw]">
                <span className="text-[2.4vw] font-bold font-display text-primary">63%</span>
                <span className="text-[1.5vw] text-muted">→ 80% target</span>
              </div>
              <div className="mt-[0.8vh] h-[0.8vh] rounded-full bg-line overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "63%" }} />
              </div>
              <div className="mt-auto pt-[1vh] text-[1.5vw] text-muted">Platform Engineering</div>
            </div>

            {/* Stage 3 */}
            <div className="rounded-lg bg-surface border border-line p-[1.3vw] flex flex-col">
              <div className="flex items-center gap-[0.8vw]">
                <div className="w-[2.4vw] h-[2.4vw] rounded-md bg-primary text-white flex items-center justify-center font-display font-bold text-[1.5vw]">
                  3
                </div>
                <span className="text-[1.5vw] font-bold font-display leading-tight">AI-Augmented Ops</span>
              </div>
              <p className="mt-[1vh] text-[1.5vw] text-muted leading-snug">
                AIOps + ML, proactive alerting, co-pilot assist
              </p>
              <div className="mt-[1.2vh] flex items-baseline gap-[0.6vw]">
                <span className="text-[2.4vw] font-bold font-display text-primary">41%</span>
                <span className="text-[1.5vw] text-muted">→ 78% target</span>
              </div>
              <div className="mt-[0.8vh] h-[0.8vh] rounded-full bg-line overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "41%" }} />
              </div>
              <div className="mt-auto pt-[1vh] text-[1.5vw] text-muted">AI Transformation Office</div>
            </div>

            {/* Stage 4 */}
            <div className="rounded-lg bg-surface border-2 border-accent p-[1.3vw] flex flex-col">
              <div className="flex items-center gap-[0.8vw]">
                <div className="w-[2.4vw] h-[2.4vw] rounded-md bg-accent text-white flex items-center justify-center font-display font-bold text-[1.5vw]">
                  4
                </div>
                <span className="text-[1.5vw] font-bold font-display leading-tight">Autonomous Ops</span>
              </div>
              <p className="mt-[1vh] text-[1.5vw] text-muted leading-snug">
                Self-healing, generative-AI orchestration
              </p>
              <div className="mt-[1.2vh] flex items-baseline gap-[0.6vw]">
                <span className="text-[2.4vw] font-bold font-display text-accent">12%</span>
                <span className="text-[1.5vw] text-muted">→ 95% target</span>
              </div>
              <div className="mt-[0.8vh] h-[0.8vh] rounded-full bg-line overflow-hidden">
                <div className="h-full bg-accent" style={{ width: "12%" }} />
              </div>
              <div className="mt-auto pt-[1vh] text-[1.5vw] text-muted">Joint IBM × Horizon</div>
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
              <span className="text-[2vw] font-bold font-display text-primary">63%</span>
              <span className="text-[1.5vw] text-muted">automation coverage</span>
            </div>
            <div className="flex items-baseline gap-[0.7vw]">
              <span className="text-[2vw] font-bold font-display text-primary">95%</span>
              <span className="text-[1.5vw] text-muted">auto-remediation ready</span>
            </div>
            <div className="flex items-baseline gap-[0.7vw]">
              <span className="text-[2vw] font-bold font-display text-primary">~70%</span>
              <span className="text-[1.5vw] text-muted">FTE productivity gain</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between mt-[1vh]">
          <span className="text-[1.5vw] text-muted">Source: CareOps360 capability data, as of May 2026</span>
          <span className="text-[1.5vw] text-muted font-semibold font-mono">01 / 06</span>
        </div>
      </div>
    </div>
  );
}
