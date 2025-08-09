/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  IconButton,
  TextField,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ConfirmRemoveDialog, ClaimPrizeDialog, EstimateRemainingDialog } from './BoxDialogs';
import {
  calculateRemainingPrizes,
  calculateRemainingWinningTickets,
  calculateTotalRemainingPrizeValue,
  calculatePayoutPercentage,
  getPayoutColor,
  calculateChancePercentage,
  calculateOneInXChances
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
  [key: string]: any;
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
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; boxId: string; boxName: string }>({
    open: false,
    boxId: '',
    boxName: ''
  });

  const [claimDialog, setClaimDialog] = useState<{ 
    open: boolean; 
    boxId: string; 
    ticketIndex: number; 
    prize: string;
    boxName: string;
  }>({
    open: false,
    boxId: '',
    ticketIndex: -1,
    prize: '',
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

  const handlePrizeClick = (boxId: string, ticketIndex: number, prize: string, boxName: string) => {
    setClaimDialog({
      open: true,
      boxId,
      ticketIndex,
      prize,
      boxName
    });
  };

  const handleConfirmClaim = () => {
    const claimPrize = async () => {
      try {
        const boxRef = doc(db, 'boxes', claimDialog.boxId);
        const box = boxes.find(b => b.id === claimDialog.boxId);
        
        if (box && box.winningTickets) {
          const updatedTickets = [...box.winningTickets];
          updatedTickets[claimDialog.ticketIndex] = {
            ...updatedTickets[claimDialog.ticketIndex],
            claimedTotal: updatedTickets[claimDialog.ticketIndex].claimedTotal + 1
          };

          await updateDoc(boxRef, {
            winningTickets: updatedTickets
          });
          
          setClaimDialog({ open: false, boxId: '', ticketIndex: -1, prize: '', boxName: '' });
          
          if (onBoxRemoved) {
            onBoxRemoved();
          }
        }
      } catch (error) {
        console.error('Error claiming prize:', error);
      }
    };
    
    void claimPrize();
  };

  const handleCancelClaim = () => {
    setClaimDialog({ open: false, boxId: '', ticketIndex: -1, prize: '', boxName: '' });
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

  const handleRemainingTicketsChange = (boxId: string, value: string) => {
    // Only allow positive numbers
    if (value === '' || (/^\d+$/.test(value) && Number(value) >= 0)) {
      setRemainingTicketsInput(prev => ({
        ...prev,
        [boxId]: value
      }));

      // Save to database with debounce (wait for user to stop typing)
      const updateDB = async () => {
        try {
          const boxRef = doc(db, 'boxes', boxId);
          await updateDoc(boxRef, {
            estimatedRemainingTickets: value === '' ? null : Number(value)
          });
        } catch (error) {
          console.error('Error updating estimated remaining tickets:', error);
        }
      };

      // Clear existing timeout and set new one
      if (value !== '') {
        setTimeout(() => {
          void updateDB();
        }, 1000); // Wait 1 second after user stops typing
      }
    }
  };

  const renderPrizeButtons = (box: BoxItem) => {
    if (!box.winningTickets) return null;

    const allPrizeButtons: React.ReactElement[] = [];

    box.winningTickets.forEach((ticket, ticketIndex) => {
      const prize = ticket.prize.toString();
      const totalPrizes = ticket.totalPrizes;
      const claimedTotal = ticket.claimedTotal;

      for (let i = 0; i < totalPrizes; i++) {
        const isDisabled = i < claimedTotal;
        allPrizeButtons.push(
          <Button
            key={`${ticketIndex}-${i}`}
            variant="contained"
            disabled={isDisabled}
            onClick={() => !isDisabled && handlePrizeClick(box.id, ticketIndex, prize, box.boxName)}
            sx={{
              minWidth: 60,
              minHeight: 40,
              m: 0.5,
              backgroundColor: isDisabled ? 'grey.300' : 'primary.main',
              color: isDisabled ? 'grey.500' : 'white',
              '&:hover': {
                backgroundColor: isDisabled ? 'grey.300' : 'primary.dark'
              },
              opacity: isDisabled ? 0.5 : 1
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

  console.log("boxes", boxes);
  return (
    <>
      <Box sx={{ mt: marginTop }}>
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
        {boxes.map((box) => {
          const remainingPrizes = calculateRemainingPrizes(box);
          
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
                        onChange={(e) => handleRemainingTicketsChange(box.id, e.target.value)}
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
                        <Typography sx={{ fontWeight: 'bold', color: getPayoutColor(remainingTicketsInput, box.id, box) }}>
                          <strong>Percent to buyout:</strong> {calculatePayoutPercentage(remainingTicketsInput, box.id, box)}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
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

      <ClaimPrizeDialog
        open={claimDialog.open}
        prize={claimDialog.prize}
        boxName={claimDialog.boxName}
        onConfirm={handleConfirmClaim}
        onCancel={handleCancelClaim}
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
