import React, { useState, useEffect, useCallback } from 'react';
import { useUserProfile } from '../../context/UserProfileContext';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  useTheme
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../../firebase';
import { ConfirmRemoveDialog, EstimateRemainingDialog, ClaimedPrize } from './BoxDialogs';
import { formatCurrency } from '../../utils/formatters';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import FlareSheetDisplay from '../../components/FlareSheetDisplay';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EvChip } from '../../components/EvChip';
import { StatusType, getCardGlowStyles } from '../../utils/neonUtils';
import {
  calculateTotalRemainingPrizeValue,
  calculateOneInXChances,
  evPerTicket,
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

  // Helper function to determine EV color based on neon theme system
  // Cyan: RTP >= 100% (Excellent)
  // Amber: RTP >= 80% and < 100% (Decent)
  // Pink: RTP < 80% (Poor)
  const getEvColor = (_evValue: number, rtpValue: number, isPercentage = true): string => {
    const rtpExcellent = isPercentage ? 100 : 1.0;
    const rtpDecent = isPercentage ? 80 : 0.80;
    if (rtpValue >= rtpExcellent) {
      return theme.neon.colors.cyan; // Cyan for RTP >= 100%
    } else if (rtpValue >= rtpDecent) {
      return theme.neon.colors.amber; // Amber for RTP >= 80%
    } else {
      return theme.neon.colors.pink; // Pink for RTP < 80%
    }
  };

  // Helper function to get EV status text based on neon theme
  const getEvStatus = (evValue: number, rtpValue: number): StatusType => {
    if (evValue >= 0) {
      return 'excellent'; // Positive EV = excellent (cyan)
    } else if (rtpValue >= 80) {
      return 'decent'; // Negative EV but decent RTP = decent (amber)
    } else {
      return 'poor'; // Low RTP = poor (pink)
    }
  };

  // Separate component for EV Badge to help with TypeScript inference
  // eslint-disable-next-line react/prop-types
  const EvBadge = ({ evData, rtpData }: { evData: number; rtpData: number }): React.ReactElement => {
    const status = getEvStatus(evData, rtpData);
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    
    return (
      <Box sx={{ mb: 2 }}>
        <EvChip
          label={`${statusText} - ${rtpData.toFixed(1)}%`}
          tone={status}
        />
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Expected Value: {evData >= 0 ? '+' : ''}{formatCurrency(Math.abs(evData))}
        </Typography>
      </Box>
    );
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
        setRemainingTicketsInput(prev => {
          const newValues = { ...prev };
          boxes.forEach(box => {
            // Only initialize if we don't already have a value for this box
            if (!prev[box.id] && box.estimatedRemainingTickets !== undefined && box.estimatedRemainingTickets !== null) {
              newValues[box.id] = box.estimatedRemainingTickets.toString();
            }
          });
          return newValues;
        });
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
          // Use optimistic update if available, otherwise use the actual value
          const currentClaimedTotal = optimisticUpdates[boxId]?.[ticketIndex] ?? currentTicket.claimedTotal;
          let newClaimedTotal: number;
          
          // Check if this specific prize is currently claimed
          const isPrizeClaimed = prizeIndex < currentClaimedTotal;
          
          if (isPrizeClaimed) {
            // Unclaim: reduce claimedTotal by 1
            newClaimedTotal = Math.max(0, currentClaimedTotal - 1);
          } else {
            // Claim: increase claimedTotal by 1
            newClaimedTotal = Math.min(currentTicket.totalPrizes, currentClaimedTotal + 1);
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

          // Get the most current state for Firebase update by applying all optimistic updates
          const effectiveTickets = getEffectiveWinningTickets(box);
          const updatedTickets = [...effectiveTickets];
          updatedTickets[ticketIndex] = {
            ...updatedTickets[ticketIndex],
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
    // Sync the input with the database value when opening dialog
    if (box.estimatedRemainingTickets !== undefined && box.estimatedRemainingTickets !== null) {
      setRemainingTicketsInput(prev => ({
        ...prev,
        [box.id]: String(box.estimatedRemainingTickets)
      }));
    }
    
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
        
        // Refresh the parent component's boxes state with the updated data
        if (refreshBoxes) {
          refreshBoxes(boxId);
        }
      } catch (error) {
        console.error('Error updating remaining tickets:', error);
      }
    };
    
    void updateFirestore();
  }, [firebaseUser?.uid, refreshBoxes]);

  // Helper function to get effective winning tickets (considering optimistic updates)
  const getEffectiveWinningTickets = useCallback((box: BoxItem): WinningTicket[] => {
    if (!box.winningTickets) return [];
    
    const optimisticUpdatesForBox = optimisticUpdates[box.id];
    if (!optimisticUpdatesForBox) return box.winningTickets;
    
    return box.winningTickets.map((ticket, index) => {
      const optimisticClaimedTotal = optimisticUpdatesForBox[index];
      if (optimisticClaimedTotal !== undefined) {
        return {
          ...ticket,
          claimedTotal: optimisticClaimedTotal
        };
      }
      return ticket;
    });
  }, [optimisticUpdates]);

  const renderPrizeButtons = (box: BoxItem) => {
    if (!box.winningTickets) return null;

    const allPrizeButtons: React.ReactElement[] = [];

    // Create tickets with their original indices for proper mapping
    const ticketsWithIndices = box.winningTickets.map((ticket, index) => ({
      ...ticket,
      originalIndex: index
    }));

    // Sort tickets by prize value from highest to lowest
    const sortedTickets = [...ticketsWithIndices].sort((a, b) => {
      const prizeA = Number(a.prize);
      const prizeB = Number(b.prize);
      return prizeB - prizeA; // Descending order (highest to lowest)
    });

    sortedTickets.forEach((ticket) => {
      const prize = ticket.prize.toString();
      const totalPrizes = ticket.totalPrizes;
      const originalTicketIndex = ticket.originalIndex;
      
      // Use optimistic update if available, otherwise use the actual value
      const claimedTotal = optimisticUpdates[box.id]?.[originalTicketIndex] ?? ticket.claimedTotal;

      for (let i = 0; i < totalPrizes; i++) {
        const isClaimed = i < claimedTotal;
        allPrizeButtons.push(
          <Button
            key={`${originalTicketIndex}-${i}`}
            variant={isClaimed ? "outlined" : "contained"}
            onClick={() => handlePrizeClick(box.id, originalTicketIndex, i)}
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
          
          // Calculate EV data using effective winning tickets (with optimistic updates)
          let evData: number | null = null;
          let rtpData: number | null = null;
          // let evBandData = null;
          if (estimatedTickets > 0) {
            const effectiveWinningTickets = getEffectiveWinningTickets(box);
            if (effectiveWinningTickets.length > 0) {
              const prizes: Prize[] = effectiveWinningTickets.map(ticket => ({
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
          }
          
          return (
            <Box key={box.id} sx={{ p: .5, mb: 3, position: 'relative'}}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  {/* Flare Sheet Display */}
                  {typeof box?.flareSheetUrl === "string" && box.flareSheetUrl.trim() !== "" && (
                    <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
                      <FlareSheetDisplay
                        imageUrl={box.flareSheetUrl}
                        boxName={box?.boxName || "Unknown Box"}
                        size="medium"
                      />
                    </Box>
                  )}
                  {/* EV badge */}
                  {typeof evData === 'number' && typeof rtpData === 'number' && (
                    <EvBadge evData={evData} rtpData={rtpData} />
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
                </Box>
              </Box>
                  
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
                      <strong>Winning Chance Per Ticket:</strong> {calculateChancePercentage(remainingTicketsInput, box.id, boxWithEffectiveTickets)}
                    </Typography> */}
                    <Typography sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                      <strong>Odds:</strong> {calculateOneInXChances(remainingTicketsInput, box.id, { ...box, winningTickets: getEffectiveWinningTickets(box) })}
                    </Typography>
                    <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      <strong>Total Remaining Prize Value:</strong> {formatCurrency(calculateTotalRemainingPrizeValue({ ...box, winningTickets: getEffectiveWinningTickets(box) }))}
                    </Typography>
                    {showOwner && (
                      <Typography>
                        <strong>Created By:</strong> {userDisplayNames[box.ownerId] || 'Loading...'}
                      </Typography>
                    )}
                    {/* <Typography sx={{ fontWeight: 'bold', color: getPayoutColor(remainingTicketsInput, box.id, boxWithEffectiveTickets) }}>
                      <strong>Percent to buyout:</strong> {calculatePayoutPercentage(remainingTicketsInput, box.id, boxWithEffectiveTickets)}
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
                        box={{ ...box, winningTickets: getEffectiveWinningTickets(box) }}
                        remainingTickets={Number(remainingTicketsInput[box.id])}
                        getEvColor={getEvColor}
                      />
                    </AccordionDetails>
                  </Accordion>
                )}
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
