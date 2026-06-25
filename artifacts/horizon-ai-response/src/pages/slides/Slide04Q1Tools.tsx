export default function Slide04Q1Tools() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: "linear-gradient(150deg, #000820 0%, #001141 60%, #001E5A 100%)" }}
    >
      <div className="absolute inset-0 flex flex-col" style={{ padding: "6vh 6vw 5vh" }}>
        <div className="mb-[1vh]">
          <div className="font-display font-semibold tracking-[0.2em] uppercase" style={{ fontSize: "2.1vw", color: "#4589FF" }}>
            Q1 · AI Productivity
          </div>
        </div>
        <div className="font-display font-bold text-text mb-[1.5vh]" style={{ fontSize: "5vw", lineHeight: 1.1 }}>
          Proposed AI Tool Stack
        </div>
        <div className="bg-primary mb-[3.5vh]" style={{ width: "5vw", height: "0.4vh" }} />

        <div className="grid grid-cols-3 gap-[2vw] flex-1">
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw",
            }}
          >
            <div className="font-display font-bold text-primary mb-[1.5vh]" style={{ fontSize: "3vw" }}>
              IBM watsonx.ai
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Foundation model platform for operational intelligence, PA insights, and member analytics
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw",
            }}
          >
            <div className="font-display font-bold text-primary mb-[1.5vh]" style={{ fontSize: "3vw" }}>
              watsonx Code Assistant
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              AI pair-programming for delivery pods — accelerates feature development and code quality
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw",
            }}
          >
            <div className="font-display font-bold text-primary mb-[1.5vh]" style={{ fontSize: "3vw" }}>
              watsonx Orchestrate
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Workflow automation for payer operations — claims, enrollment, billing, and PA routing
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw",
            }}
          >
            <div className="font-display font-bold text-primary mb-[1.5vh]" style={{ fontSize: "3vw" }}>
              IBM AIOps
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Instana + Turbonomic: application performance monitoring, incident correlation, and capacity optimisation
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw",
            }}
          >
            <div className="font-display font-bold text-primary mb-[1.5vh]" style={{ fontSize: "3vw" }}>
              IBM Process Mining
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Discovers real payer process flows from event logs — pinpoints automation and redesign opportunities
            </div>
          </div>

          <div
            style={{
              background: "rgba(15, 98, 254, 0.12)",
              border: "1px solid rgba(15, 98, 254, 0.35)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw",
            }}
          >
            <div className="font-display font-bold text-primary mb-[1.5vh]" style={{ fontSize: "3vw" }}>
              CareOps360
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              IBM-built executive command center for Horizon leadership — real-time operational intelligence across all domains
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
