import type { Language } from '../config/languages';

export type AudioStatus =
  'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'unavailable';
export interface AudioSnapshot {
  key: string;
  status: AudioStatus;
  muted: boolean;
  speed: number;
  elapsedSeconds: number;
  durationSeconds: number;
  /** Fraction in [0, 1], derived from the media element rather than the manifest. */
  progress: number;
}
interface Track {
  id: string;
  language: Language;
  path: string;
  spokenText: string;
  contentSha256: string;
  assetSha256: string;
  inputSha256: string;
  status: string;
  bytes: number;
  durationSeconds: number;
  quality: { passed: boolean; eos: boolean };
}
interface Manifest {
  schemaVersion: number;
  complete: boolean;
  status: string;
  tracks: Track[];
}

/** No constructor/network side effects. Only an explicit Listen/Replay gesture calls play(). */
export class AudioManager {
  private audio?: InstanceType<typeof window.Audio>;
  private manifest?: Manifest;
  private objectUrl?: string;
  private controller?: InstanceType<typeof globalThis.AbortController>;
  private sequence = 0;
  private listeners = new Set<() => void>();
  private consumers = new Map<string, number>();
  private snapshot: AudioSnapshot = {
    key: '',
    status: 'idle',
    muted: false,
    speed: 1,
    elapsedSeconds: 0,
    durationSeconds: 0,
    progress: 0,
  };
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  /** Mounting a control never loads audio; the last same-key consumer stops it. */
  retain(key: string) {
    this.consumers.set(key, (this.consumers.get(key) ?? 0) + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const remaining = (this.consumers.get(key) ?? 1) - 1;
      if (remaining > 0) this.consumers.set(key, remaining);
      else {
        this.consumers.delete(key);
        this.stop(key);
      }
    };
  }
  private update(change: Partial<AudioSnapshot>) {
    this.snapshot = { ...this.snapshot, ...change };
    this.listeners.forEach((listener) => listener());
  }
  private clearAudio() {
    this.controller?.abort();
    this.controller = undefined;
    if (this.objectUrl) globalThis.URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = undefined;
    const audio = this.audio;
    this.audio = undefined;
    if (!audio) return;
    audio.onended = null;
    audio.onerror = null;
    audio.onloadedmetadata = null;
    audio.ondurationchange = null;
    audio.ontimeupdate = null;
    audio.onplaying = null;
    audio.onpause = null;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  }
  stop(key?: string) {
    if (key && key !== this.snapshot.key) return;
    this.sequence += 1;
    this.clearAudio();
    this.update({
      key: '',
      status: 'idle',
      elapsedSeconds: 0,
      durationSeconds: 0,
      progress: 0,
    });
  }
  private fail(sequence: number) {
    if (sequence !== this.sequence) return;
    this.sequence += 1;
    this.clearAudio();
    this.update({
      status: 'unavailable',
      elapsedSeconds: 0,
      durationSeconds: 0,
      progress: 0,
    });
  }
  private mediaProgress(audio: InstanceType<typeof window.Audio>) {
    const durationSeconds =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : 0;
    const currentTime =
      Number.isFinite(audio.currentTime) && audio.currentTime > 0
        ? audio.currentTime
        : 0;
    const elapsedSeconds =
      durationSeconds > 0
        ? Math.min(currentTime, durationSeconds)
        : currentTime;
    return {
      elapsedSeconds,
      durationSeconds,
      progress: durationSeconds > 0 ? elapsedSeconds / durationSeconds : 0,
    };
  }
  async play(
    language: Language,
    id: string,
    spokenText: string,
  ): Promise<void> {
    this.stop();
    const sequence = this.sequence;
    this.update({ key: `${language}:${id}`, status: 'loading' });
    try {
      this.controller = new globalThis.AbortController();
      if (!this.manifest) {
        const response = await globalThis.fetch('/audio/manifest.json', {
          credentials: 'omit',
          redirect: 'error',
          signal: this.controller.signal,
        });
        if (!response.ok) throw new Error('Unavailable manifest');
        const manifest = (await response.json()) as Manifest;
        if (
          manifest.schemaVersion !== 2 ||
          !manifest.complete ||
          !['agent-checked', 'reviewed'].includes(manifest.status) ||
          !Array.isArray(manifest.tracks)
        )
          throw new Error('Invalid manifest');
        this.manifest = manifest;
      }
      if (sequence !== this.sequence) return;
      const track = this.manifest.tracks.find(
        (entry) => entry.language === language && entry.id === id,
      );
      const hash = /^[a-f0-9]{64}$/;
      if (
        !track ||
        !['agent-checked', 'reviewed'].includes(track.status) ||
        !track.quality?.passed ||
        !track.quality.eos ||
        !Number.isFinite(track.durationSeconds) ||
        track.durationSeconds <= 0 ||
        track.bytes <= 0 ||
        !hash.test(track.contentSha256) ||
        !hash.test(track.assetSha256) ||
        !hash.test(track.inputSha256) ||
        !new RegExp(`^/audio/${language}/[a-f0-9]{64}\\.opus$`).test(
          track.path,
        ) ||
        track.spokenText.trim() !== spokenText.trim()
      )
        throw new Error('Missing, failed or stale narration');
      const digest = await globalThis.crypto.subtle.digest(
        'SHA-256',
        new globalThis.TextEncoder().encode(spokenText.trim()),
      );
      const actualHash = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join('');
      if (track.contentSha256 !== actualHash)
        throw new Error('Stale narration hash');
      if (sequence !== this.sequence) return;
      const response = await globalThis.fetch(track.path, {
        credentials: 'omit',
        redirect: 'error',
        signal: this.controller.signal,
      });
      if (!response.ok) throw new Error('Unavailable audio');
      const bytes = await response.arrayBuffer();
      const assetDigest = await globalThis.crypto.subtle.digest(
        'SHA-256',
        bytes,
      );
      const assetHash = Array.from(new Uint8Array(assetDigest), (byte) =>
        byte.toString(16).padStart(2, '0'),
      ).join('');
      if (bytes.byteLength !== track.bytes || assetHash !== track.assetSha256)
        throw new Error('Invalid audio asset');
      if (sequence !== this.sequence) return;
      this.objectUrl = globalThis.URL.createObjectURL(
        new globalThis.Blob([bytes], { type: 'audio/ogg; codecs=opus' }),
      );
      const audio = new window.Audio();
      this.audio = audio;
      audio.preload = 'none';
      audio.muted = this.snapshot.muted;
      audio.playbackRate = this.snapshot.speed;
      const isCurrent = () =>
        sequence === this.sequence && this.audio === audio;
      const updateProgress = () => {
        if (isCurrent()) this.update(this.mediaProgress(audio));
      };
      audio.onloadedmetadata = updateProgress;
      audio.ondurationchange = updateProgress;
      audio.ontimeupdate = updateProgress;
      audio.onplaying = () => {
        if (isCurrent() && !audio.paused)
          this.update({ ...this.mediaProgress(audio), status: 'playing' });
      };
      audio.onpause = () => {
        if (isCurrent() && audio.paused && !audio.ended)
          this.update({ ...this.mediaProgress(audio), status: 'paused' });
      };
      audio.onended = () => {
        if (isCurrent())
          this.update({ ...this.mediaProgress(audio), status: 'ended' });
      };
      audio.onerror = () => {
        if (isCurrent()) this.fail(sequence);
      };
      audio.src = this.objectUrl;
      await audio.play();
      if (isCurrent() && !audio.paused)
        this.update({ ...this.mediaProgress(audio), status: 'playing' });
    } catch {
      this.fail(sequence);
    }
  }
  pause() {
    if (!this.audio || this.snapshot.status !== 'playing') return;
    this.audio.pause();
    this.update({ ...this.mediaProgress(this.audio), status: 'paused' });
  }
  async resume() {
    const audio = this.audio;
    if (!audio) return;
    const sequence = this.sequence;
    try {
      await audio.play();
      if (sequence === this.sequence && this.audio === audio && !audio.paused)
        this.update({ ...this.mediaProgress(audio), status: 'playing' });
    } catch {
      this.fail(sequence);
    }
  }
  setMuted(muted: boolean) {
    if (this.audio) this.audio.muted = muted;
    this.update({ muted });
  }
  setSpeed(speed: number) {
    if (speed !== 1 && speed !== 0.8) return;
    if (this.audio) this.audio.playbackRate = speed;
    this.update({ speed });
  }
}

// One player across the journey and glossary: clips never overlap.
export const audioManager = new AudioManager();
