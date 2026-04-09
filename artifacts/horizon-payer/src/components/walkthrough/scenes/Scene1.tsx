import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => setPhase(4), 6500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="text-[6vw] font-black tracking-tighter leading-none mb-4 flex"
        initial={{ y: 50, opacity: 0 }}
        animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <span className="text-white">CareOps</span>
        <span className="text-[#0f62fe]">360</span>
      </motion.div>
      
      <motion.div
        className="text-[2vw] text-white/70 font-light tracking-wide uppercase"
        initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
        animate={phase >= 2 ? { y: 0, opacity: 1, filter: "blur(0px)" } : { y: 20, opacity: 0, filter: "blur(10px)" }}
        transition={{ duration: 0.8 }}
      >
        Executive Operations Portal
      </motion.div>

      <motion.div
        className="mt-[10vh] flex items-center gap-6"
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <span className="text-[1.5vw] font-semibold text-white/90">Horizon BCBS</span>
        <span className="text-[1.5vw] text-white/40">×</span>
        <span className="text-[1.5vw] font-bold text-[#0f62fe]">IBM</span>
      </motion.div>
      
      {/* Decorative accent */}
      <motion.div 
        className="absolute bottom-[20%] w-px h-[10vh] bg-gradient-to-b from-[#0f62fe] to-transparent"
        initial={{ scaleY: 0, transformOrigin: "top" }}
        animate={phase >= 3 ? { scaleY: 1 } : { scaleY: 0 }}
        transition={{ duration: 1.5, ease: "circOut" }}
      />
    </motion.div>
  );
}
