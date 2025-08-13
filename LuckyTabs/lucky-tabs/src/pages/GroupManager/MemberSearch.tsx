import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  CircularProgress,
  Autocomplete,
  Avatar,
  Typography
} from '@mui/material';
import { groupService, GroupMember } from '../../services/groupService';

interface MemberSearchProps {
  groupId: string;
  members: GroupMember[];
  onMemberAdd: (member: GroupMember) => void;
  disabled?: boolean;
}

export const MemberSearch: React.FC<MemberSearchProps> = ({
  groupId,
  members,
  onMemberAdd,
  disabled = false
}) => {
  const [searchResults, setSearchResults] = useState<GroupMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Search for users to add
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }
      
      setSearchLoading(true);
      try {
        const memberIds = members.map((m: GroupMember) => m.uid);
        const results = await groupService.searchUsersForGroup(searchTerm, memberIds);
        setSearchResults(results);
      } catch (error) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      void searchUsers();
    }, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm, members, groupId]);

  const handleMemberSelect = (member: GroupMember | null) => {
    if (member) {
      onMemberAdd(member);
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  return (
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
        onChange={(_, value) => handleMemberSelect(value)}
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
        disabled={disabled}
        noOptionsText={searchTerm ? "No users found" : "Type to search for users"}
      />
    </Box>
  );
};
