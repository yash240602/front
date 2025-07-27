import React, { useMemo } from 'react';
import { Box, Typography, Tooltip, useTheme, alpha } from '@mui/material';
import { ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon } from '@mui/icons-material';
import type { CalendarCellData } from '../../types/data';
import { useCalendarStore } from '../../store/calendarStore';

interface CalendarCellProps {
  data: CalendarCellData;
  maxVolumeInMonth: number;
  maxVolatilityInMonth: number;
}

const getChangeColor = (changePercent: number | undefined, theme: any) => {
  if (changePercent === undefined) return alpha(theme.palette.background.paper, 0.4);
  const intensity = Math.min(Math.abs(changePercent) / 5, 1);
  if (changePercent > 0) return alpha(theme.palette.success.light, 0.2 + intensity * 0.6);
  if (changePercent < 0) return alpha(theme.palette.error.light, 0.2 + intensity * 0.6);
  return alpha(theme.palette.action.selected, 0.3);
};

const getVolatilityColor = (volatility: number | undefined, maxVolatility: number, theme: any) => {
  if (volatility === undefined || maxVolatility === 0) return alpha(theme.palette.background.paper, 0.4);
  const intensity = Math.min(volatility / maxVolatility, 1);
  // High volatility = orange/warning color
  return alpha(theme.palette.warning.light, 0.2 + intensity * 0.6);
};

const CalendarCell: React.FC<CalendarCellProps> = ({ data, maxVolumeInMonth, maxVolatilityInMonth }) => {
  const theme = useTheme();
  const { 
    setSelectedDate, 
    visualizationMode, 
    rangeStart, 
    rangeEnd, 
    setDateRange 
  } = useCalendarStore(state => ({
    setSelectedDate: state.setSelectedDate,
    visualizationMode: state.visualizationMode,
    rangeStart: state.rangeStart,
    rangeEnd: state.rangeEnd,
    setDateRange: state.setDateRange
  }));

  const backgroundColor = useMemo(() => {
    if (visualizationMode === 'volatility') {
      return getVolatilityColor(data.metrics?.volatility, maxVolatilityInMonth, theme);
    } else {
      return getChangeColor(data.changePercent, theme);
    }
  }, [data.changePercent, data.metrics?.volatility, maxVolatilityInMonth, visualizationMode, theme]);
  
  const volumePct = useMemo(() => {
    if (!data.volume || !maxVolumeInMonth) return 0;
    return Math.min((data.volume / maxVolumeInMonth) * 100, 100);
  }, [data.volume, maxVolumeInMonth]);

  const isInRange = useMemo(() => {
    if (!rangeStart || !rangeEnd) return false;
    
    const dateStr = data.date.toISOString().split('T')[0];
    const currentDate = new Date(dateStr);
    const startDate = new Date(rangeStart);
    const endDate = new Date(rangeEnd);
    
    return currentDate >= startDate && currentDate <= endDate;
  }, [data.date, rangeStart, rangeEnd]);

  const handleClick = (event: React.MouseEvent) => {
    if (!data.hasData) return;
    
    const dateStr = data.date.toISOString().split('T')[0];
    
    if (event.shiftKey && rangeStart && !rangeEnd) {
      // Complete range selection
      const startDate = new Date(rangeStart);
      const endDate = new Date(dateStr);
      
      // Ensure start is before end
      if (startDate <= endDate) {
        setDateRange(rangeStart, dateStr);
      } else {
        setDateRange(dateStr, rangeStart);
      }
    } else {
      // Start new selection or range
      setSelectedDate(dateStr);
      setDateRange(dateStr, null);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes sweep {
            from { --sweep-angle: 0deg; }
            to { --sweep-angle: ${volumePct * 3.6}deg; }
          }
          @keyframes ripple {
            from { transform: scale(0); opacity: 0.3; }
            to { transform: scale(1.6); opacity: 0; }
          }
        `}
      </style>
      <Tooltip 
        title={data.hasData && data.metrics ? `Change: ${data.metrics.changePercent.toFixed(2)}% | Vol: ${data.volume?.toLocaleString()}` : 'No data'} 
        arrow 
        enterDelay={400}
      >
        <Box
          onClick={handleClick}
          tabIndex={data.hasData ? 0 : -1}
          role="gridcell"
          aria-label={`${data.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}${data.hasData ? `, ${data.changePercent?.toFixed(2)}% change` : ', no data'}`}
          aria-selected={data.isSelected}
          sx={{
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: data.hasData ? 'zoom-in' : 'default',
            backgroundColor,
            position: 'relative',
            opacity: data.isCurrentMonth ? 1 : 0.4,
            border: data.isSelected
              ? `2px solid ${theme.palette.primary.main}`
              : data.isToday
              ? `2px solid ${theme.palette.secondary.main}`
              : isInRange
              ? `2px solid ${alpha(theme.palette.primary.main, 0.5)}`
              : `2px solid transparent`,
            transition: 'all 0.2s ease-in-out',
            '&:focus': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: '2px',
              zIndex: 3
            },
            '&:hover': {
              transform: data.hasData ? 'perspective(600px) translateZ(8px)' : 'none',
              borderColor: data.hasData ? theme.palette.primary.light : 'transparent',
              zIndex: 2,
              boxShadow: data.hasData ? `0 8px 24px ${alpha(theme.palette.common.black, 0.25)}` : 'none',
            },
            '&::before': { // Volume Ring
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              padding: '2px',
              '--clr': alpha(theme.palette.primary.light, 0.8),
              '--pct': `${volumePct * 3.6}deg`,
              background: `conic-gradient(var(--clr) var(--pct), transparent var(--pct))`,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none',
              animation: 'sweep 0.6s ease-out forwards',
            },
            '&:active::after': { // Ripple Effect
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: theme.palette.primary.light,
                animation: 'ripple 0.4s ease-out',
            },
            // Range overlay
            ...(isInRange && {
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: alpha(theme.palette.primary.main, 0.1),
                pointerEvents: 'none',
              }
            })
          }}
        >
          <Typography variant="body1" fontWeight={data.isToday ? 700 : 500}>
            {data.day}
          </Typography>
          {data.hasData && data.changePercent !== undefined && (
            <Box sx={{ position: 'absolute', bottom: '15%', color: data.changePercent > 0 ? 'success.main' : 'error.main' }}>
              {data.changePercent > 0 ? <ArrowUpwardIcon sx={{ fontSize: '1rem' }} /> : <ArrowDownwardIcon sx={{ fontSize: '1rem' }} />}
            </Box>
          )}
        </Box>
      </Tooltip>
    </>
  );
};

export default React.memo(CalendarCell); 