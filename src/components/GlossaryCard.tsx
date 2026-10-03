import type { Language } from '../config/languages';
import { glossaryTerms } from '../i18n/glossary';
import { t } from '../i18n';
import { AudioControls } from './AudioControls';

export function GlossaryCard({
  language,
  termId,
  onClose,
}: {
  language: Language;
  termId: string;
  onClose: () => void;
}) {
  const term = glossaryTerms(language).find((item) => item.termId === termId);
  if (!term) return null;
  return (
    <section className="glossary-card" aria-labelledby="glossary-title">
      <div className="glossary-card-header">
        <h2 id="glossary-title">{term.term}</h2>
        <button onClick={onClose}>
          {t(language, 'features.glossaryClose')}
        </button>
      </div>
      <p>{term.short}</p>
      <p className="quiet">{term.analogy}</p>
      <AudioControls
        language={language}
        id={`glossary.${term.termId}`}
        spokenText={term.spokenText}
      />
    </section>
  );
}
