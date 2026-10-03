// @vitest-environment jsdom
import { createHash, webcrypto } from 'node:crypto';
import { StrictMode, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { audioManager } from '../audio/AudioManager';
import type { Language } from '../config/languages';
import { t } from '../i18n';
import { AudioControls } from './AudioControls';

const spokenText = 'Text remains available.';
const id = 'intro.main';
const bytes = new globalThis.TextEncoder().encode(
  'component-test fixture, not speech',
);
const sha = (text: string | Uint8Array) =>
  createHash('sha256').update(text).digest('hex');
const track = {
  id,
  language: 'en',
  path: `/audio/en/${'a'.repeat(64)}.opus`,
  spokenText,
  contentSha256: sha(spokenText),
  assetSha256: sha(bytes),
  inputSha256: 'b'.repeat(64),
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
    this.paused = false;
    return Promise.resolve();
  });
  pause = vi.fn(() => {
    this.paused = true;
  });
  load = vi.fn();
  removeAttribute = vi.fn();
}
let container: ReturnType<typeof document.createElement>;
let root: Root;
const fetchMock = vi.fn();
function render({
  compact = true,
  full = true,
  language = 'en',
  other = false,
}: {
  compact?: boolean;
  full?: boolean;
  language?: Language;
  other?: boolean;
} = {}) {
  act(() =>
    root.render(
      <StrictMode>
        {compact && (
          <AudioControls
            key="header"
            compact
            language={language}
            id={id}
            spokenText={spokenText}
          />
        )}
        {full && (
          <AudioControls
            key="caption"
            language={language}
            id={id}
            spokenText={spokenText}
          />
        )}
        {other && (
          <AudioControls
            key="other"
            language={language}
            id="glossary.other"
            spokenText={spokenText}
          />
        )}
      </StrictMode>,
    ),
  );
}
function primary(compact = true) {
  const element = container.querySelector<HTMLButtonElement>(
    compact
      ? '.compact .audio-main-button'
      : '.audio-control:not(.compact) .audio-main-button',
  );
  if (!element) throw new Error('Missing primary narration control');
  return element;
}
async function start() {
  act(() => primary().click());
  expect(primary().disabled).toBe(true);
  expect(primary().textContent).toBe(t('en', 'features.audioLoading'));
  await act(async () => {
    await vi.waitFor(() =>
      expect(audioManager.getSnapshot().status).toBe('playing'),
    );
  });
}
beforeEach(() => {
  audioManager.stop();
  audioManager.setMuted(false);
  audioManager.setSpeed(1);
  FakeAudio.instances = [];
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (url: string) =>
    url === '/audio/manifest.json'
      ? { ok: true, json: async () => manifest }
      : { ok: true, arrayBuffer: async () => bytes.buffer },
  );
  vi.stubGlobal('Audio', FakeAudio);
  vi.stubGlobal('crypto', webcrypto);
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:local-component-test'),
    revokeObjectURL: vi.fn(),
  });
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  audioManager.stop();
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('mirrored narration controls', () => {
  it('loads only on a gesture, mirrors play/pause/resume and event progress, and retains the remaining consumer', async () => {
    render();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(FakeAudio.instances).toHaveLength(0);
    expect(container.textContent).not.toContain(t('en', 'features.audio'));
    expect(container.textContent).not.toContain(t('en', 'features.audioIdle'));
    expect(container.querySelectorAll('[role="status"]')).toHaveLength(0);
    expect(primary().textContent).toBe(t('en', 'features.listen'));
    await start();
    const audio = FakeAudio.instances[0];
    expect(primary().textContent).toBe(t('en', 'features.pauseAudio'));
    expect(primary(false).textContent).toBe(t('en', 'features.pauseAudio'));
    expect(container.querySelectorAll('.compact button')).toHaveLength(1);
    expect(container.querySelectorAll('.audio-tools')).toHaveLength(1);
    expect(container.querySelectorAll('[role="status"]')).toHaveLength(1);
    expect(container.querySelector('[role="status"]')?.textContent).toBe(
      t('en', 'features.audioPlaying'),
    );
    act(() => {
      audio.duration = 20;
      audio.currentTime = 5;
      audio.onloadedmetadata?.();
      audio.ontimeupdate?.();
    });
    const progress = [...container.querySelectorAll('progress')];
    expect(progress).toHaveLength(2);
    expect(progress.map((element) => element.value)).toEqual([0.25, 0.25]);
    act(() => primary(false).click());
    expect(primary().textContent).toBe(t('en', 'features.resumeAudio'));
    expect(primary(false).textContent).toBe(t('en', 'features.resumeAudio'));
    expect(container.querySelector('[role="status"]')?.textContent).toBe(
      t('en', 'features.audioPaused'),
    );
    await act(async () => {
      primary().click();
      await vi.waitFor(() =>
        expect(audioManager.getSnapshot().status).toBe('playing'),
      );
    });
    expect(audio.play).toHaveBeenCalledTimes(2);
    render({ compact: false });
    expect(audioManager.getSnapshot().status).toBe('playing');
    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(primary(false).textContent).toBe(t('en', 'features.pauseAudio'));
    render({ compact: false, full: false });
    expect(audioManager.getSnapshot()).toMatchObject({
      key: '',
      status: 'idle',
      elapsedSeconds: 0,
      durationSeconds: 0,
      progress: 0,
    });
    expect(audio.pause).toHaveBeenCalledTimes(2);
    expect(audio.ontimeupdate).toBeNull();
  });
  it('keeps replay/mute/speed in the full control and clears them when playback ends', async () => {
    render();
    await start();
    const audio = FakeAudio.instances[0];
    const mute = container.querySelector<HTMLButtonElement>(
      '.audio-tools [aria-pressed]',
    );
    if (!mute) throw new Error('Missing mute control');
    act(() => mute.click());
    expect(audio.muted).toBe(true);
    expect(mute.getAttribute('aria-pressed')).toBe('true');
    const speed = container.querySelector('select');
    if (!speed) throw new Error('Missing speed control');
    act(() => {
      speed.value = '0.8';
      speed.dispatchEvent(new window.Event('change', { bubbles: true }));
    });
    expect(audio.playbackRate).toBe(0.8);
    act(() => {
      audio.duration = 10;
      audio.currentTime = 10;
      audio.ended = true;
      audio.onended?.();
    });
    expect(primary().textContent).toBe(t('en', 'features.replayAudio'));
    expect(primary(false).textContent).toBe(t('en', 'features.replayAudio'));
    expect(container.querySelector('.audio-tools')).toBeNull();
    expect(container.querySelector('[role="status"]')?.textContent).toBe(
      t('en', 'features.audioEnded'),
    );
    expect(container.querySelector('progress')?.value).toBe(1);
    await act(async () => {
      primary(false).click();
      await vi.waitFor(() =>
        expect(audioManager.getSnapshot().status).toBe('playing'),
      );
    });
    expect(FakeAudio.instances).toHaveLength(2);
    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(FakeAudio.instances[1].muted).toBe(true);
    expect(FakeAudio.instances[1].playbackRate).toBe(0.8);
    expect(container.querySelector('progress')?.value).toBe(0);
  });
  it('preserves the near-text unavailable message without a duplicate compact live region', async () => {
    render();
    await start();
    act(() => FakeAudio.instances[0].onerror?.());
    expect(container.querySelectorAll('[role="status"]')).toHaveLength(1);
    expect(container.querySelector('[role="status"]')?.textContent).toBe(
      t('en', 'features.audioUnavailable'),
    );
    expect(container.querySelector('.compact [role="status"]')).toBeNull();
    expect(container.querySelector('.audio-tools')).toBeNull();
    expect(container.querySelector('progress')).toBeNull();
    expect(primary().textContent).toBe(t('en', 'features.listen'));
  });
  it('keeps unrelated keys idle and stops the old narration on language change without autoloading', async () => {
    render({ other: true });
    await start();
    const audio = FakeAudio.instances[0];
    act(() => {
      audio.duration = 10;
      audio.currentTime = 5;
      audio.ontimeupdate?.();
    });
    const other = [...container.querySelectorAll('.audio-control')].at(-1);
    expect(other?.querySelector('.audio-main-button')?.textContent).toBe(
      t('en', 'features.listen'),
    );
    expect(other?.querySelector('progress')).toBeNull();
    expect(other?.querySelector('[role="status"]')).toBeNull();
    render({ full: false, other: true });
    expect(audioManager.getSnapshot().status).toBe('playing');
    expect(audio.pause).not.toHaveBeenCalled();
    const requests = fetchMock.mock.calls.length;
    render({ language: 'hi', other: true });
    expect(audioManager.getSnapshot().status).toBe('idle');
    expect(fetchMock).toHaveBeenCalledTimes(requests);
    expect(primary().textContent).toBe(t('hi', 'features.listen'));
    expect(container.querySelectorAll('[role="status"]')).toHaveLength(0);
    expect(audio.pause).toHaveBeenCalledTimes(1);
  });
});
