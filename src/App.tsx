import { useMemo, useState, type ReactNode } from 'react';
import { APP_NAME } from './config/app';
import { type Language } from './config/languages';
import { DEFAULT_EPISODE_ID } from './config/episodes';
import { DEFAULT_SIMULATION_CONFIG, STARTING_CAPITAL } from './config/simulation';
import { episodeById } from './data/episodes';
import resources from './content/resources.json';
import enNarration from './content/en/narration.json';
import hiNarration from './content/hi/narration.json';
import { t, interpolate } from './i18n';
import { formatNumber, formatPercent, formatRupees } from './i18n/format';
import { stepNumber, type JourneyStep } from './journey/steps';
import { useJourney } from './journey/JourneyContext';
import { useSimulationRun, type SimulationFinish } from './journey/useSimulationRun';
import { BigButton } from './components/BigButton';
import { CaptionBar } from './components/CaptionBar';
import { AudioControls } from './components/AudioControls';
import { CompareChart } from './components/CompareChart';
import { EquityGauge } from './components/EquityGauge';
import { MarginMeter } from './components/MarginMeter';
import { PriceChart } from './components/PriceChart';
import type { DebriefBlockId } from './engine/types';

const narration = { en: enNarration, hi: hiNarration };
const options = {
  prediction: ['bigGain', 'smallGain', 'smallLoss', 'almostEverything'],
  postPrediction: ['bigGain', 'smallGain', 'smallLoss', 'almostEverything'],
} as const;
const configuredEpisode = episodeById.get(DEFAULT_EPISODE_ID);
if (!configuredEpisode) throw new Error(`Missing configured episode: ${DEFAULT_EPISODE_ID}`);
const episode = configuredEpisode;

type Resource = (typeof resources)[number];

function text(language: Language | undefined, key: string) { return t(language ?? 'en', key); }

function JourneyFrame({ language, step, title, body, eyebrow, children, narrationText }: { language: Language; step: JourneyStep; title: string; body: string; eyebrow: string; children: ReactNode; narrationText: string }) {
  return (
    <main className="shell">
      <header className="topbar">
        <span className="eyebrow">{APP_NAME}</span>
        <span className="step-count">{text(language, 'common.step')} {stepNumber(step) + 1}/11</span>
      </header>
      <section className="card" aria-labelledby="screen-title">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="screen-title">{title}</h1>
        <p>{body}</p>
        <CaptionBar text={narrationText} />
        <AudioControls label={text(language, 'common.audioUnavailable')} />
        {children}
      </section>
    </main>
  );
}

function RunPlayback({ language, capital, leverage, onFinish }: { language: Language; capital: number; leverage: 1 | 2 | 5 | 10; onFinish: (result: SimulationFinish) => void }) {
  const playback = useSimulationRun({ episode, capital, leverage, config: DEFAULT_SIMULATION_CONFIG, onFinish });
  const current = playback.current;
  if (!current) return <p className="notice">{text(language, 'run.invalid')}</p>;

  const statusKey = current.status === 'forced_exit' ? 'statusForced' : current.status === 'warning' ? 'statusWarning' : current.status === 'exited' ? 'statusExited' : 'statusOpen';
  const statusText = text(language, `run.${statusKey}`);
  const prices = episode.bars.slice(0, playback.playedCount).map((bar) => bar.close);
  const maintenance = capital * DEFAULT_SIMULATION_CONFIG.maintenanceFraction;
  const warningLevel = maintenance * DEFAULT_SIMULATION_CONFIG.warnBuffer;
  const decisionText = playback.decision === 'warning' ? text(language, 'run.warningPoint') : text(language, 'run.decisionPoint');

  return (
    <div className="run-panel">
      <p className="synthetic-label">{text(language, 'common.syntheticLabel')}</p>
      <PriceChart prices={prices} lineLabel={text(language, 'run.priceLabel')} language={language} />
      <div className="run-status" aria-live="polite">
        <strong>{statusText}</strong> · {interpolate(text(language, 'run.stepStatus'), {current: playback.playedCount, total: episode.bars.length})}
      </div>
      <EquityGauge
        equity={current.equity}
        capital={capital}
        language={language}
        label={text(language, 'run.equityLabel')}
        startingAmountLabel={text(language, 'run.startingAmount')}
      />
      <MarginMeter
        status={current.status}
        equity={current.equity}
        capital={capital}
        warnLevel={warningLevel}
        maintenanceLevel={maintenance}
        language={language}
      />
      {episode.intradayAvailable && <p className="quiet">{interpolate(text(language, 'run.lowEquity'), {amount: formatRupees(current.equityLow, language)})}</p>}
      {playback.decision !== 'none' ? (
        <div className="decision-card" role="group" aria-label={decisionText}>
          <strong>{decisionText}</strong>
          <p>{text(language, 'run.pauseBody')}</p>
          <div className="choice-grid">
            <BigButton onClick={playback.hold}>{text(language, 'run.resume')}</BigButton>
            <BigButton onClick={playback.exitNow}>{text(language, 'run.exit')}</BigButton>
          </div>
        </div>
      ) : playback.finished ? null : <p className="quiet" aria-live="polite">{text(language, 'run.playing')}</p>}
    </div>
  );
}

export default function App() {
  const { state, dispatch } = useJourney();
  const language = state.language;
  const [selectedPrediction, setSelectedPrediction] = useState<string>();
  const [selectedPost, setSelectedPost] = useState<string>();
  const [showPilotSummary, setShowPilotSummary] = useState(new URLSearchParams(window.location.search).get('pilot') === '1');
  const [stake, setStake] = useState(25);
  const [leverage, setLeverage] = useState<1 | 2 | 5 | 10>(2);
  const currentNarration = useMemo(() => {
    const id = `${state.step === 'PostCheck' ? 'postcheck' : state.step.toLowerCase()}.main`;
    return (narration[language ?? 'en'] as typeof enNarration).find((item) => item.id === id)?.displayText ?? '';
  }, [language, state.step]);
  const next = () => dispatch({ type: 'next' });
  const restart = () => { setSelectedPrediction(undefined); setSelectedPost(undefined); dispatch({ type: 'restart' }); };

  if (!language) return <main className="shell language-screen"><header><span className="eyebrow">{APP_NAME}</span></header><section className="card"><p className="eyebrow">{text('en', 'languageSelect.eyebrow')}</p><h1>{text('en', 'languageSelect.title')}</h1><p>{text('en', 'languageSelect.body')}</p><div className="choice-grid"><BigButton onClick={() => dispatch({ type: 'chooseLanguage', language: 'hi' })}>{text('hi', 'languageSelect.hindi')}</BigButton><BigButton onClick={() => dispatch({ type: 'chooseLanguage', language: 'en' })}>{text('en', 'languageSelect.english')}</BigButton></div></section></main>;

  if (state.step === 'NextSteps' && showPilotSummary) return <main className="shell"><header className="topbar"><span className="eyebrow">{APP_NAME}</span></header><section className="card"><p className="eyebrow">{text(language, 'pilotSummary.eyebrow')}</p><h1>{text(language, 'pilotSummary.title')}</h1><p>{text(language, 'pilotSummary.body')}</p><pre className="summary">{JSON.stringify({ prediction: state.prediction ?? null, postPrediction: state.postPrediction ?? null, wouldTake: state.wouldTake ?? null }, null, 2)}</pre><BigButton onClick={() => void navigator.clipboard?.writeText(JSON.stringify({ prediction: state.prediction ?? null, postPrediction: state.postPrediction ?? null, wouldTake: state.wouldTake ?? null }))}>{text(language, 'pilotSummary.copy')}</BigButton><button className="link-button" onClick={() => setShowPilotSummary(false)}>{text(language, 'pilotSummary.back')}</button></section></main>;

  const contentKey = state.step === 'PostCheck' ? 'postCheck' : state.step.charAt(0).toLowerCase() + state.step.slice(1);
  const title = text(language, `${contentKey}.title`);
  const body = text(language, `${contentKey}.body`);
  const eyebrow = text(language, `${contentKey}.eyebrow`);
  const continueLabel = text(language, `${contentKey}.continue`);
  const isPrediction = state.step === 'Prediction' || state.step === 'PostCheck';
  const active = state.step === 'PostCheck' ? selectedPost : selectedPrediction;
  const capital = STARTING_CAPITAL * ((state.stake ?? stake) / 100);
  const selectedWouldTake = state.wouldTake;
  const selectAnswer = (value: string) => {
    if (state.step === 'PostCheck') { setSelectedPost(value); dispatch({ type: 'answer', field: 'postPrediction', value }); }
    else { setSelectedPrediction(value); dispatch({ type: 'answer', field: 'prediction', value }); }
  };
  const recordRun = (result: SimulationFinish) => dispatch({ type: 'recordRun', ...result });

  if (state.step === 'Run') return <JourneyFrame language={language} step={state.step} title={title} body={body} eyebrow={eyebrow} narrationText={currentNarration}><RunPlayback language={language} capital={capital} leverage={state.leverage ?? leverage} onFinish={recordRun} /></JourneyFrame>;

  if (state.step === 'Result' && state.leveragedRun) {
    const outcomeKey = state.leveragedRun.final.outcome === 'forced_exit' ? 'forcedExitLine' : state.leveragedRun.final.outcome === 'user_exit' ? 'userExitLine' : 'survivedLine';
    return <JourneyFrame language={language} step={state.step} title={title} body={body} eyebrow={eyebrow} narrationText={currentNarration}><PriceChart prices={state.leveragedRun.timeline.map((point) => point.price)} lineLabel={text(language, 'run.priceLabel')} language={language} /><div className="result-grid"><div><span className="quiet">{text(language, 'result.finalEquity')}</span><strong>{formatRupees(state.leveragedRun.final.equity, language)}</strong></div><div><span className="quiet">{text(language, 'result.change')}</span><strong>{formatPercent(state.leveragedRun.final.pnlPct, language)}</strong></div></div><p className="notice">{text(language, `result.${outcomeKey}`)}</p><BigButton onClick={next}>{text(language, 'result.continue')}</BigButton></JourneyFrame>;
  }

  if (state.step === 'Replay' && state.leveragedRun && state.unleveragedRun && state.comparison) {
    const recovery = state.comparison.requiredRecoveryGain === null ? text(language, 'replay.requiredGainNone') : interpolate(text(language, 'replay.requiredGain'), { gain: formatPercent(state.comparison.requiredRecoveryGain, language) });
    return <JourneyFrame language={language} step={state.step} title={title} body={body} eyebrow={eyebrow} narrationText={currentNarration}><CompareChart leveraged={state.leveragedRun.timeline.map((point) => point.equity)} unleveraged={state.unleveragedRun.timeline.map((point) => point.equity)} leveragedLabel={text(language, 'replay.leveragedLine')} unleveragedLabel={text(language, 'replay.unleveragedLine')} language={language} /><div className="comparison-list"><p>{interpolate(text(language, 'replay.leveragedFinal'), {amount: formatRupees(state.comparison.leveragedFinalEquity, language)})}</p><p>{interpolate(text(language, 'replay.unleveragedFinal'), {amount: formatRupees(state.comparison.unleveragedFinalEquity, language)})}</p><p>{interpolate(text(language, 'replay.difference'), {amount: formatRupees(state.comparison.difference, language)})}</p><p className="notice">{recovery}</p></div><BigButton onClick={next}>{text(language, 'replay.continue')}</BigButton></JourneyFrame>;
  }

  if (state.step === 'Reveal') {
    const firstDate = episode.bars[0].date;
    const lastDate = episode.bars.at(-1)?.date;
    const period = firstDate && lastDate ? `${firstDate} — ${lastDate}` : episode.reveal.periodText[language];
    const downCloses = episode.bars.slice(1).reduce((count, bar, index) => count + (bar.close < episode.bars[index].close ? 1 : 0), 0);
    return <JourneyFrame language={language} step={state.step} title={title} body={body} eyebrow={eyebrow} narrationText={currentNarration}><div className="reveal-grid"><div><span className="quiet">{text(language, 'reveal.periodLabel')}</span><strong>{period}</strong></div><div><span className="quiet">{text(language, 'reveal.whatHappenedLabel')}</span><strong>{episode.reveal.whatHappenedText[language]}</strong></div><div><span className="quiet">{text(language, 'reveal.sourceLabel')}</span><strong>{episode.provenance.sourceName}</strong><code>{episode.provenance.sourceUrl}</code></div></div><p className="quiet">{text(language, 'reveal.statsLabel')}</p><div className="stats-grid"><div><span>{text(language, 'reveal.statsMaxDrawdown')}</span><strong>{formatPercent(episode.stats.maxDrawdown, language)}</strong></div><div><span>{text(language, 'reveal.statsWorstFall')}</span><strong>{formatPercent(episode.stats.worstSingleDayFall, language)}</strong></div><div><span>{text(language, 'reveal.statsDownCloses')}</span><strong>{formatNumber(downCloses, language)}</strong></div><div><span>{text(language, 'reveal.statsBarCount')}</span><strong>{formatNumber(episode.stats.barCount, language)}</strong></div></div><p className="notice">{text(language, 'reveal.oneEpisode')}</p><BigButton onClick={next}>{text(language, 'reveal.continue')}</BigButton></JourneyFrame>;
  }

  if (state.step === 'Debrief' && state.leveragedRun) {
    const blocks = state.debriefBlocks ?? [];
    const debriefText = (block: DebriefBlockId) => {
      if (block === 'recoveryMaths') return state.comparison?.requiredRecoveryGain === null ? text(language, 'debrief.recoveryNone') : interpolate(text(language, 'debrief.recoveryInterpolated'), { finalAmount: formatRupees(state.leveragedRun?.final.equity ?? 0, language), startAmount: formatRupees(state.leveragedRun?.capital ?? capital, language), gain: formatPercent(state.comparison?.requiredRecoveryGain ?? 0, language) });
      return text(language, `debrief.${block}Body`);
    };
    return <JourneyFrame language={language} step={state.step} title={title} body={body} eyebrow={eyebrow} narrationText={currentNarration}><div className="lesson-list">{['leverage', 'margin', 'forcedExit', 'volatility', 'drawdown', 'recovery'].map((key) => <span key={key} className="tag">{text(language, `debrief.${key}`)}</span>)}</div><div className="debrief-list">{blocks.map((block) => <article className="debrief-block" key={block}><h2>{text(language, `debrief.${block}`)}</h2><p>{debriefText(block)}</p></article>)}</div><BigButton onClick={next}>{text(language, 'debrief.continue')}</BigButton></JourneyFrame>;
  }

  const verifiedResources = (resources as Resource[]).filter((resource) => resource.verified);
  if (state.step === 'NextSteps') return <JourneyFrame language={language} step={state.step} title={title} body={body} eyebrow={eyebrow} narrationText={currentNarration}><div className="resource-list">{verifiedResources.map((resource) => <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer">{text(language, resource.labelKey)}</a>)}</div>{verifiedResources.length === 0 && <p className="notice">{text(language, 'nextSteps.empty')}</p>}<button className="link-button" onClick={restart}>{text(language, 'nextSteps.restart')}</button></JourneyFrame>;

  return <JourneyFrame language={language} step={state.step} title={title} body={body} eyebrow={eyebrow} narrationText={currentNarration}>
    {state.step === 'Setup' && <div className="controls"><strong>{text(language, 'setup.stake')}</strong><div className="choice-grid">{[25, 50, 100].map((value) => <BigButton key={value} className={stake === value ? 'selected' : ''} onClick={() => setStake(value)}>{text(language, `setup.stake${value}`)}</BigButton>)}</div><strong>{text(language, 'setup.leverage')}</strong><div className="choice-grid">{[2, 5, 10].map((value) => <BigButton key={value} className={leverage === value ? 'selected' : ''} onClick={() => setLeverage(value as 2 | 5 | 10)}>{text(language, `setup.leverage${value}`)}</BigButton>)}</div><p className="quiet">{text(language, 'setup.capital')} · {formatRupees(capital, language)}</p></div>}
    {isPrediction && <div className="choice-grid">{options[state.step === 'PostCheck' ? 'postPrediction' : 'prediction'].map((key) => <BigButton key={key} className={active === key ? 'selected' : ''} onClick={() => selectAnswer(key)}>{text(language, `prediction.${key}`)}</BigButton>)}</div>}
    {state.step === 'PostCheck' && <div className="controls"><strong>{text(language, 'postCheck.wouldTake')}</strong><div className="choice-grid">{['yes', 'no', 'notSure'].map((key) => <BigButton key={key} className={selectedWouldTake === key ? 'selected' : ''} onClick={() => dispatch({ type: 'answer', field: 'wouldTake', value: key })}>{text(language, `postCheck.${key}`)}</BigButton>)}</div>{active && selectedWouldTake && <p className="notice">{state.prediction === state.postPrediction ? text(language, 'postCheck.unchanged') : interpolate(text(language, 'postCheck.changed'), { before: text(language, `prediction.${state.prediction}`), after: text(language, `prediction.${state.postPrediction}`) })}</p>}</div>}
    {state.step === 'Setup' ? <BigButton onClick={() => { dispatch({ type: 'setup', stake, leverage }); next(); }}>{continueLabel}</BigButton> : <BigButton disabled={isPrediction && (!active || (state.step === 'PostCheck' && !selectedWouldTake))} onClick={next}>{continueLabel}</BigButton>}
  </JourneyFrame>;
}
