import React, { useMemo, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  ToggleButtonGroup, 
  ToggleButton,
  Chip,
  Grid,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  Compare as CompareIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMarketDataStore } from '../../store/marketDataStore';
import { useCalendarStore } from '../../store/calendarStore';

interface ComparisonChartProps {
  selectedDate?: string;
}

interface PeriodData {
  label: string;
  data: any[];
  startDate: Date;
  endDate: Date;
  avgPrice: number;
  avgChange: number;
  avgVolatility: number;
  avgVolume: number;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ selectedDate }) => {
  const theme = useTheme();
  const { historicalData, instrument } = useMarketDataStore();
  const { selectedDate: calendarSelectedDate } = useCalendarStore();
  const [comparisonMode, setComparisonMode] = useState<'single' | 'compare'>('single');
  const [period1, setPeriod1] = useState<string>('current');
  const [period2, setPeriod2] = useState<string>('previous');

  const activeDate = selectedDate || calendarSelectedDate;

  const periodOptions = [
    { value: 'current', label: 'Current Period' },
    { value: 'previous', label: 'Previous Period' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'lastQuarter', label: 'Last Quarter' }
  ];

  const getPeriodData = (periodType: string, baseDate: Date): PeriodData => {
    const startDate = new Date(baseDate);
    const endDate = new Date(baseDate);
    
    switch (periodType) {
      case 'current':
        startDate.setDate(startDate.getDate() - 15);
        endDate.setDate(endDate.getDate() + 15);
        break;
      case 'previous':
        startDate.setDate(startDate.getDate() - 45);
        endDate.setDate(endDate.getDate() - 15);
        break;
      case 'lastWeek':
        startDate.setDate(startDate.getDate() - 7);
        endDate.setDate(endDate.getDate() - 1);
        break;
      case 'lastMonth':
        startDate.setMonth(startDate.getMonth() - 1);
        endDate.setDate(endDate.getDate() - 1);
        break;
      case 'lastQuarter':
        startDate.setMonth(startDate.getMonth() - 3);
        endDate.setDate(endDate.getDate() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 15);
        endDate.setDate(endDate.getDate() + 15);
    }

    const periodData = historicalData
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

    const avgPrice = periodData.reduce((sum, d) => sum + d.price, 0) / periodData.length || 0;
    const avgChange = periodData.reduce((sum, d) => sum + d.change, 0) / periodData.length || 0;
    const avgVolatility = periodData.reduce((sum, d) => sum + d.volatility, 0) / periodData.length || 0;
    const avgVolume = periodData.reduce((sum, d) => sum + d.volume, 0) / periodData.length || 0;

    return {
      label: periodOptions.find(p => p.value === periodType)?.label || periodType,
      data: periodData,
      startDate,
      endDate,
      avgPrice,
      avgChange,
      avgVolatility,
      avgVolume
    };
  };

  const period1Data = useMemo(() => {
    if (!activeDate) return null;
    return getPeriodData(period1, new Date(activeDate));
  }, [activeDate, period1, historicalData]);

  const period2Data = useMemo(() => {
    if (!activeDate || comparisonMode === 'single') return null;
    return getPeriodData(period2, new Date(activeDate));
  }, [activeDate, period2, historicalData, comparisonMode]);

  const calculateDifference = (current: number, previous: number): { value: number; percentage: number; isPositive: boolean } => {
    const diff = current - previous;
    const percentage = previous !== 0 ? (diff / previous) * 100 : 0;
    return {
      value: diff,
      percentage: Math.abs(percentage),
      isPositive: diff >= 0
    };
  };

  const getComparisonMetrics = () => {
    if (!period1Data || !period2Data) return null;

    return {
      price: calculateDifference(period1Data.avgPrice, period2Data.avgPrice),
      change: calculateDifference(period1Data.avgChange, period2Data.avgChange),
      volatility: calculateDifference(period1Data.avgVolatility, period2Data.avgVolatility),
      volume: calculateDifference(period1Data.avgVolume, period2Data.avgVolume)
    };
  };

  const comparisonMetrics = getComparisonMetrics();

  if (!activeDate || !period1Data) {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {instrument} Performance Comparison
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ToggleButtonGroup
            value={comparisonMode}
            exclusive
            onChange={(_, value) => value && setComparisonMode(value)}
            size="small"
          >
            <ToggleButton value="single">Single Period</ToggleButton>
            <ToggleButton value="compare">Compare Periods</ToggleButton>
          </ToggleButtonGroup>
          {comparisonMode === 'compare' && (
            <IconButton
              size="small"
              onClick={() => setComparisonMode('single')}
              aria-label="Close comparison"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {comparisonMode === 'compare' && (
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>
                Period 1
              </Typography>
              <ToggleButtonGroup
                value={period1}
                exclusive
                onChange={(_, value) => value && setPeriod1(value)}
                size="small"
                fullWidth
              >
                {periodOptions.map(option => (
                  <ToggleButton key={option.value} value={option.value} size="small">
                    {option.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" gutterBottom>
                Period 2
              </Typography>
              <ToggleButtonGroup
                value={period2}
                exclusive
                onChange={(_, value) => value && setPeriod2(value)}
                size="small"
                fullWidth
              >
                {periodOptions.map(option => (
                  <ToggleButton key={option.value} value={option.value} size="small">
                    {option.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Box>
      )}

      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={period1Data.data}>
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
            <RechartsTooltip 
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
            {comparisonMode === 'compare' && period2Data && (
              <Line 
                type="monotone" 
                dataKey="price2" 
                stroke={theme.palette.error.main} 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: theme.palette.error.main, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: theme.palette.error.main, strokeWidth: 2, fill: theme.palette.background.paper }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {comparisonMode === 'compare' && comparisonMetrics && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Period Comparison Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Price Difference</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  {comparisonMetrics.price.isPositive ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
                  <Typography variant="body2" color={comparisonMetrics.price.isPositive ? 'success.main' : 'error.main'}>
                    {comparisonMetrics.price.isPositive ? '+' : '-'}${comparisonMetrics.price.value.toFixed(2)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  ({comparisonMetrics.price.percentage.toFixed(1)}%)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Change Difference</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  {comparisonMetrics.change.isPositive ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
                  <Typography variant="body2" color={comparisonMetrics.change.isPositive ? 'success.main' : 'error.main'}>
                    {comparisonMetrics.change.isPositive ? '+' : '-'}{comparisonMetrics.change.value.toFixed(2)}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  ({comparisonMetrics.change.percentage.toFixed(1)}%)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Volatility Difference</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  {comparisonMetrics.volatility.isPositive ? <TrendingUpIcon color="error" /> : <TrendingDownIcon color="success" />}
                  <Typography variant="body2" color={comparisonMetrics.volatility.isPositive ? 'error.main' : 'success.main'}>
                    {comparisonMetrics.volatility.isPositive ? '+' : '-'}{comparisonMetrics.volatility.value.toFixed(2)}%
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  ({comparisonMetrics.volatility.percentage.toFixed(1)}%)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Volume Difference</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  {comparisonMetrics.volume.isPositive ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
                  <Typography variant="body2" color={comparisonMetrics.volume.isPositive ? 'success.main' : 'error.main'}>
                    {comparisonMetrics.volume.isPositive ? '+' : '-'}{comparisonMetrics.volume.value.toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  ({comparisonMetrics.volume.percentage.toFixed(1)}%)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default ComparisonChart; 