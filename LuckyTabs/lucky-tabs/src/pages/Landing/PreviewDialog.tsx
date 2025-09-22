import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Close as CloseIcon, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
}

export const PreviewDialog: React.FC<PreviewDialogProps> = ({ open, onClose }) => {
  const screenshots = [
    '/screenshots/Profile.png',
    '/screenshots/boxes.png',
    '/screenshots/box.png',
    '/screenshots/Community.png',
  ];
  const titles = [
    'Profile Page',
    'Track Your Boxes',
    'Box Details',
    'Community Page',
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      handlePrev();
    } else if (event.key === 'ArrowRight') {
      handleNext();
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          margin: 0,
        }
      }}
      onKeyDown={handleKeyDown}
    >
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Image navigation */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}>
          {/* Previous button */}
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              left: 16,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
              zIndex: 1,
            }}
          >
            <ArrowBackIos />
          </IconButton>

          {/* Image */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            px: { xs: 8, sm: 12 },
          }}>
            <Box sx={{
              maxWidth: { xs: '90%', sm: '400px', md: '500px' },
              maxHeight: { xs: '70%', sm: '80%' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src={screenshots[currentIndex]}
                alt={titles[currentIndex]}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                }}
              />
            </Box>
            
            {/* Title and navigation dots */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'white', 
                  mb: 2,
                  fontWeight: 600 
                }}
              >
                {titles[currentIndex]}
              </Typography>
              
              {/* Dots indicator */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                {screenshots.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.6)',
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Next button */}
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 16,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
              zIndex: 1,
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;