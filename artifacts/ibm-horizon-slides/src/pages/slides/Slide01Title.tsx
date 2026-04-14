export default function Slide01Title() {
  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col justify-center px-[8vw] bg-navy font-display">

      <div className="absolute top-0 right-0 w-[35vw] h-full bg-navy2 opacity-60" />
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
      <div className="absolute right-[34.5vw] top-0 bottom-0 w-[2px] bg-primary opacity-40" />

      <div className="absolute top-[5vh] left-[8vw] text-[1.5vw] font-medium tracking-[0.2em] uppercase text-white opacity-50">
        IBM Consulting · Healthcare &amp; Payer Delivery — AMS Practice
      </div>

      <div className="relative z-10">
        <div className="text-[1.6vw] font-semibold text-primary tracking-[0.15em] uppercase mb-[2.5vh]">
          IBM × Horizon Blue Cross Blue Shield of New Jersey
        </div>

        <div className="text-[8.5vw] font-bold leading-none tracking-tighter text-white mb-[1.5vh]">
          AI-FIRST
        </div>

        <div className="text-[3vw] font-semibold leading-tight text-white mb-[1.5vh]">
          Transforming Horizon BCBS
        </div>

        <div className="text-[2vw] font-light text-white opacity-60 mb-[5vh]">
          Into a Predictive, Self-Healing, AI-Driven Enterprise
        </div>

        <div className="w-[6vw] h-[3px] bg-primary mb-[4vh]" />

        <div className="flex items-center gap-[3vw] text-[1.5vw] text-white opacity-55">
          <span>Submitted: April 2026</span>
          <span className="text-primary">·</span>
          <span>Ref: IBM-HZN-AMS-RFP-2026-CAS</span>
          <span className="text-primary">·</span>
          <span>CONFIDENTIAL</span>
        </div>
      </div>

      <div className="absolute bottom-[4vh] left-[8vw] right-[8vw] flex justify-between items-center">
        <div className="text-[1.5vw] text-white opacity-35">
          Powered by IBM AIOps · IBM Consulting Advantage · HIPAA Compliant
        </div>
        <div className="text-[1.5vw] text-white opacity-35">
          © 2026 IBM Corporation
        </div>
      </div>
    </div>
  );
}
