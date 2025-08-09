import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import { AttachMoney as MoneyIcon, Place as PlaceIcon } from '@mui/icons-material';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

interface Location {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface TransactionManagerProps {
  open: boolean;
  onClose: () => void;
  onTransactionAdded: () => void;
  userId: string;
}

// Helper function to get start of week (Monday)
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const TransactionManager: React.FC<TransactionManagerProps> = ({
  open,
  onClose,
  onTransactionAdded,
  userId,
}) => {
  const [betAmount, setBetAmount] = useState<string>('');
  const [winAmount, setWinAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch locations when dialog opens
  useEffect(() => {
    if (open) {
      const fetchLocations = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'locations'));
          const locationData: Location[] = [];
          snapshot.forEach((doc) => {
            locationData.push({ id: doc.id, ...doc.data() } as Location);
          });
          setLocations(locationData);
        } catch (err) {
          console.error('Error fetching locations:', err);
        }
      };
      void fetchLocations();
    }
  }, [open]);

  const handleSave = async () => {
    const betValue = parseFloat(betAmount);
    const winValue = winAmount ? parseFloat(winAmount) : 0;
    
    if (isNaN(betValue) || betValue <= 0) {
      setError('Please enter a valid bet amount greater than $0');
      return;
    }

    if (winAmount && (isNaN(winValue) || winValue < 0)) {
      setError('Win amount must be $0 or greater');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const now = new Date();
      const weekStart = getStartOfWeek(now);
      const activityDescription = description.trim() || 'Gambling activity';
      
      // Always create a bet transaction
      await addDoc(collection(db, 'transactions'), {
        userId,
        type: 'bet',
        amount: betValue,
        description: activityDescription,
        location: selectedLocation?.name || '',
        locationId: selectedLocation?.id || '',
        createdAt: serverTimestamp(),
        weekStart: weekStart.toISOString(),
      });

      // Create a win transaction if win amount is provided and > 0
      if (winValue > 0) {
        await addDoc(collection(db, 'transactions'), {
          userId,
          type: 'win',
          amount: winValue,
          description: `Win from: ${activityDescription}`,
          location: selectedLocation?.name || '',
          locationId: selectedLocation?.id || '',
          createdAt: serverTimestamp(),
          weekStart: weekStart.toISOString(),
        });
      }

      onTransactionAdded();
      handleClose();
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError('Failed to save transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setBetAmount('');
    setWinAmount('');
    setDescription('');
    setSelectedLocation(null);
    setError('');
    onClose();
  };

  const netResult = () => {
    const bet = parseFloat(betAmount) || 0;
    const win = parseFloat(winAmount) || 0;
    return win - bet;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add Gambling Activity
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Record your gambling activity. Enter the amount you bet and any winnings from that activity.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              label="Bet Amount"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              fullWidth
              required
              type="number"
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon />
                    </InputAdornment>
                  ),
                },
              }}
              helperText="Amount you spent on this gambling activity"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              label="Win Amount (Optional)"
              value={winAmount}
              onChange={(e) => setWinAmount(e.target.value)}
              fullWidth
              type="number"
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon />
                    </InputAdornment>
                  ),
                },
              }}
              helperText="Amount you won from this activity (leave empty if no win)"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              helperText="Describe the gambling activity (e.g., 'Pull tabs at Joe's Bar', 'Lottery ticket')"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Autocomplete
              options={locations}
              getOptionLabel={(option) => option.name}
              value={selectedLocation}
              onChange={(event, newValue) => setSelectedLocation(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Location (Optional)"
                  helperText="Select where this gambling activity took place"
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <PlaceIcon />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <PlaceIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  {option.name}
                </Box>
              )}
            />
          </Box>

          {/* Net Result Display */}
          {(betAmount || winAmount) && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Net Result: 
                <Typography 
                  component="span" 
                  variant="body1" 
                  sx={{ 
                    ml: 1, 
                    fontWeight: 'bold',
                    color: netResult() >= 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {netResult() >= 0 ? '+' : ''}${netResult().toFixed(2)}
                </Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {netResult() >= 0 ? '🎉 You came out ahead!' : '💸 You spent more than you won'}
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          color="primary"
          sx={{ 
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'action.hover'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => { void handleSave(); }}
          variant="contained"
          color="primary"
          disabled={isLoading}
          sx={{ 
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              backgroundColor: 'primary.dark'
            },
            '&:disabled': {
              backgroundColor: 'action.disabledBackground',
              color: 'action.disabled'
            }
          }}
        >
          {isLoading ? 'Adding...' : 'Add Activity'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
