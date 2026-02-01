
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStateCompat } from './services/useAuthStateCompat';
import { useUserProfile } from './context/UserProfileContext';
import type { User, UserInfo } from 'firebase/auth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { LandingPage } from './pages/Landing/LandingPage';
import { SupportCircle } from './pages/Support/SupportCircle';
import Layout from './Layout';
import { Play } from './pages/Play/Play';
import { Tracking } from './pages/Tracking/Tracking';
import { Frugal } from './pages/Frugal/Frugal';
import { SavingsSummary } from './pages/Frugal/SavingsSummary';
import { PendingSummary } from './pages/Frugal/PendingSummary';
import { MissedSummary } from './pages/Frugal/MissedSummary';
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

// Admin Route Guard Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, loading } = useUserProfile();
  const [user] = useAuthStateCompat();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/home" replace />;
  }

  if (!userProfile?.isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

// Email Verification Guard Component (Disabled - no longer requiring email verification)
const EmailVerificationGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always render children without email verification check
  return <>{children}</>;

};





export default function AppRoutes() {
  // Always call the hook (React rule)
  const [user, loading] = useAuthStateCompat();

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
          <Route path="frugal" element={<AdminRoute><Frugal /></AdminRoute>} />
          <Route path="frugal/summary" element={<AdminRoute><SavingsSummary /></AdminRoute>} />
          <Route path="frugal/pending" element={<AdminRoute><PendingSummary /></AdminRoute>} />
          <Route path="frugal/missed" element={<AdminRoute><MissedSummary /></AdminRoute>} />
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