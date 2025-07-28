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
  date: string;
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
  /** 30-day rolling volatility (standard deviation) */
  volatility?: number;
  /** Instrument symbol for the day */
  instrument?: string;
}

/**
 * Data structure for calendar visualization cells
 */
export interface CalendarCellData {
  /** The date this cell represents */
  date: Date;
  /** Day of month (1-31) */
  day: string;
  /** Whether this date is in the current month being viewed */
  isCurrentMonth: boolean;
  /** Whether this date is the current date */
  isToday: boolean;
  /** Whether this date has associated market data */
  hasData: boolean;
  /** Complete metrics for this day (if data exists) */
  metrics?: DailyMetrics;
  /** Percentage change for this day (if data exists) */
  changePercent?: number;
  /** Whether this date is selected in the UI */
  isSelected: boolean;
}