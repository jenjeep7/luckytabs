import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Feedback, Send } from '@mui/icons-material';
import { useAuthStateCompat } from '../services/useAuthStateCompat';
import { feedbackService } from '../services/feedbackService';

interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ open, onClose }) => {
  const [user] = useAuthStateCompat();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [feedbackText, setFeedbackText] = useState('');
  const [category, setCategory] = useState<'bug' | 'feature' | 'improvement' | 'general'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to submit feedback');
      return;
    }

    if (!feedbackText.trim()) {
      setError('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await feedbackService.submitFeedback(
        user.uid,
        user.email || '',
        user.displayName || 'Anonymous User',
        feedbackText.trim(),
        category
      );

      setSuccess(true);
      setFeedbackText('');
      setCategory('general');
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFeedbackText('');
      setCategory('general');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'bug': return 'Bug Report';
      case 'feature': return 'Feature Request';
      case 'improvement': return 'Improvement Suggestion';
      case 'general': return 'General Feedback';
      default: return 'General Feedback';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Feedback color="primary" />
        Share Your Feedback
      </DialogTitle>
      
      <DialogContent>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              Thank you for your feedback!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We appreciate you helping us improve Tabsy.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" paragraph>
              Help us make Tabsy better! Your feedback is valuable to us and helps shape the future of the app.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!user && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Please log in to submit feedback.
              </Alert>
            )}

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Feedback Category</InputLabel>
              <Select
                value={category}
                label="Feedback Category"
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting || !user}
              >
                <MenuItem value="general">General Feedback</MenuItem>
                <MenuItem value="bug">Bug Report</MenuItem>
                <MenuItem value="feature">Feature Request</MenuItem>
                <MenuItem value="improvement">Improvement Suggestion</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Your Feedback"
              placeholder={`Tell us about your ${getCategoryLabel(category).toLowerCase()}...`}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              disabled={isSubmitting || !user}
              sx={{ mb: 2 }}
              slotProps={{
                htmlInput: {
                  maxLength: 2000,
                }
              }}
              helperText={`${feedbackText.length}/2000 characters`}
            />

            {user && (
              <Box sx={{ bgcolor: 'background.default', borderRadius: 1, p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Submitting as: {user.displayName || user.email}
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      {!success && (
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button 
            onClick={handleClose} 
            disabled={isSubmitting}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            variant="contained"
            disabled={isSubmitting || !user || !feedbackText.trim()}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
          >
            {isSubmitting ? 'Submitting...' : 'Send Feedback'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};