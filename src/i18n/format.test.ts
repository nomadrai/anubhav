import { describe, expect, it } from 'vitest';
import { formatNumber, formatRupees } from './format';

describe('Indian formatting', () => {
  it('groups large numbers in the Indian convention', () => { expect(formatNumber(100000, 'en')).toBe('1,00,000'); });
  it('formats rupees with a currency marker', () => { expect(formatRupees(10000, 'en')).toContain('10,000'); });
});
