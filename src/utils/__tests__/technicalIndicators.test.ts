import { describe, it, expect } from 'vitest';
import {
  calculateSMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateAllIndicators,
  getTechnicalSignals,
} from '../technicalIndicators';
import type { DailyMetrics } from '../../types/data';

describe('technicalIndicators', () => {
  describe('calculateSMA', () => {
    it('should calculate SMA for valid data', () => {
      const prices = [10, 12, 14, 16, 18, 20, 22];
      const sma7 = calculateSMA(prices, 7);
      
      expect(sma7).toHaveLength(7);
      expect(sma7[6]).toBeCloseTo(16, 2); // Average of all 7 values
      expect(sma7[0]).toBe(0); // Not enough data for first 6 values
    });

    it('should handle insufficient data', () => {
      const prices = [10, 12, 14];
      const sma7 = calculateSMA(prices, 7);
      
      expect(sma7).toHaveLength(3);
      expect(sma7.every(val => val === 0)).toBe(true);
    });

    it('should handle empty array', () => {
      const sma = calculateSMA([], 5);
      expect(sma).toEqual([]);
    });
  });

  describe('calculateRSI', () => {
    it('should calculate RSI for valid data', () => {
      const prices = [44, 44.34, 44.09, 44.15, 43.61, 44.33, 44.23, 44.57, 44.29, 44.30];
      const rsi = calculateRSI(prices, 14);
      
      expect(rsi).toHaveLength(prices.length - 1);
      expect(rsi[0]).toBe(0); // First 13 values are 0 (not enough data)
      expect(rsi[rsi.length - 1]).toBeGreaterThan(0);
      expect(rsi[rsi.length - 1]).toBeLessThan(100);
    });

    it('should handle insufficient data', () => {
      const prices = [10, 12, 14];
      const rsi = calculateRSI(prices, 14);
      
      expect(rsi).toHaveLength(2);
      expect(rsi.every(val => val === 0)).toBe(true);
    });

    it('should handle constant prices', () => {
      const prices = [100, 100, 100, 100, 100];
      const rsi = calculateRSI(prices, 14);
      
      expect(rsi).toHaveLength(4);
      expect(rsi.every(val => val === 0)).toBe(true);
    });
  });

  describe('calculateMACD', () => {
    it('should calculate MACD for valid data', () => {
      const prices = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68];
      const macd = calculateMACD(prices);
      
      expect(macd.macd).toHaveLength(prices.length);
      expect(macd.signal).toHaveLength(prices.length);
      expect(macd.histogram).toHaveLength(prices.length);
      
      // First 25 values should be 0 (not enough data for slow EMA)
      expect(macd.macd.slice(0, 25).every(val => val === 0)).toBe(true);
    });

    it('should handle insufficient data', () => {
      const prices = [10, 12, 14, 16, 18, 20];
      const macd = calculateMACD(prices);
      
      expect(macd.macd).toHaveLength(6);
      expect(macd.signal).toHaveLength(6);
      expect(macd.histogram).toHaveLength(6);
      expect(macd.macd.every(val => val === 0)).toBe(true);
    });
  });

  describe('calculateBollingerBands', () => {
    it('should calculate Bollinger Bands for valid data', () => {
      const prices = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50];
      const bands = calculateBollingerBands(prices, 20, 2);
      
      expect(bands.upper).toHaveLength(prices.length);
      expect(bands.middle).toHaveLength(prices.length);
      expect(bands.lower).toHaveLength(prices.length);
      
      // First 19 values should be 0 (not enough data)
      expect(bands.upper.slice(0, 19).every(val => val === 0)).toBe(true);
      expect(bands.middle.slice(0, 19).every(val => val === 0)).toBe(true);
      expect(bands.lower.slice(0, 19).every(val => val === 0)).toBe(true);
    });

    it('should handle insufficient data', () => {
      const prices = [10, 12, 14, 16, 18];
      const bands = calculateBollingerBands(prices, 20);
      
      expect(bands.upper).toHaveLength(5);
      expect(bands.middle).toHaveLength(5);
      expect(bands.lower).toHaveLength(5);
      expect(bands.upper.every(val => val === 0)).toBe(true);
    });
  });

  describe('calculateAllIndicators', () => {
    it('should calculate all indicators for valid data', () => {
      const mockData: DailyMetrics[] = [
        { date: '2024-01-01', open: 100, high: 105, low: 98, close: 102, volume: 1000000, changePercent: 2 },
        { date: '2024-01-02', open: 102, high: 108, low: 100, close: 106, volume: 1200000, changePercent: 3.92 },
        { date: '2024-01-03', open: 106, high: 110, low: 104, close: 108, volume: 1100000, changePercent: 1.89 },
      ];

      const indicators = calculateAllIndicators(mockData);
      
      expect(indicators.sma7).toHaveLength(3);
      expect(indicators.sma14).toHaveLength(3);
      expect(indicators.sma30).toHaveLength(3);
      expect(indicators.rsi).toHaveLength(3);
      expect(indicators.macd.macd).toHaveLength(3);
      expect(indicators.macd.signal).toHaveLength(3);
      expect(indicators.macd.histogram).toHaveLength(3);
      expect(indicators.bollingerBands.upper).toHaveLength(3);
      expect(indicators.bollingerBands.middle).toHaveLength(3);
      expect(indicators.bollingerBands.lower).toHaveLength(3);
    });

    it('should handle empty data', () => {
      const indicators = calculateAllIndicators([]);
      
      expect(indicators.sma7).toEqual([]);
      expect(indicators.sma14).toEqual([]);
      expect(indicators.sma30).toEqual([]);
      expect(indicators.rsi).toEqual([]);
      expect(indicators.macd.macd).toEqual([]);
      expect(indicators.macd.signal).toEqual([]);
      expect(indicators.macd.histogram).toEqual([]);
      expect(indicators.bollingerBands.upper).toEqual([]);
      expect(indicators.bollingerBands.middle).toEqual([]);
      expect(indicators.bollingerBands.lower).toEqual([]);
    });
  });

  describe('getTechnicalSignals', () => {
    it('should return neutral signals for insufficient data', () => {
      const indicators = {
        sma7: [0, 0, 0],
        sma14: [0, 0, 0],
        sma30: [0, 0, 0],
        rsi: [0, 0, 0],
        macd: { macd: [0, 0, 0], signal: [0, 0, 0], histogram: [0, 0, 0] },
        bollingerBands: { upper: [0, 0, 0], middle: [0, 0, 0], lower: [0, 0, 0] },
      };

      const signals = getTechnicalSignals(indicators, 0);
      
      expect(signals.rsiSignal).toBe('neutral');
      expect(signals.macdSignal).toBe('neutral');
      expect(signals.bollingerSignal).toBe('neutral');
      expect(signals.overallSignal).toBe('neutral');
    });

    it('should return bullish signals for oversold RSI', () => {
      const indicators = {
        sma7: [100, 100, 100],
        sma14: [100, 100, 100],
        sma30: [100, 100, 100],
        rsi: [25, 25, 25], // Oversold
        macd: { macd: [1, 1, 1], signal: [0, 0, 0], histogram: [1, 1, 1] }, // Bullish
        bollingerBands: { upper: [110, 110, 110], middle: [100, 100, 100], lower: [90, 90, 90] },
      };

      const signals = getTechnicalSignals(indicators, 2);
      
      expect(signals.rsiSignal).toBe('oversold');
      expect(signals.macdSignal).toBe('bullish');
      expect(signals.overallSignal).toBe('bullish');
    });

    it('should return bearish signals for overbought RSI', () => {
      const indicators = {
        sma7: [100, 100, 100],
        sma14: [100, 100, 100],
        sma30: [100, 100, 100],
        rsi: [75, 75, 75], // Overbought
        macd: { macd: [-1, -1, -1], signal: [0, 0, 0], histogram: [-1, -1, -1] }, // Bearish
        bollingerBands: { upper: [110, 110, 110], middle: [100, 100, 100], lower: [90, 90, 90] },
      };

      const signals = getTechnicalSignals(indicators, 2);
      
      expect(signals.rsiSignal).toBe('overbought');
      expect(signals.macdSignal).toBe('bearish');
      expect(signals.overallSignal).toBe('bearish');
    });

    it('should handle invalid index', () => {
      const indicators = {
        sma7: [100],
        sma14: [100],
        sma30: [100],
        rsi: [50],
        macd: { macd: [0], signal: [0], histogram: [0] },
        bollingerBands: { upper: [110], middle: [100], lower: [90] },
      };

      const signals = getTechnicalSignals(indicators, -1);
      
      expect(signals.rsiSignal).toBe('neutral');
      expect(signals.macdSignal).toBe('neutral');
      expect(signals.bollingerSignal).toBe('neutral');
      expect(signals.overallSignal).toBe('neutral');
    });
  });
}); 