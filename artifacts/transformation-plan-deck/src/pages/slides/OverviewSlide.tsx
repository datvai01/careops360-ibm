export default function OverviewSlide() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      <div className="absolute top-0 left-0 w-full h-[1vh] bg-primary" />
      <div className="px-[6vw] pt-[7vh]">
        <p className="text-primary font-semibold uppercase tracking-widest" style={{ fontSize: '1.1vw' }}>
          Portfolio Overview
        </p>
        <h2 className="text-navy font-bold tracking-tight mt-[1vh]" style={{ fontSize: '3.6vw' }}>
          Transformation at a Glance
        </h2>
      </div>
      <div className="px-[6vw] mt-[4vh] grid grid-cols-4 gap-[1.6vw]">
        <div className="bg-white rounded-[0.4vw] p-[1.4vw] shadow-sm">
          <p className="text-navy font-bold" style={{ fontSize: '3.4vw' }}>19</p>
          <p className="font-semibold text-text" style={{ fontSize: '1.25vw' }}>Foundational</p>
          <p className="text-muted mt-[0.8vh]" style={{ fontSize: '1vw' }}>
            AIOps, governance, delivery discipline — the platform everything else stands on
          </p>
        </div>
        <div className="bg-white rounded-[0.4vw] p-[1.4vw] shadow-sm">
          <p className="text-navy font-bold" style={{ fontSize: '3.4vw' }}>16</p>
          <p className="font-semibold text-text" style={{ fontSize: '1.25vw' }}>Strategic</p>
          <p className="text-muted mt-[0.8vh]" style={{ fontSize: '1vw' }}>
            Multi-year transformation of payer, clinical, and digital platforms through 2028
          </p>
        </div>
        <div className="bg-white rounded-[0.4vw] p-[1.4vw] shadow-sm">
          <p className="text-navy font-bold" style={{ fontSize: '3.4vw' }}>25</p>
          <p className="font-semibold text-text" style={{ fontSize: '1.25vw' }}>Technical Remediation</p>
          <p className="text-muted mt-[0.8vh]" style={{ fontSize: '1vw' }}>
            N-1/2 version upgrades removing currency debt across every core application
          </p>
        </div>
        <div className="bg-white rounded-[0.4vw] p-[1.4vw] shadow-sm">
          <p className="text-navy font-bold" style={{ fontSize: '3.4vw' }}>19</p>
          <p className="font-semibold text-text" style={{ fontSize: '1.25vw' }}>Ticket Reduction</p>
          <p className="text-muted mt-[0.8vh]" style={{ fontSize: '1vw' }}>
            Root-cause elimination of the highest-volume ticket drivers in Year 1
          </p>
        </div>
      </div>
      <div className="px-[6vw] mt-[4vh] flex items-center gap-[3vw]">
        <div className="flex-1">
          <div className="flex w-full h-[3.2vh] rounded-[0.3vw] overflow-hidden">
            <div className="bg-accent" style={{ width: '19%' }} />
            <div className="bg-primary" style={{ width: '24%' }} />
            <div className="bg-planned" style={{ width: '53%' }} />
            <div className="bg-risk" style={{ width: '4%' }} />
          </div>
          <div className="flex gap-[2.2vw] mt-[1.4vh]">
            <p className="text-muted" style={{ fontSize: '1.05vw' }}>
              <span className="font-bold text-accent">15</span> Completed
            </p>
            <p className="text-muted" style={{ fontSize: '1.05vw' }}>
              <span className="font-bold text-primary">19</span> Active
            </p>
            <p className="text-muted" style={{ fontSize: '1.05vw' }}>
              <span className="font-bold text-navy">42</span> Planned
            </p>
            <p className="text-muted" style={{ fontSize: '1.05vw' }}>
              <span className="font-bold text-risk">3</span> At Risk
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-[5vh] left-[6vw] right-[6vw] grid grid-cols-3 gap-[1.6vw]">
        <div className="border-t-[0.35vh] border-primary pt-[1.2vh]">
          <p className="font-bold text-navy" style={{ fontSize: '1.3vw' }}>Year 1 · 2026</p>
          <p className="text-muted" style={{ fontSize: '1.05vw' }}>Quick Wins & Foundation — stabilize, remediate, prove value</p>
        </div>
        <div className="border-t-[0.35vh] border-primary pt-[1.2vh]">
          <p className="font-bold text-navy" style={{ fontSize: '1.3vw' }}>Year 2 · 2027</p>
          <p className="text-muted" style={{ fontSize: '1.05vw' }}>Scale & Integration — platform convergence and co-delivery</p>
        </div>
        <div className="border-t-[0.35vh] border-accent pt-[1.2vh]">
          <p className="font-bold text-navy" style={{ fontSize: '1.3vw' }}>Year 3 · 2028</p>
          <p className="text-muted" style={{ fontSize: '1.05vw' }}>Transform & Optimize — autonomous operations, Horizon self-sufficiency</p>
        </div>
      </div>
    </div>
  );
}
