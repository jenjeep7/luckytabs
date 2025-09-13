import React from 'react';
import { Box, Typography } from '@mui/material';
import { getNeonHeaderStyle, getCardGlowStyles } from '../../utils/neonUtils';

export const AchievementBanner: React.FC = () => {
  return (
    <Box 
      sx={{
        ...getCardGlowStyles('poor'),
        mb: 2,
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(18,20,24,0.95) 0%, rgba(12,14,16,0.98) 100%)',
      }}
    >
      {/* Animated background effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 30%, rgba(125, 249, 255, 0.03) 50%, transparent 70%)',
          animation: 'shimmer 3s ease-in-out infinite',
          '@keyframes shimmer': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' }
          }
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            ...getNeonHeaderStyle('#7DF9FF'),
            textAlign: 'center',
            mb: 2,
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          Achievements
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2, 
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Placeholder achievement badges */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2,
            border: '2px solid #00e649ff',
            background: 'rgba(0, 230, 118, 0.1)',
            boxShadow: '0 0 15px rgba(0, 230, 118, 0.3)'
          }}>
            <Typography sx={{ fontSize: '.85rem' }}>🏆</Typography>
            {/* <Typography variant="body2" sx={{ color: '#00E676', fontWeight: 600 }}>
              First Win
            </Typography> */}
          </Box>
          
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2,
            border: '2px solid #7DF9FF',
            background: 'rgba(125, 249, 255, 0.1)',
            boxShadow: '0 0 15px rgba(125, 249, 255, 0.3)'
          }}>
            <Typography sx={{ fontSize: '.85rem' }}>📦</Typography>
            {/* <Typography variant="body2" sx={{ color: '#7DF9FF', fontWeight: 600 }}>
              10 Boxes Added
            </Typography> */}
          </Box>
          
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2,
            border: '2px solid #FFC107',
            background: 'rgba(255, 193, 7, 0.1)',
            boxShadow: '0 0 15px rgba(255, 193, 7, 0.3)'
          }}>
            <Typography sx={{ fontSize: '.85rem' }}>⚡</Typography>
            {/* <Typography variant="body2" sx={{ color: '#FFC107', fontWeight: 600 }}>
              Power User
            </Typography> */}
          </Box>
          
          {/* Coming Soon badge */}
          {/* <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2,
            border: '2px dashed rgba(125, 249, 255, 0.5)',
            background: 'rgba(125, 249, 255, 0.05)',
          }}>
            <Typography sx={{ fontSize: '1.2rem' }}>✨</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(125, 249, 255, 0.7)', fontWeight: 600 }}>
              More Coming Soon...
            </Typography>
          </Box> */}
        </Box>
      </Box>
    </Box>
  );
};
