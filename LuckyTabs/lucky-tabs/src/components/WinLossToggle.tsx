import * as React from 'react';
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export type WinLossValue = 'win' | 'loss';

interface Props {
  value: WinLossValue | null;
  onChange: (next: WinLossValue) => void;
  fullWidth?: boolean;
}

export default function WinLossToggle({ value = 'win', onChange, fullWidth }: Props) {
  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto', display: 'flex' }}>
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={(_, v: WinLossValue | null) => v && onChange(v)}
        aria-label="Win or loss selection"
        sx={{
          width: '100%',
          display: 'flex',
          gap: 1,
          backgroundColor: 'transparent',
          border: 'none',
          
          '& .MuiToggleButtonGroup-grouped': {
            flex: 1,
            border: '2px solid',
            borderRadius: 3,
            mx: 0,
            py: 1,
            px: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all 0.2s ease-in-out',
            
            // Completely override ALL Material-UI backgrounds
            '&.MuiToggleButton-root': {
              backgroundColor: 'transparent !important',
              backgroundImage: 'none !important',
            },
            '&.Mui-selected': {
              backgroundColor: 'transparent !important',
              backgroundImage: 'none !important',
            },
            '&.Mui-selected:hover': {
              backgroundColor: 'transparent !important',
              backgroundImage: 'none !important',
            },
            '&:hover': {
              backgroundColor: 'transparent !important',
              backgroundImage: 'none !important',
            },
            '&:focus': {
              backgroundColor: 'transparent !important',
              backgroundImage: 'none !important',
            },
            '&:active': {
              backgroundColor: 'transparent !important',
              backgroundImage: 'none !important',
            },
            
            // Win button styling
            '&[value="win"]': {
              borderColor: value === 'win' ? '#00C853' : 'rgba(0, 200, 83, 0.3)',
              color: value === 'win' ? '#fff !important' : '#00C853 !important',
              backgroundColor: value === 'win' ? 'rgba(0, 200, 83, 0.5) !important' : 'transparent !important',
              backgroundImage: 'none !important',
              boxShadow: value === 'win' ? '0 0 15px rgba(0, 200, 83, 0.3)' : 'none',
              '&:hover': {
                borderColor: '#00C853',
                backgroundColor: value === 'win' ? 'rgba(0, 168, 67, 0.5) !important' : 'transparent !important',
                backgroundImage: 'none !important',
              },
            },
            
            // Loss button styling  
            '&[value="loss"]': {
              borderColor: value === 'loss' ? '#F44336' : 'rgba(244, 67, 54, 0.3)',
              color: value === 'loss' ? '#fff !important' : '#F44336 !important',
              backgroundColor: value === 'loss' ? 'rgba(244, 67, 54, 0.5) !important' : 'transparent !important',
              backgroundImage: 'none !important',
              boxShadow: value === 'loss' ? '0 0 15px rgba(244, 67, 54, 0.3)' : 'none',
              '&:hover': {
                borderColor: '#F44336',
                backgroundColor: value === 'loss' ? 'rgba(211, 47, 47, 0.5) !important' : 'transparent !important',
                backgroundImage: 'none !important',
              },
            },
            
            // Icons
            '& .MuiSvgIcon-root': {
              fontSize: 18,
              marginRight: 0.5,
            },
          },
        }}
      >
        <ToggleButton value="win" data-kind="win" disableRipple>
          <TrendingUpIcon />
          Won
        </ToggleButton>
        <ToggleButton value="loss" data-kind="loss" disableRipple>
          <TrendingDownIcon />
          Lost
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
