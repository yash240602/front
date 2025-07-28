import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import { 
  CurrencyBitcoin as CurrencyBitcoinIcon,
  Palette as PaletteIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import type { PaletteMode } from '@mui/material/styles';
import ThemeControls from './ThemeControls';
import { useMarketDataStore } from '../../store/marketDataStore';

interface AppHeaderProps {
  themeName: string;
  themeMode: PaletteMode;
  onThemeNameChange: (name: 'default' | 'highContrast' | 'colorblind') => void;
  onThemeModeToggle: () => void;
}

const AppHeader = ({
  themeName,
  themeMode,
  onThemeNameChange,
  onThemeModeToggle
}: AppHeaderProps) => {
  const theme = useTheme();
  const { instrument, historicalData } = useMarketDataStore();
  
  const formatThemeName = (name: string, mode: PaletteMode) => {
    const themeNames = {
      'default': 'Default',
      'highContrast': 'High Contrast',
      'colorblind': 'Colorblind'
    };
    return `${themeNames[name as keyof typeof themeNames] || 'Default'} • ${mode === 'light' ? 'Light' : 'Dark'}`;
  };

  const getDataRange = () => {
    if (historicalData.length === 0) return 'No Data';
    const dates = historicalData.map(d => new Date(d.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    return `${minDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${maxDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };
  
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.95)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.85)} 100%)`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 2 }}>
        <Box>
        <Typography 
            variant="h5" 
          component="h1" 
          sx={{ 
              fontWeight: 800,
              color: theme.palette.common.white,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              mb: 0.5
          }}
        >
          Market Seasonality Explorer
        </Typography>
        
          {/* Informative Chips */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip
              icon={<CurrencyBitcoinIcon />}
              label={instrument}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                color: theme.palette.common.white,
                fontSize: '0.7rem',
                height: '24px',
                '& .MuiChip-icon': { color: 'inherit', fontSize: '0.9rem' }
              }}
            />
            <Chip
              icon={<PaletteIcon />}
              label={formatThemeName(themeName, themeMode)}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                color: theme.palette.common.white,
                fontSize: '0.7rem',
                height: '24px',
                '& .MuiChip-icon': { color: 'inherit', fontSize: '0.9rem' }
              }}
            />
            <Chip
              icon={<DateRangeIcon />}
              label={getDataRange()}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                color: theme.palette.common.white,
                fontSize: '0.7rem',
                height: '24px',
                '& .MuiChip-icon': { color: 'inherit', fontSize: '0.9rem' }
              }}
            />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ThemeControls
            themeName={themeName}
            themeMode={themeMode}
            onThemeNameChange={onThemeNameChange}
            onThemeModeToggle={onThemeModeToggle}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader; 