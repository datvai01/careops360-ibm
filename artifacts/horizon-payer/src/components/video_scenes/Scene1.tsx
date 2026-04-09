import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 10000),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* CareOps 360 Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="px-4 py-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 backdrop-blur-md text-blue-300 text-sm font-semibold tracking-widest uppercase"
        >
          CareOps 360
        </motion.div>

        {/* Main Title */}
        <div className="overflow-hidden">
          <motion.h1
            className="text-[4vw] lg:text-[3.5rem] xl:text-[4.5rem] font-black text-white leading-none tracking-tight"
            initial={{ y: "100%" }}
            animate={phase >= 2 ? { y: "0%" } : { y: "100%" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Operations.
            <br />
            <span className="text-[#4d8fff]">Outcomes.</span>
            <br />
            One Platform.
          </motion.h1>
        </div>

        {/* Logos / Subtitle */}
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={
            phase >= 3
              ? { opacity: 1, filter: "blur(0px)" }
              : { opacity: 0, filter: "blur(10px)" }
          }
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="flex items-center gap-4 text-blue-200/60 text-lg lg:text-xl font-medium tracking-wide mt-4"
        >
          <span>Horizon BCBS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#4d8fff]" />
          <span>IBM Partnership</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
