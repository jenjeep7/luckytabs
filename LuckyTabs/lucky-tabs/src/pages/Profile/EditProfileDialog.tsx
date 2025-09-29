import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, TextField, Avatar, Box } from '@mui/material';
import { PhotoCamera, Save, Cancel } from '@mui/icons-material';

export interface ProfileForm {
  displayName: string;
  avatar: string;
}

export interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  editForm: ProfileForm;
  setEditForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
  handleAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ 
  open, 
  onClose, 
  onSave, 
  saving, 
  editForm, 
  setEditForm, 
  handleAvatarUpload 
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Edit Profile</DialogTitle>
    <DialogContent>
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar src={editForm.avatar} sx={{ width: 100, height: 100, mb: 2 }}>
            {(editForm.displayName?.[0] || '?').toUpperCase()}
            {(editForm.displayName?.[1] || '').toUpperCase()}
          </Avatar>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="avatar-upload"
            type="file"
            onChange={handleAvatarUpload}
          />
          <label htmlFor="avatar-upload">
            <Button variant="outlined" component="span" startIcon={<PhotoCamera />} size="small">
              Change Avatar
            </Button>
          </label>
        </Box>
        <TextField
          fullWidth
          label="Display Name"
          value={editForm.displayName}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 12) {
              setEditForm((prev) => ({ ...prev, displayName: value }));
            }
          }}
          required
          error={!editForm.displayName.trim()}
          helperText={
            !editForm.displayName.trim() 
              ? 'Display name is required' 
              : `${editForm.displayName.length}/12 characters`
          }
          slotProps={{ htmlInput: { maxLength: 12 } }}
        />
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} startIcon={<Cancel />}>Cancel</Button>
      <Button
        onClick={onSave}
        variant="contained"
        disabled={saving || !editForm.displayName.trim()}
        startIcon={saving ? <CircularProgress size={16} /> : <Save />}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default EditProfileDialog;