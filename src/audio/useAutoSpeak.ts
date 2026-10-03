import { useEffect } from 'react';
import { autoSpeakController, type AutoTrack } from './AutoSpeakController';

/** Scope changes invalidate pending playback; incremental Run events share one scope. */
export function useAutoSpeak(
  enabled: boolean,
  scope: string,
  tracks: AutoTrack[],
) {
  useEffect(() => {
    if (!enabled) return;
    autoSpeakController.activate(scope);
    return () => autoSpeakController.stop();
  }, [enabled, scope]);
  useEffect(() => {
    if (enabled) autoSpeakController.enqueue(scope, tracks);
  }, [enabled, scope, tracks]);
}
