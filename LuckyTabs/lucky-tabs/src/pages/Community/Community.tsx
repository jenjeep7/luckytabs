import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Tab,
  Tabs,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Send,
  Public,
  Group,
  Add,
  Groups as GroupsIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  MoreVert,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { communityService, Post, Comment } from '../../services/communityService';
import { userService, UserData } from '../../services/userService';
import { groupService, GroupData } from '../../services/groupService';
import { GroupsManager } from '../GroupManager/GroupsManager';
import { uploadPostImage } from '../../services/storageService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`community-tabpanel-${index}`} aria-labelledby={`community-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: { xs: 1.5, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onEdit?: (postId: string, newContent: string) => void;
  onDelete?: (postId: string) => void;
  setDeleteConfirmation?: (state: { open: boolean; postId: string | null }) => void;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  authorProfile?: UserData;
  userProfiles?: Map<string, UserData>;
}

function PostCard({
  post,
  onLike,
  onComment,
  onEdit,
  onDelete,
  setDeleteConfirmation,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  authorProfile,
  userProfiles,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  // Image modal state
  const [imageModalOpen, setImageModalOpen] = React.useState<boolean>(false);
  const [imageModalIndex, setImageModalIndex] = React.useState<number>(0);

  // fetch count once (or when post.id changes)
  useEffect(() => {
    let cancelled = false;
    communityService.getCommentsCount(post.id)
      .then((c) => { if (!cancelled) setCommentCount(c); })
      .catch(() => { if (!cancelled) setCommentCount(0); });
    return () => { cancelled = true; };
  }, [post.id]);

  // existing effect -> also sync count after loading list
  useEffect(() => {
    if (!showComments) return;
    setLoadingComments(true);
    communityService.getComments(post.id)
      .then((list) => {
        setComments(list);
        setCommentCount(list.length); // keep UI in sync when open
      })
      .catch(console.error)
      .finally(() => setLoadingComments(false));
  }, [showComments, post.id]);

  // when posting, bump count optimistically and refresh list if open
  const handleComment = () => {
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText('');
    setCommentCount((c) => c + 1); // optimistic

    if (showComments) {
      communityService.getComments(post.id)
        .then((list) => {
          setComments(list);
          setCommentCount(list.length);
        })
        .catch(console.error);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return date.toLocaleDateString();
  };

  const getDisplayName = (authorId: string) => {
    if (authorId === currentUserId) return currentUserName || 'You';
    
    // First check the specific authorProfile prop
    if (authorProfile && authorProfile.uid === authorId) {
      // Use displayName if available, otherwise fallback to firstName + lastName
      if (authorProfile.displayName && authorProfile.displayName.trim()) {
        return authorProfile.displayName;
      }
      if (authorProfile.firstName && authorProfile.lastName) {
        return `${authorProfile.firstName} ${authorProfile.lastName}`;
      }
      if (authorProfile.firstName) {
        return authorProfile.firstName;
      }
    }
    
    // Then check the userProfiles Map for any loaded user profile
    const userProfile = userProfiles?.get(authorId);
    if (userProfile) {
      if (userProfile.displayName && userProfile.displayName.trim()) {
        return userProfile.displayName;
      }
      if (userProfile.firstName && userProfile.lastName) {
        return `${userProfile.firstName} ${userProfile.lastName}`;
      }
      if (userProfile.firstName) {
        return userProfile.firstName;
      }
    }
    
    // Fallback to a cleaner user ID display
    return `User ${authorId.slice(0, 8)}`;
  };

  const getInitials = (authorId: string) => {
    if (authorId === currentUserId && currentUserName) {
      return currentUserName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    
    // First check the specific authorProfile prop
    if (authorProfile && authorProfile.uid === authorId) {
      if (authorProfile.firstName && authorProfile.lastName) {
        return (authorProfile.firstName[0] + authorProfile.lastName[0]).toUpperCase();
      }
      if (authorProfile.displayName) {
        return authorProfile.displayName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }
    }
    
    // Then check the userProfiles Map
    const userProfile = userProfiles?.get(authorId);
    if (userProfile) {
      if (userProfile.firstName && userProfile.lastName) {
        return (userProfile.firstName[0] + userProfile.lastName[0]).toUpperCase();
      }
      if (userProfile.displayName) {
        return userProfile.displayName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }
    }
    
    return authorId.slice(0, 2).toUpperCase();
  };

  const getAvatarUrl = (authorId: string) => {
    if (authorId === currentUserId) return currentUserAvatar;
    if (authorProfile && authorProfile.uid === authorId) return authorProfile.avatar;
    
    // Check the userProfiles Map
    const userProfile = userProfiles?.get(authorId);
    if (userProfile) return userProfile.avatar;
    
    return undefined;
  };

  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;

  return (
    <Card
      sx={{
        mb: 2,
        bgcolor: 'background.paper',
        color: 'text.primary',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        {/* Post Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={getAvatarUrl(post.authorId)}
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            {getInitials(post.authorId)}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
              {getDisplayName(post.authorId)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary">
                {formatTime(post.timestamp)}
              </Typography>
              <Chip
                icon={post.type === 'public' ? <Public /> : <Group />}
                label={post.type === 'public' ? 'Public' : 'Group'}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  height: 20,
                  color: 'text.secondary',
                  borderColor: 'divider',
                }}
              />
            </Box>
          </Box>
          {/* Three dots menu - only show for posts by current user */}
          {currentUserId === post.authorId && (
            <>
              <IconButton 
                size="small" 
                sx={{ color: 'text.secondary' }}
                onClick={(e) => setMenuAnchor(e.currentTarget)}
              >
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                PaperProps={{
                  sx: { bgcolor: 'background.paper', color: 'text.primary' }
                }}
              >
                <MenuItem onClick={() => {
                  setIsEditing(true);
                  setMenuAnchor(null);
                }}>
                  <Edit sx={{ mr: 1, fontSize: 20 }} />
                  Edit Post
                </MenuItem>
                <MenuItem 
                  onClick={() => {
                    if (onDelete && setDeleteConfirmation) {
                      setDeleteConfirmation({ open: true, postId: post.id });
                    }
                    setMenuAnchor(null);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <Delete sx={{ mr: 1, fontSize: 20 }} />
                  Delete Post
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        {/* Post Text */}
        {post.content && (
          <>
            {isEditing ? (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button 
                    size="small" 
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(post.content);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained"
                    onClick={() => {
                      if (onEdit && editContent.trim()) {
                        onEdit(post.id, editContent.trim());
                        setIsEditing(false);
                      }
                    }}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body1" sx={{ mb: post.media?.length ? 1 : 2, whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                {post.content}
              </Typography>
            )}
          </>
        )}

        {/* Post Images */}
        {post.media && post.media.length > 0 && (
          <>
            <Box
              sx={{
                mt: 1,
                mb: 2,
                display: 'grid',
                gap: 1,
                gridTemplateColumns: {
                  xs: post.media.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                  sm: post.media.length >= 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                },
              }}
            >
              {post.media.slice(0, 4).map((m, idx) => (
                <Box
                  key={idx}
                  sx={{
                    position: 'relative',
                    pt: '100%',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setImageModalOpen(true);
                    setImageModalIndex(idx);
                  }}
                >
                  <img
                    src={m.url}
                    alt=""
                    loading="lazy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Box>
            <Dialog open={imageModalOpen} onClose={() => setImageModalOpen(false)} maxWidth="md" fullWidth>
              <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', bgcolor: 'black', p: 0 }}>
                <IconButton
                  sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'white', zIndex: 2 }}
                  onClick={() => setImageModalIndex((prev) => (prev > 0 ? prev - 1 : (post.media ? post.media.length - 1 : 0)))}
                  disabled={!post.media || post.media.length <= 1}
                >
                  {'<'}
                </IconButton>
                <img
                  src={post.media[imageModalIndex]?.url}
                  alt="Post Media"
                  style={{ maxHeight: '80vh', maxWidth: '100%', margin: 'auto', display: 'block' }}
                />
                <IconButton
                  sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'white', zIndex: 2 }}
                  onClick={() => setImageModalIndex((prev) => (prev < (post.media?.length ?? 0) - 1 ? prev + 1 : 0))}
                  disabled={post.media.length <= 1}
                >
                  {'>'}
                </IconButton>
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 2 }}
                  onClick={() => setImageModalOpen(false)}
                >
                  <CloseIcon />
                </IconButton>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Post Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Button
            startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
            onClick={() => onLike(post.id)}
            color={isLiked ? 'error' : 'inherit'}
            size="small"
            sx={{ color: isLiked ? 'error.main' : 'text.secondary' }}
          >
            {post.likes.length}
          </Button>
          <Button
            startIcon={<ChatBubbleOutline />}
            onClick={() => setShowComments(!showComments)}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
              {commentCount}
          </Button>
        </Box>

        {/* Comments Section */}
        {showComments && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.default',
              borderRadius: 1,
              p: 2,
            }}
          >
            {loadingComments ? (
              <CircularProgress size={20} sx={{ color: 'primary.main' }} />
            ) : (
              <>
                {comments.map((comment) => (
                  <Box key={comment.id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Avatar
                      src={getAvatarUrl(comment.authorId)}
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: 'secondary.main',
                        color: 'secondary.contrastText',
                      }}
                    >
                      {getInitials(comment.authorId)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {getDisplayName(comment.authorId)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {comment.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(comment.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </>
            )}

            {/* Add Comment */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Avatar
                src={getAvatarUrl(currentUserId || '')}
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                {currentUserName
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </Avatar>
              <TextField
                fullWidth
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                size="small"
                multiline
                maxRows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    '& fieldset': { borderColor: 'divider' },
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  },
                  '& .MuiInputBase-input::placeholder': { color: 'text.secondary', opacity: 1 },
                }}
              />
              <Button onClick={handleComment} disabled={!commentText.trim()} variant="contained" size="small" startIcon={<Send />}>
                Post
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export const Community: React.FC = () => {
  const [user] = useAuthState(auth);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Parse initial tab from URL parameter
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam === '1') return 1; // Group Feed
    if (tabParam === '2') return 2; // My Groups
    return 0; // Default to Public Feed
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab()); // 0=Public, 1=Group, 2=My Groups
  const [publicPosts, setPublicPosts] = useState<Post[]>([]);
  const [groupPosts, setGroupPosts] = useState<Post[]>([]); // For specific group in Group Feed tab
  const [allGroupPosts, setAllGroupPosts] = useState<Post[]>([]); // For My Groups tab
  
  // Get the current posts based on active tab - THIS PREVENTS RACE CONDITIONS
  const currentPosts = activeTab === 0 ? publicPosts : 
                      activeTab === 1 ? groupPosts : 
                      allGroupPosts;
  
  const [newPostDialog, setNewPostDialog] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserData>>(new Map());
  const [currentUserProfile, setCurrentUserProfile] = useState<UserData | null>(null);
  const [userGroups, setUserGroups] = useState<GroupData[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; postId: string | null }>({
    open: false,
    postId: null,
  });

  // Handle URL parameter changes for tab switching
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    let newTab = 0; // Default to Public Feed
    if (tabParam === '1') newTab = 1; // Group Feed
    if (tabParam === '2') newTab = 2; // My Groups
    
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [searchParams, activeTab]);

  // Load posts (on mount / tab change)
  useEffect(() => {
    const loadPosts = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let feedType: 'public' | 'group';
        let groupId: string | undefined;
        
        if (activeTab === 0) {
          feedType = 'public';
          groupId = undefined;
        } else if (activeTab === 1) {
          feedType = 'group';
          groupId = selectedGroupId; // Specific group for Group Feed
        } else {
          feedType = 'group';
          groupId = undefined; // All groups for My Groups tab
        }
        
        // Don't load group posts if no group is selected for Group Feed tab
        if (activeTab === 1 && !selectedGroupId) {
          setGroupPosts([]);
          setLoading(false);
          return;
        }
        
        const fetchedPosts = await communityService.getPosts(feedType, groupId);
        
        // Set posts to the correct state based on which tab is active
        if (activeTab === 0) {
          setPublicPosts(fetchedPosts);
        } else if (activeTab === 1) {
          setGroupPosts(fetchedPosts);
        } else if (activeTab === 2) {
          setAllGroupPosts(fetchedPosts);
        }

        // Load author profiles
        const authorIds = Array.from(new Set(fetchedPosts.map((p) => p.authorId)));
        // Merge new profiles into the existing userProfiles Map
        const newProfiles = new Map(userProfiles);
        await Promise.all(
          authorIds.map(async (authorId) => {
            if (!newProfiles.has(authorId)) {
              try {
                const profile = await userService.getUserProfile(authorId);
                if (profile) newProfiles.set(authorId, profile);
              } catch (e) {
                console.error(`Error loading profile for ${authorId}:`, e);
              }
            }
          }),
        );
        setUserProfiles(newProfiles);

        if (!currentUserProfile) {
          try {
            const up = await userService.getUserProfile(user.uid);
            setCurrentUserProfile(up);
          } catch (e) {
            console.error('Error loading current user profile:', e);
          }
        }
      } catch {
        setSnackbar({ open: true, message: 'Failed to load posts', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    void loadPosts();
  }, [activeTab, user, currentUserProfile, selectedGroupId]);

  // Load user groups when user logs in
  useEffect(() => {
    const loadUserGroups = async () => {
      if (!user) return;
      try {
        const groups = await groupService.getUserGroups(user.uid);
        // Filter out the "Public" group from group selection
        const filteredGroups = groups.filter(group => group.name.toLowerCase() !== 'public');
        setUserGroups(filteredGroups);
        // Set first available group as default, or empty if no groups
        if (filteredGroups.length > 0) {
          setSelectedGroupId(filteredGroups[0].id);
        }
      } catch (error) {
        console.error('Error loading user groups:', error);
      }
    };

    void loadUserGroups();
  }, [user]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Update URL to reflect tab change
    if (newValue === 0) {
      void navigate('/community', { replace: true }); // Public Feed - no tab parameter
    } else if (newValue === 1) {
      void navigate('/community?tab=1', { replace: true }); // Group Feed
    } else if (newValue === 2) {
      void navigate('/community?tab=2', { replace: true }); // My Groups
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      await communityService.likePost(postId, user.uid);
      // Refresh both states to ensure consistency
      const [updatedPublicPosts, updatedGroupPosts] = await Promise.all([
        communityService.getPosts('public'),
        selectedGroupId ? communityService.getPosts('group', selectedGroupId) : Promise.resolve([])
      ]);
      setPublicPosts(updatedPublicPosts);
      setGroupPosts(updatedGroupPosts);
    } catch {
      setSnackbar({ open: true, message: 'Failed to update like', severity: 'error' });
    }
  };

  const handleEdit = async (postId: string, newContent: string): Promise<void> => {
    if (!user) return;
    try {
      await communityService.updatePost(postId, newContent);
      // Refresh all states to ensure consistency
      const [updatedPublicPosts, updatedGroupPosts, updatedAllGroupPosts] = await Promise.all([
        communityService.getPosts('public'),
        selectedGroupId ? communityService.getPosts('group', selectedGroupId) : Promise.resolve([]),
        communityService.getPosts('group') // All group posts for My Groups tab
      ]);
      setPublicPosts(updatedPublicPosts);
      setGroupPosts(updatedGroupPosts);
      setAllGroupPosts(updatedAllGroupPosts);
      setSnackbar({ open: true, message: 'Post updated successfully!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to update post', severity: 'error' });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!user) return;
    try {
      await communityService.deletePost(postId);
      // Refresh all states to ensure consistency
      const [updatedPublicPosts, updatedGroupPosts, updatedAllGroupPosts] = await Promise.all([
        communityService.getPosts('public'),
        selectedGroupId ? communityService.getPosts('group', selectedGroupId) : Promise.resolve([]),
        communityService.getPosts('group') // All group posts for My Groups tab
      ]);
      setPublicPosts(updatedPublicPosts);
      setGroupPosts(updatedGroupPosts);
      setAllGroupPosts(updatedAllGroupPosts);
      setSnackbar({ open: true, message: 'Post deleted successfully!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete post', severity: 'error' });
    }
  };

  const handleComment = async (postId: string, commentContent: string) => {
    if (!user) return;
    try {
      await communityService.createComment(postId, user.uid, commentContent);
      setSnackbar({ open: true, message: 'Comment added successfully!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to add comment', severity: 'error' });
    }
  };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files ?? []).slice(0, 4); // limit to 4 images
    setFiles(f);
    setPreviews(f.map((file) => URL.createObjectURL(file)));
    setUploadProgress(new Array(f.length).fill(0));
  };

  const clearComposer = () => {
    setNewPostContent('');
    setFiles([]);
    setPreviews([]);
    setUploadProgress([]);
  };

  const handleCreatePost = async () => {
    if (!user) return;
    if (!newPostContent.trim() && files.length === 0) return;
    
    // Validate group selection for group posts
    if (activeTab === 1 && !selectedGroupId) {
      setSnackbar({ open: true, message: 'Please select a group to post to', severity: 'error' });
      return;
    }

    setUploading(true);
    try {
      const feedType = activeTab === 0 ? 'public' : 'group';
      const groupId = activeTab === 1 ? selectedGroupId : undefined;

      // Upload images in parallel and collect media descriptors
      const media =
        files.length > 0
          ? await Promise.all(
              files.map((f, idx) =>
                uploadPostImage(user.uid, /* postId path key */ crypto.randomUUID(), f, (pct) => {
                  setUploadProgress((prev) => {
                    const next = [...prev];
                    next[idx] = pct;
                    return next;
                  });
                }),
              ),
            )
          : [];

      await communityService.createPost(user.uid, newPostContent, feedType, groupId, media);

      clearComposer();
      setNewPostDialog(false);

      // Refresh both states to ensure consistency
      const [updatedPublicPosts, updatedGroupPosts] = await Promise.all([
        communityService.getPosts('public'),
        selectedGroupId ? communityService.getPosts('group', selectedGroupId) : Promise.resolve([])
      ]);
      setPublicPosts(updatedPublicPosts);
      setGroupPosts(updatedGroupPosts);
      setSnackbar({ open: true, message: 'Post created successfully!', severity: 'success' });
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: 'Failed to create post', severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Alert
          severity="info"
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiAlert-icon': { color: 'info.main' },
          }}
        >
          Please log in to access the community features.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 0, px: 0, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              color: 'text.secondary',
              minHeight: 44,
              '&.Mui-selected': { color: 'primary.main' },
            },
            '& .MuiTabs-indicator': { backgroundColor: 'primary.main' },
          }}
        >
          <Tab icon={<Public />} label="Public Feed" iconPosition="start" />
          <Tab icon={<Group />} label="Group Feed" iconPosition="start" />
          <Tab icon={<GroupsIcon />} label="My Groups" iconPosition="start" />
        </Tabs>

        {/* PUBLIC FEED */}
        <TabPanel value={activeTab} index={0}>
          {/* Composer trigger on mobile, dialog button on desktop */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              Public Community
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setNewPostDialog(true)}>
              New Post
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: 'primary.main' }} />
            </Box>
          ) : currentPosts.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No public posts yet. Be the first to share something!
            </Typography>
          ) : (
            currentPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={(postId) => {
                  void handleLike(postId);
                }}
                onComment={(postId, content) => {
                  void handleComment(postId, content);
                }}
                onEdit={(postId, newContent) => {
                  void handleEdit(postId, newContent);
                }}
                onDelete={(postId) => {
                  void handleDelete(postId);
                }}
                setDeleteConfirmation={setDeleteConfirmation}
                currentUserId={user?.uid}
                currentUserName={currentUserProfile?.displayName || user?.displayName || undefined}
                currentUserAvatar={currentUserProfile?.avatar || user?.photoURL || undefined}
                authorProfile={userProfiles.get(post.authorId)}
                userProfiles={userProfiles}
              />
            ))
          )}
        </TabPanel>

        {/* GROUP FEED */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              Group Posts
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => setNewPostDialog(true)}
              disabled={userGroups.length === 0 || !selectedGroupId}
            >
              New Post
            </Button>
          </Box>

          {/* Group Selection */}
          {userGroups.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="group-select-label">Select Group</InputLabel>
                <Select
                  labelId="group-select-label"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  label="Select Group"
                >
                  {userGroups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: 'primary.main' }} />
            </Box>
          ) : userGroups.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              You&apos;re not a member of any groups yet. Join a group to see group posts!
            </Typography>
          ) : !selectedGroupId ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Select a group above to view and share posts with group members.
            </Typography>
          ) : currentPosts.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No posts in {userGroups.find(g => g.id === selectedGroupId)?.name || 'this group'} yet. Be the first to share something!
            </Typography>
          ) : (
            <>
              {currentPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={(postId) => {
                    void handleLike(postId);
                  }}
                  onComment={(postId, content) => {
                    void handleComment(postId, content);
                  }}
                  onEdit={(postId, newContent) => {
                    void handleEdit(postId, newContent);
                  }}
                  onDelete={(postId) => {
                    void handleDelete(postId);
                  }}
                  setDeleteConfirmation={setDeleteConfirmation}
                  currentUserId={user?.uid}
                  currentUserName={currentUserProfile?.displayName || user?.displayName || undefined}
                  currentUserAvatar={currentUserProfile?.avatar || user?.photoURL || undefined}
                  authorProfile={userProfiles.get(post.authorId)}
                  userProfiles={userProfiles}
                />
              ))}
            </>
          )}
        </TabPanel>

        {/* GROUPS MANAGEMENT */}
        <TabPanel value={activeTab} index={2}>
          <GroupsManager currentUserId={user.uid} currentUserName={currentUserProfile?.displayName || user?.displayName || undefined} />
        </TabPanel>
      {/* New Post Dialog (with images) */}
      <Dialog
        open={newPostDialog}
        onClose={() => setNewPostDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <DialogTitle sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {activeTab === 0 
            ? 'Create New Post' 
            : `Post to ${userGroups.find(g => g.id === selectedGroupId)?.name || 'Group'}`
          }
          <IconButton size="small" onClick={() => setNewPostDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder={
              activeTab === 0 
                ? "What's on your mind? Share with the public community..." 
                : `Share something with ${userGroups.find(g => g.id === selectedGroupId)?.name || 'your group'}...`
            }
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.default',
                color: 'text.primary',
                '& fieldset': { borderColor: 'divider' },
                '&:hover fieldset': { borderColor: 'primary.main' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
              },
              '& .MuiInputBase-input::placeholder': { color: 'text.secondary', opacity: 1 },
            }}
          />

          {/* Image picker + previews */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="outlined" component="label" startIcon={<ImageIcon />}>
              Add Images
              <input hidden accept="image/*" multiple type="file" onChange={onPickFiles} />
            </Button>
            {!!files.length && (
              <Typography variant="caption" color="text.secondary">
                {files.length} image{files.length > 1 ? 's' : ''} selected
              </Typography>
            )}
          </Box>

          {previews.length > 0 && (
            <Box
              sx={{
                mt: 1.5,
                display: 'grid',
                gap: 1,
                gridTemplateColumns: {
                  xs: previews.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                  sm: previews.length >= 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                },
              }}
            >
              {previews.map((src, i) => (
                <Box
                  key={i}
                  sx={{
                    position: 'relative',
                    pt: '100%',
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  {uploading && (
                    <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
                      <LinearProgress variant="determinate" value={uploadProgress[i] || 0} />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'background.paper' }}>
          <Button
            onClick={() => {
              clearComposer();
              setNewPostDialog(false);
            }}
            sx={{ color: 'text.secondary' }}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button onClick={() => void handleCreatePost()} variant="contained" disabled={uploading || (!newPostContent.trim() && files.length === 0)}>
            {uploading ? 'Posting…' : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, postId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete Post
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmation({ open: false, postId: null })}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (deleteConfirmation.postId) {
                void handleDelete(deleteConfirmation.postId);
              }
              setDeleteConfirmation({ open: false, postId: null });
            }}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Community;
