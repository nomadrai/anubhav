import type { SimResult } from '../engine/types';

/** Raw close equity may pass below maintenance; the displayed final point is settlement. */
export function displayEquity(run: SimResult): number[] {
  return run.timeline.map((point, index) =>
    index === run.timeline.length - 1 ? run.final.equity : point.equity,
  );
}
