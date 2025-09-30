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
  ReferenceLine,
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
  isCross?: boolean;
}

// Add a shaped item the chart will consume
type ChartRow = ChartDataPoint & {
  // master y
  y: number;
  // split series
  pos?: number;  // >= 0 or crossing
  neg?: number;  // <= 0 or crossing
};

export const WinLossChart: React.FC<WinLossChartProps> = ({ historicalData }) => {
  const theme = useTheme();

  const formatWeekLabel = (date: Date) =>
    date && !isNaN(date.getTime())
      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Invalid Date';

  // 1) Build base cumulative series (oldest -> newest) for current year
  const baseData = React.useMemo<ChartDataPoint[]>(() => {
    if (!historicalData?.length) return [];
    const currentYear = new Date().getFullYear();

    const rows = [...historicalData]
      .filter(w => w.weekStart && !isNaN(w.weekStart.getTime()) && w.weekStart.getFullYear() === currentYear)
      .reverse(); // oldest first

    if (!rows.length) return [];

    let running = 0;
    return rows.map(w => {
      running += w.netResult;
      return {
        weekLabel: formatWeekLabel(w.weekStart),
        netResult: w.netResult,
        cumulativeTotal: running,
        totalSpent: w.totalSpent,
        totalWon: w.totalWon,
        weekStart: w.weekStart,
      };
    });
  }, [historicalData]);

  // 2) Insert crossing points where sign changes, then split into pos/neg
  const chartData = React.useMemo<ChartRow[]>(() => {
    if (baseData.length <= 1) {
      return baseData.map(d => ({
        ...d,
        y: d.cumulativeTotal,
        pos: d.cumulativeTotal >= 0 ? d.cumulativeTotal : undefined,
        neg: d.cumulativeTotal <= 0 ? d.cumulativeTotal : undefined,
      }));
    }

    const out: ChartDataPoint[] = [baseData[0]];
    for (let i = 1; i < baseData.length; i++) {
      const prev = baseData[i - 1];
      const curr = baseData[i];
      const p = prev.cumulativeTotal;
      const c = curr.cumulativeTotal;

      // sign switch and neither exactly zero
      if (p !== 0 && c !== 0 && Math.sign(p) !== Math.sign(c)) {
        const t = -p / (c - p); // linear interpolation fraction
        const t0 = prev.weekStart.getTime();
        const t1 = curr.weekStart.getTime();
        const crossDate = new Date(t0 + t * (t1 - t0));

        out.push({
          weekLabel: `${formatWeekLabel(crossDate)} ✕`,
          netResult: 0,
          cumulativeTotal: 0,
          totalSpent: prev.totalSpent,
          totalWon: prev.totalWon,
          weekStart: crossDate,
          isCross: true,
        });
      }
      out.push(curr);
    }

    // Now split to pos/neg, including the crossing in BOTH
    return out.map(d => {
      const y = d.cumulativeTotal;
      const isCross = d.isCross === true;
      const row: ChartRow = {
        ...d,
        y,
        pos: (y > 0 || isCross) ? y : undefined,
        neg: (y < 0 || isCross) ? y : undefined,
      };
      // If y === 0 and not a synthetic cross (i.e., a real zero data point), include in both as well
      if (y === 0 && !isCross) {
        row.pos = 0;
        row.neg = 0;
      }
      return row;
    });
  }, [baseData]);

  if (!chartData.length) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No data available for chart</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Start tracking your gambling activity to see trends over time
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Domain that always includes 0
  const ys = chartData.map(d => d.y);
  const minY = Math.min(0, ...ys);
  const maxY = Math.max(0, ...ys);

  // Tooltip uses the master y/fields, not pos/neg
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ payload: ChartRow }>;
    label?: string;
  }) => {
    if (active && payload && payload[0]) {
      const d = payload[0].payload;
      return (
        <Box sx={{ backgroundColor: 'background.paper', border: 1, borderColor: 'divider', p: 2, boxShadow: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Week of {label}</Typography>
          <Typography variant="body2" color="text.secondary">
            This Week: {d.netResult >= 0 ? '+' : ''}{formatCurrency(Math.abs(d.netResult || 0))}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 'bold', color: d.y >= 0 ? 'success.main' : 'error.main', mb: 1 }}
          >
            Total: {d.y >= 0 ? '+' : ''}{formatCurrency(Math.abs(d.y))}
          </Typography>
          <Typography variant="body2" color="text.secondary">Spent: {formatCurrency(d.totalSpent || 0)}</Typography>
          <Typography variant="body2" color="text.secondary">Won: {formatCurrency(d.totalWon || 0)}</Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ borderRadius: 0 }}>
      <CardContent>
        <Typography variant="body1" gutterBottom>
          {new Date().getFullYear()} Cumulative Win/Loss
        </Typography>
        <Box sx={{ width: '100%', height: { xs: 180, sm: 220 }, '& .recharts-tooltip-wrapper': { zIndex: 1000 } }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.3} />
              <XAxis dataKey="weekLabel" stroke={theme.palette.text.secondary} fontSize={12} />
              <YAxis
                stroke={theme.palette.text.secondary}
                fontSize={12}
                // if you want absolute values on the axis, keep this; otherwise use value => `$${value}`
                tickFormatter={(value: number) => `$${Math.abs(value)}`}
                domain={[minY, maxY]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke={theme.palette.divider} strokeDasharray="5 5" strokeWidth={2} />

              {/* faint context line */}
              <Line
                type="monotone"
                dataKey="y"
                stroke={theme.palette.text.disabled}
                strokeWidth={1}
                dot={false}
                activeDot={false}
                opacity={0.3}
                isAnimationActive={false}
              />

              {/* green (>=0 and crossing) */}
              <Line
                type="monotone"
                dataKey="pos"
                stroke={theme.palette.success.main}
                strokeWidth={3}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
                connectNulls={false}
              />

              {/* red (<=0 and crossing) */}
              <Line
                type="monotone"
                dataKey="neg"
                stroke={theme.palette.error.main}
                strokeWidth={3}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Showing profit/loss from your first entry this year.
        </Typography>
      </CardContent>
    </Card>
  );
};
