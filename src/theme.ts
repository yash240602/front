import { createTheme } from '@mui/material/styles';

// Define our own type instead of importing PaletteMode
type ThemeMode = 'light' | 'dark';

// Create a function that returns theme settings based on mode
const getDesignTokens = (mode: ThemeMode) => ({
  palette: {
    mode, // TypeScript will infer this is 'light' | 'dark'
    ...(mode === 'light'
      ? {
          primary: {
            main: '#1976d2',
          },
          background: {
            default: '#f5f5f5',
          },
        }
      : {
          primary: {
            main: '#90caf9',
          },
          background: {
            default: '#121212',
          },
        }),
  },
});

// Export the theme creation function
export const createAppTheme = (mode: ThemeMode) => {
  return createTheme(getDesignTokens(mode));
};