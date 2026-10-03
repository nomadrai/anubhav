import { createHash, webcrypto } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioManager } from './AudioManager';
import { AutoSpeakController, type AutoTrack } from './AutoSpeakController';

// Contract-only bytes exercise the production integrity checks, not actual speech.
const bytes = new globalThis.TextEncoder().encode('queue test bytes, not a shipped audio asset');
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex');
const tracks: AutoTrack[] = ['initial', 'event.one', 'event.two', 'manual'].map((id) => ({
  language: 'en', id, spokenText: `Caption for ${id}.`,
}));
const manifest = {
  schemaVersion: 2, complete: true, status: 'agent-checked',
  tracks: tracks.map((track) => ({
    ...track, path: `/audio/en/${sha(track.id)}.opus`,
    contentSha256: sha(track.spokenText), inputSha256: 'b'.repeat(64),
    assetSha256: sha(bytes), status: 'agent-checked', bytes: bytes.byteLength,
    durationSeconds: 2, quality: { passed: true, eos: true },
  })),
};
class FakeAudio {
  static instances: FakeAudio[] = [];
  static nextPlayError?: Error;
  static nextPlayPromise?: Promise<void>;
  constructor() { FakeAudio.instances.push(this); }
  src = '';
  preload = '';
  muted = false;
  playbackRate = 1;
  currentTime = 0;
  duration = 2;
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
    this.onplaying?.();
    const promise = FakeAudio.nextPlayPromise ?? Promise.resolve();
    FakeAudio.nextPlayPromise = undefined;
    return promise;
  });
  pause = vi.fn(() => { this.paused = true; this.onpause?.(); });
  load = vi.fn();
  removeAttribute = vi.fn();
  finish() {
    this.currentTime = this.duration;
    this.ended = true;
    this.paused = true;
    this.onended?.();
  }
}
const fetchMock = vi.fn();
let manager: AudioManager;
let controller: AutoSpeakController;
const assetResponse = () => ({ ok: true, arrayBuffer: async () => bytes.buffer });
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
async function playing(id: string) {
  await vi.waitFor(() => expect(manager.getSnapshot()).toMatchObject({
    key: `en:${id}`, status: 'playing',
  }));
  return FakeAudio.instances.at(-1)!;
}
async function flush() {
  await new Promise<void>((resolve) => globalThis.setTimeout(resolve, 0));
}
beforeEach(() => {
  FakeAudio.instances = [];
  FakeAudio.nextPlayError = undefined;
  FakeAudio.nextPlayPromise = undefined;
  fetchMock.mockReset().mockImplementation(async (url: string) =>
    url === '/audio/manifest.json'
      ? { ok: true, json: async () => manifest }
      : assetResponse(),
  );
  vi.stubGlobal('window', { Audio: FakeAudio });
  vi.stubGlobal('crypto', webcrypto);
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(globalThis.URL, 'createObjectURL').mockReturnValue('blob:queue-test');
  vi.spyOn(globalThis.URL, 'revokeObjectURL').mockImplementation(() => undefined);
  manager = new AudioManager();
  controller = new AutoSpeakController(manager);
});
afterEach(() => {
  controller.stop();
  manager.stop();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('opt-in scoped automatic narration queue', () => {
  it('defaults inactive and activation/empty or wrong-scope enqueue do not load audio', async () => {
    controller.enqueue('run:en', tracks);
    controller.activate('run:en');
    controller.enqueue('intro:en', tracks);
    controller.enqueue('run:en', []);
    await flush();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(FakeAudio.instances).toHaveLength(0);
  });
  it('preserves incremental event order, deduplicates IDs, and advances only on ended', async () => {
    controller.activate('run:en');
    controller.enqueue('run:en', tracks.slice(0, 2));
    const first = await playing('initial');
    controller.activate('run:en'); // Stable renders must not reset deduplication.
    controller.enqueue('run:en', tracks.slice(0, 3));
    first.currentTime = 2;
    first.ontimeupdate?.();
    manager.pause();
    await flush();
    expect(FakeAudio.instances).toHaveLength(1);
    expect(manager.getSnapshot().status).toBe('paused');
    await manager.resume();
    await flush();
    expect(FakeAudio.instances).toHaveLength(1);
    first.finish();
    const second = await playing('event.one');
    expect(first.pause).toHaveBeenCalled();
    expect(first.onended).toBeNull();
    second.finish();
    const third = await playing('event.two');
    third.finish();
    await flush();
    expect(manager.getSnapshot().status).toBe('idle');
    expect(FakeAudio.instances).toHaveLength(3);
    controller.enqueue('run:en', tracks.slice(0, 3));
    await flush();
    expect(FakeAudio.instances).toHaveLength(3);
  });
  it('retains the active key when changing mirrored narration consumers', async () => {
    const releaseInitial = manager.retain('en:initial');
    controller.activate('run:en');
    controller.enqueue('run:en', tracks.slice(0, 3));
    const first = await playing('initial');
    const releaseEvent = manager.retain('en:event.one');
    releaseInitial();
    expect(manager.getSnapshot().status).toBe('playing');
    expect(first.pause).not.toHaveBeenCalled();
    first.finish();
    const second = await playing('event.one');
    releaseEvent();
    expect(manager.getSnapshot().status).toBe('playing');
    expect(second.pause).not.toHaveBeenCalled();
  });
  it('off cleans playing audio, retains and subscription and drops every queued event', async () => {
    const unsubscribe = vi.fn();
    const subscribe = manager.subscribe;
    vi.spyOn(manager, 'subscribe').mockImplementation((listener) => {
      const release = subscribe(listener);
      return () => { unsubscribe(); release(); };
    });
    controller.activate('run:en');
    controller.enqueue('run:en', tracks.slice(0, 3));
    const first = await playing('initial');
    const staleEnd = first.onended;
    controller.stop();
    controller.stop();
    staleEnd?.();
    controller.enqueue('run:en', tracks);
    await flush();
    expect(manager.getSnapshot()).toMatchObject({
      status: 'idle', automatic: false, progress: 0, key: '',
    });
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(first.pause).toHaveBeenCalledTimes(1);
    expect(FakeAudio.instances).toHaveLength(1);
    // A new retain now really is the last consumer: the controller leaked none.
    const release = manager.retain('en:initial');
    await manager.play('en', tracks[0].id, tracks[0].spokenText);
    release();
    expect(manager.getSnapshot().status).toBe('idle');
  });
  it('scope changes stop the old clip, clear queued events, and allow the same ID anew', async () => {
    controller.activate('run:en');
    controller.enqueue('run:en', tracks.slice(0, 3));
    const first = await playing('initial');
    const oldEnd = first.onended;
    controller.activate('result:en');
    controller.enqueue('run:en', [tracks[1]]);
    controller.enqueue('result:en', [tracks[0]]);
    await playing('initial');
    oldEnd?.();
    await flush();
    expect(FakeAudio.instances).toHaveLength(2);
    expect(first.pause).toHaveBeenCalledTimes(1);
  });
  it('cancels a scheduled start when switched off before the microtask', async () => {
    controller.activate('run:en');
    controller.enqueue('run:en', tracks);
    controller.stop();
    await flush();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('aborts stale asset loading and ignores its late completion after scope replacement', async () => {
    const stale = deferred<ReturnType<typeof assetResponse>>();
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => manifest })
      .mockReturnValueOnce(stale.promise);
    controller.activate('run:en');
    controller.enqueue('run:en', tracks.slice(0, 3));
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const signal = fetchMock.mock.calls[1][1].signal;
    controller.activate('result:en');
    controller.enqueue('result:en', [tracks[2]]);
    await playing('event.two');
    expect(signal.aborted).toBe(true);
    stale.resolve(assetResponse());
    await flush();
    expect(manager.getSnapshot().key).toBe('en:event.two');
    expect(FakeAudio.instances).toHaveLength(1);
  });
  it('off aborts a pending manifest and ignores late loading results', async () => {
    const stale = deferred<{ ok: boolean; json: () => Promise<typeof manifest> }>();
    fetchMock.mockReturnValueOnce(stale.promise);
    controller.activate('run:en');
    controller.enqueue('run:en', tracks);
    await flush();
    const signal = fetchMock.mock.calls[0][1].signal;
    controller.stop();
    stale.resolve({ ok: true, json: async () => manifest });
    await flush();
    expect(signal.aborted).toBe(true);
    expect(FakeAudio.instances).toHaveLength(0);
    expect(manager.getSnapshot().status).toBe('idle');
  });
  it('does not revive an ended/stopped automatic clip when play resolves late', async () => {
    const stale = deferred<void>();
    FakeAudio.nextPlayPromise = stale.promise;
    controller.activate('run:en');
    controller.enqueue('run:en', tracks.slice(0, 2));
    const first = await playing('initial');
    first.finish();
    await playing('event.one');
    controller.stop();
    stale.resolve();
    await flush();
    expect(manager.getSnapshot().status).toBe('idle');
    expect(FakeAudio.instances).toHaveLength(2);
  });
  it('browser-denied autoplay quietly clears the queue and does not retry later events', async () => {
    FakeAudio.nextPlayError = new globalThis.DOMException('Gesture required', 'NotAllowedError');
    controller.activate('run:en');
    controller.enqueue('run:en', tracks.slice(0, 2));
    await vi.waitFor(() => expect(FakeAudio.instances).toHaveLength(1));
    await flush();
    expect(manager.getSnapshot()).toMatchObject({ status: 'idle', key: '', automatic: false });
    expect(FakeAudio.instances[0].removeAttribute).toHaveBeenCalledWith('src');
    controller.enqueue('run:en', [tracks[2]]);
    manager.setMuted(true);
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(FakeAudio.instances).toHaveLength(1);
  });
  it('media errors do not advance to the next track', async () => {
    controller.activate('run:en');
    controller.enqueue('run:en', tracks.slice(0, 3));
    const first = await playing('initial');
    const staleEnd = first.onended;
    first.onerror?.();
    staleEnd?.();
    await flush();
    expect(FakeAudio.instances).toHaveLength(1);
    expect(manager.getSnapshot().status).toBe('idle');
  });
  it('waits behind manual playing and paused audio, then starts only after its ended event', async () => {
    await manager.play('en', tracks[3].id, tracks[3].spokenText);
    const manual = FakeAudio.instances[0];
    controller.activate('run:en');
    controller.enqueue('run:en', tracks.slice(0, 2));
    await flush();
    manager.pause();
    await flush();
    expect(FakeAudio.instances).toHaveLength(1);
    await manager.resume();
    manual.finish();
    await playing('initial');
    expect(FakeAudio.instances).toHaveLength(2);
  });
  it('off and scope changes never stop unrelated manual playback', async () => {
    await manager.play('en', tracks[3].id, tracks[3].spokenText);
    const manual = FakeAudio.instances[0];
    controller.activate('run:en');
    controller.enqueue('run:en', tracks);
    await flush();
    controller.activate('result:en');
    controller.stop();
    expect(manual.pause).not.toHaveBeenCalled();
    expect(manager.getSnapshot()).toMatchObject({ status: 'playing', automatic: false });
    expect(FakeAudio.instances).toHaveLength(1);
  });
  it('does not stop a same-key manual replay on off, even before the queued observer runs', async () => {
    controller.activate('run:en');
    controller.enqueue('run:en', tracks.slice(0, 2));
    await playing('initial');
    const manualPlaying = manager.play('en', tracks[0].id, tracks[0].spokenText);
    controller.stop();
    await manualPlaying;
    const manual = FakeAudio.instances[1];
    expect(manual.pause).not.toHaveBeenCalled();
    expect(manager.getSnapshot()).toMatchObject({ key: 'en:initial', status: 'playing', automatic: false });
  });
  it('manual preemption waits and retries the interrupted track instead of skipping to the next', async () => {
    controller.activate('run:en');
    controller.enqueue('run:en', tracks.slice(0, 2));
    const interrupted = await playing('initial');
    await manager.play('en', tracks[3].id, tracks[3].spokenText);
    const manual = FakeAudio.instances[1];
    await flush();
    expect(interrupted.pause).toHaveBeenCalled();
    expect(manual.pause).not.toHaveBeenCalled();
    manual.finish();
    const retried = await playing('initial');
    retried.finish();
    await playing('event.one');
    expect(FakeAudio.instances).toHaveLength(4);
  });
});
