import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Autocomplete,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Stack
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  PersonAdd,
  Delete,
  Save,
  Cancel
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { userService, UserData, GroupMember } from '../../services/userService';

export const UserProfile: React.FC = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [searchResults, setSearchResults] = useState<GroupMember[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state for editing
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    avatar: ''
  });

  // Load user data when component mounts
  const loadUserData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load user profile from Firebase
      const userProfile = await userService.getUserProfile(user.uid);
      
      if (userProfile) {
        setUserData(userProfile);
        setEditForm({
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          displayName: userProfile.displayName,
          avatar: userProfile.avatar || ''
        });
      } else {
        // Create new user profile if it doesn't exist
        await userService.createUserProfile(
          user.uid,
          user.email || '',
          user.displayName || 'Anonymous User',
          user.displayName?.split(' ')[0] || '',
          user.displayName?.split(' ')[1] || ''
        );
        
        // Load the newly created profile
        const newProfile = await userService.getUserProfile(user.uid);
        if (newProfile) {
          setUserData(newProfile);
          setEditForm({
            firstName: newProfile.firstName,
            lastName: newProfile.lastName,
            displayName: newProfile.displayName,
            avatar: newProfile.avatar || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load user data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadUserData();
  }, [loadUserData]);

  // Load group members when userData is available
  useEffect(() => {
    const loadData = async () => {
      if (userData && user) {
        try {
          // Load user's friends as group members
          const friends = await userService.getUserFriends(user.uid);
          setGroupMembers(friends);
        } catch (error) {
          console.error('Error loading group members:', error);
        }
      }
    };
    
    void loadData();
  }, [userData, user]);

  const handleEditClick = () => {
    if (userData) {
      setEditForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: userData.displayName,
        avatar: userData.avatar || ''
      });
      setEditDialog(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !userData) return;

    setSaving(true);
    try {
      // Update user profile in Firebase
      await userService.updateUserProfile(user.uid, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        displayName: editForm.displayName,
        avatar: editForm.avatar || undefined
      });

      // Update local state
      const updatedUserData: UserData = {
        ...userData,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        displayName: editForm.displayName,
        avatar: editForm.avatar || undefined,
        updatedAt: new Date()
      };

      setUserData(updatedUserData);
      setEditDialog(false);
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchingUsers(true);
    try {
      // Search users using Firebase service
      const excludeIds = user ? [user.uid, ...groupMembers.map(m => m.uid)] : [];
      const results = await userService.searchUsers(searchTerm, excludeIds);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setSnackbar({
        open: true,
        message: 'Failed to search users',
        severity: 'error'
      });
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleAddUserToGroup = async (selectedUser: GroupMember) => {
    if (!user) return;
    
    try {
      // Add user as a friend
      await userService.addFriend(user.uid, selectedUser.uid);
      
      // Update local state
      setGroupMembers(prev => [...prev, selectedUser]);
      setAddUserDialog(false);
      setSearchResults([]);
      
      setSnackbar({
        open: true,
        message: `${selectedUser.displayName} added to your friends!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding user to group:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add user to friends',
        severity: 'error'
      });
    }
  };

  // const handleRemoveFromGroup = async (userId: string) => {
  //   if (!user) return;
    
  //   try {
  //     // Remove user from friends
  //     await userService.removeFriend(user.uid, userId);
      
  //     // Update local state
  //     setGroupMembers(prev => prev.filter(member => member.uid !== userId));
      
  //     setSnackbar({
  //       open: true,
  //       message: 'User removed from friends',
  //       severity: 'success'
  //     });
  //   } catch (error) {
  //     console.error('Error removing user from group:', error);
  //     setSnackbar({
  //       open: true,
  //       message: 'Failed to remove user from friends',
  //       severity: 'error'
  //     });
  //   }
  // };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      try {
        // Upload to Firebase Storage and get URL
        const avatarUrl = await userService.uploadAvatar(user.uid, file);
        
        // Update form state with new avatar URL
        setEditForm(prev => ({
          ...prev,
          avatar: avatarUrl
        }));
        
        setSnackbar({
          open: true,
          message: 'Avatar uploaded successfully!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        setSnackbar({
          open: true,
          message: 'Failed to upload avatar',
          severity: 'error'
        });
      }
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          Please log in to view your profile.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        User Profile
      </Typography>

      {userData && (
        <Grid container spacing={3}>
          {/* Profile Information Card */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    src={userData.avatar}
                    sx={{ width: 80, height: 80, mr: 3 }}
                  >
                    {userData.firstName[0]}{userData.lastName[0]}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {userData.displayName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {userData.firstName} {userData.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {userData.email}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    color="primary"
                    onClick={handleEditClick}
                  >
                    Edit Profile
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Account Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Member since:</strong> {userData.createdAt.toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Groups:</strong> {userData.groups.length}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Friends:</strong> {userData.friends.length}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>       
        </Grid>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Avatar Upload */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={editForm.avatar}
                sx={{ width: 100, height: 100, mb: 2 }}
              >
                {editForm.firstName[0]}{editForm.lastName[0]}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={(e) => void handleAvatarUpload(e)}
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
                  size="small"
                >
                  Change Avatar
                </Button>
              </label>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSaveProfile()}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <Save />}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User to Group Dialog */}
      <Dialog open={addUserDialog} onClose={() => setAddUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add User to Group</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              options={searchResults}
              getOptionLabel={(option) => option.displayName}
              loading={searchingUsers}
              onInputChange={(_, value) => {
                void searchUsers(value);
              }}
              onChange={(_, value) => {
                if (value) {
                  void handleAddUserToGroup(value);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search for users by display name"
                  placeholder="Type to search..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchingUsers && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Avatar sx={{ mr: 2 }} src={option.avatar}>
                    {option.displayName[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body1">{option.displayName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {option.uid.slice(0, 8)}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};