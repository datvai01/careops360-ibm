import { motion, AnimatePresence } from "framer-motion";
import { useVideoPlayer } from "@/lib/video/hooks";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { Scene6 } from "./scenes/Scene6";
import { Scene7 } from "./scenes/Scene7";
import { Scene8 } from "./scenes/Scene8";
import { Scene9 } from "./scenes/Scene9";
import { Scene10 } from "./scenes/Scene10";
import { Scene11 } from "./scenes/Scene11";
import { Scene12 } from "./scenes/Scene12";
import { Scene13 } from "./scenes/Scene13";

const SCENE_DURATIONS = {
  intro: 10000,
  execOverview: 13000,
  appHealth: 13000,
  members: 13000,
  claims: 13000,
  priorAuth: 13000,
  providers: 13000,
  contactCenter: 13000,
  vendorInvoices: 13000,
  ibmAiops: 14000,
  roadmap: 13000,
  askAssistant: 16000,
  outro: 10000,
};

export function WalkthroughVideo() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #050e2d 0%, #0a1a4a 50%, #0f2d78 100%)",
        color: "#ffffff"
      }}
    >
      {/* Persistent Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute w-[80vw] h-[80vw] rounded-full blur-[120px] opacity-20"
          style={{ background: "radial-gradient(circle, #0f62fe 0%, transparent 70%)" }}
          animate={{ x: ["-10%", "20%", "-10%"], y: ["-10%", "10%", "-10%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-20"
          style={{ background: "radial-gradient(circle, #00e676 0%, transparent 70%)" }}
          animate={{ x: ["10%", "-20%", "10%"], y: ["10%", "-10%", "10%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} 
        />
      </div>

      {/* Persistent Midground Elements */}
      <motion.div
        className="absolute w-[40vw] h-[40vw] border border-white/5 rounded-full pointer-events-none"
        animate={{
          scale: [1, 1.5, 0.8, 2, 1.2, 1, 1.8, 0.9, 1.3, 1, 1.6, 1.1, 1][currentScene],
          x: ["10vw", "70vw", "40vw", "80vw", "20vw", "60vw", "10vw", "50vw", "30vw", "70vw", "20vw", "60vw", "40vw"][currentScene],
          y: ["10vh", "60vh", "20vh", "70vh", "80vh", "10vh", "60vh", "50vh", "20vh", "80vh", "40vh", "20vh", "50vh"][currentScene],
          opacity: [0.3, 0.1, 0.4, 0.1, 0.2, 0.3, 0.1, 0.4, 0.2, 0.3, 0.1, 0.4, 0.2][currentScene],
        }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute h-px bg-gradient-to-r from-transparent via-[#0f62fe] to-transparent pointer-events-none"
        animate={{
          top: ["20%", "70%", "40%", "80%", "15%", "50%", "85%", "50%", "25%", "75%", "35%", "65%", "50%"][currentScene],
          opacity: [0.5, 0.3, 0.6, 0.2, 0.5, 0.4, 0.6, 0.3, 0.5, 0.4, 0.6, 0.3, 0][currentScene],
          width: ["100%", "150%", "120%", "100%", "200%", "100%", "150%", "100%", "120%", "180%", "100%", "140%", "100%"][currentScene],
          left: ["-20%", "-50%", "-10%", "0%", "-80%", "0%", "-30%", "0%", "-10%", "-60%", "0%", "-20%", "0%"][currentScene],
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="s1" />}
        {currentScene === 1 && <Scene2 key="s2" />}
        {currentScene === 2 && <Scene3 key="s3" />}
        {currentScene === 3 && <Scene4 key="s4" />}
        {currentScene === 4 && <Scene5 key="s5" />}
        {currentScene === 5 && <Scene6 key="s6" />}
        {currentScene === 6 && <Scene7 key="s7" />}
        {currentScene === 7 && <Scene8 key="s8" />}
        {currentScene === 8 && <Scene9 key="s9" />}
        {currentScene === 9 && <Scene10 key="s10" />}
        {currentScene === 10 && <Scene11 key="s11" />}
        {currentScene === 11 && <Scene12 key="s12" />}
        {currentScene === 12 && <Scene13 key="s13" />}
      </AnimatePresence>
    </div>
  );
}
