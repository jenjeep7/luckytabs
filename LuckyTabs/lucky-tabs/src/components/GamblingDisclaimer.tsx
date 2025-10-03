import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useAuthStateCompat } from '../services/useAuthStateCompat';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const GamblingDisclaimer: React.FC = () => {
  const [user, loading] = useAuthStateCompat();
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const checkDisclaimerStatus = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // If user hasn't acknowledged the disclaimer, show it
        if (!userData.gamblingDisclaimerAcknowledged) {
          setOpen(true);
        }
      }
    } catch (error) {
      console.error('Error checking disclaimer status:', error);
      // If there's an error, show the disclaimer to be safe
      setOpen(true);
    }
  }, [user]);

  useEffect(() => {
    // Only check after user is logged in
    if (!loading && user) {
      void checkDisclaimerStatus();
    }
  }, [user, loading, checkDisclaimerStatus]);

  const handleAccept = async () => {
    if (!acknowledged || !user?.uid) return;

    try {
      // Save acknowledgment to user's Firestore document
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        gamblingDisclaimerAcknowledged: true,
        gamblingDisclaimerAcknowledgedAt: new Date()
      }, { merge: true });

      setOpen(false);
    } catch (error) {
      console.error('Error saving disclaimer acknowledgment:', error);
      // Still close the dialog even if save fails
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          padding: 1
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" sx={{ fontSize: 32 }} />
          <Typography variant="h5" component="span" fontWeight="bold">
            Important Notice
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body1" component="p" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
            Responsible Gaming Information
          </Typography>
          
          <Typography variant="body2" component="p" sx={{ mb: 2 }}>
            <strong>Tabsy Wins is a tracking and analytics tool only.</strong> This app does not:
          </Typography>
          
          <Box component="ul" sx={{ mt: 1, mb: 2, pl: 3 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Sell pulltabs or facilitate gambling transactions
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Provide any form of gambling services
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              Guarantee winnings or predict outcomes
            </Typography>
          </Box>
          
          <Typography variant="body2" component="p" sx={{ mb: 2 }}>
            This app is designed to help you track and analyze your existing pulltab activity. You must be of legal age to purchase pulltabs in your jurisdiction.
          </Typography>
          
          <Typography variant="body2" component="p" sx={{ fontStyle: 'italic', mb: 2 }}>
            Please play responsibly. If you or someone you know has a gambling problem, seek help:
          </Typography>
          
          <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              National Problem Gambling Helpline
            </Typography>
            <Typography variant="body2">
              1-800-522-4700 (24/7)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ncpgambling.org
            </Typography>
          </Box>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                I understand and acknowledge this information
              </Typography>
            }
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant="contained"
          onClick={() => {
            void handleAccept();
          }}
          disabled={!acknowledged}
          fullWidth
          sx={{ maxWidth: 200 }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};
