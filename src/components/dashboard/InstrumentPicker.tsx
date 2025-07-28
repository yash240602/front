import { useEffect, useMemo, useRef } from 'react';
import { 
  Autocomplete, 
  TextField, 
  CircularProgress, 
  Box, 
  Typography,
  Chip,
  Switch,
  FormControlLabel,
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
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    instrument, 
    isLoading, 
    error,
    useRealData,
    availableCoins,
    setInstrument, 
    setUseRealData,
    fetchHistoricalData,
    fetchAvailableCoins
  } = useMarketDataStore();
  
  const instrumentOptions = useMemo(() => {
    if (useRealData) {
      // Use real cryptocurrency data from API
      return availableCoins
        .slice(0, 50) // Limit to top 50 for performance
        .map(coin => ({
          id: coin.id,
          label: `${coin.symbol} (${coin.name})`,
          baseAsset: coin.symbol,
          quoteAsset: 'USD'
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    } else {
      // Traditional financial instruments for mock data
      const traditionalInstruments = [
        { id: 'SPY', label: 'SPY (S&P 500 ETF)', baseAsset: 'SPY', quoteAsset: 'USD' },
        { id: 'AAPL', label: 'AAPL (Apple Inc.)', baseAsset: 'AAPL', quoteAsset: 'USD' },
        { id: 'GOOGL', label: 'GOOGL (Alphabet Inc.)', baseAsset: 'GOOGL', quoteAsset: 'USD' },
        { id: 'MSFT', label: 'MSFT (Microsoft Corp.)', baseAsset: 'MSFT', quoteAsset: 'USD' },
        { id: 'TSLA', label: 'TSLA (Tesla Inc.)', baseAsset: 'TSLA', quoteAsset: 'USD' },
        { id: 'AMZN', label: 'AMZN (Amazon.com Inc.)', baseAsset: 'AMZN', quoteAsset: 'USD' },
        { id: 'NVDA', label: 'NVDA (NVIDIA Corp.)', baseAsset: 'NVDA', quoteAsset: 'USD' },
        { id: 'META', label: 'META (Meta Platforms Inc.)', baseAsset: 'META', quoteAsset: 'USD' },
      ];
      
      // Add cryptocurrency pairs
      const cryptoInstruments = Object.keys(instrumentToCoingeckoId).map(instrumentPair => {
        const [baseAsset, quoteAsset] = instrumentPair.split('-');
        return {
          id: instrumentPair,
          label: instrumentPair,
          baseAsset,
          quoteAsset
        };
      });
      
      return [...traditionalInstruments, ...cryptoInstruments].sort((a, b) => a.label.localeCompare(b.label));
    }
  }, [useRealData, availableCoins]);
  
  const selectedOption = useMemo(() => {
    return instrumentOptions.find(option => option.id === instrument) || null;
  }, [instrument, instrumentOptions]);
  
  const handleInstrumentChange = (_: any, newValue: InstrumentOption | null) => {
    if (newValue) {
      setInstrument(newValue.id);
      fetchHistoricalData(newValue.id);
      // Blur the input after selection to remove blinking cursor
      setTimeout(() => {
        if (inputRef.current) inputRef.current.blur();
      }, 0);
    }
  };
  
  useEffect(() => {
    if (useRealData && availableCoins.length === 0) {
      fetchAvailableCoins();
    }
    fetchHistoricalData();
  }, [fetchHistoricalData, fetchAvailableCoins, useRealData, availableCoins.length]);
  
  return (
    <Box sx={{ mb: 3, position: 'relative' }}>
      <Typography variant="subtitle1" gutterBottom fontWeight={500}>
        Select Instrument
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={useRealData}
              onChange={(e) => setUseRealData(e.target.checked)}
              color="primary"
            />
          }
          label={`Use ${useRealData ? 'Real' : 'Mock'} Data`}
        />
        {useRealData && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            Fetching live cryptocurrency data from CoinGecko API
          </Typography>
        )}
      </Box>
      
      <style>
        {`
          .MuiAutocomplete-input {
            caret-color: ${theme.palette.text.primary} !important;
          }
        `}
      </style>
      
      <Autocomplete
        value={selectedOption}
        onChange={handleInstrumentChange}
        options={instrumentOptions}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={inputRef}
            label="Trading Pair"
            variant="outlined"
            placeholder="Select a trading pair"
            error={!!error}
            helperText={error || ''}
            aria-label="Select trading pair instrument"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
              autoFocus: false, // Prevent auto-focus after dropdown closes
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
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
          </Box>
        )}
        loading={isLoading}
        loadingText="Loading instruments..."
        noOptionsText="No instruments found"
        fullWidth
        disableClearable={false}
        openOnFocus={true}
      />
    </Box>
  );
};

export default InstrumentPicker; 