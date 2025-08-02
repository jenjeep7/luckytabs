// theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#1a1a1a',
          },
          secondary: {
            main: '#e4ac00',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          text: {
            primary: '#1a1a1a',
            secondary: '#333333',
          },
          success: {
            main: '#1c741fff',
          }
        }
      : {
          primary: {
            main: '#1a1a1a',
          },
          secondary: {
            main: '#e4ac00',
          },
          background: {
            default: '#1d1d1d',
            paper: '#1d1d1d',
          },
          text: {
            primary: '#ffffff',
            secondary: '#bbbbbb',
          },
           success: {
            main: '#1c741fff',
          }
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});
