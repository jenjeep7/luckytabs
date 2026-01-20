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

export const MissedSummary: React.FC = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthStateCompat();
  const { weeklySavings, totalMissed, isLoading } = useFrugalData(user?.uid);

  // Aggregate missed savings by category
  const categoryTotals = React.useMemo(() => {
    const totals = new Map<string, number>();
    
    weeklySavings.forEach(week => {
      week.entries.forEach(entry => {
        if (entry.status === 'missed') {
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
          Missed Opportunities
        </Typography>
      </Box>

      {/* Total Missed Card */}
      <Card 
        sx={{ 
          mb: 3,
          borderWidth: 2,
          borderColor: 'error.main',
          borderStyle: 'solid',
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="overline" sx={{ color: 'error.main', fontWeight: 600 }}>
            Total Missed
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: 'error.main', my: 1 }}>
            {formatCurrency(totalMissed)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Money that wasn&apos;t saved
          </Typography>
        </CardContent>
      </Card>

      {/* Categories Breakdown */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Missed Savings by Category
          </Typography>
          
          {categoryTotals.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No missed opportunities yet. Keep up the good work!
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
                          {Math.round((item.amount / totalMissed) * 100)}% of missed savings
                        </Typography>
                      }
                    />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'error.main',
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
