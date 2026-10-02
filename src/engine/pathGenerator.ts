import { mulberry32 } from './prng';
import type { Bar } from './types';

export interface PathOptions { seed: number; length: number; startPrice?: number; volatility?: number; shock?: { atIndex: number; sizePct: number }; }
export function generatePath({ seed, length, startPrice = 100, volatility = 0.01, shock }: PathOptions): Bar[] {
  if (!Number.isInteger(length) || length < 1) throw new Error('length must be a positive integer');
  const random = mulberry32(seed);
  const bars: Bar[] = [{ close: startPrice }];
  for (let index = 1; index < length; index += 1) {
    const previous = bars[index - 1].close;
    const drift = (random() - 0.5) * 2 * volatility;
    const shockMove = shock?.atIndex === index ? shock.sizePct : 0;
    bars.push({ close: previous * (1 + drift + shockMove) });
  }
  return bars;
}
