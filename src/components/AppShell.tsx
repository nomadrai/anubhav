import { useEffect, useState, type ReactNode } from 'react';
import type { Language } from '../config/languages';
import { APP_NAME } from '../config/app';
import { capabilities } from '../config/capabilities';
import { t } from '../i18n';
import type { JourneyStep } from '../journey/steps';
import { readPreference, savePreference } from '../journey/preferences';
import { StepHeader, type Narration } from './StepHeader';
import type { TextSize } from './TextSizeControl';
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
  focusKey,
}: {
  language: Language;
  step: JourneyStep;
  children: ReactNode;
  actions: ReactNode;
  onBack?: () => void;
  onLanguage?: (language: Language) => void;
  narration?: Narration;
  focusKey?: string;
}) {
  const [textSize, setTextSize] = useState<TextSize>(() => {
    const value = readPreference('text-size');
    return value === 'large' || value === 'medium' ? value : 'standard';
  });
  const [about, setAbout] = useState(false);
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = APP_NAME;
  }, [language]);
  useEffect(() => {
    document.documentElement.dataset.textSize = textSize;
  }, [textSize]);
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
        step={step}
        onLanguage={onLanguage}
        textSize={textSize}
        onTextSize={(value) => {
          setTextSize(value);
          savePreference('text-size', value);
        }}
        narration={narration}
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
