export default function Slide03Q1Pillars() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: "linear-gradient(150deg, #000820 0%, #001141 60%, #001E5A 100%)" }}
    >
      <div className="absolute inset-0 flex flex-col" style={{ padding: "5.5vh 6vw 5vh" }}>
        <div className="mb-[0.8vh]">
          <div className="font-display font-semibold tracking-[0.2em] uppercase" style={{ fontSize: "2.1vw", color: "#4589FF" }}>
            Q1 · AI Productivity
          </div>
        </div>
        <div className="font-display font-bold text-text mb-[1.2vh]" style={{ fontSize: "5vw", lineHeight: 1.1 }}>
          How AI Drives Productivity
        </div>
        <div className="bg-primary mb-[3vh]" style={{ width: "5vw", height: "0.4vh" }} />

        <div className="flex gap-[2.5vw] flex-1">
          <div
            className="flex-1 flex flex-col"
            style={{
              background: "rgba(15, 98, 254, 0.08)",
              border: "1px solid rgba(15, 98, 254, 0.2)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw 2.5vh",
            }}
          >
            <div className="font-display font-bold text-primary mb-[2vh]" style={{ fontSize: "4vw" }}>
              Automate
            </div>
            <div className="bg-primary mb-[2.5vh]" style={{ width: "3vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[2vh]" style={{ fontSize: "2.8vw" }}>
              Claims triage and routing
            </div>
            <div className="font-body text-muted mb-[2vh]" style={{ fontSize: "2.8vw" }}>
              PA pre-screening
            </div>
            <div className="font-body text-muted mb-[2vh]" style={{ fontSize: "2.8vw" }}>
              Enrollment sync workflows
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.8vw" }}>
              Billing exception escalation
            </div>
            <div
              className="font-display font-semibold mt-auto pt-[2vh]"
              style={{ fontSize: "2.4vw", color: "#4589FF", borderTop: "1px solid rgba(15,98,254,0.2)" }}
            >
              watsonx Orchestrate
            </div>
          </div>

          <div
            className="flex-1 flex flex-col"
            style={{
              background: "rgba(15, 98, 254, 0.08)",
              border: "1px solid rgba(15, 98, 254, 0.2)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw 2.5vh",
            }}
          >
            <div className="font-display font-bold text-primary mb-[2vh]" style={{ fontSize: "4vw" }}>
              Augment
            </div>
            <div className="bg-primary mb-[2.5vh]" style={{ width: "3vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[2vh]" style={{ fontSize: "2.8vw" }}>
              PA clinical decision support
            </div>
            <div className="font-body text-muted mb-[2vh]" style={{ fontSize: "2.8vw" }}>
              Claims anomaly detection
            </div>
            <div className="font-body text-muted mb-[2vh]" style={{ fontSize: "2.8vw" }}>
              Operations intelligence
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.8vw" }}>
              Credentialing insights
            </div>
            <div
              className="font-display font-semibold mt-auto pt-[2vh]"
              style={{ fontSize: "2.4vw", color: "#4589FF", borderTop: "1px solid rgba(15,98,254,0.2)" }}
            >
              IBM watsonx.ai
            </div>
          </div>

          <div
            className="flex-1 flex flex-col"
            style={{
              background: "rgba(15, 98, 254, 0.08)",
              border: "1px solid rgba(15, 98, 254, 0.2)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw 2.5vh",
            }}
          >
            <div className="font-display font-bold text-primary mb-[2vh]" style={{ fontSize: "4vw" }}>
              Accelerate
            </div>
            <div className="bg-primary mb-[2.5vh]" style={{ width: "3vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[2vh]" style={{ fontSize: "2.8vw" }}>
              AI code generation and review
            </div>
            <div className="font-body text-muted mb-[2vh]" style={{ fontSize: "2.8vw" }}>
              Automated test pipelines
            </div>
            <div className="font-body text-muted mb-[2vh]" style={{ fontSize: "2.8vw" }}>
              Pod sprint velocity
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.8vw" }}>
              Infrastructure-as-code
            </div>
            <div
              className="font-display font-semibold mt-auto pt-[2vh]"
              style={{ fontSize: "2.4vw", color: "#4589FF", borderTop: "1px solid rgba(15,98,254,0.2)" }}
            >
              watsonx Code Assistant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
