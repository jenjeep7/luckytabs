import { Chip } from '@mui/material';

interface EvChipProps {
  label: string;
  tone?: 'excellent' | 'decent' | 'poor';
  size?: 'small' | 'medium';
}

export function EvChip({ label, tone = 'excellent', size = 'medium' }: EvChipProps) {
  const colors = {
    excellent: { bg: '#00E676', glow: 'rgba(0,230,118,.45)' },
    decent:    { bg: '#FFC107', glow: 'rgba(255,193,7,.35)' },
    poor:      { bg: '#FF4D4D', glow: 'rgba(255,77,77,.45)' },
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
