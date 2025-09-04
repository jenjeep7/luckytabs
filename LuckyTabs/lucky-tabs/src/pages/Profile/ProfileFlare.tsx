import React from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const ProfileFlare: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ 
      mb: 3, 
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
      <Button
        variant="contained"
        color="primary"
        size="small"
        sx={{ minWidth: 64, fontWeight: 600, fontSize: 13, px: 1, py: 0.5 }}
        onClick={() => void navigate('/play')}
      >
        Locations
      </Button>
      <Button 
        variant="contained" 
        color="secondary" 
        size="small" 
        sx={{ minWidth: 64, fontWeight: 600, fontSize: 13, px: 1, py: 0.5 }} 
        onClick={() => void navigate('/community')}
      >
        Community
      </Button>
      <Button 
        variant="contained" 
        color="success" 
        size="small" 
        sx={{ minWidth: 64, fontWeight: 600, fontSize: 13, px: 1, py: 0.5 }}
      >
        Groups
      </Button>
      <Button 
        variant="contained" 
        color="warning" 
        size="small" 
        sx={{ minWidth: 64, fontWeight: 600, fontSize: 13, px: 1, py: 0.5 }}
      >
        Support
      </Button>
      <Button 
        variant="contained" 
        color="info" 
        size="small" 
        sx={{ minWidth: 64, fontWeight: 600, fontSize: 13, px: 1, py: 0.5 }}
        onClick={() => void navigate('/tracking')}
      >
        Budget
      </Button>
      <Button 
        variant="contained" 
        color="primary" 
        size="small" 
        sx={{ minWidth: 64, fontWeight: 600, fontSize: 13, px: 1, py: 0.5 }}
      >
        Learn Metrics
      </Button>
      <Button 
        variant="contained" 
        color="success" 
        size="small" 
        sx={{ minWidth: 64, fontWeight: 600, fontSize: 13, px: 1, py: 0.5 }}
      >
        Go Pro
      </Button>
    </Box>
  );
};
