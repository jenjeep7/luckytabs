import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Stack,
  useTheme
} from '@mui/material';
import { Settings } from '@mui/icons-material';
import { MetricThresholds } from '../../hooks/useMetricThresholds';

interface MetricThresholdsSettingsProps {
  open: boolean;
  onClose: () => void;
  onSave: (thresholds: MetricThresholds) => Promise<void>;
  currentThresholds: MetricThresholds;
  saving: boolean;
}

export const MetricThresholdsSettings: React.FC<MetricThresholdsSettingsProps> = ({
  open,
  onClose,
  onSave,
  currentThresholds,
  saving
}) => {
  const theme = useTheme();
  const [thresholds, setThresholds] = useState<MetricThresholds>(currentThresholds);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setThresholds(currentThresholds);
  }, [currentThresholds, open]);

  const validateThresholds = (values: MetricThresholds): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (values.rtpGoodThreshold <= values.rtpDecentThreshold) {
      newErrors.rtpGoodThreshold = 'Good threshold must be higher than Decent threshold';
    }
    if (values.rtpGoodThreshold < 0 || values.rtpGoodThreshold > 100) {
      newErrors.rtpGoodThreshold = 'Must be between 0 and 100';
    }
    if (values.rtpDecentThreshold < 0 || values.rtpDecentThreshold > 100) {
      newErrors.rtpDecentThreshold = 'Must be between 0 and 100';
    }
    if (values.evPositiveThreshold < -10 || values.evPositiveThreshold > 10) {
      newErrors.evPositiveThreshold = 'Should be between -10 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleThresholdChange = (field: keyof MetricThresholds, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newThresholds = { ...thresholds, [field]: numValue };
    setThresholds(newThresholds);
    validateThresholds(newThresholds);
  };

  const handleSave = async () => {
    if (validateThresholds(thresholds)) {
      try {
        await onSave(thresholds);
        onClose();
      } catch (error) {
        console.error('Failed to save metric thresholds:', error);
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      slotProps={{
        paper: { sx: { minHeight: '60vh' } }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings />
        Box Performance Metrics Settings
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Customize the thresholds that determine when boxes are labeled as &ldquo;Good&rdquo;, &ldquo;Decent&rdquo;, or &ldquo;Poor&rdquo;. 
          These settings will apply throughout the app.
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Return to Player (RTP) Thresholds
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            RTP shows what percentage of money spent on tickets is expected to be returned as winnings.
          </Typography>
          
          <Stack spacing={2}>
            <TextField
              label="Good Threshold (%)"
              type="number"
              value={thresholds.rtpGoodThreshold}
              onChange={(e) => handleThresholdChange('rtpGoodThreshold', e.target.value)}
              error={!!errors.rtpGoodThreshold}
              helperText={errors.rtpGoodThreshold || 'Boxes with RTP above this will be marked as "Good"'}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:not(.Mui-error)': {
                    '& fieldset': {
                      borderColor: theme.neon.colors.green, // Neon green for Good
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: theme.neon.colors.green,
                      borderWidth: '2px',
                      ...theme.neon.effects.boxGlow(theme.neon.colors.green, 0.2),
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.neon.colors.green,
                      borderWidth: '2px',
                      ...theme.neon.effects.boxGlow(theme.neon.colors.green, 0.4),
                    },
                  },
                },
                '& .MuiInputLabel-root': {
                  '&:not(.Mui-error)': {
                    color: theme.neon.colors.green,
                    fontWeight: 600,
                    ...theme.neon.effects.textGlow(theme.neon.colors.green, 0.3),
                  },
                },
              }}
            />
            
            <TextField
              label="Decent Threshold (%)"
              type="number"
              value={thresholds.rtpDecentThreshold}
              onChange={(e) => handleThresholdChange('rtpDecentThreshold', e.target.value)}
              error={!!errors.rtpDecentThreshold}
              helperText={errors.rtpDecentThreshold || 'Boxes with RTP above this (but below Good) will be marked as "Decent"'}
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:not(.Mui-error)': {
                    '& fieldset': {
                      borderColor: theme.neon.colors.amber, // Neon amber for Decent
                      borderWidth: '2px',
                    },
                    '&:hover fieldset': {
                      borderColor: theme.neon.colors.amber,
                      borderWidth: '2px',
                      ...theme.neon.effects.boxGlow(theme.neon.colors.amber, 0.2),
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.neon.colors.amber,
                      borderWidth: '2px',
                      ...theme.neon.effects.boxGlow(theme.neon.colors.amber, 0.4),
                    },
                  },
                },
                '& .MuiInputLabel-root': {
                  '&:not(.Mui-error)': {
                    color: theme.neon.colors.amber,
                    fontWeight: 600,
                    ...theme.neon.effects.textGlow(theme.neon.colors.amber, 0.3),
                  },
                },
              }}
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={() => void handleSave()}
          disabled={saving || Object.keys(errors).length > 0}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};