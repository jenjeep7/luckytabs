import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  PhoneIphone,
  Android,
  AddToHomeScreen,
  Share,
  MoreVert,
} from '@mui/icons-material';

interface GetAppDialogProps {
  open: boolean;
  onClose: () => void;
}

export const GetAppDialog: React.FC<GetAppDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        Get the Tabsy App
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Coming Soon to App Stores!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We&apos;re working hard to get Tabsy into the App Store and Google Play Store.
          </Typography>
        </Box>

        <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddToHomeScreen color="primary" />
            Best Experience: Add to Home Screen
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            For the best app-like experience right now, you can add Tabsy to your phone&apos;s home screen directly from your browser:
          </Typography>
        </Box>

        {/* iOS Instructions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIphone color="primary" />
            On iPhone/iPad (Safari):
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <Share sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary="1. Tap the Share button"
                secondary="(Square with arrow pointing up)"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AddToHomeScreen sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary="2. Select 'Add to Home Screen'"
                secondary="Scroll down if you don't see it"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Typography sx={{ fontSize: 16, fontWeight: 'bold' }}>3</Typography>
              </ListItemIcon>
              <ListItemText 
                primary="3. Tap 'Add' to confirm"
                secondary="Tabsy will appear on your home screen like a native app"
              />
            </ListItem>
          </List>
        </Box>

        {/* Android Instructions */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Android color="primary" />
            On Android (Chrome):
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <MoreVert sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary="1. Tap the three-dot menu"
                secondary="(⋮) in the top-right corner"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AddToHomeScreen sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary="2. Select 'Add to Home screen'"
                secondary="Or 'Install app' if available"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Typography sx={{ fontSize: 16, fontWeight: 'bold' }}>3</Typography>
              </ListItemIcon>
              <ListItemText 
                primary="3. Tap 'Add' to confirm"
                secondary="Tabsy will be added to your home screen"
              />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2, p: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Once added, Tabsy will launch like a native app with full-screen experience!
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};