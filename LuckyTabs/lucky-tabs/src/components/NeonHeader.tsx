import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { LocationOn } from '@mui/icons-material';

const NeonHeader: React.FC = () => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 3,
        px: 2,
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(0, 150, 255, 0.1) 100%)',
        borderBottom: '1px solid rgba(125, 249, 255, 0.2)',
      }}
    >
      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 20,
          color: '#FF3CAC',
          fontSize: '24px',
          animation: 'twinkle 2s infinite',
          '@keyframes twinkle': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.3 },
          },
        }}
      >
        ⭐
      </Box>
      
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 20,
          color: '#7DF9FF',
          fontSize: '24px',
          animation: 'twinkle 2.5s infinite',
        }}
      >
        ⭐
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: 30,
          left: 60,
          color: '#FFC107',
          fontSize: '20px',
          animation: 'twinkle 1.8s infinite',
        }}
      >
        ✨
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: 30,
          right: 60,
          color: '#00E676',
          fontSize: '18px',
          animation: 'twinkle 2.2s infinite',
        }}
      >
        ⚡
      </Box>

      {/* Main Title */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 900,
          fontFamily: '"Orbitron", "Inter", sans-serif',
          background: 'linear-gradient(45deg, #7DF9FF 0%, #00E676 50%, #7DF9FF 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(125, 249, 255, 0.5)',
          letterSpacing: '0.1em',
          mb: 0.5,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
        }}
      >
        CY&apos;S
      </Typography>

      <Typography
        variant="h2"
        sx={{
          fontWeight: 900,
          fontFamily: '"Orbitron", "Inter", sans-serif',
          background: 'linear-gradient(45deg, #FF3CAC 0%, #FFC107 50%, #FF3CAC 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(255, 60, 172, 0.5)',
          letterSpacing: '0.1em',
          mb: 0.5,
          fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
        }}
      >
        BAR
      </Typography>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          fontStyle: 'italic',
          color: '#7DF9FF',
          letterSpacing: '0.2em',
          mb: 1,
          fontSize: { xs: '1rem', sm: '1.2rem' },
        }}
      >
        and
      </Typography>

      <Typography
        variant="h3"
        sx={{
          fontWeight: 900,
          fontFamily: '"Orbitron", "Inter", sans-serif',
          background: 'linear-gradient(45deg, #00E676 0%, #7DF9FF 50%, #00E676 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 30px rgba(0, 230, 118, 0.5)',
          letterSpacing: '0.1em',
          mb: 2,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
        }}
      >
        GRILL
      </Typography>

      {/* OPEN sign */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          background: 'linear-gradient(135deg, rgba(255, 60, 172, 0.9), rgba(138, 43, 226, 0.9))',
          border: '2px solid #FF3CAC',
          borderRadius: 3,
          px: 2,
          py: 1,
          boxShadow: '0 0 20px rgba(255, 60, 172, 0.4)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: '#FF3CAC',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textShadow: '0 0 10px rgba(255, 60, 172, 0.8)',
          }}
        >
          OPEN
        </Typography>
      </Box>

      {/* Beer mug icon */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 15,
          right: 20,
          color: '#FFC107',
          fontSize: '32px',
          filter: 'drop-shadow(0 0 10px rgba(255, 193, 7, 0.6))',
        }}
      >
        🍺
      </Box>

      {/* Change Location Button */}
      <Box sx={{ mt: 2 }}>
        <IconButton
          sx={{
            background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.8), rgba(255, 60, 172, 0.8))',
            border: '2px solid #FF3CAC',
            borderRadius: 6,
            px: 3,
            py: 1.5,
            boxShadow: '0 0 20px rgba(255, 60, 172, 0.3)',
            '&:hover': {
              boxShadow: '0 0 30px rgba(255, 60, 172, 0.5)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <LocationOn sx={{ color: '#7DF9FF', mr: 1 }} />
          <Typography
            variant="body2"
            sx={{
              color: '#7DF9FF',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            Change Location
          </Typography>
        </IconButton>
      </Box>
    </Box>
  );
};

export default NeonHeader;
