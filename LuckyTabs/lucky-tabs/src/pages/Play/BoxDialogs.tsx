import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
} from '@mui/material';
import { ClaimedPrize } from '../../services/boxService';

interface ConfirmRemoveDialogProps {
  open: boolean;
  boxName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmRemoveDialog: React.FC<ConfirmRemoveDialogProps> = ({
  open,
  boxName,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Confirm Box Removal</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to remove the box &quot;{boxName}&quot;? This action will deactivate the box.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} variant="outlined" color="secondary">Cancel</Button>
        <Button onClick={onConfirm} color="error">
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface ClaimPrizeDialogProps {
  open: boolean;
  prize: string;
  boxName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ClaimPrizeDialog: React.FC<ClaimPrizeDialogProps> = ({
  open,
  prize,
  boxName,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Claim Prize</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Do you want to claim this ${prize} prize from &quot;{boxName}&quot;?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} variant="outlined" color="secondary">Cancel</Button>
        <Button onClick={onConfirm} color="primary">
          Claim Prize
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Reusable Row Slider Component
interface RowSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  isMobile: boolean;
  claimedPrizes?: ClaimedPrize[]; // Claimed prizes for this specific row
}

const RowSlider: React.FC<RowSliderProps> = ({ label, value, onChange, isMobile, claimedPrizes = [] }) => {
  const handleSliderChange = React.useCallback((_: Event, newValue: number | number[]) => {
    const val = Array.isArray(newValue) ? newValue[0] : newValue;
    onChange(val);
  }, [onChange]);

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      onChange(0);
      return;
    }
    const num = Math.max(0, Math.min(800, Number(val)));
    onChange(num);
  }, [onChange]);

  // Standard marks for ticket counts
  const marks = [
    { value: 0, label: '0' },
    { value: 200, label: '200' },
    { value: 400, label: '400' },
    { value: 600, label: '600' },
    { value: 800, label: '800' }
  ];

  // Calculate prize markers based on FIXED positions (not current slider value)
  const prizeMarkers = claimedPrizes.map((prize, index) => {
    // Calculate the fixed ticket position based on percentage of full row (800 tickets)
    const ticketPosition = Math.round((prize.positionInRow / 100) * 800);
    // Don't clamp to current value - keep the original position even if slider is below it
    
    return {
      value: ticketPosition, // Fixed position based on 800-ticket scale
      label: `$${prize.prizeAmount}`,
      isPrize: true,
      prizeAmount: prize.prizeAmount,
      index
    };
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 350, position: 'relative' }}>
      <Typography 
        variant={isMobile ? "caption" : "subtitle2"} 
        sx={{ 
          mb: 1, 
          fontSize: isMobile ? '1rem' : undefined,
          fontWeight: 'bold',
          ...(isMobile ? { userSelect: 'none' } : { gutterBottom: true })
        }}
      >
        {label}
      </Typography>
      <input
        type="number"
        min={0}
        max={800}
        value={value}
        onChange={handleInputChange}
        style={{
          fontWeight: 'bold',
          fontSize: isMobile ? '1.1rem' : undefined,
          marginBottom: 36, 
          textAlign: 'center',
          width: 72,
          borderRadius: 4,
        }}
      />
      
      {/* Container for slider and prize markers */}
      <Box sx={{ 
        position: 'relative', 
        height: isMobile ? 330 : 330, 
        overflow: 'visible', 
        width: 'fit-content',
        touchAction: 'none',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}>
        <Slider
          orientation="vertical"
          value={value}
          onChange={handleSliderChange}
          onChangeCommitted={(_event: React.SyntheticEvent | Event, newValue: number | number[]) => handleSliderChange(_event as Event, newValue)}
          max={800}
          min={0}
          step={isMobile ? 2 : 1}
          marks={marks}
          sx={{
            height: isMobile ? 330 : 330,
            mb: 2,
            touchAction: 'none',
            '& .MuiSlider-thumb': {
              backgroundColor: '#e140a1',
              border: '2px solid #fff',
              width: 20,
              height: 20,
              WebkitTapHighlightColor: 'transparent',
            },
            '& .MuiSlider-track': {
              backgroundColor: '#e140a1',
              width: 4,
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#ddd',
              width: 4,
            },
            '& .MuiSlider-mark': {
              backgroundColor: '#e140a1',
              ...(isMobile && { width: 4, height: 4 }),
            },
            '& .MuiSlider-markLabel': {
              color: 'text.primary',
              fontSize: isMobile ? '0.65rem' : '0.75rem',
              ...(isMobile && { transform: 'translateX(-50%)' }),
            },
          }}
          {...(isMobile && {
            disableSwap: true,
            size: 'medium',
          })}
        />
        
        {/* Prize markers overlay */}
        {prizeMarkers.map((marker, index) => {
          // Calculate position from bottom (since slider is vertical and starts from bottom)
          const percentageFromBottom = (marker.value / 800) * 100;
          const positionFromBottom = `${percentageFromBottom}%`;
          
          return (
            <Box
              key={`prize-${index}`}
              sx={{
                position: 'absolute',
                left: '50%',
                bottom: positionFromBottom,
                transform: 'translate(-50%, 50%)',
                zIndex: 5,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: 'auto',
                minWidth: 0,
              }}
            >
              {/* Prize marker dot */}
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#ff6b35',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  flexShrink: 0,
                }}
              />
              {/* Prize label */}
              <Typography
                variant="caption"
                sx={{
                  marginLeft: '8px',
                  backgroundColor: '#ff6b35',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  lineHeight: 1,
                }}
              >
                ${marker.prizeAmount}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// Add Wins Dialog for tracking claimed prizes on wall boxes
interface AddWinsDialogProps {
  open: boolean;
  boxName: string;
  availablePrizes: number[]; // Array of available prize amounts
  onAddWin: (claimedPrize: ClaimedPrize) => void;
  onCancel: () => void;
}

export const AddWinsDialog: React.FC<AddWinsDialogProps> = ({
  open,
  boxName,
  availablePrizes,
  onAddWin,
  onCancel,
}) => {
  const [selectedRow, setSelectedRow] = useState<number>(1);
  const [positionInRow, setPositionInRow] = useState<number>(400); // Now represents ticket position (0-800)
  const [selectedPrize, setSelectedPrize] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleRowChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRow: number,
  ) => {
    if (newRow !== null) {
      setSelectedRow(newRow);
    }
  };

  const handlePositionSliderChange = React.useCallback((_: Event, value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value;
    setPositionInRow(numValue);
  }, []);

  const handlePositionInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '') {
      setPositionInRow(0);
      return;
    }
    const numValue = Math.max(0, Math.min(800, Number(value)));
    if (!isNaN(numValue)) {
      setPositionInRow(numValue);
    }
  }, []);

  const handleSubmit = () => {
    if (selectedPrize === 0) {
      setError('Please select a prize amount');
      return;
    }

    // Convert ticket position to percentage for storage
    const positionPercentage = (positionInRow / 800) * 100;

    const claimedPrize: ClaimedPrize = {
      prizeAmount: selectedPrize,
      row: selectedRow,
      positionInRow: positionPercentage, // Store as percentage for consistency
      claimedAt: new Date()
    };

    onAddWin(claimedPrize);
    setSuccessMessage(`Win added: $${selectedPrize} at Row ${selectedRow}, Ticket #${positionInRow}`);
        setSelectedPrize(0);
    setError('');
    
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCancel = () => {
    setSelectedRow(1);
    setPositionInRow(400);
    setSelectedPrize(0);
    setError('');
    setSuccessMessage('');
    onCancel();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Add Win - {boxName}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 3 }}>
          Record a win by selecting the row, position, and prize amount.
        </DialogContentText>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Row Selection with Toggle Buttons */}
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
            Select Row
          </Typography>
          <ToggleButtonGroup
            value={selectedRow}
            exclusive
            onChange={handleRowChange}
            aria-label="row selection"
            fullWidth
            sx={{ 
              '& .MuiToggleButton-root': {
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'medium',
              }
            }}
          >
            <ToggleButton value={1} aria-label="row 1">
              Row 1
            </ToggleButton>
            <ToggleButton value={2} aria-label="row 2">
              Row 2
            </ToggleButton>
            <ToggleButton value={3} aria-label="row 3">
              Row 3
            </ToggleButton>
            <ToggleButton value={4} aria-label="row 4">
              Row 4
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Position in Row with Input and Slider */}
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
            Position in Row {selectedRow}
          </Typography>
          
          {/* Input Field */}
          <TextField
            label="Ticket Number"
            type="number"
            value={positionInRow}
            onChange={handlePositionInputChange}
            slotProps={{
              htmlInput: {
                min: 0,
                max: 800,
                step: 1,
              }
            }}
            sx={{ mb: 2, width: '150px' }}
            size="small"
          />
          
          {/* Slider Container with iOS touch fix */}
          <Box
            sx={{
              touchAction: 'none',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            <Slider
              value={positionInRow}
              onChange={handlePositionSliderChange}
              min={0}
              max={800}
              step={5}
              marks={[
                { value: 0, label: '0' },
                { value: 100, label: '100' },
                { value: 200, label: '200' },
                { value: 300, label: '300' },
                { value: 400, label: '400' },
                { value: 500, label: '500' },
                { value: 600, label: '600' },
                { value: 700, label: '700' },
                { value: 800, label: '800' }
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `#${value}`}
              sx={{
                touchAction: 'none',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#e140a1',
                  border: '2px solid #fff',
                  WebkitTapHighlightColor: 'transparent',
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#e140a1',
                },
                '& .MuiSlider-mark': {
                  backgroundColor: '#e140a1',
                },
              }}
            />
          </Box>
        </Box>

        {/* Prize Amount Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Prize Amount</InputLabel>
          <Select
            value={selectedPrize}
            label="Prize Amount"
            onChange={(e) => setSelectedPrize(Number(e.target.value))}
          >
            <MenuItem value={0}>Select Prize Amount</MenuItem>
            {availablePrizes.map((prize) => (
              <MenuItem key={prize} value={prize}>
                ${prize}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} variant="outlined" color="secondary">
          Done
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Add This Win
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface EstimateRemainingDialogProps {
  open: boolean;
  boxName: string;
  currentValue: number;
  boxType?: 'wall' | 'bar'; // Add box type to determine if Add Wins button should show
  availablePrizes?: number[]; // Available prize amounts for wall boxes
  claimedPrizes?: ClaimedPrize[]; // All claimed prizes for this box
  currentRowEstimates?: {
    row1: number;
    row2: number;
    row3: number;
    row4: number;
  };
  onUpdate: (totalTickets: number, rowEstimates: { row1: number; row2: number; row3: number; row4: number }) => void;
  onAddWin?: (claimedPrize: ClaimedPrize) => void; // Callback for adding wins
  onCancel: () => void;
}

export const EstimateRemainingDialog: React.FC<EstimateRemainingDialogProps> = ({
  open,
  boxName,
  currentValue,
  boxType,
  availablePrizes = [],
  claimedPrizes = [],
  currentRowEstimates,
  onUpdate,
  onAddWin,
  onCancel,
}) => {
  const [row1, setRow1] = useState(0);
  const [row2, setRow2] = useState(0);
  const [row3, setRow3] = useState(0);
  const [row4, setRow4] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [addWinsDialogOpen, setAddWinsDialogOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Filter claimed prizes by row
  const getClaimedPrizesForRow = (rowNumber: number) => {
    return claimedPrizes.filter(prize => prize.row === rowNumber);
  };

  // Initialize sliders with saved row estimates or distributed current value when dialog opens
  React.useEffect(() => {
    if (open && !initialized) {
      if (currentRowEstimates) {
        // Use saved row estimates if available
        setRow1(currentRowEstimates.row1);
        setRow2(currentRowEstimates.row2);
        setRow3(currentRowEstimates.row3);
        setRow4(currentRowEstimates.row4);
      } else if (currentValue > 0) {
        // Distribute current total value evenly across rows
        const perRow = Math.floor(currentValue / 4);
        const remainder = currentValue % 4;
        setRow1(perRow + (remainder > 0 ? 1 : 0));
        setRow2(perRow + (remainder > 1 ? 1 : 0));
        setRow3(perRow + (remainder > 2 ? 1 : 0));
        setRow4(perRow);
      } else {
        // No saved data or current value, start fresh
        setRow1(0);
        setRow2(0);
        setRow3(0);
        setRow4(0);
      }
      setInitialized(true);
    }
  }, [open, currentValue, currentRowEstimates, initialized]);

  // Reset initialization when dialog closes
  React.useEffect(() => {
    if (!open) {
      setInitialized(false);
    }
  }, [open]);

  const totalTickets = row1 + row2 + row3 + row4;

  const handleUpdate = () => {
    const rowEstimates = { row1, row2, row3, row4 };
    onUpdate(totalTickets, rowEstimates);
  };

  const handleCancel = () => {
    setInitialized(false);
    onCancel();
  };

  const handleAddWinClick = () => {
    setAddWinsDialogOpen(true);
  };

  const handleAddWin = (claimedPrize: ClaimedPrize) => {
    if (onAddWin) {
      onAddWin(claimedPrize);
    }
    setAddWinsDialogOpen(false);
  };

  const handleAddWinCancel = () => {
    setAddWinsDialogOpen(false);
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onCancel} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 0, md: 'auto' },
            height: { xs: '100%', md: 'auto' },
            maxHeight: { xs: '100%', md: '90vh' }
          }
        }}
      >
      <DialogTitle>Estimate Remaining Tickets - {boxName}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 3 }}>
          Use the sliders below to estimate the remaining tickets in each row of the wall box.
        </DialogContentText>
        
        {/* Desktop Layout - Horizontal */}
        <Box 
          sx={{ 
            py: 2, 
            display: { xs: 'none', md: 'flex' }, 
            justifyContent: 'space-around', 
            alignItems: 'flex-end', 
            minHeight: 400 
          }}
        >
          <RowSlider label="Row 1" value={row1} onChange={setRow1} isMobile={false} claimedPrizes={getClaimedPrizesForRow(1)} />
          <RowSlider label="Row 2" value={row2} onChange={setRow2} isMobile={false} claimedPrizes={getClaimedPrizesForRow(2)} />
          <RowSlider label="Row 3" value={row3} onChange={setRow3} isMobile={false} claimedPrizes={getClaimedPrizesForRow(3)} />
          <RowSlider label="Row 4" value={row4} onChange={setRow4} isMobile={false} claimedPrizes={getClaimedPrizesForRow(4)} />
        </Box>

        {/* Mobile Layout - Taller, Touch-Friendly Vertical Sliders */}
        <Box sx={{ py: 2, display: { xs: 'flex', md: 'none' }, justifyContent: 'space-around', alignItems: 'flex-end', minHeight: 400 }}>
          <RowSlider label="Row 1" value={row1} onChange={setRow1} isMobile={true} claimedPrizes={getClaimedPrizesForRow(1)} />
          <RowSlider label="Row 2" value={row2} onChange={setRow2} isMobile={true} claimedPrizes={getClaimedPrizesForRow(2)} />
          <RowSlider label="Row 3" value={row3} onChange={setRow3} isMobile={true} claimedPrizes={getClaimedPrizesForRow(3)} />
          <RowSlider label="Row 4" value={row4} onChange={setRow4} isMobile={true} claimedPrizes={getClaimedPrizesForRow(4)} />
        </Box>

        {/* Total Tickets Display - Full Width Below Sliders with clear separation */}
        <Box sx={{ mt: 10, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" color="text.primary" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            Total Estimated Tickets: {totalTickets}
          </Typography>
        </Box>
      
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} variant="outlined" color="secondary">
          Cancel
        </Button>
        {boxType === 'wall' && onAddWin && (
          <Button 
            onClick={handleAddWinClick} 
            variant="outlined" 
            color="info"
            sx={{ mr: 1 }}
          >
            Add Wins
          </Button>
        )}
        <Button onClick={handleUpdate} color="primary" variant="contained">
          Update
        </Button>
      </DialogActions>
    </Dialog>

    {/* Add Wins Dialog */}
    <AddWinsDialog
      open={addWinsDialogOpen}
      boxName={boxName}
      availablePrizes={availablePrizes}
      onAddWin={handleAddWin}
      onCancel={handleAddWinCancel}
    />
  </>
  );
};
