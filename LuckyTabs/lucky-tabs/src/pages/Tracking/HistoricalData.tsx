import React from 'react';
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
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { HistoricalWeek } from './useTrackingData';
import { formatDateRange, formatCurrency } from '../../utils/formatters';

interface HistoricalDataProps {
  historicalData: HistoricalWeek[];
  onRefresh: () => void;
}

export const HistoricalData: React.FC<HistoricalDataProps> = ({
  historicalData,
}) => {

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
                  Total Spent
                </Typography>
                <Typography variant="h6" color="error.main">
                  {formatCurrency(totalAllTimeSpent)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Won
                </Typography>
                <Typography variant="h6" color="success.main">
                  {formatCurrency(totalAllTimeWon)}
                </Typography>
              </Box>
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
                    <TableCell align="right">Spent</TableCell>
                    <TableCell align="right">Won</TableCell>
                    <TableCell align="right">Net Result</TableCell>
                    <TableCell align="center">Transactions</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historicalData.map((week, index) => {
                    const isCurrentWeek = index === 0; // First item is current week
                    const isPositive = week.netResult >= 0;
                    
                    return (
                      <TableRow 
                        key={`${week.weekStart.getTime()}`}
                        sx={{ 
                          backgroundColor: isCurrentWeek ? 'action.hover' : 'inherit',
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
                          <Typography color="error.main">
                            {formatCurrency(week.totalSpent)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography color="success.main">
                            {formatCurrency(week.totalWon)}
                          </Typography>
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
                          {week.transactionCount}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={isPositive ? 'Profit' : 'Loss'}
                            color={isPositive ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                          />
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
    </Box>
  );
};
