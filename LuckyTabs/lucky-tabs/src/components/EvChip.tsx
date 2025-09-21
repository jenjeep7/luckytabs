import { Chip, useTheme } from '@mui/material';

interface EvChipProps {
  label: string;
  tone?: 'good' | 'decent' | 'poor';
  size?: 'small' | 'medium';
}

export function EvChip({ label, tone = 'good', size = 'medium' }: EvChipProps) {
  const theme = useTheme();
  
  const colors = {
    good: { bg: theme.neon.colors.cyan, glow: 'rgba(125,249,255,.45)' },
    decent:    { bg: theme.neon.colors.amber, glow: 'rgba(255,193,7,.35)' },
    poor:      { bg: theme.neon.colors.pink, glow: 'rgba(255,60,172,.45)' },
  }[tone];

  return (
    <Chip
      label={label}
      size={size}
      sx={{
        position: 'relative',
        px: 1.5,
        py: .5,
        fontWeight: 900,
        color: '#0C0E10',
        background: colors.bg,
        borderRadius: '999px',
        boxShadow: `0 0 0 2px rgba(255,255,255,.35) inset, 0 0 24px ${colors.glow}`,
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: '999px',
          background:
            'repeating-conic-gradient(from 0deg, rgba(0,0,0,.12) 0 10deg, transparent 10deg 20deg)',
          WebkitMask: 'radial-gradient(circle at center, transparent 40%, black 41%)',
          mask: 'radial-gradient(circle at center, transparent 40%, black 41%)',
          opacity: .35,
          pointerEvents: 'none'
        }
      }}
    />
  );
}
