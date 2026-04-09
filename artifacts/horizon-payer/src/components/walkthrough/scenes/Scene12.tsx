import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Scene12() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 3500),
      setTimeout(() => setPhase(3), 5000),
      setTimeout(() => setPhase(4), 10500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const query = "What is the current Prior Auth approval rate?";

  return (
    <motion.div 
      className="absolute inset-0 p-[5vw] flex flex-col items-center justify-center"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="flex items-center gap-[1vw] mb-[6vh]"
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      >
        <div className="w-[3vw] h-[3vw] bg-[#0f62fe] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(15,98,254,0.5)]">
          <svg className="w-[1.5vw] h-[1.5vw] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-[2vw] font-bold">Ask Assistant</h2>
      </motion.div>

      {/* Search Input Simulation */}
      <motion.div 
        className="w-[60vw] bg-white/5 border border-white/20 rounded-full py-[1.5vw] px-[2vw] flex items-center shadow-2xl backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-[1.5vw] text-white flex-1 overflow-hidden whitespace-nowrap border-r-2 border-[#0f62fe] animate-[blink_1s_step-end_infinite]">
          {phase >= 1 && (
            <motion.span
              initial={{ width: 0 }}
              animate={phase >= 1 ? { width: "100%" } : { width: 0 }}
              transition={{ duration: 2, ease: "linear" }}
              className="inline-block overflow-hidden whitespace-nowrap"
            >
              {query}
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Answer Reveal */}
      <motion.div 
        className="mt-[4vh] w-[60vw] bg-[#0f62fe]/10 border border-[#0f62fe]/30 rounded-2xl p-[3vw] backdrop-blur-xl origin-top"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={phase >= 3 ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      >
        <div className="text-[1.2vw] text-white/60 mb-[1vh] uppercase tracking-wider">Assistant Response</div>
        <div className="text-[2vw] text-white leading-relaxed">
          The current Prior Auth approval rate is <span className="font-bold text-[#00e676]">73%</span>. 
          This represents a <span className="text-red-400">-2.4%</span> decrease from last month.
          The pending backlog is currently at <span className="font-bold text-orange-400">1,247</span> requests.
        </div>
      </motion.div>

    </motion.div>
  );
}
