import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Scene8() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 8500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 p-[5vw]"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h2 
        className="text-[3vw] font-bold mb-[6vh]"
        initial={{ opacity: 0, x: -20 }}
        animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      >
        Contact Center
      </motion.h2>

      <div className="grid grid-cols-2 gap-[4vw]">
        {/* Left Col - Big Stats */}
        <div className="space-y-[4vh]">
          <motion.div
            className="bg-[#0f62fe]/10 border border-[#0f62fe]/30 rounded-3xl p-[3vw]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-[1.2vw] text-[#0f62fe] uppercase tracking-wider mb-[1vh]">Daily Call Volume</div>
            <div className="text-[5vw] font-black leading-none">~4,200</div>
          </motion.div>

          <div className="grid grid-cols-2 gap-[2vw]">
            <motion.div
              className="bg-white/5 border border-white/10 rounded-2xl p-[2vw]"
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-[1vw] text-white/60 mb-[1vh]">Avg Handle Time</div>
              <div className="text-[2.5vw] font-bold">6.2 <span className="text-[1.5vw] text-white/40">min</span></div>
            </motion.div>
            <motion.div
              className="bg-white/5 border border-white/10 rounded-2xl p-[2vw]"
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-[1vw] text-white/60 mb-[1vh]">IVR Deflection</div>
              <div className="text-[2.5vw] font-bold text-green-400">41%</div>
            </motion.div>
          </div>
        </div>

        {/* Right Col - Visual/Dial */}
        <motion.div
          className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-[4vw] relative overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 text-center">
            <div className="text-[1.5vw] text-white/80 mb-[2vh]">First Contact Resolution</div>
            <div className="relative inline-flex items-center justify-center w-[18vw] h-[18vw]">
              <svg className="w-full h-full transform -rotate-180">
                <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="10" strokeDasharray="2.83" />
                <motion.circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="#00e676" strokeWidth="10" strokeDasharray="2.83"
                  initial={{ strokeDashoffset: 2.83 }}
                  animate={phase >= 3 ? { strokeDashoffset: 0.51 } : { strokeDashoffset: 2.83 }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[4vw] font-black text-white">82%</span>
                <span className="text-[1vw] text-green-400 font-medium tracking-wide">EXCELLENT</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
