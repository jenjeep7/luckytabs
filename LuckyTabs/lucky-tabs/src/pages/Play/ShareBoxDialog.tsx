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
  CircularProgress,
} from '@mui/material';
import { groupService, GroupData } from '../../services/groupService';
import { boxService, BoxShare } from '../../services/boxService';

interface ShareBoxDialogProps {
  open: boolean;
  onClose: () => void;
  onShare?: () => void; // Callback to refresh boxes after sharing
  boxId: string;
  boxName: string;
  currentUserId: string;
  existingShares?: BoxShare[]; // Pass in existing shares from parent
}

const ShareBoxDialog: React.FC<ShareBoxDialogProps> = ({
  open,
  onClose,
  onShare,
  boxId,
  boxName,
  currentUserId,
  existingShares = []
}) => {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [currentlySharedGroups, setCurrentlySharedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const userGroups = await groupService.getUserGroups(currentUserId);
      setGroups(userGroups);
      
      // Extract currently shared group IDs from existing shares
      const sharedGroupIds: string[] = [];
      existingShares.forEach(share => {
        if (share.shareType === 'group') {
          sharedGroupIds.push(...share.sharedWith);
        }
      });
      setCurrentlySharedGroups(sharedGroupIds);
      setSelectedGroups([...sharedGroupIds]); // Pre-select currently shared groups (create new array)
      
    } catch (err) {
      console.error('Error loading groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, existingShares]);

  useEffect(() => {
    if (open) {
      // Reset states when dialog opens
      setSuccess(false);
      setSharing(false);
      setError('');
      // Clear previous selections to force fresh load
      setSelectedGroups([]);
      setCurrentlySharedGroups([]);
      void loadGroups();
    }
  }, [open, loadGroups]);

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleShare = async () => {
    setSharing(true);
    setError('');
    try {
      // Determine which groups need to be shared and unshared
      const groupsToShare = selectedGroups.filter(groupId => !currentlySharedGroups.includes(groupId));
      const groupsToUnshare = currentlySharedGroups.filter(groupId => !selectedGroups.includes(groupId));
      
      // Share with new groups
      if (groupsToShare.length > 0) {
        await boxService.shareBox(boxId, currentUserId, groupsToShare, 'group');
      }
      
      // Unshare from removed groups
      if (groupsToUnshare.length > 0) {
        // Find the shares to remove
        const sharesToRemove = existingShares.filter(share => 
          share.shareType === 'group' && 
          share.sharedWith.some(groupId => groupsToUnshare.includes(groupId))
        );
        
        for (const share of sharesToRemove) {
          await boxService.unshareBox(boxId, share);
        }
      }
      
      setSuccess(true);
      
      // Close dialog after a brief success message
      setTimeout(() => {
        onClose();
        // Call the refresh callback after closing dialog to ensure smooth UX
        if (onShare) {
          onShare();
        }
      }, 500);
    } catch (err) {
      console.error('Error updating box shares:', err);
      setError('Failed to update box shares');
    } finally {
      setSharing(false);
    }
  };

  const handleClose = () => {
    setSelectedGroups([]);
    setCurrentlySharedGroups([]);
    setError('');
    setSuccess(false);
    setSharing(false);
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
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Box shared successfully! Refreshing your boxes...
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : success ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Updating boxes...</Typography>
          </Box>
        ) : groups.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            You&apos;re not part of any groups yet. Join or create groups to share boxes with them.
          </Typography>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select groups to share this box with.
            </Typography>
            <List>
              {groups.map((group) => {
                const isCurrentlyShared = currentlySharedGroups.includes(group.id);
                const isSelected = selectedGroups.includes(group.id);
                
                return (
                  <ListItem 
                    key={group.id}
                    dense
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleToggleGroup(group.id)}
                  >
                    <Checkbox
                      edge="start"
                      checked={isSelected}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: isCurrentlyShared ? 'success.main' : 'grey.400' }}>
                        {group.name[0].toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={group.name}
                      secondary={`${group.members.length} members`}
                    />
                  </ListItem>
                );
              })}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => { void handleShare(); }}
          variant="contained"
          disabled={sharing || success}
        >
          {sharing ? (
            <CircularProgress size={20} />
          ) : success ? (
            'Updated!'
          ) : (
            (() => {
              const groupsToShare = selectedGroups.filter(groupId => !currentlySharedGroups.includes(groupId));
              const groupsToUnshare = currentlySharedGroups.filter(groupId => !selectedGroups.includes(groupId));
              
              if (groupsToShare.length > 0 && groupsToUnshare.length > 0) {
                return `Update Sharing (${groupsToShare.length} new, ${groupsToUnshare.length} removed)`;
              } else if (groupsToShare.length > 0) {
                return `Share with ${groupsToShare.length} ${groupsToShare.length === 1 ? 'group' : 'groups'}`;
              } else if (groupsToUnshare.length > 0) {
                return `Unshare from ${groupsToUnshare.length} ${groupsToUnshare.length === 1 ? 'group' : 'groups'}`;
              } else {
                return 'No Changes';
              }
            })()
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareBoxDialog;
