import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Scene3() {
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

  const systems = [
    { name: "Core APIs", status: "Operational", color: "bg-green-500" },
    { name: "Claims DB", status: "Degraded", color: "bg-yellow-500" },
    { name: "Member Portal", status: "Operational", color: "bg-green-500" },
    { name: "Auth Engine", status: "Operational", color: "bg-green-500" },
    { name: "Provider Sync", status: "Offline", color: "bg-red-500" },
    { name: "Analytics", status: "Operational", color: "bg-green-500" },
  ];

  return (
    <motion.div 
      className="absolute inset-0 p-[5vw]"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex justify-between items-end mb-[6vh]">
        <motion.h2 
          className="text-[3vw] font-bold"
          initial={{ opacity: 0, x: -20 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        >
          App Health
        </motion.h2>
        <motion.div
          className="text-right"
          initial={{ opacity: 0, x: 20 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
        >
          <div className="text-[1vw] text-white/60">SLA Uptime</div>
          <div className="text-[3vw] font-bold text-green-400">99.94%</div>
        </motion.div>
      </div>

      <div className="flex gap-[4vw] h-[50vh]">
        {/* System Status Grid */}
        <motion.div 
          className="flex-1 grid grid-cols-2 gap-[1.5vw]"
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
        >
          {systems.map((sys, i) => (
            <motion.div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-[1.5vw] flex items-center justify-between"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: phase >= 2 ? i * 0.1 : 0, type: "spring" }}
            >
              <span className="text-[1.2vw] font-medium">{sys.name}</span>
              <div className="flex items-center gap-[0.5vw]">
                <span className="text-[1vw] text-white/60">{sys.status}</span>
                <div className={`w-[1vw] h-[1vw] rounded-full ${sys.color} animate-pulse`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Incident Severity */}
        <motion.div 
          className="w-[30%] bg-white/5 border border-white/10 rounded-2xl p-[2vw] flex flex-col justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <h3 className="text-[1.5vw] font-semibold mb-[2vh]">Active Incidents</h3>
          <div className="space-y-[2vh]">
            {[
              { level: "Critical", count: 1, color: "bg-red-500 text-red-100" },
              { level: "High", count: 3, color: "bg-orange-500 text-orange-100" },
              { level: "Medium", count: 12, color: "bg-yellow-500 text-yellow-100" },
              { level: "Low", count: 28, color: "bg-blue-500 text-blue-100" }
            ].map((inc, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-[1.2vw] text-white/80">{inc.level}</span>
                <span className={`px-[1vw] py-[0.2vw] rounded-full text-[1vw] font-bold ${inc.color}`}>
                  {inc.count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
