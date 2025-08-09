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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { auth } from './firebase';

const navItems = [
  { label: 'Home', route: '/dashboard' },
  { label: 'Play', route: '/play' },
  { label: 'Tracking', route: '/tracking' },
  { label: 'Contact', anchor: 'contact' },
];

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => await auth.signOut();
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleNavItemClick = (item: typeof navItems[number]) => {
    if (item.route) {
      void navigate(item.route);
    } else if (item.anchor) {
      const anchor = `#${item.anchor}`;
      if (location.pathname !== '/dashboard') {
        void navigate('/dashboard');
        setTimeout(() => {
          document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

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
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
              <Button key={item.label} onClick={() => handleNavItemClick(item)} color="inherit">
                {item.label}
              </Button>
            ))}
          </Box>

          <IconButton color="inherit" onClick={() => void handleLogout()} sx={{ ml: 'auto' }}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
