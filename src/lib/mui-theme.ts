'use client';

import { createTheme } from '@mui/material/styles';

// Gradient Brand Colors (from logo)
const brandColors = {
  blue: '#4D9FFF',
  purple: '#8C5EFF',
  pink: '#FF4FD8',
  orange: '#FF9364',
  white: '#FFFFFF',
  darkBg: '#121212',
  lightBg: '#F8F9FA',
  textLight: '#222222',
  textDark: '#EDEDED',
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.blue, // Blue from gradient
      light: '#7DB9FF',
      dark: '#2D7FFF',
      contrastText: brandColors.white,
    },
    secondary: {
      main: brandColors.purple, // Purple from gradient
      light: '#A87EFF',
      dark: '#6C3EFF',
      contrastText: brandColors.white,
    },
    error: {
      main: brandColors.pink, // Pink from gradient
      light: '#FF7FE6',
      dark: '#FF1FCA',
    },
    warning: {
      main: brandColors.orange, // Orange from gradient
      light: '#FFB394',
      dark: '#FF7344',
    },
    info: {
      main: brandColors.blue,
      light: '#7DB9FF',
      dark: '#2D7FFF',
    },
    success: {
      main: '#10B981', // Green for success states
      light: '#34D399',
      dark: '#059669',
    },
    background: {
      default: brandColors.lightBg,
      paper: brandColors.white,
    },
    text: {
      primary: brandColors.textLight,
      secondary: '#64748B',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 600,
    },
    h4: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16, // Rounded corners matching our design
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(77, 121, 255, 0.3)',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(77, 121, 255, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 24,
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
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
    error: {
      main: brandColors.pink,
      light: '#FF7FE6',
      dark: '#FF1FCA',
    },
    warning: {
      main: brandColors.orange,
      light: '#FFB394',
      dark: '#FF7344',
    },
    info: {
      main: brandColors.blue,
      light: '#7DB9FF',
      dark: '#2D7FFF',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    background: {
      default: brandColors.darkBg,
      paper: '#1E1E1E',
    },
    text: {
      primary: brandColors.textDark,
      secondary: '#94A3B8',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 600,
    },
    h4: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(77, 121, 255, 0.4)',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(77, 121, 255, 0.5)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          backgroundImage: 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 24,
        },
      },
    },
  },
});
