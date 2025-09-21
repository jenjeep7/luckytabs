/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { useEffect } from 'react';
import { trackLandingPageVisit } from '../../utils/analytics';
import { Capacitor } from '@capacitor/core';
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  // Track landing page visit when component mounts
  useEffect(() => {
    // Get referrer information for traffic source tracking
    const referrer = document.referrer;
    let source = 'direct';
    let medium = 'none';
    
    if (referrer) {
      if (referrer.includes('google')) {
        source = 'google';
        medium = 'organic';
      } else if (referrer.includes('facebook')) {
        source = 'facebook';
        medium = 'social';
      } else if (referrer.includes('twitter')) {
        source = 'twitter';
        medium = 'social';
      } else {
        source = 'referral';
        medium = 'referral';
      }
    }

    if (!Capacitor.isNativePlatform()) {
      trackLandingPageVisit(source, medium);
    }
  }, []);

  return (
    <Box sx={{ 
      width: '100%',
      position: 'relative',
      backgroundColor: 'black'
    }}>
      {/* Hero Section */}
      <Box sx={{ 
        pt: { xs: 6 }, 
        px: { xs: 1, sm: 2 },
        textAlign: 'center'
      }}>
        <Container 
          maxWidth="md" 
          sx={{ 
            px: { xs: 2, sm: 3 }
          }}
        >
          {/* Logo at the top */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: { xs: 4 }
          }}>
            <img
              src={`${process.env.PUBLIC_URL}/tabsy-logo.png`}
              alt="Tabsy Logo"
              style={{ 
                height: 'auto',
                width: '100%',
                maxHeight: '200px',
                maxWidth: '300px',
                objectFit: 'contain'
              }}
            />
          </Box>

          <Box>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem' },
                lineHeight: { xs: 1.3, sm: 1.4 },
                px: { xs: 1 },
                maxWidth: '800px',
                mx: 'auto',
                mb: { xs: 2, sm: 3 }
              }}
            >
              {`Welcome to Tabsy's Community of Pull Tab Enthusiasts!`}
            </Typography>
            
            <Typography 
              variant="body1" 
              fontWeight="bold" 
              gutterBottom
              sx={{
                fontSize: { xs: '1em' },
                lineHeight: { xs: 1.6},
                px: { xs: 1, sm: 2 },
                pt: { xs: 1},
                maxWidth: '800px',
                mx: 'auto',
                mb: { xs: 3, sm: 2 },
                whiteSpace: 'pre-line'
              }}
            >
              {`Tabsy Wins isn’t just another app—it’s a magical toolkit for pull tab players. Log your sessions, scan boxes, predict smarter outcomes, and connect with a crew of streak-chasers who play with heart. Whether you're a casual ripper or a strategic player, Tabsy helps you stay sharp, stay social, and stay in the game.`}
            </Typography>
          </Box>
          <Box sx={{ 
            my: { xs: 4}, 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 2 }, 
            flexWrap: 'wrap'
          }}>
            <Stack
              direction={{ xs: 'row', sm: 'row' }}
              spacing={{ xs: 1, sm: 2 }}
              justifyContent="center"
              alignItems="center"
              sx={{ width: '100%' }}
            >
              <Button
                component={RouterLink}
                to="/signup"
                size="medium"
                variant="contained"
                color="success"
                sx={{
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 2, sm: 1 },
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: { xs: '0.85rem', sm: '1rem' },
                  minWidth: { xs: '80px', sm: '100px' },
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  height: { xs: '48px' }
                }}
              >
                {`Join Tabsy's Crew`}
              </Button>

              <Button
                component={RouterLink}
                to="/features"
                size="medium"
                variant="contained"
                color="secondary"
                sx={{
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 1, sm: 1 },
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: { xs: '0.85rem', sm: '1rem' },
                  minWidth: { xs: '100px', sm: '120px' },
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  height: { xs: '48px' }
                }}
              >
                {`Tabsy's Crystal Ball`}
              </Button>
            </Stack>
          </Box>

        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
