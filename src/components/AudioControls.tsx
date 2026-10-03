import { useId } from 'react';
import type { Language } from '../config/languages';
import { useNarration } from '../audio/useNarration';
import { t } from '../i18n';

export function AudioControls({
  language,
  id,
  spokenText,
}: {
  language: Language;
  id: string;
  spokenText: string;
}) {
  const audio = useNarration(language, id, spokenText);
  const labelId = useId();
  const f = (key: string) => t(language, `features.${key}`);
  const active = ['playing', 'paused', 'ended'].includes(audio.status);
  const statusKey = `audio${audio.status.charAt(0).toUpperCase()}${audio.status.slice(1)}`;
  return (
    <div className="audio-control" role="group" aria-labelledby={labelId}>
      <strong id={labelId}>{f('audio')}</strong>
      <div className="compact-controls">
        {audio.status === 'playing' ? (
          <button onClick={audio.pause}>{f('pauseAudio')}</button>
        ) : audio.status === 'paused' ? (
          <button onClick={audio.resume}>{f('resumeAudio')}</button>
        ) : (
          <button onClick={audio.play} disabled={audio.status === 'loading'}>
            {f('listen')}
          </button>
        )}
        {active && (
          <>
            <button onClick={audio.play}>{f('replayAudio')}</button>
            <button onClick={audio.toggleMute} aria-pressed={audio.muted}>
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
          </>
        )}
      </div>
      <p role="status" className="quiet">
        {f(statusKey)}
      </p>
    </div>
  );
}
