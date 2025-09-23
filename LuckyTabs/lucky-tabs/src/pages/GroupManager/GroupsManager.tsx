import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Fab
} from '@mui/material';
import {
  Add as AddIcon
} from '@mui/icons-material';
import { groupService, GroupData } from '../../services/groupService';
import { CreateGroupDialog } from './CreateGroupDialog';
import { GroupsList } from './GroupsList';

interface GroupsManagerProps {
  currentUserId: string;
  currentUserName?: string;
}

export const GroupsManager: React.FC<GroupsManagerProps> = ({ currentUserId, currentUserName: _currentUserName }) => {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Load user's groups
  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const userGroups = await groupService.getUserGroups(currentUserId);
      // Filter out any group named "Public" as it's not a user-created group
      const filteredGroups = userGroups.filter(group => 
        group.name.toLowerCase() !== 'public'
      );
      setGroups(filteredGroups);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    void loadGroups();
  }, [currentUserId, loadGroups]);

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await groupService.deleteGroup(groupId, currentUserId);
      await loadGroups(); // Refresh the list
    } catch (error) {
      alert('Failed to delete group. Please try again.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">My Crews</Typography>
        <Fab
          color="primary"
          size="small"
          onClick={() => setCreateDialogOpen(true)}
          sx={{ ml: 2 }}
        >
          <AddIcon />
        </Fab>
      </Box>

      <GroupsList
        groups={groups}
        loading={loading}
        currentUserId={currentUserId}
        onGroupClick={() => undefined} // Not needed anymore since cards handle everything
        onDeleteGroup={(groupId) => { void handleDeleteGroup(groupId); }}
      />

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onGroupCreated={() => { void loadGroups(); }}
        currentUserId={currentUserId}
      />
    </Box>
  );
};
