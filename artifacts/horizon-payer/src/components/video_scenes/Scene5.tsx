import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Scene5() {
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
      className="absolute inset-0 flex flex-col p-12 lg:p-24"
      initial={{ opacity: 0, y: "5%" }}
      animate={{ opacity: 1, y: "0%" }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1 }}
        className="max-w-2xl z-10 relative"
      >
        <h2 className="text-blue-400 font-semibold tracking-widest text-sm uppercase mb-4">
          Member Enrollment
        </h2>
        <p className="text-white text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight mb-4">
          Seamless enrollment and lifecycle management.
        </p>
        <p className="text-blue-300/60 text-base lg:text-lg font-medium leading-relaxed">
          End-to-end visibility from onboarding through care delivery.
        </p>
      </motion.div>

      {/* Abstract Area Chart */}
      <div className="absolute bottom-0 left-0 w-full h-[60vh] opacity-40">
        <svg
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4d8fff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0f62fe" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 0 400 L 0 300 Q 200 200 400 250 T 700 150 T 1000 50 L 1000 400 Z"
            fill="url(#areaGradient)"
            initial={{ opacity: 0, y: 100 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          <motion.path
            d="M 0 300 Q 200 200 400 250 T 700 150 T 1000 50"
            fill="none"
            stroke="#4d8fff"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={phase >= 2 ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </motion.div>
  );
}
