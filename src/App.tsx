import { useMemo, useState } from 'react';
import { APP_NAME } from './config/app';
import { type Language } from './config/languages';
import enNarration from './content/en/narration.json';
import hiNarration from './content/hi/narration.json';
import { t } from './i18n';
import { stepNumber } from './journey/steps';
import { useJourney } from './journey/JourneyContext';
import { BigButton } from './components/BigButton';
import { CaptionBar } from './components/CaptionBar';
import { AudioControls } from './components/AudioControls';
import { formatRupees } from './i18n/format';

const narration = { en: enNarration, hi: hiNarration };
const options = {
  prediction: ['bigGain', 'smallGain', 'smallLoss', 'almostEverything'],
  postPrediction: ['bigGain', 'smallGain', 'smallLoss', 'almostEverything'],
} as const;

function text(language: Language | undefined, key: string) { return t(language ?? 'en', key); }

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

  if (!language) return <main className="shell language-screen"><header><span className="eyebrow">{APP_NAME}</span></header><section className="card"><p className="eyebrow">{text('en', 'languageSelect.eyebrow')}</p><h1>{text('en', 'languageSelect.title')}</h1><p>{text('en', 'languageSelect.body')}</p><div className="choice-grid"><BigButton onClick={() => dispatch({ type: 'chooseLanguage', language: 'hi' })}>{text('hi', 'languageSelect.hindi')}</BigButton><BigButton onClick={() => dispatch({ type: 'chooseLanguage', language: 'en' })}>{text('en', 'languageSelect.english')}</BigButton></div></section></main>;

  if (state.step === 'NextSteps' && showPilotSummary) return <main className="shell"><header className="topbar"><span className="eyebrow">{APP_NAME}</span></header><section className="card"><p className="eyebrow">{text(language, 'pilotSummary.eyebrow')}</p><h1>{text(language, 'pilotSummary.title')}</h1><p>{text(language, 'pilotSummary.body')}</p><pre className="summary">{JSON.stringify({ prediction: state.prediction ?? null, postPrediction: state.postPrediction ?? null, wouldTake: state.wouldTake ?? null }, null, 2)}</pre><BigButton onClick={() => void navigator.clipboard?.writeText(JSON.stringify({ prediction: state.prediction ?? null, postPrediction: state.postPrediction ?? null, wouldTake: state.wouldTake ?? null }))}>{text(language, 'pilotSummary.copy')}</BigButton><button className="link-button" onClick={() => setShowPilotSummary(false)}>{text(language, 'pilotSummary.back')}</button></section></main>;

  const title = text(language, `${state.step === 'PostCheck' ? 'postCheck' : state.step.charAt(0).toLowerCase() + state.step.slice(1)}.title`);
  const body = text(language, `${state.step === 'PostCheck' ? 'postCheck' : state.step.charAt(0).toLowerCase() + state.step.slice(1)}.body`);
  const eyebrow = text(language, `${state.step === 'PostCheck' ? 'postCheck' : state.step.charAt(0).toLowerCase() + state.step.slice(1)}.eyebrow`);
  const continueLabel = text(language, `${state.step === 'PostCheck' ? 'postCheck' : state.step.charAt(0).toLowerCase() + state.step.slice(1)}.continue`);
  const isPrediction = state.step === 'Prediction' || state.step === 'PostCheck';
  const active = state.step === 'PostCheck' ? selectedPost : selectedPrediction;
  const selectAnswer = (value: string) => {
    if (state.step === 'PostCheck') { setSelectedPost(value); dispatch({ type: 'answer', field: 'postPrediction', value }); }
    else { setSelectedPrediction(value); dispatch({ type: 'answer', field: 'prediction', value }); }
  };

  return <main className="shell"><header className="topbar"><span className="eyebrow">{APP_NAME}</span><span className="step-count">{text(language, 'common.step')} {stepNumber(state.step) + 1}/11</span></header><section className="card" aria-labelledby="screen-title"><p className="eyebrow">{eyebrow}</p><h1 id="screen-title">{title}</h1><p>{body}</p><CaptionBar text={currentNarration} /><AudioControls label={text(language, 'common.audio')} />
    {state.step === 'Setup' && <div className="controls"><strong>{text(language, 'setup.stake')}</strong><div className="choice-grid">{[25, 50, 100].map((value) => <BigButton key={value} className={stake === value ? 'selected' : ''} onClick={() => setStake(value)}>{text(language, `setup.stake${value}`)}</BigButton>)}</div><strong>{text(language, 'setup.leverage')}</strong><div className="choice-grid">{[2, 5, 10].map((value) => <BigButton key={value} className={leverage === value ? 'selected' : ''} onClick={() => setLeverage(value as 2 | 5 | 10)}>{text(language, `setup.leverage${value}`)}</BigButton>)}</div><p className="quiet">{text(language, 'setup.capital')} · {formatRupees(10000, language)}</p></div>}
    {isPrediction && <div className="choice-grid">{options[state.step === 'PostCheck' ? 'postPrediction' : 'prediction'].map((key) => <BigButton key={key} className={active === key ? 'selected' : ''} onClick={() => selectAnswer(key)}>{text(language, `prediction.${key}`)}</BigButton>)}</div>}
    {state.step === 'PostCheck' && <div className="controls"><strong>{text(language, 'postCheck.wouldTake')}</strong><div className="choice-grid">{['yes', 'no', 'notSure'].map((key) => <BigButton key={key} onClick={() => dispatch({ type: 'answer', field: 'wouldTake', value: key })}>{text(language, `postCheck.${key}`)}</BigButton>)}</div></div>}
    {state.step === 'Run' && <div className="choice-grid"><BigButton>{text(language, 'run.hold')}</BigButton><BigButton>{text(language, 'run.exit')}</BigButton></div>}
    {state.step === 'Debrief' && <div className="lesson-list">{['leverage', 'margin', 'forcedExit', 'volatility', 'drawdown', 'recovery'].map((key) => <span key={key} className="tag">{text(language, `debrief.${key}`)}</span>)}</div>}
    {state.step === 'NextSteps' && <p className="notice">{text(language, 'nextSteps.empty')}</p>}
    {state.step === 'Setup' && <BigButton onClick={() => { dispatch({ type: 'setup', stake, leverage }); next(); }}>{continueLabel}</BigButton>}
    {state.step !== 'Setup' && <BigButton disabled={isPrediction && !active} onClick={next}>{continueLabel}</BigButton>}
    {state.step === 'NextSteps' && <button className="link-button" onClick={() => dispatch({ type: 'restart' })}>{text(language, 'nextSteps.restart')}</button>}
  </section></main>;
}
