/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Tooltip, IconButton, useTheme } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { BoxItem } from '../../services/boxService';
import { calculateAdvancedMetrics } from './helpers';

interface AdvancedAnalyticsProps {
  box: BoxItem;
  remainingTickets: number;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ box, remainingTickets }) => {
  const theme = useTheme();
  
  // Helper function to get EV/Dollar color
  const getValueColor = (evx: number) => {
    if (evx >= 1) return theme.neon.colors.green;
    if (evx >= 0.8) return theme.neon.colors.cyan;
    if (evx >= 0.6) return theme.neon.colors.amber;
    return theme.neon.colors.pink;
  };

  // Helper function to get neon colors based on risk ratio
  const getNeonColorForRisk = (riskValue: number) => {
    if (riskValue > 0.1) return theme.neon.colors.green; // Excellent risk-adjusted returns
    if (riskValue > 0) return theme.neon.colors.cyan; // Good returns
    if (riskValue > -0.1) return theme.neon.colors.amber; // Caution - some risk
    return theme.neon.colors.pink; // High risk with losses
  };
  
  // Helper function to get risk level text
  const getRiskLevelText = (riskValue: number): string => {
    if (riskValue <= 5) return 'Low';
    if (riskValue <= 15) return 'Med';
    if (riskValue <= 30) return 'High';
    return 'Extreme';
  };

  // Helper function to get risk level color
  const getRiskLevelColor = (riskValue: number): string => {
    if (riskValue <= 5) return theme.neon.colors.green;
    if (riskValue <= 15) return theme.neon.colors.cyan;
    if (riskValue <= 30) return theme.neon.colors.amber;
    return theme.neon.colors.pink;
  };

  const [payoutTooltipOpen, setPayoutTooltipOpen] = React.useState(false);
  const handlePayoutTooltipToggle = () => setPayoutTooltipOpen((open) => !open);
  const handlePayoutTooltipClose = () => setPayoutTooltipOpen(false);
  const [riskTooltipOpen, setRiskTooltipOpen] = React.useState(false);
  const handleRiskTooltipToggle = () => setRiskTooltipOpen((open) => !open);
  const handleRiskTooltipClose = () => setRiskTooltipOpen(false);

  const [evPerDollarTooltipOpen, setEvPerDollarTooltipOpen] = React.useState(false);
  const handleEvPerDollarTooltipToggle = () => setEvPerDollarTooltipOpen((open) => !open);
  const handleEvPerDollarTooltipClose = () => setEvPerDollarTooltipOpen(false);
  const [valueRiskTooltipOpen, setValueRiskTooltipOpen] = React.useState(false);
  const handleValueRiskTooltipToggle = () => setValueRiskTooltipOpen((open) => !open);
  const handleValueRiskTooltipClose = () => setValueRiskTooltipOpen(false);
  const [probabilityOfProfitTooltipOpen, setProbabilityOfProfitTooltipOpen] = React.useState(false);
  const handleProbabilityOfProfitTooltipToggle = () => setProbabilityOfProfitTooltipOpen((open) => !open);
  const handleProbabilityOfProfitTooltipClose = () => setProbabilityOfProfitTooltipOpen(false);
  const [bigHitTooltipOpen, setBigHitTooltipOpen] = React.useState(false);
  const handleBigHitTooltipToggle = () => setBigHitTooltipOpen((open) => !open);
  const handleBigHitTooltipClose = () => setBigHitTooltipOpen(false);
  const [bigHit100TooltipOpen, setBigHit100TooltipOpen] = React.useState(false);
  const handleBigHit100TooltipToggle = () => setBigHit100TooltipOpen((open) => !open);
  const handleBigHit100TooltipClose = () => setBigHit100TooltipOpen(false);
  const [liveHitRateTooltipOpen, setLiveHitRateTooltipOpen] = React.useState(false);
  const handleLiveHitRateTooltipToggle = () => setLiveHitRateTooltipOpen((open) => !open);
  const handleLiveHitRateTooltipClose = () => setLiveHitRateTooltipOpen(false);
  const [etfwTooltipOpen, setEtfwTooltipOpen] = React.useState(false);
  const handleEtfwTooltipToggle = () => setEtfwTooltipOpen((open) => !open);
  const handleEtfwTooltipClose = () => setEtfwTooltipOpen(false);
  const [prizeSurplusTooltipOpen, setPrizeSurplusTooltipOpen] = React.useState(false);
  const handlePrizeSurplusTooltipToggle = () => setPrizeSurplusTooltipOpen((open) => !open);
  const handlePrizeSurplusTooltipClose = () => setPrizeSurplusTooltipOpen(false);
  
  // Guard clause for invalid data - explicit intent
  if (!box || remainingTickets <= 0) return null;
  
  const metrics = calculateAdvancedMetrics(box, remainingTickets);
  // Use exact hypergeometric odds from calculateAdvancedMetrics


  return (
    <Box sx={{ mt: 2, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Core Metrics */}
        <Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2, 
              textAlign: 'center',
              ...theme.neon.effects.textGlow(theme.neon.colors.cyan, 0.6),
              fontSize: '1.2rem'
            }}
          >
            📊 Core Metrics
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2 
          }}>
            <Card 
              variant="outlined" 
              sx={{ 
                ...theme.neon.effects.boxGlow(theme.neon.colors.pink, 0.15),
                ...theme.neon.effects.hoverTransform,
                background: `linear-gradient(135deg, 
                  rgba(255,60,172,0.05) 0%, 
                  rgba(18,20,24,0.95) 50%, 
                  rgba(255,60,172,0.03) 100%)`,
                borderColor: 'rgba(255,60,172,0.2)'
              }}
            >
              <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: theme.neon.colors.text.secondary }}>
                    Value (EV per $)
                  </Typography>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>EV per Dollar (Return Multiple)</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>Shows how much you get back for every dollar spent. This is the most important metric for comparing boxes.</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Above 1.0:</strong> Excellent! You expect to get more than you spend<br/>
                          <strong>0.8-1.0:</strong> Decent (75-100% return rate)<br/>
                          <strong>0.6-0.8:</strong> Poor (60-75% return rate)<br/>
                          <strong>Below 0.6:</strong> Very Poor (less than 60% return)
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Example:</strong> 0.75 means you expect to get $0.75 back for every $1.00 spent on average.
                        </Typography>
                        <Typography variant="body2"><em>This accounts for all remaining prizes and tickets, giving you the true expected return rate.</em></Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                    open={evPerDollarTooltipOpen}
                    onClose={handleEvPerDollarTooltipClose}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <IconButton size="small" sx={{ p: 0.25, color: 'white' }} onClick={handleEvPerDollarTooltipToggle}>
                      <InfoIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: getValueColor(metrics.evPerDollar),
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      ...theme.neon.effects.textGlow(getValueColor(metrics.evPerDollar), 0.4),
                      lineHeight: 1
                    }}
                  >
                    {metrics.evPerDollar.toFixed(2)}×
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.65rem',
                      color: 'text.secondary',
                      lineHeight: 1
                    }}
                  >
                    {(metrics.evPerDollar * 100).toFixed(0)}% RTP
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card 
              variant="outlined" 
              sx={{ 
                ...theme.neon.effects.boxGlow(theme.neon.colors.green, 0.15),
                ...theme.neon.effects.hoverTransform,
                background: `linear-gradient(135deg, 
                  rgba(0,230,118,0.05) 0%, 
                  rgba(18,20,24,0.95) 50%, 
                  rgba(0,230,118,0.03) 100%)`,
                borderColor: 'rgba(0,230,118,0.2)'
              }}
            >
              <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: theme.neon.colors.text.secondary }}>
                    Value/Risk Ratio
                  </Typography>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Value/Risk Ratio (Risk-Adjusted Return)</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>A Sharpe-like ratio that measures expected value relative to volatility. This helps you find boxes with good returns that won&apos;t bankrupt you with bad streaks.</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Above 0.1:</strong> Excellent risk-adjusted returns<br/>
                          <strong>0.0 to 0.1:</strong> Good, manageable risk for the expected return<br/>
                          <strong>-0.1 to 0.0:</strong> Poor, high risk for small expected gains<br/>
                          <strong>Below -0.1:</strong> Very Poor, high risk with expected losses
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>How to use:</strong> Higher values mean better bang for your buck with less wild swings. Great for budget-conscious players.
                        </Typography>
                        <Typography variant="body2"><em>Calculated as Expected Value ÷ Standard Deviation of payouts</em></Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                    open={valueRiskTooltipOpen}
                    onClose={handleValueRiskTooltipClose}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <IconButton size="small" sx={{ p: 0.25, color: 'white' }} onClick={handleValueRiskTooltipToggle}>
                      <InfoIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: getNeonColorForRisk(metrics.valueRiskRatio),
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    ...theme.neon.effects.textGlow(getNeonColorForRisk(metrics.valueRiskRatio), 0.4)
                  }}
                >
                  {metrics.valueRiskRatio.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Live Metrics */}
        <Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2, 
              textAlign: 'center',
              ...theme.neon.effects.textGlow(theme.neon.colors.green, 0.6),
              fontSize: '1.2rem'
            }}
          >
            🎯 Live Metrics
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2 
          }}>
            <Card 
              variant="outlined" 
              sx={{ 
                ...theme.neon.effects.boxGlow(theme.neon.colors.green, 0.15),
                ...theme.neon.effects.hoverTransform,
                background: `linear-gradient(135deg, 
                  rgba(0,230,118,0.05) 0%, 
                  rgba(18,20,24,0.95) 50%, 
                  rgba(0,230,118,0.03) 100%)`,
                borderColor: 'rgba(0,230,118,0.2)'
              }}
            >
              <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: theme.neon.colors.text.secondary }}>
                    Win in Next 5
                  </Typography>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Chance of ≥1 Win in Next 5 Pulls</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>Your probability of hitting at least one prize of any amount in the next 5 tickets.</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>All Win Odds:</strong><br/>
                          • Next 1: {(metrics.anyWinOdds.next1 * 100).toFixed(1)}% (Live Hit Rate)<br/>
                          • Next 5: {(metrics.anyWinOdds.next5 * 100).toFixed(1)}% (Featured)<br/>
                          • Next 10: {(metrics.anyWinOdds.next10 * 100).toFixed(1)}%<br/>
                          • Next 20: {(metrics.anyWinOdds.next20 * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Uses hypergeometric probability accounting for drawing without replacement.
                        </Typography>
                        <Typography variant="body2"><em>Next 5 is the sweet spot for budget planning - not too conservative, not too aggressive.</em></Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                    open={liveHitRateTooltipOpen}
                    onClose={handleLiveHitRateTooltipClose}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <IconButton size="small" sx={{ p: 0.25, color: 'white' }} onClick={handleLiveHitRateTooltipToggle}>
                      <InfoIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: metrics.anyWinOdds.next5 > 0.8 ? theme.neon.colors.green : metrics.anyWinOdds.next5 > 0.6 ? theme.neon.colors.cyan : theme.neon.colors.amber,
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    ...theme.neon.effects.textGlow(
                      metrics.anyWinOdds.next5 > 0.8 ? theme.neon.colors.green : metrics.anyWinOdds.next5 > 0.6 ? theme.neon.colors.cyan : theme.neon.colors.amber, 
                      0.4
                    )
                  }}
                >
                  {(metrics.anyWinOdds.next5 * 100).toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>

            <Card 
              variant="outlined" 
              sx={{ 
                ...theme.neon.effects.boxGlow(theme.neon.colors.amber, 0.15),
                ...theme.neon.effects.hoverTransform,
                background: `linear-gradient(135deg, 
                  rgba(255,193,7,0.05) 0%, 
                  rgba(18,20,24,0.95) 50%, 
                  rgba(255,193,7,0.03) 100%)`,
                borderColor: 'rgba(255,193,7,0.2)'
              }}
            >
              <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: theme.neon.colors.text.secondary }}>
                    Tickets to Win
                  </Typography>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Expected Tickets to First Win (ETW)</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>How many tickets, on average, until the next win?</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Uses negative-hypergeometric mean formula: ETW = (N + 1) / (K + 1)
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Lower is better!</strong> Super intuitive for users.
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Example:</strong> 4.2 means you&apos;d expect to pull about 4-5 tickets before hitting your first winner.
                        </Typography>
                        <Typography variant="body2"><em>{`This gives you a gut-check number: "How many duds before I hit something?"`}</em></Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                    open={etfwTooltipOpen}
                    onClose={handleEtfwTooltipClose}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <IconButton size="small" sx={{ p: 0.25, color: 'white' }} onClick={handleEtfwTooltipToggle}>
                      <InfoIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: metrics.expectedTicketsToFirstWin <= 3 ? theme.neon.colors.green : metrics.expectedTicketsToFirstWin <= 6 ? theme.neon.colors.cyan : theme.neon.colors.amber,
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    ...theme.neon.effects.textGlow(
                      metrics.expectedTicketsToFirstWin <= 3 ? theme.neon.colors.green : metrics.expectedTicketsToFirstWin <= 6 ? theme.neon.colors.cyan : theme.neon.colors.amber, 
                      0.4
                    )
                  }}
                >
                  {metrics.expectedTicketsToFirstWin === Infinity ? '∞' : metrics.expectedTicketsToFirstWin.toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Prize Surplus Ratio */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', my: 2, textAlign: 'center' }}>{`📈 Prize Density Analysis`}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', px: 2, py: 1, borderRadius: 1, boxShadow: 1, minWidth: 200 }}>
              <Typography variant="caption" color="text.secondary">{`Prize Surplus Ratio:`}</Typography>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>{`Prize Surplus Ratio`}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>{`Are prizes 'overrepresented' compared to tickets left vs. how the box started?`}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>How it works:</strong> PSR = (Current Winners / Current Tickets) / (Original Winners / Original Tickets)
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Reading the ratio:</strong><br/>
                      • 1.0 = Same density as when box started<br/>
                      • &gt;1.0 = Higher concentration of winners than original (good!)<br/>
                      • &lt;1.0 = Lower concentration, winners picked off already
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Strategy:</strong> Values above 1.0 suggest the box is proportionally richer in winners than when it started.
                    </Typography>
                    <Typography variant="body2"><em>{`This tells you if early players already "cherry-picked" the good tickets or if winners are still dense.`}</em></Typography>
                  </Box>
                }
                arrow
                placement="top"
                open={prizeSurplusTooltipOpen}
                onClose={handlePrizeSurplusTooltipClose}
                disableFocusListener
                disableHoverListener
                disableTouchListener
              >
                <IconButton size="small" sx={{ p: 0.25 }} onClick={handlePrizeSurplusTooltipToggle}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: metrics.prizeSurplusRatio >= 1.2 ? theme.neon.colors.green : 
                        metrics.prizeSurplusRatio >= 0.9 ? theme.neon.colors.cyan : theme.neon.colors.amber,
                  fontWeight: 'bold'
                }}
              >
                {metrics.prizeSurplusRatio.toFixed(2)}x
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.65rem',
                  color: 'text.secondary',
                  fontStyle: 'italic'
                }}
              >
                experimental
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Probability of Profit for Different Budgets */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', my: 1, textAlign: 'center' }}>{`🎲 Probability of Profit`}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Card variant="outlined" sx={{ flex: '1 1 250px' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, justifyContent: 'center' }}>
                  <Typography variant="subtitle2">{`Budget Analysis`}</Typography>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>{`Probability of Profit by Budget`}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>{`Shows your realistic chances of walking away with more money than you spent for different budget levels. This uses advanced statistical modeling.`}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>How it works:</strong> Uses normal distribution approximation with finite population correction to account for drawing tickets without replacement (like real life).
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Color coding:</strong><br/>
                          🟢 Green (&gt;50%): Good odds of profit<br/>
                          🟡 Yellow (30-50%): Fair odds, some risk<br/>
                          🔴 Red (&lt;30%): Poor odds, high risk of loss
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Strategy tips:</strong><br/>
                          • For $20: Look for &gt;40% for casual play<br/>
                          • For $50+: Look for &gt;30% for serious play<br/>
                          • Higher budgets often have better odds due to law of large numbers
                        </Typography>
                        <Typography variant="body2"><em>This is your most reliable predictor of actual gambling success.</em></Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                    open={probabilityOfProfitTooltipOpen}
                    onClose={handleProbabilityOfProfitTooltipClose}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <IconButton size="small" sx={{ p: 0.25 }} onClick={handleProbabilityOfProfitTooltipToggle}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">$20 Budget:</Typography>
                    <Chip 
                      label={`${(metrics.probabilityOfProfit.budget20 * 100).toFixed(1)}%`} 
                      size="small" 
                      color={metrics.probabilityOfProfit.budget20 > 0.5 ? "success" : metrics.probabilityOfProfit.budget20 > 0.3 ? "warning" : "error"}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">$50 Budget:</Typography>
                    <Chip 
                      label={`${(metrics.probabilityOfProfit.budget50 * 100).toFixed(1)}%`} 
                      size="small" 
                      color={metrics.probabilityOfProfit.budget50 > 0.5 ? "success" : metrics.probabilityOfProfit.budget50 > 0.3 ? "warning" : "error"}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">$100 Budget:</Typography>
                    <Chip 
                      label={`${(metrics.probabilityOfProfit.budget100 * 100).toFixed(1)}%`} 
                      size="small" 
                      color={metrics.probabilityOfProfit.budget100 > 0.5 ? "success" : metrics.probabilityOfProfit.budget100 > 0.3 ? "warning" : "error"}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Advanced Big Hit Analysis */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', my: 1, textAlign: 'center' }}>{`🎯 Advanced Big Hit Analysis`}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Card variant="outlined" sx={{ flex: '1 1 300px' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, justifyContent: 'center' }}>
                  <Typography variant="subtitle2">{`$50+ Prize Odds`}</Typography>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>{`Big Hit Odds - $50+ Prizes`}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>{`Shows your exact probability of hitting at least one prize worth $50 or more with different budget levels. Perfect for players targeting medium-sized wins.`}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>How it works:</strong> Uses hypergeometric probability distribution to give you precise odds without replacement - the same math casinos use.
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Strategy guide:</strong><br/>
                          • &lt;5%: Very unlikely, not worth chasing<br/>
                          • 5-15%: Reasonable chase odds<br/>
                          • 15-30%: Good chase odds<br/>
                          • &gt;30%: Excellent chase odds
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>When to use:</strong> Great for players who want decent-sized wins without going for the absolute biggest prizes. Good balance of risk and reward.
                        </Typography>
                        <Typography variant="body2"><em>This tells you if it&apos;s worth spending more to chase bigger wins in this specific box.</em></Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                    open={bigHitTooltipOpen}
                    onClose={handleBigHitTooltipClose}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <IconButton size="small" sx={{ p: 0.25 }} onClick={handleBigHitTooltipToggle}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">$20:</Typography>
                    <Chip 
                      label={`${(metrics.bigHitOdds.over50.budget20 * 100).toFixed(1)}%`} 
                      size="small" 
                      color="secondary"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">$50:</Typography>
                    <Chip 
                      label={`${(metrics.bigHitOdds.over50.budget50 * 100).toFixed(1)}%`} 
                      size="small" 
                      color="secondary"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">$100:</Typography>
                    <Chip 
                      label={`${(metrics.bigHitOdds.over50.budget100 * 100).toFixed(1)}%`} 
                      size="small" 
                      color="secondary"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: '1 1 300px' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, justifyContent: 'center' }}>
                  <Typography variant="subtitle2">{`Top 2 Prize Odds`}</Typography>
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>{`Top 2 Prize Odds (Highest Value Targets)`}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>{`Shows your exact probability of hitting at least one of the top 2 highest-value prizes remaining in this box. This adapts to what's actually available.`}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>How it works:</strong> We identify the 2 highest prize values left in the box and calculate your odds of hitting at least one of them with different budgets.
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Strategic advantage:</strong><br/>
                          • &lt;5%: Very unlikely, probably not worth targeting<br/>
                          • 5-15%: Fair chase odds for premium prizes<br/>
                          • 15-30%: Good chase odds, worth considering<br/>
                          • &gt;30%: Excellent opportunity for top prizes
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>When to use:</strong> Perfect for targeting the absolute best prizes without being locked into arbitrary dollar amounts. If the biggest prize is $25, you&apos;ll see odds for that instead of impossible $100+ odds.
                        </Typography>
                        <Typography variant="body2"><em>This dynamically shows the most relevant big prize opportunities for each specific box.</em></Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                    open={bigHit100TooltipOpen}
                    onClose={handleBigHit100TooltipClose}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <IconButton size="small" sx={{ p: 0.25 }} onClick={handleBigHit100TooltipToggle}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">$20:</Typography>
                    <Chip 
                      label={`${(metrics.bigHitOdds.top2Prizes.budget20 * 100).toFixed(1)}%`} 
                      size="small" 
                      color="info"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">$50:</Typography>
                    <Chip 
                      label={`${(metrics.bigHitOdds.top2Prizes.budget50 * 100).toFixed(1)}%`} 
                      size="small" 
                      color="info"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">$100:</Typography>
                    <Chip 
                      label={`${(metrics.bigHitOdds.top2Prizes.budget100 * 100).toFixed(1)}%`} 
                      size="small" 
                      color="info"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>



        {/* Risk Analysis */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', my: 2, textAlign: 'center' }}>{`⚠️ Risk Analysis`}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', px: 2, py: 1, borderRadius: 1, boxShadow: 1 }}>
              <Typography variant="caption" color="text.secondary">{`Risk:`}</Typography>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>{`Risk Level (Standard Deviation)`}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>{`Shows how much the payout for each ticket can vary from the average. This measures volatility - how &quot;swingy&quot; your results will be.`}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Understanding risk levels:</strong><br/>
                      • $0-5: Low risk, consistent payouts<br/>
                      • $5-15: Moderate risk, some big swings<br/>
                      • $15-30: High risk, expect wild variations<br/>
                      • $30+: Extreme risk, feast or famine
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>How to use:</strong> Lower risk means more predictable results. Higher risk means you could win big or lose big - perfect for thrill-seekers with proper bankrolls.
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Strategy:</strong> Match risk level to your bankroll. If you have $50, don&apos;t play boxes with $40+ risk per ticket.
                    </Typography>
                    <Typography variant="body2"><em>This is calculated using statistical standard deviation of all remaining prize values.</em></Typography>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: getRiskLevelColor(metrics.riskPerTicket),
                    fontWeight: 'bold',
                    lineHeight: 1
                  }}
                >
                  {getRiskLevelText(metrics.riskPerTicket)}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '0.65rem',
                    color: 'text.secondary',
                    lineHeight: 1
                  }}
                >
                  ±${metrics.riskPerTicket.toFixed(2)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', px: 2, py: 1, borderRadius: 1, boxShadow: 1 }}>
              <Typography variant="caption" color="text.secondary">{`Payout Concentration:`}</Typography>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>{`Payout Concentration`}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>{`Shows what percentage of the total prize pool is concentrated in the top 20% of prize tiers by value. High concentration means most of the money is in a few big wins; low means it's spread across many tickets.`}</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Calculation:</strong> % of total prize pool held by the top 20% of prize tiers (by dollar value).
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Example:</strong> If the top 20% of prize tiers contain 80% of all prize money, concentration is 80%. If they only contain 40%, concentration is 40%.
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
              <Typography variant="body2" sx={{ mb: 1 }}>{`EV per ticket at 90% estimate: $${metrics.sensitivity.evLow.toFixed(2)} | EV per ticket at 110% estimate: $${metrics.sensitivity.evHigh.toFixed(2)}`}</Typography>
              <Typography variant="caption">{`The profitability estimate is sensitive to your ticket count estimate. Consider refining your count.`}</Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};