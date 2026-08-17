export default function TeamTransformation() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg">
      <div className="absolute top-0 left-0 w-full h-[0.8vh] bg-accent" />
      <div className="px-[6vw] pt-[6vh]">
        <p className="text-accent font-semibold uppercase tracking-widest" style={{ fontSize: '1.1vw' }}>
          The How · Workforce
        </p>
        <h2 className="text-navy font-bold tracking-tight mt-[0.8vh]" style={{ fontSize: '3.2vw' }}>
          IBM Team Transformation
        </h2>
        <p className="text-muted mt-[1vh]" style={{ fontSize: '1.3vw' }}>
          The delivery team is rebuilt as the work changes — from ticket operations to product pods. Illustrative model on a 120-FTE baseline.
        </p>
      </div>
      <div className="px-[6vw] mt-[4vh] flex gap-[4vw]">
        {/* Stacked bars per year */}
        <div className="flex-1 flex items-end gap-[3.5vw]" style={{ height: '52vh' }}>
          <div className="flex-1 flex flex-col justify-end h-full">
            <div className="w-full rounded-t-[0.3vw] bg-accent flex items-center justify-center" style={{ height: '8%' }}>
              <span className="text-white font-bold" style={{ fontSize: '0.95vw' }}>10 new</span>
            </div>
            <div className="w-full bg-primary flex items-center justify-center" style={{ height: '12%' }}>
              <span className="text-white font-bold" style={{ fontSize: '0.95vw' }}>14 re-skilled</span>
            </div>
            <div className="w-full bg-navy/30 flex items-center justify-center" style={{ height: '80%' }}>
              <span className="text-navy font-semibold" style={{ fontSize: '1vw' }}>96 legacy roles</span>
            </div>
            <p className="text-navy font-bold mt-[1.2vh] text-center" style={{ fontSize: '1.2vw' }}>2026 · 120 FTE</p>
            <p className="text-muted text-center" style={{ fontSize: '1vw' }}>8% new</p>
          </div>
          <div className="flex-1 flex flex-col justify-end h-full">
            <div className="w-full rounded-t-[0.3vw] bg-accent flex items-center justify-center" style={{ height: '27%' }}>
              <span className="text-white font-bold" style={{ fontSize: '0.95vw' }}>30 new</span>
            </div>
            <div className="w-full bg-primary flex items-center justify-center" style={{ height: '25%' }}>
              <span className="text-white font-bold" style={{ fontSize: '0.95vw' }}>28 re-skilled</span>
            </div>
            <div className="w-full bg-navy/30 flex items-center justify-center" style={{ height: '48%' }}>
              <span className="text-navy font-semibold" style={{ fontSize: '1vw' }}>54 legacy roles</span>
            </div>
            <p className="text-navy font-bold mt-[1.2vh] text-center" style={{ fontSize: '1.2vw' }}>2027 · 112 FTE</p>
            <p className="text-muted text-center" style={{ fontSize: '1vw' }}>27% new</p>
          </div>
          <div className="flex-1 flex flex-col justify-end h-full">
            <div className="w-full rounded-t-[0.3vw] bg-accent flex items-center justify-center" style={{ height: '54%' }}>
              <span className="text-white font-bold" style={{ fontSize: '0.95vw' }}>56 new</span>
            </div>
            <div className="w-full bg-primary flex items-center justify-center" style={{ height: '29%' }}>
              <span className="text-white font-bold" style={{ fontSize: '0.95vw' }}>30 re-skilled</span>
            </div>
            <div className="w-full bg-navy/30 flex items-center justify-center" style={{ height: '17%' }}>
              <span className="text-navy font-semibold" style={{ fontSize: '1vw' }}>18 legacy</span>
            </div>
            <p className="text-navy font-bold mt-[1.2vh] text-center" style={{ fontSize: '1.2vw' }}>2028 · 104 FTE</p>
            <p className="text-accent font-bold text-center" style={{ fontSize: '1vw' }}>54% new</p>
          </div>
        </div>
        {/* Numbers panel */}
        <div className="w-[30vw]">
          <div className="bg-white rounded-[0.4vw] p-[1.6vw] shadow-sm">
            <div className="flex justify-between items-baseline">
              <p className="text-text font-semibold" style={{ fontSize: '1.2vw' }}>Roles transitioned out</p>
              <p className="text-navy font-bold" style={{ fontSize: '2vw' }}>66</p>
            </div>
            <div className="flex justify-between items-baseline mt-[1.2vh]">
              <p className="text-text font-semibold" style={{ fontSize: '1.2vw' }}>Re-trained / upskilled</p>
              <p className="text-primary font-bold" style={{ fontSize: '2vw' }}>30</p>
            </div>
            <div className="flex justify-between items-baseline mt-[1.2vh]">
              <p className="text-text font-semibold" style={{ fontSize: '1.2vw' }}>Net-new specialists</p>
              <p className="text-accent font-bold" style={{ fontSize: '2vw' }}>56</p>
            </div>
            <div className="border-t border-navy/10 mt-[1.6vh] pt-[1.4vh]">
              <p className="text-accent font-bold" style={{ fontSize: '1.6vw' }}>54% new talent by 2028</p>
              <p className="text-muted mt-[0.6vh]" style={{ fontSize: '1vw' }}>
                New hires concentrated in AI/AIOps engineering, platform SRE, and healthcare data science
              </p>
            </div>
          </div>
          <div className="mt-[2vh] bg-navy rounded-[0.4vw] p-[1.4vw]">
            <p className="text-white font-semibold" style={{ fontSize: '1.15vw' }}>Operating model shift</p>
            <p className="text-white/75 mt-[0.6vh]" style={{ fontSize: '1vw' }}>
              Ticket-queue teams (2026) → cross-functional product pods (2027) → outcome-owned autonomous pods with embedded Horizon staff (2028)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
