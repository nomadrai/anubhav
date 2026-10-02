import { describe, expect, it } from 'vitest';
import { generatePath } from '../pathGenerator';

describe('generatePath', () => {
  it('creates the same path for the same seed', () => {
    expect(generatePath({ seed: 9, length: 8 })).toEqual(generatePath({ seed: 9, length: 8 }));
  });
  it('applies a scripted shock at its index', () => {
    const path = generatePath({ seed: 1, length: 3, startPrice: 100, volatility: 0, shock: { atIndex: 1, sizePct: -0.1 } });
    expect(path[1].close).toBeCloseTo(100 * Math.exp(-0.1), 12);
  });
});
