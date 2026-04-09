import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Scene7() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 1600),
      setTimeout(() => setPhase(4), 2000),
      setTimeout(() => setPhase(5), 2400),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-center p-12 lg:p-24"
      initial={{ opacity: 0, x: "5%" }}
      animate={{ opacity: 1, x: "0%" }}
      exit={{ opacity: 0, x: "-5%", filter: "blur(10px)" }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1 }}
        className="max-w-3xl mb-24"
      >
        <h2 className="text-blue-400 font-semibold tracking-widest text-sm uppercase mb-4">
          Transformation Roadmap
        </h2>
        <p className="text-white text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
          From foundation to innovation — a structured IBM partnership journey.
        </p>
      </motion.div>

      <div className="relative w-full max-w-5xl h-32 flex items-center">
        {/* Timeline Line */}
        <motion.div
          className="absolute left-0 top-1/2 h-1 bg-[#4d8fff]/30 -translate-y-1/2"
          initial={{ width: "0%" }}
          animate={phase >= 2 ? { width: "100%" } : { width: "0%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Milestones */}
        <div className="absolute inset-0 flex items-center justify-between px-8">
          {["Foundation", "Integration", "Automation", "Intelligence"].map(
            (label, i) => (
              <div key={i} className="flex flex-col items-center relative">
                <motion.div
                  className="w-5 h-5 rounded-full bg-[#0f62fe] border-4 border-[#050e2d] z-10"
                  initial={{ scale: 0 }}
                  animate={phase >= i + 2 ? { scale: 1 } : { scale: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                />
                <motion.p
                  className="absolute top-10 text-blue-200 text-sm font-medium tracking-wide whitespace-nowrap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={
                    phase >= i + 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                  }
                  transition={{ duration: 0.5 }}
                >
                  {label}
                </motion.p>
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
