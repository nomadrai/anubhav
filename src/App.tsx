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
import { displayEquity } from './journey/displayEquity';
import { BigButton } from './components/BigButton';
import { CompareChart } from './components/CompareChart';
import { PriceChart } from './components/PriceChart';
import { GlossaryCard } from './components/GlossaryCard';
import { JourneyFrame } from './components/JourneyFrame';
import { readPreference, savePreference } from './journey/preferences';
import { RunPlayback } from './screens/Run';
import { PilotSummary } from './screens/PilotSummary';
import type { DebriefBlockId } from './engine/types';

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

export default function App() {
  const { state, dispatch } = useJourney();
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
  const next = () => dispatch({ type: 'next' });
  const restart = () => {
    setShowPilotSummary(false);
    setStake(25);
    setLeverage(2);
    setEpisodeId(DEFAULT_EPISODE_ID);
    dispatch({ type: 'restart' });
  };
  const chooseLanguage = (value: Language) => {
    savePreference('language', value);
    dispatch({ type: 'chooseLanguage', language: value });
  };
  const changeLanguage = (value: Language) => {
    savePreference('language', value);
    dispatch({ type: 'changeLanguage', language: value });
  };

  if (!state.language)
    return (
      <JourneyFrame
        language={language}
        step="LanguageSelect"
        title={text('languageSelect.title')}
        body={text('languageSelect.body')}
        eyebrow={text('languageSelect.eyebrow')}
      >
        <div className="choice-grid">
          <BigButton lang="hi" onClick={() => chooseLanguage('hi')}>
            {t('hi', 'languageSelect.hindi')}
          </BigButton>
          <BigButton lang="en" onClick={() => chooseLanguage('en')}>
            {t('en', 'languageSelect.english')}
          </BigButton>
        </div>
      </JourneyFrame>
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

  if (summary)
    return (
      <JourneyFrame {...frame}>
        <PilotSummary
          language={language}
          state={state}
          onBack={() => setShowPilotSummary(false)}
          onRestart={restart}
        />
      </JourneyFrame>
    );

  if (state.step === 'Run')
    return (
      <JourneyFrame {...frame}>
        <RunPlayback
          language={language}
          episode={episode}
          capital={capital}
          leverage={state.leverage ?? leverage}
          onFinish={(result) => dispatch({ type: 'recordRun', ...result })}
        />
      </JourneyFrame>
    );

  if (state.step === 'Result' && state.leveragedRun) {
    const outcomeKey =
      state.leveragedRun.final.outcome === 'forced_exit'
        ? 'forcedExitLine'
        : state.leveragedRun.final.outcome === 'user_exit'
          ? 'userExitLine'
          : 'survivedLine';
    return (
      <JourneyFrame {...frame}>
        <PriceChart
          prices={state.leveragedRun.timeline.map((point) => point.price)}
          lineLabel={text('run.priceLabel')}
          language={language}
        />
        <div className="result-grid">
          <div>
            <span className="quiet">{text('result.finalEquity')}</span>
            <strong>
              {formatRupees(state.leveragedRun.final.equity, language)}
            </strong>
          </div>
          <div>
            <span className="quiet">{text('result.change')}</span>
            <strong>
              {formatPercent(state.leveragedRun.final.pnlPct, language)}
            </strong>
          </div>
        </div>
        <p className="notice">{text(`result.${outcomeKey}`)}</p>
        {state.leveragedRun.final.outcome === 'forced_exit' && (
          <p>{f('settlement')}</p>
        )}
        <BigButton onClick={next}>{text('result.continue')}</BigButton>
      </JourneyFrame>
    );
  }

  if (
    state.step === 'Replay' &&
    state.leveragedRun &&
    state.unleveragedRun &&
    state.comparison
  ) {
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
      <JourneyFrame {...frame}>
        <CompareChart
          leveraged={displayEquity(state.leveragedRun)}
          unleveraged={displayEquity(state.unleveragedRun)}
          leveragedLabel={text('replay.leveragedLine')}
          unleveragedLabel={text('replay.unleveragedLine')}
          language={language}
        />
        <p className="quiet">{f('settlement')}</p>
        <div className="comparison-list">
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
          <p>
            {interpolate(text('replay.difference'), {
              amount: formatRupees(state.comparison.difference, language),
            })}
          </p>
          <p className="notice">{recovery}</p>
        </div>
        <BigButton onClick={next}>{text('replay.continue')}</BigButton>
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
      <JourneyFrame {...frame}>
        <div className="reveal-grid">
          <div>
            <span className="quiet">{text('reveal.periodLabel')}</span>
            <strong>{period}</strong>
          </div>
          <div>
            <span className="quiet">{text('reveal.whatHappenedLabel')}</span>
            <strong>
              {episode.isPlaceholder
                ? text('common.syntheticLabel')
                : f('revealNeutral')}
            </strong>
          </div>
        </div>
        {episode.sourceLabel && <p>{episode.sourceLabel[language]}</p>}
        <p>{f('sourceNote')}</p>
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
        <p className="notice">{text('reveal.oneEpisode')}</p>
        <BigButton onClick={next}>{text('reveal.continue')}</BigButton>
      </JourneyFrame>
    );
  }

  if (state.step === 'Debrief' && state.leveragedRun) {
    const debriefText = (block: DebriefBlockId) =>
      block === 'recoveryMaths'
        ? state.comparison?.requiredRecoveryGain === null
          ? text('debrief.recoveryNone')
          : interpolate(text('debrief.recoveryInterpolated'), {
              finalAmount: formatRupees(
                state.leveragedRun?.final.equity ?? 0,
                language,
              ),
              startAmount: formatRupees(
                state.leveragedRun?.capital ?? capital,
                language,
              ),
              gain: formatPercent(
                state.comparison?.requiredRecoveryGain ?? 0,
                language,
              ),
            })
        : text(`debrief.${block}Body`);
    return (
      <JourneyFrame {...frame}>
        <div className="debrief-list">
          {(state.debriefBlocks ?? []).map((block) => (
            <article className="debrief-block" key={block}>
              <h2>{text(`debrief.${block}`)}</h2>
              <p>{debriefText(block)}</p>
            </article>
          ))}
        </div>
        <GlossaryCard language={language} />
        <BigButton onClick={next}>{text('debrief.continue')}</BigButton>
      </JourneyFrame>
    );
  }

  if (state.step === 'NextSteps') {
    const verified = (resources as Resource[]).filter(
      (resource) =>
        resource.verified && /^https:\/\/[^\s]+$/.test(resource.url),
    );
    return (
      <JourneyFrame {...frame}>
        <div className="resource-list">
          {verified.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-description={f('externalLink')}
            >
              {resource.label?.[language] ??
                text(resource.labelKey ?? 'features.noResources')}
            </a>
          ))}
        </div>
        {!verified.length && <p className="notice">{f('noResources')}</p>}
        <p>{f('resourceFallback')}</p>
        <BigButton onClick={() => setShowPilotSummary(true)}>
          {f('pilotOpen')}
        </BigButton>
        <button className="link-button" onClick={restart}>
          {f('restart')}
        </button>
      </JourneyFrame>
    );
  }

  const isPost = state.step === 'PostCheck';
  const isPrediction = state.step === 'Prediction' || isPost;
  const active = isPost ? state.postPrediction : state.prediction;
  return (
    <JourneyFrame {...frame}>
      {state.step === 'Setup' && (
        <div className="controls">
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
            <legend>{text('setup.stake')}</legend>
            <div className="choice-grid">
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
            <legend>{text('setup.leverage')}</legend>
            <div className="choice-grid">
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
          <p className="quiet">
            {text('setup.capital')} · {formatRupees(capital, language)}
          </p>
        </div>
      )}
      {isPrediction && (
        <div
          className="choice-grid"
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
        <div className="controls">
          <fieldset>
            <legend>{f('postQuestion')}</legend>
            <div className="choice-grid">
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
            <p className="notice">
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
      {state.step === 'Setup' ? (
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
      )}
    </JourneyFrame>
  );
}
