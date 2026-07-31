export const SCENE_DURATIONS = {
  intro: 3500,
  problem: 4000,
  commandCenter: 5000,
  agents: 6000,
  roi: 5500,
  knowledge: 4500,
  roadmap: 4000,
  outro: 3000,
} as const;

export const TOTAL_DURATION = Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);
