export default function Slide12Q5Priorities() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: "linear-gradient(150deg, #000820 0%, #001141 60%, #001E5A 100%)" }}
    >
      <div className="absolute inset-0 flex flex-col" style={{ padding: "6vh 6vw 5vh" }}>
        <div className="mb-[1vh]">
          <div className="font-display font-semibold tracking-[0.2em] uppercase" style={{ fontSize: "2.1vw", color: "#4589FF" }}>
            Q5 · Transformation Priorities
          </div>
        </div>
        <div className="font-display font-bold text-text mb-[1.5vh]" style={{ fontSize: "5vw", lineHeight: 1.1 }}>
          Sequenced Priority Model
        </div>
        <div className="bg-primary mb-[3.5vh]" style={{ width: "5vw", height: "0.4vh" }} />

        <div className="flex gap-[2vw] flex-1 items-stretch">
          <div
            className="flex-1 flex flex-col"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.4vw",
              padding: "3vh 2.5vw",
            }}
          >
            <div className="font-display font-bold text-primary mb-[1vh]" style={{ fontSize: "4.5vw" }}>
              01
            </div>
            <div className="font-display font-bold text-text mb-[1.5vh]" style={{ fontSize: "3.2vw" }}>
              AIOps &amp; Operational Visibility
            </div>
            <div className="bg-primary mb-[2vh]" style={{ width: "2.5vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Start immediately — lowest disruption, fastest ROI
            </div>
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Reduces IT noise and incident volume
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Generates telemetry data that trains future AI models
            </div>
            <div
              className="font-body font-semibold mt-auto pt-[2vh]"
              style={{ fontSize: "2.4vw", color: "#4589FF", borderTop: "1px solid rgba(15,98,254,0.2)" }}
            >
              Seeds: data foundation for AI
            </div>
          </div>

          <div
            className="flex items-center justify-center"
            style={{ width: "4vw", color: "#0F62FE", fontSize: "4vw", fontWeight: 700 }}
          >
            →
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
            <div className="font-display font-bold text-primary mb-[1vh]" style={{ fontSize: "4.5vw" }}>
              02
            </div>
            <div className="font-display font-bold text-text mb-[1.5vh]" style={{ fontSize: "3.2vw" }}>
              POD Operating Model Foundation
            </div>
            <div className="bg-primary mb-[2vh]" style={{ width: "2.5vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Start at Month 2 — restructures delivery around products
            </div>
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Creates persistent teams capable of AI iteration
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Pilot 2 domains before full rollout
            </div>
            <div
              className="font-body font-semibold mt-auto pt-[2vh]"
              style={{ fontSize: "2.4vw", color: "#4589FF", borderTop: "1px solid rgba(15,98,254,0.2)" }}
            >
              Seeds: delivery structure for AI use cases
            </div>
          </div>

          <div
            className="flex items-center justify-center"
            style={{ width: "4vw", color: "#0F62FE", fontSize: "4vw", fontWeight: 700 }}
          >
            →
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
            <div className="font-display font-bold text-primary mb-[1vh]" style={{ fontSize: "4.5vw" }}>
              03
            </div>
            <div className="font-display font-bold text-text mb-[1.5vh]" style={{ fontSize: "3.2vw" }}>
              AI Use Cases: PA &amp; Member
            </div>
            <div className="bg-primary mb-[2vh]" style={{ width: "2.5vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Start at Month 4 — requires Priorities 1 and 2 as prerequisites
            </div>
            <div className="font-body text-muted mb-[1.2vh]" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Highest business value and measurable outcomes
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.7vw", lineHeight: 1.6 }}>
              Watsonx PA auto-approval and GenAI member engagement
            </div>
            <div
              className="font-body font-semibold mt-auto pt-[2vh]"
              style={{ fontSize: "2.4vw", color: "#4589FF", borderTop: "1px solid rgba(15,98,254,0.2)" }}
            >
              Delivers: business value and transformation proof
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
