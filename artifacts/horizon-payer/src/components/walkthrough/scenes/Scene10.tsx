import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Scene10() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 3500),
      setTimeout(() => setPhase(5), 8500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const metrics = [
    { label: "Shift-Left Rate", value: "42%", trend: "Up from 28%" },
    { label: "Self-Heal Events", value: "301", trend: "Auto-resolved" },
    { label: "Automation Runbooks", value: "187", trend: "Active" },
    { label: "Cost Reduction", value: "$1.2M", trend: "YTD Savings", highlight: true },
  ];

  return (
    <motion.div 
      className="absolute inset-0 p-[5vw] bg-gradient-to-br from-[#050e2d] via-[#0a1a4a] to-[#0f62fe]/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="flex justify-between items-start mb-[8vh]">
        <motion.h2 
          className="text-[3vw] font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        >
          IBM AIOps Value
        </motion.h2>
        
        {/* Period Selector Callout */}
        <motion.div
          className="flex bg-white/10 rounded-lg p-[0.3vw] border border-white/20 backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={phase >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          {['7D', '14D', '21D'].map((d, i) => (
            <div key={d} className={`px-[1.5vw] py-[0.5vw] rounded-md text-[1vw] ${i === 2 ? 'bg-[#0f62fe] font-bold text-white shadow-lg' : 'text-white/60'}`}>
              {d}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-4 gap-[2vw]">
        {metrics.map((m, i) => (
          <motion.div
            key={i}
            className={`rounded-2xl p-[2vw] border relative overflow-hidden ${
              m.highlight ? 'bg-[#0f62fe]/20 border-[#0f62fe] shadow-[0_0_30px_rgba(15,98,254,0.3)]' : 'bg-white/5 border-white/10'
            }`}
            initial={{ opacity: 0, y: 50 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6, delay: phase >= 2 ? i * 0.15 : 0 }}
          >
            {m.highlight && (
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                initial={{ x: "-150%" }}
                animate={phase >= 3 ? { x: "150%" } : { x: "-150%" }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              />
            )}
            <div className="text-[1.1vw] text-white/70 mb-[2vh] relative z-10">{m.label}</div>
            <div className="text-[3vw] font-black text-white mb-[1vh] relative z-10">{m.value}</div>
            <div className={`text-[0.9vw] relative z-10 ${m.highlight ? 'text-green-300' : 'text-white/40'}`}>
              {m.trend}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Decorative Network Graph Abstract */}
      <motion.div 
        className="absolute bottom-0 left-0 w-full h-[30vh] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 0.3 } : { opacity: 0 }}
        transition={{ duration: 2 }}
      >
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <path d="M 100 100 L 300 50 L 500 120 L 700 30 L 900 80" stroke="#0f62fe" strokeWidth="2" fill="none" />
          <path d="M 200 150 L 400 80 L 600 150 L 800 60" stroke="#00e676" strokeWidth="1" fill="none" strokeDasharray="5,5" />
          <circle cx="300" cy="50" r="5" fill="#0f62fe" />
          <circle cx="500" cy="120" r="8" fill="#00e676" />
          <circle cx="700" cy="30" r="6" fill="#0f62fe" />
        </svg>
      </motion.div>

    </motion.div>
  );
}
