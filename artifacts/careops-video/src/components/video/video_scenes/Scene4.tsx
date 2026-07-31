import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

function Counter({ from, to, duration, prefix = "", suffix = "", decimals = 0 }: {
  from: number;
  to: number;
  duration: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => {
    return prefix + latest.toFixed(decimals) + suffix;
  });
  const [displayValue, setDisplayValue] = useState(prefix + from.toFixed(decimals) + suffix);

  useEffect(() => {
    const controls = animate(count, to, { duration, ease: [0.16, 1, 0.3, 1] });
    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, to, duration, rounded]);

  return <span>{displayValue}</span>;
}

export function Scene4() {
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

  const metrics = [
    { label: "Year-1 ROI", value: 110, suffix: "%", color: "#24a148", decimals: 0 },
    { label: "Realized Savings", value: 4.6, prefix: "$", suffix: "M", color: "#24a148", decimals: 1 },
    { label: "Cost Avoidance", value: 12.2, prefix: "$", suffix: "M", color: "#0f62fe", decimals: 1 },
    { label: "Productivity Gain", value: 31.4, suffix: "%", color: "#0f62fe", decimals: 1 },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-[8vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
    >
      {/* Claims operations screenshot backdrop */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={phase >= 1 ? { opacity: 0.18 } : { opacity: 0 }}
        transition={{ duration: 1.2 }}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/app-claims.png`}
          alt=""
          className="w-[80vw] h-auto rounded-xl"
        />
      </motion.div>

      {/* Eyebrow */}
      <motion.div
        className="relative z-10 text-[1.6vw] font-display font-semibold tracking-wide mb-[2vh]"
        style={{ color: "#24a148" }}
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.4 }}
      >
        PROVEN IMPACT
      </motion.div>

      {/* Main headline */}
      <motion.h2
        className="text-[5.5vw] font-display font-bold text-white text-center leading-[1.1] mb-[6vh]"
        initial={{ opacity: 0, y: 40 }}
        animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        Transformative <span className="text-gradient-green">business value</span>
      </motion.h2>

      {/* Metrics grid */}
      <motion.div
        className="grid grid-cols-2 gap-[4vw] max-w-[80vw]"
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
      >
        {metrics.map((metric, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center px-[3vw] py-[3vh] rounded-2xl border backdrop-blur-md"
            style={{
              borderColor: `${metric.color}30`,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={phase >= 3 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 30 }}
            transition={{
              duration: 0.6,
              delay: 0.5 + i * 0.12,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <div
              className="text-[6vw] font-display font-bold mb-[1vh]"
              style={{ color: metric.color }}
            >
              {phase >= 4 ? (
                <Counter
                  from={0}
                  to={metric.value}
                  duration={1.5}
                  prefix={metric.prefix}
                  suffix={metric.suffix}
                  decimals={metric.decimals}
                />
              ) : (
                `${metric.prefix || ""}0${metric.suffix || ""}`
              )}
            </div>
            <div className="text-[1.8vw] font-body text-white/70 text-center">
              {metric.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
