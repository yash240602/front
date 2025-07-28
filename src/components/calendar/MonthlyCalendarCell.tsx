import React from 'react';
import { Box, Typography, Tooltip, useTheme, alpha } from '@mui/material';
import { ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import type { MonthlyMetrics } from '../../utils/monthlyAggregationService';

interface MonthlyCalendarCellProps {
  data: MonthlyMetrics;
  isSelected: boolean;
  onSelect: (monthKey: string) => void;
}

const MonthlyCalendarCell: React.FC<MonthlyCalendarCellProps> = ({ data, isSelected, onSelect }) => {
  const theme = useTheme();
  
  const handleClick = () => {
    onSelect(data.date);
  };

  const getPerformanceColor = (changePercent: number) => {
    if (changePercent > 0) return theme.palette.success.main;
    if (changePercent < 0) return theme.palette.error.main;
    return theme.palette.grey[500];
  };

  const tooltipText = `${data.month} ${data.year}\nOpen: $${data.open.toFixed(2)}\nClose: $${data.close.toFixed(2)}\nHigh: $${data.high.toFixed(2)}\nLow: $${data.low.toFixed(2)}\nVolume: ${data.totalVolume.toLocaleString()}\nAvg Change: ${data.averageChangePercent.toFixed(2)}%\nVolatility: ${data.volatility.toFixed(2)}%\nTrading Days: ${data.tradingDays}`;

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
        <Box
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-label={`${data.month} ${data.year} - Average Change: ${data.averageChangePercent.toFixed(2)}%`}
          aria-selected={isSelected}
          sx={{
            position: 'relative',
            aspectRatio: '1 / 1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            cursor: 'pointer',
            border: isSelected ? `3px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            backgroundColor: alpha(getPerformanceColor(data.averageChangePercent), 0.1),
            transition: 'all 0.2s ease-in-out',
            '&:hover': { 
              transform: 'scale(1.05)', 
              zIndex: 10,
              boxShadow: theme.shadows[4]
            },
            p: 1,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '10%',
              right: '10%',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.info.main, 0.3),
              animation: 'volumeRing 0.6s ease-out forwards',
              zIndex: 1
            }
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 'bold',
              color: getPerformanceColor(data.averageChangePercent),
              textAlign: 'center',
              lineHeight: 1.2,
              zIndex: 2
            }}
          >
            {data.month}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.7rem',
              zIndex: 2
            }}
          >
            {data.year}
          </Typography>
          
          {/* Performance Arrow */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: '15%', 
            zIndex: 2,
            color: getPerformanceColor(data.averageChangePercent)
          }}>
            {data.averageChangePercent > 0 ? 
              <ArrowUpwardIcon sx={{ fontSize: '1rem' }} /> : 
              <ArrowDownwardIcon sx={{ fontSize: '1rem' }} />
            }
          </Box>
          
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 'bold',
              color: getPerformanceColor(data.averageChangePercent),
              fontSize: '0.75rem',
              zIndex: 2
            }}
          >
            {data.averageChangePercent > 0 ? '+' : ''}{data.averageChangePercent.toFixed(1)}%
          </Typography>
        </Box>
      </Tooltip>
    </>
  );
};

export default MonthlyCalendarCell; 