import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Container, alpha } from '@mui/material';
import { getTheme } from './utils/theme';
import useAppTheme from './hooks/useAppTheme';
import AppHeader from './components/common/AppHeader';
import InstrumentPicker from './components/dashboard/InstrumentPicker';
import SeasonalityCalendar from './components/calendar/SeasonalityCalendar';
import MetricsPanel from './components/dashboard/MetricsPanel';
import ErrorBoundary from './components/common/ErrorBoundary';
import CommandPalette from './components/common/CommandPalette';

const App = () => {
  const { themeName, themeMode, setThemeName, toggleThemeMode } = useAppTheme();
  const theme = getTheme(themeName, themeMode);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Add keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AppHeader 
            themeName={themeName}
            themeMode={themeMode}
            onThemeNameChange={setThemeName}
            onThemeModeToggle={toggleThemeMode}
          />
          
          <Container component="main" sx={{ flexGrow: 1, py: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box 
              sx={{
                p: 3,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)'
              }}
            >
              <InstrumentPicker />
            </Box>
            <SeasonalityCalendar />
          </Container>
          
          <MetricsPanel />
          
          <Box component="footer" sx={{ py: 2, textAlign: 'center', color: 'white', fontSize: '0.875rem', textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}>
            Market Seasonality Explorer &copy; {new Date().getFullYear()}
          </Box>
        </Box>

        {/* Command Palette */}
        <CommandPalette 
          open={commandPaletteOpen} 
          onClose={() => setCommandPaletteOpen(false)} 
        />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App; 