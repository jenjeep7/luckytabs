import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Edit as EditIcon,
  Place as PlaceIcon,
} from '@mui/icons-material';
import { Transaction } from './useTrackingData';
import { formatCurrency } from '../../utils/formatters';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onEdit }) => {
  const isWin = transaction.netAmount !== undefined 
    ? transaction.netAmount >= 0 
    : transaction.type === 'win';
  
  const amount = transaction.netAmount !== undefined 
    ? Math.abs(transaction.netAmount)
    : transaction.amount;

  const formatTransactionDate = (transaction: Transaction) => {
    const effectiveDate = transaction.transactionDate?.toDate() || 
      (transaction.createdAt ? transaction.createdAt.toDate() : null);
    if (!effectiveDate) return 'Unknown date';
    return effectiveDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        }
      }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Box>
          {/* Top row - Icon, main info and amount */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
            {/* Left side - Icon and basic info */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1, minWidth: 0 }}>
              <Box sx={{ mt: 0.5, flexShrink: 0 }}>
                {isWin ? (
                  <TrendingUpIcon 
                    sx={{ 
                      fontSize: 24, 
                      color: 'success.main' 
                    }} 
                  />
                ) : (
                  <TrendingDownIcon 
                    sx={{ 
                      fontSize: 24, 
                      color: 'error.main' 
                    }} 
                  />
                )}
              </Box>
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                  <Chip
                    label={isWin ? 'Won' : 'Lost'}
                    color={isWin ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.65rem', height: '20px' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatTransactionDate(transaction)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right side - Amount (always visible) */}
            <Box sx={{ flexShrink: 0, ml: 2 }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: isWin ? 'success.main' : 'error.main',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                {isWin ? '+' : '-'}{formatCurrency(amount)}
              </Typography>
            </Box>
          </Box>

          {/* Description row - full width when present */}
          {transaction.description && (
            <Box sx={{ mb: 1 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 400,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto',
                  fontSize: '0.8rem',
                  lineHeight: 1.3
                }}
              >
                {transaction.description}
              </Typography>
            </Box>
          )}
          
          {/* Bottom row - Location and actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Location */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {transaction.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PlaceIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.75rem'
                    }}
                  >
                    {transaction.location}
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Actions - always on the right */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0, ml: 2 }}>
              <EditIcon 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                sx={{ 
                  fontSize: 20,
                  color: 'white',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: '50%',
                  padding: 0.4,
                  cursor: 'pointer',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};