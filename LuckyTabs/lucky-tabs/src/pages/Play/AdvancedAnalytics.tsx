/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Tooltip, IconButton } from '@mui/material';
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
  const [payoutTooltipOpen, setPayoutTooltipOpen] = React.useState(false);
  const handlePayoutTooltipToggle = () => setPayoutTooltipOpen((open) => !open);
  const handlePayoutTooltipClose = () => setPayoutTooltipOpen(false);
  const [riskTooltipOpen, setRiskTooltipOpen] = React.useState(false);
  const handleRiskTooltipToggle = () => setRiskTooltipOpen((open) => !open);
  const handleRiskTooltipClose = () => setRiskTooltipOpen(false);
  const [topPrizeTooltipOpen, setTopPrizeTooltipOpen] = React.useState(false);
  const handleTopPrizeTooltipToggle = () => setTopPrizeTooltipOpen((open) => !open);
  const handleTopPrizeTooltipClose = () => setTopPrizeTooltipOpen(false);
  const [profitOddsTooltipOpen, setProfitOddsTooltipOpen] = React.useState(false);
  const handleProfitOddsTooltipToggle = () => setProfitOddsTooltipOpen((open) => !open);
  const handleProfitOddsTooltipClose = () => setProfitOddsTooltipOpen(false);
  const [evTooltipOpen, setEvTooltipOpen] = React.useState(false);
  const handleEvTooltipToggle = () => setEvTooltipOpen((open) => !open);
  const handleEvTooltipClose = () => setEvTooltipOpen(false);
  const [goodnessTooltipOpen, setGoodnessTooltipOpen] = React.useState(false);
  const handleGoodnessTooltipToggle = () => setGoodnessTooltipOpen((open) => !open);
  const handleGoodnessTooltipClose = () => setGoodnessTooltipOpen(false);
  if (!box || !remainingTickets) return null;
  const metrics = calculateAdvancedMetrics(box, remainingTickets);
  // Calculate profit ticket odds for next 1, 10, and 20 pulls
  const profitTicketOdds = {
    next1: metrics.profitTicketOdds?.next1 ?? 0,
    next10: 1 - Math.pow(1 - (metrics.profitTicketOdds?.next1 ?? 0), 10),
    next20: 1 - Math.pow(1 - (metrics.profitTicketOdds?.next1 ?? 0), 20),
  };
  // Calculate top prize odds for next 1, 10, and 20 pulls
  const topPrizeOdds = {
    next1: metrics.topPrizeOdds?.next1 ?? 0,
    next10: 1 - Math.pow(1 - (metrics.topPrizeOdds?.next1 ?? 0), 10),
    next20: 1 - Math.pow(1 - (metrics.topPrizeOdds?.next1 ?? 0), 20),
  };

  return (
    <Box sx={{ mt: 2, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Core Metrics */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>{`📊 Core Metrics`}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Card variant="outlined" sx={{ flex: '1 1 200px' }}>
              <CardContent sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                  <Typography variant="caption" color="text.secondary">{`EV per Ticket`}</Typography>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>{`Expected Value per Ticket`}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>{`This shows the average profit or loss per ticket if you played many times.`}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>{`Positive (+)`}<strong>{`Positive (+)`}</strong>{`: Good! You expect to make money on average`}<br/>{`Negative (-)`}<strong>{`Negative (-)`}</strong>{`: Bad! You expect to lose money on average`}<br/>{`Zero (0)`}<strong>{`Zero (0)`}</strong>{`: Break-even, no profit or loss expected`}</Typography>
                        <Typography variant="body2"><em>{`Example: +$0.25 means you'd expect to profit 25¢ per ticket over many pulls`}</em></Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                    open={evTooltipOpen}
                    onClose={handleEvTooltipClose}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <IconButton size="small" sx={{ p: 0.25 }} onClick={handleEvTooltipToggle}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="h6" sx={{ color: getEvColor(metrics.evPerTicket, metrics.rtpRemaining, false), ml: 1 }}>
                    {metrics.evPerTicket >= 0 ? '+' : ''}${metrics.evPerTicket.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: '1 1 200px' }}>
                <CardContent sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                  <Typography variant="caption" color="text.secondary">{`Goodness Score`}</Typography>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>{`Goodness Score`}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>{`A quick summary of how favorable this box is for players, combining expected value, odds, risk, and stability.`}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>80–100:</strong> Excellent (very favorable box)<br/>
                          <strong>60–79:</strong> Good (worth considering)<br/>
                          <strong>40–59:</strong> Average (neutral)<br/>
                          <strong>0–39:</strong> Poor (unfavorable, high risk or low payout)
                        </Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                    open={goodnessTooltipOpen}
                    onClose={handleGoodnessTooltipClose}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <IconButton size="small" sx={{ p: 0.25 }} onClick={handleGoodnessTooltipToggle}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Typography
                    variant="h6"
                    sx={{
                      ml: 1,
                      color:
                        metrics.goodnessScore >= 0.8
                          ? 'success.main'
                          : metrics.goodnessScore >= 0.4
                          ? 'warning.main'
                          : 'error.main',
                    }}
                  >
                    {(metrics.goodnessScore * 100).toFixed(0)}/100
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Buyout Analysis */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', my: 1 }}>{`💰 Buyout Analysis`}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', px: 2, py: 1, borderRadius: 1, boxShadow: 1 }}>
              <Typography variant="caption" color="text.secondary">{`Cost to Clear:`}</Typography>
              <Typography variant="h6">${metrics.costToClear.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', px: 2, py: 1, borderRadius: 1, boxShadow: 1 }}>
              <Typography variant="caption" color="text.secondary">{`Net if Cleared:`}</Typography>
              <Typography variant="h6" color={metrics.netIfCleared >= 0 ? 'success.main' : 'error.main'}>
                {metrics.netIfCleared >= 0 ? '+' : ''}${metrics.netIfCleared.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Odds Analysis */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', my: 1 }}>{`🎯 Odds Analysis`}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Card variant="outlined" sx={{ flex: '1 1 300px' }}>
                <CardContent sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, justifyContent: 'center' }}>
                  <Typography variant="subtitle2" sx={{ mb: 0 }}>{`Top Prize Odds`}</Typography>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>{`Top Prize Odds`}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>{`Shows your chance of getting the top prize in the next 1, 10, or 20 pulls.`}</Typography>
                        <Typography variant="body2">{`Higher percentages mean better short-term chances for hitting the top prize.`}</Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                    open={topPrizeTooltipOpen}
                    onClose={handleTopPrizeTooltipClose}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <IconButton size="small" sx={{ p: 0.25 }} onClick={handleTopPrizeTooltipToggle}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip 
                    label={`Next 1: ${(topPrizeOdds.next1 * 100).toFixed(1)}%`} 
                    size="small" 
                    color="primary"
                  />
                  <Chip 
                    label={`Next 10: ${(topPrizeOdds.next10 * 100).toFixed(1)}%`} 
                    size="small" 
                    color="primary"
                  />
                  <Chip 
                    label={`Next 20: ${(topPrizeOdds.next20 * 100).toFixed(1)}%`} 
                    size="small" 
                    color="primary"
                  />
                </Box>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: '1 1 300px' }}>
                <CardContent sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, justifyContent: 'center' }}>
                  <Typography variant="subtitle2">{`Profit Ticket Odds`}</Typography>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>{`Profit Ticket Odds`}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>{`Shows your chance of getting a ticket that pays out more than its cost in the next 1, 5, or 10 pulls.`}</Typography>
                        <Typography variant="body2">{`Higher percentages mean better short-term chances for a profitable ticket.`}</Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                    open={profitOddsTooltipOpen}
                    onClose={handleProfitOddsTooltipClose}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <IconButton size="small" sx={{ p: 0.25 }} onClick={handleProfitOddsTooltipToggle}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip 
                    label={`Next 1: ${(profitTicketOdds.next1 * 100).toFixed(1)}%`} 
                    size="small" 
                    color="success"
                  />
                  <Chip 
                    label={`Next 10: ${(profitTicketOdds.next10 * 100).toFixed(1)}%`} 
                    size="small" 
                    color="success"
                  />
                  <Chip 
                    label={`Next 20: ${(profitTicketOdds.next20 * 100).toFixed(1)}%`} 
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
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', my: 2 }}>{`⚠️ Risk Analysis`}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', px: 2, py: 1, borderRadius: 1, boxShadow: 1 }}>
              <Typography variant="caption" color="text.secondary">{`Risk per Ticket:`}</Typography>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>{`Risk per Ticket`}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>{`Shows how much the payout for each ticket can vary from the average. Higher risk means more unpredictable results—some tickets may win big, others may win nothing.`}</Typography>
                    <Typography variant="body2"><em>{`Low risk: Consistent payouts. High risk: Big swings possible.`}</em></Typography>
                  </Box>
                }
                arrow
                placement="top"
                open={riskTooltipOpen}
                onClose={handleRiskTooltipClose}
                disableFocusListener
                disableHoverListener
                disableTouchListener
              >
                <IconButton size="small" sx={{ p: 0.25 }} onClick={handleRiskTooltipToggle}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="h6">±${metrics.riskPerTicket.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', px: 2, py: 1, borderRadius: 1, boxShadow: 1 }}>
              <Typography variant="caption" color="text.secondary">{`Payout Concentration:`}</Typography>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>{`Payout Concentration`}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>{`Shows how much of the total prize money is concentrated in the biggest prizes. High concentration means most of the money is in a few big wins; low means it's spread across many tickets.`}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Example:</strong> If 80% of the prize money is in just 2 tickets, payout concentration is high (80%). If 80% is spread across 100 tickets, payout concentration is low.
                    </Typography>
                    <Typography variant="body2"><em>{`High: Jackpot style. Low: Frequent smaller wins.`}</em></Typography>
                  </Box>
                }
                arrow
                placement="top"
                open={payoutTooltipOpen}
                onClose={handlePayoutTooltipClose}
                disableFocusListener
                disableHoverListener
                disableTouchListener
              >
                <IconButton size="small" sx={{ p: 0.25 }} onClick={handlePayoutTooltipToggle}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography variant="h6">{(metrics.payoutConcentration * 100).toFixed(1)}%</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', px: 2, py: 1, borderRadius: 1, boxShadow: 1 }}>
              <Typography variant="caption" color="text.secondary">{`Estimate Stability:`}</Typography>
              <Chip 
                label={metrics.sensitivity.isEstimateSensitive ? `Sensitive` : `Stable`} 
                size="small" 
                color={metrics.sensitivity.isEstimateSensitive ? "warning" : "success"}
              />
            </Box>
          </Box>
        </Box>

        {/* Sensitivity Warning */}
        {metrics.sensitivity.isEstimateSensitive && (
          <Card variant="outlined" sx={{ bgcolor: 'warning.light' }}>
            <CardContent sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>{`⚠️ Estimate Sensitivity Warning`}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>{`EV at 90% estimate: $${metrics.sensitivity.evLow.toFixed(2)} | EV at 110% estimate: $${metrics.sensitivity.evHigh.toFixed(2)}`}</Typography>
              <Typography variant="caption">{`The profitability estimate is sensitive to your ticket count estimate. Consider refining your count.`}</Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};