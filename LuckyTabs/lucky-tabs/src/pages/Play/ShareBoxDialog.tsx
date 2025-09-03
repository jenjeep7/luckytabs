import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Checkbox,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { groupService, GroupData } from '../../services/groupService';
import { boxService } from '../../services/boxService';

interface ShareBoxDialogProps {
  open: boolean;
  onClose: () => void;
  boxId: string;
  boxName: string;
  currentUserId: string;
}

const ShareBoxDialog: React.FC<ShareBoxDialogProps> = ({
  open,
  onClose,
  boxId,
  boxName,
  currentUserId
}) => {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string>('');

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const userGroups = await groupService.getUserGroups(currentUserId);
      setGroups(userGroups);
    } catch (err) {
      console.error('Error loading groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (open) {
      void loadGroups();
    }
  }, [open, currentUserId, loadGroups]);

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleShare = async () => {
    if (selectedGroups.length === 0) return;

    setSharing(true);
    setError('');
    try {
      // Share with groups
      await boxService.shareBox(boxId, currentUserId, selectedGroups, 'group');
      
      onClose();
      setSelectedGroups([]);
    } catch (err) {
      console.error('Error sharing box:', err);
      setError('Failed to share box');
    } finally {
      setSharing(false);
    }
  };

  const handleClose = () => {
    setSelectedGroups([]);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share &ldquo;{boxName}&rdquo; with Groups</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : groups.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            You&apos;re not part of any groups yet. Join or create groups to share boxes with them.
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select groups to share this box with:
            </Typography>
            <List>
              {groups.map((group) => (
                <ListItem 
                  key={group.id}
                  dense
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleToggleGroup(group.id)}
                >
                  <Checkbox
                    edge="start"
                    checked={selectedGroups.includes(group.id)}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemAvatar>
                    <Avatar>
                      {group.name[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={group.name}
                    secondary={group.description || `${group.members.length} members`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => { void handleShare(); }}
          variant="contained"
          disabled={selectedGroups.length === 0 || sharing}
        >
          {sharing ? (
            <CircularProgress size={20} />
          ) : (
            `Share with ${selectedGroups.length} ${
              selectedGroups.length === 1 ? 'group' : 'groups'
            }`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareBoxDialog;
