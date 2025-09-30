import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const VersionInfo: React.FC = () => {
  const appVersion = process.env.REACT_APP_VERSION || 'Unknown';
  const buildDate = process.env.REACT_APP_BUILD_DATE || 'Unknown';

  return (
    <Paper elevation={1} sx={{ p: 2, m: 2, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h6" gutterBottom>
        App Version Information
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2">
          <strong>Package Version:</strong> {appVersion}
        </Typography>
        <Typography variant="body2">
          <strong>Build Date:</strong> {buildDate ? new Date(buildDate).toLocaleString() : 'Unknown'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This information is automatically sent to Firebase Analytics with all events.
        </Typography>
      </Box>
    </Paper>
  );
};

export default VersionInfo;