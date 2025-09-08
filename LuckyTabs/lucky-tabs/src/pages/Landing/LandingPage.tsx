/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import {
  Box,
  Button,
  Container,
  Typography,
  useTheme,
  Stack,
} from '@mui/material';

export const LandingPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: { xs: '100vh', sm: '100vh' },
      width: '100%',
      position: 'relative',
      overflow: { xs: 'auto', sm: 'visible' }
    }}>
      {/* Hero Section */}
      <Box sx={{ 
        bgcolor: isDarkMode ? 'background.paper' : 'primary.main', 
        color: isDarkMode ? 'text.primary' : 'white', 
        py: { xs: 3, sm: 4 }, 
        px: { xs: 1, sm: 2 },
        textAlign: 'center',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: { xs: 'calc(100vh - 200px)', sm: 'auto' }
      }}>
        <Container 
          maxWidth="md" 
          sx={{ 
            px: { xs: 2, sm: 3 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          {/* Move buttons above the logo */}
          <Box sx={{ 
            my: { xs: 2, sm: 4 }, 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 1, sm: 2 }, 
            flexWrap: 'wrap',
            order: { xs: 1, sm: 1 }
          }}>
            <Stack
              direction={{ xs: 'row', sm: 'row' }}
              spacing={{ xs: 1, sm: 2 }}
              justifyContent="center"
              alignItems="center"
              sx={{ width: '100%' }}
            >
              {!user && (
                <Button
                  href="/signup"
                  size="medium"
                  variant="contained"
                  color="success"
                  sx={{
                    px: { xs: 2, sm: 2.5 },
                    py: { xs: 1, sm: 1 },
                    fontWeight: 800,
                    textTransform: 'none',
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    minWidth: { xs: '80px', sm: '100px' },
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                    height: { xs: '40px', sm: '48px' }
                  }}
                >
                  {`Join`}
                </Button>
              )}

              <Button
                href="/features"
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
                  height: { xs: '40px', sm: '48px' }
                }}
              >
                {`Features`}
              </Button>
            </Stack>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: { xs: 2, sm: 3 },
            order: { xs: 2, sm: 2 }
          }}>
            <img
              src="/Tabsy New Logo.png"
              alt={`Tabsy Wins Logo`}
              style={{ 
                height: 'auto',
                width: '100%',
                maxHeight: '200px',
                maxWidth: '300px',
                objectFit: 'contain'
              }}
            />
          </Box>

          <Box sx={{ order: { xs: 3, sm: 3 } }}>
            <Typography 
              variant="body1" 
              fontWeight="bold" 
              gutterBottom
              sx={{
                fontSize: { xs: '0.85rem', sm: '1rem', md: '1.1rem' },
                lineHeight: { xs: 1.3, sm: 1.5 },
                px: { xs: 1, sm: 2 },
                maxWidth: '800px',
                mx: 'auto',
                mb: { xs: 3, sm: 2 }
              }}
            >
              {`Welcome to Tabsy's community of pull tab enthusiasts, where you can track your individual play to improve your odds of winning, share ups and downs, swap tips and tricks, track patterns, and pull responsibly—with Tabsy cheering you on the whole way!`}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
