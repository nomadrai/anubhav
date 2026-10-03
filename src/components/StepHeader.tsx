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
            onClick={() => {
              /* TODO(chat): no feature, state change or network call yet. */
            }}
          >
            {t(language, 'features.chat')}
          </button>
        </div>
      </div>
    </header>
  );
}
