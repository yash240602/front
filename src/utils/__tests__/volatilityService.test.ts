import { describe, it, expect } from 'vitest';
import { calculateVolatility, getVolatilityPercentile } from '../volatilityService';
import type { DailyMetrics } from '../../types/data';

describe('Volatility Service', () => {
  describe('calculateVolatility', () => {
    it('should return empty array for empty input', () => {
      const result = calculateVolatility([]);
      expect(result).toEqual([]);
    });

    it('should return original data for single item', () => {
      const data: DailyMetrics[] = [{
        date: '2024-01-01',
        symbol: 'BTCUSDT',
        open: 100,
        high: 105,
        low: 95,
        close: 102,
        volume: 1000,
        changePercent: 2.0
      }];
      
      const result = calculateVolatility(data);
      expect(result).toEqual(data);
      expect(result[0].volatility).toBeUndefined();
    });

    it('should calculate volatility for sufficient data', () => {
      // Create 35 days of mock data to ensure we have enough for 30-day window
      const data: DailyMetrics[] = [];
      for (let i = 0; i < 35; i++) {
        data.push({
          date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
          symbol: 'BTCUSDT',
          open: 100 + i,
          high: 105 + i,
          low: 95 + i,
          close: 100 + i + (i % 2 === 0 ? 1 : -1), // Alternate between gains and losses
          volume: 1000,
          changePercent: i % 2 === 0 ? 1.0 : -1.0
        });
      }
      
      const result = calculateVolatility(data);
      
      // First 30 items should not have volatility
      for (let i = 0; i < 30; i++) {
        expect(result[i].volatility).toBeUndefined();
      }
      
      // Items after index 30 should have volatility calculated
      for (let i = 30; i < result.length; i++) {
        expect(result[i].volatility).toBeDefined();
        expect(typeof result[i].volatility).toBe('number');
        expect(result[i].volatility!).toBeGreaterThan(0);
      }
    });

    it('should sort data by date before calculation', () => {
      const data: DailyMetrics[] = [
        {
          date: '2024-01-03',
          symbol: 'BTCUSDT',
          open: 102,
          high: 107,
          low: 97,
          close: 104,
          volume: 1000,
          changePercent: 1.96
        },
        {
          date: '2024-01-01',
          symbol: 'BTCUSDT',
          open: 100,
          high: 105,
          low: 95,
          close: 102,
          volume: 1000,
          changePercent: 2.0
        },
        {
          date: '2024-01-02',
          symbol: 'BTCUSDT',
          open: 102,
          high: 106,
          low: 96,
          close: 103,
          volume: 1000,
          changePercent: 0.98
        }
      ];
      
      const result = calculateVolatility(data);
      
      // Should be sorted by date
      expect(result[0].date).toBe('2024-01-01');
      expect(result[1].date).toBe('2024-01-02');
      expect(result[2].date).toBe('2024-01-03');
    });
  });

  describe('getVolatilityPercentile', () => {
    it('should return 0 for undefined volatility', () => {
      const percentile = getVolatilityPercentile(undefined, [10, 20, 30]);
      expect(percentile).toBe(0);
    });

    it('should return 0 for empty array', () => {
      const percentile = getVolatilityPercentile(15, []);
      expect(percentile).toBe(0);
    });

    it('should calculate correct percentile', () => {
      const allVolatilities = [10, 20, 30, 40, 50];
      
      // Test minimum value
      expect(getVolatilityPercentile(10, allVolatilities)).toBe(0);
      
      // Test middle value
      expect(getVolatilityPercentile(30, allVolatilities)).toBe(0.4); // 2/5
      
      // Test maximum value
      expect(getVolatilityPercentile(50, allVolatilities)).toBe(0.8); // 4/5
      
      // Test value higher than all others
      expect(getVolatilityPercentile(60, allVolatilities)).toBe(1);
    });

    it('should filter out undefined values', () => {
      const allVolatilities = [10, undefined, 20, undefined, 30];
      const percentile = getVolatilityPercentile(20, allVolatilities);
      
      // Should only consider [10, 20, 30], so 20 is at index 1 out of 3
      expect(percentile).toBe(1/3);
    });
  });
});
