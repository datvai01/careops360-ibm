export default function Slide14Q6Milestones() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: "linear-gradient(150deg, #000820 0%, #001141 60%, #001E5A 100%)" }}
    >
      <div className="absolute inset-0 flex flex-col" style={{ padding: "5.5vh 5vw 4.5vh" }}>
        <div className="mb-[0.8vh]">
          <div className="font-display font-semibold tracking-[0.2em] uppercase" style={{ fontSize: "2.1vw", color: "#4589FF" }}>
            Q6 · Transition Plan
          </div>
        </div>
        <div className="font-display font-bold text-text mb-[1.2vh]" style={{ fontSize: "4.5vw", lineHeight: 1.1 }}>
          Milestone Expectations
        </div>
        <div className="bg-primary mb-[3vh]" style={{ width: "5vw", height: "0.4vh" }} />

        <div className="flex gap-[1.8vw] flex-1">
          <div
            className="flex-1 flex flex-col"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.4vw",
              padding: "2.5vh 1.8vw",
            }}
          >
            <div className="font-display font-bold text-primary mb-[1.5vh]" style={{ fontSize: "3vw" }}>
              Day 30
            </div>
            <div className="bg-primary mb-[2vh]" style={{ width: "2vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.5vw" }}>
              AIOps pilot in production
            </div>
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.5vw" }}>
              Product model design done
            </div>
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.5vw" }}>
              SME roster confirmed
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.5vw" }}>
              CareOps360 live
            </div>
          </div>

          <div
            className="flex-1 flex flex-col"
            style={{
              background: "rgba(15, 98, 254, 0.1)",
              border: "1px solid rgba(15, 98, 254, 0.25)",
              borderRadius: "0.4vw",
              padding: "2.5vh 1.8vw",
            }}
          >
            <div className="font-display font-bold text-primary mb-[1.5vh]" style={{ fontSize: "3vw" }}>
              Day 60
            </div>
            <div className="bg-primary mb-[2vh]" style={{ width: "2vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.5vw" }}>
              2 pilot PODs operating
            </div>
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.5vw" }}>
              Sprint ceremonies active
            </div>
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.5vw" }}>
              AI governance in review
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.5vw" }}>
              Cohort 1 nominated
            </div>
          </div>

          <div
            className="flex-1 flex flex-col"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.4vw",
              padding: "2.5vh 1.8vw",
            }}
          >
            <div className="font-display font-bold text-primary mb-[1.5vh]" style={{ fontSize: "3vw" }}>
              Day 90
            </div>
            <div className="bg-primary mb-[2vh]" style={{ width: "2vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.5vw" }}>
              POD metrics baselined
            </div>
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.5vw" }}>
              PA AI discovery done
            </div>
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.5vw" }}>
              Data approvals tracked
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.5vw" }}>
              Capital ask prepared
            </div>
          </div>

          <div
            className="flex-1 flex flex-col"
            style={{
              background: "rgba(15, 98, 254, 0.07)",
              border: "1px solid rgba(15, 98, 254, 0.18)",
              borderRadius: "0.4vw",
              padding: "2.5vh 1.8vw",
            }}
          >
            <div className="font-display font-bold text-primary mb-[1.5vh]" style={{ fontSize: "3vw" }}>
              6 Months+
            </div>
            <div className="bg-primary mb-[2vh]" style={{ width: "2vw", height: "0.3vh" }} />
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.5vw" }}>
              Full POD model live
            </div>
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.5vw" }}>
              watsonx PA in UAT
            </div>
            <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.5vw" }}>
              Cohort 1 IBM-certified
            </div>
            <div className="font-body text-muted" style={{ fontSize: "2.5vw" }}>
              Benefits report published
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
