import { describe, expect, it } from 'vitest';
import { episodes } from '../../data/episodes';
import { calculateStats } from '../stats';

const TOLERANCE = 1e-6;

/**
 * The stats stored in each episode JSON are computed by the Python
 * preparation CLI; this test recomputes them with the TypeScript engine from
 * the same bars and requires agreement within a small tolerance.
 */
describe('episode stats parity (Python pipeline vs TypeScript engine)', () => {
  it('recomputes every stored stat from the episode bars', () => {
    expect(episodes.length).toBeGreaterThanOrEqual(2);
    for (const episode of episodes) {
      const recomputed = calculateStats(episode.bars);
      expect(recomputed.barCount, episode.id).toBe(episode.stats.barCount);
      expect(recomputed.maxDrawdown).toBeCloseTo(episode.stats.maxDrawdown, 6);
      expect(recomputed.totalChange).toBeCloseTo(episode.stats.totalChange, 6);
      expect(recomputed.worstSingleDayFall).toBeCloseTo(episode.stats.worstSingleDayFall, 6);
    }
  });
  it('keeps the tolerance small enough to catch convention drift', () => {
    expect(TOLERANCE).toBeLessThan(1e-5);
  });
});
