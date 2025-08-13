import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import {
  Group as GroupIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { groupService, GroupData, GroupMember } from '../../services/groupService';
import { MemberSearch } from './MemberSearch';
import { MembersList } from './MembersList';

interface GroupMembersDialogProps {
  open: boolean;
  onClose: () => void;
  group: GroupData | null;
  currentUserId: string;
  onMemberAdded: () => void;
}

export const GroupMembersDialog: React.FC<GroupMembersDialogProps> = ({
  open,
  onClose,
  group,
  currentUserId,
  onMemberAdded
}) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);

  // Load group members when dialog opens
  useEffect(() => {
    if (open && group) {
      setLoadingMembers(true);
      void groupService.getGroupMembers(group.id)
        .then(setMembers)
        .catch(console.error)
        .finally(() => setLoadingMembers(false));
    }
  }, [open, group]);

  const handleAddMember = async (userToAdd: GroupMember) => {
    if (!group) return;

    setAddMemberLoading(true);
    try {
      await groupService.addMember(group.id, userToAdd.uid);
      
      // Update local members state immediately
      setMembers(prev => [...prev, userToAdd]);
      
      // Refresh the parent component to update the group list
      onMemberAdded();
    } catch (error) {
      alert('Failed to add member. Please try again.');
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!group) return;
    
    try {
      await groupService.removeMember(group.id, memberId);
      
      // Update local members state immediately
      setMembers(prev => prev.filter(m => m.uid !== memberId));
      
      // Refresh parent component
      onMemberAdded();
    } catch (error) {
      alert('Failed to remove member. Please try again.');
    }
  };

  const isCreator = group?.createdBy === currentUserId;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon />
            <Typography variant="h6">{group?.name} Members</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Add Member Section */}
        {isCreator && group && (
          <MemberSearch
            groupId={group.id}
            members={members}
            onMemberAdd={(member) => { void handleAddMember(member); }}
            disabled={addMemberLoading}
          />
        )}

        {/* Current Members List */}
        <MembersList
          members={members}
          loading={loadingMembers}
          currentUserId={currentUserId}
          groupCreatorId={group?.createdBy}
          isCreator={isCreator}
          onMemberRemove={(memberId) => { void handleRemoveMember(memberId); }}
        />
      </DialogContent>
    </Dialog>
  );
};
