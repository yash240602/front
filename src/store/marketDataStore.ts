import { create } from 'zustand';
import { DailyMetrics } from '../types/data';
import { fetchCoinData } from '../api/coingecko';

interface MarketDataState {
  historicalData: DailyMetrics[];
  instrument: string;
  timeframe: '1d' | '1h' | '15m';
  dateRange: {
    start: Date;
    end: Date;
  };
  isLoading: boolean;
  error: string | null;
  setInstrument: (instrument: string) => void;
  setTimeframe: (timeframe: '1d' | '1h' | '15m') => void;
  setDateRange: (start: Date, end: Date) => void;
  fetchHistoricalData: (instrument?: string) => Promise<void>;
  clearError: () => void;
}

export const useMarketDataStore = create<MarketDataState>((set, get) => ({
  historicalData: [],
  instrument: 'BTC-USDT',
  timeframe: '1d',
  dateRange: {
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
    end: new Date(),
  },
  isLoading: false,
  error: null,
  
  setInstrument: (instrument) => set({ instrument }),
  setTimeframe: (timeframe) => set({ timeframe }),
  setDateRange: (start, end) => set({ dateRange: { start, end } }),
  clearError: () => set({ error: null }),
  
  fetchHistoricalData: async (instrument) => {
    const currentInstrument = instrument || get().instrument;
    const { start, end } = get().dateRange;
    const timeframe = get().timeframe;
    
    set({ isLoading: true, error: null });
    
    try {
      const data = await fetchCoinData(
        currentInstrument, 
        timeframe,
        start.getTime(),
        end.getTime()
      );
      
      if (instrument) {
        set({ instrument: currentInstrument });
      }
      
      set({ 
        historicalData: data,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching historical data:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch market data',
        isLoading: false 
      });
    }
  },
}));

export const selectHistoricalData = (state: MarketDataState) => state.historicalData;
export const selectCurrentInstrument = (state: MarketDataState) => state.instrument;
export const selectIsLoading = (state: MarketDataState) => state.isLoading;
export const selectError = (state: MarketDataState) => state.error; 