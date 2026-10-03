import { useEffect, useState, type ReactNode } from 'react';
import { APP_NAME } from '../config/app';
import type { Language } from '../config/languages';
import { t } from '../i18n';
import { stepNumber, type JourneyStep } from '../journey/steps';
import { TextSizeControl, type TextSize } from './TextSizeControl';
import { CaptionBar } from './CaptionBar';
import { AudioControls } from './AudioControls';

import { readPreference, savePreference } from '../journey/preferences';

export function JourneyFrame({
  language,
  step,
  title,
  body,
  eyebrow,
  children,
  narration,
  onLanguage,
  focusKey,
}: {
  language: Language;
  step: JourneyStep;
  title: string;
  body: string;
  eyebrow: string;
  children: ReactNode;
  narration?: { id: string; displayText: string; spokenText: string };
  onLanguage?: (language: Language) => void;
  focusKey?: string;
}) {
  const [textSize, setTextSize] = useState<TextSize>(() =>
    readPreference('text-size') === 'large' ? 'large' : 'standard',
  );
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = APP_NAME;
  }, [language]);
  useEffect(() => {
    document.documentElement.dataset.textSize = textSize;
  }, [textSize]);
  useEffect(() => {
    document.getElementById('screen-title')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [step, focusKey]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return (
    <div className="shell" lang={language}>
      <a className="skip-link" href="#screen-title">
        {t(language, 'features.skip')}
      </a>
      <header>
        <div className="topbar">
          <span className="eyebrow">{APP_NAME}</span>
          {step !== 'LanguageSelect' && (
            <span className="step-count">
              {t(language, 'common.step')} {stepNumber(step)}/11
            </span>
          )}
        </div>
        <details className="preferences">
          <summary>{t(language, 'features.preferences')}</summary>
          <div className="compact-controls">
            {onLanguage && (
              <label>
                {t(language, 'features.language')}
                <select
                  value={language}
                  onChange={(event) =>
                    onLanguage(event.target.value as Language)
                  }
                >
                  <option value="en" lang="en">
                    {t('en', 'languageSelect.english')}
                  </option>
                  <option value="hi" lang="hi">
                    {t('hi', 'languageSelect.hindi')}
                  </option>
                </select>
              </label>
            )}
            <TextSizeControl
              language={language}
              value={textSize}
              onChange={(value) => {
                setTextSize(value);
                savePreference('text-size', value);
              }}
            />
          </div>
        </details>
      </header>
      <main className="card" aria-labelledby="screen-title">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="screen-title" tabIndex={-1}>
          {title}
        </h1>
        <p>{body}</p>
        {narration && (
          <>
            <CaptionBar text={narration.displayText} />
            <AudioControls
              language={language}
              id={narration.id}
              spokenText={narration.spokenText}
            />
          </>
        )}
        {children}
      </main>
      <footer>
        <p className="review-notice">{t(language, 'features.reviewNotice')}</p>
        <p>{t(language, 'features.privacy')}</p>
        <p>{t(language, 'features.offline')}</p>
        <p role="status">
          {t(language, online ? 'features.online' : 'features.disconnected')}
        </p>
      </footer>
    </div>
  );
}
