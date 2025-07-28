import { describe, it, expect } from 'vitest';
import { calculateVolatility, aggregateToWeekly, aggregateToMonthly } from '../volatilityService';
import type { DailyMetrics } from '../../types/data';

describe('volatilityService', () => {
  describe('calculateVolatility', () => {
    it('should calculate volatility for valid data', () => {
      const mockData: DailyMetrics[] = [
        { date: '2024-01-01', open: 100, high: 105, low: 98, close: 102, volume: 1000000, changePercent: 2 },
        { date: '2024-01-02', open: 102, high: 108, low: 100, close: 106, volume: 1200000, changePercent: 3.92 },
        { date: '2024-01-03', open: 106, high: 110, low: 104, close: 108, volume: 1100000, changePercent: 1.89 },
      ];

      const result = calculateVolatility(mockData);
      
      expect(result).toHaveLength(3);
      expect(result[0].volatility).toBeUndefined(); // First 30 days have no volatility
      expect(result[1].volatility).toBeUndefined();
      expect(result[2].volatility).toBeUndefined();
    });

    it('should handle empty data', () => {
      const result = calculateVolatility([]);
      expect(result).toEqual([]);
    });

    it('should handle single data point', () => {
      const mockData: DailyMetrics[] = [
        { date: '2024-01-01', open: 100, high: 105, low: 98, close: 102, volume: 1000000, changePercent: 2 },
      ];

      const result = calculateVolatility(mockData);
      expect(result).toHaveLength(1);
      expect(result[0].volatility).toBeUndefined();
    });
  });

  describe('aggregateToWeekly', () => {
    it('should aggregate daily data to weekly summaries', () => {
      const mockData: DailyMetrics[] = [
        { date: '2024-01-01', open: 100, high: 105, low: 98, close: 102, volume: 1000000, changePercent: 2 },
        { date: '2024-01-02', open: 102, high: 108, low: 100, close: 106, volume: 1200000, changePercent: 3.92 },
        { date: '2024-01-03', open: 106, high: 110, low: 104, close: 108, volume: 1100000, changePercent: 1.89 },
      ];

      const result = aggregateToWeekly(mockData);
      
      expect(result).toHaveLength(1); // All data in same week
      expect(result[0].open).toBe(100);
      expect(result[0].close).toBe(108);
      expect(result[0].volume).toBe(3300000); // Sum of all volumes
    });

    it('should handle empty data', () => {
      const result = aggregateToWeekly([]);
      expect(result).toEqual([]);
    });
  });

  describe('aggregateToMonthly', () => {
    it('should aggregate daily data to monthly summaries', () => {
      const mockData: DailyMetrics[] = [
        { date: '2024-01-01', open: 100, high: 105, low: 98, close: 102, volume: 1000000, changePercent: 2 },
        { date: '2024-01-02', open: 102, high: 108, low: 100, close: 106, volume: 1200000, changePercent: 3.92 },
        { date: '2024-01-03', open: 106, high: 110, low: 104, close: 108, volume: 1100000, changePercent: 1.89 },
      ];

      const result = aggregateToMonthly(mockData);
      
      expect(result).toHaveLength(1); // All data in same month
      expect(result[0].open).toBe(100);
      expect(result[0].close).toBe(108);
      expect(result[0].volume).toBe(3300000); // Sum of all volumes
    });

    it('should handle empty data', () => {
      const result = aggregateToMonthly([]);
      expect(result).toEqual([]);
    });
  });
});
