import type { Language } from '../config/languages';
import { t } from '../i18n';
import enNarration from '../content/en/narration.json';
import hiNarration from '../content/hi/narration.json';
import { JourneyFrame } from '../components/JourneyFrame';
import { BigButton } from '../components/BigButton';

export function LanguageEntry({
  language,
  onChoose,
  onLanguage,
}: {
  language: Language;
  onChoose: (value: Language) => void;
  onLanguage: (value: Language) => void;
}) {
  return (
    <JourneyFrame
      language={language}
      step="LanguageSelect"
      title={t(language, 'languageSelect.title')}
      body={t(language, 'languageSelect.body')}
      eyebrow={t(language, 'languageSelect.eyebrow')}
      onLanguage={onLanguage}
      narration={(language === 'hi' ? hiNarration : enNarration).find(
        (item) => item.id === 'language.greeting',
      )}
      reading={<p className="quiet">{t(language, 'features.privacy')}</p>}
      actions={
        <BigButton onClick={() => onChoose(language)}>
          {t(language, 'languageSelect.continue')}
        </BigButton>
      }
    >
      <div className="language-cards choice-grid">
        <BigButton lang="hi" onClick={() => onChoose('hi')}>
          {t('hi', 'languageSelect.hindi')}
        </BigButton>
        <BigButton lang="en" onClick={() => onChoose('en')}>
          {t('en', 'languageSelect.english')}
        </BigButton>
      </div>
    </JourneyFrame>
  );
}
