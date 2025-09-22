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
  Chip,
} from '@mui/material';
import { 
  AttachMoney as MoneyIcon, 
  Place as PlaceIcon,
  TrendingUp as WinIcon,
  TrendingDown as LossIcon
} from '@mui/icons-material';
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
  const [resultType, setResultType] = useState<'win' | 'loss'>('win');
  const [amount, setAmount] = useState<string>('');
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
    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount greater than $0');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const now = new Date();
      const weekStart = getStartOfWeek(now);
      const activityDescription = description.trim() || 'Gambling activity';
      
      // Calculate the net result (negative for loss, positive for win)
      const netAmount = resultType === 'win' ? amountValue : -amountValue;
      
      // Create a single transaction with the net result
      await addDoc(collection(db, 'transactions'), {
        userId,
        type: resultType,
        amount: amountValue, // Store the absolute amount
        netAmount: netAmount, // Store the net result
        description: activityDescription,
        location: selectedLocation?.name || '',
        locationId: selectedLocation?.id || '',
        createdAt: serverTimestamp(),
        weekStart: weekStart.toISOString(),
      });

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
    setAmount('');
    setDescription('');
    setSelectedLocation(null);
    setResultType('win');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Track Gambling Result
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Did you win or lose money from your gambling activity? Enter the total amount.
          </Typography>

          {/* Win/Loss Toggle */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Button
                onClick={() => setResultType('win')}
                startIcon={<WinIcon />}
                size="small"
                disableRipple
                sx={{
                  flex: 1,
                  color: resultType === 'win' ? '#fff !important' : '#00C853 !important',
                  backgroundColor: resultType === 'win' ? '#00C853 !important' : 'transparent !important',
                  border: '2px solid #00C853 !important',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: resultType === 'win' ? '#00A843 !important' : 'rgba(0, 200, 83, 0.08) !important',
                    border: '2px solid #00C853 !important',
                  },
                  '&:active': {
                    backgroundColor: resultType === 'win' ? '#00A843 !important' : 'rgba(0, 200, 83, 0.12) !important',
                  },
                  '&:focus': {
                    backgroundColor: resultType === 'win' ? '#00C853 !important' : 'transparent !important',
                  },
                  // Override all possible Material-UI states
                  '&.Mui-focusVisible': {
                    backgroundColor: resultType === 'win' ? '#00C853 !important' : 'transparent !important',
                  },
                  '&.MuiButton-root': {
                    backgroundColor: resultType === 'win' ? '#00C853 !important' : 'transparent !important',
                  }
                }}
              >
                I Won Money
              </Button>
              <Button
                onClick={() => setResultType('loss')}
                startIcon={<LossIcon />}
                size="small"
                disableRipple
                sx={{
                  flex: 1,
                  color: resultType === 'loss' ? '#fff !important' : '#F44336 !important',
                  backgroundColor: resultType === 'loss' ? '#F44336 !important' : 'transparent !important',
                  border: '2px solid #F44336 !important',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: resultType === 'loss' ? '#D32F2F !important' : 'rgba(244, 67, 54, 0.08) !important',
                    border: '2px solid #F44336 !important',
                  },
                  '&:active': {
                    backgroundColor: resultType === 'loss' ? '#D32F2F !important' : 'rgba(244, 67, 54, 0.12) !important',
                  },
                  '&:focus': {
                    backgroundColor: resultType === 'loss' ? '#F44336 !important' : 'transparent !important',
                  },
                  // Override all possible Material-UI states
                  '&.Mui-focusVisible': {
                    backgroundColor: resultType === 'loss' ? '#F44336 !important' : 'transparent !important',
                  },
                  '&.MuiButton-root': {
                    backgroundColor: resultType === 'loss' ? '#F44336 !important' : 'transparent !important',
                  }
                }}
              >
                I Lost Money
              </Button>
            </Box>
          </Box>

          {/* Amount Field */}
          <Box sx={{ mb: 3 }}>
            <TextField
              label={resultType === 'win' ? 'Amount Won' : 'Amount Lost'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
                      <MoneyIcon sx={{ color: resultType === 'win' ? 'success.main' : 'error.main' }} />
                    </InputAdornment>
                  ),
                },
              }}
              helperText={
                resultType === 'win' 
                  ? "Enter the total amount you won (after accounting for what you spent)"
                  : "Enter the total amount you lost"
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: resultType === 'win' ? 'success.main' : 'error.main',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: resultType === 'win' ? 'success.main' : 'error.main',
                }
              }}
            />
          </Box>

          {/* Result Preview */}
          {amount && (
            <Box sx={{ 
              p: 2, 
              bgcolor: resultType === 'win' ? 'success.light' : 'error.light', 
              borderRadius: 1, 
              mb: 3,
              border: 1,
              borderColor: resultType === 'win' ? 'success.main' : 'error.main'
            }}>
              <Typography variant="body2" sx={{ color: resultType === 'win' ? 'success.dark' : 'error.dark' }}>
                Net Result: 
                <Typography 
                  component="span" 
                  variant="h6" 
                  sx={{ 
                    ml: 1, 
                    fontWeight: 'bold',
                    color: resultType === 'win' ? 'success.dark' : 'error.dark'
                  }}
                >
                  {resultType === 'win' ? '+' : '-'}${parseFloat(amount || '0').toFixed(2)}
                </Typography>
              </Typography>
              <Typography variant="caption" sx={{ color: resultType === 'win' ? 'success.dark' : 'error.dark' }}>
                {resultType === 'win' ? '🎉 Great job!' : '💸 Better luck next time!'}
              </Typography>
            </Box>
          )}

          {/* Quick Amount Buttons */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Quick amounts:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[5, 10, 20, 50, 100].map((quickAmount) => (
                <Chip
                  key={quickAmount}
                  label={`$${quickAmount}`}
                  onClick={() => setAmount(quickAmount.toString())}
                  clickable
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>

          {/* Description Field */}
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

          {/* Location Field */}
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
          disabled={isLoading || !amount}
          sx={{ 
            backgroundColor: resultType === 'win' ? 'success.main' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: resultType === 'win' ? 'success.dark' : 'error.dark'
            },
            '&:disabled': {
              backgroundColor: 'action.disabledBackground',
              color: 'action.disabled'
            }
          }}
        >
          {isLoading ? 'Adding...' : `Record ${resultType === 'win' ? 'Win' : 'Loss'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
