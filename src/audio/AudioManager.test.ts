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
  constructor() {
    FakeAudio.instances.push(this);
  }
  src = '';
  preload = '';
  muted = false;
  playbackRate = 1;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  load = vi.fn();
  removeAttribute = vi.fn();
}
const fetchMock = vi.fn();
let manager: AudioManager;
beforeEach(() => {
  FakeAudio.instances = [];
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

describe('gesture-only local narration', () => {
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
  it('accepts a hypothetical human-reviewed manifest without downgrading it', async () => {
    responses({ ...manifest, status: 'reviewed', tracks: [{ ...track, status: 'reviewed' }] });
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
