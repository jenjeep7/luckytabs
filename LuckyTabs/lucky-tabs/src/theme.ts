import { createTheme, ThemeOptions } from '@mui/material/styles';

// Neon Gaming Theme Utilities
const neonColors = {
  cyan: '#7DF9FF',
  pink: '#FF3CAC',
  green: '#00E676',
  amber: '#FFC107',
  red: '#FF4D4D',
  purple: '#6A5ACD',
  text: {
    primary: '#EAF6FF',
    secondary: '#A6B3C2',
    dark: '#0C0E10'
  }
};

// Reusable neon effect mixins
const neonEffects = {
  // Text glow effects
  textGlow: (color: string, intensity = 0.4) => ({
    textShadow: `0 0 15px rgba(${hexToRgb(color)}, ${intensity})`
  }),
  
  // Box glow effects
  boxGlow: (color: string, intensity = 0.4) => ({
    boxShadow: `0 0 16px rgba(${hexToRgb(color)}, ${intensity})`
  }),
  
  // Neon border
  neonBorder: (color: string, intensity = 0.3) => ({
    border: `1px solid rgba(${hexToRgb(color)}, ${intensity})`
  }),
  
  // Gaming background gradients
  gamingBackground: (opacity = 0.95) => ({
    background: `
      radial-gradient(800px 400px at 90% -10%, rgba(255,60,172,.15), transparent 70%),
      radial-gradient(600px 300px at 10% 110%, rgba(125,249,255,.12), transparent 65%),
      linear-gradient(180deg, rgba(11,12,16,${opacity}), rgba(10,11,14,${opacity + 0.03}))
    `
  }),
  
  // Interactive hover effects
  hoverTransform: {
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
    }
  },
  
  // Neon divider line
  neonDivider: (color: string = neonColors.cyan) => ({
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60%',
      height: '2px',
      background: `linear-gradient(90deg, transparent, ${color}66, transparent)`,
      boxShadow: `0 0 8px rgba(${hexToRgb(color)}, 0.4)`
    }
  }),
  
  // Social media icon styling
  socialIcon: (baseColor: string = neonColors.text.secondary) => ({
    color: baseColor,
    border: `1px solid rgba(${hexToRgb(neonColors.cyan)}, 0.3)`,
    borderRadius: 2,
    transition: 'all 0.3s ease',
    p: 1
  }),
  
  // Social media hover effect
  socialIconHover: (brandColor: string) => ({
    '&:hover': {
      color: brandColor,
      borderColor: brandColor,
      boxShadow: `0 0 16px rgba(${hexToRgb(brandColor)}, 0.4)`,
      transform: 'translateY(-2px)'
    }
  }),
  
  // Interactive icon button with neon cyan styling
  interactiveIcon: (color: string = neonColors.cyan) => ({
    color: color,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: `rgba(${hexToRgb(color)}, 0.1)`,
      boxShadow: `0 0 8px rgba(${hexToRgb(color)}, 0.3)`
    }
  })
};

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '255, 255, 255';
}

// Declare module to extend theme with custom properties
declare module '@mui/material/styles' {
  interface Theme {
    neon: {
      colors: typeof neonColors;
      effects: typeof neonEffects;
    };
  }
  interface ThemeOptions {
    neon?: {
      colors?: typeof neonColors;
      effects?: typeof neonEffects;
    };
  }
}

// Neon Gaming Bar Theme
const neonGamingTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: neonColors.cyan },
    secondary: { main: neonColors.pink },
    success: { main: neonColors.green },
    warning: { main: neonColors.amber },
    error: { main: neonColors.red },
    background: {
      default: '#0C0E10',
      paper: '#121418'
    },
    text: {
      primary: neonColors.text.primary,
      secondary: neonColors.text.secondary,
    }
  },
  neon: {
    colors: neonColors,
    effects: neonEffects
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: `'Inter', system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"`,
    h5: { fontWeight: 800, letterSpacing: .2 },
    button: { fontWeight: 700, letterSpacing: .3, textTransform: 'none' },
  },
  shadows: Array(25).fill('none') as [
    "none", "none", "none", "none", "none", "none", "none", "none", 
    "none", "none", "none", "none", "none", "none", "none", "none", 
    "none", "none", "none", "none", "none", "none", "none", "none", "none"
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
