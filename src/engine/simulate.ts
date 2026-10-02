import { equityAt, positionUnits } from './position';
import { calculateStats } from './stats';
import type { Bar, SimEvent, SimEventId, SimInput, SimResult, TimelinePoint } from './types';
import { SeriesError } from './types';

interface PendingEvent { id: SimEventId; index: number; }

/** Global display/event precedence; MARGIN_WARNING must precede FORCED_EXIT when one bar crosses both. */
const ORDER: readonly SimEventId[] = ['ENTRY', 'DRAWDOWN_5', 'DRAWDOWN_10', 'DRAWDOWN_20', 'MARGIN_WARNING', 'FORCED_EXIT', 'USER_EXIT', 'EPISODE_END', 'UNLEVERAGED_SURVIVED'];

function sortEvents(pending: PendingEvent[]): PendingEvent[] {
  return [...pending].sort((left, right) => ORDER.indexOf(left.id) - ORDER.indexOf(right.id));
}

export function validateSeries(series: Bar[]): void {
  if (!Array.isArray(series) || series.length < 2) throw new SeriesError('series must contain at least two bars');
  for (const bar of series) {
    if (!Number.isFinite(bar.close) || bar.close <= 0) throw new SeriesError('every bar needs a finite positive close price');
    for (const field of ['low', 'high', 'open'] as const) {
      const value = bar[field];
      if (value !== undefined && (!Number.isFinite(value) || value <= 0)) throw new SeriesError(`every optional ${field} price must be finite and positive`);
    }
  }
}

export function runSimulation(input: SimInput): SimResult {
  validateSeries(input.series);
  const { series, capital, config } = input;
  if (!(capital > 0)) throw new SeriesError('capital must be positive');

  const units = positionUnits(capital, input.leverage, series[0]);
  const entryPrice = series[0].close;
  const maintenance = capital * config.maintenanceFraction;
  const warnLevel = maintenance * config.warnBuffer;
  const last = series.length - 1;
  const exitAtIndex = input.exitAtIndex !== undefined && input.exitAtIndex !== last ? input.exitAtIndex : undefined;

  const events: SimEvent[] = [];
  const fired = new Set<SimEventId>();
  const emit = (event: PendingEvent) => { if (!fired.has(event.id)) { fired.add(event.id); events.push({ id: event.id, index: event.index }); } };

  const timeline: TimelinePoint[] = [];
  let intradayAvailable = true;
  let forcedExitIndex: number | undefined;

  for (let index = 0; index <= last && forcedExitIndex === undefined; index += 1) {
    const bar = series[index];
    const low = bar.low ?? bar.close;
    if (bar.low === undefined) intradayAvailable = false;
    const equity = equityAt(capital, units, entryPrice, bar.close);
    const equityLow = equityAt(capital, units, entryPrice, low);
    // A position already at or below maintenance on the entry bar is invalid input, not a run.
    if (index === 0 && equityLow <= maintenance) throw new SeriesError('entry bar already reaches the maintenance threshold; the run cannot start');
    const pending: PendingEvent[] = [];

    if (index === 0) pending.push({ id: 'ENTRY', index });
    for (const mark of config.drawdownMarks) {
      const id = mark <= 0.05 ? 'DRAWDOWN_5' : mark <= 0.1 ? 'DRAWDOWN_10' : 'DRAWDOWN_20';
      if (bar.close <= entryPrice * (1 - mark)) pending.push({ id, index });
    }

    // A single bar that jumps straight past both thresholds emits both, warning first (decision ADR-0107).
    if (equityLow <= maintenance) {
      pending.push({ id: 'MARGIN_WARNING', index });
      pending.push({ id: 'FORCED_EXIT', index });
      forcedExitIndex = index;
    } else if (equityLow <= warnLevel) {
      pending.push({ id: 'MARGIN_WARNING', index });
    }

    // The teaching rule settles intrabar, so it takes precedence over a same-bar user exit or episode end.
    if (forcedExitIndex === undefined) {
      if (exitAtIndex === index) pending.push({ id: 'USER_EXIT', index });
      if (index === last && exitAtIndex === undefined) pending.push({ id: 'EPISODE_END', index });
    }

    for (const event of sortEvents(pending)) emit(event);

    timeline.push({
      index,
      price: bar.close,
      equity,
      equityLow,
      status: forcedExitIndex === index ? 'forced_exit' : equityLow <= warnLevel ? 'warning' : 'open',
    });
    if (forcedExitIndex === index || exitAtIndex === index) break;
  }

  const stats = calculateStats(series.slice(0, timeline.length));
  const finalEquity = timeline[timeline.length - 1].equity;
  const outcome = forcedExitIndex !== undefined ? 'forced_exit' : exitAtIndex !== undefined ? 'user_exit' : 'ran_to_end';
  return {
    timeline,
    events,
    capital,
    final: {
      equity: finalEquity,
      pnl: finalEquity - capital,
      pnlPct: finalEquity / capital - 1,
      outcome,
      forcedExitIndex,
      exitIndex: exitAtIndex,
    },
    intradayAvailable,
    maxDrawdown: stats.maxDrawdown,
    worstSingleDayFall: stats.worstSingleDayFall,
    downCloses: stats.downCloses,
  };
}
