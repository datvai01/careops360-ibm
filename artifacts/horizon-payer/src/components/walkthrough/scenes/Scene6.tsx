import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Scene6() {
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

  return (
    <motion.div 
      className="absolute inset-0 p-[5vw] flex items-center"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: 100, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-[40%] pr-[4vw]">
        <motion.h2 
          className="text-[4vw] font-black leading-tight mb-[2vh]"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
        >
          Prior Auth
        </motion.h2>
        <motion.p 
          className="text-[1.5vw] text-white/60 mb-[6vh]"
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.2 }}
        >
          Streamlining clinical review
        </motion.p>

        <motion.div
          className="bg-gradient-to-r from-[#0f62fe]/20 to-transparent border-l-4 border-[#0f62fe] p-[2vw] mb-[4vh]"
          initial={{ opacity: 0, scaleX: 0, originX: 0 }}
          animate={phase >= 2 ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-[1.2vw] text-white/70 uppercase">Approval Rate</div>
          <div className="text-[4vw] font-bold text-white">73%</div>
        </motion.div>
        
        <motion.div
          className="flex items-end gap-[2vw]"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          <div>
            <div className="text-[1vw] text-white/50 uppercase">Pending Backlog</div>
            <div className="text-[2.5vw] font-bold text-orange-400">1,247</div>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 pl-[4vw] border-l border-white/10">
        <motion.h3 
          className="text-[1.5vw] font-semibold mb-[4vh]"
          initial={{ opacity: 0 }}
          animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
        >
          Top Denial Categories
        </motion.h3>
        
        <div className="space-y-[3vh]">
          {[
            { reason: "Lacks Clinical Info", count: 482, width: "100%" },
            { reason: "Not Medically Necessary", count: 315, width: "65%" },
            { reason: "Out of Network", count: 184, width: "38%" },
            { reason: "Duplicate Request", count: 96, width: "20%" },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 50 }}
              animate={phase >= 4 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ delay: phase >= 4 ? i * 0.1 : 0 }}
            >
              <div className="flex justify-between text-[1.1vw] mb-[1vh]">
                <span>{item.reason}</span>
                <span className="text-white/60">{item.count}</span>
              </div>
              <div className="h-[1.5vh] bg-white/5 rounded-r-full overflow-hidden w-full">
                <motion.div 
                  className="h-full bg-gradient-to-r from-red-500/50 to-red-500 rounded-r-full"
                  initial={{ width: 0 }}
                  animate={phase >= 4 ? { width: item.width } : { width: 0 }}
                  transition={{ duration: 1, delay: phase >= 4 ? 0.3 + (i * 0.1) : 0 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
