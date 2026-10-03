import { useState } from 'react';
import type { Language } from '../config/languages';
import type { JourneyState } from '../journey/journeyReducer';
import { t, formatNumber } from '../i18n';
import { BigButton } from '../components/BigButton';

export function PilotSummary({
  language,
  state,
  onBack,
  onRestart,
}: {
  language: Language;
  state: JourneyState;
  onBack: () => void;
  onRestart: () => void;
}) {
  const [copyStatus, setCopyStatus] = useState('');
  const f = (key: string) => t(language, `features.${key}`);
  const answer = (prefix: string, value?: string) =>
    value ? t(language, `${prefix}.${value}`) : f('pilotMissing');
  const outcome = state.leveragedRun?.final.outcome;
  const rows = [
    [f('pilotBefore'), answer('prediction', state.prediction)],
    [f('pilotAfter'), answer('prediction', state.postPrediction)],
    [f('pilotExplanation'), answer('postCheck', state.wouldTake)],
    [
      f('pilotExposure'),
      state.leverage
        ? formatNumber(state.leverage, language)
        : f('pilotMissing'),
    ],
    [
      f('pilotOutcome'),
      outcome
        ? t(
            language,
            `result.${outcome === 'forced_exit' ? 'forcedExitLine' : outcome === 'user_exit' ? 'userExitLine' : 'survivedLine'}`,
          )
        : f('pilotMissing'),
    ],
  ];
  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(
        rows.map(([label, value]) => `${label}: ${value}`).join('\n'),
      );
      setCopyStatus('pilotCopied');
    } catch {
      setCopyStatus('pilotCopyFailed');
    }
  };
  return (
    <div className="pilot-summary">
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <BigButton onClick={() => void copy()}>{f('pilotCopy')}</BigButton>
      {copyStatus && <p role="status">{f(copyStatus)}</p>}
      <button className="link-button" onClick={onBack}>
        {f('pilotBack')}
      </button>
      <button className="link-button" onClick={onRestart}>
        {f('restart')}
      </button>
    </div>
  );
}
