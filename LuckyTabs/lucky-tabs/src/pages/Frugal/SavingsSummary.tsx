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

export const SavingsSummary: React.FC = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthStateCompat();
  const { weeklySavings, totalSaved, isLoading } = useFrugalData(user?.uid);

  // Aggregate savings by destination
  const destinationTotals = React.useMemo(() => {
    const totals = new Map<string, number>();
    
    weeklySavings.forEach(week => {
      week.entries.forEach(entry => {
        if (entry.status === 'saved' && entry.destination) {
          const current = totals.get(entry.destination) || 0;
          totals.set(entry.destination, current + entry.amount);
        }
      });
    });

    return Array.from(totals.entries())
      .map(([destination, amount]) => ({ destination, amount }))
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
          Savings Summary
        </Typography>
      </Box>

      {/* Total Saved Card */}
      <Card 
        sx={{ 
          mb: 3,
          borderWidth: 2,
          borderColor: 'success.main',
          borderStyle: 'solid',
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="overline" sx={{ color: 'success.main', fontWeight: 600 }}>
            Total Saved
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: 'success.main', my: 1 }}>
            {formatCurrency(totalSaved)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Across all destinations
          </Typography>
        </CardContent>
      </Card>

      {/* Destinations Breakdown */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Savings by Destination
          </Typography>
          
          {destinationTotals.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No savings have been moved to goals yet.
            </Typography>
          ) : (
            <List>
              {destinationTotals.map((item, index) => (
                <React.Fragment key={item.destination}>
                  {index > 0 && <Divider />}
                  <ListItem sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {item.destination}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {Math.round((item.amount / totalSaved) * 100)}% of total savings
                        </Typography>
                      }
                    />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'success.main',
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
