/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  IconButton,
  TextField,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

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
  type: "wall" | "bar box";
  locationId: string;
  ownerId: string;
  isActive?: boolean;
  winningTickets?: WinningTicket[];
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

    void fetchUserDisplayNames();
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

  const calculateRemainingPrizes = (box: BoxItem): number => {
    if (!box.winningTickets || !Array.isArray(box.winningTickets)) {
      return 0;
    }

    return box.winningTickets.reduce((total: number, ticket: WinningTicket) => {
      const totalPrizes = Number(ticket.totalPrizes) || 0;
      const claimedTotal = Number(ticket.claimedTotal) || 0;
      const prize = Number(ticket.prize) || 0;
      const remaining = totalPrizes - claimedTotal;
      return total + (remaining * prize);
    }, 0);
  };

  const calculateRemainingWinningTickets = (box: BoxItem): number => {
    if (!box.winningTickets || !Array.isArray(box.winningTickets)) {
      return 0;
    }

    return box.winningTickets.reduce((total: number, ticket: WinningTicket) => {
      const totalPrizes = Number(ticket.totalPrizes) || 0;
      const claimedTotal = Number(ticket.claimedTotal) || 0;
      return total + (totalPrizes - claimedTotal);
    }, 0);
  };

  const calculateTotalRemainingPrizeValue = (box: BoxItem): number => {
    if (!box.winningTickets || !Array.isArray(box.winningTickets)) {
      return 0;
    }

    return box.winningTickets.reduce((total: number, ticket: WinningTicket) => {
      const totalPrizes = Number(ticket.totalPrizes) || 0;
      const claimedTotal = Number(ticket.claimedTotal) || 0;
      const prizeValue = Number(ticket.prize) || 0;
      const remainingTickets = totalPrizes - claimedTotal;
      return total + (remainingTickets * prizeValue);
    }, 0);
  };

  const calculatePayoutPercentage = (boxId: string, box: BoxItem): string => {
    const inputValue = remainingTicketsInput[boxId];
    const remainingTickets = Number(inputValue);
    const pricePerTicket = Number(box.pricePerTicket) || 0;
    
    if (!inputValue || remainingTickets <= 0 || pricePerTicket <= 0) {
      return '0.00%';
    }

    // Total value of remaining winners (remaining prize value)
    const totalRemainingPrizeValue = calculateTotalRemainingPrizeValue(box);
    
    // Total value of remaining tickets (remaining tickets × price per ticket)
    const totalValueOfRemainingTickets = remainingTickets * pricePerTicket;
    
    if (totalValueOfRemainingTickets === 0) {
      return '0.00%';
    }

    const payoutPercentage = (totalRemainingPrizeValue / totalValueOfRemainingTickets) * 100;
    
    return `${payoutPercentage.toFixed(2)}%`;
  };

  const getPayoutColor = (boxId: string, box: BoxItem): string => {
    const inputValue = remainingTicketsInput[boxId];
    const remainingTickets = Number(inputValue);
    const pricePerTicket = Number(box.pricePerTicket) || 0;
    
    if (!inputValue || remainingTickets <= 0 || pricePerTicket <= 0) {
      return 'text.primary';
    }

    const totalRemainingPrizeValue = calculateTotalRemainingPrizeValue(box);
    const totalValueOfRemainingTickets = remainingTickets * pricePerTicket;
    
    if (totalValueOfRemainingTickets === 0) {
      return 'text.primary';
    }

    const payoutPercentage = (totalRemainingPrizeValue / totalValueOfRemainingTickets) * 100;
    
    return payoutPercentage >= 100 ? 'success.main' : 'error.main';
  };

  const calculateChancePercentage = (boxId: string, box: BoxItem): string => {
    const inputValue = remainingTicketsInput[boxId];
    const remainingTickets = Number(inputValue);
    
    if (!inputValue || remainingTickets <= 0) {
      return '0.00%';
    }

    const remainingWinningTickets = calculateRemainingWinningTickets(box);
    const chancePercentage = (remainingWinningTickets / remainingTickets) * 100;
    
    return `${chancePercentage.toFixed(2)}%`;
  };

  const calculateOneInXChances = (boxId: string, box: BoxItem): string => {
    const inputValue = remainingTicketsInput[boxId];
    const remainingTickets = Number(inputValue);
    
    if (!inputValue || remainingTickets <= 0) {
      return '1 in ∞';
    }

    const remainingWinningTickets = calculateRemainingWinningTickets(box);
    
    if (remainingWinningTickets === 0) {
      return '1 in ∞';
    }

    const oneInX = remainingTickets / remainingWinningTickets;
    
    return `1 in ${oneInX.toFixed(1)}`;
  };

  const handleRemainingTicketsChange = (boxId: string, value: string) => {
    // Only allow positive numbers
    if (value === '' || (/^\d+$/.test(value) && Number(value) >= 0)) {
      setRemainingTicketsInput(prev => ({
        ...prev,
        [boxId]: value
      }));
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
                    <TextField
                      label="Estimated Remaining Tickets"
                      type="number"
                      size="small"
                      value={remainingTicketsInput[box.id] || ''}
                      onChange={(e) => handleRemainingTicketsChange(box.id, e.target.value)}
                      sx={{ maxWidth: 200 }}
                    />
                    {remainingTicketsInput[box.id] && (
                      <>
                        <Typography sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                          <strong>Winning Chance Per Ticket:</strong> {calculateChancePercentage(box.id, box)}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                          <strong>Odds:</strong> {calculateOneInXChances(box.id, box)} chance
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          <strong>Total Remaining Prize Value:</strong> ${calculateTotalRemainingPrizeValue(box)}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold', color: getPayoutColor(box.id, box) }}>
                          <strong>Percent to buyout:</strong> {calculatePayoutPercentage(box.id, box)}
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

      {/* Remove Box Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCancelRemove}>
        <DialogTitle>Confirm Box Removal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove the box &quot;{confirmDialog.boxName}&quot;? This action will deactivate the box.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemove}>Cancel</Button>
          <Button onClick={handleConfirmRemove} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Claim Prize Confirmation Dialog */}
      <Dialog open={claimDialog.open} onClose={handleCancelClaim}>
        <DialogTitle>Claim Prize</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to claim this ${claimDialog.prize} prize from &quot;{claimDialog.boxName}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClaim}>Cancel</Button>
          <Button onClick={handleConfirmClaim} color="primary">
            Claim Prize
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
