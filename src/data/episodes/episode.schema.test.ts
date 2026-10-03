import { describe, expect, it } from 'vitest';
import placeholder from './placeholder-synthetic.json';
import { validateEpisode } from './episode.schema';
import { episodes } from './index';
import crash from './historical-crash.json';
import choppy from './historical-choppy.json';
import { DEFAULT_EPISODE_ID } from '../../config/episodes';

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

  it('exports only the two real production episodes, not synthetic test fixtures', () => {
    expect(episodes.map((episode) => episode.id)).toEqual(['historical-crash', 'historical-choppy']);
    expect(episodes.every((episode) => !episode.isPlaceholder && !episode.intradayAvailable)).toBe(true);
    expect(episodes.some((episode) => episode.id === DEFAULT_EPISODE_ID)).toBe(true);
  });

  it('preserves bilingual neutral source attribution and rejects an incomplete label', () => {
    expect(validateEpisode(crash).sourceLabel).toEqual(crash.sourceLabel);
    expect(() => validateEpisode({ ...crash, sourceLabel: { en: 'Publisher' } })).toThrow(/sourceLabel/);
    expect(() => validateEpisode({ ...crash, sourceLabel: { en: 'Publisher', hi: '' } })).toThrow(/sourceLabel/);
  });

  it('keeps instrument identity in provenance, not learner-facing episode copy', () => {
    for (const episode of [crash, choppy]) {
      const learnerCopy = JSON.stringify([episode.label, episode.reveal, episode.sourceLabel]);
      expect(learnerCopy).not.toMatch(/\b(?:USD|EUR|WTI|dollar)\b|exchange rate|डॉलर|विनिमय/i);
      expect(episode.provenance.seriesId).toBe('EXR.D.USD.EUR.SP00.A');
      expect(episode.provenance.review.status).toBe('agent-checked');
      expect(episode.provenance.review.humanApproved).toBe(false);
      expect(episode.provenance.review.nativeSpeakerReviewed).toBe(false);
    }
  });
});
