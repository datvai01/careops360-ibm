import { useState, useEffect, useRef } from "react";

type SceneDurations = Record<string, number>;

interface VideoPlayerOptions {
  durations: SceneDurations;
}

interface VideoPlayerResult {
  currentScene: number;
}

export function useVideoPlayer({ durations }: VideoPlayerOptions): VideoPlayerResult {
  const keys = Object.keys(durations);
  const [currentScene, setCurrentScene] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.startRecording?.();
    }
  }, []);

  useEffect(() => {
    const key = keys[currentScene];
    const duration = durations[key];

    const timer = setTimeout(() => {
      const next = currentScene + 1;
      if (next >= keys.length) {
        if (!completedRef.current) {
          completedRef.current = true;
          if (typeof window !== "undefined") {
            window.stopRecording?.();
          }
        }
        setCurrentScene(0);
      } else {
        setCurrentScene(next);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [currentScene, durations, keys]);

  return { currentScene };
}

declare global {
  interface Window {
    startRecording?: () => void;
    stopRecording?: () => void;
  }
}
