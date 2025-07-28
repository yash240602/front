import type { DailyMetrics } from '../types/data';

/**
 * Converts an array of DailyMetrics to CSV format
 * @param data Array of DailyMetrics to export
 * @param filename Name of the file to download
 */
export const exportToCsv = (data: DailyMetrics[], filename: string): void => {
  if (!data || data.length === 0) {
    console.warn('No data provided for CSV export');
    return;
  }

  // Define CSV headers based on the first data item
  const headers = [
    'Date',
    'Open',
    'High', 
    'Low',
    'Close',
    'Volume',
    'Change %',
    'Volatility'
  ];

  // Convert data to CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => [
      row.date,
      row.open.toFixed(2),
      row.high.toFixed(2),
      row.low.toFixed(2),
      row.close.toFixed(2),
      row.volume.toFixed(2),
      row.changePercent.toFixed(2),
      row.volatility ? row.volatility.toFixed(4) : ''
    ].join(','))
  ];

  // Create CSV content
  const csvContent = csvRows.join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  }
};