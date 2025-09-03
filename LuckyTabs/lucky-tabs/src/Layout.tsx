/* Layout.tsx */
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';

import { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Footer } from './components/Footer';

type NavItem = {
  label: string;
  icon: React.ReactElement;
  route?: string;
  email?: string;
};

const navItems: NavItem[] = [
  { label: 'Profile', route: '/profile', icon: <PersonIcon /> },
  { label: 'Play', route: '/play', icon: <HomeIcon /> },
  { label: 'Tracking', route: '/tracking', icon: <ListAltIcon /> },
  { label: 'Community', route: '/community', icon: <ExploreIcon /> },
];

interface LayoutProps {
  children?: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user] = useAuthState(auth);

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => await auth.signOut();
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleNavItemClick = (item: typeof navItems[number]) => {
    if (item.route) {
      void navigate(item.route);
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

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>Pull Tab Community</Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => handleNavItemClick(item)}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {!!user && (
          <>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={() => void handleLogout()}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {/* Top AppBar (only when logged-in) */}
      {user && (
        <AppBar component="nav" position="fixed">
          <Toolbar>
            {/* Hamburger only on mobile (md-), paired with the Drawer */}
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

            {/* Desktop links */}
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

      {/* Drawer (mobile) */}
      {user && (
        <Box component="nav">
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260 },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
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
