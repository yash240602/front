import React, { useMemo } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Grid, 
  Tabs, 
  Tab, 
  Chip,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SignalCellularAlt as SignalIcon
} from '@mui/icons-material';
import { useCalendarStore } from '../../store/calendarStore';
import { useMarketDataStore } from '../../store/marketDataStore';
import { exportToCsv } from '../../utils/exportService';
import { calculateAllIndicators, getTechnicalSignals } from '../../utils/technicalIndicators';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const MetricsPanel = () => {
  const theme = useTheme();
  const { selectedDate, clearDateRange } = useCalendarStore();
  const { historicalData, instrument } = useMarketDataStore();
  const [activeTab, setActiveTab] = React.useState(0);

  const selectedDayData = useMemo(() => {
    if (!selectedDate || !historicalData) return null;
    return historicalData.find(d => new Date(d.date).toISOString().split('T')[0] === selectedDate);
  }, [selectedDate, historicalData]);

  const technicalIndicators = useMemo(() => {
    if (!historicalData.length) return null;
    return calculateAllIndicators(historicalData);
  }, [historicalData]);

  const selectedDayIndex = useMemo(() => {
    if (!selectedDayData || !historicalData.length) return -1;
    return historicalData.findIndex(d => d.date === selectedDayData.date);
  }, [selectedDayData, historicalData]);

  const technicalSignals = useMemo(() => {
    if (!technicalIndicators || selectedDayIndex === -1) return null;
    return getTechnicalSignals(technicalIndicators, selectedDayIndex);
  }, [technicalIndicators, selectedDayIndex]);

  const handleExport = () => {
    if (selectedDayData) {
      exportToCsv([selectedDayData], `${instrument}-${selectedDate}.csv`);
    } else {
      alert("Please select a date with data to export.");
    }
  };

  if (!selectedDayData) {
    return (
      <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Select a date to view detailed metrics.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Metrics for {selectedDate}
        </Typography>
        {technicalSignals && (
          <Chip
            icon={technicalSignals.overallSignal === 'bullish' ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={technicalSignals.overallSignal.toUpperCase()}
            color={technicalSignals.overallSignal === 'bullish' ? 'success' : 'error'}
            size="small"
          />
        )}
      </Box>

      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 2 }}>
        <Tab label="Basic Metrics" />
        <Tab label="Technical Analysis" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Open</Typography>
              <Typography variant="body1">${selectedDayData.open.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Close</Typography>
              <Typography variant="body1">${selectedDayData.close.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">High</Typography>
              <Typography variant="body1">${selectedDayData.high.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Low</Typography>
              <Typography variant="body1">${selectedDayData.low.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Volume</Typography>
              <Typography variant="body1">{selectedDayData.volume.toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Change %</Typography>
              <Typography 
                variant="body1" 
                color={selectedDayData.changePercent > 0 ? 'success.main' : 'error.main'}
              >
                {selectedDayData.changePercent > 0 ? '+' : ''}{selectedDayData.changePercent.toFixed(2)}%
              </Typography>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ mt: 2, width: '100%' }}
          >
            Export Day
          </Button>
        </Box>
      )}

      {activeTab === 1 && technicalIndicators && (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Technical Indicators
              </Typography>
            </Grid>
            
            {/* RSI */}
            <Grid item xs={6}>
              <Tooltip title="Relative Strength Index - Measures momentum on a scale of 0 to 100">
                <Typography variant="body2" color="text.secondary">RSI</Typography>
              </Tooltip>
              <Typography variant="body1">
                {technicalIndicators.rsi[selectedDayIndex]?.toFixed(2) || 'N/A'}
              </Typography>
              {technicalSignals && (
                <Chip
                  label={technicalSignals.rsiSignal}
                  size="small"
                  color={technicalSignals.rsiSignal === 'oversold' ? 'success' : 
                         technicalSignals.rsiSignal === 'overbought' ? 'error' : 'default'}
                  sx={{ mt: 0.5 }}
                />
              )}
            </Grid>

            {/* MACD */}
            <Grid item xs={6}>
              <Tooltip title="Moving Average Convergence Divergence - Trend following momentum indicator">
                <Typography variant="body2" color="text.secondary">MACD</Typography>
              </Tooltip>
              <Typography variant="body1">
                {technicalIndicators.macd.macd[selectedDayIndex]?.toFixed(4) || 'N/A'}
              </Typography>
              {technicalSignals && (
                <Chip
                  label={technicalSignals.macdSignal}
                  size="small"
                  color={technicalSignals.macdSignal === 'bullish' ? 'success' : 
                         technicalSignals.macdSignal === 'bearish' ? 'error' : 'default'}
                  sx={{ mt: 0.5 }}
                />
              )}
            </Grid>

            {/* Moving Averages */}
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">SMA 7</Typography>
              <Typography variant="body1">
                ${technicalIndicators.sma7[selectedDayIndex]?.toFixed(2) || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">SMA 14</Typography>
              <Typography variant="body1">
                ${technicalIndicators.sma14[selectedDayIndex]?.toFixed(2) || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">SMA 30</Typography>
              <Typography variant="body1">
                ${technicalIndicators.sma30[selectedDayIndex]?.toFixed(2) || 'N/A'}
              </Typography>
            </Grid>
          </Grid>

          {/* Mini RSI Chart */}
          <Box sx={{ mt: 2, height: 100 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              RSI Trend (Last 30 days)
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData.slice(-30).map((d, i) => ({
                date: d.date,
                rsi: technicalIndicators.rsi[historicalData.length - 30 + i] || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="date" hide />
                <YAxis domain={[0, 100]} hide />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="rsi" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default MetricsPanel;
