import { useEffect, useRef } from 'react';
import type { Language } from '../config/languages';
import { t } from '../i18n';

export function AboutDialog({
  language,
  onClose,
}: {
  language: Language;
  onClose: () => void;
}) {
  const ref = useRef<globalThis.HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  const close = () => {
    // Close while still connected so native focus restoration happens before React unmounts.
    ref.current?.close();
    onClose();
  };
  return (
    <dialog
      ref={ref}
      className="about-dialog"
      aria-labelledby="about-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <div className="about-header">
        <h2 id="about-title">{t(language, 'features.about')}</h2>
        <button autoFocus onClick={close}>
          {t(language, 'features.close')}
        </button>
      </div>
      <div className="about-content" tabIndex={0}>
        <section>
          <h3>{t(language, 'features.aboutPrivacy')}</h3>
          <p>{t(language, 'features.privacy')}</p>
          <p>{t(language, 'features.hostLogs')}</p>
        </section>
        <section>
          <h3>{t(language, 'features.aboutOffline')}</h3>
          <p>{t(language, 'features.offline')}</p>
        </section>
        <section>
          <h3>{t(language, 'features.aboutReview')}</h3>
          <p>{t(language, 'features.reviewNotice')}</p>
          <p>{t(language, 'features.historical')}</p>
        </section>
      </div>
    </dialog>
  );
}
