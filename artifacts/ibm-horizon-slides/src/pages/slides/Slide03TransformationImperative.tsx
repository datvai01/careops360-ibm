export default function Slide03TransformationImperative() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-display px-[7vw] py-[5vh]">

      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

      <div className="text-[1.5vw] font-semibold text-primary tracking-widest uppercase mb-[1vh]">
        The Transformation Imperative
      </div>
      <div className="text-[3.5vw] font-bold tracking-tight text-text leading-none mb-[0.8vh]">
        Current State vs. IBM Target
      </div>
      <div className="text-[1.7vw] text-muted mb-[3vh]">
        Key operational metrics — directional baseline to contracted 12-month targets
      </div>

      <div className="rounded-xl overflow-hidden border border-text/10 shadow-sm">
        <div className="grid grid-cols-4 bg-navy px-[2vw] py-[1.8vh]">
          <div className="text-[1.6vw] font-semibold text-white">Operational Metric</div>
          <div className="text-[1.6vw] font-semibold text-white text-center">Current State</div>
          <div className="text-[1.6vw] font-semibold text-primary text-center">IBM 12-Month Target</div>
          <div className="text-[1.6vw] font-semibold text-white text-center">Direction</div>
        </div>

        <div className="grid grid-cols-4 bg-white px-[2vw] py-[1.6vh] border-b border-text/8">
          <div className="text-[1.6vw] font-medium text-text">Test Automation Coverage</div>
          <div className="text-[1.6vw] text-muted text-center">~25%</div>
          <div className="text-[1.6vw] font-semibold text-primary text-center">80%+</div>
          <div className="text-[1.6vw] font-semibold text-center text-emerald-600">+3x</div>
        </div>

        <div className="grid grid-cols-4 bg-bg/60 px-[2vw] py-[1.6vh] border-b border-text/8">
          <div className="text-[1.6vw] font-medium text-text">MTTR — Mean Time to Resolve</div>
          <div className="text-[1.6vw] text-muted text-center">&gt; 4 hours</div>
          <div className="text-[1.6vw] font-semibold text-primary text-center">&lt; 1.8 hours</div>
          <div className="text-[1.6vw] font-semibold text-center text-emerald-600">↓ 55%</div>
        </div>

        <div className="grid grid-cols-4 bg-white px-[2vw] py-[1.6vh] border-b border-text/8">
          <div className="text-[1.6vw] font-medium text-text">Incident P3/P4 Auto-Resolution</div>
          <div className="text-[1.6vw] text-muted text-center">&lt; 10%</div>
          <div className="text-[1.6vw] font-semibold text-primary text-center">&gt; 74%</div>
          <div className="text-[1.6vw] font-semibold text-center text-emerald-600">↑ 7x</div>
        </div>

        <div className="grid grid-cols-4 bg-bg/60 px-[2vw] py-[1.6vh] border-b border-text/8">
          <div className="text-[1.6vw] font-medium text-text">Defect Escape to Production</div>
          <div className="text-[1.6vw] text-muted text-center">High / Untracked</div>
          <div className="text-[1.6vw] font-semibold text-primary text-center">65% Reduction</div>
          <div className="text-[1.6vw] font-semibold text-center text-emerald-600">Best-in-class</div>
        </div>

        <div className="grid grid-cols-4 bg-white px-[2vw] py-[1.6vh] border-b border-text/8">
          <div className="text-[1.6vw] font-medium text-text">System Availability (AMS)</div>
          <div className="text-[1.6vw] text-muted text-center">~99.7%</div>
          <div className="text-[1.6vw] font-semibold text-primary text-center">99.9%</div>
          <div className="text-[1.6vw] font-semibold text-center text-emerald-600">AI-Ops</div>
        </div>

        <div className="grid grid-cols-4 bg-bg/60 px-[2vw] py-[1.6vh]">
          <div className="text-[1.6vw] font-medium text-text">Enrollment Error Ticket Rate</div>
          <div className="text-[1.6vw] text-muted text-center">High / Reactive</div>
          <div className="text-[1.6vw] font-semibold text-primary text-center">~110 tickets/mo saved</div>
          <div className="text-[1.6vw] font-semibold text-center text-emerald-600">Zero-touch</div>
        </div>
      </div>

      <div className="mt-[2.5vh] text-[1.5vw] text-muted">
        All current-state figures are directional estimates. IBM's committed targets will be formally baselined and contractually agreed at programme commencement.
      </div>
    </div>
  );
}
