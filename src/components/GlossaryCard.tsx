import { useId } from 'react';
import type { Language } from '../config/languages';
import en from '../content/en/glossary.json';
import hi from '../content/hi/glossary.json';
import { t } from '../i18n';
import { AudioControls } from './AudioControls';
import { audioManager } from '../audio/AudioManager';

export function GlossaryCard({ language }: { language: Language }) {
  const titleId = useId();
  const terms = (language === 'hi' ? hi : en).filter(
    (term) => term.status !== 'planned',
  );
  return (
    <section className="glossary" aria-labelledby={titleId}>
      <h2 id={titleId}>{t(language, 'features.glossary')}</h2>
      {terms.map((term) => (
        <details
          key={term.termId}
          onToggle={(event) => {
            if (!event.currentTarget.open)
              audioManager.stop(`${language}:glossary.${term.termId}`);
          }}
        >
          <summary>{term.term}</summary>
          <p>{term.short}</p>
          <p className="quiet">{term.analogy}</p>
          <AudioControls
            language={language}
            id={`glossary.${term.termId}`}
            spokenText={term.spokenText}
          />
        </details>
      ))}
    </section>
  );
}
