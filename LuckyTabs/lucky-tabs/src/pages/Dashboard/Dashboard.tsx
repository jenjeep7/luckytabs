// src/pages/Dashboard/Dashboard.tsx
import { Typography, Box } from '@mui/material';
import { auth } from '../../firebase';

export default function Dashboard() {
  const user = auth.currentUser;

  return (
    <Box p={4}>
      <Typography variant="h4">Welcome, {user?.email}!</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        You’re now logged in. Use the top bar to log out or switch theme.
      </Typography>
    </Box>
  );
}
