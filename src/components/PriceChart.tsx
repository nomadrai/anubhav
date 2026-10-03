import { formatNumber, t } from '../i18n';
import type { Language } from '../config/languages';

interface PriceChartProps { prices: number[]; lineLabel: string; language: Language; }

/** Step-only axis: dates and source metadata never enter chart props. */
export function PriceChart({ prices, lineLabel, language }: PriceChartProps) {
  const normalized = prices.map((price) => price / prices[0] * 100);
  const min = Math.min(...normalized);
  const max = Math.max(...normalized);
  const span = max - min || 1;
  const points = normalized.map((price, index) => `${8 + index / Math.max(1, prices.length - 1) * 304},${114 - (price - min) / span * 108}`).join(' ');
  return <figure className="chart">
    <svg role="img" aria-label={lineLabel} viewBox="0 0 320 120">
      {prices.length === 1 ? <circle cx="8" cy="114" r="3" fill="#386b57" /> : <polyline points={points} fill="none" stroke="#386b57" strokeWidth="2" />}
    </svg>
    <figcaption>{lineLabel} · {t(language, 'run.indexBase')}</figcaption>
    <details><summary>{t(language, 'common.chartData')}</summary>
      <table><thead><tr><th scope="col">{t(language, 'common.step')}</th><th scope="col">{lineLabel}</th></tr></thead>
        <tbody>{normalized.map((price, index) => <tr key={index}><th scope="row">{formatNumber(index + 1, language)}</th><td>{formatNumber(Math.round(price * 100) / 100, language)}</td></tr>)}</tbody>
      </table>
    </details>
  </figure>;
}
