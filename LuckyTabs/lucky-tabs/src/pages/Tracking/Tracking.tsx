import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuthStateCompat } from '../../services/useAuthStateCompat';
import { BudgetManager } from './BudgetManager';
import { TransactionManager } from './TransactionManager';
import { WeeklyOverview } from './WeeklyOverview';
import { HistoricalData } from './HistoricalData';
import { useTrackingData } from './useTrackingData';
import { formatCurrency } from '../../utils/formatters';

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
        <Box sx={{ p: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const Tracking: React.FC = () => {
  const [user, loading] = useAuthStateCompat();
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center', 
        mb: 3 
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: 'center'
        }}>
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
            Track $
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => setBudgetManagerOpen(true)}
            sx={{ 
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'none',
              minWidth: 'auto',
              padding: '4px 8px',
              '& .MuiButton-startIcon': {
                marginRight: '4px',
                '& > svg': {
                  fontSize: '16px'
                }
              }
            }}
          >
            Budget
          </Button>
        </Box>
      </Box>

      {/* Quick Stats Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
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
              {netLoss > 0 ? formatCurrency(netLoss) : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userBudget ? `of ${formatCurrency(userBudget.weeklyLimit)} budget` : 'No budget set'}
            </Typography>
            {currentWeekStats.netResult >= 0 && (
              <Typography variant="caption" color="success.main">
                {`🎉 You're ahead this week!`}
              </Typography>
            )}
          </CardContent>
        </Card>
        
        {/* <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6" component="div">
                {`This Week's Wins`}
              </Typography>
            </Box>
            <Typography variant="h4" component="div" color="success.main">
              {formatCurrency(currentWeekStats.totalWon)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentWeekStats.transactionCount} transactions
            </Typography>
          </CardContent>
        </Card> */}
        
        {/* <Card>
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
        </Card> */}
      </Box>

      {/* Tabs for different views */}
      <Card sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="tracking tabs">
            <Tab 
              label="This Week" 
              sx={{ 
                color: 'text.primary',
                '&.Mui-selected': {
                  color: 'text.secondary'
                }
              }}
            />
            <Tab 
              label="History" 
              sx={{ 
                color: 'text.primary',
                '&.Mui-selected': {
                  color: 'text.secondary'
                }
              }}
            />
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