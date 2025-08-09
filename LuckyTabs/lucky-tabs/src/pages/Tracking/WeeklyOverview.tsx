import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as WinIcon,
  TrendingDown as LossIcon,
  AccessTime as TimeIcon,
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

      // Calculate totals
      const betTransaction = relatedTransactions.find(t => t.type === 'bet');
      const winTransaction = relatedTransactions.find(t => t.type === 'win');

      const betAmount = betTransaction?.amount || 0;
      const winAmount = winTransaction?.amount || 0;
      const netResult = winAmount - betAmount;

      // Use the description from either transaction, preferring bet if both exist
      const description = betTransaction?.description || winTransaction?.description || 'Gambling Activity';
      const location = betTransaction?.location || winTransaction?.location;

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
      <Typography variant="h6" sx={{ mb: 2 }}>
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
        <CardContent>
          <Typography variant="h6" gutterBottom>
            This Week&apos;s Activity
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
            <List>
              {groupedTransactions.map((transaction) => {
                return (
                  <ListItem key={transaction.id} divider>
                    <ListItemIcon>
                      {transaction.isProfit ? (
                        <WinIcon color="success" />
                      ) : transaction.isEven ? (
                        <EvenIcon sx={{ color: 'warning.main' }} />
                      ) : (
                        <LossIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      slotProps={{
                        primary: { component: 'div' },
                        secondary: { component: 'div' }
                      }}
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" component="span">
                            {transaction.description}
                          </Typography>
                          <Chip
                            label={transaction.isProfit ? 'Profit' : transaction.isEven ? 'Even' : 'Loss'}
                            color={transaction.isProfit ? 'success' : transaction.isEven ? 'warning' : 'error'}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                              <MoneyIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                              Bet: ${transaction.betAmount.toFixed(2)}
                            </Typography>
                            {transaction.winAmount > 0 && (
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <WinIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                Won: ${transaction.winAmount.toFixed(2)}
                              </Typography>
                            )}
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 0.5,
                              color: transaction.isProfit ? 'success.main' : transaction.isEven ? 'warning.main' : 'error.main',
                              fontWeight: 'medium'
                            }}
                          >
                            Net: {transaction.isProfit ? '+' : transaction.isEven ? '' : ''}${transaction.netResult.toFixed(2)}
                          </Typography>
                          {transaction.location && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              📍 {transaction.location}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                            {formatDate(transaction.createdAt)} at {formatTime(transaction.createdAt)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
