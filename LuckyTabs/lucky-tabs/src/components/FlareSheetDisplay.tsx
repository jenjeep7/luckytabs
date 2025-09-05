import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';

interface FlareSheetDisplayProps {
  imageUrl: string;
  boxName: string;
  size?: 'small' | 'medium' | 'large';
}

const FlareSheetDisplay: React.FC<FlareSheetDisplayProps> = ({ 
  imageUrl, 
  boxName, 
  size = 'medium' 
}) => {
  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return { width: 150, height: 100 };
      case 'large':
        return { width: 400, height: 300 };
      default: // medium
        return { width: 250, height: 200 };
    }
  };

  const { width, height } = getSizeProps();

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{ 
          width, 
          height,
          position: 'relative'
        }}
      >
        <img
          src={imageUrl}
          alt={`Flare sheet for ${boxName}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </Box>
      
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ mt: 1, display: 'block', textAlign: 'center' }}
      >
        Flare Sheet
      </Typography>
    </Box>
  );
};

export default FlareSheetDisplay;
