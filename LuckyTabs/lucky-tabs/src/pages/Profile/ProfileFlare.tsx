import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GetAppDialog } from '../../components/GetAppDialog';
import { FeedbackDialog } from '../../components/FeedbackDialog';

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
  { text: 'Log a Box', onClick: '/play' },
  { text: 'Social', onClick: '/community' },
  { text: 'My Crews', onClick: '/community?tab=2' },
  { text: 'Add To Phone', onClick: 'getApp' },
  { text: 'Feedback', onClick: 'feedback' },
  { text: 'Wins/Losses', onClick: '/tracking' },
  { text: 'Responsible Playing', onClick: '/responsible-gaming' },
  { text: 'Go Pro', onClick: null },
  { text: 'Local Non-Profits', onClick: null },
  { text: 'Gaming Commissions', onClick: null },
];

export const ProfileFlare: React.FC = () => {
  const navigate = useNavigate();
  const [getAppDialogOpen, setGetAppDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  
  const handleButtonClick = (onClick: string | null) => {
    if (!onClick) return;
    
    if (onClick === 'getApp') {
      // Handle Get App dialog
      setGetAppDialogOpen(true);
    } else if (onClick === 'feedback') {
      // Handle Feedback dialog
      setFeedbackDialogOpen(true);
    } else if (onClick.startsWith('mailto:')) {
      // Handle email links
      window.location.href = onClick;
    } else if (onClick.startsWith('http') || onClick.includes('#')) {
      // Handle external links or anchor links
      window.location.href = onClick;
    } else {
      // Handle internal navigation
      void navigate(onClick);
    }
  };
  
  return (
    <>
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
            size="small"
            sx={flareButtonStyle}
            onClick={button.onClick ? () => handleButtonClick(button.onClick) : undefined}
          >
            {button.text}
          </Button>
        ))}
      </Box>
      
      <GetAppDialog 
        open={getAppDialogOpen} 
        onClose={() => setGetAppDialogOpen(false)} 
      />
      
      <FeedbackDialog 
        open={feedbackDialogOpen} 
        onClose={() => setFeedbackDialogOpen(false)} 
      />
    </>
  );
};
