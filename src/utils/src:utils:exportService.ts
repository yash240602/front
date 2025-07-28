import { DailyMetrics } from '../types/data';

export const exportToCsv = (data: DailyMetrics[], filename: string = 'market-data.csv') => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }
  const keys = Object.keys(data[0]);
  const header = keys.join(',');
  const rows = data.map(item => keys.map(key => `"${String(item[key as keyof DailyMetrics] ?? '').replace(/"/g, '""')}"`).join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};