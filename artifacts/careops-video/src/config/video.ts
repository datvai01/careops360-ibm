export const SCENE_DURATIONS = {
  intro: 4400,
  problem: 5100,
  commandCenter: 9000,
  agents: 9300,
  roi: 8700,
  knowledge: 7700,
  roadmap: 5600,
  outro: 3200,
} as const;

export const TOTAL_DURATION = Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);
