import React, { useMemo } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMarketDataStore } from '../../store/marketDataStore';
import { useCalendarStore } from '../../store/calendarStore';

interface ComparisonChartProps {
  selectedDate?: string;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ selectedDate }) => {
  const theme = useTheme();
  const { historicalData, instrument } = useMarketDataStore();
  const { selectedDate: calendarSelectedDate } = useCalendarStore();

  const activeDate = selectedDate || calendarSelectedDate;

  const chartData = useMemo(() => {
    if (!activeDate || !historicalData.length) return [];

    // Get data for the last 30 days around the selected date
    const selectedDateObj = new Date(activeDate);
    const startDate = new Date(selectedDateObj);
    startDate.setDate(startDate.getDate() - 15);
    const endDate = new Date(selectedDateObj);
    endDate.setDate(endDate.getDate() + 15);

    return historicalData
      .filter(d => {
        const date = new Date(d.date);
        return date >= startDate && date <= endDate;
      })
      .map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: d.close,
        change: d.changePercent,
        volume: d.volume,
        volatility: d.volatility || 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [activeDate, historicalData]);

  if (!activeDate || chartData.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Select a date to view comparison chart.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {instrument} Performance Comparison
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Last 30 days around {new Date(activeDate).toLocaleDateString()}
      </Typography>
      
      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="date" 
              stroke={theme.palette.text.secondary}
              fontSize={12}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              fontSize={12}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px'
              }}
              formatter={(value: any, name: string) => [
                name === 'price' ? `$${value.toFixed(2)}` : 
                name === 'change' ? `${value.toFixed(2)}%` :
                name === 'volume' ? value.toLocaleString() :
                `${value.toFixed(2)}%`,
                name === 'price' ? 'Price' :
                name === 'change' ? 'Change %' :
                name === 'volume' ? 'Volume' : 'Volatility %'
              ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={theme.palette.primary.main} 
              strokeWidth={2}
              dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2, fill: theme.palette.background.paper }}
            />
            <Line 
              type="monotone" 
              dataKey="change" 
              stroke={theme.palette.secondary.main} 
              strokeWidth={2}
              dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: theme.palette.secondary.main, strokeWidth: 2, fill: theme.palette.background.paper }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ComparisonChart; 