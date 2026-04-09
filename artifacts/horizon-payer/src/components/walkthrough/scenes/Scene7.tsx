import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Scene7() {
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
      className="absolute inset-0 p-[5vw] flex flex-col justify-center"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        className="flex justify-between items-end mb-[8vh]"
      >
        <h2 className="text-[4vw] font-bold leading-none">Providers</h2>
        <div className="text-right">
          <div className="text-[1vw] text-white/60 uppercase tracking-widest">Credentialing Backlog</div>
          <div className="text-[3vw] font-bold text-yellow-400">312</div>
        </div>
      </motion.div>

      <div className="flex gap-[4vw]">
        {/* Network Status */}
        <motion.div 
          className="w-[30%] bg-white/5 border border-white/10 rounded-3xl p-[3vw] flex flex-col justify-center items-center"
          initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.8, rotateY: 90 }}
          transition={{ duration: 1, type: "spring" }}
        >
          <div className="relative w-[15vw] h-[15vw] mb-[3vh]">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <motion.circle cx="50" cy="50" r="40" fill="transparent" stroke="#333" strokeWidth="15" />
              <motion.circle cx="50" cy="50" r="40" fill="transparent" stroke="#0f62fe" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="0"
                initial={{ strokeDashoffset: 251.2 }} animate={phase >= 2 ? { strokeDashoffset: 50 } : { strokeDashoffset: 251.2 }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[3vw] font-bold">82%</span>
              <span className="text-[1vw] text-white/60">In-Network</span>
            </div>
          </div>
          <div className="flex w-full justify-between px-[2vw] text-[1vw]">
            <span className="text-[#0f62fe] font-medium">In: 45k</span>
            <span className="text-white/40">Out: 10k</span>
          </div>
        </motion.div>

        {/* Pipeline Stages */}
        <motion.div 
          className="flex-1 flex flex-col justify-center"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
        >
          <h3 className="text-[1.5vw] font-semibold mb-[4vh] text-white/80">Contract Pipeline</h3>
          <div className="flex gap-[1vw] h-[20vh] items-end">
            {[
              { stage: "Initial Request", count: 145, h: "h-[30%]", color: "bg-blue-900" },
              { stage: "Document Collection", count: 89, h: "h-[50%]", color: "bg-blue-700" },
              { stage: "Credentialing Review", count: 312, h: "h-[100%]", color: "bg-yellow-500" },
              { stage: "Contracting", count: 54, h: "h-[20%]", color: "bg-[#0f62fe]" },
              { stage: "Onboarding", count: 12, h: "h-[10%]", color: "bg-[#00e676]" },
            ].map((stage, i) => (
              <motion.div 
                key={i}
                className="flex-1 flex flex-col items-center justify-end"
                initial={{ opacity: 0, y: 50 }}
                animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: phase >= 3 ? i * 0.1 : 0 }}
              >
                <span className="text-[1.5vw] font-bold mb-[1vh]">{stage.count}</span>
                <motion.div 
                  className={`w-full rounded-t-lg ${stage.color}`}
                  initial={{ height: 0 }}
                  animate={phase >= 3 ? { height: "100%" } : { height: 0 }}
                  transition={{ duration: 1, delay: phase >= 3 ? 0.3 + i * 0.1 : 0 }}
                  style={{ height: phase >= 3 ? undefined : 0 }}
                >
                  <div className={`w-full ${stage.h}`} />
                </motion.div>
                <span className="text-[0.9vw] text-white/60 text-center mt-[2vh] leading-tight px-2">{stage.stage}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
