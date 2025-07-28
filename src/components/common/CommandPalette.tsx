import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  IconButton
} from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { useMarketDataStore } from '../../store/marketDataStore';
import { useCalendarStore } from '../../store/calendarStore';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface DateOption {
  date: string;
  displayDate: string;
  changePercent?: number;
  volume?: number;
  hasData: boolean;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const { historicalData } = useMarketDataStore();
  const { setSelectedDate } = useCalendarStore();
  const [inputValue, setInputValue] = useState('');

  const dateOptions = useMemo(() => {
    const options: DateOption[] = [];
    const dataMap = new Map(historicalData.map(d => [
      typeof d.date === 'number' ? new Date(d.date).toISOString().split('T')[0] : d.date,
      d
    ]));

    // Generate last 2 years of dates
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 2);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const data = dataMap.get(dateStr);
      
      options.push({
        date: dateStr,
        displayDate: d.toLocaleDateString('en-US', { 
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        changePercent: data?.changePercent,
        volume: data?.volume,
        hasData: !!data
      });
    }

    return options.reverse(); // Most recent first
  }, [historicalData]);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return dateOptions.slice(0, 50); // Show recent 50 dates
    
    const searchTerm = inputValue.toLowerCase();
    return dateOptions.filter(option => 
      option.displayDate.toLowerCase().includes(searchTerm) ||
      option.date.includes(searchTerm)
    ).slice(0, 20);
  }, [dateOptions, inputValue]);

  const handleDateSelect = (option: DateOption | null) => {
    if (option) {
      setSelectedDate(option.date);
      onClose();
    }
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          borderRadius: 3,
          overflow: 'hidden',
          maxHeight: '60vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Jump to Date
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ p: 2, pt: 1 }}>
        <Autocomplete
          options={filteredOptions}
          getOptionLabel={(option) => option.displayDate}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
          onChange={(_, newValue) => handleDateSelect(newValue)}
          filterOptions={(x) => x} // We handle filtering manually
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search dates... (e.g., 'Jan 2024', 'Monday')"
              variant="outlined"
              autoFocus
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {option.displayDate}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.date}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {option.hasData ? (
                  <>
                    {option.changePercent !== undefined && (
                      <Chip
                        label={`${option.changePercent > 0 ? '+' : ''}${option.changePercent.toFixed(2)}%`}
                        size="small"
                        color={option.changePercent > 0 ? 'success' : option.changePercent < 0 ? 'error' : 'default'}
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    )}
                  </>
                ) : (
                  <Chip
                    label="No Data"
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: '20px' }}
                  />
                )}
              </Box>
            </Box>
          )}
          noOptionsText="No dates found"
          ListboxProps={{
            sx: { maxHeight: '300px' }
          }}
        />
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Press ⌘K (Mac) or Ctrl+K (Windows) to open • Enter to select
        </Typography>
      </Box>
    </Dialog>
  );
};

export default CommandPalette;