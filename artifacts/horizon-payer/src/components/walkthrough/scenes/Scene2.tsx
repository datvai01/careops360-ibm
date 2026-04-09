import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 3000),
      setTimeout(() => setPhase(5), 8500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const kpis = [
    { label: "Claims Volume", value: "~18K/day", trend: "+5.2%" },
    { label: "Member Satisfaction", value: "4.2/5", trend: "+0.1" },
    { label: "Auth Approval Rate", value: "73%", trend: "-2.4%" },
    { label: "Cost Trend", value: "-2.1%", trend: "Fav", isGood: true },
  ];

  return (
    <motion.div 
      className="absolute inset-0 p-[5vw]"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h2 
        className="text-[3vw] font-bold mb-[4vh]"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      >
        Executive Overview
      </motion.h2>

      <div className="grid grid-cols-4 gap-[2vw] mb-[6vh]">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl p-[1.5vw] backdrop-blur-sm"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.5, delay: phase >= 2 ? i * 0.1 : 0, type: "spring" }}
          >
            <div className="text-[1vw] text-white/60 mb-[1vh]">{kpi.label}</div>
            <div className="text-[2.5vw] font-bold text-white mb-[1vh]">{kpi.value}</div>
            <div className={`text-[1vw] ${kpi.isGood ? 'text-green-400' : 'text-[#0f62fe]'}`}>
              {kpi.trend}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="h-[30vh] w-full bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm relative overflow-hidden flex items-end p-[2vw]"
        initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
        animate={phase >= 3 ? { opacity: 1, clipPath: "inset(0 0% 0 0)" } : { opacity: 0, clipPath: "inset(0 100% 0 0)" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        {/* Decorative chart lines */}
        <svg className="absolute inset-0 w-full h-full preserve-3d" preserveAspectRatio="none">
          <motion.path 
            d="M0,150 Q100,100 200,130 T400,80 T600,110 T800,50 T1000,90" 
            fill="none" 
            stroke="#0f62fe" 
            strokeWidth="4"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={phase >= 3 ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.path 
            d="M0,150 Q100,100 200,130 T400,80 T600,110 T800,50 T1000,90 L1000,200 L0,200 Z" 
            fill="url(#grad)" 
            opacity="0.2"
            initial={{ opacity: 0 }}
            animate={phase >= 3 ? { opacity: 0.2 } : { opacity: 0 }}
            transition={{ duration: 2, delay: 0.5 }}
          />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f62fe" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Global Time Range Callout */}
      <motion.div
        className="absolute top-[5vw] right-[5vw] flex items-center gap-[1vw] bg-[#0f62fe]/20 border border-[#0f62fe]/50 px-[1.5vw] py-[0.8vw] rounded-full backdrop-blur-md"
        initial={{ opacity: 0, scale: 0.8, x: 50 }}
        animate={phase >= 4 ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.8, x: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="w-[0.8vw] h-[0.8vw] rounded-full bg-[#0f62fe] animate-pulse" />
        <span className="text-[1vw] font-medium text-white">Global Time Range: Last 30 Days</span>
      </motion.div>

    </motion.div>
  );
}
