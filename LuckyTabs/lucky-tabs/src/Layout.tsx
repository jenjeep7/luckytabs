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
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { auth } from './firebase';

const navItems = [
  { label: 'Home', route: '/dashboard' },
  { label: 'Play', route: '/play' },
  { label: 'Tracking', route: '/tracking' },
  { label: 'Community', route: '/community'},
  { label: 'Profile', route: '/profile' },
    { label: 'Contact', email: 'tabsywins@gmail.com' }
];

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflow: 'visible' }}>
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

      <Box component="main" sx={{ flexGrow: 1, width: '100%', overflow: 'visible' }}>
        <Toolbar />
        <Outlet />
      </Box>

      {/* Footer Section */}
      <Box id="contact" sx={{ bgcolor: 'grey.900', color: 'grey.300', py: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="white" gutterBottom>
          {`Tabsy's Community`}
        </Typography>

        {/* Social Media Icons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 2 }}>
          <IconButton
            href="https://facebook.com/tabsyscommunity"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'grey.300', '&:hover': { color: '#1877F2' }, p: 1 }}
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            href="https://www.instagram.com/tabsy_wins/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'grey.300', '&:hover': { color: '#E4405F' }, p: 1 }}
          >
            <InstagramIcon />
          </IconButton>
          <IconButton
            href="https://twitter.com/tabsyscommunity"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'grey.300', '&:hover': { color: '#1DA1F2' }, p: 1 }}
          >
            <TwitterIcon />
          </IconButton>
          <IconButton
            href="https://www.youtube.com/@TabsyWins"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'grey.300', '&:hover': { color: '#FF0000' }, p: 1 }}
          >
            <YouTubeIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption">
            {`© 2025 Tabsy's Community. All rights reserved. For entertainment purposes only. Please play responsibly.`}
          </Typography>
          <Button 
            href="#privacy-policy" 
            sx={{ 
              color: 'grey.300', 
              textTransform: 'none',
              fontSize: 'inherit',
              p: 0,
              minWidth: 'auto',
              '&:hover': { color: '#ffffff' }
            }}
          >
            Privacy Policy
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
