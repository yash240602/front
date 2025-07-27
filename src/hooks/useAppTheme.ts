import { useState, useEffect, useCallback } from 'react';
import type { PaletteMode } from '@mui/material';

type ThemeName = 'default' | 'highContrast' | 'colorblind';

interface UseAppThemeReturn {
  themeName: ThemeName;
  themeMode: PaletteMode;
  setThemeName: (name: ThemeName) => void;
  toggleThemeMode: () => void;
}

export const useAppTheme = (): UseAppThemeReturn => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const savedTheme = localStorage.getItem('app-theme-name');
    return (savedTheme as ThemeName) || 'default';
  });
  
  const [themeMode, setThemeMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('app-theme-mode');
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      return savedMode;
    }
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('app-theme-name', themeName);
  }, [themeName]);

  useEffect(() => {
    localStorage.setItem('app-theme-mode', themeMode);
  }, [themeMode]);

  const toggleThemeMode = useCallback(() => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  return {
    themeName,
    themeMode,
    setThemeName,
    toggleThemeMode,
  };
};

export default useAppTheme; 