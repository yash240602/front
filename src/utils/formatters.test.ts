import { describe, it, expect } from 'vitest';
import { formatVolume } from './formatters';

describe('formatVolume', () => {
  it('formats numbers less than 1000', () => {
    expect(formatVolume(500)).toBe('500.00');
    expect(formatVolume(0)).toBe('0.00');
  });

  it('formats numbers in the thousands', () => {
    expect(formatVolume(12300)).toBe('12.30K');
    expect(formatVolume(1000)).toBe('1.00K');
    expect(formatVolume(999999)).toBe('1000.00K');
  });

  it('formats numbers in the millions', () => {
    expect(formatVolume(4560000)).toBe('4.56M');
    expect(formatVolume(1000000)).toBe('1.00M');
    expect(formatVolume(999999999)).toBe('1000.00M');
  });

  it('formats numbers in the billions', () => {
    expect(formatVolume(7890000000)).toBe('7.89B');
    expect(formatVolume(1000000000)).toBe('1.00B');
  });

  it('returns N/A for undefined', () => {
    expect(formatVolume(undefined)).toBe('N/A');
  });
}); 