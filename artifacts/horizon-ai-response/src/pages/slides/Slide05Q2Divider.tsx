export default function Slide05Q2Divider() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ background: "linear-gradient(150deg, #000820 0%, #001141 60%, #001E5A 100%)" }}
    >
      <div className="absolute left-0 top-0 bottom-0 bg-primary" style={{ width: "0.8vw" }} />

      <div
        className="absolute font-display font-bold leading-none select-none"
        style={{
          fontSize: "35vw",
          color: "rgba(15, 98, 254, 0.06)",
          bottom: "-8vh",
          right: "-3vw",
          lineHeight: 1,
        }}
      >
        02
      </div>

      <div className="absolute inset-0 flex flex-col justify-center" style={{ paddingLeft: "8vw", paddingRight: "12vw" }}>
        <div
          className="font-display font-semibold tracking-[0.25em] uppercase mb-[4vh]"
          style={{ fontSize: "2.2vw", color: "#4589FF" }}
        >
          Question 2 of 6
        </div>
        <div className="font-display font-bold leading-tight text-text mb-[2vh]" style={{ fontSize: "6.5vw" }}>
          Team Structure in a
        </div>
        <div className="font-display font-bold leading-tight mb-[5vh]" style={{ fontSize: "6.5vw", color: "#0F62FE" }}>
          Project-Funded Model
        </div>
        <div className="bg-primary mb-[4vh]" style={{ width: "5vw", height: "0.4vh" }} />
        <div className="font-body text-muted" style={{ fontSize: "3vw", lineHeight: "1.6" }}>
          How would IBM structure the delivery teams given that
        </div>
        <div className="font-body text-muted" style={{ fontSize: "3vw" }}>
          Horizon is funded by projects, not product lines?
        </div>
      </div>
    </div>
  );
}
