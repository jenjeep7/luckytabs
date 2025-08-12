import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

const LandingTemporary: React.FC = () => {
  return (
    <Box
      component="section"
      minHeight="100dvh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      bgcolor="#170453"
      sx={{
        position: 'relative',
        // Your cleaned background image with wizard/rainbow/etc.
        backgroundImage: 'url(/TabsyBackground.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: {
          xs: 'contain',
          md: 'contain',
        },
        backgroundPosition: {
          xs: 'center bottom 12%',
          sm: 'center bottom 8%',
          md: 'center bottom 6%',
        },

        // Soft vignette/gradient to make text readable against stars
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          // background:
          //   'radial-gradient(120% 70% at 50% 0%, rgba(23,4,83,0.0) 0%, rgba(23,4,83,0.35) 50%, rgba(23,4,83,0.65) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        },
      }}
    >
      {/* Content */}
      <Box
        sx={{
          zIndex: 2,
          width: '100%',
          maxWidth: 960,
          px: { xs: 2.5, sm: 4 },
          pt: { xs: '8vh', sm: '10vh', md: '12vh' },
          pb: { xs: '34vh', sm: '30vh', md: '28vh' }, // leave space so wizard shows
          textAlign: 'center',
          color: 'white',
        }}
      >
        {/* “TABSY WINS” – text logo style */}
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: '42px', sm: '56px', md: '70px' },
            fontWeight: 900,
            letterSpacing: 2,
            lineHeight: 1.05,
            mb: { xs: 1.5, sm: 2 },
            textTransform: 'uppercase',
            background:
              'linear-gradient(180deg, #FFE989 0%, #FFD748 45%, #FFB800 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow:
              '0 3px 0 rgba(112,55,0,0.45), 0 10px 24px rgba(0,0,0,0.35)',
          }}
        >
          Tabsy Wins
        </Typography>

        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: '26px', sm: '34px', md: '40px' },
            fontWeight: 800,
            mb: 1,
          }}
        >
          Unleash the Magic of Winning!
        </Typography>

        <Typography
          sx={{
            opacity: 0.92,
            fontSize: { xs: '16px', sm: '18px' },
            maxWidth: 720,
            mx: 'auto',
            mb: { xs: 3, sm: 4 },
          }}
        >
          Play, win, and join the most enchanting pull tab experience.
        </Typography>

        {/* Buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          <Button
            href="/login"
            size="large"
            variant="contained"
            color="success" // green like the mock
            sx={{
              px: 3.5,
              py: 1.25,
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 999,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            }}
          >
            Login to Play
          </Button>

          <Button
            href="/demo"
            size="large"
            variant="contained"
            color="secondary" // purple
            sx={{
              px: 3.5,
              py: 1.25,
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 999,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            }}
          >
            Try Demo
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default LandingTemporary;
