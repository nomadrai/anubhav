import type { Bar } from './types';

export interface PathStats {
  /** Largest fractional fall from a running close peak to a later close; <= 0. */
  maxDrawdown: number;
  /** Number of bars; the first entry point counts in barCount but contributes no step. */
  barCount: number;
  /** (last close - first close) / first close. */
  totalChange: number;
  /** Most negative close-to-close fractional move; 0 when there is no down step. */
  worstSingleDayFall: number;
  /** Steps where close[t] < close[t-1]; equal closes are not counted as down. */
  downCloses: number;
}

/** Conventions: the first bar is the entry point (no step); ties are not down steps; values are exact fractions, rounded only at display. */
export function calculateStats(series: Bar[]): PathStats {
  if (series.length < 2) throw new TypeError('calculateStats needs at least two bars');
  const closes = series.map((bar) => {
    if (!Number.isFinite(bar.close) || bar.close <= 0) throw new TypeError('closes must be finite positive numbers');
    return bar.close;
  });
  let peak = closes[0];
  let maxDrawdown = 0;
  let worstSingleDayFall = 0;
  let downCloses = 0;
  for (let index = 1; index < closes.length; index += 1) {
    const current = closes[index];
    const previous = closes[index - 1];
    if (current < previous) downCloses += 1;
    const stepChange = current / previous - 1;
    if (stepChange < worstSingleDayFall) worstSingleDayFall = stepChange;
    if (current > peak) peak = current;
    const drawdown = current / peak - 1;
    if (drawdown < maxDrawdown) maxDrawdown = drawdown;
  }
  return { maxDrawdown, barCount: closes.length, totalChange: closes[closes.length - 1] / closes[0] - 1, worstSingleDayFall, downCloses };
}
