export interface Bar { open?: number; high?: number; low?: number; close: number; date?: string; }
export interface SimConfig { maintenanceFraction: number; warnBuffer: number; drawdownMarks: readonly number[]; }
export interface SimInput { series: Bar[]; capital: number; leverage: 1 | 2 | 5 | 10; exitAtIndex?: number; config: SimConfig; }
export type SimEventId = 'ENTRY' | 'DRAWDOWN_5' | 'DRAWDOWN_10' | 'DRAWDOWN_20' | 'MARGIN_WARNING' | 'FORCED_EXIT' | 'USER_EXIT' | 'EPISODE_END' | 'UNLEVERAGED_SURVIVED';
export interface SimEvent { id: SimEventId; index: number; }
export interface TimelinePoint { index: number; price: number; equity: number; equityLow: number; status: 'open' | 'warning' | 'forced_exit' | 'exited'; }

export type OutcomeKind = 'forced_exit' | 'user_exit' | 'ran_to_end';
export interface FinalSummary { equity: number; pnl: number; pnlPct: number; outcome: OutcomeKind; forcedExitIndex?: number; exitIndex?: number; }
export interface SimResult {
  timeline: TimelinePoint[];
  events: SimEvent[];
  final: FinalSummary;
  /** Starting capital of this run; needed to compute loss fractions without re-deriving inputs. */
  capital: number;
  intradayAvailable: boolean;
  maxDrawdown: number;
  worstSingleDayFall: number;
  downCloses: number;
}

/** Typed error thrown for a series with fewer than two bars or any non-positive price. */
export class SeriesError extends Error {
  constructor(message: string) { super(message); this.name = 'SeriesError'; }
}

export interface RunComparison {
  leveragedFinalEquity: number;
  unleveragedFinalEquity: number;
  difference: number;
  /** Gain fraction needed to return to starting capital: x / (1 - x) for loss fraction x; null when no recovery is possible or none is needed. */
  requiredRecoveryGain: number | null;
}

export type DebriefBlockId = 'forcedExit' | 'survivedButHurt' | 'userExitedEarly' | 'unleveragedSurvived' | 'recoveryMaths';
