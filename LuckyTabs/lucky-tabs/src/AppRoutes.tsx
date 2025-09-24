
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStateCompat } from './services/useAuthStateCompat';
import type { User, UserInfo } from 'firebase/auth';
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
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Container,
  IconButton
} from '@mui/material';
import { sendEmailVerification } from 'firebase/auth';
import { signOutCompat } from './services/authService';
import { LogoutOutlined } from '@mui/icons-material';
import ResponsibleGaming from './pages/ResponsibleGaming/ResponsibleGaming';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';

// Type guard to check if user is a Firebase User
function isFirebaseUser(u: unknown): u is User {
  return !!u && typeof u === 'object' && 'providerData' in u && Array.isArray((u as { providerData?: unknown }).providerData);
}

// Email Verification Guard Component
const EmailVerificationGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useAuthStateCompat();
  const [checkingVerification, setCheckingVerification] = React.useState(false);

  // If user is not authenticated or email is verified, render children
  if (
    !user ||
    (isFirebaseUser(user) && (
      user.emailVerified ||
      (user.providerData && user.providerData.some((p: UserInfo) => p.providerId === "password") === false)
    ))
  ) {
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
              void signOutCompat();
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
                if (isFirebaseUser(user)) {
                  await user.reload();
                }
                setCheckingVerification(false);
                if (isFirebaseUser(user) && user.emailVerified) {
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
                if (isFirebaseUser(user)) {
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





export default function AppRoutes() {
  // Always call the hook (React rule)
  const [user, loading, error] = useAuthStateCompat();

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Normal flow for all platforms - authentication is now working correctly
  return (
    <EmailVerificationGuard>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to={user ? '/profile' : '/home'} replace />} />
          {/* Public */}
          <Route path="home" element={<LandingPage />} />
          <Route path="login" element={user ? <Navigate to="/profile" replace /> : <Login />} />
          <Route path="signup" element={user ? <Navigate to="/profile" replace /> : <Signup />} />
          <Route path="features" element={<Features />} />
          <Route path="support-circle" element={<SupportCircle />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="responsible-gaming" element={<ResponsibleGaming />} />
          {/* Protected */}
          <Route path="play" element={user ? <Play /> : <Navigate to="/home" replace />} />
          <Route path="tracking" element={user ? <Tracking /> : <Navigate to="/home" replace />} />
          <Route path="community" element={user ? <Community /> : <Navigate to="/home" replace />} />
          <Route path="profile" element={user ? <UserProfile /> : <Navigate to="/home" replace />} />
          <Route path="tabsy" element={user ? <LandingPage /> : <Navigate to="/home" replace />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? '/profile' : '/home'} replace />} />
        </Route>
      </Routes>
    </EmailVerificationGuard>
  );
}