import { ThemeOptions } from '@mui/material/styles';

export const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#000000ff',
            light: '#f9f9f9',
            contrastText: '#ffffff', // White text on black buttons
          },
          secondary: {
            main: '#e140a1ff',
            contrastText: '#ffffff', // White text on pink buttons
          },
          background: {
            default: '#f9f9fb',
            paper: '#ffffff',
          },
          text: {
            primary: '#1a1a1a',
            secondary: '#555555',
          },
          success: {
            main: '#4CAF50',
          },
        }
      : {
          primary: {
            main: '#ffffff', // White primary for dark mode
            light: '#f5f5f5',
            contrastText: '#000000', // Black text on white buttons in dark mode
          },
          secondary: {
            main: '#e140a1ff',
            contrastText: '#ffffff', // White text on pink buttons
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ffffff',
            secondary: '#aaaaaa',
          },
          success: {
            main: '#81C784',
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.4rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    button: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        contained: ({ theme, ownerState }) => ({
          ...(theme.palette.mode === 'dark' && ownerState.color === 'primary' && {
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
            border: '1px solid #ffffff',
            '&:hover': {
              backgroundColor: '#2a2a2a',
              borderColor: '#ffffff',
            },
            '&:active': {
              backgroundColor: '#333333',
            }
          })
        }),
        outlined: ({ theme, ownerState }) => ({
          ...(theme.palette.mode === 'dark' && ownerState.color === 'primary' && {
            borderColor: '#ffffff',
            color: '#ffffff',
            '&:hover': {
              borderColor: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          })
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // remove elevation background
        },
      },
    },
  },
});
