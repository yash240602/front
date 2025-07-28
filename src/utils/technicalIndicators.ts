import type { DailyMetrics } from '../types/data';

/**
 * Technical analysis indicators interface
 */
export interface TechnicalIndicators {
  sma7: number[];
  sma14: number[];
  sma30: number[];
  rsi: number[];
  macd: {
    macd: number[];
    signal: number[];
    histogram: number[];
  };
  bollingerBands: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
}

/**
 * Calculates Simple Moving Average (SMA)
 * @param prices - Array of closing prices
 * @param period - Period for SMA calculation
 * @returns Array of SMA values
 */
export const calculateSMA = (prices: number[], period: number): number[] => {
  if (prices.length < period) {
    return new Array(prices.length).fill(0);
  }

  const sma: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(0); // Not enough data
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  
  return sma;
};

/**
 * Calculates Relative Strength Index (RSI)
 * @param prices - Array of closing prices
 * @param period - Period for RSI calculation (default: 14)
 * @returns Array of RSI values
 */
export const calculateRSI = (prices: number[], period: number = 14): number[] => {
  if (prices.length < period + 1) {
    return new Array(prices.length).fill(0);
  }

  const rsi: number[] = new Array(period - 1).fill(0);
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Calculate RSI for the first valid period
  let rs = avgGain / avgLoss;
  let rsiValue = 100 - (100 / (1 + rs));
  rsi.push(rsiValue);

  // Calculate RSI for remaining periods using smoothed averages
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    
    rs = avgGain / avgLoss;
    rsiValue = 100 - (100 / (1 + rs));
    rsi.push(rsiValue);
  }

  return rsi;
};

/**
 * Calculates MACD (Moving Average Convergence Divergence)
 * @param prices - Array of closing prices
 * @param fastPeriod - Fast EMA period (default: 12)
 * @param slowPeriod - Slow EMA period (default: 26)
 * @param signalPeriod - Signal line period (default: 9)
 * @returns MACD object with macd, signal, and histogram arrays
 */
export const calculateMACD = (
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } => {
  if (prices.length < slowPeriod) {
    return {
      macd: new Array(prices.length).fill(0),
      signal: new Array(prices.length).fill(0),
      histogram: new Array(prices.length).fill(0),
    };
  }

  // Calculate EMA
  const calculateEMA = (prices: number[], period: number): number[] => {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA is SMA
    const sma = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    ema.push(sma);
    
    // Calculate EMA for remaining periods
    for (let i = 1; i < prices.length; i++) {
      const emaValue = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
      ema.push(emaValue);
    }
    
    return ema;
  };

  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  // Calculate MACD line
  const macd: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < slowPeriod - 1) {
      macd.push(0);
    } else {
      macd.push(fastEMA[i] - slowEMA[i]);
    }
  }

  // Calculate signal line (EMA of MACD)
  const signal = calculateEMA(macd.filter(x => x !== 0), signalPeriod);
  const signalPadded = new Array(macd.length - signal.length).fill(0).concat(signal);

  // Calculate histogram
  const histogram = macd.map((value, index) => value - signalPadded[index]);

  return { macd, signal: signalPadded, histogram };
};

/**
 * Calculates Bollinger Bands
 * @param prices - Array of closing prices
 * @param period - Period for SMA calculation (default: 20)
 * @param stdDev - Standard deviation multiplier (default: 2)
 * @returns Bollinger Bands object with upper, middle, and lower arrays
 */
export const calculateBollingerBands = (
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number[]; middle: number[]; lower: number[] } => {
  if (prices.length < period) {
    return {
      upper: new Array(prices.length).fill(0),
      middle: new Array(prices.length).fill(0),
      lower: new Array(prices.length).fill(0),
    };
  }

  const middle = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];

  // Calculate standard deviation and bands
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(0);
      lower.push(0);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upper.push(middle[i] + (standardDeviation * stdDev));
      lower.push(middle[i] - (standardDeviation * stdDev));
    }
  }

  return { upper, middle, lower };
};

/**
 * Calculates all technical indicators for a dataset
 * @param data - Array of DailyMetrics
 * @returns TechnicalIndicators object with all calculated indicators
 */
export const calculateAllIndicators = (data: DailyMetrics[]): TechnicalIndicators => {
  if (data.length === 0) {
    return {
      sma7: [],
      sma14: [],
      sma30: [],
      rsi: [],
      macd: { macd: [], signal: [], histogram: [] },
      bollingerBands: { upper: [], middle: [], lower: [] },
    };
  }

  const prices = data.map(d => d.close);
  
  return {
    sma7: calculateSMA(prices, 7),
    sma14: calculateSMA(prices, 14),
    sma30: calculateSMA(prices, 30),
    rsi: calculateRSI(prices, 14),
    macd: calculateMACD(prices, 12, 26, 9),
    bollingerBands: calculateBollingerBands(prices, 20, 2),
  };
};

/**
 * Gets bullish/bearish signals based on technical indicators
 * @param indicators - Technical indicators data
 * @param currentIndex - Current data point index
 * @returns Object with signal analysis
 */
export const getTechnicalSignals = (
  indicators: TechnicalIndicators,
  currentIndex: number
): {
  rsiSignal: 'oversold' | 'overbought' | 'neutral';
  macdSignal: 'bullish' | 'bearish' | 'neutral';
  bollingerSignal: 'oversold' | 'overbought' | 'neutral';
  overallSignal: 'bullish' | 'bearish' | 'neutral';
} => {
  if (currentIndex < 0 || currentIndex >= indicators.rsi.length) {
    return {
      rsiSignal: 'neutral',
      macdSignal: 'neutral',
      bollingerSignal: 'neutral',
      overallSignal: 'neutral',
    };
  }

  const rsi = indicators.rsi[currentIndex];
  const macd = indicators.macd.macd[currentIndex];
  const signal = indicators.macd.signal[currentIndex];
  const histogram = indicators.macd.histogram[currentIndex];

  // RSI signals
  let rsiSignal: 'oversold' | 'overbought' | 'neutral' = 'neutral';
  if (rsi < 30) rsiSignal = 'oversold';
  else if (rsi > 70) rsiSignal = 'overbought';

  // MACD signals
  let macdSignal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (macd > signal && histogram > 0) macdSignal = 'bullish';
  else if (macd < signal && histogram < 0) macdSignal = 'bearish';

  // Bollinger Bands signals (simplified - would need price data)
  let bollingerSignal: 'oversold' | 'overbought' | 'neutral' = 'neutral';

  // Overall signal
  let bullishCount = 0;
  let bearishCount = 0;

  if (rsiSignal === 'oversold') bullishCount++;
  else if (rsiSignal === 'overbought') bearishCount++;

  if (macdSignal === 'bullish') bullishCount++;
  else if (macdSignal === 'bearish') bearishCount++;

  let overallSignal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (bullishCount > bearishCount) overallSignal = 'bullish';
  else if (bearishCount > bullishCount) overallSignal = 'bearish';

  return {
    rsiSignal,
    macdSignal,
    bollingerSignal,
    overallSignal,
  };
}; 