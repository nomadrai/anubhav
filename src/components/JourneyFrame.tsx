import type { ReactNode } from 'react';
import type { Language } from '../config/languages';
import { t } from '../i18n';
import type { JourneyStep } from '../journey/steps';
import { AppShell } from './AppShell';
import { SplitLayout } from './SplitLayout';
import { AudioControls } from './AudioControls';
import { CaptionBar } from './CaptionBar';
import type { Narration } from './StepHeader';
import type { AutoTrack } from '../audio/AutoSpeakController';

export interface JourneyFrameProps {
  language: Language;
  step: JourneyStep;
  title: string;
  body: string;
  eyebrow: string;
  children: ReactNode;
  reading?: ReactNode;
  actions?: ReactNode;
  narration?: Narration;
  autoNarrations?: AutoTrack[];
  onLanguage?: (language: Language) => void;
  onBack?: () => void;
  focusKey?: string;
}
export function JourneyFrame({
  language,
  step,
  title,
  body,
  eyebrow,
  children,
  reading,
  actions,
  narration,
  autoNarrations,
  onLanguage,
  onBack,
  focusKey,
}: JourneyFrameProps) {
  return (
    <AppShell
      language={language}
      step={step}
      narration={narration}
      autoNarrations={autoNarrations}
      onLanguage={onLanguage}
      onBack={onBack}
      actions={actions}
      focusKey={focusKey}
    >
      <SplitLayout
        language={language}
        reading={
          <>
            <p className="eyebrow">{eyebrow}</p>
            <h1 id="screen-title" tabIndex={-1}>
              {title}
            </h1>
            <p className="step-body">{body}</p>
            {narration && (
              <div className="narration-block">
                {step === 'Setup' && (
                  <span className="eyebrow">
                    {t(language, 'features.forwarded')}
                  </span>
                )}
                <CaptionBar text={narration.displayText} />
                <AudioControls
                  language={language}
                  id={narration.id}
                  spokenText={narration.spokenText}
                />
              </div>
            )}
            {reading}
          </>
        }
      >
        {children}
      </SplitLayout>
    </AppShell>
  );
}
