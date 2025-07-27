import type { DailyMetrics } from '../types/data';

/**
 * Calculates 30-day rolling volatility (standard deviation of daily returns)
 * @param historicalData Array of daily metrics sorted by date
 * @param windowSize Rolling window size (default: 30 days)
 * @returns Enhanced data with volatility field
 */
export const calculateVolatility = (
  historicalData: DailyMetrics[], 
  windowSize: number = 30
): DailyMetrics[] => {
  if (historicalData.length < 2) return historicalData;

  // Sort by date to ensure proper order
  const sortedData = [...historicalData].sort((a, b) => {
    const dateA = typeof a.date === 'string' ? new Date(a.date) : new Date(a.date);
    const dateB = typeof b.date === 'string' ? new Date(b.date) : new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  // Calculate daily returns first
  const dailyReturns: number[] = [];
  for (let i = 1; i < sortedData.length; i++) {
    const prevClose = sortedData[i - 1].close;
    const currentClose = sortedData[i].close;
    const dailyReturn = (currentClose - prevClose) / prevClose;
    dailyReturns.push(dailyReturn);
  }

  // Calculate rolling volatility for each day
  return sortedData.map((dayData, index) => {
    if (index < windowSize) {
      // Not enough data for full window, return without volatility
      return dayData;
    }

    // Get the returns for the rolling window
    const windowReturns = dailyReturns.slice(index - windowSize, index);
    
    // Calculate mean return
    const meanReturn = windowReturns.reduce((sum, ret) => sum + ret, 0) / windowReturns.length;
    
    // Calculate variance
    const variance = windowReturns.reduce((sum, ret) => {
      return sum + Math.pow(ret - meanReturn, 2);
    }, 0) / windowReturns.length;
    
    // Standard deviation (volatility) - annualized by multiplying by sqrt(252)
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Convert to percentage

    return {
      ...dayData,
      volatility
    };
  });
};

/**
 * Gets volatility percentile for color mapping
 * @param volatility Current volatility value
 * @param allVolatilities Array of all volatility values for comparison
 * @returns Percentile (0-1) for color intensity
 */
export const getVolatilityPercentile = (
  volatility: number | undefined, 
  allVolatilities: (number | undefined)[]
): number => {
  if (volatility === undefined) return 0;
  
  const validVolatilities = allVolatilities.filter((v): v is number => v !== undefined);
  if (validVolatilities.length === 0) return 0;
  
  const sorted = validVolatilities.sort((a, b) => a - b);
  const rank = sorted.findIndex(v => v >= volatility);
  
  return rank === -1 ? 1 : rank / sorted.length;
};
