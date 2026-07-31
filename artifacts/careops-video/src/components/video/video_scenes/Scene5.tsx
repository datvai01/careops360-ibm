import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1300),
      setTimeout(() => setPhase(4), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const features = [
    "Ask the Dashboard in plain language",
    "Enterprise knowledge corpus",
    "Self-service answers — no ticket needed",
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-between px-[8vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left content */}
      <div className="relative z-10 max-w-[50vw]">
        {/* Eyebrow */}
        <motion.div
          className="text-[1.4vw] font-display font-semibold tracking-wide mb-[2vh]"
          style={{ color: "#0f62fe" }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
        >
          INTELLIGENT KNOWLEDGE
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="text-[5vw] font-display font-bold text-white leading-[1.1] mb-[4vh]"
          initial={{ opacity: 0, y: 40 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          AI-powered <span className="text-gradient-blue">knowledge assistant</span>
        </motion.h2>

        {/* Feature list */}
        <div className="space-y-[2vh]">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-[1.5vw] px-[2vw] py-[1.5vh] rounded-lg border border-white/10"
              style={{ backgroundColor: "rgba(15, 98, 254, 0.08)" }}
              initial={{ opacity: 0, x: -30 }}
              animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-[1.2vw] h-[1.2vw] rounded-full mt-[0.5vh]" style={{ backgroundColor: "#24a148" }} />
              <div className="text-[1.8vw] font-body text-white/90 leading-tight">
                {feature}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right visual - layered live screenshots: Knowledge Base behind, Ask Assistant front */}
      <div className="relative w-[44vw] h-[62vh]">
        <motion.div
          className="absolute top-0 right-0 w-[38vw] rounded-2xl border overflow-hidden"
          style={{ borderColor: "rgba(255, 255, 255, 0.15)" }}
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={phase >= 3 ? { opacity: 0.55, x: 0, scale: 1 } : { opacity: 0, x: 100, scale: 0.9 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/app-knowledge.png`}
            alt="CareOps360 Knowledge Base"
            className="w-full h-auto"
          />
        </motion.div>
        <motion.div
          className="absolute bottom-0 left-0 w-[38vw] rounded-2xl border overflow-hidden glow-blue"
          style={{ borderColor: "rgba(15, 98, 254, 0.45)" }}
          initial={{ opacity: 0, x: 100, y: 40, scale: 0.9 }}
          animate={phase >= 4 ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, x: 100, y: 40, scale: 0.9 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/app-ask-assistant.png`}
            alt="CareOps360 Ask Assistant"
            className="w-full h-auto"
          />
        </motion.div>
      </div>

      {/* Chat mockup removed in favor of live screenshot */}
      <motion.div className="hidden">
        {/* Mock chat header */}
        <div className="px-[2vw] py-[1.5vh] border-b" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
          <div className="text-[1.3vw] font-display font-semibold text-white">AI Knowledge Assistant</div>
        </div>

        {/* Mock messages */}
        <div className="p-[2vw] space-y-[2vh]">
          <motion.div
            className="px-[1.5vw] py-[1vh] rounded-lg max-w-[80%]"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <div className="text-[1.1vw] font-body text-white/80">
              What's the prior auth approval process?
            </div>
          </motion.div>

          <motion.div
            className="px-[1.5vw] py-[1vh] rounded-lg ml-auto max-w-[80%]"
            style={{ backgroundColor: "rgba(15, 98, 254, 0.2)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            <div className="text-[1.1vw] font-body text-white/90">
              Based on your clinical guidelines, prior authorizations follow a 3-tier review process...
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
