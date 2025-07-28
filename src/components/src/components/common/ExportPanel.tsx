import React from 'react';
import { Box, Button, Typography, Divider } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { useCalendarStore } from '../../store/calendarStore';
import { useMarketDataStore } from '../../store/marketDataStore';
import { exportToCsv } from '../../utils/exportService';

const ExportPanel = () => {
  const { rangeStart, rangeEnd, viewMode } = useCalendarStore();
  const { historicalData, weeklyData } = useMarketDataStore();

  const handleExport = () => {
    const data = viewMode === 'week' ? weeklyData : historicalData;
    if (!rangeStart || !rangeEnd) {
      alert('Please select a date range using Shift + Click.');
      return;
    }
    const filteredData = data.filter(d => {
      const date = new Date(d.date);
      return date >= new Date(rangeStart) && date <= new Date(rangeEnd);
    });
    if (filteredData.length > 0) {
      exportToCsv(filteredData, `market-data-${viewMode}-${rangeStart}-to-${rangeEnd}.csv`);
    } else {
      alert('No data available in the selected range to export.');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Export Data</Typography>
      <Divider sx={{ my: 1 }} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select a date range on the calendar (Shift + Click) to enable export.
      </Typography>
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={handleExport}
        disabled={!rangeStart || !rangeEnd}
        fullWidth
      >
        Export Range to CSV
      </Button>
    </Box>
  );
};

export default ExportPanel;