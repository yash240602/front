import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useMarketDataStore } from '../../store/marketDataStore';
import { useCalendarStore } from '../../store/calendarStore';

interface FilterState {
  instrument: string;
  timePeriod: string;
  metricType: string;
  displayThreshold: number;
  showOnlyPositive: boolean;
  showOnlyNegative: boolean;
  showOnlyHighVolatility: boolean;
  volatilityThreshold: number;
}

const FILTER_STORAGE_KEY = 'market-explorer-filters';

const FilterPanel: React.FC = () => {
  const theme = useTheme();
  const { historicalData, instrument, setInstrument } = useMarketDataStore();
  const { setViewMode } = useCalendarStore();
  
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    instrument: instrument,
    timePeriod: 'all',
    metricType: 'all',
    displayThreshold: 0,
    showOnlyPositive: false,
    showOnlyNegative: false,
    showOnlyHighVolatility: false,
    volatilityThreshold: 20
  });

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setFilters(prev => ({ ...prev, ...parsedFilters }));
      } catch (error) {
        console.warn('Failed to load saved filters:', error);
      }
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  // Update instrument filter when instrument changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, instrument }));
  }, [instrument]);

  const timePeriodOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'lastQuarter', label: 'Last Quarter' },
    { value: 'lastYear', label: 'Last Year' }
  ];

  const metricTypeOptions = [
    { value: 'all', label: 'All Metrics' },
    { value: 'volatility', label: 'Volatility' },
    { value: 'volume', label: 'Volume' },
    { value: 'priceChange', label: 'Price Change' },
    { value: 'performance', label: 'Performance' }
  ];

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Apply instrument filter immediately
    if (key === 'instrument') {
      setInstrument(value);
    }
    
    // Apply time period filter to view mode
    if (key === 'timePeriod') {
      switch (value) {
        case 'lastWeek':
          setViewMode('week');
          break;
        case 'lastMonth':
        case 'lastQuarter':
        case 'lastYear':
          setViewMode('month');
          break;
        default:
          setViewMode('day');
      }
    }
  };

  const clearAllFilters = () => {
    const defaultFilters: FilterState = {
      instrument: instrument,
      timePeriod: 'all',
      metricType: 'all',
      displayThreshold: 0,
      showOnlyPositive: false,
      showOnlyNegative: false,
      showOnlyHighVolatility: false,
      volatilityThreshold: 20
    };
    setFilters(defaultFilters);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.timePeriod !== 'all') count++;
    if (filters.metricType !== 'all') count++;
    if (filters.displayThreshold > 0) count++;
    if (filters.showOnlyPositive) count++;
    if (filters.showOnlyNegative) count++;
    if (filters.showOnlyHighVolatility) count++;
    return count;
  }, [filters]);

  const getFilteredData = () => {
    let filteredData = [...historicalData];

    // Apply time period filter
    if (filters.timePeriod !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (filters.timePeriod) {
        case 'lastWeek':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'lastMonth':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'lastQuarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'lastYear':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filteredData = filteredData.filter(d => new Date(d.date) >= startDate);
    }

    // Apply display threshold filter
    if (filters.displayThreshold > 0) {
      filteredData = filteredData.filter(d => 
        Math.abs(d.changePercent) >= filters.displayThreshold
      );
    }

    // Apply positive/negative filters
    if (filters.showOnlyPositive) {
      filteredData = filteredData.filter(d => d.changePercent > 0);
    }
    if (filters.showOnlyNegative) {
      filteredData = filteredData.filter(d => d.changePercent < 0);
    }

    // Apply volatility filter
    if (filters.showOnlyHighVolatility) {
      filteredData = filteredData.filter(d => 
        d.volatility && d.volatility >= filters.volatilityThreshold
      );
    }

    return filteredData;
  };

  const filteredData = getFilteredData();

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="primary" />
          <Typography variant="h6">Filters</Typography>
          {activeFiltersCount > 0 && (
            <Chip 
              label={activeFiltersCount} 
              size="small" 
              color="primary" 
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse filters' : 'Expand filters'}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          {activeFiltersCount > 0 && (
            <IconButton
              size="small"
              onClick={clearAllFilters}
              aria-label="Clear all filters"
              color="error"
            >
              <ClearIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          
          {/* Time Period Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>Time Period</InputLabel>
            <Select
              value={filters.timePeriod}
              onChange={(e) => handleFilterChange('timePeriod', e.target.value)}
              label="Time Period"
            >
              {timePeriodOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Metric Type Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>Metric Type</InputLabel>
            <Select
              value={filters.metricType}
              onChange={(e) => handleFilterChange('metricType', e.target.value)}
              label="Metric Type"
            >
              {metricTypeOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Display Threshold Filter */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Display Threshold: {filters.displayThreshold}%
            </Typography>
            <Slider
              value={filters.displayThreshold}
              onChange={(_, value) => handleFilterChange('displayThreshold', value)}
              min={0}
              max={50}
              step={1}
              marks={[
                { value: 0, label: '0%' },
                { value: 25, label: '25%' },
                { value: 50, label: '50%' }
              ]}
              valueLabelDisplay="auto"
            />
          </Box>

          <Divider />

          {/* Performance Filters */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Performance Filters
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showOnlyPositive}
                    onChange={(e) => handleFilterChange('showOnlyPositive', e.target.checked)}
                    size="small"
                  />
                }
                label="Show only positive changes"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showOnlyNegative}
                    onChange={(e) => handleFilterChange('showOnlyNegative', e.target.checked)}
                    size="small"
                  />
                }
                label="Show only negative changes"
              />
            </Box>
          </Box>

          {/* Volatility Filter */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Volatility Filter
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.showOnlyHighVolatility}
                  onChange={(e) => handleFilterChange('showOnlyHighVolatility', e.target.checked)}
                  size="small"
                />
              }
              label="Show only high volatility"
            />
            {filters.showOnlyHighVolatility && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Threshold: {filters.volatilityThreshold}%
                </Typography>
                <Slider
                  value={filters.volatilityThreshold}
                  onChange={(_, value) => handleFilterChange('volatilityThreshold', value)}
                  min={10}
                  max={50}
                  step={5}
                  marks={[
                    { value: 10, label: '10%' },
                    { value: 30, label: '30%' },
                    { value: 50, label: '50%' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            )}
          </Box>

          {/* Results Summary */}
          <Box sx={{ 
            p: 1.5, 
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            borderRadius: 1,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}>
            <Typography variant="caption" color="primary" fontWeight={500}>
              Results: {filteredData.length} of {historicalData.length} records match filters
            </Typography>
          </Box>
        </Box>
      </Collapse>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Active Filters:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {filters.timePeriod !== 'all' && (
              <Chip 
                label={`Time: ${timePeriodOptions.find(t => t.value === filters.timePeriod)?.label}`}
                size="small"
                onDelete={() => handleFilterChange('timePeriod', 'all')}
              />
            )}
            {filters.metricType !== 'all' && (
              <Chip 
                label={`Metric: ${metricTypeOptions.find(m => m.value === filters.metricType)?.label}`}
                size="small"
                onDelete={() => handleFilterChange('metricType', 'all')}
              />
            )}
            {filters.displayThreshold > 0 && (
              <Chip 
                label={`Threshold: ${filters.displayThreshold}%`}
                size="small"
                onDelete={() => handleFilterChange('displayThreshold', 0)}
              />
            )}
            {filters.showOnlyPositive && (
              <Chip 
                label="Positive Only"
                size="small"
                color="success"
                onDelete={() => handleFilterChange('showOnlyPositive', false)}
              />
            )}
            {filters.showOnlyNegative && (
              <Chip 
                label="Negative Only"
                size="small"
                color="error"
                onDelete={() => handleFilterChange('showOnlyNegative', false)}
              />
            )}
            {filters.showOnlyHighVolatility && (
              <Chip 
                label={`High Volatility (${filters.volatilityThreshold}%+)`}
                size="small"
                color="warning"
                onDelete={() => handleFilterChange('showOnlyHighVolatility', false)}
              />
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default FilterPanel; 