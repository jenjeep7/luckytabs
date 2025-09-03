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
import Features from './pages/Features';
function AppRoutes() {
  const [user, loading] = useAuthState(auth);

  if (loading) return null;

  return (
    <Routes>
      {/* Redirect / to /play if logged in, else /home */}
      <Route path="/" element={<Navigate to={user ? "/profile" : "/home"} />} />
      {/* /home is only for logged out users, logged in users go to /play */}
      <Route path="/home" element={user ? <Navigate to="/profile" /> : <LandingPage />} />
      {/* Protected routes only accessible if logged in */}
      <Route element={user ? <Layout /> : <Navigate to="/home" />}> 
        <Route path="/play" element={<Play />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/tabsy" element={<LandingPage />} />
      </Route>
      {/* Login/Signup redirect to /play if logged in */}
      <Route path="/login" element={user ? <Navigate to="/profile" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/profile" /> : <Signup />} />
      <Route path="/features" element={<Features />} />
      <Route path="*" element={<Navigate to={user ? "/profile" : "/home"} />} />
      <Route path="/support-circle" element={<SupportCircle />} />
    </Routes>
  );
}

export default AppRoutes;