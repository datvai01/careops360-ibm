import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 2500),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const features = [
    { title: "Shift-Left Deflection", delay: 0 },
    { title: "Self-Heal Prevention", delay: 0.5 },
    { title: "Automation Offset", delay: 1.0 },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-between p-12 lg:p-24"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: "-10%", filter: "blur(10px)" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-1/2 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-blue-400 font-semibold tracking-widest text-sm uppercase mb-4">
            IBM AIOps
          </h2>
          <p className="text-white text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-12">
            Automated Incident Response.
          </p>
        </motion.div>

        <div className="space-y-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -30 }}
              animate={
                phase >= 2
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -30 }
              }
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: feature.delay,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <p className="text-blue-100 text-xl lg:text-2xl font-light">
                {feature.title}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Abstract Circuit Network */}
      <div className="w-1/2 h-full relative flex items-center justify-center opacity-60">
        <svg viewBox="0 0 400 400" className="w-full h-full max-h-[80vh]">
          <motion.path
            d="M 100 200 L 200 100 L 300 200 L 200 300 Z"
            fill="none"
            stroke="#4d8fff"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              phase >= 3
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.circle
            cx="200"
            cy="100"
            r="4"
            fill="#0f62fe"
            initial={{ scale: 0 }}
            animate={phase >= 4 ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
          />
          <motion.circle
            cx="300"
            cy="200"
            r="4"
            fill="#0f62fe"
            initial={{ scale: 0 }}
            animate={phase >= 4 ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.5, type: "spring", delay: 0.2 }}
          />
          <motion.circle
            cx="200"
            cy="300"
            r="4"
            fill="#0f62fe"
            initial={{ scale: 0 }}
            animate={phase >= 4 ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.5, type: "spring", delay: 0.4 }}
          />
          <motion.circle
            cx="100"
            cy="200"
            r="4"
            fill="#0f62fe"
            initial={{ scale: 0 }}
            animate={phase >= 4 ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.5, type: "spring", delay: 0.6 }}
          />
        </svg>
      </div>
    </motion.div>
  );
}
