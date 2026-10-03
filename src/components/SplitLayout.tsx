import type { ReactNode } from 'react';
import type { Language } from '../config/languages';
import { t } from '../i18n';
import { Pane } from './Pane';

export function SplitLayout({
  language,
  reading,
  children,
}: {
  language: Language;
  reading: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="split-layout" aria-labelledby="screen-title">
      <Pane kind="reading" label={t(language, 'features.readingPane')}>
        {reading}
      </Pane>
      <Pane kind="interaction" label={t(language, 'features.interactionPane')}>
        {children}
      </Pane>
    </main>
  );
}
