export default function ClosingSlide() {
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #001d6c 0%, #002d9c 55%, #0043ce 100%)',
        }}
      />
      <div className="absolute left-[6vw] top-0 h-full w-[0.08vw] bg-white/10" />
      <div className="absolute right-[6vw] top-0 h-full w-[0.08vw] bg-white/10" />
      <div className="absolute left-[6vw] top-[26vh] max-w-[68vw]">
        <h2
          className="text-white font-bold tracking-tight"
          style={{ fontSize: '4.6vw', lineHeight: 1.1, textWrap: 'balance' }}
        >
          One plan. Four portfolios. A workforce built for 2028.
        </h2>
        <p className="text-white/80 mt-[3vh]" style={{ fontSize: '1.7vw' }}>
          Quick wins in 2026 fund the platform work of 2027 — and by 2028 Horizon runs it.
        </p>
      </div>
      <div className="absolute bottom-[10vh] left-[6vw] flex items-center gap-[1vw]">
        <span className="text-white font-bold" style={{ fontSize: '1.4vw' }}>IBM</span>
        <span className="text-white/40" style={{ fontSize: '1.4vw' }}>×</span>
        <span className="text-white font-semibold" style={{ fontSize: '1.4vw' }}>Horizon BCBS</span>
        <span className="text-white/40 ml-[2vw]" style={{ fontSize: '1.2vw' }}>CareOps360 Transformation · 2026 – 2028</span>
      </div>
    </div>
  );
}
