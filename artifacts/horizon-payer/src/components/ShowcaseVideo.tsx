import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scene1 } from "./video_scenes/Scene1";
import { Scene2 } from "./video_scenes/Scene2";
import { Scene3 } from "./video_scenes/Scene3";
import { Scene4 } from "./video_scenes/Scene4";
import { Scene5 } from "./video_scenes/Scene5";
import { Scene6 } from "./video_scenes/Scene6";
import { Scene7 } from "./video_scenes/Scene7";
import { Scene8 } from "./video_scenes/Scene8";

const SCENE_DURATIONS = [
  12000, 18000, 18000, 18000, 18000, 18000, 18000, 10000,
];

export function ShowcaseVideo() {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % SCENE_DURATIONS.length);
    }, SCENE_DURATIONS[currentScene]);
    return () => clearTimeout(timer);
  }, [currentScene]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: "linear-gradient(155deg, #050e2d 0%, #0a1a4a 35%, #0d2260 60%, #0f2d78 100%)",
      }}
    >
      {/* Persistent Background Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,98,254,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(15,98,254,0.1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Ambient Glows */}
        <motion.div
          className="absolute rounded-full blur-[100px] pointer-events-none"
          style={{
            width: "60vw",
            height: "60vw",
            background: "radial-gradient(circle, rgba(15,98,254,0.15) 0%, transparent 70%)",
          }}
          animate={{
            x: ["-20%", "20%", "-10%"],
            y: ["-20%", "10%", "-30%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 rounded-full blur-[100px] pointer-events-none"
          style={{
            width: "50vw",
            height: "50vw",
            background: "radial-gradient(circle, rgba(77,143,255,0.1) 0%, transparent 70%)",
          }}
          animate={{
            x: ["20%", "-10%", "10%"],
            y: ["20%", "-20%", "0%"],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Persistent Midground Layer */}
      <motion.div
        className="absolute h-px bg-gradient-to-r from-transparent via-[#4d8fff] to-transparent pointer-events-none"
        animate={{
          top: ["20%", "70%", "40%", "80%", "15%", "50%", "85%", "50%"][currentScene],
          opacity: [0.3, 0.5, 0.4, 0.6, 0.3, 0.5, 0.4, 0][currentScene],
          width: ["100%", "150%", "120%", "100%", "200%", "100%", "150%", "100%"][currentScene],
          left: ["-20%", "-50%", "-10%", "0%", "-80%", "0%", "-30%", "0%"][currentScene],
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-64 h-64 border border-[#0f62fe]/20 rounded-full pointer-events-none"
        animate={{
          scale: [1, 1.5, 0.8, 2, 1.2, 1, 1.8, 0][currentScene],
          x: ["10vw", "70vw", "40vw", "80vw", "20vw", "60vw", "10vw", "50vw"][currentScene],
          y: ["10vh", "60vh", "20vh", "70vh", "80vh", "10vh", "60vh", "50vh"][currentScene],
          opacity: [0.4, 0.2, 0.5, 0.1, 0.3, 0.4, 0.2, 0][currentScene],
        }}
        transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Scene Content */}
      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="s1" />}
        {currentScene === 1 && <Scene2 key="s2" />}
        {currentScene === 2 && <Scene3 key="s3" />}
        {currentScene === 3 && <Scene4 key="s4" />}
        {currentScene === 4 && <Scene5 key="s5" />}
        {currentScene === 5 && <Scene6 key="s6" />}
        {currentScene === 6 && <Scene7 key="s7" />}
        {currentScene === 7 && <Scene8 key="s8" />}
      </AnimatePresence>
    </div>
  );
}
