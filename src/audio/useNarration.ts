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
  useEffect(() => audioManager.retain(key), [key]);
  const isCurrent = snapshot.key === key;
  return {
    ...snapshot,
    status: isCurrent ? snapshot.status : ('idle' as const),
    elapsedSeconds: isCurrent ? snapshot.elapsedSeconds : 0,
    durationSeconds: isCurrent ? snapshot.durationSeconds : 0,
    progress: isCurrent ? snapshot.progress : 0,
    play: () => void audioManager.play(language, id, spokenText),
    pause: () => {
      if (audioManager.getSnapshot().key === key) audioManager.pause();
    },
    resume: () => {
      if (audioManager.getSnapshot().key === key) void audioManager.resume();
    },
    toggleMute: () => audioManager.setMuted(!snapshot.muted),
    setSpeed: (speed: number) => audioManager.setSpeed(speed),
  };
}
