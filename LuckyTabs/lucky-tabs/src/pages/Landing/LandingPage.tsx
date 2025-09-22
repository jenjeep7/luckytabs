import React, { useEffect, useState } from 'react';
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
import { PreviewDialog } from './PreviewDialog';

export const LandingPage: React.FC = () => {
  const [previewOpen, setPreviewOpen] = useState(false);

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
            mb: { xs: 3 },
          }}>
            <img
              src="/Tabsy New Logo.png"
              alt="Tabsy Wins Logo"
              style={{
                height: 'auto',
                width: '100%',
                maxHeight: '280px',
                maxWidth: '280px',
                objectFit: 'contain',
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
              Smarter Pull Tab Play Starts Here
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
                mb: { xs: 3, sm: 4 },
                whiteSpace: 'pre-line'
              }}
            >
              {`Tabsy helps you track wins, scan Flare, set budgets, and spot hot boxes—so you can rip with confidence, not guesswork. Built for players. Powered by data. Backed by community.`}
            </Typography>
          </Box>

          <Box sx={{ 
            my: { xs: 4}, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 2 }, 
          }}>
            {/* First row: Join and Features buttons side by side */}
            <Stack
              direction="row"
              spacing={{ xs: 1, sm: 2 }}
              justifyContent="center"
              alignItems="center"
              sx={{ flexWrap: 'wrap', gap: { xs: 1, sm: 2 } }}
            >
              <Button
                component={RouterLink}
                to="/signup"
                size="small"
                variant="contained"
                color="success"
                sx={{
                  px: { xs: 1.5, sm: 2.5 },
                  py: { xs: 1, sm: 1 },
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: { xs: '0.75rem', sm: '1rem' },
                  minWidth: { xs: '110px', sm: '120px' },
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  height: { xs: '42px', sm: '48px' }
                }}
              >
                {`Join Tabsy's Crew`}
              </Button>

              <Button
                component={RouterLink}
                to="/features"
                size="small"
                variant="contained"
                color="secondary"
                sx={{
                  px: { xs: 1.5, sm: 2.5 },
                  py: { xs: 1, sm: 1 },
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: { xs: '0.75rem', sm: '1rem' },
                  minWidth: { xs: '110px', sm: '120px' },
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  height: { xs: '42px', sm: '48px' }
                }}
              >
                {`Behind the Magic`}
              </Button>
            </Stack>

            {/* Second row: Preview App button centered */}
            <Button
              onClick={() => setPreviewOpen(true)}
              size="small"
              variant="outlined"
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: { xs: 1, sm: 1 },
                fontWeight: 800,
                textTransform: 'none',
                fontSize: { xs: '0.85rem', sm: '1rem' },
                minWidth: { xs: '160px', sm: '120px' },
                borderColor: 'white',
                color: 'white',
                borderWidth: 2,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 2,
                },
                height: { xs: '48px' }
              }}
            >
              Preview App
            </Button>
          </Box>

        </Container>
      </Box>
      
      {/* Preview Dialog */}
      <PreviewDialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)} 
      />
    </Box>
  );
};

export default LandingPage;
