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
import { Footer } from '../../components/Footer';

export const LandingPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <>
      {/* Hero Section */}
      <Box sx={{ 
        bgcolor: isDarkMode ? 'background.paper' : 'primary.main', 
        color: isDarkMode ? 'text.primary' : 'white', 
        py: 4, 
        textAlign: 'center' 
      }}>
        <Container>
          {/* Move buttons above the logo */}
          <Box sx={{ my: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Stack
              direction={{ xs: 'row', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              {!user && (
                <Button
                  href="/signup"
                  size="medium"
                  variant="contained"
                  color="success"
                  sx={{
                    px: 2.5,
                    py: 1,
                    fontWeight: 800,
                    textTransform: 'none',
                    // borderRadius: 8,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
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
                  px: 2.5,
                  py: 1,
                  fontWeight: 800,
                  textTransform: 'none',
                  // borderRadius: 999,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                }}
              >
                {`Features`}
              </Button>
            </Stack>
          </Box>

          <Box>
            <img
              src="/Tabsy New Logo.png"
              alt={`Tabsy Wins Logo`}
              style={{ height: 250, marginRight: 16, paddingBottom: 16 }}
            />
          </Box>

          <Typography variant="body1" fontWeight="bold" gutterBottom>
            {`Welcome to Tabsy's community of pull tab enthusiasts, where you can track your individual play to improve your odds of winning, share ups and downs, swap tips and tricks, track patterns, and pull responsibly—with Tabsy cheering you on the whole way!`}
          </Typography>
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default LandingPage;
