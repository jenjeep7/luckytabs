import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { groupService } from '../../services/groupService';

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
  currentUserId: string;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  open,
  onClose,
  onGroupCreated,
  currentUserId
}) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await groupService.createGroup(currentUserId, groupName.trim(), description.trim());
      setGroupName('');
      setDescription('');
      onGroupCreated();
      onClose();
    } catch (err) {
      setError('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={() => { void handleCreate(); }}
          variant="contained"
          disabled={loading || !groupName.trim()}
        >
          {loading ? <CircularProgress size={20} /> : 'Create Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
