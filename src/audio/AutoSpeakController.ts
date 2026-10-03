import type { Language } from '../config/languages';
import { AudioManager, audioManager } from './AudioManager';

export interface AutoTrack {
  language: Language;
  id: string;
  spokenText: string;
}
interface ActiveTrack {
  track: AutoTrack;
  key: string;
  release: () => void;
  ended: boolean;
}

/** In-memory opt-in queue. Activation alone never requests or plays audio. */
export class AutoSpeakController {
  private scope?: string;
  private queue: AutoTrack[] = [];
  private seen = new Set<string>();
  private active?: ActiveTrack;
  private unsubscribe?: () => void;
  private generation = 0;
  private scheduled = false;

  constructor(private readonly manager: AudioManager = audioManager) {}

  /** Call only while auto-speak is enabled; include language/step in the scope. */
  activate(scope: string): void {
    if (scope === this.scope) return;
    this.stop();
    this.scope = scope;
    this.unsubscribe = this.manager.subscribe(() => {
      const snapshot = this.manager.getSnapshot();
      if (
        this.active && snapshot.automatic &&
        snapshot.key === this.active.key && snapshot.status === 'ended'
      ) this.active.ended = true;
      this.schedule();
    });
  }

  /** Repeated initial/event lists are safe; IDs are queued at most once per scope. */
  enqueue(scope: string, tracks: AutoTrack[]): void {
    if (scope !== this.scope) return;
    for (const track of tracks) {
      if (this.seen.has(track.id)) continue;
      this.seen.add(track.id);
      this.queue.push({ ...track });
    }
    this.schedule();
  }

  /** Off/unmount/scope cleanup stops only owned automatic audio, never manual audio. */
  stop(): void {
    this.generation += 1;
    this.scheduled = false;
    this.scope = undefined;
    this.queue = [];
    this.seen.clear();
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    const active = this.active;
    this.active = undefined;
    if (active) {
      this.manager.stopAutomatic(active.key);
      active.release();
    }
  }

  private schedule(): void {
    if (this.scope === undefined || this.scheduled) return;
    this.scheduled = true;
    const generation = this.generation;
    // Manager replacement emits idle before loading: observe the final ownership,
    // rather than starting a new clip reentrantly inside a manual play/stop call.
    globalThis.queueMicrotask(() => {
      if (generation !== this.generation) return;
      this.scheduled = false;
      this.drain();
    });
  }

  private drain(): void {
    const snapshot = this.manager.getSnapshot();
    const busy = ['loading', 'playing', 'paused'].includes(snapshot.status);
    const active = this.active;
    if (active) {
      const owns = snapshot.automatic && snapshot.key === active.key;
      if (active.ended) {
        this.active = undefined;
        active.release();
      } else if (!owns && !snapshot.automatic && busy) {
        // A manual Listen/Replay preempted this clip. Finish the manual clip first,
        // then retry this track instead of advancing without a real ended event.
        this.active = undefined;
        active.release();
        this.queue.unshift(active.track);
        return;
      } else if (!owns || snapshot.status === 'unavailable') {
        // Includes a denied autoplay. No retry/next-track storm until reactivation.
        this.stop();
        return;
      } else return;
    }
    // Re-read: releasing the ended track can have reset the manager to idle.
    if (['loading', 'playing', 'paused'].includes(this.manager.getSnapshot().status))
      return;
    const track = this.queue.shift();
    if (!track) return;
    const key = `${track.language}:${track.id}`;
    const next: ActiveTrack = {
      track, key, ended: false,
      release: this.manager.retain(key, { automatic: true }),
    };
    this.active = next;
    const generation = this.generation;
    void this.manager.play(track.language, track.id, track.spokenText, {
      automatic: true,
    }).then(() => {
      if (generation === this.generation && this.active === next) this.schedule();
    });
  }
}

export const autoSpeakController = new AutoSpeakController();
