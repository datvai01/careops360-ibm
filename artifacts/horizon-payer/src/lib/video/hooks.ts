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

  const durationsRef = useRef(durations);
  const keysRef = useRef(Object.keys(durations));

  useEffect(() => {
    durationsRef.current = durations;
    keysRef.current = Object.keys(durations);
  }, [durations]);

  useEffect(() => {
    const keys = keysRef.current;
    const dur = durationsRef.current;
    const key = keys[currentScene];
    const duration = dur[key];

    const timer = setTimeout(() => {
      setCurrentScene((prev) => {
        const next = prev + 1;
        if (next >= keys.length) {
          return 0;
        }
        return next;
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [currentScene]);

  return { currentScene };
}
