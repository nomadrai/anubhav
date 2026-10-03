import type { Language } from '../config/languages';
import { useNarration } from '../audio/useNarration';
import { t } from '../i18n';

export function AudioControls({
  language,
  id,
  spokenText,
  compact = false,
}: {
  language: Language;
  id: string;
  spokenText: string;
  compact?: boolean;
}) {
  const audio = useNarration(language, id, spokenText);
  const f = (key: string) => t(language, `features.${key}`);
  const active = audio.status === 'playing' || audio.status === 'paused';
  const primaryLabel =
    audio.status === 'playing'
      ? 'pauseAudio'
      : audio.status === 'paused'
        ? 'resumeAudio'
        : audio.status === 'loading'
          ? 'audioLoading'
          : audio.status === 'ended'
            ? 'replayAudio'
            : 'listen';
  const primaryAction =
    audio.status === 'playing'
      ? audio.pause
      : audio.status === 'paused'
        ? audio.resume
        : audio.play;
  const statusKey = `audio${audio.status.charAt(0).toUpperCase()}${audio.status.slice(1)}`;
  return (
    <div
      className={`audio-control${compact ? ' compact' : ''}`}
      role="group"
      aria-label={t(language, 'common.audio')}
    >
      <button
        type="button"
        className="audio-main-button"
        onClick={primaryAction}
        disabled={audio.status === 'loading'}
      >
        {f(primaryLabel)}
      </button>
      {(active || audio.status === 'ended') && (
        <progress
          className="audio-progress"
          max={1}
          value={audio.progress}
          aria-label={t(language, 'common.audio')}
        />
      )}
      {!compact && active && (
        <div className="audio-tools">
          <button type="button" onClick={audio.play}>
            {f('replayAudio')}
          </button>
          <button
            type="button"
            onClick={audio.toggleMute}
            aria-pressed={audio.muted}
          >
            {f(audio.muted ? 'unmuteAudio' : 'muteAudio')}
          </button>
          <label>
            {f('audioSpeed')}{' '}
            <select
              value={audio.speed}
              onChange={(event) => audio.setSpeed(Number(event.target.value))}
            >
              <option value={1}>{f('normalSpeed')}</option>
              <option value={0.8}>{f('slowSpeed')}</option>
            </select>
          </label>
        </div>
      )}
      {!compact && audio.status !== 'idle' && (
        <p role="status" className="quiet">
          {f(statusKey)}
        </p>
      )}
    </div>
  );
}
