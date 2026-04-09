import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center p-12 lg:p-24 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: "-10%", filter: "blur(10px)" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 1 }}
        className="max-w-3xl mb-16"
      >
        <h2 className="text-blue-400 font-semibold tracking-widest text-sm uppercase mb-4">
          Claims Management
        </h2>
        <p className="text-white text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
          End-to-end claims intelligence — from submission to adjudication.
        </p>
      </motion.div>

      {/* Abstract Bar Chart */}
      <div className="w-full max-w-4xl h-[30vh] flex items-end justify-between gap-4 lg:gap-8 px-8">
        {[40, 75, 55, 90, 65, 85].map((height, i) => (
          <div
            key={i}
            className="flex-1 bg-[#0a1a4a]/50 rounded-t-lg border border-blue-500/20 relative overflow-hidden"
            style={{ height: "100%" }}
          >
            <motion.div
              className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-600 to-blue-400"
              initial={{ height: "0%" }}
              animate={phase >= 2 ? { height: `${height}%` } : { height: "0%" }}
              transition={{
                duration: 1.5,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.1,
              }}
            />
          </div>
        ))}
      </div>

      {/* Abstract Donut Chart segments */}
      <div className="absolute left-[10%] top-[30%] w-64 h-64 opacity-30">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#4d8fff"
            strokeWidth="2"
            strokeDasharray="251.2"
            initial={{ strokeDashoffset: 251.2 }}
            animate={phase >= 3 ? { strokeDashoffset: 0 } : { strokeDashoffset: 251.2 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </motion.div>
  );
}
