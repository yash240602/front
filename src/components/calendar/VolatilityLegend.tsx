import React from 'react';
import { Box, Typography, Paper, useTheme, alpha } from '@mui/material';

interface VolatilityLegendProps {
  maxVolatility?: number;
}

const VolatilityLegend: React.FC<VolatilityLegendProps> = ({ maxVolatility = 30 }) => {
  const theme = useTheme();

  // Define volatility thresholds and colors
  const thresholds = [
    { label: 'Low', max: 10, color: '#4caf50' }, // Green
    { label: 'Medium', max: 20, color: '#ff9800' }, // Orange/Yellow
    { label: 'High', max: maxVolatility, color: '#f44336' } // Red
  ];

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 1.5, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
      }}
    >
      <Typography variant="caption" fontWeight={500} sx={{ minWidth: '60px' }}>
        Volatility:
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {thresholds.map((threshold, index) => (
          <Box
            key={threshold.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: threshold.color,
                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                boxShadow: `0 1px 3px ${alpha(threshold.color, 0.3)}`
              }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
              {threshold.label}
            </Typography>
            {index < thresholds.length - 1 && (
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                •
              </Typography>
            )}
          </Box>
        ))}
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontSize: '0.7rem' }}>
        {'<10% • 10-20% • >20%'}
      </Typography>
    </Paper>
  );
};

export default VolatilityLegend; 