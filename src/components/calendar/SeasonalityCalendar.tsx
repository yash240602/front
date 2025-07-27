import { useState, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Skeleton, 
  Alert,
  Paper,
  Card,
  useTheme,
  alpha
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { useMarketDataStore } from '../../store/marketDataStore';
import type { DailyMetrics, CalendarCellData } from '../../types/data';
import CalendarCell from './CalendarCell';
import { useCalendarStore } from '../../store/calendarStore';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SeasonalityCalendar = () => {
  const theme = useTheme();
  const { historicalData, isLoading, error, instrument } = useMarketDataStore();
  const { selectedDate } = useCalendarStore();
  const [viewDate, setViewDate] = useState(() => new Date());
  
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  
  const goToPreviousMonth = useCallback(() => {
    setViewDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() - 1);
      return newDate;
    });
  }, []);
  
  const goToNextMonth = useCallback(() => {
    setViewDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + 1);
      return newDate;
    });
  }, []);
  
  const goToToday = useCallback(() => {
    setViewDate(new Date());
  }, []);
  
  const formattedMonthYear = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }).format(viewDate);
  }, [viewDate]);
  
  const metricsMap = useMemo(() => {
    const map = new Map<string, DailyMetrics>();
    historicalData.forEach(metrics => {
      const dateStr = typeof metrics.date === 'number' 
        ? new Date(metrics.date).toISOString().split('T')[0] 
        : metrics.date;
      map.set(dateStr, metrics);
    });
    return map;
  }, [historicalData]);
  
  const calendarDays = useMemo(() => {
    const days: CalendarCellData[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const firstDayOfGrid = new Date(firstDayOfMonth);
    firstDayOfGrid.setDate(firstDayOfGrid.getDate() - firstDayOfMonth.getDay());
    
    const totalDays = 42;
    let currentDate = new Date(firstDayOfGrid);
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(currentDate);
      const dateStr = date.toISOString().split('T')[0];
      const metrics = metricsMap.get(dateStr);
      
      const cellData: CalendarCellData = {
        date,
        day: date.getDate(),
        hasData: !!metrics,
        isCurrentMonth: date.getMonth() === currentMonth,
        isToday: date.getTime() === today.getTime(),
        isSelected: dateStr === selectedDate,
        metrics,
        changePercent: metrics?.changePercent,
        volume: metrics?.volume,
      };
      
      days.push(cellData);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [currentMonth, currentYear, metricsMap, selectedDate]);

  // Determine the maximum volume in the current grid so that cells can scale their rings
  const maxVolume = useMemo(() => {
    return calendarDays.reduce((max, d) => d.volume !== undefined && d.volume > max ? d.volume : max, 0);
  }, [calendarDays]);
  
  if (isLoading && historicalData.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Box>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 1, display: 'inline-block' }} />
            <Skeleton variant="circular" width={40} height={40} sx={{ display: 'inline-block' }} />
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 2 }}>
          {DAYS_OF_WEEK.map(day => (
            <Skeleton key={day} variant="text" width="100%" height={30} />
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {Array(42).fill(0).map((_, i) => (
            <Skeleton key={i} variant="circular" width="100%" height={60} />
          ))}
        </Box>
      </Paper>
    );
  }
  
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
      {/* Main Calendar */}
      <Box sx={{ flex: 1 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            borderRadius: 3, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
              {formattedMonthYear}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                onClick={goToToday} 
                aria-label="Go to today" 
                sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <TodayIcon />
              </IconButton>
              <IconButton onClick={goToPreviousMonth} aria-label="Previous month">
                <ChevronLeftIcon />
              </IconButton>
              <IconButton onClick={goToNextMonth} aria-label="Next month">
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>
          
          {/* Day headers */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '16px',
            mb: 2 
          }}>
            {DAYS_OF_WEEK.map(day => (
              <Typography 
                key={day}
                variant="subtitle2" 
                align="center" 
                sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.text.secondary,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem'
                }}
              >
                {day}
              </Typography>
            ))}
          </Box>
          
          {/* Calendar grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '16px',
            padding: '8px 0'
          }}>
            {calendarDays.map((day, index) => (
              <CalendarCell key={index} data={day} maxVolume={maxVolume} />
            ))}
          </Box>
          
          {isLoading && historicalData.length > 0 && (
            <Box sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
              <Alert severity="info" sx={{ py: 0.5 }}>Updating {instrument} data...</Alert>
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Performance Summary Sidebar */}
      <Box sx={{ width: '320px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <MonthPerformanceCard calendarDays={calendarDays} instrument={instrument} />
        <QuickStatsCard calendarDays={calendarDays} />
      </Box>
    </Box>
  );
};

// Performance Summary Component
const MonthPerformanceCard = ({ calendarDays, instrument }: { calendarDays: any[], instrument: string }) => {
  const theme = useTheme();
  
  const stats = useMemo(() => {
    const daysWithData = calendarDays.filter(d => d.hasData && d.changePercent !== undefined);
    if (daysWithData.length === 0) return null;
    
    const changes = daysWithData.map(d => d.changePercent);
    const volumes = daysWithData.map(d => d.volume || 0);
    
    return {
      bestDay: Math.max(...changes),
      worstDay: Math.min(...changes),
      avgChange: changes.reduce((a, b) => a + b, 0) / changes.length,
      totalVolume: volumes.reduce((a, b) => a + b, 0),
      volatility: Math.sqrt(changes.reduce((sum, change, _, arr) => {
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        return sum + Math.pow(change - avg, 2);
      }, 0) / changes.length),
      daysCount: daysWithData.length
    };
  }, [calendarDays]);

  if (!stats) return null;

  return (
    <Card sx={{ 
      p: 3, 
      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      color: 'white',
      borderRadius: 3
    }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {instrument} Performance
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
        <StatItem label="Best Day" value={`+${stats.bestDay.toFixed(2)}%`} />
        <StatItem label="Worst Day" value={`${stats.worstDay.toFixed(2)}%`} />
        <StatItem label="Avg Change" value={`${stats.avgChange > 0 ? '+' : ''}${stats.avgChange.toFixed(2)}%`} />
        <StatItem label="Volatility" value={`${stats.volatility.toFixed(2)}%`} />
      </Box>
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <StatItem label="Trading Days" value={stats.daysCount.toString()} />
      </Box>
    </Card>
  );
};

// Quick Stats Component
const QuickStatsCard = ({ calendarDays }: { calendarDays: any[] }) => {
  const theme = useTheme();
  
  const weekStats = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      const week = calendarDays.slice(i, i + 7).filter(d => d.hasData && d.isCurrentMonth);
      if (week.length > 0) {
        const avgChange = week.reduce((sum, d) => sum + (d.changePercent || 0), 0) / week.length;
        weeks.push(avgChange);
      }
    }
    return weeks;
  }, [calendarDays]);

  return (
    <Card sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Weekly Trends
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {weekStats.map((avg, index) => (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Week {index + 1}
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight={600}
              sx={{ 
                color: avg > 0 ? theme.palette.success.main : avg < 0 ? theme.palette.error.main : theme.palette.text.primary 
              }}
            >
              {avg > 0 ? '+' : ''}{avg.toFixed(2)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
};

// Stat Item Component
const StatItem = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </Typography>
    <Typography variant="h6" fontWeight={700}>
      {value}
    </Typography>
  </Box>
);

export default SeasonalityCalendar; 