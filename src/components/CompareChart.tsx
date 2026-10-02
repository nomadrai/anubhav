interface CompareChartProps {
  leveraged: number[];
  unleveraged: number[];
  leveragedLabel: string;
  unleveragedLabel: string;
  width?: number;
  height?: number;
}

/**
 * One shared time axis, two equity lines. The lines differ by dash pattern and
 * carry their own text labels, so colour is never the only signal.
 */
export function CompareChart({ leveraged, unleveraged, leveragedLabel, unleveragedLabel, width = 340, height = 150 }: CompareChartProps) {
  const count = Math.max(leveraged.length, unleveraged.length);
  if (count < 2) return <svg role="img" aria-label={`${leveragedLabel}; ${unleveragedLabel}`} width={width} height={height} />;
  const values = [...leveraged, ...unleveraged];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const toPoints = (series: number[]) =>
    series
      .map((value, index) => {
        const x = (index / (count - 1)) * (width - 8) + 4;
        const y = height - 6 - ((value - min) / span) * (height - 12);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  const axisSummary = `from ${Math.round(min)} to ${Math.round(max)} on one shared time axis`;
  return (
    <figure className="chart" style={{ margin: 0 }}>
      <svg
        role="img"
        aria-label={`${leveragedLabel} (dashed) and ${unleveragedLabel} (solid), ${axisSummary}`}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <polyline points={toPoints(leveraged)} fill="none" stroke="#29251f" strokeWidth={2} strokeDasharray="6 4" />
        <polyline points={toPoints(unleveraged)} fill="none" stroke="#386b57" strokeWidth={2} strokeDasharray="0" />
      </svg>
      <figcaption className="quiet">
        <span className="chart-key">
          <svg aria-hidden="true" width={22} height={8}><line x1={0} y1={4} x2={22} y2={4} stroke="#29251f" strokeWidth={2} strokeDasharray="6 4" /></svg> {leveragedLabel}
          <svg aria-hidden="true" width={22} height={8} style={{ marginLeft: 12 }}><line x1={0} y1={4} x2={22} y2={4} stroke="#386b57" strokeWidth={2} /></svg> {unleveragedLabel}
        </span>
      </figcaption>
    </figure>
  );
}
