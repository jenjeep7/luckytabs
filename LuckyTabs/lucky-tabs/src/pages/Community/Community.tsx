import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStateCompat } from '../../services/useAuthStateCompat';
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
  Close as CloseIcon,
  MoreVert,
  Edit,
  Delete,
} from '@mui/icons-material';

import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { communityService, Post, Comment } from '../../services/communityService';
import { userService, UserData } from '../../services/userService';
import { groupService, GroupData } from '../../services/groupService';
import { GroupsManager } from '../GroupManager/GroupsManager';
import { NewPostDialog } from './NewPostDialog';
import { 
  formatTime, 
  getInitialsFromName, 
  parseTabFromUrl, 
  getFallbackUserDisplay, 
  getInitialsFromUserId 
} from './helpers';

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
  currentUserProfile?: UserData | null;
  isPublicFeed?: boolean;
  onUpdateUserProfiles?: (profiles: Map<string, UserData>) => void;
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
  currentUserProfile,
  isPublicFeed = false,
  onUpdateUserProfiles: _onUpdateUserProfiles,
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
    communityService.getCommentsSimple(post.id)
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
      communityService.getCommentsSimple(post.id)
        .then((list) => {
          setComments(list);
          setCommentCount(list.length);
        })
        .catch(console.error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await communityService.deleteComment(commentId);
      // Refresh comments
      if (showComments) {
        const updatedComments = await communityService.getCommentsSimple(post.id);
        setComments(updatedComments);
        setCommentCount(updatedComments.length);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const getDisplayName = (authorId: string) => {
    if (authorId === currentUserId) return currentUserName || 'You';
    
    // First check the specific authorProfile prop
    if (authorProfile && authorProfile.uid === authorId) {
      if (authorProfile.displayName && authorProfile.displayName.trim()) {
        return authorProfile.displayName;
      }
    }
    
    // Then check the userProfiles Map for any loaded user profile
    const userProfile = userProfiles?.get(authorId);
    if (userProfile) {
      if (userProfile.displayName && userProfile.displayName.trim()) {
        return userProfile.displayName;
      }
    }
    
    // Fallback to a cleaner user ID display
    return getFallbackUserDisplay(authorId);
  };

  const getInitials = (authorId: string) => {
    if (authorId === currentUserId && currentUserName) {
      return getInitialsFromName(currentUserName);
    }
    
    // First check the specific authorProfile prop
    if (authorProfile && authorProfile.uid === authorId) {
      if (authorProfile.displayName) {
        return getInitialsFromName(authorProfile.displayName);
      }
    }
    
    // Then check the userProfiles Map
    const userProfile = userProfiles?.get(authorId);
    if (userProfile) {
      if (userProfile.displayName) {
        return getInitialsFromName(userProfile.displayName);
      }
    }
    
    return getInitialsFromUserId(authorId);
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
  const isPostAuthor = currentUserId === post.authorId;
  const isAdmin = currentUserProfile?.isAdmin || false;
  const canModerate = isPostAuthor || (isAdmin && isPublicFeed);

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
          {/* Three dots menu - show for post authors or admins (on public feed) */}
          {canModerate && (
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
                {/* Edit option - only for post authors */}
                {isPostAuthor && (
                  <MenuItem onClick={() => {
                    setIsEditing(true);
                    setMenuAnchor(null);
                  }}>
                    <Edit sx={{ mr: 1, fontSize: 20 }} />
                    Edit Post
                  </MenuItem>
                )}
                {/* Delete option - for authors and admins */}
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
                  {isAdmin && !isPostAuthor ? 'Remove Post (Admin)' : 'Delete Post'}
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
                      {comment.authorDisplayName?.charAt(0).toUpperCase() || '?'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {comment.authorDisplayName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {comment.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(comment.timestamp)}
                      </Typography>
                    </Box>
                    {/* Admin delete for comments on public feed */}
                    {isAdmin && isPublicFeed && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => void handleDeleteComment(comment.id)}
                        sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
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
              <IconButton 
                onClick={handleComment} 
                disabled={!commentText.trim()} 
                color="primary"
                size="small"
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export const Community: React.FC = () => {
  const [user] = useAuthStateCompat();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Parse initial tab from URL parameter - memoized to prevent recalculation
  const initialTab = React.useMemo(() => {
    return parseTabFromUrl(searchParams);
  }, [searchParams]);
  
  const [activeTab, setActiveTab] = useState(initialTab); // 0=Public, 1=Group, 2=My Groups
  const [publicPosts, setPublicPosts] = useState<Post[]>([]);
  const [groupPosts, setGroupPosts] = useState<Post[]>([]); // For specific group in Group Feed tab
  const [allGroupPosts, setAllGroupPosts] = useState<Post[]>([]); // For My Groups tab
  
  // Pagination state
  const [publicLastDoc, setPublicLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [groupLastDoc, setGroupLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [allGroupLastDoc, setAllGroupLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [publicHasMore, setPublicHasMore] = useState(true);
  const [groupHasMore, setGroupHasMore] = useState(true);
  const [allGroupHasMore, setAllGroupHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Get the current posts based on active tab - memoized to prevent recalculation
  const currentPosts = React.useMemo(() => {
    return activeTab === 0 ? publicPosts : 
           activeTab === 1 ? groupPosts : 
           allGroupPosts;
  }, [activeTab, publicPosts, groupPosts, allGroupPosts]);
  
  const [newPostDialog, setNewPostDialog] = useState(false);
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

  // Callback to update user profiles from PostCard components
  const handleUpdateUserProfiles = useCallback((newProfiles: Map<string, UserData>) => {
    setUserProfiles(newProfiles);
  }, []);

  // Load current user profile once
  useEffect(() => {
    const loadCurrentUserProfile = async () => {
      if (!user || currentUserProfile) return;
      try {
        if (!user || typeof user !== 'object' || !('uid' in user)) return;
        const up = await userService.getUserProfile((user as { uid: string }).uid);
        setCurrentUserProfile(up);
      } catch (e) {
        console.error('Error loading current user profile:', e);
      }
    };

    void loadCurrentUserProfile();
  }, [user, currentUserProfile]);

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
        
        const result = await communityService.getPosts(feedType, groupId); // Use default page size from service
        
        // Set posts to the correct state based on which tab is active
        if (activeTab === 0) {
          setPublicPosts(result.posts);
          setPublicLastDoc(result.lastDoc);
          setPublicHasMore(result.hasMore);
        } else if (activeTab === 1) {
          setGroupPosts(result.posts);
          setGroupLastDoc(result.lastDoc);
          setGroupHasMore(result.hasMore);
        } else if (activeTab === 2) {
          setAllGroupPosts(result.posts);
          setAllGroupLastDoc(result.lastDoc);
          setAllGroupHasMore(result.hasMore);
        }

        // Load author profiles
        const authorIds = Array.from(new Set(result.posts.map((p) => p.authorId)));
        const profilePromises = authorIds.map(async (authorId) => {
          try {
            const profile = await userService.getUserProfile(authorId);
            return profile ? [authorId, profile] as const : null;
          } catch (e) {
            console.error(`Error loading profile for ${authorId}:`, e);
            return null;
          }
        });
        
        const profileResults = await Promise.all(profilePromises);
        setUserProfiles((currentProfiles) => {
          const newProfiles = new Map(currentProfiles);
          profileResults.forEach((result) => {
            if (result) {
              const [authorId, profile] = result;
              if (!newProfiles.has(authorId)) {
                newProfiles.set(authorId, profile);
              }
            }
          });
          return newProfiles;
        });

      } catch {
        setSnackbar({ open: true, message: 'Failed to load posts', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    void loadPosts();
  }, [activeTab, user, selectedGroupId]); // Removed currentUserProfile dependency

  // Load More functions for pagination
  const loadMorePosts = async () => {
    if (!user || loadingMore) return;
    
    const lastDoc = activeTab === 0 ? publicLastDoc : 
                   activeTab === 1 ? groupLastDoc : 
                   allGroupLastDoc;
    
    const hasMore = activeTab === 0 ? publicHasMore : 
                   activeTab === 1 ? groupHasMore : 
                   allGroupHasMore;
    
    if (!hasMore || !lastDoc) return;
    
    setLoadingMore(true);
    try {
      let feedType: 'public' | 'group';
      let groupId: string | undefined;
      
      if (activeTab === 0) {
        feedType = 'public';
        groupId = undefined;
      } else if (activeTab === 1) {
        feedType = 'group';
        groupId = selectedGroupId;
      } else {
        feedType = 'group';
        groupId = undefined;
      }
      
      const result = await communityService.getPosts(feedType, groupId, 10, lastDoc);
      
      // Append new posts to existing posts
      if (activeTab === 0) {
        setPublicPosts(prev => [...prev, ...result.posts]);
        setPublicLastDoc(result.lastDoc);
        setPublicHasMore(result.hasMore);
      } else if (activeTab === 1) {
        setGroupPosts(prev => [...prev, ...result.posts]);
        setGroupLastDoc(result.lastDoc);
        setGroupHasMore(result.hasMore);
      } else if (activeTab === 2) {
        setAllGroupPosts(prev => [...prev, ...result.posts]);
        setAllGroupLastDoc(result.lastDoc);
        setAllGroupHasMore(result.hasMore);
      }
      
      // Load author profiles for new posts
      const newAuthorIds = Array.from(new Set(result.posts.map((p) => p.authorId)));
      const profilePromises = newAuthorIds
        .filter(authorId => !userProfiles.has(authorId)) // Only load profiles we don't have
        .map(async (authorId) => {
          try {
            const profile = await userService.getUserProfile(authorId);
            return profile ? [authorId, profile] as const : null;
          } catch (e) {
            console.error(`Error loading profile for ${authorId}:`, e);
            return null;
          }
        });
        
      const profileResults = await Promise.all(profilePromises);
      setUserProfiles((currentProfiles) => {
        const newProfiles = new Map(currentProfiles);
        profileResults.forEach((result) => {
          if (result) {
            const [authorId, profile] = result;
            newProfiles.set(authorId, profile);
          }
        });
        return newProfiles;
      });
      
    } catch (error) {
      console.error('Error loading more posts:', error);
      setSnackbar({ open: true, message: 'Failed to load more posts', severity: 'error' });
    } finally {
      setLoadingMore(false);
    }
  };

  // Load user groups when user logs in
  useEffect(() => {
    const loadUserGroups = async () => {
      if (!user) return;
      try {
  if (!user || typeof user !== 'object' || !('uid' in user)) return;
  const groups = await groupService.getUserGroups((user as { uid: string }).uid);
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
    // Prevent unnecessary state updates
    if (newValue === activeTab) return;
    
    setActiveTab(newValue);
    
    // Update URL to reflect tab change
    const path = newValue === 0 ? '/community' : `/community?tab=${newValue}`;
    void navigate(path, { replace: true });
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
  if (!user || typeof user !== 'object' || !('uid' in user)) return;
  await communityService.likePost(postId, (user as { uid: string }).uid);
      // Refresh both states to ensure consistency
      const [updatedPublicPosts, updatedGroupPosts] = await Promise.all([
        communityService.getPostsSimple('public'),
        selectedGroupId ? communityService.getPostsSimple('group', selectedGroupId) : Promise.resolve([])
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
        communityService.getPostsSimple('public'),
        selectedGroupId ? communityService.getPostsSimple('group', selectedGroupId) : Promise.resolve([]),
        communityService.getPostsSimple('group') // All group posts for My Groups tab
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
        communityService.getPostsSimple('public'),
        selectedGroupId ? communityService.getPostsSimple('group', selectedGroupId) : Promise.resolve([]),
        communityService.getPostsSimple('group') // All group posts for My Groups tab
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
      if (!user || typeof user !== 'object' || !('uid' in user)) return;
      
      // Determine the current user's display name - only use displayName now
      let authorDisplayName = currentUserProfile?.displayName || (user && typeof user === 'object' && 'displayName' in user ? (user as { displayName?: string }).displayName : undefined);
      
      // Simple fallback if no display name is available
      if (!authorDisplayName || !authorDisplayName.trim()) {
        authorDisplayName = 'User'; // Final fallback
      }
      
      await communityService.createComment(postId, (user as { uid: string }).uid, authorDisplayName, commentContent);
      setSnackbar({ open: true, message: 'Comment added successfully!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to add comment', severity: 'error' });
    }
  };

  // Callback for when a new post is created
  const handlePostCreated = async () => {
    // Refresh both states to ensure consistency
    const [updatedPublicPosts, updatedGroupPosts] = await Promise.all([
      communityService.getPostsSimple('public'),
      selectedGroupId ? communityService.getPostsSimple('group', selectedGroupId) : Promise.resolve([])
    ]);
    setPublicPosts(updatedPublicPosts);
    setGroupPosts(updatedGroupPosts);
  };

  // Callback to show snackbar messages
  const handleShowSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
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
          <Tab icon={<Group />} label="Crew Feed" iconPosition="start" />
          <Tab icon={<GroupsIcon />} label="My Crews" iconPosition="start" />
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
                currentUserId={user && typeof user === 'object' && 'uid' in user ? (user as { uid: string }).uid : undefined}
                currentUserName={currentUserProfile?.displayName || (user && typeof user === 'object' && 'displayName' in user ? (user as { displayName?: string }).displayName : undefined)}
                currentUserAvatar={currentUserProfile?.avatar || (user && typeof user === 'object' && 'photoURL' in user ? (user as { photoURL?: string }).photoURL : undefined)}
                authorProfile={userProfiles.get(post.authorId)}
                userProfiles={userProfiles}
                currentUserProfile={currentUserProfile}
                isPublicFeed={true}
                onUpdateUserProfiles={handleUpdateUserProfiles}
              />
            ))
          )}
          
          {/* Load More Button for Public Posts */}
          {!loading && currentPosts.length > 0 && activeTab === 0 && publicHasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => { void loadMorePosts(); }}
                disabled={loadingMore}
                sx={{
                  minWidth: '200px',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.light',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  }
                }}
              >
                {loadingMore ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading...
                  </>
                ) : (
                  'Load More Posts'
                )}
              </Button>
            </Box>
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
                  currentUserProfile={currentUserProfile}
                  isPublicFeed={false}
                  onUpdateUserProfiles={handleUpdateUserProfiles}
                />
              ))}
            </>
          )}
          
          {/* Load More Button for Group Posts */}
          {!loading && currentPosts.length > 0 && activeTab === 1 && selectedGroupId && groupHasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => { void loadMorePosts(); }}
                disabled={loadingMore}
                sx={{
                  minWidth: '200px',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.light',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  }
                }}
              >
                {loadingMore ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading...
                  </>
                ) : (
                  'Load More Posts'
                )}
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* GROUPS MANAGEMENT */}
        <TabPanel value={activeTab} index={2}>
          <GroupsManager
            currentUserId={user && typeof user === 'object' && 'uid' in user ? (user as { uid: string }).uid : ''}
            currentUserName={currentUserProfile?.displayName || (user && typeof user === 'object' && 'displayName' in user ? (user as { displayName?: string }).displayName : undefined)}
          />
        </TabPanel>
      
      {/* New Post Dialog Component */}
      <NewPostDialog
        open={newPostDialog}
        onClose={() => setNewPostDialog(false)}
        activeTab={activeTab}
        userGroups={userGroups}
        selectedGroupId={selectedGroupId}
        userId={user && typeof user === 'object' && 'uid' in user ? (user as { uid: string }).uid : ''}
        onPostCreated={() => { void handlePostCreated(); }}
        onShowSnackbar={handleShowSnackbar}
      />

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
