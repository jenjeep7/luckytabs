import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { HistoricalWeek } from './useTrackingData';
import { formatDateRange, formatCurrency } from '../../utils/formatters';
import { Timestamp } from 'firebase/firestore';

interface HistoricalDataProps {
  historicalData: HistoricalWeek[];
  onRefresh: () => void;
}

export const HistoricalData: React.FC<HistoricalDataProps> = ({
  historicalData,
}) => {
  const [selectedWeek, setSelectedWeek] = useState<HistoricalWeek | null>(null);

  const handleWeekClick = (week: HistoricalWeek) => {
    setSelectedWeek(week);
  };

  const handleCloseModal = () => {
    setSelectedWeek(null);
  };

  const formatTransactionDate = (createdAt: Timestamp | null) => {
    if (!createdAt) return 'Unknown date';
    const date = createdAt.toDate();
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Calculate overall statistics
  const totalAllTimeSpent = historicalData.reduce((sum, week) => sum + week.totalSpent, 0);
  const totalAllTimeWon = historicalData.reduce((sum, week) => sum + week.totalWon, 0);
  const totalAllTimeNet = totalAllTimeWon - totalAllTimeSpent;
  const totalWeeks = historicalData.length;

  return (
    <Box>
      {/* Overall Statistics */}
      {historicalData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All-Time Summary
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Net Result
                </Typography>
                <Typography 
                  variant="h6" 
                  color={totalAllTimeNet >= 0 ? 'success.main' : 'error.main'}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  {totalAllTimeNet >= 0 ? (
                    <TrendingUpIcon fontSize="small" />
                  ) : (
                    <TrendingDownIcon fontSize="small" />
                  )}
                  {totalAllTimeNet >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalAllTimeNet))}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Weeks Tracked
                </Typography>
                <Typography variant="h6">
                  {totalWeeks}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Historical Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Typography variant="h6" gutterBottom>
            Weekly History
          </Typography>
          
          {historicalData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No historical data available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Start tracking your gambling activity to see weekly summaries here
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table sx={{
                '& .MuiTableCell-root': {
                  padding: '8px 12px', // Reduced from default 16px
                }
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Week</TableCell>
                    <TableCell align="right">Net Result</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Transactions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historicalData.map((week) => {
                    // Check if this week contains today's date
                    const today = new Date();
                    const isCurrentWeek = today >= week.weekStart && today <= week.weekEnd;
                    const isPositive = week.netResult >= 0;
                    
                    return (
                      <TableRow 
                        key={`${week.weekStart.getTime()}`}
                        onClick={() => handleWeekClick(week)}
                        sx={{ 
                          backgroundColor: isCurrentWeek ? 'action.hover' : 'inherit',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: isCurrentWeek ? 'action.selected' : 'action.hover',
                          },
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {formatDateRange(week.weekStart, week.weekEnd)}
                            </Typography>
                            {isCurrentWeek && (
                              <Chip
                                label="Current Week"
                                size="small"
                                color="primary"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            color={isPositive ? 'success.main' : 'error.main'}
                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}
                          >
                            {isPositive ? (
                              <TrendingUpIcon fontSize="small" />
                            ) : (
                              <TrendingDownIcon fontSize="small" />
                            )}
                            {isPositive ? '+' : ''}{formatCurrency(Math.abs(week.netResult))}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={isPositive ? 'Profit' : 'Loss'}
                            color={isPositive ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {week.transactionCount}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      <Dialog 
        open={selectedWeek !== null} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedWeek && (
            <Box>
              <Typography variant="h6">
                Week of {formatDateRange(selectedWeek.weekStart, selectedWeek.weekEnd)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedWeek.transactionCount} transaction{selectedWeek.transactionCount !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedWeek && selectedWeek.transactions.length > 0 ? (
            <List>
              {selectedWeek.transactions
                .sort((a, b) => {
                  if (!a.createdAt || !b.createdAt) return 0;
                  return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
                })
                .map((transaction, index) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={
                                  transaction.netAmount !== undefined 
                                    ? (transaction.netAmount < 0 ? 'Loss' : 'Win')
                                    : (transaction.type === 'bet' ? 'Bet' : 'Win')
                                }
                                color={
                                  transaction.netAmount !== undefined
                                    ? (transaction.netAmount < 0 ? 'error' : 'success')
                                    : (transaction.type === 'bet' ? 'error' : 'success')
                                }
                                size="small"
                                variant="outlined"
                              />
                              {transaction.description && (
                                <Typography variant="body2">
                                  {transaction.description}
                                </Typography>
                              )}
                            </Box>
                            <Typography 
                              variant="body1" 
                              fontWeight="bold"
                              color={
                                transaction.netAmount !== undefined
                                  ? (transaction.netAmount < 0 ? 'error.main' : 'success.main')
                                  : (transaction.type === 'bet' ? 'error.main' : 'success.main')
                              }
                            >
                              {transaction.netAmount !== undefined 
                                ? (transaction.netAmount >= 0 ? '+' : '') + formatCurrency(Math.abs(transaction.netAmount))
                                : (transaction.type === 'bet' ? '-' : '+') + formatCurrency(transaction.amount)
                              }
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <span style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                            <Typography variant="body2" color="text.secondary" component="span">
                              {formatTransactionDate(transaction.createdAt)}
                            </Typography>
                            {transaction.location && (
                              <Typography variant="body2" color="text.secondary" component="span">
                                📍 {transaction.location}
                              </Typography>
                            )}
                          </span>
                        }
                      />
                    </ListItem>
                    {index < selectedWeek.transactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
            </List>
          ) : (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No transactions for this week
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
