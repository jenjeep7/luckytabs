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
  Snackbar
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Share,
  MoreVert,
  Send,
  Public,
  Group,
  Add,
  Groups as GroupsIcon
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { communityService, Post, Comment } from '../../services/communityService';
import { userService, UserData } from '../../services/userService';
import { GroupsManager } from '../GroupManager/GroupsManager';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`community-tabpanel-${index}`}
      aria-labelledby={`community-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
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

function PostCard({ post, onLike, onComment, currentUserId, currentUserName, currentUserAvatar, authorProfile }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Load comments when showComments is toggled
  useEffect(() => {
    if (showComments) {
      setLoadingComments(true);
      communityService.getComments(post.id)
        .then(setComments)
        .catch(console.error)
        .finally(() => setLoadingComments(false));
    }
  }, [showComments, post.id]);

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
      // Reload comments after adding new one
      if (showComments) {
        communityService.getComments(post.id)
          .then(setComments)
          .catch(console.error);
      }
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
    if (authorId === currentUserId) {
      return currentUserName || 'You';
    }
    if (authorProfile && authorProfile.uid === authorId) {
      return authorProfile.displayName;
    }
    // Fallback for when profile isn't loaded yet
    return `User ${authorId.slice(0, 8)}`;
  };

  const getInitials = (authorId: string) => {
    if (authorId === currentUserId && currentUserName) {
      return currentUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (authorProfile && authorProfile.uid === authorId) {
      if (authorProfile.firstName && authorProfile.lastName) {
        return (authorProfile.firstName[0] + authorProfile.lastName[0]).toUpperCase();
      }
      return authorProfile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return authorId.slice(0, 2).toUpperCase();
  };

  const getAvatarUrl = (authorId: string) => {
    if (authorId === currentUserId) {
      return currentUserAvatar;
    }
    if (authorProfile && authorProfile.uid === authorId) {
      return authorProfile.avatar;
    }
    return undefined;
  };

  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Post Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={getAvatarUrl(post.authorId)}
            sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}
          >
            {getInitials(post.authorId)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {getDisplayName(post.authorId)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formatTime(post.timestamp)}
              </Typography>
              <Chip 
                icon={post.type === 'public' ? <Public /> : <Group />}
                label={post.type === 'public' ? 'Public' : 'Group'}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            </Box>
          </Box>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>

        {/* Post Content */}
        <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
          {post.content}
        </Typography>

        {/* Post Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Button
            startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
            onClick={() => onLike(post.id)}
            color={isLiked ? 'error' : 'inherit'}
            size="small"
          >
            {post.likes.length}
          </Button>
          <Button
            startIcon={<ChatBubbleOutline />}
            onClick={() => setShowComments(!showComments)}
            size="small"
          >
            {comments.length}
          </Button>
          <Button startIcon={<Share />} size="small">
            Share
          </Button>
        </Box>

        {/* Comments Section */}
        {showComments && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            {/* Loading Comments */}
            {loadingComments ? (
              <CircularProgress size={20} />
            ) : (
              <>
                {/* Existing Comments */}
                {comments.map((comment) => (
                  <Box key={comment.id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Avatar 
                      src={getAvatarUrl(comment.authorId)}
                      sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}
                    >
                      {getInitials(comment.authorId)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {getDisplayName(comment.authorId)}
                      </Typography>
                      <Typography variant="body2">
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
                sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}
              >
                {getInitials(currentUserId || '')}
              </Avatar>
              <TextField
                fullWidth
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                size="small"
                multiline
                maxRows={3}
              />
              <Button 
                onClick={handleComment}
                disabled={!commentText.trim()}
                variant="contained"
                size="small"
                startIcon={<Send />}
              >
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
  const [activeTab, setActiveTab] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostDialog, setNewPostDialog] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserData>>(new Map());
  const [currentUserProfile, setCurrentUserProfile] = useState<UserData | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load posts when component mounts or tab changes
  useEffect(() => {
    const loadPosts = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const feedType = activeTab === 0 ? 'public' : 'group';
        const fetchedPosts = await communityService.getPosts(feedType);
        setPosts(fetchedPosts);

        // Load user profiles for post authors
        const authorIds = Array.from(new Set(fetchedPosts.map(post => post.authorId)));
        const profiles = new Map<string, UserData>();
        
        await Promise.all(
          authorIds.map(async (authorId: string) => {
            try {
              const profile = await userService.getUserProfile(authorId);
              if (profile) {
                profiles.set(authorId, profile);
              }
            } catch (error) {
              console.error(`Error loading profile for user ${authorId}:`, error);
            }
          })
        );
        
        setUserProfiles(profiles);

        // Load current user profile if not already loaded
        if (!currentUserProfile) {
          try {
            const userProfile = await userService.getUserProfile(user.uid);
            setCurrentUserProfile(userProfile);
          } catch (error) {
            console.error('Error loading current user profile:', error);
          }
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to load posts',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    void loadPosts();
  }, [activeTab, user, currentUserProfile]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    try {
      await communityService.likePost(postId, user.uid);
      // Reload posts to get updated likes
      const feedType = activeTab === 0 ? 'public' : 'group';
      const updatedPosts = await communityService.getPosts(feedType);
      setPosts(updatedPosts);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update like',
        severity: 'error'
      });
    }
  };

  const handleComment = async (postId: string, commentContent: string) => {
    if (!user) return;
    
    try {
      await communityService.createComment(postId, user.uid, commentContent);
      setSnackbar({
        open: true,
        message: 'Comment added successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to add comment',
        severity: 'error'
      });
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return;

    try {
      const feedType = activeTab === 0 ? 'public' : 'group';
      await communityService.createPost(user.uid, newPostContent, feedType);
      
      setNewPostContent('');
      setNewPostDialog(false);
      
      // Reload posts to show the new one
      const updatedPosts = await communityService.getPosts(feedType);
      setPosts(updatedPosts);
      
      setSnackbar({
        open: true,
        message: 'Post created successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to create post',
        severity: 'error'
      });
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          Please log in to access the community features.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Community
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<Public />} 
            label="Public Feed" 
            iconPosition="start"
          />
          <Tab 
            icon={<Group />} 
            label="Group Feed" 
            iconPosition="start"
          />
          <Tab 
            icon={<GroupsIcon />} 
            label="My Groups" 
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          {/* Public Feed Content */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Public Community</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setNewPostDialog(true)}
            >
              New Post
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
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
                onLike={(postId) => { void handleLike(postId); }}
                onComment={(postId, content) => { void handleComment(postId, content); }}
                currentUserId={user?.uid}
                currentUserName={currentUserProfile?.displayName || user?.displayName || undefined}
                currentUserAvatar={currentUserProfile?.avatar || user?.photoURL || undefined}
                authorProfile={userProfiles.get(post.authorId)}
              />
            ))
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Group Feed Content */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Group Posts</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setNewPostDialog(true)}
            >
              New Post
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : posts.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No group posts yet. Share something with your group!
            </Typography>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={(postId) => { void handleLike(postId); }}
                onComment={(postId, content) => { void handleComment(postId, content); }}
                currentUserId={user?.uid}
                currentUserName={currentUserProfile?.displayName || user?.displayName || undefined}
                currentUserAvatar={currentUserProfile?.avatar || user?.photoURL || undefined}
                authorProfile={userProfiles.get(post.authorId)}
              />
            ))
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Groups Management */}
          <GroupsManager 
            currentUserId={user.uid}
            currentUserName={currentUserProfile?.displayName || user?.displayName || undefined}
          />
        </TabPanel>
      </Paper>

      {/* New Post Dialog */}
      <Dialog
        open={newPostDialog}
        onClose={() => setNewPostDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Create New Post
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder={`What's on your mind? Share with the ${activeTab === 0 ? 'public' : 'group'} community...`}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewPostDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => { void handleCreatePost(); }}
            variant="contained"
            disabled={!newPostContent.trim()}
          >
            Post
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

export default Community;
