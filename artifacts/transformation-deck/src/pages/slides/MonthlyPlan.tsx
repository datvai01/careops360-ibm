export default function MonthlyPlan() {
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
              First Six Months
            </span>
          </div>
          <h1 className="mt-[1.4vh] text-[2.7vw] font-bold font-display leading-[1.1] tracking-tight max-w-[84vw]">
            The first six months sequence quick wins, modernization, and ticket reduction
          </h1>
          <p className="mt-[1.2vh] text-[1.6vw] text-muted leading-snug">
            August through January — each month layers platform upgrades, tech-debt removal, and measurable ticket reduction
          </p>
        </header>

        {/* Monthly columns */}
        <div className="flex-1 grid grid-cols-6 gap-[0.9vw] py-[2.4vh]">
          {/* August */}
          <div className="flex flex-col rounded-xl bg-surface border border-line shadow-[0_2px_12px_rgba(16,32,46,0.06)] overflow-hidden">
            <div className="bg-gradient-to-br from-[#4589ff] to-primary text-white px-[0.9vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display leading-none">August</div>
              <div className="text-[1.5vw] leading-snug mt-[0.5vh] text-white/85">Quick wins</div>
            </div>
            <div className="flex-1 flex flex-col gap-[1vh] px-[0.9vw] py-[1.2vh]">
              <p className="text-[1.5vw] leading-snug">IDR SSN automation — 120/mo at 94%</p>
              <p className="text-[1.5vw] leading-snug text-muted">Cognos 11.1 → 12.0; Command Center live</p>
            </div>
          </div>

          {/* September */}
          <div className="flex flex-col rounded-xl bg-surface border border-line shadow-[0_2px_12px_rgba(16,32,46,0.06)] overflow-hidden">
            <div className="bg-gradient-to-br from-[#4589ff] to-primary text-white px-[0.9vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display leading-none">September</div>
              <div className="text-[1.5vw] leading-snug mt-[0.5vh] text-white/85">Modernization ramp</div>
            </div>
            <div className="flex-1 flex flex-col gap-[1vh] px-[0.9vw] py-[1.2vh]">
              <p className="text-[1.5vw] leading-snug">CareRadius SAP BO 4.2 → 4.3</p>
              <p className="text-[1.5vw] leading-snug text-muted">UPS PCI DSS 4.0; billing self-service 200/mo</p>
            </div>
          </div>

          {/* October */}
          <div className="flex flex-col rounded-xl bg-surface border border-line shadow-[0_2px_12px_rgba(16,32,46,0.06)] overflow-hidden">
            <div className="bg-gradient-to-br from-[#4589ff] to-primary text-white px-[0.9vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display leading-none">October</div>
              <div className="text-[1.5vw] leading-snug mt-[0.5vh] text-white/85">AI foundations</div>
            </div>
            <div className="flex-1 flex flex-col gap-[1vh] px-[0.9vw] py-[1.2vh]">
              <p className="text-[1.5vw] leading-snug">CareRadius Angular 11 → 17</p>
              <p className="text-[1.5vw] leading-snug text-muted">Prior-auth validation 95/mo; claims +20% FCR</p>
            </div>
          </div>

          {/* November */}
          <div className="flex flex-col rounded-xl bg-surface border border-line shadow-[0_2px_12px_rgba(16,32,46,0.06)] overflow-hidden">
            <div className="bg-gradient-to-br from-[#4589ff] to-primary text-white px-[0.9vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display leading-none">November</div>
              <div className="text-[1.5vw] leading-snug mt-[0.5vh] text-white/85">Scale automation</div>
            </div>
            <div className="flex-1 flex flex-col gap-[1vh] px-[0.9vw] py-[1.2vh]">
              <p className="text-[1.5vw] leading-snug">IBM BAW orchestration — 80% less manual</p>
              <p className="text-[1.5vw] leading-snug text-muted">VB6 → .NET 8 planning; enrollment 110/mo</p>
            </div>
          </div>

          {/* December */}
          <div className="flex flex-col rounded-xl bg-surface border border-line shadow-[0_2px_12px_rgba(16,32,46,0.06)] overflow-hidden">
            <div className="bg-gradient-to-br from-[#4589ff] to-primary text-white px-[0.9vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display leading-none">December</div>
              <div className="text-[1.5vw] leading-snug mt-[0.5vh] text-white/85">Payments &amp; remittance</div>
            </div>
            <div className="flex-1 flex flex-col gap-[1vh] px-[0.9vw] py-[1.2vh]">
              <p className="text-[1.5vw] leading-snug">HVCPS capitation — 5 days → same-day</p>
              <p className="text-[1.5vw] leading-snug text-muted">ChatOps triage — MTTR down 40%</p>
            </div>
          </div>

          {/* January */}
          <div className="flex flex-col rounded-xl bg-surface border-2 border-accent shadow-[0_4px_16px_rgba(14,110,110,0.12)] overflow-hidden">
            <div className="bg-gradient-to-br from-[#1f9b9b] to-accent text-white px-[0.9vw] py-[1vh]">
              <div className="text-[1.6vw] font-bold font-display leading-none">January</div>
              <div className="text-[1.5vw] leading-snug mt-[0.5vh] text-white/85">Consolidate</div>
            </div>
            <div className="flex-1 flex flex-col gap-[1vh] px-[0.9vw] py-[1.2vh]">
              <p className="text-[1.5vw] leading-snug">CareRadius Angular complete; IVR CPL 55/mo</p>
              <p className="text-[1.5vw] leading-snug text-muted">H1 review → Autonomous Ops roadmap</p>
            </div>
          </div>
        </div>

        {/* Bottom summary strip — Outcomes */}
        <div className="rounded-xl bg-gradient-to-r from-text to-[#243349] shadow-[0_4px_18px_rgba(16,32,46,0.18)] px-[2vw] py-[1.8vh] flex items-center justify-between">
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
          <span className="flex items-center gap-[0.7vw] text-[1.5vw] text-muted">
            <span className="w-[1vw] h-[1vw] rounded-sm bg-gradient-to-br from-primary to-accent" />
            Source: CareOps360 roadmap initiatives, as of May 2026
          </span>
          <span className="text-[1.5vw] text-muted font-semibold font-mono">04 / 06</span>
        </div>
      </div>
    </div>
  );
}
