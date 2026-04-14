export default function Slide07QualityEngineering() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-display px-[7vw] py-[5vh]">

      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

      <div className="text-[1.5vw] font-semibold text-primary tracking-widest uppercase mb-[1vh]">
        Quality Engineering
      </div>
      <div className="text-[3.5vw] font-bold tracking-tight text-text leading-none mb-[0.8vh]">
        Measurable Quality at Every Milestone
      </div>
      <div className="text-[1.7vw] text-muted mb-[3vh]">
        Self-improving quality framework — closed-loop feedback embedded in every CI/CD pipeline stage
      </div>

      <div className="flex gap-[4vw]">

        <div className="flex-1">
          <div className="rounded-xl overflow-hidden border border-text/10 shadow-sm">
            <div className="grid grid-cols-5 bg-navy px-[1.5vw] py-[1.8vh]">
              <div className="col-span-2 text-[1.6vw] font-semibold text-white">Quality Metric</div>
              <div className="text-[1.6vw] font-semibold text-white text-center">Current</div>
              <div className="text-[1.6vw] font-semibold text-white text-center">6-Month</div>
              <div className="text-[1.6vw] font-semibold text-primary text-center">12-Month</div>
            </div>

            <div className="grid grid-cols-5 bg-white px-[1.5vw] py-[1.6vh] border-b border-text/8">
              <div className="col-span-2 text-[1.6vw] font-medium text-text">Test Automation Coverage</div>
              <div className="text-[1.6vw] text-muted text-center">~25%</div>
              <div className="text-[1.6vw] text-text text-center font-medium">55%</div>
              <div className="text-[1.6vw] font-bold text-primary text-center">80%+</div>
            </div>

            <div className="grid grid-cols-5 bg-bg/60 px-[1.5vw] py-[1.6vh] border-b border-text/8">
              <div className="col-span-2 text-[1.6vw] font-medium text-text">Defect Escape to Production</div>
              <div className="text-[1.6vw] text-muted text-center">High</div>
              <div className="text-[1.6vw] text-text text-center font-medium">−40%</div>
              <div className="text-[1.6vw] font-bold text-primary text-center">−65%</div>
            </div>

            <div className="grid grid-cols-5 bg-white px-[1.5vw] py-[1.6vh] border-b border-text/8">
              <div className="col-span-2 text-[1.6vw] font-medium text-text">Regression Cycle Time</div>
              <div className="text-[1.6vw] text-muted text-center">Multi-day</div>
              <div className="text-[1.6vw] text-text text-center font-medium">50% faster</div>
              <div className="text-[1.6vw] font-bold text-primary text-center">70% faster</div>
            </div>

            <div className="grid grid-cols-5 bg-bg/60 px-[1.5vw] py-[1.6vh] border-b border-text/8">
              <div className="col-span-2 text-[1.6vw] font-medium text-text">Mean Time to Detect (MTTD)</div>
              <div className="text-[1.6vw] text-muted text-center">&gt; 2 hrs</div>
              <div className="text-[1.6vw] text-text text-center font-medium">&lt; 30 min</div>
              <div className="text-[1.6vw] font-bold text-primary text-center">&lt; 15 min</div>
            </div>

            <div className="grid grid-cols-5 bg-white px-[1.5vw] py-[1.6vh] border-b border-text/8">
              <div className="col-span-2 text-[1.6vw] font-medium text-text">AI-Generated Test Cases</div>
              <div className="text-[1.6vw] text-muted text-center">&lt; 5%</div>
              <div className="text-[1.6vw] text-text text-center font-medium">40%+</div>
              <div className="text-[1.6vw] font-bold text-primary text-center">&gt; 70%</div>
            </div>

            <div className="grid grid-cols-5 bg-bg/60 px-[1.5vw] py-[1.6vh]">
              <div className="col-span-2 text-[1.6vw] font-medium text-text">Production Incident Rate</div>
              <div className="text-[1.6vw] text-muted text-center">Baseline</div>
              <div className="text-[1.6vw] text-text text-center font-medium">−20%</div>
              <div className="text-[1.6vw] font-bold text-primary text-center">−40%</div>
            </div>
          </div>

          <div className="mt-[2vh] text-[1.5vw] text-muted">
            Method: GenAI self-generating tests · AI defect prediction · Intelligent test selection · AIOps telemetry · IBM Consulting Advantage
          </div>
        </div>

        <div className="w-[22vw] flex flex-col gap-[2vh]">
          <div className="rounded-xl bg-navy p-[2.5vh_2vw] text-center">
            <div className="text-[8vw] font-bold text-primary leading-none">80%</div>
            <div className="text-[1.7vw] font-semibold text-white mt-[1vh]">Test Automation Coverage</div>
            <div className="text-[1.5vw] text-white opacity-60 mt-[0.5vh]">Target within 12 months of full deployment</div>
          </div>

          <div className="rounded-xl bg-white border border-text/10 p-[2vh_2vw]">
            <div className="text-[1.6vw] font-semibold text-text mb-[1.5vh]">AI-Augmented Dev Model</div>
            <div className="text-[1.5vw] text-muted leading-snug mb-[1.2vh]">GenAI accelerates code generation, review, and optimization</div>
            <div className="text-[1.5vw] text-muted leading-snug mb-[1.2vh]">DevSecOps — security embedded left into CI/CD pipelines</div>
            <div className="text-[1.5vw] text-muted leading-snug">BOB Framework — BUILD ONCE, BENEFIT reusable asset library</div>
          </div>
        </div>
      </div>
    </div>
  );
}
