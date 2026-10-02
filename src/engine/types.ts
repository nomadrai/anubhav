export interface Bar { open?: number; high?: number; low?: number; close: number; }
export interface SimConfig { maintenanceFraction: number; warnBuffer: number; drawdownMarks: number[]; }
export interface SimInput { series: Bar[]; capital: number; leverage: 1 | 2 | 5 | 10; exitAtIndex?: number; config: SimConfig; }
export type SimEventId = 'ENTRY' | 'DRAWDOWN_5' | 'DRAWDOWN_10' | 'DRAWDOWN_20' | 'MARGIN_WARNING' | 'FORCED_EXIT' | 'USER_EXIT' | 'EPISODE_END' | 'UNLEVERAGED_SURVIVED';
export interface SimEvent { id: SimEventId; index: number; }
export interface TimelinePoint { index: number; price: number; equity: number; equityLow: number; status: 'open' | 'warning' | 'forced_exit' | 'exited'; }
export interface SimResult { timeline: TimelinePoint[]; events: SimEvent[]; final: { equity: number; pnl: number; pnlPct: number; forcedExitIndex?: number }; intradayAvailable: boolean; }
