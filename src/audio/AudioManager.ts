import type { Language } from '../config/languages';
/** Phase 0 contract: Phase 3 will lazy-load a static file per narration id and language after a gesture. */
export class AudioManager {
  constructor(readonly language: Language) {}
  async play(_narrationId: string): Promise<void> { throw new Error('Audio playback is not implemented until Phase 3.'); }
  pause(): void { /* contract stub */ }
  replay(): void { /* contract stub */ }
  setMuted(_muted: boolean): void { /* contract stub */ }
  setSpeed(_speed: number): void { /* contract stub */ }
}
