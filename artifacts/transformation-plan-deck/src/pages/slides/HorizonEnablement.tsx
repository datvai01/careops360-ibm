export default function HorizonEnablement() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      <div className="absolute top-0 left-0 w-full h-[0.8vh] bg-accent" />
      <div className="px-[6vw] pt-[6vh]">
        <p className="text-accent font-semibold uppercase tracking-widest" style={{ fontSize: '1.1vw' }}>
          The How · Enablement
        </p>
        <h2 className="text-navy font-bold tracking-tight mt-[0.8vh]" style={{ fontSize: '3.2vw' }}>
          Horizon Enablement Journey
        </h2>
        <p className="text-muted mt-[1vh]" style={{ fontSize: '1.3vw' }}>
          Horizon's team is trained inside the transformation, not after it — every initiative doubles as a knowledge-transfer vehicle.
        </p>
      </div>
      {/* Phase timeline */}
      <div className="px-[6vw] mt-[4vh]">
        <div className="flex gap-[1vw]">
          <div className="flex-1 rounded-[0.4vw] bg-white shadow-sm p-[1.4vw] border-t-[0.5vh] border-primary">
            <p className="text-primary font-bold uppercase tracking-wide" style={{ fontSize: '1vw' }}>Phase 1 · 2026</p>
            <p className="text-navy font-bold mt-[0.5vh]" style={{ fontSize: '1.6vw' }}>Shadow</p>
            <p className="text-muted mt-[1vh]" style={{ fontSize: '1.05vw' }}>
              Horizon staff embedded in IBM pods as observers on every Foundational and Remediation initiative
            </p>
            <p className="text-text mt-[1.4vh]" style={{ fontSize: '1.05vw' }}>
              Runbook academy · AIOps tooling bootcamps · paired incident reviews
            </p>
          </div>
          <div className="flex-1 rounded-[0.4vw] bg-white shadow-sm p-[1.4vw] border-t-[0.5vh] border-primary">
            <p className="text-primary font-bold uppercase tracking-wide" style={{ fontSize: '1vw' }}>Phase 2 · 2027</p>
            <p className="text-navy font-bold mt-[0.5vh]" style={{ fontSize: '1.6vw' }}>Co-Deliver</p>
            <p className="text-muted mt-[1vh]" style={{ fontSize: '1.05vw' }}>
              Mixed IBM–Horizon pods share delivery ownership on Strategic platform initiatives
            </p>
            <p className="text-text mt-[1.4vh]" style={{ fontSize: '1.05vw' }}>
              Platform certifications · rotation through every domain pod · Horizon-led change windows
            </p>
          </div>
          <div className="flex-1 rounded-[0.4vw] bg-white shadow-sm p-[1.4vw] border-t-[0.5vh] border-accent">
            <p className="text-accent font-bold uppercase tracking-wide" style={{ fontSize: '1vw' }}>Phase 3 · 2028</p>
            <p className="text-navy font-bold mt-[0.5vh]" style={{ fontSize: '1.6vw' }}>Self-Sufficient</p>
            <p className="text-muted mt-[1vh]" style={{ fontSize: '1.05vw' }}>
              Horizon owns steady-state operations; IBM shifts to advisory and new-capability build
            </p>
            <p className="text-text mt-[1.4vh]" style={{ fontSize: '1.05vw' }}>
              Horizon-run pods · certified L1–L3 coverage · IBM exit criteria per platform
            </p>
          </div>
        </div>
      </div>
      {/* KT milestones */}
      <div className="absolute bottom-[5vh] left-[6vw] right-[6vw]">
        <div className="h-[0.35vh] bg-navy/15 relative mb-[1.6vh]">
          <div className="absolute left-0 top-0 h-full bg-accent" style={{ width: '33%' }} />
          <div className="absolute" style={{ left: '12%', top: '50%', width: '0.7vw', height: '0.7vw', transform: 'translate(-50%,-50%) rotate(45deg)', background: '#24a148' }} />
          <div className="absolute" style={{ left: '38%', top: '50%', width: '0.7vw', height: '0.7vw', transform: 'translate(-50%,-50%) rotate(45deg)', background: '#001d6c' }} />
          <div className="absolute" style={{ left: '64%', top: '50%', width: '0.7vw', height: '0.7vw', transform: 'translate(-50%,-50%) rotate(45deg)', background: '#001d6c' }} />
          <div className="absolute" style={{ left: '92%', top: '50%', width: '0.7vw', height: '0.7vw', transform: 'translate(-50%,-50%) rotate(45deg)', background: '#001d6c' }} />
        </div>
        <div className="grid grid-cols-4 gap-[1.5vw]">
          <p className="text-muted" style={{ fontSize: '1vw' }}>
            <span className="font-bold text-navy">2026 Q3:</span> 500+ runbooks codified; Horizon L1 self-service live
          </p>
          <p className="text-muted" style={{ fontSize: '1vw' }}>
            <span className="font-bold text-navy">2027 Q1:</span> first Horizon-led pod; 40% of L2 handled in-house
          </p>
          <p className="text-muted" style={{ fontSize: '1vw' }}>
            <span className="font-bold text-navy">2027 Q4:</span> platform certifications complete across all domains
          </p>
          <p className="text-muted" style={{ fontSize: '1vw' }}>
            <span className="font-bold text-navy">2028 Q4:</span> Horizon self-sufficiency; IBM advisory-only model
          </p>
        </div>
      </div>
    </div>
  );
}
