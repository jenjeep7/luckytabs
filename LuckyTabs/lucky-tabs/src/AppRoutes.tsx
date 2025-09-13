/* AppRoutes.tsx */
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { LandingPage } from './pages/Landing/LandingPage';
import { SupportCircle } from './pages/Support/SupportCircle';
import Layout from './Layout';
import { Play } from './pages/Play/Play';
import { Tracking } from './pages/Tracking/Tracking';
import { Community } from './pages/Community/Community';
import { UserProfile } from './pages/Profile/UserProfile';
import Features from './pages/Landing/Features';
import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Container,
  IconButton
} from '@mui/material';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { LogoutOutlined } from '@mui/icons-material';

// Email Verification Guard Component
const EmailVerificationGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useAuthState(auth);
  const [checkingVerification, setCheckingVerification] = React.useState(false);

  // If user is not authenticated or email is verified, render children
  if (!user || user.emailVerified || !user.providerData.some(p => p.providerId === "password")) {
    return <>{children}</>;
  }

  // If email is not verified, show verification screen
  return (
    <Container maxWidth="sm">
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <Paper elevation={6} sx={{ p: 6, textAlign: 'center', maxWidth: 400, position: 'relative' }}>
          {/* Logout button in top right */}
          <IconButton
            onClick={() => {
              void signOut(auth);
            }}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'text.secondary'
            }}
            title="Logout"
          >
            <LogoutOutlined />
          </IconButton>
          
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
            onClick={() => {
              void (async () => {
                setCheckingVerification(true);
                await user?.reload();
                setCheckingVerification(false);
                if (user?.emailVerified) {
                  window.location.reload();
                }
              })();
            }}
            sx={{ mt: 2, mr: 2 }}
          >
            {`Refresh & Check Verification`}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ mt: 2 }}
            onClick={() => {
              void (async () => {
                if (user) {
                  await sendEmailVerification(user);
                  alert(`Verification email sent! Please check your inbox.`);
                }
              })();
            }}
          >
            {`Resend Verification Email`}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

function AppRoutes() {
  const [user, loading] = useAuthState(auth);

  if (loading) return null;

  return (
    <EmailVerificationGuard>
      <Routes>
        {/* Redirect / to /play if logged in, else /home */}
        <Route path="/" element={<Navigate to={user ? "/profile" : "/home"} />} />
        {/* /home is only for logged out users, logged in users go to /play */}
        <Route path="/home" element={user ? <Navigate to="/profile" /> : (
          <Layout>
            <LandingPage />
          </Layout>
        )} />
        {/* Protected routes only accessible if logged in */}
        <Route element={user ? <Layout /> : <Navigate to="/home" />}> 
          <Route path="/play" element={<Play />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/community" element={<Community />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/tabsy" element={<LandingPage />} />
        </Route>
        {/* Login/Signup redirect to /play if logged in */}
        <Route path="/login" element={user ? <Navigate to="/profile" /> : (
          <Layout>
            <Login />
          </Layout>
        )} />
        <Route path="/signup" element={user ? <Navigate to="/profile" /> : (
          <Layout>
            <Signup />
          </Layout>
        )} />
        <Route path="/features" element={
          <Layout>
            <Features />
          </Layout>
        } />
        <Route path="*" element={<Navigate to={user ? "/profile" : "/home"} />} />
        <Route path="/support-circle" element={
          <Layout>
            <SupportCircle />
          </Layout>
        } />
      </Routes>
    </EmailVerificationGuard>
  );
}

export default AppRoutes;