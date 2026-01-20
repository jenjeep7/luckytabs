import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { SavingsEntry } from './useFrugalData';
import { formatCurrency } from '../../utils/formatters';

interface SavingsCardProps {
  entry: SavingsEntry;
  onEdit: (entry: SavingsEntry) => void;
}

export const SavingsCard: React.FC<SavingsCardProps> = ({ entry, onEdit }) => {
  const date = entry.savedDate.toDate();
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
  });

  const getStatusColor = (): 'success' | 'warning' | 'error' | 'default' => {
    switch (entry.status) {
      case 'saved': return 'success';
      case 'pending': return 'warning';
      case 'missed': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = () => {
    switch (entry.status) {
      case 'saved': return 'Saved';
      case 'pending': return 'Pending';
      case 'missed': return 'Missed';
      default: return entry.status;
    }
  };

  const getAmountColor = () => {
    switch (entry.status) {
      case 'saved': return 'success.main';
      case 'pending': return 'warning.main';
      case 'missed': return 'error.main';
      default: return 'text.primary';
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 1,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 2,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out',
        }
      }}
      onClick={() => onEdit(entry)}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip 
                label={entry.category} 
                size="small" 
                sx={{ 
                  height: '20px',
                  fontSize: '0.7rem',
                }}
              />
              <Chip 
                label={getStatusLabel()} 
                size="small"
                color={getStatusColor()}
                sx={{ 
                  height: '20px',
                  fontSize: '0.7rem',
                }}
              />
            </Box>
            
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 0.5, mt: 0.5 }}>
              {entry.itemName}
            </Typography>
            
            {entry.description && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mb: 0.5 }}>
                {entry.description}
              </Typography>
            )}

            {entry.destination && entry.status === 'saved' && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                → {entry.destination}
              </Typography>
            )}
            
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {formattedDate}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: getAmountColor(),
                fontWeight: 700,
                fontSize: '1.1rem'
              }}
            >
              {entry.status === 'missed' ? '-' : '+'}{formatCurrency(entry.amount)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
