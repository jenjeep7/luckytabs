import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Autocomplete,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { groupService, GroupData, GroupMember } from '../services/groupService';

interface GroupsManagerProps {
  currentUserId: string;
  currentUserName?: string;
}

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
  currentUserId: string;
}

function CreateGroupDialog({ open, onClose, onGroupCreated, currentUserId }: CreateGroupDialogProps) {
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
      console.error('Error creating group:', err);
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
}

interface GroupMembersDialogProps {
  open: boolean;
  onClose: () => void;
  group: GroupData | null;
  currentUserId: string;
  onMemberAdded: () => void;
}

function GroupMembersDialog({ open, onClose, group, currentUserId, onMemberAdded }: GroupMembersDialogProps) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchResults, setSearchResults] = useState<GroupMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
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

  // Search for users to add
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim() || !group || loadingMembers) {
        setSearchResults([]);
        return;
      }
      
      console.log('Starting user search with term:', searchTerm);
      setSearchLoading(true);
      try {
        const memberIds = members.map((m: GroupMember) => m.uid);
        console.log('Current member IDs to exclude:', memberIds);
        const results = await groupService.searchUsersForGroup(searchTerm, memberIds);
        console.log('Search results received:', results);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      void searchUsers();
    }, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm, members, group, loadingMembers]);

  const handleAddMember = async (userToAdd: GroupMember) => {
    if (!group) return;

    setAddMemberLoading(true);
    try {
      await groupService.addMember(group.id, userToAdd.uid);
      
      // Update local members state immediately
      setMembers(prev => [...prev, userToAdd]);
      setSearchTerm('');
      setSearchResults([]);
      
      // Refresh the parent component to update the group list
      onMemberAdded();
      
      console.log('Member added successfully:', userToAdd.displayName);
    } catch (error) {
      console.error('Error adding member:', error);
      // Show user-friendly error
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
      
      console.log('Member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
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
        {isCreator && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Add Members
            </Typography>
            <Autocomplete
              options={searchResults}
              getOptionLabel={(option) => option.displayName}
              loading={searchLoading}
              value={null} // Always keep it cleared
              inputValue={searchTerm}
              onInputChange={(_, value) => setSearchTerm(value)}
              onChange={(_, value) => {
                if (value) {
                  void handleAddMember(value);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search users by display name"
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
                    <Typography variant="body1">{option.displayName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.firstName} {option.lastName}
                    </Typography>
                  </Box>
                </Box>
              )}
              disabled={addMemberLoading}
              noOptionsText={searchTerm ? "No users found" : "Type to search for users"}
            />
          </Box>
        )}

        {/* Current Members List */}
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Current Members ({members.length})
        </Typography>
        
        {loadingMembers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {members.map((member) => (
              <ListItem 
                key={member.uid}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {member.uid === group?.createdBy && (
                      <Chip label="Creator" size="small" color="primary" />
                    )}
                    {isCreator && member.uid !== currentUserId && (
                      <IconButton
                        edge="end"
                        onClick={() => { void handleRemoveMember(member.uid); }}
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
                  secondary={`${member.firstName} ${member.lastName}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
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
      console.log('Loaded groups:', userGroups);
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
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
      console.log('Group deleted successfully');
      await loadGroups(); // Refresh the list
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group. Please try again.');
    }
  };

  // Handle member changes with proper refresh
  const handleMemberChanged = useCallback(async () => {
    console.log('Member changed, refreshing groups...');
    await loadGroups();
    
    // Update the selected group if dialog is open
    if (selectedGroup) {
      try {
        const updatedGroup = await groupService.getGroup(selectedGroup.id);
        if (updatedGroup) {
          setSelectedGroup(updatedGroup);
        }
      } catch (error) {
        console.error('Error refreshing selected group:', error);
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : groups.length === 0 ? (
        <Alert severity="info">
          You haven&apos;t created or joined any groups yet. Create your first group to get started!
        </Alert>
      ) : (
        <List>
          {groups.map((group) => (
            <ListItem 
              key={group.id}
              component="div"
              onClick={() => handleGroupClick(group)}
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
                      handleGroupClick(group);
                    }}
                  >
                    <PersonAddIcon />
                  </IconButton>
                  {group.createdBy === currentUserId && (
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDeleteGroup(group.id);
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
                  <Box>
                    {group.description && (
                      <Typography variant="body2" color="text.secondary">
                        {group.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                      {group.createdBy === currentUserId && ' • You created this group'}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

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
