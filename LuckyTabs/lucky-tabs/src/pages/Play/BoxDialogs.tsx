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
} from '@mui/material';

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
}

const RowSlider: React.FC<RowSliderProps> = ({ label, value, onChange, isMobile }) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync local state with prop value
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    const val = Array.isArray(newValue) ? newValue[0] : newValue;
    setLocalValue(val);
  };

  const handleSliderChangeCommitted = (_: Event | React.SyntheticEvent, newValue: number | number[]) => {
    const val = Array.isArray(newValue) ? newValue[0] : newValue;
    onChange(val);
  };

  const sliderStyles = {
    height: 280,
    mb: 2,
    '& .MuiSlider-thumb': {
      backgroundColor: '#e140a1',
      border: isMobile ? '3px solid #fff' : '2px solid #fff',
      width: isMobile ? 28 : 20,
      height: isMobile ? 28 : 20,
      ...(isMobile && {
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        '&:hover': {
          backgroundColor: '#c73691',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        },
        '&:active': {
          backgroundColor: '#c73691',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        },
        '&::before': {
          boxShadow: 'none',
        },
        // Improve touch target
        '&:after': {
          content: '""',
          position: 'absolute',
          top: '-10px',
          left: '-10px',
          right: '-10px',
          bottom: '-10px',
          borderRadius: '50%',
        }
      }),
      ...(!isMobile && {
        '&:hover': {
          backgroundColor: '#c73691',
        },
      }),
    },
    '& .MuiSlider-track': {
      backgroundColor: '#e140a1',
      width: isMobile ? 8 : 4,
    },
    '& .MuiSlider-rail': {
      backgroundColor: '#ddd',
      width: isMobile ? 8 : 4,
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
    // Prevent text selection during drag on mobile
    ...(isMobile && {
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      WebkitTouchCallout: 'none',
    }),
  };

  const marks = [
    { value: 0, label: '0' },
    { value: 200, label: '200' },
    { value: 400, label: '400' },
    { value: 600, label: '600' },
    { value: 800, label: '800' }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 350 }}>
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
      <Typography 
        variant={isMobile ? "caption" : "body2"} 
        sx={{ 
          fontWeight: 'bold',
          fontSize: isMobile ? '1.1rem' : undefined,
          mb: 2,
          color: 'text.primary',
          backgroundColor: 'background.paper',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          ...(isMobile && { userSelect: 'none' })
        }}
      >
        {localValue}
      </Typography>
      <Slider
        orientation="vertical"
        value={localValue}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderChangeCommitted}
        max={800}
        min={0}
        step={isMobile ? 5 : 1}
        marks={marks}
        sx={sliderStyles}
        // Add mobile-specific props
        {...(isMobile && {
          disableSwap: true,
          size: 'medium',
        })}
      />
    </Box>
  );
};

interface EstimateRemainingDialogProps {
  open: boolean;
  boxName: string;
  currentValue: number;
  currentRowEstimates?: {
    row1: number;
    row2: number;
    row3: number;
    row4: number;
  };
  onUpdate: (totalTickets: number, rowEstimates: { row1: number; row2: number; row3: number; row4: number }) => void;
  onCancel: () => void;
}

export const EstimateRemainingDialog: React.FC<EstimateRemainingDialogProps> = ({
  open,
  boxName,
  currentValue,
  currentRowEstimates,
  onUpdate,
  onCancel,
}) => {
  const [row1, setRow1] = useState(0);
  const [row2, setRow2] = useState(0);
  const [row3, setRow3] = useState(0);
  const [row4, setRow4] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  return (
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
          <RowSlider label="Row 1" value={row1} onChange={setRow1} isMobile={false} />
          <RowSlider label="Row 2" value={row2} onChange={setRow2} isMobile={false} />
          <RowSlider label="Row 3" value={row3} onChange={setRow3} isMobile={false} />
          <RowSlider label="Row 4" value={row4} onChange={setRow4} isMobile={false} />
        </Box>

        {/* Mobile Layout - Taller, Touch-Friendly Vertical Sliders */}
        <Box sx={{ py: 2, display: { xs: 'flex', md: 'none' }, justifyContent: 'space-around', alignItems: 'flex-end', minHeight: 400 }}>
          <RowSlider label="Row 1" value={row1} onChange={setRow1} isMobile={true} />
          <RowSlider label="Row 2" value={row2} onChange={setRow2} isMobile={true} />
          <RowSlider label="Row 3" value={row3} onChange={setRow3} isMobile={true} />
          <RowSlider label="Row 4" value={row4} onChange={setRow4} isMobile={true} />
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="h6" color="primary">
            Total Estimated Tickets: {totalTickets}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button onClick={handleUpdate} color="primary" variant="contained">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};
