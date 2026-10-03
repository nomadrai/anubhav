import { APP_NAME } from '../config/app';
import type { Language } from '../config/languages';
import { t } from '../i18n';

export type Narration = { id: string; displayText: string; spokenText: string };
export function StepHeader({
  language,
  onLanguage,
  autoSpeak,
  onAutoSpeak,
}: {
  language: Language;
  onLanguage?: (language: Language) => void;
  autoSpeak: boolean;
  onAutoSpeak: (enabled: boolean) => void;
}) {
  return (
    <header className="app-header">
      <div className="topbar">
        <span className="brand">
          {APP_NAME}
          <span className="brand-dot" aria-hidden="true" />
        </span>
        <div
          className="toolbar"
          role="group"
          aria-label={t(language, 'features.preferences')}
        >
          {onLanguage && (
            <select
              aria-label={t(language, 'features.language')}
              value={language}
              onChange={(event) => onLanguage(event.target.value as Language)}
            >
              <option value="en" lang="en">
                {t('en', 'languageSelect.english')}
              </option>
              <option value="hi" lang="hi">
                {t('hi', 'languageSelect.hindi')}
              </option>
            </select>
          )}
          <button
            className="auto-speak-switch"
            role="switch"
            aria-checked={autoSpeak}
            aria-label={t(language, 'features.autoSpeak')}
            onClick={() => onAutoSpeak(!autoSpeak)}
          >
            <span>{t(language, 'features.autoSpeak')}</span>
            <span className="switch-state" aria-hidden="true">
              {t(language, autoSpeak ? 'features.on' : 'features.off')}
            </span>
          </button>
          <button
            className="chat-button"
            aria-label={t(language, 'features.chat')}
            title={t(language, 'features.chat')}
            onClick={() => {
              /* TODO(chat): no feature, state change or network call yet. */
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              aria-hidden="true"
              focusable="false"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 4V6a2 2 0 0 1 2-2Z" />
              <path d="M7 9h10M7 13h7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
