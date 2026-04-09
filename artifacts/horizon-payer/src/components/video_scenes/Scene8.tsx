import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Scene8() {
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
      className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
    >
      <motion.div
        className="absolute inset-0 bg-[#0f62fe]"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      <div className="relative z-10 flex flex-col items-center space-y-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="px-6 py-2 rounded-full bg-white text-[#0f62fe] text-lg font-bold tracking-widest uppercase shadow-2xl"
        >
          CareOps 360
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-5 text-white text-3xl lg:text-4xl font-semibold mb-6">
            <span>Horizon BCBS</span>
            <span className="text-white/50">+</span>
            <span>IBM</span>
          </div>
          <p className="text-white/80 text-xl font-light tracking-wide">
            From Operations to Outcomes — All in One Place.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
