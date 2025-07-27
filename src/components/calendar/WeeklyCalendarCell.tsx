import React, { useMemo } from 'react';
import { Box, Typography, useTheme, alpha } from '@mui/material';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';
import { useCalendarStore } from '../../store/calendarStore';

interface WeeklyData {
  weekStart: Date;
  weekEnd: Date;
  totalVolume: number;
  avgChangePercent: number;
  highPrice: number;
  lowPrice: number;
  daysWithData: number;
  avgVolatility: number;
}

interface WeeklyCalendarCellProps {
  data: WeeklyData;
  maxWeeklyVolume: number;
  maxWeeklyVolatility: number;
}

const getWeekColor = (avgChange: number, visualizationMode: string, avgVolatility: number, maxVolatility: number, theme: any) => {
  if (visualizationMode === 'volatility') {
    if (maxVolatility === 0) return alpha(theme.palette.background.paper, 0.4);
    const intensity = Math.min(avgVolatility / maxVolatility, 1);
    return alpha(theme.palette.warning.light, 0.2 + intensity * 0.6);
  } else {
    const intensity = Math.min(Math.abs(avgChange) / 5, 1);
    if (avgChange > 0) return alpha(theme.palette.success.light, 0.2 + intensity * 0.6);
    if (avgChange < 0) return alpha(theme.palette.error.light, 0.2 + intensity * 0.6);
    return alpha(theme.palette.action.selected, 0.3);
  }
};

const WeeklyCalendarCell: React.FC<WeeklyCalendarCellProps> = ({ data, maxWeeklyVolume, maxWeeklyVolatility }) => {
  const theme = useTheme();
  const { visualizationMode } = useCalendarStore();

  const backgroundColor = useMemo(() => 
    getWeekColor(data.avgChangePercent, visualizationMode, data.avgVolatility, maxWeeklyVolatility, theme),
    [data.avgChangePercent, data.avgVolatility, visualizationMode, maxWeeklyVolatility, theme]
  );

  const volumeBarHeight = useMemo(() => {
    if (maxWeeklyVolume === 0) return 0;
    return Math.min((data.totalVolume / maxWeeklyVolume) * 100, 100);
  }, [data.totalVolume, maxWeeklyVolume]);

  const weekLabel = useMemo(() => {
    const start = data.weekStart.getDate();
    const end = data.weekEnd.getDate();
    return `${start}-${end}`;
  }, [data.weekStart, data.weekEnd]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '120px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '12px',
        backgroundColor,
        position: 'relative',
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
        },
        '&::before': { // Volume bar
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '4px',
          height: `${volumeBarHeight}%`,
          backgroundColor: alpha(theme.palette.primary.main, 0.8),
          borderRadius: '0 0 0 12px',
          transition: 'height 0.3s ease-out',
        }
      }}
    >
      {/* Week label */}
      <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
        Week {weekLabel}
      </Typography>

      {/* Main metric */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        {visualizationMode === 'volatility' ? (
          <Typography variant="h6" fontWeight={700} sx={{ color: theme.palette.warning.main }}>
            {data.avgVolatility.toFixed(1)}%
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {data.avgChangePercent > 0 ? (
              <TrendingUpIcon sx={{ fontSize: '1rem', color: 'success.main' }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: '1rem', color: 'error.main' }} />
            )}
            <Typography variant="h6" fontWeight={700}>
              {data.avgChangePercent > 0 ? '+' : ''}{data.avgChangePercent.toFixed(1)}%
            </Typography>
          </Box>
        )}
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
          {data.daysWithData} days
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
          Vol: {(data.totalVolume / 1000000).toFixed(1)}M
        </Typography>
      </Box>
    </Box>
  );
};

export default React.memo(WeeklyCalendarCell);
