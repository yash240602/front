import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  useTheme,
  alpha,
  PaletteMode
} from '@mui/material';
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
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component="h1" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          Market Seasonality Explorer
        </Typography>
        
        <Box>
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