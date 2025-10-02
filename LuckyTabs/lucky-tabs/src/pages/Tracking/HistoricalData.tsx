import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Fade,
  Stack,
} from '@mui/material';
import {
  Casino as CasinoIcon,
} from '@mui/icons-material';
import { HistoricalWeek, Transaction } from './useTrackingData';
import { TransactionManager } from './TransactionManager';
import { TransactionCard } from './TransactionCard';

interface HistoricalDataProps {
  historicalData: HistoricalWeek[];
  onRefresh: () => void;
}

export const HistoricalData: React.FC<HistoricalDataProps> = ({
  historicalData,
  onRefresh,
}) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Get all transactions from all weeks, sorted by date (newest first)
  const allTransactions = historicalData
    .flatMap(week => week.transactions)
    .sort((a, b) => {
      const dateA = a.transactionDate?.toDate() || (a.createdAt ? a.createdAt.toDate() : null);
      const dateB = b.transactionDate?.toDate() || (b.createdAt ? b.createdAt.toDate() : null);
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    });

  // Calculate overall statistics
  const totalAllTimeSpent = historicalData.reduce((sum, week) => sum + week.totalSpent, 0);
  const totalAllTimeWon = historicalData.reduce((sum, week) => sum + week.totalWon, 0);
  const totalAllTimeNet = totalAllTimeWon - totalAllTimeSpent;
  const totalTransactions = allTransactions.length;

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleTransactionUpdated = () => {
    setSnackbar({
      open: true,
      message: 'Transaction updated successfully!',
      severity: 'success'
    });
    setEditingTransaction(null);
    onRefresh();
  };

  const handleEditClose = () => {
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (_transaction: Transaction) => {
    setSnackbar({
      open: true,
      message: 'Transaction deleted successfully!',
      severity: 'success'
    });
    setEditingTransaction(null);
    onRefresh();
  };

  return (
    <Box>
      {/* Overall Statistics */}
      {historicalData.length > 0 && (
        <Card sx={{ 
          mb: 2, 
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Stack spacing={2}>
            <Typography variant="h6" textAlign="center" fontWeight={600}>
              All-Time Summary
            </Typography>
            
            <Stack direction="row" spacing={3} justifyContent="space-around">
              <Stack alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Net Result
                </Typography>
                <Typography 
                  variant="h5" 
                  color={totalAllTimeNet >= 0 ? 'success.main' : 'error.main'}
                  fontWeight={700}
                >
                  {totalAllTimeNet >= 0 ? '+' : ''}${Math.abs(totalAllTimeNet).toLocaleString()}
                </Typography>
              </Stack>
              
              <Stack alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Transactions
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {totalTransactions}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      )}

      {/* Transaction List */}
      <Box>
                <Typography 
          variant="h6" 
          textAlign="center" 
          fontWeight={600}
          sx={{ mb: 2 }}
        >
          Your Transactions
        </Typography>
        
        {allTransactions.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <CasinoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No transactions yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start tracking your gambling activity to see your history here
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={0}>
            {allTransactions.map((transaction) => (
              <Fade in key={transaction.id} timeout={300}>
                <div>
                  <TransactionCard
                    transaction={transaction}
                    onEdit={() => handleEditTransaction(transaction)}
                  />
                </div>
              </Fade>
            ))}
          </Stack>
        )}
      </Box>

      {/* Edit Transaction using TransactionManager */}
      <TransactionManager
        open={editingTransaction !== null}
        onClose={handleEditClose}
        onTransactionAdded={handleTransactionUpdated}
        userId={editingTransaction?.userId || ''}
        editingTransaction={editingTransaction}
        mode="edit"
        onDelete={handleDeleteTransaction}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
