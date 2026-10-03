import { lazy, Suspense } from 'react';
import type { Language } from './config/languages';
import { useJourney } from './journey/JourneyContext';
import { readPreference, savePreference } from './journey/preferences';
import { LanguageEntry } from './screens/LanguageEntry';

// Load teaching visuals/data only after the learner chooses to start. PWA still caches
// the complete public shell; this changes loading boundaries, not journey/engine rules.
const JourneyExperience = lazy(() => import('./JourneyExperience'));
export default function App() {
  const { state, dispatch } = useJourney();
  const language =
    state.language ?? (readPreference('language') === 'hi' ? 'hi' : 'en');
  const choose = (value: Language) => {
    savePreference('language', value);
    dispatch({ type: 'chooseLanguage', language: value });
  };
  const change = (value: Language) => {
    savePreference('language', value);
    dispatch({ type: 'changeLanguage', language: value });
  };
  const entry = (
    <LanguageEntry language={language} onChoose={choose} onLanguage={change} />
  );
  if (state.step === 'LanguageSelect') return entry;
  return (
    <Suspense fallback={entry}>
      <JourneyExperience />
    </Suspense>
  );
}
