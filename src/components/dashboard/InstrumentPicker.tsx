import { useEffect, useMemo } from 'react';
import { 
  Autocomplete, 
  TextField, 
  CircularProgress, 
  Box, 
  Typography,
  Chip,
  useTheme
} from '@mui/material';
import { useMarketDataStore } from '../../store/marketDataStore';
import { instrumentToCoingeckoId } from '../../api/coingecko';

interface InstrumentOption {
  id: string;
  label: string;
  baseAsset: string;
  quoteAsset: string;
}

const InstrumentPicker = () => {
  const theme = useTheme();
  
  const { 
    instrument, 
    isLoading, 
    error,
    setInstrument, 
    fetchHistoricalData
  } = useMarketDataStore();
  
  const instrumentOptions = useMemo(() => {
    return Object.keys(instrumentToCoingeckoId).map(instrumentPair => {
      const [baseAsset, quoteAsset] = instrumentPair.split('-');
      return {
        id: instrumentPair,
        label: instrumentPair,
        baseAsset,
        quoteAsset
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, []);
  
  const selectedOption = useMemo(() => {
    return instrumentOptions.find(option => option.id === instrument) || null;
  }, [instrument, instrumentOptions]);
  
  const handleInstrumentChange = (_: any, newValue: InstrumentOption | null) => {
    if (newValue) {
      setInstrument(newValue.id);
      fetchHistoricalData(newValue.id);
    }
  };
  
  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);
  
  return (
    <Box sx={{ mb: 3, position: 'relative' }}>
      <Typography variant="subtitle1" gutterBottom fontWeight={500}>
        Select Instrument
      </Typography>
      
      <Autocomplete
        value={selectedOption}
        onChange={handleInstrumentChange}
        options={instrumentOptions}
        getOptionLabel={(option) => option.label}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Trading Pair"
            variant="outlined"
            placeholder="Select a trading pair"
            error={!!error}
            helperText={error || ''}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box flexGrow={1}>
                <Typography fontWeight={500}>{option.label}</Typography>
              </Box>
              <Chip 
                label={option.quoteAsset}
                size="small"
                sx={{ 
                  ml: 1, 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  fontSize: '0.7rem'
                }}
              />
            </Box>
          </li>
        )}
        loading={isLoading}
        loadingText="Loading instruments..."
        noOptionsText="No instruments found"
        fullWidth
      />
    </Box>
  );
};

export default InstrumentPicker; 