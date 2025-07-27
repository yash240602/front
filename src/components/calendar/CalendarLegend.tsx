import React, { useMemo } from 'react';
import { Box, Typography, Tooltip, useTheme, alpha } from '@mui/material';

interface CalendarLegendProps {
  minChange: number;
  maxChange: number;
}

const CalendarLegend: React.FC<CalendarLegendProps> = ({ minChange, maxChange }) => {
  const theme = useTheme();
  
  const gradientSteps = useMemo(() => {
    const steps = [];
    for (let i = 0; i <= 100; i += 20) {
      const changePercent = minChange + (maxChange - minChange) * (i / 100);
      const intensity = Math.min(Math.abs(changePercent) / 5, 1);
      let color;
      
      if (changePercent > 0) {
        color = alpha(theme.palette.success.light, 0.2 + intensity * 0.6);
      } else if (changePercent < 0) {
        color = alpha(theme.palette.error.light, 0.2 + intensity * 0.6);
      } else {
        color = alpha(theme.palette.action.selected, 0.3);
      }
      
      steps.push({ percent: i, color, value: changePercent });
    }
    return steps;
  }, [minChange, maxChange, theme]);

  const gradientString = gradientSteps.map(step => `${step.color} ${step.percent}%`).join(', ');

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ 
        fontSize: '0.75rem', 
        fontWeight: 600, 
        color: theme.palette.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        mb: 1,
        display: 'block'
      }}>
        Performance Scale
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: theme.palette.text.secondary }}>
          {minChange.toFixed(1)}%
        </Typography>
        
        <Tooltip title="Color intensity represents performance magnitude" arrow>
          <Box
            sx={{
              flex: 1,
              height: '8px',
              borderRadius: '4px',
              background: `linear-gradient(to right, ${gradientString})`,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              cursor: 'help'
            }}
          />
        </Tooltip>
        
        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: theme.palette.text.secondary }}>
          +{maxChange.toFixed(1)}%
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: theme.palette.error.main }}>
          Loss
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: theme.palette.text.secondary }}>
          Neutral
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: theme.palette.success.main }}>
          Gain
        </Typography>
      </Box>
    </Box>
  );
};

export default CalendarLegend; 