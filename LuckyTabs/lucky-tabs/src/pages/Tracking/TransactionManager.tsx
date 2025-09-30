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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { 
  AttachMoney as MoneyIcon, 
  Place as PlaceIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { collection, addDoc, serverTimestamp, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import dayjs, { Dayjs } from 'dayjs';
import WinLossToggle, { WinLossValue } from '../../components/WinLossToggle';

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
  const [resultType, setResultType] = useState<WinLossValue>('win');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
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

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const transactionDate = selectedDate.toDate();
      const weekStart = getStartOfWeek(transactionDate);
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
        createdAt: serverTimestamp(), // When the record was created in the system
        transactionDate: Timestamp.fromDate(transactionDate), // Store as Firestore Timestamp
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
    setSelectedDate(dayjs());
    setSelectedLocation(null);
    setResultType('win');
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth={false}
      fullScreen
      sx={{
        '& .MuiDialog-paper': {
          m: 0,
          width: '100%',
          height: '100%',
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>
        Track Gambling Result
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Did you win or lose money from your gambling activity? Enter the total amount.
          </Typography>
  {/* Date Field */}
          <Box sx={{ mb: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date of Activity"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                maxDate={dayjs()}
                slots={{
                  textField: TextField,
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    helperText: "When did this gambling activity occur?",
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* Win/Loss Toggle */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              What happened?
            </Typography>
            <WinLossToggle 
              value={resultType}
              onChange={setResultType}
              fullWidth
            />
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
              backgroundColor: 'transparent',
              borderRadius: 1, 
              mb: 3,
              border: 2,
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
          disabled={isLoading || !amount || !selectedDate}
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
