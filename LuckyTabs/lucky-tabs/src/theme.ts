import { createTheme, ThemeOptions } from '@mui/material/styles';

// Neon Gaming Bar Theme
const neonGamingTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7DF9FF' },       // electric cyan
    secondary: { main: '#FF3CAC' },     // hot pink
    success: { main: '#00E676' },       // neon green
    warning: { main: '#FFC107' },       // amber
    error:   { main: '#FF4D4D' },       // neon red
    background: {
      default: '#0C0E10',
      paper:   '#121418'
    },
    text: {
      primary: '#EAF6FF',
      secondary: '#A6B3C2',
    }
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: `'Inter', system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"`,
    h5: { fontWeight: 800, letterSpacing: .2 },
    button: { fontWeight: 700, letterSpacing: .3, textTransform: 'none' },
  },
  shadows: [
    'none',
    ...Array(24).fill('0 0 0 rgba(0,0,0,0.0)') as string[]
  ],
  components: {
    MuiCardContent: {
      styleOverrides: {
        root: {
          '&:last-child': {
            paddingBottom: '16px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(180deg, rgba(18,20,24,.85), rgba(12,14,16,.85))',
          border: '1px solid rgba(255,255,255,.08)',
          boxShadow: '0 0 0 1px rgba(124, 249, 255, 0.06), 0 12px 30px rgba(0,0,0,.45)',
          backdropFilter: 'blur(8px)',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 18,
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 800,
          letterSpacing: 0.3,
          paddingInline: 6,
          boxShadow: '0 0 22px rgba(255, 60, 172, .28)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 14,
          boxShadow: '0 8px 24px rgba(125,249,255,.15)',
        },
        contained: {
          background: 'linear-gradient(135deg, #6A5ACD 0%, #00D2FF 50%, #FF3CAC 100%)',
        },
        outlined: {
          borderColor: 'rgba(125,249,255,.5)',
          '&:hover': { 
            borderColor: '#7DF9FF', 
            boxShadow: '0 0 18px rgba(125,249,255,.35)' 
          }
        }
      }
    },
    MuiToggleButtonGroup: {
      styleOverrides: { 
        root: { 
          background: 'rgba(255,255,255,.06)', 
          borderRadius: 12, 
          padding: 4 
        } 
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          color: '#A6B3C2',
          borderRadius: 10,
          '&.Mui-selected': {
            color: '#0C0E10',
            background: 'linear-gradient(90deg, #7DF9FF, #FF3CAC)',
            boxShadow: '0 6px 18px rgba(255,60,172,.35)',
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(180deg, rgba(10,10,12,.85), rgba(10,10,12,.65))',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          backdropFilter: 'blur(10px)'
        }
      }
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(180deg, rgba(10,10,12,.1), rgba(10,10,12,.7))',
          borderTop: '1px solid rgba(255,255,255,.08)',
          backdropFilter: 'blur(10px)',
          '& .Mui-selected': {
            color: '#7DF9FF',
            textShadow: '0 0 12px rgba(125,249,255,.7)'
          },
          '& .MuiBottomNavigationAction-root': {
            transition: 'color .15s ease, transform .15s ease',
            '&:active': { 
              transform: 'translateY(1px) scale(.98)' 
            }
          }
        }
      }
    }
  }
});

// Legacy theme function for backward compatibility
export const getDesignTokens = (_mode: 'light' | 'dark'): ThemeOptions => {
  // Always return neon theme for now
  return neonGamingTheme;
};

// Export the neon theme as default
export default neonGamingTheme;
