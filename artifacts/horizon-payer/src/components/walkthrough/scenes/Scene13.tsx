import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export function Scene13() {
  const containerRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const partnerRef = useRef<HTMLDivElement>(null);
  const urlRef = useRef<HTMLDivElement>(null);
  const accentLineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        glowRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2, ease: "power1.inOut" }
      )
        .fromTo(
          brandRef.current,
          { y: 60, opacity: 0, filter: "blur(24px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2 },
          "-=1.2"
        )
        .fromTo(
          accentLineRef.current,
          { scaleX: 0, opacity: 0, transformOrigin: "center" },
          { scaleX: 1, opacity: 1, duration: 0.8, ease: "power2.inOut" },
          "-=0.3"
        )
        .fromTo(
          partnerRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 },
          "-=0.4"
        )
        .fromTo(
          urlRef.current,
          { y: 20, opacity: 0, letterSpacing: "0.5em" },
          { y: 0, opacity: 1, letterSpacing: "0.2em", duration: 1 },
          "-=0.3"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #020b22 0%, #050e2d 50%, #081540 100%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(12px)" }}
      transition={{ duration: 1.5 }}
    >
      {/* GSAP-animated ambient glow */}
      <div
        ref={glowRef}
        className="absolute w-[50vw] h-[50vw] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(15,98,254,0.2) 0%, transparent 70%)",
          filter: "blur(60px)",
          opacity: 0,
        }}
      />

      {/* GSAP-animated brand wordmark */}
      <div ref={brandRef} className="flex items-baseline gap-[0.5vw] mb-[1.5vh]" style={{ opacity: 0 }}>
        <span
          className="text-[7vw] font-black tracking-tighter leading-none text-white"
          style={{ fontFamily: "IBM Plex Sans, sans-serif" }}
        >
          CareOps
        </span>
        <span
          className="text-[7vw] font-black tracking-tighter leading-none"
          style={{ color: "#0f62fe", fontFamily: "IBM Plex Sans, sans-serif" }}
        >
          360
        </span>
      </div>

      {/* GSAP-animated accent divider */}
      <div
        ref={accentLineRef}
        className="w-[20vw] h-px mb-[3vh]"
        style={{
          background: "linear-gradient(90deg, transparent, #0f62fe, transparent)",
          opacity: 0,
          transform: "scaleX(0)",
        }}
      />

      {/* GSAP-animated partner lock-up */}
      <div ref={partnerRef} className="flex items-center gap-[2vw] mb-[6vh]" style={{ opacity: 0 }}>
        <span className="text-[1.8vw] font-semibold text-white/80">Horizon BCBS</span>
        <span className="text-[1.5vw] text-white/30">×</span>
        <span className="text-[1.8vw] font-bold" style={{ color: "#0f62fe" }}>IBM</span>
      </div>

      {/* GSAP-animated URL */}
      <div
        ref={urlRef}
        className="text-[1.1vw] text-white/40 uppercase font-light tracking-[0.2em]"
        style={{ opacity: 0 }}
      >
        careops360-ibm.com
      </div>

      {/* Framer Motion floating accent circles (ambient motion) */}
      <motion.div
        className="absolute top-[15%] left-[10%] w-[8vw] h-[8vw] rounded-full border border-[#0f62fe]/20 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[12%] w-[5vw] h-[5vw] rounded-full border border-white/10 pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-[60%] left-[5%] w-[2vw] h-[2vw] rounded-full pointer-events-none"
        style={{ background: "rgba(15,98,254,0.3)" }}
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
