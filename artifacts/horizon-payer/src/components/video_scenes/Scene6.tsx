import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Scene6() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center p-12 lg:p-24 text-center"
      initial={{ opacity: 0, filter: "blur(20px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 1 }}
        className="max-w-4xl mb-16"
      >
        <h2 className="text-blue-400 font-semibold tracking-widest text-sm uppercase mb-4">
          Prior Auth & Contact Center
        </h2>
        <p className="text-white text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
          From authorization to resolution — unified operational command.
        </p>
      </motion.div>

      {/* Split View */}
      <div className="flex w-full max-w-5xl h-[40vh] gap-12">
        {/* Left: PA Donut */}
        <div className="flex-1 bg-[#0a1a4a]/40 border border-blue-500/20 rounded-2xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
          <p className="absolute top-6 left-6 text-blue-300 text-xs font-semibold tracking-wider uppercase">
            Prior Auth Aging
          </p>
          <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90">
            <motion.circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              stroke="#0f62fe"
              strokeWidth="10"
              strokeDasharray="188.5"
              initial={{ strokeDashoffset: 188.5 }}
              animate={phase >= 2 ? { strokeDashoffset: 40 } : { strokeDashoffset: 188.5 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              stroke="#4d8fff"
              strokeWidth="10"
              strokeDasharray="188.5"
              strokeDashoffset="148.5"
              initial={{ opacity: 0 }}
              animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
            />
          </svg>
        </div>

        {/* Right: Contact Center Bars */}
        <div className="flex-1 bg-[#0a1a4a]/40 border border-blue-500/20 rounded-2xl flex flex-col justify-end p-8 relative overflow-hidden">
          <p className="absolute top-6 left-6 text-blue-300 text-xs font-semibold tracking-wider uppercase">
            Call Volume
          </p>
          <div className="w-full h-4/5 flex items-end justify-between gap-3">
            {[60, 40, 80, 50, 90, 70, 30].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-blue-500/50 rounded-sm"
                initial={{ height: "0%" }}
                animate={phase >= 2 ? { height: `${h}%` } : { height: "0%" }}
                transition={{
                  duration: 1.5,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.5 + i * 0.1,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
