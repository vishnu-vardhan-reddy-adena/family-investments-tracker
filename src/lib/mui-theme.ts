'use client';

import { createTheme } from '@mui/material/styles';

// Gen Z Color Palette
const genZColors = {
  electricBlue: '#4D79FF',
  vibrantTeal: '#1DD1A1',
  coralPink: '#FF6B6B',
  sunnyYellow: '#FFD93D',
  softWhite: '#F7F9FC',
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: genZColors.electricBlue, // Electric Blue
      light: '#7A9AFF',
      dark: '#2656FF',
      contrastText: '#ffffff',
    },
    secondary: {
      main: genZColors.vibrantTeal, // Vibrant Teal
      light: '#4EDDB7',
      dark: '#17B890',
      contrastText: '#ffffff',
    },
    error: {
      main: genZColors.coralPink, // Coral Pink
      light: '#FF9191',
      dark: '#FF4545',
    },
    warning: {
      main: genZColors.sunnyYellow, // Sunny Yellow
      light: '#FFE066',
      dark: '#FFC700',
    },
    info: {
      main: genZColors.electricBlue,
      light: '#7A9AFF',
      dark: '#2656FF',
    },
    success: {
      main: genZColors.vibrantTeal,
      light: '#4EDDB7',
      dark: '#17B890',
    },
    background: {
      default: genZColors.softWhite,
      paper: '#ffffff',
    },
    text: {
      primary: '#2D3748',
      secondary: '#718096',
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
      main: genZColors.electricBlue,
      light: '#7A9AFF',
      dark: '#2656FF',
      contrastText: '#ffffff',
    },
    secondary: {
      main: genZColors.vibrantTeal,
      light: '#4EDDB7',
      dark: '#17B890',
      contrastText: '#ffffff',
    },
    error: {
      main: genZColors.coralPink,
      light: '#FF9191',
      dark: '#FF4545',
    },
    warning: {
      main: genZColors.sunnyYellow,
      light: '#FFE066',
      dark: '#FFC700',
    },
    info: {
      main: genZColors.electricBlue,
      light: '#7A9AFF',
      dark: '#2656FF',
    },
    success: {
      main: genZColors.vibrantTeal,
      light: '#4EDDB7',
      dark: '#17B890',
    },
    background: {
      default: '#0F1419',
      paper: '#1A1F2E',
    },
    text: {
      primary: '#F7FAFC',
      secondary: '#A0AEC0',
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
