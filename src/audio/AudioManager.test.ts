import { createHash, webcrypto } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioManager } from './AudioManager';

const spokenText = 'Text remains available.';
const bytes = new globalThis.TextEncoder().encode(
  'unit-test bytes; not a shipped audio asset',
);
const sha = (text: string | Uint8Array) =>
  createHash('sha256').update(text).digest('hex');
const track = {
  id: 'intro.main',
  language: 'en',
  path: `/audio/en/${'a'.repeat(64)}.opus`,
  spokenText,
  contentSha256: sha(spokenText),
  inputSha256: 'b'.repeat(64),
  assetSha256: sha(bytes),
  status: 'agent-checked',
  bytes: bytes.byteLength,
  durationSeconds: 2,
  quality: { passed: true, eos: true },
};
const manifest = {
  schemaVersion: 2,
  complete: true,
  status: 'agent-checked',
  tracks: [track],
};
class FakeAudio {
  static instances: FakeAudio[] = [];
  static nextPlayError?: Error;
  constructor() {
    FakeAudio.instances.push(this);
  }
  src = '';
  preload = '';
  muted = false;
  playbackRate = 1;
  currentTime = 0;
  duration = Number.NaN;
  paused = true;
  ended = false;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onloadedmetadata: (() => void) | null = null;
  ondurationchange: (() => void) | null = null;
  ontimeupdate: (() => void) | null = null;
  onplaying: (() => void) | null = null;
  onpause: (() => void) | null = null;
  play = vi.fn(() => {
    if (FakeAudio.nextPlayError) {
      const error = FakeAudio.nextPlayError;
      FakeAudio.nextPlayError = undefined;
      return Promise.reject(error);
    }
    this.paused = false;
    return Promise.resolve();
  });
  pause = vi.fn(() => {
    this.paused = true;
  });
  load = vi.fn();
  removeAttribute = vi.fn();
}
const fetchMock = vi.fn();
let manager: AudioManager;
beforeEach(() => {
  FakeAudio.instances = [];
  FakeAudio.nextPlayError = undefined;
  fetchMock.mockReset();
  vi.stubGlobal('window', { Audio: FakeAudio });
  vi.stubGlobal('crypto', webcrypto);
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(globalThis.URL, 'createObjectURL').mockReturnValue(
    'blob:local-test',
  );
  vi.spyOn(globalThis.URL, 'revokeObjectURL').mockImplementation(
    () => undefined,
  );
  manager = new AudioManager();
});
afterEach(() => {
  manager.stop();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function responses(value = manifest) {
  fetchMock
    .mockResolvedValueOnce({ ok: true, json: async () => value })
    .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => bytes.buffer });
}

describe('gated local narration', () => {
  it('does nothing until play, validates hashes, pauses/resumes, controls speed and tears down', async () => {
    expect(fetchMock).not.toHaveBeenCalled();
    expect(FakeAudio.instances).toHaveLength(0);
    responses();
    await manager.play('en', track.id, spokenText);
    expect(manager.getSnapshot().status).toBe('playing');
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/audio/manifest.json',
      track.path,
    ]);
    expect(
      fetchMock.mock.calls.every(
        ([, options]) =>
          options.credentials === 'omit' && options.redirect === 'error',
      ),
    ).toBe(true);
    const audio = FakeAudio.instances[0];
    manager.pause();
    expect(audio.pause).toHaveBeenCalled();
    expect(manager.getSnapshot().status).toBe('paused');
    await manager.resume();
    expect(audio.play).toHaveBeenCalledTimes(2);
    manager.setMuted(true);
    manager.setSpeed(0.8);
    expect(audio.muted).toBe(true);
    expect(audio.playbackRate).toBe(0.8);
    manager.setSpeed(20);
    expect(audio.playbackRate).toBe(0.8);
    audio.onended?.();
    expect(manager.getSnapshot().status).toBe('ended');
    manager.stop();
    expect(audio.removeAttribute).toHaveBeenCalledWith('src');
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(
      'blob:local-test',
    );
    expect(manager.getSnapshot().status).toBe('idle');
  });
  it('reports media-event progress, not manifest duration, elapsed wall time or playback speed', async () => {
    responses();
    await manager.play('en', track.id, spokenText);
    const audio = FakeAudio.instances[0];
    expect(manager.getSnapshot()).toMatchObject({
      elapsedSeconds: 0,
      durationSeconds: 0,
      progress: 0,
    });
    audio.duration = 12;
    audio.onloadedmetadata?.();
    expect(manager.getSnapshot().durationSeconds).toBe(12);
    audio.currentTime = 3;
    expect(manager.getSnapshot().elapsedSeconds).toBe(0);
    audio.ontimeupdate?.();
    expect(manager.getSnapshot()).toMatchObject({
      elapsedSeconds: 3,
      durationSeconds: 12,
      progress: 0.25,
    });
    manager.setSpeed(0.8);
    manager.pause();
    expect(manager.getSnapshot().progress).toBe(0.25);
    audio.duration = 6;
    audio.ondurationchange?.();
    expect(manager.getSnapshot().progress).toBe(0.5);
    await manager.resume();
    audio.currentTime = 6;
    audio.ended = true;
    audio.onended?.();
    expect(manager.getSnapshot()).toMatchObject({
      status: 'ended',
      elapsedSeconds: 6,
      durationSeconds: 6,
      progress: 1,
    });
    manager.stop();
    expect(manager.getSnapshot()).toMatchObject({
      key: '',
      status: 'idle',
      elapsedSeconds: 0,
      durationSeconds: 0,
      progress: 0,
    });
  });
  it('observes native pause/playing events without letting a queued pause undo resume', async () => {
    responses();
    await manager.play('en', track.id, spokenText);
    const audio = FakeAudio.instances[0];
    audio.paused = true;
    audio.onpause?.();
    expect(manager.getSnapshot().status).toBe('paused');
    audio.paused = false;
    audio.onplaying?.();
    expect(manager.getSnapshot().status).toBe('playing');
    audio.onpause?.();
    expect(manager.getSnapshot().status).toBe('playing');
  });
  it('bounds media progress and never exposes non-finite values', async () => {
    responses();
    await manager.play('en', track.id, spokenText);
    const audio = FakeAudio.instances[0];
    for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
      audio.duration = invalid;
      audio.currentTime = invalid;
      audio.ontimeupdate?.();
      expect(manager.getSnapshot()).toMatchObject({
        elapsedSeconds: 0,
        durationSeconds: 0,
        progress: 0,
      });
    }
    audio.duration = 10;
    audio.currentTime = 15;
    audio.ontimeupdate?.();
    expect(manager.getSnapshot()).toMatchObject({
      elapsedSeconds: 10,
      durationSeconds: 10,
      progress: 1,
    });
    audio.currentTime = -5;
    audio.ontimeupdate?.();
    expect(manager.getSnapshot().progress).toBe(0);
  });
  it('ignores stale media events after stop and replacement, including a same-key replay', async () => {
    responses();
    await manager.play('en', track.id, spokenText);
    const oldAudio = FakeAudio.instances[0];
    const staleEvents = [
      oldAudio.onloadedmetadata,
      oldAudio.ondurationchange,
      oldAudio.ontimeupdate,
      oldAudio.onplaying,
      oldAudio.onpause,
      oldAudio.onended,
      oldAudio.onerror,
    ];
    manager.stop();
    expect([
      oldAudio.onloadedmetadata,
      oldAudio.ondurationchange,
      oldAudio.ontimeupdate,
      oldAudio.onplaying,
      oldAudio.onpause,
      oldAudio.onended,
      oldAudio.onerror,
    ]).toEqual(Array(7).fill(null));
    const stopped = manager.getSnapshot();
    oldAudio.duration = 100;
    oldAudio.currentTime = 80;
    staleEvents.forEach((event) => event?.());
    expect(manager.getSnapshot()).toBe(stopped);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => bytes.buffer,
    });
    await manager.play('en', track.id, spokenText);
    const playing = manager.getSnapshot();
    staleEvents.forEach((event) => event?.());
    expect(manager.getSnapshot()).toBe(playing);
    expect(manager.getSnapshot().status).toBe('playing');
  });
  it('shares ownership across mirrored consumers without starting audio on retain', async () => {
    const key = `en:${track.id}`;
    const releaseHeader = manager.retain(key);
    const releaseCaption = manager.retain(key);
    const releaseOther = manager.retain('en:glossary.other');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(FakeAudio.instances).toHaveLength(0);
    responses();
    await manager.play('en', track.id, spokenText);
    const audio = FakeAudio.instances[0];
    releaseHeader();
    releaseHeader();
    releaseOther();
    expect(manager.getSnapshot().status).toBe('playing');
    expect(audio.pause).not.toHaveBeenCalled();
    releaseCaption();
    expect(manager.getSnapshot().status).toBe('idle');
    expect(audio.pause).toHaveBeenCalledTimes(1);
  });
  it('aborts pending playback only when the last same-key consumer releases', async () => {
    const releaseHeader = manager.retain(`en:${track.id}`);
    const releaseCaption = manager.retain(`en:${track.id}`);
    let resolve: (value: unknown) => void = () => undefined;
    fetchMock.mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const playing = manager.play('en', track.id, spokenText);
    const signal = fetchMock.mock.calls[0][1].signal;
    releaseHeader();
    expect(signal.aborted).toBe(false);
    expect(manager.getSnapshot().status).toBe('loading');
    releaseCaption();
    expect(signal.aborted).toBe(true);
    resolve({ ok: true, json: async () => manifest });
    await playing;
    expect(manager.getSnapshot().status).toBe('idle');
    expect(FakeAudio.instances).toHaveLength(0);
  });
  it('keeps a media error fail-closed despite queued events and a pending play resolution', async () => {
    responses();
    await manager.play('en', track.id, spokenText);
    const audio = FakeAudio.instances[0];
    const staleTimeUpdate = audio.ontimeupdate;
    let resolve: () => void = () => undefined;
    audio.play.mockReturnValueOnce(
      new Promise<void>((done) => {
        resolve = done;
      }),
    );
    const resumed = manager.resume();
    audio.onerror?.();
    expect(manager.getSnapshot()).toMatchObject({
      status: 'unavailable',
      elapsedSeconds: 0,
      durationSeconds: 0,
      progress: 0,
    });
    audio.duration = 2;
    audio.currentTime = 1;
    staleTimeUpdate?.();
    resolve();
    await resumed;
    expect(manager.getSnapshot().status).toBe('unavailable');
    expect(manager.getSnapshot().progress).toBe(0);
  });
  it('does not undo a pause when a pending play promise resolves', async () => {
    responses();
    await manager.play('en', track.id, spokenText);
    const audio = FakeAudio.instances[0];
    let resolve: () => void = () => undefined;
    audio.play.mockReturnValueOnce(
      new Promise<void>((done) => {
        resolve = done;
      }),
    );
    const resumed = manager.resume();
    manager.pause();
    resolve();
    await resumed;
    expect(manager.getSnapshot().status).toBe('paused');
  });
  it('accepts a hypothetical human-reviewed manifest without downgrading it', async () => {
    responses({
      ...manifest,
      status: 'reviewed',
      tracks: [{ ...track, status: 'reviewed' }],
    });
    await manager.play('en', track.id, spokenText);
    expect(manager.getSnapshot().status).toBe('playing');
  });
  it.each([
    { status: 'draft' },
    { path: 'https://other.invalid/audio.opus' },
    { path: '//other.invalid/audio.opus' },
    { spokenText: 'Stale text' },
    { contentSha256: 'c'.repeat(64) },
    { quality: { passed: false, eos: true } },
    { quality: { passed: true, eos: false } },
  ])(
    'falls back without requesting an unsafe/stale/failed asset: %j',
    async (change) => {
      responses({ ...manifest, tracks: [{ ...track, ...change }] });
      await manager.play('en', track.id, spokenText);
      expect(manager.getSnapshot().status).toBe('unavailable');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(FakeAudio.instances).toHaveLength(0);
    },
  );
  it('rejects corrupted asset bytes and incomplete manifests', async () => {
    responses({
      ...manifest,
      tracks: [{ ...track, assetSha256: 'c'.repeat(64) }],
    });
    await manager.play('en', track.id, spokenText);
    expect(manager.getSnapshot().status).toBe('unavailable');
    expect(FakeAudio.instances).toHaveLength(0);
    manager = new AudioManager();
    responses({ ...manifest, complete: false });
    await manager.play('en', track.id, spokenText);
    expect(manager.getSnapshot().status).toBe('unavailable');
  });
  it('aborts a pending manifest and ignores late results after leaving the screen', async () => {
    let resolve: (value: unknown) => void = () => undefined;
    fetchMock.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const playing = manager.play('en', track.id, spokenText);
    const signal = fetchMock.mock.calls[0][1].signal;
    manager.stop('en:intro.main');
    expect(signal.aborted).toBe(true);
    resolve({ ok: true, json: async () => manifest });
    await playing;
    expect(manager.getSnapshot().status).toBe('idle');
    expect(FakeAudio.instances).toHaveLength(0);
  });
  it('quiets denied automatic autoplay but preserves manual rejection fallback', async () => {
    responses();
    FakeAudio.nextPlayError = new globalThis.DOMException('Gesture required', 'NotAllowedError');
    expect(await manager.play('en', track.id, spokenText, { automatic: true })).toBe(false);
    expect(manager.getSnapshot()).toMatchObject({
      key: '', status: 'idle', automatic: false, progress: 0,
    });
    expect(FakeAudio.instances[0].removeAttribute).toHaveBeenCalledWith('src');
    fetchMock.mockResolvedValueOnce({ ok: true, arrayBuffer: async () => bytes.buffer });
    FakeAudio.nextPlayError = new globalThis.DOMException('Gesture required', 'NotAllowedError');
    expect(await manager.play('en', track.id, spokenText)).toBe(false);
    expect(manager.getSnapshot().status).toBe('unavailable');
  });
  it('does not allow automatic playback to replace a playing or paused manual clip', async () => {
    responses();
    await manager.play('en', track.id, spokenText);
    const audio = FakeAudio.instances[0];
    const snapshot = manager.getSnapshot();
    expect(await manager.play('en', track.id, spokenText, { automatic: true })).toBe(false);
    expect(manager.getSnapshot()).toBe(snapshot);
    manager.pause();
    expect(await manager.play('en', track.id, spokenText, { automatic: true })).toBe(false);
    manager.stopAutomatic();
    expect(manager.getSnapshot().status).toBe('paused');
    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('keeps non-policy automatic playback errors unavailable and integrity-gated', async () => {
    responses();
    FakeAudio.nextPlayError = new Error('Decode failure');
    expect(await manager.play('en', track.id, spokenText, { automatic: true })).toBe(false);
    expect(manager.getSnapshot().status).toBe('unavailable');
    manager = new AudioManager();
    responses({ ...manifest, tracks: [{ ...track, quality: { passed: false, eos: true } }] });
    expect(await manager.play('en', track.id, spokenText, { automatic: true })).toBe(false);
    expect(manager.getSnapshot().status).toBe('unavailable');
    expect(FakeAudio.instances).toHaveLength(1);
  });
  it('keeps a text fallback for missing audio and browser playback rejection', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Offline'));
    await manager.play('en', track.id, spokenText);
    expect(manager.getSnapshot().status).toBe('unavailable');
    responses();
    await manager.play('en', track.id, spokenText);
    FakeAudio.instances[0].play.mockRejectedValueOnce(
      new Error('Gesture required'),
    );
    await manager.resume();
    expect(manager.getSnapshot().status).toBe('unavailable');
  });
});
