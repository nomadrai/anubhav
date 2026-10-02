export const DEFAULT_SIMULATION_CONFIG = {
  maintenanceFraction: 0.25,
  warnBuffer: 1.5,
  drawdownMarks: [0.05, 0.1, 0.2],
} as const;

export const STARTING_CAPITAL = 10_000;

/** Milliseconds per bar during Run playback; the value is a teaching pace, not a market claim. */
export const PLAYBACK_MS_PER_BAR = 450;
