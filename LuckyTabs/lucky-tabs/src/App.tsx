import { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

function App() {
  const [user, loading] = useAuthState(auth);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useMemo(
    () => createTheme(getDesignTokens(darkMode ? 'dark' : 'light')),
    [darkMode]
  );

  const handleToggleDarkMode = () => setDarkMode((prev) => !prev);
  const handleLogout = async () => await auth.signOut();
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

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
        Pull Tab Community
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton component="a" href={`#${item.toLowerCase().replace(/ /g, '-')}`}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
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
                <Typography variant="h6" sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}>
                  Pull Tab Community
                </Typography>
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                  {navItems.map((item) => (
                    <Button key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} color="inherit">
                      {item}
                    </Button>
                  ))}
                </Box>
                {/* <IconButton color="inherit" onClick={handleToggleDarkMode}>
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton> */}
                {user ? (
                  <IconButton color="inherit" onClick={handleLogout}>
                    <LogoutIcon />
                  </IconButton>
                ) : (
                  <Button color="inherit" href="/login">
                    Login
                  </Button>
                )}
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
