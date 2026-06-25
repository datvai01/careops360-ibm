export default function Slide08Q3Journey() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: "linear-gradient(150deg, #000820 0%, #001141 60%, #001E5A 100%)" }}
    >
      <div className="absolute inset-0 flex flex-col" style={{ padding: "6vh 6vw 5vh" }}>
        <div className="mb-[1vh]">
          <div className="font-display font-semibold tracking-[0.2em] uppercase" style={{ fontSize: "2.1vw", color: "#4589FF" }}>
            Q3 · AI Adoption Journey
          </div>
        </div>
        <div className="font-display font-bold text-text mb-[1.5vh]" style={{ fontSize: "5vw", lineHeight: 1.1 }}>
          Three-Horizon Evolution
        </div>
        <div className="bg-primary mb-[3.5vh]" style={{ width: "5vw", height: "0.4vh" }} />

        <div className="flex gap-[2vw] flex-1">
          <div
            className="flex-1 flex flex-col"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw",
            }}
          >
            <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "2.3vw", color: "#8D9298", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Now – 12 Months
            </div>
            <div className="font-display font-bold text-primary mb-[2vh]" style={{ fontSize: "3.5vw" }}>
              Foundation
            </div>
            <div className="bg-primary mb-[2vh]" style={{ width: "2.5vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              AIOps noise reduction and IT stabilisation
            </div>
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              CareOps360 operational intelligence live
            </div>
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Copilot experiments with delivery teams
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Data readiness assessment and remediation
            </div>
          </div>

          <div
            className="flex-1 flex flex-col"
            style={{
              background: "rgba(15, 98, 254, 0.1)",
              border: "1px solid rgba(15, 98, 254, 0.25)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw",
            }}
          >
            <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "2.3vw", color: "#4589FF", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              12 – 24 Months
            </div>
            <div className="font-display font-bold text-primary mb-[2vh]" style={{ fontSize: "3.5vw" }}>
              Scale
            </div>
            <div className="bg-primary mb-[2vh]" style={{ width: "2.5vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              AI-driven prior auth auto-approval in production
            </div>
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              GenAI member engagement and self-service
            </div>
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Automated provider credentialing workflows
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Full product pod operating cadence established
            </div>
          </div>

          <div
            className="flex-1 flex flex-col"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw",
            }}
          >
            <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "2.3vw", color: "#8D9298", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              24 Months+
            </div>
            <div className="font-display font-bold text-primary mb-[2vh]" style={{ fontSize: "3.5vw" }}>
              Operate
            </div>
            <div className="bg-primary mb-[2vh]" style={{ width: "2.5vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Self-healing IT operations at scale
            </div>
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Predictive claims and actuarial analytics
            </div>
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              AI as the default delivery mode across all pods
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Horizon recognised as an AI-first payer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
