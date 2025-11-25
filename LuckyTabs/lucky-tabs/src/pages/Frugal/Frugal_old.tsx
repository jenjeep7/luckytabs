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
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { useAuthStateCompat } from '../../services/useAuthStateCompat';
import { SavingsManager } from './SavingsManager';
import { SavingsCard } from './SavingsCard';
import { useFrugalData, SavingsEntry } from './useFrugalData';
import { formatCurrency } from '../../utils/formatters';

export const Frugal: React.FC = () => {
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
      {/* Header Section */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          “Turn Every Skipped Purchase into Progress—Your First Step Toward Financial Freedom.”
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, mt: 1 }}>       
         Frugal Wins is more than an app—it’s a mindset shift. We gamify saving and make it the cornerstone of wealth-building for beginners.
          </Typography>
      </Box>

      {/* Total Savings Card */}
      <Card 
        variant="outlined"
        sx={{ 
          mb: 3,
          borderWidth: 2,
          borderColor: 'success.main',
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <TrendingUpIcon sx={{ fontSize: '1.5rem', color: 'success.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
              Total Saved
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'success.main' }}>
            {formatCurrency(totalSaved)}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Keep up the great work! 💪
          </Typography>
        </CardContent>
      </Card>

      {/* Add Savings Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddSavings}
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          Log Savings
        </Button>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formattedWeekRange}
                    </Typography>
                    <Chip
                      label={formatCurrency(weekData.totalSaved)}
                      color="success"
                      sx={{ fontWeight: 700 }}
                    />
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
