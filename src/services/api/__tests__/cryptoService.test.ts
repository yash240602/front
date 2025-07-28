import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cryptoService } from '../cryptoService';
import type { AxiosInstance } from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(),
    isAxiosError: vi.fn(),
  },
}));

describe('cryptoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchHistoricalData', () => {
    it('should fetch and transform historical data successfully', async () => {
      const mockResponse = {
        data: {
          prices: [
            [1640995200000, 50000], // 2022-01-01
            [1641081600000, 51000], // 2022-01-02
            [1641168000000, 52000], // 2022-01-03
          ],
          total_volumes: [
            [1640995200000, 1000000],
            [1641081600000, 1200000],
            [1641168000000, 1100000],
          ],
        },
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      const result = await cryptoService.fetchHistoricalData('bitcoin', 'usd', 3);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        date: '2022-01-01',
        symbol: 'bitcoin',
        open: 50000,
        high: 50000,
        low: 50000,
        close: 50000,
        volume: 1000000,
        changePercent: 0,
        volatility: undefined,
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockError = {
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' },
        },
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      await expect(cryptoService.fetchHistoricalData('bitcoin')).rejects.toThrow(
        'Rate limit exceeded. Please try again later.'
      );
    });

    it('should handle network errors', async () => {
      const mockError = {
        request: {},
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      await expect(cryptoService.fetchHistoricalData('bitcoin')).rejects.toThrow(
        'Network error. Please check your internet connection.'
      );
    });
  });

  describe('getAvailableCoins', () => {
    it('should fetch available coins successfully', async () => {
      const mockResponse = {
        data: [
          { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
          { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
        ],
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      const result = await cryptoService.getAvailableCoins();

      expect(result).toEqual([
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
      ]);
    });

    it('should handle errors when fetching coins', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { error: 'Server error' },
        },
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      await expect(cryptoService.getAvailableCoins()).rejects.toThrow();
    });
  });

  describe('validateCoinId', () => {
    it('should return true for valid coin ID', async () => {
      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({ data: {} }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      const result = await cryptoService.validateCoinId('bitcoin');
      expect(result).toBe(true);
    });

    it('should return false for invalid coin ID', async () => {
      const mockError = {
        response: {
          status: 404,
        },
      };

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockRejectedValue(mockError),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      } as any);

      const result = await cryptoService.validateCoinId('invalid-coin');
      expect(result).toBe(false);
    });
  });
}); 