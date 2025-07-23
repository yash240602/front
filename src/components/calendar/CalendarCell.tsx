import React, { useMemo } from 'react';
import { 
  ButtonBase, 
  Box, 
  Typography, 
  Tooltip, 
  useTheme,
  alpha
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { BarChart, Bar, Cell, ResponsiveContainer } from 'recharts';
import { CalendarCellData } from '../../types/data';
import { useCalendarStore } from '../../store/calendarStore';

interface CalendarCellProps {
  data: CalendarCellData;
}

const getChangeColor = (
  changePercent: number | undefined, 
  theme: any, 
  isCurrentMonth: boolean = true
) => {
  if (changePercent === undefined) {
    return alpha(theme.palette.action.disabledBackground, isCurrentMonth ? 0.5 : 0.2);
  }
  
  const intensity = Math.min(Math.abs(changePercent) / 3, 1);
  
  if (changePercent > 0) {
    return alpha(theme.customProps.chart.positive, isCurrentMonth ? 0.2 + (intensity * 0.6) : (0.1 + (intensity * 0.3)));
  } else if (changePercent < 0) {
    return alpha(theme.customProps.chart.negative, isCurrentMonth ? 0.2 + (intensity * 0.6) : (0.1 + (intensity * 0.3)));
  } else {
    return alpha(theme.palette.action.selected, isCurrentMonth ? 0.3 : 0.1);
  }
};

const formatDate = (date: Date): string => new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(date);
const formatCurrency = (value: number | undefined): string => value === undefined ? 'N/A' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const formatPercent = (value: number | undefined): string => value === undefined ? 'N/A' : new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, signDisplay: 'always' }).format(value / 100);
const formatVolume = (value: number | undefined): string => {
  if (value === undefined) return 'N/A';
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
};

const CalendarCell: React.FC<CalendarCellProps> = ({ data }) => {
  const theme = useTheme();
  const setSelectedDate = useCalendarStore(state => state.setSelectedDate);

  const volumeData = useMemo(() => [{ value: data.volume || 0 }], [data.volume]);
  const backgroundColor = useMemo(() => getChangeColor(data.changePercent, theme, data.isCurrentMonth), [data.changePercent, theme, data.isCurrentMonth]);
  
  const tooltipContent = useMemo(() => {
    if (!data.hasData || !data.metrics) {
      return <Box sx={{ p: 1 }}><Typography variant="body2">{formatDate(data.date)}</Typography><Typography variant="body2">No data</Typography></Box>;
    }
    const { open, high, low, close, volume, changePercent } = data.metrics;
    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2" fontWeight={600}>{formatDate(data.date)}</Typography>
        <Box sx={{ mt: 1, mb: 1 }}><Typography variant="body2" sx={{ color: changePercent > 0 ? theme.customProps.chart.positive : theme.customProps.chart.negative, fontWeight: 600 }}>Change: {formatPercent(changePercent)}</Typography></Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">Open: {formatCurrency(open)}</Typography>
          <Typography variant="body2" color="text.secondary">Close: {formatCurrency(close)}</Typography>
          <Typography variant="body2" color="text.secondary">High: {formatCurrency(high)}</Typography>
          <Typography variant="body2" color="text.secondary">Low: {formatCurrency(low)}</Typography>
          <Typography variant="body2" color="text.secondary" gridColumn="1 / -1">Volume: {formatVolume(volume)}</Typography>
        </Box>
      </Box>
    );
  }, [data, theme]);

  const accessibleDescription = useMemo(() => {
    let desc = `${data.day}, ${formatDate(data.date)}`;
    if (data.isToday) desc += ' (Today)';
    if (!data.isCurrentMonth) desc += ' (Outside current month)';
    if (data.hasData && data.metrics) {
      desc += `. Change: ${formatPercent(data.metrics.changePercent)}, Volume: ${formatVolume(data.metrics.volume)}`;
    } else {
      desc += '. No market data available';
    }
    return desc;
  }, [data]);
  
  const handleClick = () => {
    if (data.hasData) {
      const dateStr = data.date.toISOString().split('T')[0];
      setSelectedDate(dateStr);
    }
  };

  return (
    <Tooltip title={tooltipContent} arrow enterDelay={400}>
      <ButtonBase
        component="div"
        role="button"
        aria-label={accessibleDescription}
        onClick={handleClick}
        sx={{
          width: '100%', height: 80, borderRadius: 1, bgcolor: backgroundColor, position: 'relative', overflow: 'hidden',
          transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'stretch',
          opacity: data.isCurrentMonth ? 1 : 0.65,
          border: data.isSelected ? `2px solid ${theme.palette.primary.main}` : data.isToday ? `2px solid ${theme.palette.secondary.main}` : '2px solid transparent',
          '&:hover': { bgcolor: alpha(backgroundColor, 0.8), transform: data.hasData ? 'scale(1.02)' : 'none', zIndex: 1, },
          '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 }
        }}
      >
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="body2" fontWeight={data.isToday ? 700 : 500} sx={{ opacity: data.isCurrentMonth ? 1 : 0.7 }}>{data.day}</Typography>
          {data.hasData && data.changePercent !== undefined && (
            <Box>
              {data.changePercent > 0 ? <ArrowUpwardIcon fontSize="small" sx={{ color: theme.customProps.chart.positive, fontSize: '0.9rem' }} />
               : data.changePercent < 0 ? <ArrowDownwardIcon fontSize="small" sx={{ color: theme.customProps.chart.negative, fontSize: '0.9rem' }} />
               : null}
            </Box>
          )}
        </Box>
        {data.hasData && data.volume !== undefined && (
          <Box sx={{ flex: 1, mt: 'auto', maxHeight: 30, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Bar dataKey="value" isAnimationActive={false}><Cell fill={alpha(theme.customProps.chart.volume, 0.6)} /></Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
        {data.hasData && data.changePercent !== undefined && (
          <Typography variant="caption" sx={{ position: 'absolute', bottom: 2, right: 4, fontWeight: 600, fontSize: '0.65rem', color: data.changePercent > 0 ? theme.customProps.chart.positive : data.changePercent < 0 ? theme.customProps.chart.negative : theme.palette.text.secondary, bgcolor: alpha(theme.palette.background.paper, 0.7), px: 0.5, borderRadius: 0.5 }}>
            {data.changePercent > 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
          </Typography>
        )}
      </ButtonBase>
    </Tooltip>
  );
};

export default React.memo(CalendarCell); 