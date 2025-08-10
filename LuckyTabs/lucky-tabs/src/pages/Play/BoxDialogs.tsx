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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 350 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
              Row 1
            </Typography>
            <Slider
              orientation="vertical"
              value={row1}
              onChange={(_, value) => setRow1(typeof value === 'number' ? value : value[0])}
              max={800}
              min={0}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: 200, label: '200' },
                { value: 400, label: '400' },
                { value: 600, label: '600' },
                { value: 800, label: '800' }
              ]}
              sx={{ 
                height: 280, 
                mb: 2,
                '& .MuiSlider-thumb': {
                  backgroundColor: '#e140a1',
                  border: '2px solid #fff',
                  '&:hover': {
                    backgroundColor: '#c73691',
                  },
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#e140a1',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#ddd',
                },
                '& .MuiSlider-mark': {
                  backgroundColor: '#e140a1',
                },
                '& .MuiSlider-markLabel': {
                  color: 'text.primary',
                  fontSize: '0.75rem',
                },
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {row1}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 350 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
              Row 2
            </Typography>
            <Slider
              orientation="vertical"
              value={row2}
              onChange={(_, value) => setRow2(typeof value === 'number' ? value : value[0])}
              max={800}
              min={0}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: 200, label: '200' },
                { value: 400, label: '400' },
                { value: 600, label: '600' },
                { value: 800, label: '800' }
              ]}
              sx={{ 
                height: 280, 
                mb: 2,
                '& .MuiSlider-thumb': {
                  backgroundColor: '#e140a1',
                  border: '2px solid #fff',
                  '&:hover': {
                    backgroundColor: '#c73691',
                  },
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#e140a1',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#ddd',
                },
                '& .MuiSlider-mark': {
                  backgroundColor: '#e140a1',
                },
                '& .MuiSlider-markLabel': {
                  color: 'text.primary',
                  fontSize: '0.75rem',
                },
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {row2}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 350 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
              Row 3
            </Typography>
            <Slider
              orientation="vertical"
              value={row3}
              onChange={(_, value) => setRow3(typeof value === 'number' ? value : value[0])}
              max={800}
              min={0}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: 200, label: '200' },
                { value: 400, label: '400' },
                { value: 600, label: '600' },
                { value: 800, label: '800' }
              ]}
              sx={{ 
                height: 280, 
                mb: 2,
                '& .MuiSlider-thumb': {
                  backgroundColor: '#e140a1',
                  border: '2px solid #fff',
                  '&:hover': {
                    backgroundColor: '#c73691',
                  },
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#e140a1',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#ddd',
                },
                '& .MuiSlider-mark': {
                  backgroundColor: '#e140a1',
                },
                '& .MuiSlider-markLabel': {
                  color: 'text.primary',
                  fontSize: '0.75rem',
                },
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {row3}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 350 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
              Row 4
            </Typography>
            <Slider
              orientation="vertical"
              value={row4}
              onChange={(_, value) => setRow4(typeof value === 'number' ? value : value[0])}
              max={800}
              min={0}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: 200, label: '200' },
                { value: 400, label: '400' },
                { value: 600, label: '600' },
                { value: 800, label: '800' }
              ]}
              sx={{ 
                height: 280, 
                mb: 2,
                '& .MuiSlider-thumb': {
                  backgroundColor: '#e140a1',
                  border: '2px solid #fff',
                  '&:hover': {
                    backgroundColor: '#c73691',
                  },
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#e140a1',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#ddd',
                },
                '& .MuiSlider-mark': {
                  backgroundColor: '#e140a1',
                },
                '& .MuiSlider-markLabel': {
                  color: 'text.primary',
                  fontSize: '0.75rem',
                },
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {row4}
            </Typography>
          </Box>
        </Box>

        {/* Mobile Layout - Compact Vertical Sliders */}
        <Box sx={{ py: 1, display: { xs: 'flex', md: 'none' }, justifyContent: 'space-around', alignItems: 'flex-end', minHeight: 280 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 250 }}>
            <Typography variant="caption" sx={{ mb: 1, fontSize: '0.7rem' }}>
              Row 1
            </Typography>
            <Slider
              orientation="vertical"
              value={row1}
              onChange={(_, value) => setRow1(typeof value === 'number' ? value : value[0])}
              max={800}
              min={0}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: 800, label: '800' }
              ]}
              sx={{ 
                height: 180, 
                mb: 1,
                '& .MuiSlider-thumb': {
                  backgroundColor: '#e140a1',
                  border: '2px solid #fff',
                  width: 16,
                  height: 16,
                  '&:hover': {
                    backgroundColor: '#c73691',
                  },
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
                },
                '& .MuiSlider-markLabel': {
                  color: 'text.primary',
                  fontSize: '0.6rem',
                },
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}>
              {row1}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 250 }}>
            <Typography variant="caption" sx={{ mb: 1, fontSize: '0.7rem' }}>
              Row 2
            </Typography>
            <Slider
              orientation="vertical"
              value={row2}
              onChange={(_, value) => setRow2(typeof value === 'number' ? value : value[0])}
              max={800}
              min={0}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: 800, label: '800' }
              ]}
              sx={{ 
                height: 180, 
                mb: 1,
                '& .MuiSlider-thumb': {
                  backgroundColor: '#e140a1',
                  border: '2px solid #fff',
                  width: 16,
                  height: 16,
                  '&:hover': {
                    backgroundColor: '#c73691',
                  },
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
                },
                '& .MuiSlider-markLabel': {
                  color: 'text.primary',
                  fontSize: '0.6rem',
                },
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}>
              {row2}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 250 }}>
            <Typography variant="caption" sx={{ mb: 1, fontSize: '0.7rem' }}>
              Row 3
            </Typography>
            <Slider
              orientation="vertical"
              value={row3}
              onChange={(_, value) => setRow3(typeof value === 'number' ? value : value[0])}
              max={800}
              min={0}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: 800, label: '800' }
              ]}
              sx={{ 
                height: 180, 
                mb: 1,
                '& .MuiSlider-thumb': {
                  backgroundColor: '#e140a1',
                  border: '2px solid #fff',
                  width: 16,
                  height: 16,
                  '&:hover': {
                    backgroundColor: '#c73691',
                  },
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
                },
                '& .MuiSlider-markLabel': {
                  color: 'text.primary',
                  fontSize: '0.6rem',
                },
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}>
              {row3}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 250 }}>
            <Typography variant="caption" sx={{ mb: 1, fontSize: '0.7rem' }}>
              Row 4
            </Typography>
            <Slider
              orientation="vertical"
              value={row4}
              onChange={(_, value) => setRow4(typeof value === 'number' ? value : value[0])}
              max={800}
              min={0}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: 800, label: '800' }
              ]}
              sx={{ 
                height: 180, 
                mb: 1,
                '& .MuiSlider-thumb': {
                  backgroundColor: '#e140a1',
                  border: '2px solid #fff',
                  width: 16,
                  height: 16,
                  '&:hover': {
                    backgroundColor: '#c73691',
                  },
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
                },
                '& .MuiSlider-markLabel': {
                  color: 'text.primary',
                  fontSize: '0.6rem',
                },
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}>
              {row4}
            </Typography>
          </Box>
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
