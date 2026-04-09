import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 16000),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col p-12 lg:p-16 xl:p-24"
      initial={{ opacity: 0, x: "5%" }}
      animate={{ opacity: 1, x: "0%" }}
      exit={{ opacity: 0, x: "-5%", filter: "blur(10px)" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1 }}
        className="max-w-2xl"
      >
        <h2 className="text-blue-400 font-semibold tracking-widest text-sm uppercase mb-3">
          Executive Overview
        </h2>
        <p className="text-white text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
          Real-time executive visibility across your entire operation.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="mt-16 flex gap-6 lg:gap-8 relative w-full h-[30vh]">
        {[
          { label: "SLA Compliance", value: "94.2%", delay: 0 },
          { label: "Open Tickets", value: "1,247", delay: 0.2 },
          { label: "Auto-Resolution", value: "68%", delay: 0.4 },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-2xl bg-[#0a1a4a]/40 border border-blue-500/20 backdrop-blur-sm p-6 lg:p-8 flex flex-col justify-end relative overflow-hidden"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={
              phase >= 2
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 40, scale: 0.95 }
            }
            transition={{
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
              delay: kpi.delay,
            }}
          >
            {/* Decorative line */}
            <motion.div
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent"
              initial={{ scaleX: 0 }}
              animate={phase >= 3 ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.5, delay: kpi.delay + 0.5, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
            
            <p className="text-blue-300/70 text-sm lg:text-base font-medium mb-2">
              {kpi.label}
            </p>
            <motion.p
              className="text-white text-4xl lg:text-5xl xl:text-6xl font-light tracking-tighter"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={
                phase >= 3
                  ? { opacity: 1, filter: "blur(0px)" }
                  : { opacity: 0, filter: "blur(10px)" }
              }
              transition={{ duration: 1, delay: kpi.delay + 0.5 }}
            >
              {kpi.value}
            </motion.p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
