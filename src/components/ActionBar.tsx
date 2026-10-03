import type { ReactNode } from 'react';
import type { Language } from '../config/languages';
import { t } from '../i18n';

export function ActionBar({
  language,
  onBack,
  children,
}: {
  language: Language;
  onBack?: () => void;
  children: ReactNode;
}) {
  return (
    <section
      className="action-bar"
      aria-label={t(language, 'features.actions')}
    >
      <div className="action-inner">
        <button className="back-button" onClick={onBack} disabled={!onBack}>
          {t(language, 'features.back')}
        </button>
        <div className="primary-actions">{children}</div>
      </div>
    </section>
  );
}
