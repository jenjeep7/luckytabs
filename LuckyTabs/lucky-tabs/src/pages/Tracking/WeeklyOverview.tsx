import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp as WinIcon,
  TrendingDown as LossIcon,
  Remove as EvenIcon,
} from '@mui/icons-material';
import { WeeklyData, Budget, Transaction } from './useTrackingData';

interface WeeklyOverviewProps {
  weeklyData: WeeklyData;
  userBudget: Budget | null;
  onRefresh: () => void;
}

interface GroupedTransaction {
  id: string;
  betAmount: number;
  winAmount: number;
  netResult: number;
  description?: string;
  location?: string;
  createdAt: Date;
  isProfit: boolean;
  isEven: boolean;
}

export const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({
  weeklyData,
  userBudget,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Group transactions that occurred at the same time (within 1 minute)
  const groupTransactions = (transactions: Transaction[]): GroupedTransaction[] => {
    const grouped: GroupedTransaction[] = [];
    const processed = new Set<string>();

    const validTransactions = transactions.filter(t => t.createdAt);
    
    for (const transaction of validTransactions) {
      if (processed.has(transaction.id) || !transaction.createdAt) continue;

      const transactionTime = transaction.createdAt.toDate();
      const relatedTransactions = validTransactions.filter(t => {
        if (!t.createdAt || processed.has(t.id)) return false;
        
        const timeDiff = Math.abs(t.createdAt.toDate().getTime() - transactionTime.getTime());
        return timeDiff <= 60000; // Within 1 minute
      });

      // Mark all related transactions as processed
      relatedTransactions.forEach(t => processed.add(t.id));

      // Calculate totals - support both old format (bet/win) and new format (win/loss with netAmount)
      let betAmount = 0;
      let winAmount = 0;
      let netResult = 0;
      let description = 'Gambling Activity';
      let location = '';

      // Handle new format transactions
      const newFormatTransactions = relatedTransactions.filter(t => t.netAmount !== undefined);
      if (newFormatTransactions.length > 0) {
        // Use the new format logic
        newFormatTransactions.forEach(t => {
          const netAmount = t.netAmount ?? 0;
          if (netAmount < 0) {
            betAmount += Math.abs(netAmount);
          } else if (netAmount > 0) {
            winAmount += netAmount;
          }
        });
        netResult = winAmount - betAmount;
        
        // Use the description and location from any transaction
        const transactionWithDetails = newFormatTransactions.find(t => t.description) || newFormatTransactions[0];
        description = transactionWithDetails?.description || 'Gambling Activity';
        location = transactionWithDetails?.location || '';
      } else {
        // Handle old format transactions
        const betTransaction = relatedTransactions.find(t => t.type === 'bet');
        const winTransaction = relatedTransactions.find(t => t.type === 'win');

        betAmount = betTransaction?.amount || 0;
        winAmount = winTransaction?.amount || 0;
        netResult = winAmount - betAmount;

        // Use the description from either transaction, preferring bet if both exist
        description = betTransaction?.description || winTransaction?.description || 'Gambling Activity';
        location = betTransaction?.location || winTransaction?.location || '';
      }

      grouped.push({
        id: `group-${relatedTransactions.map(t => t.id).join('-')}`,
        betAmount,
        winAmount,
        netResult,
        description,
        location,
        createdAt: transactionTime,
        isProfit: netResult > 0,
        isEven: netResult === 0,
      });
    }

    return grouped.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const groupedTransactions = groupTransactions(weeklyData.transactions);

  const netLoss = Math.max(0, -weeklyData.netResult); // Only count losses, not profits
  const budgetProgress = userBudget 
    ? Math.min((netLoss / userBudget.weeklyLimit) * 100, 100)
    : 0;

  const isOverBudget = userBudget && netLoss > userBudget.weeklyLimit;

  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Week of {formatDate(weeklyData.weekStart)} - {formatDate(weeklyData.weekEnd)}
      </Typography>

      {/* Budget Progress */}
      {userBudget && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Budget Progress
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {netLoss > 0 ? `$${netLoss.toFixed(2)} net loss` : 'No net loss'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${userBudget.weeklyLimit.toFixed(2)} budget
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={budgetProgress}
                color={isOverBudget ? 'error' : budgetProgress > 80 ? 'warning' : 'success'}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <Typography variant="body2" color={isOverBudget ? 'error.main' : 'text.secondary'}>
                  {budgetProgress.toFixed(1)}% of weekly budget used
                </Typography>
              </Box>
            </Box>
            {isOverBudget && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Your net losses have exceeded your weekly budget by ${(netLoss - userBudget.weeklyLimit).toFixed(2)}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
            {`This Week's Activity`}
          </Typography>
          
          {groupedTransactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No transactions recorded this week
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Add your first transaction to start tracking your activity
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
              {groupedTransactions.map((transaction) => {
                return (
                  <Box
                    key={transaction.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      minHeight: 60,
                    }}
                  >
                    {/* Left side - Icon and basic info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                      {transaction.isProfit ? (
                        <WinIcon color="success" sx={{ flexShrink: 0 }} />
                      ) : transaction.isEven ? (
                        <EvenIcon sx={{ color: 'warning.main', flexShrink: 0 }} />
                      ) : (
                        <LossIcon color="error" sx={{ flexShrink: 0 }} />
                      )}
                      
                      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', flexShrink: 0 }}>
                            ${transaction.betAmount.toFixed(2)}
                          </Typography>
                          {transaction.winAmount > 0 && (
                            <>
                              <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>→</Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  flexShrink: 0,
                                  color: transaction.winAmount > transaction.betAmount ? 'success.main' : transaction.winAmount === transaction.betAmount ? 'text.primary' : 'error.main'
                                }}
                              >
                                ${transaction.winAmount.toFixed(2)}
                              </Typography>
                            </>
                          )}
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {formatDate(transaction.createdAt)} {formatTime(transaction.createdAt)}
                          {transaction.location && ` • ${transaction.location}`}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Right side - Net result
                    <Box sx={{ textAlign: 'right', ml: 1, flexShrink: 0, minWidth: 60 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: transaction.isProfit ? 'success.main' : transaction.isEven ? 'warning.main' : 'error.main',
                          fontWeight: 'bold'
                        }}
                      >
                        {transaction.isProfit ? '+' : transaction.isEven ? '' : ''}${Math.abs(transaction.netResult).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {transaction.isProfit ? 'Profit' : transaction.isEven ? 'Even' : 'Loss'}
                      </Typography>
                    </Box> */}
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
