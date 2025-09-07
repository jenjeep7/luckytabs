export type StatusType = 'poor' | 'decent' | 'excellent';

export const statusColors = {
  poor: '#FF3CAC',      // Hot pink/magenta to match your design
  decent: '#FFC107',    // Amber/orange
  excellent: '#00E676'  // Neon green
};

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
