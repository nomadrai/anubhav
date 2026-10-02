interface PriceChartProps {
  prices: number[];
  width?: number;
  height?: number;
  lineLabel: string;
}

/** Plain SVG price line. Visuals are deliberately unpolished in Phase 1. */
export function PriceChart({ prices, width = 320, height = 120, lineLabel }: PriceChartProps) {
  if (prices.length < 2) return <svg role="img" aria-label={lineLabel} width={width} height={height} />;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const points = prices
    .map((price, index) => {
      const x = (index / (prices.length - 1)) * (width - 8) + 4;
      const y = height - 6 - ((price - min) / span) * (height - 12);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const first = prices[0];
  const last = prices[prices.length - 1];
  const direction = last >= first ? 'rising' : 'falling';
  return (
    <figure className="chart" style={{ margin: 0 }}>
      <svg role="img" aria-label={`${lineLabel}: ${direction} line over ${prices.length} steps`} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline points={points} fill="none" stroke="#386b57" strokeWidth={2} strokeDasharray="0" />
      </svg>
      <figcaption className="quiet">{lineLabel}</figcaption>
    </figure>
  );
}
