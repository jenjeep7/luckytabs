import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { HistoricalWeek } from './useTrackingData';
import { formatCurrency } from '../../utils/formatters';

interface WinLossChartProps {
  historicalData: HistoricalWeek[];
}

interface ChartDataPoint {
  weekLabel: string;
  netResult: number;
  cumulativeTotal: number;
  totalSpent: number;
  totalWon: number;
  weekStart: Date;
}

export const WinLossChart: React.FC<WinLossChartProps> = ({ historicalData }) => {
  const theme = useTheme();

  function formatWeekLabel(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  // Prepare chart data - show all data from current year starting with first entry
  const chartData: ChartDataPoint[] = (() => {
    if (historicalData.length === 0) return [];
    
    const currentYear = new Date().getFullYear();
    
    // Filter to current year data and sort oldest to newest
    const currentYearData = [...historicalData]
      .filter(week => week.weekStart.getFullYear() === currentYear)
      .reverse(); // oldest to newest
    
    if (currentYearData.length === 0) return [];
    
    // Calculate cumulative total from the first entry of the year
    let runningTotal = 0;
    
    return currentYearData.map((week) => {
      runningTotal += week.netResult;
      return {
        weekLabel: formatWeekLabel(week.weekStart),
        netResult: week.netResult,
        cumulativeTotal: runningTotal,
        totalSpent: week.totalSpent,
        totalWon: week.totalWon,
        weekStart: week.weekStart,
      };
    });
  })();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      payload: ChartDataPoint;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Week of {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This Week: {data.netResult >= 0 ? '+' : ''}{formatCurrency(Math.abs(data.netResult))}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 'bold',
              color: data.cumulativeTotal >= 0 ? 'success.main' : 'error.main',
              mb: 1
            }}
          >
            Total: {data.cumulativeTotal >= 0 ? '+' : ''}{formatCurrency(Math.abs(data.cumulativeTotal))}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Spent: {formatCurrency(data.totalSpent)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Won: {formatCurrency(data.totalWon)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No data available for chart
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Start tracking your gambling activity to see trends over time
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="body1" gutterBottom>
          {new Date().getFullYear()} Cumulative Win/Loss
        </Typography>
        <Box sx={{ 
          width: '100%', 
          height: { xs: 180, sm: 220 },
          '& .recharts-tooltip-wrapper': {
            zIndex: 1000
          }
        }}>
          <ResponsiveContainer>
            <LineChart 
              data={chartData} 
              margin={{ 
                top: 20, 
                right: 30, 
                left: 20, 
                bottom: 5 
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme.palette.divider}
                opacity={0.3}
              />
              <XAxis 
                dataKey="weekLabel"
                stroke={theme.palette.text.secondary}
                fontSize={12}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                fontSize={12}
                tickFormatter={(value: number) => `$${Math.abs(value)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Zero line for reference */}
              <Line
                type="monotone"
                dataKey={() => 0}
                stroke={theme.palette.divider}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
              />
              
              {/* Main cumulative total line - green when positive, red when negative */}
              <Line
                type="monotone"
                dataKey="cumulativeTotal"
                stroke={chartData.length > 0 && chartData[chartData.length - 1].cumulativeTotal >= 0 
                  ? theme.palette.success.main 
                  : theme.palette.error.main}
                strokeWidth={3}
                dot={{
                  fill: theme.palette.background.paper,
                  stroke: chartData.length > 0 && chartData[chartData.length - 1].cumulativeTotal >= 0 
                    ? theme.palette.success.main 
                    : theme.palette.error.main,
                  strokeWidth: 2,
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                  stroke: chartData.length > 0 && chartData[chartData.length - 1].cumulativeTotal >= 0 
                    ? theme.palette.success.main 
                    : theme.palette.error.main,
                  strokeWidth: 2,
                  fill: chartData.length > 0 && chartData[chartData.length - 1].cumulativeTotal >= 0 
                    ? theme.palette.success.main 
                    : theme.palette.error.main,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Showing profit/loss from your first entry this year.
        </Typography>
      </CardContent>
    </Card>
  );
};