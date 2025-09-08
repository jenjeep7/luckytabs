import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
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
  Autocomplete,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Stack
} from '@mui/material';
import {
  Edit,
  Logout
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { userService, UserData, GroupMember } from '../../services/userService';
import EditProfileDialog from './EditProfileDialog';
import { getVersionInfo } from '../../utils/version';
import { ProfileFlare } from './ProfileFlare';

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
    <Container maxWidth="md" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  fontFamily: 'Bitcount',
                  letterSpacing: 2,
                  px: 1,
                  pb: 1,
                  mt: 0,
                }}
              >
                {`${userData ? userData.displayName : ''}`}
              </Typography>
            </Box>

      {/* Flare Sheet Section */}
      <ProfileFlare />

      {userData && (
        <Grid container spacing={3}>
          {/* Profile Information Card */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    src={userData.avatar}
                    sx={{ width: 80, height: 80, mr: 3 }}
                  >
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {userData.displayName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {userData.email}
                    </Typography>
                  </Box>
                  {/* Show IconButton on mobile, outlined button on desktop */}
                  <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <IconButton color="primary" onClick={handleEditClick} aria-label="Edit Profile">
                      <Edit />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      color="primary"
                      onClick={handleEditClick}
                    >
                      Edit Profile
                    </Button>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ my: 1 }}>
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
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                     <Typography variant="body2" sx={{ flexGrow: 1 }}>
                       <strong>Plan:</strong> {userData.plan}
                     </Typography>
                     <Button
                       size="small"
                       variant="contained"
                       color={userData.plan === 'pro' ? 'primary' : 'success'}
                       sx={{ minWidth: 80, fontWeight: 500 }}
                     >
                       {userData.plan === 'pro' ? 'Manage Plan' : 'Go Pro'}
                     </Button>
                   </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>       
        </Grid>
      )}

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        onSave={() => void handleSaveProfile()}
        saving={saving}
        editForm={editForm}
        setEditForm={setEditForm}
        handleAvatarUpload={(e) => void handleAvatarUpload(e)}
      />

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

      {/* Logout Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Logout />}
          onClick={() => void auth.signOut()}
          sx={{
            minWidth: 200,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            }
          }}
        >
          Sign Out
        </Button>
      </Box>

      {/* App Version */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4, px: 2 }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            fontSize: { xs: '0.875rem', sm: '0.75rem' },
            fontWeight: 500,
            textAlign: 'center',
            minHeight: '20px',
            lineHeight: 1.4,
            zIndex: 10
          }}
        >
          V {getVersionInfo().version}
        </Typography>
      </Box>

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