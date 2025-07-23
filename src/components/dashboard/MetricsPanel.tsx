import React, { useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Chip,
  Skeleton,
  Alert,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as VolumeIcon,
  ShowChart as PriceIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useCalendarStore } from '../../store/calendarStore';
import { useMarketDataStore } from '../../store/marketDataStore';
import { DailyMetrics } from '../../types/data';

// A small, reusable component for individual metric display
const MetricItem: React.FC<{ title: string; value: string; color?: string }> = ({ title, value, color }) => (
  <Grid item xs={6} sm={3} md={6}>
    <Typography variant="body2" color="text.secondary" noWrap>{title}</Typography>
    <Typography variant="h6" fontWeight={500} color={color || 'text.primary'}>
      {value}
    </Typography>
  </Grid>
);

// Custom Tooltip for Recharts for better styling
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.paper, 0.95), backdropFilter: 'blur(5px)', borderRadius: 2 }}>
        <Typography variant="subtitle2" gutterBottom>{label}</Typography>
        {payload.map((pld: any, index: number) => (
          <Typography key={index} variant="body2" sx={{ color: pld.color }}>
            {`${pld.name}: ${pld.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};


const MetricsPanel: React.FC = () => {
  const theme = useTheme();
  const { selectedDate, setSelectedDate } = useCalendarStore();
  const { historicalData, instrument } = useMarketDataStore();

  const selectedMetrics: DailyMetrics | undefined = useMemo(() => {
    if (!selectedDate) return undefined;
    // Find the data for the selected date. The date format from the store is already a string 'YYYY-MM-DD'.
    return historicalData.find(data => {
      const dataDate = typeof data.date === 'string' 
        ? data.date 
        : new Date(data.date).toISOString().split('T')[0];
      return dataDate === selectedDate;
    });
  }, [selectedDate, historicalData]);

  const weeklyData = useMemo(() => {
    if (!selectedDate || !historicalData.length) return [];
    
    const selectedDateObj = new Date(selectedDate);
    
    // Create a map for quick lookups
    const dataMap = new Map<number, DailyMetrics>();
    historicalData.forEach(d => {
        const date = new Date(typeof d.date === 'string' ? d.date : d.date);
        date.setUTCHours(0,0,0,0); // Normalize to UTC midnight
        dataMap.set(date.getTime(), d);
    });

    const result = [];
    // Iterate backwards for 7 days including the selected day
    for (let i = 0; i < 7; i++) {
        const date = new Date(selectedDateObj);
        date.setUTCDate(date.getUTCDate() - i);
        date.setUTCHours(0,0,0,0);
        
        const metrics = dataMap.get(date.getTime());
        if (metrics) {
            result.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
                price: metrics.close,
                volume: metrics.volume,
                change: metrics.changePercent,
            });
        }
    }

    return result.reverse(); // reverse to have the dates in chronological order
  }, [selectedDate, historicalData]);

  const handleClose = () => {
    setSelectedDate(null);
  };

  // Formatters with better defaults
  const formatCurrency = (value: number | undefined) => value?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 4 }) || 'N/A';
  const formatPercent = (value: number | undefined) => value !== undefined ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%` : 'N/A';
  const formatVolume = (value: number | undefined) => {
      if (value === undefined) return 'N/A';
      if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
      if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
      return value.toFixed(2);
  };
  const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '';

  const isPositive = selectedMetrics && selectedMetrics.changePercent > 0;
  const isNegative = selectedMetrics && selectedMetrics.changePercent < 0;

  const renderContent = () => {
    if (!selectedMetrics) {
      return (
        <Box sx={{ p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <CalendarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, mx: 'auto' }} />
            <Typography variant="h6">No Date Selected</Typography>
            <Typography color="text.secondary">Click on a day in the calendar to view its detailed metrics.</Typography>
        </Box>
      );
    }
    
    return (
        <>
        {/* Header Section */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight={600}>{instrument} Daily Report</Typography>
                <IconButton onClick={handleClose} aria-label="Close metrics panel"><CloseIcon /></IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary">{formatDate(selectedDate)}</Typography>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            <Card sx={{ mb: 2, bgcolor: 'background.paper' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        {isPositive && <TrendingUpIcon fontSize="large" sx={{ color: theme.customProps.chart.positive }} />}
                        {isNegative && <TrendingDownIcon fontSize="large" sx={{ color: theme.customProps.chart.negative }} />}
                        <Typography variant="h4" fontWeight={700} sx={{ color: isPositive ? theme.customProps.chart.positive : isNegative ? theme.customProps.chart.negative : 'text.primary' }}>
                            {formatPercent(selectedMetrics.changePercent)}
                        </Typography>
                        <Chip label={isPositive ? 'Gain' : isNegative ? 'Loss' : 'Neutral'} color={isPositive ? 'success' : isNegative ? 'error' : 'default'} variant="outlined" size="small" />
                    </Box>
                    <Grid container spacing={2}>
                        <MetricItem title="Open" value={formatCurrency(selectedMetrics.open)} />
                        <MetricItem title="Close" value={formatCurrency(selectedMetrics.close)} />
                        <MetricItem title="High" value={formatCurrency(selectedMetrics.high)} color={theme.customProps.chart.positive} />
                        <MetricItem title="Low" value={formatCurrency(selectedMetrics.low)} color={theme.customProps.chart.negative} />
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 2, bgcolor: 'background.paper' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <VolumeIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        <Typography variant="h6" fontWeight={600}>Volume</Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>{formatVolume(selectedMetrics.volume)}</Typography>
                </CardContent>
            </Card>

            {weeklyData.length > 1 && (
                <>
                <Card sx={{ mb: 2, bgcolor: 'background.paper' }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>7-Day Price Trend</Typography>
                        <Box sx={{ height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weeklyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                                    <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} domain={['dataMin', 'dataMax']} tickFormatter={(value) => value.toLocaleString()} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="price" name="Price" stroke={theme.palette.primary.main} strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
                <Card sx={{ bgcolor: 'background.paper' }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>7-Day Volume</Typography>
                        <Box sx={{ height: 150 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                                    <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} tickFormatter={formatVolume} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="volume" name="Volume">
                                        {weeklyData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.change >= 0 ? alpha(theme.customProps.chart.positive, 0.6) : alpha(theme.customProps.chart.negative, 0.6)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
                </>
            )}
        </Box>
        </>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={!!selectedDate}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '95%', sm: 400, md: 450 },
          borderLeft: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.default',
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {renderContent()}
      </Box>
    </Drawer>
  );
};

export default MetricsPanel;
