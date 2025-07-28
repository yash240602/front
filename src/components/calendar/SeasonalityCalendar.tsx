import React, { useMemo, useEffect } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  addDays, 
  addMonths,
  subMonths,
  format, 
  isSameMonth, 
  isToday 
} from 'date-fns';
import { useMarketDataStore } from '../../store/marketDataStore';
import { useCalendarStore } from '../../store/calendarStore';
import CalendarCell from './CalendarCell';
import MonthlyCalendarCell from './MonthlyCalendarCell';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { useCalendarHotkeys } from '../../hooks/useCalendarHotkeys';
import type { CalendarCellData } from '../../types/data';
import type { MonthlyMetrics } from '../../utils/monthlyAggregationService';

const SeasonalityCalendar: React.FC = () => {
  useCalendarHotkeys(); // Enable keyboard navigation
  
  const { historicalData, weeklyData, monthlyData, generateMockData, isLoading, error } = useMarketDataStore();
  const { currentMonth, viewMode, setViewMode, setCurrentMonth, selectedDate } = useCalendarStore();

  // Generate mock data on component mount for demo purposes
  useEffect(() => {
    generateMockData();
  }, [generateMockData]);

  const { calendarDays, maxVolatilityInMonth, maxVolumeInMonth } = useMemo(() => {
    if (viewMode === 'month') {
      return { calendarDays: [], maxVolatilityInMonth: 0, maxVolumeInMonth: 0 };
    }
    
    const activeData = viewMode === 'week' ? weeklyData : historicalData;
    const metricsMap = new Map(activeData.map(d => [format(new Date(d.date), 'yyyy-MM-dd'), d]));
    const days: CalendarCellData[] = [];
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    let maxVolatility = 0;
    let maxVolume = 0;

    for (let day = startDate; day <= endDate; day = addDays(day, 1)) {
      const dateKey = format(day, 'yyyy-MM-dd');
      const metrics = metricsMap.get(dateKey);
      
      if (metrics?.volatility && metrics.volatility > maxVolatility) {
        maxVolatility = metrics.volatility;
      }
      
      if (metrics?.volume && metrics.volume > maxVolume) {
        maxVolume = metrics.volume;
      }
      
      days.push({
        date: day,
        day: format(day, 'd'),
        isCurrentMonth: isSameMonth(day, currentMonth),
        isToday: isToday(day),
        hasData: !!metrics,
        metrics: metrics,
        changePercent: metrics?.changePercent,
        isSelected: selectedDate === format(day, 'yyyy-MM-dd')
      });
    }
    
    return { calendarDays: days, maxVolatilityInMonth: maxVolatility, maxVolumeInMonth: maxVolume };
  }, [historicalData, weeklyData, currentMonth, viewMode]);

  const monthlyCells = useMemo(() => {
    if (viewMode !== 'month') return [];
    
    const currentYear = currentMonth.getFullYear();
    const yearData = monthlyData.filter(m => m.year === currentYear);
    
    return yearData.map(month => ({
      ...month,
      isSelected: selectedDate === month.date
    }));
  }, [monthlyData, currentMonth, viewMode, selectedDate]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleMonthSelect = (monthKey: string) => {
    // For monthly view, we'll set the selected month
    // In a real implementation, this might navigate to that month's daily view
    console.log('Selected month:', monthKey);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3, borderRadius: 4, backgroundColor: alpha(theme.palette.background.paper, 0.7), backdropFilter: 'blur(20px)', border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)' }}>
        <LoadingSkeleton variant="calendar" />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          Error loading data: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with month navigation and view toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={handlePrevMonth} 
            size="small"
            aria-label="Previous month"
          >
            <ChevronLeft />
          </IconButton>
          <Typography 
            variant="h5" 
            sx={{ minWidth: 200, textAlign: 'center' }}
            role="heading"
            aria-level="2"
          >
            {viewMode === 'month' ? currentMonth.getFullYear() : format(currentMonth, 'MMMM yyyy')}
          </Typography>
          <IconButton 
            onClick={handleNextMonth} 
            size="small"
            aria-label="Next month"
          >
            <ChevronRight />
          </IconButton>
        </Box>
        
        <ToggleButtonGroup 
          value={viewMode} 
          exclusive 
          onChange={(_, value) => value && setViewMode(value)} 
          size="small"
          aria-label="Calendar view mode selection"
        >
          <ToggleButton value="day" aria-label="Daily view">Daily</ToggleButton>
          <ToggleButton value="week" aria-label="Weekly view">Weekly</ToggleButton>
          <ToggleButton value="month" aria-label="Monthly view">Monthly</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'month' ? (
        /* Monthly Grid */
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, 
          gap: { xs: 1, sm: 1.5, md: 2 } 
        }}>
          {monthlyCells.map((month) => (
            <MonthlyCalendarCell 
              key={month.date} 
              data={month} 
              isSelected={month.isSelected}
              onSelect={handleMonthSelect}
            />
          ))}
        </Box>
      ) : (
        /* Daily/Weekly Grid */
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: { xs: 0.5, sm: 1 },
          minHeight: { xs: '300px', sm: '400px' }
        }}>
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
            <Typography 
              key={dayName} 
              sx={{ 
                textAlign: 'center', 
                fontWeight: 'bold', 
                py: 1,
                fontSize: '0.875rem',
                color: 'text.secondary'
              }}
            >
              {dayName}
            </Typography>
          ))}
          
          {/* Calendar cells */}
          {calendarDays.map((day) => (
            <CalendarCell 
              key={day.date.toISOString()} 
              data={day} 
              maxVolatilityInMonth={maxVolatilityInMonth} 
              maxVolumeInMonth={maxVolumeInMonth}
            />
          ))}
        </Box>
      )}

      {/* Legend */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" color="text.secondary">
          💡 Use arrow keys to navigate • Shift+Click for range selection
        </Typography>
      </Box>
    </Box>
  );
};

export default SeasonalityCalendar;