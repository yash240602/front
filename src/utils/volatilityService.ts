import type { DailyMetrics } from '../types/data';
import { getWeek } from 'date-fns';

/**
 * Calculates the standard deviation of a dataset.
 */
const calculateStandardDeviation = (data: number[]): number => {
  const n = data.length;
  if (n < 2) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / n;
  const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
  return Math.sqrt(variance);
};

/**
 * Calculates rolling 30-day volatility for a series of price data.
 */
export const calculateVolatility = (data: DailyMetrics[]): DailyMetrics[] => {
  if (!Array.isArray(data) || data.length < 2) return data;
  
  // Calculate log returns for the entire dataset first
  const returns = data.map((d, i) => {
    if (i === 0 || !d.close || !data[i-1]?.close) return 0;
    return Math.log(d.close / data[i - 1].close);
  });

  // Calculate rolling volatility based on the returns
  return data.map((day, i) => {
    if (i < 30) return { ...day, volatility: undefined }; // Not enough data for the first 30 days
    const window = returns.slice(i - 30, i);
    const stdDev = calculateStandardDeviation(window);
    const annualizedVolatility = stdDev * Math.sqrt(252); // Use 252 trading days for annualization
    return { ...day, volatility: annualizedVolatility * 100 };
  });
};

/**
 * Aggregates daily data into weekly summaries.
 */
export const aggregateToWeekly = (dailyData: DailyMetrics[]): DailyMetrics[] => {
    if (!dailyData || dailyData.length === 0) return [];
    const weeklyMap = new Map<string, DailyMetrics[]>();

    // Group data by week number and year
    dailyData.forEach(day => {
        const date = new Date(day.date);
        const year = date.getFullYear();
        const weekNumber = getWeek(date, { weekStartsOn: 1 }); // ISO week number
        const key = `${year}-W${weekNumber}`;

        if (!weeklyMap.has(key)) {
            weeklyMap.set(key, []);
        }
        weeklyMap.get(key)!.push(day);
    });

    const weeklyAggregates: DailyMetrics[] = [];
    weeklyMap.forEach(weekDays => {
        if (weekDays.length === 0) return;
        const firstDay = weekDays[0];
        const lastDay = weekDays[weekDays.length - 1];
        const validVols = weekDays.map(d => d.volatility).filter(v => v !== undefined) as number[];

        weeklyAggregates.push({
            date: firstDay.date, // Use the date of the first day of the week
            open: firstDay.open,
            high: Math.max(...weekDays.map(d => d.high)),
            low: Math.min(...weekDays.map(d => d.low)),
            close: lastDay.close,
            volume: weekDays.reduce((sum, d) => sum + (d.volume || 0), 0),
            changePercent: ((lastDay.close - firstDay.open) / firstDay.open) * 100,
            volatility: validVols.length > 0 ? validVols.reduce((s, v) => s + v, 0) / validVols.length : undefined,
        });
    });

    return weeklyAggregates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const aggregateToMonthly = (dailyData: DailyMetrics[]): DailyMetrics[] => {
  if (!dailyData || dailyData.length === 0) return [];
  
  const monthlyMap = new Map<string, DailyMetrics[]>();

  // Group data by month
  dailyData.forEach(day => {
    const date = new Date(day.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month.toString().padStart(2, '0')}`;

    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, []);
    }
    monthlyMap.get(key)!.push(day);
  });

  const monthlyAggregates: DailyMetrics[] = [];
  
  monthlyMap.forEach((monthDays, monthKey) => {
    if (monthDays.length === 0) return;
    
    const sortedDays = monthDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstDay = sortedDays[0];
    const lastDay = sortedDays[sortedDays.length - 1];
    const validVols = monthDays.map(d => d.volatility).filter(v => v !== undefined) as number[];

    monthlyAggregates.push({
      date: monthKey, // Use YYYY-MM format for monthly data
      open: firstDay.open,
      high: Math.max(...monthDays.map(d => d.high)),
      low: Math.min(...monthDays.map(d => d.low)),
      close: lastDay.close,
      volume: monthDays.reduce((sum, d) => sum + (d.volume || 0), 0),
      changePercent: ((lastDay.close - firstDay.open) / firstDay.open) * 100,
      volatility: validVols.length > 0 ? validVols.reduce((s, v) => s + v, 0) / validVols.length : undefined,
    });
  });

  return monthlyAggregates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};