import React, { useState, useEffect } from 'react';
import {
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { 
  AttachMoney as MoneyIcon, 
  Place as PlaceIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { collection, addDoc, serverTimestamp, getDocs, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Capacitor } from '@capacitor/core';
import * as firestoreService from '../../services/firestoreService';
import dayjs, { Dayjs } from 'dayjs';

const isNative = Capacitor.isNativePlatform();
import WinLossToggle, { WinLossValue } from '../../components/WinLossToggle';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import SafeDialog from '../../components/SafeDialog';
import { Transaction } from './useTrackingData';

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
  editingTransaction?: Transaction | null;
  mode?: 'create' | 'edit';
  onDelete?: (transaction: Transaction) => void;
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
  editingTransaction = null,
  mode = 'create',
  onDelete,
}) => {
  const [resultType, setResultType] = useState<WinLossValue>('win');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [gameType, setGameType] = useState<string>('Pull Tabs');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const gameTypes = [
    'Pull Tabs',
    'E Tabs',
    'Pull Tab Racing',
    'Bingo',
    'Lottery',
    'Slots',
    'Blackjack',
    'Poker',
    'Horse Racing',
    'Craps',
    'Roulette',
    'Other'
  ];

  // Populate form when editing
  useEffect(() => {
    if (editingTransaction && mode === 'edit') {
      // Determine result type from transaction
      const isWin = editingTransaction.netAmount !== undefined 
        ? editingTransaction.netAmount >= 0 
        : editingTransaction.type === 'win';
      
      setResultType(isWin ? 'win' : 'loss');
      setAmount(editingTransaction.amount.toString());
      setDescription(editingTransaction.description || '');
      setGameType(editingTransaction.gameType || 'Pull Tabs');
      
      // Set date from transactionDate or createdAt
      const effectiveDate = editingTransaction.transactionDate?.toDate() || 
        (editingTransaction.createdAt ? editingTransaction.createdAt.toDate() : null);
      setSelectedDate(effectiveDate ? dayjs(effectiveDate) : dayjs());
      
      // Find and set location if it exists
      if (editingTransaction.location) {
        const foundLocation = locations.find(loc => loc.name === editingTransaction.location);
        setSelectedLocation(foundLocation || null);
      } else {
        setSelectedLocation(null);
      }
    } else {
      // Reset form for create mode
      setResultType('win');
      setAmount('');
      setDescription('');
      setGameType('Pull Tabs');
      setSelectedDate(dayjs());
      setSelectedLocation(null);
    }
  }, [editingTransaction, mode, locations]);

  // Fetch locations when dialog opens
  useEffect(() => {
    if (open) {
      const fetchLocations = async () => {
        try {
          if (isNative) {
            const locationData = await firestoreService.getLocations();
            setLocations(locationData.map(loc => ({ id: loc.id || '', name: (loc as Record<string, unknown>).name as string || '', address: (loc as Record<string, unknown>).address as string, latitude: (loc as Record<string, unknown>).latitude as number, longitude: (loc as Record<string, unknown>).longitude as number })));
          } else {
            const snapshot = await getDocs(collection(db, 'locations'));
            const locationData: Location[] = [];
            snapshot.forEach((doc) => {
              locationData.push({ id: doc.id, ...doc.data() } as Location);
            });
            setLocations(locationData);
          }
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
      const activityDescription = description.trim();
      
      // Calculate the net result (negative for loss, positive for win)
      const netAmount = resultType === 'win' ? amountValue : -amountValue;
      
      if (mode === 'edit' && editingTransaction) {
        // Update existing transaction
        if (isNative) {
          await firestoreService.updateTransaction(editingTransaction.id, {
            type: resultType,
            amount: amountValue,
            netAmount: netAmount,
            description: activityDescription,
            notes: activityDescription,
            gameType: gameType,
            location: selectedLocation?.name || '',
            locationId: selectedLocation?.id || '',
            date: transactionDate,
            transactionDate: transactionDate,
            weekStart: weekStart.toISOString(),
          });
        } else {
          const transactionRef = doc(db, 'transactions', editingTransaction.id);
          await updateDoc(transactionRef, {
            type: resultType,
            amount: amountValue,
            netAmount: netAmount,
            description: activityDescription,
            gameType: gameType,
            location: selectedLocation?.name || '',
            locationId: selectedLocation?.id || '',
            transactionDate: Timestamp.fromDate(transactionDate),
            weekStart: weekStart.toISOString(),
          });
        }
      } else {
        // Create a new transaction
        if (isNative) {
          await firestoreService.createTransaction({
            userId,
            type: resultType,
            amount: amountValue,
            netAmount: netAmount,
            description: activityDescription,
            notes: activityDescription,
            gameType: gameType,
            location: selectedLocation?.name || '',
            locationId: selectedLocation?.id || '',
            date: transactionDate,
            transactionDate: transactionDate,
            weekStart: weekStart.toISOString(),
          });
        } else {
          await addDoc(collection(db, 'transactions'), {
            userId,
            type: resultType,
            amount: amountValue,
            netAmount: netAmount,
            description: activityDescription,
            gameType: gameType,
            location: selectedLocation?.name || '',
            locationId: selectedLocation?.id || '',
            createdAt: serverTimestamp(),
            transactionDate: Timestamp.fromDate(transactionDate),
            weekStart: weekStart.toISOString(),
          });
        }
      }

      onTransactionAdded();
      handleClose();
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError(`Failed to ${mode === 'edit' ? 'update' : 'save'} transaction. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!editingTransaction || !onDelete) return;
    
    setShowDeleteConfirm(false);
    setIsLoading(true);
    setError('');
    
    try {
      if (isNative) {
        await firestoreService.deleteTransaction(editingTransaction.id);
      } else {
        await deleteDoc(doc(db, 'transactions', editingTransaction.id));
      }
      onDelete(editingTransaction);
      handleClose();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setGameType('Pull Tabs');
    setSelectedDate(dayjs());
    setSelectedLocation(null);
    setResultType('win');
    setError('');
    onClose();
  };

  return (
    <SafeDialog 
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
        {mode === 'edit' ? 'Edit Transaction' : 'Track Gambling Result'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {mode === 'edit' 
              ? 'Update the details of this gambling transaction.' 
              : 'Did you win or lose money from your gambling activity? Enter the total amount.'
            }
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
                    size: "small",
                    // helperText: "When did this gambling activity occur?",
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
              size="small"
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

          {/* Game Type Field */}
          <Box sx={{ mb: 3 }}>
            <Autocomplete
              options={gameTypes}
              value={gameType}
              onChange={(event, newValue) => setGameType(newValue || 'Pull Tabs')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Game Type"
                  size="small"
                  required
                  helperText="Select the type of gambling activity"
                />
              )}
              disableClearable
            />
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
              size="small"
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
                  size="small"
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
      <DialogActions sx={{ flexDirection: mode === 'edit' ? 'row' : 'row', gap: 1 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          color="primary"
          sx={{ 
            borderColor: 'primary.main',
            color: 'primary.main',
            borderRadius: 3,
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'action.hover'
            }
          }}
        >
          Cancel
        </Button>
        {mode === 'edit' && onDelete && (
          <Button
            onClick={handleDeleteConfirm}
            variant="outlined"
            disabled={isLoading}
            startIcon={<DeleteIcon />}
            sx={{ 
              borderColor: 'white',
              borderRadius: 3,
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              },
              '&:disabled': {
                borderColor: 'action.disabledBackground',
                color: 'action.disabled'
              }
            }}
          >
            Delete
          </Button>
        )}
        <Button
          onClick={() => { void handleSave(); }}
          variant="contained"
          size='small'
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
          {isLoading 
            ? (mode === 'edit' ? 'Updating...' : 'Adding...') 
            : (mode === 'edit' ? 'Update Transaction' : `Record ${resultType === 'win' ? 'Win' : 'Loss'}`)
          }
        </Button>
      </DialogActions>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
        onConfirm={() => { void handleDelete(); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </SafeDialog>
  );
};
