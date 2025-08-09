import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Tab,
  Tabs,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BudgetIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { BudgetManager } from './BudgetManager';
import { TransactionManager } from './TransactionManager';
import { WeeklyOverview } from './WeeklyOverview';
import { HistoricalData } from './HistoricalData';
import { useTrackingData } from './useTrackingData';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tracking-tabpanel-${index}`}
      aria-labelledby={`tracking-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const Tracking: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [tabValue, setTabValue] = useState(0);
  const [budgetManagerOpen, setBudgetManagerOpen] = useState(false);
  const [transactionManagerOpen, setTransactionManagerOpen] = useState(false);

  const {
    weeklyData,
    historicalData,
    userBudget,
    isLoading,
    error,
    refreshData,
  } = useTrackingData(user?.uid);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefreshData = () => {
    void refreshData();
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
          Please log in to track your gambling activities.
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

  const currentWeekStats = weeklyData || {
    totalSpent: 0,
    totalWon: 0,
    netResult: 0,
    transactionCount: 0,
    weekStart: new Date(),
    weekEnd: new Date(),
    transactions: [],
  };

  const netLoss = Math.max(0, -currentWeekStats.netResult); // Only count losses, not profits
  const isOverBudget = userBudget && netLoss > userBudget.weeklyLimit;
  const budgetUtilization = userBudget 
    ? Math.round((netLoss / userBudget.weeklyLimit) * 100)
    : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        gap: { xs: 2, sm: 0 },
        mb: 3 
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 0, sm: 1 } }}>
          Gambling Tracker
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => setBudgetManagerOpen(true)}
            sx={{ 
              borderColor: 'primary.main',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'primary.main',
                color: 'text.primary'
              }
            }}
          >
            {userBudget ? 'Edit Budget' : 'Set Budget'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setTransactionManagerOpen(true)}
            sx={{ 
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }}
          >
            Add Transaction
          </Button>
        </Box>
      </Box>

      {/* Quick Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MoneyIcon sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="h6" component="div">
                Net Loss This Week
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              component="div" 
              color={netLoss > 0 ? "error.main" : "success.main"}
            >
              {netLoss > 0 ? `$${netLoss.toFixed(2)}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userBudget ? `of $${userBudget.weeklyLimit.toFixed(2)} budget` : 'No budget set'}
            </Typography>
            {currentWeekStats.netResult >= 0 && (
              <Typography variant="caption" color="success.main">
                🎉 You&apos;re ahead this week!
              </Typography>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6" component="div">
                This Week Won
              </Typography>
            </Box>
            <Typography variant="h4" component="div" color="success.main">
              ${currentWeekStats.totalWon.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentWeekStats.transactionCount} transactions
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              {currentWeekStats.netResult >= 0 ? (
                <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
              ) : (
                <TrendingDownIcon sx={{ mr: 1, color: 'error.main' }} />
              )}
              <Typography variant="h6" component="div">
                Net Result
              </Typography>
            </Box>
            <Typography 
              variant="h4" 
              component="div" 
              color={currentWeekStats.netResult >= 0 ? 'success.main' : 'error.main'}
            >
              {currentWeekStats.netResult >= 0 ? '+' : ''}${currentWeekStats.netResult.toFixed(2)}
            </Typography>
            <Chip
              label={currentWeekStats.netResult >= 0 ? 'Up' : currentWeekStats.netResult < 0 ? 'Down' : 'Even'}
              color={currentWeekStats.netResult >= 0 ? 'success' : currentWeekStats.netResult < 0 ? 'error' : 'default'}
              size="small"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BudgetIcon sx={{ mr: 1, color: isOverBudget ? 'error.main' : 'text.primary' }} />
              <Typography variant="h6" component="div">
                Budget Status
              </Typography>
            </Box>
            {userBudget ? (
              <>
                <Typography 
                  variant="h4" 
                  component="div" 
                  color={isOverBudget ? 'error.main' : 'text.primary'}
                >
                  {budgetUtilization}%
                </Typography>
                <Chip
                  label={
                    currentWeekStats.netResult >= 0 
                      ? 'Profitable' 
                      : isOverBudget 
                        ? 'Over Budget' 
                        : 'On Track'
                  }
                  color={
                    currentWeekStats.netResult >= 0 
                      ? 'success' 
                      : isOverBudget 
                        ? 'error' 
                        : 'success'
                  }
                  size="small"
                />
              </>
            ) : (
              <>
                <Typography variant="h4" component="div" color="text.secondary">
                  --
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No budget set
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Tabs for different views */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="tracking tabs">
            <Tab label="This Week" />
            <Tab label="History" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <WeeklyOverview 
            weeklyData={currentWeekStats}
            userBudget={userBudget}
            onRefresh={handleRefreshData}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <HistoricalData 
            historicalData={historicalData || []}
            onRefresh={handleRefreshData}
          />
        </TabPanel>
      </Card>

      {/* Modals */}
      <BudgetManager
        open={budgetManagerOpen}
        onClose={() => setBudgetManagerOpen(false)}
        currentBudget={userBudget}
        onBudgetUpdated={handleRefreshData}
        userId={user.uid}
      />

      <TransactionManager
        open={transactionManagerOpen}
        onClose={() => setTransactionManagerOpen(false)}
        onTransactionAdded={handleRefreshData}
        userId={user.uid}
      />
    </Box>
  );
};