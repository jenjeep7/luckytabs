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
import { GroupMembersDialog } from './GroupMembersDialog';
import { GroupsList } from './GroupsList';

interface GroupsManagerProps {
  currentUserId: string;
  currentUserName?: string;
}

export const GroupsManager: React.FC<GroupsManagerProps> = ({ currentUserId, currentUserName: _currentUserName }) => {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);

  // Load user's groups
  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const userGroups = await groupService.getUserGroups(currentUserId);
      setGroups(userGroups);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    void loadGroups();
  }, [currentUserId, loadGroups]);

  const handleGroupClick = (group: GroupData) => {
    setSelectedGroup(group);
    setMembersDialogOpen(true);
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await groupService.deleteGroup(groupId, currentUserId);
      await loadGroups(); // Refresh the list
    } catch (error) {
      alert('Failed to delete group. Please try again.');
    }
  };

  // Handle member changes with proper refresh
  const handleMemberChanged = useCallback(async () => {
    await loadGroups();
    
    // Update the selected group if dialog is open
    if (selectedGroup) {
      try {
        const updatedGroup = await groupService.getGroup(selectedGroup.id);
        if (updatedGroup) {
          setSelectedGroup(updatedGroup);
        }
      } catch (error) {
      }
    }
  }, [loadGroups, selectedGroup]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">My Groups</Typography>
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
        onGroupClick={handleGroupClick}
        onDeleteGroup={(groupId) => { void handleDeleteGroup(groupId); }}
      />

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onGroupCreated={() => { void loadGroups(); }}
        currentUserId={currentUserId}
      />

      {/* Group Members Dialog */}
      <GroupMembersDialog
        open={membersDialogOpen}
        onClose={() => setMembersDialogOpen(false)}
        group={selectedGroup}
        currentUserId={currentUserId}
        onMemberAdded={() => { void handleMemberChanged(); }}
      />
    </Box>
  );
};
