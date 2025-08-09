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
} from '@mui/material';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Budget } from './useTrackingData';

interface BudgetManagerProps {
  open: boolean;
  onClose: () => void;
  currentBudget: Budget | null;
  onBudgetUpdated: () => void;
  userId: string;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  open,
  onClose,
  currentBudget,
  onBudgetUpdated,
  userId,
}) => {
  const [weeklyLimit, setWeeklyLimit] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (currentBudget) {
      setWeeklyLimit(currentBudget.weeklyLimit.toString());
    } else {
      setWeeklyLimit('');
    }
  }, [currentBudget, open]);

  const handleSave = async () => {
    const limitValue = parseFloat(weeklyLimit);
    
    if (isNaN(limitValue) || limitValue <= 0) {
      setError('Please enter a valid weekly limit greater than $0');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (currentBudget) {
        // Update existing budget
        await updateDoc(doc(db, 'budgets', currentBudget.id), {
          weeklyLimit: limitValue,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new budget
        await addDoc(collection(db, 'budgets'), {
          userId,
          weeklyLimit: limitValue,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      onBudgetUpdated();
      onClose();
    } catch (err) {
      console.error('Error saving budget:', err);
      setError('Failed to save budget. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setWeeklyLimit(currentBudget?.weeklyLimit.toString() || '');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {currentBudget ? 'Edit Weekly Budget' : 'Set Weekly Budget'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set a weekly gambling budget to help track your spending and stay within your limits.
          </Typography>

          <TextField
            label="Weekly Gambling Budget"
            value={weeklyLimit}
            onChange={(e) => setWeeklyLimit(e.target.value)}
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
            sx={{ mb: 2 }}
            helperText="Enter the maximum amount you want to spend on gambling per week"
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {currentBudget && (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Current budget: ${currentBudget.weeklyLimit.toFixed(2)} per week
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last updated: {currentBudget.updatedAt?.toDate().toLocaleDateString() || 'Unknown'}
              </Typography>
            </Box>
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
          {isLoading ? 'Saving...' : currentBudget ? 'Update Budget' : 'Set Budget'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
