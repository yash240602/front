import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  useTheme,
  alpha
} from '@mui/material';
import type { PaletteMode } from '@mui/material/styles';
import ThemeControls from './ThemeControls';

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
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Market Seasonality Explorer
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: alpha(theme.palette.common.white, 0.9),
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            Advanced Market Pattern Analysis
          </Typography>
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