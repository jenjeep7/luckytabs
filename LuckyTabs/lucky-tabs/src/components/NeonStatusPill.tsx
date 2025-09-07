import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { StatusType, statusColors } from '../utils/neonUtils';

interface NeonStatusPillProps extends Omit<ChipProps, 'color'> {
  status: StatusType;
}

const NeonStatusPill: React.FC<NeonStatusPillProps> = ({ status, label, ...props }) => {
  const color = statusColors[status];
  
  return (
    <Chip
      label={label || status.toUpperCase()}
      {...props}
      sx={{
        fontWeight: 900,
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        height: 32,
        borderRadius: 16,
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        border: `2px solid ${color}`,
        color: color,
        boxShadow: `
          0 0 20px ${color}44,
          inset 0 1px 0 ${color}33
        `,
        backdropFilter: 'blur(8px)',
        '&:hover': {
          boxShadow: `
            0 0 30px ${color}66,
            inset 0 1px 0 ${color}44
          `,
          transform: 'translateY(-1px)',
        },
        transition: 'all 0.2s ease',
        ...props.sx,
      }}
    />
  );
};

export default NeonStatusPill;
