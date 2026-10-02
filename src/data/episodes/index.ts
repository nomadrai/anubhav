import type { Episode } from './episode.schema';
import { validateEpisode } from './episode.schema';
import crash from './crash-synthetic.json';
import choppy from './choppy-synthetic.json';
import placeholder from './placeholder-synthetic.json';

function load(id: string, value: unknown): Episode {
  try {
    return validateEpisode(value);
  } catch (error) {
    // Readable in dev: name the file, not just the validation failure.
    throw new Error(`Invalid episode file ${id}.json: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const episodes: Episode[] = [
  load('crash-synthetic', crash),
  load('choppy-synthetic', choppy),
  load('placeholder-synthetic', placeholder),
];

export const episodeById = new Map(episodes.map((episode) => [episode.id, episode]));
