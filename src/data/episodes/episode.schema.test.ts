import { describe, expect, it } from 'vitest';
import placeholder from './placeholder-synthetic.json';
import { validateEpisode } from './episode.schema';

describe('episode schema', () => {
  it('accepts the checked-in synthetic episode', () => {
    expect(validateEpisode(placeholder).id).toBe('episode-synthetic-placeholder');
  });

  it('rejects partial intraday lows and invalid dates', () => {
    const partialLow = { ...placeholder, bars: [{ close: 100, low: 99 }, { close: 101 }] };
    expect(() => validateEpisode(partialLow)).toThrow(/low must be present/);
    const invalidDate = { ...placeholder, bars: [{ close: 100, date: '2024-02-31' }, { close: 101, date: '2024-03-01' }] };
    expect(() => validateEpisode(invalidDate)).toThrow(/valid YYYY-MM-DD/);
  });

  it('rejects stats whose bar count does not match the bars', () => {
    expect(() => validateEpisode({ ...placeholder, stats: { ...placeholder.stats, barCount: 99 } })).toThrow(/barCount is 99/);
  });
});
