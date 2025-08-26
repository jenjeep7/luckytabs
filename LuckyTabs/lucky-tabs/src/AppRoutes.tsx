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
function AppRoutes() {
  const [user, loading] = useAuthState(auth);

  if (loading) return null;

  return (
    <Routes>
      {/* Main home page is /home, redirect / to /home */}
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={user ? <Layout><LandingPage /></Layout> : <LandingPage />} />
      {/* Protected routes only accessible if logged in */}
      <Route element={user ? <Layout /> : <Navigate to="/home" />}> 
        <Route path="/support-circle" element={<SupportCircle />} />
        <Route path="/play" element={<Play />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>
      <Route path="/login" element={user ? <Navigate to="/home" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/home" /> : <Signup />} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
}

export default AppRoutes;