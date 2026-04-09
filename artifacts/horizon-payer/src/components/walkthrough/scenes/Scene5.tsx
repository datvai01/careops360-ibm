import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Scene5() {
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
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h2 
        className="text-[3vw] font-bold mb-[4vh]"
        initial={{ opacity: 0, x: -20 }}
        animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      >
        Claims Intelligence
      </motion.h2>

      <div className="grid grid-cols-3 gap-[2vw] mb-[4vh]">
        {[
          { label: "Processing Volume", value: "~18K/day", sub: "Steady" },
          { label: "Auto-adjudication", value: "87%", sub: "+2% MoM", highlight: true },
          { label: "Denial Rate", value: "11.2%", sub: "-0.5% MoM" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-[2vw]"
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: phase >= 2 ? i * 0.1 : 0 }}
          >
            <div className="text-[1.2vw] text-white/60 mb-[1vh]">{stat.label}</div>
            <div className={`text-[3.5vw] font-black ${stat.highlight ? 'text-[#00e676]' : 'text-white'}`}>
              {stat.value}
            </div>
            <div className="text-[1vw] text-white/40 mt-[1vh]">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="bg-white/5 border border-white/10 rounded-2xl p-[2.5vw] flex-1"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-[1.5vw] font-semibold mb-[3vh]">Line-of-Business Backlog</h3>
        <div className="space-y-[3vh]">
          {[
            { label: "Commercial PPO", val: "4,200", pct: "70%" },
            { label: "Medicare Advantage", val: "1,850", pct: "30%" },
            { label: "Medicaid", val: "2,100", pct: "40%" },
          ].map((lob, i) => (
            <div key={i} className="relative">
              <div className="flex justify-between text-[1.1vw] mb-[1vh]">
                <span>{lob.label}</span>
                <span className="font-bold text-[#0f62fe]">{lob.val} pending</span>
              </div>
              <div className="h-[1vh] bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#0f62fe] to-[#00e676]"
                  initial={{ width: 0 }}
                  animate={phase >= 3 ? { width: lob.pct } : { width: 0 }}
                  transition={{ duration: 1.5, delay: phase >= 3 ? 0.3 + (i * 0.1) : 0 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
