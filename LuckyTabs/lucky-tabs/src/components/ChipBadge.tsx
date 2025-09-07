import React from 'react';
import { Box, Typography } from '@mui/material';

interface ChipBadgeProps {
  variant: 'excellent' | 'decent' | 'poor';
  text: string;
}

export function ChipBadge({ variant, text }: ChipBadgeProps) {
  const src = `/assets/ui/chips/chip-${variant}.svg`;
  
  return (
    <Box sx={{ position: 'relative', width: 88, height: 88 }}>
      <img 
        src={src} 
        alt="" 
        width={88} 
        height={88} 
        style={{ display: 'block' }} 
      />
      <Typography
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          fontWeight: 900,
          fontSize: 14,
          textAlign: 'center',
          color: '#0C0E10',
          textShadow: '0 1px 0 rgba(255,255,255,.55)'
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
