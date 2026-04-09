import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Scene13() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 6500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#050e2d]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)" }}
      transition={{ duration: 1.5 }}
    >
      <motion.div
        className="text-[8vw] font-black tracking-tighter leading-none mb-[2vh] flex"
        initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
        animate={phase >= 1 ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 0.8, filter: "blur(20px)" }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <span className="text-white">CareOps</span>
        <span className="text-[#0f62fe]">360</span>
      </motion.div>

      <motion.div
        className="flex items-center gap-[1.5vw] mb-[8vh]"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1 }}
      >
        <span className="text-[1.8vw] font-medium text-white/80">Horizon BCBS</span>
        <span className="text-[1.5vw] text-white/30">×</span>
        <span className="text-[1.8vw] font-bold text-[#0f62fe]">IBM</span>
      </motion.div>

      <motion.div
        className="text-[1.2vw] text-white/50 tracking-[0.2em] uppercase font-light"
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        careops360-ibm.com
      </motion.div>

      {/* Cinematic light sweep */}
      <motion.div 
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
        style={{
          background: "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
          backgroundSize: "200% 200%"
        }}
        initial={{ backgroundPosition: "200% 0%" }}
        animate={phase >= 1 ? { backgroundPosition: "-100% 100%" } : { backgroundPosition: "200% 0%" }}
        transition={{ duration: 3, ease: "easeInOut", delay: 1 }}
      />
    </motion.div>
  );
}
