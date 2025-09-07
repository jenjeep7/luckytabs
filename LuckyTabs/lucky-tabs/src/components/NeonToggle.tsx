import React from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';

interface NeonToggleProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const NeonToggle: React.FC<NeonToggleProps> = ({ value, onChange, options }) => {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, newValue: string | null) => {
        if (newValue) {
          onChange(newValue);
        }
      }}
      sx={{
        background: 'rgba(18, 20, 24, 0.8)',
        border: '2px solid rgba(125, 249, 255, 0.3)',
        borderRadius: 6,
        padding: 0.5,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 0 20px rgba(125, 249, 255, 0.1)',
        '& .MuiToggleButton-root': {
          border: 'none',
          borderRadius: 4,
          color: '#A6B3C2',
          fontWeight: 700,
          letterSpacing: '0.05em',
          px: 3,
          py: 1.5,
          mx: 0.5,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(125, 249, 255, 0.1)',
            color: '#7DF9FF',
          },
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, #7DF9FF22, #00E67622)',
            border: '2px solid #7DF9FF',
            color: '#7DF9FF',
            boxShadow: '0 0 16px rgba(125, 249, 255, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7DF9FF33, #00E67633)',
              boxShadow: '0 0 24px rgba(125, 249, 255, 0.6)',
            },
          },
        },
      }}
    >
      {options.map((option) => (
        <ToggleButton key={option.value} value={option.value}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default NeonToggle;
