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
  for (const [index, bar] of series.entries()) {
    if (!bar || !Number.isFinite(bar.close) || bar.close <= 0) throw new SeriesError(`bar ${index} needs a finite positive close price`);
    for (const field of ['low', 'high', 'open'] as const) {
      const value = bar[field];
      if (value !== undefined && (!Number.isFinite(value) || value <= 0)) throw new SeriesError(`bar ${index} optional ${field} price must be finite and positive`);
    }
    if (bar.high !== undefined && bar.high < bar.close) throw new SeriesError(`bar ${index} high must be at least close`);
    if (bar.low !== undefined && bar.low > bar.close) throw new SeriesError(`bar ${index} low must be at most close`);
    if (bar.high !== undefined && bar.low !== undefined && bar.high < bar.low) throw new SeriesError(`bar ${index} high must be at least low`);
    if (bar.open !== undefined && bar.high !== undefined && bar.open > bar.high) throw new SeriesError(`bar ${index} open must be at most high`);
    if (bar.open !== undefined && bar.low !== undefined && bar.open < bar.low) throw new SeriesError(`bar ${index} open must be at least low`);
  }
}

export function runSimulation(input: SimInput): SimResult {
  validateSeries(input.series);
  const { series, capital, config } = input;
  if (!(capital > 0) || !Number.isFinite(capital)) throw new SeriesError('capital must be finite and positive');
  if (![1, 2, 5, 10].includes(input.leverage)) throw new SeriesError('leverage must be one of 1, 2, 5, or 10');
  if (!Number.isFinite(config.maintenanceFraction) || config.maintenanceFraction <= 0 || config.maintenanceFraction >= 1) throw new SeriesError('maintenanceFraction must be between zero and one');
  if (!Number.isFinite(config.warnBuffer) || config.warnBuffer < 1) throw new SeriesError('warnBuffer must be at least one');
  if (!Array.isArray(config.drawdownMarks) || config.drawdownMarks.some((mark) => !Number.isFinite(mark) || mark <= 0 || mark >= 1) || new Set(config.drawdownMarks).size !== config.drawdownMarks.length || config.drawdownMarks.some((mark) => ![0.05, 0.1, 0.2].includes(mark))) throw new SeriesError('drawdownMarks must contain unique supported fractions: 0.05, 0.1, or 0.2');

  const units = positionUnits(capital, input.leverage, series[0]);
  const entryPrice = series[0].close;
  const maintenance = capital * config.maintenanceFraction;
  const warnLevel = maintenance * config.warnBuffer;
  const last = series.length - 1;
  if (input.exitAtIndex !== undefined && (!Number.isInteger(input.exitAtIndex) || input.exitAtIndex < 1 || input.exitAtIndex > last)) throw new SeriesError(`exitAtIndex must be an integer from one through ${last}`);
  const exitAtIndex = input.exitAtIndex;

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
    if (index === 0 && input.leverage > 1 && equityLow <= maintenance) throw new SeriesError('entry bar already reaches the maintenance threshold; the run cannot start');
    const pending: PendingEvent[] = [];

    if (index === 0) pending.push({ id: 'ENTRY', index });
    for (const mark of config.drawdownMarks) {
      const id = mark === 0.05 ? 'DRAWDOWN_5' : mark === 0.1 ? 'DRAWDOWN_10' : mark === 0.2 ? 'DRAWDOWN_20' : undefined;
      if (id && bar.close <= entryPrice * (1 - mark)) pending.push({ id, index });
    }

    // A single bar that jumps straight past both thresholds emits both, warning first (decision ADR-0107).
    if (input.leverage > 1 && equityLow <= maintenance) {
      pending.push({ id: 'MARGIN_WARNING', index });
      pending.push({ id: 'FORCED_EXIT', index });
      forcedExitIndex = index;
    } else if (input.leverage > 1 && equity <= warnLevel) {
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
      status: forcedExitIndex === index ? 'forced_exit' : input.leverage > 1 && equity <= warnLevel ? 'warning' : 'open',
    });
    if (forcedExitIndex === index || exitAtIndex === index) break;
  }

  const stats = calculateStats(series.slice(0, timeline.length));
  const finalEquity = forcedExitIndex !== undefined ? maintenance : timeline[timeline.length - 1].equity;
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
