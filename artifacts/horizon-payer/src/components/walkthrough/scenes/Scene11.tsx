import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Scene11() {
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

  const milestones = [
    { q: "Q1 2026", title: "Cloud Migration", status: "Complete", color: "bg-green-500", textCol: "text-green-400" },
    { q: "Q2 2026", title: "AI Automation V1", status: "In Progress", color: "bg-[#0f62fe]", textCol: "text-[#0f62fe]" },
    { q: "Q3 2026", title: "Predictive Claims", status: "Planned", color: "bg-white/20", textCol: "text-white/40" },
    { q: "Q4 2026", title: "Full Transformation", status: "Planned", color: "bg-white/20", textCol: "text-white/40" },
  ];

  return (
    <motion.div 
      className="absolute inset-0 p-[5vw]"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h2 
        className="text-[3vw] font-bold mb-[2vh]"
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      >
        Transformation Roadmap
      </motion.h2>
      <motion.p 
        className="text-[1.2vw] text-white/60 mb-[10vh]"
        initial={{ opacity: 0 }}
        animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.2 }}
      >
        Digital journey towards autonomous operations
      </motion.p>

      <div className="relative pt-[4vh]">
        {/* Timeline Track */}
        <motion.div 
          className="absolute top-[5vh] left-0 h-[4px] bg-white/10 w-full rounded-full"
          initial={{ scaleX: 0, originX: 0 }}
          animate={phase >= 2 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-[5vh] left-0 h-[4px] bg-gradient-to-r from-green-500 to-[#0f62fe] w-[40%] rounded-full"
          initial={{ scaleX: 0, originX: 0 }}
          animate={phase >= 2 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
        />

        {/* Nodes */}
        <div className="flex justify-between relative z-10">
          {milestones.map((m, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center w-[20%]"
              initial={{ opacity: 0, y: 30 }}
              animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: phase >= 3 ? i * 0.3 : 0 }}
            >
              <div className={`w-[2vw] h-[2vw] rounded-full border-4 border-[#050e2d] ${m.color} mb-[3vh] shadow-xl`} />
              <div className="text-[1.2vw] font-bold mb-[1vh]">{m.q}</div>
              <div className="text-[1.5vw] font-medium text-white mb-[1vh] text-center leading-tight h-[4vh]">{m.title}</div>
              <div className={`text-[1vw] font-bold uppercase tracking-wider ${m.textCol}`}>{m.status}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
