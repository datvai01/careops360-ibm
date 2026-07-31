import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const agents = [
    { name: "Incident Triage", color: "#0f62fe" },
    { name: "QE Test", color: "#0f62fe" },
    { name: "Claims Exception", color: "#24a148" },
    { name: "Prior Auth", color: "#24a148" },
    { name: "Modernization", color: "#0f62fe" },
    { name: "Release Readiness", color: "#24a148" },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* AI network background */}
      <motion.img
        src={`${import.meta.env.BASE_URL}images/ai-network.png`}
        alt=""
        className="absolute inset-0 w-full h-full object-contain opacity-20"
        initial={{ scale: 1.3, opacity: 0, rotate: 0 }}
        animate={phase >= 1 ? { scale: 1, opacity: 0.2, rotate: 5 } : { scale: 1.3, opacity: 0, rotate: 0 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="relative z-10 flex flex-col items-center px-[8vw]">
        {/* Eyebrow */}
        <motion.div
          className="text-[1.6vw] font-display font-semibold tracking-wide mb-[2vh]"
          style={{ color: "#24a148" }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
        >
          POWERED BY IBM AIOps
        </motion.div>

        {/* Main headline */}
        <motion.h2
          className="text-[6.5vw] font-display font-bold text-white text-center leading-[1.1] mb-[5vh]"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          6 Autonomous <span className="text-gradient-blue">AI Agents</span>
        </motion.h2>

        {/* Agent grid */}
        <motion.div
          className="grid grid-cols-3 gap-[2.5vw] mb-[4vh]"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          {agents.map((agent, i) => (
            <motion.div
              key={i}
              className="relative px-[2.5vw] py-[2vh] rounded-xl border backdrop-blur-md"
              style={{
                borderColor: `${agent.color}40`,
                backgroundColor: `${agent.color}15`,
              }}
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={phase >= 3 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.7, y: 20 }}
              transition={{
                duration: 0.5,
                delay: 0.4 + i * 0.1,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  boxShadow: `0 0 30px ${agent.color}60`,
                }}
              />
              <div className="text-[1.5vw] font-display font-semibold text-white text-center">
                {agent.name}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Agent visual */}
        <motion.img
          src={`${import.meta.env.BASE_URL}images/agent-visual.png`}
          alt=""
          className="w-[15vw] h-auto"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={phase >= 4 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.8, ease: "backOut" }}
        />
      </div>
    </motion.div>
  );
}
