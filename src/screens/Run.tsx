import type { Language } from '../config/languages';
import { DEFAULT_SIMULATION_CONFIG } from '../config/simulation';
import type { Episode } from '../data/episodes/episode.schema';
import { t, interpolate, formatRupees } from '../i18n';
import {
  useSimulationRun,
  type SimulationFinish,
} from '../journey/useSimulationRun';
import { BigButton } from '../components/BigButton';
import { PriceChart } from '../components/PriceChart';
import { EquityGauge } from '../components/EquityGauge';
import { MarginMeter } from '../components/MarginMeter';
import {
  JourneyFrame,
  type JourneyFrameProps,
} from '../components/JourneyFrame';
import enNarration from '../content/en/narration.json';
import hiNarration from '../content/hi/narration.json';

export function RunPlayback({
  language,
  episode,
  capital,
  leverage,
  onFinish,
  frame,
}: {
  language: Language;
  episode: Episode;
  capital: number;
  leverage: 1 | 2 | 5 | 10;
  onFinish: (result: SimulationFinish) => void;
  frame: Omit<JourneyFrameProps, 'children'>;
}) {
  const playback = useSimulationRun({
    episode,
    capital,
    leverage,
    config: DEFAULT_SIMULATION_CONFIG,
    onFinish,
  });
  const current = playback.current;
  if (!current)
    return (
      <JourneyFrame {...frame}>
        <p className="notice">{t(language, 'run.invalid')}</p>
      </JourneyFrame>
    );
  const statusKey =
    current.status === 'forced_exit'
      ? 'statusForced'
      : current.status === 'warning'
        ? 'statusWarning'
        : current.status === 'exited'
          ? 'statusExited'
          : 'statusOpen';
  const maintenance = capital * DEFAULT_SIMULATION_CONFIG.maintenanceFraction;
  const decisionText = t(
    language,
    playback.decision === 'warning' ? 'run.warningPoint' : 'run.decisionPoint',
  );
  const event = playback.firedEvents.at(-1);
  const eventNarration = (language === 'hi' ? hiNarration : enNarration).find(
    (item) => item.id === event?.id,
  );
  return (
    <JourneyFrame
      {...frame}
      narration={eventNarration ?? frame.narration}
      reading={
        <>
          {playback.decision !== 'none' ? (
            <div
              className="decision-card"
              role="group"
              aria-label={decisionText}
            >
              <strong>{decisionText}</strong>
              <p>{t(language, 'run.pauseBody')}</p>
            </div>
          ) : (
            <p className="quiet">
              {t(
                language,
                playback.manuallyPaused ? 'features.pausedPath' : 'run.playing',
              )}
            </p>
          )}
        </>
      }
      actions={
        playback.decision !== 'none' ? (
          <>
            <button className="secondary-action" onClick={playback.exitNow}>
              {t(language, 'run.exit')}
            </button>
            <BigButton onClick={playback.hold}>
              {t(language, 'run.resume')}
            </BigButton>
          </>
        ) : !playback.finished ? (
          <BigButton onClick={playback.togglePause}>
            {t(
              language,
              playback.manuallyPaused
                ? 'features.resumePath'
                : 'features.pausePath',
            )}
          </BigButton>
        ) : null
      }
    >
      <div className="run-panel">
        <div className="run-status" role="status">
          <strong>{t(language, `run.${statusKey}`)}</strong>
          <span>
            {interpolate(t(language, 'run.stepStatus'), {
              current: playback.playedCount,
              total: episode.bars.length,
            })}
          </span>
        </div>
        <PriceChart
          prices={episode.bars
            .slice(0, playback.playedCount)
            .map((bar) => bar.close)}
          lineLabel={t(language, 'run.priceLabel')}
          language={language}
        />
        <div className="meters-grid">
          <EquityGauge
            equity={current.equity}
            capital={capital}
            language={language}
            label={t(language, 'run.equityLabel')}
            startingAmountLabel={t(language, 'run.startingAmount')}
          />
          <MarginMeter
            status={current.status}
            equity={current.equity}
            capital={capital}
            warnLevel={maintenance * DEFAULT_SIMULATION_CONFIG.warnBuffer}
            maintenanceLevel={maintenance}
            language={language}
          />
        </div>
        {episode.intradayAvailable && (
          <p className="quiet">
            {interpolate(t(language, 'run.lowEquity'), {
              amount: formatRupees(current.equityLow, language),
            })}
          </p>
        )}
      </div>
    </JourneyFrame>
  );
}
