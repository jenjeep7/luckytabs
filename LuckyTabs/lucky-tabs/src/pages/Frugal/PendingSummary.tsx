import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStateCompat } from '../../services/useAuthStateCompat';
import { useFrugalData } from './useFrugalData';
import { formatCurrency } from '../../utils/formatters';

export const PendingSummary: React.FC = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthStateCompat();
  const { weeklySavings, totalPending, isLoading } = useFrugalData(user?.uid);

  // Aggregate pending savings by category
  const categoryTotals = React.useMemo(() => {
    const totals = new Map<string, number>();
    
    weeklySavings.forEach(week => {
      week.entries.forEach(entry => {
        if (entry.status === 'pending') {
          const current = totals.get(entry.category) || 0;
          totals.set(entry.category, current + entry.amount);
        }
      });
    });

    return Array.from(totals.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [weeklySavings]);

  if (loading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '800px', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => void navigate('/frugal')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Pending Savings
        </Typography>
      </Box>

      {/* Total Pending Card */}
      <Card 
        sx={{ 
          mb: 3,
          borderWidth: 2,
          borderColor: 'warning.main',
          borderStyle: 'solid',
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="overline" sx={{ color: 'warning.main', fontWeight: 600 }}>
            Total Pending
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: 'warning.main', my: 1 }}>
            {formatCurrency(totalPending)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Waiting to be moved to goals
          </Typography>
        </CardContent>
      </Card>

      {/* Categories Breakdown */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Pending Savings by Category
          </Typography>
          
          {categoryTotals.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No pending savings. Log your next skipped purchase!
            </Typography>
          ) : (
            <List>
              {categoryTotals.map((item, index) => (
                <React.Fragment key={item.category}>
                  {index > 0 && <Divider />}
                  <ListItem sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {item.category}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {Math.round((item.amount / totalPending) * 100)}% of pending savings
                        </Typography>
                      }
                    />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'warning.main',
                      }}
                    >
                      {formatCurrency(item.amount)}
                    </Typography>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
