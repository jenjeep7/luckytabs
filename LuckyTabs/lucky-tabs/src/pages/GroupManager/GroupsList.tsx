import React, { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Divider,
  TextField,
  Autocomplete
} from '@mui/material';
import {
  Delete as DeleteIcon
} from '@mui/icons-material';
import { GroupData, GroupMember, groupService } from '../../services/groupService';

interface GroupsListProps {
  groups: GroupData[];
  loading: boolean;
  currentUserId: string;
  onGroupClick: (group: GroupData) => void;
  onDeleteGroup: (groupId: string) => void;
}

interface GroupCardProps {
  group: GroupData;
  currentUserId: string;
  onDeleteGroup: (groupId: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  currentUserId,
  onDeleteGroup
}) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [searchResults, setSearchResults] = useState<GroupMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const isCreator = group.createdBy === currentUserId;

  // Load group members
  useEffect(() => {
    const loadMembers = async () => {
      setLoadingMembers(true);
      try {
        const groupMembers = await groupService.getGroupMembers(group.id);
        setMembers(groupMembers);
      } catch (error) {
        console.error('Error loading group members:', error);
      } finally {
        setLoadingMembers(false);
      }
    };

    void loadMembers();
  }, [group.id]);

  // Search for users to add
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }
      
      setSearchLoading(true);
      try {
        const memberIds = members.map((m) => m.uid);
        const results = await groupService.searchUsersForGroup(searchTerm, memberIds);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      void searchUsers();
    }, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm, members, group.id]);

  const handleRemoveMember = async (memberId: string) => {
    try {
      await groupService.removeMember(group.id, memberId);
      // Refresh members list
      const updatedMembers = await groupService.getGroupMembers(group.id);
      setMembers(updatedMembers);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleAddMember = async (member: GroupMember | null) => {
    if (!member) return;
    
    setAddingMember(true);
    try {
      await groupService.addMember(group.id, member.uid);
      // Refresh members list
      const updatedMembers = await groupService.getGroupMembers(group.id);
      setMembers(updatedMembers);
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setAddingMember(false);
    }
  };

  return (
    <Card sx={{ 
      mb: 3, 
      border: '1px solid', 
      borderColor: 'divider',
      boxShadow: '0 0 20px rgba(0, 150, 255, 0.15)',
      '&:hover': {
        boxShadow: '0 0 25px rgba(0, 150, 255, 0.25)',
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease-in-out'
      },
      transition: 'all 0.3s ease-in-out'
    }}>
      <CardContent>
        {/* Group Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {group.name}
            </Typography>
            {group.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {group.description}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip 
                size="small" 
                label={`${members.length} member${members.length !== 1 ? 's' : ''}`} 
                variant="outlined" 
              />
              {isCreator && (
                <Chip size="small" label="You created this" color="primary" variant="outlined" />
              )}
            </Box>
          </Box>
          {isCreator && (
            <IconButton
              color="error"
              onClick={() => onDeleteGroup(group.id)}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Members Section */}
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Members
        </Typography>
        
        {loadingMembers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            {members.map((member) => (
              <Box
                key={member.uid}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                  },
                }}
              >
                <Avatar
                  src={member.avatar}
                  sx={{ width: 32, height: 32, mr: 2 }}
                >
                  {member.displayName.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2">
                    {member.displayName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {member.uid === group.createdBy && (
                    <Chip label="Creator" size="small" color="primary" />
                  )}
                  {isCreator && member.uid !== currentUserId && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => void handleRemoveMember(member.uid)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Add Member Section */}
        {isCreator && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Add Members
            </Typography>
            <Autocomplete
              options={searchResults}
              getOptionLabel={(option) => option.displayName}
              loading={searchLoading}
              value={null}
              inputValue={searchTerm}
              onInputChange={(_, value) => setSearchTerm(value)}
              onChange={(_, value) => void handleAddMember(value)}
              disabled={addingMember}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search users by name"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar src={option.avatar} sx={{ mr: 2, width: 32, height: 32 }}>
                    {option.displayName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2">{option.displayName}</Typography>
                  </Box>
                </Box>
              )}
              noOptionsText={searchTerm ? "No users found" : "Type to search for users"}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  loading,
  currentUserId,
  onGroupClick: _onGroupClick,
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
    <Box>
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          currentUserId={currentUserId}
          onDeleteGroup={onDeleteGroup}
        />
      ))}
    </Box>
  );
};
