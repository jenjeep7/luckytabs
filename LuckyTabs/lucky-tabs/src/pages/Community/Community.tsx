import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
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
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  authorProfile?: UserData;
}

function PostCard({
  post,
  onLike,
  onComment,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  authorProfile,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCount, setCommentCount] = useState<number>(0);

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
    if (authorProfile && authorProfile.uid === authorId) return authorProfile.displayName;
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
    if (authorProfile && authorProfile.uid === authorId) {
      if (authorProfile.firstName && authorProfile.lastName) {
        return (authorProfile.firstName[0] + authorProfile.lastName[0]).toUpperCase();
      }
      return authorProfile.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return authorId.slice(0, 2).toUpperCase();
  };

  const getAvatarUrl = (authorId: string) => {
    if (authorId === currentUserId) return currentUserAvatar;
    if (authorProfile && authorProfile.uid === authorId) return authorProfile.avatar;
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
          {/* <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <MoreVert />
          </IconButton> */}
        </Box>

        {/* Post Text */}
        {post.content && (
          <Typography variant="body1" sx={{ mb: post.media?.length ? 1 : 2, whiteSpace: 'pre-wrap', color: 'text.primary' }}>
            {post.content}
          </Typography>
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
  const [activeTab, setActiveTab] = useState(0); // 0=Public, 1=Group, 2=My Groups
  const [posts, setPosts] = useState<Post[]>([]);
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

  // Load posts (on mount / tab change)
  useEffect(() => {
    const loadPosts = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const feedType = activeTab === 0 ? 'public' : 'group';
        const groupId = activeTab === 1 ? selectedGroupId : undefined;
        
        // Don't load group posts if no group is selected
        if (activeTab === 1 && !selectedGroupId) {
          setPosts([]);
          setLoading(false);
          return;
        }
        
        const fetchedPosts = await communityService.getPosts(feedType, groupId);
        setPosts(fetchedPosts);

        // Load author profiles
        const authorIds = Array.from(new Set(fetchedPosts.map((p) => p.authorId)));
        const profiles = new Map<string, UserData>();
        await Promise.all(
          authorIds.map(async (authorId) => {
            try {
              const profile = await userService.getUserProfile(authorId);
              if (profile) profiles.set(authorId, profile);
            } catch (e) {
              console.error(`Error loading profile for ${authorId}:`, e);
            }
          }),
        );
        setUserProfiles(profiles);

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
    // Clear posts immediately when switching tabs to prevent showing wrong posts
    setPosts([]);
    setActiveTab(newValue);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      await communityService.likePost(postId, user.uid);
      const feedType = activeTab === 0 ? 'public' : 'group';
      const groupId = activeTab === 1 ? selectedGroupId : undefined;
      const updated = await communityService.getPosts(feedType, groupId);
      setPosts(updated);
    } catch {
      setSnackbar({ open: true, message: 'Failed to update like', severity: 'error' });
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

      const updated = await communityService.getPosts(feedType, groupId);
      setPosts(updated);
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
    <Container maxWidth="md" sx={{ py: 2, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 2.5, fontWeight: 600, color: 'text.primary' }}>
        Community
      </Typography>

      <Paper
        sx={{
          mb: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme) => (theme.palette.mode === 'dark' ? 'none' : 1),
        }}
      >
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
          ) : posts.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No public posts yet. Be the first to share something!
            </Typography>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={(postId) => {
                  void handleLike(postId);
                }}
                onComment={(postId, content) => {
                  void handleComment(postId, content);
                }}
                currentUserId={user?.uid}
                currentUserName={currentUserProfile?.displayName || user?.displayName || undefined}
                currentUserAvatar={currentUserProfile?.avatar || user?.photoURL || undefined}
                authorProfile={userProfiles.get(post.authorId)}
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
          ) : posts.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No posts in {userGroups.find(g => g.id === selectedGroupId)?.name || 'this group'} yet. Be the first to share something!
            </Typography>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={(postId) => {
                    void handleLike(postId);
                  }}
                  onComment={(postId, content) => {
                    void handleComment(postId, content);
                  }}
                  currentUserId={user?.uid}
                  currentUserName={currentUserProfile?.displayName || user?.displayName || undefined}
                  currentUserAvatar={currentUserProfile?.avatar || user?.photoURL || undefined}
                  authorProfile={userProfiles.get(post.authorId)}
                />
              ))}
            </>
          )}
        </TabPanel>

        {/* GROUPS MANAGEMENT */}
        <TabPanel value={activeTab} index={2}>
          <GroupsManager currentUserId={user.uid} currentUserName={currentUserProfile?.displayName || user?.displayName || undefined} />
        </TabPanel>
      </Paper>

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
