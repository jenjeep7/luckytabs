/* eslint-disable @typescript-eslint/no-misused-promises */
import { useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import Login from './pages/Login';
import Signup from './pages/Signup';

import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Button,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { getDesignTokens } from './theme';
import { LandingPage } from './pages/Landing/LandingPage';
import LandingTemporary from './pages/Landing/LandingTemporary';
import { SupportCircle } from './pages/Support/SupportCircle';

function AppContent() {
  const [user, loading] = useAuthState(auth);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useMemo(
    () => createTheme(getDesignTokens(prefersDarkMode ? 'dark' : 'light')),
    [prefersDarkMode]
  );

  const handleLogout = async () => await auth.signOut();
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleNavItemClick = (item: string) => {
    const anchor = `#${item.toLowerCase().replace(/ /g, '-')}`;
    if (location.pathname !== '/dashboard') {
      void navigate('/dashboard');
      // Use setTimeout to ensure navigation completes before scrolling
      setTimeout(() => {
        const element = document.querySelector(anchor);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.querySelector(anchor);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    'Features',
    'How It Works',
    'Testimonials',
    'Responsible Gaming',
    'Contact',
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        {`Pull Tab Community`}
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton onClick={() => handleNavItemClick(item)}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Only show AppBar and nav if user is logged in */}
      {user && (
        <Box sx={{ display: 'flex' }}>
          <AppBar component="nav" position="fixed">
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>

              <Typography
                variant="h6"
                sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}
              >
                {`Tabsy's Community`}
              </Typography>

              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                {navItems.map((item) => (
                  <Button key={item} onClick={() => handleNavItemClick(item)} color="inherit">
                    {item}
                  </Button>
                ))}
              </Box>

              <Box sx={{ ml: 'auto' }}>
                {user ? (
                  <IconButton color="inherit" onClick={handleLogout}>
                    <LogoutIcon />
                  </IconButton>
                ) : (
                  <Button color="inherit" href="/login">
                    {`Login`}
                  </Button>
                )}
              </Box>
            </Toolbar>
          </AppBar>
          <Box component="nav">
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 } }}
            >
              {drawer}
            </Drawer>
          </Box>
        </Box>
      )}

      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" replace /> : <LandingTemporary />
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? <LandingPage /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/signup"
          element={
            user ? <Navigate to="/dashboard" replace /> : <Signup />
          }
        />
        <Route
          path="/support-circle"
          element={
            user ? <SupportCircle /> : <Navigate to="/" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  const theme = useMemo(
    () => createTheme(getDesignTokens(prefersDarkMode ? 'dark' : 'light')),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
