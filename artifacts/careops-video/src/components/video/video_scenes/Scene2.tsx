import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const dashboards = [
    "Claims Analytics",
    "Prior Auth Tracking",
    "Provider Networks",
    "Member Insights",
    "Contact Center Ops",
    "Vendor Management",
  ];

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
    >
      {/* Command center visualization */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={phase >= 1 ? { scale: 1, opacity: 0.3 } : { scale: 1.2, opacity: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/command-center.png`}
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-[8vw]">
        {/* Main headline */}
        <motion.h2
          className="text-[6vw] font-display font-bold text-white text-center leading-[1.1] mb-[3vh]"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          One unified <span className="text-gradient-blue">command center</span>
        </motion.h2>

        {/* Subline */}
        <motion.p
          className="text-[2vw] font-body text-white/80 text-center mb-[3vh] max-w-[60vw]"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Executive dashboards for every operational domain
        </motion.p>

        {/* Live platform screenshot */}
        <motion.div
          className="relative w-[58vw] rounded-xl overflow-hidden border glow-blue"
          style={{ borderColor: "rgba(15, 98, 254, 0.4)" }}
          initial={{ opacity: 0, y: 60, scale: 0.92, rotateX: 8 }}
          animate={phase >= 4 ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : { opacity: 0, y: 60, scale: 0.92, rotateX: 8 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/app-exec-overview.png`}
            alt="CareOps360 Executive Overview"
            className="w-full h-auto"
          />
        </motion.div>

        {/* Dashboard grid (hidden, kept for labels) */}
        <motion.div
          className="hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {dashboards.map((name, i) => (
            <motion.div
              key={i}
              className="px-[2vw] py-[1.5vh] rounded-lg border border-white/10 backdrop-blur-sm"
              style={{ backgroundColor: "rgba(15, 98, 254, 0.1)" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={phase >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08, ease: "backOut" }}
            >
              <div className="text-[1.3vw] font-display font-semibold text-white text-center">
                {name}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
