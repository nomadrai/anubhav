import { useEffect, useSyncExternalStore } from 'react';
import type { Language } from '../config/languages';
import { audioManager } from './AudioManager';

export function useNarration(
  language: Language,
  id: string,
  spokenText: string,
) {
  const snapshot = useSyncExternalStore(
    audioManager.subscribe,
    audioManager.getSnapshot,
  );
  const key = `${language}:${id}`;
  useEffect(() => () => audioManager.stop(key), [key]);
  return {
    ...snapshot,
    status: snapshot.key === key ? snapshot.status : ('idle' as const),
    play: () => void audioManager.play(language, id, spokenText),
    pause: () => audioManager.pause(),
    resume: () => void audioManager.resume(),
    toggleMute: () => audioManager.setMuted(!snapshot.muted),
    setSpeed: (speed: number) => audioManager.setSpeed(speed),
  };
}
