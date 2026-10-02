import type { Bar } from '../../engine/types';

export interface EpisodeStats { maxDrawdown: number; barCount: number; totalChange: number; worstSingleDayFall: number; }
export interface Episode {
  id: string;
  label: string;
  bars: Bar[];
  intradayAvailable: boolean;
  reveal: { periodText: Record<string, string>; whatHappenedText: Record<string, string> };
  stats: EpisodeStats;
  provenance: { sourceName: string; sourceUrl: string; retrievedOn: string; licenceNote: string; inputSha256?: string };
  isPlaceholder: boolean;
}

export class EpisodeValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'EpisodeValidationError'; }
}

function fail(id: string, message: string): never {
  throw new EpisodeValidationError(`episode ${id || '(unknown id)'}: ${message}`);
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

function validateBar(id: string, value: unknown, index: number): Bar {
  if (!isObject(value)) fail(id, `bars[${index}] must be an object`);
  const close = value.close;
  if (!isFiniteNumber(close) || close <= 0) fail(id, `bars[${index}].close must be a finite positive number`);
  const bar: Bar = { close };
  for (const field of ['open', 'high', 'low'] as const) {
    const price = value[field];
    if (price === undefined) continue;
    if (!isFiniteNumber(price) || price <= 0) fail(id, `bars[${index}].${field} must be a finite positive number when present`);
    bar[field] = price;
  }
  if (bar.high !== undefined) {
    if (bar.high < bar.close) fail(id, `bars[${index}]: high must be >= close`);
    if (bar.low !== undefined && bar.high < bar.low) fail(id, `bars[${index}]: high must be >= low`);
    if (bar.open !== undefined && bar.open > bar.high) fail(id, `bars[${index}]: open must be <= high`);
  }
  if (bar.low !== undefined) {
    if (bar.low > bar.close) fail(id, `bars[${index}]: low must be <= close`);
    if (bar.open !== undefined && bar.open < bar.low) fail(id, `bars[${index}]: open must be >= low`);
  }
  if (value.date !== undefined) {
    if (!isNonEmptyString(value.date)) fail(id, `bars[${index}].date must be a non-empty string when present`);
    bar.date = value.date;
  }
  return bar;
}

/**
 * Runtime validation for prepared episode documents. Throws a readable
 * EpisodeValidationError in dev; the app must never render an invalid episode.
 */
export function validateEpisode(value: unknown): Episode {
  if (!isObject(value)) throw new EpisodeValidationError('episode must be a JSON object');
  const id = typeof value.id === 'string' ? value.id : '';
  if (!isNonEmptyString(value.id)) fail(id, 'id must be a non-empty string');
  if (!isNonEmptyString(value.label)) fail(id, 'label must be a non-empty string');
  if (!Array.isArray(value.bars) || value.bars.length < 2) fail(id, 'bars must be an array with at least two bars');
  const bars = value.bars.map((bar, index) => validateBar(id, bar, index));
  for (let index = 1; index < bars.length; index += 1) {
    if (bars[index - 1].close <= 0) fail(id, `bars[${index - 1}].close must be positive`); // already checked; defensive
  }
  const dates = bars.map((bar) => bar.date);
  if (dates.some((date) => date !== undefined)) {
    if (dates.some((date) => date === undefined)) fail(id, 'date must be present on every bar or on none');
    for (let index = 1; index < dates.length; index += 1) {
      const previous = dates[index - 1] as string;
      const current = dates[index] as string;
      if (!(previous < current)) fail(id, `bars must be sorted by unique date: ${previous} then ${current}`);
    }
  }
  if (typeof value.intradayAvailable !== 'boolean') fail(id, 'intradayAvailable must be a boolean');
  if (typeof value.isPlaceholder !== 'boolean') fail(id, 'isPlaceholder must be a boolean');

  if (!isObject(value.reveal)) fail(id, 'reveal must be an object');
  const reveal: Episode['reveal'] = { periodText: {}, whatHappenedText: {} };
  for (const field of ['periodText', 'whatHappenedText'] as const) {
    const texts = value.reveal[field];
    if (!isObject(texts)) fail(id, `reveal.${field} must be an object`);
    for (const language of ['en', 'hi'] as const) {
      if (!isNonEmptyString(texts[language])) fail(id, `reveal.${field}.${language} must be a non-empty string`);
    }
    reveal[field] = { en: texts.en as string, hi: texts.hi as string };
  }

  if (!isObject(value.stats)) fail(id, 'stats must be an object');
  for (const field of ['maxDrawdown', 'totalChange', 'worstSingleDayFall'] as const) {
    if (!isFiniteNumber(value.stats[field])) fail(id, `stats.${field} must be a finite number`);
  }
  if (!Number.isInteger(value.stats.barCount)) fail(id, 'stats.barCount must be an integer');
  if (value.stats.barCount !== bars.length) fail(id, `stats.barCount is ${value.stats.barCount} but the episode has ${bars.length} bars`);

  if (!isObject(value.provenance)) fail(id, 'provenance must be an object');
  for (const field of ['sourceName', 'sourceUrl', 'retrievedOn', 'licenceNote'] as const) {
    if (!isNonEmptyString(value.provenance[field])) fail(id, `provenance.${field} must be a non-empty string`);
  }
  const provenance: Episode['provenance'] = {
    sourceName: value.provenance.sourceName as string,
    sourceUrl: value.provenance.sourceUrl as string,
    retrievedOn: value.provenance.retrievedOn as string,
    licenceNote: value.provenance.licenceNote as string,
  };
  if (value.provenance.inputSha256 !== undefined) {
    if (typeof value.provenance.inputSha256 !== 'string' || !/^[0-9a-f]{64}$/.test(value.provenance.inputSha256)) {
      fail(id, 'provenance.inputSha256 must be a 64-character lowercase hex digest when present');
    }
    provenance.inputSha256 = value.provenance.inputSha256;
  }

  return {
    id,
    label: value.label as string,
    bars,
    intradayAvailable: value.intradayAvailable as boolean,
    reveal,
    stats: {
      maxDrawdown: value.stats.maxDrawdown as number,
      barCount: value.stats.barCount as number,
      totalChange: value.stats.totalChange as number,
      worstSingleDayFall: value.stats.worstSingleDayFall as number,
    },
    provenance,
    isPlaceholder: value.isPlaceholder as boolean,
  };
}
