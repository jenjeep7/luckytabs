/* Layout.tsx */
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AutoGraph from '@mui/icons-material/AutoGraph';
import GroupIcon from '@mui/icons-material/Group';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import { useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Footer } from './components/Footer';
import { useLocation as useLocationContext } from './hooks/useLocation';

type NavItem = {
  label: string;
  icon: React.ReactElement;
  route?: string;
  email?: string;
};

const navItems: NavItem[] = [
  { label: 'Profile', route: '/profile', icon: <PersonIcon /> },
  { label: 'Predict', route: '/play', icon: <AutoGraph /> },
  { label: 'Tracking', route: '/tracking', icon: <ListAltIcon /> },
  { label: 'Social', route: '/community', icon: <GroupIcon /> },
];

interface LayoutProps {
  children?: React.ReactNode;
  title?: string;
}

function Layout({ children, title }: LayoutProps) {
  const [user] = useAuthState(auth);
  const { selectedLocationObj } = useLocationContext();

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const navigate = useNavigate();
  const location = useLocation();

  // Determine page title based on current route
  const getPageTitle = () => {
    if (title) return title; // Use provided title if available
    
    const path = location.pathname;
    switch (true) {
      case path.startsWith('/play'):
        // Show location name if available, otherwise default title
        return selectedLocationObj?.name || 'Box Dashboard';
      case path.startsWith('/tracking'):
        return 'Budget Tracking';
      case path.startsWith('/community'):
        return 'Social';
      // case path.startsWith('/profile'):
      //   return 'User Profile';
      default:
        return `User Profile`;
    }
  };

  const handleLogout = async () => await auth.signOut();

  const handleNavItemClick = (item: typeof navItems[number]) => {
    if (item.route) {
      // Clear search parameters when navigating to main tabs to prevent tab conflicts
      if (item.route === '/community') {
        void navigate(item.route, { replace: true });
      } else {
        void navigate(item.route);
      }
    } else if (item.email) {
      const subject = encodeURIComponent('Tabsy Wins - Contact');
      const body = encodeURIComponent('Hello,\n\nI would like to get in touch regarding Tabsy Wins.\n\nThank you!');
      window.location.href = `mailto:${item.email}?subject=${subject}&body=${body}`;
    }
  };

  // Which bottom tab should be active based on the current URL
  const bottomValue = useMemo(() => {
    const idx = navItems.findIndex(
      (i) => i.route && location.pathname.startsWith(i.route)
    );
    return idx >= 0 ? idx : 0;
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {/* Top AppBar (only when logged-in) */}
      {user && (
        <AppBar component="nav" position="fixed">
          <Toolbar>
            <Typography
              variant="h6"
              sx={{ 
                flexGrow: 1, 
                textAlign: { xs: 'center', md: 'left' },
                fontWeight: 800,
                fontFamily: '"Orbitron", "Inter", sans-serif',
                background: 'linear-gradient(45deg, #7DF9FF 0%, #00E676 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 15px rgba(125, 249, 255, 0.4)',
                letterSpacing: '0.08em',
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              {getPageTitle()}
            </Typography>

            {/* Desktop links - only show on larger screens */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              {navItems.map((item) => (
                <Button key={item.label} onClick={() => handleNavItemClick(item)} color="inherit">
                  {item.label}
                </Button>
              ))}
              <IconButton color="inherit" onClick={() => void handleLogout()}>
                <LogoutIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          // top padding to clear the AppBar when logged-in
          pt: user ? { xs: '56px', md: '64px' } : 0,
          // bottom padding to clear BottomNavigation on mobile
          pb: user ? { xs: 'calc(env(safe-area-inset-bottom) + 64px)', md: 0 } : 0,
        }}
      >
        {user && isMdUp && <Toolbar sx={{ display: 'none' } /* already accounted with pt */} />}
        {children ? children : <Outlet />}
      </Box>

      {/* Bottom Navigation (mobile only, when logged-in) */}
      {user && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: (t) => t.zIndex.appBar, // keep on top
            display: { xs: 'block', md: 'none' },
            pb: 'env(safe-area-inset-bottom)',
          }}
        >
          <BottomNavigation
            showLabels
            value={bottomValue}
            onChange={(_e: React.SyntheticEvent, newIndex: number) => handleNavItemClick(navItems[newIndex])}
            sx={{
              pb: 2,
              pt: 1,
            }}
          >
            {navItems.map((item) => (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}

      <Footer />
    </Box>
  );
}

export default Layout;
