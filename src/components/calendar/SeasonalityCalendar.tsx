import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Skeleton, 
  Alert,
  Paper,
  Card,
  useTheme,
  alpha,
  Slide,
  Chip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  TrendingUp as TrendingUpIcon,
  ShowChart as ShowChartIcon,
  CalendarToday as CalendarTodayIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { useMarketDataStore } from '../../store/marketDataStore';
import type { DailyMetrics, CalendarCellData } from '../../types/data';
import CalendarCell from './CalendarCell';
import CalendarLegend from './CalendarLegend';
import WeeklyCalendarCell from './WeeklyCalendarCell';
import { useCalendarStore } from '../../store/calendarStore';
import { useCalendarHotkeys } from '../../hooks/useCalendarHotkeys';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SeasonalityCalendar = () => {
  const theme = useTheme();
  const { historicalData, isLoading, error, instrument } = useMarketDataStore();
  const { selectedDate, setSelectedDate, visualizationMode, setVisualizationMode, viewMode, setViewMode } = useCalendarStore();
  const [viewDate, setViewDate] = useState(() => new Date());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  
  const goToPreviousMonth = useCallback(() => {
    setSlideDirection('right');
    setViewDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() - 1);
      return newDate;
    });
  }, []);
  
  const goToNextMonth = useCallback(() => {
    setSlideDirection('left');
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

  // Calculate maximum volume for the current month view
  const maxVolumeInMonth = useMemo(() => {
    return calendarDays.reduce((max, d) => d.volume !== undefined && d.volume > max ? d.volume : max, 0);
  }, [calendarDays]);

  // Calculate maximum volatility for the current month view
  const maxVolatilityInMonth = useMemo(() => {
    return calendarDays.reduce((max, d) => {
      const volatility = d.metrics?.volatility;
      return volatility !== undefined && volatility > max ? volatility : max;
    }, 0);
  }, [calendarDays]);

  // Calculate weekly aggregated data
  const weeklyData = useMemo(() => {
    if (viewMode !== 'week') return [];
    
    const weeks: any[] = [];
    const daysWithData = calendarDays.filter(d => d.hasData && d.isCurrentMonth);
    
    // Group days by week
    const weekGroups = new Map<string, any[]>();
    daysWithData.forEach(day => {
      const weekStart = new Date(day.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weekGroups.has(weekKey)) {
        weekGroups.set(weekKey, []);
      }
      weekGroups.get(weekKey)!.push(day);
    });
    
    // Calculate weekly aggregates
    weekGroups.forEach((days, weekKey) => {
      if (days.length === 0) return;
      
      const weekStart = new Date(weekKey);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const totalVolume = days.reduce((sum, d) => sum + (d.volume || 0), 0);
      const avgChangePercent = days.reduce((sum, d) => sum + (d.changePercent || 0), 0) / days.length;
      const prices = days.map(d => d.metrics?.close || 0).filter(p => p > 0);
      const volatilities = days.map(d => d.metrics?.volatility || 0).filter(v => v > 0);
      
      weeks.push({
        weekStart,
        weekEnd,
        totalVolume,
        avgChangePercent,
        highPrice: Math.max(...prices),
        lowPrice: Math.min(...prices),
        daysWithData: days.length,
        avgVolatility: volatilities.length > 0 ? volatilities.reduce((sum, v) => sum + v, 0) / volatilities.length : 0
      });
    });
    
    return weeks.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  }, [calendarDays, viewMode]);

  // Calculate max weekly values
  const { maxWeeklyVolume, maxWeeklyVolatility } = useMemo(() => {
    if (weeklyData.length === 0) return { maxWeeklyVolume: 0, maxWeeklyVolatility: 0 };
    
    const maxVol = Math.max(...weeklyData.map(w => w.totalVolume));
    const maxVolat = Math.max(...weeklyData.map(w => w.avgVolatility));
    
    return { maxWeeklyVolume: maxVol, maxWeeklyVolatility: maxVolat };
  }, [weeklyData]);

  // Calculate min/max change percentages for legend
  const { minChange, maxChange } = useMemo(() => {
    const daysWithData = calendarDays.filter(d => d.hasData && d.changePercent !== undefined);
    if (daysWithData.length === 0) return { minChange: -5, maxChange: 5 };
    
    const changes = daysWithData.map(d => d.changePercent!);
    return {
      minChange: Math.min(...changes),
      maxChange: Math.max(...changes)
    };
  }, [calendarDays]);
  
  const viewDateKey = useMemo(() => `${currentYear}-${currentMonth}`, [currentYear, currentMonth]);

  // Keyboard navigation
  useCalendarHotkeys({
    calendarDays,
    viewDate,
    setViewDate
  });

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
            <Box>
              <Typography variant="h4" component="h2" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                {formattedMonthYear}
              </Typography>
              
              {/* View Mode Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                size="small"
                sx={{ mb: 1 }}
              >
                <ToggleButton value="day" aria-label="Daily view">
                  <CalendarTodayIcon sx={{ mr: 1 }} />
                  Daily
                </ToggleButton>
                <ToggleButton value="week" aria-label="Weekly view">
                  <DateRangeIcon sx={{ mr: 1 }} />
                  Weekly
                </ToggleButton>
              </ToggleButtonGroup>
              
              {/* Visualization Mode Toggle */}
              <ToggleButtonGroup
                value={visualizationMode}
                exclusive
                onChange={(_, newMode) => newMode && setVisualizationMode(newMode)}
                size="small"
                sx={{ mt: 1 }}
              >
                <ToggleButton value="performance" aria-label="Performance view">
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  Performance
                </ToggleButton>
                <ToggleButton value="volatility" aria-label="Volatility view">
                  <ShowChartIcon sx={{ mr: 1 }} />
                  Volatility
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
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

          {/* Heat-Map Legend */}
          <CalendarLegend minChange={minChange} maxChange={maxChange} />
          
          {/* Conditional View Rendering */}
          {viewMode === 'week' ? (
            /* Weekly View */
            <Slide direction={slideDirection} in={true} key={`${viewDateKey}-week`}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '16px',
                padding: '8px 0'
              }}>
                {weeklyData.map((week, index) => (
                  <WeeklyCalendarCell 
                    key={index} 
                    data={week} 
                    maxWeeklyVolume={maxWeeklyVolume} 
                    maxWeeklyVolatility={maxWeeklyVolatility} 
                  />
                ))}
              </Box>
            </Slide>
          ) : (
            /* Daily View */
            <>
              {/* Day headers */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '12px',
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
              
              {/* Calendar grid with slide transition */}
              <Slide direction={slideDirection} in={true} key={viewDateKey}>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: '12px',
                  padding: '8px 0'
                }}>
                  {calendarDays.map((day, index) => (
                    <CalendarCell key={index} data={day} maxVolumeInMonth={maxVolumeInMonth} maxVolatilityInMonth={maxVolatilityInMonth} />
                  ))}
                </Box>
              </Slide>
            </>
          )}
          
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