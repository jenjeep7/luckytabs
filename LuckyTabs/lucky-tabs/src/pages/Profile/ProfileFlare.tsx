import React from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Shared button styling
const flareButtonStyle = {
  minWidth: 64,
  fontWeight: 600,
  fontSize: 13,
  px: 1,
  py: 0.5
};

// Button configuration data
const flareButtons = [
  { text: 'Locations', color: 'primary' as const, onClick: '/play' },
  { text: 'Community', color: 'secondary' as const, onClick: '/community' },
  { text: 'Groups', color: 'success' as const, onClick: null },
  { text: 'Support', color: 'warning' as const, onClick: null },
  { text: 'Budget', color: 'info' as const, onClick: '/tracking' },
  { text: 'Learn Metrics', color: 'primary' as const, onClick: null },
  { text: 'Go Pro', color: 'success' as const, onClick: null },
  { text: '#5', color: 'primary' as const, onClick: null },
  { text: '#4', color: 'secondary' as const, onClick: null },
  { text: '#3', color: 'warning' as const, onClick: null },
];

export const ProfileFlare: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ 
      mb: 1, 
      display: 'flex', 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      gap: 2, 
      justifyContent: 'center', 
      alignItems: 'center', 
      bgcolor: 'background.paper', 
      borderRadius: 2, 
      boxShadow: 2, 
      py: 2 
    }}>
      {flareButtons.map((button, index) => (
        <Button
          key={index}
          variant="contained"
          color={button.color}
          size="small"
          sx={flareButtonStyle}
          onClick={button.onClick ? () => void navigate(button.onClick) : undefined}
        >
          {button.text}
        </Button>
      ))}
    </Box>
  );
};
