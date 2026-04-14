export default function Slide11CapabilityUplift() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-navy font-display px-[7vw] py-[4.5vh]">

      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

      <div className="text-[1.5vw] font-semibold text-primary tracking-widest uppercase mb-[0.8vh]">
        Capability Uplift &amp; AI Readiness
      </div>
      <div className="text-[3.2vw] font-bold tracking-tight text-white leading-none mb-[0.8vh]">
        A Workforce Built for AI-First Delivery
      </div>
      <div className="text-[1.7vw] text-white opacity-55 mb-[3.5vh]">
        Certifications, automation coverage, and AI-readiness metrics — tracked live in CareOps360
      </div>

      <div className="grid grid-cols-4 gap-[2vw] mb-[2.5vh]">

        <div className="rounded-xl border border-primary/30 p-[2.5vh_2vw] text-center" style={{background:"rgba(15,98,254,0.15)"}}>
          <div className="text-[1.5vw] text-white opacity-60 uppercase tracking-widest mb-[0.5vh]">AI / ML &amp; Data Science</div>
          <div className="text-[6vw] font-bold text-primary leading-none">307</div>
          <div className="text-[1.5vw] text-white opacity-60 mt-[0.5vh]">Certified Professionals</div>
          <div className="text-[1.5vw] text-primary mt-[1vh]">Target: 390</div>
        </div>

        <div className="rounded-xl border border-white/10 p-[2.5vh_2vw] text-center" style={{background:"rgba(255,255,255,0.05)"}}>
          <div className="text-[1.5vw] text-white opacity-60 uppercase tracking-widest mb-[0.5vh]">Healthcare &amp; Payer</div>
          <div className="text-[6vw] font-bold text-white leading-none">342</div>
          <div className="text-[1.5vw] text-white opacity-60 mt-[0.5vh]">Certified Professionals</div>
          <div className="text-[1.5vw] text-primary mt-[1vh]">Target: 380</div>
        </div>

        <div className="rounded-xl border border-white/10 p-[2.5vh_2vw] text-center" style={{background:"rgba(255,255,255,0.05)"}}>
          <div className="text-[1.5vw] text-white opacity-60 uppercase tracking-widest mb-[0.5vh]">IBM Products</div>
          <div className="text-[6vw] font-bold text-white leading-none">338</div>
          <div className="text-[1.5vw] text-white opacity-60 mt-[0.5vh]">Certified Professionals</div>
          <div className="text-[1.5vw] text-primary mt-[1vh]">Target: 390</div>
        </div>

        <div className="rounded-xl border border-white/10 p-[2.5vh_2vw] text-center" style={{background:"rgba(255,255,255,0.05)"}}>
          <div className="text-[1.5vw] text-white opacity-60 uppercase tracking-widest mb-[0.5vh]">Cloud Platforms</div>
          <div className="text-[6vw] font-bold text-white leading-none">250</div>
          <div className="text-[1.5vw] text-white opacity-60 mt-[0.5vh]">Certified Professionals</div>
          <div className="text-[1.5vw] text-primary mt-[1vh]">Target: 300</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[2vw]">

        <div className="rounded-xl border border-white/10 p-[2vh_2vw]" style={{background:"rgba(255,255,255,0.05)"}}>
          <div className="flex justify-between items-start mb-[1.5vh]">
            <div>
              <div className="text-[1.5vw] text-white opacity-60 mb-[0.3vh]">Workforce AI-Enabled</div>
              <div className="text-[3vw] font-bold text-primary leading-none">78%</div>
            </div>
            <div className="text-[1.5vw] text-white opacity-40 text-right">Target<br/>Month 12</div>
          </div>
          <div className="w-full h-[0.8vh] rounded-full bg-white/10">
            <div className="h-full rounded-full bg-primary" style={{width:"78%"}} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 p-[2vh_2vw]" style={{background:"rgba(255,255,255,0.05)"}}>
          <div className="flex justify-between items-start mb-[1.5vh]">
            <div>
              <div className="text-[1.5vw] text-white opacity-60 mb-[0.3vh]">Automation Coverage</div>
              <div className="text-[3vw] font-bold text-primary leading-none">91%</div>
            </div>
            <div className="text-[1.5vw] text-white opacity-40 text-right">Target<br/>Month 12</div>
          </div>
          <div className="w-full h-[0.8vh] rounded-full bg-white/10">
            <div className="h-full rounded-full bg-primary" style={{width:"91%"}} />
          </div>
        </div>

        <div className="rounded-xl border border-primary/30 p-[2vh_2vw]" style={{background:"rgba(15,98,254,0.12)"}}>
          <div className="text-[1.5vw] text-white opacity-60 mb-[0.5vh]">Auto-Remediation Ready</div>
          <div className="text-[2.5vw] font-bold text-white leading-none">Month 6</div>
          <div className="text-[1.5vw] text-primary mt-[0.5vh]">Self-heal milestone achieved</div>
          <div className="text-[1.5vw] text-white opacity-50 mt-[0.5vh]">IBM people strategy: certify · automate · redeploy</div>
        </div>
      </div>
    </div>
  );
}
