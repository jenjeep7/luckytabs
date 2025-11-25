import React, { useState, useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  InputAdornment,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { 
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { FrogIcon } from '../../components/FrogIcon';
import { collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import dayjs, { Dayjs } from 'dayjs';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import SafeDialog from '../../components/SafeDialog';
import { SavingsEntry } from './useFrugalData';

interface SavingsManagerProps {
  open: boolean;
  onClose: () => void;
  onSavingsAdded: () => void;
  userId: string;
  editingEntry?: SavingsEntry | null;
  mode?: 'create' | 'edit';
  onDelete?: (entry: SavingsEntry) => void;
}

export const SavingsManager: React.FC<SavingsManagerProps> = ({
  open,
  onClose,
  onSavingsAdded,
  userId,
  editingEntry = null,
  mode = 'create',
  onDelete,
}) => {
  const [itemName, setItemName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food & Drink');
  const [description, setDescription] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [status, setStatus] = useState<'pending' | 'saved' | 'missed'>('pending');
  const [destination, setDestination] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const categories = [
    'Food & Drink',
    'Coffee & Snacks',
    'Fast Food',
    'Restaurants',
    'Shopping',
    'Entertainment',
    'Transportation',
    'Subscriptions',
    'Impulse Buys',
    'Other'
  ];

  const destinations = [
    'Bank Savings',
    'Goal',
  ];

  const commonItems = [
    'Starbucks Coffee',
    'Fast Food Meal',
    'Restaurant Dinner',
    'Movie Ticket',
    'Snacks',
    'Impulse Purchase',
    'Online Shopping',
    'Uber/Lyft Ride',
    'Subscription Service',
    'Vending Machine',
  ];

  // Populate form when editing
  useEffect(() => {
    if (editingEntry && mode === 'edit') {
      setItemName(editingEntry.itemName);
      setAmount(editingEntry.amount.toString());
      setCategory(editingEntry.category);
      setDescription(editingEntry.description || '');
      setStatus(editingEntry.status || 'pending');
      setDestination(editingEntry.destination || '');
      
      const effectiveDate = editingEntry.savedDate?.toDate() || 
        (editingEntry.createdAt ? editingEntry.createdAt.toDate() : null);
      setSelectedDate(effectiveDate ? dayjs(effectiveDate) : dayjs());
    } else {
      // Reset form for create mode
      setItemName('');
      setAmount('');
      setCategory('Food & Drink');
      setDescription('');
      setStatus('pending');
      setDestination('');
      setSelectedDate(dayjs());
    }
  }, [editingEntry, mode]);

  const handleSave = async () => {
    const amountValue = parseFloat(amount);
    
    if (!itemName.trim()) {
      setError('Please enter what you didn\'t buy');
      return;
    }

    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const savingsData = {
        userId,
        itemName: itemName.trim(),
        amount: amountValue,
        category,
        description: description.trim(),
        savedDate: Timestamp.fromDate(selectedDate.toDate()),
        status,
        destination: status === 'saved' ? destination : '',
      };

      if (mode === 'edit' && editingEntry) {
        // Update existing entry
        const entryRef = doc(db, 'frugalSavings', editingEntry.id);
        await updateDoc(entryRef, {
          ...savingsData,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new entry
        await addDoc(collection(db, 'frugalSavings'), {
          ...savingsData,
          createdAt: serverTimestamp(),
        });
      }

      onSavingsAdded();
      handleClose();
    } catch (err) {
      console.error('Error saving entry:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!editingEntry) return;

    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'frugalSavings', editingEntry.id));
      
      if (onDelete) {
        onDelete(editingEntry);
      }
      
      onSavingsAdded();
      handleClose();
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Failed to delete entry');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleClose = () => {
    setItemName('');
    setAmount('');
    setCategory('Food & Drink');
    setDescription('');
    setStatus('pending');
    setDestination('');
    setSelectedDate(dayjs());
    setError('');
    onClose();
  };

  return (
    <>
      <SafeDialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {mode === 'edit' ? 'Edit Entry' : 'What Did You NOT Buy?'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Autocomplete
              freeSolo
              options={commonItems}
              value={itemName}
              onChange={(_, newValue) => setItemName(newValue || '')}
              onInputChange={(_, newInputValue) => setItemName(newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="What Did You NOT Buy?"
                  placeholder="e.g., Starbucks Coffee"
                  required
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <FrogIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <TextField
              label="Amount NOT Spent"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    $
                  </InputAdornment>
                ),
              }}
              inputProps={{ step: '0.01', min: '0' }}
            />

            <Autocomplete
              options={categories}
              value={category}
              onChange={(_, newValue) => setCategory(newValue || 'Other')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  required
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'pending' || val === 'saved' || val === 'missed') {
                    setStatus(val);
                  }
                }}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="saved">Saved</MenuItem>
                <MenuItem value="missed">Missed Opportunity</MenuItem>
              </Select>
            </FormControl>

            {status === 'saved' && (
              <Autocomplete
                freeSolo
                options={destinations}
                value={destination}
                onChange={(_, newValue) => setDestination(newValue || '')}
                onInputChange={(_, newInputValue) => setDestination(newInputValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Where Did It Go?"
                    placeholder="e.g., Bank Savings, Goal"
                    helperText="Where did you move the money?"
                  />
                )}
              />
            )}

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{
                  textField: {
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

            <TextField
              label="Notes (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              placeholder="Why did you skip this purchase?"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: mode === 'edit' ? 'space-between' : 'flex-end' }}>
          {mode === 'edit' && (
            <Button
              onClick={handleDelete}
              color="error"
              startIcon={<DeleteIcon />}
              disabled={isLoading}
            >
              Delete
            </Button>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={() => void handleSave()} 
              variant="contained" 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : mode === 'edit' ? 'Update' : 'Save'}
            </Button>
          </Box>
        </DialogActions>
      </SafeDialog>

      <ConfirmationDialog
        open={showDeleteConfirm}
        title="Delete Savings Entry"
        message="Are you sure you want to delete this savings entry? This action cannot be undone."
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};
