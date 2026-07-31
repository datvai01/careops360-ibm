import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Scene0() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1400),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
    >
      {/* IBM × Horizon lockup */}
      <motion.div
        className="flex items-center gap-[3vw] mb-[4vh]"
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-[4vw] font-display font-bold tracking-tight" style={{ color: "#0f62fe" }}>
          IBM
        </div>
        <div className="w-[0.3vw] h-[3vw] bg-white/30" />
        <div className="text-[4vw] font-display font-bold tracking-tight text-white">
          Horizon BCBS
        </div>
      </motion.div>

      {/* Main title */}
      <motion.h1
        className="text-[7vw] font-display font-bold text-white text-center leading-[1.1] mb-[3vh]"
        initial={{ opacity: 0, y: 40 }}
        animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        CareOps<span className="text-gradient-blue">360</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-[2.2vw] font-body font-light text-white/80 text-center max-w-[70vw]"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        The Horizon Payer Command Center
      </motion.p>

      {/* Accent line */}
      <motion.div
        className="mt-[4vh] h-[0.3vh] bg-gradient-to-r from-transparent via-[#0f62fe] to-transparent"
        initial={{ width: 0, opacity: 0 }}
        animate={phase >= 3 ? { width: "40vw", opacity: 1 } : { width: 0, opacity: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
    </motion.div>
  );
}
