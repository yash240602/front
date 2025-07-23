import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import { getTheme } from './utils/theme';
import useAppTheme from './hooks/useAppTheme';
import AppHeader from './components/common/AppHeader';
import InstrumentPicker from './components/dashboard/InstrumentPicker';
import SeasonalityCalendar from './components/calendar/SeasonalityCalendar';
import MetricsPanel from './components/dashboard/MetricsPanel';
import ErrorBoundary from './components/common/ErrorBoundary';

const App = () => {
  const { themeName, themeMode, setThemeName, toggleThemeMode } = useAppTheme();
  const theme = getTheme(themeName, themeMode);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
            transition: 'background-color 0.3s ease-in-out',
          }}
        >
          <AppHeader 
            themeName={themeName}
            themeMode={themeMode}
            onThemeNameChange={setThemeName}
            onThemeModeToggle={toggleThemeMode}
          />
          
          <Container component="main" sx={{ flexGrow: 1, py: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column' }}>
            <InstrumentPicker />
            <SeasonalityCalendar />
          </Container>
          
          {/* The MetricsPanel is now included and will be controlled by its internal state */}
          <MetricsPanel />
          
          <Box component="footer" sx={{ py: 2, textAlign: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
            Market Seasonality Explorer &copy; {new Date().getFullYear()}
          </Box>
        </Box>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
