export default function MonthlyPlan() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-body text-text">
      <div className="h-full flex flex-col px-[5vw] pt-[4vh] pb-[2.5vh]">
        {/* Header */}
        <header>
          <div className="flex items-center gap-[1vw]">
            <span className="text-[1.5vw] font-semibold uppercase tracking-[0.18em] text-primary">
              Horizon × IBM
            </span>
            <span className="w-[2.5vw] h-px bg-line" />
            <span className="text-[1.5vw] font-medium uppercase tracking-[0.18em] text-muted">
              First Six Months
            </span>
          </div>
          <h1 className="mt-[1.4vh] text-[2.7vw] font-bold font-display leading-[1.1] tracking-tight max-w-[84vw]">
            The first six months sequence quick wins, modernization, and ticket reduction
          </h1>
        </header>

        {/* Monthly columns */}
        <div className="flex-1 grid grid-cols-6 gap-[0.9vw] py-[2.4vh]">
          {/* January */}
          <div className="flex flex-col rounded-lg bg-surface border border-line overflow-hidden">
            <div className="bg-primary text-white px-[0.9vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display leading-none">January</div>
              <div className="text-[1.5vw] leading-snug mt-[0.5vh] text-white/85">Quick wins</div>
            </div>
            <div className="flex-1 flex flex-col gap-[1vh] px-[0.9vw] py-[1.2vh]">
              <p className="text-[1.5vw] leading-snug">IDR SSN automation — 120/mo at 94%</p>
              <p className="text-[1.5vw] leading-snug text-muted">Cognos 11.1 → 12.0; Command Center live</p>
            </div>
          </div>

          {/* February */}
          <div className="flex flex-col rounded-lg bg-surface border border-line overflow-hidden">
            <div className="bg-primary text-white px-[0.9vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display leading-none">February</div>
              <div className="text-[1.5vw] leading-snug mt-[0.5vh] text-white/85">Modernization ramp</div>
            </div>
            <div className="flex-1 flex flex-col gap-[1vh] px-[0.9vw] py-[1.2vh]">
              <p className="text-[1.5vw] leading-snug">CareRadius SAP BO 4.2 → 4.3</p>
              <p className="text-[1.5vw] leading-snug text-muted">UPS PCI DSS 4.0; billing self-service 200/mo</p>
            </div>
          </div>

          {/* March */}
          <div className="flex flex-col rounded-lg bg-surface border border-line overflow-hidden">
            <div className="bg-primary text-white px-[0.9vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display leading-none">March</div>
              <div className="text-[1.5vw] leading-snug mt-[0.5vh] text-white/85">AI foundations</div>
            </div>
            <div className="flex-1 flex flex-col gap-[1vh] px-[0.9vw] py-[1.2vh]">
              <p className="text-[1.5vw] leading-snug">CareRadius Angular 11 → 17</p>
              <p className="text-[1.5vw] leading-snug text-muted">Prior-auth validation 95/mo; claims +20% FCR</p>
            </div>
          </div>

          {/* April */}
          <div className="flex flex-col rounded-lg bg-surface border border-line overflow-hidden">
            <div className="bg-primary text-white px-[0.9vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display leading-none">April</div>
              <div className="text-[1.5vw] leading-snug mt-[0.5vh] text-white/85">Scale automation</div>
            </div>
            <div className="flex-1 flex flex-col gap-[1vh] px-[0.9vw] py-[1.2vh]">
              <p className="text-[1.5vw] leading-snug">IBM BAW orchestration — 80% less manual</p>
              <p className="text-[1.5vw] leading-snug text-muted">VB6 → .NET 8 planning; enrollment 110/mo</p>
            </div>
          </div>

          {/* May */}
          <div className="flex flex-col rounded-lg bg-surface border border-line overflow-hidden">
            <div className="bg-primary text-white px-[0.9vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display leading-none">May</div>
              <div className="text-[1.5vw] leading-snug mt-[0.5vh] text-white/85">Payments &amp; remittance</div>
            </div>
            <div className="flex-1 flex flex-col gap-[1vh] px-[0.9vw] py-[1.2vh]">
              <p className="text-[1.5vw] leading-snug">HVCPS capitation — 5 days → same-day</p>
              <p className="text-[1.5vw] leading-snug text-muted">ChatOps triage — MTTR down 40%</p>
            </div>
          </div>

          {/* June */}
          <div className="flex flex-col rounded-lg bg-surface border-2 border-accent overflow-hidden">
            <div className="bg-accent text-white px-[0.9vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display leading-none">June</div>
              <div className="text-[1.5vw] leading-snug mt-[0.5vh] text-white/85">Consolidate</div>
            </div>
            <div className="flex-1 flex flex-col gap-[1vh] px-[0.9vw] py-[1.2vh]">
              <p className="text-[1.5vw] leading-snug">CareRadius Angular complete; IVR CPL 55/mo</p>
              <p className="text-[1.5vw] leading-snug text-muted">H1 review → Autonomous Ops roadmap</p>
            </div>
          </div>
        </div>

        {/* Bottom summary strip */}
        <div className="rounded-lg bg-text px-[2vw] py-[1.8vh] flex items-center justify-between">
          <div className="flex items-baseline gap-[0.7vw]">
            <span className="text-[2.4vw] font-bold font-display text-white">60</span>
            <span className="text-[1.6vw] text-white/80">initiatives across three tracks</span>
          </div>
          <div className="flex items-center gap-[2.4vw]">
            <div className="flex items-baseline gap-[0.6vw]">
              <span className="text-[2vw] font-bold font-display text-white">25</span>
              <span className="text-[1.5vw] text-white/75">technical remediation</span>
            </div>
            <div className="flex items-baseline gap-[0.6vw]">
              <span className="text-[2vw] font-bold font-display text-white">16</span>
              <span className="text-[1.5vw] text-white/75">transformation</span>
            </div>
            <div className="flex items-baseline gap-[0.6vw]">
              <span className="text-[2vw] font-bold font-display text-white">19</span>
              <span className="text-[1.5vw] text-white/75">ticket reduction</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between mt-[2vh]">
          <span className="text-[1.5vw] text-muted">Source: CareOps360 roadmap initiatives, as of May 2026</span>
          <span className="text-[1.5vw] text-muted font-semibold font-mono">04 / 06</span>
        </div>
      </div>
    </div>
  );
}
