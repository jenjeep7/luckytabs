export type StatusType = 'poor' | 'decent' | 'excellent';

export const statusColors = {
  poor: '#FF3CAC',      // Hot pink/magenta to match your design
  decent: '#FFC107',    // Amber/orange
  excellent: '#00E676'  // Neon green
};

// Safe gradient text utility that always ensures text is visible
export const getSafeGradientText = (fallbackColor = '#7DF9FF') => ({
  color: fallbackColor, // Fallback color in case gradient fails
  background: 'linear-gradient(45deg, #7DF9FF 0%, #00E676 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  // Ensure text is visible if WebKit properties fail
  '@supports not (-webkit-background-clip: text)': {
    color: fallbackColor,
    WebkitTextFillColor: 'initial'
  },
  // Fallback for older browsers or rendering issues
  '@media screen and (-webkit-min-device-pixel-ratio: 0)': {
    '&:not([class*="gradient-supported"])': {
      color: fallbackColor,
      WebkitTextFillColor: 'initial'
    }
  }
});

// Neon header text style with safe gradient
export const getNeonHeaderStyle = (fallbackColor = '#7DF9FF') => ({
  fontWeight: 900,
  fontFamily: '"Orbitron", "Inter", sans-serif',
  ...getSafeGradientText(fallbackColor),
  textShadow: '0 0 20px rgba(125, 249, 255, 0.5)',
  letterSpacing: '0.1em'
});

export const getCardGlowStyles = (status: StatusType) => ({
  border: `3px solid ${statusColors[status]}`,
  borderRadius: 20,
  background: 'linear-gradient(180deg, rgba(18,20,24,.92), rgba(12,14,16,.92))',
  boxShadow: `
    0 0 32px ${statusColors[status]}66,
    0 8px 32px rgba(0,0,0,.6),
    inset 0 1px 0 ${statusColors[status]}22
  `,
  backdropFilter: 'blur(12px)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `
      0 0 48px ${statusColors[status]}88,
      0 16px 40px rgba(0,0,0,.7),
      inset 0 1px 0 ${statusColors[status]}33
    `,
    transition: 'all .3s ease'
  }
});

export const getEvTone = (status: StatusType): 'excellent' | 'decent' | 'poor' => {
  return status;
};
