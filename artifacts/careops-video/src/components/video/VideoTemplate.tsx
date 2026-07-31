import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useVideoPlayer } from "@/lib/video/hooks";
import { SCENE_DURATIONS } from "@/config/video";
import { Scene0 } from "./video_scenes/Scene0";
import { Scene1 } from "./video_scenes/Scene1";
import { Scene2 } from "./video_scenes/Scene2";
import { Scene3 } from "./video_scenes/Scene3";
import { Scene4 } from "./video_scenes/Scene4";
import { Scene5 } from "./video_scenes/Scene5";
import { Scene6 } from "./video_scenes/Scene6";
import { Scene7 } from "./video_scenes/Scene7";

export { SCENE_DURATIONS };

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  intro: Scene0,
  problem: Scene1,
  commandCenter: Scene2,
  agents: Scene3,
  roi: Scene4,
  knowledge: Scene5,
  roadmap: Scene6,
  outro: Scene7,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, ms] of Object.entries(SCENE_DURATIONS)) {
    out[key] = cumulativeMs / 1000;
    cumulativeMs += ms;
  }
  return out;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, "");
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Animated gradient background - persists across scenes */}
      <motion.div
        className="absolute inset-0 gradient-animated"
        animate={{
          opacity: sceneIndex === 0 ? 0.6 : sceneIndex >= 6 ? 0.8 : 0.4,
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      {/* Hexagonal grid pattern - persists and shifts */}
      <motion.div
        className="absolute inset-0 hex-pattern"
        animate={{
          opacity: sceneIndex <= 1 ? 0.3 : sceneIndex >= 6 ? 0.1 : 0.5,
          scale: sceneIndex === 0 ? 1.2 : 1,
        }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Persistent accent shape */}
      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(15, 98, 254, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: sceneIndex === 0 ? "30vw" : sceneIndex <= 2 ? "60vw" : sceneIndex <= 4 ? "10vw" : "70vw",
          y: sceneIndex === 0 ? "20vh" : sceneIndex <= 2 ? "40vh" : sceneIndex <= 4 ? "10vh" : "50vh",
          scale: sceneIndex === 0 ? 1.5 : sceneIndex === 4 ? 2 : 1,
        }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Scene content */}
      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="popLayout">
          {SceneComponent && <SceneComponent key={currentSceneKey} />}
        </AnimatePresence>
      </div>

      {/* Background music */}
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/composite_audio.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />

      {/* Noise overlay */}
      <div className="noise-overlay" />
    </div>
  );
}

export { VideoTemplate };
