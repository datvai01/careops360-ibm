export const SCENE_DURATIONS = {
  intro: 4200,
  problem: 4800,
  commandCenter: 9000,
  agents: 8300,
  roi: 8700,
  knowledge: 6000,
  roadmap: 4800,
  outro: 3200,
} as const;

export const TOTAL_DURATION = Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);
