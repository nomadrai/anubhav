import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../prng';

describe('mulberry32', () => {
  it('returns the same sequence for the same seed', () => {
    const left = mulberry32(42); const right = mulberry32(42);
    expect(Array.from({ length: 5 }, () => left())).toEqual(Array.from({ length: 5 }, () => right()));
  });
  it('returns values in the half-open unit interval', () => {
    const random = mulberry32(7);
    expect(Array.from({ length: 20 }, random).every((value) => value >= 0 && value < 1)).toBe(true);
  });
});
