import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Scene4() {
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: 100, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h2 
        className="text-[3vw] font-bold mb-[6vh]"
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      >
        Members Overview
      </motion.h2>

      <div className="flex gap-[5vw]">
        {/* Total Enrollment & Donut */}
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-[3vw]"
          initial={{ opacity: 0, y: 50 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <div className="text-center mb-[4vh]">
            <div className="text-[1.5vw] text-white/60 uppercase tracking-wider">Total Enrollment</div>
            <div className="text-[5vw] font-black text-[#0f62fe] leading-none">~2.1M</div>
          </div>
          
          <div className="relative w-[20vw] h-[20vw]">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <motion.circle cx="50" cy="50" r="40" fill="transparent" stroke="#0f62fe" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="0"
                initial={{ strokeDashoffset: 251.2 }} animate={phase >= 3 ? { strokeDashoffset: 0 } : { strokeDashoffset: 251.2 }} transition={{ duration: 1.5, ease: "easeOut" }} />
              <motion.circle cx="50" cy="50" r="40" fill="transparent" stroke="#00e676" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="0"
                initial={{ strokeDashoffset: 251.2 }} animate={phase >= 3 ? { strokeDashoffset: 100 } : { strokeDashoffset: 251.2 }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }} />
              <motion.circle cx="50" cy="50" r="40" fill="transparent" stroke="#8a3ffc" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="0"
                initial={{ strokeDashoffset: 251.2 }} animate={phase >= 3 ? { strokeDashoffset: 180 } : { strokeDashoffset: 251.2 }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }} />
              <motion.circle cx="50" cy="50" r="40" fill="transparent" stroke="#08bdba" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="0"
                initial={{ strokeDashoffset: 251.2 }} animate={phase >= 3 ? { strokeDashoffset: 220 } : { strokeDashoffset: 251.2 }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }} />
            </svg>
          </div>
        </motion.div>

        {/* Breakdown */}
        <motion.div 
          className="flex-1 flex flex-col justify-center gap-[2vh]"
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.8 }}
        >
          {[
            { label: "PPO", pct: "40%", color: "bg-[#0f62fe]" },
            { label: "HMO", pct: "32%", color: "bg-[#00e676]" },
            { label: "Medicare Advantage", pct: "16%", color: "bg-[#8a3ffc]" },
            { label: "EPO", pct: "12%", color: "bg-[#08bdba]" },
          ].map((plan, i) => (
            <div key={i} className="flex items-center gap-[2vw]">
              <div className="w-[15vw]">
                <div className="text-[1.2vw] font-medium text-white">{plan.label}</div>
              </div>
              <div className="flex-1 h-[1.5vh] bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${plan.color}`}
                  initial={{ width: 0 }}
                  animate={phase >= 3 ? { width: plan.pct } : { width: 0 }}
                  transition={{ duration: 1, delay: phase >= 3 ? i * 0.1 : 0 }}
                />
              </div>
              <div className="w-[4vw] text-right text-[1.2vw] font-bold">{plan.pct}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
