import axios from 'axios';
import type { DailyMetrics } from '../types/data';

const coingeckoApi = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

export const instrumentToCoingeckoId: Record<string, string> = {
  'BTC-USDT': 'bitcoin',
  'ETH-USDT': 'ethereum',
  'BNB-USDT': 'binancecoin',
  'SOL-USDT': 'solana',
  'ADA-USDT': 'cardano',
  'XRP-USDT': 'ripple',
  'DOT-USDT': 'polkadot',
  'AVAX-USDT': 'avalanche-2',
  'DOGE-USDT': 'dogecoin',
  'MATIC-USDT': 'matic-network',
};

const getQuoteCurrency = (instrument: string): string => {
  const parts = instrument.split('-');
  if (parts.length !== 2) {
    throw new Error(`Invalid instrument format: ${instrument}.`);
  }
  const quoteCurrency = parts[1].toLowerCase();
  return quoteCurrency === 'usdt' ? 'usd' : quoteCurrency;
};

export const fetchCoinData = async (
  instrument: string,
  timeframe: '1d' | '1h' | '15m',
  startTimestamp: number,
  endTimestamp: number
): Promise<DailyMetrics[]> => {
  try {
    const coinId = instrumentToCoingeckoId[instrument];
    if (!coinId) {
      throw new Error(`Unsupported instrument: ${instrument}`);
    }
    
    const quoteCurrency = getQuoteCurrency(instrument);
    const fromTimestamp = Math.floor(startTimestamp / 1000);
    const toTimestamp = Math.floor(endTimestamp / 1000);
    
    const endpoint = `/coins/${coinId}/market_chart/range`;
    const params: Record<string, string | number> = {
      vs_currency: quoteCurrency,
      from: fromTimestamp,
      to: toTimestamp
    };
    
    const response = await coingeckoApi.get(endpoint, { params });
    const { prices, total_volumes } = response.data;
    
    if (!prices || !prices.length) {
      throw new Error('No price data returned from API');
    }
    
    return transformCoinGeckoData(instrument, prices, total_volumes);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`CoinGecko API error: ${error.response.status} - ${error.response.data.error || 'Unknown error'}`);
      } else if (error.request) {
        throw new Error('No response received from CoinGecko API.');
      } else {
        throw new Error(`Error setting up request: ${error.message}`);
      }
    }
    throw error;
  }
};

const transformCoinGeckoData = (
  instrument: string,
  prices: [number, number][],
  volumes: [number, number][]
): DailyMetrics[] => {
  const dataByDay = new Map<string, Partial<DailyMetrics> & { prices: number[] }>();

  prices.forEach(([timestamp, price]) => {
    const date = new Date(timestamp);
    const dateString = date.toISOString().split('T')[0];
    
    if (!dataByDay.has(dateString)) {
      dataByDay.set(dateString, {
        date: dateString,
        symbol: instrument,
        open: price,
        high: price,
        low: price,
        close: price,
        prices: [price],
      });
    } else {
      const dayData = dataByDay.get(dateString)!;
      dayData.high = Math.max(dayData.high!, price);
      dayData.low = Math.min(dayData.low!, price);
      dayData.close = price;
      dayData.prices!.push(price);
    }
  });

  volumes.forEach(([timestamp, volume]) => {
    const date = new Date(timestamp);
    const dateString = date.toISOString().split('T')[0];
    if (dataByDay.has(dateString)) {
      const dayData = dataByDay.get(dateString)!;
      dayData.volume = (dayData.volume || 0) + volume;
    }
  });

  const result = Array.from(dataByDay.values()).map(dayData => {
    const changePercent = ((dayData.close! / dayData.open!) - 1) * 100;
    return {
      ...dayData,
      changePercent,
      volume: dayData.volume || 0,
    } as DailyMetrics;
  });

  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}; 