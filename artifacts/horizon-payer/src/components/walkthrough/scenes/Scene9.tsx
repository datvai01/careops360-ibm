import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Scene9() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 8500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const tiers = [
    { name: "Disputed", val: "$0.3M", count: 12, color: "text-red-400", border: "border-red-400/30" },
    { name: "Pending", val: "$0.8M", count: 45, color: "text-orange-400", border: "border-orange-400/30" },
    { name: "Approved", val: "$1.3M", count: 89, color: "text-[#0f62fe]", border: "border-[#0f62fe]/30" },
    { name: "Paid", val: "$8.4M", count: 412, color: "text-green-400", border: "border-green-400/30" },
  ];

  return (
    <motion.div 
      className="absolute inset-0 p-[5vw] flex flex-col"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: 100, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div 
        className="flex items-center gap-[2vw] mb-[8vh]"
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      >
        <h2 className="text-[3vw] font-bold">Vendor Invoices</h2>
        <div className="px-[1vw] py-[0.5vw] bg-white/10 rounded-lg text-[1vw] text-white/80 border border-white/20">
          IBM-Scoped Management
        </div>
      </motion.div>

      <div className="flex gap-[4vw] flex-1">
        {/* Total In-Flight */}
        <motion.div 
          className="w-[30%] flex flex-col justify-center"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-[1.5vw] text-white/60 mb-[2vh]">Total Value In-Flight</div>
          <motion.div 
            className="text-[6vw] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            $2.4M
          </motion.div>
          <div className="mt-[4vh] h-px w-full bg-white/20" />
          <div className="mt-[4vh] text-[1.2vw] text-white/40">Includes Pending & Approved invoices awaiting disbursement.</div>
        </motion.div>

        {/* Status Tiers */}
        <div className="flex-1 flex flex-col justify-center gap-[2vh]">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              className={`flex items-center justify-between p-[2vw] bg-white/5 rounded-xl border ${tier.border}`}
              initial={{ opacity: 0, x: 50 }}
              animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.5, delay: phase >= 3 ? i * 0.15 : 0 }}
            >
              <div className="flex items-center gap-[2vw]">
                <span className={`text-[1.5vw] font-bold ${tier.color} w-[8vw]`}>{tier.name}</span>
                <span className="text-[1vw] text-white/50">{tier.count} invoices</span>
              </div>
              <div className="text-[2vw] font-bold text-white">{tier.val}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
