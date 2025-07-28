import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { DailyMetrics } from '../../types/data';

/**
 * Configuration for the cryptocurrency API service
 */
interface CryptoServiceConfig {
  baseURL: string;
  timeout: number;
  rateLimitDelay: number;
}

/**
 * CoinGecko API response types
 */
interface CoinGeckoMarketData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface CoinGeckoError {
  error: string;
  status: number;
}

/**
 * API service for fetching cryptocurrency market data
 */
class CryptoService {
  private api: AxiosInstance;
  private config: CryptoServiceConfig;
  private lastRequestTime: number = 0;

  constructor() {
    this.config = {
      baseURL: 'https://api.coingecko.com/api/v3',
      timeout: 15000,
      rateLimitDelay: 1200, // 1.2 seconds between requests to respect rate limits
    };

    this.api = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for rate limiting
    this.api.interceptors.request.use(this.handleRateLimit.bind(this));
    
    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      this.handleApiError.bind(this)
    );
  }

  /**
   * Handles rate limiting by adding delays between requests
   */
  private async handleRateLimit(config: any): Promise<any> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.config.rateLimitDelay) {
      const delay = this.config.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
    return config;
  }

  /**
   * Handles API errors with proper error messages
   */
  private handleApiError(error: any): never {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        let message = 'API request failed';
        
        switch (status) {
          case 429:
            message = 'Rate limit exceeded. Please try again later.';
            break;
          case 404:
            message = 'Cryptocurrency not found.';
            break;
          case 500:
            message = 'Server error. Please try again later.';
            break;
          default:
            message = `API error: ${status} - ${error.response.data?.error || 'Unknown error'}`;
        }
        
        throw new Error(message);
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your internet connection.');
      } else {
        // Request setup error
        throw new Error(`Request error: ${error.message}`);
      }
    }
    
    throw error;
  }

  /**
   * Fetches historical market data for a specific cryptocurrency
   * @param coinId - CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
   * @param currency - Quote currency (default: 'usd')
   * @param days - Number of days of data to fetch (default: 365)
   * @returns Promise<DailyMetrics[]> - Transformed market data
   */
  async fetchHistoricalData(
    coinId: string,
    currency: string = 'usd',
    days: number = 365
  ): Promise<DailyMetrics[]> {
    try {
      const response: AxiosResponse<CoinGeckoMarketData> = await this.api.get(
        `/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: currency,
            days: days,
            interval: 'daily',
          },
        }
      );

      return this.transformMarketData(response.data, coinId);
    } catch (error) {
      console.error(`Failed to fetch data for ${coinId}:`, error);
      throw error;
    }
  }

  /**
   * Transforms CoinGecko API response to our DailyMetrics format
   */
  private transformMarketData(
    data: CoinGeckoMarketData,
    symbol: string
  ): DailyMetrics[] {
    const { prices, total_volumes } = data;
    
    if (!prices || prices.length === 0) {
      throw new Error('No price data received from API');
    }

    // Group data by day to handle multiple data points per day
    const dailyData = new Map<string, {
      prices: number[];
      volumes: number[];
      timestamps: number[];
    }>();

    // Process price data
    prices.forEach(([timestamp, price]) => {
      const date = new Date(timestamp);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, { prices: [], volumes: [], timestamps: [] });
      }
      
      const dayData = dailyData.get(dateKey)!;
      dayData.prices.push(price);
      dayData.timestamps.push(timestamp);
    });

    // Process volume data
    total_volumes.forEach(([timestamp, volume]) => {
      const date = new Date(timestamp);
      const dateKey = date.toISOString().split('T')[0];
      
      if (dailyData.has(dateKey)) {
        const dayData = dailyData.get(dateKey)!;
        dayData.volumes.push(volume);
      }
    });

    // Convert to DailyMetrics format
    const result: DailyMetrics[] = [];
    const sortedDates = Array.from(dailyData.keys()).sort();

    sortedDates.forEach((dateKey, index) => {
      const dayData = dailyData.get(dateKey)!;
      const prices = dayData.prices;
      const volumes = dayData.volumes;
      
      if (prices.length === 0) return;

      const open = prices[0];
      const close = prices[prices.length - 1];
      const high = Math.max(...prices);
      const low = Math.min(...prices);
      const volume = volumes.reduce((sum, vol) => sum + vol, 0);
      const changePercent = ((close - open) / open) * 100;

      result.push({
        date: dateKey,
        symbol,
        open,
        high,
        low,
        close,
        volume,
        changePercent,
        volatility: undefined, // Will be calculated by volatility service
      });
    });

    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Gets available cryptocurrency list from CoinGecko
   */
  async getAvailableCoins(): Promise<Array<{ id: string; symbol: string; name: string }>> {
    try {
      const response = await this.api.get('/coins/list');
      return response.data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
      }));
    } catch (error) {
      console.error('Failed to fetch available coins:', error);
      throw error;
    }
  }

  /**
   * Validates if a coin ID is supported by the API
   */
  async validateCoinId(coinId: string): Promise<boolean> {
    try {
      await this.api.get(`/coins/${coinId}`);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const cryptoService = new CryptoService();

// Export types for use in other modules
export type { CoinGeckoMarketData, CoinGeckoError }; 