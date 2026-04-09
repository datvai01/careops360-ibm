import { useState, useEffect, useRef } from "react";

type SceneDurations = Record<string, number>;

interface VideoPlayerOptions {
  durations: SceneDurations;
}

interface VideoPlayerResult {
  currentScene: number;
}

export function useVideoPlayer({ durations }: VideoPlayerOptions): VideoPlayerResult {
  const [currentScene, setCurrentScene] = useState(0);
  const completedRef = useRef(false);

  const durationsRef = useRef(durations);
  const keysRef = useRef(Object.keys(durations));

  useEffect(() => {
    durationsRef.current = durations;
    keysRef.current = Object.keys(durations);
  }, [durations]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.startRecording?.();
    }
  }, []);

  useEffect(() => {
    const keys = keysRef.current;
    const dur = durationsRef.current;
    const key = keys[currentScene];
    const duration = dur[key];

    const timer = setTimeout(() => {
      setCurrentScene((prev) => {
        const next = prev + 1;
        if (next >= keys.length) {
          if (!completedRef.current) {
            completedRef.current = true;
            if (typeof window !== "undefined") {
              window.stopRecording?.();
            }
          }
          return 0;
        }
        return next;
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [currentScene]);

  return { currentScene };
}

declare global {
  interface Window {
    startRecording?: () => void;
    stopRecording?: () => void;
  }
}
