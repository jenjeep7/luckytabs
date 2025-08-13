import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { communityService, Post, Comment, User as UserProfile } from '../services/communityService';

export const useCommunity = (currentUser: User | null) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profiles for posts
  const fetchUserProfiles = async (userIds: string[]) => {
    try {
      const profiles = await communityService.getUserProfiles(userIds);
      const profileMap = new Map(userProfiles);
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
      setUserProfiles(profileMap);
    } catch (err) {
      console.error('Error fetching user profiles:', err);
    }
  };

  // Load posts for a specific feed type
  const loadPosts = async (type: 'public' | 'group', groupId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedPosts = await communityService.getPosts(type, groupId);
      setPosts(fetchedPosts);
      
      // Fetch user profiles for post authors
      const authorIds = Array.from(new Set(fetchedPosts.map(post => post.authorId)));
      if (authorIds.length > 0) {
        await fetchUserProfiles(authorIds);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (content: string, type: 'public' | 'group', groupId?: string) => {
    if (!currentUser) {
      throw new Error('User must be logged in to create posts');
    }

    try {
      await communityService.createPost(currentUser.uid, content, type, groupId);
      // Reload posts to get the updated list
      await loadPosts(type, groupId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      throw err;
    }
  };

  // Like/unlike a post
  const toggleLike = async (postId: string) => {
    if (!currentUser) {
      throw new Error('User must be logged in to like posts');
    }

    try {
      await communityService.likePost(postId, currentUser.uid);
      
      // Update local state immediately for better UX
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const isLiked = post.likes.includes(currentUser.uid);
            return {
              ...post,
              likes: isLiked 
                ? post.likes.filter(id => id !== currentUser.uid)
                : [...post.likes, currentUser.uid]
            };
          }
          return post;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update like');
      throw err;
    }
  };

  // Delete a post
  const deletePost = async (postId: string) => {
    if (!currentUser) {
      throw new Error('User must be logged in to delete posts');
    }

    try {
      await communityService.deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      throw err;
    }
  };

  return {
    posts,
    userProfiles,
    loading,
    error,
    loadPosts,
    createPost,
    toggleLike,
    deletePost,
    setError: (error: string | null) => setError(error)
  };
};

export const useComments = (postId: string, currentUser: User | null) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load comments for a post
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedComments = await communityService.getComments(postId);
      setComments(fetchedComments);
      
      // Fetch user profiles for comment authors
      const authorIds = Array.from(new Set(fetchedComments.map(comment => comment.authorId)));
      if (authorIds.length > 0) {
        const profiles = await communityService.getUserProfiles(authorIds);
        const profileMap = new Map();
        profiles.forEach(profile => {
          profileMap.set(profile.id, profile);
        });
        setUserProfiles(profileMap);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Create a new comment
  const createComment = async (content: string) => {
    if (!currentUser) {
      throw new Error('User must be logged in to comment');
    }

    try {
      await communityService.createComment(postId, currentUser.uid, content);
      await loadComments(); // Reload comments
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create comment');
      throw err;
    }
  };

  // Delete a comment
  const deleteComment = async (commentId: string) => {
    if (!currentUser) {
      throw new Error('User must be logged in to delete comments');
    }

    try {
      await communityService.deleteComment(commentId);
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      throw err;
    }
  };

  useEffect(() => {
    if (postId) {
      void loadComments();
    }
  }, [postId, loadComments]);

  return {
    comments,
    userProfiles,
    loading,
    error,
    createComment,
    deleteComment,
    reload: loadComments
  };
};
