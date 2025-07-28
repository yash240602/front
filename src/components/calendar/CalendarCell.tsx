import React, { useMemo } from 'react';
import { Box, Typography, Tooltip, useTheme, alpha } from '@mui/material';
import { ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useCalendarStore } from '../../store/calendarStore';
import type { CalendarCellData } from '../../types/data';

interface CalendarCellProps {
  data: CalendarCellData;
  maxVolatilityInMonth: number;
  maxVolumeInMonth: number;
}

const CalendarCell: React.FC<CalendarCellProps> = ({ data, maxVolatilityInMonth, maxVolumeInMonth }) => {
  const theme = useTheme();
  const { selectedDate, rangeStart, rangeEnd, setSelectedDate, setDateRange } = useCalendarStore();

  const handleClick = (e: React.MouseEvent) => {
    if (!data.hasData) return;
    const dateString = format(data.date, 'yyyy-MM-dd');
    
    if (e.shiftKey) {
      setDateRange(dateString);
    } else {
      setSelectedDate(dateString);
    }
  };

  const isInRange = useMemo(() => {
    if (!rangeStart || !rangeEnd || !data.date) return false;
    const cellTime = data.date.getTime();
    const startTime = new Date(rangeStart).getTime();
    const endTime = new Date(rangeEnd).getTime();
    return cellTime >= startTime && cellTime <= endTime;
  }, [data.date, rangeStart, rangeEnd]);

  const volatilityOpacity = useMemo(() => {
    if (!data.metrics?.volatility || !maxVolatilityInMonth) return 0;
    return Math.max(0.1, data.metrics.volatility / maxVolatilityInMonth);
  }, [data.metrics, maxVolatilityInMonth]);

  const volumeOpacity = useMemo(() => {
    if (!data.metrics?.volume || !maxVolumeInMonth) return 0;
    return Math.max(0.2, data.metrics.volume / maxVolumeInMonth);
  }, [data.metrics, maxVolumeInMonth]);

  const isSelected = selectedDate === format(data.date, 'yyyy-MM-dd');
  
  const tooltipText = data.hasData && data.metrics
    ? `${format(data.date, 'MMM d, yyyy')}\nChange: ${data.metrics.changePercent.toFixed(2)}%\nVolatility: ${data.metrics.volatility?.toFixed(2) ?? 'N/A'}%\nVolume: ${data.metrics.volume?.toLocaleString() ?? 'N/A'}`
    : `${format(data.date, 'MMM d, yyyy')}\nNo data available`;

  return (
    <>
      <style>
        {`
          @keyframes volumeRing {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      <Tooltip title={tooltipText} arrow>
        <motion.div
          onClick={handleClick}
          role="button"
          tabIndex={data.hasData ? 0 : -1}
          aria-label={`${format(data.date, 'MMMM d, yyyy')}${data.hasData ? ` - Change: ${data.metrics?.changePercent.toFixed(2)}%` : ' - No data'}`}
          aria-selected={isSelected}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: data.isCurrentMonth ? 1 : 0.3 
          }}
          whileHover={data.hasData ? { 
            scale: 1.1, 
            zIndex: 10,
            boxShadow: theme.shadows[4]
          } : {}}
          whileTap={data.hasData ? { scale: 0.95 } : {}}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.2
          }}
          style={{
            position: 'relative',
            aspectRatio: '1 / 1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            cursor: data.hasData ? 'pointer' : 'default',
            border: isSelected ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
            backgroundColor: isInRange ? alpha(theme.palette.secondary.main, 0.4) : 'transparent',
          }}
        >
          {/* Volatility Ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: volatilityOpacity 
            }}
            transition={{ 
              delay: 0.1, 
              duration: 0.3,
              type: "spring",
              stiffness: 200
            }}
            style={{
              position: 'absolute',
              inset: '5%',
              borderRadius: '50%',
              backgroundColor: theme.palette.warning.main,
              zIndex: 0,
            }}
          />

          {/* Volume Ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: volumeOpacity 
            }}
            transition={{ 
              delay: 0.2, 
              duration: 0.3,
              type: "spring",
              stiffness: 200
            }}
            style={{
              position: 'absolute',
              inset: '15%',
              borderRadius: '50%',
              backgroundColor: theme.palette.info.main,
              zIndex: 0,
            }}
          />

          <Typography 
            style={{ 
              position: 'relative', 
              zIndex: 2, 
              fontWeight: data.isToday ? 'bold' : 'normal',
              color: data.isToday ? theme.palette.primary.main : 'inherit',
              fontSize: '0.875rem'
            }}
          >
            {data.day}
          </Typography>
          
          {/* Performance Arrow */}
          <AnimatePresence>
            {data.hasData && data.metrics?.changePercent !== undefined && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.3, duration: 0.2 }}
                style={{ 
                  position: 'absolute', 
                  bottom: '15%', 
                  zIndex: 2,
                  color: data.metrics.changePercent > 0 ? theme.palette.success.main : theme.palette.error.main
                }}
              >
                {data.metrics.changePercent > 0 ? 
                  <ArrowUpwardIcon sx={{ fontSize: '0.75rem' }} /> : 
                  <ArrowDownwardIcon sx={{ fontSize: '0.75rem' }} />
                }
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Tooltip>
    </>
  );
};

export default CalendarCell;