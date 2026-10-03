import { useState } from 'react';
import { type Language } from './config/languages';
import { DEFAULT_EPISODE_ID } from './config/episodes';
import { STARTING_CAPITAL } from './config/simulation';
import { episodeById, episodes } from './data/episodes';
import resources from './content/resources.json';
import enNarration from './content/en/narration.json';
import hiNarration from './content/hi/narration.json';
import {
  t,
  interpolate,
  formatNumber,
  formatPercent,
  formatRupees,
} from './i18n';
import { useJourney } from './journey/JourneyContext';
import { JOURNEY_STEPS, stepNumber, type JourneyStep } from './journey/steps';
import { displayEquity } from './journey/displayEquity';
import { BigButton } from './components/BigButton';
import { CompareChart } from './components/CompareChart';
import { PriceChart } from './components/PriceChart';
import { JourneyFrame } from './components/JourneyFrame';
import { readPreference, savePreference } from './journey/preferences';
import { RunPlayback } from './screens/Run';
import { PilotSummary } from './screens/PilotSummary';
import { DebriefLessons } from './screens/Debrief';
import { LanguageEntry } from './screens/LanguageEntry';

const narration = { en: enNarration, hi: hiNarration };
const predictionOptions = [
  'bigGain',
  'smallGain',
  'smallLoss',
  'almostEverything',
];
interface Resource {
  id: string;
  url: string;
  verified: boolean;
  labelKey?: string;
  label?: { en: string; hi: string };
}

export default function JourneyExperience() {
  const { state: recordedState, dispatch } = useJourney();
  // Reading-only Back navigation never rewinds/replays the engine or advances the reducer.
  const [viewedStep, setViewedStep] = useState<JourneyStep>();
  const state = { ...recordedState, step: viewedStep ?? recordedState.step };
  const [showPilotSummary, setShowPilotSummary] = useState(
    new URLSearchParams(window.location.search).get('pilot') === '1',
  );
  const [stake, setStake] = useState(25);
  const [leverage, setLeverage] = useState<1 | 2 | 5 | 10>(2);
  const [episodeId, setEpisodeId] = useState(DEFAULT_EPISODE_ID);
  const preferredLanguage = readPreference('language') === 'hi' ? 'hi' : 'en';
  const language = state.language ?? preferredLanguage;
  const text = (key: string) => t(language, key);
  const f = (key: string) => text(`features.${key}`);
  const episode = episodeById.get(state.episodeId ?? episodeId);
  if (!episode) throw new Error('Configured episode is unavailable');
  const currentNarration = narration[language].find(
    (item) => item.id === `${state.step.toLowerCase()}.main`,
  );
  const next = () => {
    if (viewedStep) {
      const following = JOURNEY_STEPS[stepNumber(viewedStep) + 1];
      setViewedStep(following === recordedState.step ? undefined : following);
    } else dispatch({ type: 'next' });
  };
  const onBack = ['LanguageSelect', 'Run', 'Result'].includes(state.step)
    ? undefined
    : () => setViewedStep(JOURNEY_STEPS[stepNumber(state.step) - 1]);
  const restart = () => {
    setViewedStep(undefined);
    setShowPilotSummary(false);
    setStake(25);
    setLeverage(2);
    setEpisodeId(DEFAULT_EPISODE_ID);
    dispatch({ type: 'restart' });
  };
  const chooseLanguage = (value: Language) => {
    savePreference('language', value);
    setViewedStep(undefined);
    dispatch({ type: 'chooseLanguage', language: value });
  };
  const changeLanguage = (value: Language) => {
    savePreference('language', value);
    dispatch({ type: 'changeLanguage', language: value });
  };

  if (!state.language || state.step === 'LanguageSelect')
    return (
      <LanguageEntry
        language={language}
        onChoose={chooseLanguage}
        onLanguage={changeLanguage}
      />
    );

  const contentKey =
    state.step === 'PostCheck'
      ? 'postCheck'
      : state.step.charAt(0).toLowerCase() + state.step.slice(1);
  const summary = state.step === 'NextSteps' && showPilotSummary;
  const frame = {
    language,
    step: state.step,
    onLanguage: changeLanguage,
    onBack,
    title: summary
      ? f('pilotTitle')
      : state.step === 'Setup'
        ? f('setupTitle')
        : text(`${contentKey}.title`),
    body: summary
      ? f('pilotBody')
      : state.step === 'Intro'
        ? f('introBody')
        : state.step === 'Setup'
          ? f('setupBody')
          : state.step === 'Prediction'
            ? f('predictionBody')
            : state.step === 'Replay'
              ? f('comparisonLimit')
              : state.step === 'NextSteps'
                ? f('nextBody')
                : text(`${contentKey}.body`),
    eyebrow: text(`${contentKey}.eyebrow`),
    narration: summary ? undefined : currentNarration,
    focusKey: summary ? 'summary' : 'journey',
  };
  const capital = STARTING_CAPITAL * ((state.stake ?? stake) / 100);
  const action = (label: string) => (
    <BigButton onClick={next}>{label}</BigButton>
  );
  const compare =
    state.leveragedRun && state.unleveragedRun ? (
      <CompareChart
        leveraged={displayEquity(state.leveragedRun)}
        unleveraged={displayEquity(state.unleveragedRun)}
        leveragedLabel={text('replay.leveragedLine')}
        unleveragedLabel={text('replay.unleveragedLine')}
        language={language}
      />
    ) : null;

  if (summary)
    return (
      <PilotSummary
        frame={frame}
        language={language}
        state={state}
        onBack={() => setShowPilotSummary(false)}
        onRestart={restart}
      />
    );

  if (state.step === 'Run')
    return (
      <RunPlayback
        frame={frame}
        language={language}
        episode={episode}
        capital={capital}
        leverage={state.leverage ?? leverage}
        onFinish={(result) => dispatch({ type: 'recordRun', ...result })}
      />
    );

  if (state.step === 'Result' && state.leveragedRun) {
    const outcomeKey =
      state.leveragedRun.final.outcome === 'forced_exit'
        ? 'forcedExitLine'
        : state.leveragedRun.final.outcome === 'user_exit'
          ? 'userExitLine'
          : 'survivedLine';
    return (
      <JourneyFrame
        {...frame}
        reading={
          <>
            <p className="notice outcome-line">
              {text(`result.${outcomeKey}`)}
            </p>
            {state.leveragedRun.final.outcome === 'forced_exit' && (
              <p className="quiet">{f('settlement')}</p>
            )}
          </>
        }
        actions={action(text('result.continue'))}
      >
        <div className="result-grid">
          <div>
            <span>{text('result.finalEquity')}</span>
            <strong>
              {formatRupees(state.leveragedRun.final.equity, language)}
            </strong>
          </div>
          <div>
            <span>{text('result.change')}</span>
            <strong>
              {formatPercent(state.leveragedRun.final.pnlPct, language)}
            </strong>
          </div>
        </div>
        <PriceChart
          prices={state.leveragedRun.timeline.map((point) => point.price)}
          lineLabel={text('run.priceLabel')}
          language={language}
        />
      </JourneyFrame>
    );
  }

  if (state.step === 'Replay' && state.comparison) {
    const recovery =
      state.comparison.requiredRecoveryGain === null
        ? text('replay.requiredGainNone')
        : interpolate(text('replay.requiredGain'), {
            gain: formatPercent(
              state.comparison.requiredRecoveryGain,
              language,
            ),
          });
    return (
      <JourneyFrame
        {...frame}
        reading={<p className="quiet">{f('settlement')}</p>}
        actions={action(text('replay.continue'))}
      >
        {compare}
        <div className="comparison-tiles">
          <p>
            {interpolate(text('replay.leveragedFinal'), {
              amount: formatRupees(
                state.comparison.leveragedFinalEquity,
                language,
              ),
            })}
          </p>
          <p>
            {interpolate(text('replay.unleveragedFinal'), {
              amount: formatRupees(
                state.comparison.unleveragedFinalEquity,
                language,
              ),
            })}
          </p>
        </div>
        <p className="quiet">
          {interpolate(text('replay.difference'), {
            amount: formatRupees(state.comparison.difference, language),
          })}
        </p>
        <p className="notice">{recovery}</p>
      </JourneyFrame>
    );
  }

  if (state.step === 'Reveal') {
    const firstDate = episode.bars[0].date;
    const lastDate = episode.bars.at(-1)?.date;
    const period =
      firstDate && lastDate
        ? `${firstDate} — ${lastDate}`
        : episode.reveal.periodText[language];
    const downCloses = episode.bars
      .slice(1)
      .reduce(
        (count, bar, index) =>
          count + (bar.close < episode.bars[index].close ? 1 : 0),
        0,
      );
    return (
      <JourneyFrame
        {...frame}
        reading={<p className="notice">{text('reveal.oneEpisode')}</p>}
        actions={action(text('reveal.continue'))}
      >
        <div className="reveal-grid">
          <div>
            <span>{text('reveal.periodLabel')}</span>
            <strong>{period}</strong>
          </div>
          <div>
            <span>{text('reveal.whatHappenedLabel')}</span>
            <p>
              {episode.isPlaceholder
                ? text('common.syntheticLabel')
                : f('revealNeutral')}
            </p>
          </div>
        </div>
        <p className="quiet">{text('reveal.statsLabel')}</p>
        <div className="stats-grid">
          {[
            [
              text('reveal.statsMaxDrawdown'),
              formatPercent(episode.stats.maxDrawdown, language),
            ],
            [
              text('reveal.statsWorstFall'),
              formatPercent(episode.stats.worstSingleDayFall, language),
            ],
            [
              text('reveal.statsDownCloses'),
              formatNumber(downCloses, language),
            ],
            [
              text('reveal.statsBarCount'),
              formatNumber(episode.stats.barCount, language),
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        {episode.sourceLabel && <p>{episode.sourceLabel[language]}</p>}
        <p className="quiet">{f('sourceNote')}</p>
      </JourneyFrame>
    );
  }

  if (state.step === 'Debrief' && state.leveragedRun && state.unleveragedRun)
    return <DebriefLessons frame={frame} state={state} onContinue={next} />;

  if (state.step === 'NextSteps') {
    const verified = (resources as Resource[]).filter(
      (resource) =>
        resource.verified && /^https:\/\/[^\s]+$/.test(resource.url),
    );
    return (
      <JourneyFrame
        {...frame}
        reading={<p className="notice">{f('resourceFallback')}</p>}
        actions={
          <>
            <button className="secondary-action" onClick={restart}>
              {f('restart')}
            </button>
            <BigButton onClick={() => setShowPilotSummary(true)}>
              {f('pilotOpen')}
            </BigButton>
          </>
        }
      >
        <div className="resource-list">
          {verified.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-description={f('externalLink')}
            >
              <span>
                {resource.label?.[language] ??
                  text(resource.labelKey ?? 'features.noResources')}
              </span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
        {!verified.length && <p className="notice">{f('noResources')}</p>}
      </JourneyFrame>
    );
  }

  const isPost = state.step === 'PostCheck';
  const isPrediction = state.step === 'Prediction' || isPost;
  const active = isPost ? state.postPrediction : state.prediction;
  const setupCapital = (STARTING_CAPITAL * stake) / 100;
  return (
    <JourneyFrame
      {...frame}
      actions={
        state.step === 'Setup' ? (
          <BigButton
            onClick={() => {
              dispatch({ type: 'setup', stake, leverage, episodeId });
              next();
            }}
          >
            {text('setup.continue')}
          </BigButton>
        ) : (
          <BigButton
            disabled={isPrediction && (!active || (isPost && !state.wouldTake))}
            onClick={next}
          >
            {text(`${contentKey}.continue`)}
          </BigButton>
        )
      }
    >
      {state.step === 'Intro' && (
        <section className="journey-preview" aria-label={f('previewTitle')}>
          <h2>{f('previewTitle')}</h2>
          <ol>
            {['Predict', 'Watch', 'Compare', 'Learn'].map((key, index) => (
              <li key={key}>
                <span className="preview-number" aria-hidden="true">
                  {formatNumber(index + 1, language)}
                </span>
                <span>{f(`preview${key}`)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
      {state.step === 'Setup' && (
        <div className="controls setup-controls">
          <fieldset>
            <legend>{f('episodeChoice')}</legend>
            <div className="choice-grid">
              {episodes.map((item, index) => (
                <BigButton
                  key={item.id}
                  aria-pressed={episodeId === item.id}
                  className={episodeId === item.id ? 'selected' : ''}
                  onClick={() => setEpisodeId(item.id)}
                >
                  {interpolate(f('episode'), {
                    number: formatNumber(index + 1, language),
                  })}
                </BigButton>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>{f('amountChoice')}</legend>
            <div className="choice-grid three-choices">
              {[25, 50, 100].map((value) => (
                <BigButton
                  key={value}
                  aria-pressed={stake === value}
                  className={stake === value ? 'selected' : ''}
                  onClick={() => setStake(value)}
                >
                  {text(`setup.stake${value}`)}
                </BigButton>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>{f('borrowedExposure')}</legend>
            <div className="choice-grid three-choices">
              {([2, 5, 10] as const).map((value) => (
                <BigButton
                  key={value}
                  aria-pressed={leverage === value}
                  className={leverage === value ? 'selected' : ''}
                  onClick={() => setLeverage(value)}
                >
                  {text(`setup.leverage${value}`)}
                </BigButton>
              ))}
            </div>
          </fieldset>
          <section
            className="summary-tile"
            aria-live="polite"
            aria-label={f('summaryTitle')}
          >
            <h2>{f('summaryTitle')}</h2>
            <p>
              {interpolate(f('summaryAmount'), {
                amount: formatRupees(setupCapital, language),
              })}
            </p>
            <p>
              {interpolate(f('summaryExposure'), {
                multiplier: formatNumber(leverage, language),
                amount: formatRupees(setupCapital * leverage, language),
              })}
            </p>
            <p className="quiet">
              {interpolate(f('summaryMove'), {
                amount: formatRupees(setupCapital * leverage * 0.01, language),
              })}
            </p>
          </section>
        </div>
      )}
      {isPrediction && (
        <div
          className="choice-grid prediction-grid"
          role="group"
          aria-label={text('prediction.title')}
        >
          {predictionOptions.map((key) => (
            <BigButton
              key={key}
              aria-pressed={active === key}
              className={active === key ? 'selected' : ''}
              onClick={() =>
                dispatch({
                  type: 'answer',
                  field: isPost ? 'postPrediction' : 'prediction',
                  value: key,
                })
              }
            >
              {text(`prediction.${key}`)}
            </BigButton>
          ))}
        </div>
      )}
      {isPost && (
        <div className="controls post-controls">
          <fieldset>
            <legend>{f('postQuestion')}</legend>
            <div className="choice-grid three-choices">
              {['yes', 'no', 'notSure'].map((key) => (
                <BigButton
                  key={key}
                  aria-pressed={state.wouldTake === key}
                  className={state.wouldTake === key ? 'selected' : ''}
                  onClick={() =>
                    dispatch({ type: 'answer', field: 'wouldTake', value: key })
                  }
                >
                  {text(`postCheck.${key}`)}
                </BigButton>
              ))}
            </div>
          </fieldset>
          {active && state.wouldTake && (
            <p className="notice before-after">
              {state.prediction === state.postPrediction
                ? text('postCheck.unchanged')
                : interpolate(text('postCheck.changed'), {
                    before: text(`prediction.${state.prediction}`),
                    after: text(`prediction.${state.postPrediction}`),
                  })}
            </p>
          )}
        </div>
      )}
    </JourneyFrame>
  );
}
