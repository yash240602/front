import React, { useMemo } from 'react';
import { Box, Typography, Tooltip, useTheme, alpha, Chip } from '@mui/material';
import { ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';
import type { CalendarCellData } from '../../types/data';
import { useCalendarStore } from '../../store/calendarStore';

interface CalendarCellProps {
  data: CalendarCellData;
  maxVolume: number;
}

// Enhanced gradient backgrounds for performance
const getPerformanceGradient = (changePercent: number | undefined, theme: any) => {
  if (changePercent === undefined) return `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.1)} 0%, ${alpha(theme.palette.grey[600], 0.2)} 100%)`;
  
  const intensity = Math.min(Math.abs(changePercent) / 5, 1);
  
  if (changePercent > 3) return `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`;
  if (changePercent > 0) {
    const light = alpha(theme.palette.success.main, 0.2 + intensity * 0.4);
    const dark = alpha(theme.palette.success.main, 0.3 + intensity * 0.5);
    return `linear-gradient(135deg, ${light} 0%, ${dark} 100%)`;
  }
  if (changePercent < -3) return `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`;
  if (changePercent < 0) {
    const light = alpha(theme.palette.error.main, 0.2 + intensity * 0.4);
    const dark = alpha(theme.palette.error.main, 0.3 + intensity * 0.5);
    return `linear-gradient(135deg, ${light} 0%, ${dark} 100%)`;
  }
  return `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.2)} 0%, ${alpha(theme.palette.grey[600], 0.3)} 100%)`;
};

const CalendarCell: React.FC<CalendarCellProps> = ({ data, maxVolume }) => {
  const theme = useTheme();
  const setSelectedDate = useCalendarStore(state => state.setSelectedDate);

  const backgroundGradient = useMemo(() => getPerformanceGradient(data.changePercent, theme), [data.changePercent, theme]);
  const textColor = useMemo(() => {
    if (!data.changePercent) return theme.palette.text.primary;
    const intensity = Math.abs(data.changePercent) / 5;
    return intensity > 0.7 ? theme.palette.common.white : theme.palette.text.primary;
  }, [data.changePercent, theme]);

  // Calculate volume ring sweep percentage (0-100)
  const volumePct = useMemo(() => {
    if (!data.volume || !maxVolume) return 0;
    return Math.min((data.volume / maxVolume) * 100, 100);
  }, [data.volume, maxVolume]);

  const handleClick = () => {
    if (data.hasData) {
      setSelectedDate(data.date.toISOString().split('T')[0]);
    }
  };

  const todayRingGradient = `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`;
  const selectedRingGradient = `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`;

  return (
    <Tooltip 
      title={
        data.hasData && data.metrics ? 
        `${data.date.toLocaleDateString()} • Change: ${data.metrics.changePercent.toFixed(2)}% • Volume: ${data.volume?.toLocaleString()}` : 
        'No data available'
      } 
      arrow 
      enterDelay={300}
    >
      <Box
        onClick={handleClick}
        sx={{
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: data.hasData ? 'pointer' : 'default',
          background: backgroundGradient,
          position: 'relative',
          opacity: data.isCurrentMonth ? 1 : 0.4,
          border: data.isSelected
            ? `3px solid transparent`
            : data.isToday
            ? `3px solid transparent`
            : `2px solid ${alpha(theme.palette.divider, 0.15)}`,
          backgroundClip: data.isSelected || data.isToday ? 'padding-box' : undefined,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: data.hasData ? '0 2px 8px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.08)',
          '&:hover': {
            transform: data.hasData ? 'translateY(-6px) scale(1.08)' : 'translateY(-2px)',
            boxShadow: data.hasData ? '0 12px 32px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10,
            '& .performance-chip': {
              transform: 'translateY(-2px)',
              opacity: 1,
            },
            '& .day-number': {
              transform: 'scale(1.1)',
            }
          },
          // Today's gradient ring
          ...(data.isToday && {
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: '-3px',
              borderRadius: '50%',
              padding: '3px',
              background: todayRingGradient,
              WebkitMask: 'radial-gradient(closest-side, transparent 88%, #000 89%)',
              pointerEvents: 'none',
            }
          }),
          // Selected gradient ring
          ...(data.isSelected && {
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: '-3px',
              borderRadius: '50%',
              padding: '3px',
              background: selectedRingGradient,
              WebkitMask: 'radial-gradient(closest-side, transparent 88%, #000 89%)',
              pointerEvents: 'none',
            }
          }),
          // Volume ring
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            padding: '2px',
            background: volumePct > 0 ? `conic-gradient(${theme.palette.primary.main} ${volumePct}%, transparent ${volumePct}% 100%)` : 'none',
            WebkitMask: 'radial-gradient(closest-side, transparent 75%, #000 76%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Typography 
          className="day-number"
          variant="body2" 
          fontWeight={data.isToday ? 800 : 600}
          sx={{ 
            color: textColor,
            fontSize: data.isToday ? '1rem' : '0.875rem',
            transition: 'all 0.2s ease',
            textShadow: textColor === theme.palette.common.white ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
          }}
        >
          {data.day}
        </Typography>

        {data.hasData && data.changePercent !== undefined && Math.abs(data.changePercent) > 0.5 && (
          <Chip
            className="performance-chip"
            size="small"
            label={`${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(1)}%`}
            icon={data.changePercent > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              height: '20px',
              fontSize: '0.65rem',
              fontWeight: 700,
              backgroundColor: data.changePercent > 0 ? theme.palette.success.main : theme.palette.error.main,
              color: theme.palette.common.white,
              opacity: 0.9,
              transition: 'all 0.2s ease',
              '& .MuiChip-icon': {
                fontSize: '0.75rem',
                color: 'inherit'
              },
              '& .MuiChip-label': {
                paddingLeft: '6px',
                paddingRight: '8px'
              }
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
};

export default React.memo(CalendarCell); 