import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 2800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const challenges = [
    "Claims exceptions buried in queues",
    "Prior auth delays impacting care",
    "Disconnected operational silos",
  ];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-start justify-center px-[8vw]"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background image */}
      <motion.img
        src={`${import.meta.env.BASE_URL}images/healthcare-team.png`}
        alt=""
        className="absolute right-0 top-0 w-[50vw] h-full object-cover opacity-20"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={phase >= 1 ? { opacity: 0.2, scale: 1 } : { opacity: 0, scale: 1.1 }}
        transition={{ duration: 1.5 }}
      />

      <div className="relative z-10 max-w-[55vw]">
        {/* Eyebrow */}
        <motion.div
          className="text-[1.4vw] font-display font-semibold tracking-wide mb-[2vh]"
          style={{ color: "#24a148" }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
        >
          THE CHALLENGE
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="text-[5.5vw] font-display font-bold text-white leading-[1.1] mb-[4vh]"
          initial={{ opacity: 0, y: 40 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Payer operations drowning in complexity
        </motion.h2>

        {/* Challenge list */}
        <div className="space-y-[2vh]">
          {challenges.map((challenge, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-[1.5vw]"
              initial={{ opacity: 0, x: -30 }}
              animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-[0.6vw] h-[0.6vw] rounded-full mt-[1.2vh]" style={{ backgroundColor: "#0f62fe" }} />
              <div className="text-[2vw] font-body text-white/90 leading-tight">
                {challenge}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
