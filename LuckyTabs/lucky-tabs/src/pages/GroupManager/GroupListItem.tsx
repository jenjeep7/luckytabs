import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { GroupData } from '../../services/groupService';

interface GroupListItemProps {
  group: GroupData;
  currentUserId: string;
  onGroupClick: (group: GroupData) => void;
  onDeleteGroup: (groupId: string) => void;
}

export const GroupListItem: React.FC<GroupListItemProps> = ({
  group,
  currentUserId,
  onGroupClick,
  onDeleteGroup
}) => {
  const isCreator = group.createdBy === currentUserId;

  return (
    <ListItem 
      component="div"
      onClick={() => onGroupClick(group)}
      sx={{ 
        border: 1, 
        borderColor: 'divider', 
        borderRadius: 1, 
        mb: 1,
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
      secondaryAction={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            edge="end"
            onClick={(e) => {
              e.stopPropagation();
              onGroupClick(group);
            }}
          >
            <PersonAddIcon />
          </IconButton>
          {isCreator && (
            <IconButton
              edge="end"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteGroup(group.id);
              }}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      }
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <GroupIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={group.name}
        secondary={
          <>
            {group.description && (
              <Typography variant="body2" color="text.secondary" component="span" display="block">
                {group.description}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" component="span" display="block">
              {group.members.length} member{group.members.length !== 1 ? 's' : ''}
              {isCreator && ' • You created this group'}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
};
