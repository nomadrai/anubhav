import { formatRupees, interpolate, t } from '../i18n';
import type { Language } from '../config/languages';
import type { TimelinePoint } from '../engine/types';

export function MarginMeter({ status, equity, capital, warnLevel, maintenanceLevel, language }: {
  status: TimelinePoint['status']; equity: number; capital: number; warnLevel: number; maintenanceLevel: number; language: Language;
}) {
  const statusKey = { open: 'statusOpen', warning: 'statusWarning', forced_exit: 'statusForced', exited: 'statusExited' }[status];
  return <div className="meter">
    <strong>{t(language, `run.${statusKey}`)}</strong>
    <meter min="0" max={Math.max(capital, equity)} low={warnLevel} value={Math.max(0, equity)} aria-label={t(language, 'run.marginLabel')} />
    <p className="quiet">{interpolate(t(language, 'run.maintenanceLevel'), { level: formatRupees(maintenanceLevel, language) })}</p>
    <p className="quiet">{interpolate(t(language, 'run.warningLevel'), { level: formatRupees(warnLevel, language) })}</p>
  </div>;
}
