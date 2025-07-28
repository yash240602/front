import { create } from 'zustand';
import type { DailyMetrics } from '../types/data';
import type { MonthlyMetrics } from '../utils/monthlyAggregationService';
import { calculateVolatility, aggregateToWeekly } from '../utils/volatilityService';
import { aggregateToMonthly } from '../utils/monthlyAggregationService';
import { performanceCache, CACHE_KEYS } from '../utils/performanceCache';
import { cryptoService } from '../services/api/cryptoService';

interface MarketDataState {
  historicalData: DailyMetrics[];
  weeklyData: DailyMetrics[];
  monthlyData: MonthlyMetrics[];
  isLoading: boolean;
  error: string | null;
  instrument: string;
  useRealData: boolean;
  availableCoins: Array<{ id: string; symbol: string; name: string }>;
  setInstrument: (instrument: string) => void;
  setUseRealData: (useReal: boolean) => void;
  fetchHistoricalData: (symbol?: string) => Promise<void>;
  fetchAvailableCoins: () => Promise<void>;
  generateMockData: () => void;
  clearCache: () => void;
}

// Mock data generator for development
const generateMockData = (): DailyMetrics[] => {
  const data: DailyMetrics[] = [];
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2025-12-31');
  let currentPrice = 100;
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    
    const change = (Math.random() - 0.5) * 4; // Random change between -2% and +2%
    const open = currentPrice;
    const close = open * (1 + change / 100);
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = Math.floor(Math.random() * 1000000) + 100000;
    
    data.push({
      date: d.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume,
      changePercent: change,
    });
    
    currentPrice = close;
  }
  
  return data;
};

export const useMarketDataStore = create<MarketDataState>((set, get) => ({
  historicalData: [],
  weeklyData: [],
  monthlyData: [],
  isLoading: false,
  error: null,
  instrument: 'bitcoin',
  useRealData: false,
  availableCoins: [],
  
  setInstrument: (instrument) => {
    set({ instrument });
    // Fetch data for the new instrument
    get().fetchHistoricalData(instrument);
  },

  setUseRealData: (useReal) => {
    set({ useRealData: useReal });
    // Refetch data with new setting
    get().fetchHistoricalData();
  },

  fetchAvailableCoins: async () => {
    try {
      set({ isLoading: true, error: null });
      const coins = await cryptoService.getAvailableCoins();
      set({ availableCoins: coins, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch available coins',
        isLoading: false 
      });
    }
  },
  
  fetchHistoricalData: async (symbol) => {
    set({ isLoading: true, error: null });
    
    const symbolToUse = symbol || get().instrument;
    const { useRealData } = get();
    
    try {
      // Check cache first
      const cachedHistorical = performanceCache.get<DailyMetrics[]>(CACHE_KEYS.HISTORICAL_DATA(symbolToUse));
      const cachedWeekly = performanceCache.get<DailyMetrics[]>(CACHE_KEYS.WEEKLY_DATA(symbolToUse));
      const cachedMonthly = performanceCache.get<MonthlyMetrics[]>(CACHE_KEYS.MONTHLY_DATA(symbolToUse));
      
      if (cachedHistorical && cachedWeekly && cachedMonthly && !useRealData) {
        set({
          historicalData: cachedHistorical,
          weeklyData: cachedWeekly,
          monthlyData: cachedMonthly,
          isLoading: false
        });
        return;
      }
      
      let data: DailyMetrics[];
      
      if (useRealData) {
        // Fetch real data from API
        data = await cryptoService.fetchHistoricalData(symbolToUse, 'usd', 365);
      } else {
        // Generate mock data
        data = generateMockData();
      }
      
      const dataWithVolatility = calculateVolatility(data);
      const weeklyAggregates = aggregateToWeekly(dataWithVolatility);
      const monthlyAggregates = aggregateToMonthly(dataWithVolatility);
      
      // Cache the results (only for mock data)
      if (!useRealData) {
        performanceCache.set(CACHE_KEYS.HISTORICAL_DATA(symbolToUse), dataWithVolatility);
        performanceCache.set(CACHE_KEYS.WEEKLY_DATA(symbolToUse), weeklyAggregates);
        performanceCache.set(CACHE_KEYS.MONTHLY_DATA(symbolToUse), monthlyAggregates);
      }
      
      set({
        historicalData: dataWithVolatility,
        weeklyData: weeklyAggregates,
        monthlyData: monthlyAggregates,
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to fetch market data:", error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },
  
  generateMockData: () => {
    // Clear cache to ensure fresh data generation
    performanceCache.clear();
    
    const mockData = generateMockData();
    const dataWithVolatility = calculateVolatility(mockData);
    const weeklyAggregates = aggregateToWeekly(dataWithVolatility);
    const monthlyAggregates = aggregateToMonthly(dataWithVolatility);
    
    set({
      historicalData: dataWithVolatility,
      weeklyData: weeklyAggregates,
      monthlyData: monthlyAggregates,
    });
  },
  
  clearCache: () => {
    performanceCache.clear();
  },
}));

export const selectHistoricalData = (state: MarketDataState) => state.historicalData;
export const selectCurrentInstrument = (state: MarketDataState) => state.instrument;
export const selectIsLoading = (state: MarketDataState) => state.isLoading;
export const selectError = (state: MarketDataState) => state.error;