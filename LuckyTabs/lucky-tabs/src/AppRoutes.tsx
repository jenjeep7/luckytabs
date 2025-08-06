/* AppRoutes.tsx */
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { LandingPage } from './pages/Landing/LandingPage';
import LandingTemporary from './pages/Landing/LandingTemporary';
import { SupportCircle } from './pages/Support/SupportCircle';
import Layout from './Layout';
import { Play } from './pages/Play/Play';

function AppRoutes() {
  const [user, loading] = useAuthState(auth);

  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingTemporary />} />
      <Route element={user ? <Layout /> : <Navigate to="/" />}> {/* Protected Routes */}
        <Route path="/dashboard" element={<LandingPage />} />
        <Route path="/support-circle" element={<SupportCircle />} />
        <Route path="/play" element={<Play />} />
      </Route>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppRoutes;