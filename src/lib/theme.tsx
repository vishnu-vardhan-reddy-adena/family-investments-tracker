import {
  createTheme,
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
  PaletteMode,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

const brandColors = {
  blue: '#4D9FFF',
  purple: '#8C5EFF',
  pink: '#FF4FD8',
  orange: '#FF9364',
  white: '#FFFFFF',
  darkBg: '#121212',
  lightBg: '#FFFFFF',
  textLight: '#222222',
  textDark: '#EDEDED',
};

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: brandColors.blue,
        light: '#7DB9FF',
        dark: '#2D7FFF',
        contrastText: brandColors.white,
      },
      secondary: {
        main: brandColors.purple,
        light: '#A87EFF',
        dark: '#6C3EFF',
        contrastText: brandColors.white,
      },
      background: {
        default: isDark ? brandColors.darkBg : brandColors.lightBg,
        paper: isDark ? '#1E1E1E' : brandColors.white,
      },
      text: {
        primary: isDark ? brandColors.textDark : brandColors.textLight,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 14,
          },
        },
      },
    },
  });
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(() => {
    try {
      const saved = localStorage.getItem('theme');
      return (
        (saved as PaletteMode) ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light')
      );
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      localStorage.setItem('theme', mode);
    } catch {}
  }, [mode]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export function useThemeMode() {
  const [mode, setMode] = useState<PaletteMode>(() => {
    try {
      const saved = localStorage.getItem('theme');
      return (saved as PaletteMode) || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme', mode);
      const root = document.documentElement;
      if (mode === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    } catch {}
  }, [mode]);

  return { mode, setMode } as const;
}
