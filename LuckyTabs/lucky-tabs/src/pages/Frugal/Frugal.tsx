import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  GpsFixed as GpsFixedIcon,
} from '@mui/icons-material';
import { useAuthStateCompat } from '../../services/useAuthStateCompat';
import { useNavigate } from 'react-router-dom';
import { SavingsManager } from './SavingsManager';
import { SavingsCard } from './SavingsCard';
import { useFrugalData, SavingsEntry } from './useFrugalData';
import { formatCurrency } from '../../utils/formatters';

export const Frugal: React.FC = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthStateCompat();
  const [savingsManagerOpen, setSavingsManagerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SavingsEntry | null>(null);
  const [managerMode, setManagerMode] = useState<'create' | 'edit'>('create');

  const {
    weeklySavings,
    totalSaved,
    totalPending,
    totalMissed,
    isLoading,
    error,
    refreshData,
  } = useFrugalData(user?.uid);

  const handleRefreshData = () => {
    void refreshData();
  };

  const handleAddSavings = () => {
    setEditingEntry(null);
    setManagerMode('create');
    setSavingsManagerOpen(true);
  };

  const handleEditEntry = (entry: SavingsEntry) => {
    setEditingEntry(entry);
    setManagerMode('edit');
    setSavingsManagerOpen(true);
  };

  const handleSavingsManagerClose = () => {
    setSavingsManagerOpen(false);
    setEditingEntry(null);
    setManagerMode('create');
  };

  if (loading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Please log in to track your savings.
        </Alert>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '1200px', mx: 'auto' }}>
      {/* Header Section with Action Button */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
          &ldquo;Turn Every Skipped Purchase into Progress—Your First Step Toward Financial Freedom.&rdquo;
        </Typography>
        
        {/* Prominent Log Savings Button */}
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddSavings}
          sx={{
            px: 1,
            py: 1,
            fontSize: '1.1rem',
            fontWeight: 700,
            borderRadius: 3,
            boxShadow: 3,
            textTransform: 'none',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              boxShadow: 6,
              background: 'linear-gradient(45deg, #1976D2 30%, #00B0E6 90%)',
            },
          }}
        >
          Goal Contribution
        </Button>
      </Box>

      {/* Saved Card - Full Width on Top */}
      <Card 
        variant="outlined"
        onClick={() => void navigate('/frugal/summary')}
        sx={{ 
          borderWidth: 3,
          borderColor: 'success.main',
          mb: 2,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <TrendingUpIcon sx={{ fontSize: '2rem', color: 'success.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
              Saved
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: 'success.main', my: 2 }}>
            {formatCurrency(totalSaved)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600, fontStyle: 'italic' }}>
            Nice job!
          </Typography>
        </CardContent>
      </Card>

      {/* Pending and Missed Cards Side by Side */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
        {/* Pending Savings - Orange */}
        <Card 
          variant="outlined"
          onClick={() => void navigate('/frugal/pending')}
          sx={{ 
            borderWidth: 2,
            borderColor: 'warning.main',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
              <GpsFixedIcon sx={{ fontSize: '1.2rem', color: 'warning.main' }} />
              <Typography variant="overline" sx={{ fontWeight: 600, color: 'warning.main', fontSize: '0.75rem' }}>
                Pending
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main', my: 1 }}>
              {formatCurrency(totalPending)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'warning.main', display: 'block', fontStyle: 'italic', fontWeight: 600 }}>
              The clock is ticking….
            </Typography>
          </CardContent>
        </Card>

        {/* Missed Opportunities - Red */}
        <Card 
          variant="outlined"
          onClick={() => void navigate('/frugal/missed')}
          sx={{ 
            borderWidth: 2,
            borderColor: 'error.main',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
              <TrendingDownIcon sx={{ fontSize: '1.2rem', color: 'error.main' }} />
              <Typography variant="overline" sx={{ fontWeight: 600, color: 'error.main', fontSize: '0.75rem' }}>
                Missed
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main', my: 1 }}>
              {formatCurrency(totalMissed)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'error.main', display: 'block', fontStyle: 'italic', fontWeight: 600 }}>
              I don&apos;t like money.
            </Typography>
          </CardContent>
        </Card>
      </Box>



      {/* Weekly Savings Breakdown */}
      {weeklySavings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No savings logged yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start tracking the money you save by skipping unnecessary purchases!
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddSavings}
          >
            Log Your First Savings
          </Button>
        </Paper>
      ) : (
        <Box>
          {weeklySavings.map((weekData, index) => {
            const weekStart = weekData.weekStartDate;
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            const formattedWeekRange = `${weekStart.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })} - ${weekEnd.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}`;

            return (
              <Box key={index} sx={{ mb: 4 }}>
                {/* Week Header */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                      {formattedWeekRange}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {weekData.totalPending > 0 && (
                        <Chip
                          label={formatCurrency(weekData.totalPending)}
                          variant="outlined"
                          sx={{ 
                            fontWeight: 700,
                            borderColor: 'warning.main',
                            color: 'warning.main',
                            borderWidth: 2,
                          }}
                        />
                      )}
                      {weekData.totalSaved > 0 && (
                        <Chip
                          label={formatCurrency(weekData.totalSaved)}
                          variant="outlined"
                          sx={{ 
                            fontWeight: 700,
                            borderColor: 'success.main',
                            color: 'success.main',
                            borderWidth: 2,
                          }}
                        />
                      )}
                      {weekData.totalMissed > 0 && (
                        <Chip
                          label={formatCurrency(weekData.totalMissed)}
                          variant="outlined"
                          sx={{ 
                            fontWeight: 700,
                            borderColor: 'error.main',
                            color: 'error.main',
                            borderWidth: 2,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Divider />
                </Box>

                {/* Savings Entries for this week */}
                {weekData.entries.map((entry) => (
                  <SavingsCard
                    key={entry.id}
                    entry={entry}
                    onEdit={handleEditEntry}
                  />
                ))}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Savings Manager Dialog */}
      <SavingsManager
        open={savingsManagerOpen}
        onClose={handleSavingsManagerClose}
        onSavingsAdded={handleRefreshData}
        userId={user.uid}
        editingEntry={editingEntry}
        mode={managerMode}
      />
    </Box>
  );
};
