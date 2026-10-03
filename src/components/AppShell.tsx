import { useEffect, useState, type ReactNode } from 'react';
import type { Language } from '../config/languages';
import { APP_NAME } from '../config/app';
import { capabilities } from '../config/capabilities';
import { t } from '../i18n';
import type { JourneyStep } from '../journey/steps';
import {
  readPreference,
  savePreference,
  removeLegacyTextSizePreference,
} from '../journey/preferences';
import { DEFAULT_AUTO_SPEAK } from '../config/audio';
import { useAutoSpeak } from '../audio/useAutoSpeak';
import type { AutoTrack } from '../audio/AutoSpeakController';
import { StepHeader, type Narration } from './StepHeader';
import { ActionBar } from './ActionBar';
import { AboutDialog } from './AboutDialog';

export function AppShell({
  language,
  step,
  children,
  actions,
  onBack,
  onLanguage,
  narration,
  autoNarrations,
  focusKey,
}: {
  language: Language;
  step: JourneyStep;
  children: ReactNode;
  actions: ReactNode;
  onBack?: () => void;
  onLanguage?: (language: Language) => void;
  narration?: Narration;
  autoNarrations?: AutoTrack[];
  focusKey?: string;
}) {
  const [autoSpeak, setAutoSpeak] = useState(() => {
    const value = readPreference('auto-speak');
    return value === null ? DEFAULT_AUTO_SPEAK : value === 'true';
  });
  const [about, setAbout] = useState(false);
  const tracks =
    autoNarrations ??
    (narration
      ? [{ language, id: narration.id, spokenText: narration.spokenText }]
      : []);
  useAutoSpeak(
    autoSpeak && !about,
    `${language}:${step}:${tracks.length ? 'narrated' : 'quiet'}`,
    tracks,
  );
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = APP_NAME;
  }, [language]);
  useEffect(() => {
    document.documentElement.dataset.textSize = 'large';
    removeLegacyTextSizePreference();
  }, []);
  useEffect(() => {
    document.getElementById('screen-title')?.focus({ preventScroll: true });
    document.querySelectorAll('.pane-scroll').forEach((node) => {
      node.scrollTop = 0;
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step, focusKey]);
  return (
    <div className="app-shell" lang={language} data-step={step}>
      <a className="skip-link" href="#screen-title">
        {t(language, 'features.skip')}
      </a>
      <StepHeader
        language={language}
        onLanguage={onLanguage}
        autoSpeak={autoSpeak}
        onAutoSpeak={(value) => {
          setAutoSpeak(value);
          savePreference('auto-speak', String(value));
        }}
      />
      {children}
      <div className="shell-bottom">
        <ActionBar language={language} onBack={onBack}>
          {actions}
        </ActionBar>
        <footer className="app-footer">
          <p>
            {t(
              language,
              capabilities.userDataLeavesDevice
                ? 'features.dataSentNotice'
                : 'features.localNotice',
            )}
          </p>
          <button className="about-link" onClick={() => setAbout(true)}>
            {t(language, 'features.about')}
          </button>
        </footer>
      </div>
      {about && (
        <AboutDialog language={language} onClose={() => setAbout(false)} />
      )}
    </div>
  );
}
