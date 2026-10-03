import { APP_NAME } from '../config/app';
import type { Language } from '../config/languages';
import { t } from '../i18n';
import { JOURNEY_STEPS, stepNumber, type JourneyStep } from '../journey/steps';
import { AudioControls } from './AudioControls';
import { TextSizeControl, type TextSize } from './TextSizeControl';

export type Narration = { id: string; displayText: string; spokenText: string };
export function StepHeader({
  language,
  step,
  onLanguage,
  textSize,
  onTextSize,
  narration,
}: {
  language: Language;
  step: JourneyStep;
  onLanguage?: (language: Language) => void;
  textSize: TextSize;
  onTextSize: (size: TextSize) => void;
  narration?: Narration;
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
          <TextSizeControl
            language={language}
            value={textSize}
            onChange={onTextSize}
          />
          {narration && (
            <AudioControls
              language={language}
              id={narration.id}
              spokenText={narration.spokenText}
              compact
            />
          )}
        </div>
      </div>
      <nav
        className="step-progress"
        aria-label={t(language, 'features.progress')}
      >
        <ol>
          {JOURNEY_STEPS.map((item, index) => (
            <li
              key={item}
              aria-label={t(language, `features.steps.${item}`)}
              aria-current={step === item ? 'step' : undefined}
              data-complete={index < stepNumber(step)}
            >
              <span className="progress-segment" aria-hidden="true" />
              <span className="progress-name">
                {t(language, `features.steps.${item}`)}
              </span>
            </li>
          ))}
        </ol>
        <p className="mobile-step-name">
          {t(language, `features.steps.${step}`)}
        </p>
      </nav>
    </header>
  );
}
