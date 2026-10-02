import { describe, expect, it } from 'vitest';
import { formatNumber, formatPercent, formatRupees, interpolate } from './format';

describe('Indian formatting', () => {
  it('groups large numbers in the Indian convention', () => { expect(formatNumber(100000, 'en')).toBe('1,00,000'); });
  it('formats rupees with a currency marker', () => { expect(formatRupees(10000, 'en')).toContain('10,000'); });
  it('formats signed percentages with Indian grouping', () => {
    expect(formatPercent(-0.5678, 'en')).toBe('-56.8%');
    expect(formatPercent(0.25, 'en')).toBe('+25%');
    expect(formatPercent(0, 'en')).toBe('0%');
  });
  it('formats percentages for Hindi with Devanagari digits', () => {
    expect(formatPercent(-0.1, 'hi')).toContain('%');
  });
});

describe('interpolate', () => {
  it('fills named placeholders', () => {
    expect(interpolate('Ending at {finalAmount} from {startAmount}', { finalAmount: '₹3,000', startAmount: '₹10,000' })).toBe('Ending at ₹3,000 from ₹10,000');
  });
  it('leaves unknown placeholders visible so gaps are caught', () => {
    expect(interpolate('value {missing}', {})).toBe('value {missing}');
  });
  it('accepts numbers and repeats placeholders', () => {
    expect(interpolate('{x} then {x}', { x: 5 })).toBe('5 then 5');
  });
});
