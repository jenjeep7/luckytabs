import React from 'react';
import {
  List,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { GroupData } from '../../services/groupService';
import { GroupListItem } from './GroupListItem';

interface GroupsListProps {
  groups: GroupData[];
  loading: boolean;
  currentUserId: string;
  onGroupClick: (group: GroupData) => void;
  onDeleteGroup: (groupId: string) => void;
}

export const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  loading,
  currentUserId,
  onGroupClick,
  onDeleteGroup
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (groups.length === 0) {
    return (
      <Alert severity="info">
        You haven&apos;t created or joined any groups yet. Create your first group to get started!
      </Alert>
    );
  }

  return (
    <List>
      {groups.map((group) => (
        <GroupListItem
          key={group.id}
          group={group}
          currentUserId={currentUserId}
          onGroupClick={onGroupClick}
          onDeleteGroup={onDeleteGroup}
        />
      ))}
    </List>
  );
};
