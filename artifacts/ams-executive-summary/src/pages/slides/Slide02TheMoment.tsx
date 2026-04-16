export default function Slide02TheMoment() {
  return (
    <div className="w-screen h-screen overflow-hidden relative font-display px-[7vw] py-[5vh]" style={{ background: "#f2f4f8" }}>

      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "#0f62fe" }} />
      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: "#161616", opacity: 0.08 }} />

      <div className="font-semibold tracking-widest uppercase mb-[0.8vh]" style={{ fontSize: "1.4vw", color: "#0f62fe" }}>
        1.0 Executive Summary
      </div>
      <div className="font-bold tracking-tight leading-none mb-[0.5vh]" style={{ fontSize: "3.4vw", color: "#161616" }}>
        The Moment &amp; The Proposal
      </div>
      <div className="mb-[3vh]" style={{ fontSize: "1.6vw", color: "#525252" }}>
        Why now — and what IBM commits to deliver
      </div>

      <div className="flex gap-[4vw]" style={{ height: "71vh" }}>

        <div className="flex-1 flex flex-col gap-[2vh]">
          <div className="font-semibold tracking-widest uppercase mb-[0.5vh]" style={{ fontSize: "1.2vw", color: "#525252" }}>
            The Context
          </div>

          <div className="rounded-lg p-[1.8vh_2vw] flex items-start gap-[1.5vw]" style={{ background: "#ffffff", borderLeft: "4px solid #0f62fe" }}>
            <div className="font-black leading-none mt-[0.3vh]" style={{ fontSize: "2.2vw", color: "#0f62fe" }}>500</div>
            <div>
              <div className="font-semibold leading-tight" style={{ fontSize: "1.6vw", color: "#161616" }}>Applications in Scope</div>
              <div className="leading-snug" style={{ fontSize: "1.4vw", color: "#525252" }}>Spanning enrollment, claims, member services, provider ops, and data platforms</div>
            </div>
          </div>

          <div className="rounded-lg p-[1.8vh_2vw] flex items-start gap-[1.5vw]" style={{ background: "#ffffff", borderLeft: "4px solid #0043ce" }}>
            <div className="font-black leading-none mt-[0.3vh]" style={{ fontSize: "2.2vw", color: "#0043ce" }}>↑</div>
            <div>
              <div className="font-semibold leading-tight" style={{ fontSize: "1.6vw", color: "#161616" }}>Rising Operational Load</div>
              <div className="leading-snug" style={{ fontSize: "1.4vw", color: "#525252" }}>Fragmented tower delivery and manual processes increase cost and slow modernization</div>
            </div>
          </div>

          <div className="rounded-lg p-[1.8vh_2vw] flex items-start gap-[1.5vw]" style={{ background: "#ffffff", borderLeft: "4px solid #525252" }}>
            <div className="font-black leading-none mt-[0.3vh]" style={{ fontSize: "2.2vw", color: "#525252" }}>!</div>
            <div>
              <div className="font-semibold leading-tight" style={{ fontSize: "1.6vw", color: "#161616" }}>Structural Change Required</div>
              <div className="leading-snug" style={{ fontSize: "1.4vw", color: "#525252" }}>An AI-first, product-oriented operating model is required to deliver structural cost takeout</div>
            </div>
          </div>

          <div className="rounded-lg p-[1.8vh_2vw] flex items-start gap-[1.5vw]" style={{ background: "#ffffff", borderLeft: "4px solid #0f62fe" }}>
            <div className="font-black leading-none mt-[0.3vh]" style={{ fontSize: "2.2vw", color: "#0f62fe" }}>+</div>
            <div>
              <div className="font-semibold leading-tight" style={{ fontSize: "1.6vw", color: "#161616" }}>Member &amp; Provider Experience</div>
              <div className="leading-snug" style={{ fontSize: "1.4vw", color: "#525252" }}>Technology improvements must translate directly into enterprise-wide business impact</div>
            </div>
          </div>
        </div>

        <div className="w-[34vw] rounded-xl flex flex-col p-[3vh_2.5vw]" style={{ background: "#001141" }}>
          <div className="font-semibold tracking-widest uppercase mb-[2vh]" style={{ fontSize: "1.2vw", color: "#0f62fe" }}>
            What IBM Proposes
          </div>

          <div className="flex-1 flex flex-col gap-[2.2vh]">
            <div className="flex items-start gap-[1.5vw]">
              <div className="flex-shrink-0 rounded-full flex items-center justify-center font-bold" style={{ width: "4vh", height: "4vh", background: "#0f62fe", fontSize: "1.5vw", color: "#ffffff" }}>1</div>
              <div>
                <div className="font-semibold text-white leading-tight" style={{ fontSize: "1.6vw" }}>Predictive, Self-Healing Operations</div>
                <div className="font-light leading-snug" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.6)" }}>Transition from reactive support using IBM AIOps and Intelligent Cloud Automation</div>
              </div>
            </div>
            <div className="flex items-start gap-[1.5vw]">
              <div className="flex-shrink-0 rounded-full flex items-center justify-center font-bold" style={{ width: "4vh", height: "4vh", background: "#0f62fe", fontSize: "1.5vw", color: "#ffffff" }}>2</div>
              <div>
                <div className="font-semibold text-white leading-tight" style={{ fontSize: "1.6vw" }}>Integrated AMS · QE · Data Services</div>
                <div className="font-light leading-snug" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.6)" }}>Product-aligned pods with end-to-end ownership reducing handoffs and accelerating delivery</div>
              </div>
            </div>
            <div className="flex items-start gap-[1.5vw]">
              <div className="flex-shrink-0 rounded-full flex items-center justify-center font-bold" style={{ width: "4vh", height: "4vh", background: "#0f62fe", fontSize: "1.5vw", color: "#ffffff" }}>3</div>
              <div>
                <div className="font-semibold text-white leading-tight" style={{ fontSize: "1.6vw" }}>Continuous Innovation Embedded</div>
                <div className="font-light leading-snug" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.6)" }}>Modernization within steady-state through a governed value pipeline, not separate projects</div>
              </div>
            </div>
          </div>

          <div className="mt-[2vh] pt-[2vh]" style={{ borderTop: "1px solid rgba(15,98,254,0.3)" }}>
            <div className="font-medium" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.5)" }}>
              Platform assets include CareOps360, IBM AIOps, IBM Consulting Advantage, ICA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
