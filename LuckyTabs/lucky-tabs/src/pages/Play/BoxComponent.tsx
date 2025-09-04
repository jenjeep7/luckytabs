import React, { useState, useEffect, useCallback } from 'react';
import { useUserProfile } from '../../context/UserProfileContext';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Chip,
  useTheme
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../../firebase';
import { ConfirmRemoveDialog, EstimateRemainingDialog, ClaimedPrize } from './BoxDialogs';
import { formatCurrency } from '../../utils/formatters';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  calculateTotalRemainingPrizeValue,
  calculateOneInXChances,
  evPerTicket,
  rtpRemaining,
  Prize
} from './helpers';
import { userService } from '../../services/userService';

type UserProfile = {
  plan?: string;
  // ...other fields as needed
};

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
  claimedPrizes?: ClaimedPrize[];
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
  refreshBoxes?: (boxId?: string) => void;
}

export const BoxComponent: React.FC<BoxComponentProps> = ({ 
  boxes, 
  onBoxRemoved,
  showOwner = true,
  marginTop = 3,
  refreshBoxes
}) => {
  const [firebaseUser] = useAuthState(auth);
  const { userProfile } = useUserProfile();
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
  
  // Local state to immediately track claimed prizes for real-time dialog updates
  const [localClaimedPrizes, setLocalClaimedPrizes] = useState<{ [boxId: string]: ClaimedPrize[] }>({});

  // Helper function to get claimed prizes (local state first, then box data)
  const getClaimedPrizes = useCallback((boxId: string): ClaimedPrize[] => {
    if (localClaimedPrizes[boxId]) {
      return localClaimedPrizes[boxId];
    }
    const box = boxes.find(b => b.id === boxId);
    return box?.claimedPrizes || [];
  }, [localClaimedPrizes, boxes]);

  // Helper function to determine EV color based on three-tier system
  // Green: RTP >= 100% (Excellent)
  // Orange: RTP >= 75% and < 100% (Decent)
  // Red: RTP < 75% (Poor)
  const getEvColor = (_evValue: number, rtpValue: number, isPercentage = true) => {
    const rtpGreen = isPercentage ? 100 : 1.0;
    const rtpOrange = isPercentage ? 75 : 0.75;
    if (rtpValue >= rtpGreen) {
      return '#4caf50'; // Green for RTP >= 100%
    } else if (rtpValue >= rtpOrange) {
      return '#ff9800'; // Orange for RTP >= 75%
    } else {
      return '#f44336'; // Red for RTP < 75%
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

  // Local state for optimistic UI updates
  const [optimisticUpdates, setOptimisticUpdates] = useState<{ [boxId: string]: { [ticketIndex: number]: number } }>({});

  const handlePrizeClick = (boxId: string, ticketIndex: number, prizeIndex: number) => {
    const toggleClaim = async () => {
      try {
        const boxRef = doc(db, 'boxes', boxId);
        const box = boxes.find(b => b.id === boxId);
        
        if (box && box.winningTickets) {
          const currentTicket = box.winningTickets[ticketIndex];
          let newClaimedTotal: number;
          
          // Toggle between claimed and unclaimed
          if (prizeIndex < currentTicket.claimedTotal) {
            // Unclaim: reduce claimedTotal by 1
            newClaimedTotal = Math.max(0, currentTicket.claimedTotal - 1);
          } else {
            // Claim: increase claimedTotal by 1
            newClaimedTotal = Math.min(currentTicket.totalPrizes, currentTicket.claimedTotal + 1);
          }

          // Optimistic update: immediately update local state for instant UI feedback
          setOptimisticUpdates(prev => {
            const boxUpdates = prev[boxId] || {};
            return {
              ...prev,
              [boxId]: {
                ...boxUpdates,
                [ticketIndex]: newClaimedTotal
              }
            };
          });

          const updatedTickets = [...box.winningTickets];
          updatedTickets[ticketIndex] = {
            ...currentTicket,
            claimedTotal: newClaimedTotal
          };

          await updateDoc(boxRef, {
            winningTickets: updatedTickets
          });

          // Keep the optimistic update - no need to clear it since UI should stay updated
          // Only refresh boxes in background for data consistency
          if (refreshBoxes) {
            refreshBoxes(boxId);
          }
        }
      } catch (error) {
        console.error('Error toggling prize claim:', error);
        // Only clear optimistic update on error to revert UI
        setOptimisticUpdates(prev => {
          const updated = { ...prev };
          if (updated[boxId]) {
            delete updated[boxId][ticketIndex];
            if (Object.keys(updated[boxId]).length === 0) {
              delete updated[boxId];
            }
          }
          return updated;
        });
        
        // Show error message to user
        alert('Failed to update prize. Please try again.');
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
  if (!firebaseUser?.uid) {
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
          rowEstimates: rowEstimates,
          estimatedTicketsUpdated: new Date(),
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
    // Clear local state for this box
    setLocalClaimedPrizes(prev => {
      const newState = { ...prev };
      delete newState[estimateDialog.boxId];
      return newState;
    });
  };

  const handleAddWin = useCallback(
    (claimedPrize: ClaimedPrize) => {
      const addWin = async () => {
        try {
          const boxRef = doc(db, 'boxes', estimateDialog.boxId);
          const boxDoc = await getDoc(boxRef);
          
          if (boxDoc.exists()) {
            const existingPrizes = (boxDoc.data().claimedPrizes as ClaimedPrize[]) || [];
            const updatedPrizes = [...existingPrizes, claimedPrize];
            
            // Update Firestore
            await updateDoc(boxRef, {
              claimedPrizes: updatedPrizes
            });
            
            // Immediately update local state for real-time UI update
            setLocalClaimedPrizes(prev => ({
              ...prev,
              [estimateDialog.boxId]: updatedPrizes
            }));
            
            // Refresh the box data in the background
            if (refreshBoxes) {
              refreshBoxes();
            }
          }
        } catch (error) {
          console.error('Error adding win:', error);
          alert('Failed to add win. Please try again.');
        }
      };
      
      void addWin();
    },
    [estimateDialog.boxId, refreshBoxes]
  );

  const handleRemainingTicketsChange = useCallback((boxId: string, ticketsRemaining: number) => {
    setRemainingTicketsInput(prev => ({
      ...prev,
      [boxId]: ticketsRemaining.toString()
    }));
    
    // Update Firestore
    const updateFirestore = async () => {
      try {
        // Check if user is authenticated
        if (!firebaseUser?.uid) {
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
  }, [firebaseUser?.uid]);

  const renderPrizeButtons = (box: BoxItem) => {
    if (!box.winningTickets) return null;

    const allPrizeButtons: React.ReactElement[] = [];

    box.winningTickets.forEach((ticket, ticketIndex) => {
      const prize = ticket.prize.toString();
      const totalPrizes = ticket.totalPrizes;
      // Use optimistic update if available, otherwise use the actual value
      const claimedTotal = optimisticUpdates[box.id]?.[ticketIndex] ?? ticket.claimedTotal;

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
        {boxes.map((box) => {
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
            <Box key={box.id} sx={{ p: .5, mb: 3, position: 'relative'}}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ textAlign: 'center', flex: 1 }}>                  
                  {/* EV Badge */}
                  {evData !== null && rtpData !== null && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={`Payout ${rtpData.toFixed(1)}%`}
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
                          Status: {getEvStatus(evData, rtpData, true)}
                        </Typography>
                      )}
                      {/* {evBandData && (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          EV range: ${evBandData.low.toFixed(2)} to ${evBandData.high.toFixed(2)}
                        </Typography>
                      )} */}
                    </Box>
                  )}
                  
                  <Typography>
                    <strong>{box.type === 'wall' ? 'Wall Box' : 'Bar Box'} #</strong> {box.boxNumber}
                  </Typography>
                  <Typography><strong>Price per Ticket:</strong> {formatCurrency(parseFloat(box.pricePerTicket))}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0 }}>
                      {renderPrizeButtons(box)}
                  </Box>
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
                          Enter Tickets by Row
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
                        {/* <Typography sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                          <strong>Winning Chance Per Ticket:</strong> {calculateChancePercentage(remainingTicketsInput, box.id, box)}
                        </Typography> */}
                        <Typography sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                          <strong>Odds:</strong> {calculateOneInXChances(remainingTicketsInput, box.id, box)}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          <strong>Total Remaining Prize Value:</strong> {formatCurrency(calculateTotalRemainingPrizeValue(box))}
                        </Typography>
                        {showOwner && (
                          <Typography>
                            <strong>Created By:</strong> {userDisplayNames[box.ownerId] || 'Loading...'}
                          </Typography>
                        )}
                        {/* <Typography sx={{ fontWeight: 'bold', color: getPayoutColor(remainingTicketsInput, box.id, box) }}>
                          <strong>Percent to buyout:</strong> {calculatePayoutPercentage(remainingTicketsInput, box.id, box)}
                        </Typography> */}
                      </>
                    )}
                  {/* Advanced Metrics Section in Accordion (Pro users only) */}
                  {remainingTicketsInput[box.id] && firebaseUser && userProfile?.plan === 'pro' && (
                    <Accordion sx={{ mt: 2, maxWidth: 800, mx: 'auto' }} defaultExpanded={false}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6">Advanced Analytics</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <AdvancedAnalytics 
                          box={box}
                          remainingTickets={Number(remainingTicketsInput[box.id])}
                          getEvColor={getEvColor}
                        />
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              </Box>
              </Box>

              {/* Moved action buttons to bottom */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                <IconButton
                  color="error"
                  size="small"
                  onClick={(e) => handleRemoveClick(e, box)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
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
        boxType={boxes.find(b => b.id === estimateDialog.boxId)?.type === 'wall' ? 'wall' : 'bar'}
        currentValue={Number(remainingTicketsInput[estimateDialog.boxId] || '0')}
        currentRowEstimates={boxes.find(b => b.id === estimateDialog.boxId)?.rowEstimates}
        claimedPrizes={getClaimedPrizes(estimateDialog.boxId)}
        availablePrizes={boxes.find(b => b.id === estimateDialog.boxId)?.winningTickets?.map(ticket => Number(ticket.prize)).filter(prize => prize > 0) || []}
        onUpdate={handleEstimateUpdate}
        onCancel={handleEstimateCancel}
        onAddWin={handleAddWin}
      />
    </>
  );
};
