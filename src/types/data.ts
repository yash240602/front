/**
 * Represents a single price candle for a financial instrument
 */
export interface Candle {
  /** Trading pair or instrument symbol (e.g., "BTCUSDT") */
  symbol: string;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** Opening price for this candle period */
  open: number;
  /** Highest price during this candle period */
  high: number;
  /** Lowest price during this candle period */
  low: number;
  /** Closing price for this candle period */
  close: number;
  /** Trading volume during this candle period */
  volume: number;
}

/**
 * Aggregated metrics for a specific trading day
 */
export interface DailyMetrics {
  /** The date for these metrics (ISO string or timestamp) */
  date: string | number;
  /** Trading pair or instrument symbol */
  symbol: string;
  /** Opening price for the day */
  open: number;
  /** Highest price of the day */
  high: number;
  /** Lowest price of the day */
  low: number;
  /** Closing price for the day */
  close: number;
  /** Trading volume for the day */
  volume: number;
  /** Percentage change for the day (close/open - 1) * 100 */
  changePercent: number;
  
  // Technical indicators (optional)
  /** Simple Moving Average (20 periods) */
  sma20?: number;
  /** Simple Moving Average (50 periods) */
  sma50?: number;
  /** Simple Moving Average (200 periods) */
  sma200?: number;
  /** Relative Strength Index */
  rsi?: number;
  /** Moving Average Convergence Divergence */
  macd?: {
    /** MACD line value */
    line: number;
    /** MACD signal line value */
    signal: number;
    /** MACD histogram value */
    histogram: number;
  };
  /** Average True Range - volatility indicator */
  atr?: number;
  /** 30-day rolling volatility (standard deviation) */
  volatility?: number;
  /** Bollinger Bands */
  bollinger?: {
    /** Upper band value */
    upper: number;
    /** Middle band value (typically SMA20) */
    middle: number;
    /** Lower band value */
    lower: number;
  };
}

/**
 * Data structure for calendar visualization cells
 */
export interface CalendarCellData {
  /** The date this cell represents */
  date: Date;
  /** Day of month (1-31) */
  day: number;
  /** Whether this date has associated market data */
  hasData: boolean;
  /** Percentage change for this day (if data exists) */
  changePercent?: number;
  /** Absolute price change for this day (if data exists) */
  priceChange?: number;
  /** Volume for this day (if data exists) */
  volume?: number;
  /** Complete metrics for this day (if data exists) */
  metrics?: DailyMetrics;
  /** Whether this date is selected in the UI */
  isSelected?: boolean;
  /** Whether this date is the current date */
  isToday?: boolean;
  /** Whether this date is in the current month being viewed */
  isCurrentMonth?: boolean;
} 