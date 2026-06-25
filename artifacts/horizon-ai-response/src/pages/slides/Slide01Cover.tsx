export default function Slide01Cover() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: "linear-gradient(150deg, #000820 0%, #001141 60%, #001E5A 100%)" }}
    >
      <div className="absolute left-0 top-0 bottom-0 bg-primary" style={{ width: "0.55vw" }} />

      <div className="absolute top-[6vh] left-[7vw] right-[7vw] flex items-center justify-between">
        <div
          className="font-display font-semibold tracking-[0.2em] uppercase"
          style={{ fontSize: "2.1vw", color: "#4589FF" }}
        >
          IBM Application Management Services
        </div>
        <div className="font-body font-normal" style={{ fontSize: "2.1vw", color: "#697077", letterSpacing: "0.1em" }}>
          CONFIDENTIAL · JUNE 2026
        </div>
      </div>

      <div className="absolute inset-0 flex" style={{ paddingTop: "0" }}>
        <div className="flex flex-col justify-center" style={{ paddingLeft: "7vw", paddingRight: "4vw", width: "78vw" }}>
          <div
            className="font-display font-semibold mb-[3vh]"
            style={{ fontSize: "2.8vw", color: "#4589FF", letterSpacing: "0.04em" }}
          >
            Horizon Blue Cross Blue Shield
          </div>
          <div
            className="font-display font-bold leading-none tracking-tight text-text mb-[1vh]"
            style={{ fontSize: "7.5vw" }}
          >
            AI Transformation
          </div>
          <div
            className="font-display font-bold leading-none tracking-tight mb-[4.5vh]"
            style={{ fontSize: "7.5vw", color: "#0F62FE" }}
          >
            Response
          </div>
          <div className="bg-primary mb-[4vh]" style={{ width: "6vw", height: "0.4vh" }} />
          <div className="font-body text-muted" style={{ fontSize: "2.8vw", lineHeight: "1.6" }}>
            IBM's responses to 6 leadership questions on AI,
          </div>
          <div className="font-body text-muted" style={{ fontSize: "2.8vw" }}>
            team structure, and transformation planning
          </div>
        </div>

        <div
          className="flex flex-col justify-center items-center"
          style={{
            width: "22vw",
            background: "rgba(15, 98, 254, 0.07)",
            borderLeft: "1px solid rgba(15, 98, 254, 0.25)",
          }}
        >
          <div className="font-display font-bold leading-none text-primary" style={{ fontSize: "11vw" }}>
            6
          </div>
          <div className="font-display font-semibold mt-[1vh]" style={{ fontSize: "2.6vw", color: "#4589FF" }}>
            Questions
          </div>
          <div className="font-body text-muted mt-[2vh]" style={{ fontSize: "2.2vw" }}>
            Addressed
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-primary" style={{ height: "0.4vh" }} />
    </div>
  );
}
