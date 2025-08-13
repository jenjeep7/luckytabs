import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  IconButton,
  TextField,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Divider,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  ExpandMore as ExpandMoreIcon,
  Analytics as AnalyticsIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../../firebase';
import { ConfirmRemoveDialog, EstimateRemainingDialog } from './BoxDialogs';
import {
  calculateRemainingPrizes,
  calculateTotalRemainingPrizeValue,
  calculatePayoutPercentage,
  getPayoutColor,
  calculateChancePercentage,
  calculateOneInXChances,
  calculateAdvancedMetrics,
  evPerTicket,
  evBand,
  rtpRemaining,
  Prize
} from './helpers';

interface WinningTicket {
  totalPrizes: number;
  claimedTotal: number;
  prize: string | number;
}

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
  winningTickets?: WinningTicket[];
  estimatedRemainingTickets?: number;
  rowEstimates?: {
    row1: number;
    row2: number;
    row3: number;
    row4: number;
  };
  [key: string]: unknown;
}

interface BoxComponentProps {
  title: string;
  boxes: BoxItem[];
  onBoxClick: (box: BoxItem) => void;
  onBoxRemoved?: () => void;
  showOwner?: boolean;
  marginTop?: number;
}

export const BoxComponent: React.FC<BoxComponentProps> = ({ 
  title, 
  boxes, 
  onBoxClick, 
  onBoxRemoved,
  showOwner = true,
  marginTop = 3 
}) => {
  const [user] = useAuthState(auth);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; boxId: string; boxName: string }>({
    open: false,
    boxId: '',
    boxName: ''
  });

  const [userDisplayNames, setUserDisplayNames] = useState<{ [userId: string]: string }>({});
  const [remainingTicketsInput, setRemainingTicketsInput] = useState<{ [boxId: string]: string }>({});
  const [estimateDialog, setEstimateDialog] = useState<{ 
    open: boolean; 
    boxId: string; 
    boxName: string;
  }>({
    open: false,
    boxId: '',
    boxName: ''
  });

  // Helper function to determine EV color based on three-tier system
  // Green: EV >= 0 (Excellent - player advantage)
  // Orange: RTP >= 80% but EV < 0 (Decent - reasonable value)  
  // Red: RTP < 80% (Poor - avoid)
  const getEvColor = (evValue: number, rtpValue: number, isPercentage = true) => {
    const rtpThreshold = isPercentage ? 80 : 0.8;
    
    if (evValue >= 0) {
      return '#4caf50'; // Green for positive EV (>100% RTP)
    } else if (rtpValue >= rtpThreshold) {
      return '#ff9800'; // Orange for decent (80-99% RTP)
    } else {
      return '#f44336'; // Red for poor (<80% RTP)
    }
  };

  // Helper function to get EV status text
  const getEvStatus = (evValue: number, rtpValue: number, isPercentage = true) => {
    const rtpThreshold = isPercentage ? 80 : 0.8;
    
    if (evValue >= 0) {
      return 'Excellent';
    } else if (rtpValue >= rtpThreshold) {
      return 'Decent';
    } else {
      return 'Poor';
    }
  };

  useEffect(() => {
    const fetchUserDisplayNames = async () => {
      if (!showOwner || boxes.length === 0) return;

      const uniqueOwnerIds = Array.from(new Set(boxes.map(box => box.ownerId))).filter((id): id is string => typeof id === 'string');
      const displayNames: { [userId: string]: string } = {};

      await Promise.all(
        uniqueOwnerIds.map(async (ownerId: string) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', ownerId));
            if (userDoc.exists()) {
              const userData = userDoc.data() as { displayName?: string };
              displayNames[ownerId] = userData.displayName || 'Unknown User';
            } else {
              displayNames[ownerId] = 'Unknown User';
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            displayNames[ownerId] = 'Unknown User';
          }
        })
      );

      setUserDisplayNames(displayNames);
    };

    // Initialize remaining tickets input from database values
    const initializeRemainingTickets = () => {
      if (boxes.length > 0) {
        const initialValues: { [boxId: string]: string } = {};
        boxes.forEach(box => {
          if (box.estimatedRemainingTickets !== undefined && box.estimatedRemainingTickets !== null) {
            initialValues[box.id] = box.estimatedRemainingTickets.toString();
          }
        });
        setRemainingTicketsInput(initialValues);
      }
    };

    void fetchUserDisplayNames();
    initializeRemainingTickets();
  }, [boxes, showOwner]);

  const handleRemoveClick = (e: React.MouseEvent, box: BoxItem) => {
    e.stopPropagation();
    setConfirmDialog({
      open: true,
      boxId: box.id,
      boxName: box.boxName
    });
  };

  const handleEditClick = (e: React.MouseEvent, box: BoxItem) => {
    e.stopPropagation();
    onBoxClick(box);
  };

  const handleConfirmRemove = () => {
    const removeBox = async () => {
      try {
        const boxRef = doc(db, 'boxes', confirmDialog.boxId);
        await updateDoc(boxRef, {
          isActive: false
        });
        
        setConfirmDialog({ open: false, boxId: '', boxName: '' });
        
        // Call the callback to refresh the data
        if (onBoxRemoved) {
          onBoxRemoved();
        }
      } catch (error) {
        console.error('Error removing box:', error);
      }
    };
    
    void removeBox();
  };

  const handleCancelRemove = () => {
    setConfirmDialog({ open: false, boxId: '', boxName: '' });
  };

  const handlePrizeClick = (boxId: string, ticketIndex: number, prizeIndex: number) => {
    const toggleClaim = async () => {
      try {
        const boxRef = doc(db, 'boxes', boxId);
        const box = boxes.find(b => b.id === boxId);
        
        if (box && box.winningTickets) {
          const updatedTickets = [...box.winningTickets];
          const currentTicket = updatedTickets[ticketIndex];
          
          // Toggle between claimed and unclaimed
          if (prizeIndex < currentTicket.claimedTotal) {
            // Unclaim: reduce claimedTotal by 1
            updatedTickets[ticketIndex] = {
              ...currentTicket,
              claimedTotal: Math.max(0, currentTicket.claimedTotal - 1)
            };
          } else {
            // Claim: increase claimedTotal by 1
            updatedTickets[ticketIndex] = {
              ...currentTicket,
              claimedTotal: Math.min(currentTicket.totalPrizes, currentTicket.claimedTotal + 1)
            };
          }

          await updateDoc(boxRef, {
            winningTickets: updatedTickets
          });

          // Refresh data if callback exists
          if (onBoxRemoved) {
            onBoxRemoved();
          }
        }
      } catch (error) {
        console.error('Error toggling prize claim:', error);
      }
    };

    void toggleClaim();
  };

  const handleEstimateClick = (box: BoxItem) => {
    setEstimateDialog({
      open: true,
      boxId: box.id,
      boxName: box.boxName
    });
  };

  const handleEstimateUpdate = (totalTickets: number, rowEstimates: { row1: number; row2: number; row3: number; row4: number }) => {
    const updateEstimate = async () => {
      try {
        // Check if user is authenticated
        if (!user?.uid) {
          console.warn('User not authenticated, cannot update box');
          return;
        }

        // Update local state
        setRemainingTicketsInput(prev => ({
          ...prev,
          [estimateDialog.boxId]: totalTickets.toString()
        }));

        // Update Firestore with both total and row estimates
        const boxRef = doc(db, 'boxes', estimateDialog.boxId);
        await updateDoc(boxRef, {
          estimatedRemainingTickets: totalTickets,
          rowEstimates: rowEstimates
        });

        setEstimateDialog({ open: false, boxId: '', boxName: '' });
        
        // Refresh data if callback exists
        if (onBoxRemoved) {
          onBoxRemoved();
        }
      } catch (error) {
        console.error('Error updating estimated remaining tickets:', error);
        // Still update local state even if DB update fails
        setRemainingTicketsInput(prev => ({
          ...prev,
          [estimateDialog.boxId]: totalTickets.toString()
        }));
        setEstimateDialog({ open: false, boxId: '', boxName: '' });
      }
    };

    void updateEstimate();
  };

  const handleEstimateCancel = () => {
    setEstimateDialog({ open: false, boxId: '', boxName: '' });
  };

  const handleRemainingTicketsChange = useCallback((boxId: string, ticketsRemaining: number) => {
    setRemainingTicketsInput(prev => ({
      ...prev,
      [boxId]: ticketsRemaining.toString()
    }));
    
    // Update Firestore
    const updateFirestore = async () => {
      try {
        // Check if user is authenticated
        if (!user?.uid) {
          console.warn('User not authenticated, cannot update box');
          return;
        }

        const boxRef = doc(db, 'boxes', boxId);
        await updateDoc(boxRef, {
          estimatedRemainingTickets: ticketsRemaining
        });
      } catch (error) {
        console.error('Error updating remaining tickets:', error);
      }
    };
    
    void updateFirestore();
  }, [user?.uid]);

  const renderPrizeButtons = (box: BoxItem) => {
    if (!box.winningTickets) return null;

    const allPrizeButtons: React.ReactElement[] = [];

    box.winningTickets.forEach((ticket, ticketIndex) => {
      const prize = ticket.prize.toString();
      const totalPrizes = ticket.totalPrizes;
      const claimedTotal = ticket.claimedTotal;

      for (let i = 0; i < totalPrizes; i++) {
        const isClaimed = i < claimedTotal;
        allPrizeButtons.push(
          <Button
            key={`${ticketIndex}-${i}`}
            variant={isClaimed ? "outlined" : "contained"}
            onClick={() => handlePrizeClick(box.id, ticketIndex, i)}
            sx={{
              minWidth: 60,
              minHeight: 40,
              m: 0.5,
              // Dark mode specific styling for unclaimed buttons
              ...(isDarkMode && !isClaimed && {
                backgroundColor: '#1e1e1e',
                color: '#ffffff',
                border: '1px solid #ffffff',
                '&:hover': {
                  backgroundColor: '#2a2a2a',
                  borderColor: '#ffffff',
                }
              }),
              // Light mode styling for unclaimed buttons
              ...(!isDarkMode && !isClaimed && {
                backgroundColor: 'primary.main',
                color: 'white',
              }),
              // Claimed button styling (works for both modes)
              ...(isClaimed && {
                backgroundColor: 'transparent',
                color: 'text.disabled',
                borderColor: 'text.disabled',
                textDecoration: 'line-through',
                opacity: 0.6,
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderColor: 'text.secondary',
                  color: 'text.primary'
                }
              }),
              transition: 'all 0.2s ease-in-out'
            }}
          >
            ${prize}
          </Button>
        );
      }
    });

    return allPrizeButtons;
  };

  if (boxes.length === 0) return null;

  return (
    <>
      <Box sx={{ mt: marginTop }}>
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
        {boxes.map((box) => {
          const remainingPrizes = calculateRemainingPrizes(box);
          const pricePerTicket = parseFloat(box.pricePerTicket);
          const estimatedTickets = Number(remainingTicketsInput[box.id]) || box.estimatedRemainingTickets || 0;
          
          // Calculate EV data
          let evData = null;
          let rtpData = null;
          // let evBandData = null;
          if (estimatedTickets > 0 && box.winningTickets) {
            const prizes: Prize[] = box.winningTickets.map(ticket => ({
              value: Number(ticket.prize),
              remaining: Number(ticket.totalPrizes) - Number(ticket.claimedTotal)
            }));
            
            const ev = evPerTicket(pricePerTicket, estimatedTickets, prizes);
            const rtp = rtpRemaining(pricePerTicket, estimatedTickets, prizes);
            // const band = evBand(pricePerTicket, estimatedTickets, prizes);
            
            evData = ev;
            rtpData = rtp;
            // evBandData = band;
          }
          
          return (
            <Paper
              key={box.id}
              sx={{ p: 3, mb: 3, position: 'relative'}}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {box.boxName}
                  </Typography>
                  
                  {/* EV Badge */}
                  {evData !== null && rtpData !== null && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={`EV ${evData >= 0 ? '+' : ''}$${evData.toFixed(2)} / ticket`}
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          px: 2,
                          py: 1,
                          backgroundColor: getEvColor(evData, rtpData, true), // rtpData is percentage format
                          color: 'white',
                          '& .MuiChip-label': {
                            fontWeight: 'bold'
                          }
                        }}
                      />
                      {rtpData !== null && (
                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                          RTP: {rtpData.toFixed(1)}% • Status: {getEvStatus(evData, rtpData, true)}
                        </Typography>
                      )}
                      {/* {evBandData && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          EV range: ${evBandData.low.toFixed(2)} to ${evBandData.high.toFixed(2)}
                        </Typography>
                      )} */}
                    </Box>
                  )}
                  
                  <Typography><strong>Number:</strong> {box.boxNumber}</Typography>
                  <Typography><strong>Price per Ticket:</strong> ${box.pricePerTicket}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                      {renderPrizeButtons(box)}
                  </Box>

                  <Typography><strong>Total Remaining Prizes:</strong> ${remainingPrizes}</Typography>
                  {showOwner && (
                    <Typography><strong>Created By:</strong> {userDisplayNames[box.ownerId] || 'Loading...'}</Typography>
                  )}
                  
                  {/* Remaining Tickets Input and Chance Calculation */}
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    {box.type === 'wall' ? (
                      <>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleEstimateClick(box)}
                          sx={{ maxWidth: 200 }}
                        >
                          Estimate Tickets
                        </Button>
                        {remainingTicketsInput[box.id] && (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Remaining Tickets: {remainingTicketsInput[box.id]}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <TextField
                        label="Estimated Remaining Tickets"
                        type="number"
                        size="small"
                        value={remainingTicketsInput[box.id] || ''}
                        onChange={(e) => handleRemainingTicketsChange(box.id, Number(e.target.value))}
                        sx={{ maxWidth: 200 }}
                      />
                    )}
                    {remainingTicketsInput[box.id] && (
                      <>
                        <Typography sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                          <strong>Winning Chance Per Ticket:</strong> {calculateChancePercentage(remainingTicketsInput, box.id, box)}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                          <strong>Odds:</strong> {calculateOneInXChances(remainingTicketsInput, box.id, box)} chance
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          <strong>Total Remaining Prize Value:</strong> ${calculateTotalRemainingPrizeValue(box)}
                        </Typography>
                        {/* <Typography sx={{ fontWeight: 'bold', color: getPayoutColor(remainingTicketsInput, box.id, box) }}>
                          <strong>Percent to buyout:</strong> {calculatePayoutPercentage(remainingTicketsInput, box.id, box)}
                        </Typography> */}
                      </>
                    )}
                  {/* Advanced Metrics Section */}
                  {remainingTicketsInput[box.id] && (
                    <Accordion sx={{ mt: 2, maxWidth: 800, mx: 'auto' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AnalyticsIcon />
                          <Typography variant="h6">Advanced Analytics</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {(() => {
                          const remainingTickets = Number(remainingTicketsInput[box.id]);
                          const metrics = calculateAdvancedMetrics(box, remainingTickets);
                          
                          return (
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
                                      <Typography variant="h6" sx={{ color: getEvColor(metrics.evPerTicket, metrics.rtpRemaining, false) }}> {/* decimal format */}
                                        {metrics.evPerTicket >= 0 ? '+' : ''}${metrics.evPerTicket.toFixed(2)}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card variant="outlined" sx={{ flex: '1 1 200px' }}>
                                    <CardContent sx={{ p: 2 }}>
                                      <Typography variant="caption" color="text.secondary">RTP Remaining</Typography>
                                      <Typography variant="h6" sx={{ color: getEvColor(metrics.evPerTicket, metrics.rtpRemaining, false) }}> {/* decimal format */}
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
                          );
                        })()}
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              </Box>
              </Box>

              {/* Moved action buttons to bottom */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                <IconButton
                  color="info"
                  size="small"
                  onClick={(e) => handleEditClick(e, box)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={(e) => handleRemoveClick(e, box)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          );
        })}
      </Box>

      <ConfirmRemoveDialog
        open={confirmDialog.open}
        boxName={confirmDialog.boxName}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />

      <EstimateRemainingDialog
        open={estimateDialog.open}
        boxName={estimateDialog.boxName}
        currentValue={Number(remainingTicketsInput[estimateDialog.boxId] || '0')}
        currentRowEstimates={boxes.find(b => b.id === estimateDialog.boxId)?.rowEstimates}
        onUpdate={handleEstimateUpdate}
        onCancel={handleEstimateCancel}
      />
    </>
  );
};
