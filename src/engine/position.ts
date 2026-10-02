import type { Bar } from './types';
export function positionUnits(capital: number, leverage: number, entry: Bar): number { return (capital * leverage) / entry.close; }
export function equityAt(capital: number, units: number, entryPrice: number, price: number): number { return capital + units * (price - entryPrice); }
/** x / (1 - x) for loss fraction x; null means total loss (no finite gain recovers), 0 means no loss. */
export function recoveryGainFraction(lossFraction: number): number | null {
  if (lossFraction <= 0) return 0;
  if (lossFraction >= 1) return null;
  return lossFraction / (1 - lossFraction);
}
