import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import { blue, green, red, grey, orange, purple } from '@mui/material/colors';
import { CSSProperties } from 'react';

declare module '@mui/material/styles' {
  interface Theme {
    customProps: {
      chart: ChartColors;
    };
  }
  interface ThemeOptions {
    customProps?: {
      chart: ChartColors;
    };
  }
}

const typography = {
  fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
  h1: { fontSize: '2.5rem', fontWeight: 700 },
  h2: { fontSize: '2rem', fontWeight: 600 },
  h3: { fontSize: '1.75rem', fontWeight: 600 },
  h4: { fontSize: '1.5rem', fontWeight: 500 },
  h5: { fontSize: '1.25rem', fontWeight: 500 },
  h6: { fontSize: '1rem', fontWeight: 500 },
  body1: { lineHeight: 1.6 },
  button: { fontWeight: 500, textTransform: 'none' as CSSProperties['textTransform'] },
};

const components = {
  MuiButton: { styleOverrides: { root: { borderRadius: 8 } } },
  MuiCard: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' } } },
  MuiChip: { styleOverrides: { root: { borderRadius: 6 } } },
};

type ChartColors = { positive: string; negative: string; neutral: string; line: string; grid: string; background: string; text: string; volume: string; };

export const createDefaultTheme = (mode: PaletteMode): Theme => {
  const isDark = mode === 'dark';
  const chartColors: ChartColors = isDark ? { positive: green[400], negative: red[400], neutral: blue[300], line: grey[300], grid: grey[800], background: '#121212', text: grey[300], volume: blue[700] } : { positive: green[600], negative: red[600], neutral: blue[600], line: grey[700], grid: grey[200], background: '#ffffff', text: grey[900], volume: blue[200] };
  return createTheme({ palette: { mode, primary: { main: blue[isDark ? 300 : 600] }, secondary: { main: purple[isDark ? 300 : 600] }, error: { main: red[isDark ? 300 : 600] }, success: { main: green[isDark ? 400 : 600] }, warning: { main: orange[isDark ? 300 : 700] }, background: { default: isDark ? '#121212' : '#f5f5f5', paper: isDark ? '#1e1e1e' : '#ffffff' }, text: { primary: isDark ? '#e0e0e0' : '#212121', secondary: isDark ? '#b0b0b0' : '#666666' } }, typography, components, customProps: { chart: chartColors } });
};

export const createHighContrastTheme = (mode: PaletteMode): Theme => {
  const isDark = mode === 'dark';
    const chartColors: ChartColors = isDark ? { positive: '#00FF00', negative: '#FF0000', neutral: '#FFFFFF', line: '#FFFFFF', grid: '#444444', background: '#000000', text: '#FFFFFF', volume: '#00AAFF' } : { positive: '#008800', negative: '#CC0000', neutral: '#000000', line: '#000000', grid: '#CCCCCC', background: '#FFFFFF', text: '#000000', volume: '#0055AA' };
    return createTheme({ palette: { mode, primary: { main: isDark ? '#FFFFFF' : '#000000' }, secondary: { main: isDark ? '#FFFF00' : '#6200EE' }, error: { main: '#FF0000' }, success: { main: '#00CC00' }, warning: { main: '#FF6600' }, background: { default: isDark ? '#000000' : '#FFFFFF', paper: isDark ? '#121212' : '#FFFFFF' }, text: { primary: isDark ? '#FFFFFF' : '#000000', secondary: isDark ? '#DDDDDD' : '#333333' } }, typography: { ...typography, button: { ...typography.button, fontWeight: 700 } }, components: { ...components, MuiButton: { styleOverrides: { root: { borderRadius: 4, fontWeight: 700, border: isDark ? '1px solid white' : '1px solid black' } } } }, customProps: { chart: chartColors } });
};

export const createColorblindFriendlyTheme = (mode: PaletteMode): Theme => {
  const isDark = mode === 'dark';
    const chartColors: ChartColors = isDark ? { positive: '#0072B2', negative: '#D55E00', neutral: '#F0E442', line: '#FFFFFF', grid: '#444444', background: '#121212', text: '#FFFFFF', volume: '#56B4E9' } : { positive: '#0072B2', negative: '#D55E00', neutral: '#CC79A7', line: '#000000', grid: '#DDDDDD', background: '#FFFFFF', text: '#000000', volume: '#56B4E9' };
    return createTheme({ palette: { mode, primary: { main: '#0072B2' }, secondary: { main: '#CC79A7' }, error: { main: '#D55E00' }, success: { main: '#009E73' }, warning: { main: '#F0E442' }, background: { default: isDark ? '#121212' : '#f5f5f5', paper: isDark ? '#1e1e1e' : '#ffffff' }, text: { primary: isDark ? '#e0e0e0' : '#212121', secondary: isDark ? '#b0b0b0' : '#666666' } }, typography, components, customProps: { chart: chartColors } });
};

export const defaultLightTheme = createDefaultTheme('light');
export const defaultDarkTheme = createDefaultTheme('dark');
export const highContrastLightTheme = createHighContrastTheme('light');
export const highContrastDarkTheme = createHighContrastTheme('dark');
export const colorblindLightTheme = createColorblindFriendlyTheme('light');
export const colorblindDarkTheme = createColorblindFriendlyTheme('dark');

export const getTheme = (themeName: string, mode: PaletteMode = 'light'): Theme => {
  switch (themeName) {
    case 'default': return mode === 'light' ? defaultLightTheme : defaultDarkTheme;
    case 'highContrast': return mode === 'light' ? highContrastLightTheme : highContrastDarkTheme;
    case 'colorblind': return mode === 'light' ? colorblindLightTheme : colorblindDarkTheme;
    default: return mode === 'light' ? defaultLightTheme : defaultDarkTheme;
  }
};
