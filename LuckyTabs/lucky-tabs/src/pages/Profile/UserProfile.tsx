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
  Logout,
  Settings
} from '@mui/icons-material';
import { signOutCompat } from '../../services/authService';
import { useAuthStateCompat } from '../../services/useAuthStateCompat';
import { userService, UserData, GroupMember } from '../../services/userService';
import EditProfileDialog from './EditProfileDialog';
import { MetricThresholdsSettings } from './MetricThresholdsSettings';
import { getVersionInfo } from '../../utils/version';
import { ProfileFlare } from './ProfileFlare';
import { AchievementBanner } from './AchievementBanner';
import { useMetricThresholds, MetricThresholds } from '../../hooks/useMetricThresholds';
import { useUserProfile } from '../../context/UserProfileContext';
import type { User } from 'firebase/auth';

// Type guard to check if user has required properties (works for both web and native)
function isValidUser(u: unknown): u is User {
  console.log('[UserProfile] Type guard checking user:', u);
  const hasUid = !!u && typeof u === 'object' && 'uid' in u && typeof (u as { uid?: unknown }).uid === 'string';
  const uid = hasUid ? (u as { uid: string }).uid : 'no uid';
  console.log('[UserProfile] User has UID:', hasUid, uid);
  return hasUid;
}

export const UserProfile: React.FC = () => {
  const [user] = useAuthStateCompat();
  const { refreshProfile } = useUserProfile();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [metricsDialog, setMetricsDialog] = useState(false);
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

  // Get current metric thresholds
  const currentThresholds = useMetricThresholds();

  // Form state for editing
  const [editForm, setEditForm] = useState({
    displayName: '',
    avatar: ''
  });

  // Load user data when component mounts
  const loadUserData = useCallback(async () => {
    if (!isValidUser(user)) return;
    setLoading(true);
    try {
      // Load user profile from Firebase
      const userProfile = await userService.getUserProfile(user.uid);
      
      if (userProfile) {
        setUserData(userProfile);
        setEditForm({
          displayName: userProfile.displayName,
          avatar: userProfile.avatar || ''
        });
      } else {
        // Create new user profile if it doesn't exist
        const rawDisplayName = user.displayName || user.email?.split('@')[0] || 'Anonymous User';
        // Limit display name to 12 characters to match username requirements
        const displayName = typeof rawDisplayName === 'string' ? rawDisplayName.substring(0, 12) : 'Anonymous User';
        const displayNameParts = typeof displayName === 'string' ? displayName.split(' ') : ['Anonymous', 'User'];
        await userService.createUserProfile(
          user.uid,
          user.email || '',
          displayName,
          displayNameParts[0] || '',
          displayNameParts[1] || ''
        );
        
        // Load the newly created profile
        const newProfile = await userService.getUserProfile(user.uid);
        if (newProfile) {
          setUserData(newProfile);
          setEditForm({
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
      if (userData && isValidUser(user)) {
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
        displayName: userData.displayName,
        avatar: userData.avatar || ''
      });
      setEditDialog(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!isValidUser(user) || !userData) return;

    setSaving(true);
    try {
      // Prepare update data, excluding undefined values
      const updateData: { displayName: string; avatar?: string } = {
        displayName: editForm.displayName,
      };
      
      // Only include avatar if it has a value
      if (editForm.avatar && editForm.avatar.trim()) {
        updateData.avatar = editForm.avatar;
      }

      // Update user profile in Firebase
      await userService.updateUserProfile(user.uid, updateData);

      // Update local state
      const updatedUserData: UserData = {
        ...userData,
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

  const handleSaveMetricThresholds = async (thresholds: MetricThresholds) => {
    if (!isValidUser(user)) return;

    try {
      // Update user profile with new metric thresholds
      await userService.updateUserProfile(user.uid, { metricThresholds: thresholds });
      
      // Refresh user data and profile context to get the updated thresholds
      await loadUserData();
      await refreshProfile();
      
      setSnackbar({
        open: true,
        message: 'Metric thresholds updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving metric thresholds:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update metric thresholds',
        severity: 'error'
      });
      throw error; // Re-throw to let the dialog handle it
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
      const excludeIds = isValidUser(user) ? [user.uid, ...groupMembers.map(m => m.uid)] : [];
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
    if (!isValidUser(user)) return;
    
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
    if (file && isValidUser(user)) {
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
      {/* Achievement Banner - Placeholder for future badges */}
      <AchievementBanner />
    

      {/* Flare Sheet Section */}
      <ProfileFlare />

      {userData && (
        <Grid container spacing={3}>
          {/* Profile Information Card */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
                  <Avatar
                    src={userData.avatar}
                    sx={{ width: 80, height: 80, mr: 3, flexShrink: 0 }}
                  >
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}
                    >
                      {userData.displayName}
                    </Typography>
                  </Box>
                  {/* Show IconButton on mobile, outlined button on desktop */}
                  <Box sx={{ display: { xs: 'flex', md: 'none' }, flexShrink: 0, ml: 1 }}>
                    <IconButton color="primary" onClick={handleEditClick} aria-label="Edit Profile">
                      <Edit />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, flexShrink: 0, ml: 1 }}>
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

                {/* Email address moved below */}
                {/* <Box sx={{ mb: 2, pl: { xs: 0, sm: 11.5 } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                    {userData.email}
                  </Typography>
                </Box> */}

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
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                     <Typography variant="body2" sx={{ flexGrow: 1 }}>
                       <strong>Box Metrics:</strong> Custom thresholds
                     </Typography>
                     <Button
                       size="small"
                       variant="outlined"
                       startIcon={<Settings />}
                       onClick={() => setMetricsDialog(true)}
                       sx={{ minWidth: 120, fontWeight: 500 }}
                     >
                       Configure
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

      {/* Metric Thresholds Settings Dialog */}
      <MetricThresholdsSettings
        open={metricsDialog}
        onClose={() => setMetricsDialog(false)}
        onSave={(thresholds) => handleSaveMetricThresholds(thresholds)}
        currentThresholds={currentThresholds}
        saving={saving}
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
          onClick={() => void signOutCompat()}
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