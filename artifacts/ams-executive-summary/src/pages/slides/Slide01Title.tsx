export default function Slide01Title() {
  return (
    <div className="w-screen h-screen overflow-hidden relative font-display" style={{ background: "#001141" }}>

      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "#0f62fe" }} />

      <div className="absolute top-0 right-0 w-[42vw] h-full opacity-30"
        style={{ background: "linear-gradient(135deg, #001d6c 0%, #0043ce 100%)" }} />
      <div className="absolute top-0 right-0 w-[42vw] h-full"
        style={{ background: "linear-gradient(to left, rgba(15,98,254,0.08), transparent)" }} />

      <div className="absolute" style={{ top: "22vh", right: "5vw", width: "30vw", height: "30vw", borderRadius: "50%",
        border: "1px solid rgba(15,98,254,0.15)", opacity: 0.5 }} />
      <div className="absolute" style={{ top: "32vh", right: "12vw", width: "18vw", height: "18vw", borderRadius: "50%",
        border: "1px solid rgba(15,98,254,0.25)", opacity: 0.4 }} />
      <div className="absolute" style={{ bottom: "-5vh", right: "-3vw", width: "22vw", height: "22vw", borderRadius: "50%",
        border: "1px solid rgba(15,98,254,0.12)", opacity: 0.35 }} />

      <div className="absolute right-[42vw] top-0 bottom-0 w-[1px]" style={{ background: "rgba(15,98,254,0.25)" }} />

      <div className="absolute" style={{ top: "5vh", left: "7vw" }}>
        <div className="text-white font-medium tracking-[0.2em] uppercase" style={{ fontSize: "1.4vw", opacity: 0.45 }}>
          IBM Consulting · Healthcare &amp; Payer Delivery — AMS Practice
        </div>
      </div>

      <div className="absolute flex flex-col justify-center" style={{ top: 0, bottom: 0, left: "7vw", right: "45vw" }}>

        <div className="font-semibold tracking-[0.15em] uppercase mb-[2.5vh]" style={{ fontSize: "1.5vw", color: "#0f62fe" }}>
          IBM × Horizon Blue Cross Blue Shield of New Jersey
        </div>

        <div className="font-bold leading-none tracking-tighter text-white mb-[1.5vh]" style={{ fontSize: "6.5vw" }}>
          AMS
        </div>
        <div className="font-bold leading-none tracking-tighter text-white mb-[1vh]" style={{ fontSize: "3.8vw" }}>
          Transformation
        </div>
        <div className="font-light text-white mb-[5vh]" style={{ fontSize: "2.2vw", opacity: 0.65 }}>
          Executive Summary
        </div>

        <div className="mb-[4vh]" style={{ width: "5vw", height: "3px", background: "#0f62fe" }} />

        <div className="flex items-center gap-[2.5vw] text-white" style={{ fontSize: "1.4vw", opacity: 0.5 }}>
          <span>April 2026</span>
          <span style={{ color: "#0f62fe" }}>·</span>
          <span>IBM Consulting</span>
          <span style={{ color: "#0f62fe" }}>·</span>
          <span>CONFIDENTIAL</span>
        </div>
      </div>

      <div className="absolute flex flex-col justify-center" style={{ top: "15vh", right: "5vw", width: "34vw" }}>
        <div className="text-white font-light leading-relaxed" style={{ fontSize: "1.6vw", opacity: 0.55 }}>
          "IBM is not proposing a technology project — IBM is proposing a transformation partnership that embeds AI-driven intelligence into the operating model of Horizon."
        </div>
        <div className="mt-[2vh] font-medium" style={{ fontSize: "1.3vw", color: "#0f62fe" }}>
          — IBM Consulting, April 2026
        </div>
      </div>

      <div className="absolute flex justify-between items-center text-white" style={{ bottom: "4vh", left: "7vw", right: "7vw", fontSize: "1.3vw", opacity: 0.3 }}>
        <span>Powered by IBM AIOps · IBM Consulting Advantage · CareOps360</span>
        <span>© 2026 IBM Corporation</span>
      </div>
    </div>
  );
}
