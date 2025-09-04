import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Chip,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { GroupMember } from '../../services/groupService';

interface MembersListProps {
  members: GroupMember[];
  loading: boolean;
  currentUserId: string;
  groupCreatorId?: string;
  isCreator: boolean;
  onMemberRemove: (memberId: string) => void;
}

export const MembersList: React.FC<MembersListProps> = ({
  members,
  loading,
  currentUserId,
  groupCreatorId,
  isCreator,
  onMemberRemove
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Current Members ({members.length})
      </Typography>
      <List>
        {members.map((member) => (
          <ListItem 
            key={member.uid}
            secondaryAction={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {member.uid === groupCreatorId && (
                  <Chip label="Creator" size="small" color="primary" />
                )}
                {isCreator && member.uid !== currentUserId && (
                  <IconButton
                    edge="end"
                    onClick={() => onMemberRemove(member.uid)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            }
          >
            <ListItemAvatar>
              <Avatar src={member.avatar}>
                {member.displayName.charAt(0).toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={member.displayName}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
};
