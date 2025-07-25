import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import { getTheme } from './utils/theme';
import useAppTheme from './hooks/useAppTheme';
import AppHeader from './components/common/AppHeader';
import InstrumentPicker from './components/dashboard/InstrumentPicker';
import SeasonalityCalendar from './components/calendar/SeasonalityCalendar';
import MetricsPanel from './components/dashboard/MetricsPanel';

const App = () => {
  const { themeName, themeMode, setThemeName, toggleThemeMode } = useAppTheme();
  const theme = getTheme(themeName, themeMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <AppHeader 
          themeName={themeName}
          themeMode={themeMode}
          onThemeNameChange={setThemeName}
          onThemeModeToggle={toggleThemeMode}
        />
        
        <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
          <InstrumentPicker />
          <SeasonalityCalendar />
        </Container>
        
        <MetricsPanel />
        
        <Box component="footer" sx={{ py: 2, textAlign: 'center' }}>
          Market Seasonality Explorer &copy; {new Date().getFullYear()}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App; 