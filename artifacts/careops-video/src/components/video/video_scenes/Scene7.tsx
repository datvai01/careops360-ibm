import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Scene7() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Main lockup */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={phase >= 1 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-[8vw] font-display font-bold text-white leading-[1] mb-[2vh]">
          CareOps<span className="text-gradient-blue">360</span>
        </div>
        <div className="text-[2.5vw] font-body font-light text-white/80 mb-[1.5vh]">
          Not just running operations —{" "}
          <span className="text-gradient-blue font-normal">transforming how you operate</span>
        </div>
        <div className="text-[1.6vw] font-body font-light text-white/50 mb-[4vh]">
          Transform payer operations with AI
        </div>
      </motion.div>

      {/* IBM × Horizon footer */}
      <motion.div
        className="flex items-center gap-[2.5vw]"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="text-[2.5vw] font-display font-bold" style={{ color: "#0f62fe" }}>
          IBM
        </div>
        <div className="w-[0.2vw] h-[2.5vw] bg-white/30" />
        <div className="text-[2.5vw] font-display font-bold text-white/90">
          Horizon BCBS
        </div>
      </motion.div>

      {/* Accent bars */}
      <motion.div
        className="absolute bottom-[10vh] left-[50%] -translate-x-1/2 flex gap-[1vw]"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="w-[3vw] h-[0.5vh] rounded-full" style={{ backgroundColor: "#0f62fe" }} />
        <div className="w-[3vw] h-[0.5vh] rounded-full" style={{ backgroundColor: "#24a148" }} />
        <div className="w-[3vw] h-[0.5vh] rounded-full" style={{ backgroundColor: "#0f62fe" }} />
      </motion.div>
    </motion.div>
  );
}
