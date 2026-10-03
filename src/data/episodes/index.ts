import type { Episode } from './episode.schema';
import { validateEpisode } from './episode.schema';
import crash from './historical-crash.json';
import choppy from './historical-choppy.json';

function load(id: string, value: unknown): Episode {
  try {
    return validateEpisode(value);
  } catch (error) {
    // Readable in dev: name the file, not just the validation failure.
    throw new Error(`Invalid episode file ${id}.json: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}

export const episodes: Episode[] = [
  load('historical-crash', crash),
  load('historical-choppy', choppy),
];

export const episodeById = new Map(episodes.map((episode) => [episode.id, episode]));
