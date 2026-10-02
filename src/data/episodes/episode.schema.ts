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
export function isEpisode(value: unknown): value is Episode {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Episode>;
  return typeof item.id === 'string' && Array.isArray(item.bars) && typeof item.isPlaceholder === 'boolean' && !!item.provenance;
}
