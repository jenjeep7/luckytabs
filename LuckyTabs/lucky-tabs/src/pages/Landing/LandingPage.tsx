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
  Paper,
  useTheme,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../../components/Footer';

export const LandingPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [checkingVerification, setCheckingVerification] = React.useState(false);
  const [showVerifyModal, setShowVerifyModal] = React.useState(false);
  React.useEffect(() => {
    const checkVerification = () => {
      if (user && !user.emailVerified && user.providerData.some(p => p.providerId === "password")) {
        setShowVerifyModal(true);
      } else {
        setShowVerifyModal(false);
      }
    };
    checkVerification();
  }, [user]);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <>
      {/* Full Screen Modal for Email Verification */}
      {showVerifyModal && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'background.paper',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Paper elevation={6} sx={{ p: 6, textAlign: 'center', maxWidth: 400 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {`Verify Your Email`}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {`Please check your inbox and click the verification link to activate your account.`}<br />
              {`You cannot use Tabsy until your email is verified.`}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              disabled={checkingVerification}
              onClick={async () => {
                setCheckingVerification(true);
                await user?.reload();
                setCheckingVerification(false);
                if (user?.emailVerified) {
                  setShowVerifyModal(false);
                  window.location.reload();
                }
              }}
              sx={{ mt: 2 }}
            >
              {`Refresh & Check Verification`}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ mt: 2 }}
              onClick={async () => {
                if (user) {
                  // Dynamically import sendEmailVerification to avoid import issues
                  const { sendEmailVerification } = await import('firebase/auth');
                  await sendEmailVerification(user);
                  alert(`Verification email sent! Please check your inbox.`);
                }
              }}
            >
              {`Resend Verification Email`}
            </Button>
          </Paper>
        </Box>
      )}
      {/* Hero Section */}
      <Box sx={{ 
        bgcolor: isDarkMode ? 'background.paper' : 'primary.main', 
        color: isDarkMode ? 'text.primary' : 'white', 
        py: 10, 
        textAlign: 'center' 
      }}>
        <Container>
          <Box>
            <img
              src="/Tabsy New Logo.png"
              alt={`Tabsy Wins Logo`}
              style={{ height: 250, marginRight: 16, paddingBottom: 16 }}
            />
          </Box>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {`Ready to turn your pull tab passion into a `}
            <Box component="span" sx={{ color: 'success.main', display: 'block', fontWeight: 'bold' }}>
              {`WINNING`}
            </Box>
            {` adventure?`}
          </Typography>
          <Typography variant="body1" maxWidth={600} mx="auto" gutterBottom>
            {`Introducing a new pull tab community player experience – where every win, every game, and every insight is better together!`}
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              {!user && (
                <Button
                  href="/login"
                  size="large"
                  variant="contained"
                  color="success"
                  sx={{
                    px: 3.5,
                    py: 1.25,
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 999,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  }}
                >
                  {`Login to Play`}
                </Button>
              )}

              <Button
                href="/features"
                size="large"
                variant="contained"
                color="secondary"
                sx={{
                  px: 3.5,
                  py: 1.25,
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: 999,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                }}
              >
                {`Features`}
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default LandingPage;
