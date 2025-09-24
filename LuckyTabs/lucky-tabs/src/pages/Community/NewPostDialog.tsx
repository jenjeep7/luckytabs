import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Image as ImageIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { communityService } from '../../services/communityService';
import { uploadPostImage } from '../../services/storageService';
import { GroupData } from '../../services/groupService';

interface NewPostDialogProps {
  open: boolean;
  onClose: () => void;
  activeTab: number; // 0=Public, 1=Group
  userGroups: GroupData[];
  selectedGroupId: string;
  userId: string;
  onPostCreated: () => void;
  onShowSnackbar: (message: string, severity: 'success' | 'error') => void;
}

export const NewPostDialog: React.FC<NewPostDialogProps> = ({
  open,
  onClose,
  activeTab,
  userGroups,
  selectedGroupId,
  userId,
  onPostCreated,
  onShowSnackbar,
}) => {
  const [newPostContent, setNewPostContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);

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
    if (!newPostContent.trim() && files.length === 0) return;
    
    // Validate group selection for group posts
    if (activeTab === 1 && !selectedGroupId) {
      onShowSnackbar('Please select a group to post to', 'error');
      return;
    }

    setUploading(true);
    try {
      const feedType = activeTab === 0 ? 'public' : 'group';
      const groupId = activeTab === 1 ? selectedGroupId : undefined;

      // Upload images in parallel and collect media descriptors
      let media: { url: string; width?: number; height?: number; contentType?: string }[] = [];
      if (files.length > 0) {
        media = await Promise.all(
          files.map((f, idx) =>
            uploadPostImage(userId, /* postId path key */ crypto.randomUUID(), f, (pct) => {
              setUploadProgress((prev) => {
                const next = [...prev];
                next[idx] = pct;
                return next;
              });
            })
          )
        );
      }
      await communityService.createPost(userId, newPostContent, feedType, groupId, media);

      clearComposer();
      onClose();
      onPostCreated();
      onShowSnackbar('Post created successfully!', 'success');
    } catch (e) {
      console.error(e);
      onShowSnackbar('Failed to create post', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    clearComposer();
    onClose();
  };

  const selectedGroup = userGroups.find(g => g.id === selectedGroupId);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          : `Post to ${selectedGroup?.name || 'Group'}`
        }
        <IconButton size="small" onClick={handleClose}>
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
              : `Share something with ${selectedGroup?.name || 'your group'}...`
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
          onClick={handleClose}
          sx={{ color: 'text.secondary' }}
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button 
          onClick={() => void handleCreatePost()} 
          variant="contained" 
          disabled={uploading || (!newPostContent.trim() && files.length === 0)}
        >
          {uploading ? 'Posting…' : 'Post'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};