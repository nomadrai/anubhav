import type { Bar } from './types';
export function positionUnits(capital: number, leverage: number, entry: Bar): number { return (capital * leverage) / entry.close; }
export function equityAt(capital: number, units: number, entryPrice: number, price: number): number { return capital + units * (price - entryPrice); }
export function recoveryGainFraction(lossFraction: number): number {
  if (lossFraction < 0 || lossFraction >= 1) throw new Error('lossFraction must be between zero inclusive and one exclusive');
  return lossFraction / (1 - lossFraction);
}
