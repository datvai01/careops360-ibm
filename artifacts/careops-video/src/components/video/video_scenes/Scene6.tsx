import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Scene6() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const roadmap = [
    { phase: "30 Days", item: "Foundation & Quick Wins", color: "#24a148" },
    { phase: "60 Days", item: "Agent Deployment", color: "#0f62fe" },
    { phase: "90 Days", item: "Full Pod Transformation", color: "#24a148" },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-[8vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
    >
      {/* Eyebrow */}
      <motion.div
        className="text-[1.6vw] font-display font-semibold tracking-wide mb-[2vh]"
        style={{ color: "#24a148" }}
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.4 }}
      >
        YOUR TRANSFORMATION PATH
      </motion.div>

      {/* Main headline */}
      <motion.h2
        className="text-[4.5vw] font-display font-bold text-white text-center leading-[1.1] mb-[3vh]"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        30-60-90 day <span className="text-gradient-blue">roadmap</span>
      </motion.h2>

      {/* Live transition timeline screenshot */}
      <motion.div
        className="relative w-[52vw] rounded-xl overflow-hidden border mb-[3vh]"
        style={{ borderColor: "rgba(36, 161, 72, 0.4)", boxShadow: "0 0 40px rgba(36, 161, 72, 0.2)" }}
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={phase >= 3 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.94 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/app-timeline.png`}
          alt="Transition Program Timeline"
          className="w-full h-auto"
        />
      </motion.div>

      {/* Timeline */}
      <motion.div
        className="hidden items-start gap-[3vw] max-w-[85vw]"
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
      >
        {roadmap.map((step, i) => (
          <motion.div
            key={i}
            className="flex-1 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{
              duration: 0.6,
              delay: 0.4 + i * 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* Connector line */}
            {i < roadmap.length - 1 && (
              <motion.div
                className="absolute top-[3vh] left-[50%] w-[3vw] h-[0.3vh]"
                style={{ backgroundColor: step.color, opacity: 0.3 }}
                initial={{ scaleX: 0 }}
                animate={phase >= 3 ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + i * 0.2 }}
              />
            )}

            {/* Phase number */}
            <div
              className="w-[6vh] h-[6vh] rounded-full mx-auto mb-[2vh] flex items-center justify-center border-4"
              style={{
                borderColor: step.color,
                backgroundColor: `${step.color}20`,
              }}
            >
              <div className="text-[2vw] font-display font-bold" style={{ color: step.color }}>
                {i + 1}
              </div>
            </div>

            {/* Content card */}
            <div
              className="px-[2vw] py-[2.5vh] rounded-xl border backdrop-blur-sm"
              style={{
                borderColor: `${step.color}30`,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
              }}
            >
              <div className="text-[1.4vw] font-display font-bold mb-[1vh]" style={{ color: step.color }}>
                {step.phase}
              </div>
              <div className="text-[1.3vw] font-body text-white/80 leading-tight">
                {step.item}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
