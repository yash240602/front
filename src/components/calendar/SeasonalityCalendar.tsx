import { useState, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Grid, 
  Skeleton, 
  Alert,
  Paper,
  useTheme
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
    const currentDate = new Date(firstDayOfGrid);
    
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
        <Grid container spacing={0.5}>
          {DAYS_OF_WEEK.map(day => (
            <Grid size={12/7} key={day}>
              <Skeleton variant="text" width="100%" height={30} />
            </Grid>
          ))}
          {Array(42).fill(0).map((_, i) => (
            <Grid size={12/7} key={i}>
              <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }
  
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.background.paper, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" fontWeight={600}>
          {formattedMonthYear}
        </Typography>
        <Box>
          <IconButton onClick={goToToday} aria-label="Go to today" sx={{ mr: 1 }}><TodayIcon /></IconButton>
          <IconButton onClick={goToPreviousMonth} aria-label="Previous month"><ChevronLeftIcon /></IconButton>
          <IconButton onClick={goToNextMonth} aria-label="Next month" sx={{ ml: 0.5 }}><ChevronRightIcon /></IconButton>
        </Box>
      </Box>
      
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {DAYS_OF_WEEK.map(day => (
          <Grid size={12/7} key={day}>
            <Typography variant="subtitle2" align="center" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>
      
      <Grid container spacing={1}>
        {calendarDays.map((day, index) => (
          <Grid size={12/7} key={index}>
            <CalendarCell data={day} />
          </Grid>
        ))}
      </Grid>
      
      {isLoading && historicalData.length > 0 && (
        <Box sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
          <Alert severity="info" sx={{ py: 0.5 }}>Updating {instrument} data...</Alert>
        </Box>
      )}
    </Paper>
  );
};

export default SeasonalityCalendar; 