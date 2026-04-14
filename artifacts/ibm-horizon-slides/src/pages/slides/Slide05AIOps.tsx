export default function Slide05AIOps() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg font-display px-[7vw] py-[5vh]">

      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

      <div className="text-[1.5vw] font-semibold text-primary tracking-widest uppercase mb-[1vh]">
        AIOps &amp; Agentic AI Operations
      </div>
      <div className="text-[3.5vw] font-bold tracking-tight text-text leading-none mb-[0.8vh]">
        From Reactive to Autonomous Operations
      </div>
      <div className="text-[1.7vw] text-muted mb-[3vh]">
        Multi-agent AI architecture — detection through resolution and continuous learning
      </div>

      <div className="flex gap-[4vw] h-[65vh]">

        <div className="flex-1 flex flex-col gap-[1.5vh]">
          <div className="text-[1.5vw] font-semibold text-muted uppercase tracking-widest mb-[0.5vh]">
            Agent Architecture — Six Specialist Roles
          </div>

          <div className="flex items-start gap-[1.5vw] p-[1.8vh_1.5vw] rounded-lg bg-white border border-text/8 shadow-sm">
            <div className="w-[3vw] h-[3vw] rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <div className="w-[1.4vw] h-[1.4vw] bg-white rounded-sm" />
            </div>
            <div>
              <div className="text-[1.6vw] font-semibold text-text">Help Desk Agent</div>
              <div className="text-[1.5vw] text-muted">Context-aware guidance — auto-resolves issues before ticket creation</div>
            </div>
          </div>

          <div className="flex items-start gap-[1.5vw] p-[1.8vh_1.5vw] rounded-lg bg-white border border-text/8 shadow-sm">
            <div className="w-[3vw] h-[3vw] rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <div className="w-[1.4vw] h-[1.4vw] bg-white rounded-sm" />
            </div>
            <div>
              <div className="text-[1.6vw] font-semibold text-text">Triage Agent</div>
              <div className="text-[1.5vw] text-muted">Prioritises tickets by impact and urgency — eliminates manual queue management</div>
            </div>
          </div>

          <div className="flex items-start gap-[1.5vw] p-[1.8vh_1.5vw] rounded-lg bg-white border border-text/8 shadow-sm">
            <div className="w-[3vw] h-[3vw] rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <div className="w-[1.4vw] h-[1.4vw] bg-white rounded-sm" />
            </div>
            <div>
              <div className="text-[1.6vw] font-semibold text-text">Root Cause Analysis Agent</div>
              <div className="text-[1.5vw] text-muted">Correlates signals across 140+ monitoring sources — root cause in minutes</div>
            </div>
          </div>

          <div className="flex items-start gap-[1.5vw] p-[1.8vh_1.5vw] rounded-lg bg-white border border-text/8 shadow-sm">
            <div className="w-[3vw] h-[3vw] rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <div className="w-[1.4vw] h-[1.4vw] bg-white rounded-sm" />
            </div>
            <div>
              <div className="text-[1.6vw] font-semibold text-text">Resolution Agent</div>
              <div className="text-[1.5vw] text-muted">Executes remediation from runbooks and historical resolutions</div>
            </div>
          </div>

          <div className="flex items-start gap-[1.5vw] p-[1.8vh_1.5vw] rounded-lg bg-white border border-text/8 shadow-sm">
            <div className="w-[3vw] h-[3vw] rounded-lg bg-navy flex items-center justify-center flex-shrink-0">
              <div className="w-[1.4vw] h-[1.4vw] bg-primary rounded-sm" />
            </div>
            <div>
              <div className="text-[1.6vw] font-semibold text-text">Runbook Generation Agent</div>
              <div className="text-[1.5vw] text-muted">Auto-generates runbooks from resolved incidents — compounding knowledge</div>
            </div>
          </div>

          <div className="flex items-start gap-[1.5vw] p-[1.8vh_1.5vw] rounded-lg bg-white border border-text/8 shadow-sm">
            <div className="w-[3vw] h-[3vw] rounded-lg bg-navy flex items-center justify-center flex-shrink-0">
              <div className="w-[1.4vw] h-[1.4vw] bg-primary rounded-sm" />
            </div>
            <div>
              <div className="text-[1.6vw] font-semibold text-text">Continuous Learning Agent</div>
              <div className="text-[1.5vw] text-muted">Feeds production telemetry back — every incident improves all agents</div>
            </div>
          </div>
        </div>

        <div className="w-[30vw] flex flex-col">
          <div className="text-[1.5vw] font-semibold text-muted uppercase tracking-widest mb-[1.5vh]">
            Value Realization with AIOps
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-text/10">
            <div className="bg-navy px-[1.5vw] py-[1.5vh]">
              <div className="text-[1.6vw] font-semibold text-white">Metric</div>
            </div>

            <div className="grid grid-cols-2 bg-white px-[1.5vw] py-[1.5vh] border-b border-text/8">
              <div className="text-[1.5vw] text-text">MTTR</div>
              <div className="text-[1.5vw] font-bold text-primary">&lt; 1.8 hrs</div>
            </div>
            <div className="grid grid-cols-2 bg-bg/60 px-[1.5vw] py-[1.5vh] border-b border-text/8">
              <div className="text-[1.5vw] text-text">Alert Noise / Shift</div>
              <div className="text-[1.5vw] font-bold text-primary">&gt; 60% Reduced</div>
            </div>
            <div className="grid grid-cols-2 bg-white px-[1.5vw] py-[1.5vh] border-b border-text/8">
              <div className="text-[1.5vw] text-text">P3/P4 Auto-Resolution</div>
              <div className="text-[1.5vw] font-bold text-primary">&gt; 74%</div>
            </div>
            <div className="grid grid-cols-2 bg-bg/60 px-[1.5vw] py-[1.5vh] border-b border-text/8">
              <div className="text-[1.5vw] text-text">Change Failure Rate</div>
              <div className="text-[1.5vw] font-bold text-primary">40% Reduction</div>
            </div>
            <div className="grid grid-cols-2 bg-white px-[1.5vw] py-[1.5vh]">
              <div className="text-[1.5vw] text-text">System Availability</div>
              <div className="text-[1.5vw] font-bold text-primary">99.95%</div>
            </div>
          </div>

          <div className="mt-[2vh] rounded-xl bg-navy p-[2vh_1.5vw]">
            <div className="text-[1.5vw] font-semibold text-primary mb-[1vh]">Approved by Horizon</div>
            <div className="text-[1.5vw] text-white opacity-70">Architecture Review Board (ARB)</div>
            <div className="text-[1.5vw] text-white opacity-70">GenAI Governance Board</div>
          </div>

          <div className="mt-[1.5vh] rounded-xl bg-bg border border-text/10 p-[1.5vh_1.5vw]">
            <div className="text-[1.5vw] font-semibold text-text mb-[0.5vh]">Built for Horizon's AWS Stack</div>
            <div className="text-[1.4vw] text-muted">AWS Bedrock · AgentCore · ServiceNow · Dynatrace · CloudWatch · OpenShift</div>
          </div>
        </div>
      </div>
    </div>
  );
}
