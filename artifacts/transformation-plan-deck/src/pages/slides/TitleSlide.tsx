export default function TitleSlide() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-navy">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #001d6c 0%, #002d9c 55%, #0043ce 100%)',
        }}
      />
      {/* IBM grid accent lines */}
      <div className="absolute left-[6vw] top-0 h-full w-[0.08vw] bg-white/10" />
      <div className="absolute left-[50vw] top-0 h-full w-[0.08vw] bg-white/10" />
      <div className="absolute right-[6vw] top-0 h-full w-[0.08vw] bg-white/10" />
      <div className="absolute bottom-[18vh] left-0 w-full h-[0.1vh] bg-white/15" />
      <div className="absolute top-[8vh] left-[6vw] flex items-center gap-[1vw]">
        <span className="text-white font-bold" style={{ fontSize: '1.4vw' }}>
          IBM
        </span>
        <span className="text-white/40" style={{ fontSize: '1.4vw' }}>
          ×
        </span>
        <span className="text-white font-semibold" style={{ fontSize: '1.4vw' }}>
          Horizon BCBS
        </span>
      </div>
      <div className="absolute left-[6vw] top-[28vh] max-w-[70vw]">
        <p
          className="text-accent font-semibold uppercase tracking-widest"
          style={{ fontSize: '1.3vw' }}
        >
          CareOps360 · 2026 – 2028
        </p>
        <h1
          className="text-white font-bold tracking-tight mt-[2vh]"
          style={{ fontSize: '6vw', lineHeight: 1.05, textWrap: 'balance' }}
        >
          Horizon Transformation Plan
        </h1>
        <p className="text-white/80 mt-[3vh]" style={{ fontSize: '1.9vw' }}>
          79 initiatives, one operating model, a workforce rebuilt for what comes next.
        </p>
      </div>
      <div className="absolute bottom-[6vh] left-[6vw] right-[6vw] flex gap-[6vw]">
        <div>
          <p className="text-white font-bold" style={{ fontSize: '2.8vw' }}>79</p>
          <p className="text-white/60" style={{ fontSize: '1.1vw' }}>Initiatives</p>
        </div>
        <div>
          <p className="text-white font-bold" style={{ fontSize: '2.8vw' }}>4</p>
          <p className="text-white/60" style={{ fontSize: '1.1vw' }}>Portfolios</p>
        </div>
        <div>
          <p className="text-white font-bold" style={{ fontSize: '2.8vw' }}>3</p>
          <p className="text-white/60" style={{ fontSize: '1.1vw' }}>Years</p>
        </div>
        <div>
          <p className="text-accent font-bold" style={{ fontSize: '2.8vw' }}>50%+</p>
          <p className="text-white/60" style={{ fontSize: '1.1vw' }}>New talent by 2028</p>
        </div>
      </div>
    </div>
  );
}
