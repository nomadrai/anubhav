import { formatNumber, formatRupees, t } from '../i18n';
import type { Language } from '../config/languages';

interface CompareChartProps {
  leveraged: number[];
  unleveraged: number[];
  leveragedLabel: string;
  unleveragedLabel: string;
  language: Language;
}

/** Shared axes; closed lines end at their settlement, never resume at later prices. */
export function CompareChart({
  leveraged,
  unleveraged,
  leveragedLabel,
  unleveragedLabel,
  language,
}: CompareChartProps) {
  const count = Math.max(leveraged.length, unleveraged.length);
  const values = [...leveraged, ...unleveraged];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = (series: number[]) =>
    series
      .map(
        (value, index) =>
          `${8 + (index / Math.max(1, count - 1)) * 304},${144 - ((value - min) / span) * 138}`,
      )
      .join(' ');
  return (
    <figure className="chart">
      <svg
        role="img"
        aria-label={t(language, 'replay.chartDescription')}
        viewBox="0 0 320 150"
      >
        <polyline
          points={points(leveraged)}
          fill="none"
          stroke="#29251f"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <polyline
          points={points(unleveraged)}
          fill="none"
          stroke="#386b57"
          strokeWidth="2"
        />
      </svg>
      <figcaption>{t(language, 'replay.chartDescription')}</figcaption>
      <details>
        <summary>{t(language, 'common.chartData')}</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">{t(language, 'common.step')}</th>
              <th scope="col">{leveragedLabel}</th>
              <th scope="col">{unleveragedLabel}</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: count }, (_, index) => (
              <tr key={index}>
                <th scope="row">{formatNumber(index + 1, language)}</th>
                <td>
                  {leveraged[index] === undefined
                    ? t(language, 'replay.closed')
                    : formatRupees(leveraged[index], language)}
                </td>
                <td>
                  {unleveraged[index] === undefined
                    ? t(language, 'replay.closed')
                    : formatRupees(unleveraged[index], language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
