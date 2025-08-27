/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Box, Typography, Card, CardContent, Divider, Chip, Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

import { calculateAdvancedMetrics } from './helpers';

interface BoxItem {
  id: string;
  boxName: string;
  boxNumber: string;
  pricePerTicket: string;
  startingTickets?: number;
  type: "wall" | "bar box";
  locationId: string;
  ownerId: string;
  isActive?: boolean;
  winningTickets?: any[];
  estimatedRemainingTickets?: number;
  rowEstimates?: {
    row1: number;
    row2: number;
    row3: number;
    row4: number;
  };
  [key: string]: unknown;
}

interface AdvancedAnalyticsProps {
  box: BoxItem;
  remainingTickets: number;
  getEvColor: (_evValue: number, rtpValue: number, isPercentage?: boolean) => string;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ box, remainingTickets, getEvColor }) => {
  if (!box || !remainingTickets) return null;
  const metrics = calculateAdvancedMetrics(box, remainingTickets);

  return (
    <Box sx={{ mt: 2, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <span role="img" aria-label="analytics">📊</span> Advanced Analytics
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Core Metrics */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            📊 Core Metrics
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Card variant="outlined" sx={{ flex: '1 1 200px' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">EV per Ticket</Typography>
                  <Tooltip 
                    title={
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Expected Value per Ticket</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          This shows the average profit or loss per ticket if you played many times.
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Positive (+)</strong>: Good! You expect to make money on average<br/>
                          <strong>Negative (-)</strong>: Bad! You expect to lose money on average<br/>
                          <strong>Zero (0)</strong>: Break-even, no profit or loss expected
                        </Typography>
                        <Typography variant="body2">
                          <em>Example: +$0.25 means you&apos;d expect to profit 25¢ per ticket over many pulls</em>
                        </Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <IconButton size="small" sx={{ p: 0.25 }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="h6" sx={{ color: getEvColor(metrics.evPerTicket, metrics.rtpRemaining, false) }}>
                  {metrics.evPerTicket >= 0 ? '+' : ''}${metrics.evPerTicket.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: '1 1 200px' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">RTP Remaining</Typography>
                <Typography variant="h6" sx={{ color: getEvColor(metrics.evPerTicket, metrics.rtpRemaining, false) }}>
                  {(metrics.rtpRemaining * 100).toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: '1 1 200px' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">Goodness Score</Typography>
                <Typography variant="h6" color="primary.main">
                  {(metrics.goodnessScore * 100).toFixed(0)}/100
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Buyout Analysis */}
        <Box>
          <Divider />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', my: 2 }}>
            💰 Buyout Analysis
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Card variant="outlined" sx={{ flex: '1 1 250px' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">Cost to Clear</Typography>
                <Typography variant="h6">${metrics.costToClear.toFixed(2)}</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: '1 1 250px' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">Net if Cleared</Typography>
                <Typography variant="h6" color={metrics.netIfCleared >= 0 ? 'success.main' : 'error.main'}>
                  {metrics.netIfCleared >= 0 ? '+' : ''}${metrics.netIfCleared.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Odds Analysis */}
        <Box>
          <Divider />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', my: 2 }}>
            🎯 Odds Analysis
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Card variant="outlined" sx={{ flex: '1 1 300px' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Top Prize Odds</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`Next 1: ${(metrics.topPrizeOdds.next1 * 100).toFixed(1)}%`} 
                    size="small" 
                    color="primary"
                  />
                  <Chip 
                    label={`Next 5: ${(metrics.topPrizeOdds.next5 * 100).toFixed(1)}%`} 
                    size="small" 
                    color="primary"
                  />
                  <Chip 
                    label={`Next 10: ${(metrics.topPrizeOdds.next10 * 100).toFixed(1)}%`} 
                    size="small" 
                    color="primary"
                  />
                </Box>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: '1 1 300px' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Profit Ticket Odds</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`Next 1: ${(metrics.profitTicketOdds.next1 * 100).toFixed(1)}%`} 
                    size="small" 
                    color="success"
                  />
                  <Chip 
                    label={`Next 5: ${(metrics.profitTicketOdds.next5 * 100).toFixed(1)}%`} 
                    size="small" 
                    color="success"
                  />
                  <Chip 
                    label={`Next 10: ${(metrics.profitTicketOdds.next10 * 100).toFixed(1)}%`} 
                    size="small" 
                    color="success"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Risk Analysis */}
        <Box>
          <Divider />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', my: 2 }}>
            ⚠️ Risk Analysis
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Card variant="outlined" sx={{ flex: '1 1 180px' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">Risk per Ticket</Typography>
                <Typography variant="h6">±${metrics.riskPerTicket.toFixed(2)}</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: '1 1 180px' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">Payout Concentration</Typography>
                <Typography variant="h6">{(metrics.payoutConcentration * 100).toFixed(1)}%</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: '1 1 180px' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">Estimate Stability</Typography>
                <Chip 
                  label={metrics.sensitivity.isEstimateSensitive ? "Sensitive" : "Stable"} 
                  size="small" 
                  color={metrics.sensitivity.isEstimateSensitive ? "warning" : "success"}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Sensitivity Warning */}
        {metrics.sensitivity.isEstimateSensitive && (
          <Card variant="outlined" sx={{ bgcolor: 'warning.light' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>⚠️ Estimate Sensitivity Warning</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                EV at 90% estimate: ${metrics.sensitivity.evLow.toFixed(2)} | 
                EV at 110% estimate: ${metrics.sensitivity.evHigh.toFixed(2)}
              </Typography>
              <Typography variant="caption">
                The profitability estimate is sensitive to your ticket count estimate. Consider refining your count.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};