export default function Slide15Close() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: "linear-gradient(150deg, #000820 0%, #001141 60%, #001E5A 100%)" }}
    >
      <div className="absolute left-0 top-0 bottom-0 bg-primary" style={{ width: "0.55vw" }} />
      <div className="absolute bottom-0 left-0 right-0 bg-primary" style={{ height: "0.4vh" }} />

      <div className="absolute inset-0 flex">
        <div className="flex flex-col justify-center" style={{ paddingLeft: "7vw", paddingRight: "4vw", width: "78vw" }}>
          <div
            className="font-display font-semibold tracking-[0.2em] uppercase mb-[4vh]"
            style={{ fontSize: "2.2vw", color: "#4589FF" }}
          >
            IBM Application Management Services
          </div>
          <div
            className="font-display font-bold leading-tight text-text mb-[2vh]"
            style={{ fontSize: "6vw" }}
          >
            Operational Excellence
          </div>
          <div
            className="font-display font-bold leading-tight mb-[5vh]"
            style={{ fontSize: "6vw", color: "#0F62FE" }}
          >
            Through AI
          </div>
          <div className="bg-primary mb-[4vh]" style={{ width: "6vw", height: "0.4vh" }} />
          <div className="font-body text-muted mb-[1.5vh]" style={{ fontSize: "2.8vw", lineHeight: 1.6 }}>
            IBM is committed to Horizon BCBS's transformation —
          </div>
          <div className="font-body text-muted mb-[4vh]" style={{ fontSize: "2.8vw", lineHeight: 1.6 }}>
            from stabilisation through to AI-first operations at scale.
          </div>
          <div className="font-body text-muted" style={{ fontSize: "2.5vw" }}>
            Next step: Schedule detailed workstream planning session
          </div>
          <div className="font-body font-semibold mt-[1.5vh]" style={{ fontSize: "2.5vw", color: "#4589FF" }}>
            IBM Delivery Management · Horizon AMS Team
          </div>
        </div>

        <div
          className="flex flex-col justify-center items-center"
          style={{
            width: "22vw",
            background: "rgba(15, 98, 254, 0.07)",
            borderLeft: "1px solid rgba(15, 98, 254, 0.25)",
            padding: "0 2vw",
          }}
        >
          <div className="font-display font-bold text-primary mb-[1vh]" style={{ fontSize: "3.5vw", textAlign: "center" }}>
            CareOps360
          </div>
          <div className="font-body text-muted mb-[3vh]" style={{ fontSize: "2.3vw", textAlign: "center", lineHeight: 1.5 }}>
            Executive operations portal — live now
          </div>
          <div className="bg-primary mb-[3vh]" style={{ width: "4vw", height: "0.3vh" }} />
          <div className="font-body text-muted mb-[1vh]" style={{ fontSize: "2.3vw", textAlign: "center" }}>
            exec@horizon.com
          </div>
          <div className="font-body text-muted mb-[1vh]" style={{ fontSize: "2.3vw", textAlign: "center" }}>
            ibm@horizon.com
          </div>
          <div className="font-body text-muted" style={{ fontSize: "2.3vw", textAlign: "center" }}>
            IBM@Horizon2027
          </div>
        </div>
      </div>
    </div>
  );
}
