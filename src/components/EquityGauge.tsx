import { formatRupees } from '../i18n/format';
import type { Language } from '../config/languages';

export function EquityGauge({ equity, capital, language, label, startingAmountLabel }: {
  equity: number; capital: number; language: Language; label: string; startingAmountLabel: string;
}) {
  return <div className="equity-gauge" role="group" aria-label={label}>
    <div className="meter-heading"><span>{label}</span><strong>{formatRupees(equity, language)}</strong></div>
    <meter min="0" max={Math.max(capital, equity)} value={Math.max(0, equity)} aria-label={label} />
    <div className="quiet">{startingAmountLabel}: {formatRupees(capital, language)}</div>
  </div>;
}
