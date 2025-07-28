import type { DailyMetrics } from '../types/data';
import { format } from 'date-fns';

export interface MonthlyMetrics {
  date: string; // YYYY-MM format
  month: string; // Month name
  year: number;
  open: number;
  high: number;
  low: number;
  close: number;
  totalVolume: number;
  averageChangePercent: number;
  maxChangePercent: number;
  minChangePercent: number;
  volatility: number;
  tradingDays: number;
}

export const aggregateToMonthly = (data: DailyMetrics[]): MonthlyMetrics[] => {
  const monthlyMap = new Map<string, DailyMetrics[]>();
  
  // Group data by month
  data.forEach(day => {
    const monthKey = format(new Date(day.date), 'yyyy-MM');
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, []);
    }
    monthlyMap.get(monthKey)!.push(day);
  });
  
  // Aggregate each month
  const monthlyData: MonthlyMetrics[] = [];
  
  monthlyMap.forEach((days, monthKey) => {
    if (days.length === 0) return;
    
    const sortedDays = days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstDay = sortedDays[0];
    const lastDay = sortedDays[sortedDays.length - 1];
    
    const high = Math.max(...days.map(d => d.high));
    const low = Math.min(...days.map(d => d.low));
    const totalVolume = days.reduce((sum, d) => sum + d.volume, 0);
    const averageChangePercent = days.reduce((sum, d) => sum + d.changePercent, 0) / days.length;
    const maxChangePercent = Math.max(...days.map(d => d.changePercent));
    const minChangePercent = Math.min(...days.map(d => d.changePercent));
    const volatility = days.reduce((sum, d) => sum + (d.volatility || 0), 0) / days.length;
    
    monthlyData.push({
      date: monthKey,
      month: format(new Date(firstDay.date), 'MMMM'),
      year: new Date(firstDay.date).getFullYear(),
      open: firstDay.open,
      high,
      low,
      close: lastDay.close,
      totalVolume,
      averageChangePercent,
      maxChangePercent,
      minChangePercent,
      volatility,
      tradingDays: days.length
    });
  });
  
  return monthlyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}; 