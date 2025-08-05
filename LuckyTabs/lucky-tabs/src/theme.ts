import { ThemeOptions } from '@mui/material/styles';

export const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#1a1a1a',
          },
          secondary: {
            main: '#f81da8ff',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
            contrast: '#1a1a1a',
          },
          text: {
            primary: '#1a1a1a',
            secondary: '#333333',
            contrast: '#ffffff',
            light: '#ffffff'
          },
          success: {
            main: '#03fd0bff',
          },
          brand: {
            main: '#0169c5',
            dark: '#e64a19',
            light: '#ff8a65',
            contrastText: '#ffffff',
          }
        }
      : {
          primary: {
            main: '#1a1a1a',
          },
          secondary: {
            main: '#f81da8ff',
          },
          background: {
            default: '#1d1d1d',
            paper: '#1d1d1d',
            contrast: '#ffffff',
          },
          text: {
            primary: '#ffffff',
            secondary: '#bbbbbb',
            contrast: '#1d1d1d',
            light: '#ffffff'
          },
           success: {
            main: '#03fd0bff',
          },
          brand: {
            main: '#0169c5',
            dark: '#e64a19',
            light: '#ff8a65',
            contrastText: '#ffffff',
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
    
